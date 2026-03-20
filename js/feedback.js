// ============================================
// feedback.js — Handle the feedback form
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Theme support (no auth required for feedback)
  applyTheme();
  updateNavAuthLink();

  var form = document.getElementById("feedback-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Read form values
    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var occupation = document.getElementById("occupation").value;

    // Star rating (1-5)
    var ratingRadio = document.querySelector('input[name="rating"]:checked');
    var rating = ratingRadio ? parseInt(ratingRadio.value) : 0;

    // "What did you like" checkboxes — collect all checked values
    var likedCheckboxes = document.querySelectorAll('input[name="liked"]:checked');
    var liked = [];
    likedCheckboxes.forEach(function (cb) {
      liked.push(cb.value);
    });

    var howOften = document.getElementById("how-often").value;
    var recommend = document.getElementById("recommend").value;
    var comment = document.getElementById("comment").value.trim();

    // Validate required fields
    if (!name || !email) {
      alert("Please fill in your name and email.");
      return;
    }
    if (!rating) {
      alert("Please select a star rating.");
      return;
    }

    // Create feedback object
    var feedback = {
      id: generateId("fb"),
      name: name,
      email: email,
      occupation: occupation,
      rating: rating,
      liked: liked,
      howOften: howOften,
      recommend: recommend,
      comment: comment,
      submittedAt: new Date().toISOString(),
    };

    // Save to localStorage
    var allFeedback = getFromStorage(KEYS.feedback) || [];
    allFeedback.push(feedback);
    saveToStorage(KEYS.feedback, allFeedback);

    // Show success message
    form.innerHTML =
      '<div style="text-align: center; color: white; padding: 40px;">' +
      "<h2>Thank you for your feedback!</h2>" +
      "<p>Your response has been recorded.</p>" +
      '<a href="index.html" style="color: #457ebd;">Back to Dashboard</a>' +
      "</div>";
  });
});
