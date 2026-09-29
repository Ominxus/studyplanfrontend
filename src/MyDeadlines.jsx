import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  RefreshCw
} from "lucide-react";

import { getCourses } from "./services/courseService";
import {
  createDeadline,
  getDeadlines
} from "./services/deadlineService";

export default function MyDeadlines() {
  const [courses, setCourses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    deadlineType: "ASSIGNMENT",
    dueAt: "",
    estimatedMinutes: 60,
    importance: 3,
    status: "PENDING",
    notes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseData, deadlineData] =
        await Promise.all([
          getCourses(),
          getDeadlines()
        ]);

      setCourses(courseData);
      setDeadlines(deadlineData);
    } catch (err) {
      console.error(err);
      setError("Could not load deadline information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "courseId" ||
        name === "estimatedMinutes" ||
        name === "importance"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    if (!form.title.trim()) {
      setError("Deadline title is required.");
      return;
    }

    if (!form.dueAt) {
      setError("Deadline date and time are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const deadlineData = {
        ...form,
        title: form.title.trim(),

        dueAt:
          form.dueAt.length === 16
            ? `${form.dueAt}:00`
            : form.dueAt,

        notes: form.notes.trim()
      };

      const createdDeadline =
        await createDeadline(deadlineData);

      setDeadlines((current) =>
        [...current, createdDeadline].sort(
          (a, b) =>
            new Date(a.dueAt) - new Date(b.dueAt)
        )
      );

      setSuccess("Deadline added successfully.");

      setForm({
        courseId: "",
        title: "",
        deadlineType: "ASSIGNMENT",
        dueAt: "",
        estimatedMinutes: 60,
        importance: 3,
        status: "PENDING",
        notes: ""
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : null) ||
          "Could not save the deadline."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDeadline = (value) => {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleString();
  };

  const formatMinutes = (minutes) => {
    if (!minutes) {
      return "Not specified";
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining === 0
      ? `${hours} hr`
      : `${hours} hr ${remaining} min`;
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-6">
          <CalendarDays size={18} />
          Student Planner
        </div>

        <h1 className="text-4xl md:text-6xl font-black">
          My Deadlines.
        </h1>

        <p className="mt-4 text-blue-50 text-lg max-w-2xl">
          Add exams, assignments and projects so the
          planner can understand what needs attention
          and when.
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
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Add a deadline
              </h2>

              <p className="text-slate-500 text-sm">
                Connect the deadline to one of your
                active courses.
              </p>
            </div>
          </div>

          {courses.length === 0 && !loading ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 text-yellow-900">
              Add at least one course before creating
              deadlines.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Course
                </label>

                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                >
                  <option value="">
                    Select a course
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.name}
                      {course.code
                        ? ` (${course.code})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Deadline title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Final exam"
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Type
                  </label>

                  <select
                    name="deadlineType"
                    value={form.deadlineType}
                    onChange={handleChange}
                    className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                  >
                    <option value="ASSIGNMENT">
                      Assignment
                    </option>
                    <option value="EXAM">
                      Exam
                    </option>
                    <option value="PROJECT">
                      Project
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Importance
                  </label>

                  <select
                    name="importance"
                    value={form.importance}
                    onChange={handleChange}
                    className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                  >
                    <option value={1}>1 - Very low</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Very high</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Due date and time
                </label>

                <input
                  type="datetime-local"
                  name="dueAt"
                  value={form.dueAt}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Estimated work
                </label>

                <input
                  type="number"
                  min="1"
                  name="estimatedMinutes"
                  value={form.estimatedMinutes}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Enter the estimated number of minutes
                  needed to prepare or complete it.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Anything useful about this deadline..."
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {saving
                  ? "Saving..."
                  : "Add Deadline"}
              </button>
            </form>
          )}
        </section>

        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <div className="flex justify-between items-center gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Upcoming deadlines
              </h2>

              <p className="text-slate-500 text-sm">
                {deadlines.length} deadline
                {deadlines.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100"
              title="Refresh deadlines"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Loading deadlines...
            </p>
          ) : deadlines.length === 0 ? (
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center">
              <CalendarDays
                size={40}
                className="mx-auto text-blue-400 mb-4"
              />

              <p className="font-black text-slate-800">
                No deadlines yet
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Add your first deadline using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <article
                  key={deadline.id}
                  className="border-2 border-blue-100 bg-blue-50/50 rounded-2xl p-5"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-wide">
                        {deadline.courseName}
                      </p>

                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        {deadline.title}
                      </h3>
                    </div>

                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black h-fit">
                      {deadline.deadlineType}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarDays size={17} />

                      <span className="font-bold">
                        {formatDeadline(
                          deadline.dueAt
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={17} />

                      <span>
                        Estimated work:{" "}
                        <strong>
                          {formatMinutes(
                            deadline.estimatedMinutes
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-slate-500 font-bold">
                        Importance
                      </p>

                      <p className="text-lg font-black text-slate-900">
                        {deadline.importance}/5
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-slate-500 font-bold">
                        Status
                      </p>

                      <p className="text-sm font-black text-slate-900 mt-1">
                        {deadline.status}
                      </p>
                    </div>
                  </div>

                  {deadline.notes && (
                    <p className="mt-4 text-sm text-slate-600">
                      {deadline.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
