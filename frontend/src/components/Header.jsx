function Header() {
  return (
    <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

        {/* Brand */}
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
            <span className="text-xl">🤖</span>
          </div>

          {/* Brand text */}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              AI Resume Screener
            </h1>

            <p className="text-xs text-slate-400">
              Intelligent candidate evaluation
            </p>
          </div>

        </div>

        {/* Status */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 sm:flex">

          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

          <span className="text-xs font-medium text-emerald-300">
            AI Engine Ready
          </span>

        </div>

      </div>
    </header>
  )
}

export default Header