import React, { useEffect, useState } from "react";
import API from "../util/api";
import { useSelector, useDispatch } from "react-redux";
import { setDoctorProfile } from "../../Redux/doctorSlice";
import { showToast } from "../../Redux/toastSlice";
import { useNavigate } from "react-router-dom";

export default function DoctorProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctor, setDoctor] = useState({
    profileImage: "",
    name: "",
    specialization: "",
    hospital: "",
    experience: "",
    fee: "",
    about: "",
    contact: "",
    availability: {},
  });

  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
       const { data } = await API.get("/doctors/me");

        setDoctor({
          profileImage: data.profileImage || "",
          name: data.name || "",
          specialization: data.specialization || "",
          hospital: data.hospital || "",
          experience: data.experience || "",
          fee: data.fees || "",
          about: data.about || "",
          contact: data.contact || "",
          availability: data.availability || {},
        });
        setPreviewImage(data.profileImage || "");
        dispatch(setDoctorProfile(data));
      } catch (err) {
        console.warn("Doctor profile not found yet", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchDoctor();
  }, [user, dispatch]);

  const handleChange = (field, value) => {
    setDoctor({ ...doctor, [field]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDoctor({ ...doctor, profileImage: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create form data
      const formData = new FormData();
      
      // Add all fields (even if empty, backend will handle it)
      formData.append("specialization", doctor.specialization || "");
      formData.append("experience", doctor.experience || 0);
      formData.append("fees", doctor.fee || doctor.fees || 0);
      formData.append("about", doctor.about || "");
      formData.append("location", doctor.location || "");
      formData.append("availability", JSON.stringify(doctor.availability || {}));
      
      // Only append image if it's a File object (not a string URL)
      if (doctor.profileImage && doctor.profileImage instanceof File) {
        console.log("📎 Adding image to form:", doctor.profileImage.name);
        formData.append("profileImage", doctor.profileImage);
      } else {
        console.log("ℹ️  No image file to upload (using existing or none)");
      }

      console.log("📤 Sending profile update...");
      const response = await API.post("/doctors/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Response:", response.data);
      
      if (response.data.doctor) {
        setDoctor({ ...response.data.doctor, fee: response.data.doctor.fees });
        setPreviewImage(response.data.doctor.profileImage || previewImage);
        dispatch(setDoctorProfile(response.data.doctor));
      }
      
      setEditMode(false);
      dispatch(showToast({ message: "Profile saved successfully!", type: "success" }));
      
    } catch (err) {
      console.error("❌ Save error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Error saving profile";
      dispatch(showToast({ message: errorMessage, type: "error" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center text-gray-500 py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-2">Manage your professional information</p>
          </div>
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {editMode ? (saving ? "Saving..." : "Save Profile") : "Edit Profile"}
          </button>
        </div>

        {/* PROFILE IMAGE & INFO */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-yellow-600 text-white rounded-full p-2 cursor-pointer text-lg hover:bg-yellow-700 transition">
                  📷
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {editMode ? (
                <>
                  <input
                    placeholder="Full Name"
                    value={doctor.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <select
                    value={doctor.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select specialization...</option>
                    <option value="Cardiologists">Cardiologists</option>
                    <option value="Pediatricians">Pediatricians</option>
                    <option value="Neurologists">Neurologists</option>
                    <option value="Dermatologists">Dermatologists</option>
                    <option value="Dentists">Dentists</option>
                    <option value="General Physicians">General Physicians</option>
                  </select>
                  <input
                    placeholder="Clinic / Hospital"
                    value={doctor.hospital}
                    onChange={(e) => handleChange("hospital", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      placeholder="Experience (Years)"
                      type="number"
                      value={doctor.experience}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <input
                      type="number"
                      placeholder="Consultation Fee (₹)"
                      value={doctor.fee}
                      onChange={(e) => handleChange("fee", e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <input
                    placeholder="Contact / Address"
                    value={doctor.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-900">{doctor.name}</h2>
                  <p className="text-lg text-yellow-600 font-semibold">{doctor.specialization}</p>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium text-gray-900">Clinic:</span> {doctor.hospital}</p>
                    <p><span className="font-medium text-gray-900">Experience:</span> {doctor.experience} years</p>
                    <p><span className="font-medium text-gray-900">Fee:</span> <span className="text-yellow-600 font-bold text-xl">₹{doctor.fee}</span> per consultation</p>
                    <p><span className="font-medium text-gray-900">Contact:</span> {doctor.contact}</p>
                  </div>
                </>
              )}
            </div>

            {!editMode && (
              <button
                onClick={() => navigate("/doctor/calendar")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
              >
                Set Availability
              </button>
            )}
          </div>
        </div>

        {/* ABOUT */}
        <div className="card p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">About Me</h3>
          {editMode ? (
            <textarea
              placeholder="Write something about yourself..."
              value={doctor.about}
              onChange={(e) => handleChange("about", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows="5"
            />
          ) : (
            <p className="text-gray-600 leading-relaxed text-lg">{doctor.about || "No information added yet."}</p>
          )}
        </div>

        {/* WEEKLY AVAILABILITY VIEW */}
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Weekly Availability</h3>
          {doctor.availability && Object.keys(doctor.availability).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(doctor.availability).map(([day, slots]) => (
                <div key={day} className="border border-gray-200 rounded-lg p-4 hover:bg-yellow-50 transition">
                  <h4 className="font-bold text-yellow-600 mb-3 text-lg">{day}</h4>
                  <div className="flex flex-wrap gap-3">
                    {slots.map((slot, i) => (
                      <div key={i} className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg text-sm text-gray-700">
                        <span className="font-semibold">{slot.start}</span> – <span className="font-semibold">{slot.end}</span>
                        <span className="text-gray-500 ml-2">({slot.duration} min)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No availability set yet. <button onClick={() => navigate("/doctor/calendar")} className="text-yellow-600 hover:underline font-medium">Click here</button> to set your schedule.</p>
          )}
        </div>
      </div>
    </div>
  );
}
