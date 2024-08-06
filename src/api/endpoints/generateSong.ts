import { Request, Response } from "express";
import { generateRawLyrics } from "../../lib/lyric-generation";
import {
  SongGenerationRequest,
  LyricComponent,
} from "../../types";

export async function generateSong(req: Request, res: Response): Promise<void> {
  try {
    const { songComponents, songTitle, songDescription, clientChoice } =
      req.body as SongGenerationRequest;
    let chorus: string[] | undefined;
    let orderedLyrics: LyricComponent[] = [];

    for (const [index, component] of songComponents.entries()) {
      const {
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        customSystemPrompt,
      } = component;

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
      });

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!chorus) {
          chorus = lyrics;
        }
        orderedLyrics[index] = { component: "chorus", lyrics: chorus };
      } else {
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