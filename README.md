<div align="center">

# ✅ Habit Tracker

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

**Build habits. Check them off. Watch your streaks grow.**

</div>

A habit-tracking web app built from scratch with plain **HTML, CSS, and JavaScript** — no frameworks, no libraries, no build step. Create habits, check them off each day, and watch your streaks and monthly stats grow. All data is stored locally in your browser.

This was developed by a team of three students as a university web development group project. The course was structured around three iterations, each introducing a new layer of the stack — though the project evolved quite a bit along the way:

1. **Iteration 1 — HTML:** built a first version of every page in plain HTML, as far as the course had covered at that point.
2. **Iteration 2 — CSS:** while styling, we realized the original HTML structure didn't fit the design we had in mind — so we overhauled the project, essentially remaking it. Most pages kept their purpose (some elements were dropped, others added), and the new markup was laid out so JavaScript could later be slotted straight in.
3. **Iteration 3 — JavaScript:** wired up interactivity, validation, and data persistence, making smaller design adjustments along the way so the UI matched the functionality we actually needed.

## ✨ Features

- 🔐 **Accounts** — sign up and log in locally. Each user's habits, completions, and settings are kept separate. Sign-up validates email format and requires a strong password (8+ characters with uppercase, lowercase, number, and special character).
- 🏠 **Dashboard** (`index.html`) — every habit is shown as a card with its emoji, color, and a dot grid of the current month. Tap the checkbox to mark a habit done for the selected day, and step back through previous days with the arrow buttons or the date picker (future days are locked). Completing **all** habits in a day launches a confetti celebration. 🎉
- ➕ **Create habits** (`new-habit.html`) — set a name, emoji (validated so only a real emoji is accepted), description, category, color, goal frequency, and optional reminder time and days.
- 🗑️ **Delete habits** — right-click a habit card (or long-press on touch devices) to open a context menu.
- 📊 **Progress & statistics** (`progress.html`) — pick any habit, month, and year to see a yearly bar chart of completions, current and highest streaks, best month, total check-ins, and completion percentages for the selected month and year.
- ⚙️ **Settings** (`settings.html`) — edit your display name and email, switch between **dark and light themes**, toggle notification preferences, and log out.
- 💬 **Feedback** (`feedback.html`) — a survey form with a star rating, checkboxes for favorite features, and free-form comments.
- 👋 **About & Contact** (`about.html`, `contact.html`) — info about the project and how to reach the team.

## 🚀 Getting started

No installation or dependencies required.

```bash
git clone https://github.com/ATLASofcl/Habit-Tracker.git
cd Habit-Tracker

# Recommended: serve the folder with any static file server, e.g.
python3 -m http.server 8000
```

Then open <http://localhost:8000> in a modern browser. (Opening `index.html` directly from the file system also works.)

On first visit you'll be redirected to the login page — create an account via **Sign up**, log in, then hit the **+** button to add your first habit.

## 📁 Project structure

```
Habit-Tracker/
├── index.html          # Dashboard – daily habit check-off
├── new-habit.html      # Create a new habit
├── progress.html       # Per-habit statistics and charts
├── login.html          # Log in
├── signup.html         # Create an account
├── settings.html       # Profile, theme, and notification settings
├── feedback.html       # Feedback survey
├── about.html          # About the project
├── contact.html        # Contact information
├── css/
│   ├── style.css       # Global styles, light/dark themes, shared animations
│   ├── header-menu.css # Sticky header and hamburger navigation
│   └── *.css           # One stylesheet per page
├── js/
│   ├── utils.js        # Shared helpers: storage, auth, theme, dates
│   └── *.js            # One script per page
└── assets/             # Images, icons, and the custom font
```

Every page loads the shared `css/style.css`, `css/header-menu.css`, and `js/utils.js`, plus its own page-specific stylesheet and script.

### 💾 Data storage

All data lives in the browser's `localStorage` under these keys:

| Key | Contents |
| --- | --- |
| `habitTracker_users` | Registered accounts |
| `habitTracker_currentUser` | The id of the signed-in user |
| `habitTracker_habits` | All habits, each linked to its owner's `userId` |
| `habitTracker_completions` | One `{ habitId, date }` entry per checked-off day |
| `habitTracker_settings` | Per-user preferences (display name, theme, notifications) |
| `habitTracker_feedback` | Submitted feedback surveys |

## ⚠️ Limitations

This is a learning project, so a few deliberate simplifications apply:

- There is no backend — accounts and habits exist only in the browser they were created in, and clearing site data erases everything.
- Authentication is for demonstration only: passwords are stored in plain text in `localStorage`. Don't reuse a real password.
- Reminder times and notification toggles are saved but no real notifications are sent.
- Modern browser APIs (`Intl.Segmenter`, `showPicker()`) are used, so a current version of Chrome, Edge, Firefox, or Safari is recommended.

## 👥 Team

Built by:

- [@ATLASofcl](https://github.com/ATLASofcl)
- [@Arshia532](https://github.com/Arshia532)
- [@zxcpivo](https://github.com/zxcpivo)
