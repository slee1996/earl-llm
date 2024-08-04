import { Request, Response } from "express";
import { generateRawLyrics } from "../../lib/lyric-generation";
import { parseLine } from "../../lib/metric-parsing";
import { CorrectionChat } from "../../lib/llm";
import {
  SongComponent,
  SongGenerationRequest,
  CorrectionParams,
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
    const parseLyric = async (lyric: string) => {
      const parsed = await parseLine(lyric);
      return {
        syllables: parsed.reduce((sum, item) => sum + item.syllableCount, 0),
        stress: parsed.flatMap((i) => i.syllableStress),
      };
    };

    let { syllables, stress } = await parseLyric(lyric);
    let meterDistance = hammingDistance(meter, stress);
    let newLyric = lyric;
    let newSyllables = syllables;

    while (meterDistance > 2) {
      const correctedLine = await CorrectionChat({
        targetSyllables,
        currentSyllables: newSyllables,
        lyric: newLyric,
        meter,
        currentLyrics,
        selectedSystemPrompt,
      });

      if (correctedLine && correctedLine.choices[0].message.content) {
        newLyric = correctedLine.choices[0].message.content.trim();
        const parsedLyric = await parseLyric(newLyric);
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

function hammingDistance(
  intendedMeter: number[],
  currentMeter: number[]
): number {
  let distance = 0;

  for (let i = 0; i < currentMeter.length; i++) {
    if (intendedMeter[i] !== currentMeter[i]) {
      distance++;
    }
  }

  return distance;
}
