import {
  useEffect,
  useState,
} from "react";

import {
  getStudyPlanHistory,
} from "./services/studyPlanService";

function formatDuration(minutes) {
  const total =
    Number(minutes) || 0;

  const hours =
    Math.floor(total / 60);

  const remainingMinutes =
    total % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatGeneratedAt(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    "Could not load study plan history."
  );
}

export default function PlanHistory({
  refreshKey,
}) {
  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const loadHistory =
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getStudyPlanHistory();

        setHistory(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Planning Lifecycle
          </p>

          <h2 className="mt-1 text-xl font-black text-gray-900">
            Plan History
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            Review previous deterministic and adaptive plans,
            their progress, and how your schedule evolved over time.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          disabled={loading}
          className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Loading..."
            : "Refresh History"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl bg-gray-50 p-6 text-center">
          <p className="font-semibold text-gray-500">
            Loading plan history...
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        history.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
            <div className="text-3xl">
              🗂️
            </div>

            <p className="mt-3 font-black text-gray-800">
              No study-plan history yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Generated plans will appear here automatically.
            </p>
          </div>
        )}

      {!loading &&
        history.length > 0 && (
          <div className="mt-6 space-y-4">
            {history.map(
              (item) => {
                const isCurrent =
                  item.status ===
                  "GENERATED";

                const isAdaptive =
                  item.generationMethod ===
                  "ADAPTIVE";

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-5 ${
                      isCurrent
                        ? "border-green-200 bg-green-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">
                            Plan #{item.id}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              isAdaptive
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {
                              item.generationMethod
                            }
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              isCurrent
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isCurrent
                              ? "CURRENT"
                              : item.status}
                          </span>

                          {item.sourcePlanId && (
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-600">
                              Based on Plan #
                              {
                                item.sourcePlanId
                              }
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-black text-gray-900">
                          {
                            item.planName
                          }
                        </h3>

                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {formatDate(
                            item.startDate
                          )}
                          {" – "}
                          {formatDate(
                            item.endDate
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Generated{" "}
                          {formatGeneratedAt(
                            item.generatedAt
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
                          <p className="text-lg font-black text-gray-900">
                            {
                              item.sessionCount
                            }
                          </p>

                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Sessions
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
                          <p className="text-lg font-black text-gray-900">
                            {formatDuration(
                              item.plannedMinutes
                            )}
                          </p>

                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Planned
                          </p>
                        </div>

                        <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                          <p className="text-lg font-black text-green-800">
                            {
                              item.completedSessionCount
                            }
                            /
                            {
                              item.sessionCount
                            }
                          </p>

                          <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                            Complete
                          </p>
                        </div>

                        <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                          <p className="text-lg font-black text-green-800">
                            {formatDuration(
                              item.actualCompletedMinutes
                            )}
                          </p>

                          <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                            Actual
                          </p>
                        </div>
                      </div>
                    </div>

                    {item.summary && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-bold text-blue-700">
                          View plan summary
                        </summary>

                        <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                          {
                            item.summary
                          }
                        </p>
                      </details>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
    </section>
  );
}
