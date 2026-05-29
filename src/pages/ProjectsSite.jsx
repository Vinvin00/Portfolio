import { PROJECTS } from '../config/objects'

const PAGE_BG = '#1a1a2e'

export default function ProjectsSite() {
  return (
    <div
      className="box-border h-screen w-screen overflow-hidden p-3 text-slate-100"
      style={{ background: PAGE_BG, fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <header className="mb-3 border-b border-white/10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">VB Portfolio</p>
        <h1 className="text-sm font-semibold text-slate-100">Projects</h1>
      </header>

      <div className="grid h-[calc(100%-3.25rem)] grid-cols-1 gap-2 overflow-hidden sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <article
            key={project.id}
            className="flex min-h-0 flex-col border border-white/10 bg-white/[0.04] p-2.5 transition hover:scale-[1.02] hover:border-sky-400/40 hover:shadow-[0_0_12px_rgba(56,189,248,0.15)]"
          >
            <h2 className="truncate text-xs font-semibold text-slate-100">{project.name}</h2>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-400">
              {project.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tech?.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 px-1.5 py-0.5 text-[9px] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="mt-auto pt-2 text-[10px] text-sky-400 no-underline hover:text-sky-300"
            >
              GitHub →
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
