// ============================================
// utils.js — Shared helpers used by every page
// ============================================

// --- localStorage keys (defined once to avoid typos) ---
var KEYS = {
  users: "habitTracker_users",
  currentUser: "habitTracker_currentUser",
  habits: "habitTracker_habits",
  completions: "habitTracker_completions",
  settings: "habitTracker_settings",
  feedback: "habitTracker_feedback",
};

// --- ID generator ---
// Creates a unique ID like "user_1710856200000"
function generateId(prefix) {
  return prefix + "_" + Date.now();
}

// --- localStorage helpers ---
// Safely read from localStorage (returns null if key missing or data corrupted)
function getFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

// Save a value to localStorage as JSON
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Auth helpers ---
// Get the currently logged-in user object, or null
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

// Redirect to login page if not logged in
// Call this at the top of every protected page
function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
  }
}

// --- Habit helpers ---
// Get all habits belonging to a user
function getUserHabits(userId) {
  var habits = getFromStorage(KEYS.habits) || [];
  return habits.filter(function (h) {
    return h.userId === userId;
  });
}

// Get all completion records for a specific habit
function getCompletionsForHabit(habitId) {
  var completions = getFromStorage(KEYS.completions) || [];
  return completions.filter(function (c) {
    return c.habitId === habitId;
  });
}

// Check if a habit was completed on a specific date
function isCompletedOnDate(habitId, dateString) {
  var completions = getFromStorage(KEYS.completions) || [];
  return completions.some(function (c) {
    return c.habitId === habitId && c.date === dateString;
  });
}

// Toggle a habit's completion for a date (add if missing, remove if exists)
function toggleCompletion(habitId, dateString) {
  var completions = getFromStorage(KEYS.completions) || [];

  var index = completions.findIndex(function (c) {
    return c.habitId === habitId && c.date === dateString;
  });

  if (index !== -1) {
    // Already completed — remove it
    completions.splice(index, 1);
  } else {
    // Not completed — add it
    completions.push({ habitId: habitId, date: dateString });
  }

  saveToStorage(KEYS.completions, completions);
}

// --- Date helpers ---
// Format a Date object to "Friday, Mar 20, 2026"
function formatDate(dateObj) {
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Convert a Date object to "YYYY-MM-DD" string for storage
// Uses local date parts (not UTC) to avoid timezone shifts
function toDateString(dateObj) {
  var year = dateObj.getFullYear();
  var month = String(dateObj.getMonth() + 1).padStart(2, "0");
  var day = String(dateObj.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// --- Settings helpers ---
// Get settings for a user, with sensible defaults
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

// Save settings for a user
function saveUserSettings(userId, settingsObj) {
  var allSettings = getFromStorage(KEYS.settings) || {};
  allSettings[userId] = settingsObj;
  saveToStorage(KEYS.settings, allSettings);
}

// --- Theme ---
// Apply the user's theme preference (adds/removes "light-theme" class on body)
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

// --- Navigation auth link ---
// Updates the nav menu to show "Log Out" if logged in, or "Log In" if not
function updateNavAuthLink() {
  var navList = document.querySelector(".nav-list");
  if (!navList) return;

  // Remove existing auth link if present
  var existing = document.getElementById("nav-auth-item");
  if (existing) existing.remove();

  // Create new auth link
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
