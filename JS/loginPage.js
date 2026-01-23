import { setActiveUser, mergeGuestNotes } from "./storage.js";
import { signIn } from "./authService.js";

// Initializes the login form with validation and user authentication logic
export function initLoginForm({
  formId = "login-form",
  setMessage = () => { },
  toggleView = () => { },
} = {}) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Update label to say "Email" instead of Username (Runtime fix)
  const userLabel = form.querySelector('label[for="username"]');
  if (userLabel) userLabel.textContent = "Email";
  const userInput = document.getElementById("username");
  if (userInput) userInput.placeholder = "Enter your email";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      setMessage("Please enter email and password.", "error");
      return;
    }

    try {
      setMessage("Logging in...", "info");
      const { user, session } = await signIn(email, password);

      // Success
      // Merge notes (if we had a way to map guest notes to cloud, currently mergeGuestNotes uses localstorage)
      // We might want to "upload" guest notes here?
      // For now, let's just set active user.

      // Use metadata username if available, else email
      const displayUser = user.user_metadata?.username || user.email;
      setActiveUser(displayUser);

      setMessage("Success! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 400);

    } catch (error) {
      console.error("Login Error:", error);
      setMessage(error.message || "Login failed.", "error");
    }
  });
}
