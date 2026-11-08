import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load } from './helpers.mjs';
import { CONFIG } from '../src/config.js';

// Prueba del coordinador completo con cámara/grafo reales; sin navegador ni GPU.
test('entrada sin menú, charla en mostrador, tutorial, impresiones, ensamblado y cierre', async t => {
  const saved = new Map();
  function global(name, value) { saved.set(name, { exists: Object.hasOwn(globalThis, name), value: globalThis[name] }); globalThis[name] = value; }
  class Element extends EventTarget {
    hidden = true; style = {}; textContent = ''; innerHTML = ''; children = []; offsetHeight = 190; tagName = 'DIV';
    classList = { values: new Set(), add(...names) { names.forEach(n => this.values.add(n)); }, remove(...names) { names.forEach(n => this.values.delete(n)); }, toggle(name, force) { const add = force === undefined ? !this.values.has(name) : force; if (add) this.values.add(name); else this.values.delete(name); }, contains(name) { return this.values.has(name); } };
    setAttribute(name, value) { this[name] = value; }
    append(...items) { this.children.push(...items); }
    getContext() { return { fillRect() {}, fillText() {} }; }
    querySelectorAll() { return []; }
    click() { this.dispatchEvent(new Event('click')); }
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(match => [match[1], new Element()]));
  const doc = new EventTarget(), win = new EventTarget(); doc.body = new Element(); doc.hidden = false;
  doc.getElementById = id => { assert.ok(elements.has(id), 'ID inexistente: ' + id); return elements.get(id); };
  doc.createElement = () => { const item = new Element(); item.ownerDocument = doc; return item; };
  const choices = ['assisted', 'autonomous', 'order'].map(mode => { const button = new Element(); button.dataset = { mode }; return button; });
  elements.get('service-menu').querySelectorAll = () => choices;
  doc.exitPointerLock = () => { doc.pointerLockElement = null; doc.dispatchEvent(new Event('pointerlockchange')); };
  let renderer;
  class TestRenderer {
    constructor() { renderer = this; this.domElement = doc.createElement('canvas'); this.domElement.requestPointerLock = () => { doc.pointerLockElement = this.domElement; doc.dispatchEvent(new Event('pointerlockchange')); }; this.shadowMap = {}; }
    setPixelRatio(value) { this.ratio = value; } setSize() {} setAnimationLoop(callback) { this.frame = callback; }
    render(scene, camera) { this.scene = scene; this.camera = camera; }
  }
  const timers = [];
  global('document', doc); global('window', win); global('innerWidth', 1366); global('innerHeight', 768); global('devicePixelRatio', 2);
  global('location', { protocol: 'http:' }); global('__TestRenderer', TestRenderer);
  const originalSetTimeout = globalThis.setTimeout;
  global('setTimeout', (...args) => { const timer = originalSetTimeout(...args); timers.push(timer); return timer; });
  t.after(() => { timers.forEach(clearTimeout); for (const [name, prior] of saved) { if (prior.exists) globalThis[name] = prior.value; else delete globalThis[name]; } });
  await load('main.js', true); for (let i = 0; i < 10; i += 1) await new Promise(resolve => setImmediate(resolve));
  assert.equal(elements.get('error-panel').hidden, true, elements.get('error-detail').textContent);
  assert.ok(renderer.frame);
  let time = 0; const frames = count => { for (let i = 0; i < count; i += 1) { time += 1000 / 60; renderer.frame(time); } };
  const press = code => { const event = new Event('keydown', { cancelable: true }); Object.defineProperties(event, { code: { value: code }, target: { value: { tagName: 'CANVAS' } } }); win.dispatchEvent(event); frames(1); };
  frames(1); assert.equal(elements.get('service-menu').hidden, true); assert.equal(renderer.shadowMap.enabled, false); assert.equal(renderer.ratio, CONFIG.graphics.pixelRatio);
  press('KeyE'); assert.equal(elements.get('service-menu').hidden, true, 'No abre opciones desde la entrada');
  renderer.camera.position.set(CONFIG.reception.x, 1.65, CONFIG.reception.z + 1.1);
  press('KeyE'); assert.equal(elements.get('service-menu').hidden, false);
  press('Digit2'); assert.equal(elements.get('service-menu').hidden, false, 'Modalidad pendiente no inicia un guion');
  press('Digit1'); assert.equal(elements.get('service-menu').hidden, true);
  press('KeyE'); const stationTitle = elements.get('flow-title').textContent;
  press('KeyE'); assert.equal(elements.get('flow-title').textContent, stationTitle, 'No avanza desde recepción en un paso de E1');
  renderer.camera.position.set(CONFIG.workstation.target.x, 1.65, CONFIG.workstation.target.z);
  press('KeyE'); press('KeyE'); frames(360);
  // Crear base, revisión, presupuesto y suministro técnico.
  for (let i = 0; i < 4; i += 1) press('KeyE');
  assert.match(elements.get('flow-title').textContent, /Imprimiendo la base/);
  frames(450); assert.match(elements.get('flow-title').textContent, /Base terminada/);
  press('KeyE'); assert.equal(renderer.scene.getObjectByName('Base terminada sobre mesa').visible, true);
  press('KeyE'); press('KeyE'); frames(450);
  assert.match(elements.get('flow-title').textContent, /Respaldo terminado/);
  press('KeyE'); frames(170); assert.match(elements.get('flow-title').textContent, /Tu pieza terminada/);
  press('KeyE'); renderer.camera.position.set(CONFIG.reception.x, 1.65, CONFIG.reception.z + 1.1); press('KeyE');
  assert.match(elements.get('flow-title').textContent, /Recorrido completado/); assert.match(elements.get('quote-detail').innerHTML, /11\.500/);
  elements.get('restart-button').click(); frames(1);
  assert.equal(renderer.scene.getObjectByName('Base terminada sobre mesa').visible, false); assert.equal(elements.get('service-menu').hidden, true);
});
