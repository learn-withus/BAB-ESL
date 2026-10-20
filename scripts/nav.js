function redirectToLogin() {
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const pathToRoot = isInPagesFolder ? '../' : './';
    window.location.replace(pathToRoot + "login.html");
}

if (localStorage.getItem('isLoggedIn') !== 'true') {
    redirectToLogin();
}

window.addEventListener('pageshow', function(event) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        redirectToLogin();
    }
});

let teacherNavSessions = [];
let teacherNavCurrentView = 'week';
let teacherNavCurrentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

function loadNavbar() {
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const pathToRoot = isInPagesFolder ? '../' : './';
    const userRole = String(localStorage.getItem('userRole') || localStorage.getItem('role') || "1").trim();

    let dashboardUrl = pathToRoot + "user-dashboard.html";
    let dashboardPageName = "user-dashboard.html";
    if (userRole === "2") {
        dashboardUrl = pathToRoot + "index.html";
        dashboardPageName = "index.html";
    } else if (userRole === "3") {
        dashboardUrl = pathToRoot + "admin-dashboard.html";
        dashboardPageName = "admin-dashboard.html";
    }

    const currentPath = window.location.pathname;
    const currentFileName = currentPath.split("/").pop() || "index.html";

    if (!currentPath.includes('/pages/')) {
        if (userRole === "1") {
            if (currentFileName === "index.html" || currentFileName === "admin-dashboard.html" || currentPath.endsWith('/')) {
                window.location.replace(pathToRoot + "user-dashboard.html");
                return;
            }
        } else if (userRole === "2") {
            if (currentFileName === "user-dashboard.html" || currentFileName === "admin-dashboard.html") {
                window.location.replace(pathToRoot + "index.html");
                return;
            }
        } else if (userRole === "3") {
            if (currentFileName === "user-dashboard.html" || currentFileName === "index.html") {
                window.location.replace(pathToRoot + "admin-dashboard.html");
                return;
            }
        }
    }

    let navHTML = '';

    navHTML += `
        <div class="tooltip tooltip-right w-full z-50" data-tip="BAB ESL">
            <div class="flex items-center lg:justify-center gap-3 px-2 py-3 mb-2 w-full">
                <a href="${dashboardUrl}" class="inline-block shrink-0">
                    <img src="${pathToRoot}images/bab.png" alt="Logo" class="w-8 h-8 object-contain">
                </a>
                <span class="font-bold text-base inline lg:hidden">BAB ESL</span>
            </div>
        </div>
        <div class="divider my-0"></div>
    `;

    if (userRole === "1") {
        navHTML += `
            <div class="tooltip tooltip-right w-full z-50" data-tip="Dashboard">
                <a href="${pathToRoot}user-dashboard.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="user-dashboard.html">
                    <i class="fa-solid fa-house w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Dashboard</span>
                </a>
            </div>
            <div class="tooltip tooltip-right w-full z-50" data-tip="Teachers">
                <a href="${pathToRoot}pages/teachers.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="teachers.html">
                    <i class="fa-solid fa-chalkboard-user w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Teachers</span>
                </a>
            </div>
        `;
    } else if (userRole === "2") {
        navHTML += `
            <div class="tooltip tooltip-right w-full z-50" data-tip="Dashboard">
                <a href="${pathToRoot}index.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="index.html">
                    <i class="fa-solid fa-house w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Dashboard</span>
                </a>
            </div>
            <div class="tooltip tooltip-right w-full z-50" data-tip="My Schedule">
                <button onclick="openTeacherScheduleModal()" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full text-left">
                    <i class="fa-solid fa-calendar-days w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">My Schedule</span>
                </button>
            </div>
            <div class="tooltip tooltip-right w-full z-50" data-tip="Books">
                <a href="${pathToRoot}pages/book-menu.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="book-menu.html">
                    <i class="fa-solid fa-book w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Books</span>
                </a>
            </div>
        `;
    } else if (userRole === "3") {
        navHTML += `
            <div class="tooltip tooltip-right w-full z-50" data-tip="Dashboard">
                <a href="${pathToRoot}admin-dashboard.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="admin-dashboard.html">
                    <i class="fa-solid fa-house w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Dashboard</span>
                </a>
            </div>
        `;
    }

    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;

        const links = placeholder.querySelectorAll('.side-link[data-page]');
        links.forEach(link => {
            link.classList.remove('bg-primary', 'text-primary-content');
            const targetPage = link.getAttribute('data-page');
            if (currentFileName === targetPage || (targetPage === dashboardPageName && (currentPath.endsWith('/') || currentFileName === ''))) {
                link.classList.add('bg-primary', 'text-primary-content');
            }
        });

        initThemeToggle();
    }

    if (userRole === "2") {
        injectTeacherScheduleModal();
    }
}

function injectTeacherScheduleModal() {
    if (document.getElementById('teacher-schedule-modal')) return;

    const modalHTML = `
        <dialog id="teacher-schedule-modal" class="modal modal-bottom sm:modal-middle backdrop-blur-xs">
            <div class="modal-box p-6 sm:p-8 overflow-hidden w-11/12 max-w-7xl h-[88vh] max-h-[92vh] bg-base-100 border border-base-300 shadow-2xl rounded-3xl relative flex flex-col justify-between">
                <button onclick="closeTeacherScheduleModal()" class="btn btn-sm btn-circle btn-ghost absolute top-5 right-5 z-20 bg-base-100/60 backdrop-blur-md text-base-content/70 hover:text-base-content hover:bg-base-200 border border-base-300/50 shadow-xs">✕</button>

                <div>
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-2xl text-lg shadow-xs">
                                <i class="fa-solid fa-calendar-days"></i>
                            </span>
                            <div>
                                <h3 id="t-modal-title" class="font-bold text-xl text-base-content">My Teaching Schedule</h3>
                                <p id="t-modal-subtitle" class="text-xs text-base-content/60">Loading scheduled classes...</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 pr-8 sm:pr-0">
                            <div class="join shadow-xs">
                                <button onclick="changeTNavView('day')" id="tnav-btn-day" class="btn btn-sm join-item btn-ghost border border-base-300">Day</button>
                                <button onclick="changeTNavView('week')" id="tnav-btn-week" class="btn btn-sm join-item btn-primary">Week</button>
                                <button onclick="changeTNavView('month')" id="tnav-btn-month" class="btn btn-sm join-item btn-ghost border border-base-300">Month</button>
                            </div>
                            
                            <div class="flex items-center gap-1 bg-base-200 p-1 rounded-lg border border-base-300">
                                <button onclick="navigateTNavCalendar(-1)" class="btn btn-sm btn-circle btn-ghost"><i class="fa-solid fa-chevron-left"></i></button>
                                <button onclick="navigateTNavCalendar(0)" class="btn btn-sm btn-ghost font-semibold text-xs">Today</button>
                                <button onclick="navigateTNavCalendar(1)" class="btn btn-sm btn-circle btn-ghost"><i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-base-200 my-3"></div>
                </div>

                <div class="overflow-x-auto custom-scroll border border-base-300 rounded-2xl flex-1 my-2">
                    <div id="tnav-grid-container" class="min-w-[900px]"></div>
                </div>

                <div class="pt-2 border-t border-base-200 flex justify-end">
                    <button onclick="closeTeacherScheduleModal()" class="btn btn-primary btn-sm px-6 font-bold rounded-xl">Close Schedule</button>
                </div>
            </div>
        </dialog>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openTeacherScheduleModal() {
    const modal = document.getElementById('teacher-schedule-modal');
    if (modal) {
        modal.showModal();
        fetchTeacherSessionsAndRender();
    }
}

function closeTeacherScheduleModal() {
    const modal = document.getElementById('teacher-schedule-modal');
    if (modal) modal.close();
}

function changeTNavView(viewType) {
    teacherNavCurrentView = viewType;
    document.querySelectorAll('#tnav-btn-day, #tnav-btn-week, #tnav-btn-month').forEach(b => b.classList.replace('btn-primary', 'btn-ghost'));
    document.getElementById(`tnav-btn-${viewType}`).classList.replace('btn-ghost', 'btn-primary');
    renderTNavCalendarMatrix();
}

function navigateTNavCalendar(direction) {
    if (direction === 0) {
        teacherNavCurrentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    } else {
        if (teacherNavCurrentView === 'day') {
            teacherNavCurrentDate.setDate(teacherNavCurrentDate.getDate() + direction);
        } else if (teacherNavCurrentView === 'week') {
            teacherNavCurrentDate.setDate(teacherNavCurrentDate.getDate() + (direction * 7));
        } else if (teacherNavCurrentView === 'month') {
            teacherNavCurrentDate.setMonth(teacherNavCurrentDate.getMonth() + direction);
        }
    }
    renderTNavCalendarMatrix();
}

async function fetchTeacherSessionsAndRender() {
    const API_URL = "https://script.google.com/macros/s/AKfycbwhI1B0aGzDzwthu23R-F_c_Zqb1GEFSUHRMXrP1JFX03D7fxIntTB5-g5cpf__pHtW/exec";
    const callbackName = 'jsonp_cb_nav_' + Math.floor(Math.random() * 1000000);
    
    window[callbackName] = function(data) {
        delete window[callbackName];
        teacherNavSessions = Array.isArray(data) ? data : [];
        renderTNavCalendarMatrix();
    };

    const script = document.createElement('script');
    script.src = `${API_URL}?action=getSessions&callback=${callbackName}&_cb=${Date.now()}`;
    document.body.appendChild(script);
}

function parseLocalDateKey(dateInput) {
    if (!dateInput) return "";
    let str = String(dateInput).trim();
    if (str.includes('T')) str = str.split('T')[0];
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    }
    return str;
}

function getSessionsForLoggedInTeacherSlot(dateKey, hourStr) {
    const myName = (localStorage.getItem('teacherName') || localStorage.getItem('username') || localStorage.getItem('name') || "Teacher").toLowerCase();

    return teacherNavSessions.filter(s => {
        let tName = String(s.Teacher || s.teacher || "").toLowerCase().trim();
        if (tName.startsWith('teacher ')) tName = tName.substring(8).trim();
        
        const rawDate = String(s.Date || s.date || s.sessionDate || "").trim();
        const sDate = parseLocalDateKey(rawDate);

        let sTimeRaw = String(s.Time || s.time || s.sessionTime || "").toLowerCase().trim();

        const isTeacherMatch = tName === myName || myName.includes(tName) || tName.includes(myName);
        if (!isTeacherMatch || sDate !== dateKey) return false;

        // Convert 24-hour format (e.g., "14:15") to 12-hour format
        if (/^\d{2}:\d{2}$/.test(sTimeRaw)) {
            let [h, m] = sTimeRaw.split(':');
            let hourNum = parseInt(h, 10);
            let ampm = hourNum >= 12 ? 'pm' : 'am';
            hourNum = hourNum % 12 || 12;
            sTimeRaw = `${hourNum}:${m} ${ampm}`;
        }

        // Match by exact hour block (ignoring minutes like :15 or :30 so it snaps to the calendar row)
        try {
            const slotHourMatch = hourStr.match(/^(\d+):/);
            const sessionHourMatch = sTimeRaw.match(/^(\d+):/);
            const slotAmPm = hourStr.toLowerCase().includes('pm') ? 'pm' : 'am';
            const sessionAmPm = sTimeRaw.includes('pm') ? 'pm' : 'am';

            if (slotHourMatch && sessionHourMatch) {
                return parseInt(slotHourMatch[1], 10) === parseInt(sessionHourMatch[1], 10) && slotAmPm === sessionAmPm;
            }
        } catch (e) {
            // fallback comparison
        }

        return sTimeRaw === hourStr.toLowerCase();
    });
}

function renderTNavCalendarMatrix() {
    const container = document.getElementById('tnav-grid-container');
    const titleEl = document.getElementById('t-modal-title');
    const subtitleEl = document.getElementById('t-modal-subtitle');
    if (!container) return;

    if (teacherNavCurrentView === 'week') {
        renderTNavWeekView(container, titleEl, subtitleEl);
    } else if (teacherNavCurrentView === 'day') {
        renderTNavDayView(container, titleEl, subtitleEl);
    } else if (teacherNavCurrentView === 'month') {
        renderTNavMonthView(container, titleEl, subtitleEl);
    }
}

function renderTNavWeekView(container, titleEl, subtitleEl) {
    const startOfWeek = new Date(teacherNavCurrentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    let weekDays = [];
    for (let i = 0; i < 7; i++) {
        let d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
    }

    const startStr = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const myName = localStorage.getItem('teacherName') || localStorage.getItem('username') || "Teacher";
    titleEl.textContent = `${myName}'s Weekly Schedule (${startStr} - ${endStr})`;

    const hours = [
        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', 
        '10:00 PM', '11:00 PM', '12:00 AM'
    ];

    let totalBookedCount = 0;

    weekDays.forEach(d => {
        const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
        hours.forEach(hour => {
            const matches = getSessionsForLoggedInTeacherSlot(dateKey, hour);
            totalBookedCount += matches.length;
        });
    });

    subtitleEl.innerHTML = `<span class="text-primary font-bold">${totalBookedCount} total bookings</span> for this week.`;

    let html = `
        <table class="table table-pin-rows table-zebra text-center w-full border-collapse">
            <thead>
                <tr class="bg-base-200 text-base-content text-xs uppercase">
                    <th class="w-28 border-r border-base-300">Time</th>
                    ${weekDays.map(d => {
                        const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                        const todayPSTStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                        const isToday = (todayPSTStr === dateKey);
                        return `<th class="border-r border-base-300 ${isToday ? 'bg-primary/10 text-primary font-bold' : ''}">${d.toLocaleDateString('en-US', { weekday: 'short' })} <br><span class="text-[11px] opacity-70">${d.getMonth() + 1}/${d.getDate()}</span></th>`;
                    }).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    hours.forEach(hour => {
        html += `<tr><th class="bg-base-200/60 text-xs border-r border-base-300 font-semibold">${hour}</th>`;
        weekDays.forEach(d => {
            const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
            const matchedSessions = getSessionsForLoggedInTeacherSlot(dateKey, hour);

            if (matchedSessions.length > 0) {
                html += `<td class="border-r border-base-300 p-1.5 bg-primary/10 space-y-1">`;
                matchedSessions.forEach(matched => {
                    const studentName = matched.Student || matched.student || 'Student';
                    const lessonName = matched.Lesson || matched.lesson || 'Class';
                    const timeStr = matched.Time || matched.time || matched.sessionTime || '';
                    html += `
                        <div class="bg-base-100 p-1.5 rounded-lg border border-primary/30 shadow-xs text-left">
                            <div class="flex justify-between items-center">
                                <span class="badge badge-primary badge-xs font-bold text-white">Booked</span>
                                <span class="text-[9px] opacity-70">${timeStr}</span>
                            </div>
                            <div class="text-[10px] font-bold mt-0.5 text-primary truncate">👤 ${studentName}</div>
                            <div class="text-[9px] opacity-80 truncate">📚 ${lessonName}</div>
                        </div>
                    `;
                });
                html += `</td>`;
            } else {
                html += `
                    <td class="border-r border-base-300 p-2">
                        <span class="text-[10px] text-base-content/40 font-medium">Available</span>
                    </td>`;
            }
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderTNavDayView(container, titleEl, subtitleEl) {
    const myName = localStorage.getItem('teacherName') || localStorage.getItem('username') || "Teacher";
    titleEl.textContent = `${myName}'s Daily Schedule (${teacherNavCurrentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })})`;
    const dateKey = teacherNavCurrentDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    const hours = [
        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', 
        '10:00 PM', '11:00 PM', '12:00 AM'
    ];

    let html = `<div class="p-4 space-y-2">`;
    let allTodaySessions = [];

    hours.forEach(hour => {
        const matches = getSessionsForLoggedInTeacherSlot(dateKey, hour);
        matches.forEach(m => {
            if (!allTodaySessions.includes(m)) {
                allTodaySessions.push(m);
            }
        });
    });

    if (allTodaySessions.length > 0) {
        allTodaySessions.forEach(matched => {
            const studentName = matched.Student || matched.student || 'N/A';
            const lessonName = matched.Lesson || matched.lesson || 'Class Session';
            const timeStr = matched.Time || matched.time || matched.sessionTime || 'Time';
            const linkUrl = matched.Link || matched.link || '';

            html += `
                <div class="flex justify-between items-center bg-primary/10 p-3.5 rounded-xl border border-primary/25">
                    <div>
                        <span class="font-bold text-xs text-primary">${timeStr}</span> — <span class="font-bold text-xs">${lessonName}</span>
                        <p class="text-[11px] text-base-content/70 mt-0.5">Student: <strong>${studentName}</strong></p>
                    </div>
                    ${linkUrl ? `<a href="${linkUrl}" target="_blank" class="btn btn-primary btn-xs font-bold gap-1"><i class="fa-solid fa-video"></i> Join Meet</a>` : '<span class="badge badge-warning badge-xs">No Link Yet</span>'}
                </div>
            `;
        });
    } else {
        html += `<p class="text-xs text-base-content/50 italic py-8 text-center">No scheduled classes booked for this day.</p>`;
    }

    subtitleEl.innerHTML = `<span class="text-primary font-bold">${allTodaySessions.length} classes scheduled</span> for this day.`;
    html += `</div>`;
    container.innerHTML = html;
}

function renderTNavMonthView(container, titleEl, subtitleEl) {
    const year = teacherNavCurrentDate.getFullYear();
    const month = teacherNavCurrentDate.getMonth();
    const myName = localStorage.getItem('teacherName') || localStorage.getItem('username') || "Teacher";
    titleEl.textContent = `${myName}'s Monthly Schedule (${teacherNavCurrentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })})`;
    subtitleEl.textContent = `Click any day to switch to day view.`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const hours = [
        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', 
        '10:00 PM', '11:00 PM', '12:00 AM'
    ];

    let html = `
        <table class="table text-center w-full border-collapse">
            <thead>
                <tr class="bg-base-200 text-xs uppercase">
                    <th class="border border-base-300">Sun</th>
                    <th class="border border-base-300">Mon</th>
                    <th class="border border-base-300">Tue</th>
                    <th class="border border-base-300">Wed</th>
                    <th class="border border-base-300">Thu</th>
                    <th class="border border-base-300">Fri</th>
                    <th class="border border-base-300">Sat</th>
                </tr>
            </thead>
            <tbody>
                <tr>
    `;

    let dayCount = 1;
    for (let i = 0; i < 42; i++) {
        if (i >= firstDay && dayCount <= daysInMonth) {
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(dayCount).padStart(2, '0');
            const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
            
            let daySessions = [];
            hours.forEach(hour => {
                const matches = getSessionsForLoggedInTeacherSlot(dateKey, hour);
                matches.forEach(m => {
                    if (!daySessions.includes(m)) daySessions.push(m);
                });
            });

            html += `
                <td class="border border-base-300 h-20 align-top p-2 hover:bg-base-200/50 cursor-pointer" onclick="selectTNavMonthDay('${dateKey}')">
                    <div class="font-bold text-xs">${dayCount}</div>
                    ${daySessions.length > 0 ? `<div class="mt-1 badge badge-primary badge-xs font-bold">${daySessions.length} class(es)</div>` : ''}
                </td>
            `;
            dayCount++;
        } else {
            html += `<td class="border border-base-300 bg-base-200/20 h-20"></td>`;
        }
        if ((i + 1) % 7 === 0 && i < 41) html += `</tr><tr>`;
    }

    html += `</tr></tbody></table>`;
    container.innerHTML = html;
}

function selectTNavMonthDay(dateKey) {
    teacherNavCurrentDate = new Date(dateKey + 'T00:00:00');
    changeTNavView('day');
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

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    const savedName = localStorage.getItem('teacherName') || localStorage.getItem('username');
    const userDisplay = document.getElementById('username-display');
    if (userDisplay && savedName) {
        userDisplay.innerText = savedName;
    }
});

function logout() {
    localStorage.clear();
    redirectToLogin();
}
