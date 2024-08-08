import { Request, Response } from "express";
import { generateRawLyrics } from "../../lib/lyric-generation";
import { parseAndFormatLyric } from "../../lib/utils";
import { correctionChat } from "../../lib/llm";
import {
  SongComponent,
  SongGenerationRequest,
  CorrectionParams,
  LyricComponent,
} from "../../types";
import { hammingDistance } from "../../lib/utils";

export async function generateSongWithEnforcement(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { songComponents, songTitle, songDescription, clientChoice } =
      req.body as SongGenerationRequest;
    let chorus: string[] | undefined;
    let originalChorus: string[] | undefined;
    let orderedLyrics: LyricComponent[] = [];
    let originalLyrics: LyricComponent[] = [];

    const generateAndCorrectLyrics = async (
      component: SongComponent,
      index: number
    ) => {
      const {
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        customSystemPrompt,
        rhymeScheme,
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
        rhymeScheme: rhymeScheme ?? "",
      });

      const correctedLyrics = await Promise.all(
        lyrics.map(async (lyric, i) => {
          const meterIndex = i % meter.length;
          return await correctLyric({
            lyric,
            targetSyllables: meter[meterIndex].length,
            currentLyrics: orderedLyrics,
            meter: meter[meterIndex],
            selectedSystemPrompt,
          });
        })
      );

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!chorus) {
          chorus = correctedLyrics;
          originalChorus = lyrics;
        }
        orderedLyrics[index] = { component: "chorus", lyrics: chorus };
        originalLyrics[index] = {
          component: "chorus",
          lyrics: originalChorus!,
        };
      } else {
        orderedLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics: correctedLyrics,
        };
        originalLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics,
        };
      }
    };

    await Promise.all(songComponents.map(generateAndCorrectLyrics));

    res.status(200).json(orderedLyrics);
  } catch (error) {
    console.error("Error generating song:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the song" });
  }
}

async function correctLyric({
  lyric,
  targetSyllables,
  currentLyrics,
  meter,
  selectedSystemPrompt,
}: CorrectionParams): Promise<string> {
  try {
    let { syllables, stress } = await parseAndFormatLyric(lyric);
    let meterDistance = hammingDistance(meter, stress);
    let newLyric = lyric;
    let newSyllables = syllables;

    while (meterDistance > 2) {
      const correctedLine = await correctionChat({
        targetSyllables,
        currentSyllables: newSyllables,
        lyric: newLyric,
        meter,
        currentLyrics,
        selectedSystemPrompt,
      });

      if (correctedLine && correctedLine.choices[0].message.content) {
        newLyric = correctedLine.choices[0].message.content.trim();
        const parsedLyric = await parseAndFormatLyric(newLyric);
        newSyllables = parsedLyric.syllables;
        const newStress = parsedLyric.stress;
        meterDistance = hammingDistance(meter, newStress);
      }
    }

    return newLyric;
  } catch (err) {
    console.log(err);
    return lyric.trim();
  }
}
