
const Listing = require("./models/listing");
const Vehicle = require("./models/vehicle");
const Dhaba = require("./models/dhaba");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema, listingSchema, vehicleSchema, dhabaSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not owner of this listing");
    return res.redirect(`/listings/${id}`);  // ✅ added return
  }
  next();
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you did not create this review");
    return res.redirect(`/listings/${id}`);  // ✅ added return
  }
  next();
}

module.exports.isVehicleOwner = async (req, res, next) => {
  const { id } = req.params;
  let vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    req.flash("error", "Vehicle not found");
    return res.redirect("/vehicles");
  }
  if (!vehicle.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this vehicle");
    return res.redirect(`/vehicles/${id}`);
  }
  next();
}

module.exports.isDhabaOwner = async (req, res, next) => {
  const { id } = req.params;
  let dhaba = await Dhaba.findById(id);
  if (!dhaba) {
    req.flash("error", "Dhaba not found");
    return res.redirect("/dhabas");
  }
  if (!dhaba.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this dhaba");
    return res.redirect(`/dhabas/${id}`);
  }
  next();
}

module.exports.validateVehicle = (req, res, next) => {
  let { error } = vehicleSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

module.exports.validateDhaba = (req, res, next) => {
  let { error } = dhabaSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

// Admin middleware - check if user is admin
module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  if (req.user.role !== "admin") {
    req.flash("error", "You do not have admin access");
    return res.redirect("/");
  }
  next();
}
