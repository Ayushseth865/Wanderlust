const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware");
const reservationsController = require("../controllers/reservations");

// Get disabled date ranges for a listing
router.get("/availability", reservationsController.getAvailability);

// Create reservation for a listing
router.post("/", isLoggedIn, reservationsController.createReservation);

module.exports = router;
