import { SongComponent } from "../../types";
import { parseLyric } from "../utils";
import {
  IncomingSongPart,
} from "../../api/endpoints/createSongStructure";

export async function constructSongStructure({
  incomingSong,
}: {
  incomingSong: IncomingSongPart[];
}): Promise<SongComponent[]> {
  const finishedSong: SongComponent[] = await Promise.all(
    incomingSong.map(async (part: IncomingSongPart) => {
      console.log(part)
      const meter = await Promise.all(part.lines.map(parseLyric));

      return {
        selectedSystemPrompt: "rapper",
        lineLimit: part.lines.length,
        selectedUserPrompt: part.songPartTitle,
        meter: meter.map((meter) => meter.stress),
      };
    })
  );

  return finishedSong;
}
