var KEYS = {
  users: "habitTracker_users",
  currentUser: "habitTracker_currentUser",
  habits: "habitTracker_habits",
  completions: "habitTracker_completions",
  settings: "habitTracker_settings",
  feedback: "habitTracker_feedback",
};

function generateId(prefix) {
  return prefix + "_" + Date.now();
}

function getFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  var userId = getFromStorage(KEYS.currentUser);
  if (!userId) return null;

  var users = getFromStorage(KEYS.users) || [];
  return (
    users.find(function (u) {
      return u.id === userId;
    }) || null
  );
}


function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
  }
}

function getUserHabits(userId) {
  var habits = getFromStorage(KEYS.habits) || [];
  return habits.filter(function (h) {
    return h.userId === userId;
  });
}

function getCompletionsForHabit(habitId) {
  var completions = getFromStorage(KEYS.completions) || [];
  return completions.filter(function (c) {
    return c.habitId === habitId;
  });
}

function isCompletedOnDate(habitId, dateString) {
  var completions = getFromStorage(KEYS.completions) || [];
  return completions.some(function (c) {
    return c.habitId === habitId && c.date === dateString;
  });
}

function toggleCompletion(habitId, dateString) {
  var completions = getFromStorage(KEYS.completions) || [];

  var index = completions.findIndex(function (c) {
    return c.habitId === habitId && c.date === dateString;
  });

  if (index !== -1) {
    completions.splice(index, 1);
  } else {
    completions.push({ habitId: habitId, date: dateString });
  }

  saveToStorage(KEYS.completions, completions);
}


function formatDate(dateObj) {
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateString(dateObj) {
  var year = dateObj.getFullYear();
  var month = String(dateObj.getMonth() + 1).padStart(2, "0");
  var day = String(dateObj.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}


function getUserSettings(userId) {
  var allSettings = getFromStorage(KEYS.settings) || {};
  return (
    allSettings[userId] || {
      displayName: "",
      email: "",
      theme: "dark",
      emailNotifications: false,
      smsNotifications: false,
    }
  );
}

function saveUserSettings(userId, settingsObj) {
  var allSettings = getFromStorage(KEYS.settings) || {};
  allSettings[userId] = settingsObj;
  saveToStorage(KEYS.settings, allSettings);
}

function applyTheme() {
  var user = getCurrentUser();
  if (!user) return;

  var settings = getUserSettings(user.id);
  if (settings.theme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

function updateNavAuthLink() {
  var navList = document.querySelector(".nav-list");
  if (!navList) return;

  var existing = document.getElementById("nav-auth-item");
  if (existing) existing.remove();

  var li = document.createElement("li");
  li.id = "nav-auth-item";
  var a = document.createElement("a");
  a.href = "#";

  if (getCurrentUser()) {
    a.textContent = "Log Out";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      saveToStorage(KEYS.currentUser, null);
      window.location.href = "login.html";
    });
  } else {
    a.textContent = "Log In";
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "login.html";
    });
  }

  li.appendChild(a);
  navList.appendChild(li);
}
