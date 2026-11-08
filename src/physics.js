// Colisiones del jugador en el plano XZ. No depende de Three.js.
const EPSILON = 1e-8;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function overlapsCircle(position, radius, box) {
  const dx = position.x - clamp(position.x, box.minX, box.maxX);
  const dz = position.z - clamp(position.z, box.minZ, box.maxZ);
  return dx * dx + dz * dz < radius * radius - EPSILON;
}

// Recupera una posición si quedó levemente dentro de un obstáculo.
function depenetrate(position, radius, colliders) {
  for (let pass = 0; pass < 8; pass += 1) {
    let changed = false;
    for (const box of colliders) {
      if (!overlapsCircle(position, radius, box)) continue;
      const closestX = clamp(position.x, box.minX, box.maxX);
      const closestZ = clamp(position.z, box.minZ, box.maxZ);
      const dx = position.x - closestX;
      const dz = position.z - closestZ;
      const distance = Math.hypot(dx, dz);

      if (distance > EPSILON) {
        const push = (radius - distance + EPSILON) / distance;
        position.x += dx * push;
        position.z += dz * push;
      } else {
        const exits = [
          { distance: position.x - box.minX + radius, axis: 'x', value: box.minX - radius },
          { distance: box.maxX - position.x + radius, axis: 'x', value: box.maxX + radius },
          { distance: position.z - box.minZ + radius, axis: 'z', value: box.minZ - radius },
          { distance: box.maxZ - position.z + radius, axis: 'z', value: box.maxZ + radius },
        ];
        exits.sort((a, b) => a.distance - b.distance);
        position[exits[0].axis] = exits[0].value;
      }
      changed = true;
    }
    if (!changed) break;
  }
}

function moveAxis(position, distance, axis, radius, colliders) {
  if (distance === 0) return;
  const otherAxis = axis === 'x' ? 'z' : 'x';
  const suffix = axis.toUpperCase();
  const otherSuffix = otherAxis.toUpperCase();
  let target = position[axis] + distance;

  for (const box of colliders) {
    const nearest = clamp(position[otherAxis], box[`min${otherSuffix}`], box[`max${otherSuffix}`]);
    const separation = Math.abs(position[otherAxis] - nearest);
    if (separation >= radius) continue;
    // La sección del círculo se reduce al pasar junto a una esquina.
    const clearance = Math.sqrt(radius * radius - separation * separation);
    const min = box[`min${suffix}`] - clearance;
    const max = box[`max${suffix}`] + clearance;
    if (distance > 0 && position[axis] <= min + EPSILON && target > min) {
      target = Math.min(target, min);
    } else if (distance < 0 && position[axis] >= max - EPSILON && target < max) {
      target = Math.max(target, max);
    }
  }
  position[axis] = target;
}

/** Desplaza un círculo, desliza sobre obstáculos y devuelve una posición nueva. */
export function moveCircle(position, displacement, radius, colliders) {
  if (!(radius > 0) || ![position.x, position.z, displacement.x, displacement.z].every(Number.isFinite)) {
    throw new TypeError('La posición, el desplazamiento y el radio deben ser válidos.');
  }
  const next = { x: position.x, z: position.z };
  depenetrate(next, radius, colliders);
  // Cada subpaso es menor al radio: tampoco se atraviesan paredes finas.
  const steps = Math.max(1, Math.ceil(Math.hypot(displacement.x, displacement.z) / (radius * 0.4)));
  const dx = displacement.x / steps;
  const dz = displacement.z / steps;
  for (let step = 0; step < steps; step += 1) {
    moveAxis(next, dx, 'x', radius, colliders);
    moveAxis(next, dz, 'z', radius, colliders);
  }
  return next;
}

/** Gravedad y apoyo sobre el suelo; el jugador no tiene salto. */
export function stepVertical(height, velocity, dt, gravity, floorHeight) {
  const nextVelocity = velocity - gravity * dt;
  const nextHeight = height + nextVelocity * dt;
  return nextHeight <= floorHeight
    ? { height: floorHeight, velocity: 0 }
    : { height: nextHeight, velocity: nextVelocity };
}
