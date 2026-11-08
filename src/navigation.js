import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { moveCircle, stepVertical } from './physics.js';

/** Cámara del cliente, con WASD, mouse y colisiones independientes de la escena. */
export function createNavigation({ camera, domElement, colliders, config, onLockChange = () => {} }) {
  const controls = new PointerLockControls(camera, domElement);
  controls.pointerSpeed = 0.75;
  controls.minPolarAngle = Math.PI * 0.08;
  controls.maxPolarAngle = Math.PI * 0.92;

  const keys = new Set();
  const velocity = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
  let enabled = true;
  let verticalVelocity = 0;

  const clearInput = () => {
    keys.clear();
    velocity.set(0, 0, 0);
  };
  const onKeyDown = (event) => {
    if (!enabled || !controls.isLocked || !movementKeys.has(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
  };
  const onKeyUp = (event) => {
    keys.delete(event.code);
    if (controls.isLocked && movementKeys.has(event.code)) event.preventDefault();
  };
  const onLock = () => {
    clearInput();
    onLockChange(true);
  };
  const onUnlock = () => {
    clearInput();
    onLockChange(false);
  };
  const onPointerLockError = () => {
    clearInput();
    domElement.dispatchEvent(new CustomEvent('navigationerror', {
      detail: { message: 'El navegador no pudo capturar el mouse. Volvé a pulsar «Entrar al local» y permití la captura.' },
    }));
  };
  const onVisibilityChange = () => {
    if (document.hidden) clearInput();
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('pointerlockerror', onPointerLockError);
  window.addEventListener('blur', clearInput);
  controls.addEventListener('lock', onLock);
  controls.addEventListener('unlock', onUnlock);

  function reset() {
    clearInput();
    verticalVelocity = 0;
    camera.position.set(config.spawn.x, config.eyeHeight, config.spawn.z);
    camera.rotation.set(0, config.spawn.yaw ?? 0, 0, 'YXZ');
  }

  function update(dt) {
    if (!enabled || !controls.isLocked) return;
    const step = Math.min(Math.max(Number.isFinite(dt) ? dt : 0, 0), 0.05);
    const frontInput = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'));
    const sideInput = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, camera.up).normalize();
    direction.copy(forward).multiplyScalar(frontInput).addScaledVector(right, sideInput);
    if (direction.lengthSq() > 0) direction.normalize();
    const smoothing = 1 - Math.exp(-config.acceleration * step);
    velocity.lerp(direction.multiplyScalar(config.speed), smoothing);
    if (velocity.lengthSq() < 0.000001) velocity.set(0, 0, 0);

    const next = moveCircle(camera.position, {
      x: velocity.x * step,
      z: velocity.z * step,
    }, config.radius, colliders);
    camera.position.x = next.x;
    camera.position.z = next.z;
    const vertical = stepVertical(camera.position.y, verticalVelocity, step, config.gravity, config.eyeHeight);
    camera.position.y = vertical.height;
    verticalVelocity = vertical.velocity;
  }

  reset();
  return {
    update,
    reset,
    enter() {
      if (!enabled || controls.isLocked) return;
      try {
        controls.lock();
      } catch {
        onPointerLockError();
      }
    },
    exit() {
      clearInput();
      if (controls.isLocked) controls.unlock();
    },
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        clearInput();
        if (controls.isLocked) controls.unlock();
      }
    },
    getPosition: () => camera.position.clone(),
    get isLocked() { return controls.isLocked; },
    dispose() {
      if (controls.isLocked) controls.unlock();
      controls.dispose();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      window.removeEventListener('blur', clearInput);
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      clearInput();
    },
  };
}
