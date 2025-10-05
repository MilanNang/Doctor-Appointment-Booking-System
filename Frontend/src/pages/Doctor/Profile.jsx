import React, { useState } from "react";

export default function DoctorProfile() {
  const [editMode, setEditMode] = useState(false);
  const [doctor, setDoctor] = useState({
    name: "Dr. Sarah Chen",
    specialization: "Cardiologist",
    hospital: "San Francisco General Hospital",
    fee: 85,
    about:
      "Experienced cardiologist with 12+ years of practice in treating heart diseases, performing cardiac surgeries, and preventive healthcare. I specialize in patient-centered care with advanced treatment methods.",
    slots: ["Mon 10:00 AM", "Mon 2:00 PM", "Tue 11:30 AM", "Wed 9:00 AM"],
  });

  const [newSlot, setNewSlot] = useState("");

  const handleChange = (field, value) => {
    setDoctor({ ...doctor, [field]: value });
  };

  const addSlot = () => {
    if (newSlot.trim() !== "") {
      setDoctor({ ...doctor, slots: [...doctor.slots, newSlot] });
      setNewSlot("");
    }
  };

  const removeSlot = (index) => {
    const updated = doctor.slots.filter((_, i) => i !== index);
    setDoctor({ ...doctor, slots: updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-yellow-100 px-6 py-8">
      {/* HEADER */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Doctor Profile</h1>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Save Profile" : "Edit Profile"}
        </button>
      </header>

      {/* DOCTOR INFO CARD */}
      <section className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-gray-400">
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-yellow-500 text-white rounded-full p-1 cursor-pointer text-xs">
              📷
              <input type="file" className="hidden" />
            </label>
          )}
        </div>

        <div className="flex-1">
          {editMode ? (
            <>
              <input
                value={doctor.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="block w-full border rounded px-3 py-2 mb-2"
              />
              <input
                value={doctor.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="block w-full border rounded px-3 py-2 mb-2"
              />
              <input
                value={doctor.hospital}
                onChange={(e) => handleChange("hospital", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{doctor.name}</h2>
              <p className="text-yellow-600 font-medium">
                {doctor.specialization}
              </p>
              <p className="text-slate-500">{doctor.hospital}</p>
            </>
          )}
        </div>

        <div className="text-right">
          {editMode ? (
            <input
              type="number"
              value={doctor.fee}
              onChange={(e) => handleChange("fee", e.target.value)}
              className="w-20 border rounded px-2 py-1 text-right"
            />
          ) : (
            <div className="text-yellow-600 font-bold text-xl">
              ${doctor.fee}
            </div>
          )}
          <div className="text-slate-500 text-sm">per session</div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-5xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">About Me</h3>
        {editMode ? (
          <textarea
            value={doctor.about}
            onChange={(e) => handleChange("about", e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows="4"
          />
        ) : (
          <p className="text-slate-600">{doctor.about}</p>
        )}
      </section>

      {/* AVAILABLE SLOTS */}
      <section className="max-w-5xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">Available Slots</h3>
        {editMode ? (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g., Thu 3:00 PM"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={addSlot}
                className="bg-green-500 text-white px-3 py-2 rounded"
              >
                + Add
              </button>
            </div>
            <ul className="space-y-2">
              {doctor.slots.map((slot, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {slot}
                  <button
                    onClick={() => removeSlot(i)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {doctor.slots.map((slot, i) => (
              <button
                key={i}
                className="border border-yellow-400 text-yellow-700 py-2 px-3 rounded-lg hover:bg-yellow-50"
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS (static for now) */}
      <section className="max-w-5xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">Patient Reviews</h3>
        <div className="space-y-4">
          <div className="border-b pb-2">
            <p className="text-slate-600">
              "Dr. Chen is very professional and kind. She explained everything
              clearly and gave me confidence about my treatment."
            </p>
            <span className="text-xs text-slate-400">– John D.</span>
          </div>
          <div className="border-b pb-2">
            <p className="text-slate-600">
              "Excellent doctor! Helped me recover fast and followed up after my
              surgery."
            </p>
            <span className="text-xs text-slate-400">– Maria K.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
