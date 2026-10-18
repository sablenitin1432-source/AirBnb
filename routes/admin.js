const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isAdmin } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

// All admin routes are protected by isAdmin middleware

// Dashboard
router.get("/", isAdmin, wrapAsync(adminController.dashboard));

// Users Management
router.get("/users", isAdmin, wrapAsync(adminController.allUsers));
router.put("/users/:id/role", isAdmin, wrapAsync(adminController.updateUserRole));
router.delete("/users/:id", isAdmin, wrapAsync(adminController.deleteUser));

// Listings Management
router.get("/listings", isAdmin, wrapAsync(adminController.allListings));
router.delete("/listings/:id", isAdmin, wrapAsync(adminController.deleteListing));

// Vehicles Management
router.get("/vehicles", isAdmin, wrapAsync(adminController.allVehicles));
router.delete("/vehicles/:id", isAdmin, wrapAsync(adminController.deleteVehicle));

// Dhabas Management
router.get("/dhabas", isAdmin, wrapAsync(adminController.allDhabas));
router.delete("/dhabas/:id", isAdmin, wrapAsync(adminController.deleteDhaba));

// Bookings Management
router.get("/bookings", isAdmin, wrapAsync(adminController.allBookings));
router.put("/bookings/:id/status", isAdmin, wrapAsync(adminController.updateBookingStatus));
router.delete("/bookings/:id", isAdmin, wrapAsync(adminController.deleteBooking));

module.exports = router;
