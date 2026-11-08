import { CONFIG } from './config.js';
import { STEPS } from './workflow.js';

export function nearReception(position) {
  const desk = CONFIG.reception;
  return position.x >= desk.x - desk.width / 2 && position.x <= desk.x + desk.width / 2
    && position.z >= desk.z + desk.depth / 2 + 0.22 && position.z <= desk.z + 1.65;
}
export function getWorkflowTarget(state, position, { mode = 'walk', menuOpen = false, assistantReady = true } = {}) {
  const step = STEPS[state.stepIndex];
  const reception = !step || step.target === 'reception';
  const point = reception ? { x: CONFIG.reception.x, z: CONFIG.reception.z + 1.15 } : CONFIG.workstation.target;
  const nearby = reception ? nearReception(position) : Math.hypot(position.x - point.x, position.z - point.z) <= 1.15;
  const waiting = Boolean(step?.needsAssistant && !assistantReady);
  return {
    nearTarget: mode === 'walk' && !menuOpen && nearby && !waiting && !step?.automatic && !state.complete,
    targetLabel: reception ? 'Recepción' : 'Estación E1', point, waiting,
  };
}
