(function () {
    const API_URL = "https://script.google.com/macros/s/AKfycbwhI1B0aGzDzwthu23R-F_c_Zqb1GEFSUHRMXrP1JFX03D7fxIntTB5-g5cpf__pHtW/exec";

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
        if (roleVal === "3" || roleVal === "admin") {
            roleTitle = "Administrator";
        } else if (roleVal === "2" || roleVal === "teacher" || roleVal === "content manager") {
            roleTitle = "Teacher";
        } else {
            roleTitle = "Student";
        }

        const cachedPic = localStorage.getItem('profilePic') || localStorage.getItem('userProfilePic') || "";
        const profilePicUrl = parseDriveLink(cachedPic) || "https://via.placeholder.com/150";

        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const profileLink = isInPagesFolder ? "profile.html" : "pages/profile.html";
        const logoutRedirect = isInPagesFolder ? "login.html" : "login.html";

        const navHTML = `
            <nav id="global-shared-navbar" class="navbar w-full bg-base-100 border-b border-base-300 shrink-0 px-4 sticky top-0 z-30">
                <div class="flex-none lg:hidden">
                    <label for="main-drawer" class="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </label>
                </div> 

                <div class="px-2 flex-1 whitespace-nowrap font-bold">
                    <div class="flex flex-row flex-nowrap items-center gap-4">
                        <div class="hidden sm:block relative w-80" id="global-search-container">
                            <label class="input input-bordered input-sm flex items-center gap-2 input-primary w-full bg-base-100 shadow-sm">
                                <svg class="h-4 w-4 opacity-50 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input type="text" id="global-book-search-input" placeholder="Search lessons..." autocomplete="off" class="grow text-xs bg-transparent outline-none"> 
                                <kbd class="kbd kbd-xs">⌘</kbd> <kbd class="kbd kbd-xs">K</kbd>
                            </label>
                            <div id="global-search-suggestions" class="absolute left-0 right-0 top-full mt-2 bg-base-100 shadow-2xl rounded-box border border-base-300 max-h-72 overflow-y-auto z-50 hidden p-1.5 space-y-1 divide-y divide-base-200"></div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-row gap-4 items-center">
                    <label class="swap swap-rotate btn btn-ghost btn-circle btn-sm" id="theme-swap-btn">
                        <input type="checkbox" id="global-theme-checkbox" />
                        <svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"></path></svg>
                        <svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"></path></svg>
                    </label>

                    <div class="flex flex-row items-center gap-2">
                        <div class="dropdown dropdown-end">
                            <div tabindex="0" role="button" class="avatar avatar-online cursor-pointer">
                                <div class="ring-primary ring-offset-base-100 ring-2 ring-offset-2 w-8 rounded-full">
                                    <img alt="User Avatar" src="${profilePicUrl}" id="global-header-avatar">
                                </div>
                            </div>
                            <ul tabindex="-1" class="dropdown-content menu menu-sm bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow border border-base-300">
                                <li><a href="${profileLink}" class="py-2">Profile</a></li>
                                <li><button onclick="localStorage.clear(); window.location.href='${logoutRedirect}';" class="text-error py-2 w-full text-left">Logout</button></li>
                            </ul>
                        </div>
                        <div class="flex flex-col text-left mr-2">
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
        initGlobalBookSearch();

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

    function initGlobalBookSearch() {
        const searchInput = document.getElementById('global-book-search-input');
        const suggestionsBox = document.getElementById('global-search-suggestions');
        const searchContainer = document.getElementById('global-search-container');
        const noResultsMsg = document.getElementById('no-results-msg');

        if (!searchInput || !suggestionsBox) return;

        const currentFile = window.location.pathname.split("/").pop();
        if (currentFile === "index.html" || currentFile === "" || currentFile === "teachers.html") {
            if (searchContainer) searchContainer.style.display = 'none';
            return;
        }

        const cardElements = document.querySelectorAll('.book-card, .menu-tooltip, article, .grid > div, .lesson-card, .card[data-book]');
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
            suggestionsBox.innerHTML = '';

            if (!query) {
                suggestionsBox.classList.add('hidden');
                cards.forEach((cardObj, idx) => {
                    if (cardObj.element) {
                        cardObj.element.style.display = '';
                        setTimeout(() => {
                            cardObj.element.style.opacity = '1';
                            cardObj.element.style.transform = 'translateY(0) scale(1)';
                        }, idx * 25);
                    }
                });
                if (noResultsMsg) noResultsMsg.classList.add('hidden');
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
                            suggestionsBox.classList.add('hidden');

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

            suggestionsBox.classList.remove('hidden');

            if (matchCount === 0) {
                if (noResultsMsg) noResultsMsg.classList.remove('hidden');
                suggestionsBox.innerHTML = `<div class="px-4 py-4 text-xs text-base-content/60 text-center italic">No matching books found</div>`;
            } else {
                if (noResultsMsg) noResultsMsg.classList.add('hidden');
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
                }
            }
            if (script.parentNode) document.body.removeChild(script);
            delete window[cbName];
        };

        const script = document.createElement('script');
        script.src = `${API_URL}?action=initDashboard&callback=${cbName}`;
        document.body.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectTopNav);
    } else {
        injectTopNav();
    }
})();
