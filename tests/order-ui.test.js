import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderUI } from '../src/order-ui.js';

test('el chat abre vacío, recibe mensajes por tiempo y bloquea acciones antes de mostrarlas', t => {
  const saved = globalThis.document, elements = new Map();
  class Element extends EventTarget {
    hidden = true; textContent = ''; innerHTML = ''; scrollHeight = 600;
    focus() {} click() { this.dispatchEvent(new Event('click')); }
  }
  globalThis.document = { getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); } };
  t.after(() => { if (saved === undefined) delete globalThis.document; else globalThis.document = saved; });
  let approved = 0, returned = 0;
  const ui = createOrderUI({ onApprove: () => approved++, onDefer() {}, onReturn: () => returned++, onRestart() {} });
  const state = { stepId: 'order-approval', orderAway: true }, tick = count => { for (let i = 0; i < count; i++) ui.render(state, 0.1); };
  ui.render(state); assert.equal(elements.get('order-phone').hidden, false); assert.equal(elements.get('order-greeting').hidden, true);
  elements.get('order-approve').click(); assert.equal(approved, 0);
  tick(9); assert.equal(elements.get('order-greeting').hidden, true); assert.equal(ui.canReply(), false);
  tick(2); assert.equal(elements.get('order-greeting').hidden, false); assert.equal(elements.get('order-budget').hidden, true);
  tick(10); assert.equal(elements.get('order-budget').hidden, false); assert.equal(ui.canReply(), true);
  elements.get('order-approve').click(); assert.equal(approved, 1);
  const confirmed = { stepId: 'order-next-day', orderAway: true };
  ui.render(confirmed); assert.equal(elements.get('order-approved-reply').hidden, false); assert.equal(elements.get('order-confirmed').hidden, true);
  elements.get('order-return').click(); assert.equal(returned, 0);
  for (let i = 0; i < 9; i++) ui.render(confirmed, 0.1);
  assert.equal(elements.get('order-confirmed').hidden, false); assert.equal(ui.canReturn(), true);
  elements.get('order-return').click(); assert.equal(returned, 1);
  ui.render({ stepId: 'idle' }); ui.render(state);
  assert.equal(elements.get('order-greeting').hidden, true); assert.equal(ui.canReply(), false, 'Reiniciar limpia la secuencia pendiente');
});
