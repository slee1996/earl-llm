import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  createSongStructure,
  generateSong,
  generateSongWithEnforcement,
} from "./api/endpoints";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://earl-fe.vercel.app",
  "http://localhost:3000",
  "https://www.ontologic.nexus/",
];

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
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
app.post("/create-song-structure", createSongStructure);

// @ts-expect-error
app.get("/", async (req: Request, res: Response) => {
  if (typeof res.send === "function") {
    res.status(200).json("hello there");
  } else {
    console.error("res.send is not a function");

    res.end("hello world!");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
