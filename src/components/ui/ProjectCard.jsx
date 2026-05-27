import OverlayCard from './OverlayCard'
import useStore from '../../store/useStore'

export default function ProjectCard({ project }) {
  const isDarkMode = useStore((state) => state.isDarkMode)

  if (!project) return null

  return (
    <OverlayCard title={project.name} className="max-w-[340px] rounded-[20px] p-6">
      <p
        className="text-[13px]"
        style={{
          color: isDarkMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.4)',
          fontWeight: 300,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {project.description}
      </p>
      <div
        className="my-4 h-px w-full"
        style={{ background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)' }}
      />
      <div className="my-3 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center rounded-[7px] px-2 py-1 text-[11px]"
            style={{
              fontFamily: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
              background: isDarkMode ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(0,0,0,0.15)',
              borderBottom: isDarkMode ? '2px solid rgba(0,0,0,0.2)' : '2px solid rgba(0,0,0,0.12)',
              color: isDarkMode ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)',
            }}
          >
            {tech}
          </span>
        ))}
      </div>
      <a
        href={project.github}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 pt-2 text-xs tracking-[0.05em]"
        style={{ color: 'rgba(150, 200, 255, 0.95)' }}
      >
        View on GitHub <span aria-hidden="true">↗</span>
      </a>
    </OverlayCard>
  )
}
