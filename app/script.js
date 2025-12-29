/* =====================================================
   STORAGE KEYS
===================================================== */
const AUTH_KEY = "HabitMover_auth";
const TASK_KEY = "HabitMover_tasks";
const THEME_KEY = "HabitMover_theme";
const REMINDER_KEY = "HabitMover_remindedToday";
const STREAK_KEY = "HabitMover_streak";
const SNOOZE_KEY = "HabitMover_snoozed";
const HISTORY_KEY = "HabitMover_history";

/* =====================================================
   OFFLINE BACKUP (INDEXEDDB)
===================================================== */
const DB_NAME = "HabitMoverDB";
const DB_VERSION = 1;
const STORE_NAME = "tasks";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject();
  });
}

async function backupTasksToDB(tasks) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    tasks.forEach((t, i) => store.put({ ...t, id: i }));
  } catch {}
}

async function restoreTasksFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    return new Promise(res => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch {
    return [];
  }
}

/* =====================================================
   AUTH GUARD
===================================================== */
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
  window.location.href = "../auth/login.html";
}

/* =====================================================
   ELEMENTS (MATCH HTML)
===================================================== */
const addTaskBtn = document.getElementById("addTaskBtn");
const addModal = document.getElementById("addModal");
const closeModalBtn = document.querySelector(".close-modal");

const modalTaskName = document.getElementById("modalTaskName");
const modalTaskTime = document.getElementById("modalTaskTime");
const modalAddBtn = document.getElementById("modalAddBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const streakCountEl = document.getElementById("streakCount");

/* =====================================================
   THEME
===================================================== */
if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
  themeToggle.innerHTML = `<span class="ri-sun-line"></span>`;
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? `<span class="ri-sun-line"></span>`
    : `<span class="ri-moon-line"></span>`;
};

/* =====================================================
   MODAL OPEN / CLOSE
===================================================== */
addTaskBtn.onclick = () => {
  addModal.classList.remove("hidden");
};

closeModalBtn.onclick = () => {
  addModal.classList.add("hidden");
};

addModal.onclick = e => {
  if (e.target === addModal) addModal.classList.add("hidden");
};

/* =====================================================
   TASK DATA
===================================================== */
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [];

if (tasks.length === 0) {
  restoreTasksFromDB().then(dbTasks => {
    if (dbTasks.length) {
      tasks = dbTasks.map(t => ({
        name: t.name,
        time: t.time,
        done: t.done
      }));
      saveTasks();
      renderTasks();
      updateProgress();
    }
  });
}

function saveTasks() {
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  backupTasksToDB(tasks);
}

/* =====================================================
   DATE HELPERS
===================================================== */
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

/* =====================================================
   DAILY HISTORY (FIXED)
===================================================== */
function saveDailyHistory() {
  const today = todayKey();
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  if (history.some(h => h.date === today)) return;

  history.push({
    date: today,
    total: tasks.length,
    done: tasks.filter(t => t.done).length
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/* =====================================================
   STREAK + PROGRESS
===================================================== */
let streak = JSON.parse(localStorage.getItem(STREAK_KEY)) || {
  count: 0,
  lastDate: null
};

function updateStreak() {
  const today = todayKey();
  if (streak.lastDate === today) return;
  if (!tasks.some(t => t.done)) return;

  if (!streak.lastDate) streak.count = 1;
  else {
    const diff =
      (new Date(today) - new Date(streak.lastDate)) /
      (1000 * 60 * 60 * 24);
    streak.count = diff === 1 ? streak.count + 1 : 1;
  }

  streak.lastDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

function updateProgress() {
  if (tasks.length === 0) {
    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";
    streakCountEl.textContent = streak.count;
    return;
  }

  const done = tasks.filter(t => t.done).length;
  const percent = Math.round((done / tasks.length) * 100);

  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";

  if (done > 0) updateStreak();
  streakCountEl.textContent = streak.count;
}

/* =====================================================
   RENDER TASKS
===================================================== */
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  tasks.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "card task";

    div.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${t.done ? "checked" : ""} />
        <div>
          <strong>${t.name}</strong><br/>
          <small>${t.time}</small>
        </div>
      </div>
      <button aria-label="Delete">
        <span class="ri-delete-bin-line"></span>
      </button>
    `;

    div.querySelector("input").onchange = () => {
      t.done = !t.done;
      saveTasks();
      renderTasks();
      updateProgress();
      saveDailyHistory();
    };

    div.querySelector("button").onclick = () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
      updateProgress();
      saveDailyHistory();
    };

    taskList.appendChild(div);
  });
}

/* =====================================================
   ADD TASK (MODAL BUTTON)
===================================================== */
modalAddBtn.onclick = () => {
  if (!modalTaskName.value || !modalTaskTime.value) return;

  tasks.push({
    name: modalTaskName.value.trim(),
    time: modalTaskTime.value,
    done: false
  });

  modalTaskName.value = "";
  modalTaskTime.value = "";

  saveTasks();
  renderTasks();
  updateProgress();
  saveDailyHistory();

  addModal.classList.add("hidden");
};

/* =====================================================
   LOGOUT
===================================================== */
logoutBtn.onclick = () => {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "../auth/login.html";
};

/* =====================================================
   SPLASH SCREEN
===================================================== */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (splash) splash.style.display = "none";
});

/* =====================================================
   INIT
===================================================== */
renderTasks();
updateProgress();
saveDailyHistory();
