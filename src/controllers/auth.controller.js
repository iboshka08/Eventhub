import bcrypt from 'bcrypt'
import { readData, writeData } from '../utils/fileDb.js'
import { generateOtp } from '../utils/generateCode.js'
import { sendMailSafe } from '../utils/mailer.js'

import {
  verificationEmail,
  resetPasswordEmail,
  welcomeEmail
} from '../utils/emailTemplates.js'

import {
  registerSchema,
  verifyEmailSchema,
  emailOnlySchema,
  loginSchema,
  resetPasswordSchema
} from '../validations/auth.validation.js'


const options = {
  abortEarly: false,
  stripUnknown: true
}

const validationError = (res, error) => {
  return res.status(400).json({
    success: false,
    message: 'Validatsiya xatosi',
    errors: error.details.map((d) => ({
      field: d.path.join('.') || 'body',
      message: d.message
    }))
  })
}

const publicUser = ({ password, ...user }) => user


const nextId = (items) => {
  return items.length
    ? Math.max(...items.map((item) => item.id)) + 1
    : 1
}

const latestCode = (codes, userId, purpose) => {
  return codes
    .filter(
      (code) =>
        code.user_id === userId &&
        code.purpose === purpose &&
        !code.used
    )
    .sort((a, b) => b.id - a.id)[0]
}

const createCode = async (codes, userId, purpose) => {
  const plainCode = generateOtp()
  const hashedCode = await bcrypt.hash(plainCode, 10)
  const now = Date.now()

  const newCode = {
    id: nextId(codes),
    user_id: userId,
    code: hashedCode,
    purpose,
    attempts: 0,
    expires_at: new Date(
      now + 10 * 60 * 1000
    ).toISOString(),
    used: false,
    created_at: new Date(now).toISOString()
  }

  codes.push(newCode)

  return {
    record: newCode,
    plainCode
  }
}


class AuthController {

  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(
        req.body,
        options
      )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      if (
        users.some(
          (user) =>
            user.email.toLowerCase() === value.email
        )
      ) {
        return res.status(409).json({
          success: false,
          message: "Bu email allaqachon ro'yxatdan o'tgan"
        })
      }

      const newUser = {
        id: nextId(users),
        full_name: value.full_name,
        email: value.email,
        password: await bcrypt.hash(
          value.password,
          10
        ),
        is_verified: false,
        created_at: new Date().toISOString()
      }

      users.push(newUser)

      await writeData('users', users)

      const codes = await readData('codes')

      const { plainCode } = await createCode(
        codes,
        newUser.id,
        'verify_email'
      )

      await writeData('codes', codes)

      await sendMailSafe({
        to: newUser.email,
        subject: 'EventHub — emailni tasdiqlash kodi',
        html: verificationEmail(
          newUser.full_name,
          plainCode
        )
      })

      return res.status(201).json({
        success: true,
        message:
          "Ro'yxatdan o'tildi. Tasdiqlash kodi emailingizga yuborildi",
        data: publicUser(newUser)
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }


  async verifyEmail(req, res) {
    try {
      const { error, value } = verifyEmailSchema.validate(
        req.body,
        options
      )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      const index = users.findIndex(
        (user) =>
          user.email.toLowerCase() === value.email
      )

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Foydalanuvchi topilmadi'
        })
      }

      const user = users[index]

      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email allaqachon tasdiqlangan'
        })
      }

      const codes = await readData('codes')

      const codeRecord = latestCode(
        codes,
        user.id,
        'verify_email'
      )

      if (!codeRecord) {
        return res.status(400).json({
          success: false,
          message:
            'Faol tasdiqlash kodi topilmadi'
        })
      }

      if (codeRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message:
            "Urinishlar limiti tugagan. Yangi kod so'rang"
        })
      }

      if (
        new Date(codeRecord.expires_at).getTime() <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kod muddati tugagan'
        })
      }

      const matched = await bcrypt.compare(
        value.code,
        codeRecord.code
      )

      if (!matched) {
        codeRecord.attempts += 1

        await writeData('codes', codes)

        return res.status(400).json({
          success: false,
          message:
            codeRecord.attempts >= 5
              ? "Kod noto'g'ri. Urinishlar limiti tugadi"
              : "Kod noto'g'ri"
        })
      }

      user.is_verified = true
      codeRecord.used = true

      await writeData('users', users)
      await writeData('codes', codes)

      await sendMailSafe({
        to: user.email,
        subject: 'EventHub — xush kelibsiz',
        html: welcomeEmail(user.full_name)
      })

      return res.status(200).json({
        success: true,
        message:
          'Email muvaffaqiyatli tasdiqlandi',
        data: publicUser(user)
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }


  async resendCode(req, res) {
    try {
      const { error, value } =
        emailOnlySchema.validate(
          req.body,
          options
        )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      const user = users.find(
        (item) =>
          item.email.toLowerCase() === value.email
      )

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Foydalanuvchi topilmadi'
        })
      }

      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message:
            'Email allaqachon tasdiqlangan'
        })
      }

      const codes = await readData('codes')

      const previous = latestCode(
        codes,
        user.id,
        'verify_email'
      )

      if (
        previous &&
        Date.now() -
        new Date(previous.created_at).getTime() <
        60 * 1000
      ) {
        return res.status(429).json({
          success: false,
          message:
            "Iltimos, 60 soniyadan keyin urinib ko'ring"
        })
      }

      for (const code of codes) {
        if (
          code.user_id === user.id &&
          code.purpose === 'verify_email' &&
          !code.used
        ) {
          code.used = true
        }
      }

      const { plainCode } = await createCode(
        codes,
        user.id,
        'verify_email'
      )

      await writeData('codes', codes)

      await sendMailSafe({
        to: user.email,
        subject:
          'EventHub — yangi tasdiqlash kodi',
        html: verificationEmail(
          user.full_name,
          plainCode
        )
      })

      return res.status(200).json({
        success: true,
        message:
          'Yangi tasdiqlash kodi yuborildi'
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }


  async login(req, res) {
    try {
      const { error, value } =
        loginSchema.validate(
          req.body,
          options
        )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      const user = users.find(
        (item) =>
          item.email.toLowerCase() === value.email
      )

      const passwordMatches = user
        ? await bcrypt.compare(
          value.password,
          user.password
        )
        : false

      if (!user || !passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Email yoki parol noto'g'ri"
        })
      }

      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          message:
            'Avval emailingizni tasdiqlang'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Login muvaffaqiyatli',
        data: publicUser(user)
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }


  async forgotPassword(req, res) {
    const genericMessage =
      "Agar bu email ro'yxatdan o'tgan bo'lsa, unga kod yuborildi"

    try {
      const { error, value } =
        emailOnlySchema.validate(
          req.body,
          options
        )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      const user = users.find(
        (item) =>
          item.email.toLowerCase() === value.email
      )

      if (user) {
        const codes = await readData('codes')

        for (const code of codes) {
          if (
            code.user_id === user.id &&
            code.purpose === 'reset_password' &&
            !code.used
          ) {
            code.used = true
          }
        }

        const { plainCode } = await createCode(
          codes,
          user.id,
          'reset_password'
        )

        await writeData('codes', codes)

        await sendMailSafe({
          to: user.email,
          subject:
            'EventHub — parolni tiklash kodi',
          html: resetPasswordEmail(
            user.full_name,
            plainCode
          )
        })
      }

      return res.status(200).json({
        success: true,
        message: genericMessage
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }


  async resetPassword(req, res) {
    try {
      const { error, value } =
        resetPasswordSchema.validate(
          req.body,
          options
        )

      if (error) {
        return validationError(res, error)
      }

      const users = await readData('users')

      const index = users.findIndex(
        (user) =>
          user.email.toLowerCase() === value.email
      )

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message:
            'Foydalanuvchi topilmadi'
        })
      }

      const user = users[index]

      const codes = await readData('codes')

      const codeRecord = latestCode(
        codes,
        user.id,
        'reset_password'
      )

      if (!codeRecord) {
        return res.status(400).json({
          success: false,
          message:
            'Faol tiklash kodi topilmadi'
        })
      }

      if (codeRecord.attempts >= 5) {
        return res.status(400).json({
          success: false,
          message:
            "Urinishlar limiti tugagan. Yangi kod so'rang"
        })
      }

      if (
        new Date(codeRecord.expires_at).getTime() <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Kod muddati tugagan'
        })
      }

      const matched = await bcrypt.compare(
        value.code,
        codeRecord.code
      )

      if (!matched) {
        codeRecord.attempts += 1

        await writeData('codes', codes)

        return res.status(400).json({
          success: false,
          message:
            codeRecord.attempts >= 5
              ? "Kod noto'g'ri. Urinishlar limiti tugadi"
              : "Kod noto'g'ri"
        })
      }

      user.password = await bcrypt.hash(
        value.new_password,
        10
      )

      codeRecord.used = true

      await writeData('users', users)
      await writeData('codes', codes)

      return res.status(200).json({
        success: true,
        message:
          'Parol muvaffaqiyatli tiklandi'
      })

    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Server xatosi'
      })
    }
  }
}


export default new AuthController()
