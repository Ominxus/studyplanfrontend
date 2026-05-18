import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MaintenancePage({ status }) {
  return (
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-blue-50 via-white to-yellow-100 flex items-center justify-center px-6 py-12 font-['Inter']">
      <div className="max-w-3xl w-full bg-white border-4 border-yellow-300 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center bg-yellow-300 text-blue-950 p-5 rounded-[2rem] mb-8 shadow-lg">
          <AlertTriangle size={46} />
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
          {status?.title || "Website is under maintenance"}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-600 font-semibold leading-relaxed">
          {status?.message ||
            "The study plan system is currently being updated. Please come back later."}
        </p>

        <div className="mt-10 bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 text-blue-800 font-bold">
          Students cannot submit, update, or request edit permission while
          maintenance mode is active.
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg"
        >
          <RefreshCw size={18} />
          Refresh Page
        </button>
      </div>
    </div>
  );
}