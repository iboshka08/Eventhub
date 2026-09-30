const bcrypt = require("bcrypt");
const { readData, writeData } = require("../utils/fileDb");
const { sendMailSafe } = require("../utils/mailer");
const { passwordChangedEmail } = require("../utils/emailTemplates");
const {
  idParamSchema,
  updateUserSchema,
  changePasswordSchema,
  deleteUserSchema
} = require("../validations/auth.validation");

const options = { abortEarly: false, stripUnknown: true };

function validationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Validatsiya xatosi",
    errors: error.details.map((d) => ({ field: d.path.join(".") || "body", message: d.message }))
  });
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function getUser(req, res) {
  try {
    const { error, value } = idParamSchema.validate(req.params, options);
    if (error) return validationError(res, error);

    const users = await readData("users");
    const user = users.find((item) => item.id === value.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const bookings = await readData("bookings");
    const activeBookings = bookings.filter(
      (booking) => booking.user_id === user.id && booking.status === "confirmed"
    ).length;

    return res.status(200).json({
      success: true,
      data: { ...publicUser(user), activeBookings }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function updateUser(req, res) {
  try {
    const paramResult = idParamSchema.validate(req.params, options);
    if (paramResult.error) return validationError(res, paramResult.error);

    const bodyResult = updateUserSchema.validate(req.body, options);
    if (bodyResult.error) return validationError(res, bodyResult.error);

    const users = await readData("users");
    const index = users.findIndex((item) => item.id === paramResult.value.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    users[index] = { ...users[index], ...bodyResult.value };
    await writeData("users", users);

    return res.status(200).json({
      success: true,
      message: "Profil yangilandi",
      data: publicUser(users[index])
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function changePassword(req, res) {
  try {
    const paramResult = idParamSchema.validate(req.params, options);
    if (paramResult.error) return validationError(res, paramResult.error);

    const bodyResult = changePasswordSchema.validate(req.body, options);
    if (bodyResult.error) return validationError(res, bodyResult.error);

    const users = await readData("users");
    const index = users.findIndex((item) => item.id === paramResult.value.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const user = users[index];
    const oldMatches = await bcrypt.compare(bodyResult.value.old_password, user.password);
    if (!oldMatches) {
      return res.status(400).json({ success: false, message: "Eski parol noto'g'ri" });
    }

    const samePassword = await bcrypt.compare(bodyResult.value.new_password, user.password);
    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "Yangi parol eski parol bilan bir xil bo'lmasligi kerak"
      });
    }

    user.password = await bcrypt.hash(bodyResult.value.new_password, 10);
    await writeData("users", users);

    await sendMailSafe({
      to: user.email,
      subject: "EventHub — parolingiz o'zgartirildi",
      html: passwordChangedEmail(user.full_name)
    });

    return res.status(200).json({
      success: true,
      message: "Parol o'zgartirildi"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function deleteUser(req, res) {
  try {
    const paramResult = idParamSchema.validate(req.params, options);
    if (paramResult.error) return validationError(res, paramResult.error);

    const bodyResult = deleteUserSchema.validate(req.body, options);
    if (bodyResult.error) return validationError(res, bodyResult.error);

    const users = await readData("users");
    const index = users.findIndex((item) => item.id === paramResult.value.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const user = users[index];
    const matches = await bcrypt.compare(bodyResult.value.password, user.password);
    if (!matches) {
      return res.status(400).json({ success: false, message: "Parol noto'g'ri" });
    }

    const bookings = await readData("bookings");
    const events = await readData("events");
    let cancelledBookings = 0;

    for (const booking of bookings) {
      if (booking.user_id !== user.id || booking.status !== "confirmed") continue;
      booking.status = "cancelled";
      cancelledBookings += 1;

      const event = events.find((item) => item.id === booking.event_id);
      if (event) {
        event.available_seats = Math.min(event.capacity, event.available_seats + booking.seats);
      }
    }

    users.splice(index, 1);
    const codes = (await readData("codes")).filter((code) => code.user_id !== user.id);

    await writeData("users", users);
    await writeData("bookings", bookings);
    await writeData("events", events);
    await writeData("codes", codes);

    return res.status(200).json({
      success: true,
      message: "Akkaunt o'chirildi",
      data: { cancelledBookings }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

module.exports = { getUser, updateUser, changePassword, deleteUser };
