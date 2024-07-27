const { SYSTEM_PROMPTS, USER_PROMPTS } = require("../../constants");
const openai = require("../../llm-clients/openaiClientExport");
const anthropic = require("../../llm-clients/claudeClientExport");
const replicate = require("../../llm-clients/replicateClientExport");

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
    const systemContent =
      customSystemPrompt.length > 0
        ? customSystemPrompt
        : SYSTEM_PROMPTS[selectedSystemPrompt];

    const userPrompt = USER_PROMPTS[selectedUserPrompt]({
      lineLimit,
      meterString: finalString,
      restOfSong,
      songTitle,
      songDescription,
    });

    switch (clientChoice) {
      case "llama":
        return replicate.stream("meta/meta-llama-3.1-405b-instruct", {
          input: {
            system_prompt: systemContent + " Only return the lyrics you are asked for, don't return anything else",
            prompt: userPrompt.content,
          },
        });

      case "openai":
        return openai.chat.completions.create({
          temperature: 1.2,
          messages: [{ role: "system", content: systemContent }, userPrompt],
          model: "gpt-4o",
        });

      case "anthropic":
      default:
        return anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0.2,
          system: systemContent,
          messages: [userPrompt],
        });
    }
  },
};
