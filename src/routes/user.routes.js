import { Router } from 'express'

import {
  getUser,
  updateUser,
  changePassword,
  deleteUser
} from '../controllers/user.controller.js'

import { getUserBookings } from '../controllers/booking.controller.js'


const router = Router()

router
  .get('/:id/bookings', getUserBookings)
  .get('/:id', getUser)
  .put('/:id/password', changePassword)
  .put('/:id', updateUser)
  .delete('/:id', deleteUser)

export {
  router
}
