import { useEffect, useState } from "react";
import {
  Clock3,
  Coffee,
  Save,
  Settings2,
  SunMedium,
  TimerReset
} from "lucide-react";

import {
  getPreferences,
  updatePreferences
} from "./services/preferenceService";
import DurationInput from "./components/DurationInput";

export default function MyPreferences() {
  const [form, setForm] = useState({
    preferredSessionMinutes: 60,
    maximumSessionMinutes: 90,
    breakMinutes: 15,
    preferredStudyPeriod: "ANY",
    maximumDailyMinutes: 180
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPreferences();

      setForm({
        preferredSessionMinutes:
          data.preferredSessionMinutes,
        maximumSessionMinutes:
          data.maximumSessionMinutes,
        breakMinutes:
          data.breakMinutes,
        preferredStudyPeriod:
          data.preferredStudyPeriod,
        maximumDailyMinutes:
          data.maximumDailyMinutes
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load your preferences."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "preferredStudyPeriod"
          ? value
          : Number(value)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      form.preferredSessionMinutes <= 0 ||
      form.maximumSessionMinutes <= 0 ||
      form.breakMinutes <= 0 ||
      form.maximumDailyMinutes <= 0
    ) {
      setError(
        "All time values must be greater than zero."
      );
      return;
    }

    if (
      form.maximumSessionMinutes <
      form.preferredSessionMinutes
    ) {
      setError(
        "Maximum session length cannot be shorter than preferred session length."
      );
      return;
    }

    if (
      form.maximumDailyMinutes <
      form.preferredSessionMinutes
    ) {
      setError(
        "Maximum daily study time cannot be shorter than one preferred session."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated =
        await updatePreferences(form);

      setForm({
        preferredSessionMinutes:
          updated.preferredSessionMinutes,
        maximumSessionMinutes:
          updated.maximumSessionMinutes,
        breakMinutes:
          updated.breakMinutes,
        preferredStudyPeriod:
          updated.preferredStudyPeriod,
        maximumDailyMinutes:
          updated.maximumDailyMinutes
      });

      setSuccess(
        "Study preferences saved successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not save your preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (hours === 0) {
      return `${remaining} min`;
    }

    if (remaining === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remaining} min`;
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-6">
          <Settings2 size={18} />
          Student Planner
        </div>

        <h1 className="text-4xl md:text-6xl font-black">
          Study Preferences.
        </h1>

        <p className="mt-4 text-blue-50 text-lg max-w-2xl">
          Tell the planner how you prefer to study.
          These settings will later influence session
          length, breaks and the structure of your
          personalized study plan.
        </p>
      </section>

      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-2xl font-bold">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <div className="flex items-center gap-3 mb-7">
            <div className="bg-yellow-300 p-3 rounded-2xl">
              <Settings2 size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Your study style
              </h2>

              <p className="text-slate-500 text-sm">
                Adjust how the planner should structure
                your study sessions.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Loading preferences...
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <Clock3 size={18} />
                  Preferred session length
                </label>
<DurationInput
  value={form.preferredSessionMinutes}
  onChange={(value) =>
    setForm((current) => ({
      ...current,
      preferredSessionMinutes: value
    }))
  }
/>
                <p className="text-xs text-slate-500 mt-2">
                  Your ideal focused study session,
                  in minutes.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <TimerReset size={18} />
                  Maximum session length
                </label>

                <DurationInput
  value={form.maximumSessionMinutes}
  onChange={(value) =>
    setForm((current) => ({
      ...current,
      maximumSessionMinutes: value
    }))
  }
/>

                <p className="text-xs text-slate-500 mt-2">
                  The planner should not create a single
                  study session longer than this.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <Coffee size={18} />
                  Break length
                </label>

                <DurationInput
  value={form.breakMinutes}
  onChange={(value) =>
    setForm((current) => ({
      ...current,
      breakMinutes: value
    }))
  }
/>

                <p className="text-xs text-slate-500 mt-2">
                  Preferred break between study sessions.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <SunMedium size={18} />
                  Preferred study period
                </label>

                <select
                  name="preferredStudyPeriod"
                  value={form.preferredStudyPeriod}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                >
                  <option value="ANY">
                    No preference
                  </option>
                  <option value="MORNING">
                    Morning
                  </option>
                  <option value="AFTERNOON">
                    Afternoon
                  </option>
                  <option value="EVENING">
                    Evening
                  </option>
                  <option value="NIGHT">
                    Night
                  </option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <Clock3 size={18} />
                  Maximum daily study time
                </label>

                <DurationInput
  value={form.maximumDailyMinutes}
  onChange={(value) =>
    setForm((current) => ({
      ...current,
      maximumDailyMinutes: value
    }))
  }
/>

                <p className="text-xs text-slate-500 mt-2">
                  Maximum total study time the planner
                  should schedule in one day.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
              >
                <Save size={20} />

                {saving
                  ? "Saving..."
                  : "Save Preferences"}
              </button>
            </form>
          )}
        </section>

        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900">
            Planner summary
          </h2>

          <p className="text-slate-500 text-sm mt-1 mb-7">
            This is how your current preferences will
            guide future schedule generation.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-black text-blue-600 uppercase">
                Ideal session
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatHours(
                  form.preferredSessionMinutes
                )}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Preferred duration for focused work.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-black text-blue-600 uppercase">
                Session limit
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatHours(
                  form.maximumSessionMinutes
                )}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Maximum uninterrupted study block.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-black text-blue-600 uppercase">
                Break
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                {form.breakMinutes} min
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Recovery time between sessions.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5">
              <p className="text-xs font-black text-blue-600 uppercase">
                Preferred time
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                {form.preferredStudyPeriod === "ANY"
                  ? "No preference"
                  : form.preferredStudyPeriod
                      .charAt(0) +
                    form.preferredStudyPeriod
                      .slice(1)
                      .toLowerCase()}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Preferred part of the day for study.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
              <p className="text-xs font-black text-yellow-700 uppercase">
                Daily maximum
              </p>

              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatHours(
                  form.maximumDailyMinutes
                )}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                The planner should avoid scheduling
                more than this amount per day.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
