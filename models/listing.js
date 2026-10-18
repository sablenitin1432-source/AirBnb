const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    images: [{
        url: String,
        filename: String,
    }],
    // Backward compatibility - keep single image field
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    mapboxPlaceName: String,

    // Property Details
    propertyType: {
        type: String,
        enum: ['Entire place', 'Private room', 'Shared room', 'Hotel room'],
        default: 'Entire place'
    },

    // Capacity
    guests: {
        type: Number,
        default: 1,
        min: 1
    },
    bedrooms: {
        type: Number,
        default: 1,
        min: 0
    },
    beds: {
        type: Number,
        default: 1,
        min: 1
    },
    bathrooms: {
        type: Number,
        default: 1,
        min: 0.5
    },

    // Amenities
    amenities: [{
        type: String,
        enum: ['WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
            'TV', 'Pool', 'Hot tub', 'Free parking', 'EV charger', 'Gym',
            'Breakfast', 'Workspace', 'Fireplace', 'Piano', 'BBQ grill',
            'Beach access', 'Smoke alarm', 'Carbon monoxide alarm']
    }],

    // House Rules
    houseRules: {
        checkIn: {
            type: String,
            default: '3:00 PM'
        },
        checkOut: {
            type: String,
            default: '11:00 AM'
        },
        selfCheckIn: {
            type: Boolean,
            default: false
        },
        petsAllowed: {
            type: Boolean,
            default: false
        },
        smokingAllowed: {
            type: Boolean,
            default: false
        },
        eventsAllowed: {
            type: Boolean,
            default: false
        }
    },

    // Booking Information
    bookedDates: [{
        startDate: Date,
        endDate: Date,
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }],

    // Category/Filters
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles',
            'Amazing Pools', 'Camping', 'Farms', 'Beach', 'Arctic', 'Caves',
            'Luxe', 'Countryside', 'Lakefront', 'Treehouses', 'Tiny homes'],
        default: 'Trending'
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    instantBook: {
        type: Boolean,
        default: false
    }
});
listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
