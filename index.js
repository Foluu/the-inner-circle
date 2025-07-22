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
import Bubble from "./models/Bubble.js";
import Space from "./models/Space.js";


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


// Socket.io handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);



  socket.on("join-space", (spaceId) => {
    socket.join(spaceId);
    console.log(`User joined space: ${spaceId}`);
  });

        socket.on("send-bubble", async (data) => {
    try {
      const saved = await new Bubble({
        sender   : data.sender,      // ObjectId
        space    : data.spaceId,
        content  : data.content,
        expiresAt: Date.now() + 86_400_000
      }).save();

      const populated = await saved.populate("sender", "name");

      io.to(data.spaceId).emit("receive-bubble", {
        spaceId : data.spaceId,
        content : populated.content,
        sender  : { name: populated.sender.name },
        timestamp: populated.createdAt
      });
      
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
