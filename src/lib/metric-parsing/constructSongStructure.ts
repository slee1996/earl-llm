import { SongComponent } from "../../types";
import { parseAndFormatLyric } from "../utils";
import { IncomingSongPart } from "../../api/endpoints/createSongStructure";
import { rhymeScore } from "./scoreRhyme";

interface SongComponentWithRhymeScheme extends SongComponent {
  rhymeScheme: string;
}

export async function constructSongStructure({
  incomingSong,
}: {
  incomingSong: IncomingSongPart[];
}): Promise<SongComponentWithRhymeScheme[]> {
  const finishedSong: SongComponentWithRhymeScheme[] = await Promise.all(
    incomingSong.map(async (part: IncomingSongPart) => {
      const rhymeMap: { [key: string]: string } = {};
      let nextRhyme = "A";

      const meter = await Promise.all(part.lines.map(parseAndFormatLyric));

      const rhymeScheme = meter.map((piece, index) => {
        const lastWord = piece.phonemes[piece.phonemes.length - 1];

        // Compare with previous lines to find a rhyme
        for (let i = 0; i < index; i++) {
          const prevLastWord = meter[i].phonemes[meter[i].phonemes.length - 1];
          const score = rhymeScore(lastWord, prevLastWord);

          if (score >= 0.7) {
            return rhymeMap[prevLastWord];
          }
        }

        // If no rhyme found, assign a new letter
        rhymeMap[lastWord] = nextRhyme;
        const currentRhyme = nextRhyme;
        nextRhyme = String.fromCharCode(nextRhyme.charCodeAt(0) + 1);
        return currentRhyme;
      });

      return {
        selectedSystemPrompt: "rapper",
        lineLimit: part.lines.length,
        selectedUserPrompt: part.songPartTitle,
        meter: meter.map((meter) => meter.stress),
        rhymeScheme: rhymeScheme.join(""),
      };
    })
  );

  return finishedSong;
}
