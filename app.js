// Load environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listing.js");
const Vehicle = require("./models/vehicle.js");
const Dhaba = require("./models/dhaba.js");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const vehicleRouter = require("./routes/vehicle.js");
const dhabaRouter = require("./routes/dhaba.js");
const adminRouter = require("./routes/admin.js");
const dashboardRouter = require("./routes/dashboard.js");
const chatbotRouter = require("./routes/chatbot.js");
const { initTwilio } = require("./utils/smsOtpService.js");

// Initialize Twilio SMS service
initTwilio();

// MongoDB connection
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    const isAtlas = dbUrl.includes("mongodb+srv");
    console.log(`✅ Connected to MongoDB ${isAtlas ? "(ATLAS)" : "(LOCAL)"}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/images", express.static(path.join(__dirname, "images")));

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const MongoStore = require("connect-mongo");

// Session configuration with MongoDB store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "mysupersecretcode"
  },
  touchAfter: 24 * 60 * 60 // lazy session update (in seconds)
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // secure against XSS
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Flash + current user middleware (Initial)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = null; // Set default to prevent ReferenceError
  next();
});

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Update core passport strategy
passport.use(new LocalStrategy(User.authenticate()));


// Google OAuth Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback"
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          username: profile.displayName.replace(/\s+/g, '_') + '_' + profile.id.slice(-4),
          email: profile.emails[0].value,
          googleId: profile.id,
          role: 'user'
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }));
}

// Combine passport-local-mongoose with custom logic for Google
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Validate if id is a valid MongoDB ObjectId to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return done(null, null);
    }
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Update currUser after passport has populated req.user
app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  next();
});



// Home page route
app.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({}).limit(20);
  const allVehicles = await Vehicle.find({}).limit(20);
  const allDhabas = await Dhaba.find({}).limit(20);
  res.render("home.ejs", { allListings, allVehicles, allDhabas });
}));

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", bookingRouter);
app.use("/vehicles", vehicleRouter);
app.use("/dhabas", dhabaRouter);
app.use("/admin", adminRouter);
app.use("/dashboard", dashboardRouter);
app.use("/api/chatbot", chatbotRouter);

// Catch-all route for 404 Page Not Found
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// Start server (Render/Heroku needs process.env.PORT)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
