const { generateRawLyrics } = require("../../lib/lyric-generation");
const { parseLine } = require("../../meterCheck");
const { CorrectionChat } = require("../../lib/llm");

module.exports = {
  generateSong,
  generateSongWithEnforcement,
};

/**
 * Asynchronously generates a song based on the provided song components and returns the ordered lyrics.
 *
 * @async
 * @function generateSong
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing song components.
 * @param {Array} req.body.songComponents - An array of song components, each containing details for lyric generation.
 * @param {number} req.body.songComponents[].lineLimit - The limit on the number of lines for this component.
 * @param {Array<Array<Number>>} req.body.songComponents[].meter - The meter of the lyrics to be generated. An array of 1s and 0s. 1 corresponds to a stressed syllable, 0 corresponds to an unstressed syllable
 * @param {string} req.body.songComponents[].selectedSystemPrompt - The system prompt for generating lyrics.
 * @param {string} req.body.songComponents[].selectedUserPrompt - The user prompt for generating lyrics.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Responds with a JSON object containing the ordered lyrics or an error message.
 * @throws {Error} Will throw an error if lyric generation fails.
 */
async function generateSong(req, res) {
  try {
    const { songComponents } = req.body;
    let chorus;
    let orderedLyrics = [];

    for (const [index, component] of songComponents.entries()) {
      const { lineLimit, meter, selectedSystemPrompt, selectedUserPrompt } =
        component;

      const lyrics = await generateRawLyrics({
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        restOfSong: orderedLyrics,
      });

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!chorus) {
          chorus = lyrics;
        }
        orderedLyrics[index] = { component: "chorus", lyrics: chorus };
      } else {
        orderedLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics,
        };
      }
    }

    res.status(200).json(orderedLyrics);
  } catch (error) {
    console.error("Error generating song:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the song" });
  }
}

/**
 * Asynchronously generates a song based on the provided song components and returns the ordered lyrics.
 *
 * @async
 * @function generateSongWithEnforcement
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing song components.
 * @param {Array} req.body.songComponents - An array of song components, each containing details for lyric generation.
 * @param {number} req.body.songComponents[].lineLimit - The limit on the number of lines for this component.
 * @param {Array<Array<Number>>} req.body.songComponents[].meter - The meter of the lyrics to be generated. An array of 1s and 0s. 1 corresponds to a stressed syllable, 0 corresponds to an unstressed syllable
 * @param {string} req.body.songComponents[].selectedSystemPrompt - The system prompt for generating lyrics.
 * @param {string} req.body.songComponents[].selectedUserPrompt - The user prompt for generating lyrics.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Responds with a JSON object containing the ordered lyrics or an error message.
 * 
 * @description
 * This function takes song components from the request body, generates raw lyrics for each component,
 * and then corrects the lyrics to match the desired meter and syllable count. If a component is a chorus,
 * it is reused for subsequent chorus components. The final ordered lyrics are sent in the response.
 *
 * @throws {Error} Will throw an error if lyric generation fails.
 */
async function generateSongWithEnforcement(req, res) {
  try {
    const { songComponents } = req.body;
    let chorus;
    let orderedLyrics = [];

    for (const [index, component] of songComponents.entries()) {
      const { lineLimit, meter, selectedSystemPrompt, selectedUserPrompt } =
        component;

      const lyrics = await generateRawLyrics({
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        restOfSong: orderedLyrics,
      });
      const correctedLyrics = [];

      for (let i = 0; i < lyrics.length; i++) {
        const lyric = lyrics[i];
        const correctedLyric = await correctLyric({
          lyric,
          targetSyllables: i % 2 === 0 ? meter[0].length : meter[1].length,
          currentLyrics: orderedLyrics,
          meter: i % 2 === 0 ? meter[0] : meter[1],
          selectedSystemPrompt,
        });
        correctedLyrics.push(correctedLyric);
      }

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!chorus) {
          chorus = correctedLyrics;
        }
        orderedLyrics[index] = { component: "chorus", lyrics: chorus };
      } else {
        orderedLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics: correctedLyrics,
        };
      }
    }

    res.status(200).json(orderedLyrics);
  } catch (error) {
    console.error("Error generating song:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the song" });
  }
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

async function correctLyric({
  lyric,
  targetSyllables,
  currentLyrics,
  meter,
  selectedSystemPrompt,
}) {
  try {
    let parsedLyric = await parseLine(lyric);
    let syllables = parsedLyric.reduce(
      (sum, item) => sum + item.syllableCount,
      0
    );
    let stress = parsedLyric.flatMap((i) => i.syllableStress);

    let meterDistance = hammingDistance(meter, stress);
    let newLyric;
    let newSyllables;

    while (meterDistance > 3) {
      const correctedLine = await CorrectionChat({
        targetSyllables,
        currentSyllables: newSyllables ?? syllables,
        lyric: newLyric ?? lyric,
        meter,
        currentLyrics,
        selectedSystemPrompt,
      });
      newLyric = correctedLine.choices[0].message.content;
      let newParsedLyric = await parseLine(newLyric);
      newSyllables = newParsedLyric.reduce(
        (sum, item) => sum + item.syllableCount,
        0
      );
      let newStress = newParsedLyric.flatMap((i) => i.syllableStress);
      const newMeterDistance = hammingDistance(meter, newStress);

      if (newMeterDistance <= 3) {
        return newLyric.trim();
      }
    }

    return lyric.trim();
  } catch (err) {
    console.log(err);
  }
}
