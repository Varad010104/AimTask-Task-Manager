const cron = require("node-cron");
const taskModal = require("../models/task");
const webpush = require("../utils/push");
const { subscriptions } = require("../routes/notification"); 

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

  const tasks = await taskModal.find({
    startTime: { $gte: now, $lte: fiveMinLater },
    status: "pending",
  });

  tasks.forEach((task) => {
    const payload = JSON.stringify({
      title: "⏰ Task Reminder",
      body: `Your task "${task.title}" will start in 5 minutes!`,
    });

    subscriptions.forEach((sub) => {
      webpush.sendNotification(sub, payload).catch((err) => console.error(err));
    });
  });
});

module.exports = {};
