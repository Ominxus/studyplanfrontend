import { useEffect, useState } from "react";
import {
  CalendarClock,
  Clock3,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";

import {
  createAvailability,
  deactivateAvailability,
  getAvailability,
  updateAvailability
} from "./services/availabilityService";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" }
];

export default function MyAvailability() {
  const emptyForm = {
    dayOfWeek: 1,
    startTime: "18:00",
    endTime: "20:00"
  };

  const [availability, setAvailability] =
    useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAvailability();

      setAvailability(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load your availability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "dayOfWeek"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.startTime) {
      setError("Start time is required.");
      return;
    }

    if (!form.endTime) {
      setError("End time is required.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError(
        "Start time must be before end time."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const availabilityData = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime
      };

      if (editingId) {
        const updated =
          await updateAvailability(
            editingId,
            availabilityData
          );

        setAvailability((current) =>
          current
            .map((slot) =>
              slot.id === editingId
                ? updated
                : slot
            )
            .sort(
              (a, b) =>
                a.dayOfWeek -
                  b.dayOfWeek ||
                a.startTime.localeCompare(
                  b.startTime
                )
            )
        );

        setSuccess(
          "Availability updated successfully."
        );
      } else {
        const created =
          await createAvailability(
            availabilityData
          );

        setAvailability((current) =>
          [...current, created].sort(
            (a, b) =>
              a.dayOfWeek -
                b.dayOfWeek ||
              a.startTime.localeCompare(
                b.startTime
              )
          )
        );

        setSuccess(
          "Availability added successfully."
        );
      }

      resetForm();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);

    setForm({
      dayOfWeek: slot.dayOfWeek,
      startTime:
        slot.startTime.slice(0, 5),
      endTime:
        slot.endTime.slice(0, 5)
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setError("");
    setSuccess("");
  };

  const handleRemove = async (slot) => {
    const confirmed =
      window.confirm(
        `Remove ${slot.dayName} ${formatTime(
          slot.startTime
        )} – ${formatTime(
          slot.endTime
        )} from your availability?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deactivateAvailability(
        slot.id
      );

      setAvailability((current) =>
        current.filter(
          (item) =>
            item.id !== slot.id
        )
      );

      if (editingId === slot.id) {
        resetForm();
      }

      setSuccess(
        "Availability removed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not remove availability."
      );
    }
  };

  const formatTime = (value) => {
    if (!value) {
      return "";
    }

    return value.slice(0, 5);
  };

  const calculateDuration = (
    startTime,
    endTime
  ) => {
    const [startHour, startMinute] =
      startTime
        .slice(0, 5)
        .split(":")
        .map(Number);

    const [endHour, endMinute] =
      endTime
        .slice(0, 5)
        .split(":")
        .map(Number);

    const start =
      startHour * 60 + startMinute;

    const end =
      endHour * 60 + endMinute;

    const totalMinutes = end - start;

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  };

  const totalAvailableMinutes =
    availability.reduce(
      (total, slot) => {
        const [startHour, startMinute] =
          slot.startTime
            .slice(0, 5)
            .split(":")
            .map(Number);

        const [endHour, endMinute] =
          slot.endTime
            .slice(0, 5)
            .split(":")
            .map(Number);

        const start =
          startHour * 60 +
          startMinute;

        const end =
          endHour * 60 +
          endMinute;

        return total + (end - start);
      },
      0
    );

  const weeklyHours =
    (totalAvailableMinutes / 60)
      .toFixed(1)
      .replace(".0", "");

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-6">
          <CalendarClock size={18} />
          Student Planner
        </div>

        <h1 className="text-4xl md:text-6xl font-black">
          My Availability.
        </h1>

        <p className="mt-4 text-blue-50 text-lg max-w-2xl">
          Tell the planner when you are
          available to study. These periods
          will later be used to build a
          realistic personalized schedule.
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
              {editingId ? (
                <Pencil size={22} />
              ) : (
                <Plus size={22} />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {editingId
                  ? "Edit availability"
                  : "Add availability"}
              </h2>

              <p className="text-slate-500 text-sm">
                {editingId
                  ? "Update this study period."
                  : "Add a period when you can study."}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Day
              </label>

              <select
                name="dayOfWeek"
                value={form.dayOfWeek}
                onChange={handleChange}
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
              >
                {DAYS.map((day) => (
                  <option
                    key={day.value}
                    value={day.value}
                  >
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Start time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  End time
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-sm text-blue-900">
                You can add more than one
                study period on the same day,
                but periods cannot overlap.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "Add Availability"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200"
                  title="Cancel editing"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <div className="flex justify-between items-center gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Weekly availability
              </h2>

              <p className="text-slate-500 text-sm">
                {availability.length} study
                period
                {availability.length === 1
                  ? ""
                  : "s"}
                {" • "}
                {weeklyHours} hr available
              </p>
            </div>

            <button
              type="button"
              onClick={loadAvailability}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100"
              title="Refresh availability"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Loading availability...
            </p>
          ) : availability.length === 0 ? (
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center">
              <CalendarClock
                size={40}
                className="mx-auto text-blue-400 mb-4"
              />

              <p className="font-black text-slate-800">
                No availability added yet
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Add your first study period
                using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((slot) => (
                <article
                  key={slot.id}
                  className="border-2 border-blue-100 bg-blue-50/50 rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xl font-black text-slate-900">
                        {slot.dayName}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-blue-700">
                        <Clock3 size={18} />

                        <span className="font-black">
                          {formatTime(
                            slot.startTime
                          )}
                          {" – "}
                          {formatTime(
                            slot.endTime
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                      {
                        calculateDuration(
                          slot.startTime,
                          slot.endTime
                        )
                      }
                    </span>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(slot)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(slot)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
