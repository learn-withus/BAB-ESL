// Helper function to handle correct pathing for login redirection
function redirectToLogin() {
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const pathToRoot = isInPagesFolder ? '../' : './';
    window.location.replace(pathToRoot + "login.html");
}

// 1. PROTECTION CHECK: Run immediately when script loads
if (localStorage.getItem('isLoggedIn') !== 'true') {
    redirectToLogin();
}

// Handle browser cache (bfcache) when user hits back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted || localStorage.getItem('isLoggedIn') !== 'true') {
        redirectToLogin();
    }
});

function loadNavbar() {
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const pathToRoot = isInPagesFolder ? '../' : './';

    // Get the user role (default to "1" for normal user)
    const userRole = String(localStorage.getItem('userRole') || "1").trim();

    let navHTML = '';

    // STRICT ROLE 1 RESTRICTION: Students only get Dashboard, Theme, Logout
    if (userRole === "1") {
        navHTML = `
            <a href="${pathToRoot}user-dashboard.html" class="side-link" data-page="user-dashboard.html"><i class="fa-solid fa-house"></i> Dashboard</a>
            <a href="#" class="side-link" id="settings-link"><i class="fa-solid fa-moon"></i> Theme</a>
            <a href="#" onclick="logout()" class="side-link" style="margin-top: 20px; color: #f87171;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        `;
    } 
    // TEACHERS (ROLE 2): Always gets Dashboard, Lessons, Progress, Theme, Logout
    else if (userRole === "2") {
        navHTML = `
            <a href="${pathToRoot}index.html" class="side-link" data-page="index.html"><i class="fa-solid fa-house"></i> Dashboard</a>
            <a href="${pathToRoot}pages/book-menu.html" class="side-link" data-page="book-menu.html"><i class="fa-solid fa-book"></i> Lessons</a>
            <a href="${pathToRoot}pages/create-link.html" class="side-link" data-page="create-link.html"><i class="fa-solid fa-wand-magic-sparkles"></i> Create Link</a>
            <a href="#" class="side-link" id="settings-link"><i class="fa-solid fa-moon"></i> Theme</a>
            <a href="#" onclick="logout()" class="side-link" style="margin-top: 20px; color: #f87171;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        `;
    }
   // ADMINS (ROLE 3): Dashboard, Account Table, Create, Theme, Logout
    else if (userRole === "3") {
        navHTML = `
            <a href="${pathToRoot}admin-dashboard.html" class="side-link" data-page="admin-dashboard.html"><i class="fa-solid fa-house"></i> Dashboard</a>
            <a href="${pathToRoot}signup.html" class="side-link" data-page="signup.html"><i class="fa-solid fa-user-plus"></i> Create Account</a>
            <a href="#" class="side-link" id="settings-link"><i class="fa-solid fa-moon"></i> Theme</a>
            <a href="#" onclick="logout()" class="side-link" style="margin-top: 20px; color: #f87171;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        `;
    }

    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
        
        // Robust Active Link Indicator
        const currentPath = window.location.pathname;
        const currentFileName = currentPath.split("/").pop() || "index.html";
        const links = placeholder.querySelectorAll('.side-link[data-page]');
        
        links.forEach(link => {
            link.classList.remove('active');
            const targetPage = link.getAttribute('data-page');
            
            // Check if current file name matches target file name precisely
            if (currentFileName === targetPage || (targetPage === 'index.html' && (currentPath.endsWith('/') || currentFileName === ''))) {
                link.classList.add('active');
            }
        });

        // Re-bind theme toggle click handler after injection
        initThemeToggle();
    }
}

// Theme initialization and toggle logic
function initThemeToggle() {
    const settingsLink = document.getElementById('settings-link');
    if (!settingsLink) return;

    function updateThemeUI(isDark) {
        const icon = settingsLink.querySelector('i');
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (icon) icon.className = 'fa-solid fa-sun';
            settingsLink.innerHTML = `<i class="fa-solid fa-sun"></i> Light Mode`;
        } else {
            document.body.classList.remove('dark-mode');
            if (icon) icon.className = 'fa-solid fa-moon';
            settingsLink.innerHTML = `<i class="fa-solid fa-moon"></i> Dark Mode`;
        }
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    updateThemeUI(savedTheme === 'dark');

    settingsLink.onclick = (e) => {
        e.preventDefault();
        const isDark = !document.body.classList.contains('dark-mode');
        localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
        updateThemeUI(isDark);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();

    const savedName = localStorage.getItem('teacherName');
    const userDisplay = document.getElementById('username-display');
    if (userDisplay && savedName) {
        userDisplay.innerText = savedName;
    }
});

function logout() {
    localStorage.clear();
    redirectToLogin();
}
