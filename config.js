import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";



console.log("MONGO_URI loaded:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));


