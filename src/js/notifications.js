// ================================================================
// NOTIFICATIONS — js/notifications.js
// Job: open/close the panel, close it on outside click,
// and expose a function to render real notifications later.
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".notif-wrapper");
  const bell    = document.querySelector(".notif-bell");
  const list    = document.querySelector(".notif-list");

  if (!wrapper || !bell) {
    console.warn("[NOTIF] .notif-wrapper or .notif-bell not found in the page");
    return;
  }

  // Click bell -> toggle open
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("open");
  });

  // Click anywhere else on the page -> close
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("open");
    }
  });

  // "Mark all read" button, if present
  const markReadBtn = document.querySelector(".mark-read");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", () => {
      document.querySelectorAll(".notif-item.unread").forEach(item => {
        item.classList.remove("unread");
      });
      updateBadge(0);
    });
  }

  // Updates the little red count on the bell. Call this from
  // wherever real notifications actually arrive (e.g. a socket
  // "receive-bubble" handler in space.js).
  window.updateNotifBadge = function updateBadge(count) {
    const badge = document.querySelector(".notif-badge");
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  };

  // ---- ADD THIS: function definition ----
  // Shows "You're all caught up." when the list is empty, removes
  // it the moment something real gets added. Keep this near
  // updateBadge — same category of "just reflect current state".
  function refreshEmptyState() {
    if (!list) return;

    const isEmpty = list.children.length === 0;
    let emptyMsg = list.querySelector(".notif-empty");

    if (isEmpty && !emptyMsg) {
      list.innerHTML = '<div class="notif-empty">You\'re all caught up.</div>';
    } else if (!isEmpty && emptyMsg) {
      emptyMsg.remove();
    }
  }
  // ---- END ADD ----

  // ---- ADD THIS: call it once, right here, before anything else runs ----
  // At page load the list is genuinely empty (no fake sample anymore),
  // so this immediately shows "You're all caught up." instead of a
  // blank box.
  refreshEmptyState();
  // ---- END ADD ----

  // Adds one notification item to the top of the list. Call this
  // from your real message/mention/invite events later.
  window.addNotification = function addNotification({ type = "message", title, body, time = "Just now" }) {
    if (!list) return;

    const li = document.createElement("li");
    li.className = `notif-item type-${type} unread`;
    li.innerHTML = `
      <div class="notif-icon"><i class="fas fa-comment-dots"></i></div>
      <div class="notif-body">
        <p><strong>${title}</strong> ${body}</p>
        <span class="notif-time">${time}</span>
      </div>
    `;
    list.prepend(li);

    const currentBadge = document.querySelector(".notif-badge");
    const currentCount = currentBadge && currentBadge.style.display !== "none"
      ? parseInt(currentBadge.textContent || "0", 10)
      : 0;
    updateBadge(currentCount + 1);

    // ---- ADD THIS: call it again, right here ----
    // A real notification was just added, so the list is no longer
    // empty — remove the "You're all caught up." message if it's
    // still showing.
    refreshEmptyState();
    // ---- END ADD ----
  };
});