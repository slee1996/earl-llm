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

### Main Script

The main script `index.js` launches an Express app serving the following endpoints:
1. `/generate-song` - This generates a song based on an array of songComponents with no enforcement mechanisms used beyond prompt engineering. A songComponent is an object in this shape: 
```
{
   lineLimit: Number, //determines how many lines will be generated
   meter: Array<Array<Number>>, //an array of arrays, the inner arrays are arrays of 1s and 0s. 1s represent a stressed syllable, 0s represent an unstressed syllable. The length of the inner arrays also determines the number of syllables to be generated per line.
   selectedSystemPrompt: String,
   selectedUserPrompt: String,
}
```
(You can view the possible system and user prompts in the constants/index file)
2. `/generate-song-with-enforcement` - Generates a song in the same process as the first endpoint, but applies a set of enforcement mechanisms to it. It will run in a loop until it satisfies the meter restrictions applied to it.

## Running the Script

To run the script, use the following command:

```bash
npm run dev
```

This will launch the dev server at http://localhost:4000/.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/slee1996/earl-gpt/tree/main?tab=MIT-1-ov-file) file for details.

## Acknowledgements

- [phonemize](https://www.npmjs.com/package/phonemize) for phoneme conversion.
- Language Learning Model for providing chat and correction functionalities.
