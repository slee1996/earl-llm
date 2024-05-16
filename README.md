# Lyric Correction using LLM

This project corrects the syllable count of lyrics using a Language Learning Model (LLM). It ensures that each line of the lyrics has the target number of syllables.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/slee1996/earl-gpt.git
   cd earl-gpt
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

## Running the Script

To run the script, use the following command:

```bash
node index.js
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/slee1996/earl-gpt/tree/main?tab=MIT-1-ov-file) file for details.

## Acknowledgements

- [phonemize](https://www.npmjs.com/package/phonemize) for phoneme conversion.
- Language Learning Model for providing chat and correction functionalities.
