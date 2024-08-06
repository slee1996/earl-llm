import { phonemize } from "phonemize";
import { espeakUnknownWord } from "../espeak/espeak-unknown-word";
import { PhonemeData, PhonemeCache } from "../../types";

const syllableRegex = /[ˈˌ]?[^\sˈˌ]+/g;
const vowelClusterRegex = /[ˈˌaeiouɑɔɛəɨʌɪʊæɝ]+/gi;
const combinedRegex = /([ˈˌ]?[^\sˈˌ]+|[aeiouɑɔɛəɨʌɪʊæɝ]+)/gi;
const stressMarkers: { [key: string]: number } = {
  ˈ: 1,
  ˌ: 1,
  "": 0,
};
const phonemeCache: PhonemeCache = {};

async function parseLine(textStr: string): Promise<PhonemeData[]> {
  try {
    const words = textStr
      .replace(/[^\p{L}\p{N}\s']/gu, "")
      .toLowerCase()
      .split(" ");

    const phonemes = await Promise.all(
      words.map(async (str) => {
        const phoneme = phonemeCache[str] ?? (await phonemize(str));
        phonemeCache[str] = phoneme;
        return phoneme === str
          ? await espeakUnknownWord(str, phonemeCache)
          : phoneme;
      })
    );

    const ipaStrArray = words.map((str, index) => {
      const finalPhoneme = phonemes[index];
      const syllableCount = (finalPhoneme.match(vowelClusterRegex) || [])
        .length;
      const syllableStress = (finalPhoneme.match(combinedRegex) || []).flatMap(
        (chunk) => {
          const potentialSyllables = chunk.match(syllableRegex) || [];
          const syllablesMap = potentialSyllables.flatMap(
            (syllable) => syllable.match(vowelClusterRegex) || []
          );

          return syllablesMap.map((syllable) => {
            if (syllable != null) {
              const stressMarker =
                syllable.startsWith("ˈ") || syllable.startsWith("ˌ")
                  ? syllable[0]
                  : "";
              return stressMarkers[stressMarker] || 0;
            }
            return 0;
          });
        }
      );

      return {
        originalString: str,
        phoneme: finalPhoneme,
        syllableCount,
        syllableStress,
      };
    });

    return ipaStrArray;
  } catch (err) {
    console.log(textStr, err);
    return [];
  }
}

export { parseLine };
