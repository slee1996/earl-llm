require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
  // baseURL: "http://localhost:8080/v1",
});

module.exports = anthropic;
