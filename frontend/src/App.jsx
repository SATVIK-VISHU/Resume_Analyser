import { useState } from "react"
import { analyzeResume } from "./services/analysisService"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import ResumeUploader from "./components/ResumeUploader"
import JobDescriptionInput from "./components/JobDescriptionInput"
import AnalysisResult from "./components/AnalysisResult"

function App() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState("")
  const [analysisStage, setAnalysisStage] = useState("")

  const handleReset = () => {
    setResumeFile(null)
    setJobTitle("")
    setJobDescription("")
    setJobDescriptionFile(null)
    setAnalysisResult(null)
    setError("")
    setAnalysisStage("")
  }

  const handleAnalyze = async () => {
    setError("")
    setAnalysisResult(null)
    setAnalysisStage("")

    if (!resumeFile) {
      setError("Please upload a resume.")
      return
    }

    if (!jobDescription.trim() && !jobDescriptionFile) {
      setError("Please provide a job description or upload a JD file.")
      return
    }

    try {
      setIsAnalyzing(true)

      const result = await analyzeResume({
        resumeFile,
        jobTitle,
        jobDescription,
        jobDescriptionFile,
        onProgress: (message) => {
          setAnalysisStage(message.stage)
        },
      })

      setAnalysisStage("Completed")
      setAnalysisResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
      setAnalysisStage("")
    }
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100">

      {/* Background decoration */}
      <div className="background-glow" />

      {/* Application */}
      <div className="relative z-10">

        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="mx-auto min-w-0 w-full max-w-7xl px-2 py-8 sm:px-6 sm:py-12 lg:px-8">

          {/* Hero */}
          <HeroSection />

          {/* Analysis workspace */}
          <section className="mx-auto mt-12 w-full min-w-0 max-w-6xl">

            <div className="glass w-full min-w-0 rounded-3xl p-3 shadow-2xl shadow-black/20 sm:p-6 lg:p-8">

              {/* Workspace heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                  Analysis Workspace
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  Provide candidate & job details
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Upload the candidate's resume and provide the job
                  description. Our AI will compare both and generate
                  an explainable hiring recommendation.
                </p>
              </div>

              {/* Input columns */}
              <div className="grid min-w-0 gap-8 lg:grid-cols-2">

                {/* Resume */}
                <ResumeUploader
                  file={resumeFile}
                  setFile={setResumeFile}
                />

                {/* Job Description */}
                <JobDescriptionInput
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  file={jobDescriptionFile}
                  setFile={setJobDescriptionFile}
                />

              </div>

              {/* Analyze button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
            </button>
            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                ⚠️ {error}
              </div>
            )}
            {isAnalyzing && (
              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">

                <div className="mb-5">
                  <p className="text-sm font-semibold text-cyan-300">
                    AI Analysis in Progress
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Our AI is reviewing the candidate against the job requirements.
                  </p>
                </div>

                <div className="space-y-3">

                  {[
                    {
                      stage: "Reading resume",
                      label: "Reading uploaded resume",
                    },
                    {
                      stage: "Understanding job",
                      label: "Understanding job requirements",
                    },
                    {
                      stage: "Analyzing candidate",
                      label: "Analyzing candidate experience and skills",
                    },
                    {
                      stage: "Generating recommendation",
                      label: "Generating hiring recommendation",
                    },
                  ].map((item, index, stages) => {

                    const currentIndex = stages.findIndex(
                      (stage) => stage.stage === analysisStage
                    )

                    const isCompleted =
                      currentIndex !== -1 && index < currentIndex

                    const isCurrent =
                      item.stage === analysisStage

                    return (
                      <div
                        key={item.stage}
                        className="flex items-center gap-3"
                      >

                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                            isCompleted
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                              : isCurrent
                                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                                : "border-white/10 bg-white/[0.03] text-slate-600"
                          }`}
                        >
                          {isCompleted ? (
                            "✓"
                          ) : isCurrent ? (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <p
                          className={`text-sm ${
                            isCompleted
                              ? "text-emerald-300"
                              : isCurrent
                                ? "font-medium text-cyan-300"
                                : "text-slate-600"
                          }`}
                        >
                          {item.label}
                        </p>

                      </div>
                    )
                  })}

                </div>
              </div>
            )}
          </div>

            </div>
            <AnalysisResult
              analysisResult={analysisResult}
              onReset={handleReset}
            />
          </section>

        </main>

      </div>

    </div>
  )
}

export default App