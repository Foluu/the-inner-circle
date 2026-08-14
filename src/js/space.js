


document.addEventListener("DOMContentLoaded", () => {
  console.log("[INIT] DOM fully loaded");

  const isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const SERVER_URL = isLocalHost
    ? (location.port === "3000" ? location.origin : "http://localhost:3000")
    : "https://the-inner-circle-rad8.onrender.com";

  const socket = io(SERVER_URL);
  let currentSpaceId = null;

  // Cache elements
  const bubbleArea  = document.getElementById("bubbleArea");
  const bubbleInput = document.getElementById("bubbleInput");
  const sendBtn     = document.getElementById("send-btn");
  const spaceList   = document.querySelector(".space-list");
  const spaceTitle  = document.getElementById("spaceTitle");
  const attachBtn   = document.getElementById("attach-btn");
  const fileInput   = document.getElementById("fileInput");
  const filePreviewBar = document.getElementById("filePreviewBar");
  let selectedFile  = null;

  // Helper: escape HTML
  function escapeHtml(text) {
    if (typeof text !== "string") return text || "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // File Attachment Handling
  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      selectedFile = file;
      renderFilePreview(file);
    });
  }

  // Clipboard Paste Support (Ctrl+V Image/File)
  if (bubbleInput) {
    bubbleInput.addEventListener("paste", (e) => {
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            selectedFile = file;
            renderFilePreview(file);
            if (typeof Toast !== "undefined") Toast.info("File attached from clipboard!");
            break;
          }
        }
      }
    });
  }

  // Drag and Drop File Attachment Support
  const chatAreaEl = document.querySelector(".chat-area") || bubbleArea;
  if (chatAreaEl) {
    ["dragenter", "dragover"].forEach((eventName) => {
      chatAreaEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        chatAreaEl.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      chatAreaEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        chatAreaEl.classList.remove("drag-over");
      });
    });

    chatAreaEl.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        selectedFile = files[0];
        renderFilePreview(files[0]);
        if (typeof Toast !== "undefined") Toast.info(`Attached file: ${files[0].name}`);
      }
    });
  }

  function renderFilePreview(file) {
    if (!filePreviewBar) return;

    const formattedSize = formatFileSize(file.size);
    filePreviewBar.innerHTML = `
      <i class="fas fa-file-alt" style="color: #cf3cc5;"></i>
      <span class="file-preview-name">${escapeHtml(file.name)}</span>
      <span class="file-preview-size">(${formattedSize})</span>
      <button class="file-preview-remove" title="Remove attachment">&times;</button>
    `;
    filePreviewBar.classList.remove("hidden");

    filePreviewBar.querySelector(".file-preview-remove").addEventListener("click", clearFileAttachment);
  }

  function clearFileAttachment() {
    selectedFile = null;
    if (fileInput) fileInput.value = "";
    if (filePreviewBar) {
      filePreviewBar.innerHTML = "";
      filePreviewBar.classList.add("hidden");
    }
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // Helper: auto-resize textarea height
  function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  if (bubbleInput) {
    bubbleInput.addEventListener("input", () => autoResizeTextarea(bubbleInput));
  }

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


// Initialize emoji picker

const emojiBtn = document.getElementById("emoji-btn"); 
const picker = new EmojiMart.Picker({
  onEmojiSelect: (emoji) => {
    bubbleInput.value += emoji.native; // Appends emoji to input
    autoResizeTextarea(bubbleInput);
  }
});

document.getElementById("emoji-btn").addEventListener("click", () => {
  document.getElementById("emoji-container").classList.toggle("hidden");
  document.getElementById("emoji-container").appendChild(picker);
});



  // Load spaces and populate sidebar


  async function loadSpaces() {
    console.log("[SPACES] Loading spaces...");
    try {
      const res = await fetch(`${SERVER_URL}/spaces`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      const spaces = await res.json();
      console.log("[SPACES] Fetched:", spaces);

      spaceList.innerHTML = ""; // Clear sidebar before re-render

      for (const space of spaces) {
        // Fetch bubble count separately
        
        const bubblesRes = await fetch(`${SERVER_URL}/bubbles/${space._id}`, {
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

      // Auto-join space from URL query param "?id=..." or default to first space
      const urlParams = new URLSearchParams(window.location.search);
      const targetSpaceId = urlParams.get("id");

      let autoJoinTarget = null;
      if (targetSpaceId) {
        autoJoinTarget = spaces.find(s => s._id === targetSpaceId);
      }
      if (!autoJoinTarget && spaces.length > 0) {
        autoJoinTarget = spaces[0];
      }

      if (autoJoinTarget) {
        joinSpace(autoJoinTarget._id, autoJoinTarget.name);
      }

    } catch (err) {
      console.error("[SPACES] Failed to load spaces:", err);
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
  const renderedBubbleKeys = new Set();

  function renderBubble(b) {
    if (!b) return;
    const bubbleKey = b._id || `${b.content}_${b.mediaUrl}_${b.createdAt || b.timestamp}`;
    if (bubbleKey && renderedBubbleKeys.has(bubbleKey)) {
      return; // Deduplicate
    }
    if (bubbleKey) renderedBubbleKeys.add(bubbleKey);

    const safeContent = DOMPurify.sanitize(b.content || "");
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "bubble";

    let mediaHtml = "";
    if (b.mediaUrl) {
      const fullUrl = b.mediaUrl.startsWith("/uploads")
        ? `${SERVER_URL}${b.mediaUrl}`
        : b.mediaUrl;

      const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(b.mediaUrl);
      const isVideo = /\.(mp4|webm|mov)$/i.test(b.mediaUrl);
      const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(b.mediaUrl);

      if (isImage) {
        mediaHtml = `
          <div class="bubble-media-container">
            <a href="${fullUrl}" target="_blank" rel="noopener noreferrer">
              <img src="${fullUrl}" class="bubble-media-image" alt="Attachment" />
            </a>
          </div>
        `;
      } else if (isVideo) {
        mediaHtml = `
          <div class="bubble-media-container">
            <video src="${fullUrl}" controls class="bubble-media-video"></video>
          </div>
        `;
      } else if (isAudio) {
        mediaHtml = `
          <div class="bubble-media-container">
            <audio src="${fullUrl}" controls class="bubble-media-audio"></audio>
          </div>
        `;
      } else {
        const fileName = b.mediaUrl.split("/").pop() || "Attachment";
        mediaHtml = `
          <div class="bubble-media-container">
            <a href="${fullUrl}" class="bubble-media-file" download target="_blank" rel="noopener noreferrer">
              <i class="fas fa-file-download"></i>
              <span>${escapeHtml(fileName)}</span>
            </a>
          </div>
        `;
      }
    }

    bubbleEl.innerHTML = `
      <div class="bubble-content">
        <strong>${escapeHtml(b.sender?.name || b.user || "Unknown")}</strong>
        ${safeContent ? `<p>${safeContent}</p>` : ""}
        ${mediaHtml}
        <span class="timestamp">
          ${new Date(b.createdAt || b.timestamp).toLocaleTimeString()}
        </span>
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
      const res = await fetch(`${SERVER_URL}/bubbles/${spaceId}`, {
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

  sendBtn.addEventListener("click", async () => {
    const text = bubbleInput.value.trim();

    if (!text && !selectedFile) {
      console.warn("[SEND] No text or file entered");
      return;
    }

    if (!currentSpaceId) {
      console.warn("[SEND] No space selected");
      if (typeof Toast !== "undefined") Toast.warning("Please select a space first.");
      return;
    }

    const id   = (localStorage.getItem("user-id") || "").trim();
    const name = (localStorage.getItem("user-name") || "").trim();

    let uploadedMediaUrl = null;

    if (selectedFile) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Uploading...";
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const token = localStorage.getItem("token");
        const uploadRes = await fetch(`${SERVER_URL}/bubbles/${currentSpaceId}/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        const contentType = uploadRes.headers.get("content-type") || "";
        let uploadData;

        if (contentType.includes("application/json")) {
          uploadData = await uploadRes.json();
        } else {
          const rawText = await uploadRes.text();
          console.error("[UPLOAD] Server returned non-JSON response:", rawText);
          throw new Error(`Server returned HTML error (${uploadRes.status}). If testing locally, ensure backend server (npm start) is running on http://localhost:3000.`);
        }

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Failed to upload file");
        }

        uploadedMediaUrl = uploadData.mediaUrl;
      } catch (err) {
        console.error("[UPLOAD] Error uploading attachment:", err);
        if (typeof Toast !== "undefined") Toast.error(err.message || "File upload failed.");
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        return;
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
      }
    }

    const bubbleData = {
      spaceId   : currentSpaceId,
      content   : text,
      mediaUrl  : uploadedMediaUrl,
      sender    : id,
      user      : name,
      timestamp : new Date().toISOString()
    };

    console.log("[SEND] Emitting bubble:", bubbleData);
    socket.emit("send-bubble", bubbleData);

    // Optimistically render bubble in sender's chat UI immediately
    renderBubble({
      _id: "local_" + Date.now(),
      spaceId: currentSpaceId,
      content: text,
      mediaUrl: uploadedMediaUrl,
      sender: { name: name || "You" },
      user: name || "You",
      createdAt: bubbleData.timestamp
    });

    bubbleInput.value = ""; // Clear input
    autoResizeTextarea(bubbleInput);
    clearFileAttachment();
  });

  // Real-time listener for new bubbles

  socket.on("receive-bubble", (bubble) => {
    console.log("[SOCKET] Received bubble:", bubble);

    if (!bubble.spaceId || bubble.spaceId === currentSpaceId) {
      renderBubble(bubble);
    }
  });

  // Enter key sends message, Shift+Enter inserts newline
  bubbleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
      autoResizeTextarea(bubbleInput);
    };

    recog.onerror = (e) => {
      console.error("[VOICE] Recognition error:", e.error);
    };


  })();








});
