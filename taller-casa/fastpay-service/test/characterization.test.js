
const test = require('node:test');
const assert = require('node:assert/strict');

const Money = require('../src/domain/money');
const { calculateBilling } = require('../src/domain/billing');

test('Money evita errores de coma flotante', () => {
  const result = Money.from(0.1)
    .add(Money.from(0.2));

  assert.equal(result.toNumber(), 0.3);
});

test('Colombia aplica IVA del 19% y recargo correspondiente', () => {
  const result = calculateBilling({
    amount: 299.99,
    plan: 'PRO',
    country: 'CO',
    paymentMethod: 'CREDIT_CARD',
    billingCycle: 'MONTHLY'
  });

  assert.equal(result.taxes, 57);
  assert.equal(result.surcharge, 4.5);
  assert.equal(result.finalTotal, 361.49);
});

test('México aplica IVA del 16% y recargo por transferencia', () => {
  const result = calculateBilling({
    amount: 100,
    plan: 'PRO',
    country: 'MX',
    paymentMethod: 'WIRE_TRANSFER',
    billingCycle: 'MONTHLY'
  });

  assert.equal(result.taxes, 16);
  assert.equal(result.surcharge, 8);
  assert.equal(result.finalTotal, 124);
});

test('Enterprise Plus anual aplica descuento del 15%', () => {
  const result = calculateBilling({
    amount: 200,
    plan: 'ENTERPRISE_PLUS',
    country: 'US',
    paymentMethod: 'CREDIT_CARD',
    billingCycle: 'ANNUAL'
  });

  assert.equal(result.discount, 30);
  assert.equal(result.finalTotal, 184.03);
});
