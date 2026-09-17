const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        propertyType: Joi.string().valid(
            "Entire place",
            "Private room",
            "Hotel room",
            "Apartment",
            "Villa",
            "Cottage",
            "Cabin",
            "Lodge",
            "Treehouse",
            "Boat",
        ).allow("", null),
        guests: Joi.number().integer().min(1).allow("", null),
        bedrooms: Joi.number().integer().min(0).allow("", null),
        category: Joi.string().valid(
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Amazing Pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats",
        ).allow("", null)
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});