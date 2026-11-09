import * as THREE from 'three';
import { CONFIG } from './config.js';

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  paint(canvas.getContext('2d'), canvas);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
// Trama local y determinista: se genera una vez, sin archivos ni descargas.
export function applyFloorTexture(floor) {
  let seed = 31;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const texture = canvasTexture(512, 512, ctx => {
    for (let row = 0; row < 2; row += 1) for (let col = 0; col < 2; col += 1) {
      ctx.fillStyle = (row + col) % 2 ? '#caa88b' : '#ead6b8'; ctx.fillRect(col * 256, row * 256, 256, 256);
    }
    for (let i = 0; i < 1600; i += 1) { ctx.fillStyle = i % 2 ? '#fff8e719' : '#82694c0a'; ctx.fillRect(random() * 512, random() * 512, 1 + random() * 2, 1); }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(CONFIG.room.width / 1.6, CONFIG.room.depth / 1.6);
  floor.material = floor.material.clone(); floor.material.color.set(0xffffff); floor.material.map = texture; floor.material.roughness = 1;
}

export function drawProcessPoster(ctx, canvas) {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#fff0d2'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#453f3c'; ctx.font = '800 ' + w * 0.061 + 'px system-ui'; ctx.fillText('DE LA IDEA A LA PIEZA', w / 2, h * 0.16, w * 0.9);
  ctx.fillStyle = '#7a8065'; ctx.font = '500 ' + w * 0.026 + 'px system-ui'; ctx.fillText('Un espacio para transformar lo que imaginás', w / 2, h * 0.3, w * 0.9);
  [0.2, 0.5, 0.8].forEach((position, i) => {
    const x = w * position, top = h * 0.41, pw = w * 0.22, ph = h * 0.35;
    ctx.fillStyle = ['#d9e4c9', '#edceb4', '#e7dbaa'][i]; ctx.fillRect(x - pw / 2, top, pw, ph);
    ctx.fillStyle = '#5c8066';
    if (i === 0) {
      ctx.fillRect(x - pw * 0.33, top + ph * 0.16, pw * 0.66, ph * 0.58);
      ctx.fillStyle = '#fff8e4'; ctx.fillRect(x - pw * 0.29, top + ph * 0.21, pw * 0.58, ph * 0.47);
      ctx.fillStyle = '#b18b67'; ctx.fillRect(x - pw * 0.43, top + ph * 0.8, pw * 0.86, ph * 0.06);
      ctx.fillStyle = '#95b59c'; ctx.fillRect(x - pw * 0.16, top + ph * 0.38, pw * 0.32, ph * 0.16);
    } else if (i === 1) {
      ctx.fillRect(x - pw * 0.33, top + ph * 0.1, pw * 0.05, ph * 0.73); ctx.fillRect(x + pw * 0.28, top + ph * 0.1, pw * 0.05, ph * 0.73);
      ctx.fillRect(x - pw * 0.33, top + ph * 0.1, pw * 0.66, ph * 0.05); ctx.fillRect(x - pw * 0.38, top + ph * 0.83, pw * 0.76, ph * 0.05);
      ctx.fillStyle = '#bd8b73'; ctx.fillRect(x - pw * 0.04, top + ph * 0.15, pw * 0.08, ph * 0.25);
      for (let layer = 0; layer < 5; layer += 1) { ctx.fillStyle = layer % 2 ? '#95b59c' : '#6c9171'; ctx.fillRect(x - pw * 0.18, top + ph * (0.76 - layer * 0.06), pw * 0.36, ph * 0.05); }
    } else {
      ctx.fillRect(x - pw * 0.32, top + ph * 0.78, pw * 0.64, ph * 0.08); ctx.fillRect(x - pw * 0.04, top + ph * 0.2, pw * 0.07, ph * 0.6);
      ctx.fillStyle = '#453f3c'; ctx.fillRect(x - pw * 0.15, top + ph * 0.16, pw * 0.3, ph * 0.56);
      ctx.fillStyle = '#f6eedc'; ctx.fillRect(x - pw * 0.12, top + ph * 0.2, pw * 0.24, ph * 0.45);
    }
    ctx.fillStyle = '#453f3c'; ctx.font = '750 ' + w * 0.032 + 'px system-ui'; ctx.fillText(['01 · DISEÑÁ', '02 · IMPRIMÍ', '03 · DISFRUTÁ'][i], x, h * 0.88, pw + 20);
  });
}

// Pictogramas vectoriales, sin depender de una tipografía de símbolos instalada.
export function drawRoomPictogram(ctx, canvas, kind) {
  if (!ctx.beginPath) return;
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#5c8066'; ctx.strokeStyle = '#5c8066'; ctx.lineWidth = w * 0.035; ctx.lineJoin = 'round';
  if (kind === 'box') {
    const polygon = points => { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)); ctx.closePath(); ctx.stroke(); };
    polygon([[0.18, 0.35], [0.5, 0.2], [0.82, 0.35], [0.82, 0.68], [0.5, 0.84], [0.18, 0.68]]);
    ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.35); ctx.lineTo(w * 0.5, h * 0.51); ctx.lineTo(w * 0.82, h * 0.35);
    ctx.moveTo(w * 0.5, h * 0.51); ctx.lineTo(w * 0.5, h * 0.84); ctx.moveTo(w * 0.34, h * 0.275); ctx.lineTo(w * 0.66, h * 0.43); ctx.stroke();
    return;
  }
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.18, w * 0.105, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(w * 0.39, h * 0.32, w * 0.22, h * 0.27);
  ctx.lineWidth = w * 0.075; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.35); ctx.lineTo(w * 0.24, h * 0.59); ctx.moveTo(w * 0.64, h * 0.35); ctx.lineTo(w * 0.76, h * 0.59); ctx.stroke();
  if (kind === 'woman') {
    ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.44); ctx.lineTo(w * 0.24, h * 0.69); ctx.lineTo(w * 0.76, h * 0.69); ctx.lineTo(w * 0.6, h * 0.44); ctx.closePath(); ctx.fill();
  }
  ctx.fillRect(w * 0.39, h * 0.58, w * 0.085, h * 0.29); ctx.fillRect(w * 0.525, h * 0.58, w * 0.085, h * 0.29);
}

export function addDecorations({ scene, box, cylinder, sign, material, renderCandidates, cutaway, barrier }) {
  const { colors, room } = CONFIG;
  const foliage = new THREE.IcosahedronGeometry(0.13, 0);
  function plant(name, x, y, z, scale = 1) {
    const group = new THREE.Group(); group.name = name; group.position.set(x, y, z); group.scale.setScalar(scale); scene.add(group);
    cylinder(group, 0.09, 0.14, [0, 0.07, 0], 0xc69576);
    cylinder(group, 0.012, 0.34, [0, 0.28, 0], colors.green, 8);
    [[-0.07, 0.27, -0.5], [0.07, 0.36, 0.5], [-0.025, 0.48, -0.15]].forEach(([dx, dy, tilt]) => {
      const leaf = new THREE.Mesh(foliage, material(colors.green)); leaf.position.set(dx, dy, 0); leaf.scale.set(0.72, 1.25, 0.45); leaf.rotation.z = tilt; group.add(leaf); renderCandidates.push(leaf);
    });
  }
  function artwork(name, { x, y, z, width, height, rotation = 0, theme = 'cube', title = '', subtitle = '', hideInOverview = false }) {
    const frame = new THREE.Group(); frame.name = name; frame.position.set(x, y, z); frame.rotation.y = rotation; scene.add(frame);
    if (hideInOverview) cutaway.push(frame);
    box('Fondo ' + name, [width + 0.07, height + 0.07, 0.04], [0, 0, -0.018], colors.trim, { parent: frame });
    const art = sign('', { x: 0, y: 0, z: 0.006, width, height, resolution: 512, background: '#fff3dc', draw(ctx, canvas) {
      const w = canvas.width, h = canvas.height;
      if (theme === 'welcome') {
        const wide = w / h > 1.7, textX = wide ? w * 0.34 : w / 2;
        ctx.fillStyle = '#5c8066'; ctx.fillRect(w * 0.04, h * 0.07, w * 0.92, h * 0.025);
        ctx.fillStyle = '#9c7958'; ctx.font = '650 ' + Math.round(w * 0.03) + 'px system-ui';
        ctx.fillText('DISEÑO + IMPRESIÓN 3D', textX, h * (wide ? 0.2 : 0.16), w * 0.85);
        ctx.fillStyle = '#453f3c'; ctx.font = '800 ' + Math.round(w * (wide ? 0.077 : 0.085)) + 'px system-ui';
        ctx.fillText('ProtoAlquiler', textX, h * (wide ? 0.4 : 0.29), w * (wide ? 0.58 : 0.9));
        ctx.fillStyle = '#5c8066'; ctx.font = '600 ' + Math.round(w * 0.034) + 'px system-ui';
        ctx.fillText('UN TALLER DE IDEAS', textX, h * (wide ? 0.59 : 0.39), w * 0.8);
        // Ilustración de impresora, pieza y capas; acompaña la marca.
        const px = wide ? w * 0.69 : w * 0.31, py = h * (wide ? 0.2 : 0.49), pw = w * (wide ? 0.23 : 0.38), ph = h * (wide ? 0.55 : 0.31);
        ctx.fillStyle = '#e7d8b9'; ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = '#5c8066'; ctx.fillRect(px, py, pw, 5); ctx.fillRect(px, py, 5, ph); ctx.fillRect(px + pw - 5, py, 5, ph);
        ctx.fillStyle = '#b18b67'; ctx.fillRect(px + 8, py + ph - 9, pw - 16, 6);
        ctx.fillStyle = '#453f3c'; ctx.fillRect(px + 5, py + ph * 0.26, pw - 10, 3); ctx.fillRect(px + pw * 0.57, py + ph * 0.23, 9, 14);
        for (let layer = 0; layer < 8; layer += 1) { ctx.fillStyle = layer % 2 ? '#7d9d81' : '#95b59c'; ctx.fillRect(px + pw * 0.29, py + ph - 13 - layer * ph * 0.05, pw * 0.42, ph * 0.04); }
        ctx.fillStyle = '#bd8b73'; ctx.fillRect(w * 0.08, h * 0.85, w * 0.84, h * 0.075);
        ctx.fillStyle = '#fff9ed'; ctx.font = '650 ' + Math.round(w * 0.026) + 'px system-ui'; ctx.fillText('DISEÑÁ  ·  PROTOTIPÁ  ·  CREÁ', w / 2, h * 0.888, w * 0.78);
        return;
      }
      ctx.fillStyle = '#e5c4a5'; ctx.fillRect(w * 0.07, h * 0.09, w * 0.86, h * 0.05);
      ctx.fillStyle = '#95b59c'; ctx.fillRect(w * 0.12, h * 0.25, w * 0.37, h * 0.35);
      ctx.fillStyle = '#bd8b73'; ctx.fillRect(w * 0.43, h * 0.35, w * 0.4, h * 0.3);
      if (ctx.beginPath) {
        ctx.lineWidth = w * 0.012; ctx.strokeStyle = '#453f3c';
        if (theme === 'leaf') {
          ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.62); ctx.bezierCurveTo(w * 0.1, h * 0.3, w * 0.82, h * 0.15, w * 0.62, h * 0.5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.66); ctx.lineTo(w * 0.63, h * 0.27); ctx.stroke();
        } else if (theme === 'bulb') {
          ctx.fillStyle = '#eddb9f'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.38, w * 0.19, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.47); ctx.lineTo(w * 0.4, h * 0.59); ctx.lineTo(w * 0.6, h * 0.59); ctx.lineTo(w * 0.6, h * 0.47); ctx.stroke();
          [0.62, 0.65].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.42, h * y); ctx.lineTo(w * 0.58, h * y); ctx.stroke(); });
          for (let i = 0; i < 7; i += 1) { const a = Math.PI + i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(w * (0.5 + Math.cos(a) * 0.25), h * 0.38 + Math.sin(a) * w * 0.25); ctx.lineTo(w * (0.5 + Math.cos(a) * 0.31), h * 0.38 + Math.sin(a) * w * 0.31); ctx.stroke(); }
        } else if (theme === 'rocket') {
          ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.2); ctx.bezierCurveTo(w * 0.77, h * 0.35, w * 0.65, h * 0.48, w * 0.6, h * 0.57); ctx.lineTo(w * 0.4, h * 0.57); ctx.bezierCurveTo(w * 0.35, h * 0.48, w * 0.23, h * 0.35, w * 0.5, h * 0.2); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.arc(w * 0.5, h * 0.37, w * 0.07, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.48); ctx.lineTo(w * 0.28, h * 0.6); ctx.lineTo(w * 0.4, h * 0.57); ctx.moveTo(w * 0.6, h * 0.48); ctx.lineTo(w * 0.72, h * 0.6); ctx.lineTo(w * 0.6, h * 0.57); ctx.moveTo(w * 0.44, h * 0.6); ctx.lineTo(w * 0.5, h * 0.69); ctx.lineTo(w * 0.56, h * 0.6); ctx.stroke();
        } else if (theme === 'gears') {
          [[0.4, 0.37, 0.15], [0.65, 0.54, 0.1]].forEach(([x, y, r]) => {
            ctx.beginPath(); ctx.arc(w * x, h * y, w * r, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(w * x, h * y, w * r * 0.4, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 10; i += 1) { const a = i * Math.PI / 5; ctx.beginPath(); ctx.moveTo(w * (x + Math.cos(a) * r), h * y + Math.sin(a) * w * r); ctx.lineTo(w * (x + Math.cos(a) * r * 1.25), h * y + Math.sin(a) * w * r * 1.25); ctx.stroke(); }
          });
        } else if (theme === 'phone') {
          ctx.strokeRect(w * 0.36, h * 0.24, w * 0.28, h * 0.36); ctx.strokeRect(w * 0.39, h * 0.27, w * 0.22, h * 0.27);
          ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.6); ctx.lineTo(w * 0.43, h * 0.68); ctx.lineTo(w * 0.75, h * 0.68); ctx.moveTo(w * 0.32, h * 0.59); ctx.lineTo(w * 0.68, h * 0.59); ctx.stroke();
        } else {
          const cx = w * 0.5, cy = h * 0.38, a = w * 0.22, b = Math.min(h * 0.1, w * 0.12), d = Math.min(h * 0.19, w * 0.3);
          ctx.beginPath(); ctx.moveTo(cx, cy - b); ctx.lineTo(cx + a, cy); ctx.lineTo(cx, cy + b); ctx.lineTo(cx - a, cy); ctx.closePath();
          ctx.moveTo(cx - a, cy); ctx.lineTo(cx - a, cy + d); ctx.lineTo(cx, cy + d + b); ctx.lineTo(cx + a, cy + d); ctx.lineTo(cx + a, cy);
          ctx.moveTo(cx, cy + b); ctx.lineTo(cx, cy + d + b); ctx.stroke();
        }
      }
      ctx.fillStyle = '#453f3c'; ctx.font = '750 ' + Math.round(w * 0.073) + 'px system-ui'; ctx.fillText(title, w / 2, h * 0.79, w * 0.9);
      ctx.font = '500 ' + Math.round(w * 0.036) + 'px system-ui'; ctx.fillText(subtitle, w / 2, h * 0.89, w * 0.9);
    } });
    frame.add(art);
    return frame;
  }

  // El panel recibe al visitante sobre el frente del depósito, detrás de caja.
  for (let i = 0; i < 20; i += 1) box('Listón mural recepción', [0.1, 1.4, 0.035], [-7.75 + i * 0.18, 2.23, 2.925], colors.wood);
  artwork('Panel Hecho acá', { x: -6.04, y: 2.23, z: 2.99, width: 2.75, height: 1.08, title: 'HECHO ACÁ', subtitle: 'Tus ideas toman forma · ProtoAlquiler 3D' });
  artwork('Póster recepción', { x: room.left + 0.065, y: 2.08, z: 5.05, width: 1.45, height: 1.15, rotation: Math.PI / 2, theme: 'welcome' });
  [-4.5, -1.525, 1.425].forEach((z, i) => artwork('Cuadro del pasillo ' + (i + 1), { x: -4.035, y: 1.63, z: z + 0.94, width: 0.62, height: 0.95, rotation: Math.PI / 2, theme: ['leaf', 'bulb', 'rocket'][i], title: ['INSPIRÁ', 'IMAGINÁ', 'PROBÁ'][i], subtitle: ['Observá lo cotidiano', 'Todo empieza con una idea', 'Un prototipo, otro intento'][i] }));
  [-0.55, 0.5].forEach((z, i) => artwork('Cuadro sobre puestos ' + (i + 1), { x: room.right - 0.07, y: 2.28, z, width: 0.75, height: 1.16, rotation: -Math.PI / 2, theme: i ? 'phone' : 'gears', title: i ? 'CREÁ' : 'EXPLORÁ', subtitle: i ? 'De la pantalla a tus manos' : 'Ideas que se conectan', hideInOverview: true }));

  // Estantes adosados: no ocupan la circulación del corredor.
  box('Estante recepción', [1.12, 0.065, 0.24], [-7.1, 1.22, 3.035], colors.wood);
  [-7.48, -6.72].forEach(x => box('Soporte estante recepción', [0.04, 0.17, 0.18], [x, 1.12, 3.01], colors.trim));
  plant('Planta recepción', -7.35, 1.253, 3.03, 0.6);
  [0, 1, 2].forEach(i => box('Libro recepción', [0.11, 0.27 + i * 0.025, 0.15], [-7.02 + i * 0.13, 1.39 + i * 0.0125, 3.02], [colors.green, colors.blue, colors.peach][i]));

  CONFIG.stations.forEach(({ id, x, z }) => {
    plant('Planta ' + id, x + 0.55, 0.916, z - 0.38, 0.75);
    [0, 1, 2].forEach(i => box('Renglón apuntes ' + id, [0.41, 0.002, 0.008], [x - 0.12, 0.932, z + 0.07 + i * 0.07], colors.trim));
    box('Lápiz ' + id, [0.018, 0.018, 0.27], [x + 0.25, 0.932, z + 0.2], colors.blue);
  });
  plant('Planta alta vidriera', room.right - 0.43, 0.025, 5.35, 2.4);
  barrier('Maceta vidriera', room.right - 0.68, room.right - 0.18, 5.1, 5.6);

  function rug(name, size, position, base, border) {
    const mesh = box(name, size, position, 0xffffff);
    mesh.material = mesh.material.clone(); mesh.material.roughness = 1;
    mesh.material.map = canvasTexture(256, 128, ctx => {
      ctx.fillStyle = border; ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = base; ctx.fillRect(5, 5, 246, 118);
      for (let y = 6; y < 123; y += 2) { ctx.fillStyle = '#fff5df16'; ctx.fillRect(6, y, 244, 0.5); }
      for (let x = 7; x < 250; x += 3) { ctx.fillStyle = '#453f3c0c'; ctx.fillRect(x, 6, 0.5, 116); }
    });
  }
  rug('Alfombra de entrada', [2.05, 0.012, 1.05], [-4.7, 0.034, 6.55], '#7d8b74', '#b6bea2');
  rug('Alfombra del pasillo', [1.65, 0.012, 7.8], [CONFIG.cabinet.x, 0.034, -0.7], '#c6ab8a', '#9b8064');

  // Pequeña galería material: modelos geométricos sobre estantes de la pared.
  [-2.5, 0.45].forEach((z, i) => {
    box('Estante galería ' + i, [0.25, 0.065, 0.8], [-3.95, 2.35, z], colors.wood);
    box('Soporte galería ' + i, [0.14, 0.15, 0.035], [-4.005, 2.25, z], colors.trim);
    const model = new THREE.Mesh(foliage, material(i ? colors.peach : colors.mint)); model.name = 'Modelo galería ' + i;
    model.position.set(-3.9, 2.53, z); model.scale.setScalar(1.1); model.rotation.z = Math.PI / 5; scene.add(model); renderCandidates.push(model);
  });
}
