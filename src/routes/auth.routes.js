const express = require("express");
const {
  register,
  verifyEmail,
  resendCode,
  login,
  forgotPassword,
  resetPassword
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
