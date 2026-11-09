import { getOrderQuote, money } from './workflow.js';

// Notificación dentro del guion: no usa mensajería ni servicios externos.
export function createOrderUI({ onApprove, onDefer, onReturn, onRestart }) {
  const $ = id => document.getElementById(id), quote = getOrderQuote();
  let previous = '', deferredInChat = false;
  $('order-approve').addEventListener('click', onApprove);
  $('order-defer').addEventListener('click', onDefer);
  $('order-return').addEventListener('click', onReturn);
  $('order-restart').addEventListener('click', onRestart);
  $('order-quote').innerHTML = '<div><span>Presupuesto final</span><b>' + money(quote.total) + '</b></div><div><span>Anticipo abonado</span><b>− ' + money(quote.deposit) + '</b></div><div class="total"><span>Saldo al retirar</span><b>' + money(quote.balance) + '</b></div>';
  return {
    render(state) {
      const token = state.stepId + '|' + Boolean(state.orderDeferred);
      if (token === previous) return;
      const changedStep = previous.split('|')[0] !== state.stepId; previous = token;
      $('order-screen').hidden = !state.orderAway;
      if (!state.orderAway) { deferredInChat = false; return; }
      const designing = state.stepId === 'order-design', approval = state.stepId === 'order-approval';
      if (designing) deferredInChat = false;
      deferredInChat ||= Boolean(state.orderDeferred);
      $('order-transition').hidden = !designing; $('order-phone').hidden = designing;
      $('order-text').textContent = '¡Hola! Terminamos tu diseño. Te compartimos cómo quedó el soporte para celular.';
      $('order-preview').hidden = designing; $('order-quote').hidden = designing;
      $('order-decisions').hidden = !approval; $('order-return').hidden = designing || approval;
      $('order-deferred-reply').hidden = !deferredInChat; $('order-deferred').hidden = !deferredInChat;
      $('order-approved-reply').hidden = designing || approval; $('order-confirmed').hidden = designing || approval;
      $('order-reply-label').textContent = approval ? 'Elegí una respuesta para enviarla' : 'Continuar el recorrido';
      $('order-chat').scrollTop = changedStep && approval ? 0 : $('order-chat').scrollHeight || 0;
      if (changedStep && !designing) $(approval ? 'order-approve' : 'order-return').focus({ preventScroll: true });
    },
  };
}
