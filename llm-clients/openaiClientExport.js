require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  // baseURL: "http://localhost:8080/v1",
});

module.exports = openai;
