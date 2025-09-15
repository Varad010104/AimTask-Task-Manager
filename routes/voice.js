const express = require("express");
const router = express.Router();
const userModal = require("../models/user");
const taskModal = require("../models/task");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/voice-task", async (req, res) => {
  try {
    const { voiceText } = req.body;
    const userSession = req.user || req.session.user;
    if (!userSession) {
      return res.status(401).json({ error: "User not logged in" });
    }
    let user = await userModal.findOne({ email: userSession.email });

    if (!voiceText || !user) {
      return res
        .status(400)
        .json({ success: false, error: "voiceText and UserId are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a task manager assistant.
    Convert the following sentence into a JSON object with keys: 
    "title", "description", "category", "startTime", "dueDate", and "priority".
    
    Rules:
    - Always return valid JSON (double quotes only).
    - "title" = short name of the task
    - "description" = more detailed version of the title (default: same as title)
    - "category" must be one of ["work","study","personal","office"]. If not clear, default "personal".
    - "startTime" must be ISO format (e.g., "2025-09-14T17:00:00.000Z"). If not given, default = now.
    - "dueDate" must be ISO format. If not given, set equal to "startTime".
    - "priority" must only be "low", "medium", "high". Default = "medium".
    
    Example:
    Input: "Meeting tomorrow 5 pm"
    Output:
    {
      "title": "Meeting",
      "description": "Meeting scheduled at 5 pm tomorrow",
      "category": "work",
      "startTime": "2025-09-14T17:00:00.000Z",
      "dueDate": "2025-09-14T17:30:00.000Z",
      "priority": "medium"
    }
    
    Now input: "${voiceText}"
    `;

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // Cleanup
    text = text.replace(/```json|```/g, "").trim();
    text = text.replace(/'/g, '"');

    let taskData;
    try {
      taskData = JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e.message, text);
      return res
        .status(500)
        .json({ error: "AI response not valid JSON", raw: text });
    }
    let priority = taskData.priority
      ? taskData.priority.toLowerCase()
      : "medium";
    if (!["low", "medium", "high"].includes(priority)) {
      priority = "medium";
    }

    taskData.priority = priority;
    taskData.startTime = taskData.startTime || new Date().toISOString();
    taskData.dueDate = taskData.dueDate || taskData.startTime;
    taskData.description = taskData.description || taskData.title;
    taskData.category = taskData.category
      ? taskData.category.toLowerCase()
      : "personal";

      
    const newTask = new taskModal({
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      startTime: taskData.startTime,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: "pending",
      userId: user._id,
    });

    await newTask.save();

    res.json({
      success: true,
      message: "✅ Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Voice Task Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
