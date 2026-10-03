import { useEffect, useMemo, useState } from "react";
import {
  generateStudyPlan,
  getLatestStudyPlan,
} from "./services/studyPlanService";

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 1);

  const end = new Date(start);
  end.setDate(end.getDate() + 13);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function formatTime(dateTime) {
  if (!dateTime) return "";

  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayHeading(dateString) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatPlanDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Something went wrong. Please try again."
  );
}

export default function MyStudyPlan() {
  const defaults = useMemo(
    () => getDefaultDates(),
    []
  );

  const [planName, setPlanName] = useState(
    "My Study Plan"
  );

  const [startDate, setStartDate] = useState(
    defaults.startDate
  );

  const [endDate, setEndDate] = useState(
    defaults.endDate
  );

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLatestPlan();
  }, []);

  const loadLatestPlan = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getLatestStudyPlan();
      setPlan(data);
    } catch (error) {
      if (error?.response?.status !== 404) {
        setError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!startDate || !endDate) {
      setError(
        "Please choose both a start date and an end date."
      );
      return;
    }

    if (endDate < startDate) {
      setError(
        "The end date cannot be before the start date."
      );
      return;
    }

    setGenerating(true);

    try {
      const generatedPlan =
        await generateStudyPlan({
          planName: planName.trim(),
          startDate,
          endDate,
        });

      setPlan(generatedPlan);

      setMessage(
        "Your personalized study plan was generated successfully."
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  const totalMinutes =
    plan?.sessions?.reduce(
      (sum, session) =>
        sum + (session.plannedMinutes || 0),
      0
    ) || 0;

  const groupedSessions = useMemo(() => {
    if (!plan?.sessions) {
      return [];
    }

    const groups = {};

    for (const session of plan.sessions) {
      const date =
        session.startAt?.split("T")[0];

      if (!date) continue;

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(session);
    }

    return Object.entries(groups)
      .sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
      )
      .map(([date, sessions]) => ({
        date,
        sessions: [...sessions].sort(
          (a, b) =>
            a.startAt.localeCompare(b.startAt)
        ),
      }));
  }, [plan]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-100">
          Personalized Planner
        </p>

        <h1 className="text-3xl font-black">
          My Study Plan
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100">
          Generate a personalized study schedule using
          your courses, deadlines, goals, availability,
          and study preferences.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900">
            Generate a plan
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose the period you want the planner to
            organize.
          </p>

          <form
            onSubmit={handleGenerate}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Plan name
              </label>

              <input
                type="text"
                value={planName}
                onChange={(event) =>
                  setPlanName(event.target.value)
                }
                maxLength={150}
                placeholder="My Study Plan"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Start date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                End date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating
                ? "Generating..."
                : "Generate Study Plan"}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </div>
          )}
        </section>

        <section>
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-gray-500">
                Loading your latest study plan...
              </p>
            </div>
          ) : !plan ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="text-4xl">📅</div>

              <h2 className="mt-4 text-xl font-black text-gray-900">
                No study plan yet
              </h2>

              <p className="mt-2 text-gray-500">
                Choose a planning period and generate your
                first personalized schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {plan.generationMethod}
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {plan.status}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900">
                      {plan.planName}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {formatPlanDate(plan.startDate)}
                      {" – "}
                      {formatPlanDate(plan.endDate)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
                      <div className="text-xl font-black text-gray-900">
                        {plan.sessions?.length || 0}
                      </div>

                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Sessions
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center">
                      <div className="text-xl font-black text-gray-900">
                        {formatDuration(totalMinutes)}
                      </div>

                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Planned
                      </div>
                    </div>
                  </div>
                </div>

                {plan.summary && (
                  <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-4 text-sm font-medium leading-relaxed text-blue-900">
                    {plan.summary}
                  </div>
                )}
              </section>

              {groupedSessions.length === 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
                  <p className="font-semibold text-gray-500">
                    This plan does not contain any study
                    sessions.
                  </p>
                </div>
              ) : (
                groupedSessions.map(
                  ({ date, sessions }) => (
                    <section
                      key={date}
                      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-black text-gray-900">
                          {formatDayHeading(date)}
                        </h3>

                        <span className="text-sm font-semibold text-gray-500">
                          {sessions.length}{" "}
                          {sessions.length === 1
                            ? "session"
                            : "sessions"}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <article
                            key={session.id}
                            className="rounded-2xl border border-gray-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-black text-blue-600">
                                  {formatTime(
                                    session.startAt
                                  )}
                                  {" – "}
                                  {formatTime(
                                    session.endAt
                                  )}
                                </p>

                                <h4 className="mt-1 text-lg font-black text-gray-900">
                                  {session.courseName ||
                                    session.title}
                                </h4>

                                {session.deadlineTitle && (
                                  <p className="mt-1 font-semibold text-gray-600">
                                    {
                                      session.deadlineTitle
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="w-fit rounded-xl bg-gray-100 px-3 py-2 text-sm font-black text-gray-700">
                                {formatDuration(
                                  session.plannedMinutes
                                )}
                              </span>
                            </div>

                            {session.goalTitle && (
                              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                                🎯 {session.goalTitle}
                              </div>
                            )}

                            {session.rationale && (
                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-bold text-blue-700">
                                  Why was this scheduled?
                                </summary>

                                <p className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
                                  {session.rationale}
                                </p>
                              </details>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>
                  )
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
