
// socket.js


const Bubble = require("./models/bubble");

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 A user connected");


    socket.on("join-space", (spaceId) => {
      socket.join(spaceId);
      console.log(`🔗 Joined space: ${spaceId}`);
    });

    
    socket.on("leave-space", (spaceId) => {
      socket.leave(spaceId);
      console.log(`⛔ Left space: ${spaceId}`);
    });


    socket.on("send-bubble", async (data) => {
      try {
        // Save bubble to 
        
        const newBubble = new Bubble({
          spaceId: data.spaceId,
          user: data.user,
          message: data.message,
          timestamp: new Date()
        });

        const saved = await newBubble.save();



        // Emit to everyone else in the same space
        socket.to(data.spaceId).emit("receive-bubble", saved);

        console.log("💬 Bubble saved and broadcasted:", saved);
      } catch (error) {

        console.error("❌ Failed to save bubble:", error);
      }
    });
  });
}

module.exports = setupSocket;
