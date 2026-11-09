import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { nearReception, getWorkflowTarget, atExit } from '../src/workflow-targets.js';
import { createWorkflow } from '../src/workflow.js';
test('primero se entra y se camina: las opciones no se ofrecen desde la puerta ni desde detrás del mostrador', () => {
  assert.equal(nearReception(CONFIG.navigation.spawn), false);
  assert.equal(nearReception({ x: CONFIG.reception.x, z: CONFIG.reception.staffZ }), false);
  assert.equal(nearReception({ x: CONFIG.reception.x, z: CONFIG.reception.z + 1.1 }), true);
});
test('el encargo se conversa a la derecha del mostrador, y el retiro se hace en recepción', () => {
  const flow = createWorkflow(); flow.start('order');
  const orderMeetingPoint = { x: CONFIG.reception.x + CONFIG.reception.width / 2 + 0.95, z: CONFIG.reception.z + 0.1 }, client = { x: orderMeetingPoint.x, z: orderMeetingPoint.z + 1.1 };
  assert.equal(getWorkflowTarget(flow.getState(), client, { orderMeetingPoint, assistantReady: false }).nearTarget, false);
  assert.equal(getWorkflowTarget(flow.getState(), client, { orderMeetingPoint, assistantReady: true }).nearTarget, true);
  assert.equal(getWorkflowTarget(flow.getState(), { x: CONFIG.reception.x, z: CONFIG.reception.z + 1.1 }, { orderMeetingPoint }).nearTarget, false);
  assert.equal(getWorkflowTarget(flow.getState(), CONFIG.workstation.target, { orderMeetingPoint }).nearTarget, false);
  flow.advance(); flow.advance(); flow.leaveForOrder();
  assert.equal(getWorkflowTarget(flow.getState(), CONFIG.workstation.target).nearTarget, false);
  for (let i = 0; i < 100; i += 1) flow.tick(0.1);
  flow.approveOrder(); flow.returnForOrder();
  assert.equal(getWorkflowTarget(flow.getState(), { x: CONFIG.reception.x, z: CONFIG.reception.z + 1.1 }).nearTarget, true);
});
test('la salida requiere cruzar el acceso único, no acercarse a una vidriera', () => {
  assert.equal(atExit({ x: -4.7, z: CONFIG.room.front - 0.1 }), false);
  assert.equal(atExit({ x: -4.7, z: CONFIG.room.front + 0.5 }), true);
  assert.equal(atExit({ x: 3, z: CONFIG.room.front + 0.5 }), false);
});
test('acciones de E1 bloqueadas lejos, desde menú/vista general y mientras llega el técnico', () => {
  const flow = createWorkflow(); flow.start('assisted'); const state = flow.getState(), point = CONFIG.workstation.target;
  assert.equal(getWorkflowTarget(state, point).nearTarget, true);
  assert.equal(getWorkflowTarget(state, { ...point, z: CONFIG.stations[1].z }).nearTarget, false);
  assert.equal(getWorkflowTarget(state, point, { mode: 'overview' }).nearTarget, false);
  assert.equal(getWorkflowTarget(state, point, { menuOpen: true }).nearTarget, false);
  assert.equal(getWorkflowTarget(state, { x: 3.8, z: 3.8 }).nearTarget, true, 'Acceso por la derecha de la silla');
  assert.equal(getWorkflowTarget(state, { x: CONFIG.stations[0].x + 1.55, z: CONFIG.stations[0].z + 1.2 }).nearTarget, true, 'Acceso frente a la impresora');
  flow.advance();
  assert.equal(getWorkflowTarget(flow.getState(), point, { assistantReady: false }).nearTarget, false);
  assert.equal(getWorkflowTarget(flow.getState(), point, { assistantReady: true }).nearTarget, true);
});
