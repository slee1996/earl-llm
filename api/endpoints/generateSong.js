const { generateRawLyrics } = require("../../lib/lyric-generation");

module.exports = {
  generateSong: async (req, res) => {
    try {
      const { songComponents } = req.body;
      let chorus;
      let orderedLyrics = [];

      for (const [index, component] of songComponents.entries()) {
        const { lineLimit, meter, selectedSystemPrompt, selectedUserPrompt } =
          component;

        const response = await generateRawLyrics({
          lineLimit,
          meter,
          selectedSystemPrompt,
          selectedUserPrompt,
          restOfSong: orderedLyrics,
        });

        const lyrics = response.choices[0].message.content
          .split("\n")
          .filter((e) => e.length > 0)
          .map((e) => e.trim());

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
  },
};
