// ============================================
// settings.js — User preferences, theme, logout
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  var user = getCurrentUser();
  var form = document.querySelector(".settings-container");

  // Load current settings into form
  loadSettings(user);

  // Save settings on form submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleSaveSettings(user);
  });

  // Logout button
  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      saveToStorage(KEYS.currentUser, null);
      window.location.href = "login.html";
    });
  }
});

// Fill form fields with saved settings
function loadSettings(user) {
  var settings = getUserSettings(user.id);

  document.getElementById("display-name").value = settings.displayName || user.name;
  document.getElementById("settings-email").value = settings.email || user.email;

  // Theme radio
  var themeValue = settings.theme || "dark";
  var themeRadio = document.getElementById(themeValue);
  if (themeRadio) themeRadio.checked = true;

  // Notification checkboxes
  document.getElementById("email-updates").checked = settings.emailNotifications || false;
  document.getElementById("sms-updates").checked = settings.smsNotifications || false;
}

// Read form and save to localStorage
function handleSaveSettings(user) {
  var settings = {
    displayName: document.getElementById("display-name").value.trim(),
    email: document.getElementById("settings-email").value.trim(),
    theme: document.querySelector('input[name="theme"]:checked')
      ? document.querySelector('input[name="theme"]:checked').value
      : "dark",
    emailNotifications: document.getElementById("email-updates").checked,
    smsNotifications: document.getElementById("sms-updates").checked,
  };

  saveUserSettings(user.id, settings);
  applyTheme(); // apply theme change immediately

  // Show confirmation
  var saveBtn = document.querySelector('.settings-container input[type="submit"]');
  var originalValue = saveBtn.value;
  saveBtn.value = "Saved!";
  setTimeout(function () {
    saveBtn.value = originalValue;
  }, 1500);
}
