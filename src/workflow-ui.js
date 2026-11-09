import * as THREE from 'three';
import { DEMO, getStep, getQuote, getOrderQuote, money } from './workflow.js';

export function createWorkflowUI({ world, camera, onSelectMode, onAction }) {
  const $ = id => document.getElementById(id), bubble = $('dialogue');
  const point = new THREE.Vector3(), direction = new THREE.Vector3(), offset = new THREE.Vector3();
  const names = { receptionist: 'Recepción', technician: 'Asistente técnico', client: 'Vos', computer: 'Computadora · E1', printer: 'Impresora · E1' };
  let menuOpen = false, flash = null, key = '', speaker = 'receptionist', bubbleHeight = 190, projectionTime = 0, utterance = '', introduce = false, speechAnimation;
  function animateSpeech() {
    if (!introduce) return;
    introduce = false; speechAnimation?.cancel();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const frames = reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
      { opacity: 0, transform: 'translate(-50%, calc(-100% + 18px)) scale(0.84)' },
      { opacity: 1, transform: 'translate(-50%, -100%) scale(1)' },
    ];
    speechAnimation = bubble.animate?.(frames, { duration: 220, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both' });
  }
  [...$('service-menu').querySelectorAll('[data-mode]')].forEach(button => button.addEventListener('click', () => onSelectMode(button.dataset.mode)));
  $('flow-action').addEventListener('click', onAction);
  const quote = getQuote();
  // Solo constantes del guion; los diálogos se escriben con textContent.
  $('quote-detail').innerHTML = '<div><span>Estación / ' + DEMO.representedMinutes + ' min</span><b>' + money(quote.station) + '</b></div><div><span>PLA / ' + DEMO.grams + ' g</span><b>' + money(quote.material) + '</b></div><div class="total"><span>Total</span><b>' + money(quote.total) + '</b></div>';
  return {
    reset() { flash = null; key = ''; utterance = ''; speechAnimation?.cancel(); menuOpen = false; $('service-menu').hidden = true; },
    setMenuOpen(value) { menuOpen = Boolean(value); key = ''; $('service-menu').hidden = !menuOpen; },
    say(who, text, seconds = 3.5) { flash = { who, text, remaining: seconds }; key = ''; },
    render(state, target, { dt = 0, mode = 'walk', locked = false, materialStatus = 'idle' } = {}) {
      if (flash) { flash.remaining -= dt; if (flash.remaining <= 0) { flash = null; key = ''; } }
      const step = getStep(state);
      const token = [state.mode, state.stepId, menuOpen, Boolean(flash), flash?.text, target.waiting, target.nearTarget, locked, materialStatus, innerWidth, innerHeight].join('|');
      const changed = key !== token;
      if (key !== token) {
        key = token;
        const orderGreeting = state.stepId === 'order-brief';
        speaker = flash?.who || (menuOpen ? 'receptionist' : orderGreeting && !target.waiting ? 'technician' : step?.speaker || 'receptionist');
        $('dialogue-speaker').textContent = names[speaker];
        const materialLines = { 'to-cabinet': 'Voy al armario a buscar el PLA verde. Ahora vuelvo.', pickup: 'Esta es la bobina para tu trabajo. La llevo a la impresora.', 'to-printer': 'Ya tengo el PLA. Voy a colocarlo y preparar la alimentación.', loading: 'Estoy colocando la bobina. Enseguida empezamos a imprimir.' };
        $('dialogue-text').textContent = flash?.text || (state.stepId === 'material' ? materialLines[materialStatus] || step.dialogue : menuOpen
          ? '¡Hola! La estación cuesta ' + money(DEMO.hourlyRate) + '/hora y el PLA ' + money(DEMO.pricePerGram) + '/g. En la hoja tenés las tres modalidades. ¿Cómo querés trabajar?'
          : target.waiting ? state.mode === 'order' ? 'El técnico ya viene al costado derecho del mostrador. Podés esperarlo allí.' : state.mode === 'autonomous' ? 'Ya recibí tu solicitud. Voy a E1 para revisar los dos archivos y preparar el material.' : 'Ya voy a E1. Dejame pasar y me quedo con vos durante el trabajo.'
            : orderGreeting ? '¡Hola! Estoy acá, al costado del mostrador. Acercate y contame qué querés encargar.'
            : step?.dialogue || '¡Hola! Acercate al mostrador y conversamos sobre tu proyecto.');
        const nextUtterance = speaker + '|' + $('dialogue-text').textContent;
        if (utterance !== nextUtterance) { utterance = nextUtterance; introduce = true; }
        const order = state.mode === 'order', orderQuote = getOrderQuote();
        $('dialogue-note').textContent = menuOpen ? 'PC, impresora y asistencia básica incluidas' : order ? 'Presupuesto por trabajo · anticipo descontado del total' : ['confirm', 'checkout'].includes(state.stepId) ? 'Material incluido el auxiliar · uso de estación y PLA' : '';
        $('quote-detail').innerHTML = order
          ? '<div><span>' + (state.stepId === 'order-estimate' ? 'Estimación del trabajo' : 'Total del encargo') + '</span><b>' + money(state.stepId === 'order-estimate' ? orderQuote.estimate : orderQuote.total) + '</b></div><div><span>Anticipo</span><b>' + money(orderQuote.deposit) + '</b></div><div class="total"><span>Saldo al retirar</span><b>' + money(state.stepId === 'order-estimate' ? orderQuote.estimate - orderQuote.deposit : orderQuote.balance) + '</b></div>'
          : '<div><span>Estación / ' + DEMO.representedMinutes + ' min</span><b>' + money(quote.station) + '</b></div><div><span>PLA / ' + DEMO.grams + ' g</span><b>' + money(quote.material) + '</b></div><div class="total"><span>Total</span><b>' + money(quote.total) + '</b></div>';
        $('quote-detail').hidden = !['confirm', 'checkout', 'order-estimate', 'order-pickup'].includes(state.stepId);
        $('service-menu').hidden = !menuOpen;
        bubble.classList.toggle('client', speaker === 'client');
        $('flow-guide').hidden = !step || menuOpen || state.complete || state.orderAway;
        $('flow-step-label').textContent = !step ? '' : step.target === 'technician' ? 'ENCARGO' : step.target === 'exit' ? 'SALIDA' : step.target === 'reception' ? 'RECEPCIÓN' : step.id === 'material' ? 'MATERIAL' : step.id === 'confirm' ? 'PRESUPUESTO' : step.id === 'prepare' ? 'LAMINADO' : step.id.includes('design') || step.id.includes('review') ? 'DISEÑO' : step.id.includes('printing') || step.id.includes('ready') ? 'IMPRESIÓN' : 'E1';
        $('flow-title').textContent = target.waiting ? state.mode === 'order' ? 'Esperá al técnico a la derecha del mostrador' : 'Esperá al técnico junto a E1' : step?.title || '';
        $('flow-action').textContent = step?.action || 'En curso…';
        $('flow-action').disabled = !target.nearTarget || !step?.action;
        bubbleHeight = bubble.offsetHeight || 190;
      }
      const anchor = speaker === 'technician' ? world.technician : speaker === 'computer' ? world.screens.get('E1') : speaker === 'printer' ? world.printers.get('E1').gantry : world.receptionist;
      const distance = camera.position.distanceTo(anchor.position);
      const active = mode === 'walk' && (menuOpen || flash || state.mode || distance < 3.2);
      const hidden = state.complete || state.orderAway || !active || (distance > 6.5 && !menuOpen && speaker !== 'client');
      if (bubble.hidden !== hidden) { bubble.hidden = hidden; if (!hidden) { bubbleHeight = bubble.offsetHeight || 190; introduce = true; } }
      if (bubble.hidden) return;
      projectionTime += dt;
      if (!changed && projectionTime < 1 / 30) return;
      projectionTime = 0;
      if (speaker === 'client') {
        bubble.style.left = '50%'; bubble.style.top = (innerHeight - 125) + 'px'; bubble.classList.remove('edge'); animateSpeech(); return;
      }
      point.copy(anchor.position); point.y += speaker === 'computer' || speaker === 'printer' ? 0.6 : anchor === world.receptionist ? 1.9 : 2.06;
      offset.copy(point).sub(camera.position); camera.getWorldDirection(direction);
      const behind = offset.dot(direction) < 0;
      point.project(camera);
      const half = Math.min(335, innerWidth - 30) / 2 + 15;
      const x = behind ? (point.x > 0 ? half : innerWidth - half) : (point.x * 0.5 + 0.5) * innerWidth;
      const y = (-point.y * 0.5 + 0.5) * innerHeight - 25;
      bubble.style.left = THREE.MathUtils.clamp(x, half, innerWidth - half) + 'px';
      bubble.style.top = THREE.MathUtils.clamp(y, bubbleHeight + 24, innerHeight - 110) + 'px';
      bubble.classList.toggle('edge', behind || Math.abs(point.x) > 0.9);
      animateSpeech();
    },
    setHint(text) { const hint = $('interaction-hint'); if (hint.textContent !== (text || '')) hint.textContent = text || ''; if (hint.hidden !== !text) hint.hidden = !text; },
  };
}
