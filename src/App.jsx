import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  User,
  School,
  LogOut,
  Sparkles,
  ShieldCheck,
  Settings,
  Plus,
  Trash2,
  Save,
  Edit3,
  X,
  Zap
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STUDY_PLAN_API = `${API_BASE_URL}/api/studyplans`;
const CONFIG_API = `${API_BASE_URL}/api/config`;
const SCHOOL_YEARS_API = `${CONFIG_API}/school-years`;
const AUTH_API = `${API_BASE_URL}/api/auth`;

function normalizeCategories(data) {
  return data.map((cat) => ({
    id: cat.id,
    name: cat.name,
    min: cat.minRequired ?? 0,
    max: cat.maxAllowed ?? cat.subjects?.length ?? 1,
    optional: Boolean(cat.optional),
    subjects: cat.subjects || []
  }));
}

function StudyPlanForm() {
  const [categories, setCategories] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState("");

  const [studentInfo, setStudentInfo] = useState({
    fullName: "",
    studentNumber: "",
    schoolYear: ""
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);

      const [categoryResponse, schoolYearResponse] = await Promise.all([
        axios.get(`${CONFIG_API}/categories`),
        axios.get(SCHOOL_YEARS_API)
      ]);

      const normalized = normalizeCategories(categoryResponse.data);

      setCategories(normalized);
      setSchoolYears(schoolYearResponse.data || []);

      setSubjects(
        normalized.flatMap((cat) =>
          (cat.subjects || []).map((sub) => ({
            category: cat.name,
            name: sub.name,
            gradeIiiHours: Number(sub.gradeIiiHours || 0),
            gradeIvHours: Number(sub.gradeIvHours || 0),
            group: sub.groupName || null,
            selected: false,
            selectedGrade: "III"
          }))
        )
      );

      setConfigError("");
    } catch (error) {
      console.error("Could not load configuration:", error);
      setConfigError("Could not load study plan configuration.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleStudentChange = (e) => {
    setStudentInfo({
      ...studentInfo,
      [e.target.name]: e.target.value
    });
  };

  const getCategoryCount = (category) =>
    subjects.filter((s) => s.category === category && s.selected).length;

  const handleSubjectSelected = (index, value) => {
    const updated = [...subjects];

    if (value && updated[index].group) {
      updated.forEach((s, i) => {
        if (s.group === updated[index].group && i !== index) {
          s.selected = false;
        }
      });
    }

    updated[index].selected = value;
    setSubjects(updated);
  };

  const handleGradeChange = (index, grade) => {
    const updated = [...subjects];
    updated[index].selectedGrade = grade;
    setSubjects(updated);
  };

  const getSelectedHours = (subject) => {
    if (!subject.selected) return 0;

    return subject.selectedGrade === "III"
      ? Number(subject.gradeIiiHours || 0)
      : Number(subject.gradeIvHours || 0);
  };

  const totalSubjects = subjects.filter((s) => s.selected).length;

  const totalGradeIiiHours = subjects
    .filter((s) => s.selected && s.selectedGrade === "III")
    .reduce((sum, s) => sum + Number(s.gradeIiiHours || 0), 0);

  const totalGradeIvHours = subjects
    .filter((s) => s.selected && s.selectedGrade === "IV")
    .reduce((sum, s) => sum + Number(s.gradeIvHours || 0), 0);

  const totalHours = totalGradeIiiHours + totalGradeIvHours;

  const requiredCategories = categories.filter((cat) => !cat.optional);

  const getWarnings = () => {
    const warnings = [];

    categories.forEach((cat) => {
      const count = getCategoryCount(cat.name);

      if (count < cat.min) {
        warnings.push(`${cat.name}: select ${cat.min - count} more`);
      }

      if (count > cat.max) {
        warnings.push(`${cat.name}: too many selected`);
      }
    });

    return warnings;
  };

  const getCategoryStatus = (cat) => {
    const count = getCategoryCount(cat.name);

    if (count < cat.min) {
      return {
        text: `Need ${cat.min - count} more`,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300"
      };
    }

    if (count > cat.max) {
      return {
        text: "Too many",
        className: "bg-red-100 text-red-700 border-red-300"
      };
    }

    if (cat.optional && count === 0) {
      return {
        text: "Optional",
        className: "bg-slate-100 text-slate-600 border-slate-300"
      };
    }

    return {
      text: cat.optional
        ? `Selected ${count}/${cat.max}`
        : `Complete ${count}/${cat.max}`,
      className: "bg-blue-100 text-blue-700 border-blue-300"
    };
  };

  const warnings = getWarnings();
  const formWarnings = [...warnings];

  if (!studentInfo.schoolYear) {
    formWarnings.push("Select school years");
  }

  if (!studentInfo.fullName.trim()) {
    formWarnings.push("Enter full name");
  }

  if (!studentInfo.studentNumber.trim()) {
    formWarnings.push("Enter student number");
  }

  const completedRequiredCategories = requiredCategories.filter((cat) =>
    getCategoryStatus(cat).text.startsWith("Complete")
  ).length;

  const completionPercentage =
    requiredCategories.length > 0
      ? Math.round(
          (completedRequiredCategories / requiredCategories.length) * 100
        )
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formWarnings.length > 0) {
      alert("Fix warnings before submitting");
      return;
    }

    const payload = {
      fullName: studentInfo.fullName,
      studentNumber: studentInfo.studentNumber,
      schoolYear: studentInfo.schoolYear,
      classYear: "",
      subjects: subjects
        .filter((s) => s.selected)
        .map((s) => ({
          subject: s.name,
          selectedGrade: s.selectedGrade,
          gradeIiiHours:
            s.selectedGrade === "III" ? Number(s.gradeIiiHours || 0) : 0,
          gradeIvHours:
            s.selectedGrade === "IV" ? Number(s.gradeIvHours || 0) : 0
        }))
    };

    try {
      await axios.post(STUDY_PLAN_API, payload);
      alert("Submitted successfully!");

      setStudentInfo({
        fullName: "",
        studentNumber: "",
        schoolYear: ""
      });

      setSubjects(
        subjects.map((s) => ({
          ...s,
          selected: false,
          selectedGrade: "III"
        }))
      );
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Could not submit study plan. Check backend connection.");
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 flex items-center justify-center p-8">
        <div className="bg-white border-4 border-blue-200 p-10 rounded-[2rem] shadow-2xl text-center">
          <GraduationCap size={46} className="mx-auto text-blue-600 mb-4" />
          <p className="font-black text-slate-900">
            Loading study plan configuration...
          </p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 flex items-center justify-center p-8">
        <div className="bg-white border-4 border-red-200 text-red-700 p-10 rounded-[2rem] shadow-2xl max-w-md">
          <AlertTriangle className="mb-4" />
          <p className="font-bold">{configError}</p>
          <button
            onClick={fetchConfig}
            className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 rounded-[2.5rem] shadow-2xl mb-10 text-white">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-28 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-14">
              <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7 shadow-lg">
                <Zap size={18} />
                Student Study Portal
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
                Choose your grade and subjects.
              </h1>

              <p className="mt-7 text-blue-50 text-lg max-w-xl leading-relaxed">
                Select a subject, choose Grade III or Grade IV, and the correct
                number of hours will be applied automatically.
              </p>
            </div>

            <div className="p-8 md:p-12 flex items-center">
              <div className="bg-white text-slate-900 rounded-[2rem] p-8 w-full shadow-2xl border-4 border-yellow-300 rotate-0 lg:rotate-2">
                <p className="uppercase tracking-[0.25em] text-xs font-black text-blue-600 mb-6">
                  Live Summary
                </p>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-5">
                    <p className="text-sm text-slate-500 font-bold">
                      Subjects
                    </p>
                    <h2 className="text-5xl font-black text-blue-700">
                      {totalSubjects}
                    </h2>
                  </div>

                  <div className="bg-yellow-100 border-2 border-yellow-200 rounded-3xl p-5">
                    <p className="text-sm text-slate-500 font-bold">
                      Total Hours
                    </p>
                    <h2 className="text-5xl font-black text-yellow-700">
                      {totalHours}
                    </h2>
                  </div>

                  <div className="bg-yellow-100 border-2 border-yellow-200 rounded-3xl p-5">
                    <p className="text-sm text-slate-500 font-bold">
                      Grade III
                    </p>
                    <h2 className="text-4xl font-black text-yellow-700">
                      {totalGradeIiiHours}
                    </h2>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-5">
                    <p className="text-sm text-slate-500 font-bold">
                      Grade IV
                    </p>
                    <h2 className="text-4xl font-black text-blue-700">
                      {totalGradeIvHours}
                    </h2>
                  </div>

                  <div className="col-span-2">
                    <div className="flex justify-between mb-3">
                      <span className="font-black text-slate-800">
                        Completion
                      </span>
                      <span className="font-black text-blue-700">
                        {completionPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-300 to-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white border-4 border-blue-100 shadow-xl rounded-[2rem] p-7 md:p-9 mb-10">
          <div className="flex items-center gap-4 mb-7">
            <div className="bg-yellow-300 text-blue-950 p-3 rounded-2xl shadow-md">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Student Information
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Fill this in before choosing subjects.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              name="fullName"
              placeholder="Full name"
              value={studentInfo.fullName}
              onChange={handleStudentChange}
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />

            <input
              name="studentNumber"
              placeholder="Student number"
              value={studentInfo.studentNumber}
              onChange={handleStudentChange}
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />

            <select
              name="schoolYear"
              value={studentInfo.schoolYear}
              onChange={handleStudentChange}
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="">Select school years</option>
              {schoolYears.map((year) => (
                <option key={year.id} value={year.label}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formWarnings.length > 0 ? (
          <div className="bg-yellow-100 border-4 border-yellow-300 text-yellow-900 p-7 md:p-8 mb-10 rounded-[2rem] shadow-xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-white p-3 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-2xl font-black">Almost there 👀</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formWarnings.map((w, i) => (
                <div
                  key={i}
                  className="bg-white/80 border-2 border-yellow-200 p-4 rounded-2xl text-sm font-bold"
                >
                  {w}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-blue-100 border-4 border-blue-300 text-blue-900 p-7 md:p-8 mb-10 rounded-[2rem] shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl">
                <CheckCircle size={24} />
              </div>
              <span className="font-black">
                All requirements are complete. You’re ready to submit 🚀
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-10">
            {categories.map((cat) => {
              const status = getCategoryStatus(cat);

              return (
                <div
                  key={cat.id}
                  className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b-4 border-blue-100 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 text-white p-3 rounded-2xl">
                        <School size={22} />
                      </div>

                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                          {cat.name}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 font-semibold">
                          {cat.optional
                            ? "Optional category"
                            : `Required: choose ${cat.min}${
                                cat.min === cat.max ? "" : ` to ${cat.max}`
                              }`}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-full border-2 text-sm font-black ${status.className}`}
                    >
                      {status.text}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-600 text-white uppercase text-xs tracking-wide">
                        <tr>
                          <th className="p-4 text-center">Select</th>
                          <th className="p-4 text-left">Subject</th>
                          <th className="p-4 text-center">Choose Grade</th>
                          <th className="p-4 text-center">Hours</th>
                        </tr>
                      </thead>

                      <tbody>
                        {subjects
                          .map((s, i) => ({ ...s, index: i }))
                          .filter((s) => s.category === cat.name)
                          .map((sub) => {
                            const selectedCount = getCategoryCount(cat.name);
                            const isMaxReached = selectedCount >= cat.max;
                            const selectedHours = getSelectedHours(sub);

                            return (
                              <tr
                                key={sub.index}
                                className={`border-b-2 border-blue-50 transition ${
                                  sub.selected
                                    ? "bg-yellow-50"
                                    : "bg-white hover:bg-blue-50"
                                }`}
                              >
                                <td className="p-5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={sub.selected}
                                    disabled={!sub.selected && isMaxReached}
                                    className="w-5 h-5 accent-blue-600 disabled:cursor-not-allowed"
                                    onChange={(e) =>
                                      handleSubjectSelected(
                                        sub.index,
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>

                                <td className="p-5">
                                  <div className="font-black text-slate-900">
                                    {sub.name}
                                  </div>
                                  {sub.group && (
                                    <div className="text-xs text-slate-500 mt-1 font-semibold">
                                      Only one option from this group can be
                                      selected.
                                    </div>
                                  )}
                                </td>

                                <td className="p-5 text-center">
                                  <select
                                    value={sub.selectedGrade}
                                    disabled={!sub.selected}
                                    onChange={(e) =>
                                      handleGradeChange(
                                        sub.index,
                                        e.target.value
                                      )
                                    }
                                    className="border-2 border-blue-100 bg-white rounded-xl px-4 py-2 font-bold disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-blue-500"
                                  >
                                    <option value="III">
                                      Grade III ({sub.gradeIiiHours}h)
                                    </option>
                                    <option value="IV">
                                      Grade IV ({sub.gradeIvHours}h)
                                    </option>
                                  </select>
                                </td>

                                <td className="p-5 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center font-black px-4 py-2 rounded-full ${
                                      sub.selectedGrade === "III"
                                        ? "bg-yellow-300 text-blue-950"
                                        : "bg-blue-600 text-white"
                                    }`}
                                  >
                                    {sub.selected ? `${selectedHours}h` : "—"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-4 mt-12">
            <button
              type="submit"
              disabled={formWarnings.length > 0}
              className={`w-full p-5 text-white font-black text-lg tracking-wide rounded-[2rem] transition shadow-2xl ${
                formWarnings.length > 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
              }`}
            >
              {formWarnings.length > 0
                ? "Complete Requirements First"
                : "Submit Study Plan 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageStudyPlanConfig() {
  const [categories, setCategories] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [newSchoolYear, setNewSchoolYear] = useState("");
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState({
    name: "",
    minRequired: 0,
    maxAllowed: 1,
    optional: false
  });

  const [newSubjectByCategory, setNewSubjectByCategory] = useState({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);

      const [categoryResponse, schoolYearResponse] = await Promise.all([
        axios.get(`${CONFIG_API}/categories`),
        axios.get(SCHOOL_YEARS_API)
      ]);

      setCategories(categoryResponse.data || []);
      setSchoolYears(schoolYearResponse.data || []);
    } catch (error) {
      console.error("Could not load configuration:", error);
      alert("Could not load configuration.");
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryField = (categoryId, field, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      )
    );
  };

  const updateSubjectField = (categoryId, subjectId, field, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subjects: (cat.subjects || []).map((sub) =>
                sub.id === subjectId ? { ...sub, [field]: value } : sub
              )
            }
          : cat
      )
    );
  };

  const updateSchoolYearField = (id, value) => {
    setSchoolYears((prev) =>
      prev.map((year) => (year.id === id ? { ...year, label: value } : year))
    );
  };

  const addSchoolYear = async () => {
    if (!newSchoolYear.trim()) {
      alert("School year is required.");
      return;
    }

    await axios.post(SCHOOL_YEARS_API, {
      label: newSchoolYear
    });

    setNewSchoolYear("");
    fetchConfig();
  };

  const updateSchoolYear = async (year) => {
    if (!year.label.trim()) {
      alert("School year is required.");
      return;
    }

    await axios.put(`${SCHOOL_YEARS_API}/${year.id}`, {
      label: year.label
    });

    alert("School year saved.");
    fetchConfig();
  };

  const deleteSchoolYear = async (id) => {
    if (!confirm("Delete this school year option?")) return;

    await axios.delete(`${SCHOOL_YEARS_API}/${id}`);
    fetchConfig();
  };

  const saveCategory = async (category) => {
    if (!category.name.trim()) {
      alert("Category name is required.");
      return;
    }

    await axios.put(`${CONFIG_API}/categories/${category.id}`, {
      name: category.name,
      minRequired: Number(category.minRequired || 0),
      maxAllowed: Number(category.maxAllowed || 0),
      optional: Boolean(category.optional)
    });

    alert("Category saved.");
    fetchConfig();
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm("Delete this category and all its subjects?")) return;

    await axios.delete(`${CONFIG_API}/categories/${categoryId}`);
    fetchConfig();
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Category name is required.");
      return;
    }

    await axios.post(`${CONFIG_API}/categories`, {
      name: newCategory.name,
      minRequired: Number(newCategory.minRequired || 0),
      maxAllowed: Number(newCategory.maxAllowed || 0),
      optional: Boolean(newCategory.optional),
      subjects: []
    });

    setNewCategory({
      name: "",
      minRequired: 0,
      maxAllowed: 1,
      optional: false
    });

    fetchConfig();
  };

  const addSubject = async (categoryId) => {
  const subject = newSubjectByCategory[categoryId];

  if (!subject?.name?.trim()) {
    alert("Subject name is required.");
    return;
  }

  try {
    await axios.post(`${CONFIG_API}/categories/${categoryId}/subjects`, {
      name: subject.name,
      gradeIiiHours: Number(subject.gradeIiiHours || 0),
      gradeIvHours: Number(subject.gradeIvHours || 0),
      groupName: subject.groupName || null
    });

    setNewSubjectByCategory({
      ...newSubjectByCategory,
      [categoryId]: {
        name: "",
        gradeIiiHours: "",
        gradeIvHours: "",
        groupName: ""
      }
    });

    fetchConfig();
    alert("Subject added successfully.");
  } catch (error) {
    console.error("Add subject failed:", error);
    alert("Could not add subject. Check backend console.");
  }
};

  const saveSubject = async (subject) => {
    if (!subject.name.trim()) {
      alert("Subject name is required.");
      return;
    }

    await axios.put(`${CONFIG_API}/subjects/${subject.id}`, {
      name: subject.name,
      gradeIiiHours: Number(subject.gradeIiiHours || 0),
      gradeIvHours: Number(subject.gradeIvHours || 0),
      groupName: subject.groupName || null
    });

    alert("Subject saved.");
    fetchConfig();
  };

  const deleteSubject = async (subjectId) => {
    if (!confirm("Delete this subject?")) return;

    await axios.delete(`${CONFIG_API}/subjects/${subjectId}`);
    fetchConfig();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 p-10">
        <div className="bg-white border-4 border-blue-100 max-w-7xl mx-auto p-10 rounded-[2rem] shadow-xl text-center font-black">
          Loading study plan configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] shadow-2xl mb-10 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
              <Settings size={18} />
              Admin Control Panel
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Manage study plans.
            </h1>

            <p className="mt-6 text-blue-50 text-lg max-w-3xl">
              Edit school years, categories, selection rules, subjects, and
              Grade III / Grade IV hour values.
            </p>
          </div>
        </section>

        <div className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl p-7 md:p-9 mb-10">
          <div className="flex items-center gap-4 mb-7">
            <div className="bg-yellow-300 text-blue-950 p-3 rounded-2xl">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Manage School Years
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add or edit the school year options students can choose.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              placeholder="Example: 2026–2028"
              value={newSchoolYear}
              onChange={(e) => setNewSchoolYear(e.target.value)}
              className="md:col-span-3 w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            <button
              onClick={addSchoolYear}
              className="bg-blue-600 text-white font-black px-5 py-4 rounded-2xl hover:bg-blue-700 transition"
            >
              Add Year
            </button>
          </div>

          <div className="space-y-4">
            {schoolYears.length === 0 && (
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 text-slate-500 font-bold">
                No school year options added yet.
              </div>
            )}

            {schoolYears.map((year) => (
              <div
                key={year.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 border-2 border-blue-100 rounded-2xl p-4"
              >
                <input
                  value={year.label}
                  onChange={(e) =>
                    updateSchoolYearField(year.id, e.target.value)
                  }
                  className="md:col-span-2 w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                />

                <button
                  onClick={() => updateSchoolYear(year)}
                  className="bg-yellow-300 text-blue-950 font-black px-5 py-4 rounded-2xl hover:bg-yellow-400 transition"
                >
                  Save
                </button>

                <button
                  onClick={() => deleteSchoolYear(year.id)}
                  className="bg-red-50 border-2 border-red-200 text-red-600 font-black px-5 py-4 rounded-2xl hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl p-7 md:p-9 mb-10">
          <div className="flex items-center gap-4 mb-7">
            <div className="bg-yellow-300 text-blue-950 p-3 rounded-2xl">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Add New Category
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Create a new subject category and define its rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-5">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Category Name
              </label>
              <input
                placeholder="Example: Privalomi dalykai"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Min
              </label>
              <input
                type="number"
                value={newCategory.minRequired}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    minRequired: e.target.value
                  })
                }
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Max
              </label>
              <input
                type="number"
                value={newCategory.maxAllowed}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    maxAllowed: e.target.value
                  })
                }
                className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-3">
              <button
                onClick={createCategory}
                className="w-full bg-blue-600 text-white font-black px-5 py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Category
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-3 mt-6 text-sm font-black text-slate-700">
            <input
              type="checkbox"
              checked={newCategory.optional}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  optional: e.target.checked
                })
              }
              className="w-4 h-4 accent-blue-600"
            />
            Optional category
          </label>
        </div>

        <div className="space-y-10">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border-4 border-blue-100 rounded-[2rem] shadow-xl overflow-hidden"
            >
              <div className="p-7 md:p-9 bg-gradient-to-r from-blue-50 to-yellow-50 border-b-4 border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      Category Settings
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Edit category name and selection limits.
                    </p>
                  </div>

                  <span className="border-2 border-blue-200 px-4 py-2 rounded-full text-sm font-black text-blue-700 bg-white">
                    {cat.optional ? "Optional" : "Required"}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                  <div className="lg:col-span-5">
                    <label className="block text-sm font-black text-slate-700 mb-2">
                      Category Name
                    </label>
                    <input
                      value={cat.name}
                      onChange={(e) =>
                        updateCategoryField(cat.id, "name", e.target.value)
                      }
                      className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-2">
                      Min
                    </label>
                    <input
                      type="number"
                      value={cat.minRequired}
                      onChange={(e) =>
                        updateCategoryField(
                          cat.id,
                          "minRequired",
                          e.target.value
                        )
                      }
                      className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-black text-slate-700 mb-2">
                      Max
                    </label>
                    <input
                      type="number"
                      value={cat.maxAllowed}
                      onChange={(e) =>
                        updateCategoryField(
                          cat.id,
                          "maxAllowed",
                          e.target.value
                        )
                      }
                      className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => saveCategory(cat)}
                      className="flex-1 bg-blue-600 text-white font-black px-5 py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save
                    </button>

                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="flex-1 bg-red-50 border-2 border-red-200 text-red-600 font-black px-5 py-4 rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>

                <label className="inline-flex items-center gap-3 mt-7 text-sm font-black text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(cat.optional)}
                    onChange={(e) =>
                      updateCategoryField(
                        cat.id,
                        "optional",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  Optional category
                </label>
              </div>

              <div className="p-7 md:p-9">
                <div className="mb-8">
                  <h3 className="text-3xl font-black text-slate-900">
                    Subjects
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Edit subjects that belong to this category.
                  </p>
                </div>

                {(cat.subjects || []).length > 0 ? (
                  <div className="space-y-6 mb-10">
                    {(cat.subjects || []).map((sub) => (
                      <div
                        key={sub.id}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-blue-50 border-2 border-blue-100 rounded-[1.5rem] p-5 items-end"
                      >
                        <div className="lg:col-span-4">
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                            Subject Name
                          </label>
                          <input
                            value={sub.name}
                            onChange={(e) =>
                              updateSubjectField(
                                cat.id,
                                sub.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                            Grade III Hours
                          </label>
                          <input
                            type="number"
                            value={sub.gradeIiiHours ?? ""}
                            onChange={(e) =>
                              updateSubjectField(
                                cat.id,
                                sub.id,
                                "gradeIiiHours",
                                e.target.value
                              )
                            }
                            className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                            Grade IV Hours
                          </label>
                          <input
                            type="number"
                            value={sub.gradeIvHours ?? ""}
                            onChange={(e) =>
                              updateSubjectField(
                                cat.id,
                                sub.id,
                                "gradeIvHours",
                                e.target.value
                              )
                            }
                            className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wide">
                            Group
                          </label>
                          <input
                            value={sub.groupName || ""}
                            placeholder="Optional"
                            onChange={(e) =>
                              updateSubjectField(
                                cat.id,
                                sub.id,
                                "groupName",
                                e.target.value
                              )
                            }
                            className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="lg:col-span-2 flex flex-col gap-3">
                          <button
                            onClick={() => saveSubject(sub)}
                            className="bg-yellow-300 text-blue-950 font-black px-5 py-4 rounded-2xl hover:bg-yellow-400 transition flex items-center justify-center gap-2"
                          >
                            <Edit3 size={16} />
                            Update
                          </button>

                          <button
                            onClick={() => deleteSubject(sub.id)}
                            className="bg-red-50 border-2 border-red-200 text-red-600 font-black px-5 py-4 rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-[1.5rem] p-6 text-slate-500 mb-10">
                    No subjects in this category yet.
                  </div>
                )}

                <div className="border-t-4 border-blue-100 pt-8 mt-2">
                  <h4 className="text-2xl font-black text-slate-900 mb-6">
                    Add New Subject
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-yellow-100 border-2 border-yellow-300 rounded-[1.5rem] p-5 items-end">
                    <div className="lg:col-span-4">
                      <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">
                        Subject Name
                      </label>
                      <input
                        placeholder="New subject name"
                        value={newSubjectByCategory[cat.id]?.name || ""}
                        onChange={(e) =>
                          setNewSubjectByCategory({
                            ...newSubjectByCategory,
                            [cat.id]: {
                              ...newSubjectByCategory[cat.id],
                              name: e.target.value
                            }
                          })
                        }
                        className="w-full p-4 bg-white border-2 border-yellow-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">
                        Grade III Hours
                      </label>
                      <input
                        type="number"
                        placeholder="III"
                        value={
                          newSubjectByCategory[cat.id]?.gradeIiiHours || ""
                        }
                        onChange={(e) =>
                          setNewSubjectByCategory({
                            ...newSubjectByCategory,
                            [cat.id]: {
                              ...newSubjectByCategory[cat.id],
                              gradeIiiHours: e.target.value
                            }
                          })
                        }
                        className="w-full p-4 bg-white border-2 border-yellow-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">
                        Grade IV Hours
                      </label>
                      <input
                        type="number"
                        placeholder="IV"
                        value={newSubjectByCategory[cat.id]?.gradeIvHours || ""}
                        onChange={(e) =>
                          setNewSubjectByCategory({
                            ...newSubjectByCategory,
                            [cat.id]: {
                              ...newSubjectByCategory[cat.id],
                              gradeIvHours: e.target.value
                            }
                          })
                        }
                        className="w-full p-4 bg-white border-2 border-yellow-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">
                        Group
                      </label>
                      <input
                        placeholder="Optional"
                        value={newSubjectByCategory[cat.id]?.groupName || ""}
                        onChange={(e) =>
                          setNewSubjectByCategory({
                            ...newSubjectByCategory,
                            [cat.id]: {
                              ...newSubjectByCategory[cat.id],
                              groupName: e.target.value
                            }
                          })
                        }
                        className="w-full p-4 bg-white border-2 border-yellow-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <button
  type="button"
  onClick={() => addSubject(cat.id)}
  className="w-full bg-blue-600 text-white font-black px-5 py-4 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
>
  <Plus size={18} />
  Add
</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onGoToRegister }) {
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${AUTH_API}/login`, loginData);

      onLogin(response.data);
      setError("");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-yellow-300 flex items-center justify-center px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-700 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-300/40 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="bg-yellow-300 text-blue-950 p-4 rounded-3xl inline-flex mb-8">
              <GraduationCap size={46} />
            </div>

            <h1 className="text-6xl leading-none font-black tracking-tight">
              Study Plan System
            </h1>

            <p className="mt-6 text-blue-100 text-lg leading-relaxed max-w-md">
              A fresh student portal for choosing subjects and managing study
              plans.
            </p>
          </div>

          <div className="relative flex items-center gap-3 text-blue-100">
            <ShieldCheck size={22} />
            <span>Student and admin access</span>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
            <Sparkles size={18} />
            Welcome back
          </div>

          <h2 className="text-5xl font-black text-slate-900">Login</h2>

          <p className="text-slate-500 mt-3 mb-8">
            Enter your credentials to continue.
          </p>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleChange}
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg">
              Login
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-7">
            Don&apos;t have an account?{" "}
            <button
              onClick={onGoToRegister}
              className="text-blue-600 font-black hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!registerData.password.trim()) {
      setError("Password is required");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${AUTH_API}/register`, {
  username: registerData.username,
  password: registerData.password
});

      onRegisterSuccess(response.data);
      setError("");
    } catch (err) {
      if (err.response) {
        setError(err.response.data);
      } else {
        setError("Could not connect to backend");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-yellow-300 flex items-center justify-center px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-4 border-white">
        <div className="text-center mb-8">
          <div className="bg-yellow-300 text-blue-950 p-4 rounded-3xl inline-flex mb-5">
            <GraduationCap size={36} />
          </div>

          <h1 className="text-5xl font-black text-slate-900">Register</h1>

          <p className="text-slate-500 mt-3">
            Create a student account to submit your study plan.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <input
            name="username"
            placeholder="Username"
            value={registerData.username}
            onChange={handleChange}
            className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={handleChange}
            className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={registerData.confirmPassword}
            onChange={handleChange}
            className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
          />

          <button className="w-full bg-yellow-300 text-blue-950 p-4 rounded-2xl font-black hover:bg-yellow-400 transition shadow-lg">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-7">
          Already have an account?{" "}
          <button
            onClick={onGoToLogin}
            className="text-blue-600 font-black hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");
  const [adminPage, setAdminPage] = useState("dashboard");

  if (!loggedInUser && authPage === "login") {
    return (
      <LoginPage
        onLogin={setLoggedInUser}
        onGoToRegister={() => setAuthPage("register")}
      />
    );
  }

  if (!loggedInUser && authPage === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={setLoggedInUser}
        onGoToLogin={() => setAuthPage("login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 font-['Inter']">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-4 border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-900">
                Study Plan System
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {loggedInUser.role === "ADMIN"
                  ? "Admin Portal"
                  : "Student Portal"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {loggedInUser.role === "ADMIN" && (
              <div className="flex bg-blue-50 border-2 border-blue-100 rounded-2xl p-1">
                <button
                  onClick={() => setAdminPage("dashboard")}
                  className={`px-5 py-3 rounded-xl font-black transition ${
                    adminPage === "dashboard"
                      ? "bg-blue-600 text-white shadow"
                      : "text-blue-700 hover:bg-white"
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setAdminPage("manage")}
                  className={`px-5 py-3 rounded-xl font-black transition ${
                    adminPage === "manage"
                      ? "bg-blue-600 text-white shadow"
                      : "text-blue-700 hover:bg-white"
                  }`}
                >
                  Manage Study Plan
                </button>
              </div>
            )}

            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-slate-900">
                {loggedInUser.username}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {loggedInUser.role}
              </p>
            </div>

            <button
              onClick={() => {
                setLoggedInUser(null);
                setAuthPage("login");
                setAdminPage("dashboard");
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-300 text-blue-950 rounded-2xl font-black hover:bg-yellow-400 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {loggedInUser.role === "ADMIN" ? (
        adminPage === "dashboard" ? (
          <AdminDashboard />
        ) : (
          <ManageStudyPlanConfig />
        )
      ) : (
        <StudyPlanForm />
      )}
    </div>
  );
}