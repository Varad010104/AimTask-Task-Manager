const router = require("express").Router();
const task = require("../models/task");
const taskModal = require("../models/task");
const userModal = require("../models/user");
const authCheck = (req, res, next) => {
  if (!req.user && !req.session.user) {
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/add/:email", authCheck, (req, res) => {
  console.log(req.params.email);
  res.status(200).render("taskAdd", { email: req.params.email });
});

router.post("/add/:email", async (req, res) => {
  try {
    let { title, description, priority, dueDate, startTime, category } =
      req.body;

    let { email } = req.params;

    let user = await userModal.findOne({ email });

    let task = await taskModal.create({
      userId: user._id,
      title: title,
      description: description,
      dueDate: dueDate,
      startTime: startTime,
      priority: priority,
      category: category,
    });

    if (!task) {
      return res.json({ success: false, msg: "Something Went Wrong" });
    }

    return res.json({ success: true, msg: "Task added successfully" });
  } catch (err) {
    console.error(err);
  }
});

router.get("/viewtask/:email", authCheck, async (req, res) => {
  try {
    const email = req.params.email;

    let user = await userModal.findOne({ email: email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    let filter = { userId: user._id };

    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }
    if (req.query.priority && req.query.priority !== "All") {
      filter.priority = req.query.priority;
    }
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    let sortOption = {};
    if (req.query.sort === "Newest") {
      sortOption.dueDate = -1;
    } else if (req.query.sort === "Oldest") {
      sortOption.dueDate = 1;
    }

    let allTasks = await taskModal.find(filter).sort(sortOption);

    return res.status(200).render("viewTask", {
      tasks: allTasks,
      email: email,
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/complete/:taskId", async (req, res) => {
  try {
    let taskId = req.params.taskId;
    let findTask = await taskModal.findById(taskId).populate("userId");
    if (!findTask) {
      return res.status(404).send("Task not found");
    }

    findTask.status = "completed";
    await findTask.save();
    return res.status(200).redirect(`/tasks/viewtask/${findTask.userId.email}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("server Error");
  }
});

router.get("/edit/:id", async (req, res) => {
  let editedTask = await taskModal.findById(req.params.id);
  return res.status(200).render("editTask", { task: editedTask });
});

router.post("/update/:id", async (req, res) => {
  try {
    let { title, description, priority, dueDate, startTime, category } =
      req.body;

    let taskId = req.params.id;
    let givenTask = await taskModal.findById(taskId).populate("userId");

    let updated = await taskModal.findByIdAndUpdate(taskId, {
      title: title,
      description: description,
      dueDate: dueDate,
      startTime: startTime,
      priority: priority,
      category: category,
    });

    if (!updated) {
      return res.status(404).send("No Id found");
    }

    return res
      .status(200)
      .redirect(`/tasks/viewtask/${givenTask.userId.email}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    let taskId = req.params.id;

  
    let getTask = await taskModal.findById(taskId).populate("userId");
    if (!getTask) {
      return res.status(404).send("Task not found");
    }

    // Delete the task
    await taskModal.deleteOne({ _id: taskId });

    // Redirect to viewtask with user's email
    return res.status(200).redirect(`/tasks/viewtask/${getTask.userId.email}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
