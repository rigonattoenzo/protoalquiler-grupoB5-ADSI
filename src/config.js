// Unidades de escena aproximadas. No son medidas arquitectónicas del local real.
export const CONFIG = {
  room: { width: 16, depth: 12, height: 3.3 },
  navigation: {
    spawn: { x: -4.7, z: 5.05, yaw: 0 },
    eyeHeight: 1.65,
    radius: 0.28,
    speed: 2.8,
    acceleration: 14,
    gravity: 20,
  },
  overview: { position: [14.5, 17.5, 19.5], target: [0, 0, 0] },
  stations: [
    { id: 'E1', x: 4.6, z: 1.9 },
    { id: 'E2', x: 4.6, z: -1.2 },
    { id: 'E3', x: 4.6, z: -4.3 },
  ],
  colors: {
    background: 0xdce4df,
    floor: 0xe8e5dc,
    wall: 0xf4f1e9,
    ink: 0x233d45,
    mint: 0x89bba5,
    green: 0x397e69,
    blue: 0x719db3,
    peach: 0xdcb784,
  },
};
