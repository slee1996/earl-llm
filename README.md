# Lyric Generation using LLMs

Earl is an innovative system that leverages Large Language Models (LLMs) to generate song lyrics with sophisticated prosodic constraints. The system goes beyond simple rhyme schemes, incorporating complex elements of rhythm, meter, and phonetic structure into its generated lyrics.

## Key Features

1. Prosodic Constraint Generation: Earl can produce lyrics that adhere to specific prosodic requirements, such as syllable count, stress patterns, and phonetic structures. These constraints ensure that the generated lyrics fit seamlessly with intended musical compositions.
2. Song Structure Analysis: The system is capable of analyzing the structure of existing songs, including verse-chorus patterns, line lengths, and rhyme schemes. This analysis can then be used as a template for generating new lyrics that mirror the structure of the original song.
3. Flexible Prompting System: Users can communicate their desired constraints and stylistic preferences through a robust prompting system. This allows for fine-grained control over the generated output, enabling users to specify elements like theme, mood, vocabulary, and more.
4. Constraint Enforcement Module: Earl incorporates a specialized constraint module that works in tandem with the LLM. This module evaluates each generated line of lyrics against the specified prosodic constraints. If a line fails to meet the requirements, the system automatically prompts the LLM to regenerate that line until it satisfies all constraints.
5. Iterative Refinement: The combination of the LLM and the constraint module allows for an iterative approach to lyric generation. This process ensures that the final output not only meets the technical requirements but also maintains coherence and artistic quality.
6. Customizable Output: Earl can be tailored to produce lyrics in various styles, from traditional song structures to more experimental forms, making it versatile for different musical genres and artistic visions.

By combining the creative power of Large Language Models with strict prosodic control, Earl represents a significant advancement in AI-assisted songwriting and lyric composition.

## Installation and Running

1. Clone the repository:

   ```bash
   git clone https://github.com/slee1996/earl-llm.git
   cd earl-llm
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Make sure that `espeak` is installed. Install via Homebrew if not installed yet: https://formulae.brew.sh/formula/espeak. (This project may not work on windows or linux systems.)

4. Run `npm run start:dev`. This will launch the dev server at http://localhost:4000/

### Main Script

The main script `server.ts` launches an Express app serving the following endpoints:

1. `/generate-song` - This generates a song based on an array of songComponents with no enforcement mechanisms used beyond prompt engineering. [/generate-song API Documentation](src/api/generate-song-README.md)

2. `/generate-song-with-enforcement` - Generates a song in the same process as the first endpoint, but applies a set of enforcement mechanisms to it. It will run in a loop until it satisfies the meter restrictions applied to it. TODO: add docs for this

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/slee1996/earl-gpt/tree/main?tab=MIT-1-ov-file) file for details.

## Acknowledgements

- [phonemize](https://www.npmjs.com/package/phonemize) for phoneme conversion.
- Language Learning Models (GPT-4o is the default option) for providing chat and correction functionalities.
