const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("../models/listing.js");
const Vehicle = require("../models/vehicle.js");
const Dhaba = require("../models/dhaba.js");
const Review = require("../models/review.js");

const ATLASDB_URL = process.env.ATLASDB_URL;

const clearDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(ATLASDB_URL);
    console.log("✅ Connected!");

    await Listing.deleteMany({});
    await Vehicle.deleteMany({});
    await Dhaba.deleteMany({});
    await Review.deleteMany({});

    console.log("🗑️  All data cleared (Listings, Vehicles, Dhabas, Reviews)");
    console.log("✅ Database is now empty. Add your own data via the app.");
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    await mongoose.connection.close();
  }
};

clearDB();
