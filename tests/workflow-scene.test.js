import test from 'node:test';
import assert from 'node:assert/strict';
import { worldFixture, load, canvasDocument } from './helpers.mjs';
import { createWorkflow, STEPS, DEMO } from '../src/workflow.js';
import { CONFIG } from '../src/config.js';
import { overlapsCircle } from '../src/physics.js';
async function fixture(t) {
  const { world, scene } = await worldFixture(), previous = globalThis.document;
  globalThis.document = canvasDocument(); const { createWorkflowScene } = await load('workflow-scene.js');
  const view = createWorkflowScene({ world, scene });
  if (previous === undefined) delete globalThis.document; else globalThis.document = previous;
  const flow = createWorkflow(); flow.subscribe(state => view.applyState(state));
  const frames = count => { for (let i = 0; i < count; i += 1) { flow.tick(0.05); view.update(0.05, flow.getState(), { x: -4.7, z: 6.6 }); } };
  const until = id => { if (!flow.getState().mode) flow.start('assisted'); let guard = 0; while (flow.getState().stepId !== id && guard++ < 100) { if (STEPS[flow.getState().stepIndex].automatic) frames(200); else flow.advance(); } assert.equal(flow.getState().stepId, id); view.update(0, flow.getState()); };
  t.after(() => view.dispose()); return { world, scene, flow, view, frames, until };
}
test('dos impresiones, piezas trasladadas a mesa y ensamblado sin duplicar geometrías', async t => {
  const { scene, world, view, flow, until, frames } = await fixture(t);
  until('printing-base'); frames(50);
  const basePrint = scene.getObjectByName('Base en impresión'), tableBase = scene.getObjectByName('Base terminada sobre mesa');
  assert.ok(basePrint.visible && basePrint.scale.y > 0 && basePrint.scale.y < 1); assert.equal(tableBase.visible, false);
  assert.equal(world.printers.get('E1').spool.visible, true);
  assert.equal(basePrint.children[0].material.color.getHex(), DEMO.color);
  until('design-detail'); assert.equal(tableBase.visible, true); assert.equal(basePrint.visible, false);
  until('printing-detail'); frames(30); assert.ok(scene.getObjectByName('Respaldo en impresión').visible);
  until('result'); const back = scene.getObjectByName('Respaldo terminado sobre mesa');
  assert.ok(back.visible && tableBase.visible); assert.ok(Math.abs(back.position.x - tableBase.position.x) < 1e-8);
  const count = scene.children.length; view.applyState(flow.getState()); view.update(0, flow.getState()); assert.equal(scene.children.length, count);
  flow.reset(); view.update(0, flow.getState()); assert.equal(tableBase.visible, false); assert.equal(back.visible, false);
});
test('técnico patrulla sin atravesar muebles, viene al llamado y permanece junto a E1', async t => {
  const { world, view, flow, until, frames } = await fixture(t);
  const start = world.technician.position.clone(); frames(80); assert.ok(start.distanceTo(world.technician.position) > 0.2);
  for (const obstacle of world.colliders.filter(item => item.id !== 'Técnico')) assert.equal(overlapsCircle(world.technician.position, 0.28, obstacle), false);
  until('design-base'); frames(450); assert.equal(view.assistantReady, true);
  const settled = world.technician.position.clone(); frames(120); assert.ok(settled.distanceTo(world.technician.position) < 0.05);
  assert.ok(Math.hypot(settled.x - CONFIG.workstation.assistant.x, settled.z - CONFIG.workstation.assistant.z) < 0.05);
  const collider = world.colliders.find(item => item.id === 'Técnico'); assert.ok(Math.abs((collider.minX + collider.maxX) / 2 - settled.x) < 1e-8);
  until('checkout'); frames(450);
  assert.ok(world.technician.position.distanceTo(settled) > 1, 'Sale por el frente de la silla y retoma el paseo al terminar');
  for (const obstacle of world.colliders.filter(item => item.id !== 'Técnico')) assert.equal(overlapsCircle(world.technician.position, 0.28, obstacle), false);
  flow.reset(); view.update(0, flow.getState()); assert.ok(world.technician.position.distanceTo(start) < 0.05);
});
