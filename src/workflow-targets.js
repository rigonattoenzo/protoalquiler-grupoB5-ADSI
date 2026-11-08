import { CONFIG } from './config.js';
import { STEPS } from './workflow.js';

export function nearReception(position) {
  const desk = CONFIG.reception;
  return position.x >= desk.x - desk.width / 2 && position.x <= desk.x + desk.width / 2
    && position.z >= desk.z + desk.depth / 2 + 0.22 && position.z <= desk.z + 1.65;
}
export function atExit(position) {
  return position.x > -5.6 && position.x < -3.8 && position.z > CONFIG.room.front + 0.3;
}
export function getWorkflowTarget(state, position, { mode = 'walk', menuOpen = false, assistantReady = true } = {}) {
  const step = STEPS[state.stepIndex];
  const reception = !step || step.target === 'reception', exit = step?.target === 'exit';
  const point = exit ? { x: -4.7, z: CONFIG.room.front + 0.5 } : reception ? { x: CONFIG.reception.x, z: CONFIG.reception.z + 1.15 } : CONFIG.workstation.center;
  const e1 = CONFIG.stations[0];
  const accessPoints = [CONFIG.workstation.target, { x: 3.8, z: 3.8 }, { x: e1.x + 1.55, z: e1.z + 1.2 }];
  const nearby = exit ? false : reception ? nearReception(position) : accessPoints.some(access => Math.hypot(position.x - access.x, position.z - access.z) <= 1.15);
  const waiting = Boolean(step?.needsAssistant && !assistantReady);
  return {
    nearTarget: mode === 'walk' && !menuOpen && nearby && !waiting && !step?.automatic && !state.complete,
    targetLabel: exit ? 'Salida' : reception ? 'Recepción' : 'Estación E1', point, waiting,
  };
}
