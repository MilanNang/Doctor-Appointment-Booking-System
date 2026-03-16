import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Calendar, CheckCircle2, Clock3, FileText, Loader2, Stethoscope, XCircle } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";
import { getSocket } from "../../utils/socket";
import ConfirmDialog from "../../Componet/ConfirmDialog";

const FLOW = ["pending", "approved", "arrived", "consultation-started", "consultation-completed"];

const emptyMedicine = () => ({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
const emptyNotes = { symptomsObserved: "", clinicalObservations: "", suggestedTests: "", internalRemarks: "" };

export default function DoctorBookings() {
  const dispatch = useDispatch();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [prescription, setPrescription] = useState({ diagnosis: "", medicines: [emptyMedicine()], advice: "", followUpDate: "" });
  const [doctorNotes, setDoctorNotes] = useState(emptyNotes);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, appointmentId: null, action: null, endpoint: null });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/appointments/doctor");
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Failed to load appointments", type: "error" }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchBookings();
    const socket = getSocket();
    socket.on("appointmentStatusUpdate", fetchBookings);
    return () => socket.off("appointmentStatusUpdate", fetchBookings);
  }, [fetchBookings]);

  const grouped = useMemo(() => {
    return bookings.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [bookings]);

  const statusPill = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-blue-100 text-blue-700",
      arrived: "bg-cyan-100 text-cyan-700",
      "consultation-started": "bg-indigo-100 text-indigo-700",
      "consultation-completed": "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
      "no-show": "bg-orange-100 text-orange-700"
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const timeline = (status) => {
    const index = FLOW.indexOf(status);
    return (
      <div className="flex items-center gap-1 mt-3 overflow-x-auto">
        {FLOW.map((item, idx) => (
          <div key={item} className="flex items-center gap-1">
            <span className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${idx <= index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {item.replaceAll("-", " ")}
            </span>
            {idx < FLOW.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>
    );
  };

  const openClinical = async (appointment) => {
    setSelected(appointment);

    try {
      const [presRes, noteRes] = await Promise.allSettled([
        API.get(`/appointments/${appointment._id}/prescription`),
        API.get(`/appointments/${appointment._id}/notes`)
      ]);

      if (presRes.status === "fulfilled") {
        const p = presRes.value.data;
        setPrescription({
          diagnosis: p.diagnosis || "",
          medicines: p.medicines?.length ? p.medicines : [emptyMedicine()],
          advice: p.advice || "",
          followUpDate: p.followUpDate ? p.followUpDate.slice(0, 10) : ""
        });
      } else {
        setPrescription({ diagnosis: "", medicines: [emptyMedicine()], advice: "", followUpDate: "" });
      }

      if (noteRes.status === "fulfilled") {
        const n = noteRes.value.data;
        setDoctorNotes({
          symptomsObserved: n.symptomsObserved || "",
          clinicalObservations: n.clinicalObservations || "",
          suggestedTests: n.suggestedTests || "",
          internalRemarks: n.internalRemarks || ""
        });
      } else {
        setDoctorNotes(emptyNotes);
      }
    } catch {
      setPrescription({ diagnosis: "", medicines: [emptyMedicine()], advice: "", followUpDate: "" });
      setDoctorNotes(emptyNotes);
    }
  };

  const askAction = (appointmentId, action, endpoint) => {
    setConfirmDialog({ isOpen: true, appointmentId, action, endpoint });
  };

  const executeAction = async () => {
    const { appointmentId, endpoint, action } = confirmDialog;
    try {
      setActionLoading({ id: appointmentId, type: action });
      await API.put(endpoint);
      dispatch(showToast({ message: `${action} successful`, type: "success" }));
      await fetchBookings();
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Action failed", type: "error" }));
    } finally {
      setActionLoading({ id: null, type: null });
      setConfirmDialog({ isOpen: false, appointmentId: null, action: null, endpoint: null });
    }
  };

  const saveClinicalData = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await API.post(`/appointments/${selected._id}/prescription`, prescription);
      await API.post(`/appointments/${selected._id}/notes`, doctorNotes);
      dispatch(showToast({ message: "Clinical data saved", type: "success" }));
      await fetchBookings();
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Failed to save clinical data", type: "error" }));
    } finally {
      setSaving(false);
    }
  };

  const addMedicine = () => setPrescription((prev) => ({ ...prev, medicines: [...prev.medicines, emptyMedicine()] }));
  const removeMedicine = (index) => setPrescription((prev) => ({ ...prev, medicines: prev.medicines.filter((_, idx) => idx !== index) }));
  const updateMedicine = (index, key, value) => {
    setPrescription((prev) => ({
      ...prev,
      medicines: prev.medicines.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Doctor Appointments</h1>
        <p className="text-sm sm:text-base text-blue-700 mt-1">Status flow: Pending → Approved → Arrived → Consultation Started → Consultation Completed</p>

        {bookings.length === 0 && (
          <div className="mt-6 bg-white border border-blue-100 rounded-2xl p-8 text-center">
            <p className="text-blue-900 font-semibold">No appointments yet</p>
            <p className="text-blue-600 text-sm mt-1">New patient bookings will appear here automatically.</p>
          </div>
        )}

        {Object.keys(grouped).sort().map((dateKey) => (
          <section key={dateKey} className="mt-6">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
              <Calendar className="w-5 h-5" /> {new Date(dateKey).toDateString()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[dateKey].map((item) => (
                <div key={item._id} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.patient?.name}</p>
                      <p className="text-sm text-gray-600">{item.patient?.email}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full capitalize ${statusPill(item.status)}`}>{item.status}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1"><Clock3 className="w-4 h-4" />{item.time}</div>
                    <button className="text-blue-700 text-sm font-medium" onClick={() => openClinical(item)}>Clinical</button>
                  </div>

                  {item.review && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                      Patient rating: {item.review.rating}/5 {item.review.comment ? `• ${item.review.comment}` : ""}
                    </div>
                  )}

                  {timeline(item.status)}

                  <div className="flex gap-2 mt-4 flex-wrap">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => askAction(item._id, "Approve", `/appointments/${item._id}`)}
                          disabled={actionLoading.id === item._id}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
                        >Approve</button>
                        <button
                          onClick={() => askAction(item._id, "Reject", `/appointments/${item._id}`)}
                          disabled={actionLoading.id === item._id}
                          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm"
                        >Reject</button>
                      </>
                    )}

                    {item.status === "arrived" && (
                      <button
                        onClick={() => askAction(item._id, "Start Consultation", `/appointments/${item._id}/start-consultation`)}
                        disabled={actionLoading.id === item._id}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                      >Start Consultation</button>
                    )}

                    {item.status === "consultation-started" && (
                      <button
                        onClick={() => askAction(item._id, "Complete Consultation", `/appointments/${item._id}/complete-consultation`)}
                        disabled={actionLoading.id === item._id}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
                      >Complete Consultation</button>
                    )}

                    {item.status === "approved" && (
                      <button
                        onClick={() => askAction(item._id, "Mark No-show", `/appointments/${item._id}`)}
                        disabled={actionLoading.id === item._id}
                        className="px-3 py-2 rounded-lg bg-orange-100 text-orange-700 text-sm"
                      >No-show</button>
                    )}

                    {item.status === "consultation-completed" && (
                      <span className="px-3 py-2 text-xs rounded-lg bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-blue-900 flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Clinical Documentation</h2>
              <button className="text-gray-500" onClick={() => setSelected(null)}><XCircle className="w-5 h-5" /></button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-blue-800">Prescription</h3>
                <textarea className="w-full border rounded-lg p-2" placeholder="Diagnosis (min 10 chars)" value={prescription.diagnosis} onChange={(e) => setPrescription((prev) => ({ ...prev, diagnosis: e.target.value }))} />

                {prescription.medicines.map((med, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2 bg-blue-50/50">
                    <input className="w-full border rounded p-2" placeholder="Medicine Name" value={med.name} onChange={(e) => updateMedicine(index, "name", e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="w-full border rounded p-2" placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={(e) => updateMedicine(index, "dosage", e.target.value)} />
                      <input className="w-full border rounded p-2" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedicine(index, "frequency", e.target.value)} />
                    </div>
                    <input className="w-full border rounded p-2" placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(index, "duration", e.target.value)} />
                    <input className="w-full border rounded p-2" placeholder="Instructions (optional)" value={med.instructions} onChange={(e) => updateMedicine(index, "instructions", e.target.value)} />
                    {prescription.medicines.length > 1 && (
                      <button className="text-xs text-red-600" onClick={() => removeMedicine(index)}>Remove medicine</button>
                    )}
                  </div>
                ))}

                <button className="text-sm text-blue-700" onClick={addMedicine}>+ Add medicine</button>
                <textarea className="w-full border rounded-lg p-2" placeholder="General advice (optional)" value={prescription.advice} onChange={(e) => setPrescription((prev) => ({ ...prev, advice: e.target.value }))} />
                <input type="date" className="w-full border rounded-lg p-2" value={prescription.followUpDate} onChange={(e) => setPrescription((prev) => ({ ...prev, followUpDate: e.target.value }))} />
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-blue-800">Private Daily Notes (Doctor Only)</h3>
                <textarea className="w-full border rounded-lg p-2" placeholder="Symptoms observed" value={doctorNotes.symptomsObserved} onChange={(e) => setDoctorNotes((prev) => ({ ...prev, symptomsObserved: e.target.value }))} />
                <textarea className="w-full border rounded-lg p-2" placeholder="Clinical observations" value={doctorNotes.clinicalObservations} onChange={(e) => setDoctorNotes((prev) => ({ ...prev, clinicalObservations: e.target.value }))} />
                <textarea className="w-full border rounded-lg p-2" placeholder="Suggested tests" value={doctorNotes.suggestedTests} onChange={(e) => setDoctorNotes((prev) => ({ ...prev, suggestedTests: e.target.value }))} />
                <textarea className="w-full border rounded-lg p-2" placeholder="Internal remarks" value={doctorNotes.internalRemarks} onChange={(e) => setDoctorNotes((prev) => ({ ...prev, internalRemarks: e.target.value }))} />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setSelected(null)}>Close</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2" disabled={saving} onClick={saveClinicalData}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Save Clinical Data
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action || "Confirm"}
        message={`Are you sure you want to ${String(confirmDialog.action || "").toLowerCase()}?`}
        confirmText={confirmDialog.action || "Confirm"}
        backdropClassName="bg-blue-900/20 backdrop-blur-sm"
        isDangerous={["Reject", "Mark No-show"].includes(confirmDialog.action)}
        onConfirm={async () => {
          if (!confirmDialog.endpoint) return;
          if (confirmDialog.endpoint.endsWith("/appointments/" + confirmDialog.appointmentId)) {
            const statusMap = {
              Approve: "approved",
              Reject: "rejected",
              "Mark No-show": "no-show"
            };
            try {
              setActionLoading({ id: confirmDialog.appointmentId, type: confirmDialog.action });
              await API.put(`/appointments/${confirmDialog.appointmentId}`, { status: statusMap[confirmDialog.action] });
              await fetchBookings();
              dispatch(showToast({ message: `${confirmDialog.action} successful`, type: "success" }));
            } catch (error) {
              dispatch(showToast({ message: error.response?.data?.message || "Action failed", type: "error" }));
            } finally {
              setActionLoading({ id: null, type: null });
              setConfirmDialog({ isOpen: false, appointmentId: null, action: null, endpoint: null });
            }
            return;
          }
          executeAction();
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, appointmentId: null, action: null, endpoint: null })}
      />
    </div>
  );
}
