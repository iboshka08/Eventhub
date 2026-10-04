import { readData, writeData } from "../utils/fileDb.js";
import { sendMail } from "../utils/mailer.js";
import { eventCancelledEmail } from "../utils/emailTemplates.js";

import {
    createEventSchema,
    updateEventSchema,
    eventIdSchema,
    listEventsSchema
} from "../validations/event.validation.js";


const options = {
    abortEarly: false,
    stripUnknown: true
};

function validationError(res, error) {
    return res.status(400).json({
        success: false,
        message: "Validatsiya xatosi",
        errors: error.details.map((d) => ({
            field: d.path.join(".") || "query",
            message: d.message
        }))
    });
}

function nextId(items) {
    return items.length
        ? Math.max(...items.map((item) => item.id)) + 1
        : 1;
}

function bookedSeatsForEvent(bookings, eventId) {
    return bookings
        .filter(
            (booking) =>
                booking.event_id === eventId &&
                booking.status === "confirmed"
        )
        .reduce(
            (sum, booking) => sum + booking.seats,
            0
        );
}

async function createEvent(req, res) {
    try {
        const { error, value } =
            createEventSchema.validate(
                req.body,
                options
            );

        if (error) {
            return validationError(res, error);
        }

        const events = await readData("events");

        const event = {
            id: nextId(events),
            title: value.title,
            description: value.description || "",
            category: value.category,
            city: value.city,
            venue: value.venue,
            starts_at: new Date(value.starts_at).toISOString(),
            price: value.price,
            capacity: value.capacity,
            available_seats: value.capacity,
            created_at: new Date().toISOString()
        };

        events.push(event);

        await writeData("events", events);

        return res.status(201).json({
            success: true,
            message: "Tadbir yaratildi",
            data: event
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}

async function listEvents(req, res) {
    try {
        const { error, value } =
            listEventsSchema.validate(
                req.query,
                options
            );

        if (error) {
            return validationError(res, error);
        }

        let events = await readData("events");

        if (!value.all) {
            const now = Date.now();

            events = events.filter(
                (event) =>
                    new Date(event.starts_at).getTime() > now
            );
        }

        if (value.search) {
            const query = value.search.toLowerCase();

            events = events.filter(
                (event) =>
                    event.title
                        .toLowerCase()
                        .includes(query) ||
                    String(event.description || "")
                        .toLowerCase()
                        .includes(query)
            );
        }

        if (value.category) {
            events = events.filter(
                (event) =>
                    event.category === value.category
            );
        }

        if (value.city) {
            const city = value.city.toLowerCase();

            events = events.filter(
                (event) =>
                    event.city.toLowerCase() === city
            );
        }

        if (value.free === true) {
            events = events.filter(
                (event) => event.price === 0
            );
        }

        const sorters = {
            date_asc: (a, b) =>
                new Date(a.starts_at) -
                new Date(b.starts_at),

            date_desc: (a, b) =>
                new Date(b.starts_at) -
                new Date(a.starts_at),

            price_asc: (a, b) =>
                a.price - b.price,

            price_desc: (a, b) =>
                b.price - a.price
        };

        events.sort(sorters[value.sort]);

        const total = events.length;

        const totalPages =
            Math.ceil(total / value.limit);

        const start =
            (value.page - 1) * value.limit;

        const data = events.slice(
            start,
            start + value.limit
        );

        return res.status(200).json({
            success: true,
            data,
            meta: {
                page: value.page,
                limit: value.limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}

async function getEvent(req, res) {
    try {
        const { error, value } =
            eventIdSchema.validate(
                req.params,
                options
            );

        if (error) {
            return validationError(res, error);
        }

        const events = await readData("events");

        const event = events.find(
            (item) => item.id === value.id
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Tadbir topilmadi"
            });
        }

        const bookings = await readData("bookings");

        const bookedSeats =
            bookedSeatsForEvent(
                bookings,
                event.id
            );

        return res.status(200).json({
            success: true,
            data: {
                ...event,
                bookedSeats
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}

async function updateEvent(req, res) {
    try {
        const paramResult =
            eventIdSchema.validate(
                req.params,
                options
            );

        if (paramResult.error) {
            return validationError(
                res,
                paramResult.error
            );
        }

        const bodyResult =
            updateEventSchema.validate(
                req.body,
                options
            );

        if (bodyResult.error) {
            return validationError(
                res,
                bodyResult.error
            );
        }

        const events = await readData("events");

        const index = events.findIndex(
            (item) =>
                item.id === paramResult.value.id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Tadbir topilmadi"
            });
        }

        const bookings =
            await readData("bookings");

        const bookedSeats =
            bookedSeatsForEvent(
                bookings,
                events[index].id
            );

        if (
            bodyResult.value.capacity !== undefined &&
            bodyResult.value.capacity < bookedSeats
        ) {
            return res.status(400).json({
                success: false,
                message: `Allaqachon ${bookedSeats} ta joy band qilingan`
            });
        }

        const update = {
            ...bodyResult.value
        };

        if (update.starts_at) {
            update.starts_at =
                new Date(
                    update.starts_at
                ).toISOString();
        }

        events[index] = {
            ...events[index],
            ...update
        };

        if (update.capacity !== undefined) {
            events[index].available_seats =
                update.capacity - bookedSeats;
        }

        await writeData(
            "events",
            events
        );

        return res.status(200).json({
            success: true,
            message: "Tadbir yangilandi",
            data: events[index]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}

async function deleteEvent(req, res) {
    try {
        const { error, value } =
            eventIdSchema.validate(
                req.params,
                options
            );

        if (error) {
            return validationError(
                res,
                error
            );
        }

        const events =
            await readData("events");

        const index =
            events.findIndex(
                (item) => item.id === value.id
            );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Tadbir topilmadi"
            });
        }

        const event = events[index];

        const bookings =
            await readData("bookings");

        const affected =
            bookings.filter(
                (booking) =>
                    booking.event_id === event.id &&
                    booking.status === "confirmed"
            );

        for (const booking of affected) {
            booking.status = "cancelled";
        }

        events.splice(index, 1);

        await writeData(
            "events",
            events
        );

        await writeData(
            "bookings",
            bookings
        );

        const users =
            await readData("users");

        const jobs = affected
            .map((booking) => {
                const user = users.find(
                    (item) =>
                        item.id === booking.user_id
                );

                if (!user) {
                    return null;
                }

                return sendMail({
                    to: user.email,
                    subject:
                        `EventHub — ${event.title} bekor qilindi`,
                    html:
                        eventCancelledEmail(
                            user,
                            event
                        )
                });
            })
            .filter(Boolean);

        const settled =
            await Promise.allSettled(jobs);

        for (const result of settled) {
            if (
                result.status === "rejected"
            ) {
                console.error(
                    "Email yuborishda xato:",
                    result.reason?.message ||
                    result.reason
                );
            }
        }

        const notifiedUsers =
            settled.filter(
                (result) =>
                    result.status === "fulfilled"
            ).length;

        return res.status(200).json({
            success: true,
            message: "Tadbir o'chirildi",
            data: {
                notifiedUsers
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}

async function getEventBookings(req, res) {
    try {
        const { error, value } =
            eventIdSchema.validate(
                req.params,
                options
            );

        if (error) {
            return validationError(
                res,
                error
            );
        }

        const events =
            await readData("events");

        const event = events.find(
            (item) => item.id === value.id
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Tadbir topilmadi"
            });
        }

        const bookings =
            await readData("bookings");

        const users =
            await readData("users");

        const active =
            bookings.filter(
                (booking) =>
                    booking.event_id === event.id &&
                    booking.status === "confirmed"
            );

        const data = active.map(
            (booking) => {
                const user = users.find(
                    (item) =>
                        item.id === booking.user_id
                );

                return {
                    full_name:
                        user?.full_name ||
                        "O'chirilgan foydalanuvchi",

                    email:
                        user?.email || null,

                    seats: booking.seats,

                    ticket_code:
                        booking.ticket_code,

                    created_at:
                        booking.created_at
                };
            }
        );

        const totalSeats =
            active.reduce(
                (sum, booking) =>
                    sum + booking.seats,
                0
            );

        const estimatedRevenue =
            active.reduce(
                (sum, booking) =>
                    sum + booking.total_price,
                0
            );

        return res.status(200).json({
            success: true,
            data,
            meta: {
                totalBookings: active.length,
                totalSeats,
                estimatedRevenue
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server xatosi"
        });
    }
}


export {
    createEvent,
    listEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    getEventBookings
};
