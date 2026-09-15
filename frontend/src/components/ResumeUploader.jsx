import { useRef, useState } from "react"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
}

function ResumeUploader({ file, setFile }) {
  const inputRef = useRef(null)

  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "No file was selected."
    }

    const isValidType =
      Object.keys(ACCEPTED_TYPES).includes(selectedFile.type) ||
      selectedFile.name.toLowerCase().endsWith(".pdf") ||
      selectedFile.name.toLowerCase().endsWith(".docx")

    if (!isValidType) {
      return "Please upload a PDF or DOCX file."
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
    inputRef.current?.click()
  }

  const handleRemove = () => {
    setFile(null)
    setError("")

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="w-full min-w-0">
      {/* Section heading */}
      <div className="mb-4 flex flex-col gap-2 min-[320px]:flex-row min-[320px]:items-center min-[320px]:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Resume
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Upload the candidate's resume
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
          PDF / DOCX
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
      />

      {!file ? (
        /* Upload area */
        <button
          type="button"
          onClick={handleBrowse}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-10 text-center transition-all duration-300 ${
            isDragging
              ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
              : "border-indigo-400/25 bg-slate-950/30 hover:border-indigo-400/50 hover:bg-indigo-500/5"
          }`}
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-cyan-500/[0.03]" />

          {/* Icon */}
          <div
            className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 ${
              isDragging
                ? "border-cyan-400/30 bg-cyan-400/10 scale-110"
                : "border-indigo-400/20 bg-indigo-500/10 group-hover:scale-105"
            }`}
          >
            <span className="text-3xl">📄</span>
          </div>

          {/* Text */}
          <div className="relative">
            <p className="text-base font-semibold text-white">
              {isDragging
                ? "Drop your resume here"
                : "Drop your resume here"}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              or{" "}
              <span className="font-medium text-indigo-400 transition-colors group-hover:text-cyan-400">
                click to browse
              </span>
            </p>

            <p className="mt-4 text-xs text-slate-600">
              PDF or DOCX • Maximum size 10 MB
            </p>
          </div>
        </button>
      ) : (
        /* Selected file */
        <div className="box-border flex min-h-[180px] w-full min-w-0 items-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4 sm:p-6">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
            {/* File icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              <span className="text-2xl">📄</span>
            </div>

            {/* File information */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">
                {file.name}
              </p>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{formatFileSize(file.size)}</span>

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

      {/* Validation error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <span>⚠️</span>

          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default ResumeUploader