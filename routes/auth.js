const express = require("express");
const router = express.Router(); // Express Router banaya (alag se routes handle karne ke liye)
const userModal = require("../models/user"); // User ka model import kiya
const { hashPassword, comparePassword } = require("../utils/hash"); // Password ko hash aur compare karne ke helper functions
const { findEmail } = require("../utils/validateEmail"); // Email check karne ka helper
const passport = require("passport"); // Passport (Authentication library)
const nodemailer = require("nodemailer");
const { creatingOTP } = require("../utils/otpGenerator");
require("dotenv").config();
//Protecting the routes going backward direction
const {
  protectReset,
  protectOtp,
} = require("../middleware/routeProtectionMiddleware");

// =================== LOGIN ROUTES ===================

// Login page dikhana (GET request)
router.get("/login", (req, res) => {
  res.render("login"); // views/login.ejs render karega
});

// Login logic (POST request)
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Email check
    let validEmail = await findEmail(email);
    if (!validEmail) {
      return res.json({ success: false, msg: "This email does not exist" });
    }

    // User fetch
    let userData = await userModal.findOne({ email });

    // Password match
    let passwordMatch = await comparePassword(password, userData.password);

    if (passwordMatch) {
      req.session.user = {
        id: userData._id,
        email: userData.email,
        name: userData.name
      };
      return res.json({ success: true, msg: "Login successful" });
    }

    return res.json({
      success: false,
      msg: "Please re-enter the correct password",
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error" });
  }
});


// =================== SIGNUP ROUTES ===================

// Signup page dikhana (GET request)
router.get("/signup", (req, res) => {
  res.render("signup"); // views/signup.ejs render karega
});

// Signup logic (POST request)
router.post("/signup", async (req, res) => {
  try {
    // Body se data nikala (form se aayega)
    let { name, email, password, confirmPassword } = req.body;

    // Basic validation: koi field empty na ho, password kam se kam 5 char ho, aur dono passwords same ho
    if (
      !name ||
      !email ||
      !password ||
      password.length < 5 ||
      password !== confirmPassword
    ) {
      return res.status(400).json({ success: false, msg: "Invalid data" });
    }

    // Password ko hash (encrypt) kiya
    let newHashedPassword = await hashPassword(password);

    // Database me check kiya email already exist karta hai ya nahi
    let validEmail = await findEmail(email);
    if (validEmail) {
      return res.json({ success: false, msg: "The email already exists" });
    }

    // Agar sab thik hai to user create kar diya
    await userModal.create({
      name: name,
      email: email,
      password: newHashedPassword,
      isVerified: true, // Filhaal direct true kiya hai (baad me OTP/verification add kar sakte hain)
    });

    // Response bhej diya
    return res.json({ success: true, msg: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Signup failed" });
  }
});
// =================== SIGNUP ROUTES END ROUTES ===================

// =================== LOGOUT ROUTE ============================

router.post("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res.status(500).json({ success: false });
    } else {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true, redirect: "/auth/login" });
      });
    }
  });
});

// =================== LOGOUT ROUTE END ============================

// =================== FORGOT PASSWORD ROUTE ============================

router.get("/forgot-password", (req, res) => {
  res.render("forgetPassword");
});

router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;

    let validEmail = await findEmail(email);
    if (!validEmail) {
      return res.json({
        success: false,
        msg: "Please Enter registered Email Address",
      });
    }

    // Save session values
    req.session.forgotPasswordEmail = email;
    req.session.otpVerified = false;

    // Save session first before continuing
    req.session.save(async (err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.json({
          success: false,
          msg: "Something went wrong, please try again.",
        });
      }

      // ✅ Send OTP email after session is saved
      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
          user: process.env.SENDING_EMAIL_ID,
          pass: process.env.EMAIL_APP_PASSWORD, // secure app password
        },
      });

      const companyName = "AimTask";
      const { otp } = await creatingOTP(email);

      const mailOptions = {
        from: `"${companyName}" <sikhoediting108@gmail.com>`,
        to: email,
        subject: "Your Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #444;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to complete the process:</p>
            
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0; color: #007bff; font-size: 28px; letter-spacing: 5px;">${otp}</h3>
            </div>
            
            <p>This code will expire in <b>5 minutes</b>.</p>
            
            <p style="font-size: 14px; color: #666;">
              If you did not request a password reset, please ignore this email. Do not share this code with anyone.
            </p>
            
            <p>Thank you,<br>${companyName} Team</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("OTP sent:", info.messageId);

      // ✅ Send response after mail is sent
      res.json({
        success: true,
        msg: "OTP sent to your registered email Address",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: error.message });
  }
});

// =================== FORGOT PASSWORD END ============================

// =================== VERIFY OTP ROUTE ============================
router.get("/verify-otp/:email", protectReset, (req, res) => {
  console.log(req.params.email);
  res.status(200).render("verifyOTP", { email: req.params.email }); //yaha se email verfiyOTP.ejs pe bhiej diya
});

router.post("/verify-otp", async (req, res) => {
  let { val1, val2, val3, val4, email } = req.body;

  let userOtp = `${val1}${val2}${val3}${val4}`; //concat the all the values.

  let userData = await userModal.findOne({ email });
  console.log("This is the userOTP", userData);

  if (userData && userData.otp == userOtp && Date.now() < userData.otpExpiry) {
    req.session.otpVerified = true;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.json({ success: false, msg: "Something went wrong" });
      }
      return res.json({ success: true, msg: "Valid OTP" });
    });
  } else {
    return res.json({ success: false, msg: "Invalid or Expired OTP" });
  }
});

// =================== VERIFY OTP END ============================

router.get("/reset-password/:email", protectOtp, (req, res) => {
  return res.status(200).render("resetPassword", { email: req.params.email });
});

router.post("/reset-password", async (req, res) => {
  try {
    let { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        msg: "Please check the password again",
      });
    }

    //Hashing the password
    let hashedPassword = await hashPassword(password);

    //Fetching The Data of the User
    let dataFetchUser = await userModal.findOne({ email });
    if (dataFetchUser.googleId) {
      return res.json({
        success: false,
        msg: "You don't have password you logged in with Google",
      });
    }

    //Updating the User password

    let user = await userModal.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, msg: "Something Went Wrong" });
    }
    // ✅ Clear session flags
    req.session.otpVerified = false;
    req.session.forgotPasswordEmail = null;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.json({
          success: false,
          msg: "Something went wrong, please try again.",
        });
      }
      return res.json({
        success: true,
        msg: "Your Password Changed Successfully",
      });
    });
  } catch (err) {
    console.log(err);
    console.log(err.message);
  }
});

/**
 *  req.logout() → "Passport se bolna: bhai user hata do".

 *  req.session.destroy() → "Express-session se bolna: bhai poora session tod do".

 */

// =================== GOOGLE OAUTH ROUTES ===================

// Ye route Google ke login page par redirect karega
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Google se profile aur email dono maangege
  })
);

// Jab Google auth complete ho jaye, to ye callback route hit hoga
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  (req, res) => {
    console.log("✅ Google User:", req.user);
    res.redirect("/profile");
  }
);

// =================== EXPORT ROUTER ===================
module.exports = router;

/*

passport.authenticate('google') = ek middleware hai jo Google login page par bhejta hai aur callback par response verify karta hai.

"User get log in now we need user profile" = Sirf login hone se kaam nahi chalega, hume Google se actual profile details bhi mangni hoti hai (name, email).

"It exchange the code with profile" = Google pehle ek authorization code deta hai, Passport us code ko use karke actual profile fetch karta hai.

"Until the value wouldn’t be save into database, it not goes forward" = Jab tak user ka profile DB me save (ya check) nahi hota, tab tak Passport process complete nahi karta.

"That callback function is inside config/passport-setup.js" = Ye jo "code se profile exchange" hota hai, uska callback Passport strategy ke andar likha jata hai (passport.use(new GoogleStrategy(...))). */
