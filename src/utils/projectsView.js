import * as THREE from 'three'
import { MAIN_ISLAND_OBJECTS } from '../config/objects'

export const PROJECTS_VIEW = {
  /** Horizontal orbit pivot on the desk (from model origin). */
  focusHeight: 1.19,
  /** Orbital camera height (from model origin). */
  orbitHeight: 1.72,
  /** Small vertical nudge after orbit framing; look-at shifts with camera by the same amount. */
  camHeightOffset: 0,
  /** Look-at target sits this far above the orbit pivot (screen center). */
  lookAtHeight: 0.36,
  yawOffset: -0.2,
  camDist: 1.28,
  positionBlend: 0.9,
  lookRightOffset: -0.65,
}

function orbitAroundFocus(point, pivot, yaw) {
  const offset = new THREE.Vector3().subVectors(point, pivot)
  offset.y = 0
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
  return pivot.clone().add(offset)
}

export function getProjectsDeskConfig() {
  const door = MAIN_ISLAND_OBJECTS.find((obj) => obj.id === 'projects-door')
  const modelX = (door?.position.x ?? -6) + (door?.modelOffsetX ?? 0)
  const modelY = (door?.position.y ?? 0) + (door?.modelOffsetY ?? 0)
  const modelZ = (door?.position.z ?? 1.6) + (door?.modelOffsetZ ?? 0)
  const modelYaw =
    Math.atan2(-modelX, -modelZ) + (door?.modelFacingOffsetY ?? 0)
  const deskFaceDir = new THREE.Vector3(
    -Math.sin(modelYaw),
    0,
    -Math.cos(modelYaw),
  ).normalize()

  return { modelX, modelY, modelZ, deskFaceDir }
}

function buildProjectsCameraFrame(cameraY, focusY, baseCameraY) {
  const { modelX, modelZ, deskFaceDir } = getProjectsDeskConfig()
  const { lookAtHeight, yawOffset, camDist, lookRightOffset } = PROJECTS_VIEW

  const focus = new THREE.Vector3(modelX, focusY, modelZ)
  const aimY = focusY + lookAtHeight

  let cameraPosition = focus.clone().addScaledVector(deskFaceDir, camDist)
  cameraPosition.y = cameraY
  cameraPosition = orbitAroundFocus(cameraPosition, focus, yawOffset)
  cameraPosition.y = cameraY

  const viewDir = focus.clone().sub(cameraPosition)
  viewDir.y = 0
  if (viewDir.lengthSq() > 0) viewDir.normalize()
  else viewDir.set(0, 0, -1)

  const camRight = new THREE.Vector3()
    .crossVectors(viewDir, new THREE.Vector3(0, 1, 0))
    .normalize()

  const lookAt = focus.clone().addScaledVector(camRight, lookRightOffset)
  // Fixed aim height on the desk; shifts with camera only for parallel vertical moves.
  lookAt.y = aimY + (cameraY - baseCameraY)

  return { cameraPosition, lookAt, focus }
}

function getProjectsHeights() {
  const { modelY } = getProjectsDeskConfig()
  const { focusHeight, orbitHeight, camHeightOffset } = PROJECTS_VIEW
  const focusY = modelY + focusHeight
  const orbitCameraY = modelY + orbitHeight
  const finalCameraY = orbitCameraY + camHeightOffset
  return { focusY, orbitCameraY, finalCameraY }
}

/** Final look-at used by ProjectsScreen HUD (matches settled camera). */
export function getProjectsLookAtTarget() {
  const { focusY, orbitCameraY, finalCameraY } = getProjectsHeights()
  return buildProjectsCameraFrame(finalCameraY, focusY, orbitCameraY).lookAt
}

export function getProjectsViewTargets(playerPosition, cameraOffset) {
  const { focusHeight, camHeightOffset, positionBlend } = PROJECTS_VIEW
  const { focusY, orbitCameraY, finalCameraY } = getProjectsHeights()

  const orbit = buildProjectsCameraFrame(orbitCameraY, focusY, orbitCameraY)
  const settled = buildProjectsCameraFrame(finalCameraY, focusY, orbitCameraY)

  const followCamPos = new THREE.Vector3(
    playerPosition.x + cameraOffset.x,
    playerPosition.y + cameraOffset.y,
    playerPosition.z + cameraOffset.z,
  )

  const targetCamPos = followCamPos.clone().lerp(settled.cameraPosition, positionBlend)
  targetCamPos.x = settled.cameraPosition.x
  targetCamPos.z = settled.cameraPosition.z
  targetCamPos.y = finalCameraY

  const hasVerticalMove = Math.abs(camHeightOffset) > 1e-4

  return {
    lookAtTarget: settled.lookAt,
    lookAtAtOrbit: orbit.lookAt,
    targetCamPos,
    orbitCamPos: orbit.cameraPosition,
    hasVerticalMove,
    focus: settled.focus,
  }
}
