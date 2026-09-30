const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const shell = (title, content) => `
<!doctype html>
<html lang="uz">
  <body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;color:#111827">
    <div style="max-width:620px;margin:auto;background:#fff;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
      <h2 style="margin-top:0;color:#4f46e5">${escapeHtml(title)}</h2>
      ${content}
      <p style="margin-top:28px;color:#6b7280;font-size:13px">EventHub</p>
    </div>
  </body>
</html>`;

function verificationEmail(fullName, code) {
  return shell(
    "Emailni tasdiqlash",
    `<p>Salom, <b>${escapeHtml(fullName)}</b>!</p>
     <p>Tasdiqlash kodingiz:</p>
     <div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:20px 0">${escapeHtml(code)}</div>
     <p>Kod <b>10 daqiqa</b> amal qiladi.</p>`
  );
}

function resetPasswordEmail(fullName, code) {
  return shell(
    "Parolni tiklash",
    `<p>Salom, <b>${escapeHtml(fullName)}</b>!</p>
     <p>Parolni tiklash kodingiz:</p>
     <div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:20px 0">${escapeHtml(code)}</div>
     <p>Kod <b>10 daqiqa</b> amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring.</p>`
  );
}

function welcomeEmail(fullName) {
  return shell("Xush kelibsiz!", `<p>Salom, <b>${escapeHtml(fullName)}</b>!</p><p>Emailingiz muvaffaqiyatli tasdiqlandi.</p>`);
}

function passwordChangedEmail(fullName) {
  return shell(
    "Parolingiz o'zgartirildi",
    `<p>Salom, <b>${escapeHtml(fullName)}</b>!</p><p>EventHub akkauntingiz paroli o'zgartirildi. Agar bu siz bo'lmasangiz, darhol parolingizni tiklang.</p>`
  );
}

function bookingTicketEmail(user, event, booking) {
  const date = new Date(event.starts_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const rows = [
    ["Tadbir", event.title],
    ["Sana va vaqt", date],
    ["Manzil", `${event.city}, ${event.venue}`],
    ["Joylar soni", booking.seats],
    ["Umumiy narx", `${booking.total_price.toLocaleString("uz-UZ")} so'm`],
    ["Chipta kodi", booking.ticket_code]
  ]
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #e5e7eb"><b>${escapeHtml(k)}</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`)
    .join("");

  return shell(
    "Chiptangiz tayyor",
    `<p>Salom, <b>${escapeHtml(user.full_name)}</b>!</p>
     <p>Bron muvaffaqiyatli yaratildi.</p>
     <table style="border-collapse:collapse;width:100%">${rows}</table>`
  );
}

function bookingUpdatedEmail(user, event, booking) {
  return shell(
    "Broningiz o'zgartirildi",
    `<p>Salom, <b>${escapeHtml(user.full_name)}</b>!</p>
     <p><b>${escapeHtml(event.title)}</b> tadbiri uchun broningiz yangilandi.</p>
     <p>Joylar: <b>${booking.seats}</b><br>Yangi summa: <b>${booking.total_price.toLocaleString("uz-UZ")} so'm</b><br>Chipta: <b>${escapeHtml(booking.ticket_code)}</b></p>`
  );
}

function bookingCancelledEmail(user, event) {
  return shell(
    "Broningiz bekor qilindi",
    `<p>Salom, <b>${escapeHtml(user.full_name)}</b>!</p><p><b>${escapeHtml(event.title)}</b> tadbiri uchun broningiz bekor qilindi.</p>`
  );
}

function eventCancelledEmail(user, event) {
  return shell(
    "Tadbir bekor qilindi",
    `<p>Salom, <b>${escapeHtml(user.full_name)}</b>!</p><p>Afsuski, <b>${escapeHtml(event.title)}</b> tadbiri bekor qilindi. Sizning broningiz ham bekor qilindi.</p>`
  );
}

module.exports = {
  verificationEmail,
  resetPasswordEmail,
  welcomeEmail,
  passwordChangedEmail,
  bookingTicketEmail,
  bookingUpdatedEmail,
  bookingCancelledEmail,
  eventCancelledEmail
};
