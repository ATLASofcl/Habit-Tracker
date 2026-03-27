// ============================================
// progress.js — Charts, streaks, and statistics
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  populateHabitSelector();

  // Re-render when user picks a different habit
  var selector = document.getElementById("habit-select");
  selector.addEventListener("change", function () {
    renderProgressForHabit(selector.value);
  });

  // Render for the first habit if one exists
  if (selector.value) {
    renderProgressForHabit(selector.value);
  }
});

// --- Fill the dropdown with the user's habits ---
function populateHabitSelector() {
  var user = getCurrentUser();
  var habits = getUserHabits(user.id);
  var selector = document.getElementById("habit-select");

  // Clear existing options
  selector.innerHTML = "";

  if (habits.length === 0) {
    var opt = document.createElement("option");
    opt.textContent = "No habits yet";
    opt.value = "";
    selector.appendChild(opt);
    return;
  }

  habits.forEach(function (habit) {
    var opt = document.createElement("option");
    opt.value = habit.id;
    opt.textContent = habit.name;
    selector.appendChild(opt);
  });
}

// --- Main render function for a selected habit ---
function renderProgressForHabit(habitId) {
  if (!habitId) return;

  updateBarChart(habitId);
  updateHabitCard(habitId);
  updateStats(habitId);
  updateInfoPills(habitId);
}

// --- Bar chart: monthly completion percentages ---
function updateBarChart(habitId) {
  var completions = getCompletionsForHabit(habitId);
  var bars = document.querySelectorAll(".chart-bar");
  var today = new Date();
  var currentYear = today.getFullYear();

  // Count completions per month for the current year
  var monthlyCounts = new Array(12).fill(0);
  completions.forEach(function (c) {
    var parts = c.date.split("-");
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1; // 0-indexed
    if (year === currentYear) {
      monthlyCounts[month]++;
    }
  });

  // Calculate percentage for each month (completions / days in month * 100)
  bars.forEach(function (bar, i) {
    var daysInMonth = new Date(currentYear, i + 1, 0).getDate();
    var percent = Math.round((monthlyCounts[i] / daysInMonth) * 100);
    // Ensure at least 2% height so bars are visible if there's any data
    if (percent > 0 && percent < 2) percent = 2;
    bar.style.setProperty("--bar-height", percent + "%");
  });
}

// --- Habit card on progress page ---
function updateHabitCard(habitId) {
  var habits = getFromStorage(KEYS.habits) || [];
  var habit = habits.find(function (h) {
    return h.id === habitId;
  });
  if (!habit) return;

  var card = document.querySelector(".habit");
  if (!card) return;

  // Update color and name
  card.style.setProperty("--habit-color", habit.color);
  var nameEl = card.querySelector(".habit-name");
  if (nameEl) nameEl.textContent = habit.name;

  // Update icon
  var iconEl = card.querySelector(".habit-icon");
  if (iconEl && habit.emoji) {
    iconEl.textContent = habit.emoji;
    iconEl.style.display = "flex";
    iconEl.style.alignItems = "center";
    iconEl.style.justifyContent = "center";
    iconEl.style.fontSize = "1.5em";
  } else if (iconEl) {
    iconEl.textContent = "";
  }

  // Update counter (completions this month)
  var counterEl = card.querySelector(".habit-counter");
  if (counterEl) {
    var today = new Date();
    var monthCompletions = getCompletionsForHabit(habitId).filter(function (c) {
      var parts = c.date.split("-");
      return (
        parseInt(parts[0]) === today.getFullYear() &&
        parseInt(parts[1]) === today.getMonth() + 1
      );
    });
    counterEl.textContent = monthCompletions.length + " this month";
  }

  // Rebuild 30-dot grid
  var table = card.querySelector(".habit-table");
  if (table) {
    table.innerHTML = "";
    var today = new Date();
    for (var i = 29; i >= 0; i--) {
      var dotDate = new Date(today);
      dotDate.setDate(dotDate.getDate() - i);
      var dot = document.createElement("div");
      dot.className = "habit-dot";
      if (isCompletedOnDate(habitId, toDateString(dotDate))) {
        dot.classList.add("completed");
      }
      table.appendChild(dot);
    }
  }
}

// --- Stats: streaks and completion percentage ---
function updateStats(habitId) {
  var completions = getCompletionsForHabit(habitId);
  var dates = completions
    .map(function (c) {
      return c.date;
    })
    .sort();

  // Current streak: consecutive days ending today (or most recent)
  var currentStreak = calculateCurrentStreak(dates);
  var highestStreak = calculateHighestStreak(dates);

  // Yearly completion percentage
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 0, 1);
  var dayOfYear = Math.ceil((today - yearStart) / (1000 * 60 * 60 * 24)) + 1;
  var thisYearCompletions = completions.filter(function (c) {
    return c.date.startsWith(today.getFullYear() + "");
  }).length;
  var yearPercent = Math.round((thisYearCompletions / dayOfYear) * 100);

  // Update stat boxes
  var statBoxes = document.querySelectorAll(".stat-box");
  if (statBoxes.length >= 2) {
    statBoxes[0].innerHTML =
      "<p>Highest Streak: " +
      highestStreak +
      " days</p>" +
      "<p>Current Streak: " +
      currentStreak +
      " days</p>";

    statBoxes[1].innerHTML =
      "<p>Completed</p>" +
      "<p>(" +
      today.getFullYear() +
      ")</p>" +
      '<p class="stat-highlight">' +
      yearPercent +
      " %</p>";
  }
}

// Count consecutive days backwards from today
function calculateCurrentStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;

  var streak = 0;
  var checkDate = new Date();

  // Check if today is completed; if not, start from yesterday
  var todayStr = toDateString(checkDate);
  if (sortedDates.indexOf(todayStr) === -1) {
    checkDate.setDate(checkDate.getDate() - 1);
    todayStr = toDateString(checkDate);
    if (sortedDates.indexOf(todayStr) === -1) {
      return 0; // neither today nor yesterday completed
    }
  }

  // Walk backwards counting consecutive days
  while (sortedDates.indexOf(toDateString(checkDate)) !== -1) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// Find the longest run of consecutive days
function calculateHighestStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;

  var maxStreak = 1;
  var current = 1;

  for (var i = 1; i < sortedDates.length; i++) {
    var prev = new Date(sortedDates[i - 1]);
    var curr = new Date(sortedDates[i]);
    var diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (Math.round(diff) === 1) {
      current++;
      if (current > maxStreak) maxStreak = current;
    } else if (Math.round(diff) > 1) {
      current = 1;
    }
    // diff === 0 means duplicate date, skip
  }

  return maxStreak;
}

// --- Info pills: start date, average, total ---
function updateInfoPills(habitId) {
  var habits = getFromStorage(KEYS.habits) || [];
  var habit = habits.find(function (h) {
    return h.id === habitId;
  });
  var completions = getCompletionsForHabit(habitId);
  var pills = document.querySelectorAll(".info-pill");

  if (!habit || pills.length < 3) return;

  // Habit started date
  var startDate = new Date(habit.createdAt + "T00:00:00");
  var startFormatted = startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  pills[0].textContent = "Habit started on: " + startFormatted;

  // Average per month
  var today = new Date();
  var monthsSinceCreation =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth()) +
    1;
  if (monthsSinceCreation < 1) monthsSinceCreation = 1;
  var avgPerMonth = Math.round(completions.length / monthsSinceCreation);
  pills[1].textContent =
    "Average time per month: " + avgPerMonth + " Days / Month";

  // Total check-ins
  pills[2].textContent = "Total Check-ins: " + completions.length;
}
