const USERS_KEY = "HabitMover_users";
const THEME_KEY = "HabitMover_theme";

const emailEl = document.getElementById("email");
const resetBtn = document.getElementById("resetBtn");
const msg = document.getElementById("msg");
const themeToggle = document.getElementById("themeToggle");
const authCard = document.querySelector(".auth-card");

// Theme Logic (Synced)
const applyTheme = (theme) => {
  const icon = themeToggle.querySelector("span");
  if (theme === "dark") {
    document.body.classList.add("dark");
    icon.className = "ri-sun-line";
  } else {
    document.body.classList.remove("dark");
    icon.className = "ri-moon-line";
  }
};
applyTheme(localStorage.getItem(THEME_KEY));

themeToggle.onclick = () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  applyTheme(isDark ? "dark" : "light");
};

// Reset Logic
resetBtn.onclick = () => {
  const email = emailEl.value.trim();
  if (!email) {
    msg.textContent = "Please enter your email";
    msg.style.color = "#ef4444";
    authCard.classList.add("shake");
    setTimeout(() => authCard.classList.remove("shake"), 400);
    return;
  }

  resetBtn.classList.add("loading");
  resetBtn.disabled = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const userExists = users.some(u => u.email === email);

    resetBtn.classList.remove("loading");
    resetBtn.disabled = false;

    if (userExists) {
      msg.textContent = "Reset link sent to your email! ✔";
      msg.style.color = "#22c55e";
    } else {
      msg.textContent = "Account not found";
      msg.style.color = "#ef4444";
      authCard.classList.add("shake");
      setTimeout(() => authCard.classList.remove("shake"), 400);
    }
  }, 1000);
};
