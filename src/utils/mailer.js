const nodemailer = require("nodemailer");

function getTransporter() {
  const mode = (process.env.MAIL_MODE || "json").toLowerCase();

  if (mode !== "smtp") {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const port = Number(process.env.MAIL_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: port === 465,
    auth: process.env.MAIL_USER && process.env.MAIL_PASS
      ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
      : undefined
  });
}

async function sendMail({ to, subject, html }) {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "EventHub <no-reply@eventhub.uz>",
    to,
    subject,
    html
  });

  if ((process.env.MAIL_MODE || "json").toLowerCase() !== "smtp") {
    console.log(`✉ Email (test): ${subject} -> ${to}`);
  }

  return info;
}

async function sendMailSafe(options) {
  try {
    return await sendMail(options);
  } catch (error) {
    console.error("Email yuborishda xato:", error.message);
    return null;
  }
}

module.exports = { sendMail, sendMailSafe };
