import React, { useEffect, useState } from "react";
import API from "../util/api";
import { useSelector, useDispatch } from "react-redux";
import { setDoctorProfile } from "../../Redux/doctorSlice";
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
      const formData = new FormData();
      formData.append("name", doctor.name);
      formData.append("specialization", doctor.specialization);
      formData.append("hospital", doctor.hospital);
      formData.append("experience", doctor.experience);
      formData.append("fees", Number(doctor.fee));
      formData.append("contact", doctor.contact);
      formData.append("about", doctor.about);
      formData.append("availability", JSON.stringify(doctor.availability));
      if (doctor.profileImage instanceof File) {
        formData.append("profileImage", doctor.profileImage);
      }

      const { data } = await API.post("/doctors/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDoctor({ ...doctor, ...data.doctor, fee: data.doctor.fees });
      setPreviewImage(data.doctor.profileImage || "");
      dispatch(setDoctorProfile(data.doctor));
      setEditMode(false);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center text-gray-500 py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-yellow-100 px-6 py-8">
      {/* HEADER */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Doctor Profile</h1>
        <button
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          {editMode ? (saving ? "Saving..." : "Save Profile") : "Edit Profile"}
        </button>
      </header>

      {/* PROFILE IMAGE & INFO */}
      <section className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-gray-400 overflow-hidden">
          {previewImage && (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          )}
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-yellow-500 text-white rounded-full p-1 cursor-pointer text-xs">
              📷
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {editMode ? (
            <>
              <input
                placeholder="Full Name"
                value={doctor.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Specialization"
                value={doctor.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Clinic / Hospital"
                value={doctor.hospital}
                onChange={(e) => handleChange("hospital", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Experience (Years)"
                type="number"
                value={doctor.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
              <input
                placeholder="Contact / Address"
                value={doctor.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Consultation Fee"
                value={doctor.fee}
                onChange={(e) => handleChange("fee", e.target.value)}
                className="block w-full border rounded px-3 py-2"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{doctor.name}</h2>
              <p className="text-yellow-600 font-medium">{doctor.specialization}</p>
              <p className="text-slate-500">{doctor.hospital}</p>
              <p className="text-slate-500">Experience: {doctor.experience} years</p>
              <p className="text-slate-500">Contact: {doctor.contact}</p>
              <p className="text-yellow-600 font-bold text-xl">₹{doctor.fee} per session</p>
            </>
          )}
        </div>

        {/* BUTTON TO SET AVAILABILITY */}
        {!editMode && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/doctor/calendar")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Set Availability
            </button>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="max-w-5xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">About Me</h3>
        {editMode ? (
          <textarea
            placeholder="Write something about yourself"
            value={doctor.about}
            onChange={(e) => handleChange("about", e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows="4"
          />
        ) : (
          <p className="text-slate-600">{doctor.about}</p>
        )}
      </section>

      {/* WEEKLY AVAILABILITY VIEW */}
     <section className="max-w-5xl mx-auto mt-6 bg-white rounded-lg shadow-sm p-6">
  <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
  {doctor.availability && Object.keys(doctor.availability).length > 0 ? (
    <div className="space-y-3">
      {Object.entries(doctor.availability).map(([day, slots]) => (
        <div key={day}>
          <h4 className="font-semibold text-yellow-700">{day}</h4>
          <ul className="pl-4 mt-1 space-y-1">
            {slots.map((slot, i) => (
              <li key={i} className="text-gray-600 border-l-4 border-yellow-400 pl-3">
                {slot.start} – {slot.end} ({slot.duration} min)
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No availability set yet.</p>
  )}
</section>
    </div>
  );
}
