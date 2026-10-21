(function () {
    const API_URL = "https://script.google.com/macros/s/AKfycbwhI1B0aGzDzwthu23R-F_c_Zqb1GEFSUHRMXrP1JFX03D7fxIntTB5-g5cpf__pHtW/exec";

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        @keyframes bellBounce {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-15deg); }
            40% { transform: rotate(15deg); }
            60% { transform: rotate(-10deg); }
            80% { transform: rotate(10deg); }
        }
        .animate-bell-ring {
            animation: bellBounce 2s ease-in-out infinite;
            transform-origin: top center;
        }
    `;
    document.head.appendChild(styleTag);

    function parseDriveLink(url) {
        if (!url) return '';
        const cleanUrl = url.trim();
        if (cleanUrl.includes('drive.google.com')) {
            const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
            }
        }
        return cleanUrl;
    }

    function injectTopNav() {
        if (document.getElementById('global-shared-navbar')) return;

        let username = (
            localStorage.getItem('username') || 
            localStorage.getItem('userName') || 
            localStorage.getItem('currentUser') || 
            localStorage.getItem('teacherName') || 
            localStorage.getItem('name') || 'User'
        ).trim();

        if (username.toLowerCase().startsWith('teacher ')) {
            username = username.substring(8).trim();
        }

        const roleVal = String(localStorage.getItem('role') || localStorage.getItem('userRole') || '1').trim().toLowerCase();
        let roleTitle = "Student";
        let isTeacherOrAdmin = false;

        if (roleVal === "3" || roleVal === "admin") {
            roleTitle = "Administrator";
            isTeacherOrAdmin = true;
        } else if (roleVal === "2" || roleVal === "teacher" || roleVal === "content manager") {
            roleTitle = "Teacher";
            isTeacherOrAdmin = true;
        } else {
            roleTitle = "Student";
            isTeacherOrAdmin = false;
        }

        const cachedPic = localStorage.getItem('profilePic') || localStorage.getItem('userProfilePic') || "";
        const profilePicUrl = parseDriveLink(cachedPic) || "https://via.placeholder.com/150";

        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const profileLink = isInPagesFolder ? "profile.html" : "pages/profile.html";
        const logoutRedirect = isInPagesFolder ? "../login.html" : "./login.html";

        const isTeachersPage = window.location.pathname.toLowerCase().includes('teachers.html');

        const navHTML = `
            <nav id="global-shared-navbar" class="navbar w-full bg-base-100 border-b border-base-300 shrink-0 px-4 sm:px-6 sticky top-0 z-50 shadow-xs justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="flex-none lg:hidden">
                        <label for="main-drawer" class="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                    </div> 

                    <!-- Desktop Search Bar (Hidden on teachers.html) -->
                    <div class="w-64 xl:w-80 ${isTeachersPage ? 'hidden' : 'hidden lg:block'} relative" id="global-search-container">
                        <label class="input input-bordered input-sm flex items-center gap-2 input-primary w-full bg-base-100 shadow-sm">
                            <svg class="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                            <input type="text" id="global-book-search-input" placeholder="Search lessons..." autocomplete="off" class="grow text-xs bg-transparent outline-none"> 
                            <kbd class="kbd kbd-xs">⌘</kbd> <kbd class="kbd kbd-xs">K</kbd>
                        </label>
                        <div id="global-search-suggestions" class="absolute left-0 right-0 top-full mt-2 bg-base-100 shadow-2xl rounded-box border border-base-300 max-h-72 overflow-y-auto z-50 hidden p-1.5 space-y-1 divide-y divide-base-200"></div>
                    </div>
                </div>

                <div class="flex flex-row gap-2 sm:gap-4 items-center">
                    ${isTeacherOrAdmin ? `
                    <div class="hidden lg:flex items-center gap-2 bg-base-200/70 px-3 py-1.5 rounded-xl border border-base-300 shadow-xs">
                        <div class="flex flex-col text-right">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-base-content/60">Booking</span>
                            <span id="topnav-booking-label" class="text-xs font-bold text-success">Open</span>
                        </div>
                        <input type="checkbox" id="topnav-booking-toggle" class="toggle toggle-primary toggle-sm" checked onchange="toggleTeacherBookingStatus()" />
                    </div>
                    
                    <label class="swap swap-rotate btn btn-ghost btn-circle btn-sm" id="theme-swap-btn">
                        <input type="checkbox" id="global-theme-checkbox" />
                        <svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"></path></svg>
                        <svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"></path></svg>
                    </label>

                    <div class="dropdown dropdown-end relative">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm relative" id="notification-bell-btn">
                            <div class="indicator">
                                <i id="bell-icon" class="fa-solid fa-bell text-base text-base-content/80"></i>
                                <span id="notification-badge" class="badge badge-xs badge-primary indicator-item hidden font-bold">0</span>
                            </div>
                        </div>
                        <ul tabindex="0" class="dropdown-content menu p-3 sm:p-4 shadow-2xl bg-base-100 rounded-2xl border border-base-300 max-w-[calc(100vw-2rem)] w-80 sm:w-96 z-[9999] mt-3 right-0 space-y-3">
                            <li class="p-0 hover:bg-transparent">
                                <div class="flex justify-between items-center border-b border-base-200 pb-2.5 w-full p-0">
                                    <h3 class="font-extrabold text-sm sm:text-base flex items-center gap-2 text-base-content tracking-tight">
                                        <i class="fa-solid fa-bell text-primary text-base"></i> Session Requests
                                    </h3>
                                    <span class="badge badge-primary font-bold text-xs px-2.5 py-1" id="notification-count-tag">0 New</span>
                                </div>
                            </li>
                            <li class="p-0 hover:bg-transparent">
                                <div id="notification-list" class="max-h-72 overflow-y-auto flex flex-col gap-2.5 w-full p-0 custom-scroll">
                                    <div class="text-center py-4 text-xs text-base-content/50 italic w-full">
                                        No new session requests.
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    ` : ''}

                    <div class="flex flex-row items-center gap-2">
                        <div class="dropdown dropdown-end">
                            <div tabindex="0" role="button" class="avatar avatar-online cursor-pointer">
                                <div class="ring-primary ring-offset-base-100 ring-2 ring-offset-2 w-8 rounded-full">
                                    <img alt="User Avatar" src="${profilePicUrl}" id="global-header-avatar">
                                </div>
                            </div>
                            <ul tabindex="-1" class="dropdown-content menu menu-sm bg-base-100 rounded-box z-[9999] mt-3 w-52 p-2 shadow border border-base-300">
                                <li><a href="${profileLink}" class="py-2">Profile</a></li>
                                <li><button onclick="localStorage.clear(); window.location.href='${logoutRedirect}';" class="text-error py-2 w-full text-left">Logout</button></li>
                            </ul>
                        </div>
                        <div class="flex flex-col text-left mr-1 hidden sm:flex">
                            <span id="global-username-display" class="font-bold text-xs sm:text-sm">${username}</span>
                            <span class="font-bold text-[10px] text-primary" id="global-role-display">${roleTitle}</span>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        const drawerContent = document.querySelector('.drawer-content');
        if (drawerContent) {
            drawerContent.insertAdjacentHTML('afterbegin', navHTML);
        }

        fetchProfilePicture(username);
        if (!isTeachersPage) {
            initGlobalBookSearch();
        }
        if (isTeacherOrAdmin) {
            initNotificationChecker(username);
            injectMobileBookingToggle();
        }

        const themeCheckbox = document.getElementById('global-theme-checkbox');
        const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeCheckbox) {
            themeCheckbox.checked = (savedTheme === 'dark');
            themeCheckbox.onchange = (e) => {
                const isDark = e.target.checked;
                const newTheme = isDark ? 'dark' : 'light';
                localStorage.setItem('dashboard-theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            };
        }
    }

    function injectMobileBookingToggle() {
        const drawerSideMenu = document.querySelector('.drawer-side .menu');
        if (!drawerSideMenu) return;

        if (document.getElementById('mobile-booking-drawer-item')) return;

        const mobileBookingHTML = `
            <div id="mobile-booking-drawer-item" class="mt-auto p-3 bg-base-200/70 rounded-2xl border border-base-300 flex items-center justify-between shadow-xs lg:hidden mx-2 mb-3 cursor-pointer" onclick="const toggle = document.getElementById('topnav-mobile-booking-toggle'); if(toggle) { toggle.checked = !toggle.checked; syncTeacherBookingStatus('mobile'); }">
                <div class="flex flex-col text-left pointer-events-none">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-base-content/60">Booking Status</span>
                    <span id="topnav-mobile-booking-label" class="text-xs font-bold text-success">Open</span>
                </div>
                <input type="checkbox" id="topnav-mobile-booking-toggle" class="toggle toggle-primary toggle-sm pointer-events-auto" checked onclick="event.stopPropagation(); syncTeacherBookingStatus('mobile');" />
            </div>
        `;
        drawerSideMenu.insertAdjacentHTML('beforeend', mobileBookingHTML);
    }

    window.toggleTeacherBookingStatus = function() {
        const desktopToggle = document.getElementById('topnav-booking-toggle');
        const mobileToggle = document.getElementById('topnav-mobile-booking-toggle');
        const isOpen = desktopToggle ? desktopToggle.checked : (mobileToggle ? mobileToggle.checked : true);

        if (desktopToggle) desktopToggle.checked = isOpen;
        if (mobileToggle) mobileToggle.checked = isOpen;

        const label1 = document.getElementById('topnav-booking-label');
        const label2 = document.getElementById('topnav-mobile-booking-label');

        if (label1) {
            label1.textContent = isOpen ? "Open" : "Closed";
            label1.className = `text-xs font-bold ${isOpen ? 'text-success' : 'text-error'}`;
        }
        if (label2) {
            label2.textContent = isOpen ? "Open" : "Closed";
            label2.className = `text-xs font-bold ${isOpen ? 'text-success' : 'text-error'}`;
        }
    };

    window.syncTeacherBookingStatus = function(source) {
        const desktopToggle = document.getElementById('topnav-booking-toggle');
        const mobileToggle = document.getElementById('topnav-mobile-booking-toggle');
        
        if (source === 'mobile' && mobileToggle) {
            if (desktopToggle) desktopToggle.checked = mobileToggle.checked;
        } else if (source === 'desktop' && desktopToggle) {
            if (mobileToggle) mobileToggle.checked = desktopToggle.checked;
        }
        window.toggleTeacherBookingStatus();
    };

    function initNotificationChecker(currentUsername) {
        function checkStudentRequests() {
            const cleanStored = currentUsername.toLowerCase().trim();

            const cbName = 'notif_cb_' + Math.round(Math.random() * 1000000);
            window[cbName] = function(sessions) {
                const badge = document.getElementById('notification-badge');
                const countTag = document.getElementById('notification-count-tag');
                const listContainer = document.getElementById('notification-list');
                const bellIcon = document.getElementById('bell-icon');
                
                if (!Array.isArray(sessions) || !listContainer) return;

                const pendingRequests = sessions.filter(s => {
                    if (!s.teacher) return false;
                    let sheetTeacher = String(s.teacher).trim().toLowerCase();
                    if (sheetTeacher.startsWith('teacher ')) sheetTeacher = sheetTeacher.substring(8).trim();
                    const isForThisTeacher = sheetTeacher === cleanStored || sheetTeacher.includes(cleanStored) || cleanStored.includes(sheetTeacher);
                    
                    const hasNoLink = !s.link || s.link.trim() === "" || s.link === "#" || s.link === "Pending Link";
                    return isForThisTeacher && hasNoLink;
                });

                const count = pendingRequests.length;
                if (count > 0 && badge) {
                    badge.classList.remove('hidden');
                    badge.textContent = count;
                    if (countTag) countTag.textContent = `${count} New`;

                    if (bellIcon) bellIcon.classList.add('animate-bell-ring');
                    
                    listContainer.innerHTML = '';
                    pendingRequests.reverse().forEach(req => {
                        const item = document.createElement('div');
                        item.className = "p-3 bg-base-200/80 hover:bg-base-200 rounded-xl border border-base-300 flex flex-col gap-1.5 w-full transition-all duration-200 shadow-xs";
                        item.innerHTML = `
                            <div class="flex justify-between items-center font-bold text-xs sm:text-sm text-base-content w-full gap-2">
                                <span class="truncate flex items-center gap-1.5"><i class="fa-solid fa-user-graduate text-primary"></i> ${req.student || 'Student'}</span>
                                <span class="badge badge-warning font-semibold text-[11px] px-2 py-0.5 shrink-0">Pending Link</span>
                            </div>
                            <div class="text-xs text-base-content/80 leading-relaxed">
                                Requested lesson: <strong class="text-primary font-bold">${req.lesson || 'Session'}</strong>
                            </div>
                            <div class="text-[11px] font-medium text-base-content/60 flex items-center justify-between mt-1 pt-1 border-t border-base-300/50">
                                <span class="flex items-center gap-1"><i class="fa-regular fa-calendar text-primary/70"></i> ${req.sessionDate || ''}</span>
                                <span class="flex items-center gap-1"><i class="fa-regular fa-clock text-primary/70"></i> ${req.sessionTime || ''}</span>
                            </div>
                        `;
                        listContainer.appendChild(item);
                    });
                } else if (listContainer) {
                    if (badge) badge.classList.add('hidden');
                    if (countTag) countTag.textContent = `0 New`;
                    if (bellIcon) bellIcon.classList.remove('animate-bell-ring');
                    listContainer.innerHTML = `<div class="text-center py-4 text-xs text-base-content/50 italic w-full">No new session requests.</div>`;
                }

                if (script.parentNode) document.body.removeChild(script);
                delete window[cbName];
            };

            const script = document.createElement('script');
            script.src = `${API_URL}?action=getSessions&callback=${cbName}`;
            document.body.appendChild(script);
        }

        setInterval(checkStudentRequests, 10000);
        setTimeout(checkStudentRequests, 1000);
    }

    function initGlobalBookSearch() {
        const searchInput = document.getElementById('global-book-search-input');
        const suggestionsBox = document.getElementById('global-search-suggestions');

        if (!searchInput || !suggestionsBox) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            suggestionsBox.innerHTML = '';

            if (!query) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            const currentPath = window.location.pathname.toLowerCase();
            const isBookMenu = currentPath.includes('book-menu.html') || currentPath.endsWith('/') || currentPath.endsWith('index.html');

            const roleVal = String(localStorage.getItem('role') || localStorage.getItem('userRole') || '1').trim().toLowerCase();
            const isAdmin = roleVal === "2" || roleVal === "3" || roleVal === "admin" || roleVal === "teacher";
            const rawBooks = localStorage.getItem('books') || "";
            const allowedBooks = rawBooks.toLowerCase().split(/[,|\n]+/).map(b => b.trim().replace(/['"]+/g, '')).filter(b => b.length > 0);

            const items = [];

            if (isBookMenu) {
                const bookCards = document.querySelectorAll('.book-card');
                bookCards.forEach(card => {
                    const bookFileName = (card.querySelector('a')?.getAttribute('href') || '').toLowerCase().trim();
                    const isAllowed = isAdmin || allowedBooks.some(b => bookFileName.includes(b) || b.includes(bookFileName));
                    if (!isAllowed) return;

                    const titleEl = card.querySelector('.card-title');
                    const linkEl = card.querySelector('a');
                    const imgEl = card.querySelector('img');
                    const badgeEl = card.querySelector('.badge');

                    const title = titleEl ? titleEl.textContent.trim() : '';
                    if (!title) return;

                    items.push({
                        title: title,
                        badge: badgeEl ? badgeEl.textContent.trim() : '',
                        element: card,
                        imgSrc: imgEl ? imgEl.getAttribute('src') : '',
                        url: linkEl ? linkEl.getAttribute('href') : '#'
                    });
                });
            } else {
                const lessonRows = document.querySelectorAll('ol li, .lesson-card, .card');
                lessonRows.forEach(row => {
                    const titleEl = row.querySelector('.card-title, .btn-title, h3, h4');
                    const linkEl = row.querySelector('a');
                    const imgEl = row.querySelector('img, .btn-thumb');

                    const title = titleEl ? titleEl.textContent.trim() : '';
                    if (!title) return;

                    if (!isAdmin && allowedBooks.length > 0) {
                        const rowText = (row.textContent || "").toLowerCase();
                        const linkHref = (linkEl?.getAttribute('href') || "").toLowerCase();
                        const isAllowedLesson = allowedBooks.some(b => rowText.includes(b) || linkHref.includes(b));
                        if (!isAllowedLesson) return;
                    }

                    items.push({
                        title: title,
                        badge: '',
                        element: row,
                        imgSrc: imgEl ? imgEl.getAttribute('src') : '',
                        url: linkEl ? linkEl.getAttribute('href') : '#'
                    });
                });
            }

            let matchCount = 0;
            const seenTitles = new Set();

            items.forEach(itemObj => {
                const titleLower = itemObj.title.toLowerCase();
                const isMatch = titleLower.includes(query);

                if (isMatch) {
                    matchCount++;
                    if (!seenTitles.has(itemObj.title)) {
                        seenTitles.add(itemObj.title);
                        const suggestionItem = document.createElement('div');
                        suggestionItem.className = 'suggestion-item flex items-center gap-3 px-4 py-3 hover:bg-primary/10 cursor-pointer text-sm border-b border-base-300 last:border-none transition-all duration-200';
                        
                        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedQuery})`, 'gi');
                        const highlightedTitle = itemObj.title.replace(regex, `<span class="text-primary font-bold bg-primary/15 px-1 rounded">$1</span>`);

                        suggestionItem.innerHTML = `
                            ${itemObj.imgSrc ? `<img src="${itemObj.imgSrc}" class="w-8 h-8 object-cover rounded shrink-0 shadow-sm">` : '<i class="fa-solid fa-book-open text-primary text-base"></i>'}
                            <div class="flex flex-col min-w-0 flex-1">
                                <span class="font-semibold text-xs text-base-content">${highlightedTitle}</span>
                                ${itemObj.badge ? `<span class="text-[10px] text-primary font-bold uppercase tracking-wider">${itemObj.badge}</span>` : ''}
                            </div>
                        `;
                        
                        suggestionItem.addEventListener('click', () => {
                            searchInput.value = itemObj.title;
                            suggestionsBox.classList.add('hidden');
                            if (itemObj.url && itemObj.url !== '#') {
                                window.location.href = itemObj.url;
                            } else {
                                itemObj.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        });
                        suggestionsBox.appendChild(suggestionItem);
                    }
                }
            });

            suggestionsBox.classList.remove('hidden');

            if (matchCount === 0) {
                suggestionsBox.innerHTML = `<div class="px-4 py-4 text-xs text-base-content/60 text-center italic">No matching titles found</div>`;
            }
        });

        document.addEventListener('click', (e) => {
            if (suggestionsBox && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.add('hidden');
            }
        });
    }

    function fetchProfilePicture(username) {
        if (!username) return;
        const cbName = 'topnav_pic_cb_' + Math.round(Math.random() * 1000000);
        window[cbName] = function(res) {
            if (res && res.status === "success" && Array.isArray(res.accounts)) {
                const user = res.accounts.find(acc => acc.username && acc.username.toLowerCase() === username.toLowerCase());
                if (user) {
                    if (user.profilePic) {
                        localStorage.setItem('profilePic', user.profilePic);
                        const directUrl = parseDriveLink(user.profilePic);
                        const avatarImg = document.getElementById('global-header-avatar');
                        if (avatarImg) avatarImg.src = directUrl;
                    }
                    if (user.role !== undefined) {
                        localStorage.setItem('role', user.role);
                    }
                    if (user.books !== undefined) {
                        localStorage.setItem('books', user.books);
                    }
                }
            }
            if (script.parentNode) document.body.removeChild(script);
            delete window[cbName];
        };

        const script = document.createElement('script');
        script.src = `${API_URL}?action=initDashboard&username=${encodeURIComponent(username)}&callback=${cbName}`;
        document.body.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTopNav);
    } else {
        injectTopNav();
    }
})();
