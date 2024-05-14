const { phonemize } = require("phonemize");
const { Chat, CorrectionChat } = require("./llm");

function countSyllables(text) {
  const phonemes = phonemize(text);
  console.log(`Text: ${text}`);
  console.log(`Phonemes: ${phonemes}`);

  let syllableCount = 0;
  const vowelClusterRegex = /[aeiouɑɔɛəɨʌɪʊæ]+/gi;

  phonemes.split(" ").forEach((word) => {
    const clusters = word.match(vowelClusterRegex);
    if (clusters) {
      console.log(clusters);
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

    while (syllables !== targetSyllables) {
      const correctedLine = await CorrectionChat({
        targetSyllables,
        currentSyllables: syllables,
        lyric,
      });
      syllables = countSyllables(correctedLine.choices[0].message.content);
      if (syllables === targetSyllables) {
        finalLyrics.push(correctedLine.choices[0].message.content);
      }
    }
  }
  console.log(finalLyrics);
  return finalLyrics;
}

chatWithLLM();
