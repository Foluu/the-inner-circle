// ================================================================
// THEME (dark/light) — js/theme.js
// Job: toggle "light-mode" on <body> when the switch is clicked,
// and remember the user's choice for next time using localStorage.
// ================================================================

document.addEventListener("DOMContentLoaded", () => {
  const switchLabel = document.querySelector(".theme-switch-label");

  if (!switchLabel) {
    console.warn("[THEME] .theme-switch-label not found in the page");
    return;
  }

  // Restore saved preference on load
  const saved = localStorage.getItem("inner-circle-theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
  }

  switchLabel.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("inner-circle-theme", isLight ? "light" : "dark");
  });
});