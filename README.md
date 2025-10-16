# 🧠 PomoPrep — Pomodoro Study Tracker

**PomoPrep** is a productivity-focused web app that integrates the **Pomodoro technique** with a **study log**.  
It helps students track subjects, topics, and notes across multiple sessions — making it easy to stay organized and reflect on progress over time.

---

## 🚀 Features

- ⏱️ **Pomodoro Timer** — 25-minute focus sessions with 5-minute breaks.
- 📚 **Subject-Based Organization** — logs study sessions by subject for quick and easy access.
- 📝 **Detailed Study Logs** — record topics covered, notes, and number of cycles completed.
- 💾 **Persistent Data Storage** — saves your progress using the browser’s LocalStorage API.
- 💻 **Responsive UI** — optimized for both desktop and mobile study setups.

---

## 🧩 Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React, JSX, Tailwind CSS |
| **State Management** | React Hooks (`useState`, `useEffect`, `useMemo`) |
| **Storage** | Browser LocalStorage API |
| **Animations** | SVG progress ring + smooth transitions |
---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/PomoStudy.git
cd PomoStudy
2. Install dependencies
bash
Copy code
npm install
3. Run the development server
bash
Copy code
npm run dev
4. Open in your browser
arduino
Copy code
http://localhost:5173
(Port may vary depending on setup.)

## 🧠 How It Works
Start a Pomodoro session by selecting a subject.

Once the timer ends, record:

Topics covered

Notes or reminders (e.g., “Revisit question 3”)

Each completed session is logged under the chosen subject.

Click on any subject to view past sessions, timestamps, and notes.

## 🗂️ Project Structure
bash
Copy code
src/
 ├── components/
 │    ├── Timer.jsx          # Pomodoro timer logic + UI
 │    ├── StudyForm.jsx      # Input form for logging sessions
 │    ├── SubjectList.jsx    # Organized subject-based study history
 │
 ├── App.jsx                 # Main component handling state + structure
 ├── index.css               # Tailwind setup
 ├── main.jsx                # Entry point

## ✨ Future Improvements
🔁 Sync data to a backend (Firebase or Supabase)

💬 AI Study Assistant (auto-summarize notes or suggest review questions)

📊 Analytics Dashboard (time spent per subject, daily streaks)

🔔 Custom notifications and long-break timers
