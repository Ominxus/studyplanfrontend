import { AlertTriangle, RefreshCw } from "lucide-react";

function getLanguage() {
  return localStorage.getItem("language") || "en";
}

const translations = {
  lt: {
    "Website is under maintenance": "Svetainė laikinai prižiūrima",
    "The study plan system is currently being updated. Please come back later.":
      "Ugdymo plano sistema šiuo metu atnaujinama. Prašome sugrįžti vėliau.",
    "Students cannot submit, update, or request edit permission while maintenance mode is active.":
      "Kol įjungtas priežiūros režimas, mokiniai negali pateikti, atnaujinti ar prašyti redagavimo leidimo.",
    "Refresh Page": "Atnaujinti puslapį"
  }
};

function t(text) {
  const language = getLanguage();

  if (language === "lt") {
    return translations.lt[text] || text;
  }

  return text;
}

export default function MaintenancePage({ status }) {
  const defaultTitle = "Website is under maintenance";
  const defaultMessage =
    "The study plan system is currently being updated. Please come back later.";

  const title = status?.title || defaultTitle;
  const message = status?.message || defaultMessage;

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-blue-50 via-white to-yellow-100 flex items-center justify-center px-6 py-12 font-['Inter']">
      <div className="max-w-3xl w-full bg-white border-4 border-yellow-300 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center bg-yellow-300 text-blue-950 p-5 rounded-[2rem] mb-8 shadow-lg">
          <AlertTriangle size={46} />
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
          {t(title)}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-600 font-semibold leading-relaxed">
          {t(message)}
        </p>

        <div className="mt-10 bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 text-blue-800 font-bold">
          {t(
            "Students cannot submit, update, or request edit permission while maintenance mode is active."
          )}
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg"
        >
          <RefreshCw size={18} />
          {t("Refresh Page")}
        </button>
      </div>
    </div>
  );
}