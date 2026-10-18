const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

const listingController = require("../controllers/listing.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.array('listing[image]', 5), validateListing, wrapAsync(listingController.createListing));


// New route - show form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Search route - MUST come before /:id route
router.get("/search", wrapAsync(listingController.searchListings));

// Show, Update, Delete routes
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.array('listing[image]', 5), validateListing, wrapAsync(listingController.updateForm))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));







// Edit route - show edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));





module.exports = router;

