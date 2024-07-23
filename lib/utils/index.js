const { SYSTEM_PROMPTS, USER_PROMPTS } = require("../../constants");
const openai = require("../../openaiClientExport");
const anthropic = require("../../claudeClientExport");

module.exports = {
  createChatObject: ({
    clientChoice,
    customSystemPrompt,
    selectedSystemPrompt,
    selectedUserPrompt,
    lineLimit,
    finalString,
    restOfSong,
    songTitle,
    songDescription,
  }) => {
    return clientChoice === "openai"
      ? openai.chat.completions.create({
          temperature: 1.2,
          messages: [
            {
              role: "system",
              content:
                customSystemPrompt.length > 0
                  ? customSystemPrompt
                  : SYSTEM_PROMPTS[selectedSystemPrompt],
            },
            USER_PROMPTS[selectedUserPrompt]({
              lineLimit,
              finalString,
              restOfSong,
              songTitle,
              songDescription,
            }),
          ],
          model: "gpt-4o",
        })
      : anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0.2,
          system:
            customSystemPrompt.length > 0
              ? customSystemPrompt
              : SYSTEM_PROMPTS[selectedSystemPrompt],
          messages: [
            USER_PROMPTS[selectedUserPrompt]({
              lineLimit,
              finalString,
              restOfSong,
              songTitle,
              songDescription,
            }),
          ],
        });
  },
};
