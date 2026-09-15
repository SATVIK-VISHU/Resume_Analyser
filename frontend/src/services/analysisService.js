const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export async function analyzeResume({
  resumeFile,
  jobTitle,
  jobDescription,
  jobDescriptionFile,
  onProgress,
}) {
  const formData = new FormData()

  // Resume
  formData.append("resume", resumeFile)

  // Optional job title
  if (jobTitle) {
    formData.append("job_title", jobTitle)
  }

  // Manual JD
  if (jobDescription && jobDescription.trim()) {
    formData.append("job_description", jobDescription)
  }

  // Uploaded JD
  if (jobDescriptionFile) {
    formData.append("job_description_file", jobDescriptionFile)
  }

  const response = await fetch(`${API_BASE_URL}/analyze-stream`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))

    throw new Error(
      data.detail ||
        data.error ||
        `Analysis failed with status ${response.status}`
    )
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ""
  let finalResult = null

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")

    buffer = lines.pop() || ""

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      const message = JSON.parse(line)

      if (message.type === "progress") {
        onProgress?.(message)
      }

      if (message.type === "result") {
        finalResult = message.data
      }

      if (message.type === "error") {
        throw new Error(message.message)
      }
    }
  }

  if (!finalResult) {
    throw new Error("Analysis completed without returning a result.")
  }

  return finalResult
}