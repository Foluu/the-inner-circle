import express from "express";
import Space from "../models/space.js"; 
import authMiddleware, { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @route   POST /space/create
 * @desc    Create a new Space
 * @access  Private
 */




router.post("/create", verifyToken, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Name and description are required." });
  }

  try {
    const newSpace = new Space({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await newSpace.save();
    res.status(201).json({ message: "Space created", space: newSpace });
  } catch (err) {
    res.status(500).json({ message: "Failed to create Space", error: err.message });
  }
});




/**
 * @route   POST /space/join/:spaceId
 * @desc    Join an existing Space
 * @access  Private
 */



router.post("/join/:spaceId", verifyToken, async (req, res) => {
  try {
    const space = await Space.findById(req.params.spaceId);
    if (!space) return res.status(404).json({ message: "Space not found" });

    const userId = req.user.id;
    if (!space.members.includes(userId)) {
      space.members.push(userId);
      await space.save();
    }

    res.status(200).json({ message: "Joined Space", space });
  } catch (err) {
    res.status(500).json({ message: "Failed to join Space", error: err.message });
  }
});



/**
 * @route   GET /space/
 * @desc    Get all Spaces the user belongs to
 * @access  Private
 */


router.get("/", verifyToken, async (req, res) => {
  try {
    const spaces = await Space.find({ members: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(spaces);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Spaces", error: err.message });
  }
});



/**
 * @route   GET /space/all
 * @desc    Get ALL spaces in the database
 * @access  Private (or make it public if needed)
 */


router.get("/all", verifyToken, async (req, res) => {
  try {
    const spaces = await Space.find().sort({ createdAt: -1 }).populate("createdBy", "name");
    res.status(200).json(spaces);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all Spaces", error: err.message });
  }
});




export default router;
