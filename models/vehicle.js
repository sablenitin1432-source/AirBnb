const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
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
    pricePerDay: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    mapboxPlaceName: String,
    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'scooter', 'suv', 'van'],
        default: 'bike'
    },
    brand: String,
    model: String,
    year: Number,
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'CNG'],
        default: 'Petrol'
    },
    transmission: {
        type: String,
        enum: ['Manual', 'Automatic'],
        default: 'Manual'
    },
    seats: {
        type: Number,
        default: 2
    },
    features: [{
        type: String,
        enum: ['GPS', 'Bluetooth', 'USB Charger', 'Helmet Included', 'AC',
            'Music System', 'First Aid Kit', 'Tool Kit', 'Insurance Included']
    }],
    available: {
        type: Boolean,
        default: true
    },
    instantBook: {
        type: Boolean,
        default: false
    },
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

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
