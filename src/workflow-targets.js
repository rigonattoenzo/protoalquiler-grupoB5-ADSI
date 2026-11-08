// La cercanía habilita una acción; consultar el destino no avanza el guion.
export function getWorkflowTarget(state, position, { mode = 'walk', menuOpen = false } = {}) {
  const reception = state.stepId === 'reception' || state.stepId === 'idle';
  const targetLabel = reception ? 'Recepción' : 'Computadora de E1';
  const nearTarget = mode === 'walk' && !menuOpen && (reception
    ? position.x >= -7.5 && position.x <= -1.8 && position.z >= 4.25 && position.z <= 6
    : Math.hypot(position.x - 2.8, position.z - 3.05) <= 1.1);
  return { nearTarget, targetLabel };
}
