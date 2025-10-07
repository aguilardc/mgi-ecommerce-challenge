const crypto = require('crypto');

// Genera un ID único para cada orden
function generateOrderId(context, events, done) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(5).toString('hex');
  context.vars.orderId = `ord_${timestamp}_${random}`;
  return done();
}

// Log de resultados de reserva
function logReservation(requestParams, response, context, ee, next) {
  const strategy = context.vars.lockingStrategy || 'UNKNOWN';
  const orderId = context.vars.orderId || 'UNKNOWN';

  if (response.statusCode === 500) {
    console.log(`⚠️  [${strategy}] Order ${orderId} - Error 500`);
  } else if (response.statusCode === 409) {
    console.log(`ℹ️  [${strategy}] Order ${orderId} - Conflict (expected)`);
  } else if (response.statusCode === 200) {
    console.log(`✅ [${strategy}] Order ${orderId} - Success`);
  }

  return next();
}

// Artillery processor - Funciones helper para los tests
module.exports = {
  generateOrderId,
  logReservation,
};
