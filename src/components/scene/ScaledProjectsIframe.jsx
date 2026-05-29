import { PROJECTS_IFRAME_SRC } from '../../config/projectsIframe'

/** Full-size iframe; scaling is handled inside vincenzo-projects.html (?embed=1). */
export default function ScaledProjectsIframe({
  src = PROJECTS_IFRAME_SRC,
  title = 'Projects',
  iframeStyle,
  fadeMs = 0,
}) {
  return (
    <iframe
      title={title}
      src={src}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: 0,
        background: '#090909',
        cursor: 'auto',
        opacity: fadeMs > 0 ? 1 : undefined,
        transition: fadeMs > 0 ? `opacity ${fadeMs}ms ease` : undefined,
        pointerEvents: 'auto',
        ...iframeStyle,
      }}
    />
  )
}
