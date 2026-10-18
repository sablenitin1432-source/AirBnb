const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    // Type of booking
    bookingType: {
        type: String,
        enum: ['listing', 'vehicle', 'dhaba'],
        required: true
    },

    // Reference to the booked item (one of these will be populated)
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: "Vehicle"
    },
    dhaba: {
        type: Schema.Types.ObjectId,
        ref: "Dhaba"
    },

    // Guest who made the booking
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Booking dates
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },

    // For dhabas - reservation time
    reservationTime: String,

    // Number of guests/people
    guests: {
        type: Number,
        required: true,
        min: 1
    },

    // Price breakdown
    basePrice: Number,
    serviceFee: Number,
    taxes: Number,
    totalPrice: {
        type: Number,
        required: true
    },

    // Payment info
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String,
    orderId: String,

    // Booking status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },

    // Special requests
    specialRequests: String,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
