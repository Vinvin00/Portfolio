import { useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import BorderGlow from './components/ui/BorderGlow'
import './components/ui/BorderGlow.css'

const CARD_GLOW = {
  edgeSensitivity: 30,
  glowColor: '0 0% 92%',
  backgroundColor: '#111111',
  borderRadius: 0,
  glowRadius: 32,
  glowIntensity: 0.85,
  coneSpread: 25,
  animated: false,
  fillOpacity: 0.35,
  colors: ['#525252', '#737373', '#a3a3a3'],
}

const LIVE_CARD_GLOW = {
  ...CARD_GLOW,
  colors: ['#6b7280', '#9ca3af', '#d1d5db'],
  glowIntensity: 1,
}

function DomCardHost({ node }) {
  const setHostRef = useCallback(
    (host) => {
      if (!host || !node) return
      if (!host.contains(node)) host.appendChild(node)
    },
    [node],
  )

  return <div ref={setHostRef} className="card-dom-host" />
}

function CardGlowShell({ cardNode, glowProps }) {
  return (
    <BorderGlow className="projects-border-glow" {...glowProps}>
      <DomCardHost node={cardNode} />
    </BorderGlow>
  )
}

function wrapProjectCards() {
  const cards = document.querySelectorAll('.featured-grid .card, .small-grid .card')
  cards.forEach((card) => {
    if (card.closest('.card-glow-shell')) return

    const id = card.id
    const parent = card.parentElement
    if (!parent) return

    const shell = document.createElement('div')
    shell.className = 'card-glow-shell'
    if (id) shell.id = id
    if (card.classList.contains('card-featured')) shell.classList.add('card-glow-shell--featured')
    if (card.classList.contains('card-small')) shell.classList.add('card-glow-shell--small')

    parent.replaceChild(shell, card)
    card.removeAttribute('id')

    let glowProps = CARD_GLOW
    if (card.querySelector('.card-status.live')) glowProps = LIVE_CARD_GLOW
    else if (card.classList.contains('card-placeholder')) {
      glowProps = { ...CARD_GLOW, backgroundColor: '#090909' }
    }

    createRoot(shell).render(<CardGlowShell cardNode={card} glowProps={glowProps} />)
  })
}

function animateProjectCards() {
  if (typeof gsap === 'undefined') return

  const isEmbed = document.documentElement.classList.contains('embed')
  const embedScroller = document.getElementById('embed-viewport')

  gsap.to(['#c1', '#c2', '#c3'], {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.12,
    delay: 0.35,
  })

  const smallScroll = isEmbed
    ? { trigger: '#section-other', start: 'top 85%', scroller: embedScroller }
    : { trigger: '#section-other', start: 'top 85%' }

  gsap.to(['#c4', '#c5', '#c6', '#c7'], {
    scrollTrigger: smallScroll,
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.08,
  })
}

function setupFeaturedCardHover() {
  if (typeof gsap === 'undefined') return

  document.querySelectorAll('.card-glow-shell--featured').forEach((shell) => {
    if (shell.querySelector('.card-placeholder')) return
    shell.addEventListener('mouseenter', () =>
      gsap.to(shell, { y: -5, duration: 0.35, ease: 'power2.out' }),
    )
    shell.addEventListener('mouseleave', () =>
      gsap.to(shell, { y: 0, duration: 0.45, ease: 'power2.out' }),
    )
  })
}

wrapProjectCards()
animateProjectCards()
setupFeaturedCardHover()
