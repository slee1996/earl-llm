require("dotenv").config();

const express = require("express");
const https = require("https");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const { generateRawLyrics } = require("./lib/lyric-generation");
const {
  generateSong,
  generateSongWithEnforcement,
} = require("./api/endpoints");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 4040;

app.post("/generate-song", generateSong);
app.post("/generate-song-with-enforcement", generateSongWithEnforcement);

app.post("/generate-verse", async (req, res) => {
  const { lineLimit, meter, selectedSystemPrompt, selectedUserPrompt } =
    req.body;
  const lyrics = await generateRawLyrics({
    lineLimit,
    meter,
    selectedSystemPrompt: "popstar",
    selectedUserPrompt: "VERSE",
  });

  res.write(
    JSON.stringify(
      lyrics.choices[0].message.content
        .split("\n")
        .filter((e) => e.length > 0)
        .map((e) => e.trim())
    )
  );

  res.end();
});

app.post("/rewrite-line", async (req, res) => {
  const { lineToRewrite } = req.body;
  res.write(lineToRewrite);
  res.end();
});

app.get("/", async (req, res) => {
  res.send("hello world");
});

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
