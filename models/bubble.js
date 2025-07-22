import mongoose from "mongoose";

const bubbleSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: String,
  pinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

const Bubble = mongoose.model("Bubble", bubbleSchema);
export default Bubble;
