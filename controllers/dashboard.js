const User = require("../models/user");
const Listing = require("../models/listing");
const Vehicle = require("../models/vehicle");
const Dhaba = require("../models/dhaba");
const Booking = require("../models/booking");

// User Dashboard
module.exports.dashboard = async (req, res) => {
    const userId = req.user._id;

    // Get user's listings, vehicles, dhabas
    const myListings = await Listing.find({ owner: userId });
    const myVehicles = await Vehicle.find({ owner: userId });
    const myDhabas = await Dhaba.find({ owner: userId });

    // Get user's bookings
    const myBookings = await Booking.find({ guest: userId })
        .populate("listing")
        .populate("vehicle")
        .populate("dhaba")
        .sort({ createdAt: -1 });

    res.render("dashboard/index.ejs", {
        myListings,
        myVehicles,
        myDhabas,
        myBookings
    });
};

// User Profile
module.exports.profile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("dashboard/profile.ejs", { user });
};

// Update Profile
module.exports.updateProfile = async (req, res) => {
    const { email } = req.body;
    await User.findByIdAndUpdate(req.user._id, { email });
    req.flash("success", "Profile updated successfully");
    res.redirect("/dashboard/profile");
};

// My Listings
module.exports.myListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    res.render("dashboard/my-listings.ejs", { listings });
};

// My Vehicles
module.exports.myVehicles = async (req, res) => {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.render("dashboard/my-vehicles.ejs", { vehicles });
};

// My Dhabas
module.exports.myDhabas = async (req, res) => {
    const dhabas = await Dhaba.find({ owner: req.user._id });
    res.render("dashboard/my-dhabas.ejs", { dhabas });
};

// My Bookings
module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .populate("vehicle")
        .populate("dhaba")
        .sort({ createdAt: -1 });
    res.render("dashboard/my-bookings.ejs", { bookings });
};

// Cancel Booking
module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/dashboard/bookings");
    }

    if (!booking.guest.equals(req.user._id)) {
        req.flash("error", "You can only cancel your own bookings");
        return res.redirect("/dashboard/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully");
    res.redirect("/dashboard/bookings");
};
