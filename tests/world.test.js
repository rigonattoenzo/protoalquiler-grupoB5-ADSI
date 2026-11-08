import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONFIG } from '../src/config.js';
import { moveCircle, overlapsCircle } from '../src/physics.js';

// Node no interpreta import maps. Cargamos los mismos módulos locales con sus
// URL resueltas, sin instalar otra copia de Three.js ni requerir WebGL.
const threeUrl = new URL('../vendor/three/three.module.js', import.meta.url);
const THREE = await import(threeUrl.href);
const moduleDataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const characterSource = (await readFile(new URL('../src/character.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl.href)}`);
const worldSource = (await readFile(new URL('../src/world.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl.href)}`)
  .replace("from './config.js'", `from ${JSON.stringify(new URL('../src/config.js', import.meta.url).href)}`)
  .replace("from './character.js'", `from ${JSON.stringify(moduleDataUrl(characterSource))}`);
const { createWorld } = await import(moduleDataUrl(worldSource));

const previousDocument = globalThis.document;
globalThis.document = {
  createElement(tag) {
    assert.equal(tag, 'canvas');
    return { width: 0, height: 0, getContext: () => ({ fillRect() {}, fillText() {} }) };
  },
};
const scene = new THREE.Scene();
let world;
try {
  world = createWorld(scene);
} finally {
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}

const radius = CONFIG.navigation.radius;
const clear = (position) => world.colliders.every((box) => !overlapsCircle(position, radius, box));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} ≠ ${expected}`);
const goTo = (position, target) => moveCircle(position, {
  x: target.x - position.x,
  z: target.z - position.z,
}, radius, world.colliders);

test('el spawn real está dentro del local y libre de obstáculos', () => {
  assert.ok(clear(CONFIG.navigation.spawn));
  assert.ok(Math.abs(CONFIG.navigation.spawn.x) < CONFIG.room.width / 2);
  assert.ok(Math.abs(CONFIG.navigation.spawn.z) < CONFIG.room.depth / 2);
});

test('hay exactamente tres mesas con computadora, impresora y silla', () => {
  const tables = world.colliders.filter(({ id }) => id.startsWith('Mesa '));
  assert.deepEqual(tables.map(({ id }) => id).sort(), ['Mesa E1', 'Mesa E2', 'Mesa E3']);
  for (const { id } of CONFIG.stations) {
    assert.ok(scene.getObjectByName(`Monitor ${id}`));
    assert.ok(scene.getObjectByName(`Base impresora ${id}`));
    assert.ok(scene.getObjectByName(`Silla ${id}`));
  }
});

test('los dos baños y el depósito están identificados y bloquean el acceso a su interior', () => {
  const names = ['DEPÓSITO', 'BAÑO HOMBRES', 'BAÑO MUJERES'];
  assert.equal(world.colliders.filter(({ id }) => names.includes(id)).length, 3);
  for (const name of names) {
    const room = world.colliders.find(({ id }) => id === name);
    assert.ok(scene.getObjectByName(`Puerta ${name}`));
    const z = (room.minZ + room.maxZ) / 2;
    const stopped = goTo({ x: -3.2, z }, { x: -7, z });
    near(stopped.x, room.maxX + radius);
    assert.ok(clear(stopped));
  }
});

test('el único acceso frontal permite pisar el umbral, con límites a sus lados y al frente', () => {
  const passage = [];
  for (const x of [-7.5, -6.5, -5.3, -4.7, -4.1, -3, -1, 0, 1, 7.5]) {
    const end = goTo({ x, z: 4.8 }, { x, z: 6.5 });
    if (end.z > 6.3) passage.push(x);
  }
  assert.deepEqual(passage, [-5.3, -4.7, -4.1]);
  const threshold = goTo(CONFIG.navigation.spawn, { x: -4.7, z: 10 });
  near(threshold.z, 7.02 - radius);
  assert.ok(clear(threshold));
  const left = goTo(threshold, { x: -8, z: threshold.z });
  const right = goTo(threshold, { x: 2, z: threshold.z });
  near(left.x, -5.9 + radius);
  near(right.x, -3.5 - radius);
});

test('se puede rodear recepción por la derecha y llegar a las tres estaciones', () => {
  let position = { ...CONFIG.navigation.spawn };
  const waypoints = [
    { x: 0.6, z: position.z },
    { x: 0.6, z: 3.3 },
    { x: 2.7, z: 3.3 },
    { x: 0.6, z: 3.3 },
    { x: 0.6, z: 0.2 },
    { x: 2.7, z: 0.2 },
    { x: 0.6, z: 0.2 },
    { x: 0.6, z: -2.9 },
    { x: 2.7, z: -2.9 },
  ];
  for (const target of waypoints) {
    position = goTo(position, target);
    near(position.x, target.x);
    near(position.z, target.z);
    assert.ok(clear(position), `Hay un obstáculo en ${JSON.stringify(position)}`);
  }
});

test('las paredes laterales y el fondo impiden abandonar el piso', () => {
  const left = goTo({ x: 0, z: 4.8 }, { x: -20, z: 4.8 });
  const right = goTo({ x: 0, z: 4.8 }, { x: 20, z: 4.8 });
  const back = goTo({ x: 0, z: 0 }, { x: 0, z: -20 });
  near(left.x, -7.96 + radius);
  near(right.x, 7.96 - radius);
  near(back.z, -5.96 + radius);
  assert.ok([left, right, back].every(clear));
});

test('la vista general muestra al cliente y conserva todas las colisiones', () => {
  const originalColliders = structuredClone(world.colliders);
  world.setOverview(true);
  assert.equal(world.player.visible, true);
  assert.equal(scene.getObjectByName('Techo').visible, false);
  assert.equal(scene.getObjectByName('Pared derecha').visible, false);
  assert.deepEqual(world.colliders, originalColliders);
  world.setOverview(false);
  assert.equal(world.player.visible, false);
  assert.equal(scene.getObjectByName('Techo').visible, true);
  assert.equal(scene.getObjectByName('Pared derecha').visible, true);
});
