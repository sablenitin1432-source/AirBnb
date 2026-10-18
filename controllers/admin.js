const User = require("../models/user");
const Listing = require("../models/listing");
const Vehicle = require("../models/vehicle");
const Dhaba = require("../models/dhaba");
const Booking = require("../models/booking");

// Admin Dashboard
module.exports.dashboard = async (req, res) => {
    const usersCount = await User.countDocuments();
    const listingsCount = await Listing.countDocuments();
    const vehiclesCount = await Vehicle.countDocuments();
    const dhabasCount = await Dhaba.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    // Recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find()
        .populate("guest")
        .populate("listing")
        .populate("vehicle")
        .populate("dhaba")
        .sort({ createdAt: -1 })
        .limit(5);

    res.render("admin/dashboard.ejs", {
        usersCount,
        listingsCount,
        vehiclesCount,
        dhabasCount,
        bookingsCount,
        recentUsers,
        recentBookings
    });
};

// Users Management
module.exports.allUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.render("admin/users.ejs", { users });
};

module.exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    await User.findByIdAndUpdate(id, { role });
    req.flash("success", "User role updated successfully");
    res.redirect("/admin/users");
};

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash("success", "User deleted successfully");
    res.redirect("/admin/users");
};

// Listings Management
module.exports.allListings = async (req, res) => {
    const listings = await Listing.find().populate("owner").sort({ createdAt: -1 });
    res.render("admin/listings.ejs", { listings });
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    res.redirect("/admin/listings");
};

// Vehicles Management
module.exports.allVehicles = async (req, res) => {
    const vehicles = await Vehicle.find().populate("owner").sort({ createdAt: -1 });
    res.render("admin/vehicles.ejs", { vehicles });
};

module.exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    await Vehicle.findByIdAndDelete(id);
    req.flash("success", "Vehicle deleted successfully");
    res.redirect("/admin/vehicles");
};

// Dhabas Management
module.exports.allDhabas = async (req, res) => {
    const dhabas = await Dhaba.find().populate("owner").sort({ createdAt: -1 });
    res.render("admin/dhabas.ejs", { dhabas });
};

module.exports.deleteDhaba = async (req, res) => {
    const { id } = req.params;
    await Dhaba.findByIdAndDelete(id);
    req.flash("success", "Dhaba deleted successfully");
    res.redirect("/admin/dhabas");
};

// Bookings Management
module.exports.allBookings = async (req, res) => {
    const bookings = await Booking.find()
        .populate("guest")
        .populate("listing")
        .populate("vehicle")
        .populate("dhaba")
        .sort({ createdAt: -1 });
    res.render("admin/bookings.ejs", { bookings });
};

module.exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await Booking.findByIdAndUpdate(id, { status });
    req.flash("success", "Booking status updated successfully");
    res.redirect("/admin/bookings");
};

module.exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    req.flash("success", "Booking deleted successfully");
    res.redirect("/admin/bookings");
};
