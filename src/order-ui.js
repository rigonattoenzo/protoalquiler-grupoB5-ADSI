import { getOrderQuote, money } from './workflow.js';

// Notificación dentro del guion: no usa mensajería ni servicios externos.
export function createOrderUI({ onApprove, onDefer, onReturn, onRestart }) {
  const $ = id => document.getElementById(id), quote = getOrderQuote();
  let previous = '', currentStep = '', phaseAge = 0, holdAge = 0, deferredInChat = false, replyEnabled = false, returnEnabled = false;
  $('order-approve').addEventListener('click', () => { if (replyEnabled) onApprove(); });
  $('order-defer').addEventListener('click', () => { if (replyEnabled) onDefer(); });
  $('order-return').addEventListener('click', () => { if (returnEnabled) onReturn(); });
  $('order-restart').addEventListener('click', onRestart);
  $('order-quote').innerHTML = '<div><span>Presupuesto final</span><b>' + money(quote.total) + '</b></div><div><span>Anticipo abonado</span><b>− ' + money(quote.deposit) + '</b></div><div class="total"><span>Saldo al retirar</span><b>' + money(quote.balance) + '</b></div>';
  $('order-text').textContent = '¡Hola! Terminamos tu diseño. Te compartimos cómo quedó el soporte para celular.';
  function show(id, visible) { const element = $(id); if (element.hidden === !visible) return false; element.hidden = !visible; return visible; }
  return {
    canReply: () => replyEnabled,
    canReturn: () => returnEnabled,
    render(state, dt = 0) {
      const changedStep = currentStep !== state.stepId; currentStep = state.stepId;
      if (!state.orderAway) {
        show('order-screen', false); previous = ''; deferredInChat = false; replyEnabled = returnEnabled = false; phaseAge = holdAge = 0; return;
      }
      if (changedStep) phaseAge = 0;
      const delta = Number.isFinite(dt) ? Math.min(0.1, Math.max(0, dt)) : 0; phaseAge += delta;
      const designing = state.stepId === 'order-design', approval = state.stepId === 'order-approval';
      const approved = state.stepId === 'order-next-day';
      if (designing) { deferredInChat = false; holdAge = 0; }
      if (state.orderDeferred && !deferredInChat) { deferredInChat = true; holdAge = 0; }
      if (deferredInChat) holdAge += delta;
      const greeting = approved || approval && phaseAge >= 1;
      const budget = approved || approval && phaseAge >= 2;
      const holdAnswer = deferredInChat && holdAge >= 0.65;
      const confirmation = approved && phaseAge >= 0.85;
      const typing = approval && (phaseAge >= 0.35 && !budget || deferredInChat && !holdAnswer) || approved && !confirmation;
      const wasReply = replyEnabled, wasReturn = returnEnabled;
      replyEnabled = approval && budget && (!deferredInChat || holdAnswer);
      returnEnabled = confirmation;
      const token = [state.stepId, greeting, budget, deferredInChat, holdAnswer, confirmation, typing, replyEnabled].join('|');
      if (token === previous) return;
      previous = token;
      show('order-screen', true); show('order-transition', designing); show('order-phone', !designing);
      let newMessage = show('order-greeting', greeting);
      newMessage = show('order-budget', budget) || newMessage;
      show('order-preview', greeting); show('order-quote', budget);
      newMessage = show('order-deferred-reply', deferredInChat) || newMessage;
      newMessage = show('order-deferred', holdAnswer) || newMessage;
      newMessage = show('order-approved-reply', approved) || newMessage;
      newMessage = show('order-confirmed', confirmation) || newMessage;
      show('order-typing', typing); show('order-decisions', replyEnabled); show('order-return', returnEnabled);
      $('order-contact-status').textContent = typing ? 'escribiendo…' : 'en línea · diseño e impresión 3D';
      $('order-clock').textContent = approved ? '10:26' : deferredInChat ? '10:25' : '10:24';
      $('order-reply-label').textContent = replyEnabled ? 'Elegí una respuesta para enviarla' : returnEnabled ? 'Continuar el recorrido' : 'Esperando un mensaje…';
      if (newMessage) $('order-chat').scrollTop = $('order-chat').scrollHeight || 0;
      if (!wasReply && replyEnabled) $('order-approve').focus({ preventScroll: true });
      if (!wasReturn && returnEnabled) $('order-return').focus({ preventScroll: true });
    },
  };
}
