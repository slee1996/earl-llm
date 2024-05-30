const { generateLyrics } = require("./lyricGenerator");

async function index() {
  await generateLyrics();
}

index();
