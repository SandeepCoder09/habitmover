/* =====================================================
   STORAGE KEYS
===================================================== */
const AUTH_KEY = "HabitMover_auth";
const USERS_KEY = "HabitMover_users";
const THEME_KEY = "HabitMover_theme";
const STREAK_KEY = "HabitMover_streak";

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
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const avatarImg = document.getElementById("avatarImg");
const avatarInput = document.getElementById("avatarInput");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");

const msg = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");
const backBtn = document.getElementById("backBtn");
const profileStreak = document.getElementById("profileStreak");

/* =====================================================
   THEME
===================================================== */
if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

/* =====================================================
   LOAD USER
===================================================== */
let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
let userIndex = users.findIndex(u => u.id === auth.id);
let user = users[userIndex];

nameInput.value = user.name;
emailInput.value = user.email;
avatarImg.src = user.avatar || "";

/* =====================================================
   LOAD STREAK
===================================================== */
const streak =
  JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0 };

if (profileStreak) {
  profileStreak.textContent = streak.count;
}

/* =====================================================
   SAVE PROFILE
===================================================== */
saveProfileBtn.onclick = () => {
  const newName = nameInput.value.trim();
  if (!newName) {
    msg.textContent = "Name cannot be empty";
    return;
  }

  user.name = newName;
  auth.name = newName;

  users[userIndex] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));

  msg.textContent = "Profile updated ✔";
};

/* =====================================================
   AVATAR UPLOAD
===================================================== */
avatarInput.onchange = () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    user.avatar = reader.result;
    avatarImg.src = reader.result;

    users[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };
  reader.readAsDataURL(file);
};

/* =====================================================
   CHANGE PASSWORD
===================================================== */
changePasswordBtn.onclick = () => {
  if (currentPassword.value !== user.password) {
    msg.textContent = "Current password incorrect";
    return;
  }

  if (newPassword.value.length < 4) {
    msg.textContent = "Password too short";
    return;
  }

  user.password = newPassword.value;
  users[userIndex] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  currentPassword.value = "";
  newPassword.value = "";

  msg.textContent = "Password changed ✔";
};

/* =====================================================
   NAV
===================================================== */
logoutBtn.onclick = () => {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "../auth/login.html";
};

backBtn.onclick = () => {
  window.location.href = "index.html";
};
