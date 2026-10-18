const User = require("../models/user");
const { sendOTP, verifyOTP, isEmailConfigured } = require("../utils/otpService");

module.exports.rendersignup = (req, res) => {
  res.render("user/signup.ejs");
}

module.exports.singup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already taken. Please choose a different one.");
      return res.redirect("/signup");
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/signup");
    }

    // If email service is NOT configured, skip OTP and register directly
    if (!isEmailConfigured()) {
      const newUser = new User({ username, email });
      const registerUser = await User.register(newUser, password);
      console.log(`✅ User registered (no OTP — email not configured): ${registerUser.username}`);

      req.login(registerUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Elite Passage! 🎉");
        res.redirect("/listings");
      });
      return;
    }

    // Email IS configured — proceed with OTP verification
    req.session.pendingSignup = { username, email, password };
    await sendOTP(email, username);
    req.flash("success", "A verification code has been sent to your email!");
    res.redirect("/verify-otp");

  } catch (e) {
    console.log("❌ SIGNUP ERROR:", e.message);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}

module.exports.renderVerifyOTP = (req, res) => {
  if (!req.session.pendingSignup) {
    req.flash("error", "Please sign up first.");
    return res.redirect("/signup");
  }
  res.render("user/verify-otp.ejs", { email: req.session.pendingSignup.email });
}

module.exports.verifyAndCompleteSignup = async (req, res, next) => {
  try {
    if (!req.session.pendingSignup) {
      req.flash("error", "Session expired. Please sign up again.");
      return res.redirect("/signup");
    }

    const { email, username, password } = req.session.pendingSignup;
    const { otp } = req.body;

    // Verify OTP
    const result = verifyOTP(email, otp);
    if (!result.valid) {
      req.flash("error", result.message);
      return res.redirect("/verify-otp");
    }

    // OTP verified — create the user
    const newUser = new User({ username, email });
    const registerUser = await User.register(newUser, password);

    console.log("✅ NEW USER CREATED IN MONGODB ATLAS:");
    console.log(`   - Username: ${registerUser.username}`);
    console.log(`   - Email: ${registerUser.email}`);
    console.log(`   - User ID: ${registerUser._id}`);
    console.log(`   - Created At: ${registerUser.createdAt}`);
    console.log(`   - Role: ${registerUser.role}`);

    // Clear pending signup data
    delete req.session.pendingSignup;

    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Elite Passage! Your email has been verified. 🎉");
      res.redirect("/listings");
    });

  } catch (e) {
    console.log("❌ VERIFICATION ERROR:", e.message);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}

module.exports.resendOTP = async (req, res) => {
  try {
    if (!req.session.pendingSignup) {
      req.flash("error", "Session expired. Please sign up again.");
      return res.redirect("/signup");
    }

    const { email, username } = req.session.pendingSignup;
    await sendOTP(email, username);
    req.flash("success", "A new verification code has been sent to your email!");
    res.redirect("/verify-otp");

  } catch (e) {
    console.log("❌ RESEND OTP ERROR:", e.message);
    req.flash("error", "Failed to resend OTP. Please try again.");
    res.redirect("/verify-otp");
  }
}

module.exports.renderLogin = (req, res) => {
  res.render("user/login.ejs");
}

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Elite Passage!");
  let redirectUrl = res.locals.redirectUrl || "/listings"
  res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
}
