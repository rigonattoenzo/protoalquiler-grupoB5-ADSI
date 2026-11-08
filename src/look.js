// Filtro de mirada independiente de Three.js y del DOM.
export const LOOK_DEFAULTS = Object.freeze({
  sensitivity: 0.0015,
  maxMouseDelta: 160,
  maxQueuedAngle: Math.PI / 9,
  maxAngularSpeed: Math.PI,
  responsiveness: 26,
  minPitch: -Math.PI * 0.42,
  maxPitch: Math.PI * 0.42,
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrapAngle = (angle) => ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

export function createLookController(options = {}) {
  const settings = { ...LOOK_DEFAULTS, ...options };
  let yaw = 0;
  let pitch = 0;
  let pendingYaw = 0;
  let pendingPitch = 0;
  let skipFirstMovement = true;
  const angles = (changed = false) => ({ yaw, pitch, changed });

  function reset(pose = {}) {
    yaw = wrapAngle(Number.isFinite(pose.yaw) ? pose.yaw : 0);
    pitch = clamp(Number.isFinite(pose.pitch) ? pose.pitch : 0, settings.minPitch, settings.maxPitch);
    pendingYaw = 0;
    pendingPitch = 0;
    // La captura/reanudación puede producir un evento de recentrado del SO.
    skipFirstMovement = true;
    return angles();
  }

  function addMovement(dx, dy) {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return false;
    const pixels = Math.hypot(dx, dy);
    if (pixels === 0 || pixels > settings.maxMouseDelta) return false;
    if (skipFirstMovement) {
      skipFirstMovement = false;
      return false;
    }

    pendingYaw -= dx * settings.sensitivity;
    pendingPitch = clamp(pitch + pendingPitch - dy * settings.sensitivity, settings.minPitch, settings.maxPitch) - pitch;
    const queued = Math.hypot(pendingYaw, pendingPitch);
    if (queued > settings.maxQueuedAngle) {
      const scale = settings.maxQueuedAngle / queued;
      pendingYaw *= scale;
      pendingPitch *= scale;
    }
    return true;
  }

  function update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return angles();
    // Una pausa de render no debe convertirse en un giro de golpe al volver.
    const step = Math.min(dt, 0.05);
    const remaining = Math.hypot(pendingYaw, pendingPitch);
    if (remaining === 0) return angles();

    const { maxAngularSpeed: speed, responsiveness } = settings;
    const linearThreshold = speed / responsiveness;
    let distance;
    if (remaining > linearThreshold) {
      const linearTime = (remaining - linearThreshold) / speed;
      distance = step <= linearTime
        ? speed * step
        : remaining - linearThreshold + linearThreshold * (1 - Math.exp(-responsiveness * (step - linearTime)));
    } else {
      distance = remaining * (1 - Math.exp(-responsiveness * step));
    }
    // Integración analítica: el suavizado no depende de la tasa de cuadros.
    const ratio = remaining < 1e-8 ? 1 : Math.min(1, distance / remaining);
    yaw = wrapAngle(yaw + pendingYaw * ratio);
    pitch = clamp(pitch + pendingPitch * ratio, settings.minPitch, settings.maxPitch);
    pendingYaw *= 1 - ratio;
    pendingPitch *= 1 - ratio;
    return angles(true);
  }

  return { reset, addMovement, update, getAngles: () => angles() };
}
