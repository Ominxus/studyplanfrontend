import { useState } from "react";
import { getPlanningInsight } from "./services/aiPlanningService";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "The AI planning assistant could not generate an insight."
  );
}

export default function AiPlanningInsight() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateInsight = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPlanningInsight();
      setInsight(data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
              AI ASSISTANT
            </span>
          </div>

          <h2 className="text-xl font-black text-gray-900">
            AI Planning Insight
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            Get personalized study guidance based on your courses,
            deadlines, goals, availability, study preferences,
            generated plan, and completed progress.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateInsight}
          disabled={loading}
          className="shrink-0 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Analyzing..."
            : insight
            ? "Refresh Insight"
            : "Analyze My Study Plan"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!insight && !loading && !error && (
        <div className="mt-6 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-6 text-center">
          <div className="text-3xl">
            ✨
          </div>

          <p className="mt-3 font-bold text-gray-800">
            Your personalized analysis is ready when you are.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            The AI assistant provides recommendations, but your
            deterministic planner remains responsible for the actual
            study schedule.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl bg-purple-50 p-6 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

          <p className="mt-4 font-bold text-purple-800">
            Analyzing your study data...
          </p>

          <p className="mt-1 text-sm text-purple-600">
            Checking workload, priorities, progress, deadlines,
            and your current planning situation.
          </p>
        </div>
      )}

      {insight && !loading && (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl bg-purple-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-purple-600">
              Academic Overview
            </p>

            <p className="mt-2 leading-relaxed text-gray-800">
              {insight.academicOverview}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Top Priority
            </p>

            <p className="mt-2 font-semibold leading-relaxed text-gray-800">
              {insight.topPriority}
            </p>
          </div>

          <div>
            <h3 className="text-base font-black text-gray-900">
              Recommendations
            </h3>

            {insight.recommendations?.length > 0 ? (
              <div className="mt-3 space-y-3">
                {insight.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={`${index}-${recommendation}`}
                      className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                        {index + 1}
                      </div>

                      <p className="text-sm font-medium leading-relaxed text-gray-700">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No additional recommendations were generated.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-base font-black text-gray-900">
              Planning Risks
            </h3>

            {insight.riskFlags?.length > 0 ? (
              <div className="mt-3 space-y-3">
                {insight.riskFlags.map(
                  (risk, index) => (
                    <div
                      key={`${index}-${risk}`}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                    >
                      <p className="text-sm font-semibold leading-relaxed text-amber-900">
                        ⚠️ {risk}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-800">
                  ✓ No significant planning risks were identified.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Current Plan Assessment
            </p>

            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700">
              {insight.planAssessment}
            </p>
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            AI-generated guidance should be treated as study planning
            support. Your timetable is created and validated separately
            by the deterministic scheduling engine.
          </p>
        </div>
      )}
    </section>
  );
}
