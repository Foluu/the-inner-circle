import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  
});


// This code defines a Mongoose schema for a User model with fields for name, email, and password.

export default mongoose.model("User", UserSchema);


