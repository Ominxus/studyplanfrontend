import { useEffect, useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertTriangle,
  Inbox,
  Sparkles
} from "lucide-react";

const AUDIT_LOGS_API = `${import.meta.env.VITE_API_BASE_URL}/api/audit-logs`;

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await axios.get(AUDIT_LOGS_API);

      setAuditLogs(response.data || []);
      setError("");
    } catch (error) {
      console.error("Could not load audit logs:", error);
      setError("Could not load audit logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Unknown time";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const getActionLabel = (action) => {
    if (!action) return "UNKNOWN";

    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const searchText = auditSearch.toLowerCase();

    return (
      log.username?.toLowerCase().includes(searchText) ||
      log.role?.toLowerCase().includes(searchText) ||
      log.action?.toLowerCase().includes(searchText) ||
      log.details?.toLowerCase().includes(searchText)
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
                <Sparkles size={18} />
                Security Records
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                Audit Logs.
              </h1>

              <p className="text-blue-50 mt-6 max-w-2xl text-lg">
                View important admin actions such as edit approvals, denials,
                deletions, exports, and study plan configuration changes.
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
              Refresh
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Total Logs</p>
            <h2 className="text-5xl font-black text-blue-700">
              {auditLogs.length}
            </h2>
          </div>

          <div className="bg-white border-4 border-yellow-300 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Shown Results</p>
            <h2 className="text-5xl font-black text-yellow-700">
              {filteredAuditLogs.length}
            </h2>
          </div>

          <div className="bg-white border-4 border-blue-300 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Limit</p>
            <h2 className="text-5xl font-black text-blue-700">100</h2>
          </div>
        </div>

        <div className="bg-white border-4 border-blue-300 p-6 md:p-8 rounded-[2rem] shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-2xl">
                <ClipboardList size={24} />
              </div>

              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Security History
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Latest 100 audit log records from the database.
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-96">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit logs"
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-2xl bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {loading && (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-8 text-center">
              <RefreshCw
                size={30}
                className="animate-spin mx-auto mb-3 text-blue-600"
              />
              <p className="font-black text-slate-700">
                Loading audit logs...
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

          {!loading && !error && filteredAuditLogs.length === 0 && (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-8 text-center text-slate-600">
              <Inbox size={42} className="mx-auto mb-3 text-blue-400" />
              <h3 className="text-xl font-black text-slate-800">
                No audit logs found
              </h3>
              <p className="text-slate-500 mt-1">
                Try changing your search text.
              </p>
            </div>
          )}

          {!loading && !error && filteredAuditLogs.length > 0 && (
            <div className="overflow-x-auto rounded-[1.5rem] border-2 border-blue-100">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white uppercase text-xs tracking-wide">
                  <tr>
                    <th className="p-4 text-left">Time</th>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-center">Role</th>
                    <th className="p-4 text-left">Action</th>
                    <th className="p-4 text-left">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAuditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b-2 border-blue-50 bg-white hover:bg-blue-50 transition"
                    >
                      <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-200 px-3 py-1 rounded-full font-black text-slate-800">
                          <ShieldCheck size={14} />
                          {log.username || "Unknown"}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-100 border-2 border-blue-200 text-blue-700 px-3 py-1 rounded-full font-black">
                          {log.role || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                        {getActionLabel(log.action)}
                      </td>

                      <td className="p-4 font-semibold text-slate-600 min-w-[320px]">
                        {log.details || "No details"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}