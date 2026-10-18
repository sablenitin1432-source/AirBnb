const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { listingSchema } = require("../schema.js");
const mapBoxToken = process.env.Map_Token || "";
// We use a fallback empty string to prevent the SDK from throwing and crashing the process on load
// if the token is missing. Geocoding will still fail later if the token is invalid.
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index.ejs", { allListings }); // no './'
}

module.exports.searchListings = async (req, res) => {
  const { location, checkIn, checkOut, guests, category } = req.query;

  let query = {};

  // Search by location (case-insensitive, partial match)
  if (location) {
    query.$or = [
      { location: { $regex: location, $options: 'i' } },
      { country: { $regex: location, $options: 'i' } },
      { title: { $regex: location, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Filter by guest capacity
  if (guests) {
    const guestCount = parseInt(guests);
    if (!isNaN(guestCount)) {
      query.guests = { $gte: guestCount };
    }
  }

  const allListings = await Listing.find(query);

  res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");

}

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");  // ✅ added return
  }
  console.log("Map Token:", process.env.Map_Token ? "Present" : "Missing");
  res.render("listings/show.ejs", { listing, mapBoxToken: process.env.Map_Token });
}




module.exports.createListing = async (req, res, next) => {
  // Handle amenities - ensure it's always an array
  if (req.body.listing && req.body.listing.amenities) {
    if (!Array.isArray(req.body.listing.amenities)) {
      req.body.listing.amenities = [req.body.listing.amenities];
    }
  }

  // Geocode location with Mapbox (with error handling)
  let geometry = { type: "Point", coordinates: [0, 0] };
  let mapboxPlaceName;
  try {
    if (mapBoxToken) {
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send();
      if (response.body.features.length > 0) {
        geometry = response.body.features[0].geometry;
        mapboxPlaceName = response.body.features[0].place_name;
      }
    }
  } catch (err) {
    console.log("⚠️ Geocoding failed (Map_Token may be missing):", err.message);
  }

  // Handle multiple image uploads
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
  }

  // Create new listing
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.images = uploadedImages;
  if (uploadedImages.length > 0) {
    newListing.image = uploadedImages[0];
  }
  newListing.geometry = geometry;
  newListing.mapboxPlaceName = mapboxPlaceName;

  let saved = await newListing.save();
  console.log(" Saved Listing:", saved);

  req.flash("success", "New listing created successfully!");
  res.redirect(`/listings/${saved._id}`);
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  let original = listing.image && listing.image.url ? listing.image.url : '';
  if (original) {
    original = original.replace("/uploads/", "/upload/h_300/");
  }
  res.render("listings/edit.ejs", { listing, original });
}

module.exports.updateForm = async (req, res) => {
  const { id } = req.params;
  
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Handle amenities - ensure it's always an array
  if (req.body.listing && req.body.listing.amenities) {
    if (!Array.isArray(req.body.listing.amenities)) {
      req.body.listing.amenities = [req.body.listing.amenities];
    }
  } else if (req.body.listing) {
    req.body.listing.amenities = [];
  }

  // Update basic fields
  if (req.body.listing) {
    Object.assign(listing, req.body.listing);
  }

  // Geocode if location changed (with error handling)
  if (req.body.listing && req.body.listing.location) {
    try {
      if (mapBoxToken) {
        let response = await geocodingClient.forwardGeocode({
          query: listing.location,
          limit: 1,
        }).send();
        if (response.body.features.length > 0) {
          listing.geometry = response.body.features[0].geometry;
          listing.mapboxPlaceName = response.body.features[0].place_name;
        }
      }
    } catch (err) {
      console.log("⚠️ Geocoding failed on update:", err.message);
    }
  }

  // Update images if new files are uploaded
  if (req.files && req.files.length > 0) {
    let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images = uploadedImages;
    listing.image = uploadedImages[0];
  }

  await listing.save();

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", " listing Deleted successfully!");
  res.redirect("/listings");
}