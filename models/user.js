

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "/images/default-avatar.png" },
  spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Space" }],
}, { timestamps: true });


// This code defines a Mongoose schema for a User model with fields for name, email, and password.

export default mongoose.model("User", UserSchema);


