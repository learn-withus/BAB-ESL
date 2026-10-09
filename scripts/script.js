// ================= 0. DYNAMIC CONFIGURATION =================
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

        loadNoteFromSheet(); 

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
                    else if (currentSection === "speaking") readingData.push(contentItem);
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
                bank.className = "sticky top-4 z-10 bg-base-200 border-2 border-primary p-4 rounded-xl my-4 text-center shadow-md";
                bank.innerHTML = `<p class="font-bold custom-primary-text mb-2">Word Bank</p>`;
                sectionBlanks.sort(() => Math.random() - 0.5).forEach(word => {
                    bank.innerHTML += `<span draggable="true" ondragstart="event.dataTransfer.setData('text', '${word}')" 
                        class="inline-block m-1.5 px-4 py-1.5 font-bold text-base-content bg-base-100 border border-primary rounded-lg cursor-grab shadow-xs">${word}</span>`;
                });
                currentSectionDiv.appendChild(bank);
            }
            questionCounter = 1; 
        } else if (currentSectionDiv) {
            currentSectionDiv.appendChild(renderQuestionElement(item, index, questionCounter++, shuffledMatchingDefs));
        }
    });
    if (currentSectionDiv) addSectionControls(container, sectionIndex);
}

function renderQuestionElement(q, realIndex, displayNum, shuffledDefs) {
    const qDiv = document.createElement("div");
    qDiv.className = "mb-5 p-2.5 text-base-content";

    if (q.type === "BLANKS") {
        const parts = q.sentence.split("___");
        qDiv.innerHTML = `
            <p class="text-base-content"><strong>${displayNum}.</strong> ${parts[0]} 
            <input type="text" id="blank-${realIndex}" 
                   ondragover="event.preventDefault()" 
                   ondrop="event.preventDefault(); this.value=event.dataTransfer.getData('text')"
                   class="input input-bordered input-sm mx-1.5 bg-base-200 text-base-content font-bold inline-block w-auto text-center border-b-2 border-primary"> ${parts[1] || ""}</p>
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
    const percentage = (score / total) * 100;
    
    let message = percentage === 100 ? "🌟 Good job! Perfect Score!" : (percentage >= 70 ? "✨ Great effort!" : "📖 Keep it up! Try again!");
    
    scoreDiv.classList.remove('hidden', 'bg-success/20', 'text-success', 'border-success', 'bg-warning/22', 'text-warning', 'border-warning', 'bg-error/20', 'text-error', 'border-error');
    scoreDiv.style.display = "block";
    scoreDiv.className = percentage === 100 ? "mt-5 p-4 rounded-xl border bg-success/20 text-success border-success font-semibold" : (percentage >= 70 ? "mt-5 p-4 rounded-xl border bg-warning/20 text-warning border-warning font-semibold" : "mt-5 p-4 rounded-xl border bg-error/20 text-error border-error font-semibold");
    
    scoreDiv.innerHTML = `<strong>${message}</strong><br>Score: ${score} / ${total} (${percentage.toFixed(0)}%)`;
    scoreDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetSection(sIdx) {
    const section = document.getElementById(`section-${sIdx}`);
    section.querySelectorAll('input[type="text"]').forEach(i => i.value="");
    section.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    section.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    section.querySelectorAll('[id^="fb-"]').forEach(f => f.innerHTML="");
    section.querySelectorAll('[id^="label-q"]').forEach(l => l.classList.remove('bg-success/20', 'rounded'));
    
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

    // Attach Listeners
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
                .then(() => showToast("Link copied to clipboard!", "success"))
                .catch(() => showToast("Failed to copy link", "error"));
        });
    }

    const closeLinkModalBtn = document.getElementById('close-link-modal');
    const linkModal = document.getElementById('link-modal');
    if (closeLinkModalBtn && linkModal) {
        closeLinkModalBtn.addEventListener('click', () => linkModal.classList.remove('modal-open'));
        linkModal.addEventListener('click', (e) => { if (e.target === linkModal) linkModal.classList.remove('modal-open'); });
    }

    initBookSearch();
    initThemeToggle();
});

function initBookSearch() {
    const searchInput = document.getElementById('book-search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    const bookCards = document.querySelectorAll('.book-card');
    const noResultsMsg = document.getElementById('no-results-msg');

    if (!searchInput || !bookCards.length) return;

    const books = Array.from(bookCards).map(card => ({
        title: card.getAttribute('data-title') || '',
        description: card.getAttribute('data-desc') || '',
        element: card
    }));

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let matchCount = 0;
        suggestionsBox.innerHTML = '';

        if (!query) {
            suggestionsBox.classList.remove('active', 'block');
            suggestionsBox.classList.add('hidden');
            books.forEach(b => b.element.classList.remove('hidden'));
            if (noResultsMsg) noResultsMsg.style.display = 'none';
            return;
        }

        const matchedTitles = [];
        books.forEach(book => {
            const isMatch = book.title.toLowerCase().includes(query) || book.description.toLowerCase().includes(query);
            book.element.classList.toggle('hidden', !isMatch);
            if (isMatch) {
                matchCount++;
                matchedTitles.push(book.title);
            }
        });

        if (matchCount === 0) {
            if (noResultsMsg) noResultsMsg.style.display = 'block';
            suggestionsBox.classList.remove('active', 'block');
            suggestionsBox.classList.add('hidden');
        } else {
            if (noResultsMsg) noResultsMsg.style.display = 'none';
            matchedTitles.forEach(title => {
                const item = document.createElement('div');
                item.className = 'suggestion-item flex items-center gap-2 px-4 py-2 hover:bg-base-200 cursor-pointer text-sm';
                item.innerHTML = `<i class="fa-solid fa-book-open custom-primary-text"></i><span>${title}</span>`;
                item.addEventListener('click', () => {
                    searchInput.value = title;
                    suggestionsBox.classList.remove('active', 'block');
                    suggestionsBox.classList.add('hidden');
                    books.forEach(b => b.element.classList.toggle('hidden', b.title.toLowerCase() !== title.toLowerCase()));
                });
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.classList.add('active', 'block');
            suggestionsBox.classList.remove('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove('active', 'block');
            suggestionsBox.classList.add('hidden');
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
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
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

function openLinkModal(url) {
    const modal = document.getElementById('link-modal');
    const input = document.getElementById('modal-link-input');
    const openBtn = document.getElementById('modal-open-link-btn');
    if (!modal || !input || !openBtn) return;

    input.value = url;
    openBtn.href = url;
    modal.classList.add('modal-open');
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
            showToast("Class completed and removed from schedule!", "success");
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

function scheduleNewSession(teacherName) {
    const student = document.getElementById('session-student-select').value;
    const lesson = document.getElementById('session-lesson-input').value.trim();
    const sessionDate = document.getElementById('session-date').value;
    const sessionTime = document.getElementById('session-time').value;

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
            showToast("Class session scheduled successfully!", "success");
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

const searchInput = document.getElementById('lesson-search');
const searchResults = document.getElementById('search-results');

const lessonItems = Array.from(document.querySelectorAll('.menu-tooltip')).map(item => {
    const link = item.querySelector('a');
    const img = item.querySelector('.btn-thumb');
    const title = item.querySelector('.btn-title');
    const target = item.querySelector('.btn-target');
    return {
        url: link ? link.getAttribute('href') : '#',
        imgSrc: img ? img.getAttribute('src') : '',
        title: title ? title.textContent.trim() : '',
        desc: target ? target.textContent.trim() : ''
    };
});

if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        const filteredLessons = lessonItems.filter(lesson => 
            lesson.title.toLowerCase().includes(query) || 
            lesson.desc.toLowerCase().includes(query)
        );

        if (filteredLessons.length > 0) {
            searchResults.innerHTML = filteredLessons.map(lesson => `
                <a href="${lesson.url}" class="search-result-item">
                    <img src="${lesson.imgSrc}" alt="${lesson.title}">
                    <div class="search-result-text">
                        <span class="search-result-title">${lesson.title}</span>
                        <span class="search-result-desc">${lesson.desc}</span>
                    </div>
                </a>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = `<div style="padding: 12px 15px; font-size: 13px; color: var(--text-muted); text-align: center;">No matching lessons found</div>`;
            searchResults.style.display = 'block';
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim() !== '') {
            searchResults.style.display = 'block';
        }
    });
}

function openLinkModal(url, student = 'N/A', title = 'N/A', date = 'N/A', time = 'N/A') {
    const modal = document.getElementById('link-modal');
    const input = document.getElementById('modal-link-input');
    const joinBtn = document.getElementById('modal-join-btn');
    
    // Populate session details into modal elements
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

document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const input = document.getElementById('modal-link-input');
            if (input) {
                navigator.clipboard.writeText(input.value)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                        setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy'; }, 2000);
                    })
                    .catch(() => showToast("Failed to copy link", "error"));
            }
        });
    }

    const linkModal = document.getElementById('link-modal');
    if (linkModal) {
        linkModal.addEventListener('click', (e) => { 
            if (e.target === linkModal) closeLinkModal(); 
        });
    }
});

function fetchScheduledSessions() {
    let storedName = localStorage.getItem('teacherName') || localStorage.getItem('username') || '';
    if (storedName.toLowerCase().startsWith('teacher ')) {
        storedName = storedName.substring(8).trim();
    }
    const cleanStored = storedName.toLowerCase();

    const callbackName = 'get_sessions_cb_' + Math.round(Math.random() * 1000000);

    window[callbackName] = function(sessions) {
        const tbody = document.getElementById('sessions-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const teacherSessions = Array.isArray(sessions) ? sessions.filter(s => {
            if (!s.teacher) return false; 
            let sheetTeacher = String(s.teacher).trim().toLowerCase();
            if (sheetTeacher.startsWith('teacher ')) sheetTeacher = sheetTeacher.substring(8).trim();
            return sheetTeacher === cleanStored || sheetTeacher.includes(cleanStored) || cleanStored.includes(sheetTeacher);
        }) : [];

        if (teacherSessions.length > 0) {
            teacherSessions.reverse().forEach(s => {
                const formattedTitle = formatLessonTitle(s.lesson);
                const sessionId = s.id;
                const friendlyDate = formatFriendlyDate(s.sessionDate);
                const friendlyTime = formatFriendlyTime(s.sessionTime);

                // Escape strings safely for inline function execution parameters
                const safeStudent = (s.student || '').replace(/'/g, "\\'");
                const safeTitle = (formattedTitle || '').replace(/'/g, "\\'");
                const safeDate = (friendlyDate || '').replace(/'/g, "\\'");
                const safeTime = (friendlyTime || '').replace(/'/g, "\\'");
                const safeLink = (s.link || '').replace(/'/g, "\\'");

                const tr = document.createElement('tr');
                tr.className = 'border-b border-base-300 hover:bg-base-200/50';
                tr.innerHTML = `
                    <td class="font-semibold py-3">${s.student}</td>
                    <td class="py-3">${formattedTitle}</td>
                    <td class="py-3">${friendlyDate}</td>
                    <td class="py-3">${friendlyTime}</td>
                    <td class="text-center py-3">
                        ${s.link ? `
                            <div class="flex gap-2 items-center justify-center">
                                <a href="${s.link}" target="_blank" class="btn custom-primary-bg text-white btn-xs">
                                    <i class="fa-solid fa-video"></i> Join
                                </a>
                                <button onclick="openLinkModal('${safeLink}', '${safeStudent}', '${safeTitle}', '${safeDate}', '${safeTime}')" class="btn btn-ghost btn-xs border border-base-300">
                                    <i class="fa-solid fa-eye"></i> View Link
                                </button>
                            </div>
                        ` : '<span class="text-base-content/50">No Link</span>'}
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
