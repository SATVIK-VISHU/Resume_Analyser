function HeroSection() {
  return (
    <section className="mx-auto max-w-3xl text-center animate-fade-in">

      {/* Eyebrow */}
      <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-3 py-2 text-xs text-indigo-300 sm:px-4 sm:text-sm">
        <span>✨</span>

        <span>
          AI-powered recruitment analysis
        </span>
      </div>

      {/* Main heading */}
      <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">

        <span>
          Find the right candidate
        </span>

        <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
          in seconds.
        </span>

      </h2>

      {/* Description */}
      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
        Upload a resume and provide a job description. Our AI analyzes
        skills, experience, education, projects, and overall compatibility
        to generate an explainable hiring recommendation.
      </p>

    </section>
  )
}

export default HeroSection