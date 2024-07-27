require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { generateRawLyrics } = require("./lib/lyric-generation");
const {
  generateSong,
  generateSongWithEnforcement,
} = require("./api/endpoints");

const app = express();

// Define allowed origins
const allowedOrigins = [
  "https://earl-fe.vercel.app",
  "http://localhost:3000",
  "https://www.ontologic.nexus/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
