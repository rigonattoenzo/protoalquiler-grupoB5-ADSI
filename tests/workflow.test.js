import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, STEPS, DEMO, createWorkflow } from '../src/workflow.js';

test('recepción muestra tres modalidades y solo habilita el recorrido asistido', () => {
  assert.deepEqual(MODES.map(mode => mode.id), ['assisted', 'autonomous', 'order']);
  assert.deepEqual(MODES.map(mode => mode.available), [true, false, false]);
  const workflow = createWorkflow();
  const initial = workflow.getState();
  let changes = 0;
  workflow.subscribe(() => { changes += 1; });
  for (const mode of ['autonomous', 'order', 'unknown', null, undefined]) {
    assert.equal(workflow.start(mode), false);
    assert.equal(workflow.getState(), initial);
  }
  assert.equal(changes, 0);
  assert.equal(workflow.advance(), false);
});

test('el guion avanza desde recepción hasta preparación, con modelo y estado coherentes', () => {
  const workflow = createWorkflow();
  assert.equal(workflow.start('assisted'), true);
  const expected = [
    ['reception', 0, false],
    ['station', 0, false],
    ['design-base', 0, false],
    ['design-detail', 1, false],
    ['preparation', 2, false],
    ['ready', 2, true],
  ];
  for (const [index, [stepId, designLevel, prepared]] of expected.entries()) {
    const state = workflow.getState();
    assert.equal(state.mode, 'assisted');
    assert.equal(state.station, 'E1');
    assert.equal(state.stepId, stepId);
    assert.equal(state.stepIndex, index);
    assert.equal(state.designLevel, designLevel);
    assert.equal(state.prepared, prepared);
    assert.equal(state.complete, prepared);
    if (!prepared) assert.equal(workflow.advance(), true);
  }
});

test('repetir avanzar al final no duplica cambios ni habilita una impresión', () => {
  const workflow = createWorkflow();
  const changes = [];
  workflow.subscribe(state => changes.push(state.stepId));
  workflow.start('assisted');
  for (let i = 0; i < 20; i += 1) workflow.advance();
  assert.deepEqual(changes, STEPS.map(step => step.id));
  const ready = workflow.getState();
  assert.equal(workflow.advance(), false);
  assert.equal(workflow.getState(), ready);
  assert.equal('printing' in ready, false);
  assert.equal('total' in ready, false);
});

test('reiniciar o volver a comenzar restaura pieza y preparación sin acumular consumo', () => {
  const workflow = createWorkflow();
  workflow.start('assisted');
  for (let i = 0; i < 5; i += 1) workflow.advance();
  assert.equal(workflow.getState().prepared, true);
  workflow.start('assisted');
  assert.equal(workflow.getState().stepId, 'reception');
  assert.equal(workflow.getState().designLevel, 0);
  assert.equal(workflow.getState().prepared, false);
  assert.equal(workflow.reset(), true);
  assert.deepEqual(workflow.getState(), {
    mode: null, stepId: 'idle', stepIndex: -1, station: 'E1', designLevel: 0, prepared: false, complete: false,
  });
  assert.equal(workflow.reset(), false);
  assert.equal(workflow.advance(), false);
  assert.equal(DEMO.grams, 25);
  assert.equal(DEMO.representedMinutes, 90);
});

test('los snapshots y datos de demostración no se pueden modificar desde la interfaz', () => {
  const workflow = createWorkflow();
  const initial = workflow.getState();
  assert.throws(() => { initial.stepId = 'ready'; }, TypeError);
  workflow.start('assisted');
  assert.equal(initial.stepId, 'idle');
  const reception = workflow.getState();
  workflow.advance();
  assert.equal(reception.stepId, 'reception');
  assert.throws(() => { DEMO.grams += 25; }, TypeError);
  assert.throws(() => { STEPS[0].id = 'ready'; }, TypeError);
  assert.throws(() => { MODES[1].available = true; }, TypeError);
});

test('suscribirse no avanza el guion y cancelar la suscripción detiene las notificaciones', () => {
  const workflow = createWorkflow();
  const seen = [];
  const unsubscribe = workflow.subscribe(state => seen.push(state));
  assert.equal(seen.length, 0);
  workflow.start('assisted');
  assert.equal(seen.length, 1);
  assert.equal(seen[0], workflow.getState());
  unsubscribe();
  workflow.advance();
  workflow.reset();
  assert.equal(seen.length, 1);
  assert.throws(() => workflow.subscribe(null), TypeError);
});
