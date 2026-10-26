const canvas = document.getElementById('annotation-canvas');
const ctx = canvas.getContext('2d');

const appCanvas = document.getElementById('app-canvas') || document.body;
appCanvas.style.position = 'relative';

let textLayer = document.getElementById('text-layer');
if (!textLayer) {
    textLayer = document.createElement('div');
    textLayer.id = 'text-layer';
    appCanvas.appendChild(textLayer);
} else if (textLayer.parentElement !== appCanvas) {
    appCanvas.appendChild(textLayer);
}

if (canvas.parentElement !== appCanvas) {
    appCanvas.appendChild(canvas);
}

let currentTool = 'pointer';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isToolbarExpanded = false;

canvas.style.zIndex = '1010';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';

textLayer.style.zIndex = '1001';
textLayer.style.position = 'absolute';
textLayer.style.top = '0';
textLayer.style.left = '0';
textLayer.style.width = '100%';
textLayer.style.height = '100%';
textLayer.style.pointerEvents = 'none';

const styleEl = document.createElement('style');
styleEl.innerHTML = `
    .cursor-pointer-mode {
        cursor: default;
    }
    .cursor-pencil-mode {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="%2394a3b8" stroke="%231e293b" stroke-width="1.5" stroke-linejoin="round" d="M5 27l3-9L22 4a2.8 2.8 0 0 1 4 4L12 22l-9 5z"/><path fill="%23cbd5e1" d="M19 7l6 6l-2 2l-6-6z"/><path fill="%23f43f5e" d="M22 4l6 6l-2 2l-6-6z"/><path fill="%23cbd5e1" d="M21.5 8.5l2-2"/><path fill="%23cbd5e1" d="M23.5 10.5l2-2"/><path fill="%23fde047" d="M5 27l2.2-3.8l1.6 1.6L5 27z"/><path fill="%231e293b" d="M5 27l1.5-2.5l1 1L5 27z"/></svg>') 2 30, auto;
    }
    .cursor-pen-mode {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="redpen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23991b1b"/></linearGradient></defs><path fill="url(%23redpen)" stroke="%23ffffff" stroke-width="1" d="M3 29l3.8-9.2L20.2 6.4a2.2 2.2 0 0 1 3.1 0l2.3 2.3a2.2 2.2 0 0 1 0 3.1L12.2 25.2L3 29z"/><path fill="%23f8fafc" d="M19 8l5 5l1.2-1.2a1 1 0 0 0 0-1.4l-3.6-3.6a1 1 0 0 0-1.4 0L19 8z"/><path fill="%230f172a" stroke="%23000000" stroke-width="0.5" d="M3 29l2.4-4.2l1.8 1.8L3 29z"/><path fill="none" stroke="%23ffffff" stroke-width="0.8" d="M7.5 22.5L21.5 8.5"/></svg>') 2 30, auto;
    }
    .cursor-highlighter-mode {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23facc15"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><path fill="url(%23hg)" stroke="%23ffffff" stroke-width="1" d="M3 29l4.5-12.5L21 3a2.2 2.2 0 0 1 3.1 0l3.9 3.9a2.2 2.2 0 0 1 0 3.1L14.5 24.5L3 29z"/><path fill="%23fef08a" d="M17.5 6.5l8 8l-2.1 2.1l-8-8l2.1-2.1z"/><path fill="%23713f12" d="M3 29l3.8-4.2l1.7 1.7L3 29z"/><path fill="none" stroke="%23ffffff" stroke-width="0.8" d="M8 22L20 10"/></svg>') 2 30, auto;
    }
    .cursor-eraser-mode {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="11" y="4" width="10" height="20" rx="5" fill="%2338bdf8" stroke="%230f172a" stroke-width="1.5"/><path d="M11 14h10v10h-10z" fill="%23f43f5e"/><rect x="11" y="14" width="10" height="10" rx="0" fill="%23f43f5e"/><path d="M11 19a5 5 0 0 0 10 0v-5H11z" fill="%23f43f5e" stroke="%230f172a" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="%23facc15"/><circle cx="24" cy="10" r="1" fill="%23a855f7"/><circle cx="7" cy="20" r="1" fill="%2334d399"/><circle cx="25" cy="22" r="1" fill="%23f43f5e"/></svg>') 16 30, auto;
    }

   .draggable-text-box {
        position: absolute;
        min-width: 200px;
        min-height: 50px;
        z-index: 1002;
        resize: none; 
        overflow: visible !important;
        display: flex;
        flex-direction: column;
        pointer-events: none;
        border-radius: 8px;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }

    body.text-tool-active .draggable-text-box {
        pointer-events: auto;
        backdrop-filter: blur(2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: solid 1px rgba(59, 130, 246, 0.4);
        background: rgba(255, 255, 255, 0.9);
        resize: both;
    }

    .draggable-text-box .text-header {
        display: none;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        font-size: 10px;
        color: #64748b;
        margin-bottom: 4px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 2px;
        flex-shrink: 0;
    }

    body.text-tool-active .draggable-text-box .text-header {
        display: flex;
    }

    .draggable-text-box textarea {
        display: block;
        width: 100%;
        height: 100%;
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        resize: none;
        font-family: inherit;
        font-size: 18px;
        line-height: 1.4;
        pointer-events: none;
        color: #1e293b;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
    }

    body.text-tool-active .draggable-text-box textarea {
        pointer-events: auto;
    }

    .draggable-image-box {
        position: absolute;
        z-index: 1002;
        display: flex;
        flex-direction: column;
        pointer-events: none;
        border-radius: 8px;
        border: 2px dashed transparent;
        transition: border-color 0.2s, box-shadow 0.2s;
        overflow: hidden !important;
        min-width: 120px;
        min-height: 120px;
        max-width: 90vw;
        max-height: 90vh;
    }

    body.image-tool-active .draggable-image-box {
        pointer-events: auto;
        border-color: rgba(16, 185, 129, 0.8);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 0.95);
        resize: both;
    }

    .draggable-image-box .img-header {
        display: none;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        font-size: 11px;
        font-weight: 600;
        color: #065f46;
        background: rgba(209, 250, 229, 0.95);
        padding: 6px 10px;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        flex-shrink: 0;
    }

    body.image-tool-active .draggable-image-box .img-header {
        display: flex;
    }

    .draggable-image-box img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
        flex: 1;
    }

    .format-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 5px;
        font-size: 11px;
        color: #64748b;
        border-radius: 4px;
    }
    .format-btn:hover, .format-btn.active {
        background: #e2e8f0;
        color: #1e293b;
    }
    .color-picker-wrapper {
        position: relative;
        display: inline-block;
        overflow: visible !important;
    }
    .color-picker-btn {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1.5px solid #cbd5e1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .color-picker-btn:hover {
        transform: scale(1.1);
        border-color: #3b82f6;
    }
    .color-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 6px;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
        z-index: 99999;
        width: 210px;
        flex-direction: column;
        gap: 10px;
    }
    .color-dropdown.show {
        display: flex;
    }
    .color-palette-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
    }
    .color-option {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }
    .color-option:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(styleEl);

function getCanvasCoordinates(e) {
    const rect = appCanvas.getBoundingClientRect();
    let scale = 1;
    const transform = window.getComputedStyle(appCanvas).transform;
    if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
            scale = parseFloat(matrix[1].split(', ')[0]);
        }
    }
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
}

function resizeCanvas() {
    canvas.width = Math.max(appCanvas.scrollWidth, appCanvas.clientWidth, window.innerWidth);
    canvas.height = Math.max(appCanvas.scrollHeight, appCanvas.clientHeight, window.innerHeight);
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    resizeCanvas();
    setTimeout(resizeCanvas, 500);
    setToolbarExpanded(false);
});

function toggleToolbarMenu() {
    isToolbarExpanded = !isToolbarExpanded;
    setToolbarExpanded(isToolbarExpanded);
}

function setToolbarExpanded(expanded) {
    isToolbarExpanded = expanded;
    const optionsContainer = document.getElementById('toolbar-options');
    if (optionsContainer) {
        if (expanded) {
            optionsContainer.style.maxHeight = "350px";
            optionsContainer.style.opacity = "1";
            optionsContainer.style.pointerEvents = "auto";
            optionsContainer.style.marginBottom = "8px";
        } else {
            optionsContainer.style.maxHeight = "0px";
            optionsContainer.style.opacity = "0";
            optionsContainer.style.pointerEvents = "none";
            optionsContainer.style.marginBottom = "0px";
        }
    }
}

function showToolIndicator(message, type = "success") {
    let toastContainer = document.getElementById('teacher-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'teacher-toast-container';
        toastContainer.style.cssText = "position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-3 pointer-events-auto transition-all`;
    toast.style.cssText = "background-color: #0f172a; border: 1px solid rgba(255,255,255,0.2); font-size: 14px;";
    toast.innerHTML = `<i class="fa-solid fa-circle-info text-primary text-base"></i> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setTool(tool) {
    currentTool = tool;
    
    document.querySelectorAll('#teacher-toolbar button').forEach(btn => {
        if(btn.id !== 'toolbar-master-btn') {
            btn.classList.remove('btn-primary', 'text-white', 'scale-105');
            btn.classList.add('btn-ghost', 'bg-base-100');
        }
    });

    const activeBtn = document.getElementById(`tool-${tool}`);
    if (activeBtn) {
        activeBtn.classList.remove('btn-ghost', 'bg-base-100');
        activeBtn.classList.add('btn-primary', 'text-white', 'scale-105');
    }

    if (tool === 'text') {
        document.body.classList.add('text-tool-active');
        document.body.classList.remove('image-tool-active');
        showToolIndicator("Text Tool Active: Click and drag anywhere to create a note box.", "info");
    } else if (tool === 'image') {
        document.body.classList.add('image-tool-active');
        document.body.classList.remove('text-tool-active');
        showToolIndicator("🖼️ Image Tool Active! Press Ctrl+V to paste your image anywhere.", "success");
    } else {
        document.body.classList.remove('text-tool-active', 'image-tool-active');
        document.querySelectorAll('.color-dropdown').forEach(d => d.classList.remove('show'));
    }

    if (tool === 'pointer') {
        canvas.style.pointerEvents = 'none';
        textLayer.style.pointerEvents = 'none';
        canvas.className = "cursor-pointer-mode";
    } else if (tool === 'text' || tool === 'image') {
        canvas.style.pointerEvents = 'none';
        textLayer.style.pointerEvents = 'auto';
        canvas.className = "";
    } else {
        canvas.style.pointerEvents = 'auto';
        textLayer.style.pointerEvents = 'none';
        canvas.className = "";
        if (tool === 'pencil') {
            canvas.classList.add('cursor-pencil-mode');
        } else if (tool === 'pen') {
            canvas.classList.add('cursor-pen-mode');
        } else if (tool === 'highlighter') {
            canvas.classList.add('cursor-highlighter-mode');
        } else if (tool === 'eraser') {
            canvas.classList.add('cursor-eraser-mode');
        }
    }
}

let isCreatingBox = false;
let startBoxX = 0;
let startBoxY = 0;
let activeBoxPreview = null;

textLayer.addEventListener('pointerdown', (e) => {
    if (currentTool !== 'text') return;
    if (e.target.closest('.draggable-text-box') || e.target.closest('.draggable-image-box')) return;

    const coords = getCanvasCoordinates(e);
    isCreatingBox = true;
    startBoxX = coords.x;
    startBoxY = coords.y;

    activeBoxPreview = document.createElement('div');
    activeBoxPreview.className = 'draggable-text-box';
    activeBoxPreview.style.left = `${startBoxX}px`;
    activeBoxPreview.style.top = `${startBoxY}px`;
    activeBoxPreview.style.width = `280px`;
    activeBoxPreview.style.height = `90px`;
    textLayer.appendChild(activeBoxPreview);

    if (activeBoxPreview.setPointerCapture) {
        activeBoxPreview.setPointerCapture(e.pointerId);
    }
});

textLayer.addEventListener('pointermove', (e) => {
    if (!isCreatingBox || !activeBoxPreview) return;
    const coords = getCanvasCoordinates(e);

    const width = Math.max(120, coords.x - startBoxX);
    const height = Math.max(50, coords.y - startBoxY);

    activeBoxPreview.style.width = `${width}px`;
    activeBoxPreview.style.height = `${height}px`;
});

const finalizeTextBox = (e) => {
    if (!isCreatingBox) return;
    isCreatingBox = false;

    if (activeBoxPreview) {
        const box = activeBoxPreview;
        activeBoxPreview = null;

        box.innerHTML = `
            <div class="text-header" style="z-index: 1003; touch-action: none;">
                <span class="drag-handle" style="pointer-events: auto;"><i class="fa-solid fa-arrows-up-down-left-right"></i> Move Note</span>
                <div class="flex items-center gap-1.5" style="pointer-events: auto; overflow: visible;">
                    <select class="text-size-select text-[11px] font-semibold bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200 outline-none cursor-pointer" style="pointer-events: auto;" title="Preset Size">
                        <option value="14px">Sm</option>
                        <option value="18px" selected>Md</option>
                        <option value="24px">Lg</option>
                        <option value="32px">Xl</option>
                    </select>
                    <input type="number" class="text-size-input text-[11px] font-semibold bg-slate-100 rounded px-1 py-0.5 border border-slate-200 outline-none w-12 text-center" value="18" min="8" max="120" style="pointer-events: auto;" title="Custom Font Size (px)" />
                    <button type="button" class="format-btn bold-btn" style="pointer-events: auto;" title="Bold"><i class="fa-solid fa-bold"></i></button>
                    <button type="button" class="format-btn italic-btn" style="pointer-events: auto;" title="Italic"><i class="fa-solid fa-italic"></i></button>
                    <button type="button" class="format-btn underline-btn" style="pointer-events: auto;" title="Underline"><i class="fa-solid fa-underline"></i></button>
                    
                    <div class="color-picker-wrapper" style="pointer-events: auto;">
                        <div class="color-picker-btn" style="background-color: #1e293b;" title="Text Color"></div>
                        <div class="color-dropdown">
                            <div class="color-palette-grid">
                                <div class="color-option" style="background-color: #000000;" data-color="#000000"></div>
                                <div class="color-option" style="background-color: #1e293b;" data-color="#1e293b"></div>
                                <div class="color-option" style="background-color: #475569;" data-color="#475569"></div>
                                <div class="color-option" style="background-color: #64748b;" data-color="#64748b"></div>
                                <div class="color-option" style="background-color: #ffffff; border: 1px solid #cbd5e1;" data-color="#ffffff"></div>
                                
                                <div class="color-option" style="background-color: #dc2626;" data-color="#dc2626"></div>
                                <div class="color-option" style="background-color: #ea580c;" data-color="#ea580c"></div>
                                <div class="color-option" style="background-color: #ca8a04;" data-color="#ca8a04"></div>
                                <div class="color-option" style="background-color: #16a34a;" data-color="#16a34a"></div>
                                <div class="color-option" style="background-color: #0d9488;" data-color="#0d9488"></div>

                                <div class="color-option" style="background-color: #2563eb;" data-color="#2563eb"></div>
                                <div class="color-option" style="background-color: #4f46e5;" data-color="#4f46e5"></div>
                                <div class="color-option" style="background-color: #9333ea;" data-color="#9333ea"></div>
                                <div class="color-option" style="background-color: #db2777;" data-color="#db2777"></div>
                                <div class="color-option" style="background-color: #e11d48;" data-color="#e11d48"></div>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="delete-box text-error hover:opacity-75 ml-1" style="pointer-events: auto;" title="Delete"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <textarea placeholder="Type note here..." style="font-size: 18px; color: #1e293b; pointer-events: auto;"></textarea>
        `;

        const textarea = box.querySelector('textarea');
        const colorBtn = box.querySelector('.color-picker-btn');
        const colorDropdown = box.querySelector('.color-dropdown');
        const sizeSelect = box.querySelector('.text-size-select');
        const sizeInput = box.querySelector('.text-size-input');
        const boldBtn = box.querySelector('.bold-btn');
        const italicBtn = box.querySelector('.italic-btn');
        const underlineBtn = box.querySelector('.underline-btn');
        const deleteBtn = box.querySelector('.delete-box');
        const dragHandle = box.querySelector('.text-header');

        function applyColor(hex) {
            textarea.style.color = hex;
            colorBtn.style.backgroundColor = hex;
        }

        colorBtn.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            if (currentTool !== 'text') return;
            const isOpen = colorDropdown.classList.contains('show');
            document.querySelectorAll('.color-dropdown').forEach(d => d.classList.remove('show'));
            if (!isOpen) {
                colorDropdown.classList.add('show');
            }
        });

        box.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('pointerdown', (event) => {
                event.stopPropagation();
                if (currentTool !== 'text') return;
                const hex = event.target.getAttribute('data-color');
                applyColor(hex);
                colorDropdown.classList.remove('show');
            });
        });

        document.addEventListener('pointerdown', (event) => {
            if (!box.contains(event.target) && !colorDropdown.contains(event.target)) {
                colorDropdown.classList.remove('show');
            }
        });

        sizeSelect.addEventListener('change', (event) => {
            if (currentTool !== 'text') return;
            const val = event.target.value;
            sizeInput.value = parseInt(val);
            textarea.style.fontSize = val;
        });
        sizeSelect.addEventListener('pointerdown', (event) => event.stopPropagation());

        sizeInput.addEventListener('input', (event) => {
            if (currentTool !== 'text') return;
            const val = event.target.value;
            if (val && !isNaN(val)) {
                textarea.style.fontSize = `${val}px`;
            }
        });
        sizeInput.addEventListener('pointerdown', (event) => event.stopPropagation());

        boldBtn.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            if (currentTool !== 'text') return;
            boldBtn.classList.toggle('active');
            textarea.style.fontWeight = boldBtn.classList.contains('active') ? 'bold' : 'normal';
        });

        italicBtn.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            if (currentTool !== 'text') return;
            italicBtn.classList.toggle('active');
            textarea.style.fontStyle = italicBtn.classList.contains('active') ? 'italic' : 'normal';
        });

        underlineBtn.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            if (currentTool !== 'text') return;
            underlineBtn.classList.toggle('active');
            textarea.style.textDecoration = underlineBtn.classList.contains('active') ? 'underline' : 'none';
        });

        deleteBtn.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            if (currentTool !== 'text') return;
            colorDropdown.remove();
            box.remove();
        });

        let isDragging = false;
        let startX, startY;

        dragHandle.addEventListener('pointerdown', (ev) => {
            if (currentTool !== 'text') return;
            isDragging = true;
            const coords = getCanvasCoordinates(ev);
            const boxLeft = parseFloat(box.style.left) || 0;
            const boxTop = parseFloat(box.style.top) || 0;
            startX = coords.x - boxLeft;
            startY = coords.y - boxTop;
            dragHandle.setPointerCapture(ev.pointerId);
            ev.stopPropagation();
        });

        dragHandle.addEventListener('pointermove', (ev) => {
            if (!isDragging || currentTool !== 'text') return;
            const coords = getCanvasCoordinates(ev);
            box.style.left = `${coords.x - startX}px`;
            box.style.top = `${coords.y - startY}px`;
        });

        const stopDrag = (ev) => {
            if (!isDragging) return;
            isDragging = false;
            try { dragHandle.releasePointerCapture(ev.pointerId); } catch (e) {}
        };

        dragHandle.addEventListener('pointerup', stopDrag);
        dragHandle.addEventListener('pointercancel', stopDrag);

        textarea.focus();
    }
};

textLayer.addEventListener('pointerup', finalizeTextBox);
textLayer.addEventListener('pointercancel', finalizeTextBox);

window.addEventListener('paste', (e) => {
    if (currentTool !== 'image') return;
    
    const items = e.clipboardData || e.originalEvent.clipboardData;
    if (!items) return;

    for (let i = 0; i < items.items.length; i++) {
        if (items.items[i].type.indexOf('image') !== -1) {
            const blob = items.items[i].getAsFile();
            const reader = new FileReader();

            reader.onload = function(event) {
                createDraggableImage(event.target.result);
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            break;
        }
    }
});

function createDraggableImage(dataSrc) {
    const box = document.createElement('div');
    box.className = 'draggable-image-box';
    
    const coords = getCanvasCoordinates({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    const posX = coords.x - 160;
    const posY = coords.y - 120;

    box.style.left = `${Math.max(20, posX)}px`;
    box.style.top = `${Math.max(20, posY)}px`;
    box.style.width = '320px';
    box.style.height = '240px';

    box.innerHTML = `
        <div class="img-header">
            <span class="drag-handle"><i class="fa-solid fa-arrows-up-down-left-right"></i> Drag & Resize Image</span>
            <div class="flex items-center gap-1">
                <button type="button" class="reset-img-size bg-white/80 hover:bg-white text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold" title="Reset Size">Reset</button>
                <button type="button" class="delete-img text-error hover:opacity-75 font-bold px-1.5" title="Remove Image"><i class="fa-solid fa-xmark text-sm"></i></button>
            </div>
        </div>
        <img src="${dataSrc}" alt="Pasted Explanation Image" />
    `;

    textLayer.appendChild(box);

    const dragHandle = box.querySelector('.img-header');
    const deleteBtn = box.querySelector('.delete-img');
    const resetSizeBtn = box.querySelector('.reset-img-size');

    deleteBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        box.remove();
    });

    resetSizeBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        box.style.width = '320px';
        box.style.height = '240px';
    });

    let isDraggingImg = false;
    let startX, startY;

    dragHandle.addEventListener('pointerdown', (ev) => {
        if (currentTool !== 'image') return;
        isDraggingImg = true;
        const coords = getCanvasCoordinates(ev);
        const boxLeft = parseFloat(box.style.left) || 0;
        const boxTop = parseFloat(box.style.top) || 0;
        startX = coords.x - boxLeft;
        startY = coords.y - boxTop;
        dragHandle.setPointerCapture(ev.pointerId);
        ev.stopPropagation();
    });

    dragHandle.addEventListener('pointermove', (ev) => {
        if (!isDraggingImg || currentTool !== 'image') return;
        const coords = getCanvasCoordinates(ev);
        box.style.left = `${coords.x - startX}px`;
        box.style.top = `${coords.y - startY}px`;
    });

    const stopImgDrag = (ev) => {
        if (!isDraggingImg) return;
        isDraggingImg = false;
        try { dragHandle.releasePointerCapture(ev.pointerId); } catch (err) {}
    };

    dragHandle.addEventListener('pointerup', stopImgDrag);
    dragHandle.addEventListener('pointercancel', stopImgDrag);

    showToolIndicator("Image pasted! Resize it from the bottom-right corner or drag by the header.", "success");
}

canvas.addEventListener('pointerdown', (e) => {
    if (currentTool === 'pointer' || currentTool === 'text' || currentTool === 'image') return;
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    if (canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || currentTool === 'pointer' || currentTool === 'text' || currentTool === 'image') return;
    e.preventDefault();

    const coords = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    
    if (currentTool === 'pencil') {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
    } else if (currentTool === 'highlighter') {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 24;
        ctx.lineCap = 'butt';
        ctx.globalCompositeOperation = 'source-over';
    } else if (currentTool === 'pen') {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.stroke();
    lastX = coords.x;
    lastY = coords.y;
});

const stopDrawing = (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    if (e && canvas.releasePointerCapture && e.pointerId !== undefined) {
        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (err) {}
    }
};

canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointercancel', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    textLayer.innerHTML = '';
}

function scrollToSection(sectionId) {
    if (document.activeElement) {
        document.activeElement.blur();
    }

    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname);
        }
    }
}

function scaleAppCanvas() {
    const wrapper = document.getElementById('app-scaler-wrapper');
    const canvasElement = document.getElementById('app-canvas');

    if (!wrapper || !canvasElement) return;

    const baseWidth = 1000;
    const availableWidth = wrapper.clientWidth;

    if (availableWidth < baseWidth) {
        const scale = availableWidth / baseWidth;

        canvasElement.style.transform = `scale(${scale})`;
        canvasElement.style.transformOrigin = 'top left';
        canvasElement.style.position = 'relative';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';

        const unscaledHeight = canvasElement.scrollHeight;
        const scaledHeight = unscaledHeight * scale;
        canvasElement.style.marginBottom = `-${unscaledHeight - scaledHeight}px`;
    } else {
        canvasElement.style.transform = 'scale(1)';
        canvasElement.style.position = 'relative';
        canvasElement.style.top = '';
        canvasElement.style.left = '';
        canvasElement.style.marginBottom = '0px';
    }

    resizeCanvas();
    if (typeof window.refreshMatchingLines === 'function') {
        window.refreshMatchingLines();
    }
}

window.addEventListener('resize', scaleAppCanvas);
window.addEventListener('load', scaleAppCanvas);
setTimeout(scaleAppCanvas, 500);
setTimeout(scaleAppCanvas, 1500);

function downloadLessonPDF() {
    if (typeof showToast === 'function') {
        showToast("Opening print dialog to save as PDF...", "success");
    }

    setTimeout(() => {
        window.print();
    }, 300);
}
