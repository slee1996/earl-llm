const { Chat, CorrectionChat } = require("./llm");
const { countSyllables } = require("./syllableCounter");
const fs = require("fs").promises;
const { detectSyllableStress } = require("./meterCheck");

const targetSyllablePattern = [10];
const meter = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
const lineLimit = 16;

/**
 * Generates a set of lyrics using a language model.
 * @async
 * @function generateLyrics
 * @returns {Promise<string[]>} A promise that resolves to an array of lyrics lines.
 * @throws Will throw an error if the language model interaction fails.
 */
async function generateRawLyrics() {
  const chat = await Chat({
    lineLimit,
    targetSyllables:
      targetSyllablePattern.length > 1
        ? targetSyllablePattern.join(" or ")
        : targetSyllablePattern[0],
    meter,
  });
  const lyrics = chat.choices[0].message.content
    .split("\n")
    .filter((e) => e.length > 0)
    .map((e) => e.trim());
  return lyrics;
}

function hammingDistance(meter1, meter2) {
  // Ensure both meters are of the same length
  if (meter1.length !== meter2.length) {
    return 10;
  }

  // Initialize the Hamming distance
  let distance = 0;

  // Calculate the Hamming distance
  for (let i = 0; i < meter1.length; i++) {
    if (meter1[i] !== meter2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Corrects a lyric line to match the target syllable count.
 * @async
 * @param {string} lyric - The input lyric line.
 * @param {number} targetSyllables - The target syllable count.
 * @returns {Promise<string>} A promise that resolves to the corrected lyric line.
 */
async function correctLyric(lyric, targetSyllables) {
  let syllables = countSyllables(lyric);
  let stress = await detectSyllableStress(lyric);
  let meter = [/* define your meter array here */];
  let meterDistance = hammingDistance(
    meter,
    stress.map((entry) => (entry.stress === "unstressed" ? 0 : 1))
  );

  while (syllables !== targetSyllables && meterDistance >= 1) {
    const correctedLine = await CorrectionChat({
      targetSyllables,
      currentSyllables: syllables,
      lyric,
    });
    const newLyric = correctedLine.choices[0].message.content;
    let newStress = await detectSyllableStress(newLyric);
    syllables = countSyllables(newLyric);
    meterDistance = hammingDistance(
      meter,
      newStress.map((entry) => (entry.stress === "unstressed" ? 0 : 1))
    );

    if (syllables === targetSyllables && meterDistance <= 1) {
      return newLyric.trim();
    }
  }

  return lyric.trim();
}


/**
 * Generates and corrects lyrics lines based on a target syllable pattern and line limit.
 * @async
 * @function generateLyrics
 * @returns {Promise<string[]>} A promise that resolves to an array of corrected lyrics lines.
 * @throws Will throw an error if the language model interaction fails.
 */
async function generateLyrics() {
  const rawLyrics = await generateRawLyrics();
  const finalLyrics = [];

  for (let i = 0; i < rawLyrics.length; i++) {
    const lyric = rawLyrics[i];
    const targetSyllables =
      targetSyllablePattern[i % targetSyllablePattern.length];
    const correctedLyric = await correctLyric(lyric, targetSyllables);
    finalLyrics.push(correctedLyric);
  }

  // Convert finalLyrics array to a string with newline characters
  const finalLyricsString = finalLyrics.join("\n");

  try {
    // Write the final lyrics to a file named 'finalLyrics.txt'
    await fs.writeFile("finalLyrics.txt", finalLyricsString, "utf8");
    console.log("Final lyrics have been written to finalLyrics.txt");
  } catch (err) {
    console.error("Error writing to file", err);
  }

  return finalLyrics;
}

module.exports = { generateLyrics };
