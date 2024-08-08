import { UserPrompts } from "../types";

export const USER_PROMPTS: UserPrompts = {
  VERSE: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""}
      As a hit-making songwriter, compose ${lineLimit} lines of catchy, accessible verse lyrics that will have listeners singing along in no time. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Use your verses to bring the story to life, letting characters share their feelings, or highlight the song's main idea in a fun, relatable way. Paint pictures with your words, using comparisons and clever turns of phrase to draw people in and make them feel like they're right there in the song. Rhymes, internal rhymes, and other poetic tricks can make your verses even catchier and more memorable. Each verse should build on the last, adding new meaning and keeping things interesting from start to finish. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Return only the lyrics of the new verse, with each line ending in a newline.`,
    };
  },
  CHORUS: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${
       songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""
     } As an accomplished songwriter, compose a captivating, catchy, and memorable chorus consisting of ${lineLimit} lines. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Craft your chorus lyrics to be the emotional and thematic centerpiece of the song, using powerful imagery, figurative language, and catchy phrasing to create a hook that resonates with listeners and encourages them to sing along. Consider incorporating rhyme, repetition, and other lyrical techniques to enhance the impact and memorability of the chorus. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Do not return anything but the lyrics of the new chorus, with each line ending in a newline.`,
    };
  },
  BRIDGE: ({ lineLimit, meterString, songTitle, songDescription, rhymeScheme }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${
       songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""
     } As a skilled songwriter, compose a compelling bridge section with ${lineLimit} lines that adds depth, a fresh perspective, or an unexpected twist to the song's narrative. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Use your bridge to introduce a new melodic or lyrical idea, a shift in emotional tone, or a surprising revelation that complements the verses and chorus while maintaining the song's overall theme. Employ creative wordplay, vivid imagery, and evocative language to engage the listener and create a memorable moment in the song. The bridge should serve as a natural transition between the chorus and the final verse or outro, seamlessly connecting the song's various elements. Please follow this rhyme scheme: ${rhymeScheme} Provide only the bridge lyrics, with each line ending in a newline character, ensuring clarity in the structure and flow of the bridge section.`,
    };
  },
  INTRO: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""}
      As an innovative songwriter, create an engaging intro of ${lineLimit} lines that sets the tone for the entire song. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Craft an opening that immediately captures the listener's attention and introduces the song's theme or mood. Use vivid imagery, intriguing questions, or a powerful statement to draw the audience in. The intro should seamlessly lead into the first verse or chorus, creating anticipation for what's to come. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Return only the lyrics of the intro, with each line ending in a newline.`,
    };
  },
  OUTRO: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""}
      As a seasoned songwriter, compose a memorable outro of ${lineLimit} lines that provides a satisfying conclusion to the song. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Create an ending that reinforces the song's main message, resolves any tension, or leaves a lasting impression on the listener. Consider using repetition, a final powerful statement, or a twist on earlier lyrics to bring the song full circle. The outro should feel like a natural and impactful way to close the song. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Return only the lyrics of the outro, with each line ending in a newline.`,
    };
  },
  ARBITRARY: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    arbitraryPrompt,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""}
      As a versatile songwriter, create a ${arbitraryPrompt} section for this song with ${lineLimit} lines. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Craft lyrics that fit the specific needs of a ${arbitraryPrompt}, considering its placement and function within the song structure. Use your creativity to enhance the overall composition, whether it's adding depth, creating a transition, or introducing a new element to the song. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Return only the lyrics of the ${arbitraryPrompt} section, with each line ending in a newline.`,
    };
  },
  PRECHORUS: ({
    lineLimit,
    meterString,
    restOfSong,
    songTitle,
    songDescription,
    rhymeScheme
  }) => {
    return {
      role: "user",
      content: `${songTitle.length > 0 ? `SONG TITLE: ${songTitle}` : ""}
     ${songDescription.length > 0 ? `SONG DESCRIPTION: ${songDescription}` : ""}
      As an expert songwriter, craft a compelling pre-chorus section of ${lineLimit} lines that builds anticipation and smoothly transitions from the verse to the chorus. Each line should follow the prescribed meter, where 0 is an unstressed syllable and 1 is stressed. ${meterString} Use this pre-chorus to elevate the emotional intensity, introduce a new lyrical or melodic element, or provide a subtle shift in perspective that sets up the chorus. Employ techniques such as rising tension, dynamic wordplay, or a change in rhythmic patterns to create momentum and excitement. The pre-chorus should leave listeners eagerly anticipating the chorus while maintaining coherence with the overall theme and style of the song. Please follow this rhyme scheme: ${rhymeScheme}${
        restOfSong.length > 1
          ? ` Here is the rest of the song for context: ${restOfSong
              .map((component) => {
                return [component.component, ...component.lyrics];
              })
              .join("\n")}`
          : ""
      } Return only the lyrics of the new pre-chorus, with each line ending in a newline.`,
    };
  },
};