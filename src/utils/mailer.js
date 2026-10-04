import nodemailer from 'nodemailer'
import { config } from 'dotenv'

config()

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

async function sendMail({ to, subject, html }) {
    if (process.env.MAIL_MODE === 'json') {
        console.log(`Email to: ${to}`)
        console.log(`Subject: ${subject}`)
        console.log(html)

        return null
    }

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        html
    })
}

async function sendMailSafe(options) {
    try {
        return await sendMail(options)
    } catch (err) {
        console.log(`Error is on sendMail function err: ${err.message}`)
        return null
    }
}

export {
    sendMail,
    sendMailSafe
}