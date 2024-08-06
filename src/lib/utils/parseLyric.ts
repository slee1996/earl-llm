import { parseLine } from "../metric-parsing";

export const parseLyric = async (lyric: string) => {
  const parsed = await parseLine(lyric);
  return {
    syllables: parsed.reduce((sum, item) => sum + item.syllableCount, 0),
    stress: parsed.flatMap((i) => i.syllableStress),
  };
};
