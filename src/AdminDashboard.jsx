import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Inbox,
  GraduationCap,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CalendarDays,
  Trash2,
  CheckSquare
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/studyplans`;

export default function AdminDashboard() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [schoolYearFilter, setSchoolYearFilter] = useState("All");
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await axios.get(API_BASE_URL);

      setPlans(response.data);
      setSelectedPlanIds([]);
      setError("");
    } catch (err) {
      setError("Could not load submitted study plans.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE_URL}/export`, "_blank");
  };

  const getTotalSubjects = (plan) => plan.subjects?.length || 0;

  const getTotalGradeIiiHours = (plan) =>
    plan.subjects?.reduce(
      (sum, subject) => sum + Number(subject.gradeIiiHours || 0),
      0
    ) || 0;

  const getTotalGradeIvHours = (plan) =>
    plan.subjects?.reduce(
      (sum, subject) => sum + Number(subject.gradeIvHours || 0),
      0
    ) || 0;

  const schoolYears = [
    "All",
    ...new Set(plans.map((plan) => plan.schoolYear).filter(Boolean))
  ];

  const filteredPlans = plans.filter((plan) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      plan.fullName?.toLowerCase().includes(searchText) ||
      plan.studentNumber?.toLowerCase().includes(searchText);

    const matchesSchoolYear =
      schoolYearFilter === "All" || plan.schoolYear === schoolYearFilter;

    return matchesSearch && matchesSchoolYear;
  });

  const totalStudents = filteredPlans.length;

  const totalSubjects = filteredPlans.reduce(
    (sum, plan) => sum + getTotalSubjects(plan),
    0
  );

  const totalGradeIiiHours = filteredPlans.reduce(
    (sum, plan) => sum + getTotalGradeIiiHours(plan),
    0
  );

  const totalGradeIvHours = filteredPlans.reduce(
    (sum, plan) => sum + getTotalGradeIvHours(plan),
    0
  );

  const toggleExpanded = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const toggleSelectPlan = (planId) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredPlans.map((plan) => plan.id);
    const allSelected = filteredIds.every((id) =>
      selectedPlanIds.includes(id)
    );

    if (allSelected) {
      setSelectedPlanIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedPlanIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const deleteSelectedStudents = async () => {
    if (selectedPlanIds.length === 0) {
      alert("Select at least one student to delete.");
      return;
    }

    if (
      !confirm(
        `Delete ${selectedPlanIds.length} selected student submission(s)?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedPlanIds.map((id) => axios.delete(`${API_BASE_URL}/${id}`))
      );

      alert("Selected students deleted.");
      fetchPlans();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Could not delete selected students.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-100 px-6 py-10 md:px-10 md:py-12 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-300/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-full font-black text-sm mb-7">
                <Sparkles size={18} />
                Admin Mode
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                Dashboard.
              </h1>

              <p className="text-blue-50 mt-6 max-w-2xl text-lg">
                View submitted study plans, manage student submissions, and
                export everything to Excel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={fetchPlans}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-5 py-4 rounded-2xl hover:bg-blue-50 transition font-black shadow-lg"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 bg-yellow-300 text-blue-950 px-5 py-4 rounded-2xl hover:bg-yellow-400 transition font-black shadow-lg"
              >
                <Download size={18} />
                Export Excel
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Students</p>
            <h2 className="text-5xl font-black text-blue-700">
              {totalStudents}
            </h2>
          </div>

          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Subjects</p>
            <h2 className="text-5xl font-black text-blue-700">
              {totalSubjects}
            </h2>
          </div>

          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Grade III</p>
            <h2 className="text-5xl font-black text-yellow-700">
              {totalGradeIiiHours}
            </h2>
          </div>

          <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl">
            <p className="text-sm text-slate-500 font-black">Grade IV</p>
            <h2 className="text-5xl font-black text-blue-700">
              {totalGradeIvHours}
            </h2>
          </div>
        </div>

        <div className="bg-white border-4 border-blue-100 p-6 rounded-[2rem] shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="relative md:col-span-2">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or student number"
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-2xl bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="relative">
              <CalendarDays
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />

              <select
                value={schoolYearFilter}
                onChange={(e) => setSchoolYearFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-2xl bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-500 transition"
              >
                {schoolYears.map((year) => (
                  <option key={year} value={year}>
                    {year === "All" ? "All School Years" : year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={deleteSelectedStudents}
              disabled={selectedPlanIds.length === 0}
              className={`inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black transition ${
                selectedPlanIds.length === 0
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={toggleSelectAllFiltered}
              className="inline-flex items-center gap-2 bg-yellow-300 text-blue-950 px-4 py-2 rounded-2xl font-black hover:bg-yellow-400 transition"
            >
              <CheckSquare size={18} />
              Select All Filtered
            </button>

            <span className="text-sm font-bold text-slate-600">
              Selected: {selectedPlanIds.length}
            </span>
          </div>
        </div>

        {loading && (
          <div className="bg-white border-4 border-blue-100 p-10 rounded-[2rem] shadow-xl text-center">
            <RefreshCw
              size={32}
              className="animate-spin mx-auto mb-3 text-blue-600"
            />
            <p className="font-black text-slate-700">Loading study plans...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-4 border-red-200 text-red-700 p-6 rounded-[2rem] mb-8 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} />
              <span className="font-black">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && filteredPlans.length === 0 && (
          <div className="bg-white border-4 border-blue-100 p-10 rounded-[2rem] shadow-xl text-center text-slate-600">
            <Inbox size={42} className="mx-auto mb-3 text-blue-400" />
            <h3 className="text-xl font-black text-slate-800">
              No study plans found
            </h3>
            <p className="text-slate-500 mt-1">
              Try changing your search or school year filter.
            </p>
          </div>
        )}

        {!loading && !error && filteredPlans.length > 0 && (
          <div className="space-y-6">
            {filteredPlans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              const isSelected = selectedPlanIds.includes(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`bg-white border-4 rounded-[2rem] shadow-xl overflow-hidden ${
                    isSelected ? "border-yellow-300" : "border-blue-100"
                  }`}
                >
                  <div className="p-6 md:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectPlan(plan.id)}
                        className="mt-5 w-5 h-5 accent-blue-600"
                      />

                      <div className="bg-yellow-300 text-blue-950 p-4 rounded-2xl">
                        <Users size={28} />
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-slate-900">
                          {plan.fullName}
                        </h2>

                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1 bg-yellow-100 border-2 border-yellow-200 px-3 py-1 rounded-full font-bold">
                            <Hash size={14} />
                            {plan.studentNumber}
                          </span>

                          <span className="inline-flex items-center gap-1 bg-blue-50 border-2 border-blue-100 px-3 py-1 rounded-full font-bold">
                            <CalendarDays size={14} />
                            {plan.schoolYear || "No school years"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:min-w-[560px]">
                      <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl text-center">
                        <p className="text-xs font-black text-blue-700">
                          Subjects
                        </p>
                        <p className="text-3xl font-black text-blue-900">
                          {getTotalSubjects(plan)}
                        </p>
                      </div>

                      <div className="bg-yellow-100 border-2 border-yellow-200 p-4 rounded-2xl text-center">
                        <p className="text-xs font-black text-yellow-800">
                          Grade III
                        </p>
                        <p className="text-3xl font-black text-yellow-900">
                          {getTotalGradeIiiHours(plan)}
                        </p>
                      </div>

                      <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl text-center">
                        <p className="text-xs font-black text-blue-700">
                          Grade IV
                        </p>
                        <p className="text-3xl font-black text-blue-900">
                          {getTotalGradeIvHours(plan)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpanded(plan.id)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-black hover:bg-blue-700 transition"
                      >
                        {isExpanded ? (
                          <>
                            Hide <ChevronUp size={18} />
                          </>
                        ) : (
                          <>
                            View <ChevronDown size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t-4 border-blue-100 bg-blue-50/70 p-6 md:p-7">
                      <h3 className="font-black text-slate-900 mb-5 text-xl">
                        Selected Subjects
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {plan.subjects?.map((subject) => {
                          const chosenGrade =
                            subject.selectedGrade ||
                            (Number(subject.gradeIiiHours || 0) > 0
                              ? "III"
                              : "IV");

                          const chosenHours =
                            chosenGrade === "III"
                              ? subject.gradeIiiHours
                              : subject.gradeIvHours;

                          return (
                            <div
                              key={
                                subject.id ||
                                `${subject.subject}-${subject.gradeIiiHours}-${subject.gradeIvHours}`
                              }
                              className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-sm"
                            >
                              <p className="font-black text-slate-900">
                                {subject.subject}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <span
                                  className={`font-black px-3 py-2 rounded-xl ${
                                    chosenGrade === "III"
                                      ? "bg-yellow-300 text-blue-950"
                                      : "bg-blue-600 text-white"
                                  }`}
                                >
                                  Grade {chosenGrade}: {chosenHours}h
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}