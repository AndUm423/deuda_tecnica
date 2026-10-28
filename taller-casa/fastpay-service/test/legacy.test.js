const test = require('node:test');
const assert = require('node:assert');
const billingEngine = require('../legacy/legacy_billing_engine');

test('Legacy Test: Intenta procesar un cobro bÃ¡sico sin validar efectos secundarios', (t) => {
  const result = billingEngine.processSubscriptionBilling('sub_102', {});
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.subId, 'sub_102');
  assert.strictEqual(result.customer, 'laura.torres@startup-beta.io');
  // Falta verificar que el saldo no se corrompa, que no haya efectos colaterales en disco,
  // ni validaciÃ³n de moneda, idempotencia o impuestos.
});

test('Legacy Test: Falla si la suscripciÃ³n no existe', (t) => {
  const result = billingEngine.processSubscriptionBilling('sub_inexistente', {});
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.code, 'ERR_SUB_NOT_FOUND');
});

