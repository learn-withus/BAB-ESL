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
            <div class="flex items-center lg:justify-center gap-3 px-2 py-3 mb-2 w-full">
                <a href="${dashboardUrl}" class="inline-block shrink-0">
                    <img src="${pathToRoot}images/bab.png" alt="Logo" class="w-8 h-8 object-contain">
                </a>
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
            <div class="tooltip tooltip-right w-full z-50" data-tip="Teachers">
                <a href="${pathToRoot}pages/teachers-schedules.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="admin-schedules.html">
                    <i class="fa-solid fa-calendar-check w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Teachers</span>
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
        <dialog id="teacher-schedule-modal" class="modal modal-bottom sm:modal-middle backdrop-blur-xs cursor-pointer">
            <div class="modal-box p-6 sm:p-8 overflow-hidden w-11/12 max-w-7xl h-[88vh] max-h-[92vh] bg-base-100 border border-base-300 shadow-2xl rounded-3xl relative flex flex-col justify-between cursor-default">
                <button onclick="closeTeacherScheduleModal()" class="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-30 bg-base-100/80 text-error hover:bg-error hover:text-white border border-error/30 shadow-sm">✕</button>

                <div class="relative pr-8">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center justify-center w-11 h-11 bg-primary/10 text-primary rounded-2xl text-lg shadow-xs border border-primary/20">
                                <i class="fa-solid fa-calendar-days"></i>
                            </span>
                            <div>
                                <h3 id="t-modal-title" class="font-extrabold text-xl sm:text-2xl text-base-content tracking-tight">My Teaching Schedule</h3>
                                <p id="t-modal-subtitle" class="text-xs sm:text-sm text-base-content/60 font-medium mt-0.5">Loading scheduled classes...</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="join shadow-xs">
                                <button onclick="changeTNavView('day')" id="tnav-btn-day" class="btn btn-sm join-item btn-ghost border border-base-300 font-semibold">Day</button>
                                <button onclick="changeTNavView('week')" id="tnav-btn-week" class="btn btn-sm join-item btn-primary font-bold">Week</button>
                                <button onclick="changeTNavView('month')" id="tnav-btn-month" class="btn btn-sm join-item btn-ghost border border-base-300 font-semibold">Month</button>
                            </div>
                            
                            <div class="flex items-center gap-1 bg-base-200/80 p-1 rounded-xl border border-base-300 shadow-xs">
                                <button onclick="navigateTNavCalendar(-1)" class="btn btn-sm btn-circle btn-ghost"><i class="fa-solid fa-chevron-left"></i></button>
                                <button onclick="navigateTNavCalendar(0)" class="btn btn-sm btn-ghost font-bold text-xs">Today</button>
                                <button onclick="navigateTNavCalendar(1)" class="btn btn-sm btn-circle btn-ghost"><i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-base-300/60 my-3"></div>
                </div>

                <div class="overflow-x-auto custom-scroll border border-base-300 rounded-2xl flex-1 my-2 bg-base-100 shadow-inner">
                    <div id="tnav-grid-container" class="min-w-[900px]"></div>
                </div>
            </div>
        </dialog>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalEl = document.getElementById('teacher-schedule-modal');
    if (modalEl) {
        modalEl.addEventListener('click', (event) => {
            const box = modalEl.querySelector('.modal-box');
            if (box && !box.contains(event.target)) {
                closeTeacherScheduleModal();
            }
        });
    }
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

        if (/^\d{2}:\d{2}$/.test(sTimeRaw)) {
            let [h, m] = sTimeRaw.split(':');
            let hourNum = parseInt(h, 10);
            let ampm = hourNum >= 12 ? 'pm' : 'am';
            hourNum = hourNum % 12 || 12;
            sTimeRaw = `${hourNum}:${m} ${ampm}`;
        }

        try {
            const slotHourMatch = hourStr.match(/^(\d+):/);
            const sessionHourMatch = sTimeRaw.match(/^(\d+):/);
            const slotAmPm = hourStr.toLowerCase().includes('pm') ? 'pm' : 'am';
            const sessionAmPm = sTimeRaw.includes('pm') ? 'pm' : 'am';

            if (slotHourMatch && sessionHourMatch) {
                return parseInt(slotHourMatch[1], 10) === parseInt(sessionHourMatch[1], 10) && slotAmPm === sessionAmPm;
            }
        } catch (e) {
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
    titleEl.textContent = `${myName}'s Weekly Schedule`;

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

    subtitleEl.innerHTML = `<span class="text-base-content/80 font-semibold">${startStr} - ${endStr}</span> • <span class="text-primary font-bold">${totalBookedCount} total bookings</span> this week.`;

    let html = `
        <table class="table table-pin-rows table-zebra text-center w-full border-collapse">
            <thead>
                <tr class="bg-base-200/90 text-base-content text-xs uppercase tracking-wider font-extrabold">
                    <th class="w-28 border-r border-base-300 py-3">Time</th>
                    ${weekDays.map(d => {
                        const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                        const todayPSTStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                        const isToday = (todayPSTStr === dateKey);
                        return `<th class="border-r border-base-300 py-3 ${isToday ? 'bg-primary/15 text-primary font-black' : ''}">${d.toLocaleDateString('en-US', { weekday: 'short' })} <br><span class="text-[11px] opacity-80">${d.getMonth() + 1}/${d.getDate()}</span></th>`;
                    }).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    hours.forEach(hour => {
        html += `<tr><th class="bg-base-200/50 text-xs border-r border-base-300 font-bold py-3">${hour}</th>`;
        weekDays.forEach(d => {
            const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
            const matchedSessions = getSessionsForLoggedInTeacherSlot(dateKey, hour);

            if (matchedSessions.length > 0) {
                html += `<td class="border-r border-base-300 p-2 bg-primary/10 space-y-1.5 align-middle">`;
                matchedSessions.forEach(matched => {
                    const studentName = matched.Student || matched.student || 'Student';
                    const lessonName = matched.Lesson || matched.lesson || 'Class';
                    const timeStr = matched.Time || matched.time || matched.sessionTime || '';
                    html += `
                        <div class="bg-base-100 p-2 rounded-xl border border-primary/30 shadow-sm text-left hover:shadow-md transition-all">
                            <div class="flex justify-between items-center">
                                <span class="badge badge-primary badge-xs font-bold text-white px-2 py-0.5">Booked</span>
                                <span class="text-[10px] font-semibold opacity-70">${timeStr}</span>
                            </div>
                            <div class="text-xs font-bold mt-1 text-primary truncate flex items-center gap-1">
                                <i class="fa-solid fa-user-graduate text-[10px]"></i> ${studentName}
                            </div>
                            <div class="text-[11px] font-medium text-base-content/80 truncate mt-0.5 flex items-center gap-1">
                                <i class="fa-solid fa-book text-[10px] opacity-70"></i> ${lessonName}
                            </div>
                        </div>
                    `;
                });
                html += `</td>`;
            } else {
                html += `
                    <td class="border-r border-base-300 p-2">
                        <span class="text-[11px] text-base-content/40 font-medium">Available</span>
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
    titleEl.textContent = `${myName}'s Daily Schedule`;
    const dateFormatted = teacherNavCurrentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
    const dateKey = teacherNavCurrentDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    const hours = [
        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', 
        '10:00 PM', '11:00 PM', '12:00 AM'
    ];

    let html = `<div class="p-6 space-y-3 max-w-3xl mx-auto w-full">`;
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
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-base-100 p-4 rounded-2xl border border-primary/30 shadow-sm gap-4 hover:border-primary transition-all">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="badge badge-primary font-bold text-xs px-2.5 py-1">${timeStr}</span>
                            <span class="font-bold text-sm sm:text-base text-base-content">${lessonName}</span>
                        </div>
                        <p class="text-xs font-medium text-base-content/70 pl-1">Student: <strong class="text-primary font-bold">${studentName}</strong></p>
                    </div>
                    ${linkUrl ? `<a href="${linkUrl}" target="_blank" class="btn btn-primary btn-sm font-bold gap-2 rounded-xl px-4"><i class="fa-solid fa-video"></i> Join Meet</a>` : '<span class="badge badge-warning badge-sm font-semibold">No Link Yet</span>'}
                </div>
            `;
        });
    } else {
        html += `<div class="text-center py-12"><p class="text-sm text-base-content/50 italic">No scheduled classes booked for this day (${dateFormatted}).</p></div>`;
    }

    subtitleEl.innerHTML = `<span class="text-base-content/80 font-semibold">${dateFormatted}</span> • <span class="text-primary font-bold">${allTodaySessions.length} classes scheduled</span>.`;
    html += `</div>`;
    container.innerHTML = html;
}

function renderTNavMonthView(container, titleEl, subtitleEl) {
    const year = teacherNavCurrentDate.getFullYear();
    const month = teacherNavCurrentDate.getMonth();
    const myName = localStorage.getItem('teacherName') || localStorage.getItem('username') || "Teacher";
    titleEl.textContent = `${myName}'s Monthly Schedule`;
    const monthFormatted = teacherNavCurrentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Manila' });
    subtitleEl.innerHTML = `<span class="text-base-content/80 font-semibold">${monthFormatted}</span> • Click any day to switch to day view.`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const hours = [
        '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', 
        '10:00 PM', '11:00 PM', '12:00 AM'
    ];

    let html = `
        <table class="table text-center w-full border-collapse h-full">
            <thead>
                <tr class="bg-base-200/90 text-xs uppercase font-extrabold tracking-wider text-base-content">
                    <th class="border border-base-300 py-3">Sun</th>
                    <th class="border border-base-300 py-3">Mon</th>
                    <th class="border border-base-300 py-3">Tue</th>
                    <th class="border border-base-300 py-3">Wed</th>
                    <th class="border border-base-300 py-3">Thu</th>
                    <th class="border border-base-300 py-3">Fri</th>
                    <th class="border border-base-300 py-3">Sat</th>
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
                <td class="border border-base-300 h-24 align-top p-2.5 hover:bg-primary/5 cursor-pointer transition-all group" onclick="selectTNavMonthDay('${dateKey}')">
                    <div class="font-bold text-xs text-base-content group-hover:text-primary">${dayCount}</div>
                    ${daySessions.length > 0 ? `<div class="mt-2 badge badge-primary badge-xs font-bold p-2">${daySessions.length} class(es)</div>` : ''}
                </td>
            `;
            dayCount++;
        } else {
            html += `<td class="border border-base-300 bg-base-200/20 h-24"></td>`;
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
