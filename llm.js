require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function Chat({ lineLimit, targetSyllables }) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Compose ${lineLimit} bars for a rap song centered around dogs. Ensure each bar contains exactly ${targetSyllables} syllables. Please provide only the bars, with each one ending in a newline character. Make the lyrics engaging and creative, reflecting the unique characteristics and playful nature of dogs.`,
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
        content: `Rewrite this lyric to contain ${targetSyllables} syllables; it currently has ${currentSyllables} syllables. Ensure the new lyric rhymes with the old one. Return only the revised lyric, ending with a newline character.

        Here is the lyric: ${lyric}`,
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
