import * as THREE from 'three';

/** Personaje hecho con primitivas. El grupo se apoya en el piso en y=0. */
export function createCharacter({ shirt = 0x397e69, technician = false, seated = false } = {}) {
  const group = new THREE.Group();
  const headParts = [];
  const skin = new THREE.MeshStandardMaterial({ color: 0xd9af8b, roughness: 0.85 });
  const fabric = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x293e46, roughness: 0.9 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x493b32, roughness: 1 });
  function part(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }
  part(new THREE.BoxGeometry(0.43, 0.6, 0.27), fabric, 0, 1.05, 0);
  headParts.push(part(new THREE.SphereGeometry(0.19, 16, 12), skin, 0, 1.58, 0));
  const hairCap = part(new THREE.SphereGeometry(0.195, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), hair, 0, 1.61, 0);
  hairCap.rotation.x = -0.12;
  headParts.push(hairCap);
  [-1, 1].forEach((side) => {
    if (seated) {
      part(new THREE.BoxGeometry(0.15, 0.16, 0.38), dark, side * 0.12, 0.55, -0.13);
      part(new THREE.BoxGeometry(0.15, 0.4, 0.16), dark, side * 0.12, 0.29, -0.29);
      part(new THREE.BoxGeometry(0.17, 0.1, 0.25), dark, side * 0.12, 0.08, -0.34);
    } else {
      part(new THREE.BoxGeometry(0.15, 0.58, 0.17), dark, side * 0.12, 0.43, 0);
      part(new THREE.BoxGeometry(0.17, 0.12, 0.27), dark, side * 0.12, 0.09, -0.04);
    }
    const arm = part(new THREE.CapsuleGeometry(0.065, 0.4, 4, 8), fabric, side * 0.3, seated ? 1.15 : 1.03, seated ? -0.4 : 0);
    if (seated) arm.rotation.x = 1.2;
    const hand = part(new THREE.SphereGeometry(0.07, 10, 8), skin, side * 0.3, seated ? 1.05 : 0.74, seated ? -0.72 : 0);
    hand.name = side < 0 ? 'Mano izquierda' : 'Mano derecha';
    headParts.push(part(new THREE.SphereGeometry(0.023, 8, 6), dark, side * 0.065, 1.59, -0.175));
  });
  if (technician) {
    part(new THREE.BoxGeometry(0.1, 0.07, 0.015), new THREE.MeshStandardMaterial({ color: 0xf8f4e8 }), -0.1, 1.17, -0.146);
    part(new THREE.BoxGeometry(0.28, 0.22, 0.035), dark, 0.28, 0.85, -0.12).rotation.z = -0.15;
  }
  group.name = technician ? 'Técnico' : 'Cliente';
  if (seated) {
    // El torso desciende hasta el asiento y los brazos se acercan al teclado.
    group.children.forEach(mesh => { if (mesh.position.y > 0.7) mesh.position.y -= 0.13; });
  }
  const head = new THREE.Group(); head.name = 'Cabeza';
  head.position.set(0, seated ? 1.45 : 1.58, 0); group.add(head);
  group.updateMatrixWorld(true); headParts.forEach(mesh => head.attach(mesh));
  return group;
}
