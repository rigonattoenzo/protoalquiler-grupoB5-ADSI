// Guion determinista: los minutos facturados no dependen del paseo ni del render.
export const MODES = Object.freeze([
  { id: 'assisted', title: 'Diseño con asistencia', description: 'Diseñamos juntos y fabricamos tu pieza.', available: true },
  { id: 'autonomous', title: 'Diseño autónomo', description: 'Usás la estación y pedís revisión antes de imprimir.', available: false },
  { id: 'order', title: 'Pieza por encargo', description: 'Dejás referencias y volvés a retirar el trabajo.', available: false },
].map(Object.freeze));

export const DEMO = Object.freeze({
  piece: 'Soporte para celular', material: 'PLA', colorName: 'Verde salvia', color: 0x95b59c,
  grams: 25, baseGrams: 12, backGrams: 13, representedMinutes: 90,
  hourlyRate: 6000, pricePerGram: 100, printSeconds: 7, assemblySeconds: 2.5,
  note: 'Demostración: tarifas ficticias, 25 g incluidos auxiliares y 90 min representados. La animación está acelerada.',
});
export function getQuote() {
  const station = DEMO.hourlyRate * DEMO.representedMinutes / 60;
  const material = DEMO.pricePerGram * DEMO.grams;
  return Object.freeze({ station, material, total: station + material });
}
export const money = amount => '$ ' + Number(amount).toLocaleString('es-AR');

export const STEPS = Object.freeze([
  { id: 'reception', title: 'Una idea para empezar', speaker: 'receptionist', target: 'reception', action: 'Presentar la referencia', dialogue: 'Vamos a hacer un soporte para celular en dos piezas. Te asigno E1; el técnico te acompaña con el diseño.' },
  { id: 'station', title: 'Buscá la estación E1', speaker: 'receptionist', target: 'station', action: 'Usar la computadora', dialogue: 'Rodeá el mostrador por la derecha. E1 es el primer puesto; seguí la marca verde.' },
  { id: 'call-assistant', title: 'Pedí asistencia', speaker: 'client', target: 'station', action: 'Llamar al técnico', dialogue: 'Ya estoy en E1. ¿Me ayudás a diseñar el soporte?' },
  { id: 'design-base', title: 'Diseñá la base', speaker: 'technician', target: 'station', action: 'Crear la base en pantalla', dialogue: 'Primero una base amplia. Mirá la computadora: vamos a dejar una ranura para encastrar el respaldo.', needsAssistant: true },
  { id: 'review-base', title: 'Revisión de la primera pieza', speaker: 'technician', target: 'station', action: 'Revisar la base', dialogue: 'La base está preparada: 12 g de PLA. Revisamos orientación y apoyos antes de cargar el material.', needsAssistant: true },
  { id: 'confirm', title: 'Confirmá el ejemplo', speaker: 'technician', target: 'station', action: 'Confirmar presupuesto ilustrativo', dialogue: 'Las dos piezas suman 25 g. El ejemplo completo usa 90 minutos de estación. ¿Confirmamos el presupuesto?', needsAssistant: true },
  { id: 'material', title: 'Material bajo control técnico', speaker: 'technician', target: 'station', action: 'Solicitar carga e imprimir base', dialogue: 'Confirmado. Yo suministro y cargo el PLA verde. Ahora habilito la impresión de la base.', needsAssistant: true },
  { id: 'printing-base', title: 'Imprimiendo la base', speaker: 'technician', target: 'station', action: '', dialogue: 'El cabezal recorre la cama mientras se forma la base, capa por capa. El tiempo está acelerado.', automatic: true },
  { id: 'base-ready', title: 'Base terminada', speaker: 'technician', target: 'station', action: 'Llevar la base a la mesa', dialogue: 'La base está lista. La dejamos en la mesa y volvemos a la computadora para diseñar el respaldo.' },
  { id: 'design-detail', title: 'Diseñá el respaldo', speaker: 'technician', target: 'station', action: 'Crear el respaldo en pantalla', dialogue: 'Ahora el respaldo inclinado y su encastre. En la pantalla podés ver cómo encaja con la base.', needsAssistant: true },
  { id: 'review-detail', title: 'Revisá e imprimí el respaldo', speaker: 'technician', target: 'station', action: 'Validar e imprimir respaldo', dialogue: 'Revisé la segunda pieza: 13 g del mismo PLA. Está contemplada en el presupuesto; no cobramos el material dos veces.', needsAssistant: true },
  { id: 'printing-detail', title: 'Imprimiendo el respaldo', speaker: 'technician', target: 'station', action: '', dialogue: 'Imprimimos la segunda pieza. La base ya está esperando en la mesa.', automatic: true },
  { id: 'detail-ready', title: 'Respaldo terminado', speaker: 'technician', target: 'station', action: 'Llevar a la mesa y ensamblar', dialogue: 'Las dos partes están listas. Unimos el respaldo con la ranura de la base.' },
  { id: 'assembly', title: 'Ensamblando el soporte', speaker: 'technician', target: 'station', action: '', dialogue: 'Encastramos las dos piezas. Este es el resultado del diseño y la fabricación.', automatic: true },
  { id: 'result', title: 'Tu pieza terminada', speaker: 'technician', target: 'station', action: 'Ir al cierre en recepción', dialogue: '¡Listo! El soporte está ensamblado sobre la mesa. Podés mirarlo y después cerrar la sesión en recepción.' },
  { id: 'checkout', title: 'Volvé a recepción', speaker: 'receptionist', target: 'reception', action: 'Cerrar sesión de ejemplo', dialogue: 'La sesión incluye computadora, impresora y asistencia básica. Cerramos el ejemplo con el uso de estación y los gramos del trabajo.' },
  { id: 'complete', title: 'Recorrido completado', speaker: 'receptionist', target: 'reception', action: '', dialogue: '¡Gracias por venir! Te llevás el soporte terminado. Podés reiniciar la toma cuando quieras.' },
].map(Object.freeze));

const indexOf = id => STEPS.findIndex(step => step.id === id);
function stateAt(stepIndex, progress = 0) {
  const at = id => stepIndex >= indexOf(id);
  const active = stepIndex >= 0;
  return Object.freeze({
    mode: active ? 'assisted' : null, stepIndex,
    stepId: active ? STEPS[stepIndex].id : 'idle', station: 'E1', progress,
    designLevel: at('review-detail') ? 2 : at('review-base') ? 1 : 0,
    prepared: at('confirm'), confirmed: at('material'), materialLoaded: at('printing-base'),
    assistantCalled: active && at('design-base') && !at('checkout'),
    basePrinted: at('base-ready'), baseOnTable: at('design-detail'),
    backPrinted: at('detail-ready'), backOnTable: at('assembly'),
    assembled: at('result'), complete: at('complete'),
  });
}
export function createWorkflow() {
  let state = stateAt(-1);
  const listeners = new Set();
  const notify = next => { state = next; for (const listener of [...listeners]) listener(state); };
  return {
    getState: () => state,
    start(mode) { if (mode !== 'assisted') return false; notify(stateAt(0)); return true; },
    advance() {
      if (!state.mode || state.complete || STEPS[state.stepIndex].automatic) return false;
      notify(stateAt(state.stepIndex + 1)); return true;
    },
    tick(dt) {
      if (!state.mode || !STEPS[state.stepIndex].automatic || !Number.isFinite(dt) || dt <= 0) return false;
      const seconds = state.stepId === 'assembly' ? DEMO.assemblySeconds : DEMO.printSeconds;
      const progress = Math.min(1, state.progress + Math.min(dt, 0.1) / seconds);
      if (progress >= 1 - 1e-9) notify(stateAt(state.stepIndex + 1));
      else state = stateAt(state.stepIndex, progress);
      return true;
    },
    reset() { if (!state.mode) return false; notify(stateAt(-1)); return true; },
    subscribe(listener) { if (typeof listener !== 'function') throw new TypeError('Se espera una función'); listeners.add(listener); return () => listeners.delete(listener); },
  };
}
