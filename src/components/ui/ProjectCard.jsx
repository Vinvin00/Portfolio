import OverlayCard from './OverlayCard'

export default function ProjectCard() {
  return (
    <OverlayCard title="Weather Spotify">
      <p>Generates Spotify playlists based on current weather conditions.</p>
      <p>
        <span className="font-semibold text-white">Tech:</span> Python, Spotify API,
        OpenWeatherMap API
      </p>
      <a
        href="https://github.com/Vinvin00/weather-spotify-playlist"
        target="_blank"
        rel="noreferrer"
        className="inline-flex pt-2 text-sm underline decoration-white/50 underline-offset-4"
      >
        View on GitHub
      </a>
    </OverlayCard>
  )
}
