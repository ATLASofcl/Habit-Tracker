document.addEventListener("DOMContentLoaded", function () {
  applyTheme();

  if (getCurrentUser()) {
    window.location.href = "index.html";
    return;
  }

  var form = document.querySelector(".signup-form");
  var errorMsg = document.getElementById("signup-error");

  var nameInput = document.getElementById("signup-name");
  var emailInput = document.getElementById("signup-email");
  var passwordInput = document.getElementById("signup-password");
  var confirmPasswordInput = document.getElementById("signup-confirm-password");
  var requiredFields = [nameInput, emailInput, passwordInput, confirmPasswordInput];

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

  requiredFields.forEach(function (field) {
    field.addEventListener("keydown", function () {
      this.classList.remove("input-error");
      errorMsg.style.display = "none";
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var confirmPassword = confirmPasswordInput.value;

    var hasError = false;
    requiredFields.forEach(function (field) {
      field.classList.remove("input-error");
    });
    errorMsg.style.display = "none";

    if (!name) {
      nameInput.classList.add("input-error");
      hasError = true;
    }
    if (!email) {
      emailInput.classList.add("input-error");
      hasError = true;
    }
    if (!password) {
      passwordInput.classList.add("input-error");
      hasError = true;
    }
    if (!confirmPassword) {
      confirmPasswordInput.classList.add("input-error");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    if (!emailRegex.test(email)) {
      emailInput.classList.add("input-error");
      showError("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      passwordInput.classList.add("input-error");
      showError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      confirmPasswordInput.classList.add("input-error");
      showError("Passwords do not match.");
      return;
    }

    var users = getFromStorage(KEYS.users) || [];
    var emailExists = users.some(function (u) {
      return u.email.toLowerCase() === email.toLowerCase();
    });
    if (emailExists) {
      emailInput.classList.add("input-error");
      showError("An account with this email already exists.");
      return;
    }

    var newUser = {
      id: generateId("user"),
      name: name,
      email: email,
      password: password,
      createdAt: toDateString(new Date()),
    };

    users.push(newUser);
    saveToStorage(KEYS.users, users);

    window.location.href = "login.html";
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }
});
