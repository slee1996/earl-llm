const { phonemize } = require("phonemize");
const { Chat, CorrectionChat } = require("./llm");

function countSyllables(text) {
  const sanitizedText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
  const phonemes = phonemize(sanitizedText);
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

const targetSyllablePattern = [7, 4];
const lineLimit = 6;

async function chatWithLLM() {
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

chatWithLLM();
