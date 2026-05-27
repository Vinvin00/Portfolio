import OverlayCard from './OverlayCard'

export default function ProjectCard({ project }) {
  if (!project) return null

  return (
    <OverlayCard title={project.name}>
      <p>{project.description}</p>
      <div className="my-3 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90"
          >
            {tech}
          </span>
        ))}
      </div>
      <a
        href={project.github}
        target="_blank"
        rel="noreferrer"
        className="inline-flex pt-2 text-sm underline decoration-white/50 underline-offset-4"
      >
        ↗ View on GitHub
      </a>
    </OverlayCard>
  )
}
