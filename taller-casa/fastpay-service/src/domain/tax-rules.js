
const RULES = {
  CO: {
    rate: 0.19,
    surcharge: (amount) => amount > 20000 ? 450 : 0
  },
  MX: {
    rate: 0.16,
    surcharge: (_amount, method) =>
      method === 'WIRE_TRANSFER' ? 800 : 0
  },
  AR: {
    rate: 0.56,
    surcharge: () => 1250
  },
  US: {
    rate: 0.0825,
    surcharge: () => 0
  }
};

function taxRuleFor(country, amountCents, paymentMethod) {
  const rule = RULES[country];

  if (!rule) {
    return { rate: 0.10, surchargeCents: 0 };
  }

  return {
    rate: rule.rate,
    surchargeCents: rule.surcharge(amountCents, paymentMethod)
  };
}

module.exports = { taxRuleFor };
