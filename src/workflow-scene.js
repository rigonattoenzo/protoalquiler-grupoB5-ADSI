import * as THREE from 'three';
import { CONFIG } from './config.js';
import { DEMO, STEPS } from './workflow.js';
import { moveCircle } from './physics.js';
import { createMonitorDisplay } from './monitor.js';

export function createWorkflowScene({ scene, world }) {
  const root = new THREE.Group(); root.name = 'Recorrido asistido'; scene.add(root);
  const e1 = CONFIG.stations[0], printer = world.printers.get('E1');
  const pla = new THREE.MeshStandardMaterial({ color: DEMO.color, roughness: 0.7 });
  function component(name, isBack, parent = root) {
    const group = new THREE.Group(); group.name = name; parent.add(group);
    function part(size, position) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), pla); mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; }
    if (isBack) {
      part([0.5, 0.43, 0.055], [0, 0.215, 0]).rotation.x = -0.25;
      part([0.46, 0.065, 0.075], [0, 0.025, 0.13]);
    } else {
      part([0.64, 0.055, 0.46], [0, 0.0275, 0]);
      [-0.16, 0.16].forEach(x => part([0.08, 0.065, 0.12], [x, 0.06, -0.08]));
    }
    return group;
  }
  const base = component('Base terminada sobre mesa', false);
  const back = component('Respaldo terminado sobre mesa', true);
  const printedBase = component('Base en impresión', false);
  const printedBack = component('Respaldo en impresión', true);
  const tablePoint = new THREE.Vector3(e1.x + 0.15, 0.916, e1.z - 0.26);
  base.position.copy(tablePoint); back.position.copy(tablePoint).add(new THREE.Vector3(0.75, 0, 0));
  printedBase.position.set(printer.x, 1.14, printer.z);
  printedBack.position.set(printer.x, 1.14, printer.z);
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 48), new THREE.MeshBasicMaterial({ color: CONFIG.colors.green, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }));
  marker.name = 'Destino del recorrido'; marker.rotation.x = -Math.PI / 2; marker.position.y = 0.045; root.add(marker);
  const technician = world.technician;
  const technicianCollider = world.colliders.find(box => box.id === 'Técnico');
  const originalPosition = technician.position.clone(), originalQuaternion = technician.quaternion.clone();
  const originalCollider = { ...technicianCollider };
  const patrol = [{ x: -1.1, z: 3.8 }, { x: 0.35, z: 3.8 }, { x: 0.35, z: -3.5 }, { x: -2.9, z: -3.5 }, { x: -2.9, z: 3.8 }];
  let patrolIndex = 1, route = [], called = false, elapsed = 0, wait = 0, lastStep = 'idle';
  let state = { mode: null, stepId: 'idle', stepIndex: -1, progress: 0 };
  const monitors = [...world.screens].map(([id, screen]) => createMonitorDisplay(screen, { occupied: id !== 'E1' }));
  function syncCollider() { Object.assign(technicianCollider, { minX: technician.position.x - 0.3, maxX: technician.position.x + 0.3, minZ: technician.position.z - 0.3, maxZ: technician.position.z + 0.3 }); }
  function planHelp() {
    const p = technician.position;
    // Primero vuelve al corredor; después rodea las sillas por su frente.
    route = [{ x: 0.35, z: p.z }, { x: 0.35, z: CONFIG.workstation.approachZ }, { x: CONFIG.workstation.assistant.x, z: CONFIG.workstation.approachZ }, { ...CONFIG.workstation.assistant }];
  }
  function applyState(next) {
    state = next;
    if (next.assistantCalled && !called) planHelp();
    if (!next.assistantCalled && called) {
      // Sale por el frente de la silla antes de retomar el corredor.
      route = [{ x: technician.position.x, z: CONFIG.workstation.approachZ }, { x: 0.35, z: CONFIG.workstation.approachZ }, { x: 0.35, z: 3.8 }];
      patrolIndex = 1;
    }
    called = Boolean(next.assistantCalled);
    if (!next.mode && lastStep !== 'idle') {
      technician.position.copy(originalPosition); technician.quaternion.copy(originalQuaternion); Object.assign(technicianCollider, originalCollider);
      route = []; patrolIndex = 1; wait = 0;
    }
    lastStep = next.stepId;
  }
  function walkTechnician(dt, playerPosition) {
    const destination = route[0] || (called ? null : patrol[patrolIndex]);
    if (!destination) { technician.rotation.y = -Math.PI / 2; return; }
    if (wait > 0) { wait -= dt; return; }
    const dx = destination.x - technician.position.x, dz = destination.z - technician.position.z, distance = Math.hypot(dx, dz);
    if (distance < 0.045) {
      if (route.length) route.shift(); else { patrolIndex = (patrolIndex + 1) % patrol.length; wait = 1.2; }
      return;
    }
    const obstacles = world.colliders.filter(item => item !== technicianCollider);
    if (playerPosition) obstacles.push({ minX: playerPosition.x - 0.26, maxX: playerPosition.x + 0.26, minZ: playerPosition.z - 0.26, maxZ: playerPosition.z + 0.26 });
    const amount = Math.min(distance, dt * (called ? 1.45 : 0.8));
    const next = moveCircle(technician.position, { x: dx / distance * amount, z: dz / distance * amount }, 0.28, obstacles);
    technician.position.set(next.x, 0, next.z); technician.rotation.y = Math.atan2(-dx, -dz); syncCollider();
  }
  function update(dt, nextState = state, playerPosition) {
    const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05); elapsed += step; state = nextState;
    walkTechnician(step, playerPosition);
    const definition = STEPS[state.stepIndex];
    marker.visible = !state.complete && !definition?.automatic;
    const atReception = !definition || definition.target === 'reception';
    marker.position.set(atReception ? CONFIG.reception.x : CONFIG.workstation.target.x, 0.045, atReception ? CONFIG.reception.z + 1.15 : CONFIG.workstation.target.z);
    marker.material.opacity = 0.55 + Math.sin(elapsed * 2) * 0.1;
    const basePrinting = state.stepId === 'printing-base', backPrinting = state.stepId === 'printing-detail';
    printedBase.visible = basePrinting || state.stepId === 'base-ready';
    printedBack.visible = backPrinting || state.stepId === 'detail-ready';
    printedBase.scale.y = basePrinting ? Math.max(0.01, state.progress) : 1;
    printedBack.scale.y = backPrinting ? Math.max(0.01, state.progress) : 1;
    base.visible = Boolean(state.baseOnTable); back.visible = Boolean(state.backOnTable);
    base.position.copy(tablePoint); back.position.copy(tablePoint).add(new THREE.Vector3(0.75, 0, 0));
    if (state.stepId === 'assembly' || state.assembled) {
      const p = state.assembled ? 1 : state.progress;
      back.position.copy(tablePoint).add(new THREE.Vector3(0.75 * (1 - p), Math.sin(p * Math.PI) * 0.35 + 0.055 * p, -0.04 * p));
    }
    printer.spool.visible = Boolean(state.materialLoaded);
    if (basePrinting || backPrinting) {
      printer.gantry.position.y = 1.36 + state.progress * (backPrinting ? 0.4 : 0.06);
      printer.gantry.position.z = printer.z + Math.sin(elapsed * 5) * 0.23;
      printer.head.position.x = Math.sin(elapsed * 8) * 0.28;
    } else { printer.gantry.position.set(printer.x, 1.65, printer.z); printer.head.position.x = 0.32; }
    const other = world.printers.get('E2'); other.head.position.x = Math.sin(elapsed * 0.65) * 0.15;
    monitors.forEach(display => display.update(state, step));
    world.worker.rotation.y = Math.sin(elapsed * 0.45) * 0.025;
    world.worker.getObjectByName('Mano izquierda').position.y = 0.92 + Math.sin(elapsed * 5) * 0.008;
    world.worker.getObjectByName('Mano derecha').position.y = 0.92 + Math.cos(elapsed * 5.7) * 0.008;
  }
  return {
    applyState, update,
    get assistantReady() { return called && route.length === 0; },
    get printer() { return printer; },
    reset() { applyState({ mode: null, stepId: 'idle', stepIndex: -1 }); update(0); },
    dispose() { technician.position.copy(originalPosition); technician.quaternion.copy(originalQuaternion); Object.assign(technicianCollider, originalCollider); monitors.forEach(display => display.dispose()); root.removeFromParent(); root.traverse(object => { if (object.isMesh) object.geometry.dispose(); }); pla.dispose(); marker.material.dispose(); },
  };
}
