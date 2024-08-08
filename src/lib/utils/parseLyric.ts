import { parseLine } from "../metric-parsing";

export const parseAndFormatLyric = async (lyric: string) => {
  const parsed = await parseLine(lyric);

  return {
    syllables: parsed.reduce((sum, item) => sum + item.syllableCount, 0),
    stress: parsed.flatMap((i) => i.syllableStress),
    originalString: parsed.map((i) => i.originalString),
    phonemes: parsed.map((i) => i.phoneme),
  };
};
