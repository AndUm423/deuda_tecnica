
class MockPaymentGateway {
  constructor() {
    this.chargedKeys = new Set();
  }

  charge({ idempotencyKey }) {
    if (this.chargedKeys.has(idempotencyKey)) {
      return { approved: false, duplicate: true };
    }

    this.chargedKeys.add(idempotencyKey);

    return { approved: true };
  }
}

module.exports = MockPaymentGateway;
