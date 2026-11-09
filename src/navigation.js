import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { moveCircle, overlapsCircle, stepVertical } from './physics.js';
import { createLookController } from './look.js';

/** Cámara del cliente, con WASD, mouse y colisiones independientes de la escena. */
export function createNavigation({ camera, domElement, colliders, config, onLockChange = () => {} }) {
  const controls = new PointerLockControls(camera, domElement);
  // Usamos el addon para capturar/liberar el mouse. Su giro directo queda
  // desactivado: la mirada se filtra y aplica una sola vez por cuadro abajo.
  controls.enabled = false;
  const look = createLookController(config.look);
  const lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');

  const keys = new Set();
  const velocity = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
  let enabled = true;
  let suspended = document.hidden;
  let verticalVelocity = 0;
  let seat = null, standingPoint = null, changingHeight = false;

  const clearInput = () => {
    keys.clear();
    velocity.set(0, 0, 0);
    lookEuler.setFromQuaternion(camera.quaternion, 'YXZ');
    look.reset({ yaw: lookEuler.y, pitch: lookEuler.x });
  };
  const onKeyDown = (event) => {
    if (!enabled || suspended || seat || !controls.isLocked || !movementKeys.has(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
  };
  const onKeyUp = (event) => {
    keys.delete(event.code);
    if (controls.isLocked && movementKeys.has(event.code)) event.preventDefault();
  };
  const onLock = () => {
    suspended = document.hidden;
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
    suspended = document.hidden;
    clearInput();
  };
  const onBlur = () => {
    suspended = true;
    clearInput();
  };
  const onFocus = () => {
    suspended = document.hidden;
    clearInput();
  };
  const onMouseMove = (event) => {
    if (!enabled || suspended || document.hidden || !controls.isLocked) return;
    look.addMovement(event.movementX, event.movementY);
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('pointerlockerror', onPointerLockError);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  controls.addEventListener('lock', onLock);
  controls.addEventListener('unlock', onUnlock);

  function reset() {
    verticalVelocity = 0; seat = null; standingPoint = null; changingHeight = false;
    camera.position.set(config.spawn.x, config.eyeHeight, config.spawn.z);
    camera.rotation.set(0, config.spawn.yaw ?? 0, 0, 'YXZ');
    clearInput();
  }

  function canReach(point, obstacles) {
    if (colliders.some(box => overlapsCircle(point, config.radius, box))) return false;
    const reached = moveCircle(camera.position, { x: point.x - camera.position.x, z: point.z - camera.position.z }, config.radius, obstacles);
    return Math.hypot(reached.x - point.x, reached.z - point.z) < 0.01;
  }
  function sit(nextSeat) {
    if (seat || !enabled || !nextSeat || Math.hypot(camera.position.x - nextSeat.position.x, camera.position.z - nextSeat.position.z) > 1.15) return false;
    const obstacles = colliders.filter(box => box !== nextSeat.collider);
    const reached = moveCircle(camera.position, { x: nextSeat.position.x - camera.position.x, z: nextSeat.position.z - camera.position.z }, config.radius, obstacles);
    if (Math.hypot(reached.x - nextSeat.position.x, reached.z - nextSeat.position.z) > 0.01) return false;
    standingPoint = { x: camera.position.x, z: camera.position.z };
    seat = nextSeat; changingHeight = true; verticalVelocity = 0;
    camera.position.x = seat.position.x; camera.position.z = seat.position.z;
    camera.lookAt(nextSeat.lookAt.x, nextSeat.lookAt.y + camera.position.y - nextSeat.eyeHeight, nextSeat.lookAt.z);
    clearInput(); return true;
  }
  function stand() {
    if (!seat) return false;
    const { x, z } = seat.position, obstacles = colliders.filter(box => box !== seat.collider);
    const candidates = [standingPoint, { x, z: z + 0.95 }, { x: x - 0.95, z }, { x: x + 0.95, z }];
    const point = candidates.find(candidate => candidate && canReach(candidate, obstacles));
    if (!point) return false;
    camera.position.x = point.x; camera.position.z = point.z;
    seat = null; standingPoint = null; changingHeight = true; verticalVelocity = 0; clearInput(); return true;
  }

  function update(dt) {
    if (!enabled || suspended || document.hidden || !controls.isLocked) return;
    const step = Math.min(Math.max(Number.isFinite(dt) ? dt : 0, 0), 0.05);
    const pose = look.update(step);
    if (pose.changed) camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
    if (changingHeight) {
      const height = seat ? seat.eyeHeight : config.eyeHeight;
      camera.position.y = THREE.MathUtils.damp(camera.position.y, height, 12, step);
      if (Math.abs(camera.position.y - height) < 0.001) { camera.position.y = height; changingHeight = false; }
    }
    if (seat) return; // Sentado se puede mirar e interactuar, pero WASD no arrastra la silla.
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
    if (!changingHeight) {
      const vertical = stepVertical(camera.position.y, verticalVelocity, step, config.gravity, config.eyeHeight);
      camera.position.y = vertical.height;
      verticalVelocity = vertical.velocity;
    }
  }

  reset();
  return {
    update,
    reset, sit, stand,
    get isSeated() { return Boolean(seat); },
    get seatId() { return seat?.id ?? null; },
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
      clearInput();
      if (!enabled) {
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
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      clearInput();
    },
  };
}
