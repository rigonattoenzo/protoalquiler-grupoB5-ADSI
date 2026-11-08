import * as THREE from 'three';
import { CONFIG } from './config.js';
import { DEMO } from './workflow.js';

/** Representación visual del guion; no avanza etapas ni mueve al visitante. */
export function createWorkflowScene({ scene, world }) {
  const root = new THREE.Group();
  root.name = 'Recorrido asistido';
  scene.add(root);

  const e1 = CONFIG.stations.find(station => station.id === 'E1');
  const model = new THREE.Group();
  model.name = 'Soporte de celular de demostración';
  // Junto a los apuntes, sin invadir la cama de la impresora.
  model.position.set(e1.x + 0.15, 0.916, e1.z - 0.4);
  root.add(model);
  const pla = new THREE.MeshStandardMaterial({
    color: DEMO.color,
    roughness: 0.72,
    metalness: 0,
  });
  function part(name, size, position) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), pla);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    model.add(mesh);
    return mesh;
  }
  const base = part('Base del soporte', [0.64, 0.055, 0.46], [0, 0.0275, 0]);
  const back = part('Apoyo inclinado del soporte', [0.5, 0.45, 0.055], [0, 0.24, -0.045]);
  back.rotation.x = -0.25;
  const lip = part('Labio de retención', [0.5, 0.075, 0.075], [0, 0.065, 0.17]);

  const marker = new THREE.Group();
  marker.name = 'Destino del recorrido';
  root.add(marker);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.green,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.34, 48), haloMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.047;
  marker.add(ring);
  const pointer = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.085),
    new THREE.MeshBasicMaterial({ color: CONFIG.colors.green }),
  );
  pointer.position.y = 0.58;
  marker.add(pointer);

  const technician = world.technician;
  const originalPosition = technician.position.clone();
  const originalQuaternion = technician.quaternion.clone();
  const technicianCollider = world.colliders.find(collider => collider.id === 'Técnico');
  const originalCollider = technicianCollider ? { ...technicianCollider } : null;
  const halfX = originalCollider ? (originalCollider.maxX - originalCollider.minX) / 2 : 0.32;
  const halfZ = originalCollider ? (originalCollider.maxZ - originalCollider.minZ) / 2 : 0.3;
  let elapsed = 0;
  let disposed = false;

  function placeTechnician(atStation) {
    if (atStation) {
      // Posición preparada del guion. El paso continúa libre a su derecha.
      technician.position.set(1.2, originalPosition.y, 2.9);
      technician.rotation.y = -Math.PI / 2;
    } else {
      technician.position.copy(originalPosition);
      technician.quaternion.copy(originalQuaternion);
    }
    if (!atStation && technicianCollider && originalCollider) {
      Object.assign(technicianCollider, originalCollider);
    } else if (technicianCollider) {
      technicianCollider.minX = technician.position.x - halfX;
      technicianCollider.maxX = technician.position.x + halfX;
      technicianCollider.minZ = technician.position.z - halfZ;
      technicianCollider.maxZ = technician.position.z + halfZ;
    }
  }

  function applyState(state = {}) {
    if (disposed) return;
    const active = state.mode === 'assisted';
    const level = active ? Math.max(0, Math.min(2, Number(state.designLevel) || 0)) : 0;
    model.visible = level >= 1;
    base.visible = level >= 1;
    back.visible = level >= 2;
    lip.visible = level >= 2;

    const step = state.stepId || 'idle';
    marker.visible = active && step !== 'idle' && step !== 'ready';
    if (step === 'reception') marker.position.set(-4.7, 0, 4.8);
    else marker.position.set(e1.x - 1.8, 0, e1.z + 1.15);

    const atStation = active && ['design-base', 'design-detail', 'preparation', 'ready'].includes(step);
    placeTechnician(atStation);
  }

  function update(dt) {
    if (disposed || !marker.visible) return;
    elapsed += Math.max(0, Math.min(Number(dt) || 0, 0.05));
    pointer.position.y = 0.58 + Math.sin(elapsed * 2.4) * 0.055;
    pointer.rotation.y = elapsed * 0.6;
    haloMaterial.opacity = 0.57 + Math.sin(elapsed * 2.4) * 0.12;
  }

  function dispose() {
    if (disposed) return;
    placeTechnician(false);
    // Restaurar exactamente el collider que pertenece al local.
    if (technicianCollider && originalCollider) Object.assign(technicianCollider, originalCollider);
    root.removeFromParent();
    const geometries = new Set();
    const materials = new Set();
    root.traverse(object => {
      if (!object.isMesh) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    disposed = true;
  }

  applyState();
  return { applyState, update, dispose };
}
