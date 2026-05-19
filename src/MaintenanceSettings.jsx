import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck
} from "lucide-react";

const MAINTENANCE_API = `${import.meta.env.VITE_API_BASE_URL}/api/maintenance/status`;

function getLanguage() {
  return localStorage.getItem("language") || "en";
}

const translations = {
  lt: {
    "Website is under maintenance": "Svetainė laikinai prižiūrima",
    "The study plan system is currently being updated. Please come back later.":
      "Ugdymo plano sistema šiuo metu atnaujinama. Prašome sugrįžti vėliau.",

    "Maintenance title is required.": "Priežiūros puslapio pavadinimas yra privalomas.",
    "Maintenance message is required.": "Priežiūros žinutė yra privaloma.",
    "Maintenance mode enabled.": "Priežiūros režimas įjungtas.",
    "Maintenance mode disabled.": "Priežiūros režimas išjungtas.",
    "Could not update maintenance mode.": "Nepavyko atnaujinti priežiūros režimo.",

    "Admin Maintenance Control": "Administratoriaus priežiūros valdymas",
    "Maintenance Mode.": "Priežiūros režimas.",
    "Turn maintenance mode on or off. When enabled, students will only see the maintenance page and student actions will be blocked.":
      "Įjunkite arba išjunkite priežiūros režimą. Kai jis įjungtas, mokiniai matys tik priežiūros puslapį, o mokinių veiksmai bus blokuojami.",

    "Maintenance mode is currently ON": "Priežiūros režimas šiuo metu ĮJUNGTAS",
    "Maintenance mode is currently OFF": "Priežiūros režimas šiuo metu IŠJUNGTAS",
    "Students are blocked from using the study plan form.":
      "Mokiniams neleidžiama naudotis ugdymo plano forma.",
    "Students can use the system normally.":
      "Mokiniai gali naudotis sistema įprastai.",

    "Maintenance Settings": "Priežiūros nustatymai",
    "This message will be shown to students while maintenance mode is active.":
      "Ši žinutė bus rodoma mokiniams, kai priežiūros režimas bus įjungtas.",
    "Enable maintenance mode": "Įjungti priežiūros režimą",
    "Maintenance Page Title": "Priežiūros puslapio pavadinimas",
    "Maintenance Message": "Priežiūros žinutė",
    "Saving...": "Išsaugoma...",
    "Save Maintenance Settings": "Išsaugoti priežiūros nustatymus"
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

export default function MaintenanceSettings({ maintenanceStatus, onRefresh }) {
  const [formData, setFormData] = useState({
    enabled: false,
    title: "Website is under maintenance",
    message:
      "The study plan system is currently being updated. Please come back later."
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (maintenanceStatus) {
      setFormData({
        enabled: Boolean(maintenanceStatus.enabled),
        title: maintenanceStatus.title || "Website is under maintenance",
        message:
          maintenanceStatus.message ||
          "The study plan system is currently being updated. Please come back later."
      });
    }
  }, [maintenanceStatus]);

  const saveMaintenanceStatus = async () => {
    if (!formData.title.trim()) {
      alert(t("Maintenance title is required."));
      return;
    }

    if (!formData.message.trim()) {
      alert(t("Maintenance message is required."));
      return;
    }

    try {
      setLoading(true);

      await axios.put(MAINTENANCE_API, {
        enabled: formData.enabled,
        title: formData.title,
        message: formData.message
      });

      alert(
        formData.enabled
          ? t("Maintenance mode enabled.")
          : t("Maintenance mode disabled.")
      );

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Could not update maintenance mode:", error);
      alert(getErrorMessage(error, t("Could not update maintenance mode.")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-5xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
              <Settings size={18} />
              {t("Admin Maintenance Control")}
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              {t("Maintenance Mode.")}
            </h1>

            <p className="mt-6 text-blue-50 text-lg max-w-3xl">
              {t(
                "Turn maintenance mode on or off. When enabled, students will only see the maintenance page and student actions will be blocked."
              )}
            </p>
          </div>
        </section>

        <div
          className={`border-4 rounded-[2rem] shadow-xl p-6 md:p-8 mb-8 ${
            formData.enabled
              ? "bg-yellow-100 border-yellow-300 text-yellow-900"
              : "bg-green-100 border-green-300 text-green-900"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl">
              {formData.enabled ? (
                <AlertTriangle size={26} />
              ) : (
                <CheckCircle size={26} />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {formData.enabled
                  ? t("Maintenance mode is currently ON")
                  : t("Maintenance mode is currently OFF")}
              </h2>
              <p className="text-sm font-bold mt-1">
                {formData.enabled
                  ? t("Students are blocked from using the study plan form.")
                  : t("Students can use the system normally.")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl p-7 md:p-9">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 text-white p-3 rounded-2xl">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900">
                {t("Maintenance Settings")}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {t(
                  "This message will be shown to students while maintenance mode is active."
                )}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-4 bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  enabled: e.target.checked
                })
              }
              className="w-5 h-5 accent-blue-600"
            />

            <span className="font-black text-slate-800">
              {t("Enable maintenance mode")}
            </span>
          </label>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                {t("Maintenance Page Title")}
              </label>

              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value
                  })
                }
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                {t("Maintenance Message")}
              </label>

              <textarea
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value
                  })
                }
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="button"
              onClick={saveMaintenanceStatus}
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 p-5 rounded-[2rem] font-black text-lg transition shadow-xl ${
                loading
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading
                ? t("Saving...")
                : t("Save Maintenance Settings")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}