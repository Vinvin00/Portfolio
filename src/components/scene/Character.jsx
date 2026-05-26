import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import { useCharacterControls } from '../../hooks/useCharacterControls'

const CAMERA_OFFSET = { x: 10, y: 8, z: 10 }

export default function Character() {
  const meshRef = useRef(null)
  const firstIslandRender = useRef(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const { camera } = useThree()

  const currentIsland = useStore((state) => state.currentIsland)
  const introComplete = useStore((state) => state.introComplete)
  const playerPosition = useStore((state) => state.playerPosition)
  const setPlayerPosition = useStore((state) => state.setPlayerPosition)

  const canMove = introComplete && !isTransitioning
  const direction = useCharacterControls(canMove)

  const speed = 3

  useEffect(() => {
    if (!introComplete) return undefined

    if (firstIslandRender.current) {
      firstIslandRender.current = false
      return undefined
    }

    setIsTransitioning(true)

    const fall = { y: 8 }
    setPlayerPosition({ x: 0, y: 8, z: 0 })

    const timeline = gsap.timeline({
      onComplete: () => {
        setPlayerPosition({ x: 0, y: 1, z: 0 })
        setIsTransitioning(false)
      },
    })

    timeline
      .to(fall, {
        y: 1.15,
        duration: 0.5,
        ease: 'power2.in',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fall.y, z: 0 })
        },
      })
      .to(fall, {
        y: 1,
        duration: 0.2,
        ease: 'elastic.out(1, 0.3)',
        onUpdate: () => {
          setPlayerPosition({ x: 0, y: fall.y, z: 0 })
        },
      })

    return () => {
      timeline.kill()
    }
  }, [currentIsland, introComplete, setPlayerPosition])

  useFrame((_, delta) => {
    const nextPosition = { ...playerPosition }

    if (canMove && (direction.x !== 0 || direction.z !== 0)) {
      nextPosition.x += direction.x * speed * delta
      nextPosition.z += direction.z * speed * delta
      setPlayerPosition(nextPosition)
    }

    if (meshRef.current) {
      meshRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z)
    }

    const targetVector = new THREE.Vector3(
      playerPosition.x + CAMERA_OFFSET.x,
      playerPosition.y + CAMERA_OFFSET.y,
      playerPosition.z + CAMERA_OFFSET.z,
    )
    camera.position.lerp(targetVector, 0.08)

    camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z)
    camera.updateProjectionMatrix()
  })

  return (
    <mesh ref={meshRef} castShadow position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#d3d9e7" roughness={0.55} metalness={0.1} />
    </mesh>
  )
}
