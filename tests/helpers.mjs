import { readFile } from 'node:fs/promises';
const threeURL = new URL('../vendor/three/three.module.js', import.meta.url).href;
const cache = new Map();
export async function moduleURL(url, mockRenderer = false) {
  const key = url + ':' + mockRenderer;
  if (cache.has(key)) return cache.get(key);
  const promise = (async () => {
    let source = await readFile(new URL(url), 'utf8');
    const imports = [...source.matchAll(/(\bfrom\s*|\bimport\(\s*)(['"])([^'"]+)\2/g)];
    for (const match of imports) {
      const linePrefix = source.slice(source.lastIndexOf('\n', match.index) + 1, match.index);
      if (/^\s*(\/\/|\*|\/\*)/.test(linePrefix)) continue;
      const spec = match[3]; let target;
      if (spec === 'three') target = mockRenderer ? 'data:text/javascript;base64,' + Buffer.from("export * from '" + threeURL + "'; export const WebGLRenderer = globalThis.__TestRenderer;").toString('base64') : threeURL;
      else if (spec.startsWith('three/addons/')) target = await moduleURL(new URL('../vendor/three/addons/' + spec.slice(13), import.meta.url).href, mockRenderer);
      else if (spec.startsWith('.')) target = await moduleURL(new URL(spec, url).href, mockRenderer);
      else continue;
      source = source.replace(match[0], match[1] + match[2] + target + match[2]);
    }
    return 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
  })();
  cache.set(key, promise); return promise;
}
export const load = async (name, mockRenderer = false) => import(await moduleURL(new URL('../src/' + name, import.meta.url).href, mockRenderer));
export const THREE = await import(threeURL);
export function canvasDocument() {
  return { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillRect() {}, fillText() {} }) }) };
}
export async function worldFixture() {
  const { createWorld } = await load('world.js');
  const previous = globalThis.document; globalThis.document = canvasDocument();
  const scene = new THREE.Scene();
  let world;
  try { world = createWorld(scene); } finally { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; }
  return { scene, world };
}
