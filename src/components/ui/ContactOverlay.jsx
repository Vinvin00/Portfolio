import OverlayCard from './OverlayCard'

export default function ContactOverlay() {
  return (
    <OverlayCard title="Contact">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-base">✉</span>
          <span>vincenzo@example.com</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">in</span>
          <a
            href="https://www.linkedin.com/in/vincenzo-placeholder"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/50 underline-offset-4"
          >
            LinkedIn
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base">{`</>`}</span>
          <a
            href="https://github.com/Vinvin00"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/50 underline-offset-4"
          >
            GitHub
          </a>
        </div>
      </div>
    </OverlayCard>
  )
}
