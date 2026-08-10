/**
 * Inner Circle Toast Notification System (Sonner Style Engine)
 * Renders elegant, compact, high-contrast toast notifications with inline SVG icons.
 */

(function () {
  const SVG_ICONS = {
    success: `<svg viewBox="0 0 20 20"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1.5 14.5L4 10l1.41-1.41L9 11.67l6.59-6.59L17 6.5l-8.5 8s0 0 0 0z"/></svg>`,
    error: `<svg viewBox="0 0 20 20"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg>`,
    warning: `<svg viewBox="0 0 20 20"><path d="M1 18h18L10 1 1 18zm10-2H9v-2h2v2zm0-4H9V8h2v4z"/></svg>`,
    info: `<svg viewBox="0 0 20 20"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-6h2v6zm0-8H9V5h2v2z"/></svg>`,
    close: `<svg viewBox="0 0 14 14"><path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z"/></svg>`
  };

  function getOrCreateContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = "info", duration = 3500) {
    const container = getOrCreateContainer();
    const validTypes = ["success", "error", "warning", "info"];
    const toastType = validTypes.includes(type) ? type : "info";
    const iconSvg = SVG_ICONS[toastType];
    const closeSvg = SVG_ICONS.close;

    const toast = document.createElement("div");
    toast.className = `ic-toast ic-toast-${toastType}`;

    toast.innerHTML = `
      <div class="ic-toast-icon">
        ${iconSvg}
      </div>
      <div class="ic-toast-content">
        <p class="ic-toast-message">${escapeHtml(message)}</p>
      </div>
      <button class="ic-toast-close" aria-label="Close">${closeSvg}</button>
      <div class="ic-toast-progress">
        <div class="ic-toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    // Trigger smooth enter transition
    requestAnimationFrame(() => {
      toast.classList.add("ic-toast-show");
    });

    let dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, duration);

    // Close button click handler
    const closeBtn = toast.querySelector(".ic-toast-close");
    closeBtn.addEventListener("click", () => {
      clearTimeout(dismissTimer);
      dismissToast(toast);
    });

    return toast;
  }

  function dismissToast(toast) {
    toast.classList.remove("ic-toast-show");
    toast.classList.add("ic-toast-hide");

    toast.addEventListener("transitionend", () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, { once: true });
  }

  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Global Toast Object API
  const Toast = {
    show: showToast,
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    warning: (msg, duration) => showToast(msg, "warning", duration),
    info: (msg, duration) => showToast(msg, "info", duration)
  };

  window.showToast = showToast;
  window.Toast = Toast;
})();
