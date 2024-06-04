const { Chat, CorrectionChat } = require("./llm");
const { countSyllables } = require("./syllableCounter");
const fs = require("fs").promises;
const { parseLine } = require("./meterCheck");

const meter = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
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
    targetSyllables: meter.length,
    meter,
  });
  const lyrics = chat.choices[0].message.content
    .split("\n")
    .filter((e) => e.length > 0)
    .map((e) => e.trim());
  return lyrics;
}

function hammingDistance(meter1, meter2) {
  let distance = 0;

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
  console.log(targetSyllables, lyric);
  try {
    let parsedLyric = await parseLine(lyric);
    let syllables = parsedLyric.reduce(
      (sum, item) => sum + item.syllableCount,
      0
    );
    let stress = parsedLyric.flatMap((i) => i.syllableStress);

    let meterDistance = hammingDistance(meter, stress);

    while (syllables !== targetSyllables && meterDistance > 3) {
      const correctedLine = await CorrectionChat({
        targetSyllables,
        currentSyllables: syllables,
        lyric,
        meter,
      });
      const newLyric = correctedLine.choices[0].message.content;
      let newStress = await parseLine(newLyric);
      const newSyllables = parsedLyric.reduce(
        (sum, item) => sum + item.syllableCount,
        0
      );
      const newMeterDistance = hammingDistance(meter, newStress);

      if (newSyllables === targetSyllables && newMeterDistance <= 3) {
        return newLyric.trim();
      }
    }

    return lyric.trim();
  } catch (err) {
    console.log(err);
  }
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
  await fs.writeFile("rawLyrics.txt", rawLyrics.join("\n"), "utf8");
  const finalLyrics = [];

  for (let i = 0; i < rawLyrics.length; i++) {
    const lyric = rawLyrics[i];
    const correctedLyric = await correctLyric(lyric, meter.length);

    finalLyrics.push(correctedLyric);
  }

  const finalLyricsString = finalLyrics.join("\n");

  try {
    await fs.writeFile("finalLyrics.txt", finalLyricsString, "utf8");
    console.log("Final lyrics have been written to finalLyrics.txt");
  } catch (err) {
    console.error("Error writing to file", err);
  }

  return finalLyrics;
}

module.exports = { generateLyrics };
