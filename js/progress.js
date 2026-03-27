// ============================================
// progress.js — Charts, streaks, and statistics
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  populateHabitSelector();
  populateDateSelectors();

  var selector = document.getElementById("habit-select");
  var monthSelect = document.getElementById("month-select");
  var yearSelect = document.getElementById("year-select");

  // Re-render when user picks a different habit or date
  selector.addEventListener("change", function () {
    renderProgressForHabit(selector.value);
  });
  monthSelect.addEventListener("change", function () {
    renderProgressForHabit(selector.value);
  });
  yearSelect.addEventListener("change", function () {
    renderProgressForHabit(selector.value);
  });

  // Render for the first habit if one exists
  if (selector.value) {
    renderProgressForHabit(selector.value);
  }
});

// --- Fill the month and year dropdowns ---
function populateDateSelectors() {
  var monthSelect = document.getElementById("month-select");
  var yearSelect = document.getElementById("year-select");
  var today = new Date();

  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  monthNames.forEach(function (name, i) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.textContent = name;
    monthSelect.appendChild(opt);
  });
  monthSelect.value = today.getMonth();

  // Show years from 5 years ago to current year
  var currentYear = today.getFullYear();
  for (var y = currentYear; y >= currentYear - 5; y--) {
    var opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
  yearSelect.value = currentYear;
}

// --- Read the selected year and month from the dropdowns ---
function getSelectedDate() {
  var month = parseInt(document.getElementById("month-select").value);
  var year = parseInt(document.getElementById("year-select").value);
  return { year: year, month: month };
}

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

  // Apply the habit's color to the whole page so bars and pills match
  var habits = getFromStorage(KEYS.habits) || [];
  var habit = habits.find(function (h) {
    return h.id === habitId;
  });
  if (habit && habit.color) {
    document.documentElement.style.setProperty("--habit-color", habit.color);
  }

  updateBarChart(habitId);
  updateHabitCard(habitId);
  updateStats(habitId);
  updateInfoPills(habitId);
}

// --- Bar chart: monthly completion percentages ---
function updateBarChart(habitId) {
  var completions = getCompletionsForHabit(habitId);
  var bars = document.querySelectorAll(".chart-bar");
  var selected = getSelectedDate();

  // Count completions per month for the selected year
  var monthlyCounts = new Array(12).fill(0);
  completions.forEach(function (c) {
    var parts = c.date.split("-");
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1; // 0-indexed
    if (year === selected.year) {
      monthlyCounts[month]++;
    }
  });

  // Calculate percentage for each month (completions / days in month * 100)
  bars.forEach(function (bar, i) {
    var daysInMonth = new Date(selected.year, i + 1, 0).getDate();
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

  // Update counter (completions for selected month)
  var counterEl = card.querySelector(".habit-counter");
  var selected = getSelectedDate();
  if (counterEl) {
    var monthCompletions = getCompletionsForHabit(habitId).filter(function (c) {
      var parts = c.date.split("-");
      return (
        parseInt(parts[0]) === selected.year &&
        parseInt(parts[1]) === selected.month + 1
      );
    });
    counterEl.textContent = monthCompletions.length + " this month";
  }

  // Rebuild dot grid — show all days in the selected month (same rules as index page)
  var table = card.querySelector(".habit-table");
  if (table) {
    table.innerHTML = "";
    var today = new Date();
    var todayStr = toDateString(today);
    var daysInMonth = new Date(selected.year, selected.month + 1, 0).getDate();

    for (var i = 1; i <= daysInMonth; i++) {
      var dotDate = new Date(selected.year, selected.month, i);
      var dotDateStr = toDateString(dotDate);
      var dot = document.createElement("div");
      dot.className = "habit-dot";
      if (isCompletedOnDate(habitId, dotDateStr)) {
        dot.classList.add("completed");
      }
      if (dotDateStr === todayStr) {
        dot.classList.add("current-day");
      }
      if (dotDateStr > todayStr) {
        dot.classList.add("future");
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

  // Best month: find the month with the most completions
  var bestMonthLabel = "N/A";
  var bestMonthCount = 0;
  if (completions.length > 0) {
    var monthBuckets = {};
    completions.forEach(function (c) {
      var key = c.date.substring(0, 7); // "YYYY-MM"
      monthBuckets[key] = (monthBuckets[key] || 0) + 1;
    });
    var bestKey = "";
    Object.keys(monthBuckets).forEach(function (key) {
      if (monthBuckets[key] > bestMonthCount) {
        bestMonthCount = monthBuckets[key];
        bestKey = key;
      }
    });
    if (bestKey) {
      var bestMonthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      var parts = bestKey.split("-");
      bestMonthLabel =
        bestMonthNames[parseInt(parts[1]) - 1] + " " + parts[0];
    }
  }

  // Total days completed (lifetime)
  var totalDays = completions.length;

  // Yearly completion percentage for the selected year
  var selected = getSelectedDate();
  var today = new Date();
  var yearStart = new Date(selected.year, 0, 1);
  var yearEnd = new Date(selected.year, 11, 31);
  // If viewing the current year, count days up to today; otherwise the full year
  var endDate = selected.year === today.getFullYear() ? today : yearEnd;
  var dayCount = Math.ceil((endDate - yearStart) / (1000 * 60 * 60 * 24)) + 1;
  var thisYearCompletions = completions.filter(function (c) {
    return c.date.startsWith(selected.year + "");
  }).length;
  var yearPercent = Math.round((thisYearCompletions / dayCount) * 100);

  // Monthly completion percentage for the selected month
  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  var daysInMonth = new Date(selected.year, selected.month + 1, 0).getDate();
  var isCurrentMonth =
    selected.year === today.getFullYear() && selected.month === today.getMonth();
  var monthDayCount = isCurrentMonth ? today.getDate() : daysInMonth;
  var monthPrefix =
    selected.year + "-" + String(selected.month + 1).padStart(2, "0");
  var thisMonthCompletions = completions.filter(function (c) {
    return c.date.startsWith(monthPrefix);
  }).length;
  var monthPercent = Math.round((thisMonthCompletions / monthDayCount) * 100);

  // Update stat boxes
  var statBoxes = document.querySelectorAll(".stat-box");
  if (statBoxes.length >= 2) {
    statBoxes[0].innerHTML =
      "<p>Highest Streak: " +
      highestStreak +
      " days</p>" +
      "<p>Current Streak: " +
      currentStreak +
      " days</p>" +
      "<p>Best Month: " +
      bestMonthLabel +
      " (" +
      bestMonthCount +
      " days)</p>" +
      "<p>Total Days Completed: " +
      totalDays +
      "</p>";

    statBoxes[1].innerHTML =
      "<p>Completed (" +
      selected.year +
      ")</p>" +
      '<p class="stat-highlight">' +
      yearPercent +
      " %</p>" +
      "<p>Completed (" +
      monthNames[selected.month] +
      ")</p>" +
      '<p class="stat-highlight">' +
      monthPercent +
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
