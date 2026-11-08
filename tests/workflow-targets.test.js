import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createWorkflow } from '../src/workflow.js';
import { getWorkflowTarget } from '../src/workflow-targets.js';

test('la entrada permite consultar recepción y presentar la referencia', () => {
  const workflow = createWorkflow();
  const reception = { nearTarget: true, targetLabel: 'Recepción' };
  assert.deepEqual(getWorkflowTarget(workflow.getState(), CONFIG.navigation.spawn), reception);
  workflow.start('assisted');
  assert.deepEqual(getWorkflowTarget(workflow.getState(), CONFIG.navigation.spawn), reception);
});

test('recepción no se activa desde fuera del local, el área del personal ni los extremos del mostrador', () => {
  const workflow = createWorkflow();
  workflow.start('assisted');
  const state = workflow.getState();
  for (const position of [
    { x: -4.7, z: 6.5 }, // Umbral exterior.
    { x: -4.7, z: 3 }, // Detrás del mostrador.
    { x: -4.7, z: 4.249 },
    { x: -7.501, z: 5 },
    { x: -1.799, z: 5 },
    { x: 2.8, z: 3.05 }, // Estar en E1 no presenta referencias.
  ]) {
    assert.equal(getWorkflowTarget(state, position).nearTarget, false, JSON.stringify(position));
  }
  for (const position of [{ x: -7.5, z: 4.25 }, { x: -1.8, z: 6 }]) {
    assert.equal(getWorkflowTarget(state, position).nearTarget, true);
  }
});

test('el paso de estación exige E1 y no se habilita en E2, E3 ni recepción', () => {
  const workflow = createWorkflow();
  workflow.start('assisted');
  workflow.advance();
  const state = workflow.getState();
  assert.deepEqual(getWorkflowTarget(state, { x: 2.8, z: 3.05 }), {
    nearTarget: true, targetLabel: 'Computadora de E1',
  });
  for (const position of [CONFIG.navigation.spawn, { x: 2.8, z: -0.05 }, { x: 2.8, z: -3.15 }, { x: 0.6, z: 3.05 }]) {
    assert.equal(getWorkflowTarget(state, position).nearTarget, false, JSON.stringify(position));
  }
  assert.equal(getWorkflowTarget(state, { x: 1.701, z: 3.05 }).nearTarget, true);
  assert.equal(getWorkflowTarget(state, { x: 1.699, z: 3.05 }).nearTarget, false);
});

test('menú y vista general deshabilitan acciones aunque la posición sea correcta', () => {
  const workflow = createWorkflow();
  workflow.start('assisted');
  for (const options of [{ menuOpen: true }, { mode: 'overview' }, { mode: 'overview', menuOpen: true }]) {
    assert.equal(getWorkflowTarget(workflow.getState(), CONFIG.navigation.spawn, options).nearTarget, false);
  }
  workflow.advance();
  const position = { x: 2.8, z: 3.05 };
  for (const options of [{ menuOpen: true }, { mode: 'overview' }]) {
    assert.equal(getWorkflowTarget(workflow.getState(), position, options).nearTarget, false);
  }
  assert.equal(getWorkflowTarget(workflow.getState(), position).nearTarget, true);
});

test('caminar o consultar destinos no muta el flujo; solo una acción habilitada puede avanzarlo', () => {
  const workflow = createWorkflow();
  workflow.start('assisted');
  const before = workflow.getState();
  const position = Object.freeze({ x: 2.8, z: 3.05 });
  for (let i = 0; i < 50; i += 1) getWorkflowTarget(before, position);
  assert.equal(workflow.getState(), before);
  assert.equal(before.stepId, 'reception');
  const advanceAt = (location) => getWorkflowTarget(workflow.getState(), location).nearTarget && workflow.advance();
  assert.equal(advanceAt(position), false);
  assert.equal(advanceAt(CONFIG.navigation.spawn), true);
  assert.equal(workflow.getState().stepId, 'station');
  assert.equal(advanceAt({ x: 2.8, z: -0.05 }), false);
  assert.equal(workflow.getState().stepId, 'station');
  assert.equal(advanceAt(position), true);
  assert.equal(workflow.getState().stepId, 'design-base');
});
