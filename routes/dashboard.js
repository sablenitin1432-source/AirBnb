const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const dashboardController = require("../controllers/dashboard.js");

// All dashboard routes are protected by isLoggedIn middleware

// Main Dashboard
router.get("/", isLoggedIn, wrapAsync(dashboardController.dashboard));

// Profile
router.get("/profile", isLoggedIn, wrapAsync(dashboardController.profile));
router.put("/profile", isLoggedIn, wrapAsync(dashboardController.updateProfile));

// My Listings
router.get("/listings", isLoggedIn, wrapAsync(dashboardController.myListings));

// My Vehicles
router.get("/vehicles", isLoggedIn, wrapAsync(dashboardController.myVehicles));

// My Dhabas
router.get("/dhabas", isLoggedIn, wrapAsync(dashboardController.myDhabas));

// My Bookings
router.get("/bookings", isLoggedIn, wrapAsync(dashboardController.myBookings));
router.put("/bookings/:id/cancel", isLoggedIn, wrapAsync(dashboardController.cancelBooking));

module.exports = router;
