const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, 
  },
  password: {
    type: String,
  },
  googleId: { 
    type: String,
    unique: true,
    sparse: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
});


module.exports = mongoose.model("User", userSchema); //Model automatically prualize kar dega.
