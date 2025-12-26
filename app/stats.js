/* =====================================================
   STORAGE KEYS
===================================================== */
const AUTH_KEY = "HabitMover_auth";
const THEME_KEY = "HabitMover_theme";
const HISTORY_KEY = "HabitMover_history";

/* =====================================================
   AUTH GUARD
===================================================== */
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
  window.location.href = "../auth/login.html";
}

/* =====================================================
   ELEMENTS
===================================================== */
const statsList = document.getElementById("statsList");
const backBtn = document.getElementById("backBtn");

/* =====================================================
   THEME
===================================================== */
if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

/* =====================================================
   DATE HELPERS
===================================================== */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toDateString();
}

/* =====================================================
   LOAD HISTORY
===================================================== */
const history =
  JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

/* Only last 7 days */
const last7 = history.slice(-7).reverse();

if (last7.length === 0) {
  statsList.innerHTML = "<p>No data yet. Start completing habits!</p>";
}

/* =====================================================
   RENDER
===================================================== */
last7.forEach(day => {
  const percent =
    day.total === 0 ? 0 : Math.round((day.done / day.total) * 100);

  const card = document.createElement("div");
  card.className = "stat-card";

  card.innerHTML = `
    <div class="stat-date">${formatDate(day.date)}</div>
    <div>${day.done} / ${day.total} completed (${percent}%)</div>
    <div class="stat-bar">
      <div class="stat-fill" style="width:${percent}%"></div>
    </div>
  `;

  statsList.appendChild(card);
});

/* =====================================================
   NAV
===================================================== */
backBtn.onclick = () => {
  window.location.href = "index.html";
};
