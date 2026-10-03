import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  Pencil,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  X
} from "lucide-react";

import {
  cancelGoal,
  completeGoal,
  createGoal,
  getGoals,
  updateGoal
} from "./services/goalService";

export default function MyGoals() {
  const emptyForm = {
    title: "",
    description: "",
    targetDate: "",
    priority: 3,
    status: "ACTIVE"
  };

  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingGoalId, setEditingGoalId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load your goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingGoalId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "priority"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const goalData = {
        ...form,
        title: form.title.trim(),
        description:
          form.description.trim(),
        targetDate:
          form.targetDate || null
      };

      if (editingGoalId) {
        const updated =
          await updateGoal(
            editingGoalId,
            goalData
          );

        setGoals((current) =>
          current.map((goal) =>
            goal.id === editingGoalId
              ? updated
              : goal
          )
        );

        setSuccess(
          "Goal updated successfully."
        );
      } else {
        const created =
          await createGoal(goalData);

        setGoals((current) => [
          ...current,
          created
        ]);

        setSuccess(
          "Goal added successfully."
        );
      }

      resetForm();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not save the goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoalId(goal.id);

    setForm({
      title: goal.title,
      description:
        goal.description || "",
      targetDate:
        goal.targetDate || "",
      priority: goal.priority,
      status: goal.status
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

  const handleComplete = async (goal) => {
    if (goal.status === "COMPLETED") {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const completed =
        await completeGoal(goal.id);

      setGoals((current) =>
        current.map((item) =>
          item.id === goal.id
            ? completed
            : item
        )
      );

      if (editingGoalId === goal.id) {
        resetForm();
      }

      setSuccess(
        `"${goal.title}" marked as completed.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not complete the goal."
      );
    }
  };

  const handleRemove = async (goal) => {
    const confirmed = window.confirm(
      `Remove "${goal.title}" from your active goals?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await cancelGoal(goal.id);

      setGoals((current) =>
        current.filter(
          (item) => item.id !== goal.id
        )
      );

      if (editingGoalId === goal.id) {
        resetForm();
      }

      setSuccess(
        "Goal removed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not remove the goal."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "No target date";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString();
  };

  const activeGoals =
    goals.filter(
      (goal) =>
        goal.status === "ACTIVE"
    ).length;

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.status === "COMPLETED"
    ).length;

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-6">
          <Target size={18} />
          Student Planner
        </div>

        <h1 className="text-4xl md:text-6xl font-black">
          My Goals.
        </h1>

        <p className="mt-4 text-blue-50 text-lg max-w-2xl">
          Add the academic goals you want to achieve.
          Goals give the planner extra context about
          what matters most to you.
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
              {editingGoalId ? (
                <Pencil size={22} />
              ) : (
                <Plus size={22} />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {editingGoalId
                  ? "Edit goal"
                  : "Add a goal"}
              </h2>

              <p className="text-slate-500 text-sm">
                {editingGoalId
                  ? "Update this academic goal."
                  : "Tell the planner what you want to achieve."}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Goal title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Prepare confidently for Networking final"
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe what you want to accomplish..."
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Target date
              </label>

              <input
                type="date"
                name="targetDate"
                value={form.targetDate}
                onChange={handleChange}
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
              />

              <p className="text-xs text-slate-500 mt-2">
                Optional. Add a date if this goal has
                a specific target.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {saving
                  ? "Saving..."
                  : editingGoalId
                  ? "Save Changes"
                  : "Add Goal"}
              </button>

              {editingGoalId && (
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
          <div className="flex justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Your goals
              </h2>

              <p className="text-slate-500 text-sm">
                {activeGoals} active
                {" • "}
                {completedGoals} completed
              </p>
            </div>

            <button
              type="button"
              onClick={loadGoals}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100"
              title="Refresh goals"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Loading goals...
            </p>
          ) : goals.length === 0 ? (
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center">
              <Target
                size={40}
                className="mx-auto text-blue-400 mb-4"
              />

              <p className="font-black text-slate-800">
                No goals added yet
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Add your first academic goal
                using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <article
                  key={goal.id}
                  className={`border-2 rounded-2xl p-5 ${
                    goal.status === "COMPLETED"
                      ? "border-green-200 bg-green-50/50"
                      : "border-blue-100 bg-blue-50/50"
                  }`}
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Flag size={16} />

                        <span className="text-xs font-black uppercase tracking-wide">
                          Priority {goal.priority}/5
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 mt-2">
                        {goal.title}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black h-fit ${
                        goal.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-slate-600 mt-4">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 text-slate-700">
                    <CalendarDays size={17} />

                    <span className="font-bold">
                      {formatDate(goal.targetDate)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(goal)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    {goal.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleComplete(goal)
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
                        handleRemove(goal)
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
