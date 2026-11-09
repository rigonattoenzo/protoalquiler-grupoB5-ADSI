import { getOrderQuote, money } from './workflow.js';

// Notificación dentro del guion: no usa mensajería ni servicios externos.
export function createOrderUI({ onApprove, onDefer, onReturn, onRestart }) {
  const $ = id => document.getElementById(id), quote = getOrderQuote();
  let previous = '';
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
      if (!state.orderAway) return;
      const designing = state.stepId === 'order-design', approval = state.stepId === 'order-approval';
      $('order-time').textContent = designing ? 'Unas horas después…' : approval ? 'Nuevo mensaje · ProtoAlquiler' : 'Impresión autorizada';
      $('order-title').textContent = designing ? 'Estamos preparando tu diseño' : approval ? '¡Terminamos tu diseño!' : 'Mañana te esperamos';
      $('order-text').textContent = designing ? 'El equipo trabaja a partir de tus planos y referencias.' : approval ? 'Este es tu soporte para celular. El presupuesto del trabajo completo es ' + money(quote.total) + '. ¿Querés que lo imprimamos?' : '¡Perfecto! La impresión quedó autorizada. Podés venir a retirar tu soporte mañana en recepción.';
      $('order-preview').hidden = designing; $('order-quote').hidden = designing;
      $('order-decisions').hidden = !approval; $('order-return').hidden = designing || approval;
      $('order-deferred').hidden = !state.orderDeferred;
      if (changedStep && !designing) $(approval ? 'order-approve' : 'order-return').focus({ preventScroll: true });
    },
  };
}
