import test from 'node:test';
import assert from 'node:assert/strict';
import { worldFixture, THREE } from './helpers.mjs';
import { CONFIG } from '../src/config.js';
import { moveCircle, overlapsCircle } from '../src/physics.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, a + ' != ' + b);

test('entrada única, recepción accesible y espacio justo para el personal', async () => {
  const { world } = await worldFixture(), { reception, room, navigation } = CONFIG;
  assert.ok(world.colliders.every(box => !overlapsCircle(navigation.spawn, navigation.radius, box)));
  const desk = world.colliders.find(box => box.id === 'Mostrador recepción');
  const wall = world.colliders.find(box => box.id === 'Pared izquierda');
  near(desk.minX, wall.maxX);
  assert.ok(reception.width > 3.925 && reception.width < 4.4, 'Apenas más largo que un baño');
  const storage = world.colliders.find(box => box.id === 'DEPÓSITO');
  const clearance = desk.minZ - storage.maxZ;
  assert.ok(clearance >= 1.1 && clearance <= 1.3);
  assert.ok(reception.staffZ - 0.3 > storage.maxZ && reception.staffZ + 0.3 < desk.minZ);
  for (const x of [-7, -4.7, -2.7, 0, 6]) {
    const end = moveCircle({ x, z: room.front - 0.5 }, { x: 0, z: 2 }, navigation.radius, world.colliders);
    assert.equal(end.z > room.front + 0.3, x === -4.7);
  }
});
test('habitaciones continuas hasta el techo, sin huecos entre ellas', async () => {
  const { scene } = await worldFixture();
  const rooms = ['BAÑO MUJERES', 'BAÑO HOMBRES', 'DEPÓSITO'].map(name => new THREE.Box3().setFromObject(scene.getObjectByName(name)));
  const ceiling = new THREE.Box3().setFromObject(scene.getObjectByName('Techo'));
  rooms.forEach(room => { near(room.min.y, 0); near(room.max.y, ceiling.min.y); near(room.min.x, CONFIG.room.left); });
  near(rooms[0].max.z, rooms[1].min.z); near(rooms[1].max.z, rooms[2].min.z);
});
test('puestos junto a la pared, separación ampliada y armario junto al fondo', async () => {
  const { scene, world } = await worldFixture();
  const wall = world.colliders.find(box => box.id === 'Pared derecha');
  CONFIG.stations.forEach(({ id }) => {
    const table = world.colliders.find(box => box.id === 'Mesa ' + id);
    near(table.maxX, wall.minX);
    assert.ok(scene.getObjectByName('Monitor ' + id));
    assert.ok(scene.getObjectByName('Silla ' + id).children.length >= 15);
  });
  assert.ok(CONFIG.stations[0].z - CONFIG.stations[1].z >= 3.5);
  const cabinet = world.colliders.find(box => box.id === 'Armario de filamentos');
  near(cabinet.minZ, CONFIG.room.back + 0.025);
  assert.ok(cabinet.minX - (-4.075) > 1.5, 'Deja libre la puerta del baño del fondo');
});
test('recepción equipada, hoja única de tarifas y sillas libres centradas', async () => {
  const { world, scene } = await worldFixture();
  assert.notEqual(world.receptionist, world.technician);
  assert.ok(scene.getObjectByName('Cliente trabajando'));
  assert.equal(scene.children.filter(object => object.name.startsWith('Muestra vidriera')).length, 6);
  assert.equal(world.rateSheet.name, 'Hoja de tarifas');
  assert.equal(scene.getObjectByName('Ficha modalidad 1'), undefined);
  assert.ok(scene.getObjectByName('Silla Recepción')); assert.ok(scene.getObjectByName('Pantalla recepción'));
  assert.ok(scene.getObjectByName('Lapicera recepción'));
  assert.deepEqual([...world.seats.keys()], ['E1', 'E3']);
  for (const [id, seat] of world.seats) {
    const station = CONFIG.stations.find(item => item.id === id);
    assert.ok(seat.position.x > station.x - 1 && seat.position.x < station.x + 1);
  }
  assert.equal(scene.children.filter(item => item.name === 'Junta vertical de habitaciones').length, 2);
});
test('la agrupación gráfica conserva pantallas y cabezales animables y paredes de corte independientes', async () => {
  const { world, scene } = await worldFixture();
  const batches = scene.children.filter(item => item.isInstancedMesh);
  assert.ok(batches.reduce((sum, item) => sum + item.count, 0) > 100);
  for (const [id, printer] of world.printers) {
    for (const item of [printer.head, world.screens.get(id)]) {
      for (let ancestor = item; ancestor && ancestor !== scene; ancestor = ancestor.parent) assert.equal(ancestor.visible, true, item.name + ' no debe quedar congelado en un grupo estático');
    }
  }
  world.setOverview(true); assert.equal(scene.getObjectByName('Pared derecha').visible, false);
  world.setOverview(false); assert.equal(scene.getObjectByName('Pared derecha').visible, true);
});
test('tarifario visible en el espacio entre E2 y E3, fuera del ancho de ambas impresoras', async () => {
  const { scene, world } = await worldFixture();
  const board = new THREE.Box3().setFromObject(scene.getObjectByName('Tarifario'));
  const e2 = world.printers.get('E2'), e3 = world.printers.get('E3');
  assert.ok(board.min.z > e3.z + 0.475);
  assert.ok(board.max.z < e2.z - 0.475);
  assert.ok(board.min.y > 1.26 && board.max.y < CONFIG.room.height);
});
test('el pasillo llega a los tres puestos y la vista general conserva límites', async () => {
  const { world, scene } = await worldFixture();
  let position = { ...CONFIG.navigation.spawn };
  const goals = [{ x: -0.6, z: position.z }, { x: -0.6, z: 4.3 }, { x: 0.35, z: 4.3 }, { ...CONFIG.workstation.target }, { x: 0.35, z: 4.3 }, { x: 0.35, z: 0.1 }, { x: 1.35, z: 0.1 }, { x: 0.35, z: 0.1 }, { x: 0.35, z: -3.55 }, { x: 1.35, z: -3.55 }];
  for (const goal of goals) {
    position = moveCircle(position, { x: goal.x - position.x, z: goal.z - position.z }, CONFIG.navigation.radius, world.colliders);
    near(position.x, goal.x); near(position.z, goal.z);
  }
  const before = structuredClone(world.colliders); world.setOverview(true);
  assert.equal(scene.getObjectByName('Techo').visible, false); assert.equal(world.player.visible, true);
  assert.deepEqual(world.colliders, before); world.setOverview(false);
});
