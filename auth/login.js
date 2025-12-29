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

const togglePass = document.getElementById("togglePass");
const loginCard = document.querySelector(".login-card");

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
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? `<span class="ri-sun-line"></span>`
    : `<span class="ri-moon-line"></span>`;
};

/* =====================================================
   PASSWORD SHOW / HIDE
===================================================== */
if (togglePass) {
  togglePass.onclick = () => {
    const hidden = passEl.type === "password";
    passEl.type = hidden ? "text" : "password";
    togglePass.className = hidden
      ? "toggle-pass ri-eye-off-line"
      : "toggle-pass ri-eye-line";
  };
}

/* =====================================================
   HELPERS
===================================================== */
function showError(text) {
  msg.textContent = text;
  loginCard.classList.add("shake");
  setTimeout(() => loginCard.classList.remove("shake"), 400);
}

function setLoading(state) {
  if (state) {
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;
  } else {
    loginBtn.classList.remove("loading");
    loginBtn.disabled = false;
  }
}

/* =====================================================
   LOGIN
===================================================== */
loginBtn.onclick = () => {
  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  msg.textContent = "";

  if (!email || !password) {
    showError("Enter email and password");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      setLoading(false);
      showError("Invalid email or password");
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
    }, 500);
  }, 700); // fake delay for spinner UX
};
