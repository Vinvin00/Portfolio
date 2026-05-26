import { gsap } from 'gsap'
import { useEffect } from 'react'
import useStore from '../../store/useStore'

export default function IntroSequence() {
  const introComplete = useStore((state) => state.introComplete)
  const setIntroComplete = useStore((state) => state.setIntroComplete)
  const setPlayerPosition = useStore((state) => state.setPlayerPosition)

  useEffect(() => {
    if (introComplete) return undefined

    const fall = { y: 15 }
    setPlayerPosition({ x: 0, y: 15, z: 0 })

    const timeline = gsap.timeline({
      onComplete: () => {
        setPlayerPosition({ x: 0, y: 1, z: 0 })
        setIntroComplete(true)
      },
    })

    timeline
      .to(fall, {
        y: 1.1,
        duration: 1.2,
        ease: 'power2.in',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fall.y, z: 0 })
        },
      })
      .to(fall, {
        y: 1,
        duration: 0.35,
        ease: 'elastic.out(1, 0.3)',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fall.y, z: 0 })
        },
      })

    return () => {
      timeline.kill()
    }
  }, [introComplete, setIntroComplete, setPlayerPosition])

  return null
}
