import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkflow, STEPS, AUTONOMOUS_STEPS, getStep, DEMO, MODES, getQuote } from '../src/workflow.js';
const finishAnimation = flow => { for (let i = 0; i < 200; i += 1) flow.tick(0.1); };
test('tres modalidades claras, secuencia asistida con revisión y dos impresiones', () => {
  assert.equal(MODES.length, 3); const flow = createWorkflow();
  assert.equal(flow.start('order'), false); assert.equal(flow.advance(), false); flow.start('assisted');
  for (const step of STEPS) {
    assert.equal(flow.getState().stepId, step.id);
    if (step.sceneDriven) { assert.equal(flow.advance(), false); flow.completeMaterial(); }
    else if (step.automatic) {
      assert.equal(flow.advance(), false);
      assert.ok(flow.getState().confirmed && flow.getState().materialLoaded);
      finishAnimation(flow);
    } else if (step.id === 'exit') { assert.equal(flow.advance(), false); flow.finish(); }
    else if (step.id !== 'complete') assert.equal(flow.advance(), true);
  }
  const state = flow.getState(); assert.ok(state.complete && state.assembled && state.baseOnTable && state.backOnTable);
  assert.equal(flow.advance(), false);
});
test('tiempo visual acotado, sin saltos por dt inválido ni avance al caminar', () => {
  const flow = createWorkflow(); flow.start('assisted');
  while (flow.getState().stepId !== 'material') flow.advance();
  flow.completeMaterial();
  const before = flow.getState();
  for (const dt of [0, -1, NaN, Infinity]) assert.equal(flow.tick(dt), false);
  assert.equal(flow.getState(), before);
  flow.tick(100); assert.ok(flow.getState().progress <= 0.1 / DEMO.printSeconds);
  flow.reset(); assert.equal(flow.getState().stepId, 'idle'); assert.equal(flow.tick(1), false);
});
test('reinicios y repeticiones no acumulan tiempo, material ni cobros', () => {
  const flow = createWorkflow(), quote = getQuote(); assert.deepEqual(quote, { station: 9000, material: 2500, total: 11500 });
  assert.equal(DEMO.baseGrams + DEMO.backGrams, DEMO.grams);
  for (let run = 0; run < 3; run += 1) {
    flow.start('assisted');
    while (!flow.getState().complete) { const step = STEPS[flow.getState().stepIndex]; if (step.sceneDriven) flow.completeMaterial(); else if (step.id === 'exit') flow.finish(); else if (step.automatic) finishAnimation(flow); else flow.advance(); }
    assert.deepEqual(getQuote(), quote); assert.ok(Object.isFrozen(flow.getState())); flow.reset();
    assert.equal(flow.getState().confirmed, false); assert.equal(flow.getState().basePrinted, false);
  }
});
test('la bobina y la salida requieren sus propias condiciones; no se saltan con E', () => {
  const flow = createWorkflow(); flow.start('assisted'); assert.equal(flow.completeMaterial(), false); assert.equal(flow.finish(), false);
  while (flow.getState().stepId !== 'material') flow.advance();
  for (let i = 0; i < 500; i += 1) flow.tick(0.1);
  assert.equal(flow.getState().stepId, 'material'); assert.equal(flow.getState().materialLoaded, false);
  flow.completeMaterial(); assert.equal(flow.getState().materialLoaded, true);
});
test('autónomo diseña y lamina ambas piezas solo, solicita revisión y completa el mismo cierre', () => {
  const flow = createWorkflow(); assert.equal(flow.start('autonomous'), true);
  assert.equal(flow.start('assisted'), false, 'No cambia de modalidad en medio de un trabajo');
  for (const step of AUTONOMOUS_STEPS) {
    const state = flow.getState(); assert.equal(state.stepId, step.id);
    assert.equal(getStep(state), step); assert.equal(state.mode, 'autonomous');
    assert.equal(state.assistantCalled, ['confirm', 'material'].includes(step.id));
    if (step.id === 'design-detail') { assert.equal(state.designLevel, 1); assert.equal(state.baseOnTable, false); }
    if (step.id === 'prepare') { assert.equal(state.designLevel, 2); assert.equal(state.prepared, false); }
    if (step.id === 'confirm') { assert.equal(state.prepared, true); assert.equal(state.confirmed, false); }
    if (step.id === 'printing-detail') assert.ok(state.baseOnTable && state.designLevel === 2);
    if (step.sceneDriven) { assert.equal(flow.advance(), false); flow.completeMaterial(); }
    else if (step.automatic) { assert.equal(flow.advance(), false); finishAnimation(flow); }
    else if (step.id === 'exit') flow.finish();
    else if (step.id !== 'complete') flow.advance();
  }
  assert.ok(flow.getState().hasBag && flow.getState().complete);
  flow.reset(); assert.equal(flow.getState().mode, null);
  assert.equal(flow.start('assisted'), true); assert.equal(flow.getState().designLevel, 0);
});
