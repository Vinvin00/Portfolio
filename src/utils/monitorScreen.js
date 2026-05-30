import * as THREE from 'three'

const _center = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3()
const _scratch = new THREE.Vector3()

/** World-space center of the mesh bounding box. */
export function getMonitorWorldCenter(mesh, target = new THREE.Vector3()) {
  mesh.updateWorldMatrix(true, true)
  const geometry = mesh.geometry
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const box = geometry.boundingBox
  _scratch.set((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, (box.min.z + box.max.z) / 2)
  return target.copy(_scratch).applyMatrix4(mesh.matrixWorld)
}

/**
 * Direction the screen faces (toward the viewer), from the thinnest bbox axis in local space.
 */
export function getMonitorFacingNormal(mesh, target = new THREE.Vector3()) {
  mesh.updateWorldMatrix(true, true)
  const geometry = mesh.geometry
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const size = new THREE.Vector3()
  geometry.boundingBox.getSize(size)

  const localNormal = new THREE.Vector3(0, 0, 1)
  if (size.x <= size.y && size.x <= size.z) localNormal.set(1, 0, 0)
  else if (size.y <= size.z) localNormal.set(0, 1, 0)

  return target.copy(localNormal).transformDirection(mesh.matrixWorld).normalize()
}

function sortFaceCorners(corners, normal, center) {
  _up.set(0, 1, 0)
  _right.crossVectors(_up, normal)
  if (_right.lengthSq() < 1e-6) {
    _right.set(1, 0, 0)
  } else {
    _right.normalize()
  }
  _up.crossVectors(normal, _right).normalize()

  return [...corners].sort((a, b) => {
    _scratch.copy(a).sub(center)
    const ay = _scratch.dot(_up)
    const ax = _scratch.dot(_right)
    _scratch.copy(b).sub(center)
    const by = _scratch.dot(_up)
    const bx = _scratch.dot(_right)
    if (Math.abs(ay - by) > 1e-4) return by - ay
    return ax - bx
  })
}

/** Four corners of the monitor screen face in world space (TL, TR, BR, BL). */
export function getMonitorScreenCorners(mesh, corners = []) {
  mesh.updateWorldMatrix(true, true)
  const geometry = mesh.geometry
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const bb = geometry.boundingBox

  const candidates = []
  for (let xi = 0; xi < 2; xi += 1) {
    for (let yi = 0; yi < 2; yi += 1) {
      for (let zi = 0; zi < 2; zi += 1) {
        _scratch.set(xi ? bb.max.x : bb.min.x, yi ? bb.max.y : bb.min.y, zi ? bb.max.z : bb.min.z)
        candidates.push(_scratch.clone().applyMatrix4(mesh.matrixWorld))
      }
    }
  }

  getMonitorWorldCenter(mesh, _center)
  getMonitorFacingNormal(mesh, _normal)

  let maxDot = -Infinity
  candidates.forEach((point) => {
    const dot = point.clone().sub(_center).dot(_normal)
    if (dot > maxDot) maxDot = dot
  })

  const faceCorners = candidates.filter((point) => {
    const dot = point.clone().sub(_center).dot(_normal)
    return Math.abs(dot - maxDot) < 1e-3
  })

  const sorted = sortFaceCorners(faceCorners.slice(0, 4), _normal, _center)
  for (let i = 0; i < 4; i += 1) {
    if (!corners[i]) corners[i] = new THREE.Vector3()
    corners[i].copy(sorted[i] ?? sorted[0])
  }

  return corners
}

/** Project world point to CSS pixels relative to the viewport. */
export function worldToScreenCss(worldPoint, camera, canvas, target = { left: 0, top: 0 }) {
  _scratch.copy(worldPoint).project(camera)
  const rect = canvas.getBoundingClientRect()
  target.left = ((_scratch.x + 1) / 2) * rect.width + rect.left
  target.top = ((1 - _scratch.y) / 2) * rect.height + rect.top
  return target
}

/** Bounding rect in viewport CSS pixels from four projected corners. */
export function cornersToViewportRect(corners, camera, canvas) {
  const xs = []
  const ys = []
  corners.forEach((corner) => {
    const p = worldToScreenCss(corner, camera, canvas)
    xs.push(p.left)
    ys.push(p.top)
  })
  const left = Math.min(...xs)
  const right = Math.max(...xs)
  const top = Math.min(...ys)
  const bottom = Math.max(...ys)
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  }
}
