const { phonemize } = require("phonemize");

const phonemeCache = {};

/**
 * Counts the number of syllables in a given text.
 * @param {string} text - The input text.
 * @returns {number} - The syllable count.
 */
function countSyllables(text) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}

module.exports = { countSyllables };
