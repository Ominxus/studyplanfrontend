import { useEffect, useState } from "react";
import axios from "axios";
import {
  KeyRound,
  RefreshCw,
  AlertTriangle,
  Inbox,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Save
} from "lucide-react";

const PASSWORD_RESET_API = `${import.meta.env.VITE_API_BASE_URL}/api/password-reset`;

function getLanguage() {
  return localStorage.getItem("language") || "en";
}

const translations = {
  lt: {
    "Password Reset Requests": "Slaptažodžio atstatymo prašymai",
    "Admin Password Reset": "Administratoriaus slaptažodžio atstatymas",
    "View password reset requests from students and set a new password for their account.":
      "Peržiūrėkite mokinių slaptažodžio atstatymo prašymus ir nustatykite naują slaptažodį jų paskyrai.",
    Refresh: "Atnaujinti",
    "Pending Requests": "Laukiantys prašymai",
    "Loading password reset requests...": "Įkeliami slaptažodžio atstatymo prašymai...",
    "No password reset requests found": "Slaptažodžio atstatymo prašymų nerasta",
    "When students request a password reset, they will appear here.":
      "Kai mokiniai pateiks slaptažodžio atstatymo prašymą, jie bus rodomi čia.",
    Username: "Vartotojo vardas",
    "Requested At": "Prašymo laikas",
    "New password": "Naujas slaptažodis",
    "Confirm new password": "Patvirtinti naują slaptažodį",
    "Complete Reset": "Atstatyti slaptažodį",
    Deny: "Atmesti",
    "New password is required.": "Naujas slaptažodis yra privalomas.",
    "Passwords do not match.": "Slaptažodžiai nesutampa.",
    "Password must be at least 8 characters long.":
      "Slaptažodis turi būti bent 8 simbolių.",
    "Password must contain at least one capital letter.":
      "Slaptažodyje turi būti bent viena didžioji raidė.",
    "Password must contain at least one special character.":
      "Slaptažodyje turi būti bent vienas specialus simbolis.",
    "Admin-set temporary passwords are securely hashed and emailed to the student. The student must change the password after logging in.": "Administratoriaus nustatyti laikini slaptažodžiai yra saugiai užšifruojami ir išsiunčiami mokiniui el. paštu. Prisijungęs mokinys privalo pakeisti slaptažodį.",
    "Password reset request denied.": "Slaptažodžio atstatymo prašymas atmestas.",
    "Could not load password reset requests.":
      "Nepavyko įkelti slaptažodžio atstatymo prašymų.",
    "Could not complete password reset.":
      "Nepavyko atstatyti slaptažodžio.",
    "Could not deny password reset request.":
      "Nepavyko atmesti slaptažodžio atstatymo prašymo.",
    "Deny this password reset request?":
      "Ar atmesti šį slaptažodžio atstatymo prašymą?",
    "Password requirements:":
      "Slaptažodžio reikalavimai:",
    "At least 8 characters": "Bent 8 simboliai",
    "At least 1 capital letter": "Bent 1 didžioji raidė",
    "At least 1 special character": "Bent 1 specialus simbolis"
  }
};

function t(text) {
  const language = getLanguage();

  if (language === "lt") {
    return translations.lt[text] || text;
  }

  return text;
}

function getErrorMessage(error, fallback) {
  if (error.response?.data) {
    return typeof error.response.data === "string"
      ? error.response.data
      : error.response.data.message || JSON.stringify(error.response.data);
  }

  return fallback;
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function PasswordResetRequests() {
  const [requests, setRequests] = useState([]);
  const [passwordsByRequest, setPasswordsByRequest] = useState({});
  const [confirmPasswordsByRequest, setConfirmPasswordsByRequest] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await axios.get(`${PASSWORD_RESET_API}/requests`);

      setRequests(response.data || []);
      setError("");
    } catch (error) {
      console.error("Could not load password reset requests:", error);
      setError(t("Could not load password reset requests."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const validatePassword = (password, confirmPassword) => {
    if (!password.trim()) {
      return t("New password is required.");
    }

    if (password.length < 8) {
      return t("Password must be at least 8 characters long.");
    }

    if (!/[A-Z]/.test(password)) {
      return t("Password must contain at least one capital letter.");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return t("Password must contain at least one special character.");
    }

    if (password !== confirmPassword) {
      return t("Passwords do not match.");
    }

    return "";
  };

  const completeReset = async (requestId) => {
    const newPassword = passwordsByRequest[requestId] || "";
    const confirmPassword = confirmPasswordsByRequest[requestId] || "";

    const validationError = validatePassword(newPassword, confirmPassword);

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const response = await axios.post(
        `${PASSWORD_RESET_API}/complete/${requestId}`,
        {
          newPassword
        }
      );

      alert(response.data || t("Admin-set temporary passwords are securely hashed and emailed to the student. The student must change the password after logging in."));

      setPasswordsByRequest((prev) => ({
        ...prev,
        [requestId]: ""
      }));

      setConfirmPasswordsByRequest((prev) => ({
        ...prev,
        [requestId]: ""
      }));

      fetchRequests();
    } catch (error) {
      console.error("Password reset failed:", error);
      alert(getErrorMessage(error, t("Could not complete password reset.")));
    }
  };

  const denyReset = async (requestId) => {
    if (!confirm(t("Deny this password reset request?"))) return;

    try {
      const response = await axios.post(`${PASSWORD_RESET_API}/deny/${requestId}`);

      alert(response.data || t("Password reset request denied."));
      fetchRequests();
    } catch (error) {
      console.error("Deny password reset failed:", error);
      alert(getErrorMessage(error, t("Could not deny password reset request.")));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
                <KeyRound size={18} />
                {t("Password Reset Requests")}
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                {t("Admin Password Reset")}
              </h1>

              <p className="text-blue-50 mt-6 max-w-2xl text-lg">
                {t(
                  "View password reset requests from students and set a new password for their account."
                )}
              </p>
            </div>

            <button
              onClick={fetchRequests}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-5 py-4 rounded-2xl hover:bg-blue-50 transition font-black shadow-lg"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              {t("Refresh")}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border-4 border-yellow-300 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">
              {t("Pending Requests")}
            </p>
            <h2 className="text-5xl font-black text-yellow-700">
              {requests.length}
            </h2>
          </div>

          <div className="md:col-span-2 bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="font-black text-slate-800 mb-2">
              {t("Password requirements:")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-bold text-slate-600">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3">
                {t("At least 8 characters")}
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3">
                {t("At least 1 capital letter")}
              </div>
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3">
                {t("At least 1 special character")}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white border-4 border-blue-100 p-10 rounded-[2rem] shadow-xl text-center">
            <RefreshCw
              size={32}
              className="animate-spin mx-auto mb-3 text-blue-600"
            />
            <p className="font-black text-slate-700">
              {t("Loading password reset requests...")}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-4 border-red-200 text-red-700 p-6 rounded-[2rem] mb-8 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} />
              <span className="font-black">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="bg-white border-4 border-blue-100 p-10 rounded-[2rem] shadow-xl text-center text-slate-600">
            <Inbox size={42} className="mx-auto mb-3 text-blue-400" />
            <h3 className="text-xl font-black text-slate-800">
              {t("No password reset requests found")}
            </h3>
            <p className="text-slate-500 mt-1">
              {t(
                "When students request a password reset, they will appear here."
              )}
            </p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl p-6 md:p-7"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-300 text-blue-950 p-4 rounded-2xl">
                      <User size={28} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        {request.username}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm">
                        <span className="inline-flex items-center gap-1 bg-blue-50 border-2 border-blue-100 px-3 py-1 rounded-full font-bold text-slate-700">
                          <User size={14} />
                          {t("Username")}: {request.username}
                        </span>

                        <span className="inline-flex items-center gap-1 bg-yellow-100 border-2 border-yellow-200 px-3 py-1 rounded-full font-bold text-slate-700">
                          <Clock size={14} />
                          {t("Requested At")}:{" "}
                          {formatDateTime(request.requestedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="password"
                        placeholder={t("New password")}
                        value={passwordsByRequest[request.id] || ""}
                        onChange={(e) =>
                          setPasswordsByRequest({
                            ...passwordsByRequest,
                            [request.id]: e.target.value
                          })
                        }
                        className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
                      />

                      <input
                        type="password"
                        placeholder={t("Confirm new password")}
                        value={confirmPasswordsByRequest[request.id] || ""}
                        onChange={(e) =>
                          setConfirmPasswordsByRequest({
                            ...confirmPasswordsByRequest,
                            [request.id]: e.target.value
                          })
                        }
                        className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => completeReset(request.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-4 rounded-2xl font-black hover:bg-green-700 transition"
                      >
                        <Save size={18} />
                        {t("Complete Reset")}
                      </button>

                      <button
                        onClick={() => denyReset(request.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-4 rounded-2xl font-black hover:bg-red-700 transition"
                      >
                        <XCircle size={18} />
                        {t("Deny")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="mt-8 bg-green-50 border-4 border-green-200 text-green-800 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle size={22} />
              <p className="font-black">
                Admin-set passwords are saved securely using BCrypt hashing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}