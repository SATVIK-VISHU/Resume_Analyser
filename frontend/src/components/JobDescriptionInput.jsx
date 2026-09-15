import { useRef, useState } from "react"

const MAX_FILE_SIZE = 10 * 1024 * 1024

function JobDescriptionInput({
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  file,
  setFile,
}) {
  const fileInputRef = useRef(null)

  const [mode, setMode] = useState("manual")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "No file was selected."
    }

    const fileName = selectedFile.name.toLowerCase()

    const isValidType =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".txt")

    if (!isValidType) {
      return "Please upload a PDF, DOCX, or TXT file."
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must be less than 10 MB."
    }

    return ""
  }

  const handleFile = (selectedFile) => {
    setError("")

    const validationError = validateFile(selectedFile)

    if (validationError) {
      setFile(null)
      setError(validationError)
      return
    }

    setFile(selectedFile)
  }

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()

    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]

    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setFile(null)
    setError("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError("")
  }

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Job Description
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Provide the requirements for this position
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            Required
          </span>

        </div>
      </div>

      {/* Mode selector */}
      <div className="mb-5 flex w-full min-w-0 flex-col rounded-xl border border-white/10 bg-slate-950/50 p-1 min-[320px]:flex-row">

        <button
          type="button"
          onClick={() => switchMode("manual")}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all min-[320px]:gap-2 min-[320px]:px-4 min-[320px]:text-sm ${
            mode === "manual"
              ? "bg-indigo-500/15 text-indigo-300 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span>✏️</span>
          Manual Entry
        </button>

        <button
          type="button"
          onClick={() => switchMode("upload")}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all min-[320px]:gap-2 min-[320px]:px-4 min-[320px]:text-sm ${
            mode === "upload"
              ? "bg-cyan-500/15 text-cyan-300 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span>📄</span>
          Upload JD
        </button>

      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Manual mode */}
      {mode === "manual" && (
        <div className="space-y-4">

          {/* Job title */}
          <div>
            <label
              htmlFor="job-title"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Job Title
            </label>

            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              placeholder="e.g. Senior Python Developer"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {/* Job description */}
          <div>
            <label
              htmlFor="job-description"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Job Description
            </label>

            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description and requirements here..."
              className="min-h-[185px] w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
            />

            <div className="mt-2 flex justify-end text-xs text-slate-600">
              {jobDescription.length} characters
            </div>
          </div>

        </div>
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div>

          {!file ? (
            <button
              type="button"
              onClick={handleBrowse}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-10 text-center transition-all duration-300 ${
                isDragging
                  ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
                  : "border-cyan-400/20 bg-slate-950/30 hover:border-cyan-400/50 hover:bg-cyan-500/5"
              }`}
            >

              {/* Background decoration */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-indigo-500/[0.03]" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  isDragging
                    ? "scale-110 border-cyan-400/30 bg-cyan-400/10"
                    : "border-cyan-400/20 bg-cyan-500/10 group-hover:scale-105"
                }`}
              >
                <span className="text-3xl">📄</span>
              </div>

              {/* Text */}
              <div className="relative">

                <p className="text-base font-semibold text-white">
                  Drop your job description here
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  or{" "}
                  <span className="font-medium text-cyan-400 transition-colors group-hover:text-indigo-400">
                    click to browse
                  </span>
                </p>

                <p className="mt-4 text-xs text-slate-600">
                  PDF, DOCX or TXT • Maximum size 10 MB
                </p>

              </div>

            </button>
          ) : (
            <div className="box-border flex min-h-[260px] w-full min-w-0 items-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4 sm:p-6">

              <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center">

                {/* File icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                  <span className="text-2xl">📄</span>
                </div>

                {/* File information */}
                <div className="min-w-0 flex-1">

                  <p className="truncate font-medium text-white">
                    {file.name}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">

                    <span>
                      {formatFileSize(file.size)}
                    </span>

                    <span>•</span>

                    <span className="text-emerald-400">
                      Ready for analysis
                    </span>

                  </div>

                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                >
                  Remove
                </button>

              </div>

            </div>
          )}

        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

    </div>
  )
}

export default JobDescriptionInput