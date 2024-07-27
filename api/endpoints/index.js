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
    const { songComponents, songTitle, songDescription, clientChoice } =
      req.body;
    let chorus;
    let orderedLyrics = [];

    for (const [index, component] of songComponents.entries()) {
      const {
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        customSystemPrompt,
      } = component;

      const lyrics = await generateRawLyrics({
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        restOfSong: orderedLyrics,
        customSystemPrompt: customSystemPrompt ?? "",
        songTitle: songTitle ?? "",
        songDescription: songDescription ?? "",
        clientChoice,
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
    const { songComponents, songTitle, songDescription, clientChoice } =
      req.body;
    let chorus;
    let originalChorus;
    let orderedLyrics = [];
    let originalLyrics = [];

    const generateAndCorrectLyrics = async (component, index) => {
      const {
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        customSystemPrompt,
      } = component;

      const lyrics = await generateRawLyrics({
        lineLimit,
        meter,
        selectedSystemPrompt,
        selectedUserPrompt,
        restOfSong: orderedLyrics,
        customSystemPrompt: customSystemPrompt ?? "",
        songTitle: songTitle ?? "",
        songDescription: songDescription ?? "",
        clientChoice,
      });

      const correctedLyrics = await Promise.all(
        lyrics.map(async (lyric, i) => {
          const meterIndex = i % meter.length;
          return await correctLyric({
            lyric,
            targetSyllables: meter[meterIndex].length,
            currentLyrics: orderedLyrics,
            meter: meter[meterIndex],
            selectedSystemPrompt,
          });
        })
      );

      if (selectedUserPrompt.toLowerCase() === "chorus") {
        if (!chorus) {
          chorus = correctedLyrics;
          originalChorus = lyrics;
        }
        orderedLyrics[index] = { component: "chorus", lyrics: chorus };
        originalLyrics[index] = { component: "chorus", lyrics: originalChorus };
      } else {
        orderedLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics: correctedLyrics,
        };
        originalLyrics[index] = {
          component: selectedUserPrompt.toLowerCase(),
          lyrics,
        };
      }
    };

    await Promise.all(songComponents.map(generateAndCorrectLyrics));

    res.status(200).json(orderedLyrics);
  } catch (error) {
    console.error("Error generating song:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the song" });
  }
}

async function correctLyric({
  lyric,
  targetSyllables,
  currentLyrics,
  meter,
  selectedSystemPrompt,
}) {
  try {
    const parseLyric = async (lyric) => {
      const parsed = await parseLine(lyric);
      return {
        syllables: parsed.reduce((sum, item) => sum + item.syllableCount, 0),
        stress: parsed.flatMap((i) => i.syllableStress),
      };
    };

    let { syllables, stress } = await parseLyric(lyric);
    let meterDistance = hammingDistance(meter, stress);
    let newLyric = lyric;
    let newSyllables = syllables;

    while (meterDistance > 0) {
      const correctedLine = await CorrectionChat({
        targetSyllables,
        currentSyllables: newSyllables,
        lyric: newLyric,
        meter,
        currentLyrics,
        selectedSystemPrompt,
      });

      newLyric = correctedLine.choices[0].message.content.trim();
      const parsedLyric = await parseLyric(newLyric);
      newSyllables = parsedLyric.syllables;
      const newStress = parsedLyric.stress;
      meterDistance = hammingDistance(meter, newStress);
    }

    return newLyric;
  } catch (err) {
    console.log(err);
    return lyric.trim();
  }
}

function hammingDistance(intendedMeter, currentMeter) {
  let distance = 0;

  for (let i = 0; i < currentMeter.length; i++) {
    if (intendedMeter[i] !== currentMeter[i]) {
      distance++;
    }
  }

  return distance;
}
