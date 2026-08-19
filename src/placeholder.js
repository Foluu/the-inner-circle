// ================================================================
// SPACE GATE — js/space-gate.js
// Job: open/close the "Create a Space" modal, and expose one
// function (renderGateState) that space.js calls whenever
// currentSpaceId changes.
//
// This file does NOT know whether a space is open — only space.js
// knows that (it owns currentSpaceId). This file just reacts.
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
  const chatArea      = document.getElementById("chatArea");
  const createBtn     = document.getElementById("createSpaceBtn");
  const overlay       = document.getElementById("createSpaceOverlay");
  const cancelBtn     = document.getElementById("createSpaceCancel");
  const form          = document.getElementById("createSpaceForm");
  const nameInput     = document.getElementById("spaceNameInput");

  if (!chatArea) {
    console.warn("[GATE] #chatArea not found in the page");
    return;
  }

  // Gate starts closed (no space open) until space.js says otherwise
  chatArea.classList.add("no-space");

  // Open modal
  if (createBtn && overlay) {
    createBtn.addEventListener("click", () => {
      overlay.classList.add("open");
      nameInput.focus();
    });
  }

  // Close modal (cancel button or clicking the dark backdrop)
  function closeModal() {
    overlay.classList.remove("open");
    form.reset();
  }
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(); // only if clicking the backdrop itself
    });
  }

  // Submit -> create space
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;

      // Calls the real create-space function your space.js defines.
      // See the space.js patch notes for what this should do.
      if (typeof window.createSpace === "function") {
        await window.createSpace(name);
      } else {
        console.warn("[GATE] window.createSpace() is not defined yet — see space.js patch notes");
      }

      closeModal();
    });
  }

  // Exposed globally so space.js can call it whenever
  // currentSpaceId changes (on join, on create, on load).
  window.renderGateState = function renderGateState(hasOpenSpace) {
    if (hasOpenSpace) {
      chatArea.classList.remove("no-space");
    } else {
      chatArea.classList.add("no-space");
    }
  };
});