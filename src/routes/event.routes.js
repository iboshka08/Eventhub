import { Router } from 'express'

import {
    createEvent,
    listEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    getEventBookings
} from '../controllers/event.controller.js'

const router = Router()

router
    .post('/', createEvent)
    .get('/', listEvents)
    .get('/:id/bookings', getEventBookings)
    .get('/:id', getEvent)
    .put('/:id', updateEvent)
    .delete('/:id', deleteEvent)

export {
    router
}
