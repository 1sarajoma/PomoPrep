
import React, { useState, useEffect } from "react";

// Beginner-friendly Timer component.
// Keeps the same visuals and behavior as before but uses plain state and
// simple helpers so the code is easy to read.
export default function Timer({ onAddSession, subjects = [], onStatusChange }) {
  const STUDY_SECONDS = 25 * 60;
  const BREAK_SECONDS = 5 * 60;

  // Basic UI state
  const [mode, setMode] = useState("study"); // 'study' or 'break'
  const [seconds, setSeconds] = useState(STUDY_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  // Modal / form state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectSelect, setSubjectSelect] = useState("");
  const [showEndChoice, setShowEndChoice] = useState(false);
  const [showEndDetails, setShowEndDetails] = useState(false);
  const [endSections, setEndSections] = useState("");
  const [endNotes, setEndNotes] = useState("");

  // Simple counters to track progress
  const [cycles, setCycles] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Inform parent about mode/isActive so App can tint the background
  useEffect(() => {
    if (typeof onStatusChange === "function") {
      try { onStatusChange({ mode, isActive }); } catch (e) { /* ignore */ }
    }
  }, [mode, isActive, onStatusChange]);

  // Simple ticking effect
  useEffect(() => {
    if (!isActive) return;
    if (seconds <= 0) return;

    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [isActive, seconds]);

  // When the timer reaches zero while active, handle end-of-interval behavior
  useEffect(() => {
    if (!isActive && seconds !== 0) return;
    if (isActive && seconds === 0) {
      // Count a cycle if we just finished a study period
      if (mode === "study") setCycles((c) => c + 1);

      // stop the timer
      setIsActive(false);

      // try to play end sound
      try {
        const audio = new Audio("/end-sound.mp3");
        audio.volume = 0.7;
        audio.play().catch(() => {});
      } catch (e) {
        
      }

      // show user modal to choose continue or end
      setTimeout(() => setShowEndChoice(true), 200);
    }
  }, [isActive, seconds, mode]);

  // Helpers
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  const total = mode === "study" ? STUDY_SECONDS : BREAK_SECONDS;
  const elapsed = total - seconds;
  const progress = seconds <= 0 ? 1 : elapsed / total;

  // Start a session (ask for subject first)
  function startWithPrompt() {
    if (mode === "study") {
      const list = subjects || [];
      const defaultSelect = currentSubject && list.includes(currentSubject) ? currentSubject : (list.length ? list[0] : "");
      setSubjectSelect(defaultSelect);
      setShowSubjectModal(true);
      return;
    }

    // break mode: start immediately
    setSeconds(BREAK_SECONDS);
    setIsActive(true);
    try { onStatusChange && onStatusChange({ mode: "break", isActive: true }); } catch (e) {}
  }

  function submitSubject() {
    const s = (subjectSelect || "").trim();
    if (!s) return;
    setCurrentSubject(s);
    setSessionStartTime(new Date().toISOString());
    setShowSubjectModal(false);
    setSeconds(STUDY_SECONDS);
    setIsActive(true);
    try { onStatusChange && onStatusChange({ mode: "study", isActive: true }); } catch (e) {}
  }

  function handleNext() {
    if (mode === "study") {
      // switch to break and count a completed cycle
      setCycles((c) => c + 1);
      setMode("break");
      setSeconds(BREAK_SECONDS);
      setIsActive(true);
      try { onStatusChange && onStatusChange({ mode: "break", isActive: true }); } catch (e) {}
      return;
    }

    // if on break, ask whether to end the session
    setShowEndChoice(true);
  }

  function handleSaveAndEnd() {
    if (onAddSession && currentSubject) {
      let duration = STUDY_SECONDS;
      if (mode === "study") duration = STUDY_SECONDS - seconds;
      if (mode === "break") duration = BREAK_SECONDS - seconds;

      // If cycles is zero, estimate from duration as fallback
      const usedCycles = cycles || Math.max(1, Math.floor(duration / STUDY_SECONDS));
      const startTime = sessionStartTime || new Date().toISOString();
      const endTime = new Date().toISOString();

      onAddSession(currentSubject, endSections || "(no content)", endNotes || "", duration, startTime, endTime, usedCycles);
    }

    try { onStatusChange && onStatusChange({ mode: "study", isActive: false }); } catch (e) {}

    // reset local state for next session
    setShowEndDetails(false);
    setShowEndChoice(false);
    setCurrentSubject(null);
    setMode("study");
    setSeconds(STUDY_SECONDS);
    setIsActive(false);
    setEndSections("");
    setEndNotes("");
    setCycles(0);
    setSessionStartTime(null);
  }

  const size = 400;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-2xl p-6 text-center bg-transition`}>
      <div className="timer-ring-wrap mx-auto mb-4" style={{ width: size, height: size }}>
        <svg className="timer-ring" width={size} height={size}>
          <defs>
            <filter id="ring-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08"/>
            </filter>
          </defs>
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <circle r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
            <circle
              r={radius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: dashOffset,
                transition: "stroke-dashoffset 0.45s linear",
                transform: "rotate(-90deg)",
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
              }}
            />
          </g>
        </svg>

        <div className="timer-center">
          <div className="text-7xl font-mono">{formatTime(seconds)}</div>
        </div>
      </div>

      <div className="space-x-4">
        {!currentSubject && (
          <button onClick={startWithPrompt} className="big-start px-6 py-4 rounded bg-blue-600 text-white hover:bg-blue-700">Start Session</button>
        )}

        {currentSubject && (
          <>
            <button onClick={() => setIsActive((v) => !v)} className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600">{isActive ? "Pause" : "Resume"}</button>

            <button onClick={handleNext} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600">Next</button>
          </>
        )}
      </div>

      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">What subject will you be covering?</h3>
            {(subjects || []).length > 0 ? (
              <select value={subjectSelect} onChange={(e) => setSubjectSelect(e.target.value)} className="w-full p-2 rounded border mb-3 text-gray-900 dark:text-gray-100">
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <div className="mb-3 text-sm text-gray-500">No subjects yet. Use the "Add Subject" box to create one before starting a session.</div>
            )}

            <div className="flex justify-center gap-2">
              <button onClick={() => setShowSubjectModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-900 dark:text-gray-100">Cancel</button>
              <button onClick={submitSubject} disabled={(subjects || []).length === 0} className="px-4 py-2 rounded bg-blue-600 text-white" style={{ opacity: (subjects || []).length === 0 ? 0.5 : 1 }}>Start</button>
            </div>
          </div>
        </div>
      )}

      {showEndChoice && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Session finished</h3>
            <p className="text-sm text-gray-600 mb-4 text-gray-900 dark:text-gray-100">Would you like to continue this session or end it now?</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => { setShowEndChoice(false); setShowEndDetails(true); }} className="px-4 py-2 rounded bg-gray-200 text-gray-900 dark:text-gray-100">End session</button>
              <button onClick={() => { setShowEndChoice(false); setMode("study"); setSeconds(STUDY_SECONDS); setIsActive(true); }} className="px-4 py-2 rounded bg-blue-600 text-white">Continue</button>
            </div>
          </div>
        </div>
      )}

      {showEndDetails && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">End session details</h3>
            <label className="text-sm text-gray-600">Sections Covered</label>
            <input value={endSections} onChange={(e) => setEndSections(e.target.value)} className="w-full p-2 rounded border mb-3 text-gray-900 dark:text-gray-100" />
            <label className="text-sm text-gray-600">Additional Notes</label>
            <textarea value={endNotes} onChange={(e) => setEndNotes(e.target.value)} className="w-full p-2 rounded border mb-3 text-gray-900 dark:text-gray-100" />
            <div className="flex justify-center gap-2">
              <button onClick={() => setShowEndDetails(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-900 dark:text-gray-100">Cancel</button>
              <button onClick={handleSaveAndEnd} className="px-4 py-2 rounded bg-green-600 text-white">Save & End</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

