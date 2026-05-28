import * as THREE from 'three'
import { MAIN_ISLAND_OBJECTS } from '../config/objects'

export const PROJECTS_VIEW = {
  eyeHeight: 0.96,
  lookPitchUp: 0.58,
  yawOffset: -0.2,
  camDist: 1.05,
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

/** Same look-at target the projects camera tween uses (independent of player position). */
export function getProjectsLookAtTarget() {
  const { modelX, modelY, modelZ, deskFaceDir } = getProjectsDeskConfig()
  const { eyeHeight, lookPitchUp, yawOffset, camDist, lookRightOffset } = PROJECTS_VIEW

  const eyeY = modelY + eyeHeight
  const focus = new THREE.Vector3(modelX, eyeY, modelZ)

  let deskCamPos = focus.clone().addScaledVector(deskFaceDir, camDist)
  deskCamPos.y = eyeY
  deskCamPos = orbitAroundFocus(deskCamPos, focus, yawOffset)
  deskCamPos.y = eyeY

  const viewDir = focus.clone().sub(deskCamPos)
  viewDir.y = 0
  viewDir.normalize()
  const camRight = new THREE.Vector3()
    .crossVectors(viewDir, new THREE.Vector3(0, 1, 0))
    .normalize()
  const lookAtTarget = focus.clone().addScaledVector(camRight, lookRightOffset)
  lookAtTarget.y = eyeY + lookPitchUp

  return lookAtTarget
}

export function getProjectsViewTargets(playerPosition, cameraOffset) {
  const { modelX, modelY, modelZ, deskFaceDir } = getProjectsDeskConfig()
  const { eyeHeight, lookPitchUp, yawOffset, camDist, positionBlend, lookRightOffset } =
    PROJECTS_VIEW

  const eyeY = modelY + eyeHeight
  const focus = new THREE.Vector3(modelX, eyeY, modelZ)

  let deskCamPos = focus.clone().addScaledVector(deskFaceDir, camDist)
  deskCamPos.y = eyeY
  deskCamPos = orbitAroundFocus(deskCamPos, focus, yawOffset)
  deskCamPos.y = eyeY

  const followCamPos = new THREE.Vector3(
    playerPosition.x + cameraOffset.x,
    playerPosition.y + cameraOffset.y,
    playerPosition.z + cameraOffset.z,
  )
  const targetCamPos = followCamPos.clone().lerp(deskCamPos, positionBlend)
  targetCamPos.x = deskCamPos.x
  targetCamPos.z = deskCamPos.z
  targetCamPos.y = THREE.MathUtils.lerp(followCamPos.y, eyeY, positionBlend)

  const viewDir = focus.clone().sub(deskCamPos)
  viewDir.y = 0
  viewDir.normalize()
  const camRight = new THREE.Vector3()
    .crossVectors(viewDir, new THREE.Vector3(0, 1, 0))
    .normalize()
  const lookAtTarget = focus.clone().addScaledVector(camRight, lookRightOffset)
  lookAtTarget.y = eyeY + lookPitchUp

  return { lookAtTarget, targetCamPos, focus }
}
