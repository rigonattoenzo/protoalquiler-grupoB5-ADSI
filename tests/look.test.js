import test from 'node:test';
import assert from 'node:assert/strict';
import { createLookController, LOOK_DEFAULTS } from '../src/look.js';

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const settle = (look) => { for (let i = 0; i < 120; i += 1) look.update(1 / 60); };
const ready = () => {
  const look = createLookController();
  look.reset();
  look.addMovement(1, 0); // Primer evento de la captura: se descarta.
  return look;
};

test('la captura descarta el primer movimiento y luego conserva la sensibilidad normal', () => {
  const look = createLookController();
  look.reset({ yaw: 0.3, pitch: 0.1 });
  assert.equal(look.addMovement(0, 0), false);
  assert.equal(look.addMovement(80, 40), false);
  settle(look);
  near(look.getAngles().yaw, 0.3);
  near(look.getAngles().pitch, 0.1);
  assert.equal(look.addMovement(20, -10), true);
  settle(look);
  near(look.getAngles().yaw, 0.3 - 20 * LOOK_DEFAULTS.sensitivity);
  near(look.getAngles().pitch, 0.1 + 10 * LOOK_DEFAULTS.sensitivity);
});

test('los deltas inválidos y los picos del mouse se descartan completos', () => {
  const look = ready();
  for (const [dx, dy] of [[5000, 0], [0, -900], [150, 150], [NaN, 2], [2, Infinity], [undefined, 0]]) {
    assert.equal(look.addMovement(dx, dy), false);
    settle(look);
    near(look.getAngles().yaw, 0);
    near(look.getAngles().pitch, 0);
  }
});

test('un lote de eventos no produce un giro instantáneo ni deja una cola larga', () => {
  const look = ready();
  for (let i = 0; i < 100; i += 1) look.addMovement(100, -50);
  const before = look.getAngles();
  const after = look.update(1 / 60);
  assert.ok(Math.hypot(after.yaw - before.yaw, after.pitch - before.pitch) <= LOOK_DEFAULTS.maxAngularSpeed / 60 + 1e-10);
  settle(look);
  const final = look.getAngles();
  assert.ok(Math.hypot(final.yaw, final.pitch) <= LOOK_DEFAULTS.maxQueuedAngle + 1e-8);
});

test('el mismo movimiento converge igual a 30 y 120 cuadros por segundo', () => {
  const at30 = ready();
  const at120 = ready();
  at30.addMovement(130, 40);
  at120.addMovement(130, 40);
  for (let i = 0; i < 6; i += 1) at30.update(1 / 30);
  for (let i = 0; i < 24; i += 1) at120.update(1 / 120);
  near(at30.getAngles().yaw, at120.getAngles().yaw);
  near(at30.getAngles().pitch, at120.getAngles().pitch);
});

test('pitch queda limitado y yaw cruza ±π sin invertir el sentido del giro', () => {
  const look = createLookController();
  look.reset({ yaw: -Math.PI + 0.01, pitch: LOOK_DEFAULTS.maxPitch - 0.01 });
  look.addMovement(1, 0);
  look.addMovement(100, -100);
  settle(look);
  near(look.getAngles().yaw, Math.PI + 0.01 - 100 * LOOK_DEFAULTS.sensitivity);
  near(look.getAngles().pitch, LOOK_DEFAULTS.maxPitch);
  for (let i = 0; i < 80; i += 1) { look.addMovement(100, 100); settle(look); }
  const angles = look.getAngles();
  assert.ok(angles.yaw >= -Math.PI && angles.yaw < Math.PI);
  near(angles.pitch, LOOK_DEFAULTS.minPitch);
});

test('reset elimina el giro pendiente y vuelve a descartar el primer evento', () => {
  const look = ready();
  look.addMovement(120, 20);
  look.update(1 / 120);
  look.reset({ yaw: 0.7, pitch: -0.2 });
  settle(look);
  near(look.getAngles().yaw, 0.7);
  near(look.getAngles().pitch, -0.2);
  assert.equal(look.addMovement(120, 20), false);
  settle(look);
  near(look.getAngles().yaw, 0.7);
});

test('sin mouse update no crea rotación y un cuadro demorado sigue limitado', () => {
  const look = ready();
  for (let i = 0; i < 120; i += 1) assert.equal(look.update(1 / 60).changed, false);
  look.addMovement(150, 0);
  const angles = look.update(20);
  assert.ok(Math.abs(angles.yaw) <= LOOK_DEFAULTS.maxAngularSpeed * 0.05 + 1e-10);
  const beforeInvalidDt = look.getAngles();
  for (const dt of [0, -1, NaN, Infinity]) look.update(dt);
  assert.deepEqual(look.getAngles(), beforeInvalidDt);
});
