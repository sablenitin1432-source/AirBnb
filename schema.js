const Joi = require('joi');


module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).optional(),
        category: Joi.string(),
        propertyType: Joi.string().valid('Entire place', 'Private room', 'Shared room', 'Hotel room'),
        guests: Joi.number().min(1),
        bedrooms: Joi.number().min(0),
        beds: Joi.number().min(1),
        bathrooms: Joi.number().min(0),
        amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string())
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.vehicleSchema = Joi.object({
    vehicle: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow("", null),
        pricePerDay: Joi.number().required().min(0),
        location: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).optional(),
        vehicleType: Joi.string().valid('bike', 'car', 'scooter', 'suv', 'van'),
        brand: Joi.string().allow("", null),
        model: Joi.string().allow("", null),
        year: Joi.number().min(1900).max(new Date().getFullYear() + 1),
        fuelType: Joi.string().valid('Petrol', 'Diesel', 'Electric', 'CNG'),
        transmission: Joi.string().valid('Manual', 'Automatic'),
        seats: Joi.number().min(1),
        features: Joi.array().items(Joi.string()),
        available: Joi.boolean()
    }).required()
});

module.exports.dhabaSchema = Joi.object({
    dhaba: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow("", null),
        location: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).optional(),
        cuisine: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()), 
        category: Joi.string(),
        priceRange: Joi.string().valid('₹', '₹₹', '₹₹₹'),
        specialties: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        timings: Joi.object({
            open: Joi.string().allow("", null),
            close: Joi.string().allow("", null)
        }),
        features: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
        contact: Joi.string().allow("", null)
    }).required()
});