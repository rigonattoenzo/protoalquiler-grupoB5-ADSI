import { CONFIG } from './config.js';
import { getStep } from './workflow.js';

export function nearReception(position) {
  const desk = CONFIG.reception;
  return position.x >= desk.x - desk.width / 2 && position.x <= desk.x + desk.width / 2
    && position.z >= desk.z + desk.depth / 2 + 0.22 && position.z <= desk.z + 1.65;
}
export function atExit(position) {
  return position.x > -5.6 && position.x < -3.8 && position.z > CONFIG.room.front + 0.3;
}
export function getWorkflowTarget(state, position, { mode = 'walk', menuOpen = false, assistantReady = true, technicianPosition, orderMeetingPoint } = {}) {
  const step = getStep(state);
  const reception = !step || step.target === 'reception', exit = step?.target === 'exit';
  const technician = step?.target === 'technician';
  const point = technician ? orderMeetingPoint || technicianPosition || { x: -1.1, z: 3.8 } : exit ? { x: -4.7, z: CONFIG.room.front + 0.5 } : reception ? { x: CONFIG.reception.x, z: CONFIG.reception.z + 1.15 } : CONFIG.workstation.center;
  const e1 = CONFIG.stations[0];
  const accessPoints = [CONFIG.workstation.target, { x: 3.8, z: 3.8 }, { x: e1.x + 1.55, z: e1.z + 1.2 }];
  const nearby = technician ? Math.hypot(position.x - point.x, position.z - point.z) <= 1.65 : exit || state.orderAway ? false : reception ? nearReception(position) : accessPoints.some(access => Math.hypot(position.x - access.x, position.z - access.z) <= 1.15);
  const waiting = Boolean(step?.needsAssistant && !assistantReady);
  return {
    nearTarget: mode === 'walk' && !menuOpen && nearby && !waiting && !step?.automatic && !state.complete,
    targetLabel: technician ? 'Técnico' : exit ? 'Salida' : reception ? 'Recepción' : 'Estación E1', point, waiting,
  };
}
