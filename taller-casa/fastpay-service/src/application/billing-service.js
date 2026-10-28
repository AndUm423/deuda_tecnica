
const { randomUUID } = require('node:crypto');
const { calculateBilling } = require('../domain/billing');

class BillingService {
  constructor(repository, gateway) {
    this.repository = repository;
    this.gateway = gateway;
    this.inFlight = new Set();
    this.completed = new Map();
  }

  getIdempotencyKey(subscriptionId, options) {
    const period = options.billingPeriod ||
      new Date().toISOString().slice(0, 7);

    return options.idempotencyKey ||
      `${subscriptionId}:${period}`;
  }

  bill(subscriptionId, options = {}) {
    const key = this.getIdempotencyKey(subscriptionId, options);

    if (this.completed.has(key)) {
      return {
        ...this.completed.get(key),
        idempotentReplay: true
      };
    }

    if (this.inFlight.has(key)) {
      return {
        success: false,
        code: 'DUPLICATE_IN_PROGRESS'
      };
    }

    this.inFlight.add(key);

    try {
      const result = this.processBilling(
        subscriptionId,
        options,
        key
      );

      if (result.success) {
        this.completed.set(key, result);
      }

      return result;
    } finally {
      this.inFlight.delete(key);
    }
  }

  processBilling(subscriptionId, options, key) {
    const subscriptions = this.repository.getAll();
    const index = subscriptions.findIndex(
      item => item.id === subscriptionId
    );

    if (index === -1) {
      return {
        success: false,
        code: 'ERR_SUB_NOT_FOUND',
        msg: 'Suscripción no existe'
      };
    }

    const subscription = { ...subscriptions[index] };
    const validation = this.validateSubscription(subscription);

    if (validation) {
      return validation;
    }

    const breakdown = calculateBilling(subscription, options);

    return this.chargeAndPersist(
      subscriptions,
      index,
      subscription,
      breakdown,
      key
    );
  }

  validateSubscription(subscription) {
    if (subscription.status === 'ACTIVE') {
      return null;
    }

    if (subscription.status === 'SUSPENDED') {
      return {
        success: false,
        code: 'ERR_SUSPENDED',
        msg: 'La suscripción está suspendida'
      };
    }

    return {
      success: false,
      code: 'ERR_INACTIVE',
      msg: 'La suscripción no está activa'
    };
  }

  chargeAndPersist(subscriptions, index, subscription, breakdown, key) {
    const reference = `TX_${randomUUID()}`;

    const payment = this.gateway.charge({
      reference,
      amount: breakdown.finalTotal,
      currency: subscription.currency || 'USD',
      idempotencyKey: key
    });

    if (!payment.approved) {
      return {
        success: false,
        code: 'GATEWAY_DECLINED'
      };
    }

    const currentBalance = subscription.balance || 0;

    subscription.balance = Math.round(
      (currentBalance + breakdown.finalTotal + Number.EPSILON) * 100
    ) / 100;

    subscription.lastBilledAt = new Date().toISOString();
    subscription.lastTransactionRef = reference;

    subscriptions[index] = subscription;
    this.repository.saveAll(subscriptions);

    return {
      success: true,
      code: 'BILLING_PROCESSED',
      subId: subscription.id,
      customer: subscription.customerEmail,
      breakdown,
      transactionReference: reference,
      processedAt: subscription.lastBilledAt
    };
  }
}

module.exports = BillingService;
