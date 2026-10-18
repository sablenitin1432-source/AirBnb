# AirBnb-main Project Audit

**Audit date:** 2026-10-15  
**Scope:** `AirBnb-main/` source, configuration names, package manifest/lockfile, templates and static assets. `node_modules` and `.git` were excluded from source review. Environment-file values are intentionally not reproduced.

## 1. Executive summary

This is a Node.js / Express server-rendered travel marketplace branded **Elite Passage** in its UI (the package name is `airbnb`). Users can browse and create accommodation listings, vehicles and dining spots; register/login; leave listing reviews; make booking records; and use a dashboard. There is also an admin area and a chatbot.

The core architecture is a single Express application (`app.js`) using EJS templates, Mongoose/MongoDB, Passport and server-side sessions. It is a monolith, not a separate frontend SPA plus REST backend. Most browser interactions use HTML forms; the chatbot and payment simulation use `fetch`.

**Overall assessment:** useful educational/demo project with a broad feature set, but not ready to treat as a production booking/payment platform without changes. The most important verified issues are:

1. Listing and detail pages place user-controlled database content into raw inline JavaScript, and the map popup uses `setHTML`. This creates a stored-XSS path.
2. The visible payment flow is a simulation. An authenticated user can call the demo endpoint and create a booking marked paid without a real payment. The Razorpay handlers are not wired into the payment template.
3. Several visible navigation/search links do not have corresponding working routes.
4. The catch-all 404 constructs `ExpressError` arguments in the wrong order, so the error handler receives a string status code.
5. `npm audit --package-lock-only` found **31 affected packages** in the lockfile: 2 critical, 21 high, 4 moderate and 4 low. This is an advisory report, not proof that every issue is reachable through this app.
6. The application contains a hard-coded session-secret fallback and the seed script contains a hard-coded default credential. Their values are deliberately omitted here.

**Validation performed:** all 43 project JavaScript files passed `node --check`; all 36 templates under `views/` compiled with EJS. No app server or database was started, no packages were installed, no destructive scripts were run, and no existing source file was changed. There is no functional test suite: the `test` script is a placeholder that exits with an error.

## 2. Folder and file map

### Root

| File | Purpose |
|---|---|
| [`app.js`](./app.js) | Main Express app, startup, database/session/auth configuration, mount points and error handling. Main runtime entry point used by npm scripts. |
| [`package.json`](./package.json) | Project metadata, scripts, Node engine requirement and dependency declarations. Its `main` field points to `index.js`, which is not present; `start` correctly invokes `app.js`. |
| [`package-lock.json`](./package-lock.json) | Locked dependency graph used by npm and the audit. |
| [`cloudConfig.js`](./cloudConfig.js) | Cloudinary client and Multer Cloudinary storage setup. |
| [`middleware.js`](./middleware.js) | Authentication, ownership, admin and Joi validation middleware. |
| [`schema.js`](./schema.js) | Joi request schemas for listings, reviews, vehicles and dhabas. |
| [`.env.example`](./.env.example) | Environment-variable names intended as an example; see section 9. Values are not reported. |
| [`.env`](./.env) | Local environment file exists. Only its variable names were checked; its values were not read or reported. |
| [`.gitignore`](./.gitignore) | Ignores `node_modules`, local environment files, logs and local uploads. |
| [`project_bar_graph.html`](./project_bar_graph.html) | Standalone static project-statistics/bar-graph page; not mounted as an Express route. |

### Backend source

| Folder / files | Purpose |
|---|---|
| [`routes/`](./routes) | Main application route modules: `admin.js`, `booking.js`, `chatbot.js`, `dashboard.js`, `dhaba.js`, `listing.js`, `review.js`, `user.js`, `vehicle.js`. Mounted by `app.js`. |
| [`controllers/`](./controllers) | Handler modules: `admin.js`, `booking.js`, `chatbot.js`, `dashboard.js`, `dhaba.js`, `listing.js`, `reviews.js`, `user.js`, `vehicle.js`. |
| [`models/`](./models) | Mongoose schemas/models: `booking.js`, `dhaba.js`, `listing.js`, `review.js`, `user.js`, `vehicle.js`. |
| [`utils/`](./utils) | `ExpressError.js` custom error, `wrapAsync.js` Promise-to-Express error forwarding, `otpService.js` email OTP, `smsOtpService.js` payment OTP. |
| [`init/`](./init) | Seed data and database scripts: `data.js` (listing samples), `vehicleData.js`, `dhabaData.js`, `index.js` (clears and reloads listing/vehicle/dhaba/review collections), and `clearDB.js` (clears those collections in the configured Atlas DB). These scripts were inspected, not run. |

### Browser and view files

| Folder / files | Purpose |
|---|---|
| [`views/layouts/boilerplate.ejs`](./views/layouts/boilerplate.ejs) | Shared HTML shell, CSS/CDN references, navbar/flash/footer includes and global browser scripts. |
| [`views/includes/navbar.ejs`](./views/includes/navbar.ejs) | Main navigation, search and logged-in/admin menu. |
| [`views/includes/flash.ejs`](./views/includes/flash.ejs) | Success/error flash messages and auto-dismiss behavior. |
| [`views/includes/footer.ejs`](./views/includes/footer.ejs) | Shared footer. |
| [`views/home.ejs`](./views/home.ejs) | Hero/video landing page, promotional content, team section and booking/search bar. |
| [`views/error.ejs`](./views/error.ejs) | Error page; displays `err.message`. |
| [`views/listings/`](./views/listings) | `index.ejs` browse/search cards; `show.ejs` details, map, review form and booking form; `new.ejs` and `edit.ejs` listing forms. |
| [`views/vehicles/`](./views/vehicles) | `index.ejs` browse/filter view; `show.ejs` vehicle details/map/booking; `new.ejs` and `edit.ejs` vehicle forms. |
| [`views/dhabas/`](./views/dhabas) | `index.ejs` dining browse/filter view; `show.ejs` dining details/map/table reservation; `new.ejs` and `edit.ejs` forms. |
| [`views/bookings/`](./views/bookings) | `index.ejs` booking history; `show.ejs` booking details/cancellation; `payment.ejs` payment simulation and client-generated OTP. |
| [`views/user/`](./views/user) | `login.ejs`, `signup.ejs`, `verify-otp.ejs`; local/Google login and email OTP signup screens. |
| [`views/dashboard/`](./views/dashboard) | `index.ejs`, `profile.ejs`, `my-bookings.ejs`, `my-listings.ejs`, `my-vehicles.ejs`, `my-dhabas.ejs`; authenticated user overview and management. |
| [`views/admin/`](./views/admin) | `dashboard.ejs`, `users.ejs`, `listings.ejs`, `vehicles.ejs`, `dhabas.ejs`, `bookings.ejs`; admin reporting and management screens. |
| [`public/css/`](./public/css) | `style.css` global style system; `home.css` landing-page styles; `rating.css` star-rating controls; `chatbot.css` chatbot widget. |
| [`public/js/script.js`](./public/js/script.js) | Client-side form validation, lightbox, booking price display, navbar scroll effects and toast helpers. |
| [`public/js/map.js`](./public/js/map.js) | Shared Mapbox map initialization for listing/vehicle detail pages. |
| [`public/js/chatbot.js`](./public/js/chatbot.js) | Chat widget DOM, message formatting, API calls and status check. |
| [`public/images/team/`](./public/images/team) | Four team photos displayed on the homepage. |
| [`public/mainBackground.mp4`](./public/mainBackground.mp4), [`public/mainpagebg.webm`](./public/mainpagebg.webm), [`public/secondBackground.mp4`](./public/secondBackground.mp4) | Static video assets served from `public`; the homepage references the first two. |

### Other files and folders

| Folder / files | Purpose |
|---|---|
| [`classroom/server.js`](./classroom/server.js) | Separate teaching/demo Express server on port 3000; it is not imported by the main app. |
| [`classroom/routes/posts.js`](./classroom/routes/posts.js), [`classroom/routes/users.js`](./classroom/routes/users.js) | Demonstration route handlers; the classroom server does not mount these routers. |
| [`classroom/views/page.ejs`](./classroom/views/page.ejs) | Demo page rendered by the classroom server. |
| [`images/hotel img.jpg`](<./images/hotel img.jpg>) | Root static image served under `/images`; no source reference was found in the inspected templates. |
| [`videos/`](./videos) | Additional video files: `hotelBackground.webm`, `mainpagebg.webm`, `RestaurantsBackground.webm`, `secondBackground.mp4`, `vehicleBackgroundd.mp4`. The directory is explicitly served at `/videos`; not all files were found referenced. |
| [`.gemini/`](./.gemini) | Three design/reference documents: `current_design_snapshot.md`, `luxury_design_backup.md`, `merge_resolution_summary.md`. They are not imported by the app. |
| `node_modules/` | Installed dependencies, excluded from source-code analysis as requested. |

**Entry point:** `npm start` runs `node app.js`; `npm run dev` runs `nodemon app.js`. `classroom/server.js` is a separate demo and is not the entry point. No README, formal deployment manifest or functional test files were found in the project tree inspected.

## 3. Technology stack

| Technology | Evidence / role |
|---|---|
| Node.js `>=18` | Declared engine requirement; Node 18+ also supplies the global `fetch` used by the chatbot. |
| Express `5.1.0` | HTTP server, routing, middleware and error pipeline. |
| EJS `3.1.10`, `ejs-mate` | Server-rendered HTML and shared layouts/partials. |
| MongoDB, Mongoose `8.16.0` | Persistence, schemas, queries and references. Local fallback database name is `Wanderlust`; Atlas uses `ATLASDB_URL`. |
| `express-session`, `connect-mongo`, `connect-flash` | Session-backed login/booking/OTP state, Mongo session storage and flash messages. |
| Passport `0.7.0`, `passport-local`, `passport-local-mongoose` | Local username/password authentication, session serialization and password hashing/salt support. |
| `passport-google-oauth20` | Optional Google OAuth login. |
| Joi `17.13.3` | Request-body validation for listing/review/vehicle/dhaba routes. |
| Multer `2.0.2`, `multer-storage-cloudinary`, Cloudinary `1.37.2` | Multipart photo uploads to Cloudinary. |
| `@mapbox/mapbox-sdk` | Server-side forward geocoding for listings and vehicles. |
| Mapbox GL JS `3.2.0` | Browser maps, loaded from Mapbox CDN. |
| Razorpay SDK `2.9.6` | Backend order/signature handlers exist; the visible payment flow does not invoke them. |
| Twilio `5.12.2` | Optional server-side payment SMS OTP. |
| Nodemailer `8.0.1` | Optional email OTP during signup. |
| Bootstrap `5.3.7`, Font Awesome `6.7.2`, Google Fonts | CDN assets used by the EJS layout. |
| Gemini API | Optional direct HTTP call in the chatbot controller; no Gemini npm SDK is used. |
| Nodemon `3.1.10` | Development runner. |

No React, Vue, Angular, TypeScript, frontend bundler, or separate REST frontend is evidenced. `cookie-parser` is declared but no use was found. `npm test` is intentionally a placeholder that prints an error and exits 1.

## 4. Architecture and request flow

### High-level shape

`Browser → Express app.js → middleware/router → controller → Mongoose model → MongoDB → EJS view/JSON response`

This is an MVC-style monolith. Route modules declare HTTP endpoints, controllers contain application operations, models describe Mongo documents, Joi schemas validate selected request bodies, and EJS renders pages. There is no separate service layer or API versioning.

### Middleware order in `app.js`

1. Load `.env` via `dotenv`.
2. Initialize imports and Twilio configuration.
3. Begin a MongoDB connection asynchronously.
4. Add response security headers.
5. Parse JSON and URL-encoded request bodies.
6. Apply `_method` override for HTML forms.
7. Serve `public/`, `/videos`, and `/images` static files.
8. Configure EJS and EJS-Mate.
9. Create a Mongo-backed session store and apply `express-session`.
10. Apply flash middleware and initialize flash/current-user locals.
11. Initialize Passport and its session middleware; register local strategy and optionally Google strategy.
12. Deserialize the user and set `res.locals.currUser`.
13. Handle `/` and mount route modules.
14. Convert unmatched requests to an `ExpressError`, then use the terminal error handler.
15. Start listening on `PORT` or 8080.

**Startup caveat:** the app begins listening without awaiting successful Mongo connection. A failed database connection is logged but does not prevent the HTTP listener from starting.

### Error handling

`wrapAsync` forwards rejected async handlers to Express. Express 5 also provides Promise rejection forwarding, but the app consistently wraps many route handlers. Several controllers catch errors themselves and return JSON/flash redirects. The final error handler renders `views/error.ejs`.

**Verified 404 bug:** `ExpressError` expects `(statusCode, message)`, but the catch-all calls it with `("Page Not Found", 404)`. Therefore the error handler is given a string for `res.status(...)`, which is not a valid HTTP status code. See the improvement plan.

## 5. File-by-file explanation

### App setup and shared helpers

- [`app.js`](./app.js): Mongo connection, hardening headers, body parsing, static serving, EJS setup, sessions, Passport, home page, route mounts, 404 and error handler, listener.
- [`cloudConfig.js`](./cloudConfig.js): Reads Cloudinary configuration from environment variables and creates storage in the `Wanderlust_DEV` folder.
- [`middleware.js`](./middleware.js): `isLoggedIn`, redirect preservation, listing/review/vehicle/dhaba ownership checks, Joi validation and `isAdmin`.
- [`schema.js`](./schema.js): Joi field allowlists and constraints. It does not sanitize HTML in strings.
- [`utils/ExpressError.js`](./utils/ExpressError.js): Error carrying a status code and message.
- [`utils/wrapAsync.js`](./utils/wrapAsync.js): Calls async route handlers and forwards Promise rejections.
- [`utils/otpService.js`](./utils/otpService.js): Generates, stores in-process and verifies email sign-up OTPs; sends with Gmail SMTP if configured.
- [`utils/smsOtpService.js`](./utils/smsOtpService.js): Generates, stores in-process and verifies payment SMS OTPs; uses Twilio when configured and logs a demo OTP when not.

### Routes and controllers

| Route module | Controller / responsibility |
|---|---|
| [`routes/listing.js`](./routes/listing.js) | Browse/search/show and authenticated listing create/update/delete; uses Cloudinary upload middleware and Joi. |
| [`controllers/listing.js`](./controllers/listing.js) | Listing queries, Mapbox forward geocoding, image handling, CRUD and EJS rendering. |
| [`routes/review.js`](./routes/review.js) | Create/delete reviews under a listing. |
| [`controllers/reviews.js`](./controllers/reviews.js) | Creates review docs and updates a listing’s review references; deletes them. |
| [`routes/user.js`](./routes/user.js) | Local signup/login/logout, email OTP and Google OAuth endpoints. |
| [`controllers/user.js`](./controllers/user.js) | Account creation, OTP flow, local login redirect and logout. |
| [`routes/booking.js`](./routes/booking.js) | Booking setup, payment/OTP endpoints, history, details and cancellation. |
| [`controllers/booking.js`](./controllers/booking.js) | Calculates totals, stores pending booking in session, demo processing, Razorpay order/signature code, OTP and booking CRUD-like operations. |
| [`routes/vehicle.js`](./routes/vehicle.js) | Browse/show and authenticated owner CRUD for vehicles. |
| [`controllers/vehicle.js`](./controllers/vehicle.js) | Filtering, vehicle CRUD, image upload data and Mapbox geocoding. |
| [`routes/dhaba.js`](./routes/dhaba.js) | Browse/show and authenticated owner CRUD for dining spots. |
| [`controllers/dhaba.js`](./controllers/dhaba.js) | Filtering and dhaba CRUD; new dhabas receive a fixed default coordinate rather than geocoding. |
| [`routes/admin.js`](./routes/admin.js) | Admin-only management endpoints. |
| [`controllers/admin.js`](./controllers/admin.js) | Admin lists/counts and user/content/booking changes. |
| [`routes/dashboard.js`](./routes/dashboard.js) | Authenticated profile, owned content and booking pages. |
| [`controllers/dashboard.js`](./controllers/dashboard.js) | User dashboard queries, profile email update and booking cancellation. |
| [`routes/chatbot.js`](./routes/chatbot.js) | Public chatbot and status endpoints. |
| [`controllers/chatbot.js`](./controllers/chatbot.js) | Optional Gemini request, pattern-based fallback replies, input checks and status JSON. |

Some route modules import models/schemas they do not use. `listingSchema` in the Mongoose model refers to persisted data and is distinct from the Joi request schema in the root `schema.js`.

### Models

All models use Mongoose’s normal model-to-plural-collection mapping. Exact deployed collection state is not accessible from this source audit.

- [`models/user.js`](./models/user.js): User identity, email, phone, optional Google ID, role and creation date; `passport-local-mongoose` adds username/password authentication fields and hashing support.
- [`models/listing.js`](./models/listing.js): Stay/property fields, photos, capacity, amenities, house rules, bookedDates, category, review refs, owner, GeoJSON Point and metadata. A `findOneAndDelete` hook deletes associated reviews.
- [`models/review.js`](./models/review.js): Comment, overall rating, six optional category ratings, author and timestamp.
- [`models/vehicle.js`](./models/vehicle.js): Vehicle specs, price/day, availability, photos, features, owner, location geometry and metadata.
- [`models/dhaba.js`](./models/dhaba.js): Dining spot details, cuisine/category/price range, hours, features, contact, rating, owner and geometry.
- [`models/booking.js`](./models/booking.js): Booking type and optional reference to one of listing/vehicle/dhaba; guest, dates, reservation time, guest count, price breakdown, payment identifiers/status, booking status and timestamp.

### Initialization and extra app

- [`init/data.js`](./init/data.js), [`init/vehicleData.js`](./init/vehicleData.js), [`init/dhabaData.js`](./init/dhabaData.js): Static example records for stays, vehicles and dining spots.
- [`init/index.js`](./init/index.js): Chooses Atlas if `ATLASDB_URL` exists, otherwise local Mongo; if no user exists it registers a default account, then **deletes all listings, vehicles, dhabas and reviews** and inserts sample data. The default account is not explicitly assigned the admin role, so the model default makes it a normal user despite the script’s “admin” wording. A hard-coded default password exists in this file; its value is omitted.
- [`init/clearDB.js`](./init/clearDB.js): Connects to Atlas and deletes listings, vehicles, dhabas and reviews. It is destructive and was not run.
- [`classroom/server.js`](./classroom/server.js): Separate session/flash teaching example. It has a hard-coded session secret (value omitted), does not mount its imported routers, `/register` does not send a response, and `/hello` assigns a property to `res.render` instead of passing a `message` value to the template.
- [`classroom/routes/posts.js`](./classroom/routes/posts.js), [`classroom/routes/users.js`](./classroom/routes/users.js): Simple demonstration route definitions, not mounted in the classroom server.

### Frontend templates and assets

- [`views/home.ejs`](./views/home.ejs): Video hero, marketing sections, team images and a booking bar.
- [`views/listings/index.ejs`](./views/listings/index.ejs), [`views/vehicles/index.ejs`](./views/vehicles/index.ejs), [`views/dhabas/index.ejs`](./views/dhabas/index.ejs): Search/filter forms and result cards.
- `views/{listings,vehicles,dhabas}/new.ejs` and `edit.ejs`: Multipart forms with fields corresponding to each Joi schema; browser validation is convenience only.
- [`views/listings/show.ejs`](./views/listings/show.ejs): Listing photos/details, owner controls, booking form, map and listing reviews/form.
- [`views/vehicles/show.ejs`](./views/vehicles/show.ejs): Vehicle gallery/specifications, map, owner controls and booking dates.
- [`views/dhabas/show.ejs`](./views/dhabas/show.ejs): Dining gallery/details, map, owner controls and reservation date/time/guest form.
- `views/bookings/{payment,index,show}.ejs`: Payment UI, booking list and booking details/cancel form. The payment screen is a simulation.
- `views/user/{login,signup,verify-otp}.ejs`: Auth screens; Google link is shown on login/signup; OTP screen posts verification/resend forms.
- `views/dashboard/*.ejs`: Dashboard, email profile edit, owned content and bookings.
- `views/admin/*.ejs`: Counts, tables and admin forms for users/content/bookings.
- [`views/layouts/boilerplate.ejs`](./views/layouts/boilerplate.ejs): Loads Bootstrap, Font Awesome, Google fonts, Mapbox GL CSS/JS and local CSS/scripts. It loads `home.css` across all pages, not just the homepage.
- [`views/includes/flash.ejs`](./views/includes/flash.ejs): Escaped flash messages; auto-hides after four seconds.
- [`public/js/script.js`](./public/js/script.js): Bootstrap client validation, smooth scrolling, lazy-image observer, navbar scroll effects, booking price display, lightbox and toasts.
- [`public/js/map.js`](./public/js/map.js): Map initialization and popup content. It logs token presence/prefix and uses Mapbox popup HTML.
- [`public/js/chatbot.js`](./public/js/chatbot.js): Widget and API flow. It escapes message text before rendering; the generated UI is built with `innerHTML`.
- CSS files provide separate design systems, star widgets and chatbot styling. Much of the page-specific CSS is also embedded directly in large EJS templates.

## 6. Database schemas and CRUD

| Collection/model | Fields and validation highlights | Relationships / usage |
|---|---|---|
| User | `email` required; optional `phone`; `googleId` unique+sparse; `role` enum `user/admin`, default `user`; `createdAt`; plugin-managed username/password fields. | Referenced as owner, review author, booking guest and booked-date guest. |
| Listing | Required `title`; description; `images[]` and legacy `image`; price/location/country/mapboxPlaceName; property type enum; capacity defaults/minimums; amenity enum; houseRules defaults; bookedDates; category enum; review refs; owner ref; required GeoJSON Point type/coordinates; createdAt; instantBook. | Has many Review refs; owner is User. `bookedDates` exists but booking code does not use it. |
| Review | Comment; rating 1–5 bounds (not required by Mongoose); detailed category ratings default to 5; author ref; createdAt. | Added to a Listing’s `reviews`; listing delete hook removes its reviews. |
| Vehicle | Required title, pricePerDay, location; description/photos; vehicle type/fuel/transmission enums; brand/model/year/seats/features; available/instantBook/rating/reviewCount; owner; required point geometry; createdAt. | Owner ref. Booking references exist, but availability is not locked or checked. |
| Dhaba | Required title/location; description/photos; cuisine/category/price enums; specialties/timings/features/contact; rating/reviewCount/verified; owner; required point geometry; createdAt. | Owner ref. New records are given default Bangalore-area coordinates in controller code. |
| Booking | Required bookingType enum, guest ref, checkIn/checkOut, guests (min 1) and totalPrice; optional listing/vehicle/dhaba refs, reservationTime, price components, payment/order IDs, status enums, specialRequests and createdAt. | Guest and one resource ref. No schema rule enforces exactly one resource reference for bookingType. |

**CRUD evidence:** Listings, vehicles and dhabas have create/read/update/delete handlers. Reviews are created/deleted and connected to a listing. Booking records are created through the demo/OTP/Razorpay handler paths, read by user/admin, cancelled by user and deleted/updated by admin. Profile update changes email. No transaction/availability-locking mechanism was found. Deletes of users, vehicles or dhabas do not cascade bookings; Cloudinary assets are not deleted when records/photos are replaced.

**Seed behavior:** `init/index.js` deletes all documents in the listing, vehicle, dhaba and review collections before re-seeding. It does not clear users or bookings. The separate `clearDB.js` also deletes those four categories. Neither was run.

## 7. Complete route table

Prefixes are mounted in `app.js`: listing `/listings`; reviews `/listings/:id/reviews` (with `mergeParams`); user and booking routers at `/`; vehicles `/vehicles`; dhabas `/dhabas`; admin `/admin`; dashboard `/dashboard`; chatbot `/api/chatbot`. `Y` means authentication is required; `Admin` means authenticated admin role.

### Home, listings and reviews

| Method | Route path | Purpose | Middleware | Controller/handler | Auth |
|---|---|---|---|---|---|
| GET | `/` | Home/featured data | `wrapAsync` | Inline `app.js` handler | N |
| GET | `/listings` | Browse stays | `wrapAsync` | `listing.index` | N |
| POST | `/listings` | Create stay | `isLoggedIn`, Cloudinary Multer, `validateListing`, `wrapAsync` | `listing.createListing` | Y |
| GET | `/listings/new` | New-stay form | `isLoggedIn` | `listing.renderNewForm` | Y |
| GET | `/listings/search` | Search/filter stays | `wrapAsync` | `listing.searchListings` | N |
| GET | `/listings/:id` | View stay | `wrapAsync` | `listing.showListing` | N |
| PUT | `/listings/:id` | Update stay | `isLoggedIn`, `isOwner`, Multer, `validateListing`, `wrapAsync` | `listing.updateForm` | Y + owner |
| DELETE | `/listings/:id` | Delete stay | `isLoggedIn`, `isOwner`, `wrapAsync` | `listing.deleteListing` | Y + owner |
| GET | `/listings/:id/edit` | Edit-stay form | `isLoggedIn`, `isOwner`, `wrapAsync` | `listing.renderEditForm` | Y + owner |
| POST | `/listings/:id/reviews` | Create review | `isLoggedIn`, `validateReview`, `wrapAsync` | `reviews.createReview` | Y |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete review | `isLoggedIn`, `isReviewAuthor`, `wrapAsync` | `reviews.deleteReview` | Y + author |

### Accounts and authentication

| Method | Route path | Purpose | Middleware | Controller/handler | Auth |
|---|---|---|---|---|---|
| GET | `/signup` | Signup form | — | `user.rendersignup` | N |
| POST | `/signup` | Register or start email OTP | `wrapAsync` | `user.singup` | N |
| GET | `/verify-otp` | Signup OTP form | — | `user.renderVerifyOTP` | N (pending session required) |
| POST | `/verify-otp` | Verify email OTP/create account | `wrapAsync` | `user.verifyAndCompleteSignup` | N (pending session required) |
| POST | `/resend-otp` | Resend signup OTP | `wrapAsync` | `user.resendOTP` | N (pending session required) |
| GET | `/login` | Login form | — | `user.renderLogin` | N |
| POST | `/login` | Local login | `saveRedirectUrl`, Passport local authenticate | `user.login` | N |
| GET | `/logout` | Logout | — | `user.logout` | No explicit route guard; Passport session required to log out |
| GET | `/auth/google` | Start Google OAuth | Passport Google strategy | Passport | N |
| GET | `/auth/google/callback` | Complete Google OAuth | Passport Google authenticate | Inline callback | N |

### Booking and payments

| Method | Route path | Purpose | Middleware | Controller/handler | Auth |
|---|---|---|---|---|---|
| POST | `/listings/:id/book` | Prepare stay booking | `isLoggedIn`, `wrapAsync` | `booking.createListingBooking` | Y |
| POST | `/vehicles/:id/book` | Prepare vehicle booking | `isLoggedIn`, `wrapAsync` | `booking.createVehicleBooking` | Y |
| POST | `/dhabas/:id/book` | Prepare dining reservation | `isLoggedIn`, `wrapAsync` | `booking.createDhabaBooking` | Y |
| GET | `/bookings/payment` | Show payment page | `isLoggedIn` | `booking.showPaymentPage` | Y |
| POST | `/bookings/process-payment` | Demo-create a paid booking | `isLoggedIn`, `wrapAsync` | `booking.processPayment` | Y |
| POST | `/bookings/send-otp` | Send payment SMS OTP | `isLoggedIn`, `wrapAsync` | `booking.sendPaymentOtp` | Y |
| POST | `/bookings/verify-otp` | Verify SMS OTP and create paid booking | `isLoggedIn`, `wrapAsync` | `booking.verifyPaymentOtp` | Y |
| POST | `/bookings/create-order` | Create Razorpay order and pending booking | `isLoggedIn`, `wrapAsync` | `booking.createRazorpayOrder` | Y |
| POST | `/bookings/verify-payment` | Verify Razorpay signature/update booking | `isLoggedIn`, `wrapAsync` | `booking.verifyRazorpayPayment` | Y |
| GET | `/bookings` | Show current user’s bookings | `isLoggedIn`, `wrapAsync` | `booking.getUserBookings` | Y |
| GET | `/bookings/:id` | Show booking if guest owns it | `isLoggedIn`, `wrapAsync` | `booking.showBooking` | Y + guest check |
| POST | `/bookings/:id/cancel` | Cancel subject to controller’s 24-hour check | `isLoggedIn`, `wrapAsync` | `booking.cancelBooking` | Y + guest check |

### Vehicles and dining

| Method | Route path | Purpose | Middleware | Controller/handler | Auth |
|---|---|---|---|---|---|
| GET | `/vehicles` | Browse/filter vehicles | `wrapAsync` | `vehicle.index` | N |
| GET | `/vehicles/new` | New-vehicle form | `isLoggedIn` | `vehicle.renderNewForm` | Y |
| POST | `/vehicles` | Create vehicle | `isLoggedIn`, Multer, `validateVehicle`, `wrapAsync` | `vehicle.createVehicle` | Y |
| GET | `/vehicles/:id` | View vehicle | `wrapAsync` | `vehicle.showVehicle` | N |
| GET | `/vehicles/:id/edit` | Edit-vehicle form | `isLoggedIn`, `isVehicleOwner`, `wrapAsync` | `vehicle.renderEditForm` | Y + owner |
| PUT | `/vehicles/:id` | Update vehicle | `isLoggedIn`, `isVehicleOwner`, Multer, `validateVehicle`, `wrapAsync` | `vehicle.updateVehicle` | Y + owner |
| DELETE | `/vehicles/:id` | Delete vehicle | `isLoggedIn`, `isVehicleOwner`, `wrapAsync` | `vehicle.deleteVehicle` | Y + owner |
| GET | `/dhabas` | Browse/filter dining spots | `wrapAsync` | `dhaba.index` | N |
| GET | `/dhabas/new` | New-dhaba form | `isLoggedIn` | `dhaba.renderNewForm` | Y |
| POST | `/dhabas` | Create dining spot | `isLoggedIn`, Multer, `validateDhaba`, `wrapAsync` | `dhaba.createDhaba` | Y |
| GET | `/dhabas/:id` | View dining spot | `wrapAsync` | `dhaba.showDhaba` | N |
| GET | `/dhabas/:id/edit` | Edit-dhaba form | `isLoggedIn`, `isDhabaOwner`, `wrapAsync` | `dhaba.renderEditForm` | Y + owner |
| PUT | `/dhabas/:id` | Update dining spot | `isLoggedIn`, `isDhabaOwner`, Multer, `validateDhaba`, `wrapAsync` | `dhaba.updateDhaba` | Y + owner |
| DELETE | `/dhabas/:id` | Delete dining spot | `isLoggedIn`, `isDhabaOwner`, `wrapAsync` | `dhaba.deleteDhaba` | Y + owner |

### Admin, dashboard and chatbot

| Method | Route path | Purpose | Middleware | Controller/handler | Auth |
|---|---|---|---|---|---|
| GET | `/admin` | Admin overview | `isAdmin`, `wrapAsync` | `admin.dashboard` | Admin |
| GET | `/admin/users` | List users | `isAdmin`, `wrapAsync` | `admin.allUsers` | Admin |
| PUT | `/admin/users/:id/role` | Change role | `isAdmin`, `wrapAsync` | `admin.updateUserRole` | Admin |
| DELETE | `/admin/users/:id` | Delete user | `isAdmin`, `wrapAsync` | `admin.deleteUser` | Admin |
| GET | `/admin/listings` | List stays | `isAdmin`, `wrapAsync` | `admin.allListings` | Admin |
| DELETE | `/admin/listings/:id` | Delete stay | `isAdmin`, `wrapAsync` | `admin.deleteListing` | Admin |
| GET | `/admin/vehicles` | List vehicles | `isAdmin`, `wrapAsync` | `admin.allVehicles` | Admin |
| DELETE | `/admin/vehicles/:id` | Delete vehicle | `isAdmin`, `wrapAsync` | `admin.deleteVehicle` | Admin |
| GET | `/admin/dhabas` | List dining spots | `isAdmin`, `wrapAsync` | `admin.allDhabas` | Admin |
| DELETE | `/admin/dhabas/:id` | Delete dining spot | `isAdmin`, `wrapAsync` | `admin.deleteDhaba` | Admin |
| GET | `/admin/bookings` | List bookings | `isAdmin`, `wrapAsync` | `admin.allBookings` | Admin |
| PUT | `/admin/bookings/:id/status` | Change booking status | `isAdmin`, `wrapAsync` | `admin.updateBookingStatus` | Admin |
| DELETE | `/admin/bookings/:id` | Delete booking | `isAdmin`, `wrapAsync` | `admin.deleteBooking` | Admin |
| GET | `/dashboard` | User overview | `isLoggedIn`, `wrapAsync` | `dashboard.dashboard` | Y |
| GET | `/dashboard/profile` | View profile | `isLoggedIn`, `wrapAsync` | `dashboard.profile` | Y |
| PUT | `/dashboard/profile` | Update email | `isLoggedIn`, `wrapAsync` | `dashboard.updateProfile` | Y |
| GET | `/dashboard/listings` | User’s stays | `isLoggedIn`, `wrapAsync` | `dashboard.myListings` | Y |
| GET | `/dashboard/vehicles` | User’s vehicles | `isLoggedIn`, `wrapAsync` | `dashboard.myVehicles` | Y |
| GET | `/dashboard/dhabas` | User’s dining spots | `isLoggedIn`, `wrapAsync` | `dashboard.myDhabas` | Y |
| GET | `/dashboard/bookings` | User’s bookings | `isLoggedIn`, `wrapAsync` | `dashboard.myBookings` | Y |
| PUT | `/dashboard/bookings/:id/cancel` | Dashboard booking cancel | `isLoggedIn`, `wrapAsync` | `dashboard.cancelBooking` | Y + guest check |
| POST | `/api/chatbot` | Get chatbot reply | None | `chatbot.handleChat` | N |
| GET | `/api/chatbot/status` | Report chatbot status | None | `chatbot.getStatus` | N |

No `/map`, `/vehicles/search`, or `/dhabas/search` route is defined in the mounted route set.

## 8. Features and user flows

### Opening the home and browsing

`GET /` fetches up to 20 records each from listings, vehicles and dhabas and renders the homepage. Browse pages fetch model data and render result cards. Listing filters are handled by `/listings/search`; vehicle and dining pages accept query filters in their index controllers, but their visible forms do not submit to those working query shapes (see section 11).

### Viewing a listing

`GET /listings/:id` loads the listing and populates owner and review authors. The EJS detail page displays photos, details and reviews, adds an owner edit/delete panel when appropriate, and loads a Mapbox map if a token and geometry are present. A logged-in user sees a booking form; others see a login link.

### Creating, editing and deleting listings

Creation requires login. The multipart form sends up to five `listing[image]` files. Multer uploads them to Cloudinary, Joi validates `req.body.listing`, the controller normalizes amenities, attempts Mapbox forward geocoding, sets the current user as owner, stores the images and saves the listing. Editing/deleting is protected by owner middleware. Update can geocode a changed location and replaces the image set when new uploads are supplied. Listing deletion also deletes associated review documents through a model hook.

### Vehicles and dining

Vehicle and dhaba forms use the same login/owner/upload/Joi pattern. Vehicle creation attempts geocoding and falls back to a fixed Bangalore coordinate; dhaba creation always assigns that fixed coordinate. Both support up to five uploaded files. Detail pages offer owner controls and booking/reservation forms.

### Signup, login and logout

Local signup checks for existing username/email. With email settings configured, it stores pending signup data in the session and sends an email OTP; verification then uses `User.register` and logs the user in. Without email settings, signup proceeds without OTP. Local login uses Passport Local and the `passport-local-mongoose` plugin; Google OAuth is conditional on configured client ID/secret. Logout is implemented as `GET /logout`.

### Reviews

Any logged-in user may post a rating/comment on a listing. Joi checks the rating range and comment presence; the controller saves a Review and adds its ID to the listing. The code does not require proof of a completed booking, and vehicle/dhaba reviews are not implemented.

### Booking flow

For a stay or vehicle, the controller calculates nights/days, service fee, tax and total and stores a `pendingBooking` object in the session. A dining reservation stores the date/time and fixed reservation fee. The payment page then presents card/UPI/netbanking fields and a **browser-generated demo OTP**. Its JavaScript eventually POSTs `/bookings/process-payment`, which creates a booking marked completed/confirmed without charging an external provider. Backend SMS OTP handlers also create completed bookings after phone OTP verification; the payment page does not call those routes. Razorpay order/signature endpoints exist but are not wired into the payment page. Booking cancellation exists in both `/bookings/:id/cancel` and `/dashboard/bookings/:id/cancel`, with different policy behavior.

### Map and geocoding

Listings and vehicles call Mapbox forward geocoding on create and, in some cases, update. Listing geocoding failure stores `[0,0]`; vehicle geocoding failure/default uses a fixed Bangalore coordinate. The detail templates pass a Mapbox token into browser JavaScript. Dhaba map rendering is inline and uses stored geometry; dhaba creation does not geocode the supplied address. There is no map browse route despite “View on Map” links.

## 9. Environment variables and third-party integrations

Only variable names were inspected from `.env` and `.env.example`. No values are included in this report.

| Integration/config | Variable names used in code | Behavior when unavailable / notes |
|---|---|---|
| MongoDB | `ATLASDB_URL` | Optional. If absent, app and seed script use local MongoDB at `127.0.0.1:27017/Wanderlust`. App starts listening even if connection fails. |
| Session and connect-mongo | `SESSION_SECRET` | Falls back to a hard-coded value in `app.js`; this must not be used in production. |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` | Configured in `cloudConfig.js`; routes depend on Cloudinary for file storage and have no local-storage fallback. |
| Mapbox | `Map_Token` | Empty token disables geocoding and browser map; code uses this mixed-case spelling consistently. Token is passed to the browser and should be a restricted public token, not treated as a server secret. |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google strategy is registered only when client ID and secret exist. The callback URL otherwise defaults to localhost, unsuitable for a deployed host. Without strategy configuration, the visible Google route will fail at runtime. |
| Email OTP | `EMAIL_USER`, `EMAIL_PASS` | Not listed in `.env.example` or the checked local `.env` variable names. If absent, signup skips verification. If present, Nodemailer uses Gmail SMTP. |
| Twilio SMS OTP | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Not listed in `.env.example` or the checked local `.env` names. Without them, payment OTP uses demo mode and logs the generated code to the server console. |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Not listed in `.env.example` or the checked local `.env` names. Backend order creation reports missing configuration; actual checkout page does not call it. |
| Gemini chatbot | `GEMINI_API_KEY` | Not listed in `.env.example` or the checked local `.env` names. Missing key uses rule-based replies. |
| Port | `PORT` | Optional; defaults to 8080. Present as a name in local `.env`, not in `.env.example`. |

`.env.example` contains names for `ATLASDB_URL`, the three Cloudinary variables, `Map_Token` and `SESSION_SECRET`. It omits Google OAuth, email OTP, Twilio, Razorpay, Gemini, callback URL and `PORT`. The checked `.env` has names for Atlas, Cloudinary, Google OAuth, Mapbox, `PORT` and session configuration; values remain unreported. External host-level environment variables were not verified.

Other external services/assets: Bootstrap, Font Awesome and fonts are loaded from CDNs; Mapbox GL JS is loaded from Mapbox CDN; Cloudinary stores uploads; Gmail SMTP and Twilio send OTPs; Google OAuth authenticates users; Gemini receives chatbot text/history when configured; Razorpay backend SDK code exists. External service credentials, account state, callback registration and production deployment are **Not verified**.

## 10. Security review

The following findings are based on code paths, not an attack against a deployed instance.

### Confirmed high-priority findings

1. **Stored XSS through raw inline data and map popup HTML.** Listing, vehicle and dhaba detail pages embed database objects using raw EJS interpolation of `JSON.stringify(...)` inside `<script>` tags. User-controlled title/location/content is not HTML-sanitized by Joi. A value containing a script-closing sequence can escape the script context. The shared map script also sends listing/vehicle fields to Mapbox `Popup.setHTML`; the dhaba page does the same inline. A contributor who can create a record can affect other viewers. Escape data for the correct JavaScript context and build popup content with text nodes or sanitize HTML.
2. **Payment is not real and can be bypassed.** `/bookings/process-payment` requires login and a session booking, but no provider proof; it marks the booking payment complete. The client page generates its OTP locally and posts that endpoint. A user can call it without entering genuine payment data. Treat this as a demo-only feature; do not advertise or deploy it as payment processing. The card/bank values are not submitted to a gateway, and the “PCI DSS” wording is not evidence of compliance.
3. **Weak production session fallback and hard-coded seed credential.** `app.js` uses a hard-coded fallback when `SESSION_SECRET` is absent. `init/index.js` contains a fixed account password in source. Values are intentionally not reproduced. Remove fallbacks/default credentials, require strong deployment secrets, rotate any value that has ever been used and do not seed a privileged account with a reusable password.
4. **OTP demo-mode disclosure and in-memory OTP state.** When Twilio credentials are absent, payment OTP is logged to the server console. Signup email OTP is skipped entirely when email configuration is absent. OTP maps are process-local, so restart/multiple instances do not share state; email OTP has no attempt limit, and neither flow has request throttling. This is unsuitable for production verification.

### Confirmed medium-priority findings

5. **Razorpay invalid-signature path changes an arbitrary booking before authorization.** `verifyRazorpayPayment` marks the submitted `bookingId` as failed immediately after signature mismatch, before it looks up the booking, checks ownership or confirms matching order ID. An authenticated user who knows another booking ID can change its payment state by submitting a bad signature.
6. **No CSRF token protection; logout uses GET.** State-changing HTML forms and endpoints have no CSRF middleware/token. The logout action is a GET link, so it can be triggered cross-site as a top-level navigation. SameSite browser defaults may reduce some cases but are not a substitute for deliberate CSRF protection.
7. **Session cookie lacks production security options.** `httpOnly` is set, but `secure` and explicit `sameSite` are not. HTTPS/HSTS behavior behind a reverse proxy and secure-cookie deployment are not configured.
8. **Unescaped regex input in public search.** Listing and vehicle location searches place user-provided strings directly in case-insensitive Mongo regex queries with no escaping or length cap. This permits regex behavior beyond a literal search and may create performance abuse.
9. **User-controlled detail strings are rendered in map HTML.** In addition to the raw script-context issue above, `setHTML` parses dynamic titles/locations as markup. Use text-only DOM APIs.

### Other security/robustness observations

- Password authentication uses `passport-local-mongoose` rather than storing plaintext passwords directly. No rate limit, lockout, password recovery or MFA policy is implemented.
- Google OAuth account linking matches provider email and links the Google ID without checking a verified-email flag or defensively handling an absent email entry. Review provider email verification and linking policy.
- Signup stores the pending password in session state until OTP completion; use short expiry and avoid retaining plaintext longer than necessary.
- `isOwner` and `isReviewAuthor` do not handle missing documents before dereferencing owner/author; malformed IDs or deleted records can become server errors.
- Uploads enforce a maximum count of five per request, but no explicit byte-size limit is set in Multer. Client `accept="image/*"` is not server validation; verify file content/size and remove abandoned Cloudinary assets.
- Admin status/role update handlers do not pass `runValidators: true` for `findByIdAndUpdate`; request values should also be explicitly allowlisted.
- The HSTS header is set regardless of whether the current connection is HTTPS. HSTS is only useful when served over HTTPS; configure deployment proxy awareness and TLS correctly.
- `X-XSS-Protection` is legacy and not a replacement for output encoding/CSP.
- Chatbot endpoints are public and have no rate limit. With Gemini configured, unauthenticated requests can consume the configured provider quota. History is client-supplied and not schema/size validated beyond the request body limit.
- Seed data includes a reusable default account password; the new account is not assigned `role: "admin"` despite its label. Treat seed tooling as unsafe for production.
- Sensitive runtime configuration values were not inspected or printed. Whether the real external credentials are valid, restricted or rotated is **Not verified**.

## 11. Bugs and improvement plan

### Confirmed behavior bugs

| Priority | Finding | Evidence / user impact | Recommended action |
|---|---|---|---|
| P0 before real payments | Payment page is a simulation; direct authenticated POST creates a completed/confirmed booking without charging. Razorpay endpoints are unused by the page. | `payment.ejs` generates a client-only OTP and calls `/bookings/process-payment`; controller writes `paymentStatus: completed`. | Disable demo processing outside a demo environment; integrate hosted/provider checkout, verify signed provider result server-side, and add idempotency/webhook handling. |
| P1 | Stored XSS in listing/vehicle/dhaba detail data. | Raw JSON is inserted into inline scripts and popup data is passed to `setHTML`. | Context-safe serialization; text DOM for popup content; add tests with `</script>` and HTML payloads. |
| P1 | Vehicle search form is broken. | Form posts to `/vehicles/search` and sends `vehicleType`; no such route exists, and controller expects `type`. UI option values such as `Car` differ from the model’s lowercase enum. | Submit to `/vehicles` with controller-supported names/enum values or add the intended route and tests. |
| P1 | Dining search form is broken/mismatched. | Form posts to `/dhabas/search`, which is not defined; it sends location/priceRange that index ignores. Cuisine choices include values absent from schema seed enums. | Use `/dhabas` query filters or implement route/filter support and align choices with enum values. |
| P1 | “View on Map” links go nowhere. | Listing, vehicle and dhaba pages link to `/map?type=...`; no `/map` route exists. | Implement the route/page or remove/replace the links. |
| P1 | Homepage booking bar does not filter listings. | It submits `GET /listings` with date/guest/promo values, but index ignores those query parameters; the search handler reads some fields but does not use dates. | Route to a supported search endpoint and implement date/guest availability filtering or remove unsupported controls. |
| P1 | Listing/dhaba owner checks may throw on missing record. | Listing owner middleware calls `.equals` without a not-found guard; review-author check also assumes review exists. | Validate IDs, return 404/redirect on missing docs before dereferencing. |
| P1 | Catch-all 404 sends the wrong error argument order. | `ExpressError` signature is `(statusCode, message)` but catch-all reverses it. | Construct with numeric 404 first and add a 404 request test. |
| P1 | Booking date/availability validation is incomplete. | Controllers only reject `nights <= 0`; invalid dates can become `NaN`, guest count/capacity are not enforced, vehicle availability and overlapping dates are not checked. | Validate date parsing/order, capacity, resource availability and overlap atomically on the server. |
| P1 | Cancellation behavior differs. | `/bookings/:id/cancel` enforces a 24-hour rule and marks payment `refunded` without calling a refund provider; dashboard cancellation simply sets cancelled and has no 24-hour check/payment update. | Centralize cancellation policy and use provider refund state only after verified refund. |
| P2 | Email/profile and search input validation gaps. | Profile endpoint updates email without Joi/email uniqueness validation; public regex queries accept arbitrary patterns. | Add server-side schema validation, normalize email and escape/cap search strings. |
| P2 | Default admin bootstrap is inconsistent. | Seed makes a user with default role `user`, while log text calls it admin. | Create admin explicitly through a safe one-time bootstrap process; remove fixed source credential. |
| P2 | Availability/reviews marketing exceeds implemented behavior. | `bookedDates` and vehicle `available` fields are not integrated into booking conflicts; reviews do not require a completed booking. | Implement the policies or adjust UI copy. |
| P2 | Cloudinary resource cleanup and cascades are missing. | Replacing/deleting uploaded images does not remove old assets; deleting user/vehicle/dhaba leaves references/bookings. | Add explicit cleanup and defined retention/cascade policy. |
| P3 | Root manifest metadata mismatch. | `package.json.main` is `index.js`, absent from the inspected tree; npm scripts still use `app.js`. | Change `main` to actual entry or remove unused field. |
| P3 | Classroom demo routes/rendering are incomplete. | Routers are imported but not mounted; `/register` does not respond; `/hello` does not provide `message`. | Repair if this demo is intended to run; otherwise label/archive it. |

### Dependency vulnerability check

Command: `npm audit --package-lock-only --json` from the project directory, using the existing lockfile. It returned a nonzero audit status and reported **31 affected package entries**: **2 critical, 21 high, 4 moderate, 4 low**. Direct dependencies flagged include Cloudinary, Joi, Mongoose, Multer, `multer-storage-cloudinary`, Nodemailer and the development dependency Nodemon. Notable critical transitive entries include `proxy-addr` (through Express) and `vm2` (optional proxy dependencies under Cloudinary). The source code does not directly import `vm2`; exploitability depends on dependency/runtime path and configuration. Advisory results are time-sensitive and do not establish that every issue is reachable.

Do not run `npm audit fix` blindly. Review the individual advisories, update compatible direct packages in a planned branch, assess major-version changes (notably Cloudinary/Nodemailer), regenerate the lockfile, rerun audit and functional tests. No dependency was changed during this audit.

### Suggested order

1. Make payment code explicitly demo-only or integrate provider checkout; authorize all payment-state mutations before writes.
2. Fix context-safe rendering and popup HTML to eliminate stored XSS.
3. Remove secret/default credential fallbacks; set secure cookie/CSRF protections and rate limits.
4. Repair search/map links and enforce server-side booking dates, availability and capacity.
5. Correct error handling, validation, seed/admin bootstrap and cleanup/cancellation consistency.
6. Update dependencies based on the audit; add route/model/auth/payment tests and CI.

## 12. Run and deployment guide

### Local setup

1. Install Node.js 18 or later and run a local MongoDB server, or supply an Atlas connection string.
2. Configure the environment variable **names** documented in section 9 in a local `.env` file. Do not commit it. Cloudinary is required for photo uploads; MongoDB is required for app data and sessions. Google, Mapbox, email, Twilio, Razorpay and Gemini features need their respective settings.
3. From PowerShell:

   ```powershell
   cd "C:\Users\sable\OneDrive\Desktop\AirBnb-main\AirBnb-main"
   npm install
   npm run dev
   ```

4. For non-watch mode, run:

   ```powershell
   npm start
   ```

The app listens on `PORT` or 8080. These are documented run commands; `npm install` was not run during the audit. Do not run `node init/index.js` or `node init/clearDB.js` against valuable databases: both delete existing content.

### Production considerations

- Configure a managed MongoDB connection and network access; ensure the app does not announce healthy readiness before database/session storage is ready.
- Supply a strong unique `SESSION_SECRET`; remove source fallbacks and use HTTPS-only secure cookies behind a correctly configured trusted proxy.
- Set production OAuth callback URL to the deployed HTTPS domain and register it with Google.
- Configure Cloudinary upload limits, content checks and cleanup.
- Disable demo payment endpoints; configure a real payment provider and server-side verification/refunds before accepting real bookings.
- Set Twilio/email/Gemini variables only when those integrations are intentionally enabled; add abuse controls.
- `PORT` is supported for common hosting platforms. Comments mention Render/Heroku, but the actual provider and a working deployment configuration are **Not verified**; no Dockerfile, Procfile or platform manifest was found.
- No `NODE_ENV`-specific behavior was found. Production error handling, HTTPS termination, health checks, log redaction and monitoring need explicit validation.

### Common startup failures

- MongoDB connection error: local MongoDB must be running, or `ATLASDB_URL` and Atlas network access must be correct. The HTTP server may still start and then fail on database-backed requests.
- Image upload error: Cloudinary environment variables/account configuration are needed; there is no local upload fallback.
- Google OAuth error: strategy registration requires both client ID and secret; callback URL must match the running/deployed origin.
- Map not appearing: verify Mapbox token and browser network access; listing geocoding fallback may put a marker at `[0,0]`.
- Email/Twilio/Razorpay/Gemini unavailable: those integrations have fallback/error behavior described in section 9; missing configuration does not make every feature equivalent to production.
- `npm test` does not run tests; it exits with the manifest’s placeholder error.

## 13. Interview and viva preparation

### Simple project introduction

“Elite Passage is a server-rendered travel marketplace built with Node.js, Express, EJS and MongoDB. Users can browse and create stays, vehicles and dining spots, register with local or optional Google login, review stays and manage bookings. It uses Mongoose for data, Passport and sessions for login, Cloudinary for photos, and Mapbox for maps. The current payment screen is a demo simulation rather than a verified live payment integration.”

### Architecture in easy English

“The browser sends a request to Express. Middleware checks login, ownership and form data. A route selects a controller. The controller reads or updates a Mongoose model in MongoDB. For page requests it renders an EJS template and sends HTML back. The session remembers the user and temporary booking/signup information.”

### 30 project-specific questions and short answers

1. **What is the project for?** — A travel marketplace for stays, vehicles and dining reservations.
2. **What is the main backend entry point?** — `app.js`, invoked by `npm start`.
3. **Why is this called an MVC-style app?** — Routes map requests, controllers apply logic, models represent data, and EJS views render HTML.
4. **What does Express do?** — It handles HTTP requests, middleware, route matching and responses.
5. **What does EJS do?** — It renders server-side HTML with data from controllers.
6. **What does EJS-Mate add?** — Layout and partial support for reusable page shells.
7. **How is data stored?** — In MongoDB through Mongoose schemas/models.
8. **Name the main models.** — User, Listing, Review, Vehicle, Dhaba and Booking.
9. **How are user passwords handled?** — Passport Local uses `passport-local-mongoose`, which provides password hashing/salt behavior.
10. **How is login state retained?** — Passport serializes the user ID into an Express session stored in MongoDB.
11. **What does `isLoggedIn` do?** — Blocks unauthenticated requests and redirects to login.
12. **How is listing ownership checked?** — `isOwner` compares the listing owner ID to the current user ID.
13. **How are admins identified?** — `isAdmin` checks the authenticated user’s `role` field.
14. **What does Joi validate?** — Listing, review, vehicle and dhaba request bodies on selected mutation routes.
15. **How does photo upload work?** — Multer parses multipart forms and Cloudinary storage sends the files to Cloudinary.
16. **How does listing geocoding work?** — The listing controller sends its location string to Mapbox forward geocoding and stores returned geometry.
17. **Does the dining flow geocode its location?** — No; new dhabas get a fixed default coordinate in the controller.
18. **How do reviews relate to listings?** — A Review has an author reference; its ID is stored in the Listing’s `reviews` array.
19. **How does booking setup work?** — The controller calculates price and stores a pending booking in the user’s session.
20. **Is the visible payment page connected to Razorpay?** — No; the template uses a local demo OTP and posts to the demo processing endpoint.
21. **What must a real payment integration verify?** — Provider-signed results, order/amount/owner match, replay/idempotency and refund state on the server.
22. **How does signup OTP work?** — If email settings exist, signup data is held in session and an OTP is checked before registration.
23. **What happens if signup email settings are missing?** — Signup skips OTP and registers directly.
24. **How does Google login work?** — Passport Google OAuth is conditionally registered from environment configuration and maps provider profile to a User.
25. **Which route serves chatbot messages?** — `POST /api/chatbot`; Gemini is optional and a rule-based fallback exists.
26. **How are async route errors forwarded?** — `wrapAsync` catches Promise rejection and calls Express `next`.
27. **What does `init/index.js` do?** — It chooses Atlas or local Mongo, deletes selected content collections and inserts sample records.
28. **What is one confirmed search bug?** — Vehicle search targets an undefined `/vehicles/search` path and uses a query name the controller does not read.
29. **What is one important security issue?** — Raw JSON in inline scripts and dynamic Mapbox popup HTML can expose stored XSS.
30. **What testing exists?** — No functional test suite is configured; syntax and template compilation passed in this audit, but app integration behavior remains untested.

### Marathi explanation (English technical terms kept where useful)

“हा **Elite Passage** एक travel marketplace web application आहे. यात user stays/listings, vehicles आणि dining spots browse करू शकतो; स्वतःची listing टाकू शकतो; आणि booking manage करू शकतो. Backend मध्ये **Node.js आणि Express** वापरले आहेत. **EJS** server वर HTML तयार करते, आणि **MongoDB/Mongoose** data साठवतात. Login साठी **Passport**, session साठी **express-session/connect-mongo**, image upload साठी **Multer आणि Cloudinary**, आणि map/geocoding साठी **Mapbox** वापरले आहेत. Routes request घेतात, middleware login/ownership तपासते, controllers business logic चालवतात, आणि models database शी बोलतात. सध्याचा payment page हा demo simulation आहे; तो real Razorpay payment verify करत नाही, त्यामुळे production मध्ये वापरण्यापूर्वी payment, XSS protection, session security आणि input validation सुधारावे लागतील.”

## 14. Files and behavior to inspect further

These need runtime or deployment-level verification that cannot be established from source alone:

- [`app.js`](./app.js), [`controllers/booking.js`](./controllers/booking.js), [`views/bookings/payment.ejs`](./views/bookings/payment.ejs): test the full real-provider payment/refund flow after implementation; current flow is demo-only.
- [`views/listings/show.ejs`](./views/listings/show.ejs), [`views/vehicles/show.ejs`](./views/vehicles/show.ejs), [`views/dhabas/show.ejs`](./views/dhabas/show.ejs), [`public/js/map.js`](./public/js/map.js): verify context-safe rendering and browser behavior with hostile stored strings.
- [`routes/vehicle.js`](./routes/vehicle.js), [`controllers/vehicle.js`](./controllers/vehicle.js), [`views/vehicles/index.ejs`](./views/vehicles/index.ejs): define and test the intended filter URL, query names and enum values.
- [`routes/dhaba.js`](./routes/dhaba.js), [`controllers/dhaba.js`](./controllers/dhaba.js), [`views/dhabas/index.ejs`](./views/dhabas/index.ejs): define and test intended location/cuisine/price/category filters.
- [`views/home.ejs`](./views/home.ejs), [`views/listings/index.ejs`](./views/listings/index.ejs): test date/guest search and check what the “Check Rates” flow is meant to do.
- [`middleware.js`](./middleware.js), [`controllers/reviews.js`](./controllers/reviews.js): test missing/deleted IDs, unauthorized owners and review/listing relationship boundaries.
- [`controllers/user.js`](./controllers/user.js), [`utils/otpService.js`](./utils/otpService.js), [`utils/smsOtpService.js`](./utils/smsOtpService.js): verify provider setup, OTP rate limits, session expiry, multi-instance behavior and failure handling.
- [`cloudConfig.js`](./cloudConfig.js), [`package-lock.json`](./package-lock.json): validate Cloudinary limits and remediate npm audit advisories in a controlled dependency update.
- [`init/index.js`](./init/index.js), [`init/clearDB.js`](./init/clearDB.js): review operational safeguards before anyone runs these destructive scripts.
- Deployment environment, live MongoDB, Cloudinary, Google OAuth, Mapbox, Twilio, SMTP, Razorpay and Gemini account configuration: **Not verified**.

