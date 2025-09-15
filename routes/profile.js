const router = require("express").Router();
const userModal = require("../models/user");
const taskModal = require("../models/task");
const authCheck = (req, res, next) => {
  if (!req.user && !req.session.user) {
    res.redirect("/auth/login");
  } else {
    next();
  }
}; //It checking the user authenticate or not.

router.get("/", authCheck, async (req, res) => {
  try {
    const userSession = req.user || req.session.user;
    const user = await userModal.findOne({ email: userSession.email });
    const tasks = await taskModal.find({ userId: user._id });

    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const pendingCount = tasks.filter((t) => t.status === "pending").length;

    // [
    //   { title: "Task 1", status: "completed" },
    //   { title: "Task 3", status: "completed" }
    // ]

    res.render("profile", { user, completedCount, pendingCount,PUBLIC_VAPID_KEY: process.env.PUBLIC_VAPID_KEY });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post('/deleteAccount/:email', async (req, res) => {
    try {
      const email = req.params.email;
      let user = await userModal.findOneAndDelete({ email: email });
  
      if (!user) {
        return res.status(404).send("There is no profile");
      }
  
      
      req.session.destroy(() => {
        res.redirect('/auth/login');
      }); //Destroy the session and send back to login
      
      await taskModal.deleteMany({ userId: user._id });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  

module.exports = router;
