import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { nearReception, getWorkflowTarget } from '../src/workflow-targets.js';
import { createWorkflow } from '../src/workflow.js';
test('primero se entra y se camina: las opciones no se ofrecen desde la puerta ni desde detrás del mostrador', () => {
  assert.equal(nearReception(CONFIG.navigation.spawn), false);
  assert.equal(nearReception({ x: CONFIG.reception.x, z: CONFIG.reception.staffZ }), false);
  assert.equal(nearReception({ x: CONFIG.reception.x, z: CONFIG.reception.z + 1.1 }), true);
});
test('acciones de E1 bloqueadas lejos, desde menú/vista general y mientras llega el técnico', () => {
  const flow = createWorkflow(); flow.start('assisted'); flow.advance(); const state = flow.getState(), point = CONFIG.workstation.target;
  assert.equal(getWorkflowTarget(state, point).nearTarget, true);
  assert.equal(getWorkflowTarget(state, { ...point, z: CONFIG.stations[1].z }).nearTarget, false);
  assert.equal(getWorkflowTarget(state, point, { mode: 'overview' }).nearTarget, false);
  assert.equal(getWorkflowTarget(state, point, { menuOpen: true }).nearTarget, false);
  flow.advance(); flow.advance();
  assert.equal(getWorkflowTarget(flow.getState(), point, { assistantReady: false }).nearTarget, false);
  assert.equal(getWorkflowTarget(flow.getState(), point, { assistantReady: true }).nearTarget, true);
});
