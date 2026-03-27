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
  document
    .querySelector(".decrease-btn")
    .addEventListener("click", handlePrevDay);
  document
    .querySelector(".increase-btn")
    .addEventListener("click", handleNextDay);

  // Date picker — click the date label to open it
  var dateLabel = document.querySelector(".current-date");
  var datePicker = document.querySelector(".date-picker");

  datePicker.max = toDateString(new Date());

  dateLabel.addEventListener("click", function () {
    datePicker.showPicker();
  });

  datePicker.addEventListener("change", function () {
    var parts = datePicker.value.split("-");
    currentDate = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    );
    renderDashboard();
  });

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
  }
  checkbox.addEventListener("click", function () {
    toggleCompletion(habit.id, todayStr);
    renderDashboard(); // re-render to update dots + checkbox
    checkAllHabitsComplete();
  });
  checkbox.addEventListener("mouseenter", function () {
    if (!checkbox.classList.contains("checked")) {
      checkbox.style.backgroundColor = habit.color + "66";
    }
  });
  checkbox.addEventListener("mouseleave", function () {
    if (!checkbox.classList.contains("checked")) {
      checkbox.style.backgroundColor = "";
    }
  });
  card.appendChild(checkbox);

  // Monthly dot grid — shows all days in the current month
  var table = document.createElement("div");
  table.className = "habit-table";

  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();
  var daysInMonth = new Date(year, month + 1, 0).getDate();

  for (var i = 1; i <= daysInMonth; i++) {
    var dotDate = new Date(year, month, i);
    var dotDateStr = toDateString(dotDate);

    var dot = document.createElement("div");
    dot.className = "habit-dot";
    if (isCompletedOnDate(habit.id, dotDateStr)) {
      dot.classList.add("completed");
    }
    if (dotDateStr === toDateString(currentDate)) {
      dot.classList.add("current-day");
    }
    if (dotDateStr > toDateString(new Date())) {
      dot.classList.add("future");
    }
    table.appendChild(dot);
  }
  card.appendChild(table);

  // Context menu (long-press on touch, right-click on desktop)
  var pressTimer = null;
  var didLongPress = false;

  card.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    showContextMenu(e.pageX, e.pageY, habit);
  });

  card.addEventListener(
    "touchstart",
    function (e) {
      didLongPress = false;
      pressTimer = setTimeout(function () {
        didLongPress = true;
        var touch = e.touches[0];
        showContextMenu(touch.pageX, touch.pageY, habit);
      }, 500);
    },
    { passive: true },
  );

  card.addEventListener("touchend", function () {
    clearTimeout(pressTimer);
  });

  card.addEventListener("touchmove", function () {
    clearTimeout(pressTimer);
  });

  // Prevent click from firing after a long-press
  card.addEventListener(
    "click",
    function (e) {
      if (didLongPress) {
        e.stopPropagation();
        e.preventDefault();
        didLongPress = false;
      }
    },
    true,
  );

  return card;
}

// --- Delete a habit and its completions ---
function deleteHabit(habitId) {
  // Remove the habit
  var habits = getFromStorage(KEYS.habits) || [];
  habits = habits.filter(function (h) {
    return h.id !== habitId;
  });
  saveToStorage(KEYS.habits, habits);

  // Remove its completions
  var completions = getFromStorage(KEYS.completions) || [];
  completions = completions.filter(function (c) {
    return c.habitId !== habitId;
  });
  saveToStorage(KEYS.completions, completions);
}

// --- Context menu ---
function showContextMenu(x, y, habit) {
  dismissContextMenu();

  var overlay = document.createElement("div");
  overlay.className = "context-menu-overlay";

  var menu = document.createElement("div");
  menu.className = "context-menu";

  var deleteOption = document.createElement("button");
  deleteOption.className = "context-menu-item delete";
  deleteOption.textContent = "Delete";
  deleteOption.addEventListener("click", function () {
    dismissContextMenu();
    if (confirm('Delete "' + habit.name + '"?')) {
      deleteHabit(habit.id);
      renderDashboard();
    }
  });

  menu.appendChild(deleteOption);
  overlay.appendChild(menu);
  document.body.appendChild(overlay);

  // Position the menu, keeping it within the viewport
  var menuRect = menu.getBoundingClientRect();
  var viewportW = window.innerWidth;
  var viewportH = window.innerHeight;
  var scrollY = window.pageYOffset || document.documentElement.scrollTop;
  var scrollX = window.pageXOffset || document.documentElement.scrollLeft;

  var left = x - scrollX;
  var top = y - scrollY;

  if (left + menuRect.width > viewportW) {
    left = viewportW - menuRect.width - 8;
  }
  if (top + menuRect.height > viewportH) {
    top = viewportH - menuRect.height - 8;
  }
  if (left < 8) left = 8;
  if (top < 8) top = 8;

  menu.style.left = left + "px";
  menu.style.top = top + "px";

  // Dismiss on overlay click, scroll, or resize
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) dismissContextMenu();
  });
  window.addEventListener("scroll", dismissContextMenu, { once: true });
  window.addEventListener("resize", dismissContextMenu, { once: true });
}

function dismissContextMenu() {
  var existing = document.querySelector(".context-menu-overlay");
  if (existing) existing.remove();
}

// --- Update the date display in the footer ---
function updateDateDisplay() {
  var dateEl = document.querySelector(".current-date");
  dateEl.textContent = formatDate(currentDate);

  var datePicker = document.querySelector(".date-picker");
  datePicker.value = toDateString(currentDate);
}

// --- Day navigation ---
function handlePrevDay() {
  currentDate.setDate(currentDate.getDate() - 1);
  renderDashboard();
}

function handleNextDay() {
  var next = new Date(currentDate);
  next.setDate(next.getDate() + 1);
  if (toDateString(next) <= toDateString(new Date())) {
    currentDate = next;
    renderDashboard();
  }
}

// --- Confetti celebration when all habits are complete ---
function checkAllHabitsComplete() {
  var user = getCurrentUser();
  var habits = getUserHabits(user.id);
  if (habits.length === 0) return;

  var todayStr = toDateString(currentDate);
  var allDone = habits.every(function (habit) {
    return isCompletedOnDate(habit.id, todayStr);
  });

  if (allDone) {
    launchConfetti();
  }
}

function launchConfetti() {
  // Prevent overlapping confetti bursts
  if (document.querySelector(".confetti-container")) return;

  var container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  var colors = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#ff924c",
    "#ffffff",
  ];

  for (var i = 0; i < 80; i++) {
    var piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 1 + Math.random() * 1.5 + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.width = 6 + Math.random() * 6 + "px";
    piece.style.height = 6 + Math.random() * 6 + "px";
    if (Math.random() > 0.5) {
      piece.style.borderRadius = "50%";
    }
    container.appendChild(piece);
  }

  // Remove after the animation finishes
  setTimeout(function () {
    container.remove();
  }, 3000);
}
