
import { getCustomTags, saveCustomTags } from "./storage.js";
import { registerCustomTags, getTagColor } from "./utilities.js";
import { addTagToActiveNote } from "./noteOperations.js";

const $ = (selector) => document.querySelector(selector);
const $all = (selector) => Array.from(document.querySelectorAll(selector));

let stateRef = null;
let callbacksRef = null;

// Predefined palette for the color picker
const PALETTE = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef",
    "#f43f5e", "#64748b"
];

export function wireTagManager(state, callbacks) {
    stateRef = state;
    callbacksRef = callbacks;

    // 1. Initial Load of Custom Tags
    const customTags = getCustomTags(state.activeUser);
    if (customTags.length) {
        registerCustomTags(customTags);
    }

    // 2. Wire UI Elements
    const addTagBtn = $("#add-tag-btn");
    const tagMenu = $("#tag-menu");
    const createTagBtn = $("#create-new-tag-btn");
    const tagSearchInput = $("#tag-search");

    // Toggle Tag Menu
    addTagBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTagMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (tagMenu && !tagMenu.classList.contains("hidden")) {
            if (!tagMenu.contains(e.target) && !addTagBtn.contains(e.target)) {
                tagMenu.classList.add("hidden");
            }
        }
    });

    // Filter tags in menu
    tagSearchInput?.addEventListener("input", (e) => {
        renderTagMenuOptions(e.target.value);
    });

    // Open "Create New Tag" Modal
    createTagBtn?.addEventListener("click", () => {
        tagMenu.classList.add("hidden");
        openCreateTagModal();
    });

    // Wire Modal Buttons
    wireCreateTagModal();
}

function toggleTagMenu() {
    const tagMenu = $("#tag-menu");
    const searchInput = $("#tag-search");

    if (!tagMenu) return;

    const isHidden = tagMenu.classList.contains("hidden");
    if (isHidden) {
        tagMenu.classList.remove("hidden");
        if (searchInput) {
            searchInput.value = "";
            searchInput.focus();
        }
        renderTagMenuOptions();
    } else {
        tagMenu.classList.add("hidden");
    }
}

function renderTagMenuOptions(filterText = "") {
    const listEl = $("#tag-menu-list");
    if (!listEl) return;

    listEl.innerHTML = "";

    // Combine default tags (from utilities/constants knowledge) and custom tags
    // For this implementation, we'll fetch known tags from the note set + predefined + custom

    // 1. Collect all unique tags from: predefined list, custom tags, and existing notes
    const predefined = ["work", "personal", "ideas", "todo", "remote"];
    const customTags = getCustomTags(stateRef.activeUser).map(t => t.name);
    const noteTags = stateRef.notes.flatMap(n => n.tags || []);

    const allTags = new Set([...predefined, ...customTags, ...noteTags]);
    const sortedTags = Array.from(allTags).sort();

    // 2. Filter
    const query = filterText.toLowerCase();
    const matchedTags = sortedTags.filter(t => t.toLowerCase().includes(query));

    // 3. Render
    if (matchedTags.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "tag-menu-empty";
        emptyMsg.textContent = "No tags found";
        listEl.appendChild(emptyMsg);
        return;
    }

    matchedTags.forEach(tag => {
        const item = document.createElement("button");
        item.className = "tag-menu-item";

        // Check if active note already has this tag
        const activeNote = stateRef.notes.find(n => n.id === stateRef.activeNoteId);
        const hasTag = activeNote?.tags?.includes(tag);

        // Color dot
        const color = getTagColor(tag);

        item.innerHTML = `
      <span class="tag-color-dot" style="background-color: ${color}"></span>
      <span class="tag-name">${tag}</span>
      ${hasTag ? '<span class="tag-check">✓</span>' : ''}
    `;

        if (hasTag) {
            item.classList.add("selected");
            // Optional: click to remove? For now, let's keep it add-only or toggle
            item.addEventListener("click", () => {
                // Logic to remove tag (optional, or just do nothing/toggle)
                // implementation_plan said "Add tag", so we'll focus on adding.
                // But toggling is better UX.
                removeTagFromNote(tag);
                toggleTagMenu(); // Close menu
            });
        } else {
            item.addEventListener("click", () => {
                addTagToActiveNote(stateRef.notes, stateRef.activeNoteId, tag, stateRef.activeUser, callbacksRef);
                callbacksRef.renderActiveNote();
                callbacksRef.renderNotesList(); // update sidebar chips
                toggleTagMenu(); // Close menu
            });
        }

        listEl.appendChild(item);
    });
}

function removeTagFromNote(tag) {
    // We can reuse the renderer's remove logic logic or import it?
    // actually noteOperations.js doesn't export removeTag.
    // We'll implemented a quick helper or rely on renderer rendering chips with X
    // For the menu, usually clicking a selected item removes it.

    const note = stateRef.notes.find(n => n.id === stateRef.activeNoteId);
    if (!note) return;

    if (note.tags.includes(tag)) {
        note.tags = note.tags.filter(t => t !== tag);
        note.updatedAt = new Date().toISOString();
        callbacksRef.persistNotes();
        callbacksRef.renderActiveNote();
        callbacksRef.renderNotesList();
    }
}

// --- Creation Modal Logic ---

function openCreateTagModal() {
    const modal = $("#custom-tag-modal");
    if (!modal) return;

    // Reset fields
    $("#new-tag-name").value = "";
    $("#new-tag-desc").value = "";
    $("#new-tag-color-picker").value = "#000000";
    $("#new-tag-color-hex").textContent = "#000000";

    renderColorPalette();
    updatePreview("New Label", "#000000");

    modal.showModal();
}

function wireCreateTagModal() {
    const modal = $("#custom-tag-modal");
    const saveBtn = $("#save-new-tag-btn");
    const nameInput = $("#new-tag-name");
    const descInput = $("#new-tag-desc");
    const colorPicker = $("#new-tag-color-picker");
    const closeBtns = $all("#custom-tag-modal .close-modal");

    closeBtns.forEach(btn => btn.addEventListener("click", () => modal.close()));

    // Live Preview Updates
    nameInput?.addEventListener("input", () => updatePreviewFromInputs());
    colorPicker?.addEventListener("input", (e) => {
        $("#new-tag-color-hex").textContent = e.target.value;
        updatePreviewFromInputs();
    });

    saveBtn?.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const color = colorPicker.value;

        if (!name) {
            alert("Please enter a label name");
            return;
        }

        // 1. Save new custom tag
        const existingCustom = getCustomTags(stateRef.activeUser);
        // Check duplicate name
        if (existingCustom.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            alert("Label name already exists");
            return;
        }

        const newTag = { name, description: desc, color };
        const updatedCustom = [...existingCustom, newTag];
        saveCustomTags(stateRef.activeUser, updatedCustom);

        // 2. Register globally
        registerCustomTags([newTag]);

        // 3. Add to current note immediately
        addTagToActiveNote(stateRef.notes, stateRef.activeNoteId, name, stateRef.activeUser, callbacksRef);

        callbacksRef.renderActiveNote();
        callbacksRef.renderNotesList();

        modal.close();
    });
}

function renderColorPalette() {
    const container = $("#new-tag-colors");
    if (!container) return;
    container.innerHTML = "";

    PALETTE.forEach(color => {
        const swatch = document.createElement("button");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;
        swatch.addEventListener("click", () => {
            $("#new-tag-color-picker").value = color;
            $("#new-tag-color-hex").textContent = color;
            updatePreviewFromInputs();
        });
        container.appendChild(swatch);
    });
}

function updatePreviewFromInputs() {
    const name = $("#new-tag-name").value.trim() || "Label preview";
    const color = $("#new-tag-color-picker").value;
    updatePreview(name, color);
}

function updatePreview(text, color) {
    const preview = $("#new-tag-preview");
    if (!preview) return;

    preview.textContent = text;
    preview.style.setProperty("--tag-color", color);

    // Adjust background mix dynamically simply by relying on CSS var
    // .tag class uses --tag-color to mix background
}
