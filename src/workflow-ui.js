// Interfaz del guion. El estado y la proximidad los decide el coordinador de escena.
import { DEMO, MODES, STEPS } from './workflow.js';

const STEP_IDS = STEPS.map(step => step.id);
const CONTENT = {
  reception: {
    title: 'De una idea a una pieza.',
    description: 'En recepción elegiste trabajar con asistencia. Vamos a preparar una pieza a partir de una referencia precargada.',
    action: 'Aceptar referencia y comenzar',
    detail: '<div class="flow-reference"><span class="reference-icon" aria-hidden="true">↗</span><div><strong>Referencia · <span data-demo="piece"></span></strong><span>El técnico te orienta durante el diseño.</span></div></div>',
  },
  station: {
    title: 'Tu lugar es la estación E1.',
    description: 'Rodeá el mostrador por la derecha y acercate a la computadora de E1. Tenés una superficie de trabajo y una impresora al lado.',
    action: 'Comenzar en la estación E1',
    detail: '<p class="flow-technician"><strong>El técnico te acompaña</strong>Primero armamos la base. Después sumamos el apoyo para el celular.</p>',
  },
  'design-base': {
    title: 'Primero, una base estable.',
    description: 'Usá la computadora de E1 para crear la primera parte del soporte con una acción preparada.',
    action: 'Crear la base del soporte',
    detail: '<div class="flow-demo-tag">Diseño guiado · 1 de 2</div><p class="flow-technician"><strong>Orientación del técnico</strong>Una base amplia ayuda a que el soporte se mantenga estable.</p><p class="flow-simulation-note">Es una representación guionada del diseño, sin un editor CAD real.</p>',
  },
  'design-detail': {
    title: 'Sumemos el apoyo.',
    description: 'La base está lista. Agregá el respaldo y el borde que sostienen el celular para completar el modelo del ejemplo.',
    action: 'Completar el soporte',
    detail: '<div class="flow-demo-tag">Diseño guiado · 2 de 2</div><p class="flow-technician"><strong>Orientación del técnico</strong>Ahora incorporamos el apoyo inclinado y el pequeño tope frontal.</p><p class="flow-simulation-note">La computadora representa el modelado mediante acciones preparadas.</p>',
  },
  preparation: {
    title: 'Preparemos la pieza.',
    description: 'El modelo está armado. Revisá los datos de ejemplo y preparalo para la siguiente etapa del servicio.',
    action: 'Preparar para imprimir',
    detail: '<dl class="flow-estimate"><div><dt>Material</dt><dd><span class="material-dot" aria-hidden="true"></span><span data-demo="materialColor"></span></dd></div><div><dt>Consumo del trabajo</dt><dd data-demo="grams"></dd></div><div><dt>Uso representado</dt><dd data-demo="representedMinutes"></dd></div></dl><p class="flow-simulation-note" data-demo="note"></p><p class="flow-simulation-note">La preparación se representa con datos precargados, sin un laminador real.</p>',
  },
  ready: {
    title: 'Preparación lista.',
    description: 'Completaste el diseño asistido y preparaste la pieza del ejemplo en E1. Podés repetir el recorrido o seguir explorando.',
    action: 'Preparación lista',
    detail: '<dl class="flow-estimate"><div><dt>Pieza</dt><dd data-demo="piece"></dd></div><div><dt>Material y consumo</dt><dd><span class="material-dot" aria-hidden="true"></span><span data-demo="materialGrams"></span></dd></div><div><dt>Uso representado</dt><dd data-demo="representedMinutes"></dd></div></dl><p class="flow-simulation-note" data-demo="note"></p><p class="flow-next-hito"><strong>El servicio continúa en el próximo hito</strong>Revisión técnica, presupuesto, suministro de filamento e impresión. La pieza todavía no se imprimió.</p>',
  },
};

/** Mantiene los botones en el DOM para conservar el foco durante cada actualización. */
export function createWorkflowUI({ onSelectMode = () => {}, onExplore = () => {}, onAction = () => {}, onRestart = () => {}, onDismiss = () => {} } = {}) {
  const element = id => document.getElementById(id);
  const menu = element('service-menu');
  const guide = element('flow-guide');
  const action = element('flow-action');
  const progressItems = [...element('flow-progress').children];
  const modeButtons = [...menu.querySelectorAll('[data-mode]')];
  const demoText = {
    piece: DEMO.piece,
    materialColor: `${DEMO.material} · ${DEMO.colorName.toLocaleLowerCase('es-AR')}`,
    materialGrams: `${DEMO.material} ${DEMO.colorName.toLocaleLowerCase('es-AR')} · ${DEMO.grams} g`,
    grams: `${DEMO.grams} g`,
    representedMinutes: `${DEMO.representedMinutes} min`,
    note: DEMO.note,
  };
  let previousStep = null;
  let previousNear = null;
  let previousTarget = null;
  let returnFocus = null;
  let menuOpen = false;

  modeButtons.forEach(button => {
    const mode = MODES.find(item => item.id === button.dataset.mode);
    if (mode) {
      button.disabled = !mode.available;
      button.querySelector('.service-card-title').textContent = mode.title;
    }
    button.addEventListener('click', () => {
      if (!button.disabled) onSelectMode(button.dataset.mode);
    });
  });
  element('menu-explore').addEventListener('click', onExplore);
  action.addEventListener('click', () => { if (!action.disabled) onAction(); });
  element('flow-restart').addEventListener('click', onRestart);
  element('flow-dismiss').addEventListener('click', onDismiss);

  // Solo se intercepta Tab dentro del menú; la navegación y Escape pertenecen a main.
  menu.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('button:not(:disabled), [href], [tabindex="0"]')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
      event.preventDefault();
      first?.focus();
    }
  });

  function setMenuOpen(open) {
    const next = Boolean(open);
    if (menuOpen === next) return;
    menuOpen = next;
    menu.hidden = !next;
    document.body.classList.toggle('service-menu-open', next);
    element('service-button').setAttribute('aria-expanded', String(next));
    if (next) {
      returnFocus = document.activeElement;
      element('interaction-hint').hidden = true;
      modeButtons.find(button => !button.disabled)?.focus({ preventScroll: true });
    } else {
      const focus = returnFocus instanceof HTMLElement && returnFocus.isConnected && returnFocus !== document.body
        ? returnFocus : element('service-button');
      focus.focus({ preventScroll: true });
    }
  }

  function render(state, { nearTarget = false, targetLabel = '' } = {}) {
    const id = state?.stepId;
    const active = state?.mode === 'assisted' && STEP_IDS.includes(id);
    guide.hidden = !active;
    document.body.classList.toggle('workflow-active', active);
    if (!active) {
      previousStep = null;
      previousNear = null;
      previousTarget = null;
      return;
    }
    const content = CONTENT[id];
    const index = STEP_IDS.indexOf(id);
    const ready = id === 'ready';
    const near = Boolean(nearTarget);
    if (previousStep !== id) {
      element('flow-step-label').textContent = `Asistencia · paso ${index + 1} de ${STEP_IDS.length}`;
      element('flow-title').textContent = content.title;
      element('flow-description').textContent = content.description;
      // HTML constante de este módulo; nunca se interpola contenido externo.
      element('flow-detail').innerHTML = content.detail;
      element('flow-detail').querySelectorAll('[data-demo]').forEach(node => {
        node.textContent = demoText[node.dataset.demo] ?? '';
      });
      element('flow-detail').querySelectorAll('.material-dot').forEach(dot => {
        dot.style.backgroundColor = `#${DEMO.color.toString(16).padStart(6, '0')}`;
      });
      progressItems.forEach((item, itemIndex) => {
        item.classList.toggle('is-current', itemIndex === index);
        item.classList.toggle('is-done', itemIndex < index);
        if (itemIndex === index) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      guide.classList.toggle('flow-ready', ready);
    }
    if (previousStep !== id || previousNear !== near || previousTarget !== targetLabel) {
      action.disabled = ready || !near;
      action.textContent = content.action;
      element('flow-location').textContent = ready ? 'Diseño y preparación de demostración terminados.'
        : near ? 'Estás en el lugar indicado. Presioná E o usá el botón.'
          : `Acercate a ${targetLabel || (id === 'reception' ? 'recepción' : 'la computadora de E1')} para continuar.`;
      element('flow-location').classList.toggle('is-near', near && !ready);
    }
    previousStep = id;
    previousNear = near;
    previousTarget = targetLabel;
  }

  function setHint(text) {
    const hint = element('interaction-hint');
    const message = text == null ? '' : String(text);
    if (hint.textContent !== message) hint.textContent = message;
    hint.hidden = !message || menuOpen;
  }

  return { setMenuOpen, render, setHint };
}
