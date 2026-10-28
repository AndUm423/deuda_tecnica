
class Money {
  constructor(cents, currency = 'USD') {
    if (!Number.isSafeInteger(cents)) {
      throw new TypeError('Los centavos deben ser enteros');
    }

    this.cents = cents;
    this.currency = currency;
    Object.freeze(this);
  }

  static from(value, currency = 'USD') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('Importe inválido');
    }

    return new Money(
      Math.round((value + Number.EPSILON) * 100),
      currency
    );
  }

  add(other) {
    this.assertCurrency(other);
    return new Money(this.cents + other.cents, this.currency);
  }

  subtract(other) {
    this.assertCurrency(other);
    return new Money(this.cents - other.cents, this.currency);
  }

  multiply(rate) {
    if (!Number.isFinite(rate)) {
      throw new TypeError('Tasa inválida');
    }

    return new Money(
      Math.round(this.cents * rate),
      this.currency
    );
  }

  toNumber() {
    return this.cents / 100;
  }

  assertCurrency(other) {
    if (!(other instanceof Money) || other.currency !== this.currency) {
      throw new TypeError('Las monedas deben coincidir');
    }
  }
}

module.exports = Money;
