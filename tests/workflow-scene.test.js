import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONFIG } from '../src/config.js';
import { DEMO, createWorkflow } from '../src/workflow.js';
import { moveCircle, overlapsCircle } from '../src/physics.js';

// Se ejecutan la escena y las geometrías reales con la misma biblioteca local.
// Solamente el canvas usado por los carteles necesita un stub, sin WebGL.
const threeUrl = new URL('../vendor/three/three.module.js', import.meta.url).href;
const configUrl = new URL('../src/config.js', import.meta.url).href;
const workflowUrl = new URL('../src/workflow.js', import.meta.url).href;
const THREE = await import(threeUrl);
const dataUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const characterSource = (await readFile(new URL('../src/character.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl)}`);
const worldSource = (await readFile(new URL('../src/world.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl)}`)
  .replace("from './config.js'", `from ${JSON.stringify(configUrl)}`)
  .replace("from './character.js'", `from ${JSON.stringify(dataUrl(characterSource))}`);
const workflowSceneSource = (await readFile(new URL('../src/workflow-scene.js', import.meta.url), 'utf8'))
  .replace("from 'three'", `from ${JSON.stringify(threeUrl)}`)
  .replace("from './config.js'", `from ${JSON.stringify(configUrl)}`)
  .replace("from './workflow.js'", `from ${JSON.stringify(workflowUrl)}`);
const { createWorld } = await import(dataUrl(worldSource));
const { createWorkflowScene } = await import(dataUrl(workflowSceneSource));

function fixture(t) {
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
  const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.08, 85);
  camera.position.set(CONFIG.navigation.spawn.x, CONFIG.navigation.eyeHeight, CONFIG.navigation.spawn.z);
  const workflow = createWorkflow();
  const view = createWorkflowScene({ scene, world });
  const unsubscribe = workflow.subscribe(view.applyState);
  t.after(() => { unsubscribe(); view.dispose(); });
  const model = scene.getObjectByName('Soporte de celular de demostración');
  const marker = scene.getObjectByName('Destino del recorrido');
  function until(stepId) {
    if (workflow.getState().mode === null) workflow.start('assisted');
    while (workflow.getState().stepId !== stepId) {
      assert.equal(workflow.advance(), true, `No se pudo llegar a ${stepId}`);
    }
  }
  return { scene, world, camera, workflow, view, model, marker, until };
}

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} ≠ ${expected}`);
const cameraXZ = camera => ({ x: camera.position.x, z: camera.position.z });

test('el diseño aparece al crear la base y evoluciona al agregar el apoyo', t => {
  const { model, workflow, until } = fixture(t);
  const base = model.getObjectByName('Base del soporte');
  const back = model.getObjectByName('Apoyo inclinado del soporte');
  const lip = model.getObjectByName('Labio de retención');
  assert.equal(model.visible, false);
  until('design-base');
  assert.equal(workflow.getState().designLevel, 0);
  assert.equal(model.visible, false);
  workflow.advance();
  assert.equal(workflow.getState().designLevel, 1);
  assert.equal(model.visible, true);
  assert.equal(base.visible, true);
  assert.equal(back.visible, false);
  assert.equal(lip.visible, false);
  workflow.advance();
  assert.equal(workflow.getState().designLevel, 2);
  assert.equal(back.visible, true);
  assert.equal(lip.visible, true);
  for (const part of [base, back, lip]) assert.equal(part.material.color.getHex(), DEMO.color);
});

test('la pieza preparada permanece sobre la mesa y fuera de la impresora', t => {
  const { scene, model, until } = fixture(t);
  until('ready');
  const bounds = new THREE.Box3().setFromObject(model);
  const table = new THREE.Box3().setFromObject(scene.getObjectByName('Mesa E1'));
  const printer = new THREE.Box3().setFromObject(scene.getObjectByName('Base impresora E1'));
  printer.union(new THREE.Box3().setFromObject(scene.getObjectByName('Techo impresora E1')));
  assert.ok(bounds.min.y >= table.max.y);
  assert.ok(bounds.min.x > table.min.x && bounds.max.x < table.max.x);
  assert.ok(bounds.min.z > table.min.z && bounds.max.z < table.max.z);
  assert.equal(bounds.intersectsBox(printer), false);
  const notes = new THREE.Box3().setFromObject(scene.getObjectByName('Apuntes E1'));
  assert.equal(bounds.intersectsBox(notes), false);
});

test('repetir un estado conserva los objetos y la cámara del visitante', t => {
  const { scene, world, camera, workflow, view, model, until } = fixture(t);
  until('preparation');
  const objects = [];
  scene.traverse(object => objects.push(object));
  const colliders = structuredClone(world.colliders);
  const originalPosition = camera.position.clone();
  const originalQuaternion = camera.quaternion.clone();
  const meshes = [...model.children];
  for (let count = 0; count < 5; count += 1) {
    view.applyState(workflow.getState());
    view.update(1 / 60);
  }
  const after = [];
  scene.traverse(object => after.push(object));
  assert.deepEqual(after, objects);
  assert.deepEqual(model.children, meshes);
  assert.deepEqual(world.colliders, colliders);
  assert.deepEqual(camera.position, originalPosition);
  assert.ok(camera.quaternion.equals(originalQuaternion));
});

test('el marcador señala recepción y E1, y desaparece al terminar o reiniciar', t => {
  const { workflow, marker, model, until } = fixture(t);
  assert.equal(marker.visible, false);
  until('reception');
  assert.equal(marker.visible, true);
  near(marker.position.x, -4.7);
  near(marker.position.z, 4.8);
  until('station');
  const e1 = CONFIG.stations.find(station => station.id === 'E1');
  near(marker.position.x, e1.x - 1.8);
  near(marker.position.z, e1.z + 1.15);
  until('ready');
  assert.equal(marker.visible, false);
  assert.equal(model.visible, true);
  workflow.reset();
  assert.equal(marker.visible, false);
  assert.equal(model.visible, false);
});

test('el técnico y su collider se colocan juntos, y se restauran al reiniciar', t => {
  const { world, workflow, until } = fixture(t);
  const collider = world.colliders.find(item => item.id === 'Técnico');
  const originalCollider = { ...collider };
  const originalPosition = world.technician.position.clone();
  const originalQuaternion = world.technician.quaternion.clone();
  until('station');
  assert.deepEqual(world.technician.position, originalPosition);
  until('design-base');
  const { x, z } = world.technician.position;
  assert.ok(x > 0, 'El técnico se acerca al área de estaciones');
  near((collider.minX + collider.maxX) / 2, x);
  near((collider.minZ + collider.maxZ) / 2, z);
  near(collider.maxX - collider.minX, originalCollider.maxX - originalCollider.minX);
  near(collider.maxZ - collider.minZ, originalCollider.maxZ - originalCollider.minZ);
  workflow.reset();
  assert.deepEqual(world.technician.position, originalPosition);
  assert.ok(world.technician.quaternion.equals(originalQuaternion));
  assert.deepEqual(collider, originalCollider);
});

test('dispose retira el guion y restaura al técnico sin eliminar objetos del local', t => {
  const { scene, world, view, until } = fixture(t);
  const originalPosition = world.technician.position.clone();
  const originalQuaternion = world.technician.quaternion.clone();
  const originalColliders = structuredClone(world.colliders);
  const table = scene.getObjectByName('Mesa E1');
  until('ready');
  view.dispose();
  assert.equal(scene.getObjectByName('Recorrido asistido'), undefined);
  assert.equal(scene.getObjectByName('Mesa E1'), table);
  assert.equal(world.technician.parent, scene);
  assert.deepEqual(world.technician.position, originalPosition);
  assert.ok(world.technician.quaternion.equals(originalQuaternion));
  assert.deepEqual(world.colliders, originalColliders);
  assert.doesNotThrow(() => view.dispose());
});

test('se puede llegar a E1 rodeando al técnico cuando acompaña el diseño', t => {
  const { world, camera, marker, until } = fixture(t);
  until('design-base');
  const radius = CONFIG.navigation.radius;
  const technician = world.colliders.find(item => item.id === 'Técnico');
  const direct = moveCircle({ x: 0.6, z: 2.9 }, { x: 2.2, z: 0 }, radius, world.colliders);
  assert.ok(direct.x < technician.minX, 'El collider bloquea cruzar al técnico');
  const waypoints = [
    { x: 0.6, z: camera.position.z },
    { x: 0.6, z: 3.7 },
    { x: marker.position.x, z: 3.7 },
    { x: marker.position.x, z: marker.position.z },
  ];
  for (const target of waypoints) {
    const current = cameraXZ(camera);
    const next = moveCircle(current, { x: target.x - current.x, z: target.z - current.z }, radius, world.colliders);
    near(next.x, target.x);
    near(next.z, target.z);
    assert.ok(world.colliders.every(box => !overlapsCircle(next, radius, box)));
    camera.position.set(next.x, camera.position.y, next.z);
  }
  near(camera.position.y, CONFIG.navigation.eyeHeight);
});
