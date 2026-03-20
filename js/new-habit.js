// ============================================
// new-habit.js — Handle the "Create Habit" form
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  var form = document.getElementById("new-habit-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Read form values
    var name = document.getElementById("habit-name").value.trim();
    var emoji = document.getElementById("habit-emoji").value.trim();
    var description = document.getElementById("habit-description").value.trim();
    var category = document.getElementById("habit-category").value;

    // Color — the radio values don't have "#", so we prepend it
    var colorRadio = document.querySelector('input[name="habit-color"]:checked');
    var color = colorRadio ? "#" + colorRadio.value : "#FF595E";

    var goalFrequency = parseInt(document.getElementById("goal").value) || 1;
    var goalUnit = document.getElementById("unit").value;

    // Optional reminder fields
    var reminderTime = document.getElementById("time").value || "";
    var dayRadio = document.querySelector('input[name="on-days"]:checked');
    var reminderDay = dayRadio ? dayRadio.value : "";

    // Validate
    if (!name) {
      alert("Please enter a habit name.");
      return;
    }
    if (goalFrequency < 1) {
      alert("Goal frequency must be at least 1.");
      return;
    }

    // Create habit object
    var user = getCurrentUser();
    var newHabit = {
      id: generateId("habit"),
      userId: user.id,
      name: name,
      emoji: emoji,
      description: description,
      category: category,
      color: color,
      goalFrequency: goalFrequency,
      goalUnit: goalUnit,
      reminderTime: reminderTime,
      reminderDay: reminderDay,
      createdAt: toDateString(new Date()),
    };

    // Save to localStorage
    var habits = getFromStorage(KEYS.habits) || [];
    habits.push(newHabit);
    saveToStorage(KEYS.habits, habits);

    // Go back to dashboard
    window.location.href = "index.html";
  });
});
