
const $ = (selector) => document.querySelector(selector);

export class SketchPad {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // History for Undo/Redo
    this.history = [];
    this.historyStep = -1;

    // Tools
    this.colorInput = $('#sketch-color');
    this.sizeInput = $('#sketch-size');
    this.penBtn = $('#tool-pen');
    this.eraserBtn = $('#tool-eraser');
    this.clearBtn = $('#tool-clear');

    // Undo/Redo Buttons (Assuming they exist or need to be added/connected)
    // The user mentioned undo/redo not working. I need to check if buttons exist in HTML.
    // If not, I assume I should connect them if I find them, or the user expects global undo/redo?
    // Usually sketch pad has its own.
    // Let's assume standard names or I'll look for them. 
    // Actually, looking at the previous file content, I didn't see specific undo/redo buttons in the sketch modal HTML shown in `view_file` (lines 426+).
    // I should check if there are undo/redo buttons in the sketch modal.
    this.undoBtn = $('#sketch-undo');
    this.redoBtn = $('#sketch-redo');

    this.mode = 'pen'; // 'pen' or 'eraser'

    this.init();
  }

  init() {
    this.setupEvents();
    this.reset();
  }

  // Force white background for visibility in all themes
  getCanvasColor() {
    return '#ffffff';
  }

  reset() {
    this.ctx.fillStyle = this.getCanvasColor();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.updateBrush();
    this.saveState(); // Save initial blank state
  }

  updateBrush() {
    this.ctx.lineWidth = this.sizeInput.value;
    this.ctx.strokeStyle = this.mode === 'eraser' ? this.getCanvasColor() : this.colorInput.value;
  }

  saveState() {
    this.historyStep++;
    // Remove future states if we were in the middle of history
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.history.push(this.canvas.toDataURL());
    // this.updateButtons();
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreState();
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.restoreState();
    }
  }

  restoreState() {
    const img = new Image();
    img.src = this.history[this.historyStep];
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
  }

  setupEvents() {
    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      this.canvas.dispatchEvent(mouseEvent);
    });

    // Tool Controls
    this.colorInput.addEventListener('change', () => this.updateBrush());
    this.sizeInput.addEventListener('input', () => this.updateBrush());

    this.penBtn.addEventListener('click', () => {
      this.mode = 'pen';
      this.penBtn.classList.add('active');
      this.eraserBtn.classList.remove('active');
      this.updateBrush();
    });

    this.eraserBtn.addEventListener('click', () => {
      this.mode = 'eraser';
      this.eraserBtn.classList.add('active');
      this.penBtn.classList.remove('active');
      this.updateBrush();
    });

    this.clearBtn.addEventListener('click', () => {
      const confirmClear = confirm('Clear sketch?');
      if (confirmClear) {
        this.reset();
      }
    });

    if (this.undoBtn) this.undoBtn.addEventListener('click', () => this.undo());
    if (this.redoBtn) this.redoBtn.addEventListener('click', () => this.redo());
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(e);
    this.lastX = x;
    this.lastY = y;
  }

  draw(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoordinates(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  getImageDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
}
