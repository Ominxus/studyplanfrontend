import { useEffect, useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  RefreshCw,
  Search,
  AlertTriangle,
  Inbox,
  User,
  Activity,
  Clock,
  ShieldCheck
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/audit-logs`;

function getLanguage() {
  return localStorage.getItem("language") || "en";
}

const translations = {
  lt: {
    "Could not load audit logs.": "Nepavyko įkelti veiksmų žurnalo.",
    "Audit Logs": "Veiksmų žurnalas",
    "Admin Activity History": "Administratoriaus veiksmų istorija",
    "View important admin actions such as Excel exports, deleted study plans, approved edit requests, and denied edit requests.":
      "Peržiūrėkite svarbius administratoriaus veiksmus, tokius kaip Excel eksportavimas, ištrinti ugdymo planai, patvirtinti redagavimo prašymai ir atmesti redagavimo prašymai.",
    Refresh: "Atnaujinti",
    "Total Logs": "Iš viso įrašų",
    "Search by admin, action, or details":
      "Ieškoti pagal administratorių, veiksmą arba informaciją",
    "Loading audit logs...": "Įkeliamas veiksmų žurnalas...",
    "No audit logs found": "Veiksmų žurnalo įrašų nerasta",
    "Try changing your search.": "Pabandykite pakeisti paiešką.",
    Admin: "Administratorius",
    Action: "Veiksmas",
    Details: "Informacija",
    Time: "Laikas",
    Unknown: "Nežinoma",
    "No details provided": "Informacija nepateikta",

    EXPORT_EXCEL: "EXCEL EKSPORTAVIMAS",
    DELETE_STUDY_PLAN: "UGDYMO PLANO IŠTRYNIMAS",
    APPROVE_EDIT_REQUEST: "REDAGAVIMO PRAŠYMO PATVIRTINIMAS",
    DENY_EDIT_REQUEST: "REDAGAVIMO PRAŠYMO ATMETIMAS",
    CREATE_CATEGORY: "KATEGORIJOS SUKŪRIMAS",
    UPDATE_CATEGORY: "KATEGORIJOS ATNAUJINIMAS",
    DELETE_CATEGORY: "KATEGORIJOS IŠTRYNIMAS",
    CREATE_SUBJECT: "DALYKO SUKŪRIMAS",
    UPDATE_SUBJECT: "DALYKO ATNAUJINIMAS",
    DELETE_SUBJECT: "DALYKO IŠTRYNIMAS",
    CREATE_SCHOOL_YEAR: "MOKSLO METŲ SUKŪRIMAS",
    UPDATE_SCHOOL_YEAR: "MOKSLO METŲ ATNAUJINIMAS",
    DELETE_SCHOOL_YEAR: "MOKSLO METŲ IŠTRYNIMAS",
    UPDATE_MAINTENANCE: "PRIEŽIŪROS REŽIMO ATNAUJINIMAS"
  }
};

function t(text) {
  const language = getLanguage();

  if (language === "lt") {
    return translations.lt[text] || text;
  }

  return text;
}

function getActionText(action) {
  if (!action) return t("Unknown");

  return t(action) || action;
}

function formatDateTime(value) {
  if (!value) return t("Unknown");

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await axios.get(API_BASE_URL);

      setLogs(response.data || []);
      setError("");
    } catch (err) {
      console.error("Could not load audit logs:", err);
      setError(t("Could not load audit logs."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchText = search.toLowerCase();

    const adminText = log.username?.toLowerCase() || "";
    const actionText = log.action?.toLowerCase() || "";
    const detailsText = log.details?.toLowerCase() || "";

    return (
      adminText.includes(searchText) ||
      actionText.includes(searchText) ||
      detailsText.includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
                <ClipboardList size={18} />
                {t("Audit Logs")}
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                {t("Admin Activity History")}
              </h1>

              <p className="text-blue-50 mt-6 max-w-2xl text-lg">
                {t(
                  "View important admin actions such as Excel exports, deleted study plans, approved edit requests, and denied edit requests."
                )}
              </p>
            </div>

            <button
              onClick={fetchAuditLogs}
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
          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">
              {t("Total Logs")}
            </p>
            <h2 className="text-5xl font-black text-blue-700">
              {filteredLogs.length}
            </h2>
          </div>

          <div className="md:col-span-2 bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search by admin, action, or details")}
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-2xl bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
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
              {t("Loading audit logs...")}
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

        {!loading && !error && filteredLogs.length === 0 && (
          <div className="bg-white border-4 border-blue-100 p-10 rounded-[2rem] shadow-xl text-center text-slate-600">
            <Inbox size={42} className="mx-auto mb-3 text-blue-400" />
            <h3 className="text-xl font-black text-slate-800">
              {t("No audit logs found")}
            </h3>
            <p className="text-slate-500 mt-1">
              {t("Try changing your search.")}
            </p>
          </div>
        )}

        {!loading && !error && filteredLogs.length > 0 && (
          <div className="space-y-5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl p-6 md:p-7"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-300 text-blue-950 p-4 rounded-2xl">
                      <Activity size={28} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        {getActionText(log.action)}
                      </h2>

                      <p className="text-slate-600 font-semibold mt-2">
                        {log.details || t("No details provided")}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4 text-sm">
                        <span className="inline-flex items-center gap-1 bg-blue-50 border-2 border-blue-100 px-3 py-1 rounded-full font-bold text-slate-700">
                          <User size={14} />
                          {t("Admin")}: {log.username || t("Unknown")}
                        </span>

                        <span className="inline-flex items-center gap-1 bg-yellow-100 border-2 border-yellow-200 px-3 py-1 rounded-full font-bold text-slate-700">
                          <Clock size={14} />
                          {t("Time")}:{" "}
                          {formatDateTime(log.createdAt || log.timestamp)}
                        </span>

                        <span className="inline-flex items-center gap-1 bg-green-50 border-2 border-green-200 px-3 py-1 rounded-full font-bold text-green-700">
                          <ShieldCheck size={14} />
                          {t("Action")}: {getActionText(log.action)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 min-w-[180px] text-center">
                    <p className="text-xs font-black text-blue-700">
                      {t("Time")}
                    </p>
                    <p className="text-sm font-black text-blue-900 mt-2">
                      {formatDateTime(log.createdAt || log.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}