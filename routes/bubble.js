
import express from "express";
import mongoose from "mongoose";
import Bubble from "../models/bubble.js";
import Space from "../models/space.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();


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
      content,
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
