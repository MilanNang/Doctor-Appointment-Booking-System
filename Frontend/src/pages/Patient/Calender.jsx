import React, { useEffect, useState } from "react";
import { ChevronLeft, Clock, Calendar, Globe } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/* ---------------------------------------------------
   TIME UTILITIES
--------------------------------------------------- */

// Convert "9:00am" → "09:00"
function convertTo24Hour(timeStr) {
  const match = timeStr.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!match) return timeStr;

  let [_, h, m, mer] = match;
  h = Number(h);

  if (mer === "pm" && h !== 12) h += 12;
  if (mer === "am" && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${m}`;
}

// Convert 24-hour → 12-hour (ex: "18:30" → "6:30pm")
function to12Hour(timeStr) {
  let [h, m] = timeStr.split(":");
  h = Number(h);
  const suffix = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m}${suffix}`;
}

// NEW — Convert 12-hour → 24-hour for BACKEND
function convert12To24(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
  if (!match) return timeStr;

  let [_, hour, minute, mer] = match;
  hour = parseInt(hour);

  if (mer.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (mer.toLowerCase() === "am" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

// Generate time slots between start and end
function generateSlots(start, end, duration) {
  const times = [];
  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  while (startMinutes < endMinutes) {
    const hh = String(Math.floor(startMinutes / 60)).padStart(2, "0");
    const mm = String(startMinutes % 60).padStart(2, "0");
    times.push(to12Hour(`${hh}:${mm}`));
    startMinutes += duration;
  }
  return times;
}

/* ---------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------- */

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [step, setStep] = useState(1);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const token = JSON.parse(localStorage.getItem("auth"))?.token;

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  /* -----------------------------------------
     LOAD DOCTOR
  ----------------------------------------- */
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        const d = res.data;
        setDoctor(d);

        const map = {};
        const next30 = new Date();
        next30.setDate(next30.getDate() + 30);

        for (let dt = new Date(); dt <= next30; dt.setDate(dt.getDate() + 1)) {
          const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
          const dateStr = dt.toISOString().split("T")[0];

          const daySlots = d.availability?.[dayName];
          if (daySlots && daySlots.length > 0) {
            let dailyTimes = [];
            daySlots.forEach((slot) => {
              const start24 = convertTo24Hour(slot.start);
              const end24 = convertTo24Hour(slot.end);
              dailyTimes.push(...generateSlots(start24, end24, slot.duration));
            });
            map[dateStr] = dailyTimes;
          }
        }
        setAvailabilityMap(map);
      } catch (err) {
        console.log("Error loading doctor", err);
      }
    };

    loadDoctor();
  }, [id]);

  if (!doctor) return <div className="p-6">Loading...</div>;

  /* -----------------------------------------
     CALENDAR
  ----------------------------------------- */

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const dayCells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayStr = new Date().toISOString().split("T")[0];

  /* -----------------------------------------
     CONFIRM BOOKING  (FIXED)
  ----------------------------------------- */

  const handleConfirm = async () => {
    try {
      const res = await api.post("/appointments/book", {
        doctorId: doctor._id,
        date: selectedDate,
        time: convert12To24(selectedTime), // FIXED HERE ⭐
      });

      alert("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to book appointment.");
    }
  };

  /* -----------------------------------------
     UI RENDER
  ----------------------------------------- */

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 p-8 border-r bg-slate-50">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mb-4 w-8 h-8 flex items-center justify-center rounded-full border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <h2 className="text-xl font-semibold">{doctor.user?.name}</h2>
        <h3 className="text-2xl font-bold mt-1">{doctor.specialization}</h3>

        <div className="mt-3 flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4" /> <span>30 min</span>
        </div>

        {step >= 2 && selectedDate && (
          <>
            <div className="flex items-center mt-3 gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              {selectedTime}, {new Date(selectedDate).toDateString()}
            </div>
            <div className="flex items-center mt-2 gap-2 text-slate-600">
              <Globe className="w-4 h-4" /> India Standard Time
            </div>
          </>
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-8">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Select a Date & Time</h2>

            <div className="flex gap-8">

              {/* CALENDAR */}
              <div className="w-2/3">
                <div className="flex justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, monthIndex - 1, 1))}
                    className="px-2 py-1 border rounded"
                  >
                    Prev
                  </button>
                  <h3 className="font-semibold">{monthName} {year}</h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, monthIndex + 1, 1))}
                    className="px-2 py-1 border rounded"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-center text-xs font-medium">{d}</div>
                  ))}

                  {dayCells.map((day, idx) => {
                    if (!day) return <div key={idx}></div>;

                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const available = availabilityMap[dateStr];
                    const selected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;

                    return (
                      <button
                        key={idx}
                        onClick={() => available && setSelectedDate(dateStr)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${selected ? "bg-blue-600 text-white" 
                          : available ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "text-slate-300 cursor-not-allowed"}
                          ${isToday ? "border border-blue-500" : ""}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOTS */}
              <div className="w-1/3">
                <h4 className="font-medium mb-3">
                  {selectedDate ? new Date(selectedDate).toDateString() : "Pick a date"}
                </h4>

                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {selectedDate && availabilityMap[selectedDate] ? (
                    availabilityMap[selectedDate].map((time) => (
                      <div key={time} className="flex gap-2">
                        {selectedTime === time ? (
                          <>
                            <button className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white">
                              {time}
                            </button>
                            <button
                              onClick={() => setStep(2)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg w-28"
                            >
                              Next
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedTime(time)}
                            className="w-full px-4 py-2 border rounded-lg hover:bg-slate-50"
                          >
                            {time}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No slots available.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Confirm Your Appointment</h2>

            <div className="space-y-3">

              <div className="p-4 bg-slate-100 rounded-lg">
                <p><b>Doctor:</b> {doctor.user?.name}</p>
                <p><b>Specialization:</b> {doctor.specialization}</p>
                <p><b>Fees:</b> ₹{doctor.fees}</p>
              </div>

              <div className="p-4 bg-slate-100 rounded-lg">
                <p><b>Date:</b> {new Date(selectedDate).toDateString()}</p>
                <p><b>Time:</b> {selectedTime}</p>
                <p><b>Duration:</b> 30 minutes</p>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700"
              >
                Confirm Booking
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
