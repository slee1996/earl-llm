const { phonemize } = require("phonemize");
const { Chat, CorrectionChat } = require("./llm");

function countSyllables(text) {
  const phonemes = phonemize(text);
  let syllableCount = 0;
  const vowelClusterRegex = /[aeiouɑɔɛəɨʌɪʊæ]+/gi;

  phonemes.split(" ").forEach((word) => {
    const clusters = word.match(vowelClusterRegex);
    if (clusters) {
      syllableCount += clusters.length;
    } else {
      console.log(`Word: ${word}, Clusters: none`);
    }
  });

  return syllableCount;
}

const targetSyllables = 8;

async function chatWithLLM() {
  const chat = await Chat();
  let finalLyrics = [];
  const lyrics = chat.choices[0].message.content
    .split("\n")
    .filter((e) => e.length > 0)
    .map((e) => e.trim());

  for (const lyric of lyrics) {
    let syllables = countSyllables(lyric);

    if (syllables === targetSyllables) {
      finalLyrics.push(lyric);
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
          finalLyrics.push(newLyric);
          break;
        }
      }
    }
  }

  console.log(finalLyrics);
  return finalLyrics;
}

chatWithLLM();
