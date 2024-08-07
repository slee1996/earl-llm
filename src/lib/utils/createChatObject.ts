import { SYSTEM_PROMPTS, USER_PROMPTS } from "../../constants";
import openai from "../../llm-clients/openaiClient";
import anthropic from "../../llm-clients/anthropicClient";
import replicate from "../../llm-clients/replicateClient";
import { ChatObjectParams, UserPromptParams } from "../../types";

export function createChatObject({
  clientChoice,
  customSystemPrompt,
  selectedSystemPrompt,
  selectedUserPrompt,
  lineLimit,
  finalString,
  restOfSong,
  songTitle,
  songDescription,
  rhymeScheme
}: ChatObjectParams) {
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
    rhymeScheme
  } as UserPromptParams);

  switch (clientChoice) {
    case "llama":
      return replicate.stream("meta/meta-llama-3.1-405b-instruct", {
        input: {
          system_prompt:
            systemContent +
            " Only return the lyrics you are asked for, don't return anything else",
          prompt: userPrompt.content,
        },
      });

    case "openai":
      return openai.chat.completions.create({
        temperature: 1.2,
        // @ts-expect-error
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
        // @ts-expect-error
        messages: [userPrompt],
      });
  }
}