// ============================================
// login.js — Handle user login
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // If already logged in, go to dashboard
  if (getCurrentUser()) {
    window.location.href = "index.html";
    return;
  }

  var form = document.querySelector(".login-box");
  var errorMsg = document.getElementById("login-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;

    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }

    // Find matching user
    var users = getFromStorage(KEYS.users) || [];
    var user = users.find(function (u) {
      return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
    });

    if (!user) {
      showError("Invalid email or password.");
      return;
    }

    // Save current user and redirect to dashboard
    saveToStorage(KEYS.currentUser, user.id);
    window.location.href = "index.html";
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }
});
