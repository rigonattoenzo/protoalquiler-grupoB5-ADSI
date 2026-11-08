// Guion de demostración independiente del movimiento, la escena y la interfaz.
// Las otras modalidades se muestran en recepción, pero todavía no se ejecutan.
export const MODES = Object.freeze([
  Object.freeze({
    id: 'assisted',
    title: 'Necesito ayuda para diseñar e imprimir',
    description: 'Diseñá una pieza en E1 con orientación del técnico, paso a paso.',
    available: true,
  }),
  Object.freeze({
    id: 'autonomous',
    title: 'Quiero diseñar e imprimir por mi cuenta',
    description: 'Preparación autónoma con revisión técnica y suministro de material. Próximo hito.',
    available: false,
  }),
  Object.freeze({
    id: 'order',
    title: 'Quiero encargar una pieza y retirarla después',
    description: 'El equipo modela e imprime a partir de tus referencias. Próximo hito.',
    available: false,
  }),
]);

export const DEMO = Object.freeze({
  piece: 'Soporte para celular',
  material: 'PLA',
  colorName: 'Verde',
  color: 0x89bba5,
  grams: 25,
  representedMinutes: 90,
  note: 'Datos ilustrativos y estimaciones simuladas. Los 25 g corresponden al trabajo completo, incluido el material auxiliar. Los 90 minutos representan uso de estación, no tiempo real de esta demostración.',
});

export const STEPS = Object.freeze([
  {
    id: 'reception',
    title: 'Contanos tu idea',
    description: 'Vamos a preparar un soporte para celular a partir de una referencia precargada. El técnico te va a orientar durante el diseño.',
    action: 'Presentar referencia',
    target: 'reception',
    label: 'Recepción',
  },
  {
    id: 'station',
    title: 'Conocé tu estación',
    description: 'Te asignamos E1. Rodeá el mostrador por la derecha: allí tenés computadora, espacio de trabajo e impresora. Acercate a la computadora para comenzar.',
    action: 'Abrir computadora',
    target: 'station',
    label: 'Estación E1',
  },
  {
    id: 'design-base',
    title: 'Empezá por la base',
    description: 'Técnico: primero armamos una base estable para que el soporte no se vuelque. Esta acción representa un paso de modelado preparado.',
    action: 'Crear la base',
    target: 'station',
    label: 'Estación E1',
  },
  {
    id: 'design-detail',
    title: 'Sumá el apoyo',
    description: 'Técnico: agregá el respaldo inclinado y el borde que sostiene el celular. La pieza de ejemplo toma su forma final.',
    action: 'Agregar el apoyo',
    target: 'station',
    label: 'Estación E1',
  },
  {
    id: 'preparation',
    title: 'Prepará la impresión',
    description: 'Revisá el material PLA verde y las estimaciones del caso. El laminado se representa con datos precargados: todavía no se habilita la impresora.',
    action: 'Preparar el trabajo',
    target: 'station',
    label: 'Estación E1',
  },
  {
    id: 'ready',
    title: 'Trabajo preparado',
    description: 'Completaste esta primera parte. La revisión técnica, el presupuesto, la confirmación del material y la impresión se incorporan en el siguiente hito.',
    action: '',
    target: 'station',
    label: 'Estación E1',
  },
].map(Object.freeze));

function stateAt(stepIndex) {
  const active = stepIndex >= 0;
  return Object.freeze({
    mode: active ? 'assisted' : null,
    stepId: active ? STEPS[stepIndex].id : 'idle',
    stepIndex,
    station: 'E1',
    designLevel: stepIndex >= 4 ? 2 : stepIndex >= 3 ? 1 : 0,
    prepared: stepIndex === STEPS.length - 1,
    complete: stepIndex === STEPS.length - 1,
  });
}

export function createWorkflow() {
  let state = stateAt(-1);
  const listeners = new Set();
  function setState(next) {
    state = next;
    for (const listener of [...listeners]) listener(state);
  }

  return {
    getState: () => state,
    start(mode) {
      if (!MODES.some(item => item.id === mode && item.available)) return false;
      setState(stateAt(0));
      return true;
    },
    advance() {
      if (state.stepIndex < 0 || state.complete) return false;
      setState(stateAt(state.stepIndex + 1));
      return true;
    },
    reset() {
      if (state.stepIndex < 0) return false;
      setState(stateAt(-1));
      return true;
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('El suscriptor del recorrido debe ser una función.');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
