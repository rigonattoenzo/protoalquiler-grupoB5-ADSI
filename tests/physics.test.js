import test from 'node:test';
import assert from 'node:assert/strict';
import { moveCircle, overlapsCircle, stepVertical } from '../src/physics.js';

const radius = 0.28;
const wall = { id: 'pared', minX: 0, maxX: 0.15, minZ: -5, maxZ: 5 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} ≠ ${expected}`);

test('el cuerpo se detiene antes de la pared incluso con un desplazamiento grande', () => {
  const next = moveCircle({ x: -4, z: 0 }, { x: 20, z: 0 }, radius, [wall]);
  near(next.x, -radius);
  near(next.z, 0);
  assert.equal(overlapsCircle(next, radius, wall), false);
});

test('desliza lateralmente cuando se camina en diagonal contra una pared', () => {
  const next = moveCircle({ x: -1, z: -2 }, { x: 3, z: 3 }, radius, [wall]);
  near(next.x, -radius);
  near(next.z, 1);
  assert.equal(overlapsCircle(next, radius, wall), false);
});

test('respeta el radio desde ambos lados y permite quedar tangente', () => {
  const right = moveCircle({ x: 2, z: 0 }, { x: -5, z: 0 }, radius, [wall]);
  near(right.x, wall.maxX + radius);
  assert.equal(overlapsCircle({ x: -radius, z: 0 }, radius, wall), false);
  assert.equal(overlapsCircle({ x: -radius + 0.01, z: 0 }, radius, wall), true);
});

test('un pasillo mayor al diámetro permite avanzar sin quedar atrapado', () => {
  const corridor = [
    { id: 'mueble', minX: -4, maxX: -0.45, minZ: -4, maxZ: 4 },
    { id: 'estacion', minX: 0.45, maxX: 4, minZ: -4, maxZ: 4 },
  ];
  const next = moveCircle({ x: 0, z: 3 }, { x: 0, z: -6 }, radius, corridor);
  near(next.x, 0);
  near(next.z, -3);
  assert.ok(corridor.every((box) => !overlapsCircle(next, radius, box)));
});

test('un acceso menor al diámetro bloquea el paso', () => {
  const doorway = [
    { id: 'izquierda', minX: -3, maxX: -0.2, minZ: 0, maxZ: 0.15 },
    { id: 'derecha', minX: 0.2, maxX: 3, minZ: 0, maxZ: 0.15 },
  ];
  const next = moveCircle({ x: 0, z: 2 }, { x: 0, z: -4 }, radius, doorway);
  assert.ok(next.z > 0.15);
  assert.ok(doorway.every((box) => !overlapsCircle(next, radius, box)));
});

test('es posible rodear un mostrador por el paso lateral y continuar hacia los puestos', () => {
  const counter = { id: 'recepcion', minX: -7, maxX: -1, minZ: 3, maxZ: 4 };
  let position = { x: -4, z: 5 };
  position = moveCircle(position, { x: 4.4, z: 0 }, radius, [counter]);
  position = moveCircle(position, { x: 0, z: -6 }, radius, [counter]);
  near(position.x, 0.4);
  near(position.z, -1);
  assert.equal(overlapsCircle(position, radius, counter), false);
});

test('recupera una posición embebida sin dejar al cuerpo dentro del obstáculo', () => {
  const next = moveCircle({ x: 0.05, z: 0 }, { x: 0, z: 0 }, radius, [wall]);
  assert.equal(overlapsCircle(next, radius, wall), false);
});

test('la gravedad baja al personaje y el suelo evita que caiga indefinidamente', () => {
  let state = { height: 4, velocity: 0 };
  const first = stepVertical(state.height, state.velocity, 0.05, 20, 1.65);
  assert.ok(first.height < state.height);
  assert.ok(first.velocity < 0);
  for (let frame = 0; frame < 120; frame += 1) state = stepVertical(state.height, state.velocity, 1 / 60, 20, 1.65);
  near(state.height, 1.65);
  near(state.velocity, 0);
});
