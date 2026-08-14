
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import Bubble from "../models/bubble.js";
import Space from "../models/space.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

// Multer storage configuration for chat attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/chat";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max limit
});

// Upload attachment endpoint
router.post("/:spaceId/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const space = await Space.findById(req.params.spaceId);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

    const mediaUrl = `/uploads/chat/${req.file.filename}`;
    res.status(201).json({
      mediaUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload file", error: err.message });
  }
});


// Send a Bubble
router.post("/:spaceId", verifyToken, async (req, res) => {
  const { content, mediaUrl } = req.body;

  try {
    const space = await Space.findById(req.params.spaceId);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bubble = new Bubble({
      sender: req.user.id,
      space: req.params.spaceId,
      content: content || "",
      mediaUrl,
    });


    await bubble.save();
    res.status(201).json(bubble);
  } catch (err) {
    res.status(500).json({ message: "Failed to send Bubble", error: err.message });
  }
});


// Get Bubbles in a Space

router.get("/:spaceId", verifyToken, async (req, res) => {
  try {
    const { spaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(spaceId)) {
      return res.status(400).json({ message: "Invalid space ID" });
    }

    const space = await Space.findById(spaceId);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bubbles = await Bubble.find({ space: spaceId }).sort({ createdAt: 1 }).populate("sender", "name");

    res.status(200).json(bubbles);

  } catch (err) {
    console.error("[BUBBLES] Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch Bubbles", error: err.message });
  }

});

export default router;
