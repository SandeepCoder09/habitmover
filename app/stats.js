/* =====================================================
   1. AUTH GUARD & THEME
===================================================== */
const AUTH_KEY = "HabitMover_auth";
const THEME_KEY = "HabitMover_theme";
const HISTORY_KEY = "HabitMover_history";

// Redirect if not logged in
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
    window.location.replace("../auth/login.html");
}

// Sync Theme
if (localStorage.getItem(THEME_KEY) === "dark") {
    document.body.classList.add("dark");
}

/* =====================================================
   2. ELEMENTS
===================================================== */
const statsList = document.getElementById("statsList");
const backBtn = document.getElementById("backBtn");

/* =====================================================
   3. DATA CALCULATION
===================================================== */
const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

function calculateSummary() {
    const totalDays = history.length;
    const totalPossible = history.reduce((acc, day) => acc + day.total, 0);
    const totalDone = history.reduce((acc, day) => acc + day.done, 0);
    const rate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

    // Update summary header if elements exist
    if(document.getElementById("statRate")) document.getElementById("statRate").textContent = rate + "%";
    if(document.getElementById("statDays")) document.getElementById("statDays").textContent = totalDays;
}

/* =====================================================
   4. RENDER LAST 7 DAYS
===================================================== */
function renderHistory() {
    statsList.innerHTML = "";
    const last7 = history.slice(-7).reverse();

    if (last7.length === 0) {
        statsList.innerHTML = `
            <div class="empty-state">
                <p class="muted">No data yet. Complete your habits on the home page! 🚀</p>
            </div>`;
        return;
    }

    last7.forEach(day => {
        const percent = day.total === 0 ? 0 : Math.round((day.done / day.total) * 100);
        const card = document.createElement("div");
        card.className = "card stat-card";

        card.innerHTML = `
            <div class="stat-info">
                <div class="stat-date">${new Date(day.date).toDateString()}</div>
                <div class="stat-meta">${day.done} / ${day.total} Habits</div>
            </div>
            <div class="stat-visual">
                <div class="stat-percent">${percent}%</div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
        statsList.appendChild(card);
    });
}

/* =====================================================
   5. NAVIGATION
===================================================== */
if (backBtn) {
    backBtn.onclick = () => window.location.href = "index.html";
}

// Initialize
calculateSummary();
renderHistory();
