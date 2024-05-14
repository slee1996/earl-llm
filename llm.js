require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function Chat() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content:
          "Generate 8 bars for a rap song about dogs. Each bar should have 8 syllables. You should return only the bars, and end each bar in a newline character.",
      },
    ],
    model: "gpt-4o",
  });
  return chatCompletion;
}

async function CorrectionChat({ currentSyllables, targetSyllables, lyric }) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Rewrite this lyric to have ${targetSyllables} syllables, it currently has ${currentSyllables}. You should return only the bars, and end each bar in a newline character. Lyric: ${lyric}`,
      },
    ],
    model: "gpt-4o",
  });
  return chatCompletion;
}

module.exports = {
  Chat,
  CorrectionChat,
};
