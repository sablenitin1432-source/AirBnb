const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dhabaSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    images: [{
        url: String,
        filename: String,
    }],
    image: {
        url: String,
        filename: String,
    },
    location: {
        type: String,
        required: true,
    },
    cuisine: [{
        type: String,
        enum: ['North Indian', 'South Indian', 'Punjabi', 'Rajasthani',
            'Gujarati', 'Street Food', 'Chinese', 'Multi-Cuisine']
    }],
    category: {
        type: String,
        enum: ['Dhaba', 'Restaurant', 'Street Food', 'Tea Stall', 'Sweet Shop'],
        default: 'Dhaba'
    },
    priceRange: {
        type: String,
        enum: ['₹', '₹₹', '₹₹₹'],
        default: '₹'
    },
    specialties: [String],
    timings: {
        open: {
            type: String,
            default: '6:00 AM'
        },
        close: {
            type: String,
            default: '11:00 PM'
        }
    },
    features: [{
        type: String,
        enum: ['Parking', 'Outdoor Seating', 'Family Friendly', 'Pure Veg',
            'Non-Veg Available', 'Home Delivery', 'Takeaway', 'AC Dining']
    }],
    contact: String,
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Dhaba = mongoose.model("Dhaba", dhabaSchema);
module.exports = Dhaba;
