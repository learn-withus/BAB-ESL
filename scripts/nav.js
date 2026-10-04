function redirectToLogin() {
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const pathToRoot = isInPagesFolder ? '../' : './';
    window.location.replace(pathToRoot + "login.html");
}

if (localStorage.getItem('isLoggedIn') !== 'true') {
    redirectToLogin();
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted || localStorage.getItem('isLoggedIn') !== 'true') {
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

    if (userRole === "1") {
        if (currentFileName === "index.html" || currentFileName === "admin-dashboard.html" || (currentPath.endsWith('/') && !currentPath.includes('/pages/'))) {
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
        `;
    } else if (userRole === "2") {
        navHTML += `
            <div class="tooltip tooltip-right w-full z-50" data-tip="Dashboard">
                <a href="${pathToRoot}index.html" class="flex items-center lg:justify-center gap-3 px-3 py-3 rounded-xl font-medium text-sm hover:bg-base-200 transition-colors side-link w-full" data-page="index.html">
                    <i class="fa-solid fa-house w-5 text-center text-base"></i>
                    <span class="inline lg:hidden">Dashboard</span>
                </a>
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
