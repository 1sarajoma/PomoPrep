import React, { useState, useEffect } from "react";

import Timer from "./components/Timer";
import AddSubject from "./components/StudyForm";
import SubjectList from "./components/SubjectList";

export default function App() {
  // sessions grouped by subject: { [subject]: [session, ...] }
  const [sessions, setSessions] = useState(() => {
    const raw = localStorage.getItem("sessions");
    return raw ? JSON.parse(raw) : {};
  });

  // persist sessions
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Add a session. Arguments:
  // (subject, content, notes, durationSeconds, startTimeISO, endTimeISO, cycles)
  const addSession = (subject, content, notes, duration, startTime, endTime, cycles) => {
    const session = {
      id: Date.now(),
      content,
      notes,
      duration,
      date: startTime || new Date().toISOString(),
      endTime: endTime || null,
      cycles: typeof cycles === "number" ? cycles : (cycles ? Number(cycles) : 0),
    };

    setSessions((prev) => ({
      ...prev,
      [subject]: [...(prev[subject] || []), session],
    }));
  };

  // Subjects list (kept separately for the AddSubject UI)
  const [subjects, setSubjects] = useState(() => Object.keys(sessions));

  const addSubject = (name) => {
    setSubjects((s) => (s.includes(name) ? s : [...s, name]));
    setSessions((prev) => (prev[name] ? prev : { ...prev, [name]: [] }));
  };

  // site background (used to tint the page during active study/break)
  const [siteBgClass, setSiteBgClass] = useState("");
  const handleStatusChange = ({ mode, isActive }) => {
    setSiteBgClass(isActive ? (mode === "study" ? "site-study" : "site-break") : "");
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 bg-transition ${siteBgClass}`}>
      <header className="text-center mb-6">
        <h1 className="title">PomoStudy 🧠</h1>
        <p className="text-gray-500">Your personal study companion.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        <Timer onAddSession={addSession} subjects={subjects} onStatusChange={handleStatusChange} />
        <AddSubject subjects={subjects} onAddSubject={addSubject} />
        <SubjectList sessions={sessions} />
      </div>

      <div className="max-w-3xl mx-auto mt-6 text-center">
        <button
          onClick={() => {
            if (window.confirm("Reset all study data? This will clear sessions and subjects.")) {
              setSessions({});
              setSubjects([]);
              localStorage.removeItem("sessions");
            }
          }}
          className="px-3 py-1 rounded bg-red-500 text-white"
          style={{ fontSize: "1rem" }}
        >
          Reset Data
        </button>
      </div>
    </div>
  );
}
