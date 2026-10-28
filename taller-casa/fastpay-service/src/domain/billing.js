
const Money = require('./money');
const { taxRuleFor } = require('./tax-rules');

function calculateBilling(subscription, options = {}) {
  const base = Money.from(subscription.amount);

  let discount = Money.from(0);

  if (subscription.plan === 'ENTERPRISE_PLUS') {
    discount = subscription.billingCycle === 'ANNUAL'
      ? base.multiply(0.15)
      : Money.from(25);
  } else if (
    subscription.plan === 'ENTERPRISE' &&
    options.promoCode === 'FAST2026'
  ) {
    discount = Money.from(30);
  }

  const taxable = base.subtract(discount);

  const { rate, surchargeCents } = taxRuleFor(
    subscription.country,
    base.cents,
    subscription.paymentMethod
  );

  const taxes = taxable.multiply(rate);
  const MoneyClass = Money;
  const surcharge = new MoneyClass(surchargeCents);

  const total = taxable
    .add(taxes)
    .add(surcharge);

  return {
    baseAmount: base.toNumber(),
    discount: discount.toNumber(),
    taxes: taxes.toNumber(),
    surcharge: surcharge.toNumber(),
    finalTotal: total.toNumber()
  };
}

module.exports = { calculateBilling };
