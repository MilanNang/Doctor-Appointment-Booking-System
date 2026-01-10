import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Search } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../Redux/toastSlice";

export default function BrowseDoctors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [allDoctors, setAllDoctors] = useState([]);
  const [filters, setFilters] = useState({
    specialty: "All Specialties",
    search: "",
  });

  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        console.log("Loaded doctors:", res.data);

        setAllDoctors(res.data);
      } catch (err) {
        console.log("Error loading doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  // FIX: Correct availability logic
  const checkAvailability = (availability) => {
    if (!availability) return false;

    return Object.values(availability).some(
      (day) => Array.isArray(day) && day.length > 0
    );
  };

  // FILTER DOCTORS
  const filteredDoctors = allDoctors.filter((doc) => {
    const doctorName = doc.user?.name?.toLowerCase() || "";
    const specialization = doc.specialization?.toLowerCase() || "";
    const searchText = filters.search.toLowerCase();

    return (
      (doctorName.includes(searchText) ||
        specialization.includes(searchText)) &&
      (filters.specialty === "All Specialties" ||
        specialization === filters.specialty.toLowerCase())
    );
  });

  // PAGINATION
  const doctorsToShow = filteredDoctors.slice(0, page * 6);

  const handleLoadMore = () => setPage(page + 1);

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Browse Doctors
      </h1>

      {/* Search Filters */}
      <div className="bg-white shadow rounded-xl p-4 flex gap-3 items-center">
        <div className="flex items-center flex-1 border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            className="w-full outline-none"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.specialty}
          onChange={(e) =>
            setFilters({ ...filters, specialty: e.target.value })
          }
        >
          <option>All Specialties</option>
          <option>General</option>
          <option>Cardiologist</option>
          <option>Dentist</option>
        </select>
      </div>

      <p className="mt-4 text-slate-600">
        {filteredDoctors.length} doctors found
      </p>

      {/* Doctor Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {doctorsToShow.map((doc) => {
          const isAvailable = checkAvailability(doc.availability);

          return (
            <div
              key={doc._id}
              className="bg-white rounded-2xl shadow-md p-6 border"
            >
              <div className="flex items-center gap-4">
                <img
                  src={doc.profileImage || "/default-doctor.png"}
                  alt="doctor"
                  className="w-20 h-20 rounded-full object-cover"
                />

                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {doc.user?.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {doc.specialization}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-3">
                Experience: {doc.experience} years
              </p>

              <div className="text-xl font-bold text-yellow-600 mt-3">
                ₹{doc.fees}
                <span className="text-sm text-slate-600 ml-1">
                  /consultation
                </span>
              </div>

              {/* FIXED: Show correct availability */}
              <div className="text-sm mt-1">
                {isAvailable ? "🟢 Available" : "🔴 Not Available"}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="px-4 py-2 border rounded-lg text-slate-700"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate(`/patient/calendar/${doc._id}`)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {doctorsToShow.length < filteredDoctors.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border-2 border-yellow-500 text-yellow-600 rounded-lg"
          >
            Load More Doctors
          </button>
        </div>
      )}
    </div>
  );
}
