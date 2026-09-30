const { readData, writeData } = require("../utils/fileDb");
const { generateTicketCode } = require("../utils/generateCode");
const { sendMailSafe } = require("../utils/mailer");
const {
  bookingTicketEmail,
  bookingUpdatedEmail,
  bookingCancelledEmail
} = require("../utils/emailTemplates");
const {
  createBookingSchema,
  bookingIdSchema,
  userIdSchema,
  updateBookingSchema,
  listBookingsSchema
} = require("../validations/booking.validation");

const options = { abortEarly: false, stripUnknown: true };

function validationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Validatsiya xatosi",
    errors: error.details.map((d) => ({ field: d.path.join(".") || "body", message: d.message }))
  });
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

async function createBooking(req, res) {
  try {
    const { error, value } = createBookingSchema.validate(req.body, options);
    if (error) return validationError(res, error);

    const users = await readData("users");
    const user = users.find((item) => item.id === value.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }
    if (!user.is_verified) {
      return res.status(403).json({ success: false, message: "Avval emailingizni tasdiqlang" });
    }

    const events = await readData("events");
    const event = events.find((item) => item.id === value.event_id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
    }
    if (new Date(event.starts_at).getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: "Tadbir allaqachon boshlangan" });
    }

    const bookings = await readData("bookings");
    const duplicate = bookings.some(
      (booking) =>
        booking.user_id === user.id &&
        booking.event_id === event.id &&
        booking.status === "confirmed"
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Siz bu tadbirga allaqachon yozilgansiz"
      });
    }

    if (event.available_seats < value.seats) {
      return res.status(400).json({
        success: false,
        message: `Faqat ${event.available_seats} ta joy qoldi`
      });
    }

    const booking = {
      id: nextId(bookings),
      user_id: user.id,
      event_id: event.id,
      seats: value.seats,
      total_price: value.seats * event.price,
      ticket_code: generateTicketCode(bookings.map((item) => item.ticket_code)),
      status: "confirmed",
      created_at: new Date().toISOString()
    };

    event.available_seats -= value.seats;
    bookings.push(booking);

    await writeData("events", events);
    await writeData("bookings", bookings);

    await sendMailSafe({
      to: user.email,
      subject: `EventHub — chipta ${booking.ticket_code}`,
      html: bookingTicketEmail(user, event, booking)
    });

    return res.status(201).json({
      success: true,
      message: "Bron yaratildi",
      data: booking
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function listBookings(req, res) {
  try {
    const { error, value } = listBookingsSchema.validate(req.query, options);
    if (error) return validationError(res, error);

    let bookings = await readData("bookings");
    if (value.status) bookings = bookings.filter((booking) => booking.status === value.status);
    if (value.event_id) bookings = bookings.filter((booking) => booking.event_id === value.event_id);

    const total = bookings.length;
    const totalPages = Math.ceil(total / value.limit);
    const start = (value.page - 1) * value.limit;
    const data = bookings.slice(start, start + value.limit);

    return res.status(200).json({
      success: true,
      data,
      meta: { page: value.page, limit: value.limit, total, totalPages }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function getUserBookings(req, res) {
  try {
    const { error, value } = userIdSchema.validate(req.params, options);
    if (error) return validationError(res, error);

    const users = await readData("users");
    const user = users.find((item) => item.id === value.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const bookings = await readData("bookings");
    const events = await readData("events");
    const data = bookings
      .filter((booking) => booking.user_id === user.id)
      .map((booking) => {
        const event = events.find((item) => item.id === booking.event_id);
        return {
          ...booking,
          event: event
            ? { title: event.title, starts_at: event.starts_at, venue: event.venue }
            : null
        };
      });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function getBooking(req, res) {
  try {
    const { error, value } = bookingIdSchema.validate(req.params, options);
    if (error) return validationError(res, error);

    const bookings = await readData("bookings");
    const booking = bookings.find((item) => item.id === value.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Bron topilmadi" });
    }

    const users = await readData("users");
    const events = await readData("events");
    const user = users.find((item) => item.id === booking.user_id);
    const event = events.find((item) => item.id === booking.event_id);

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        user: user ? { full_name: user.full_name, email: user.email } : null,
        event: event
          ? {
              title: event.title,
              starts_at: event.starts_at,
              venue: event.venue,
              city: event.city
            }
          : null
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function updateBooking(req, res) {
  try {
    const paramResult = bookingIdSchema.validate(req.params, options);
    if (paramResult.error) return validationError(res, paramResult.error);

    const bodyResult = updateBookingSchema.validate(req.body, options);
    if (bodyResult.error) return validationError(res, bodyResult.error);

    const bookings = await readData("bookings");
    const booking = bookings.find((item) => item.id === paramResult.value.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Bron topilmadi" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Bekor qilingan bronni o'zgartirib bo'lmaydi" });
    }

    const events = await readData("events");
    const event = events.find((item) => item.id === booking.event_id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
    }

    const difference = bodyResult.value.seats - booking.seats;
    if (difference > 0 && event.available_seats < difference) {
      return res.status(400).json({
        success: false,
        message: `Faqat ${event.available_seats} ta qo'shimcha joy qoldi`
      });
    }

    event.available_seats -= difference;
    booking.seats = bodyResult.value.seats;
    booking.total_price = booking.seats * event.price;

    await writeData("events", events);
    await writeData("bookings", bookings);

    const users = await readData("users");
    const user = users.find((item) => item.id === booking.user_id);
    if (user) {
      await sendMailSafe({
        to: user.email,
        subject: "EventHub — broningiz o'zgartirildi",
        html: bookingUpdatedEmail(user, event, booking)
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bron yangilandi",
      data: booking
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function cancelBooking(req, res) {
  try {
    const { error, value } = bookingIdSchema.validate(req.params, options);
    if (error) return validationError(res, error);

    const bookings = await readData("bookings");
    const booking = bookings.find((item) => item.id === value.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Bron topilmadi" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Bron allaqachon bekor qilingan" });
    }

    const events = await readData("events");
    const event = events.find((item) => item.id === booking.event_id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Tadbir topilmadi" });
    }

    const hoursUntilEvent = (new Date(event.starts_at).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: "Tadbirga 24 soatdan kam qolgani uchun bekor qilib bo'lmaydi"
      });
    }

    booking.status = "cancelled";
    event.available_seats = Math.min(event.capacity, event.available_seats + booking.seats);

    await writeData("bookings", bookings);
    await writeData("events", events);

    const users = await readData("users");
    const user = users.find((item) => item.id === booking.user_id);
    if (user) {
      await sendMailSafe({
        to: user.email,
        subject: "EventHub — broningiz bekor qilindi",
        html: bookingCancelledEmail(user, event)
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bron bekor qilindi",
      data: booking
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

async function deleteBooking(req, res) {
  try {
    const { error, value } = bookingIdSchema.validate(req.params, options);
    if (error) return validationError(res, error);

    const bookings = await readData("bookings");
    const index = bookings.findIndex((item) => item.id === value.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Bron topilmadi" });
    }

    const booking = bookings[index];
    if (booking.status === "confirmed") {
      const events = await readData("events");
      const event = events.find((item) => item.id === booking.event_id);
      if (event) {
        event.available_seats = Math.min(event.capacity, event.available_seats + booking.seats);
        await writeData("events", events);
      }
    }

    bookings.splice(index, 1);
    await writeData("bookings", bookings);

    return res.status(200).json({ success: true, message: "Bron o'chirildi" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server xatosi" });
  }
}

module.exports = {
  createBooking,
  listBookings,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking
};
