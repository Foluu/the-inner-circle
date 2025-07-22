
import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; 
import authMiddleware from "../middleware/authMiddleware.js";




const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // const userExists = await User.findOne({ email });
    // if (userExists){
    //   return res.status(400).json({ message: "User already exists" })
    // };
    const hashedPassword = await bcrypt.hash(password, 10);
   

    const newUser =  User.create({
        
      name: name,
      email: email,
      password: hashedPassword
   
    });
  
   
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }

});



// LOGIN---- The server messages have been modified.

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
     if (!user)
       return res.status(404).json({ message: "That user was kidnaped" });

     const isMatch = await bcrypt.compare(password, user.password);

     if (!isMatch)
     return res.status(400).json({ message: "Ole!, commot for here" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server blew up bruh", error: err.message });
  }
});



router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;  