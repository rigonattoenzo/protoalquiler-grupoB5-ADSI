import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createCharacter } from './character.js';
import { DEMO, money } from './workflow.js';
import { addDecorations, applyFloorTexture, drawRoomPictogram, drawProcessPoster } from './decorations.js';

export function createWorld(scene) {
  const { colors, room, reception, cabinet } = CONFIG;
  const colliders = [], cutaway = [], seats = new Map(), printers = new Map(), screens = new Map(), renderCandidates = [];
  let filamentSource;
  const materialCache = new Map(), cylinderCache = new Map();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const material = (color, options = {}) => {
    const key = color + JSON.stringify(options);
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...options }));
    return materialCache.get(key);
  };
  function barrier(id, minX, maxX, minZ, maxZ) { const item = { id, minX, maxX, minZ, maxZ }; colliders.push(item); return item; }
  function box(name, size, position, color, { solid = false, parent = scene, ...options } = {}) {
    const mesh = new THREE.Mesh(unitBox, material(color, options));
    mesh.name = name; mesh.scale.set(...size); mesh.position.set(...position);
    mesh.castShadow = !options.transparent; mesh.receiveShadow = !options.transparent;
    parent.add(mesh);
    renderCandidates.push(mesh);
    if (solid) barrier(name, position[0] - size[0] / 2, position[0] + size[0] / 2, position[2] - size[2] / 2, position[2] + size[2] / 2);
    return mesh;
  }
  function cylinder(parent, radius, height, position, color, segments = 16) {
    const key = [radius, height, segments].join(':');
    if (!cylinderCache.has(key)) cylinderCache.set(key, new THREE.CylinderGeometry(radius, radius, height, segments));
    const mesh = new THREE.Mesh(cylinderCache.get(key), material(color));
    mesh.position.set(...position); mesh.castShadow = true; parent.add(mesh); renderCandidates.push(mesh); return mesh;
  }
  function sign(text, { x, y, z, width = 2, height = 0.45, rotation = 0, background = '#453f3c', color = '#fff9ed', fontSize = 48, resolution = 1024, draw } = {}) {
    const canvas = document.createElement('canvas'); canvas.width = resolution; canvas.height = Math.round(resolution * height / width);
    const ctx = canvas.getContext('2d');
    if (background !== null) { ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    const textSize = fontSize * resolution / 1024;
    ctx.fillStyle = color; ctx.font = '600 ' + textSize + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (draw) draw(ctx, canvas);
    else {
      const lines = text.split('\n');
      lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * textSize * 1.45, canvas.width * 0.9375));
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: background === null, depthWrite: background !== null }));
    mesh.position.set(x, y, z); mesh.rotation.y = rotation; scene.add(mesh); return mesh;
  }
  const centerX = (room.left + room.right) / 2, centerZ = (room.back + room.front) / 2;
  scene.background = new THREE.Color(colors.background);
  box('Base del local', [room.width + 0.35, 0.22, room.depth + 0.35], [centerX, -0.16, centerZ], colors.ink);
  applyFloorTexture(box('Piso', [room.width, 0.1, room.depth], [centerX, -0.025, centerZ], colors.floor));
  box('Pared del fondo', [room.width + 0.18, room.height, 0.18], [centerX, room.height / 2, room.back - 0.05], colors.wall, { solid: true });
  box('Pared izquierda', [0.18, room.height, room.depth + 0.18], [room.left - 0.05, room.height / 2, centerZ], colors.wall, { solid: true });
  cutaway.push(box('Pared derecha', [0.18, room.height, room.depth + 0.18], [room.right + 0.05, room.height / 2, centerZ], colors.wall, { solid: true }));
  const front = new THREE.Group(); scene.add(front); cutaway.push(front);
  box('Frente izquierdo', [2, room.height, 0.18], [-7, room.height / 2, room.front + 0.05], colors.wall, { solid: true, parent: front });
  box('Frente junto al acceso', [2.3, room.height, 0.18], [-2.35, room.height / 2, room.front + 0.05], colors.wall, { solid: true, parent: front });
  box('Dintel del acceso', [2.4, 0.38, 0.2], [-4.7, 3.11, room.front + 0.05], colors.wood, { parent: front });
  const glassWidth = room.right + 1.2, glassX = (-1.2 + room.right) / 2;
  box('Zócalo vidriera', [glassWidth, 0.28, 0.18], [glassX, 0.14, room.front + 0.05], colors.wood, { solid: true, parent: front });
  box('Vidriera', [glassWidth, 2.75, 0.06], [glassX, 1.65, room.front + 0.05], 0xe4efe4, { transparent: true, opacity: 0.13, depthWrite: false, parent: front });
  [-1.15, 2.7, room.right - 0.05].forEach(x => box('Marco vidriera', [0.07, 3.25, 0.13], [x, 1.625, room.front + 0.05], colors.wood, { parent: front }));
  box('Marco superior vidriera', [glassWidth, 0.09, 0.14], [glassX, 3.22, room.front + 0.05], colors.wood, { parent: front });
  const ceiling = box('Techo', [room.width, 0.1, room.depth], [centerX, room.height + 0.05, centerZ], colors.wall);
  ceiling.castShadow = false; cutaway.push(ceiling);
  box('Umbral del acceso único', [2.4, 0.1, 1.1], [-4.7, -0.025, room.front + 0.5], colors.floor);
  barrier('Límite exterior frontal', room.left - 0.2, room.right + 0.2, room.front + 1.02, room.front + 1.3);
  barrier('Lateral izquierdo del umbral', room.left - 0.2, -5.9, room.front + 0.1, room.front + 1.3);
  barrier('Lateral derecho del umbral', -3.5, room.right + 0.2, room.front + 0.1, room.front + 1.3);

  [
    { name: 'BAÑO MUJERES', min: -6, max: -3, icon: 'woman', color: 0xe1cfbb },
    { name: 'BAÑO HOMBRES', min: -3, max: -0.05, icon: 'man', color: 0xe1cfbb },
    { name: 'DEPÓSITO', min: -0.05, max: 2.9, icon: 'box', color: 0xcebea4 },
  ].forEach(({ name, min, max, icon, color }) => {
    const z = (min + max) / 2;
    box(name, [3.925, room.height, max - min], [-6.0375, room.height / 2, z], color, { solid: true });
    box('Puerta ' + name, [0.055, 2.15, 1], [-4.04, 1.08, z], colors.wall);
    box('Marco ' + name, [0.07, 0.08, 1.14], [-4, 2.18, z], colors.wood);
    box('Manija ' + name, [0.1, 0.045, 0.12], [-3.99, 1.01, z + 0.32], colors.ink);
    const pictogram = sign('', { x: -3.998, y: 1.68, z, width: 0.3, height: 0.39, rotation: Math.PI / 2, background: null, resolution: 256, draw: (ctx, canvas) => drawRoomPictogram(ctx, canvas, icon) });
    pictogram.name = 'Pictograma ' + name;
    box('Cornisa ' + name, [0.065, 0.095, max - min], [-4.0425, room.height - 0.0475, z], colors.trim);
    box('Zócalo ' + name, [0.035, 0.11, max - min], [-4.0575, 0.055, z], colors.trim);
    const label = sign(name, { x: -6.04, y: room.height + 0.012, z, width: 3, height: 0.55, background: '#e1cfbb', color: '#453f3c', fontSize: 65 });
    label.rotation.x = -Math.PI / 2;
  });
  // Juntas en tono madera sobre la fachada y el techo: distinguen los ambientes
  // sin volver a abrir huecos entre los volúmenes cerrados.
  [-3, -0.05].forEach(z => {
    box('Junta vertical de habitaciones', [0.025, room.height, 0.055], [-4.0625, room.height / 2, z], colors.trim);
    box('Junta superior de habitaciones', [3.925, 0.018, 0.055], [-6.0375, room.height + 0.01, z], colors.trim);
  });
  box('Cornisa frente depósito', [3.925, 0.095, 0.065], [-6.0375, room.height - 0.0475, 2.9125], colors.trim);

  box('Mostrador recepción', [reception.width, 0.92, reception.depth], [reception.x, 0.56, reception.z], colors.blue, { solid: true });
  box('Tapa recepción', [reception.width + 0.12, 0.11, reception.depth + 0.12], [reception.x, 1.06, reception.z], colors.wood);
  box('Zócalo recepción', [reception.width - 0.2, 0.1, reception.depth - 0.12], [reception.x, 0.05, reception.z], colors.ink);
  sign('PROTOALQUILER / RECEPCIÓN', { x: reception.x, y: 0.65, z: reception.z + reception.depth / 2 + 0.01, width: 3.4, height: 0.3, background: '#bd8b73', fontSize: 55 });
  [0.25, 0.45, 0.85].forEach(y => box('Listón recepción', [reception.width - 0.16, 0.022, 0.025], [reception.x, y, reception.z + reception.depth / 2 + 0.015], colors.wood));
  // La pantalla y el teclado miran al personal, al otro lado del mostrador.
  const terminalX = reception.x - 0.48, terminalZ = reception.z - 0.04;
  box('Terminal recepción', [0.7, 0.44, 0.065], [terminalX, 1.43, terminalZ], colors.ink);
  box('Pie terminal', [0.075, 0.22, 0.075], [terminalX, 1.2, terminalZ], colors.ink);
  box('Base terminal recepción', [0.32, 0.025, 0.23], [terminalX, 1.13, terminalZ], colors.ink);
  const receptionScreen = sign('ProtoAlquiler\nSesiones / Caja', { x: terminalX, y: 1.43, z: terminalZ - 0.037, width: 0.63, height: 0.36, rotation: Math.PI, background: '#233a3b', color: '#d8e8cf', fontSize: 70 });
  receptionScreen.name = 'Pantalla recepción';
  box('Teclado recepción', [0.48, 0.025, 0.17], [terminalX, 1.13, reception.z - 0.4], colors.ink);
  box('Mouse recepción', [0.1, 0.03, 0.14], [terminalX - 0.4, 1.135, reception.z - 0.4], colors.ink);
  const rateSheet = sign('MODALIDADES Y TARIFAS\nCon asistencia: ' + money(DEMO.hourlyRate) + '/h + PLA ' + money(DEMO.pricePerGram) + '/g\nPor mi cuenta: ' + money(DEMO.hourlyRate) + '/h + PLA ' + money(DEMO.pricePerGram) + '/g\nPor encargo: presupuesto por trabajo\nPLA: ' + money(DEMO.pricePerGram) + '/g · consultá en recepción', { x: reception.x + 0.83, y: 1.121, z: reception.z + 0.1, width: 1.43, height: 0.84, background: '#fff4db', color: '#453f3c', fontSize: 44 });
  rateSheet.name = 'Hoja de tarifas'; rateSheet.rotation.x = -Math.PI / 2;
  cylinder(scene, 0.07, 0.16, [reception.x + 1.67, 1.2, reception.z + 0.05], colors.green);
  cylinder(scene, 0.057, 0.007, [reception.x + 1.67, 1.283, reception.z + 0.05], colors.ink);
  [-1, 1].forEach(side => {
    const pen = box('Lapicera recepción', [0.014, 0.23, 0.014], [reception.x + 1.67 + side * 0.023, 1.32, reception.z + 0.05], side < 0 ? colors.blue : colors.ink);
    pen.rotation.z = side * 0.12;
  });

  box('Armario de filamentos', [cabinet.width, 2.05, cabinet.depth], [cabinet.x, 1.025, cabinet.z], 0xbbd3bd, { solid: true, transparent: true, opacity: 0.13, depthWrite: false });
  box('Fondo armario', [cabinet.width, 2.05, 0.06], [cabinet.x, 1.025, cabinet.z - cabinet.depth / 2], colors.wood);
  [0.12, 0.94, 1.77].forEach(y => box('Estante armario', [cabinet.width, 0.065, cabinet.depth], [cabinet.x, y, cabinet.z], colors.wood));
  [-1, 1].forEach(s => box('Marco armario', [0.055, 2.08, cabinet.depth], [cabinet.x + s * cabinet.width / 2, 1.04, cabinet.z], colors.ink));
  const cabinetDoor = new THREE.Group(); cabinetDoor.name = 'Puerta armario'; cabinetDoor.userData.dynamic = true;
  cabinetDoor.position.set(cabinet.x - cabinet.width / 2, 0, cabinet.z + cabinet.depth / 2 + 0.025); scene.add(cabinetDoor);
  box('Vidrio puerta armario', [cabinet.width - 0.08, 1.95, 0.035], [cabinet.width / 2, 1, 0], 0xbbd3bd, { parent: cabinetDoor, transparent: true, opacity: 0.16, depthWrite: false });
  box('Manija armario', [0.035, 0.25, 0.045], [cabinet.width - 0.14, 1.05, 0.04], colors.ink, { parent: cabinetDoor });
  function spool(position, color, scale = 1) {
    const group = new THREE.Group(); group.position.set(...position); group.scale.setScalar(scale); scene.add(group);
    const core = cylinder(group, 0.21, 0.2, [0, 0, 0], color, 24); core.rotation.x = Math.PI / 2;
    [-0.13, 0.13].forEach(z => { const rim = cylinder(group, 0.25, 0.035, [0, 0, z], colors.ink, 24); rim.rotation.x = Math.PI / 2; });
    const hub = cylinder(group, 0.065, 0.3, [0, 0, 0], colors.wall); hub.rotation.x = Math.PI / 2;
    return group;
  }
  [-0.7, 0, 0.7].forEach((dx, i) => [0.43, 1.25].forEach((y, j) => {
    const reel = spool([cabinet.x + dx, y, cabinet.z + 0.12], [colors.mint, colors.peach, colors.blue][(i + j) % 3], 0.95);
    if (i === 2 && j === 1) { reel.name = 'Bobina PLA disponible'; reel.userData.dynamic = true; filamentSource = reel; }
  }));
  sign('FILAMENTOS / SUMINISTRO TÉCNICO', { x: cabinet.x, y: 1.94, z: cabinet.z + cabinet.depth / 2 + 0.01, width: 1.95, height: 0.17, fontSize: 48 });

  function chair(id, x, z, { yaw = 0, occupied = false } = {}) {
    const group = new THREE.Group(); group.name = 'Silla ' + id; group.position.set(x, 0, z); scene.add(group);
    box('Asiento ' + id, [0.64, 0.1, 0.6], [0, 0.51, 0], colors.ink, { parent: group });
    box('Respaldo ' + id, [0.59, 0.58, 0.085], [0, 0.86, 0.28], 0x827b70, { parent: group });
    cylinder(group, 0.055, 0.39, [0, 0.28, 0], 0x69625a);
    for (let i = 0; i < 5; i += 1) {
      const angle = i * Math.PI * 2 / 5;
      const spoke = box('Radio silla', [0.06, 0.045, 0.37], [Math.sin(angle) * 0.15, 0.095, Math.cos(angle) * 0.15], 0x69625a, { parent: group });
      spoke.rotation.y = angle;
      const wheel = cylinder(group, 0.055, 0.045, [Math.sin(angle) * 0.32, 0.055, Math.cos(angle) * 0.32], colors.ink, 12); wheel.rotation.z = Math.PI / 2;
    }
    [-1, 1].forEach(s => { box('Brazo silla', [0.065, 0.055, 0.36], [s * 0.35, 0.74, 0.01], colors.ink, { parent: group }); box('Apoyo brazo', [0.04, 0.2, 0.04], [s * 0.35, 0.63, 0.08], 0x69625a, { parent: group }); });
    group.rotation.y = yaw;
    const collider = barrier('Silla ' + id, x - 0.39, x + 0.39, z - 0.37, z + 0.37);
    if (!occupied) seats.set(id, { id, position: { x, z }, eyeHeight: 1.35, collider, lookAt: { x: CONFIG.stations.find(item => item.id === id).x - 1.75, y: 1.43, z: z - 1.23 } });
  }
  chair('Recepción', reception.x, reception.staffZ, { yaw: Math.PI, occupied: true });
  CONFIG.stations.forEach(({ id, x, z }) => {
    const left = x - 1.75, printerX = x + 1.55;
    box('Mesa ' + id, [CONFIG.workstation.width, 0.12, CONFIG.workstation.depth], [x, 0.85, z], colors.wood, { solid: true });
    box('Canto madera ' + id, [CONFIG.workstation.width, 0.025, 0.035], [x, 0.84, z + 0.715], 0xa77d55);
    [-0.17, 0.03].forEach(dz => box('Veta madera ' + id, [2.25, 0.003, 0.009], [x - 0.3, 0.912, z + dz], 0xc19a72));
    box('Cajón ' + id, [0.75, 0.2, 0.7], [x - 0.1, 0.68, z - 0.15], 0xb99169);
    box('Tirador cajón ' + id, [0.23, 0.022, 0.025], [x - 0.1, 0.68, z + 0.213], colors.ink);
    [-2.5, 2.5].forEach(dx => box('Pata ' + id, [0.08, 0.8, 1.2], [x + dx, 0.4, z], colors.ink));
    box('Divisor ' + id, [5.4, 1.26, 0.08], [x, 0.63, z - 0.75], colors.mint, { solid: true });
    box('Monitor ' + id, [1.17, 0.77, 0.075], [left, 1.42, z - 0.08], colors.ink);
    const screen = box('Pantalla ' + id, [1.07, 0.65, 0.012], [left, 1.43, z - 0.035], 0x253a3a, { emissive: 0x253a3a, emissiveIntensity: 0.25 });
    screen.material = screen.material.clone(); screen.userData.dynamic = true; screens.set(id, screen);
    box('Pie monitor ' + id, [0.1, 0.22, 0.1], [left, 1.02, z - 0.08], colors.ink);
    box('Teclado ' + id, [0.76, 0.035, 0.25], [left, 0.93, z + 0.39], colors.ink);
    box('Mouse ' + id, [0.13, 0.04, 0.2], [left + 0.58, 0.94, z + 0.39], colors.ink);
    box('Apuntes ' + id, [0.57, 0.015, 0.43], [x - 0.12, 0.923, z + 0.18], 0xfff4d9);
    box('Base impresora ' + id, [1.05, 0.14, 0.95], [printerX, 1, z], colors.ink);
    [-0.46, 0.46].forEach(dx => [-0.4, 0.4].forEach(dz => box('Marco impresora ' + id, [0.045, 1.07, 0.045], [printerX + dx, 1.57, z + dz], colors.ink)));
    box('Techo impresora ' + id, [1.05, 0.07, 0.95], [printerX, 2.12, z], colors.ink);
    const bed = box('Cama impresora ' + id, [0.8, 0.035, 0.73], [printerX, 1.12, z], 0x8d9a93);
    const gantry = new THREE.Group(); gantry.name = 'Carro impresora ' + id; gantry.userData.dynamic = true; gantry.position.set(printerX, 1.38, z); scene.add(gantry);
    box('Eje cabezal ' + id, [0.88, 0.045, 0.04], [0, 0, 0], 0x9c9990, { parent: gantry });
    const head = box('Cabezal impresora ' + id, [0.16, 0.19, 0.14], [0, -0.05, 0], colors.blue, { parent: gantry });
    const loadedSpool = spool([printerX, 2.39, z], DEMO.color, 0.8); loadedSpool.userData.dynamic = true; loadedSpool.visible = id !== 'E1';
    printers.set(id, { x: printerX, z, bed, gantry, head, spool: loadedSpool });
    chair(id, id === 'E2' ? left : x - 0.1, z + 1.23, { occupied: id === 'E2' });
    sign(id + ' / ESTACIÓN', { x: x - 0.2, y: 1.07, z: z - 0.703, width: 1.35, height: 0.2, background: '#95b59c', color: '#453f3c', fontSize: 60 });
  });

  box('Exhibidor', [5.4, 0.68, 0.65], [3.2, 0.34, room.front - 0.55], colors.wood, { solid: true });
  const sampleGeometries = [new THREE.TorusKnotGeometry(0.22, 0.07, 48, 8), new THREE.IcosahedronGeometry(0.28), new THREE.TorusGeometry(0.22, 0.08, 10, 24), new THREE.ConeGeometry(0.23, 0.5, 6), new THREE.DodecahedronGeometry(0.26), new THREE.BoxGeometry(0.36, 0.36, 0.36)];
  sampleGeometries.forEach((geometry, i) => { const mesh = new THREE.Mesh(geometry, material([colors.mint, colors.peach, colors.blue][i % 3])); mesh.name = 'Muestra vidriera ' + (i + 1); mesh.position.set(0.95 + i * 0.9, 1.02, room.front - 0.55); mesh.castShadow = true; scene.add(mesh); });
  sign('PROTOALQUILER 3D', { x: -0.1, y: 2.85, z: room.back + 0.052, width: 4.8, height: 0.52, fontSize: 79 });
  sign('TALLER DE IDEAS / DISEÑO + IMPRESIÓN', { x: -0.1, y: 2.37, z: room.back + 0.053, width: 4.4, height: 0.22, background: '#f7eedf', color: '#5c8066', fontSize: 46 });
  const rateZ = (CONFIG.stations[1].z + CONFIG.stations[2].z) / 2;
  const rateFrame = box('Marco tarifario', [0.055, 1.63, 2.58], [room.right - 0.045, 2.15, rateZ], colors.green); cutaway.push(rateFrame);
  const rateSign = sign('', { x: room.right - 0.078, y: 2.15, z: rateZ, width: 2.5, height: 1.55, rotation: -Math.PI / 2, background: '#fff0d2', color: '#453f3c', draw(ctx) {
    ctx.fillStyle = '#5c8066'; ctx.fillRect(25, 25, 974, 15);
    ctx.font = '800 104px system-ui'; ctx.fillStyle = '#453f3c'; ctx.fillText('TARIFAS', 512, 121);
    ctx.font = '600 32px system-ui'; ctx.fillText('Con asistencia o por tu cuenta', 512, 174);
    ctx.fillStyle = '#5c8066'; ctx.fillRect(35, 196, 954, 150);
    ctx.fillStyle = '#fff9ed'; ctx.font = '750 98px system-ui'; ctx.fillText(money(DEMO.hourlyRate) + ' / hora', 512, 274, 900);
    ctx.fillStyle = '#b47b44'; ctx.font = '750 76px system-ui'; ctx.fillText('PLA ' + money(DEMO.pricePerGram) + ' / g', 512, 421, 920);
    ctx.fillStyle = '#453f3c'; ctx.font = '500 40px system-ui'; ctx.fillText('Computadora + impresora', 512, 510);
    ctx.font = '500 36px system-ui'; ctx.fillText('Revisión técnica incluida', 512, 569);
    ctx.font = '500 30px system-ui'; ctx.fillText('Encargos: presupuesto por trabajo', 512, 612);
  } });
  rateSign.name = 'Tarifario'; cutaway.push(rateSign);
  const poster = sign('', { x: room.right - 0.055, y: 2.5, z: 2.5, width: 1.8, height: 0.75, rotation: -Math.PI / 2, draw: drawProcessPoster });
  poster.name = 'Póster del proceso'; cutaway.push(poster);
  const frame = box('Marco póster', [0.035, 0.84, 1.89], [room.right - 0.035, 2.5, 2.5], colors.wood); cutaway.push(frame);
  const entryLabel = sign('ACCESO ÚNICO', { x: -4.7, y: 0.04, z: room.front + 0.5, width: 2, height: 0.3, fontSize: 60 }); entryLabel.rotation.x = -Math.PI / 2;
  addDecorations({ scene, box, cylinder, sign, material, renderCandidates, cutaway, barrier });

  function person(name, position, options, yaw = 0) {
    const character = createCharacter(options); character.name = name; character.position.set(...position); character.rotation.y = yaw; scene.add(character);
    barrier(name, position[0] - 0.3, position[0] + 0.3, position[2] - 0.3, position[2] + 0.3); return character;
  }
  const receptionist = person('Recepcionista', [reception.x, 0, reception.staffZ], { shirt: colors.blue, seated: true }, Math.PI);
  const technician = person('Técnico', [-1.1, 0, 3.8], { shirt: colors.green, technician: true }, 0);
  const e2 = CONFIG.stations[1];
  const worker = person('Cliente trabajando', [e2.x - 1.75, 0, e2.z + 1.23], { shirt: 0xc2a36e, seated: true }, 0);
  const player = new THREE.Group(); player.name = 'Cliente'; player.visible = false; scene.add(player);
  const standingPlayer = createCharacter({ shirt: 0x7f9baf }), seatedPlayer = createCharacter({ shirt: 0x7f9baf, seated: true });
  seatedPlayer.visible = false; player.add(standingPlayer, seatedPlayer);
  scene.add(new THREE.HemisphereLight(0xfff7e8, 0xb8a285, 2.7));
  const sun = new THREE.DirectionalLight(0xffedcf, 2.6); sun.position.set(-2, 8, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 12, bottom: -10, near: 0.5, far: 32 }); sun.shadow.normalBias = 0.035; scene.add(sun);
  [-1.6, 3.4].forEach(x => [-4, 1, 6].forEach(z => box('Luminaria', [1.4, 0.035, 0.27], [x, room.height - 0.025, z], colors.wall, { emissive: 0xffefca, emissiveIntensity: 1 })));
  // Mobiliario estático: una llamada por geometría/material compartidos. Se
  // conservan los objetos lógicos para nombres, límites y pruebas de layout.
  // Pantallas, mecanismos y paredes del corte de cámara se dibujan aparte.
  scene.updateMatrixWorld(true);
  const batches = new Map();
  for (const mesh of renderCandidates) {
    let excluded = mesh.material.transparent;
    for (let ancestor = mesh; ancestor && !excluded; ancestor = ancestor.parent) excluded = ancestor.userData.dynamic || cutaway.includes(ancestor);
    if (excluded) continue;
    const key = mesh.geometry.uuid + ':' + mesh.material.uuid;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(mesh);
  }
  for (const items of batches.values()) {
    if (items.length < 3) continue;
    const batch = new THREE.InstancedMesh(items[0].geometry, items[0].material, items.length);
    batch.name = 'Mobiliario agrupado'; batch.castShadow = true; batch.receiveShadow = true;
    items.forEach((mesh, index) => { batch.setMatrixAt(index, mesh.matrixWorld); mesh.visible = false; });
    batch.instanceMatrix.needsUpdate = true; batch.computeBoundingSphere(); scene.add(batch);
  }
  return {
    colliders, player, receptionist, technician, worker, printers, screens, seats, rateSheet, cabinetDoor, filamentSource,
    setOverview(enabled) { cutaway.forEach(object => { object.visible = !enabled; }); player.visible = enabled; },
    setPlayerSeated(seated) { standingPlayer.visible = !seated; seatedPlayer.visible = seated; },
    getZone({ x, z }) {
      if (z > room.front - 0.2) return 'Acceso';
      if (z > 5.7 && x < -1.6) return 'Recepción';
      if (x > 0.9 && z < 4.6) return z > 0.27 ? 'Estación E1' : z > -3.38 ? 'Estación E2' : 'Estación E3';
      if (z < -4.6 && x < 0.5 && x > -3) return 'Filamentos';
      return 'Taller';
    },
  };
}
