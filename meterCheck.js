const { phonemize } = require("phonemize");

/**
 * Detects syllable stress in a given IPA transcription.
 * @param {string} ipaTextStr - The IPA transcription.
 * @returns {Array<{syllable: string, stress: string}>} - An array of objects representing each syllable and its stress.
 */
async function detectSyllableStress(ipaTextStr) {
  try {
    const syllableRegex = /[ˈˌ]?[^\sˈˌ]+/g; // Improved regex to ensure non-space characters are captured
    const stressMarkers = {
      ˈ: "primary",
      ˌ: "secondary",
      "": "unstressed",
    };
    const ipaText = await phonemize(ipaTextStr);

    let matches;
    const syllablesWithStress = [];

    while ((matches = syllableRegex.exec(ipaText)) !== null) {
      const syllable = matches[0];
      const stressMarker =
        syllable.startsWith("ˈ") || syllable.startsWith("ˌ") ? syllable[0] : "";
      const stress = stressMarkers[stressMarker];
      const cleanSyllable = stressMarker ? syllable.slice(1) : syllable;

      syllablesWithStress.push({
        syllable: cleanSyllable,
        stress: stress,
      });
    }

    return syllablesWithStress;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  detectSyllableStress,
};
