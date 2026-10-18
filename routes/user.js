const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userControllers = require("../controllers/user.js")


router
   .route("/signup")
   .get(userControllers.rendersignup)
   .post(wrapAsync(userControllers.singup));

// OTP Verification routes
router
   .route("/verify-otp")
   .get(userControllers.renderVerifyOTP)
   .post(wrapAsync(userControllers.verifyAndCompleteSignup));

// Resend OTP
router.post("/resend-otp", wrapAsync(userControllers.resendOTP));

router
   .route("/login")
   .get(userControllers.renderLogin)
   .post(
      saveRedirectUrl,
      passport.authenticate("local",
         {
            failureRedirect: '/login',
            failureFlash: true
         }),
      userControllers.login
   );



router.get("/logout", userControllers.logout)

// Google OAuth Routes
router.get("/auth/google",
   passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
   passport.authenticate("google", {
      failureRedirect: "/login",
      failureFlash: "Google login failed. Please try again."
   }),
   (req, res) => {
      req.flash("success", `Welcome back, ${req.user.username}!`);
      res.redirect(req.session.redirectUrl || "/");
   }
);

module.exports = router;