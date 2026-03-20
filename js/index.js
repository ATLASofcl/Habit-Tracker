// ============================================
// index.js — Dashboard: habit cards, check-offs, date navigation
// ============================================

// The date currently being viewed (defaults to today)
var currentDate = new Date();

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  // Attach date navigation buttons
  document.querySelector(".decrease-btn").addEventListener("click", handlePrevDay);
  document.querySelector(".increase-btn").addEventListener("click", handleNextDay);

  // Initial render
  renderDashboard();
});

// --- Main render function ---
function renderDashboard() {
  renderHabits();
  updateDateDisplay();
}

// --- Render all habit cards ---
function renderHabits() {
  var container = document.getElementById("habits-container");
  var noHabitsMsg = document.getElementById("no-habits-msg");
  var user = getCurrentUser();
  var habits = getUserHabits(user.id);

  // Clear existing cards
  container.innerHTML = "";

  if (habits.length === 0) {
    noHabitsMsg.style.display = "block";
    return;
  }

  noHabitsMsg.style.display = "none";

  habits.forEach(function (habit) {
    var card = createHabitCard(habit);
    container.appendChild(card);
  });
}

// --- Build a single habit card DOM element ---
function createHabitCard(habit) {
  var card = document.createElement("div");
  card.className = "habit";
  card.style.setProperty("--habit-color", habit.color);

  // Icon (shows emoji if set, otherwise just the colored circle)
  var icon = document.createElement("div");
  icon.className = "habit-icon";
  if (habit.emoji) {
    icon.textContent = habit.emoji;
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontSize = "1.5em";
  }
  card.appendChild(icon);

  // Name
  var name = document.createElement("div");
  name.className = "habit-name";
  name.textContent = habit.name;
  card.appendChild(name);

  // Checkbox (click to toggle today's completion)
  var checkbox = document.createElement("div");
  checkbox.className = "habit-checkbox";
  var todayStr = toDateString(currentDate);
  if (isCompletedOnDate(habit.id, todayStr)) {
    checkbox.classList.add("checked");
    checkbox.textContent = "\u2713"; // checkmark
    checkbox.style.display = "flex";
    checkbox.style.alignItems = "center";
    checkbox.style.justifyContent = "center";
    checkbox.style.fontSize = "1.5em";
    checkbox.style.color = "white";
  }
  checkbox.addEventListener("click", function () {
    toggleCompletion(habit.id, todayStr);
    renderDashboard(); // re-render to update dots + checkbox
  });
  card.appendChild(checkbox);

  // 30-day dot grid
  var table = document.createElement("div");
  table.className = "habit-table";

  for (var i = 29; i >= 0; i--) {
    var dotDate = new Date(currentDate);
    dotDate.setDate(dotDate.getDate() - i);
    var dotDateStr = toDateString(dotDate);

    var dot = document.createElement("div");
    dot.className = "habit-dot";
    if (isCompletedOnDate(habit.id, dotDateStr)) {
      dot.classList.add("completed");
    }
    table.appendChild(dot);
  }
  card.appendChild(table);

  // Delete button
  var deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-habit-btn";
  deleteBtn.innerHTML = "&times;";
  deleteBtn.title = "Delete habit";
  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (confirm('Delete "' + habit.name + '"?')) {
      deleteHabit(habit.id);
      renderDashboard();
    }
  });
  card.appendChild(deleteBtn);

  return card;
}

// --- Delete a habit and its completions ---
function deleteHabit(habitId) {
  // Remove the habit
  var habits = getFromStorage(KEYS.habits) || [];
  habits = habits.filter(function (h) { return h.id !== habitId; });
  saveToStorage(KEYS.habits, habits);

  // Remove its completions
  var completions = getFromStorage(KEYS.completions) || [];
  completions = completions.filter(function (c) { return c.habitId !== habitId; });
  saveToStorage(KEYS.completions, completions);
}

// --- Update the date display in the footer ---
function updateDateDisplay() {
  var dateEl = document.querySelector(".current-date");
  dateEl.textContent = formatDate(currentDate);
}

// --- Day navigation ---
function handlePrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  renderDashboard();
}

function handleNextDay() {
  currentDate.setDate(currentDate.getDate() + 1);
  renderDashboard();
}
