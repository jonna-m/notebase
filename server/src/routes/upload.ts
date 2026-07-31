import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { deleteSource, saveSource } from "../store.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export const uploadRouter = Router();

const TEXT_EXTENSIONS = new Set([".txt", ".md"]);

uploadRouter.post("/", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file was uploaded." });
    return;
  }

  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".pdf") {
    const sourceId = saveSource({
      type: "pdf",
      filename: file.originalname,
      data: file.buffer.toString("base64"),
    });
    res.json({ sourceId, filename: file.originalname, type: "pdf" });
    return;
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    const sourceId = saveSource({
      type: "text",
      filename: file.originalname,
      content: file.buffer.toString("utf-8"),
    });
    res.json({ sourceId, filename: file.originalname, type: "text" });
    return;
  }

  res.status(415).json({
    error: `"${file.originalname}" isn't supported yet — this version handles plain text (.txt, .md) and PDF (.pdf) files.`,
  });
});

uploadRouter.delete("/:sourceId", (req, res) => {
  const removed = deleteSource(req.params.sourceId);
  if (!removed) {
    res.status(404).json({ error: "Source not found." });
    return;
  }
  res.status(204).end();
});
