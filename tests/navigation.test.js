import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONFIG } from '../src/config.js';

const threeUrl = new URL('../vendor/three/three.module.js', import.meta.url);
const THREE = await import(threeUrl.href);
const asModuleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const pointerSource = (await readFile(new URL('../vendor/three/addons/controls/PointerLockControls.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl.href)}`);
const navigationSource = (await readFile(new URL('../src/navigation.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl.href)}`)
  .replace("from 'three/addons/controls/PointerLockControls.js'", `from ${JSON.stringify(asModuleUrl(pointerSource))}`)
  .replace("from './physics.js'", `from ${JSON.stringify(new URL('../src/physics.js', import.meta.url).href)}`)
  .replace("from './look.js'", `from ${JSON.stringify(new URL('../src/look.js', import.meta.url).href)}`);
const { createNavigation } = await import(asModuleUrl(navigationSource));

function fixture(colliders = []) {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const documentTarget = new EventTarget();
  documentTarget.hidden = false;
  documentTarget.pointerLockElement = null;
  const windowTarget = new EventTarget();
  const element = new EventTarget();
  element.ownerDocument = documentTarget;
  element.requestPointerLock = () => {
    documentTarget.pointerLockElement = element;
    documentTarget.dispatchEvent(new Event('pointerlockchange'));
  };
  documentTarget.exitPointerLock = () => {
    documentTarget.pointerLockElement = null;
    documentTarget.dispatchEvent(new Event('pointerlockchange'));
  };
  globalThis.document = documentTarget;
  globalThis.window = windowTarget;
  const camera = new THREE.PerspectiveCamera();
  const nav = createNavigation({ camera, domElement: element, colliders, config: CONFIG.navigation });
  const emit = (target, type, values = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.entries(values).forEach(([key, value]) => Object.defineProperty(event, key, { value }));
    target.dispatchEvent(event);
  };
  return {
    nav, camera,
    mouse: (movementX, movementY = 0) => emit(documentTarget, 'mousemove', { movementX, movementY }),
    key: (code) => emit(documentTarget, 'keydown', { code }),
    blur: () => emit(windowTarget, 'blur'),
    focus: () => emit(windowTarget, 'focus'),
    frames: (count = 120) => { for (let i = 0; i < count; i += 1) nav.update(1 / 60); },
    dispose() {
      nav.dispose();
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    },
  };
}

const sameRotation = (camera, expected) => assert.ok(camera.quaternion.angleTo(expected) < 1e-7);

test('teclado y movimiento sin mouse no cambian la orientación', () => {
  const f = fixture();
  try {
    f.nav.enter();
    const rotation = f.camera.quaternion.clone();
    f.key('KeyW');
    f.frames(60);
    assert.ok(f.camera.position.z < CONFIG.navigation.spawn.z);
    sameRotation(f.camera, rotation);
  } finally { f.dispose(); }
});

test('la navegación real descarta captura y picos; aplica mirada normal solo en update y sin roll', () => {
  const f = fixture();
  try {
    f.nav.enter();
    const rotation = f.camera.quaternion.clone();
    f.mouse(90, 40);
    f.frames();
    sameRotation(f.camera, rotation);
    f.mouse(5000, -1000);
    f.frames();
    sameRotation(f.camera, rotation);
    f.mouse(20, 10);
    sameRotation(f.camera, rotation);
    f.frames();
    assert.ok(f.camera.rotation.y < 0);
    assert.ok(f.camera.rotation.x < 0);
    assert.equal(f.camera.rotation.order, 'YXZ');
    assert.equal(f.camera.rotation.z, 0);
  } finally { f.dispose(); }
});

test('reset limpia el giro pendiente y conserva exactamente la orientación inicial', () => {
  const f = fixture();
  try {
    const spawnRotation = f.camera.quaternion.clone();
    f.nav.enter();
    f.mouse(1);
    f.mouse(100, 30);
    f.frames(1);
    f.nav.reset();
    f.frames();
    sameRotation(f.camera, spawnRotation);
    assert.equal(f.camera.position.z, CONFIG.navigation.spawn.z);
  } finally { f.dispose(); }
});

test('deshabilitar y recapturar descarta pendientes y no altera la vista general', () => {
  const f = fixture();
  try {
    f.nav.enter();
    f.mouse(1);
    f.mouse(100, 30);
    f.nav.setEnabled(false);
    f.camera.rotation.set(-0.8, 0.5, 0, 'YXZ');
    const overview = f.camera.quaternion.clone();
    f.mouse(60, 80);
    f.frames();
    sameRotation(f.camera, overview);
    f.nav.setEnabled(true);
    f.nav.enter();
    f.frames();
    sameRotation(f.camera, overview);
    f.mouse(100, 50); // Primer evento de la nueva captura.
    f.frames();
    sameRotation(f.camera, overview);
    f.mouse(10);
    f.frames();
    assert.ok(f.camera.quaternion.angleTo(overview) > 0.001);
  } finally { f.dispose(); }
});

test('perder foco y liberar el mouse limpia la mirada pendiente antes de reanudar', () => {
  const f = fixture();
  try {
    f.nav.enter();
    f.mouse(1);
    f.mouse(100);
    const before = f.camera.quaternion.clone();
    f.blur();
    f.mouse(100, 100);
    f.frames();
    sameRotation(f.camera, before);
    f.focus();
    f.frames();
    sameRotation(f.camera, before);
    f.mouse(1);
    f.mouse(100);
    f.nav.exit();
    f.nav.enter();
    f.frames();
    sameRotation(f.camera, before);
  } finally { f.dispose(); }
});
test('sentarse permite mirar, bloquea WASD y levantarse restaura una posición libre', () => {
  const { x, z } = CONFIG.navigation.spawn;
  const chair = { id: 'Silla', minX: x - 0.39, maxX: x + 0.39, minZ: z - 1.37, maxZ: z - 0.63 };
  const f = fixture([chair]);
  const seat = { id: 'E1', position: { x, z: z - 1 }, eyeHeight: 1.35, lookAt: { x: x - 1.75, y: 1.43, z: z - 2.23 }, collider: chair };
  try {
    f.nav.enter(); assert.equal(f.nav.sit(seat), true); f.frames();
    assert.equal(f.nav.isSeated, true); assert.equal(f.nav.seatId, 'E1');
    assert.equal(f.camera.position.y, 1.35);
    const position = f.camera.position.clone(), rotation = f.camera.quaternion.clone();
    f.key('KeyW'); f.frames(60); assert.ok(f.camera.position.distanceTo(position) < 1e-9);
    f.mouse(1); f.mouse(30); f.frames(); assert.ok(f.camera.quaternion.angleTo(rotation) > 0.01);
    assert.equal(f.nav.stand(), true); f.frames(); assert.equal(f.nav.isSeated, false);
    assert.equal(f.camera.position.y, CONFIG.navigation.eyeHeight);
    assert.equal(f.camera.position.z, z);
    f.nav.sit(seat); f.nav.reset(); assert.equal(f.nav.isSeated, false); assert.equal(f.nav.seatId, null);
  } finally { f.dispose(); }
});
test('sentarse no atraviesa paredes ni se permite desde la vista deshabilitada', () => {
  const { x, z } = CONFIG.navigation.spawn;
  const wall = { minX: x - 3, maxX: x + 3, minZ: z - 0.6, maxZ: z - 0.5 };
  const f = fixture([wall]);
  const seat = { id: 'E1', position: { x, z: z - 1 }, eyeHeight: 1.35, lookAt: { x, y: 1.43, z: z - 2 } };
  try {
    const position = f.camera.position.clone();
    assert.equal(f.nav.sit(seat), false); assert.ok(f.camera.position.equals(position));
    f.nav.setEnabled(false); assert.equal(f.nav.sit(seat), false);
  } finally { f.dispose(); }
});
