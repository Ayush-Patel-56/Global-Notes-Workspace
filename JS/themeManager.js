import { THEME_KEY } from "./constants.js";

const DEFAULT_THEME = "dark";

// Retrieves the user's preferred theme from localStorage or returns the default dark theme
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// Applies the specified theme to the UI by updating the data-theme attribute and toggle button
export function applyTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  const bodyEl = document.body;
  if (bodyEl) {
    bodyEl.dataset.theme = normalized;
  }

  // Let CSS variables drive colors; clear any previous inline overrides
  const contentEl = document.querySelector("#content");
  if (contentEl) {
    contentEl.style.color = "";
    contentEl.style.backgroundColor = "";
  }

  const toggleBtn = document.querySelector("#theme-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = normalized === "light" ? "Dark mode" : "Light mode";
  }
}

// Saves the user's theme preference to localStorage and applies it
export function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore storage issues
  }
  applyTheme(theme);
}

// Sets up the theme toggle button and initializes the theme based on user preference
export function wireThemeToggle() {
  const toggleBtn = document.querySelector("#theme-toggle");
  if (!toggleBtn) {
    applyTheme(getStoredTheme());
    return;
  }

  applyTheme(getStoredTheme());

  toggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    persistTheme(nextTheme);
  });
}