import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar, Globe, User } from "lucide-react";

const availability = {
  "2025-10-23": ["6:30pm", "7:00pm", "7:30pm", "8:00pm", "8:30pm"],
  "2025-10-24": ["10:00am", "11:00am", "2:00pm", "3:30pm"],
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2025-10-23");
  const [selectedTime, setSelectedTime] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 p-8 border-r bg-slate-50 flex flex-col">
        {(step === 2 || step === 3) && (
          <button
            onClick={() => setStep(step - 1)}
            className="mb-4 w-8 h-8 rounded-full flex items-center justify-center border hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <h2 className="text-xl font-semibold text-slate-800">Milan Rayka</h2>
        <h3 className="text-2xl font-bold mt-1">30 Minute Meeting</h3>

        <div className="flex items-center mt-4 text-slate-600 gap-2">
          <Clock className="w-4 h-4" /> <span>30 min</span>
        </div>
        <div className="flex items-center mt-2 text-slate-600 gap-2">
          <Calendar className="w-4 h-4" />{" "}
          <span>Web conferencing details provided upon confirmation</span>
        </div>

        {(step === 2 || step === 3) && (
          <>
            <div className="flex items-center mt-2 text-slate-600 gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {selectedTime}, {new Date(selectedDate).toDateString()}
              </span>
            </div>
            <div className="flex items-center mt-2 text-slate-600 gap-2">
              <Globe className="w-4 h-4" />
              <span>India Standard Time</span>
            </div>
          </>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 p-8">
        {/* STEP 1 - Date & Time Selection */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Select a Date & Time</h2>
            <div className="flex gap-8">
              {/* Calendar */}
              <div className="w-2/3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-700 font-semibold">
                    {month} {year}
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-full">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-slate-500"
                    >
                      {d}
                    </div>
                  ))}
                  {days.map((day) => {
                    const dateStr = `${year}-10-${String(day).padStart(2, "0")}`;
                    const isAvailable = availability[dateStr];
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedDate(dateStr);
                            setSelectedTime(null);
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition 
                          ${
                            isSelected
                              ? "bg-blue-600 text-white shadow"
                              : isAvailable
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "text-slate-300 cursor-not-allowed"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="w-1/3">
                <h4 className="font-medium text-slate-800 mb-3">
                  {new Date(selectedDate).toDateString()}
                </h4>
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                  {availability[selectedDate] ? (
                    availability[selectedDate].map((time) => (
                      <div key={time} className="flex gap-2">
                        {selectedTime === time ? (
                          <>
                            <button className="flex-1 px-4 py-2 border rounded-lg bg-slate-700 text-white text-sm font-medium">
                              {time}
                            </button>
                            <button
                              onClick={() => setStep(2)}
                              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm w-24 animate-slideIn"
                            >
                              Next
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedTime(time)}
                            className="w-full px-4 py-2 border rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            {time}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No available slots for this date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 - Enter Details */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-6">Enter Details</h2>
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(3);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  type="text"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="button"
                className="border px-4 py-1 rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50 text-sm"
              >
                Add Guests
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>

              <p className="text-xs text-slate-500">
                By proceeding, you confirm that you have read and agree to our{" "}
                <a href="#" className="text-blue-600 underline">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 underline">
                  Privacy Notice
                </a>.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3 - Confirmation */}
        {step === 3 && (
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 text-lg font-semibold">
                ✔ You are scheduled
              </span>
            </div>
            <p className="text-slate-600 mb-4">
              A calendar invitation has been sent to your email address.
            </p>
            <button className="border px-4 py-2 rounded-lg hover:bg-slate-100 mb-6">
              Open Invitation
            </button>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-slate-800">30 Minute Meeting</h3>
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" /> Milan Rayka
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" /> {selectedTime},{" "}
                {new Date(selectedDate).toDateString()}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Globe className="w-4 h-4" /> India Standard Time
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" /> Web conferencing details to follow.
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-6 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Back to Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
