const { phonemize } = require("phonemize");
const { espeakUnknownWord } = require("./espeak");

const syllableRegex = /[ˈˌ]?[^\sˈˌ]+/g;
const vowelClusterRegex = /[ˈˌaeiouɑɔɛəɨʌɪʊæɝ]+/gi;
const combinedRegex = /([ˈˌ]?[^\sˈˌ]+|[aeiouɑɔɛəɨʌɪʊæɝ]+)/gi;
const stressMarkers = {
  ˈ: 1,
  ˌ: 0,
  "": 0,
};
const phonemeCache = {};

/**
 * Parses a given text string and converts each word into its phonemic representation,
 * including syllable counts and syllable stress patterns. It processes the text to remove
 * non-alphanumeric characters and handles unknown words with a fallback mechanism.
 *
 * @param {string} textStr - The input text string to be processed.
 * @returns {Promise<Array<Object>>} An array of objects, each containing details about
 * the original word, its phoneme representation, syllable count, and syllable stress.
 *
 * @async
 * @example
 * parseLine("Example text for parsing.").then(data => {
 *   console.log(data);
 *   // Output might be:
 *   // [
 *   //   { originalString: "example", phoneme: "ɪɡˈzæmpəl", syllableCount: 3, syllableStress: [1, 0, 0] },
 *   //   { originalString: "text", phoneme: "tɛkst", syllableCount: 1, syllableStress: [1] },
 *   //   { originalString: "for", phoneme: "fɔːr", syllableCount: 1, syllableStress: [1] },
 *   //   { originalString: "parsing", phoneme: "ˈpɑːrsɪŋ", syllableCount: 2, syllableStress: [1, 0] }
 *   // ]
 * });
 */
async function parseLine(textStr) {
  try {
    const words = textStr
      .replace(/[^\p{L}\p{N}\s']/gu, "")
      .toLowerCase()
      .split(" ");
    const phonemes = await Promise.all(
      words.map(async (str) => {
        const phoneme = phonemeCache[str] ?? (await phonemize(str));
        phonemeCache[str] = phoneme;
        return phoneme === str ? await espeakUnknownWord(str) : phoneme;
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
  }
}

module.exports = {
  parseLine,
};
