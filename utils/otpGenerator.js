const { json } = require("express");
const User = require("../models/user");

async function creatingOTP(email) {
  // OTP generate karna
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10); // 0–9 digit
  }

  let otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  // User ko find karke update karna
  const user = await User.findOneAndUpdate(
    { email },
    { otp: otp, otpExpiry: otpExpiry },
    { new: true } // updated document return karega
  );

  if (!user) {
    throw new Error("User not found with this email");
  }

  return { otp, otpExpiry }; //passes in the objects
}

module.exports = {
    creatingOTP
};
