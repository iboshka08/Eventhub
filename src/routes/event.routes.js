const express = require("express");
const {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventBookings
} = require("../controllers/event.controller");

const router = express.Router();

router.post("/", createEvent);
router.get("/", listEvents);
router.get("/:id/bookings", getEventBookings);
router.get("/:id", getEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
