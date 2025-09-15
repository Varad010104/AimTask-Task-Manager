const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModal = require("../models/user");
require("dotenv").config();

/*serializeUser:->
  Jab user login ho jata hai, passport us user ka id (ya koi unique field) ko session me store karta hai.

  Isse har request me poora user object store karne ki zarurat nahi hoti.

  Sirf id session/cookie me save hoti hai → baaki ka user object tu baad me la sakta hai. */
// Ye function user ko "serialize" karta hai, matlab user.id ko cookie me store karta hai
passport.serializeUser((user, done) => {
  done(null, user.id); // cookie ke andar sirf user.id save hogi
});

// Ye function cookie ke andar se user.id uthata hai aur database se full user nikalta hai
/*
  deserializeUser:->
  - Jab user dusri request bhejta hai (like page refresh ya koi aur API call), passport session me se id uthata hai.

  - Fir deserializeUser chalta hai, aur DB se poora user object fetch karke req.user me daal deta hai.

  - Isse har request pe tujhe user ka data available milta hai.
*/
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModal.findById(id); // id se user fetch kar liya
    done(null, user); // user ko req.user me attach kar diya
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Google developer console se liya
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google ka secret key
      callbackURL: "http://localhost:3000/auth/google/callback", // Google login ke baad is URL pe wapas aayega
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log("Fire google callback function");

        // Google ke profile se email nikala
        let email = null;

        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else {
          email = null;
        }

        if (!email)
          return done(null, false, {
            message: "No email found in Google profile",
          });
        // Email null ho sakta hai (rare case), isliye check kar liya

        const googleId = profile.id;

        // Yaha check kar rahe hain ki kya user already exist karta hai (same email + same googleId)
        let existingUser = await userModal.findOne({
          email: email,
          googleId: googleId,
        });

        if (existingUser) {
          // Agar user already exist hai to direct login karwa do
          return done(null, existingUser);
        }

        // Agar email to same hai par googleId nahi hai -> iska matlab banda pehle normal signup hua tha
        let emailOnlyUser = await userModal.findOne({ email: email });
        if (emailOnlyUser) {
          return done(null, false, {
            message: "Account exists with email, but not linked to Google.",
          });
        }

        // Agar user bilkul naya hai to naya user bana do
        let newUser = await userModal.create({
          name: profile.displayName, // Google profile ka naam
          email: email,
          googleId: googleId,
          isVerified: true, // Google se aaya matlab verified
        });

        return done(null, newUser); // naye user ko login kara diya
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
