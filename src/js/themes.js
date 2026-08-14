(function () {
  "use strict";

  const selectedThemeKey = "inner-circle-selected-theme";
  const menuToggle = document.getElementById("mobileMenuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");
  const themesGrid = document.getElementById("themesGrid");
  const themesCount = document.getElementById("themesCount");
  const toast = document.getElementById("themesToast");
  let toastTimer;

  const themes = [
    {
      id: "inner-circle",
      name: "Inner Circle",
      description: "The original black and magenta look.",
      accent: "#e330ce",
      background: "#111111",
      text: "#ffffff"
    },
    {
      id: "midnight",
      name: "Midnight",
      description: "Deep navy with an electric violet accent.",
      accent: "#8b5cf6",
      background: "#0b1020",
      text: "#f8fafc"
    },
    {
      id: "ocean",
      name: "Ocean",
      description: "Cool blue tones with a bright aqua highlight.",
      accent: "#06b6d4",
      background: "#0c4a6e",
      text: "#f0f9ff"
    },
    {
      id: "forest",
      name: "Forest",
      description: "Natural greens with a calm cream foreground.",
      accent: "#84cc16",
      background: "#1a2e24",
      text: "#f7fee7"
    },
    {
      id: "sunset",
      name: "Sunset",
      description: "Warm plum with a vivid coral accent.",
      accent: "#fb7185",
      background: "#4c1d3d",
      text: "#fff7ed"
    },
    {
      id: "cloud",
      name: "Cloud",
      description: "A clean light theme with a soft blue accent.",
      accent: "#2563eb",
      background: "#f8fafc",
      text: "#172033"
    }
  ];

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }

  function getSelectedThemeId() {
    const storedThemeId = localStorage.getItem(selectedThemeKey);
    return themes.some((theme) => theme.id === storedThemeId) ? storedThemeId : themes[0].id;
  }

  function createColorDot(color) {
    const colorDot = document.createElement("span");
    colorDot.style.backgroundColor = color;
    colorDot.title = color;
    return colorDot;
  }

  function renderThemes() {
    const selectedThemeId = getSelectedThemeId();
    themesCount.textContent = `${themes.length} themes`;
    themesGrid.replaceChildren();

    themes.forEach((theme) => {
      const isSelected = theme.id === selectedThemeId;
      const card = document.createElement("article");
      card.className = `theme-card${isSelected ? " is-selected" : ""}`;

      const preview = document.createElement("div");
      preview.className = "theme-card-preview";
      preview.style.setProperty("--theme-background", theme.background);
      preview.style.setProperty("--theme-text", theme.text);
      preview.style.setProperty("--theme-accent", theme.accent);
      preview.setAttribute("aria-hidden", "true");
      preview.appendChild(document.createElement("span"));

      const body = document.createElement("div");
      body.className = "theme-card-body";

      const titleRow = document.createElement("div");
      titleRow.className = "theme-card-title-row";

      const title = document.createElement("h3");
      title.textContent = theme.name;
      titleRow.appendChild(title);

      if (isSelected) {
        const badge = document.createElement("span");
        badge.className = "theme-card-badge";
        badge.textContent = "Selected";
        titleRow.appendChild(badge);
      }

      const description = document.createElement("p");
      description.className = "theme-card-description";
      description.textContent = theme.description;

      const colors = document.createElement("div");
      colors.className = "theme-card-colors";
      colors.append(
        createColorDot(theme.accent),
        createColorDot(theme.background),
        createColorDot(theme.text)
      );

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "themes-button themes-button-primary theme-select-button";
      selectButton.textContent = isSelected ? "Selected" : "Select theme";
      selectButton.disabled = isSelected;
      selectButton.setAttribute("aria-pressed", String(isSelected));
      selectButton.addEventListener("click", () => {
        localStorage.setItem(selectedThemeKey, theme.id);
        renderThemes();
        showToast(`${theme.name} selected.`);
      });

      body.append(titleRow, description, colors, selectButton);
      card.append(preview, body);
      themesGrid.appendChild(card);
    });
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("menu-visible");
    mobileMenuBackdrop.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("menu-visible");
    mobileMenuBackdrop.classList.remove("hidden");
    menuToggle.setAttribute("aria-expanded", "true");
  });

  mobileMenuClose.addEventListener("click", closeMobileMenu);
  mobileMenuBackdrop.addEventListener("click", closeMobileMenu);

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const avatar = document.getElementById("user-profile-avatar");
    const userName = document.getElementById("user--name");
    if (storedUser.avatar) avatar.src = storedUser.avatar;
    if (storedUser.name) userName.textContent = storedUser.name;
  } catch (error) {
    // Keep the existing fallback avatar and label.
  }

  renderThemes();
})();
