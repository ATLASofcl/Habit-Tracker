// ============================================
// login.js — Handle user login
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  applyTheme();

  // If already logged in, go to dashboard
  if (getCurrentUser()) {
    window.location.href = "index.html";
    return;
  }

  var form = document.querySelector(".login-box");
  var errorMsg = document.getElementById("login-error");

  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var requiredFields = [emailInput, passwordInput];

  // Clear red highlight on keypress
  requiredFields.forEach(function (field) {
    field.addEventListener("keydown", function () {
      this.classList.remove("input-error");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    // Highlight empty required fields
    var hasError = false;
    requiredFields.forEach(function (field) {
      field.classList.remove("input-error");
    });

    if (!email) {
      emailInput.classList.add("input-error");
      hasError = true;
    }
    if (!password) {
      passwordInput.classList.add("input-error");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    // Find matching user
    var users = getFromStorage(KEYS.users) || [];
    var user = users.find(function (u) {
      return (
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
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
