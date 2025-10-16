import React, { useState } from "react";

export default function SubjectList({ sessions = {} }) {
  const [activeSubject, setActiveSubject] = useState(null);

  const subjects = Object.keys(sessions);

  if (!subjects.length) {
    return (
      <div className="text-center text-gray-500">No sessions logged yet. Start studying!</div>
    );
  }

  const formatStart = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Format as: "DATE START - END" where END is calculated from duration (seconds)
  // Migrate old records: if `endTime` is not present but `duration` is, assume `date` stores the end time
  const formatRange = (dateStr, durationSeconds, endTimeStr) => {
    if (!dateStr && !endTimeStr) return "";

    // Parse possible date and end strings
    const parsedDate = dateStr ? new Date(dateStr) : null;
    const parsedEnd = endTimeStr ? new Date(endTimeStr) : null;
    const hasDate = parsedDate && !isNaN(parsedDate.getTime());
    const hasEnd = parsedEnd && !isNaN(parsedEnd.getTime());

    let startDate = null;
    let endDate = null;

    if (hasEnd) {
      // We have an explicit end time. Use dateStr as start when valid, else compute start = end - duration
      endDate = parsedEnd;
      if (hasDate) {
        startDate = parsedDate;
      } else if (durationSeconds && typeof durationSeconds === "number") {
        startDate = new Date(endDate.getTime() - durationSeconds * 1000);
      }
    } else if (hasDate) {
      // No explicit end recorded.
      if (durationSeconds && typeof durationSeconds === "number") {
        // Older entries sometimes stored the END in `date`. Assume that: treat parsedDate as end
        // and compute start = end - duration. This fixes legacy "end - end+duration" displays.
        endDate = parsedDate;
        startDate = new Date(endDate.getTime() - durationSeconds * 1000);
      } else {
        // Treat parsedDate as start
        startDate = parsedDate;
      }
    }

    // Fallback: if we still don't have startDate, try to use whatever we have
    if (!startDate || isNaN(startDate.getTime())) {
      if (hasDate) startDate = parsedDate;
      else if (hasEnd) startDate = new Date(parsedEnd.getTime() - (durationSeconds || 0) * 1000);
    }

    if (!startDate || isNaN(startDate.getTime())) return dateStr || endTimeStr || "";

    const datePart = startDate.toLocaleDateString();
    const startTime = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Determine end time
    if (!endDate && durationSeconds && typeof durationSeconds === "number") {
      endDate = new Date(startDate.getTime() + durationSeconds * 1000);
    }

    if (endDate && !isNaN(endDate.getTime())) {
      const endTime = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `${datePart} ${startTime} - ${endTime}`;
    }

    return `${datePart} ${startTime}`;
  };

  // Return number of completed 25-minute cycles from duration (seconds)
  const cyclesCompleted = (durationSeconds) => {
    const CYCLE = 25 * 60;
    if (!durationSeconds || typeof durationSeconds !== "number") return 0;
    return Math.floor(durationSeconds / CYCLE);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Study History</h2>

      <div className="space-y-2">
        {subjects.map((subject) => (
          <div key={subject}>
            <button
              onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}
              className="w-full text-left px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-600 dark:hover:bg-blue-900"
            >
              {subject}
            </button>

            {activeSubject === subject && (
              <div className="pl-4 mt-2 space-y-2">
                {[...(sessions[subject] || [])]
                  .slice()
                  .reverse()
                  .map((s) => (
                    <div
                      key={s.id}
                      className="border-l-2 border-green-500 pl-3 text-sm rounded-md p-2"
                    >
                      <div>
                        <strong>{s.content}</strong>
                        {(() => {
                          // Keep the visible date (locale date from stored date if possible)
                          let datePart = s.date || "";
                          try {
                            const parsed = new Date(s.date);
                            if (!isNaN(parsed.getTime())) datePart = parsed.toLocaleDateString();
                          } catch (e) {}
                          const cycles = (s && (typeof s.cycles === "number" || (!isNaN(Number(s.cycles)) && s.cycles !== "")))
                            ? Number(s.cycles)
                            : cyclesCompleted(s.duration);
                          const label = `${cycles} cycle${cycles === 1 ? "" : "s"}`;
                          return <span className="text-gray-500 text-xs ml-2">{datePart} · {label}</span>;
                        })()}
                      </div>
                      {s.notes && <div className="text-gray-400">{s.notes}</div>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
