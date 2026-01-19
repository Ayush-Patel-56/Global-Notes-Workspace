// Import the clearActiveUser function from storage.js to handle user session cleanup
import { clearActiveUser } from "./storage.js";

/**
 * Helper function to simplify DOM element selection
 * @param {string} selector - CSS selector string to find the element
 * @returns {Element|null} The first element that matches the selector, or null if no matches
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Sets up authentication button event listeners
 * @param {Object} state - Application state object
 * @param {Object} callbacks - Object containing callback functions for various actions
 */
/**
 * Initializes and manages authentication-related UI components and their event handlers
 * 
 * @param {Object} state - Application state object containing user session information
 * @param {Object} callbacks - Collection of callback functions for state management:
 *   @param {Function} callbacks.persistNotes - Saves any pending notes before logout
 *   @param {Function} callbacks.loadNotesForCurrentUser - Loads notes for the active user
 *   @param {Function} callbacks.updateUserDisplay - Updates UI elements to reflect current user
 *   @param {Function} callbacks.renderNotesList - Refreshes the notes list display
 *   @param {Function} callbacks.renderActiveNote - Updates the active note display
 * 
 * This function sets up click handlers for authentication buttons and manages the
 * authentication flow, including navigation between auth pages and session cleanup.
 */
export function wireAuthButtons(state, callbacks) {
  // Handle login button click - redirects to signup page
  $("#login")?.addEventListener("click", () => {
    window.location.href = "./HTML/signup.html";
  });

  // Handle signup button click - redirects to signup page
  $("#signup")?.addEventListener("click", () => {
    window.location.href = "./HTML/signup.html";
  });

  // Handle logout button click - performs cleanup and redirects to signup page
  $("#logout")?.addEventListener("click", () => {
    // Save any pending notes before logging out
    callbacks.persistNotes();
    // Clear user session
    clearActiveUser();
    // Update application state
    state.activeUser = null;
    // Reset UI components
    callbacks.loadNotesForCurrentUser();
    callbacks.updateUserDisplay();
    callbacks.renderNotesList();
    callbacks.renderActiveNote();
    // Redirect to signup page
    window.location.href = "./HTML/signup.html";
  });
}