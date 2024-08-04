import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { generateSong, generateSongWithEnforcement } from "./api/endpoints";

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

// @ts-expect-error
app.get("/", (req: Request, res: Response) => {
  console.log("Route handler called");
  console.log("res type:", typeof res);
  console.log("res constructor name:", res.constructor.name);
  console.log(
    "res methods:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(res))
  );

  if (typeof res.send === "function") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.send("hello world");
  } else {
    console.error("res.send is not a function");

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("hello world!");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
