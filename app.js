const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const authenticateRoute = require("./routes/auth");
const taskRoute = require('./routes/task');
const profileRoute = require("./routes/profile");
const dotenv = require("dotenv");
const passportSetup = require("./config/passport-setup");
const session = require("express-session");
const passport = require("passport");
const {router: notificationRoutes } = require('./routes/notification')
require("./cron/taskReminder"); //jaise he task banay ga ye check karte rahega every 1 minute
const voiceRoutes = require("./routes/voice");
const homeRoute = require('./routes/home');
dotenv.config();
const app = express();

//Connecting the Database
connectDB();

app.use(express.json()); //converting into the json object
app.use(express.urlencoded({ extended: true })); //Handling the form data.
app.use(express.static(path.join(__dirname, "public"))); //public file path
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // disable cache
  res.setHeader("Pragma", "no-cache"); // for old browsers
  res.setHeader("Expires", "0");
  next();
});
app.set("view engine", "ejs"); //Ejs setup kar liya

app.use(
  session({
    secret: process.env.COOKIE_SESSION_ENCRYPT_KEY, //secret → (required) ek secret key jo cookie ko sign karti hai.
    resave: false, //Agar session me kuch bhi change nahi hua, to usko database (ya memory) me dobara save na karo.

    saveUninitialized: false, //saveUninitialized → true/false, empty session save kare ya nahi.
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //Time hain ye total 1 din
  })
); //upper code create the Session with encryption

app.use(passport.initialize());
app.use(passport.session());


app.use('/',homeRoute);
app.use("/auth/", authenticateRoute); //app.use('/auth',authenticateRoute) Baad Main Auth Add Kar sakte Hain.



app.use("/profile", profileRoute);
app.use('/tasks/',taskRoute)
app.use('/notifications/',notificationRoutes)
app.use('/',voiceRoutes);
let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server running");
});
