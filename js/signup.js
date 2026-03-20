// ============================================
// signup.js — Handle user registration
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // If already logged in, go to dashboard
  if (getCurrentUser()) {
    window.location.href = "index.html";
    return;
  }

  var form = document.querySelector(".signup-form");
  var errorMsg = document.getElementById("signup-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Read form values
    var name = document.getElementById("signup-name").value.trim();
    var email = document.getElementById("signup-email").value.trim();
    var password = document.getElementById("signup-password").value;
    var country = document.getElementById("signup-country").value.trim();

    // Validate
    if (!name || !email || !password || !country) {
      showError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      showError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    // Check if email already exists
    var users = getFromStorage(KEYS.users) || [];
    var emailExists = users.some(function (u) {
      return u.email.toLowerCase() === email.toLowerCase();
    });
    if (emailExists) {
      showError("An account with this email already exists.");
      return;
    }

    // Create new user
    var newUser = {
      id: generateId("user"),
      name: name,
      email: email,
      password: password,
      country: country,
      createdAt: toDateString(new Date()),
    };

    users.push(newUser);
    saveToStorage(KEYS.users, users);

    // Redirect to login
    window.location.href = "login.html";
  });

  // Helper to show error message
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }
});
