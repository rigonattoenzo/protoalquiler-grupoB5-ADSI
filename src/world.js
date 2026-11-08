import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createCharacter } from './character.js';

export function createWorld(scene) {
  const { colors } = CONFIG;
  const colliders = [];
  const cutaway = [];
  const materialCache = new Map();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  function material(color, options = {}) {
    const key = `${color}:${JSON.stringify(options)}`;
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...options }));
    return materialCache.get(key);
  }
  function box(name, size, position, color, { solid = false, parent = scene, ...options } = {}) {
    const mesh = new THREE.Mesh(unitBox, material(color, options));
    mesh.name = name;
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.castShadow = !options.transparent;
    mesh.receiveShadow = !options.transparent;
    parent.add(mesh);
    if (solid) {
      colliders.push({ id: name, minX: position[0] - size[0] / 2, maxX: position[0] + size[0] / 2, minZ: position[2] - size[2] / 2, maxZ: position[2] + size[2] / 2 });
    }
    return mesh;
  }
  function barrier(id, minX, maxX, minZ, maxZ) { colliders.push({ id, minX, maxX, minZ, maxZ }); }
  // Texto generado localmente: no hay mapas de textura ni modelos descargados.
  function sign(text, { x, y, z, width = 2, height = 0.45, rotation = 0, background = '#233d45', color = '#ffffff', fontSize = 50 } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = Math.round(1024 * height / width);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    lines.forEach((line, i) => ctx.fillText(line, 512, canvas.height / 2 + (i - (lines.length - 1) / 2) * (fontSize * 1.4), 960));
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotation;
    scene.add(mesh);
    return mesh;
  }

  scene.background = new THREE.Color(colors.background);
  box('Base del local', [16.45, 0.22, 12.4], [0, -0.16, 0], colors.ink);
  box('Piso', [16, 0.1, 12], [0, -0.025, 0], colors.floor);
  box('Umbral del acceso único', [2.4, 0.1, 1.1], [-4.7, -0.025, 6.5], colors.floor);
  // Juntas sutiles de piso, construidas con geometría.
  for (let x = -7; x < 8; x += 1) box('Junta de piso', [0.012, 0.002, 12], [x, 0.028, 0], 0xd9d7cf);
  for (let z = -5; z < 6; z += 1) box('Junta de piso', [16, 0.002, 0.012], [0, 0.028, z], 0xd9d7cf);
  box('Pared del fondo', [16.3, 3.3, 0.18], [0, 1.65, -6.05], colors.wall, { solid: true });
  box('Pared izquierda', [0.18, 3.3, 12.2], [-8.05, 1.65, 0], colors.wall, { solid: true });
  cutaway.push(box('Pared derecha', [0.18, 3.3, 12.2], [8.05, 1.65, 0], colors.wall, { solid: true }));
  const front = new THREE.Group();
  scene.add(front);
  cutaway.push(front);
  box('Frente izquierdo', [2, 3.3, 0.18], [-7, 1.65, 6.05], colors.wall, { solid: true, parent: front });
  box('Frente junto al acceso', [2.3, 3.3, 0.18], [-2.35, 1.65, 6.05], colors.wall, { solid: true, parent: front });
  box('Marco superior acceso', [2.4, 0.45, 0.2], [-4.7, 3.08, 6.05], colors.ink, { parent: front });
  box('Zócalo vidriera', [9.2, 0.35, 0.18], [3.4, 0.175, 6.05], colors.ink, { solid: true, parent: front });
  box('Vidriera', [9.2, 2.6, 0.06], [3.4, 1.65, 6.05], 0xb8dce1, { parent: front, transparent: true, opacity: 0.16, depthWrite: false });
  box('Marco vidriera superior', [9.3, 0.1, 0.16], [3.4, 3.05, 6.05], colors.ink, { parent: front });
  [-1.15, 3.4, 7.95].forEach(x => box('Parante vidriera', [0.08, 3.1, 0.16], [x, 1.55, 6.05], colors.ink, { parent: front }));
  const ceiling = box('Techo', [CONFIG.room.width, 0.1, CONFIG.room.depth], [0, CONFIG.room.height + 0.05, 0], colors.wall);
  cutaway.push(ceiling);
  // La entrada permite pisar un pequeño umbral; nunca se sale a un piso inexistente.
  barrier('Límite exterior frontal', -8.2, 8.2, 7.02, 7.3);
  barrier('Lateral izquierdo del umbral', -8.2, -5.9, 6.1, 7.3);
  barrier('Lateral derecho del umbral', -3.5, 8.2, 6.1, 7.3);

  // Un mismo bloque continuo contra el lateral: las habitaciones comparten
  // límites y llegan al techo. Sus interiores siguen fuera del recorrido.
  const serviceLeft = -CONFIG.room.width / 2;
  const serviceRight = -4.075;
  [
    { name: 'DEPÓSITO', minZ: -CONFIG.room.depth / 2, maxZ: -3, sub: 'Solo personal', color: 0xb6c1c3 },
    { name: 'BAÑO HOMBRES', minZ: -3, maxZ: -0.05, sub: 'Individual', color: 0xc5ced0 },
    { name: 'BAÑO MUJERES', minZ: -0.05, maxZ: 2.9, sub: 'Individual', color: 0xc5ced0 },
  ].forEach(({ name, minZ, maxZ, sub, color }) => {
    const z = (minZ + maxZ) / 2;
    const x = (serviceLeft + serviceRight) / 2;
    box(name, [serviceRight - serviceLeft, CONFIG.room.height, maxZ - minZ], [x, CONFIG.room.height / 2, z], color, { solid: true });
    box(`Puerta ${name}`, [0.055, 2.15, 0.95], [-4.04, 1.08, z], colors.wall);
    box(`Marco ${name}`, [0.07, 0.08, 1.11], [-4.0, 2.18, z], colors.ink);
    box(`Manija ${name}`, [0.09, 0.045, 0.12], [-3.99, 1.02, z + 0.3], colors.ink);
    sign(`${name}\n${sub}`, { x: -3.997, y: 1.75, z, width: 0.85, height: 0.45, rotation: Math.PI / 2, fontSize: 63 });
    const topLabel = sign(name, { x, y: CONFIG.room.height + 0.011, z, width: 3.1, height: 0.65, background: '#b6c1c3', color: '#233d45', fontSize: 72 });
    topLabel.rotation.x = -Math.PI / 2;
  });

  // Mostrador frente al único acceso; el paso al local queda a su derecha.
  box('Mostrador recepción', [5.4, 1.02, 1.0], [-4.65, 0.51, 3.75], colors.blue, { solid: true });
  box('Tapa recepción', [5.55, 0.1, 1.12], [-4.65, 1.06, 3.75], colors.wall);
  box('Zócalo recepción', [5.2, 0.15, 0.98], [-4.65, 0.075, 3.76], colors.ink);
  sign('RECEPCIÓN', { x: -4.65, y: 0.65, z: 4.26, width: 2.65, height: 0.34, background: '#719db3', fontSize: 65 });
  box('Terminal recepción', [0.62, 0.42, 0.06], [-5.4, 1.4, 3.76], colors.ink);
  box('Base terminal recepción', [0.26, 0.18, 0.18], [-5.4, 1.16, 3.76], colors.ink);

  // Armario: estructura opaca, frentes transparentes y bobinas reconocibles.
  box('Armario de filamentos', [1.7, 2.0, 1.1], [-1.85, 1, -0.3], 0xbad5d0, { solid: true, transparent: true, opacity: 0.16, depthWrite: false });
  box('Fondo armario', [1.7, 2, 0.07], [-1.85, 1, -0.88], 0xc8d5d0);
  [0.12, 0.92, 1.75].forEach(y => box('Estante armario', [1.7, 0.07, 1.1], [-1.85, y, -0.3], colors.ink));
  [-2.7, -1].forEach(x => box('Marco armario', [0.055, 2.05, 1.1], [x, 1.02, -0.3], colors.ink));
  function spool(x, y, z, color, scale = 1) {
    const group = new THREE.Group();
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.19, 24), material(color));
    center.rotation.x = Math.PI / 2;
    group.add(center);
    [-0.115, 0.115].forEach(offset => {
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.035, 24), material(colors.ink));
      rim.rotation.x = Math.PI / 2;
      rim.position.z = offset;
      group.add(rim);
    });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.27, 16), material(colors.wall));
    hub.rotation.x = Math.PI / 2;
    group.add(hub);
    group.scale.setScalar(scale);
    group.position.set(x, y, z);
    scene.add(group);
  }
  [-2.35, -1.85, -1.35].forEach((x, i) => {
    spool(x, 0.42, -0.15, [colors.mint, colors.blue, colors.peach][i], 0.86);
    spool(x, 1.22, -0.15, [colors.blue, colors.peach, colors.mint][i], 0.86);
  });
  sign('FILAMENTOS · TÉCNICO', { x: -1.85, y: 1.91, z: 0.268, width: 1.55, height: 0.18, fontSize: 60 });

  function station({ id, x, z }) {
    const left = x - 1.8;
    const printerX = x + 1.65;
    box(`Mesa ${id}`, [5.25, 0.12, 1.35], [x, 0.85, z], colors.wall, { solid: true });
    [-2.4, 2.4].forEach(dx => box(`Pata ${id}`, [0.1, 0.8, 1.16], [x + dx, 0.4, z], colors.ink));
    box(`Divisor ${id}`, [5.5, 1.28, 0.08], [x, 0.64, z - 0.78], colors.mint, { solid: true });
    box(`Monitor ${id}`, [0.92, 0.6, 0.075], [left, 1.38, z - 0.12], colors.ink);
    box(`Pantalla ${id}`, [0.82, 0.49, 0.012], [left, 1.39, z - 0.075], 0xbedbd0, { emissive: 0xbedbd0, emissiveIntensity: 0.15 });
    box(`Pie monitor ${id}`, [0.12, 0.25, 0.12], [left, 1.02, z - 0.12], colors.ink);
    box(`Teclado ${id}`, [0.75, 0.035, 0.26], [left, 0.93, z + 0.35], colors.ink);
    box(`Apuntes ${id}`, [0.65, 0.018, 0.48], [x - 0.2, 0.93, z + 0.12], 0xeee5ce);
    box(`Base impresora ${id}`, [1.0, 0.15, 0.9], [printerX, 1.0, z], colors.ink);
    [-0.43, 0.43].forEach(dx => [-0.36, 0.36].forEach(dz => box(`Estructura impresora ${id}`, [0.055, 1.02, 0.055], [printerX + dx, 1.51, z + dz], colors.ink)));
    box(`Techo impresora ${id}`, [1, 0.08, 0.9], [printerX, 2.05, z], colors.ink);
    box(`Cama impresora ${id}`, [0.72, 0.035, 0.67], [printerX, 1.13, z], colors.blue);
    box(`Puente impresora ${id}`, [0.85, 0.06, 0.07], [printerX, 1.63, z], colors.ink);
    box(`Cabezal impresora ${id}`, [0.17, 0.22, 0.15], [printerX, 1.52, z], colors.green);
    // Silla incluida en el volumen de colisión para que el recorrido sea creíble.
    box(`Silla ${id}`, [0.66, 0.09, 0.62], [x - 0.9, 0.48, z + 1.18], colors.green, { solid: true });
    box(`Respaldo ${id}`, [0.66, 0.56, 0.09], [x - 0.9, 0.8, z + 1.47], colors.green);
    box(`Pie silla ${id}`, [0.1, 0.46, 0.1], [x - 0.9, 0.23, z + 1.18], colors.ink);
    sign(`${id} / ESTACIÓN`, { x: x - 0.6, y: 1.1, z: z - 0.729, width: 1.25, height: 0.22, background: '#89bba5', color: '#233d45', fontSize: 64 });
  }
  CONFIG.stations.forEach(station);

  // Vidriera con exactamente dos piezas ilustrativas sencillas.
  box('Exhibidor', [5.2, 0.65, 0.6], [4.4, 0.325, 5.55], colors.blue, { solid: true });
  const sampleA = new THREE.Mesh(new THREE.TorusKnotGeometry(0.23, 0.075, 48, 8), material(colors.mint));
  sampleA.position.set(3.4, 0.98, 5.55); scene.add(sampleA);
  const sampleB = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), material(colors.peach));
  sampleB.position.set(5.3, 0.97, 5.55); scene.add(sampleB);
  sign('PROTOALQUILER 3D', { x: 0.4, y: 2.5, z: -5.945, width: 4.6, height: 0.65, fontSize: 79 });
  sign('DISEÑÁ · PREPARÁ · IMPRIMÍ', { x: 0.4, y: 1.95, z: -5.94, width: 3.8, height: 0.28, background: '#f4f1e9', color: '#397e69', fontSize: 56 });
  sign('USO DE ESTACIÓN + MATERIAL\nComputadora · impresora · asistencia básica\nTarifas ilustrativas: próximo hito', { x: -1.3, y: 1.16, z: -5.94, width: 2.8, height: 0.85, background: '#eee5ce', color: '#233d45', fontSize: 40 });
  const accessLabel = sign('ACCESO ÚNICO', { x: -4.7, y: 0.04, z: 6.5, width: 2.0, height: 0.35, background: '#233d45', fontSize: 65 });
  accessLabel.rotation.x = -Math.PI / 2;

  const technician = createCharacter({ technician: true });
  technician.position.set(-1.5, 0, 2.25);
  technician.rotation.y = Math.PI - 0.4;
  scene.add(technician);
  barrier('Técnico', -1.82, -1.18, 1.95, 2.55);
  const player = createCharacter({ shirt: colors.blue });
  player.visible = false;
  scene.add(player);

  scene.add(new THREE.HemisphereLight(0xf6faf6, 0xa7aa94, 2.5));
  const sun = new THREE.DirectionalLight(0xfff1d8, 2.7);
  sun.position.set(-3, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 9, bottom: -9, near: 0.5, far: 25 });
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  // La luz diurna atraviesa visualmente la vidriera; el techo no bloquea esa luz.
  ceiling.castShadow = false;
  [-2.6, 2.8].forEach(x => [-3.7, 1.8].forEach(z => {
    box('Luminaria', [1.5, 0.035, 0.3], [x, 3.28, z], 0xffffff, { emissive: 0xfff4dc, emissiveIntensity: 1 });
  }));

  return {
    colliders, player, technician,
    setOverview(enabled) { cutaway.forEach(object => { object.visible = !enabled; }); player.visible = enabled; },
    getZone({ x, z }) {
      if (z > 5.9) return 'Acceso único';
      if (z > 3.1 && x < -1.65) return 'Recepción';
      if (x > 1.7) return z > 0.4 ? 'Estación E1' : z > -2.7 ? 'Estación E2' : 'Estación E3';
      if (x < -3.2) return 'Baños y depósito';
      if (x < -0.7 && z < 1.2 && z > -2) return 'Armario de filamentos';
      return 'Pasillo de circulación';
    },
  };
}
