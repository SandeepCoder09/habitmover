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
   AUTH GUARD
===================================================== */
const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
if (!auth || !auth.loggedIn) {
  window.location.href = "../auth/login.html";
}

/* =====================================================
   ELEMENTS
===================================================== */
const taskName = document.getElementById("taskName");
const taskTime = document.getElementById("taskTime");
const addTaskBtn = document.getElementById("addTaskBtn");
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
   TASK DATA
===================================================== */
let tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [];

function saveTasks() {
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}

/* =====================================================
   DATE HELPERS
===================================================== */
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

/* =====================================================
   STREAK + PROGRESS
===================================================== */
let streak =
  JSON.parse(localStorage.getItem(STREAK_KEY)) || {
    count: 0,
    lastDate: null
  };

function updateStreak() {
  const today = todayKey();
  if (streak.lastDate === today) return;

  const anyDone = tasks.some(t => t.done);
  if (!anyDone) return;

  if (!streak.lastDate) {
    streak.count = 1;
  } else {
    const diff =
      (new Date(today) - new Date(streak.lastDate)) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) streak.count++;
    else if (diff > 1) streak.count = 1;
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

  const doneCount = tasks.filter(t => t.done).length;
  const percent = Math.round((doneCount / tasks.length) * 100);

  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";

  if (doneCount > 0) updateStreak();
  streakCountEl.textContent = streak.count;
}

/* =====================================================
   RENDER TASKS (WITH EMPTY STATE + ANIMATION)
===================================================== */
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

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

    if (t.done) {
      requestAnimationFrame(() => div.classList.add("done"));
    }

    div.querySelector("input").onchange = () => {
      t.done = !t.done;
      saveTasks();
      renderTasks();
      updateProgress();
    };

    div.querySelector("button").onclick = () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
      updateProgress();
    };

    taskList.appendChild(div);
  });
}

/* =====================================================
   ADD TASK
===================================================== */
addTaskBtn.onclick = () => {
  if (!taskName.value || !taskTime.value) return;

  tasks.push({
    name: taskName.value.trim(),
    time: taskTime.value,
    done: false
  });

  taskName.value = "";
  taskTime.value = "";

  saveTasks();
  renderTasks();
  updateProgress();
};

/* =====================================================
   LOGOUT
===================================================== */
logoutBtn.onclick = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("HabitMover_remember");
  window.location.href = "../auth/login.html";
};

/* =====================================================
   REMINDERS (SOUND + SNOOZE)
===================================================== */
const sound = new Audio("../assets/sounds/reminder.mp3");

let remindedToday =
  JSON.parse(localStorage.getItem(REMINDER_KEY)) || {
    date: todayKey(),
    tasks: []
  };

if (remindedToday.date !== todayKey()) {
  remindedToday = { date: todayKey(), tasks: [] };
  localStorage.setItem(REMINDER_KEY, JSON.stringify(remindedToday));
}

let snoozed =
  JSON.parse(localStorage.getItem(SNOOZE_KEY)) || [];

function showReminder(task) {
  sound.play().catch(() => { });

  const popup = document.createElement("div");
  popup.className = "reminder-popup";
  popup.innerHTML = `
    <strong>⏰ ${task.name}</strong>
    <p>${task.time}</p>
    <button class="done">Done</button>
    <button class="snooze" data-min="5">Snooze 5m</button>
    <button class="snooze" data-min="10">Snooze 10m</button>
  `;

  popup.querySelector(".done").onclick = () => {
    task.done = true;
    saveTasks();
    renderTasks();
    updateProgress();
    popup.remove();
  };

  popup.querySelectorAll(".snooze").forEach(btn => {
    btn.onclick = () => {
      snoozed.push({
        name: task.name,
        fireAt: Date.now() + Number(btn.dataset.min) * 60000
      });
      localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozed));
      popup.remove();
    };
  });

  document.body.appendChild(popup);
}

/* =====================================================
   CHECK EVERY 30 SECONDS
===================================================== */
setInterval(() => {
  const now = new Date();
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  tasks.forEach(task => {
    if (
      !task.done &&
      task.time === currentTime &&
      !remindedToday.tasks.includes(task.name)
    ) {
      showReminder(task);
      remindedToday.tasks.push(task.name);
      localStorage.setItem(REMINDER_KEY, JSON.stringify(remindedToday));
    }
  });

  const nowMs = Date.now();
  snoozed = snoozed.filter(s => {
    if (s.fireAt <= nowMs) {
      const task = tasks.find(t => t.name === s.name && !t.done);
      if (task) showReminder(task);
      return false;
    }
    return true;
  });
  localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozed));
}, 30000);

/* =====================================================
   DAILY HISTORY (FOR STATS)
===================================================== */
function saveDailyHistory() {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  const today = todayKey();

  if (history.some(h => h.date === today)) return;

  history.push({
    date: today,
    total: tasks.length,
    done: tasks.filter(t => t.done).length
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/* =====================================================
   INIT
===================================================== */
renderTasks();
updateProgress();
saveDailyHistory();
