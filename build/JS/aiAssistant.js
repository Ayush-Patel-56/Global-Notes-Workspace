
import { generateTextWithGemini } from './geminiAPI.js';

export function wireAIAssistant(state, callbacks) {
    const generateBtn = document.getElementById("ai-sidebar-generate");
    const promptInput = document.getElementById("ai-sidebar-prompt");
    const contentEditor = document.getElementById("content");

    const micBtn = document.getElementById("ai-mic-btn");

    if (!generateBtn || !promptInput) return;

    // --- Voice Input Logic ---
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            micBtn.addEventListener("click", () => {
                if (micBtn.classList.contains("listening")) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });

            recognition.onstart = () => {
                micBtn.classList.add("listening");
                promptInput.placeholder = "Listening...";
            };

            recognition.onend = () => {
                micBtn.classList.remove("listening");
                promptInput.placeholder = "Ask AI to write...";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                // Append text ensuring a space if needed
                const currentText = promptInput.value;
                promptInput.value = currentText + (currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '') + transcript;
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                micBtn.classList.remove("listening");
                promptInput.placeholder = "Error. Try typing.";
                setTimeout(() => {
                    promptInput.placeholder = "Ask AI to write...";
                }, 2000);
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            micBtn.style.display = "none"; // Hide if not supported
        }
    }

    // --- Generate Logic ---
    generateBtn.addEventListener("click", async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        // UI Loading State
        const originalText = generateBtn.textContent;
        generateBtn.textContent = "⏳ Thinking...";
        generateBtn.disabled = true;
        promptInput.disabled = true;

        try {
            // Call the real Gemini API
            const text = await generateTextWithGemini(prompt);
            insertTextAtCursor(text);
            promptInput.value = ""; // Clear after success
        } catch (err) {
            console.error("AI Generation failed", err);
            // The error from generateTextWithGemini is already user-friendly
            alert("Failed to generate text. Please check the console for details.");
        } finally {
            // Reset UI
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
            promptInput.disabled = false;
        }
    });

    function insertTextAtCursor(text) {
        if (!contentEditor) return;
        contentEditor.focus();

        // A single newline should be a line break, more should be paragraphs.
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        
        // Using execCommand for broader compatibility, with a fallback.
        try {
            if (paragraphs.length <= 1) {
                 document.execCommand('insertText', false, text);
            } else {
                 document.execCommand('insertHTML', false, paragraphs.join('<br>'));
            }
        } catch (e) {
            console.warn("execCommand is not supported. Falling back to range manipulation.");
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const fragment = document.createDocumentFragment();
            paragraphs.forEach((p, index) => {
                fragment.appendChild(document.createTextNode(p));
                if (index < paragraphs.length - 1) {
                    fragment.appendChild(document.createElement('br'));
                }
            });
            range.insertNode(fragment);
        }
    }
}
