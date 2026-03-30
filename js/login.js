document.addEventListener("DOMContentLoaded", function () {
  applyTheme();

  if (getCurrentUser()) {
    window.location.href = "index.html";
    return;
  }

  var form = document.querySelector(".login-box");
  var errorMsg = document.getElementById("login-error");

  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var requiredFields = [emailInput, passwordInput];

  requiredFields.forEach(function (field) {
    field.addEventListener("keydown", function () {
      this.classList.remove("input-error");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

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

    saveToStorage(KEYS.currentUser, user.id);
    window.location.href = "index.html";
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }
});
