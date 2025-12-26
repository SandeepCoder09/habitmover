const USERS_KEY = "HabitMover_users";

document.getElementById("signupBtn").onclick = () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !email || !password) {
    msg.textContent = "All fields required";
    return;
  }

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  if (users.some(u => u.email === email)) {
    msg.textContent = "Email already exists";
    return;
  }

  users.push({
    id: Date.now(),
    name,
    email,
    password
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  msg.textContent = "Signup successful ✔";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 600);
};
