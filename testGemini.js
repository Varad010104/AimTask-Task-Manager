const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Give me priority for task: Prepare Resume for Interview";
  
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

run();
