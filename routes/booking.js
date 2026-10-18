const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Listing Booking
router.post("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.createListingBooking));

// Vehicle Booking
router.post("/vehicles/:id/book", isLoggedIn, wrapAsync(bookingController.createVehicleBooking));

// Dhaba Reservation
router.post("/dhabas/:id/book", isLoggedIn, wrapAsync(bookingController.createDhabaBooking));

// Payment Page
router.get("/bookings/payment", isLoggedIn, bookingController.showPaymentPage);

// Process Payment
router.post("/bookings/process-payment", isLoggedIn, wrapAsync(bookingController.processPayment));

// Payment OTP - Send & Verify
router.post("/bookings/send-otp", isLoggedIn, wrapAsync(bookingController.sendPaymentOtp));
router.post("/bookings/verify-otp", isLoggedIn, wrapAsync(bookingController.verifyPaymentOtp));

// Razorpay (Test Mode) - Create order + Verify payment
router.post("/bookings/create-order", isLoggedIn, wrapAsync(bookingController.createRazorpayOrder));
router.post("/bookings/verify-payment", isLoggedIn, wrapAsync(bookingController.verifyRazorpayPayment));

// View All Bookings
router.get("/bookings", isLoggedIn, wrapAsync(bookingController.getUserBookings));

// View Single Booking
router.get("/bookings/:id", isLoggedIn, wrapAsync(bookingController.showBooking));

// Cancel Booking
router.post("/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
