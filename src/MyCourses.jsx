import { useEffect, useState } from "react";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { createCourse, getCourses } from "./services/courseService";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    difficulty: 3,
    priority: 3,
    notes: ""
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError("Could not load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "difficulty" || name === "priority"
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Course name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const createdCourse = await createCourse({
        ...form,
        name: form.name.trim(),
        code: form.code.trim()
      });

      setCourses((current) => [...current, createdCourse]);

      setForm({
        name: "",
        code: "",
        difficulty: 3,
        priority: 3,
        notes: ""
      });

      setSuccess("Course added successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Could not add the course."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-6">
          <BookOpen size={18} />
          Student Planner
        </div>

        <h1 className="text-4xl md:text-6xl font-black">
          My Courses.
        </h1>

        <p className="mt-4 text-blue-50 text-lg max-w-2xl">
          Add the subjects you are currently studying. Difficulty and
          priority will later help the study planner create personalized
          recommendations.
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
                Add a course
              </h2>

              <p className="text-slate-500 text-sm">
                Tell the planner what you are currently studying.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Course name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Introduction to Networking"
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">
                Course code
              </label>

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Example: NET101"
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl"
                >
                  <option value={1}>1 - Very easy</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Hard</option>
                  <option value={5}>5 - Very hard</option>
                </select>
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
                placeholder="Anything useful about this course..."
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {saving ? "Adding course..." : "Add Course"}
            </button>
          </form>
        </section>

        <section className="bg-white border-2 border-blue-100 rounded-[2rem] p-7 shadow-lg">
          <div className="flex justify-between items-center gap-4 mb-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Your courses
              </h2>

              <p className="text-slate-500 text-sm">
                {courses.length} active course
                {courses.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              onClick={loadCourses}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100"
              title="Refresh courses"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center">
              <BookOpen
                size={40}
                className="mx-auto text-blue-400 mb-4"
              />

              <p className="font-black text-slate-800">
                No courses added yet
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Add your first course using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="border-2 border-blue-100 bg-blue-50/50 rounded-2xl p-5"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {course.name}
                      </h3>

                      {course.code && (
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          {course.code}
                        </p>
                      )}
                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black h-fit">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-slate-500 font-bold">
                        Difficulty
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {course.difficulty}/5
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-slate-500 font-bold">
                        Priority
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {course.priority}/5
                      </p>
                    </div>
                  </div>

                  {course.notes && (
                    <p className="mt-4 text-sm text-slate-600">
                      {course.notes}
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
