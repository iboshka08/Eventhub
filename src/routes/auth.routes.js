import { Router } from 'express'
import authController from '../controllers/auth.controller.js'

const router = Router()

router
    .post(
        '/register',
        authController.register.bind(authController)
    )
    .post(
        '/verify-email',
        authController.verifyEmail.bind(authController)
    )
    .post(
        '/resend-code',
        authController.resendCode.bind(authController)
    )
    .post(
        '/login',
        authController.login.bind(authController)
    )
    .post(
        '/forgot-password',
        authController.forgotPassword.bind(authController)
    )
    .post(
        '/reset-password',
        authController.resetPassword.bind(authController)
    )


export {
    router
}