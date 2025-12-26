/* =====================================================
   STORAGE KEYS
===================================================== */
const USERS_KEY = "HabitMover_users";
const AUTH_KEY = "HabitMover_auth";
const REMEMBER_KEY = "HabitMover_remember";
const THEME_KEY = "HabitMover_theme";

/* =====================================================
   ELEMENTS
===================================================== */
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const rememberMe = document.getElementById("rememberMe");
const msg = document.getElementById("msg");
const themeToggle = document.getElementById("themeToggle");

/* =====================================================
   AUTO LOGIN (REMEMBER ME)
===================================================== */
const remembered = JSON.parse(localStorage.getItem(REMEMBER_KEY));
if (remembered && remembered.loggedIn) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(remembered));
  window.location.href = "../app/index.html";
}

/* =====================================================
   THEME
===================================================== */
if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
  themeToggle.innerHTML = `<span class="ri-sun-line"></span>`;
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const d = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, d ? "dark" : "light");
  themeToggle.innerHTML = d
    ? `<span class="ri-sun-line"></span>`
    : `<span class="ri-moon-line"></span>`;
};

/* =====================================================
   LOGIN
===================================================== */
loginBtn.onclick = () => {
  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  if (!email || !password) {
    msg.textContent = "Enter email and password";
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    msg.textContent = "Invalid credentials";
    return;
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    loggedIn: true,
    loginAt: Date.now()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));

  if (rememberMe.checked) {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }

  msg.textContent = "Login successful ✔";

  setTimeout(() => {
    window.location.href = "../app/index.html";
  }, 300);
};
