// ========================================
// TAG & COLOR UTILITIES
// ========================================
const TAG_COLORS = {
  work: "#6aa6ff",
  personal: "#ff85a1",
  ideas: "#faca6b",
  todo: "#88ffc3",
  remote: "#b084ff",
};

// Returns a color associated with a tag, or a default color if none is defined
export function getTagColor(tag) {
  if (!tag) return "#0f1526";
  // Check case-insensitive
  const lowerTag = tag.toLowerCase();
  if (TAG_COLORS[lowerTag]) {
    return TAG_COLORS[lowerTag];
  }
  return "#4f6b95"; // Default fallback
}

// Registers a set of custom tags with their colors
export function registerCustomTags(customTags) {
  customTags.forEach(tag => {
    if (tag.name && tag.color) {
      TAG_COLORS[tag.name.toLowerCase()] = tag.color;
    }
  });
}

// ========================================
// DATE UTILITIES
// ========================================
// Converts a date-like object to a localized date string (YYYY-MM-DD format)
export function toLocalDateString(dateLike) {
  if (!dateLike) return "";
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-CA");
}

// Formats an ISO date string into a more readable format (e.g., 'Jan 1, 2023')
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ========================================
// HTML ESCAPING UTILITY
// ========================================
// Escapes HTML special characters to prevent XSS attacks
export function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}