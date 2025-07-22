
document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:3000"); // Change in prod

  let currentSpaceId = null;


  // Elements
    const bubbleArea = document.getElementById("bubbleArea");
    const bubbleInput = document.getElementById("bubbleInput");
    const sendBtn = document.getElementById("send-btn");
    const spaceList = document.querySelector(".space-list");
    const spaceTitle = document.getElementById("spaceTitle");



  // Fetch spaces and populate sidebar
  async function loadSpaces() {
  const res = await fetch("http://localhost:3000/spaces", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}` // Include token for auth
    }
  });
  const spaces = await res.json();
    // Clear previous
  spaceList.innerHTML = ""; 


  for (const space of spaces) {

    // Fetch bubble count separately

    const bubblesRes = await fetch(`http://localhost:3000/bubbles/${space._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // Include token for auth
      }
    });

    const bubbles = await bubblesRes.json();

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="icon"><i class="fas fa-users"></i></span> 
      ${space.name}
      <span class="count">${bubbles.length}</span>
    `;
    li.title = space.description || "No description available";

    li.addEventListener("click", () => joinSpace(space._id, space.name));
    spaceList.appendChild(li);
  }}




  // Join selected space
  function joinSpace(spaceId, name) {
  if (currentSpaceId) {
    socket.emit("leave-space", currentSpaceId);
  }

  currentSpaceId = spaceId;
  socket.emit("join-space", spaceId);

  const spaceTitle = document.getElementById("spaceTitle");
  if (spaceTitle) {
    spaceTitle.innerHTML = name;
  }

  loadBubbles(spaceId);
  }


  // Render a single bubble

      function renderBubble(b) {
      const bubbleEl = document.createElement("div");

      bubbleEl.className = "bubble";

      bubbleEl.innerHTML = `
        <div class="bubble-content">
          <strong>${b.sender?.name || b.user || "Unknown"}</strong>
          <p>${b.content}</p>
          <span class="timestamp">${new Date(b.timestamp).toLocaleTimeString()}</span>
        </div>
      `;

      bubbleArea.appendChild(bubbleEl);
      bubbleArea.scrollTop = bubbleArea.scrollHeight;
    }


  // Load previous bubbles from backend
  async function loadBubbles(spaceId) {
  bubbleArea.innerHTML = ""; // Clear previous

  try {
    const res = await fetch(`http://localhost:3000/bubbles/${spaceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // Include token for auth
      }
    });

    const data = await res.json();
    data.forEach(renderBubble);
  } catch (err) {
    console.error("Error loading bubbles:", err);
  }
}


  // Send a bubble
    sendBtn.addEventListener("click", () => {
      const text = bubbleInput.value.trim();
      if (!text || !currentSpaceId) return;

      const id = localStorage.getItem("user-id").trim();
      const name = localStorage.getItem("user-name").trim();

      const bubbleData = {
        spaceId : currentSpaceId,
        content : text,     // ← use “content”
        sender  : id,      // ← ObjectId
        user    : name,     // ← keep for UI
        timestamp: new Date().toISOString()
      };

      console.log("bubbleData:", bubbleData);
      
      socket.emit("send-bubble", bubbleData);      // emit only once
      bubbleInput.value = "";                      // clear input field after sending

      // renderBubble({         
      //   sender : { name },
      //   content: text,
      //   timestamp: bubbleData.timestamp
      // });

    });



// Real-time bubble listener
socket.on("receive-bubble", (bubble) => {
  if (bubble.spaceId === currentSpaceId) {
    renderBubble(bubble);
  }
});


  // Initial space load
  loadSpaces();

  bubbleInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
  });




// Voice recognition setup

(() => {
  // Browser support check
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech Recognition API not supported in this browser.");
    return;
  }

  // Elements
  const micBtn   = document.getElementById("dictate-btn");
  const msgInput = document.getElementById("bubbleInput");
  const sendBtn  = document.getElementById("send-btn");

  // Instantiate recognition
  const recog = new SpeechRecognition();
  recog.lang = "en-US";
  recog.interimResults = false;
  recog.continuous = false;      // finish automatically after one utterance
  recog.maxAlternatives = 1;

  // Toggle start/stop
  micBtn.addEventListener("click", () => {
    if (micBtn.classList.contains("listening")) {
      recog.stop();
    } else {
      recog.start();
    }
  });

  // UI feedback
  recog.onstart = () => micBtn.classList.add("listening");
  recog.onend   = () => micBtn.classList.remove("listening");

  // Capture result
  recog.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim();
    if (!transcript) return;

    // If input already has text, append; else replace
    msgInput.value = msgInput.value
      ? msgInput.value + " " + transcript
      : transcript;

    // Optional: auto‑send right away
    // sendBtn.click();
  };

  recog.onerror = (e) => {
    console.error("Speech recognition error:", e.error);
  };
})();







});
