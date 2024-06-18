# Lyric Correction using LLM

This project corrects the syllable count of lyrics using a Language Learning Model (LLM). It ensures that each line of the lyrics has the target number of syllables.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/slee1996/earl-llm.git
   cd earl-llm
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

Here is an example of a body you might send to either endpoint:

```
{
  "songComponents": [
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "VERSE"
    },
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "CHORUS"
    },
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "VERSE"
    },
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "CHORUS"
    },
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "VERSE"
    },
    {
      "lineLimit": 8,
      "meter": [
        [0, 1, 0, 1, 1],
        [0, 1, 0, 1, 0, 1]
      ],
      "selectedSystemPrompt": "popstar",
      "selectedUserPrompt": "CHORUS"
    }
  ]
}
```

And here is the output you might receive:

```
[
    {
        "component": "verse",
        "lyrics": [
            "In moonlight, we find delight,",
            "Stars shine above,",
            "The pulses thump a wild beat,",
            "Enthralled by this true love.",
            "Bright smile, it lights up the night,",
            "Keeps me alive,",
            "In the rush, we found a spark,",
            "Chase the bright light ahead."
        ]
    },
    {
        "component": "chorus",
        "lyrics": [
            "In dark, find light tonight.",
            "(We need no doubt)",
            "Feel the dark night ignite,",
            "shine your inner light,",
            "the waves crash on our hearts,",
            "love’s a work of art,",
            "let our bright dreams collide,",
            "wish on every tide,",
            "the touch of sweet embrace,",
            "join this merry chase,",
        ]
    },
    {
        "component": "verse",
        "lyrics": [
            "We laugh as we're wandering free.",
            "To set our hearts on fire,",
            "Our spirits rise, just one step,",
            "Soaring up high above,",
            "A laugh, how it lights the day,",
            "Forever bound with our fate,",
            ": Joined hand in hand, we paint dawn,",
            "Flee from the gray."
        ]
    },
    {
        "component": "chorus",
        "lyrics": [
            "In dark, find light tonight.",
            "(We need no doubt)",
            "Feel the dark night ignite,",
            "shine your inner light,",
            "the waves crash on our hearts,",
            "love’s a work of art,",
            "let our bright dreams collide,",
            "wish on every tide,",
            "the touch of sweet embrace,",
            "join this merry chase,",
        ]
    },
    {
        "component": "verse",
        "lyrics": [
            "A soft moon guides us back home",
            "Time fades away,",
            "Like storms, their hearts fiercely do beat.",
            "True moments stay anchóred,",
            "In moonlight, our eyes mirror night,",
            "Shining in bright new hues,",
            "We whispered secrets aloud,",
            "Dreams that we always know."
        ]
    },
    {
        "component": "chorus",
        "lyrics": [
            "In dark, find light tonight.",
            "(We need no doubt)",
            "Feel the dark night ignite,",
            "shine your inner light,",
            "the waves crash on our hearts,",
            "love’s a work of art,",
            "let our bright dreams collide,",
            "wish on every tide,",
            "the touch of sweet embrace,",
            "join this merry chase,",
        ]
    }
]
```

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
