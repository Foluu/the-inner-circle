document.addEventListener("DOMContentLoaded", () => {
  console.log("[INIT] DOM fully loaded");

  const socket = io("https://the-inner-circle-rad8.onrender.com"); // Prod endpoint
  let currentSpaceId = null;

  // Cache elements
  const bubbleArea  = document.getElementById("bubbleArea");
  const bubbleInput = document.getElementById("bubbleInput");
  const sendBtn     = document.getElementById("send-btn");
  const spaceList   = document.querySelector(".space-list");
  const spaceTitle  = document.getElementById("spaceTitle");

  // Helper: check token presence
  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[AUTH] Missing token — requests may fail");
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // Load spaces and populate sidebar


  async function loadSpaces() {
    console.log("[SPACES] Loading spaces...");
    try {
      const res = await fetch("https://the-inner-circle-rad8.onrender.com/spaces", {
        method: "GET",
        headers: getAuthHeaders()
      });
      const spaces = await res.json();
      console.log("[SPACES] Fetched:", spaces);

      spaceList.innerHTML = ""; // Clear sidebar before re-render





      for (const space of spaces) {
        // Fetch bubble count separately
        
        const bubblesRes = await fetch(`https://the-inner-circle-rad8.onrender.com/bubbles/${space._id}`, {
          method: "GET",
          headers: getAuthHeaders()
        });
        const bubbles = await bubblesRes.json();
        console.log(`[SPACES] ${space.name} has ${bubbles.length} bubbles`);



        // Create space list item
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="icon"><i class="fas fa-users"></i></span> 
          ${space.name}
          <span class="count">${bubbles.length}</span>
        `;
        li.title = space.description || "No description available";
        li.addEventListener("click", () => joinSpace(space._id, space.name));
        spaceList.appendChild(li);
      }
    } catch (err) {
      console.error("[SPACES] Failed to load spaces:", err);q
    }
  }




  // Join a specific space
  function joinSpace(spaceId, name) {
    console.log(`[SPACES] Joining space: ${name} (${spaceId})`);
    if (currentSpaceId) {
      console.log(`[SPACES] Leaving previous space: ${currentSpaceId}`);
      socket.emit("leave-space", currentSpaceId);
    }

    currentSpaceId = spaceId;
    socket.emit("join-space", spaceId);

    if (spaceTitle) {
      spaceTitle.textContent = name;
    }

    loadBubbles(spaceId);
  }



  // Render a single bubble in the UI

  function renderBubble(b) {
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "bubble";

    bubbleEl.innerHTML = `
      <div class="bubble-content">
        <strong>${b.sender?.name || b.user || "Unknown"}</strong>
        <p>${b.content}</p>
       <span class="timestamp">${ new Date(b.createdAt || b.timestamp).toLocaleTimeString() }</span>
      </div>
    `;

    bubbleArea.appendChild(bubbleEl);
    bubbleArea.scrollTop = bubbleArea.scrollHeight;
  }


  // Load all bubbles for a given space

  async function loadBubbles(spaceId) {
    console.log(`[BUBBLES] Loading bubbles for space ${spaceId}`);
    bubbleArea.innerHTML = ""; // Clear previous messages

    try {
      const res = await fetch(`https://the-inner-circle-rad8.onrender.com/bubbles/${spaceId}`, {
        method: "GET",
        headers: getAuthHeaders()
      });

      const data = await res.json();

      console.log(`[BUBBLES] Fetched data for space ${spaceId}:`, data);
      console.log(`[BUBBLES] Received ${data.length} bubbles`);

      data.forEach(renderBubble);


    } catch (err) {
      console.error("[BUBBLES] Failed to load bubbles:", err);
    }
  }



  // Send a bubble

  sendBtn.addEventListener("click", () => {
    const text = bubbleInput.value.trim();

    if (!text) {
      console.warn("[SEND] No text entered");
      return;
    }

    if (!currentSpaceId) {
      console.warn("[SEND] No space selected");
      return;
    }

    const id   = (localStorage.getItem("user-id") || "").trim();
    const name = (localStorage.getItem("user-name") || "").trim();

    if (!id || !name) {
      console.warn("[SEND] Missing user info in localStorage");
    }

    const bubbleData = {
      spaceId   : currentSpaceId,
      content   : text,
      sender    : id,
      user      : name,
      timestamp : new Date().toISOString()
    };

    console.log("[SEND] Emitting bubble:", bubbleData);
    socket.emit("send-bubble", bubbleData);

    bubbleInput.value = ""; // Clear input
  });

  // Real-time listener for new bubbles

  socket.on("receive-bubble", (bubble) => {
    console.log("[SOCKET] Received bubble:", bubble);

    if (bubble.spaceId === currentSpaceId) {
      renderBubble(bubble);
    }
  });

  // Enter key sends message
  bubbleInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      console.log("[INPUT] Enter key pressed");
      sendBtn.click();
    }
  });


  // Load spaces on init
  loadSpaces();


  // Voice recognition setup
  (() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[VOICE] Speech Recognition API not supported");
      return;
    }

    const micBtn = document.getElementById("dictate-btn");
    if (!micBtn) {
      console.warn("[VOICE] Mic button not found");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.continuous = false;
    recog.maxAlternatives = 1;

    micBtn.addEventListener("click", () => {
      if (micBtn.classList.contains("listening")) {
        console.log("[VOICE] Stopping recognition");
        recog.stop();
      } else {
        console.log("[VOICE] Starting recognition");
        recog.start();
      }
    });

    recog.onstart = () => micBtn.classList.add("listening");
    recog.onend   = () => micBtn.classList.remove("listening");

    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      console.log("[VOICE] Transcript:", transcript);
      if (!transcript) return;

      bubbleInput.value = bubbleInput.value
        ? bubbleInput.value + " " + transcript
        : transcript;
    };

    recog.onerror = (e) => {
      console.error("[VOICE] Recognition error:", e.error);
    };


  })();








});
