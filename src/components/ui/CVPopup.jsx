export default function CVPopup() {
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-white/15 bg-gray-900/80 px-5 py-4 text-white shadow-lg backdrop-blur-md">
      <p className="mb-2 text-sm text-white/85">Near CV stand</p>
      <a
        href="/cv.pdf"
        download
        className="pointer-events-auto inline-flex rounded-md bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
      >
        Download CV
      </a>
    </div>
  )
}
