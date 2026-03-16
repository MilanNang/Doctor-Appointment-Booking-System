import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FileText, Download, Calendar } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";

export default function MedicalHistory() {
  const dispatch = useDispatch();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/appointments/medical-history");
        setHistory(data || []);
      } catch (error) {
        dispatch(showToast({ message: error.response?.data?.message || "Failed to load medical history", type: "error" }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch]);

  const downloadPrescription = async (id) => {
    try {
      const response = await API.get(`/appointments/${id}/prescription/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Download failed", type: "error" }));
    }
  };

  const viewPrescription = async (id) => {
    try {
      const { data } = await API.get(`/appointments/${id}/prescription`);
      setSelectedPrescription(data);
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Prescription not found", type: "error" }));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading medical history...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Medical History Timeline</h1>

        {history.length === 0 && <p className="text-gray-600">No completed appointments yet.</p>}

        <div className="space-y-4">
          {history.map((item) => (
            <div key={item._id} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Dr. {item.doctor?.user?.name || "Doctor"}</p>
                  <p className="text-sm text-blue-700">{item.doctor?.specialization || "Specialist"}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{item.date} {item.time}</span>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">{item.status}</span>
              </div>

              {item.medicalReport && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p><strong>Diagnosis:</strong> {item.medicalReport.diagnosis || "N/A"}</p>
                  <p className="mt-2 whitespace-pre-wrap"><strong>Prescription:</strong> {item.medicalReport.prescription || "N/A"}</p>
                  {item.medicalReport.followUpDate && (
                    <p className="mt-2 text-blue-700"><strong>Follow-up:</strong> {new Date(item.medicalReport.followUpDate).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-1" onClick={() => viewPrescription(item._id)}>
                  <FileText className="w-4 h-4" /> View Prescription
                </button>
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1" onClick={() => downloadPrescription(item._id)}>
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>

              {item.review && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
                  Your rating: {item.review.rating}/5 {item.review.comment && `• ${item.review.comment}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl p-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-blue-900">Prescription (Version {selectedPrescription.version})</h3>
            <p className="mt-3 text-sm"><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
            <div className="mt-3">
              <p className="font-medium text-sm">Medicines</p>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {selectedPrescription.medicines?.map((m, index) => (
                  <li key={index}>{m.name} - {m.dosage}, {m.frequency}, {m.duration}</li>
                ))}
              </ul>
            </div>
            {selectedPrescription.advice && <p className="mt-3 text-sm"><strong>Advice:</strong> {selectedPrescription.advice}</p>}
            <div className="mt-4 text-right">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setSelectedPrescription(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
