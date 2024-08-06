import { constructSongStructure } from "../../lib/metric-parsing";
import { UserPrompts } from "../../types";
import { Request, Response } from "express"; // Assuming you're using Express

export type IncomingSongPart = {
  songPartTitle: keyof UserPrompts;
  lines: string[];
};

export type IncomingSong = IncomingSongPart[];

export async function createSongStructure(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { songLyrics }: { songLyrics: IncomingSong } = req.body;

    if (!Array.isArray(songLyrics) || songLyrics.length === 0) {
      res.status(400).json({ error: "Invalid songLyrics format" });
      return;
    }
    console.log(songLyrics);
    const songStructure = await constructSongStructure({
      incomingSong: songLyrics,
    });
    console.log(songStructure);
    res.status(200).json({ songStructure });
  } catch (error) {
    console.error("Error in createSongStructure:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
