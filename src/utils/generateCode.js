import crypto from 'crypto'

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

function generateTicketCode(existingCodes = []) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const used = new Set(existingCodes)

  for (let attempt = 0; attempt < 100; attempt += 1) {
    let suffix = ''

    for (let i = 0; i < 6; i += 1) {
      suffix += chars[crypto.randomInt(0, chars.length)]
    }

    const code = `EVH-${suffix}`

    if (!used.has(code)) {
      return code
    }
  }

  throw new Error("Noyob chipta kodi yaratib bo'lmadi")
}

export {
  generateOtp,
  generateTicketCode
}
