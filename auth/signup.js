/* =====================================================
   STORAGE KEYS
===================================================== */
const USERS_KEY = "HabitMover_users";
const THEME_KEY = "HabitMover_theme";

/* =====================================================
   ELEMENTS
===================================================== */
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const msg = document.getElementById("msg");
const themeToggle = document.getElementById("themeToggle");
const authCard = document.querySelector(".auth-card");

/* =====================================================
   THEME INITIALIZATION & TOGGLE
===================================================== */
const applyTheme = (theme) => {
  const icon = themeToggle.querySelector("span");
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (icon) icon.className = "ri-sun-line";
  } else {
    document.body.classList.remove("dark");
    if (icon) icon.className = "ri-moon-line";
  }
};

// Sync theme with Login page settings
applyTheme(localStorage.getItem(THEME_KEY));

themeToggle.onclick = () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  applyTheme(isDark ? "dark" : "light");
};

/* =====================================================
   HELPERS
===================================================== */
function showError(text) {
  msg.textContent = text;
  msg.style.color = "#ef4444";
  
  // Trigger Shake Animation
  authCard.classList.remove("shake");
  void authCard.offsetWidth; // Force reflow
  authCard.classList.add("shake");
}

function showSuccess(text) {
  msg.textContent = text;
  msg.style.color = "#22c55e";
}

function setLoading(state) {
  signupBtn.disabled = state;
  signupBtn.classList.toggle("loading", state);
}

/* =====================================================
   SIGNUP LOGIC
===================================================== */
signupBtn.onclick = () => {
  if (signupBtn.disabled) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passEl.value.trim();
  
  msg.textContent = "";

  // 1. Basic Validation
  if (!name || !email || !password) {
    showError("Please fill in all fields");
    return;
  }

  // 2. Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // 3. Password Length Validation
  if (password.length < 6) {
    showError("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  // Smooth fake delay to show spinner
  setTimeout(() => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      users = [];
    }

    // 4. Check for duplicate email
    if (users.some(u => u.email === email)) {
      setLoading(false);
      showError("This email is already registered");
      return;
    }

    // 5. Create and Store User
    users.push({
      id: Date.now(),
      name,
      email,
      password // Note: In a real app, never store plain text passwords!
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    setLoading(false);
    showSuccess("Account created successfully ✔");

    // 6. Redirect to Login
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  }, 1000);
};
