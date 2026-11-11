'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const pricingSource = fs.readFileSync(path.join(root, 'pricing.js'), 'utf8');
const pricing = vm.runInNewContext(pricingSource + '; VerusPricing;');

test('Pix aplica 5% e arredonda o resultado para reais inteiros', () => {
  for (const [card,pix] of [[99,94],[159,151],[250,238],[90,86],[89,85],[795,755],[99.99,95],[0,0]]) {
    assert.equal(pricing.pix(card), pix, `Preço no cartão: ${card}`);
  }
});

test('Pix acompanha a alteração do cartão, sem depender de preço Pix antigo', () => {
  const product = {card:99, pix:1234};
  pricing.apply([product]);
  assert.equal(product.pix,94);
  product.card = 159;
  assert.equal(product.pix,151);
  product.card = null;
  assert.equal(product.pix,null);
  assert.equal(pricing.pix(-1),null);
  assert.equal(pricing.pix(NaN),null);
});

test('3 parcelas são calculadas com precisão de centavos', () => {
  for (const [card,installment] of [[99,33],[159,53],[100,33.33],[250,83.33],[98,32.67],[0,0]]) {
    assert.equal(pricing.installment(card),installment);
  }
  assert.equal(pricing.installment(null),null);
});

test('sacola soma os valores arredondados por unidade', () => {
  const products = [{card:250}];
  pricing.apply(products);
  assert.equal(products[0].pix * 2,476);
});

test('catálogo usa somente cartão como preço atual cadastrado', () => {
  const productsSource = fs.readFileSync(path.join(root, 'products.js'), 'utf8');
  const products = vm.runInNewContext(productsSource + '; items;');
  assert.equal(products.length,350);
  for (const product of products) {
    assert.equal(Object.hasOwn(product,'pix'),false,product.id);
    assert.equal(Number.isFinite(product.card),true,product.id);
  }
  pricing.apply(products);
  const magnata = products.find(p => p.id==='51');
  assert.equal(magnata.card,99);
  assert.equal(magnata.pix,94);
  assert.equal(magnata.previousCard,180);
  for (const id of ['53','54']) {
    const product = products.find(p => p.id===id);
    assert.equal(product.card,159);
    assert.equal(product.pix,151);
  }
});
