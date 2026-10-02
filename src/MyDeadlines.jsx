import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  CheckCircle2,
  X
} from "lucide-react";

import { getCourses } from "./services/courseService";

import {
  createDeadline,
  getDeadlines,
  updateDeadline,
  completeDeadline,
  cancelDeadline
} from "./services/deadlineService";
import DurationInput from "./components/DurationInput";

export default function MyDeadlines() {
  const [courses, setCourses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingDeadlineId, setEditingDeadlineId] =
    useState(null);

  const emptyForm = {
    courseId: "",
    title: "",
    deadlineType: "ASSIGNMENT",
    dueAt: "",
    estimatedMinutes: 60,
    importance: 3,
    status: "PENDING",
    notes: ""
  };

  const [form, setForm] = useState(emptyForm);

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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingDeadlineId(null);
  };

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

      if (editingDeadlineId) {
        const updatedDeadline =
          await updateDeadline(
            editingDeadlineId,
            deadlineData
          );

        setDeadlines((current) =>
          current
            .map((deadline) =>
              deadline.id === editingDeadlineId
                ? updatedDeadline
                : deadline
            )
            .sort(
              (a, b) =>
                new Date(a.dueAt) -
                new Date(b.dueAt)
            )
        );

        setSuccess(
          "Deadline updated successfully."
        );
      } else {
        const createdDeadline =
          await createDeadline(deadlineData);

        setDeadlines((current) =>
          [...current, createdDeadline].sort(
            (a, b) =>
              new Date(a.dueAt) -
              new Date(b.dueAt)
          )
        );

        setSuccess(
          "Deadline added successfully."
        );
      }

      resetForm();
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

  const handleEdit = (deadline) => {
    setEditingDeadlineId(deadline.id);

    setForm({
      courseId: deadline.courseId,
      title: deadline.title,
      deadlineType: deadline.deadlineType,
      dueAt: deadline.dueAt.slice(0, 16),
      estimatedMinutes:
        deadline.estimatedMinutes || 60,
      importance: deadline.importance,
      status: deadline.status,
      notes: deadline.notes || ""
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

  const handleComplete = async (deadline) => {
    if (deadline.status === "COMPLETED") {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const completed =
        await completeDeadline(deadline.id);

      setDeadlines((current) =>
        current.map((item) =>
          item.id === deadline.id
            ? completed
            : item
        )
      );

      setSuccess(
        `"${deadline.title}" marked as completed.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not complete the deadline."
      );
    }
  };

  const handleCancelDeadline = async (deadline) => {
    const confirmed = window.confirm(
      `Remove "${deadline.title}" from your active deadlines?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await cancelDeadline(deadline.id);

      setDeadlines((current) =>
        current.filter(
          (item) => item.id !== deadline.id
        )
      );

      if (
        editingDeadlineId === deadline.id
      ) {
        resetForm();
      }

      setSuccess(
        "Deadline removed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not remove the deadline."
      );
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
              {editingDeadlineId ? (
                <Pencil size={22} />
              ) : (
                <Plus size={22} />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {editingDeadlineId
                  ? "Edit deadline"
                  : "Add a deadline"}
              </h2>

              <p className="text-slate-500 text-sm">
                {editingDeadlineId
                  ? "Update the details of this deadline."
                  : "Connect the deadline to one of your active courses."}
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

                <DurationInput
  value={form.estimatedMinutes}
  onChange={(value) =>
    setForm((current) => ({
      ...current,
      estimatedMinutes: value
    }))
  }
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {saving
                    ? "Saving..."
                    : editingDeadlineId
                    ? "Save Changes"
                    : "Add Deadline"}
                </button>

                {editingDeadlineId && (
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
          )}
        </section>

        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <div className="flex justify-between items-center gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Your deadlines
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
            </div>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <article
                  key={deadline.id}
                  className={`border-2 rounded-2xl p-5 ${
                    deadline.status === "COMPLETED"
                      ? "border-green-200 bg-green-50/50"
                      : "border-blue-100 bg-blue-50/50"
                  }`}
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

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black h-fit ${
                        deadline.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {deadline.status}
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
                        Type
                      </p>

                      <p className="text-sm font-black text-slate-900 mt-1">
                        {deadline.deadlineType}
                      </p>
                    </div>
                  </div>

                  {deadline.notes && (
                    <p className="mt-4 text-sm text-slate-600">
                      {deadline.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(deadline)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    {deadline.status !==
                      "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleComplete(deadline)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition"
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleCancelDeadline(
                          deadline
                        )
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
