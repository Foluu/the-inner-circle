
import express from "express";
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
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hrs
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
    const space = await Space.findById(req.params.spaceId);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bubbles = await Bubble.find({
  space: req.params.spaceId,
  expiresAt: { $gt: Date.now() }
})
  .sort({ createdAt: 1 })
  .populate("sender", "name");  


    res.json(bubbles);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Bubbles", error: err.message });
  }
});



export default router;
