
const test = require('node:test');
const assert = require('node:assert/strict');

const BillingService =
  require('../src/application/billing-service');

function setup() {
  const data = [{
    id: 'sub_1',
    customerEmail: 'test@example.com',
    amount: 100,
    currency: 'USD',
    country: 'US',
    plan: 'PRO',
    billingCycle: 'MONTHLY',
    paymentMethod: 'CREDIT_CARD',
    status: 'ACTIVE',
    balance: 0
  }];

  const repository = {
    getAll: () => structuredClone(data),
    saveAll: next => {
      data.splice(0, data.length, ...structuredClone(next));
    }
  };

  return {
    service: new BillingService(repository, {
      charge: () => ({ approved: true })
    })
  };
}

test('procesa un cobro válido', () => {
  const { service } = setup();

  const result = service.bill('sub_1', {
    idempotencyKey: 'invoice-2026-10'
  });

  assert.equal(result.success, true);
  assert.equal(result.breakdown.finalTotal, 108.25);
});

test('una clave repetida devuelve el resultado anterior', () => {
  const { service } = setup();

  const first = service.bill('sub_1', {
    idempotencyKey: 'invoice-2026-10'
  });

  const second = service.bill('sub_1', {
    idempotencyKey: 'invoice-2026-10'
  });

  assert.equal(
    first.transactionReference,
    second.transactionReference
  );

  assert.equal(second.idempotentReplay, true);
});

test('rechaza una suscripción inexistente', () => {
  const { service } = setup();

  const result = service.bill('no-existe', {
    idempotencyKey: 'missing'
  });

  assert.equal(result.success, false);
  assert.equal(result.code, 'ERR_SUB_NOT_FOUND');
});
