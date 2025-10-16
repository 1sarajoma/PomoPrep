import React, { useState } from "react";

export default function AddSubject({ subjects = [], onAddSubject }) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const name = (value || "").trim();
    if (!name) return;
    onAddSubject && onAddSubject(name);
    setValue("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Add Subject</h2>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <label htmlFor="new-subject" className="sr-only">New subject</label>
        <input
          id="new-subject"
          type="text"
          placeholder="e.g. Calculus"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="col-span-2 w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />

        <div className="flex md:justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            Add
          </button>
        </div>
      </form>

      {subjects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Existing Subjects</h3>
          <div className="flex flex-wrap gap-2 ">
            {subjects.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-gray-100 text-sm dark:bg-gray-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
