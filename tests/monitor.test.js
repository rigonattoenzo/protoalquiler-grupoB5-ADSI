import test from 'node:test';
import assert from 'node:assert/strict';
import { load, THREE } from './helpers.mjs';

test('E3 queda sin proyecto y E2 conserva su carcasa aunque avance el soporte en E1', async t => {
  const { createMonitorDisplay } = await load('monitor.js'), savedDocument = globalThis.document;
  const words = [];
  const context = { beginPath() {}, setTransform() {}, fillRect() {}, strokeRect() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, fill() {}, fillText(text) { words.push(text); } };
  globalThis.document = { createElement: () => ({ getContext: () => context }) };
  t.after(() => { if (savedDocument === undefined) delete globalThis.document; else globalThis.document = savedDocument; });
  const idle = { mode: null, stepId: 'idle', designLevel: 0, progress: 0 };
  const printing = { mode: 'assisted', stepId: 'printing-base', designLevel: 1, progress: 0.5 };
  function display(station, occupied) {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
    const view = createMonitorDisplay(screen, { station, occupied }); t.after(() => { view.dispose(); screen.geometry.dispose(); screen.material.dispose(); }); return view;
  }
  const e3 = display('E3', false); e3.update(idle, 1);
  assert.ok(words.includes('Sin proyecto abierto')); assert.ok(words.includes('Estación disponible'));
  assert.ok(words.every(word => !/Soporte|Respaldo|Carcasa/.test(word)));
  const before = words.length; e3.update(printing, 1); assert.equal(words.length, before, 'El puesto libre no copia el proyecto de E1 ni redibuja sin cambios');
  words.length = 0; const e2 = display('E2', true); e2.update(printing, 1);
  assert.ok(words.includes('Carcasa para sensor / E2')); assert.ok(words.includes('02  Tapa ventilada'));
  assert.ok(words.every(word => !/Soporte|Respaldo|IMPRESIÓN|50%/.test(word)));
  words.length = 0; const e1 = display('E1', false); e1.update(printing, 1);
  assert.ok(words.includes('Soporte para celular / E1')); assert.ok(words.includes('IMPRESIÓN 01 / BASE'));
});
