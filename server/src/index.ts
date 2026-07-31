import "dotenv/config";
import express from "express";
import cors from "cors";
import { uploadRouter } from "./routes/upload.js";
import { chatRouter } from "./routes/chat.js";

// A stray rejected promise or write-after-disconnect error should log, not
// take down the whole dev server (and every other in-flight request with it).
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRouter);
app.use("/api/chat", chatRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`thesis-chat server listening on http://localhost:${port}`);
});
