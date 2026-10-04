import express from 'express'
import { router as authRoutes } from './routes/auth.routes.js'
import { router as userRoutes } from './routes/user.routes.js'
import { router as eventRoutes } from './routes/event.routes.js'
import { router as bookingRoutes } from './routes/booking.routes.js'

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookings', bookingRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route topilmadi'
  })
})

app.use((error, req, res, next) => {
  console.error(error)

  res.status(500).json({
    success: false,
    message: 'Server xatosi'
  })
})

export default app
