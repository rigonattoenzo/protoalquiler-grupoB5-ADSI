import * as THREE from 'three';
import { DEMO } from './workflow.js';

// Pantalla de CAD/slicer guionada, dibujada localmente; no es un editor real.
export function createMonitorDisplay(screen, { occupied = false, station = 'E1' } = {}) {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const previousMaterial = screen.material;
  screen.material = new THREE.MeshBasicMaterial({ map: texture });
  let elapsed = 0, lastDraw = -1;
  function draw(state) {
    if (!ctx?.beginPath) return; // Permite comprobar el grafo en Node sin un canvas de render.
    ctx.setTransform(2 / 3, 0, 0, 2 / 3, 0, 0);
    if (station === 'E3') {
      ctx.fillStyle = '#182b2c'; ctx.fillRect(0, 0, 960, 600);
      ctx.fillStyle = '#233a3b'; ctx.fillRect(0, 0, 960, 62);
      ctx.fillStyle = '#ecf1df'; ctx.font = '600 25px system-ui'; ctx.fillText('ProtoCAD / ' + station, 23, 40);
      ctx.strokeStyle = '#4c6863'; ctx.lineWidth = 3; ctx.strokeRect(432, 200, 96, 115);
      ctx.beginPath(); ctx.moveTo(452, 236); ctx.lineTo(509, 236); ctx.moveTo(452, 255); ctx.lineTo(494, 255); ctx.stroke();
      ctx.fillStyle = '#d9e2cb'; ctx.font = '500 25px system-ui'; ctx.fillText('Sin proyecto abierto', 366, 365);
      ctx.fillStyle = '#78928c'; ctx.font = '19px system-ui'; ctx.fillText('Estación disponible', 397, 408);
      texture.needsUpdate = true; return;
    }
    const printing = !occupied && state.stepId?.startsWith('printing');
    const second = ['design-detail', 'prepare', 'review-detail', 'printing-detail', 'detail-ready', 'assembly', 'result', 'checkout', 'complete'].includes(state.stepId);
    const slicing = !occupied && state.mode === 'autonomous' && ['prepare', 'confirm', 'material'].includes(state.stepId);
    const level = occupied ? 2 : state.designLevel || 0;
    ctx.fillStyle = '#182b2c'; ctx.fillRect(0, 0, 960, 600);
    ctx.fillStyle = '#233a3b'; ctx.fillRect(0, 0, 960, 62); ctx.fillRect(0, 62, 200, 492);
    ctx.fillStyle = '#ecf1df'; ctx.font = '600 25px system-ui'; ctx.fillText('ProtoCAD', 23, 40);
    ctx.font = '20px system-ui'; ctx.fillStyle = '#b2c4b8'; ctx.fillText(occupied ? 'Carcasa para sensor / ' + station : DEMO.piece + ' / ' + station, 220, 40);
    ctx.fillStyle = '#d9e2cb'; ctx.fillText('COMPONENTES', 17, 104);
    ctx.fillStyle = level >= 1 ? '#a6d3ab' : '#78928c'; ctx.fillText(occupied ? '01  Caja + PCB' : '01  Base + ranura', 17, 153);
    ctx.fillStyle = level >= 2 ? '#a6d3ab' : '#78928c'; ctx.fillText(occupied ? '02  Tapa ventilada' : '02  Respaldo', 17, 198);
    ctx.font = '17px system-ui'; ctx.fillStyle = '#78928c';
    ctx.fillText(occupied ? 'PLA / Gris perla' : 'PLA / ' + DEMO.colorName, 17, 480); ctx.fillText(occupied ? 'Electrónica / sensor' : state.mode === 'order' ? 'Trabajo por encargo' : state.mode === 'autonomous' ? 'Diseño autónomo' : 'Diseño asistido', 17, 516);
    const project = (x, y, z) => {
      const angle = Math.sin(elapsed * 0.25) * 0.18;
      const rx = x * Math.cos(angle) - z * Math.sin(angle), rz = x * Math.sin(angle) + z * Math.cos(angle);
      return [575 + (rx - rz) * 370, 397 + (rx + rz) * 110 - y * 420];
    };
    ctx.strokeStyle = '#2a4545'; ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i += 1) {
      const a = project(i * 0.12, 0, -0.72), b = project(i * 0.12, 0, 0.72), c = project(-0.72, 0, i * 0.12), d = project(0.72, 0, i * 0.12);
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.moveTo(...c); ctx.lineTo(...d); ctx.stroke();
    }
    function cuboid(cx, cy, cz, w, h, d, alpha = 1, tilt = 0) {
      const vertices = [];
      for (const y of [-h / 2, h / 2]) for (const z of [-d / 2, d / 2]) for (const x of [-w / 2, w / 2]) {
        vertices.push(project(cx + x, cy + y * Math.cos(tilt) - z * Math.sin(tilt), cz + y * Math.sin(tilt) + z * Math.cos(tilt)));
      }
      ctx.globalAlpha = alpha;
      [[0, 1, 5, 4], [1, 3, 7, 5], [4, 5, 7, 6]].forEach((face, i) => {
        ctx.beginPath(); ctx.moveTo(...vertices[face[0]]); face.slice(1).forEach(index => ctx.lineTo(...vertices[index])); ctx.closePath();
        ctx.fillStyle = (occupied ? ['#7e999e', '#607e84', '#b3c6ca'] : ['#789b83', '#698b77', '#a0c3a7'])[i]; ctx.fill(); ctx.strokeStyle = '#c9e4bf'; ctx.lineWidth = 2; ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    if (occupied) {
      cuboid(0, 0.03, 0, 0.72, 0.06, 0.5);
      [-0.23, 0.23].forEach(z => cuboid(0, 0.14, z, 0.72, 0.22, 0.04));
      [-0.34, 0.34].forEach(x => cuboid(x, 0.14, 0, 0.04, 0.22, 0.5));
      [-0.25, 0.25].forEach(x => [-0.15, 0.15].forEach(z => cuboid(x, 0.09, z, 0.045, 0.12, 0.045)));
      cuboid(0, 0.14, 0, 0.52, 0.025, 0.31);
      cuboid(0, 0.45, 0, 0.74, 0.045, 0.52);
      ctx.strokeStyle = '#344b50'; ctx.lineWidth = 4;
      for (let i = 0; i < 5; i += 1) { const a = project(-0.2 + i * 0.1, 0.476, -0.14), b = project(-0.2 + i * 0.1, 0.476, 0.14); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    } else {
      if (level >= 1 || !state.mode) cuboid(0, 0.045, 0, 0.64, 0.09, 0.46, state.mode ? 1 : 0.28);
      if (level >= 2) { cuboid(0, 0.28, -0.03, 0.5, 0.48, 0.055, 1, -0.25); cuboid(0, 0.1, 0.17, 0.5, 0.08, 0.075); }
    }
    if (slicing) {
      ctx.strokeStyle = '#d9b582'; ctx.lineWidth = 1;
      for (let y = 0.025; y < 0.48; y += 0.025) {
        const a = project(-0.25, y, -0.035), b = project(0.25, y, -0.035);
        ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
      }
      ctx.fillStyle = '#e8d5ad'; ctx.font = '18px system-ui'; ctx.fillText('2 archivos · 25 g PLA · 90 min de estación', 240, 525);
    }
    if (level >= 1) { ctx.font = '18px system-ui'; ctx.fillStyle = '#a4b9ac'; ctx.fillText(occupied ? '72 × 50 × 25 mm' : '64 mm', 500, 490); ctx.fillText(occupied ? 'Carcasa / vista de ensamblaje' : 'Soporte / componentes', 300, 125); }
    ctx.fillStyle = '#2d4643'; ctx.fillRect(0, 552, 960, 48);
    ctx.fillStyle = '#d8e8cf'; ctx.font = '20px system-ui';
    const label = printing ? 'IMPRESIÓN ' + (second ? '02 / RESPALDO' : '01 / BASE') : slicing ? state.stepId === 'prepare' ? 'LAMINADOR / ORIENTACIÓN + CAPAS' : 'DOS ARCHIVOS PREPARADOS / REVISIÓN TÉCNICA' : second ? 'COMPONENTE 02 / RESPALDO' : 'COMPONENTE 01 / BASE';
    ctx.fillText(occupied ? 'Carcasa_sensor_v3 / ventilación + soportes de placa' : label, 20, 582);
    if (printing) { ctx.fillStyle = '#9abd89'; ctx.fillRect(540, 565, 370 * state.progress, 16); ctx.fillStyle = '#f4efda'; ctx.fillText(Math.round(state.progress * 100) + '%', 870, 542); }
    texture.needsUpdate = true;
  }
  return {
    update(state, dt = 0) { elapsed += Math.max(0, dt); if (station === 'E3' && lastDraw >= 0) return; if (elapsed - lastDraw >= (station === 'E1' ? 0.125 : 0.5)) { draw(state); lastDraw = elapsed; } },
    dispose() { texture.dispose(); screen.material.dispose(); screen.material = previousMaterial; },
  };
}
