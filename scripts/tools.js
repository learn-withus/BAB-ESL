const canvas = document.getElementById('annotation-canvas');
const ctx = canvas.getContext('2d');
const textLayer = document.getElementById('text-layer');
let currentTool = 'pointer';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isToolbarExpanded = false;

canvas.style.zIndex = '1010';
textLayer.style.zIndex = '1001';

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

    /* Active text tool states */
    body.text-tool-active .draggable-text-box {
        pointer-events: auto;
        backdrop-filter: blur(2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border:solid .1px;
        resize: both; 
    }

    body.text-tool-active .draggable-text-box:hover,
    body.text-tool-active .draggable-text-box:focus-within {
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .draggable-text-box .text-header {
        display: flex;
        visibility: hidden;
        opacity: 0;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        font-size: 10px;
        color: #64748b;
        margin-bottom: 4px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 2px;
        transition: opacity 0.2s;
        flex-shrink: 0;
        overflow: visible !important;
    }

    body.text-tool-active .draggable-text-box .text-header {
        visibility: visible;
    }

    body.text-tool-active .draggable-text-box:hover .text-header,
    body.text-tool-active .draggable-text-box:focus-within .text-header {
        opacity: 1;
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
    .advanced-picker-container {
        border-top: 1px solid #f1f5f9;
        padding-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .custom-gradient-box {
        position: relative;
        width: 100%;
        height: 85px;
        border-radius: 6px;
        overflow: hidden;
        cursor: crosshair;
        background: linear-gradient(to right, #fff, hsl(215, 100%, 50%));
    }
    .custom-gradient-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, #000, transparent);
    }
    .gradient-cursor {
        position: absolute;
        width: 10px;
        height: 10px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 0 3px rgba(0,0,0,0.5);
    }
    .hue-slider-container {
        display: flex;
        align-items: center;
    }
    .hue-slider {
        flex: 1;
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
        outline: none;
        cursor: pointer;
    }
    .hue-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 1.5px solid #94a3b8;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .rgb-inputs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }
    .rgb-field {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 9px;
        color: #94a3b8;
        font-weight: 500;
    }
    .rgb-field input {
        width: 100%;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        text-align: center;
        font-size: 11px;
        font-weight: 500;
        color: #334155;
        padding: 2px 0;
        outline: none;
    }
    .rgb-field input:focus {
        border-color: #3b82f6;
        background: #ffffff;
    }
`;
document.head.appendChild(styleEl);

function resizeCanvas() {
    canvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
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
    } else {
        document.body.classList.remove('text-tool-active');
        document.querySelectorAll('.color-dropdown').forEach(d => d.classList.remove('show'));
    }

    canvas.className = "absolute top-0 left-0 z-[1010] touch-none";
    if (tool === 'pointer') {
        canvas.style.pointerEvents = 'none';
        textLayer.style.pointerEvents = 'none';
        canvas.classList.add('cursor-pointer-mode');
    } else if (tool === 'text') {
        canvas.style.pointerEvents = 'none';
        textLayer.style.pointerEvents = 'auto';
    } else {
        canvas.style.pointerEvents = 'auto';
        textLayer.style.pointerEvents = 'none';
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

function hexToRgb(hex) {
    let bigint = parseInt(hex.replace('#', ''), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

let isCreatingBox = false;
let startBoxX = 0;
let startBoxY = 0;
let activeBoxPreview = null;

textLayer.addEventListener('pointerdown', (e) => {
    if (currentTool !== 'text') return;
    if (e.target.closest('.draggable-text-box')) return;

    isCreatingBox = true;
    startBoxX = e.clientX + window.scrollX;
    startBoxY = e.clientY + window.scrollY;

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
    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    const width = Math.max(120, currentX - startBoxX);
    const height = Math.max(50, currentY - startBoxY);

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
                <span class="drag-handle" style="pointer-events: auto;"><i class="fa-solid fa-arrows-up-down-left-right"></i> Move</span>
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
                            <div class="advanced-picker-container">
                                <div class="custom-gradient-box" style="background: linear-gradient(to right, #fff, hsl(215, 100%, 50%));">
                                    <div class="custom-gradient-overlay"></div>
                                    <div class="gradient-cursor" style="top: 50%; left: 50%;"></div>
                                </div>
                                <div class="hue-slider-container">
                                    <input type="range" min="0" max="360" value="215" class="hue-slider">
                                </div>
                                <div class="rgb-inputs">
                                    <div class="rgb-field">
                                        <input type="number" class="rgb-r" value="30" min="0" max="255">
                                        <span>R</span>
                                    </div>
                                    <div class="rgb-field">
                                        <input type="number" class="rgb-g" value="41" min="0" max="255">
                                        <span>G</span>
                                    </div>
                                    <div class="rgb-field">
                                        <input type="number" class="rgb-b" value="59" min="0" max="255">
                                        <span>B</span>
                                    </div>
                                </div>
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
        const gradientBox = box.querySelector('.custom-gradient-box');
        const gradientCursor = box.querySelector('.gradient-cursor');
        const hueSlider = box.querySelector('.hue-slider');
        const rgbR = box.querySelector('.rgb-r');
        const rgbG = box.querySelector('.rgb-g');
        const rgbB = box.querySelector('.rgb-b');
        const sizeSelect = box.querySelector('.text-size-select');
        const sizeInput = box.querySelector('.text-size-input');
        const boldBtn = box.querySelector('.bold-btn');
        const italicBtn = box.querySelector('.italic-btn');
        const underlineBtn = box.querySelector('.underline-btn');
        const deleteBtn = box.querySelector('.delete-box');
        const dragHandle = box.querySelector('.text-header');

        let currentHue = 215;

        function applyColor(r, g, b) {
            const hex = rgbToHex(r, g, b);
            textarea.style.color = hex;
            colorBtn.style.backgroundColor = hex;
            rgbR.value = r;
            rgbG.value = g;
            rgbB.value = b;
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
                const rgb = hexToRgb(hex);
                applyColor(rgb.r, rgb.g, rgb.b);
                colorDropdown.classList.remove('show');
            });
        });

        hueSlider.addEventListener('input', (e) => {
            if (currentTool !== 'text') return;
            currentHue = e.target.value;
            gradientBox.style.background = `linear-gradient(to right, #fff, hsl(${currentHue}, 100%, 50%))`;
        });
        hueSlider.addEventListener('pointerdown', (e) => e.stopPropagation());

        [rgbR, rgbG, rgbB].forEach(input => {
            input.addEventListener('input', () => {
                if (currentTool !== 'text') return;
                applyColor(
                    Math.min(255, Math.max(0, parseInt(rgbR.value) || 0)),
                    Math.min(255, Math.max(0, parseInt(rgbG.value) || 0)),
                    Math.min(255, Math.max(0, parseInt(rgbB.value) || 0))
                );
            });
            input.addEventListener('pointerdown', (e) => e.stopPropagation());
        });

        function updateColorFromGradient(e) {
            if (currentTool !== 'text') return;
            const rect = gradientBox.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

            gradientCursor.style.left = `${x}px`;
            gradientCursor.style.top = `${y}px`;

            const sat = x / rect.width;
            const val = 1 - (y / rect.height);

            let c = val * sat;
            let hPrime = currentHue / 60;
            let xVal = c * (1 - Math.abs((hPrime % 2) - 1));
            let m = val - c;

            let r = 0, g = 0, b = 0;
            if (0 <= hPrime && hPrime < 1) { r = c; g = xVal; b = 0; }
            else if (1 <= hPrime && hPrime < 2) { r = xVal; g = c; b = 0; }
            else if (2 <= hPrime && hPrime < 3) { r = 0; g = c; b = xVal; }
            else if (3 <= hPrime && hPrime < 4) { r = 0; g = xVal; b = c; }
            else if (4 <= hPrime && hPrime < 5) { r = xVal; g = 0; b = c; }
            else if (5 <= hPrime && hPrime <= 6) { r = c; g = 0; b = xVal; }

            applyColor(
                Math.round((r + m) * 255),
                Math.round((g + m) * 255),
                Math.round((b + m) * 255)
            );
        }

        let isPickingGradient = false;
        gradientBox.addEventListener('pointerdown', (e) => {
            if (currentTool !== 'text') return;
            isPickingGradient = true;
            gradientBox.setPointerCapture(e.pointerId);
            updateColorFromGradient(e);
            e.stopPropagation();
        });

        gradientBox.addEventListener('pointermove', (e) => {
            if (!isPickingGradient || currentTool !== 'text') return;
            updateColorFromGradient(e);
        });

        gradientBox.addEventListener('pointerup', (e) => {
            if (!isPickingGradient) return;
            isPickingGradient = false;
            try { gradientBox.releasePointerCapture(e.pointerId); } catch (err) {}
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
            const boxRect = box.getBoundingClientRect();
            startX = ev.clientX - boxRect.left;
            startY = ev.clientY - boxRect.top;
            dragHandle.setPointerCapture(ev.pointerId);
            ev.stopPropagation();
        });

        dragHandle.addEventListener('pointermove', (ev) => {
            if (!isDragging || currentTool !== 'text') return;
            
            const newX = ev.clientX - startX + window.scrollX;
            const newY = ev.clientY - startY + window.scrollY;
            
            box.style.left = `${newX}px`;
            box.style.top = `${newY}px`;
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

canvas.addEventListener('pointerdown', (e) => {
    if (currentTool === 'pointer' || currentTool === 'text') return;
    isDrawing = true;
    [lastX, lastY] = [e.pageX, e.pageY];
    if (canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || currentTool === 'pointer' || currentTool === 'text') return;
    e.preventDefault();

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.pageX, e.pageY);
    
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
    [lastX, lastY] = [e.pageX, e.pageY];
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
