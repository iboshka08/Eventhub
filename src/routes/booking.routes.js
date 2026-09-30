const express = require("express");
const {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking
} = require("../controllers/booking.controller");

const router = express.Router();

router.post("/", createBooking);
router.get("/", listBookings);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
