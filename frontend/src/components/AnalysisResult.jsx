function AnalysisResult({ analysisResult, onReset }) {
  if (!analysisResult) {
    return null
  }

  const candidate = analysisResult.candidate
  const job = analysisResult.job
  const result = analysisResult.result

  const details = result?.details || {}

  const matchingSkills = details.matching_skills || []
  const missingSkills = details.missing_important_skills || []

  const score = result?.score ?? 0
  const breakdown = result?.breakdown || {}

  let scoreColor = "#ef4444"

  if (score >= 85) {
    scoreColor = "#34d399"
  } else if (score >= 70) {
    scoreColor = "#22d3ee"
  } else if (score >= 40) {
    scoreColor = "#f59e0b"
  }

  let scoreLabel = "Low Match"

  if (score >= 85) {
    scoreLabel = "Excellent Match"
  } else if (score >= 70) {
    scoreLabel = "Good Match"
  } else if (score >= 40) {
    scoreLabel = "Moderate Match"
  }

  return (
    <section className="mt-10">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Analysis Result
        </p>

        <h3 className="mt-2 text-2xl font-bold text-white">
          Candidate Evaluation
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          AI-generated comparison between the candidate and the job
          requirements.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          ← New Analysis
        </button>
      </div>

      {/* Candidate + Score */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Candidate */}
        <div className="glass rounded-2xl border border-white/10 p-6 lg:col-span-2">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Candidate
          </p>

          <h4 className="mt-2 text-2xl font-bold text-white">
            {candidate?.name || "Unknown Candidate"}
          </h4>

          {candidate?.email && (
            <p className="mt-2 text-sm text-slate-400">
              {candidate.email}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500">
                Experience
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {candidate?.total_experience_years ?? "N/A"} years
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-slate-500">
                Experience Requirement
              </p>

              <p
                className={`mt-1 text-lg font-semibold ${
                  details.experience_requirement_met
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {details.experience_requirement_met
                  ? "Met"
                  : "Not Met"}
              </p>
            </div>

          </div>
        </div>

        {/* Score */}
        <div className="glass flex flex-col items-center justify-center rounded-2xl border border-cyan-400/20 p-6 text-center">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Match Score
          </p>

          {(() => {

            return (
              <>
                <div
                  className="relative mt-5 flex h-36 w-36 items-center justify-center rounded-full p-2"
                  style={{
                    background: `conic-gradient(${scoreColor} ${score}%, rgba(255,255,255,0.05) ${score}% 100%)`,
                  }}
                >
                  {/* Inner circle */}
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0f1522]">
                    <div>
                      <span
                        className="text-4xl font-bold"
                        style={{ color: scoreColor }}
                      >
                        {score}
                      </span>

                      <span className="ml-0.5 text-lg font-semibold text-slate-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-lg font-semibold text-white">
                  {scoreLabel}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Overall candidate compatibility
                </p>
              </>
            )
          })()}

        </div>

      </div>
      
      {/* Score Breakdown */}
      <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-6">

        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Score Breakdown
        </p>

                <h4 className="mt-2 text-xl font-bold text-white">
          How the match score was calculated
        </h4>

                <div className="mt-6 space-y-5">

          {[
            {
              label: "Required Skills",
              value: breakdown.required_skills ?? 0,
              max: 50,
            },
            {
              label: "Experience",
              value: breakdown.experience ?? 0,
              max: 25,
            },
            {
              label: "Preferred Skills",
              value: breakdown.preferred_skills ?? 0,
              max: 10,
            },
            {
              label: "Education",
              value: breakdown.education ?? 0,
              max: 10,
            },
            {
              label: "Other Requirements",
              value: breakdown.other_requirements ?? 0,
              max: 5,
            },
          ].map((item) => (
            <div key={item.label}>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {item.label}
                </span>

                <span className="font-semibold text-white">
                  {item.value} / {item.max}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{
                    width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                  }}
                />
              </div>

            </div>
          ))}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="font-semibold text-slate-300">
              Total Score
            </span>

            <span
              className="text-xl font-bold"
              style={{ color: scoreColor }}
            >
              {score} / 100
            </span>
          </div>

        </div>

      </div>

      {/* Job Analysis */}
      <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.03] p-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Job Analysis
            </p>

            <h4 className="mt-2 text-xl font-bold text-white">
              {job?.role || "Job Requirements"}
            </h4>
          </div>

          {job?.minimum_experience != null && (
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
              {job.minimum_experience}+ years experience
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Required Skills */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Required Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {job?.required_skills?.length > 0 ? (
                job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No required skills specified.
                </p>
              )}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Preferred Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {job?.preferred_skills?.length > 0 ? (
                job.preferred_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No preferred skills specified.
                </p>
              )}
            </div>
          </div>

        </div>
        {/* 👇 ADD THE NEW CODE HERE 👇 */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Education */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Education Requirements
            </p>

            <div className="mt-3 space-y-2">
              {job?.education_requirements?.length > 0 ? (
                job.education_requirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300"
                  >
                    {requirement}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No education requirements specified.
                </p>
              )}
            </div>
          </div>

          {/* Other Requirements */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Other Requirements
            </p>

            <div className="mt-3 space-y-2">
              {job?.other_requirements?.length > 0 ? (
                job.other_requirements.map((requirement, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300"
                  >
                    {requirement}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No other requirements specified.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* 👆 END OF NEW CODE 👆 */}
      </div>
      
      
      {/* Skills */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* Matching */}
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-6">

          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>

            <h4 className="font-semibold text-white">
              Matching Skills
            </h4>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {matchingSkills.length > 0 ? (
              matchingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No matching skills found.
              </p>
            )}
          </div>

        </div>

        {/* Missing */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-6">

          <div className="flex items-center gap-2">
            <span className="text-amber-400">⚠</span>

            <h4 className="font-semibold text-white">
              Missing Important Skills
            </h4>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No important skills are missing.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Hiring Recommendation */}
      <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.03] p-6">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Hiring Recommendation
            </p>

            <h4 className="mt-2 text-xl font-bold text-white">
              {scoreLabel}
            </h4>
          </div>

          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold text-indigo-300">
            AI Assessment
          </span>

        </div>

        <div className="mt-5 border-t border-white/10 pt-5">

          <p className="text-sm leading-7 text-slate-300">
            {details.final_verdict ||
              "No hiring recommendation was provided."}
          </p>

        </div>

      </div>

    </section>
  )
}

export default AnalysisResult