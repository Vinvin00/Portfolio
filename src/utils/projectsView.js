import * as THREE from 'three'
import { MAIN_ISLAND_OBJECTS } from '../config/objects'
import { DEFAULT_PROJECTS_TUNING } from '../store/projectsViewTuning'

export const PROJECTS_VIEW = {
  tweenDuration: 1.4,
}

export function getProjectsDeskConfig() {
  const door = MAIN_ISLAND_OBJECTS.find((obj) => obj.id === 'projects-door')
  const modelX = (door?.position.x ?? -6) + (door?.modelOffsetX ?? 0)
  const modelY = (door?.position.y ?? 0) + (door?.modelOffsetY ?? 0)
  const modelZ = (door?.position.z ?? 1.6) + (door?.modelOffsetZ ?? 0)
  const modelYaw =
    Math.atan2(-modelX, -modelZ) + (door?.modelFacingOffsetY ?? 0)

  const screenNormal = new THREE.Vector3(
    -Math.sin(modelYaw),
    0,
    -Math.cos(modelYaw),
  ).normalize()
  const screenRight = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), screenNormal)
    .normalize()
  const screenUp = new THREE.Vector3(0, 1, 0)

  return { modelX, modelY, modelZ, screenNormal, screenRight, screenUp }
}

export function buildHeadOnProjectsFrame(tuning = DEFAULT_PROJECTS_TUNING) {
  const { modelX, modelY, modelZ, screenNormal, screenRight, screenUp } =
    getProjectsDeskConfig()

  const baseCenter = new THREE.Vector3(
    modelX,
    modelY + tuning.screenCenterHeight,
    modelZ,
  )

  const lookAt = baseCenter
    .clone()
    .addScaledVector(screenRight, tuning.lookSide)
    .addScaledVector(screenUp, tuning.lookUp)
    .addScaledVector(screenNormal, tuning.lookNormal)

  const viewDir = screenNormal.clone()
  viewDir.applyAxisAngle(screenUp, tuning.orbitYaw)
  viewDir.applyAxisAngle(screenRight, tuning.orbitPitch)
  viewDir.normalize()

  const cameraPosition = lookAt.clone().addScaledVector(viewDir, tuning.camDist)

  return {
    cameraPosition,
    lookAt,
    focus: lookAt.clone(),
    screenNormal: screenNormal.clone(),
  }
}

export function getProjectsLookAtTarget() {
  return buildHeadOnProjectsFrame().lookAt
}

export function getProjectsViewTargets() {
  const frame = buildHeadOnProjectsFrame()
  return {
    lookAtTarget: frame.lookAt,
    targetCamPos: frame.cameraPosition,
    focus: frame.focus,
    screenNormal: frame.screenNormal,
  }
}
