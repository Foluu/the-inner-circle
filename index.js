

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import authroute from "./routes/auth.js";
import "./config.js";
import spaceRoutes from "./routes/space.js";
import bubbleRoutes from "./routes/bubble.js";
import Bubble from "./models/bubble.js";
import Space from "./models/space.js";
import profileRoutes from "./routes/profile.js";



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: Set proper origin in production
  },
});

app.use(cors());
app.use(express.json());

app.use("/auth", authroute);
app.use("/spaces", spaceRoutes);
app.use("/bubbles", bubbleRoutes);
app.use("/profile", profileRoutes);
app.use("/uploads", express.static("uploads"));
app.use(express.static("src"));

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.get("/home", (req, res) => res.redirect("/home.html"));
app.get("/space", (req, res) => res.redirect("/space.html"));
app.get("/login", (req, res) => res.redirect("/login.html"));
app.get("/signup", (req, res) => res.redirect("/signup.html"));
app.get("/edit-profile", (req, res) => res.redirect("/edit-profile.html"));


// Socket.io handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);



  socket.on("join-space", (spaceId) => {
    socket.join(spaceId);
    console.log(`User joined space: ${spaceId}`);
  });

  socket.on("send-bubble", async (data) => {
    try {
      if (!data || !data.spaceId) {
        console.warn("[SOCKET] Invalid bubble data received:", data);
        return;
      }

      let senderId = data.sender;
      if (!mongoose.Types.ObjectId.isValid(senderId)) {
        senderId = new mongoose.Types.ObjectId();
      }

      const saved = await new Bubble({
        sender   : senderId,
        space    : data.spaceId,
        content  : data.content || "",
        mediaUrl : data.mediaUrl || null,
        expiresAt: Date.now() + 86_400_000
      }).save();

      const populated = await saved.populate("sender", "name");

      const bubblePayload = {
        _id      : saved._id,
        spaceId  : data.spaceId,
        content  : saved.content,
        mediaUrl : saved.mediaUrl,
        sender   : { name: populated?.sender?.name || data.user || "Unknown" },
        createdAt: saved.createdAt
      };

      console.log("[SOCKET] Broadcasting bubble payload:", bubblePayload);
      io.to(data.spaceId).emit("receive-bubble", bubblePayload);

    } catch (err) {
      console.error("Error saving bubble:", err);
    }
  });



  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
