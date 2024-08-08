import { Request, Response } from "express";
import { generateRawLyrics } from "../../lib/lyric-generation";
import { SongGenerationRequest, LyricComponent } from "../../types";

export async function generateSong(req: Request, res: Response): Promise<void> {
  try {
    const { songComponents, songTitle, songDescription, clientChoice } =
      req.body as SongGenerationRequest;
    let choruses: { [key: number]: string[] } = {};
    let orderedLyrics: LyricComponent[] = [];

    for (const [index, component] of songComponents.entries()) {
      const {
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        customSystemPrompt,
        rhymeScheme,
      } = component;

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!choruses[lineLimit]) {
          const lyrics = await generateRawLyrics({
            lineLimit,
            meter,
            selectedSystemPrompt,
            selectedUserPrompt,
            restOfSong: orderedLyrics,
            customSystemPrompt: customSystemPrompt ?? "",
            songTitle: songTitle ?? "",
            songDescription: songDescription ?? "",
            clientChoice,
            rhymeScheme: rhymeScheme ?? "",
          });
          choruses[lineLimit] = lyrics;
        }
        orderedLyrics[index] = {
          component: "chorus",
          lyrics: choruses[lineLimit],
        };
      } else {
        const lyrics = await generateRawLyrics({
          lineLimit,
          meter,
          selectedSystemPrompt,
          selectedUserPrompt,
          restOfSong: orderedLyrics,
          customSystemPrompt: customSystemPrompt ?? "",
          songTitle: songTitle ?? "",
          songDescription: songDescription ?? "",
          clientChoice,
          rhymeScheme: rhymeScheme ?? "",
        });
        orderedLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics,
        };
      }
    }

    res.status(200).json(orderedLyrics);
  } catch (error) {
    console.error("Error generating song:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the song" });
  }
}
