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
    const userId = req.user.id;

    const newSpace = new Space({
      name,
      description,
      createdBy: userId,
      members: [userId],
      admins: [userId], //  creator is an admin
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



/**
 * @route   GET /space/user-admin
 * @desc    Get all Spaces the user is an admin of
 * @access  Private
 */


router.get("/user-admin", verifyToken, async (req, res) => {
  try {
    const spaces = await Space.find({ admins: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(spaces);
  } catch (err) {
    res.status(500).json({ message: "Failed to find any admined Spaces", error: err.message });
  }
});





/**
 * @route   POST /space/:spaceId/request-join
 * @desc    Request to join a Space
 * @access  Private
 */
router.post("/:spaceId/request-join", verifyToken, async (req, res) => {
  try {
    const space = await Space.findById(req.params.spaceId);
    if (!space) return res.status(404).json({ message: "Space not found" });

    const userId = req.user.id;

    if (space.members.includes(userId)) {
      return res.status(400).json({ message: "You're already a member of this Space." });
    }

    if (space.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "You already requested to join this Space." });
    }

    space.joinRequests.push(userId);
    await space.save();

    res.status(200).json({ message: "Join request sent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send join request", error: err.message });
  }
});






/**
 * @route   POST /spaces/:spaceId/approve-request/:userId
 * @desc    Admin approves a user's request to join the space
 * @access  Private (admin only)
 */
router.post("/:spaceId/approve-request/:userId", verifyToken, async (req, res) => {
  try {
    const { spaceId, userId } = req.params;
    const adminId = req.user.id;

    const space = await Space.findById(spaceId);
    if (!space) return res.status(404).json({ message: "Space not found." });

    // Check if adminId is in the space's admins
    if (!space.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only admins can approve join requests." });
    }

    // Check if userId actually requested to join
    if (!space.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "User has not requested to join." });
    }

    // Add to members, remove from joinRequests
    space.members.push(userId);
    space.joinRequests = space.joinRequests.filter(id => id.toString() !== userId);
    await space.save();

    res.status(200).json({ message: "User added to space." });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve request", error: err.message });
  }
});



router.post("/:spaceId/reject-request/:userId", verifyToken, async (req, res) => {
  try {
    const { spaceId, userId } = req.params;
    const adminId = req.user.id;

    const space = await Space.findById(spaceId);
    if (!space) return res.status(404).json({ message: "Space not found." });

    if (!space.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only admins can reject join requests." });
    }

    if (!space.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "User has not requested to join." });
    }

    space.joinRequests = space.joinRequests.filter(id => id.toString() !== userId);
    await space.save();

    res.status(200).json({ message: "Join request rejected." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject request", error: err.message });
  }
});




/**
 * @route   GET /spaces/:spaceId/requests
 * @desc    Get pending join requests for a space
 * @access  Private (admins only)
 */
router.get("/:spaceId/requests", verifyToken, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const adminId = req.user.id;

    const space = await Space.findById(spaceId).populate("joinRequests", "name email avatar");
    if (!space) return res.status(404).json({ message: "Space not found." });

    // Only admins can view requests
    if (!space.admins.includes(adminId)) {
      return res.status(403).json({ message: "Only admins can view join requests." });
    }

    res.status(200).json({ pendingRequests: space.joinRequests });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve join requests", error: err.message });
  }
});















export default router;
