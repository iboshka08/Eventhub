import { Router } from 'express'

import {
    createBooking,
    listBookings,
    getBooking,
    updateBooking,
    cancelBooking,
    deleteBooking
} from '../controllers/booking.controller.js'

const router = Router()

router
    .post('/', createBooking)
    .get('/', listBookings)
    .get('/:id', getBooking)
    .put('/:id/cancel', cancelBooking)
    .put('/:id', updateBooking)
    .delete('/:id', deleteBooking)

export {
    router
}
