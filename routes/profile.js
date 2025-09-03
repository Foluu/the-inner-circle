
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/user.js";
import { verifyToken } from "../middleware/authMiddleware.js";



const router = express.Router();



// Storage configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});



// File filter: accept only .jpeg and .png
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only JPEG or PNG images are allowed"));
};

const upload = multer({ storage, fileFilter });



// @route GET /profile/:userId
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: "spaces",
        select: "name description members bubbles avatar",
      })
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});




// @route PUT /profile/:userId
router.put("/:userId", verifyToken, upload.single("avatar"), async (req, res) => {
  const { name, username, bio } = req.body;

  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    const updateData = { name, username, bio };
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});





export default router;
