const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,

    // Overall Rating
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },

    // Detailed Category Ratings (like real Airbnb)
    ratings: {
        cleanliness: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        accuracy: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        checkIn: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        communication: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        location: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        value: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        }
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("Review", reviewSchema);