document.addEventListener("DOMContentLoaded", function () {
  requireAuth();
  applyTheme();
  updateNavAuthLink();

  var form = document.getElementById("new-habit-form");

  var emojiInput = document.getElementById("habit-emoji");
  var emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

  emojiInput.addEventListener("input", function () {
    var value = this.value;
    var segments = [];
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      var segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      for (var seg of segmenter.segment(value)) {
        if (emojiRegex.test(seg.segment)) {
          segments.push(seg.segment);
        }
      }
    }
    this.value = segments.length > 0 ? segments[0] : "";
  });

  document.getElementById("habit-name").addEventListener("keydown", function () {
    this.classList.remove("input-error");
  });

  emojiInput.addEventListener("input", function () {
    this.classList.remove("input-error");
  });
  document.getElementById("goal").addEventListener("input", function () {
    this.classList.remove("input-error");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("habit-name").value.trim();
    var emoji = document.getElementById("habit-emoji").value.trim();
    var description = document.getElementById("habit-description").value.trim();
    var category = document.getElementById("habit-category").value;

    var colorRadio = document.querySelector(
      'input[name="habit-color"]:checked',
    );
    var color = colorRadio ? "#" + colorRadio.value : "#FF595E";

    var goalInput = document.getElementById("goal");
    var goalFrequency = parseInt(goalInput.value) || 0;
    var goalUnit = document.getElementById("unit").value;

    var reminderTime = document.getElementById("time").value || "";
    var dayCheckboxes = document.querySelectorAll('input[name="on-days"]:checked');
    var reminderDays = [];
    dayCheckboxes.forEach(function (cb) {
      reminderDays.push(cb.value);
    });

    var nameInput = document.getElementById("habit-name");
    var requiredFields = [nameInput, emojiInput, goalInput];
    var hasError = false;

    requiredFields.forEach(function (field) {
      field.classList.remove("input-error");
    });

    if (!name) {
      nameInput.classList.add("input-error");
      hasError = true;
    }
    if (!emoji || !emojiRegex.test(emoji)) {
      emojiInput.classList.add("input-error");
      hasError = true;
    }
    if (goalFrequency < 1) {
      goalInput.classList.add("input-error");
      hasError = true;
    }

    if (hasError) {
      return;
    }

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
      reminderDays: reminderDays,
      createdAt: toDateString(new Date()),
    };

    var habits = getFromStorage(KEYS.habits) || [];
    habits.push(newHabit);
    saveToStorage(KEYS.habits, habits);

    window.location.href = "index.html";
  });
});
