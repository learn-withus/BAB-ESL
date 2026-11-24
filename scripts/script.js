const BASE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5Le80We_5fuOKOBssT2UoU6__He44rpgooYVsspXAgAaoFrJEyluqFt0n14XAswBUqUu6AGYZGROP/pub?output=csv";

function getTargetUrl() {
    const pageName = window.location.pathname.split("/").pop();
    let gid = "588839342";
    
    if (pageName === "work-life-balance.html") { 
        gid = "1046478803"; 
    } else if (pageName === "workplace-ethics.html") { 
        gid = "419566462"; 
    } else if (pageName === "restaurant.html") { 
        gid = "2143243191"; 
    } else if (pageName === "sports-lesson.html") { 
        gid = "701455683"; 
    }else if (pageName === "library.html") { 
        gid = "1501469941"; 
    }else if (pageName === "bus-stop.html") { 
        gid = "854914477"; 
    }else if (pageName === "super-market.html") { 
        gid = "194983758"; 
    }else if (pageName === "kitchen-cooking.html") { 
        gid = "623093054"; 
    }else if (pageName === "park.html") { 
        gid = "554789066"; 
    }else if (pageName === "museums.html") { 
        gid = "2014280738"; 
    }else if (pageName === "school-life.html") { 
        gid = "397161364"; 
    }else if (pageName === "hospital-healthcare.html") { 
        gid = "430706715"; 
    }else if (pageName === "hotels-airports.html") { 
        gid = "640249755"; 
    }else if (pageName === "commuting-directions.html") { 
        gid = "1276818449"; 
    }else if (pageName === "cafe.html") { 
        gid = "1707849456"; 
    }else if (pageName === "driving.html") { 
        gid = "722787312"; 
    }else if (pageName === "managing-busy-schedule.html") { 
        gid = "316995005"; 
    }else if (pageName === "zoo.html") { 
        gid = "2026705033"; 
    }else if (pageName === "drugstore.html") { 
        gid = "618954762"; 
    }else if (pageName === "workplace-ethics-v2.html") { 
        gid = "305843140"; 
    }else if (pageName === "music.html") { 
        gid = "1612140327"; 
    }else if (pageName === "seminar-meeting.html") { 
        gid = "976937025"; 
    }else if (pageName === "beach.html") { 
        gid = "1820585086"; 
    }else if (pageName === "stationery.html") { 
        gid = "804218952"; 
    }else if (pageName === "barber.html") { 
        gid = "2112999551"; 
    }else if (pageName === "security.html") { 
        gid = "2143141595"; 
    }else if (pageName === "festival.html") { 
        gid = "1336216649"; 
    }else if (pageName === "agriculture.html") { 
        gid = "321712139"; 
    }else if (pageName === "ophthalmologist.html") { 
        gid = "1007134737"; 
    }else if (pageName === "basic-conversation.html") { 
        gid = "1740118721"; 
    }else if (pageName === "self-introduction.html") { 
        gid = "1665859797"; 
    }else if (pageName === "ambulance.html") { 
        gid = "80659976"; 
    }else if (pageName === "parts-of-speech.html") { 
        gid = "950660383"; 
    }else if (pageName === "bedroom.html") { 
        gid = "417717862"; 
    }else if (pageName === "shopping.html") { 
        gid = "1286332758"; 
    }else if (pageName === "school-parenting.html") { 
        gid = "931512612"; 
    }else if (pageName === "bathroom.html") { 
        gid = "1669556193"; 
    }else if (pageName === "mountain-climbing.html") { 
        gid = "1631515039"; 
    }else if (pageName === "school-parenting-shopping-survival-english.html") { 
        gid = "488262510"; 
    }else if (pageName === "bank.html") { 
        gid = "1999734990"; 
    }else if (pageName === "at-the-hospital.html") { 
        gid = "976336238"; 
    }else if (pageName === "bank-v2.html") { 
        gid = "374487847"; 
    }else if (pageName === "wildlife.html") { 
        gid = "1626658698"; 
    }

    
    return `${BASE_CSV_URL}&gid=${gid}`;
}
const CSV_URL = getTargetUrl();
let quizData = [];
let dialogue = [];
let warmupData = [];
let vocabData = [];
let readingData = [];
let speakingData = [];
let voices = [];
let currentLine = 0;
let isSpeaking = false; 

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        parseCSV(csvText);
        
        renderLessonSection("warmup-section", "warmup-container", warmupData);
        renderLessonSection("vocab-section", "vocab-container", vocabData);
        renderLessonSection("reading-section", "reading-container", readingData);
        renderLessonSection("speaking-section", "speaking-container", speakingData);
        
        if (dialogue.length > 0) {
            const voiceControls = document.getElementById("voice-controls-container");
            if (voiceControls) {
                setupSpeakerControls(); 
                renderDialogue();
            }
        }
        if (quizData.length > 0) loadQuestion();

        if (typeof loadNoteFromSheet === 'function') {
            loadNoteFromSheet(); 
        }

    } catch (e) { console.error("Connection Error:", e); }
}

function parseCSV(text) {
    const rows = text.split(/\r?\n/);
    quizData = []; dialogue = []; 
    warmupData = []; vocabData = []; readingData = []; speakingData = [];
    
    let currentSection = "warmup";

    rows.forEach((row, index) => {
        if (index === 0 || !row.trim()) return;
        const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());
        const type = cleanCols[0]?.toUpperCase();
        const colB = cleanCols[1] || "";
        const colC = cleanCols[2] || "";
        const colBLower = colB.toLowerCase();

        if (type === "TEXT" && (colBLower.startsWith("i.") || colBLower.startsWith("ii.") || colBLower.startsWith("iii.") || colBLower.startsWith("iv.") || colBLower.includes("warm-up 🏋️") || colBLower.includes("vocabulary 📖"))) {
            if (colBLower.includes("warm-up") || colBLower.includes("warmup")) {
                currentSection = "warmup";
            } else if (colBLower.includes("vocabulary") || colBLower.includes("vocab")) {
                currentSection = "vocab";
            } else if (colBLower.includes("reading")) {
                currentSection = "reading";
            } else if (colBLower.includes("speaking")) {
                currentSection = "speaking";
            }
            return;
        }

        if (type === "TEXT") {
            if (!colB && !colC) {
                const gapItem = { label: "", text: "", isSubheader: false, isGap: true };
                if (currentSection === "warmup") warmupData.push(gapItem);
                else if (currentSection === "vocab") vocabData.push(gapItem);
                else if (currentSection === "reading") readingData.push(gapItem);
                else if (currentSection === "speaking") speakingData.push(gapItem);
                return;
            }

            const isSubheader = colB !== "" && (
                colBLower.includes("vocabulary words and meanings") || 
                colBLower.includes("vocabulary") ||
                colBLower.includes("sentence practice") || 
                colBLower.includes("comprehension questions") || 
                colBLower.includes("fluency task") ||
                colBLower.includes("practice") ||
                colBLower.includes("questions")
            );
            
            if (isSubheader) {
                const subItem = { label: colB, text: "", isSubheader: true };
                if (currentSection === "warmup") warmupData.push(subItem);
                else if (currentSection === "vocab") vocabData.push(subItem);
                else if (currentSection === "reading") readingData.push(subItem);
                else if (currentSection === "speaking") speakingData.push(subItem);

                if (colC) {
                    const contentItem = { label: "", text: colC, isSubheader: false };
                    if (currentSection === "warmup") warmupData.push(contentItem);
                    else if (currentSection === "vocab") vocabData.push(contentItem);
                    else if (currentSection === "reading") readingData.push(contentItem);
                    else if (currentSection === "speaking") speakingData.push(contentItem);
                }
                return;
            }

            const item = { label: colB, text: colC, isSubheader: false };

            if (currentSection === "warmup") {
                warmupData.push(item);
            } else if (currentSection === "vocab") {
                vocabData.push(item);
            } else if (currentSection === "reading") {
                readingData.push(item);
            } else if (currentSection === "speaking") {
                speakingData.push(item);
            }
        } else if (type === "HEADING") {
            quizData.push({ type: "HEADING", title: colB });
        } else if (type === "QUIZ") {
            quizData.push({ type: "MULTIPLE", question: colB, choices: [cleanCols[2], cleanCols[3], cleanCols[4], cleanCols[5]], correct: parseInt(cleanCols[6]) || 0 });
        } else if (type === "BLANKS") {
            quizData.push({ type: "BLANKS", sentence: colB, correctAnswer: colC?.toLowerCase().trim() });
        } else if (type === "MATCHING") {
            quizData.push({ type: "MATCHING", term: colB, definition: colC });
        } else if (type === "DIALOGUE") {
            dialogue.push({ speaker: colB, text: colC });
        } else if (type === "SPELLING") {
            quizData.push({ type: "SPELLING", hint: colB, correctAnswer: colC?.toLowerCase().trim() });
        } else if (type === "SCRAMBLE") {
            quizData.push({ type: "SCRAMBLE", hint: colB, correctAnswer: colC?.toUpperCase().trim() });
        }
    });
}

function renderLessonSection(sectionId, containerId, dataArray) {
    const section = document.getElementById(sectionId);
    const container = document.getElementById(containerId);
    if (!section || !container) return;

    if (!dataArray || dataArray.length === 0) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";
    container.innerHTML = "";

    dataArray.forEach(item => {
        const div = document.createElement("div");
        
        if (item.isGap) {
            div.className = "h-4"; 
        } else if (item.isSubheader) {
            div.className = "mt-10 mb-4";
            div.innerHTML = `<h3 class="custom-primary-text italic font-bold">${item.label}</h3>`;
        } else {
            div.className = "mb-3";
            div.innerHTML = `
                ${item.label ? `<span class="font-bold custom-primary-text block mb-1">${item.label}</span>` : ''}
                ${item.text ? `<p class="text-base-content leading-relaxed">${item.text}</p>` : ''}
            `;
        }
        container.appendChild(div);
    });
}

function setupSpeakerControls() {
    const container = document.getElementById("voice-controls-container");
    if (!container) return; container.innerHTML = "";
    const uniqueSpeakers = [...new Set(dialogue.map(line => line.speaker))];
    uniqueSpeakers.forEach((speaker) => {
        const div = document.createElement("div");
        div.className = "text-base-content";
        div.innerHTML = `<strong>${speaker}:</strong> <select id="voice-for-${speaker}" class="select select-bordered select-xs"></select>`;
        container.appendChild(div);
        voices.forEach((v, i) => document.getElementById(`voice-for-${speaker}`).add(new Option(v.name, i)));
    });
}

function renderDialogue() {
    const cont = document.getElementById("fullDialogue");
    if (cont) cont.innerHTML = dialogue.map((line, i) => `<div id="line-${i}" class="p-1.5 rounded text-base-content"><strong>${line.speaker}:</strong> ${line.text}</div>`).join("");
}

function playDialogue() { 
    speechSynthesis.cancel(); 
    isSpeaking = true; 
    currentLine = 0; 

    setTimeout(() => {
        speakLine();
    }, 50);
}

function stopDialogue() { 
    isSpeaking = false; 
    speechSynthesis.cancel(); 
    
    dialogue.forEach((_, i) => {
        const el = document.getElementById(`line-${i}`);
        if(el) {
            el.classList.remove('bg-primary/20', 'font-medium');
            el.style.background = "";
        }
    });
}

function speakLine() {
    if (!isSpeaking || currentLine >= dialogue.length) {
        isSpeaking = false;
        dialogue.forEach((_, i) => {
            const el = document.getElementById(`line-${i}`);
            if(el) el.classList.remove('bg-primary/20', 'font-medium');
        });
        return;
    }
    
    const line = dialogue[currentLine];
    const ut = new SpeechSynthesisUtterance(line.text);
    const sel = document.getElementById(`voice-for-${line.speaker}`);
    if (sel && voices[sel.value]) ut.voice = voices[sel.value];

    dialogue.forEach((_, i) => {
        const el = document.getElementById(`line-${i}`);
        if(el) {
            if (i === currentLine) {
                el.classList.add('bg-primary/20', 'font-medium');
            } else {
                el.classList.remove('bg-primary/20', 'font-medium');
            }
        }
    });

    let speechCompleted = false;
    
    ut.onend = () => { 
        if (speechCompleted) return;
        speechCompleted = true;
        if (isSpeaking) {
            currentLine++; 
            speakLine(); 
        }
    };

    ut.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        if (speechCompleted) return;
        speechCompleted = true;
        if (isSpeaking) {
            currentLine++; 
            speakLine();
        }
    };

    speechSynthesis.speak(ut);
}

function scrambleWordPhrase(phrase) {
    if (!phrase || phrase.length <= 1) return phrase;
    
    let letters = phrase.split('');
    let scrambled;
    let attempts = 0;

    do {
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        scrambled = letters.join('');
        attempts++;
    } while (scrambled === phrase && attempts < 20);

    if (scrambled === phrase) {
        return phrase.substring(1) + phrase.charAt(0);
    }
    return scrambled;
}

function handleScrambleLetterClick(letterEl, realIndex) {
    const targetBox = document.getElementById(`scramble-target-${realIndex}`);
    const poolBox = document.getElementById(`scramble-pool-${realIndex}`);
    const hiddenInput = document.getElementById(`scramble-${realIndex}`);
    const placeholder = document.getElementById(`placeholder-${realIndex}`);

    if (placeholder) placeholder.style.display = 'none';

    const isSpace = letterEl.getAttribute('data-letter') === ' ';

    if (letterEl.parentNode === poolBox) {
        targetBox.appendChild(letterEl);
        
        if (isSpace) {
            letterEl.style.backgroundColor = 'transparent';
            letterEl.style.boxShadow = 'none';
            letterEl.style.color = 'transparent';
            letterEl.style.border = 'none';
        } else {
            letterEl.className = letterEl.className.replace('bg-warning', 'custom-primary-bg');
        }
    } else {
        poolBox.appendChild(letterEl);
        
        if (isSpace) {
            letterEl.className = "inline-flex items-center justify-center w-[60px] h-[35px] text-lg font-bold text-white bg-neutral rounded-md cursor-pointer select-none shadow-sm transition-transform duration-100";
            letterEl.style.color = '#fff';
            letterEl.style.border = 'none';
        } else {
            letterEl.className = "inline-flex items-center justify-center w-[35px] h-[35px] text-lg font-bold text-white custom-primary-bg rounded-md cursor-pointer select-none shadow-sm transition-transform duration-100";
        }
    }

    const currentLetters = Array.from(targetBox.querySelectorAll('span:not(#placeholder-' + realIndex + ')'))
                                .map(el => el.getAttribute('data-letter'));
    hiddenInput.value = currentLetters.join('');

    if (currentLetters.length === 0 && placeholder) {
        placeholder.style.display = 'block';
    }
}

function loadQuestion() {
    const container = document.getElementById("quiz-list");
    if (!container) return;
    container.innerHTML = ""; 

    let sectionIndex = 0;
    let currentSectionDiv = null;
    let questionCounter = 1;

    const allMatchingDefs = quizData.filter(q => q.type === "MATCHING").map(q => q.definition);
    const shuffledMatchingDefs = [...allMatchingDefs].sort(() => Math.random() - 0.5);

    quizData.forEach((item, index) => {
        if (item.type === "HEADING") {
            if (currentSectionDiv) addSectionControls(container, sectionIndex++);
            
            currentSectionDiv = document.createElement("div");
            currentSectionDiv.id = `section-${sectionIndex}`;
            currentSectionDiv.className = "mb-10 p-6 border border-base-300 rounded-xl bg-base-100 shadow-sm";
            currentSectionDiv.innerHTML = `<h3 class="font-bold custom-primary-text border-b-2 border-primary pb-2 mb-4">${item.title}</h3>`;
            container.appendChild(currentSectionDiv);

            const sectionBlanks = [];
            for (let i = index + 1; i < quizData.length; i++) {
                if (quizData[i].type === "HEADING") break;
                if (quizData[i].type === "BLANKS") sectionBlanks.push(quizData[i].correctAnswer);
            }

            if (sectionBlanks.length > 0) {
                const bank = document.createElement("div");
                bank.id = `word-bank-${sectionIndex}`;
                bank.className = "sticky top-4 z-10 bg-base-200 border-2 border-primary p-4 rounded-xl my-4 text-center shadow-md transition-all duration-300";
                bank.innerHTML = `<p class="font-bold custom-primary-text mb-2">Word Bank</p>`;
                sectionBlanks.sort(() => Math.random() - 0.5).forEach(word => {
                    bank.innerHTML += `<span draggable="true" ondragstart="event.dataTransfer.setData('text', '${word}')" 
                        data-word="${word}"
                        class="inline-block m-1.5 px-4 py-1.5 font-bold text-base-content bg-base-100 border border-primary rounded-lg cursor-grab shadow-xs transition-all duration-300 ease-in-out">${word}</span>`;
                });
                currentSectionDiv.appendChild(bank);
            }
            questionCounter = 1; 
        } else if (currentSectionDiv) {
            currentSectionDiv.appendChild(renderQuestionElement(item, index, questionCounter++, shuffledMatchingDefs, sectionIndex));
        }
    });
    if (currentSectionDiv) addSectionControls(container, sectionIndex);
}

function handleBlankDrop(event, realIndex, sectionIndex) {
    const word = event.dataTransfer.getData('text');
    const input = document.getElementById(`blank-${realIndex}`);
    if (input && word) {
        input.value = word;
        updateWordBank(sectionIndex);
    }
}

function handleBlankInput(realIndex, sectionIndex) {
    updateWordBank(sectionIndex);
}

function updateWordBank(sectionIndex) {
    const bank = document.getElementById(`word-bank-${sectionIndex}`);
    const section = document.getElementById(`section-${sectionIndex}`);
    if (!bank || !section) return;

    const inputs = section.querySelectorAll(`input[data-section="${sectionIndex}"]`);
    const usedWords = Array.from(inputs).map(inp => inp.value.toLowerCase().trim()).filter(val => val !== "");

    const usedCounts = {};
    usedWords.forEach(w => {
        usedCounts[w] = (usedCounts[w] || 0) + 1;
    });

    const wordSpans = bank.querySelectorAll('span[data-word]');
    const seenCounts = {};

    wordSpans.forEach(span => {
        const word = span.getAttribute('data-word').toLowerCase().trim();
        seenCounts[word] = (seenCounts[word] || 0) + 1;
        const currentSeen = seenCounts[word];
        const totalUsed = usedCounts[word] || 0;

        if (currentSeen <= totalUsed) {
            span.style.opacity = '0';
            span.style.transform = 'scale(0.7)';
            span.style.pointerEvents = 'none';
            setTimeout(() => {
                if (currentSeen <= (usedCounts[word] || 0)) {
                    span.style.display = 'none';
                }
            }, 250);
        } else {
            span.style.display = 'inline-block';
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'scale(1)';
                span.style.pointerEvents = 'auto';
            }, 10);
        }
    });
}

function renderQuestionElement(q, realIndex, displayNum, shuffledDefs, sectionIndex) {
    const qDiv = document.createElement("div");
    qDiv.className = "mb-5 p-2.5 text-base-content";

    if (q.type === "BLANKS") {
        const parts = q.sentence.split("___");
        qDiv.innerHTML = `
            <p class="text-base-content"><strong>${displayNum}.</strong> ${parts[0]} 
            <input type="text" id="blank-${realIndex}" data-section="${sectionIndex}"
                   ondragover="event.preventDefault()" 
                   ondrop="event.preventDefault(); handleBlankDrop(event, ${realIndex}, ${sectionIndex})"
                   oninput="handleBlankInput(${realIndex}, ${sectionIndex})"
                   class="input input-bordered input-sm mx-1.5 bg-base-200 text-base-content font-bold inline-block w-auto text-center border-b-2 border-primary transition-all duration-200" placeholder="drag or type your answer."> ${parts[1] || ""}</p>
            <div id="fb-${realIndex}" class="font-bold mt-1.5 text-sm"></div>`;
    } 
    else if (q.type === "SPELLING") {
        qDiv.innerHTML = `
            <p class="text-base-content"><strong>${displayNum}. Spell the word for:</strong> <br>
            <span class="custom-primary-text font-bold block my-2.5">"${q.hint}"</span></p>
            <input type="text" id="spelling-${realIndex}" 
                   placeholder="Type the correct spelling..."
                   class="input input-bordered input-sm w-[220px] text-center bg-base-200 text-base-content font-bold border-b-2 border-success outline-none p-1">
            <div id="fb-${realIndex}" class="font-bold mt-1.5 text-sm"></div>`;
    }
    else if (q.type === "SCRAMBLE") {
        const scrambledText = scrambleWordPhrase(q.correctAnswer);
        const letterArray = scrambledText.split(''); 

        qDiv.innerHTML = `
            <p class="text-base-content"><strong>${displayNum}. Arrange the scrambled letters correctly:</strong> <br>
            <span class="text-xs text-base-content/70 block mb-1.5">Hint: ${q.hint}</span></p>
            
            <div id="scramble-target-${realIndex}" class="flex gap-2 flex-wrap min-h-[45px] p-2.5 border-2 border-dashed border-primary rounded-lg bg-base-200 mb-3 items-center">
                <span class="text-base-content/40 italic text-sm" id="placeholder-${realIndex}">Click letters/spaces below to arrange...</span>
            </div>

            <div id="scramble-pool-${realIndex}" class="flex gap-2 flex-wrap mb-2.5">
             ${letterArray.map((letter) => {
            const isSpace = letter === ' ';
            const displayChar = isSpace ? 'space' : letter;
            const bgClass = isSpace ? 'bg-neutral text-white' : 'custom-primary-bg text-white';
            const blockWidth = isSpace ? 'w-[60px]' : 'w-[35px]';

            return `
                <span onclick="handleScrambleLetterClick(this, ${realIndex})" 
                    data-letter="${letter}" 
                    class="inline-flex items-center justify-center ${blockWidth} h-[35px] font-bold${bgClass} rounded-md cursor-pointer select-none shadow-sm transition-transform duration-100">${displayChar}</span>
            `;
            }).join('')}
             </div>
                
            <input type="hidden" id="scramble-${realIndex}" value="">
            <div id="fb-${realIndex}" class="font-bold mt-1.5 text-sm"></div>`;
    }
    else if (q.type === "MATCHING") {
        qDiv.innerHTML = `
            <div class="line-quiz-container" id="line-quiz-${realIndex}">
                <svg class="line-quiz-svg" id="svg-${realIndex}"></svg>
                
                <div class="line-quiz-column line-quiz-column-left">
                    <div class="line-quiz-item text-base-content">
                        <span><strong>${displayNum}.</strong> ${q.term}</span>
                        <div class="quiz-anchor-dot source-dot" data-idx="${realIndex}" data-val="${q.term}"></div>
                    </div>
                </div>

                <div class="line-quiz-column line-quiz-column-right">
                    ${shuffledDefs.map(d => `
                        <div class="line-quiz-item text-base-content">
                            <div class="quiz-anchor-dot target-dot" data-idx="${realIndex}" data-val="${d}"></div>
                            <span>${d}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <input type="hidden" id="match-${realIndex}" value="">
            <div id="fb-${realIndex}" class="font-bold text-sm text-right mt-1.5"></div>
        `;

        setTimeout(() => connectQuizThreads(realIndex), 50);
    } else {
        qDiv.innerHTML = `<h4 class="font-bold text-base-content mb-2">${displayNum}. ${q.question}</h4>`;
        q.choices.forEach((choice, cIndex) => {
            if (!choice) return;
            qDiv.innerHTML += `<label id="label-q${realIndex}-c${cIndex}" class="block p-1 text-base-content cursor-pointer hover:bg-base-200/50 rounded">
                <input type="radio" name="question${realIndex}" value="${cIndex}" class="radio radio-primary radio-xs mr-2"> ${choice}</label>`;
        });
        qDiv.innerHTML += `<div id="fb-${realIndex}" class="font-bold mt-1.5"></div>`;
    }
    return qDiv;
}

function addSectionControls(container, idx) {
    const div = document.createElement("div");
    div.className = "text-center mt-5 pt-4 border-t border-base-300";
    div.innerHTML = `
        <button onclick="submitSection(${idx})" class="btn custom-primary-bg text-white font-bold px-6">Submit Results</button>
        <button onclick="resetSection(${idx})" class="btn btn-neutral ml-2.5">Reset</button>
        <div id="score-${idx}" class="mt-5 p-4 rounded-xl hidden"></div>`;
    container.lastChild.appendChild(div);
}

function ensureGraffitiStyles() {
    if (document.getElementById('graffiti-perfect-styles')) return;
    const style = document.createElement('style');
    style.id = 'graffiti-perfect-styles';
    style.textContent = `
        .graffiti-fullscreen-overlay {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100010;
            overflow: hidden;
        }
        .graffiti-tag-banner {
            display: inline-block;
            margin-top: 8px;
            padding: 6px 16px;
            border-radius: 999px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            background: linear-gradient(135deg, #ff2a85, #ffbe0b, #00f5d4, #8338ec);
            color: #111827;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3), 2px 2px 0px #ffffff;
            transform: rotate(-2deg) scale(0.5);
            animation: graffitiTagPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .graffiti-wildstyle-svg {
            position: fixed;
            top: 50%;
            left: 50%;
            width: min(92vw, 920px);
            height: auto;
            pointer-events: none;
            opacity: 0;
            transform: translate(-50%, -50%) rotate(-4deg) scale(0.25);
            filter: drop-shadow(0 14px 32px rgba(0, 0, 0, 0.55));
            animation: graffitiWildstyleThrowup 10s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .graffiti-splat-svg {
            position: fixed;
            pointer-events: none;
            opacity: 0;
            filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.32));
            animation: graffitiWallSplat 10s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .graffiti-drip {
            position: fixed;
            border-radius: 0 0 999px 999px;
            pointer-events: none;
            opacity: 0;
            transform-origin: top center;
            animation: graffitiPaintDrip 10s ease-in forwards;
        }
        .graffiti-overspray {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            filter: blur(22px);
            animation: graffitiOversprayFade 10s ease-out forwards;
        }
        .graffiti-speckle {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: graffitiSpeckleBurst 10s ease-out forwards;
        }
        .graffiti-glitter-shard {
            position: fixed;
            pointer-events: none;
            opacity: 0;
            will-change: transform, opacity;
            animation: graffitiGlitterDrift var(--g-dur, 4.2s) cubic-bezier(0.22, 1, 0.36, 1) var(--g-delay, 0s) infinite;
        }
        @keyframes graffitiTagPop {
            0% { opacity: 0; transform: rotate(-10deg) scale(0.4); }
            65% { opacity: 1; transform: rotate(-2deg) scale(1.1); }
            100% { opacity: 1; transform: rotate(-2deg) scale(1); }
        }
        @keyframes graffitiWildstyleThrowup {
            0% { opacity: 0; transform: translate(-50%, -44%) rotate(-12deg) scale(0.25); }
            5% { opacity: 1; transform: translate(-50%, -51%) rotate(-3.5deg) scale(1.06); }
            8% { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
            48% { opacity: 1; transform: translate(-50%, -51.5%) rotate(-3deg) scale(1.02); }
            90% { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1.01); }
            100% { opacity: 0; transform: translate(-50%, -55%) rotate(-2deg) scale(1.05); }
        }
        @keyframes graffitiWallSplat {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.15) rotate(var(--rot0, 0deg));
            }
            4% {
                opacity: 0.96;
                transform: translate(-50%, -50%) scale(1.1) rotate(var(--rot1, 15deg));
            }
            7% {
                opacity: 0.94;
                transform: translate(-50%, -50%) scale(1) rotate(var(--rot1, 15deg));
            }
            91% {
                opacity: 0.92;
                transform: translate(-50%, -50%) scale(1.02) rotate(var(--rot1, 15deg));
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1.05) rotate(var(--rot1, 15deg));
            }
        }
        @keyframes graffitiPaintDrip {
            0% {
                opacity: 0;
                transform: scaleY(0.05);
            }
            6% {
                opacity: 0.94;
                transform: scaleY(0.25);
            }
            35% {
                opacity: 0.92;
                transform: scaleY(0.75);
            }
            91% {
                opacity: 0.9;
                transform: scaleY(1);
            }
            100% {
                opacity: 0;
                transform: scaleY(1.05);
            }
        }
        @keyframes graffitiOversprayFade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
            5% { opacity: 0.45; transform: translate(-50%, -50%) scale(1); }
            90% { opacity: 0.36; transform: translate(-50%, -50%) scale(1.06); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.12); }
        }
        @keyframes graffitiSpeckleBurst {
            0% {
                opacity: 0.95;
                transform: translate(0, 0) scale(0.4);
            }
            12% {
                opacity: 0.9;
                transform: translate(calc(var(--sx, 0px) * 0.7), calc(var(--sy, 0px) * 0.7)) scale(1.05);
            }
            88% {
                opacity: 0.85;
                transform: translate(var(--sx, 0px), var(--sy, 0px)) scale(1.2);
            }
            100% {
                opacity: 0;
                transform: translate(var(--sx, 0px), var(--sy, 0px)) scale(1.25);
            }
        }
        @keyframes graffitiGlitterDrift {
            0% {
                opacity: 0;
                transform: translate3d(0, 0, 0) rotate(0deg) scale(0.25);
            }
            16% {
                opacity: 1;
                transform: translate3d(calc(var(--gx, 0px) * 0.25), calc(var(--gy, 0px) * 0.25), 0) rotate(130deg) scale(1.45);
            }
            50% {
                opacity: 0.55;
                transform: translate3d(calc(var(--gx, 0px) * 0.62), calc(var(--gy, 0px) * 0.62), 0) rotate(310deg) scale(0.75);
            }
            82% {
                opacity: 1;
                transform: translate3d(calc(var(--gx, 0px) * 0.9), calc(var(--gy, 0px) * 0.9), 0) rotate(510deg) scale(1.35);
            }
            100% {
                opacity: 0;
                transform: translate3d(var(--gx, 0px), var(--gy, 0px), 0) rotate(680deg) scale(0.2);
            }
        }
    `;
    document.head.appendChild(style);
}

const CELEBRATION_AUDIO_FILE = "assets/cheer-applause.mp3";

function resolveCelebrationAudioUrl() {
    const pathname = window.location.pathname || "";
    const lowerPath = pathname.toLowerCase();
    const rootMarker = "/bab-esl-main/";
    const markerIdx = lowerPath.indexOf(rootMarker);

    if (markerIdx !== -1) {
        const subPath = pathname.slice(markerIdx + rootMarker.length);
        const parts = subPath.split("/").filter(Boolean);
        const depth = Math.max(0, parts.length - 1);
        const prefix = depth === 0 ? "./" : "../".repeat(depth);
        return `${prefix}${CELEBRATION_AUDIO_FILE}`;
    }

    if (lowerPath.includes("/pages/books/")) {
        return `../../../${CELEBRATION_AUDIO_FILE}`;
    }
    if (lowerPath.includes("/pages/")) {
        return `../${CELEBRATION_AUDIO_FILE}`;
    }
    return `./${CELEBRATION_AUDIO_FILE}`;
}

function playGraffitiCelebrationAudio() {
    try {
        const audioUrl = resolveCelebrationAudioUrl();
        const audio = new Audio(audioUrl);
        audio.volume = 0.85;
        audio.play().catch((err) => {
            console.warn("Celebration audio failed to play from:", audioUrl, err);
            playCelebrationChimeFallback();
        });
    } catch (err) {
        console.error("Celebration audio error:", err);
    }
}

function playCelebrationChimeFallback() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;
        const notes = [
            { freq: 523.25, time: 0.04, dur: 0.16 }, // C5
            { freq: 659.25, time: 0.15, dur: 0.16 }, // E5
            { freq: 783.99, time: 0.26, dur: 0.20 }, // G5
            { freq: 1046.50, time: 0.39, dur: 0.50 } // C6
        ];

        notes.forEach((n) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, now + n.time);

            gain.gain.setValueAtTime(0.001, now + n.time);
            gain.gain.linearRampToValueAtTime(0.14, now + n.time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + n.time);
            osc.stop(now + n.time + n.dur + 0.02);
        });

        setTimeout(() => {
            if (ctx && typeof ctx.close === 'function') {
                ctx.close().catch(() => {});
            }
        }, 1500);
    } catch (_) {}
}

function createWildstyleGraffitiSvg() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 920 340");
    svg.classList.add("graffiti-wildstyle-svg");

    const defs = document.createElementNS(svgNS, "defs");

    const fillGrad = document.createElementNS(svgNS, "linearGradient");
    fillGrad.setAttribute("id", "graffitiWildFill");
    fillGrad.setAttribute("x1", "0%");
    fillGrad.setAttribute("y1", "0%");
    fillGrad.setAttribute("x2", "100%");
    fillGrad.setAttribute("y2", "100%");
    [
        ["0%", "#ffbe0b"],
        ["45%", "#ff2a85"],
        ["100%", "#00f5d4"]
    ].forEach(([offset, color]) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", color);
        fillGrad.appendChild(stop);
    });
    defs.appendChild(fillGrad);

    const arrowGrad = document.createElementNS(svgNS, "linearGradient");
    arrowGrad.setAttribute("id", "graffitiArrowGrad");
    arrowGrad.setAttribute("x1", "0%");
    arrowGrad.setAttribute("y1", "0%");
    arrowGrad.setAttribute("x2", "100%");
    arrowGrad.setAttribute("y2", "0%");
    [
        ["0%", "#9b5de5"],
        ["50%", "#00bbf9"],
        ["100%", "#ffbe0b"]
    ].forEach(([offset, color]) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", color);
        arrowGrad.appendChild(stop);
    });
    defs.appendChild(arrowGrad);

    svg.appendChild(defs);

    // Wildstyle back-burst & directional spray arrows
    const backBurst = document.createElementNS(svgNS, "path");
    backBurst.setAttribute(
        "d",
        "M60,185 L15,130 L85,120 L55,55 L145,88 L195,28 L255,82 L355,34 L410,92 L515,32 L575,88 L680,36 L735,95 L845,52 L815,125 L898,145 L832,205 L885,265 L780,262 L735,318 L630,275 L540,322 L445,274 L330,322 L245,270 L130,312 L105,245 L25,235 Z"
    );
    backBurst.setAttribute("fill", "#8338ec");
    backBurst.setAttribute("stroke", "#111827");
    backBurst.setAttribute("stroke-width", "6");
    backBurst.setAttribute("stroke-linejoin", "round");
    svg.appendChild(backBurst);

    const arrowPaths = [
        "M95,95 L25,45 L42,35 L15,18 L24,52 L38,44 Z",
        "M820,88 L895,38 L878,28 L905,12 L896,46 L882,38 Z",
        "M125,255 L42,315 L58,325 L26,334 L40,302 L52,312 Z",
        "M795,252 L882,312 L866,322 L898,332 L884,300 L872,310 Z"
    ];
    arrowPaths.forEach((d) => {
        const arrow = document.createElementNS(svgNS, "path");
        arrow.setAttribute("d", d);
        arrow.setAttribute("fill", "url(#graffitiArrowGrad)");
        arrow.setAttribute("stroke", "#111827");
        arrow.setAttribute("stroke-width", "4");
        arrow.setAttribute("stroke-linejoin", "round");
        svg.appendChild(arrow);
    });

    const pieceText = document.createElementNS(svgNS, "text");
    pieceText.setAttribute("x", "460");
    pieceText.setAttribute("y", "205");
    pieceText.setAttribute("text-anchor", "middle");
    pieceText.setAttribute("font-family", "Impact, 'Arial Black', sans-serif");
    pieceText.setAttribute("font-size", "168");
    pieceText.setAttribute("font-style", "italic");
    pieceText.setAttribute("letter-spacing", "6");
    pieceText.setAttribute("fill", "url(#graffitiWildFill)");
    pieceText.setAttribute("stroke", "#111827");
    pieceText.setAttribute("stroke-width", "12");
    pieceText.setAttribute("paint-order", "stroke fill");
    pieceText.style.filter = "drop-shadow(8px 10px 0px #ff2a85) drop-shadow(15px 18px 0px #00bbf9)";
    pieceText.textContent = "Well Done!";
    svg.appendChild(pieceText);

    const crownPath = document.createElementNS(svgNS, "path");
    crownPath.setAttribute(
        "d",
        "M250,74 L274,34 L302,66 L332,20 L362,66 L390,34 L414,74 M506,74 L530,34 L558,66 L588,20 L618,66 L646,34 L670,74"
    );
    crownPath.setAttribute("fill", "#ffbe0b");
    crownPath.setAttribute("stroke", "#111827");
    crownPath.setAttribute("stroke-width", "5");
    crownPath.setAttribute("stroke-linejoin", "round");
    svg.appendChild(crownPath);

    return svg;
}

function triggerGraffitiPerfectScore(targetEl) {
    ensureGraffitiStyles();

    const existing = document.getElementById('graffiti-fullscreen-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'graffiti-fullscreen-overlay';
    overlay.className = 'graffiti-fullscreen-overlay';
    document.body.appendChild(overlay);

    const palette = ['#ff2a85', '#ffbe0b', '#00bbf9', '#00f5d4', '#9b5de5', '#fb5607', '#38b000'];
    const glitterColors = ['#ffffff', '#fff3b0', '#ffbe0b', '#00f5d4', '#ff2a85', '#00bbf9', '#e0aaff'];
    const splatPaths = [
        "M50,10 C64,8 72,22 83,26 C95,30 96,46 86,55 C94,68 83,84 69,79 C61,93 41,94 34,80 C18,86 8,70 17,57 C6,47 11,30 24,27 C30,14 40,12 50,10 Z",
        "M48,7 C58,16 74,11 81,23 C93,29 91,48 80,55 C88,69 75,88 61,81 C52,95 34,91 29,77 C14,79 8,62 19,50 C9,38 17,20 31,22 C36,11 42,4 48,7 Z",
        "M52,9 C67,6 75,21 88,28 C96,40 87,54 78,61 C83,75 68,89 55,82 C44,93 26,87 25,72 C11,69 10,50 22,42 C15,28 26,13 40,18 C44,11 47,10 52,9 Z",
        "M50,6 C61,15 76,8 84,21 C97,25 99,44 87,53 C97,66 86,86 71,82 C63,96 42,96 35,82 C20,89 7,73 16,58 C5,49 9,29 23,25 C28,13 39,14 50,6 Z"
    ];

    // 1. Aerosol overspray mist clouds across the full screen
    for (let c = 0; c < 22; c++) {
        const cloud = document.createElement('div');
        const color = palette[c % palette.length];
        const size = 160 + Math.random() * 230;
        const x = 4 + Math.random() * 92;
        const y = 4 + Math.random() * 92;

        cloud.className = 'graffiti-overspray';
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size}px`;
        cloud.style.left = `${x}vw`;
        cloud.style.top = `${y}vh`;
        cloud.style.background = `radial-gradient(circle, ${color} 0%, transparent 72%)`;
        cloud.style.animationDelay = `${(Math.random() * 1.1).toFixed(2)}s`;
        overlay.appendChild(cloud);
    }

    // 2. Fullscreen organic paint splatters + paint drips distributed across the entire viewport
    const cols = 6;
    const rows = 4;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
            const color = palette[idx % palette.length];
            const accentColor = palette[(idx + 2) % palette.length];
            const pathData = splatPaths[idx % splatPaths.length];
            idx++;

            const cellX = ((col + 0.15 + Math.random() * 0.7) / cols) * 100;
            const cellY = ((r + 0.15 + Math.random() * 0.7) / rows) * 100;
            const size = 110 + Math.random() * 145;
            const delay = (Math.random() * 1.2).toFixed(2);
            const rot0 = (Math.random() * 360).toFixed(0);
            const rot1 = (Number(rot0) + (Math.random() - 0.5) * 45).toFixed(0);

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.classList.add("graffiti-splat-svg");
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            svg.style.left = `${cellX}vw`;
            svg.style.top = `${cellY}vh`;
            svg.style.setProperty('--rot0', `${rot0}deg`);
            svg.style.setProperty('--rot1', `${rot1}deg`);
            svg.style.animationDelay = `${delay}s`;

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", color);
            svg.appendChild(path);

            for (let d = 0; d < 8; d++) {
                const dot = document.createElementNS(svgNS, "circle");
                const angle = (Math.PI * 2 * d) / 8 + Math.random();
                const dist = 35 + Math.random() * 14;
                dot.setAttribute("cx", (50 + Math.cos(angle) * dist).toFixed(1));
                dot.setAttribute("cy", (50 + Math.sin(angle) * dist).toFixed(1));
                dot.setAttribute("r", (1.8 + Math.random() * 3.6).toFixed(1));
                dot.setAttribute("fill", d % 2 === 0 ? color : accentColor);
                svg.appendChild(dot);
            }

            overlay.appendChild(svg);

            if (Math.random() > 0.25) {
                const dripCount = 1 + Math.floor(Math.random() * 2);
                for (let k = 0; k < dripCount; k++) {
                    const drip = document.createElement('span');
                    const dripLen = 65 + Math.random() * 125;
                    const offsetPx = (Math.random() - 0.5) * (size * 0.45);
                    drip.className = 'graffiti-drip';
                    drip.style.left = `calc(${cellX}vw + ${offsetPx.toFixed(1)}px)`;
                    drip.style.top = `calc(${cellY}vh + ${(size * 0.16).toFixed(1)}px)`;
                    drip.style.height = `${dripLen}px`;
                    drip.style.width = `${4 + Math.random() * 4}px`;
                    drip.style.backgroundColor = color;
                    drip.style.animationDelay = `${(parseFloat(delay) + 0.15).toFixed(2)}s`;
                    overlay.appendChild(drip);
                }
            }
        }
    }

    // 3. Fine spray-paint speckles across the entire viewport
    for (let s = 0; s < 130; s++) {
        const speckle = document.createElement('span');
        const size = 3 + Math.random() * 7;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const sx = (Math.random() - 0.5) * 180;
        const sy = (Math.random() - 0.5) * 180;

        speckle.className = 'graffiti-speckle';
        speckle.style.width = `${size}px`;
        speckle.style.height = `${size}px`;
        speckle.style.left = `${startX}vw`;
        speckle.style.top = `${startY}vh`;
        speckle.style.backgroundColor = palette[s % palette.length];
        speckle.style.setProperty('--sx', `${sx.toFixed(1)}px`);
        speckle.style.setProperty('--sy', `${sy.toFixed(1)}px`);
        speckle.style.animationDelay = `${(Math.random() * 1.4).toFixed(2)}s`;
        overlay.appendChild(speckle);
    }

    // 4. Center wildstyle graffiti piece (no tag/sticker text)
    const wildstylePiece = createWildstyleGraffitiSvg();
    overlay.appendChild(wildstylePiece);

    // 5. Dramatically moving metallic & sparkling glitters across the viewport
    const svgNS = "http://www.w3.org/2000/svg";
    for (let g = 0; g < 95; g++) {
        const gColor = glitterColors[g % glitterColors.length];
        const gSize = 10 + Math.random() * 18;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const travelDist = 90 + Math.random() * 230;
        const gx = (Math.cos(angle) * travelDist).toFixed(1);
        const gy = (Math.sin(angle) * travelDist).toFixed(1);
        const dur = (2.8 + Math.random() * 2.8).toFixed(2);
        const gDelay = (Math.random() * 2.2).toFixed(2);

        const gSvg = document.createElementNS(svgNS, "svg");
        gSvg.setAttribute("viewBox", "0 0 24 24");
        gSvg.classList.add("graffiti-glitter-shard");
        gSvg.style.width = `${gSize}px`;
        gSvg.style.height = `${gSize}px`;
        gSvg.style.left = `${startX}vw`;
        gSvg.style.top = `${startY}vh`;
        gSvg.style.setProperty('--gx', `${gx}px`);
        gSvg.style.setProperty('--gy', `${gy}px`);
        gSvg.style.setProperty('--g-dur', `${dur}s`);
        gSvg.style.setProperty('--g-delay', `${gDelay}s`);
        gSvg.style.filter = `drop-shadow(0 0 6px ${gColor})`;

        if (g % 2 === 0) {
            const sparkle = document.createElementNS(svgNS, "path");
            sparkle.setAttribute("d", "M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z");
            sparkle.setAttribute("fill", gColor);
            gSvg.appendChild(sparkle);
        } else {
            const facet = document.createElementNS(svgNS, "polygon");
            facet.setAttribute("points", "12,1 22,12 12,23 2,12");
            facet.setAttribute("fill", gColor);
            gSvg.appendChild(facet);
        }

        overlay.appendChild(gSvg);
    }

    setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.remove();
    }, 10200);
}

function submitSection(sIdx) {
    const section = document.getElementById(`section-${sIdx}`);
    let score = 0, total = 0;
    
    quizData.forEach((q, idx) => {
        const fb = section.querySelector(`#fb-${idx}`);
        if (!fb) return;
        
        const spelling = section.querySelector(`#spelling-${idx}`);
        const blank = section.querySelector(`#blank-${idx}`);
        const radio = section.querySelector(`input[name="question${idx}"]`);
        const match = section.querySelector(`#match-${idx}`);
        const scramble = section.querySelector(`#scramble-${idx}`);

        if (spelling) {
            total++;
            if (spelling.value.toLowerCase().trim() === q.correctAnswer) {
                score++; fb.innerHTML="✓ Correct! ✨"; fb.className = "font-bold mt-1.5 text-sm text-success";
            } else {
                fb.innerHTML=`Incorrect. Correct spelling: "${q.correctAnswer}"`; fb.className = "font-bold mt-1.5 text-sm text-error";
            }
        }
        else if (scramble) {
            total++;
            if (scramble.value.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                score++; fb.innerHTML="✓ Correct! ✨"; fb.className = "font-bold mt-1.5 text-sm text-success";
            } else {
                fb.innerHTML=`Incorrect. The correct phrase is: "${q.correctAnswer}"`; fb.className = "font-bold mt-1.5 text-sm text-error";
            }
        }
        else if (blank) {
            total++;
            if (blank.value.toLowerCase().trim() === q.correctAnswer) { 
                score++; fb.innerHTML="✓ Correct! ✨"; fb.className = "font-bold mt-1.5 text-sm text-success"; 
            } else { 
                fb.innerHTML=`The correct answer is "${q.correctAnswer}"`; fb.className = "font-bold mt-1.5 text-sm text-error"; 
            }
        } else if (match) {
            total++;
            if (match.value === q.definition) { 
                score++; fb.innerHTML="✓ Correct ✨"; fb.className = "font-bold text-sm text-right mt-1.5 text-success"; 
            } else { 
                fb.innerHTML=`The correct answer is "${q.definition}"`; fb.className = "font-bold text-sm text-right mt-1.5 text-error"; 
            }
        } else if (radio) {
            total++;
            const sel = section.querySelector(`input[name="question${idx}"]:checked`);
            const isCorrect = sel && parseInt(sel.value) === q.correct;
            
            if (isCorrect) { 
                score++; fb.innerHTML="✓ Correct! ✨"; fb.className = "font-bold mt-1.5 text-success";
            } else { 
                const correctText = q.choices[q.correct];
                fb.innerHTML = `The correct answer is "${correctText}"`; 
                fb.className = "font-bold mt-1.5 text-error";
                const correctLabel = section.querySelector(`#label-q${idx}-c${q.correct}`);
                if (correctLabel) correctLabel.classList.add('bg-success/20', 'rounded');
            }
        }
    });

    const scoreDiv = document.getElementById(`score-${sIdx}`);
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const isPerfect = total > 0 && percentage === 100;
    
    let message = isPerfect ? "Yey!" : (percentage >= 70 ? "✨ Great effort!" : "📖 Keep it up! Try again!");
    
    scoreDiv.classList.remove('hidden', 'bg-success/20', 'text-success', 'border-success', 'bg-warning/22', 'text-warning', 'border-warning', 'bg-error/20', 'text-error', 'border-error');
    scoreDiv.style.display = "block";
    scoreDiv.className = isPerfect ? "mt-5 p-4 rounded-xl border bg-success/20 text-success border-success font-semibold" : (percentage >= 70 ? "mt-5 p-4 rounded-xl border bg-warning/20 text-warning border-warning font-semibold" : "mt-5 p-4 rounded-xl border bg-error/20 text-error border-error font-semibold");
    
    scoreDiv.innerHTML = `<strong>${message}</strong><br>Score: ${score} / ${total} (${percentage.toFixed(0)}%)${isPerfect ? `<br><span class="graffiti-tag-banner">Good job! Perfect Score!</span>` : ''}`;
    scoreDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (isPerfect) {
        playGraffitiCelebrationAudio();
        triggerGraffitiPerfectScore(scoreDiv);
    }
}

function resetSection(sIdx) {
    const section = document.getElementById(`section-${sIdx}`);
    section.querySelectorAll('input[type="text"]').forEach(i => i.value="");
    section.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    section.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    section.querySelectorAll('[id^="fb-"]').forEach(f => f.innerHTML="");
    section.querySelectorAll('[id^="label-q"]').forEach(l => l.classList.remove('bg-success/20', 'rounded'));
    
    updateWordBank(sIdx);

    section.querySelectorAll('[id^="scramble-target-"]').forEach(target => {
        const realIndex = target.id.split('-').pop();
        const pool = section.querySelector(`#scramble-pool-${realIndex}`);
        const hiddenInput = section.querySelector(`#scramble-${realIndex}`);
        const placeholder = section.querySelector(`#placeholder-${realIndex}`);
        
        if (pool && hiddenInput) {
            const letters = target.querySelectorAll('span:not([id^="placeholder-"])');
            letters.forEach(letter => {
                const isSpace = letter.getAttribute('data-letter') === ' ';
                
                letter.style.color = '#fff';
                letter.style.boxShadow = '';
                letter.style.border = '';
                letter.className = isSpace ? 
                    "inline-flex items-center justify-center w-[60px] h-[35px] font-bold text-white bg-neutral rounded-md cursor-pointer select-none shadow-sm transition-transform duration-100" :
                    "inline-flex items-center justify-center w-[35px] h-[35px] font-bold text-white custom-primary-bg rounded-md cursor-pointer select-none shadow-sm transition-transform duration-100";
                
                pool.appendChild(letter);
            });
            hiddenInput.value = "";
            if (placeholder) placeholder.style.display = 'block';
        }
    });

    section.querySelectorAll('.line-quiz-container').forEach(container => {
        const index = container.id.split('-').pop();
        savedThreadLinks[index] = null;
        container.querySelectorAll('.quiz-anchor-dot').forEach(dot => {
            dot.classList.remove('linked', 'active-link');
        });
        const svg = container.querySelector('.line-quiz-svg');
        if (svg) svg.innerHTML = '';
    });

    const scoreDiv = document.getElementById(`score-${sIdx}`);
    if (scoreDiv) scoreDiv.style.display = "none";
}

function loadVoices() { voices = speechSynthesis.getVoices().filter(v => v.lang.includes('en')); }
speechSynthesis.onvoiceschanged = loadVoices;
window.onload = loadData;

let drawingAnchor = null;
let savedThreadLinks = {}; 

function connectQuizThreads(index) {
    const space = document.getElementById(`line-quiz-${index}`);
    const svgLayer = document.getElementById(`svg-${index}`);
    const hiddenInput = document.getElementById(`match-${index}`);
    if (!space || !svgLayer) return;

    let activeLine = null;

    function refreshThreadLines() {
        svgLayer.innerHTML = '';
        if (savedThreadLinks[index]) {
            const link = savedThreadLinks[index];
            const p1 = getAnchorCenter(link.sourceEl);
            const p2 = getAnchorCenter(link.targetEl);
            appendSvgLine(p1.x, p1.y, p2.x, p2.y, '#28a745');
        }
    }

    function appendSvgLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-linecap', 'round');
        svgLayer.appendChild(line);
        return line;
    }

    function getAnchorCenter(element) {
        const spaceRect = space.getBoundingClientRect();
        const elRect = element.getBoundingClientRect();
        
        const canvas = document.getElementById('app-canvas');
        let scale = 1;
        if (canvas) {
            const transform = window.getComputedStyle(canvas).transform;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/matrix\((.+)\)/);
                if (matrix) scale = parseFloat(matrix[1].split(',')[0]);
            }
        }

        return {
            x: (elRect.left - spaceRect.left + (elRect.width / 2)) / scale,
            y: (elRect.top - spaceRect.top + (elRect.height / 2)) / scale
        };
    }

    function getEventCoordinates(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }

    function handleStart(e) {
        const coords = getEventCoordinates(e);
        const targetDot = document.elementFromPoint(coords.clientX, coords.clientY);
        
        if (!targetDot || !targetDot.classList.contains('source-dot') || targetDot.getAttribute('data-idx') != index) return;

        e.preventDefault();
        drawingAnchor = targetDot;
        targetDot.classList.add('active-link');

        if (savedThreadLinks[index]) {
            savedThreadLinks[index].targetEl.classList.remove('linked');
            savedThreadLinks[index] = null;
            hiddenInput.value = '';
        }
        refreshThreadLines();

        const startPt = getAnchorCenter(drawingAnchor);
        activeLine = appendSvgLine(startPt.x, startPt.y, startPt.x, startPt.y, '#007bff');
    }

    function handleMove(e) {
        if (!drawingAnchor || drawingAnchor.getAttribute('data-idx') != index || !activeLine) return;

        e.preventDefault();
        const coords = getEventCoordinates(e);
        const spaceRect = space.getBoundingClientRect();

        const canvas = document.getElementById('app-canvas');
        let scale = 1;
        if (canvas) {
            const transform = window.getComputedStyle(canvas).transform;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/matrix\((.+)\)/);
                if (matrix) scale = parseFloat(matrix[1].split(',')[0]);
            }
        }

        const currentX = (coords.clientX - spaceRect.left) / scale;
        const currentY = (coords.clientY - spaceRect.top) / scale;

        activeLine.setAttribute('x2', currentX);
        activeLine.setAttribute('y2', currentY);
    }

    function handleEnd(e) {
        if (!drawingAnchor || drawingAnchor.getAttribute('data-idx') != index) return;

        const coords = getEventCoordinates(e);
        const releaseDot = document.elementFromPoint(coords.clientX, coords.clientY);

        if (releaseDot && releaseDot.classList.contains('target-dot') && releaseDot.getAttribute('data-idx') == index) {
            savedThreadLinks[index] = {
                sourceEl: drawingAnchor,
                targetEl: releaseDot,
                choiceVal: releaseDot.getAttribute('data-val')
            };

            drawingAnchor.classList.add('linked');
            releaseDot.classList.add('linked');
            hiddenInput.value = releaseDot.getAttribute('data-val');
        }

        drawingAnchor.classList.remove('active-link');
        drawingAnchor = null;
        activeLine = null;
        refreshThreadLines();
    }

    space.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    space.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    window.addEventListener('resize', refreshThreadLines);
    setTimeout(refreshThreadLines, 100);
}

const API_URL = "https://script.google.com/macros/s/AKfycbwhI1B0aGzDzwthu23R-F_c_Zqb1GEFSUHRMXrP1JFX03D7fxIntTB5-g5cpf__pHtW/exec";

window.addEventListener('DOMContentLoaded', () => {
    const activeUser = localStorage.getItem('teacherName') || localStorage.getItem('username') || localStorage.getItem('name') || localStorage.getItem('currentUser');
    if (activeUser) {
        localStorage.setItem('isLoggedIn', 'true');
    }

    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuBtn && sidebar && overlay) {
        menuBtn.onclick = () => { 
            sidebar.classList.toggle('-translate-x-full'); 
            sidebar.classList.toggle('active'); 
            overlay.classList.toggle('hidden'); 
            overlay.classList.toggle('active'); 
        };
        overlay.onclick = () => { 
            sidebar.classList.add('-translate-x-full'); 
            sidebar.classList.remove('active'); 
            overlay.classList.add('hidden'); 
            overlay.classList.remove('active'); 
        };
    }

    const nameSpan = document.querySelector('.user-profile span span') || document.querySelector('.user-profile span');
    let storedName = localStorage.getItem('teacherName') || localStorage.getItem('username') || '';
    
    if (storedName.toLowerCase().startsWith('teacher ')) {
        storedName = storedName.substring(8).trim();
    }

    if (nameSpan && storedName) {
        nameSpan.textContent = "Teacher " + storedName;
    }

    if (storedName) {
        initDashboardData(storedName);
        fetchScheduledSessions();
    } else {
        const tbody = document.getElementById('sessions-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-base-content/50">Please log in as a teacher to view your schedules.</td></tr>';
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    const sessionForm = document.getElementById('schedule-session-form');
    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            scheduleNewSession(storedName);
        });
    }

    const copyBtn = document.getElementById('copy-link-btn');
    const linkInput = document.getElementById('modal-link-input');
    if (copyBtn && linkInput) {
        copyBtn.addEventListener('click', () => {
            linkInput.select();
            navigator.clipboard.writeText(linkInput.value)
                .then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy'; }, 2000);
                })
                .catch(() => showToast("Failed to copy link", "error"));
        });
    }

    const linkModal = document.getElementById('link-modal');
    if (linkModal) {
        linkModal.addEventListener('click', (e) => { 
            if (e.target === linkModal) closeLinkModal(); 
        });
    }

    initBookSearch();
    initThemeToggle();
});

function updateBookingToggleUI(isOpen) {
    const toggle = document.getElementById('topnav-booking-toggle');
    const label = document.getElementById('topnav-booking-label');

    if (!toggle || !label) return;
    toggle.checked = isOpen;

    if (isOpen) {
        label.textContent = "Open";
        label.className = "text-xs font-bold text-success";
    } else {
        label.textContent = "Closed";
        label.className = "text-xs font-bold text-error";
    }
}

function toggleTeacherBookingStatus() {
    const toggle = document.getElementById('topnav-booking-toggle');
    if (!toggle) return;
    
    const isOpen = toggle.checked;
    updateBookingToggleUI(isOpen);

    const statusString = isOpen ? "open" : "closed";

    if (isOpen) {
        showToast("Student booking is now ACCEPTED.", "success");
    } else {
        showToast("Student booking is now CLOSED.", "error");
    }

    let teacherName = localStorage.getItem('teacherName') || localStorage.getItem('username') || '';
    if (teacherName.toLowerCase().startsWith('teacher ')) {
        teacherName = teacherName.substring(8).trim();
    }

    const cbName = 'toggle_booking_cb_' + Math.round(Math.random() * 1000000);
    window[cbName] = function(res) {
        if (script.parentNode) document.body.removeChild(script);
        delete window[cbName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=setBookingStatus&teacher=${encodeURIComponent(teacherName)}&status=${encodeURIComponent(statusString)}&callback=${cbName}`;
    document.body.appendChild(script);
}

function initDashboardData(username) {
    const cbName = 'init_cb_' + Math.round(Math.random() * 1000000);
    window[cbName] = function(res) {
        if (res && res.status === "success") {
            if (Array.isArray(res.accounts)) {
                const currentUser = res.accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase());
                if (currentUser) {
                    const lessonsContainer = document.getElementById('completed-lessons-text');
                    if (lessonsContainer && currentUser.completedLessons !== undefined) {
                        lessonsContainer.textContent = currentUser.completedLessons + " Lessons";
                    }

                    const statusVal = String(currentUser.bookingStatus || currentUser.booking_status || "open").toLowerCase();
                    const isOpen = statusVal === "open" || statusVal === "accepted" || (!statusVal.includes("closed") && !statusVal.includes("disable"));
                    updateBookingToggleUI(isOpen);
                }

                const studentSelect = document.getElementById('session-student-select');
                if (studentSelect) {
                    studentSelect.innerHTML = '<option value="">Select Student...</option>';
                    res.accounts.forEach(acc => {
                        if (String(acc.role) === "1" || String(acc.role).toLowerCase() === "student") {
                            const opt = document.createElement('option');
                            opt.value = acc.username;
                            opt.textContent = acc.username;
                            studentSelect.appendChild(opt);
                        }
                    });
                }
            }

            if (Array.isArray(res.lessons)) {
                const lessonDatalist = document.getElementById('lesson-suggestions');
                if (lessonDatalist) {
                    lessonDatalist.innerHTML = '';
                    res.lessons.forEach(lesson => {
                        const opt = document.createElement('option');
                        opt.value = formatLessonTitle(lesson);
                        lessonDatalist.appendChild(opt);
                    });
                }
            }
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[cbName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=initDashboard&callback=${cbName}`;
    document.body.appendChild(script);
}

function initBookSearch() {
    const searchInput = document.getElementById('book-search-input') || document.getElementById('lesson-search');
    const suggestionsBox = document.getElementById('search-suggestions') || document.getElementById('search-results');
    const noResultsMsg = document.getElementById('no-results-msg');

    const currentFile = window.location.pathname.split("/").pop();
    if (currentFile === "index.html" || currentFile === "") {
        if (searchInput) {
            const searchContainer = searchInput.closest('.flex') || searchInput.parentElement;
            if (searchContainer) searchContainer.style.display = 'none';
        }
        return;
    }

    if (!searchInput) return;

    if (suggestionsBox) {
        suggestionsBox.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        suggestionsBox.style.transformOrigin = 'top center';
        suggestionsBox.style.opacity = '0';
        suggestionsBox.style.transform = 'translateY(-8px) scale(0.98)';
        suggestionsBox.style.pointerEvents = 'none';
    }

    const cardElements = document.querySelectorAll('.book-card, .menu-tooltip, article, .grid > div, .lesson-card');
    const cards = [];

    cardElements.forEach(card => {
        const titleEl = card.querySelector('h1, h2, h3, h4, .book-title, .btn-title, span.font-bold, strong');
        const descEl = card.querySelector('p, .book-desc, .btn-target, span:not(.font-bold)');
        const linkEl = card.querySelector('a');
        const imgEl = card.querySelector('img');
        const badgeEl = card.querySelector('.badge, span[class*="badge"]');

        const title = titleEl ? titleEl.textContent.trim() : '';
        if (!title || title.toLowerCase() === "lesson library" || title.toLowerCase() === "search lessons") return;

        if (cards.some(c => c.title.toLowerCase() === title.toLowerCase())) return;

        card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.willChange = 'opacity, transform';

        cards.push({
            title: title,
            badge: badgeEl ? badgeEl.textContent.trim() : '',
            description: descEl ? descEl.textContent.trim() : '',
            element: card,
            imgSrc: imgEl ? imgEl.getAttribute('src') : '',
            url: linkEl ? linkEl.getAttribute('href') : ''
        });
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let matchCount = 0;

        if (!suggestionsBox) return;
        suggestionsBox.innerHTML = '';

        if (!query) {
            suggestionsBox.style.opacity = '0';
            suggestionsBox.style.transform = 'translateY(-8px) scale(0.98)';
            suggestionsBox.style.pointerEvents = 'none';
            setTimeout(() => { 
                if (searchInput.value.trim() === '') suggestionsBox.style.display = 'none'; 
            }, 300);

            cards.forEach((cardObj, idx) => {
                if (cardObj.element) {
                    cardObj.element.style.display = '';
                    setTimeout(() => {
                        cardObj.element.style.opacity = '1';
                        cardObj.element.style.transform = 'translateY(0) scale(1)';
                    }, idx * 25);
                }
            });
            if (noResultsMsg) noResultsMsg.style.display = 'none';
            return;
        }

        const seenTitles = new Set();
        let visibleIndex = 0;

        cards.forEach(cardObj => {
            const isMatch = cardObj.title.toLowerCase().includes(query) || 
                            cardObj.badge.toLowerCase().includes(query) || 
                            cardObj.description.toLowerCase().includes(query);
            
            if (cardObj.element) {
                if (isMatch) {
                    cardObj.element.style.display = '';
                    const delay = visibleIndex * 40;
                    visibleIndex++;
                    setTimeout(() => {
                        if (searchInput.value.trim() !== '') {
                            cardObj.element.style.opacity = '1';
                            cardObj.element.style.transform = 'translateY(0) scale(1)';
                        }
                    }, delay);
                } else {
                    cardObj.element.style.opacity = '0';
                    cardObj.element.style.transform = 'translateY(10px) scale(0.96)';
                    setTimeout(() => {
                        if (searchInput.value.trim() !== '') {
                            cardObj.element.style.display = 'none';
                        }
                    }, 300);
                }
            }

            if (isMatch) {
                matchCount++;
                if (!seenTitles.has(cardObj.title)) {
                    seenTitles.add(cardObj.title);
                    const item = document.createElement('div');
                    item.className = 'suggestion-item flex items-center gap-3 px-4 py-3 hover:bg-primary/10 cursor-pointer text-sm border-b border-base-300 last:border-none transition-all duration-200';
                    
                    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`(${escapedQuery})`, 'gi');
                    const highlightedTitle = cardObj.title.replace(regex, `<span class="text-primary font-bold bg-primary/15 px-1 rounded">$1</span>`);

                    item.innerHTML = `
                        ${cardObj.imgSrc ? `<img src="${cardObj.imgSrc}" class="w-8 h-8 object-cover rounded shrink-0 shadow-sm">` : '<i class="fa-solid fa-book-open text-primary text-base"></i>'}
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="font-semibold text-xs text-base-content">${highlightedTitle}</span>
                            ${cardObj.description ? `<span class="text-[11px] text-base-content/70 truncate">${cardObj.description}</span>` : ''}
                        </div>
                    `;
                    
                    item.addEventListener('click', () => {
                        searchInput.value = cardObj.title;
                        suggestionsBox.style.opacity = '0';
                        suggestionsBox.style.transform = 'translateY(-8px) scale(0.98)';
                        suggestionsBox.style.pointerEvents = 'none';
                        setTimeout(() => { suggestionsBox.style.display = 'none'; }, 300);

                        if (cardObj.url && cardObj.url !== '#') {
                            window.location.href = cardObj.url;
                        } else {
                            cards.forEach(c => {
                                if (c.element) {
                                    const match = c.title.toLowerCase() === cardObj.title.toLowerCase();
                                    c.element.style.display = match ? '' : 'none';
                                    if (match) {
                                        c.element.style.opacity = '1';
                                        c.element.style.transform = 'translateY(0) scale(1)';
                                    }
                                }
                            });
                        }
                    });
                    suggestionsBox.appendChild(item);
                }
            }
        });

        suggestionsBox.style.display = 'block';
        suggestionsBox.style.pointerEvents = 'auto';
        setTimeout(() => {
            suggestionsBox.style.opacity = '1';
            suggestionsBox.style.transform = 'translateY(0) scale(1)';
        }, 10);

        if (matchCount === 0) {
            if (noResultsMsg) noResultsMsg.style.display = 'block';
            suggestionsBox.innerHTML = `<div class="px-4 py-4 text-xs text-base-content/60 text-center italic">No matching books found</div>`;
        } else {
            if (noResultsMsg) noResultsMsg.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (suggestionsBox && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.opacity = '0';
            suggestionsBox.style.transform = 'translateY(-8px) scale(0.98)';
            suggestionsBox.style.pointerEvents = 'none';
            setTimeout(() => { suggestionsBox.style.display = 'none'; }, 300);
        }
    });
}

function initThemeToggle() {
    const themeCheckbox = document.getElementById('theme-checkbox');
    if (!themeCheckbox) return;

    function updateThemeUI(isDark) {
        const themeName = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', themeName);
        themeCheckbox.checked = isDark;
    }

    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    updateThemeUI(savedTheme === 'dark');

    themeCheckbox.onchange = (e) => {
        const isDark = e.target.checked;
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('dashboard-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };
}

function formatLessonTitle(lessonStr) {
    if (!lessonStr) return '';
    return lessonStr
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function formatFriendlyDate(dateStr) {
    if (!dateStr) return '';
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate) ? dateStr : parsedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFriendlyTime(timeStr) {
    if (!timeStr) return '';
    const trimmed = timeStr.trim();
    if (/\b(AM|PM)\b/i.test(trimmed)) {
        return trimmed;
    }
    const parts = trimmed.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function convertTo24Hour(timeStr) {
    if (!timeStr) return '';
    let trimmed = String(timeStr).replace(/^['"]/, '').trim();
    if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
    
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return '';
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = (match[3] || '').toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return `${String(hours).padStart(2, '0')}:${minutes}`;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.className = `alert ${alertClass} text-white shadow-lg text-xs py-3`;
    toast.innerHTML = `<span><i class="fa-solid ${iconClass} mr-2"></i>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3500);
}

function openLinkModal(url, student = 'N/A', title = 'N/A', date = 'N/A', time = 'N/A') {
    const modal = document.getElementById('link-modal');
    const input = document.getElementById('modal-link-input');
    const joinBtn = document.getElementById('modal-join-btn') || document.getElementById('modal-open-link-btn');
    
    const studentEl = document.getElementById('modal-detail-student');
    const titleEl = document.getElementById('modal-detail-title');
    const dateEl = document.getElementById('modal-detail-date');
    const timeEl = document.getElementById('modal-detail-time');

    if (studentEl) studentEl.textContent = student;
    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = date;
    if (timeEl) timeEl.textContent = time;

    if (input) input.value = url;
    if (joinBtn) joinBtn.href = url;
    if (modal) modal.classList.add('modal-open');
}

function closeLinkModal() {
    const modal = document.getElementById('link-modal');
    if (modal) modal.classList.remove('modal-open');
}

function openConfirmModal(onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (!modal) return;

    modal.classList.add('modal-open');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.addEventListener('click', () => {
        modal.classList.remove('modal-open');
        if (typeof onConfirm === 'function') onConfirm();
    });

    newCancelBtn.addEventListener('click', () => modal.classList.remove('modal-open'));
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('modal-open'); };
}

function updateClock() {
    const now = new Date();
    const timeString = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now);
    const dateString = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);

    const timeEl = document.getElementById('ph-time');
    const dateEl = document.getElementById('ph-date');

    if (timeEl && timeEl.textContent !== timeString) timeEl.textContent = timeString;
    if (dateEl && dateEl.textContent !== dateString) dateEl.textContent = dateString;

    const manilaTimeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).format(now);
    const [h, m, s] = manilaTimeStr.split(':').map(Number);

    const minuteDeg = (m * 6) + (s * 0.1);
    const hourDeg = ((h % 12) * 30) + (m * 0.5);

    let clockStyleTag = document.getElementById('live-clock-style');
    if (!clockStyleTag) {
        clockStyleTag = document.createElement('style');
        clockStyleTag.id = 'live-clock-style';
        document.head.appendChild(clockStyleTag);
    }

    clockStyleTag.innerHTML = `
        .analog-clock-mini::before { content:''; position:absolute; width:2px; height:10px; background:var(--fallback-pc,oklch(var(--pc))); top:5px; left:18px; transform-origin:bottom; transform: rotate(${hourDeg}deg); }
        .analog-clock-mini::after { content:''; position:absolute; width:1.5px; height:14px; background:var(--fallback-p,oklch(var(--p))); top:3px; left:18px; transform-origin:bottom; transform: rotate(${minuteDeg}deg); }
    `;
}

function completeClass(username, sessionId) {
    openConfirmModal(() => {
        const callbackName = 'complete_cb_' + Math.round(Math.random() * 1000000);
        window[callbackName] = function(response) {
            if (response && response.status === "success") {
                deleteSession(sessionId, username);
            } else {
                showToast("Failed to update: " + (response ? response.message : "Unknown error"), "error");
            }
            if (script.parentNode) document.body.removeChild(script);
            delete window[callbackName];
        };
        const script = document.createElement('script');
        script.src = `${API_URL}?action=completeClass&username=${encodeURIComponent(username)}&callback=${callbackName}`;
        document.body.appendChild(script);
    });
}

function deleteSession(sessionId, username) {
    const delCallback = 'del_session_cb_' + Math.round(Math.random() * 1000000);
    window[delCallback] = function(res) {
        if (res && res.status === "success") {
            showToast("Class completed!", "success");
            initDashboardData(username);
            fetchScheduledSessions();
        } else {
            showToast("Class completed, but failed to clear session row.", "error");
            fetchScheduledSessions();
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[delCallback];
    };
    const script = document.createElement('script');
    script.src = `${API_URL}?action=deleteSession&id=${encodeURIComponent(sessionId)}&callback=${delCallback}`;
    document.body.appendChild(script);
}

function autoGenerateMeetUrl() {
    const linkInput = document.getElementById('edit-session-link');
    const sessionId = document.getElementById('edit-session-id').value;
    const newLesson = document.getElementById('edit-session-lesson').value.trim();
    const newDate = document.getElementById('edit-session-date').value;
    const rawTime = document.getElementById('edit-session-time').value;
    const newTime = formatFriendlyTime(rawTime);

    if (linkInput) {
        linkInput.value = "Generating official Google Meet link...";
    }

    showToast("Requesting Google Calendar API...", "success");

    const callbackName = 'autogen_meet_cb_' + Math.round(Math.random() * 1000000);
    window[callbackName] = function(res) {
        if (res && res.status === "success" && res.updatedLink) {
            if (linkInput) {
                linkInput.value = res.updatedLink; 
            }
            showToast("Official Google Meet link generated successfully!", "success");
            fetchScheduledSessions();
        } else {
            if (linkInput) linkInput.value = "";
            showToast("Failed to generate link via Calendar API.", "error");
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=updateSessionLink&id=${encodeURIComponent(sessionId)}&link=&lesson=${encodeURIComponent(newLesson)}&sessionDate=${encodeURIComponent(newDate)}&sessionTime=${encodeURIComponent(newTime)}&callback=${callbackName}`;
    document.body.appendChild(script);
}

function scheduleNewSession(teacherName) {
    const student = document.getElementById('session-student-select').value;
    const lesson = document.getElementById('session-lesson-input').value.trim();
    const sessionDate = document.getElementById('session-date').value;
    const rawTime = document.getElementById('session-time').value;
    const sessionTime = formatFriendlyTime(rawTime);

    if (!student || !lesson || !sessionDate || !sessionTime) {
        showToast("Please fill out all session details.", "error");
        return;
    }

    const submitBtn = document.getElementById('btn-create-session');
    const btnIcon = document.getElementById('btn-icon');
    const btnText = document.getElementById('btn-text');
    
    submitBtn.disabled = true;
    if (btnIcon) btnIcon.className = 'fa-solid fa-spinner fa-spin';
    if (btnText) btnText.textContent = 'Generating...';

    const callbackName = 'create_session_cb_' + Math.round(Math.random() * 1000000);
    window[callbackName] = function(resp) {
        submitBtn.disabled = false;
        if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane';
        if (btnText) btnText.textContent = 'Generate Link';

        if (resp && resp.status === "success") {
            showToast("Google Calendar event & Meet link generated successfully!", "success");
            document.getElementById('schedule-session-form').reset();
            fetchScheduledSessions();
        } else {
            showToast("Failed to schedule session.", "error");
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=createSession&teacher=${encodeURIComponent(teacherName)}&student=${encodeURIComponent(student)}&lesson=${encodeURIComponent(lesson)}&sessionDate=${encodeURIComponent(sessionDate)}&sessionTime=${encodeURIComponent(sessionTime)}&callback=${callbackName}`;
    document.body.appendChild(script);
}

function openEditSessionModal(sessionId, currentLesson, currentLink, currentDate, currentTime) {
    document.getElementById('edit-session-id').value = sessionId;
    document.getElementById('edit-session-lesson').value = currentLesson || '';
    document.getElementById('edit-session-link').value = currentLink || '';

    if (currentDate) {
        const d = new Date(currentDate);
        if (!isNaN(d)) {
            document.getElementById('edit-session-date').value = d.toISOString().split('T')[0];
        }
    }
    
    if (currentTime) {
        document.getElementById('edit-session-time').value = convertTo24Hour(currentTime);
    }

    const modal = document.getElementById('edit-session-modal');
    if (modal) modal.classList.add('modal-open');
}

function closeEditSessionModal() {
    const modal = document.getElementById('edit-session-modal');
    if (modal) modal.classList.remove('modal-open');
}

function saveSessionLink(e) {
    if (e) e.preventDefault();
    const sessionId = document.getElementById('edit-session-id').value;
    const newLesson = document.getElementById('edit-session-lesson').value.trim();
    const newLink = document.getElementById('edit-session-link').value.trim();
    const newDate = document.getElementById('edit-session-date').value;
    const rawTime = document.getElementById('edit-session-time').value;
    const newTime = formatFriendlyTime(rawTime);

    const saveBtn = document.getElementById('save-link-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
    }

    const callbackName = 'update_link_cb_' + Math.round(Math.random() * 1000000);
    window[callbackName] = function(res) {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save & Generate Link";
        }

        if (res && res.status === "success") {
            showToast("Session updated successfully!", "success");
            closeEditSessionModal();
            fetchScheduledSessions();
        } else {
            showToast("Failed to save session updates.", "error");
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=updateSessionLink&id=${encodeURIComponent(sessionId)}&link=${encodeURIComponent(newLink)}&lesson=${encodeURIComponent(newLesson)}&sessionDate=${encodeURIComponent(newDate)}&sessionTime=${encodeURIComponent(newTime)}&callback=${callbackName}`;
    document.body.appendChild(script);
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');

    if (passwordInput && eyeIcon && eyeOffIcon) {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
    }
}

if (window.location.pathname.includes('login.html') && localStorage.getItem('isLoggedIn') === 'true') {
    redirectBasedOnRole(String(localStorage.getItem('userRole')));
}

function redirectBasedOnRole(role) {
    const cleanRole = String(role).trim();
    if (cleanRole === "3") {
        window.location.replace("admin-dashboard.html");
    } else if (cleanRole === "2") {
        window.location.replace("index.html");
    } else {
        window.location.replace("user-dashboard.html");
    }
}

function handleLogin(event) {
    if (event) event.preventDefault();

    const user = document.getElementById('username')?.value.trim();
    const pass = document.getElementById('password')?.value.trim();
    const error = document.getElementById('error-msg');
    const btn = document.querySelector('button[type="submit"]');

    if (!user || !pass) {
        if (error) {
            error.innerText = "Please enter both fields";
            error.classList.remove('hidden');
        }
        return;
    }

    if (error) error.classList.add('hidden');
    if (btn) {
        btn.innerText = "Signing in...";
        btn.disabled = true;
    }

    const callbackName = 'google_callback_' + Math.round(Math.random() * 1000000);

    window[callbackName] = function(result) {
        if (result.status === "success") {
            const assignedRole = String(result.role || "1").trim();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('teacherName', result.name);
            localStorage.setItem('userRole', assignedRole);
            localStorage.setItem('books', result.books || ""); 
            redirectBasedOnRole(assignedRole);
        } else {
            if (error) {
                error.innerText = "Invalid username or password";
                error.classList.remove('hidden');
            }
            if (btn) {
                btn.innerText = "Sign In";
                btn.disabled = false;
            }
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=login&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&callback=${callbackName}`;
    document.body.appendChild(script);

    script.onerror = () => {
        if (error) {
            error.innerText = "Connection failed. Check Deployment URL.";
            error.classList.add('hidden');
        }
        if (btn) {
            btn.innerText = "Sign In";
            btn.disabled = false;
        }
    };
}

function fetchScheduledSessions() {
    let storedName = localStorage.getItem('teacherName') || localStorage.getItem('username') || '';
    if (storedName.toLowerCase().startsWith('teacher ')) {
        storedName = storedName.substring(8).trim();
    }
    const cleanStored = storedName.toLowerCase();

    const callbackName = 'get_sessions_cb_' + Math.round(Math.random() * 1000000);

    window[callbackName] = function(sessions) {
        const tbody = document.getElementById('sessions-table-body');
        const countBadge = document.getElementById('active-class-count-badge');
        if (!tbody) return;
        tbody.innerHTML = '';

        const teacherSessions = Array.isArray(sessions) ? sessions.filter(s => {
            if (!s.teacher) return false; 
            let sheetTeacher = String(s.teacher).trim().toLowerCase();
            if (sheetTeacher.startsWith('teacher ')) sheetTeacher = sheetTeacher.substring(8).trim();
            return sheetTeacher === cleanStored || sheetTeacher.includes(cleanStored) || cleanStored.includes(sheetTeacher);
        }) : [];

        if (countBadge) {
            const count = teacherSessions.length;
            countBadge.textContent = `${count} Active Class${count === 1 ? '' : 'es'}`;
        }

        teacherSessions.sort((a, b) => {
            const dateA = a.sessionDate ? new Date(a.sessionDate) : new Date(0);
            const dateB = b.sessionDate ? new Date(b.sessionDate) : new Date(0);

            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }

            const timeA = convertTo24Hour(a.sessionTime || "00:00");
            const timeB = convertTo24Hour(b.sessionTime || "00:00");
            return timeA.localeCompare(timeB); 
        });

        if (teacherSessions.length > 0) {
            teacherSessions.forEach(s => {
                const formattedTitle = formatLessonTitle(s.lesson) || "Requested Session";
                const sessionId = s.id;
                const friendlyDate = formatFriendlyDate(s.sessionDate);
                const friendlyTime = formatFriendlyTime(s.sessionTime);

                const safeTitle = (formattedTitle || '').replace(/'/g, "\\'");
                const safeDate = (s.sessionDate || '').replace(/'/g, "\\'");
                const safeTime = (s.sessionTime || '').replace(/'/g, "\\'");
                const safeLink = (s.link || '').replace(/'/g, "\\'");
                const safeStudent = (s.student || '').replace(/'/g, "\\'");

                const hasLink = s.link && s.link.trim() !== "" && s.link !== "#" && s.link !== "Pending Link";

                const tr = document.createElement('tr');
                tr.className = 'border-b border-base-300 hover:bg-base-200/50';
                tr.innerHTML = `
                    <td class="font-semibold py-3">${s.student || 'Student'}</td>
                    <td class="py-3">${formattedTitle}</td>
                    <td class="py-3">${friendlyDate}</td>
                    <td class="py-3">${friendlyTime}</td>
                    <td class="text-center py-3">
                        ${hasLink ? `
                            <div class="flex gap-2 items-center justify-center">
                                <a href="${s.link}" target="_blank" class="btn custom-primary-bg text-white btn-xs">
                                    <i class="fa-solid fa-video"></i> Join
                                </a>
                                <button onclick="openEditSessionModal('${sessionId}', '${safeTitle}', '${safeLink}', '${safeDate}', '${safeTime}')" class="btn btn-ghost btn-xs border border-base-300">
                                    <i class="fa-solid fa-pen"></i> Edit Link
                                </button>
                            </div>
                        ` : `
                            <button onclick="openEditSessionModal('${sessionId}', '${safeTitle}', '', '${safeDate}', '${safeTime}')" class="btn btn-warning btn-xs gap-1 font-semibold shadow-sm">
                                <i class="fa-solid fa-plus"></i> Input New Link
                            </button>
                        `}
                    </td>
                    <td class="text-center py-3">
                        <button onclick="completeClass('${storedName}', '${sessionId}')" class="btn btn-success btn-xs text-white">
                            <i class="fa-solid fa-check"></i> Done
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-base-content/50">No scheduled sessions found.</td></tr>';
        }
        if (script.parentNode) document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=getSessions&callback=${callbackName}`;
    document.body.appendChild(script);
}

let currentImageScale = 1;
let imgTranslateX = 0;
let imgTranslateY = 0;
let isDraggingImg = false;
let startDragX = 0;
let startDragY = 0;

window.zoomModalImage = function(delta) {
    currentImageScale = Math.max(1, Math.min(5, currentImageScale + delta));
    if (currentImageScale === 1) {
        imgTranslateX = 0;
        imgTranslateY = 0;
    }
    updateImageTransform();
};

window.resetModalImageZoom = function() {
    currentImageScale = 1;
    imgTranslateX = 0;
    imgTranslateY = 0;
    updateImageTransform();
    const container = document.getElementById('modal-image-container');
    if (container) container.style.cursor = 'default';
};

function updateImageTransform() {
    const img = document.getElementById('modal-zoomable-img');
    const container = document.getElementById('modal-image-container');
    if (img) {
        img.style.transform = `scale(${currentImageScale}) translate(${imgTranslateX}px, ${imgTranslateY}px)`;
    }
    if (container) {
        container.style.cursor = currentImageScale > 1 ? 'grab' : 'default';
    }
}

window.handleModalWheel = function(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    window.zoomModalImage(delta);
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    const modalBox = modal.querySelector('.modal-box');
    if (modalBox && !document.getElementById('modal-image-container')) {
        const originalImg = modalBox.querySelector('img');
        const imgSrc = originalImg ? originalImg.src : '';

        modalBox.innerHTML = `
            <div class="absolute right-4 top-4 z-10 flex items-center gap-1.5 bg-base-200/80 backdrop-blur-md p-1.5 rounded-2xl border border-base-300 shadow-sm">
                <button type="button" onclick="zoomModalImage(0.25)" class="btn btn-sm btn-circle btn-ghost hover:bg-base-300 text-base-content tooltip tooltip-bottom" data-tip="Zoom In">
                    <i class="fa-solid fa-magnifying-glass-plus text-sm"></i>
                </button>
                <button type="button" onclick="zoomModalImage(-0.25)" class="btn btn-sm btn-circle btn-ghost hover:bg-base-300 text-base-content tooltip tooltip-bottom" data-tip="Zoom Out">
                    <i class="fa-solid fa-magnifying-glass-minus text-sm"></i>
                </button>
                <button type="button" onclick="resetModalImageZoom()" class="btn btn-sm btn-circle btn-ghost hover:bg-base-300 text-base-content tooltip tooltip-bottom" data-tip="Reset Zoom">
                    <i class="fa-solid fa-rotate-right text-sm"></i>
                </button>
                <div class="w-[1px] h-4 bg-base-300 mx-0.5"></div>
                <form method="dialog" class="inline-block">
                    <button onclick="resetModalImageZoom()" class="btn btn-sm btn-circle btn-ghost hover:bg-error/20 hover:text-error text-base-content tooltip tooltip-bottom" data-tip="Close">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </form>
            </div>
            <div id="modal-image-container" class="w-full flex items-center justify-center overflow-hidden rounded-xl mt-12 cursor-default relative" style="height: 75vh;" onwheel="handleModalWheel(event)">
                <img id="modal-zoomable-img" src="${imgSrc}" alt="Picture" class="max-h-full max-w-full object-contain rounded-xl shadow-md transition-transform duration-75 select-none" style="transform: scale(1) translate(0px, 0px);">
            </div>
        `;
    }

    modal.addEventListener('close', () => {
        window.resetModalImageZoom();
    });

    const container = document.getElementById('modal-image-container');
    const img = document.getElementById('modal-zoomable-img');

    if (container && img) {
        container.addEventListener('mousedown', (e) => {
            if (currentImageScale > 1) {
                isDraggingImg = true;
                startDragX = e.clientX - imgTranslateX;
                startDragY = e.clientY - imgTranslateY;
                container.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingImg) return;
            imgTranslateX = e.clientX - startDragX;
            imgTranslateY = e.clientY - startDragY;
            updateImageTransform();
        });

        window.addEventListener('mouseup', () => {
            isDraggingImg = false;
            if (container) container.style.cursor = currentImageScale > 1 ? 'grab' : 'default';
        });
    }
});
