// src/pages/SetAvailability.jsx
import React, { useState } from "react";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const generateTimes = (interval) => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour = (h % 12) || 12;
      const ampm = h < 12 ? "am" : "pm";
      const minutes = m.toString().padStart(2, "0");
      times.push(`${hour}:${minutes}${ampm}`);
    }
  }
  return times;
};

const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

export default function SetAvailability() {
  const [availability, setAvailability] = useState({
    Sunday: [],
    Monday: [{ start: "9:00am", end: "5:00pm" }],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });

  const [durations, setDurations] = useState({
    Sunday: 30,
    Monday: 30,
    Tuesday: 30,
    Wednesday: 30,
    Thursday: 30,
    Friday: 30,
    Saturday: 30,
  });

  const [copyPopup, setCopyPopup] = useState(null);
  const [copySelection, setCopySelection] = useState([]);

  const handleAddSlot = (day) => {
    setAvailability({
      ...availability,
      [day]: [...availability[day], { start: "9:00am", end: "5:00pm" }],
    });
  };

  const handleChange = (day, index, field, value) => {
    const newSlots = [...availability[day]];
    newSlots[index][field] = value;
    setAvailability({ ...availability, [day]: newSlots });
  };

  const handleRemoveSlot = (day, index) => {
    const newSlots = [...availability[day]];
    newSlots.splice(index, 1);
    setAvailability({ ...availability, [day]: newSlots });
  };

  const handleDurationChange = (day, value) => {
    setDurations({ ...durations, [day]: value });
  };

  const handleApplyCopy = (sourceDay) => {
    const selectedDays = copySelection;
    const updatedAvailability = { ...availability };
    const updatedDurations = { ...durations };

    selectedDays.forEach((targetDay) => {
      updatedAvailability[targetDay] = [...availability[sourceDay]];
      updatedDurations[targetDay] = durations[sourceDay];
    });

    setAvailability(updatedAvailability);
    setDurations(updatedDurations);
    setCopyPopup(null);
    setCopySelection([]);
  };

  const toggleDaySelection = (day) => {
    setCopySelection((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Weekly Hours
        </h1>

        <div className="space-y-5">
          {days.map((day) => {
            const slots = availability[day];
            const interval = durations[day];
            const timeOptions = generateTimes(interval);

            return (
              <div
                key={day}
                className="flex items-start bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition"
              >
                {/* Day Label */}
                <div className="w-28 text-gray-700 font-semibold text-lg">
                  {day}
                </div>

                {/* Slots */}
                <div className="flex-1 space-y-3">
                  {slots.length > 0 ? (
                    slots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 text-base"
                      >
                        {/* Start time */}
                        <input
                          list={`times-${day}-${index}`}
                          value={slot.start}
                          onChange={(e) =>
                            handleChange(day, index, "start", e.target.value)
                          }
                          className="border rounded-lg px-2 h-10 text-base w-32 focus:ring-2 focus:ring-blue-400"
                        />
                        <datalist id={`times-${day}-${index}`}>
                          {timeOptions.map((time) => (
                            <option key={time} value={time} />
                          ))}
                        </datalist>

                        <span className="text-gray-500">–</span>

                        {/* End time */}
                        <input
                          list={`times-end-${day}-${index}`}
                          value={slot.end}
                          onChange={(e) =>
                            handleChange(day, index, "end", e.target.value)
                          }
                          className="border rounded-lg px-2 h-10 text-base w-32 focus:ring-2 focus:ring-blue-400"
                        />
                        <datalist id={`times-end-${day}-${index}`}>
                          {timeOptions.map((time) => (
                            <option key={time} value={time} />
                          ))}
                        </datalist>

                        {/* Duration - only for first slot */}
                        {index === 0 && (
                          <select
                            value={durations[day]}
                            onChange={(e) =>
                              handleDurationChange(day, parseInt(e.target.value))
                            }
                            className="border rounded-lg px-2 h-10 text-base w-28 focus:ring-2 focus:ring-blue-400"
                          >
                            {durationOptions.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveSlot(day, index)}
                          className="text-red-500 hover:text-red-700 text-xl"
                        >
                          ✕
                        </button>

                        {/* Add button (moved to FIRST ROW) */}
                        {index === 0 && (
                          <button
                            onClick={() => handleAddSlot(day)}
                            className="text-green-500 hover:text-green-700 text-xl"
                          >
                            ＋
                          </button>
                        )}

                        {/* Copy button (only first row) */}
                        {index === 0 && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setCopyPopup(copyPopup === day ? null : day)
                              }
                              className="ml-2 text-blue-500 hover:text-blue-700 text-xl"
                            >
                              ⧉
                            </button>

                            {copyPopup === day && (
                              <div className="absolute left-8 top-0 z-10 bg-white border rounded-xl shadow-lg w-60 p-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                  COPY TIMES TO…
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {days.map((d) => (
                                    <label
                                      key={d}
                                      className="flex items-center text-base cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={copySelection.includes(d)}
                                        onChange={() => toggleDaySelection(d)}
                                        className="mr-2"
                                      />
                                      {d}
                                    </label>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleApplyCopy(day)}
                                  className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white text-base font-semibold py-2 rounded-lg transition"
                                >
                                  Apply
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-gray-400">
                      Unavailable{" "}
                      <button
                        onClick={() => handleAddSlot(day)}
                        className="text-blue-500 hover:underline ml-2"
                      >
                        ＋ Add
                      </button>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
