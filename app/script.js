/* =====================================================
   1. EMERGENCY LOGOUT & AUTH GUARD (TOP PRIORITY)
===================================================== */
const AUTH_KEY = "HabitMover_auth";

const handleLogout = () => {
    console.log("Logout initiated...");
    localStorage.removeItem(AUTH_KEY);
    
    // Try multiple path depths to ensure it finds the login page
    // If your app is at /app/index.html, use ../auth/login.html
    // If everything is in one folder, use ./login.html
    window.location.replace("../auth/login.html");
};

// Attach logout immediately before other scripts run
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
}

// Auth Guard: Stop script if not logged in
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
    window.location.replace("../auth/login.html");
}

/* =====================================================
   2. STORAGE KEYS & DATABASE
===================================================== */
const TASK_KEY = "HabitMover_tasks";
const THEME_KEY = "HabitMover_theme";
const STREAK_KEY = "HabitMover_streak";
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

async function syncBackup(tasksToStore) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        await store.clear(); 
        tasksToStore.forEach(t => store.add(t));
    } catch (err) { console.warn("Backup sync failed", err); }
}

/* =====================================================
   3. DOM ELEMENTS
===================================================== */
const addTaskBtn = document.getElementById("addTaskBtn");
const addModal = document.getElementById("addModal");
const closeModalBtn = document.querySelector(".close-modal");
const modalTaskName = document.getElementById("modalTaskName");
const modalTaskTime = document.getElementById("modalTaskTime");
const modalAddBtn = document.getElementById("modalAddBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const streakCountEl = document.getElementById("streakCount");

/* =====================================================
   4. TASK ENGINE
===================================================== */
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [];

function saveAll() {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    syncBackup(tasks);
    updateProgress();
}

function updateProgress() {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0 };
    if(streakCountEl) streakCountEl.textContent = streak.count;

    if (!progressFill || !progressPercent) return;

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

function renderTasks() {
    if(!taskList) return;
    taskList.innerHTML = "";
    if(emptyState) emptyState.style.display = tasks.length === 0 ? "block" : "none";

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

        card.querySelector("input").onchange = () => {
            t.done = !t.done;
            saveAll();
            renderTasks();
        };

        card.querySelector(".del-btn").onclick = () => {
            tasks.splice(i, 1);
            saveAll();
            renderTasks();
        };

        taskList.appendChild(card);
    });
}

/* =====================================================
   5. MODAL & THEME
===================================================== */
if(modalAddBtn) {
    modalAddBtn.onclick = () => {
        const name = modalTaskName.value.trim();
        if (!name) return;
        tasks.push({ name, time: modalTaskTime.value, done: false });
        modalTaskName.value = "";
        addModal.classList.add("hidden");
        saveAll();
        renderTasks();
    };
}

if(addTaskBtn) {
    addTaskBtn.onclick = () => {
        addModal.classList.remove("hidden");
        setTimeout(() => modalTaskName.focus(), 100);
    };
}

if(closeModalBtn) closeModalBtn.onclick = () => addModal.classList.add("hidden");

if(themeToggle) {
    themeToggle.onclick = () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
        themeToggle.innerHTML = isDark ? '<span class="ri-sun-line"></span>' : '<span class="ri-moon-line"></span>';
    };
}

/* =====================================================
   6. INITIALIZATION
===================================================== */
window.onload = () => {
    const splash = document.getElementById("splash");
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => splash.style.display = "none", 500);
        }, 600);
    }

    if (localStorage.getItem(THEME_KEY) === "dark") {
        document.body.classList.add("dark");
        if(themeToggle) themeToggle.innerHTML = '<span class="ri-sun-line"></span>';
    }

    renderTasks();
    updateProgress();
};
