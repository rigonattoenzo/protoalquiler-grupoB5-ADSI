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
  { id: 'station', title: 'Buscá la estación E1', speaker: 'receptionist', target: 'station', action: 'Abrir el proyecto y llamar al técnico', dialogue: 'Te asigno E1. Allí podés contarle tu idea al técnico y empezar el diseño. Al terminar, volvés conmigo para el cobro.' },
  { id: 'design-base', title: 'Diseñá la base', speaker: 'technician', target: 'station', action: 'Crear la base en pantalla', dialogue: 'Primero una base amplia. Mirá la computadora: vamos a dejar una ranura para encastrar el respaldo.', needsAssistant: true },
  { id: 'confirm', title: 'Revisión y presupuesto', speaker: 'technician', target: 'station', action: 'Confirmar presupuesto', dialogue: 'Revisé la base y su orientación. Las dos piezas van a usar 25 g de PLA y unos 90 minutos de estación. ¿Confirmamos el presupuesto?', needsAssistant: true },
  { id: 'material', title: 'El técnico prepara el filamento', speaker: 'technician', target: 'station', action: '', dialogue: 'Voy a buscar el PLA verde al armario y lo cargo en la impresora.', automatic: true, sceneDriven: true },
  { id: 'printing-base', title: 'Imprimiendo la base', speaker: 'technician', target: 'station', action: '', dialogue: 'El material ya está cargado. La base se está formando capa por capa.', automatic: true },
  { id: 'base-ready', title: 'Base terminada', speaker: 'technician', target: 'station', action: 'Llevar la base a la mesa', dialogue: 'La base está lista. La dejamos en la mesa y volvemos a la computadora para diseñar el respaldo.' },
  { id: 'design-detail', title: 'Diseñá el respaldo', speaker: 'technician', target: 'station', action: 'Crear el respaldo en pantalla', dialogue: 'Ahora el respaldo inclinado y su encastre. En la pantalla podés ver cómo encaja con la base.', needsAssistant: true },
  { id: 'review-detail', title: 'Revisá e imprimí el respaldo', speaker: 'technician', target: 'station', action: 'Validar e imprimir respaldo', dialogue: 'El respaldo usa 13 g del mismo PLA. Revisé la orientación y el encastre con la base; ya podemos imprimirlo.', needsAssistant: true },
  { id: 'printing-detail', title: 'Imprimiendo el respaldo', speaker: 'technician', target: 'station', action: '', dialogue: 'Imprimimos la segunda pieza. La base ya está esperando en la mesa.', automatic: true },
  { id: 'detail-ready', title: 'Respaldo terminado', speaker: 'technician', target: 'station', action: 'Llevar a la mesa y ensamblar', dialogue: 'Las dos partes están listas. Unimos el respaldo con la ranura de la base.' },
  { id: 'assembly', title: 'Ensamblando el soporte', speaker: 'technician', target: 'station', action: '', dialogue: 'Encastramos las dos piezas. Este es el resultado del diseño y la fabricación.', automatic: true },
  { id: 'result', title: 'Tu pieza terminada', speaker: 'technician', target: 'station', action: 'Retirar la bolsa con tu soporte', dialogue: '¡Listo! El soporte está ensamblado. Te lo dejo en una bolsa para que lo lleves; después pasá por recepción.' },
  { id: 'checkout', title: 'Volvé a recepción', speaker: 'receptionist', target: 'reception', action: 'Abonar y retirar el comprobante', dialogue: 'Son ' + DEMO.representedMinutes + ' minutos de estación y ' + DEMO.grams + ' g de PLA. El total es ' + money(getQuote().total) + '. Podemos cerrar tu sesión.' },
  { id: 'exit', title: 'Salí por el acceso principal', speaker: 'receptionist', target: 'exit', action: '', dialogue: '¡Gracias por venir! Que disfrutes tu soporte. Nos vemos la próxima.' },
  { id: 'complete', title: 'Hasta la próxima', speaker: 'receptionist', target: 'exit', action: '', dialogue: '' },
].map(Object.freeze));

const indexOf = id => STEPS.findIndex(step => step.id === id);
function stateAt(stepIndex, progress = 0) {
  const at = id => stepIndex >= indexOf(id);
  const active = stepIndex >= 0;
  return Object.freeze({
    mode: active ? 'assisted' : null, stepIndex,
    stepId: active ? STEPS[stepIndex].id : 'idle', station: 'E1', progress,
    designLevel: at('review-detail') ? 2 : at('confirm') ? 1 : 0,
    prepared: at('confirm'), confirmed: at('material'), materialLoaded: at('printing-base'),
    assistantCalled: active && at('design-base') && !at('checkout'),
    basePrinted: at('base-ready'), baseOnTable: at('design-detail'),
    backPrinted: at('detail-ready'), backOnTable: at('assembly'),
    assembled: at('result'), hasBag: at('checkout'), complete: at('complete'),
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
      if (!state.mode || state.complete || !STEPS[state.stepIndex].action || STEPS[state.stepIndex].automatic) return false;
      notify(stateAt(state.stepIndex + 1)); return true;
    },
    tick(dt) {
      if (!state.mode || !STEPS[state.stepIndex].automatic || STEPS[state.stepIndex].sceneDriven || !Number.isFinite(dt) || dt <= 0) return false;
      const seconds = state.stepId === 'assembly' ? DEMO.assemblySeconds : DEMO.printSeconds;
      const progress = Math.min(1, state.progress + Math.min(dt, 0.1) / seconds);
      if (progress >= 1 - 1e-9) notify(stateAt(state.stepIndex + 1));
      else state = stateAt(state.stepIndex, progress);
      return true;
    },
    completeMaterial() { if (state.stepId !== 'material' || !state.confirmed) return false; notify(stateAt(indexOf('printing-base'))); return true; },
    finish() { if (state.stepId !== 'exit') return false; notify(stateAt(indexOf('complete'))); return true; },
    reset() { if (!state.mode) return false; notify(stateAt(-1)); return true; },
    subscribe(listener) { if (typeof listener !== 'function') throw new TypeError('Se espera una función'); listeners.add(listener); return () => listeners.delete(listener); },
  };
}
