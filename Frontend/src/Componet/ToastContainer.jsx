import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../Redux/toastSlice";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer() {
  const notifications = useSelector((state) => state.toast.notifications);
  const dispatch = useDispatch();

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "error":
        return <AlertCircle size={20} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] space-y-3 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${getBgColor(
            notif.type
          )}`}
        >
          <div className="flex-shrink-0 pt-0.5">{getIcon(notif.type)}</div>

          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor(notif.type)}`}>
              {notif.message}
            </p>
          </div>

          <button
            onClick={() => dispatch(removeToast(notif.id))}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
