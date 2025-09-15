const router = require("express").Router();
const webpush = require("../utils/push");

let subscriptions = []; // Memory me store karenge (baad me DB me dal sakte hain)

// User subscribe hoga
router.post("/subscribe", (req, res) => {
  const subscription = req.body; // browser se aayega
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscribed successfully!" });
});

// Send notification manually (testing)
router.post("/sendNotification", async (req, res) => {
  const payload = JSON.stringify({ title: "Test", body: "This is a push notification" });

  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload).catch(err => console.error(err));
  });

  res.status(200).json({ message: "Notification sent" });
});

module.exports = { router, subscriptions };
