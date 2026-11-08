import * as THREE from 'three';
import { CONFIG } from './config.js';
import { DEMO, STEPS } from './workflow.js';
import { moveCircle } from './physics.js';
import { createMonitorDisplay } from './monitor.js';

export function createWorkflowScene({ scene, world, camera }) {
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
  const technicianHead = technician.getObjectByName('Cabeza'), receptionistHead = world.receptionist.getObjectByName('Cabeza');
  const heldSpool = printer.spool.clone(true); heldSpool.name = 'Bobina en manos del técnico';
  heldSpool.traverse(item => { if (item.isMesh) item.geometry = item.geometry.clone(); });
  technician.add(heldSpool);
  function resetHeldSpool() { technician.add(heldSpool); heldSpool.position.set(0.28, 1.0, -0.3); heldSpool.rotation.set(0, 0, 0); heldSpool.scale.setScalar(0.65); heldSpool.visible = false; }
  resetHeldSpool();
  const loadFrom = new THREE.Vector3();
  const bag = new THREE.Group(); bag.name = 'Bolsa con soporte en mano';
  const paper = new THREE.MeshStandardMaterial({ color: 0xc7a477, roughness: 1 });
  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.15), paper); bag.add(bagBody);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.008, 0.125), new THREE.MeshStandardMaterial({ color: 0x796044 })); top.position.y = 0.174; bag.add(top);
  [-0.05, 0.05].forEach(z => { const handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 16, Math.PI), paper); handle.position.set(0, 0.18, z); bag.add(handle); });
  const insideBase = component('Base dentro de la bolsa', false, bag); insideBase.scale.setScalar(0.35); insideBase.position.y = 0.14;
  const insideBack = component('Respaldo dentro de la bolsa', true, bag); insideBack.scale.setScalar(0.35); insideBack.position.y = 0.15;
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0xd9af8b, roughness: 0.9 });
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), handMaterial); hand.position.set(0.02, 0.23, 0.015); bag.add(hand);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.27, 10), new THREE.MeshStandardMaterial({ color: 0x7f9baf })); arm.position.set(0.1, 0.08, 0.09); arm.rotation.z = 0.45; bag.add(arm);
  const avatarBag = bag.clone(true); avatarBag.name = 'Bolsa del cliente'; avatarBag.position.set(0.34, 0.67, -0.1); world.player.add(avatarBag);
  (camera || root).add(bag); bag.position.set(0.42, -0.38, -0.85); bag.rotation.y = -0.12;
  bag.visible = false; avatarBag.visible = false;
  const patrol = [{ x: -1.1, z: 3.8 }, { x: 0.35, z: 3.8 }, { x: 0.35, z: -3.5 }, { x: -2.9, z: -3.5 }, { x: -2.9, z: 3.8 }];
  let patrolIndex = 1, route = [], called = false, elapsed = 0, wait = 0, lastStep = 'idle', materialPhase = 'idle', phaseClock = 0, materialReady = false;
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
    if (next.stepId === 'material' && lastStep !== 'material') {
      materialPhase = 'to-cabinet'; phaseClock = 0; materialReady = false; wait = 0; resetHeldSpool();
      route = [{ x: technician.position.x, z: CONFIG.workstation.approachZ }, { x: 0.35, z: CONFIG.workstation.approachZ }, { x: 0.35, z: -4.35 }, { x: 0.05, z: -4.35 }];
    }
    if (!next.mode && lastStep !== 'idle') {
      technician.position.copy(originalPosition); technician.quaternion.copy(originalQuaternion); Object.assign(technicianCollider, originalCollider);
      route = []; patrolIndex = 1; wait = 0;
      materialPhase = 'idle'; phaseClock = 0; materialReady = false; resetHeldSpool();
      world.filamentSource.visible = true;
      technicianHead.rotation.set(0, 0, 0); receptionistHead.rotation.set(0, 0, 0); world.cabinetDoor.rotation.y = 0;
    }
    lastStep = next.stepId;
  }
  function walkTechnician(dt, playerPosition) {
    const destination = route[0] || (called ? null : patrol[patrolIndex]);
    if (!destination) return;
    if (wait > 0) { wait -= dt; return; }
    const dx = destination.x - technician.position.x, dz = destination.z - technician.position.z, distance = Math.hypot(dx, dz);
    if (distance < 0.045) {
      if (route.length) route.shift(); else { patrolIndex = (patrolIndex + 1) % patrol.length; wait = 1.2; }
      return;
    }
    const obstacles = world.colliders.filter(item => item !== technicianCollider);
    if (playerPosition) obstacles.push({ minX: playerPosition.x - 0.26, maxX: playerPosition.x + 0.26, minZ: playerPosition.z - 0.26, maxZ: playerPosition.z + 0.26 });
    const fetching = ['to-cabinet', 'to-printer'].includes(materialPhase);
    const amount = Math.min(distance, dt * (fetching ? 2.6 : called ? 1.45 : 0.8));
    const next = moveCircle(technician.position, { x: dx / distance * amount, z: dz / distance * amount }, 0.28, obstacles);
    technician.position.set(next.x, 0, next.z); technician.rotation.y = Math.atan2(-dx, -dz); syncCollider();
  }
  function updateMaterial(dt) {
    if (state.stepId !== 'material') return;
    if (materialPhase === 'to-cabinet' && route.length === 0) { materialPhase = 'pickup'; phaseClock = 0; }
    if (materialPhase === 'pickup') {
      technician.rotation.y = Math.atan2(technician.position.x - CONFIG.cabinet.x, technician.position.z - CONFIG.cabinet.z);
      phaseClock += dt;
      if (phaseClock >= 0.9) { heldSpool.visible = true; world.filamentSource.visible = false; materialPhase = 'to-printer'; route = [{ x: 0.35, z: -4.35 }, { x: 0.35, z: CONFIG.workstation.approachZ }, { x: printer.x, z: CONFIG.workstation.approachZ }, { x: printer.x, z: printer.z + 1.1 }]; }
    } else if (materialPhase === 'to-printer' && route.length === 0) {
      materialPhase = 'loading'; phaseClock = 0; technician.updateMatrixWorld(true); heldSpool.getWorldPosition(loadFrom); root.attach(heldSpool);
    } else if (materialPhase === 'loading') {
      phaseClock += dt; technician.rotation.y = 0;
      heldSpool.position.lerpVectors(loadFrom, printer.spool.position, Math.min(1, phaseClock / 0.9));
      if (phaseClock >= 0.9) {
        heldSpool.visible = false; materialReady = true; materialPhase = 'loaded';
        route = [{ x: printer.x, z: CONFIG.workstation.approachZ }, { x: CONFIG.workstation.assistant.x, z: CONFIG.workstation.approachZ }, { ...CONFIG.workstation.assistant }];
      }
    }
  }
  function gaze(character, head, target, attending, dt) {
    let yaw = 0, pitch = 0;
    if (attending && target) {
      const dx = target.x - character.position.x, dz = target.z - character.position.z;
      const desired = Math.atan2(-dx, -dz);
      yaw = THREE.MathUtils.clamp(THREE.MathUtils.euclideanModulo(desired - character.rotation.y + Math.PI, Math.PI * 2) - Math.PI, -1.25, 1.25);
      pitch = THREE.MathUtils.clamp(Math.atan2((target.y ?? CONFIG.navigation.eyeHeight) - head.position.y, Math.hypot(dx, dz)), -0.3, 0.3);
    }
    head.rotation.order = 'YXZ'; head.rotation.y = THREE.MathUtils.damp(head.rotation.y, yaw, 7, dt); head.rotation.x = THREE.MathUtils.damp(head.rotation.x, pitch, 7, dt);
  }
  function update(dt, nextState = state, playerPosition, { receptionAttending = false, firstPerson = true } = {}) {
    const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05); elapsed += step; state = nextState;
    walkTechnician(step, playerPosition);
    updateMaterial(step);
    world.cabinetDoor.rotation.y = THREE.MathUtils.damp(world.cabinetDoor.rotation.y, materialPhase === 'pickup' ? -Math.PI * 0.46 : 0, 7, step);
    const definition = STEPS[state.stepIndex];
    marker.visible = !state.complete && !definition?.automatic;
    const atReception = !definition || definition.target === 'reception';
    const atExit = definition?.target === 'exit';
    marker.position.set(atExit ? -4.7 : atReception ? CONFIG.reception.x : CONFIG.workstation.center.x, 0.045, atExit ? CONFIG.room.front + 0.5 : atReception ? CONFIG.reception.z + 1.15 : CONFIG.workstation.center.z);
    marker.scale.set(atReception || atExit ? 1 : 7.5, atReception || atExit ? 1 : 2.2, 1);
    marker.material.opacity = 0.55 + Math.sin(elapsed * 2) * 0.1;
    const basePrinting = state.stepId === 'printing-base', backPrinting = state.stepId === 'printing-detail';
    printedBase.visible = basePrinting || state.stepId === 'base-ready';
    printedBack.visible = backPrinting || state.stepId === 'detail-ready';
    printedBase.scale.y = basePrinting ? Math.max(0.01, state.progress) : 1;
    printedBack.scale.y = backPrinting ? Math.max(0.01, state.progress) : 1;
    base.visible = Boolean(state.baseOnTable && !state.hasBag); back.visible = Boolean(state.backOnTable && !state.hasBag);
    bag.visible = Boolean(state.hasBag && camera && firstPerson); avatarBag.visible = Boolean(state.hasBag);
    if (bag.visible) bag.position.y = -0.38 + Math.sin(elapsed * 2) * 0.007;
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
    const assistantAttending = called && !['to-cabinet', 'pickup', 'to-printer', 'loading'].includes(materialPhase);
    if (assistantAttending && route.length === 0 && playerPosition) {
      const yaw = Math.atan2(technician.position.x - playerPosition.x, technician.position.z - playerPosition.z);
      const delta = THREE.MathUtils.euclideanModulo(yaw - technician.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      technician.rotation.y += delta * (1 - Math.exp(-step * 3));
    }
    gaze(technician, technicianHead, playerPosition, assistantAttending, step);
    gaze(world.receptionist, receptionistHead, playerPosition, receptionAttending, step);
  }
  return {
    applyState, update,
    get assistantReady() { return called && route.length === 0; },
    get materialReady() { return materialReady; },
    get materialStatus() { return materialPhase; },
    get printer() { return printer; },
    reset() { applyState({ mode: null, stepId: 'idle', stepIndex: -1 }); update(0); },
    dispose() {
      technician.position.copy(originalPosition); technician.quaternion.copy(originalQuaternion); Object.assign(technicianCollider, originalCollider); monitors.forEach(display => display.dispose());
      world.filamentSource.visible = true; world.cabinetDoor.rotation.y = 0;
      technicianHead.rotation.set(0, 0, 0); receptionistHead.rotation.set(0, 0, 0);
      const geometries = new Set(), materials = new Set();
      [root, bag, avatarBag, heldSpool].forEach(group => group.traverse(object => { if (object.isMesh) { geometries.add(object.geometry); if (object !== heldSpool && !heldSpool.children.includes(object)) materials.add(object.material); } }));
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      root.removeFromParent(); bag.removeFromParent(); avatarBag.removeFromParent(); heldSpool.removeFromParent();
    },
  };
}
