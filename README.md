# Lyric Correction using LLM

This project corrects the syllable count of lyrics using a Language Learning Model (LLM). It ensures that each line of the lyrics has the target number of syllables.

## Prerequisites

- Node.js (v14 or later)
- NPM (v6 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lyric-correction-llm.git
   cd lyric-correction-llm
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

### Function Definitions

- `countSyllables(text)`: This function takes a string of text, phonemizes it, and counts the number of syllables based on vowel clusters.

- `chatWithLLM()`: This asynchronous function interacts with an LLM to correct the syllable count of lyrics. It processes each line of the lyrics to ensure it meets the target syllable count.

### Main Script

The main script `index.js` performs the following steps:
1. Calls the `Chat` function to get the initial lyrics.
2. Splits the lyrics into individual lines and trims them.
3. For each line, counts the syllables and checks if it meets the target syllable count.
4. If the syllable count does not match, it calls `CorrectionChat` to correct the line and rechecks the syllable count.
5. Outputs the final corrected lyrics.

### Example

```javascript
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
```

## Running the Script

To run the script, use the following command:

```bash
node index.js
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [phonemize](https://www.npmjs.com/package/phonemize) for phoneme conversion.
- Language Learning Model for providing chat and correction functionalities.