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

    const isMobile = window.innerWidth < 1024;
    const sidebarState = localStorage.getItem('sidebarState') || 'compact';
    const isExpanded = isMobile ? true : (sidebarState === 'expanded');

    let navHTML = '';

    if (!document.getElementById('custom-sidebar-tooltip-style')) {
        const customStyle = document.createElement('style');
        customStyle.id = 'custom-sidebar-tooltip-style';
        customStyle.innerHTML = `
            @media (min-width: 1024px) {
                .pro-tip {
                    position: relative;
                }
                .pro-tip:hover::after {
                    content: attr(data-title);
                    position: absolute;
                    left: calc(100% + 14px);
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: #1e293b;
                    color: #f8fafc;
                    padding: 7px 12px;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.01em;
                    line-height: 1.25;
                    border-radius: 6px;
                    white-space: nowrap;
                    z-index: 999999;
                    box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.25);
                    pointer-events: none;
                    animation: fadeInTip 0.12s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .pro-tip:hover::before {
                    content: "";
                    position: absolute;
                    left: calc(100% + 6px);
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: transparent #1e293b transparent transparent;
                    z-index: 999999;
                    pointer-events: none;
                }
            }
            @keyframes fadeInTip {
                from { opacity: 0; transform: translateY(-50%) scale(0.96); }
                to { opacity: 1; transform: translateY(-50%) scale(1); }
            }
        `;
        document.head.appendChild(customStyle);
    }

    const logoTipAttr = isExpanded ? '' : `data-title="BAB ESL Dashboard" class="pro-tip w-full block"`;

    navHTML += `
        <div class="flex items-center ${isExpanded ? 'justify-between px-4' : 'lg:justify-center'} gap-3 py-4 mb-2 w-full transition-all">
            <div ${logoTipAttr}>
                <a href="${dashboardUrl}" class="flex items-center gap-3 overflow-hidden w-full">
                    <img src="${pathToRoot}images/bab.png" alt="Logo" class="w-8 h-8 object-contain shrink-0">
                    <span class="font-bold text-base tracking-wide whitespace-nowrap sidebar-text ${isExpanded ? 'inline' : 'hidden'}">BAB ESL</span>
                </a>
            </div>
        </div>
        <div class="divider my-0"></div>
    `;

    const buildLink = (href, pageName, iconClass, label, tooltipText) => {
        const tipAttr = isExpanded ? '' : `data-title="${tooltipText}" class="pro-tip w-full block"`;

        return `
            <div class="w-full">
                <div ${tipAttr}>
                    <a href="${href}" class="flex items-center ${isExpanded ? 'px-4 justify-start' : 'lg:justify-center px-3'} gap-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="${pageName}">
                        <i class="${iconClass} w-5 text-center text-base shrink-0"></i>
                        <span class="sidebar-text ${isExpanded ? 'inline' : 'hidden'} whitespace-nowrap">${label}</span>
                    </a>
                </div>
            </div>
        `;
    };

    if (userRole === "1") {
        navHTML += buildLink(pathToRoot + "user-dashboard.html", "user-dashboard.html", "fa-solid fa-house", "Dashboard", "Dashboard");
        navHTML += buildLink(pathToRoot + "pages/teachers.html", "teachers.html", "fa-solid fa-chalkboard-user", "Teachers", "Teachers");
    } else if (userRole === "2") {
        navHTML += buildLink(pathToRoot + "index.html", "index.html", "fa-solid fa-house", "Dashboard", "Dashboard");
        navHTML += buildLink(pathToRoot + "pages/my-schedule.html", "my-schedule.html", "fa-solid fa-calendar-days", "My Schedule", "My Schedule");
        navHTML += buildLink(pathToRoot + "pages/book-menu.html", "book-menu.html", "fa-solid fa-book", "Books", "Books");
    } else if (userRole === "3") {
        navHTML += buildLink(pathToRoot + "admin-dashboard.html", "admin-dashboard.html", "fa-solid fa-house", "Dashboard", "Dashboard");
        navHTML += buildLink(pathToRoot + "pages/teachers-schedules.html", "teachers-schedules.html", "fa-solid fa-calendar-check", "Teachers", "Teachers");
    }

    if (!isMobile) {
        const toggleTipAttr = isExpanded ? '' : `data-title="Expand" class="pro-tip w-full block"`;

        navHTML += `
            <div class="mt-auto pt-4 w-full px-2">
                <div ${toggleTipAttr}>
                    <button onclick="toggleSidebar()" class="flex items-center ${isExpanded ? 'px-4 justify-start' : 'lg:justify-end pr-3'} gap-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors w-full text-base-content/70 hover:text-base-content">
                        <i class="fa-solid ${isExpanded ? 'fa-angles-left' : 'fa-angles-right'} w-5 text-center text-base shrink-0"></i>
                        <span class="sidebar-text ${isExpanded ? 'inline' : 'hidden'} whitespace-nowrap">${isExpanded ? 'Close' : 'Expand View'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        const drawerSide = placeholder.closest('.drawer-side');
        const drawerContainer = placeholder.closest('.drawer');

        const targetWidth = isMobile ? '16rem' : (isExpanded ? '16rem' : '5rem');
        
        if (drawerSide) {
            if (!isMobile) {
                drawerSide.style.width = targetWidth;
                drawerSide.style.transition = 'width 0.3s ease';
                drawerSide.style.zIndex = '9999';
                drawerSide.style.overflow = 'visible';
            } else {
                // Clear inline style overrides so DaisyUI overlay covers the viewport on mobile
                drawerSide.style.width = '';
                drawerSide.style.transition = '';
                drawerSide.style.zIndex = '';
                drawerSide.style.overflow = '';
            }
        }

        if (!isMobile) {
            placeholder.style.width = targetWidth;
            placeholder.style.transition = 'width 0.3s ease';
            placeholder.style.overflow = 'visible';
        } else {
            placeholder.style.width = '16rem';
            placeholder.style.transition = '';
            placeholder.style.overflow = '';
        }

        if (drawerContainer && !isMobile) {
            const content = drawerContainer.querySelector('.drawer-content');
            if (content) {
                content.style.marginLeft = targetWidth;
                content.style.width = isExpanded ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)';
                content.style.transition = 'margin-left 0.3s ease, width 0.3s ease';
            }
        } else if (drawerContainer && isMobile) {
            const content = drawerContainer.querySelector('.drawer-content');
            if (content) {
                content.style.marginLeft = '0';
                content.style.width = '100%';
            }
        }

        placeholder.innerHTML = navHTML;

        const links = placeholder.querySelectorAll('.side-link[data-page]');
        links.forEach(link => {
            link.classList.remove('bg-primary', 'text-primary-content');
            const targetPage = link.getAttribute('data-page');
            if (currentFileName === targetPage || 
                (targetPage === dashboardPageName && (currentPath.endsWith('/') || currentFileName === '')) ||
                (currentFileName === 'my-schedule.html' && (targetPage === 'my-schedule.html' || targetPage === 'teacher-schedule.html')) ||
                (currentFileName === 'teachers-schedules.html' && (targetPage === 'teachers-schedules.html' || targetPage === 'admin-schedules.html'))) {
                link.classList.add('bg-primary', 'text-primary-content');
            }
        });

        initThemeToggle();
    }
}

function toggleSidebar() {
    const currentState = localStorage.getItem('sidebarState') || 'compact';
    const newState = currentState === 'expanded' ? 'compact' : 'expanded';
    localStorage.setItem('sidebarState', newState);
    loadNavbar();
    window.dispatchEvent(new Event('resize'));
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
