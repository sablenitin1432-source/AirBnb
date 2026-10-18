const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    sparse: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true  // Allows null values to not conflict with unique constraint
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
userSchema.plugin(passportLocalMongoose); // Adds username and password fields to the schema

module.exports = mongoose.model("User", userSchema);