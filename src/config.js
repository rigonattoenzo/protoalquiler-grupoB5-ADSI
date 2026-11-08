// Unidades de escena aproximadas. No son medidas arquitectónicas del local real.
export const CONFIG = {
  room: { width: 14.6, depth: 13.2, height: 3.3, left: -8, right: 6.6, back: -6, front: 7.2 },
  graphics: { pixelRatio: 1.25, shadows: false },
  reception: { x: -4.65, z: 4.65, width: 5.4, depth: 1.1, staffZ: 3.5 },
  cabinet: { x: -1.3, z: -5.45, width: 2.1, depth: 1.05 },
  workstation: { width: 5.4, depth: 1.4, approachZ: 4.3, target: { x: 1.35, z: 3.75 }, center: { x: 3.5, z: 3.75 }, assistant: { x: 2.95, z: 3.75 } },
  navigation: {
    spawn: { x: -4.7, z: 6.6, yaw: 0 },
    eyeHeight: 1.65,
    radius: 0.28,
    speed: 2.8,
    acceleration: 14,
    gravity: 20,
  },
  overview: { position: [14, 17.5, 20.5], target: [-0.7, 0, 0.6] },
  stations: [
    { id: 'E1', x: 3.86, z: 2.1 },
    { id: 'E2', x: 3.86, z: -1.55 },
    { id: 'E3', x: 3.86, z: -5.2 },
  ],
  colors: {
    background: 0xeadfce,
    floor: 0xe7d2b4,
    wall: 0xf7eedf,
    ink: 0x453f3c,
    mint: 0x95b59c,
    green: 0x5c8066,
    blue: 0xbd8b73,
    peach: 0xe4b573,
    wood: 0xcfaa83,
  },
};
