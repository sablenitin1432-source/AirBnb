const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("../models/listing.js");
const Vehicle = require("../models/vehicle.js");
const Dhaba = require("../models/dhaba.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const listingData = require("./data.js");
const vehicleDataFile = require("./vehicleData.js");
const dhabaDataFile = require("./dhabaData.js");

const vehicleData = vehicleDataFile.data;
const dhabaData = dhabaDataFile.data;

// Database URLs
const LOCAL_MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
const ATLAS_MONGO_URL = process.env.ATLASDB_URL;

// Initialize data for a single database
const initSingleDB = async (dbName, mongoUrl) => {
  try {
    console.log(`\n📦 Initializing ${dbName}...`);
    // Connect to database
    await mongoose.connect(mongoUrl);
    console.log(`✅ Connected to ${dbName}`);

    // Find a real user ID from database or create one
    let owner = await User.findOne({});
    if (!owner) {
      owner = new User({
        username: 'admin',
        email: 'admin@wanderlust.com'
      });
      await User.register(owner, 'admin1234');
      console.log("🔐 Created default admin user");
    }

    const ownerId = owner._id;
    console.log("👤 Using owner ID:", ownerId);

    // Clear existing data
    await Listing.deleteMany({});
    await Vehicle.deleteMany({});
    await Dhaba.deleteMany({});
    await Review.deleteMany({});
    console.log("🗑️  Cleared existing data (Listings, Vehicles, Dhabas, and Reviews)");

    // Insert listings with owner
    const listingsWithOwner = listingData.data.map((obj) => ({ ...obj, owner: ownerId }));
    await Listing.insertMany(listingsWithOwner);
    console.log("🏠 Listings initialized:", listingsWithOwner.length);

    // Insert vehicles with owner
    const vehiclesWithOwner = vehicleData.map((obj) => ({ ...obj, owner: ownerId }));
    await Vehicle.insertMany(vehiclesWithOwner);
    console.log("🚗 Vehicles initialized:", vehiclesWithOwner.length);

    // Insert dhabas with owner
    const dhabasWithOwner = dhabaData.map((obj) => ({ ...obj, owner: ownerId }));
    await Dhaba.insertMany(dhabasWithOwner);
    console.log("🍛 Dhabas initialized:", dhabasWithOwner.length);

    console.log(`✅ ${dbName} initialized successfully!`);
    await mongoose.connection.close();

  } catch (error) {
    console.error(`❌ Error initializing ${dbName}:`, error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

// Main function to initialize bases
const initAllDBs = async () => {
  console.log("🚀 Starting database initialization...\n");
  console.log("=".repeat(50));

  // Choice: Local or Atlas (Default to Atlas if URL exists)
  if (ATLAS_MONGO_URL) {
    await initSingleDB("MongoDB ATLAS", ATLAS_MONGO_URL);
  } else {
    console.log("⚠️  ATLAS_MONGO_URL not found, using Local MongoDB...");
    await initSingleDB("LOCAL MongoDB", LOCAL_MONGO_URL);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Database initialization process complete!");
};

initAllDBs();
