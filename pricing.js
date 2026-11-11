'use strict';

// O preço no cartão é a única referência para Pix e parcelamento.
const VerusPricing = Object.freeze({
  pixDiscountPercent: 5,
  installments: 3,
  pix(card) {
    if (!Number.isFinite(card) || card < 0) return null;
    const cents = Math.round(card * 100);
    return Math.round(cents * (100 - this.pixDiscountPercent) / 10000);
  },
  installment(card) {
    if (!Number.isFinite(card) || card < 0) return null;
    return Math.round(Math.round(card * 100) / this.installments) / 100;
  },
  apply(products) {
    for (const product of products) {
      Object.defineProperty(product, 'pix', {
        enumerable: true,
        get() { return VerusPricing.pix(this.card); }
      });
    }
  }
});
