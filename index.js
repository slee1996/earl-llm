const { phonemize } = require("phonemize");
const { Chat, CorrectionChat } = require("./llm");

const phonemeCache = {};

/**
 * Counts the number of syllables in a given text.
 * @param {string} text - The input text.
 * @returns {number} - The syllable count.
 */
function countSyllables(text) {
  const sanitizedText = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .toLowerCase();

  if (phonemeCache[sanitizedText]) {
    return phonemeCache[sanitizedText];
  }

  const phonemes = phonemize(sanitizedText);

  let syllableCount = 0;
  const vowelClusterRegex = /[aeiouɑɔɛəɨʌɪʊæɝ]+/gi;

  phonemes.split(" ").forEach((word) => {
    const clusters = word.match(vowelClusterRegex);
    if (clusters) {
      syllableCount += clusters.length;
    } else {
      console.log(`Word: ${word}, Clusters: none`);
    }
  });

  phonemeCache[sanitizedText] = syllableCount;
  return syllableCount;
}

const targetSyllablePattern = [5, 10];
const lineLimit = 8;

/**
 * Interacts with a language model to generate and correct lyrics lines 
 * based on a target syllable pattern and line limit.
 * 
 * This function first generates a set of lyrics using a language model. 
 * It then checks each line against the specified syllable pattern. If a line 
 * does not match the target syllable count, it uses the language model to 
 * correct the line until it fits the pattern.
 * 
 * @async
 * @function generateLyrics
 * @returns {Promise<string[]>} A promise that resolves to an array of corrected 
 * lyrics lines, each matching the specified syllable pattern.
 * @throws Will throw an error if the language model interaction fails.
 */
async function generateLyrics() {
  const chat = await Chat({
    lineLimit,
    targetSyllables:
      targetSyllablePattern.length > 1
        ? targetSyllablePattern.join(" or ")
        : targetSyllablePattern,
  });
  let finalLyrics = [];
  const lyrics = chat.choices[0].message.content
    .split("\n")
    .filter((e) => e.length > 0)
    .map((e) => e.trim());

  for (let i = 0; i < lyrics.length; i++) {
    const lyric = lyrics[i];
    const targetSyllables =
      targetSyllablePattern[i % targetSyllablePattern.length];
    let syllables = countSyllables(lyric);

    if (syllables === targetSyllables) {
      finalLyrics.push(lyric.trim());
    } else {
      while (syllables !== targetSyllables) {
        const correctedLine = await CorrectionChat({
          targetSyllables,
          currentSyllables: syllables,
          lyric,
        });
        const newLyric = correctedLine.choices[0].message.content;
        syllables = countSyllables(newLyric);

        if (syllables === targetSyllables) {
          finalLyrics.push(newLyric.trim());
          break;
        }
      }
    }
  }

  console.log(finalLyrics);
  return finalLyrics;
}

generateLyrics();
