/* =====================================================
   STORAGE KEYS
===================================================== */
const AUTH_KEY = "HabitMover_auth";
const TASK_KEY = "HabitMover_tasks";
const THEME_KEY = "HabitMover_theme";
const STREAK_KEY = "HabitMover_streak";
const HISTORY_KEY = "HabitMover_history";

/* =====================================================
   OFFLINE BACKUP (INDEXEDDB - PREVENTS GHOST TASKS)
===================================================== */
const DB_NAME = "HabitMoverDB";
const STORE_NAME = "tasks";

async function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject();
    });
}

/**
 * FIXED: Syncs IndexedDB with current state. 
 * Clears old entries so deleted tasks don't reappear on refresh.
 */
async function syncBackup(tasksToStore) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        await store.clear(); 
        tasksToStore.forEach(t => store.add(t));
    } catch (err) { console.warn("Offline backup sync failed", err); }
}

/* =====================================================
   AUTH GUARD
===================================================== */
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
    window.location.replace("../auth/login.html");
}

/* =====================================================
   ELEMENTS (DOM)
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
   STATE & DATA HANDLING
===================================================== */
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [];

/**
 * Saves current task list to LocalStorage and IndexedDB backup.
 */
function saveAll() {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    syncBackup(tasks); 
    updateProgress();
}

/**
 * Updates the progress bar and streak counter.
 */
function updateProgress() {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0 };
    streakCountEl.textContent = streak.count;

    if (tasks.length === 0) {
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
        return;
    }

    const doneCount = tasks.filter(t => t.done).length;
    const percent = Math.round((doneCount / tasks.length) * 100);
    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

/* =====================================================
   RENDER TASKS (MATCHES ENHANCED CSS STRUCTURE)
===================================================== */
function renderTasks() {
    taskList.innerHTML = "";
    emptyState.style.display = tasks.length === 0 ? "block" : "none";

    tasks.forEach((t, i) => {
        const card = document.createElement("div");
        card.className = `card task ${t.done ? "done" : ""}`;
        card.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${t.done ? "checked" : ""}>
                <div class="task-info">
                    <strong>${t.name}</strong><br/>
                    <small><i class="ri-time-line"></i> ${t.time || "--:--"}</small>
                </div>
            </div>
            <button class="del-btn" aria-label="Delete">
                <span class="ri-delete-bin-line"></span>
            </button>
        `;

        // Handle Status Change
        card.querySelector("input").onchange = () => {
            t.done = !t.done;
            saveAll();
            renderTasks();
        };

        // Handle Deletion
        card.querySelector(".del-btn").onclick = () => {
            tasks.splice(i, 1);
            saveAll();
            renderTasks();
        };

        taskList.appendChild(card);
    });
}

/* =====================================================
   EVENTS
===================================================== */

// Modal: Add New Habit
modalAddBtn.onclick = () => {
    const name = modalTaskName.value.trim();
    if (!name) return;

    tasks.push({ 
        name, 
        time: modalTaskTime.value, 
        done: false 
    });

    modalTaskName.value = "";
    modalTaskTime.value = "";
    addModal.classList.add("hidden");
    
    saveAll();
    renderTasks();
};

// Modal: UI Controls
addTaskBtn.onclick = () => {
    addModal.classList.remove("hidden");
    setTimeout(() => modalTaskName.focus(), 100);
};

closeModalBtn.onclick = () => addModal.classList.add("hidden");

// Theme Toggle
themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    themeToggle.innerHTML = isDark 
        ? '<span class="ri-sun-line"></span>' 
        : '<span class="ri-moon-line"></span>';
};

// Logout: Redirects with replace to prevent "Back" button navigation
logoutBtn.onclick = () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.replace("../auth/login.html");
};

/* =====================================================
   INITIALIZATION
===================================================== */
window.onload = () => {
    // Hide Splash Screen
    const splash = document.getElementById("splash");
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => splash.style.display = "none", 500);
        }, 600);
    }

    // Load Theme Preference
    if (localStorage.getItem(THEME_KEY) === "dark") {
        document.body.classList.add("dark");
        themeToggle.innerHTML = '<span class="ri-sun-line"></span>';
    }

    renderTasks();
    updateProgress();
};
