'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const productURL = id => `produto.html?id=${encodeURIComponent(id)}`;
const collectionURL = collection => `index.html?colecao=${encodeURIComponent(collection)}#loja`;
const whatsappURL = text => `https://wa.me/5511944787024?text=${encodeURIComponent(text)}`;
const isHome = document.body.dataset.page === 'home';
const isCart = document.body.dataset.page === 'cart';
const contacts = { instagram: 'verusoriginal', whatsapp: '(11) 94478-7024' };
const hasPromotion = p => Number.isFinite(p.previousCard) && p.previousCard > p.card && p.card > 0;
const promotionPercent = p => Math.round((p.previousCard - p.card) / p.previousCard * 100).toLocaleString('pt-BR');
const savingsPercent = p => Math.round((p.card - p.pix) / p.card * 100).toLocaleString('pt-BR');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const productByID = id => items.find(p => p.id === String(id));
const icons = {
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></svg>',
  bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>',
  chat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.3-4.7a9 9 0 1 1 16.7-4.8Z"/><path d="M8 8c1 4 3 6 7 7l1-2-2-1-1 1-3-3 1-1-1-2-2 1Z"/></svg>',
  menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  chevron:'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4 3 3 3-3"/></svg>',
  close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
  plus:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>'
};

const collections = [
  ['todos','Todas as categorias'], ['promocoes','Perfumes em promoção'], ['perfumes','Todos os perfumes'],
  ['masculinos','Perfumes masculinos'], ['masculinos-arabes','Masculinos · árabes'], ['masculinos-nicho','Masculinos · perfumes de nicho'],
  ['femininos','Perfumes femininos'], ['femininos-arabes','Femininos · árabes'], ['femininos-nicho','Femininos · perfumes de nicho'],
  ['unissex','Perfumes unissex'], ['aerossois-ambientes','Aerossóis ambientes'], ['spray-corporal','Spray corporal'],
  ['hidratantes','Hidratantes corporais'], ['moda','Toda a moda'], ['oversized','Oversized'], ['plus-size','Plus size'], ['camisetas','Camisetas'], ['polos','Polos']
];

function matchesCollection(p, collection) {
  const cat = normalize(p.category);
  const gender = p.gender || (cat.includes('unissex') ? 'unissex' : cat.includes('feminino') ? 'feminino' : 'masculino');
  const male = gender === 'masculino' || gender === 'unissex';
  const female = gender === 'feminino' || gender === 'unissex';
  switch (collection) {
    case 'promocoes': return hasPromotion(p);
    case 'perfumes': return p.kind === 'Perfume';
    case 'masculinos': return p.kind === 'Perfume' && male;
    case 'femininos': return p.kind === 'Perfume' && female;
    case 'masculinos-arabes': return p.kind === 'Perfume' && male && cat.includes('arabes');
    case 'femininos-arabes': return p.kind === 'Perfume' && female && cat.includes('arabes');
    case 'masculinos-nicho': return p.kind === 'Perfume' && male && cat.includes('nicho');
    case 'femininos-nicho': return p.kind === 'Perfume' && female && cat.includes('nicho');
    case 'unissex': return p.kind === 'Perfume' && gender === 'unissex';
    case 'spray-corporal': return p.kind === 'Spray corporal';
    case 'aerossois':
    case 'ambiente':
    case 'aerossois-ambientes': return p.kind === 'Spray ambiente';
    case 'hidratantes': return p.kind === 'Hidratante';
    case 'moda': return p.kind === 'Roupa';
    case 'oversized': return p.category === 'Camisetas oversized';
    case 'plus-size': return p.kind === 'Roupa' && p.category === 'Plus size';
    case 'casuais':
    case 'camisetas': return p.kind === 'Roupa' && p.category === 'Camisetas casuais';
    case 'polos': return p.category === 'Polos';
    default: return true;
  }
}

function photo(p, eager = false, viewIndex = 0) {
  if (p.kind === 'Roupa' && p.gallery?.length) {
    const view = p.gallery[viewIndex] || p.gallery[0];
    if (view.crop) {
      const [x,y,width,height] = view.crop;
      return `<span class="photo-window fashion-gallery-photo" style="--crop-width:${view.sourceWidth / width * 100}%;--crop-height:${view.sourceHeight / height * 100}%;--crop-left:${-x / width * 100}%;--crop-top:${-y / height * 100}%"><img src="${escapeHTML(view.src)}" width="${view.sourceWidth}" height="${view.sourceHeight}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" alt="${escapeHTML(p.name+' — '+view.label)}"></span>`;
    }
    return `<span class="photo-window original-photo fashion-standalone-photo"><img src="${escapeHTML(view.src)}" width="${view.width}" height="${view.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" alt="${escapeHTML(p.name+' — '+view.label)}"></span>`;
  }
  if (p.photoPlaceholder) return '<span class="photo-pending">VERUS<small>Spray de ambiente</small><small>Foto em atualização</small></span>';
  if (p.photo) {
    const width = Number(p.photo.width);
    const height = Number(p.photo.height);
    if (p.photo.src && Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0) {
      return `<span class="photo-window original-photo${p.photo.background === 'bege' ? ' standard-photo' : ''}" style="--photo-ratio:${width} / ${height}"><img src="${escapeHTML(p.photo.src)}" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}" ${eager ? 'fetchpriority="high"' : ''} decoding="async" alt="${escapeHTML(p.photoLabel || `${p.name} — ${p.brand}`)}"></span>`;
    }
  }
  return `<span class="photo-window ${p.layout === 'fashion' ? 'fashion-photo' : ''}"><img src="${p.catalog}" width="2000" height="1410" loading="${eager ? 'eager' : 'lazy'}" ${eager ? 'fetchpriority="high"' : ''} decoding="async" alt="${escapeHTML(p.photoLabel || `${p.name} — ${p.brand}`)}"></span>`;
}

function price(p, detailed = false) {
  if (p.pix === null) return '<div class="price-block"><div class="price-main">Consulte o valor</div></div>';
  return `<div class="price-block">${hasPromotion(p) ? `<div class="price-before">De <del aria-label="Preço anterior no cartão">${money(p.previousCard)}</del> <span>por</span></div>` : ''}<div class="price-main">${money(p.card)}<small>no cartão</small></div><div class="price-installment">até <b>3x de ${money(p.card / 3)}</b> sem juros</div><div class="pix-offer"><span><span class="pix-symbol" aria-hidden="true">◆</span><b>${money(p.pix)}</b> no Pix</span><small>com <strong>${savingsPercent(p)}% de desconto</strong>${detailed ? ' em relação ao cartão' : ''}</small></div></div>`;
}

function productCard(p, promotion = false) {
  const profile = p.kind === 'Roupa' ? p.typ : p.profile || p.kind;
  return `<article class="product-card" data-kind="${escapeHTML(p.kind)}" data-product-id="${p.id}">
    <a class="product-picture" href="${productURL(p.id)}" aria-label="Conhecer ${escapeHTML(p.name)}">${photo(p)}${hasPromotion(p) ? `<span class="product-flags"><span class="discount-badge" aria-label="${promotionPercent(p)}% de desconto no cartão em relação ao preço anterior"><b>${promotionPercent(p)}%</b><small>OFF</small></span></span>` : ''}</a>
    <div class="product-meta"><span>${escapeHTML(p.brand === '-' ? 'VERUS' : p.brand)}</span><span>${p.size !== '-' ? escapeHTML(p.size) : p.kind === 'Roupa' ? 'MODA' : ''}</span></div>
    <h3><a href="${productURL(p.id)}">${escapeHTML(p.name)}</a></h3><p class="product-profile">${escapeHTML(profile)}</p>
    ${price(p)}<div class="card-actions"><a class="text-link" href="${productURL(p.id)}">Ver detalhes →</a>${p.kind==='Roupa' ? `<a class="add-small clothing-choose" href="${productURL(p.id)}">Escolher tamanho</a>` : `<button class="add-small" type="button" data-action="add" data-id="${p.id}" aria-label="Adicionar ${escapeHTML(p.name)} à sacola">${icons.plus} Adicionar</button>`}</div>
  </article>`;
}

function renderHeader() {
  const group = (gender, label) => `<div class="nav-group"><button class="nav-toggle" type="button" data-action="menu" aria-expanded="false" aria-controls="${gender}-menu">${label} ${icons.chevron}</button><div class="submenu" id="${gender}-menu" hidden><a href="${collectionURL(gender)}">Ver todos <small>Explore a seleção</small></a><a href="${collectionURL(gender + '-arabes')}">Perfumes árabes <span aria-hidden="true">→</span></a><a href="${collectionURL(gender + '-nicho')}">Perfumes de nicho <span aria-hidden="true">→</span></a></div></div>`;
  $('#site-header').innerHTML = `<div class="announcement"><span>SUA ESSÊNCIA. SEU ESTILO.</span><span>ATÉ 3X SEM JUROS NO CARTÃO</span></div><header class="header-shell"><div class="header-main wrap"><a class="brand" href="index.html" aria-label="VERUS — início"><img src="verus-assets/logo.webp" alt="" width="58" height="58"><span><span class="brand-name">VERUS</span><span class="brand-tagline">SUA ESSÊNCIA. SEU ESTILO.</span></span></a><form class="search-form" action="index.html#loja" method="get" role="search"><input id="search" name="busca" type="search" placeholder="Qual será sua próxima escolha?" aria-label="Buscar produtos"><button type="submit" aria-label="Buscar">${icons.search}</button></form><div class="header-actions"><a class="service-link" href="${whatsappURL('Olá, VERUS! Gostaria de uma ajuda para escolher.')}" target="_blank" rel="noopener">${icons.chat}<span>PODEMOS AJUDAR?<strong>Fale com a VERUS</strong></span></a><a class="bag-button" href="carrinho.html" aria-label="Ir para o carrinho">${icons.bag}<span class="bag-label">Sacola</span><span class="bag-count" id="bag-count">0</span></a><button type="button" class="mobile-menu-toggle" data-action="mobile-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="primary-navigation">${icons.menu}</button></div></div><nav class="primary-navigation" id="primary-navigation" aria-label="Categorias"><div class="nav-inner wrap"><a class="nav-link nav-promo" href="index.html#promocoes">PROMOÇÕES</a>${group('masculinos','MASCULINOS')}${group('femininos','FEMININOS')}<a class="nav-link" href="${collectionURL('aerossois-ambientes')}">AEROSSÓIS AMBIENTES</a><a class="nav-link" href="${collectionURL('spray-corporal')}">SPRAY CORPORAL</a><a class="nav-link" href="${collectionURL('hidratantes')}">HIDRATANTES</a><div class="nav-group"><button class="nav-toggle" type="button" data-action="menu" aria-expanded="false" aria-controls="moda-menu">MODA ${icons.chevron}</button><div class="submenu" id="moda-menu" hidden><a href="${collectionURL('moda')}">Ver todos <small>Explore a seleção</small></a>${[['oversized','Oversized'],['plus-size','Plus size'],['camisetas','Camisetas'],['polos','Polos']].map(([value,label]) => `<a href="${collectionURL(value)}">${label} <span aria-hidden="true">→</span></a>`).join('')}</div></div><a class="nav-link" href="index.html#kits">KITS</a></div></nav></header>`;
  $$('.nav-group').forEach(group => {
    group.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse' && window.matchMedia('(min-width: 1001px)').matches) setMenu($('.nav-toggle', group), true);
    });
    group.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse' && !group.contains(document.activeElement)) setMenu($('.nav-toggle', group), false);
    });
    group.addEventListener('focusout', e => { if (!group.contains(e.relatedTarget)) setMenu($('.nav-toggle', group), false); });
  });
}

function setMenu(button, open) {
  if (open) $$('.nav-toggle').filter(b => b !== button).forEach(b => setMenu(b, false));
  button.setAttribute('aria-expanded', String(open));
  document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
}

function renderFooter() {
  $('#site-footer').innerHTML = `<footer class="footer"><div class="wrap"><div class="footer-main"><div><a class="brand" href="index.html"><img src="verus-assets/logo.webp" alt="Logo VERUS" width="58" height="58"><span><span class="brand-name">VERUS</span><span class="footer-brand-description">Perfumaria e Moda</span></span></a><p>Sua essência. Seu estilo.</p></div><div><h3>ESTAMOS NO WHATSAPP</h3><a class="footer-contact" href="${whatsappURL('Olá, VERUS! Gostaria de atendimento.')}" target="_blank" rel="noopener">${icons.chat}<span>${contacts.whatsapp}</span></a></div><div><h3>REDES SOCIAIS</h3><a class="instagram-link" href="https://www.instagram.com/${contacts.instagram}/" target="_blank" rel="noopener" aria-label="Instagram da VERUS, @${contacts.instagram}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg><span>@${contacts.instagram}</span></a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} VERUS · Perfumaria e Moda</span><span>Sua essência. Seu estilo.</span></div></div></footer><a class="whatsapp-float" href="${whatsappURL('Olá, VERUS! Gostaria de atendimento.')}" target="_blank" rel="noopener" aria-label="Falar com a VERUS pelo WhatsApp">${icons.chat}</a>`;
}

function availableSizes(p) { return (p.sizes || '').split(',').map(size => size.trim()).filter(Boolean); }
function cartLineKey(line) { return `${line.id}::${line.size || ''}`; }
function needsClothingSelection(line) {
  const p = productByID(line.id);
  return p?.kind === 'Roupa' && !availableSizes(p).includes(line.size);
}
function editableCartLine(p) {
  const key = new URLSearchParams(location.search).get('editar');
  return cart.find(line => cartLineKey(line) === key && productByID(line.id)?.modelID === p.modelID);
}
function colorProductURL(id) {
  const line = currentProduct && editableCartLine(currentProduct);
  return productURL(id) + (line ? `&editar=${encodeURIComponent(cartLineKey(line))}` : '');
}
function clothingMessage(p, size, qty = 1) {
  return `Olá, VERUS! Gostaria de consultar ${p.modelName || p.name}.\nCor: ${p.color}\nTamanho: ${size}\nQuantidade: ${qty}\nPodem confirmar disponibilidade e frete?`;
}

let cart = [];
try {
  const stored = JSON.parse(localStorage.getItem('verusCart') || '[]');
  if (Array.isArray(stored)) stored.forEach(line => {
    const p = productByID(line?.id);
    if (!p || !Number.isSafeInteger(line.qty) || line.qty <= 0) return;
    const size = p.kind === 'Roupa' && availableSizes(p).includes(line.size) ? line.size : '';
    const normalized = {id:p.id, qty:line.qty, size};
    const existing = cart.find(other => cartLineKey(other) === cartLineKey(normalized));
    if (existing) existing.qty += line.qty; else cart.push(normalized);
  });
} catch { /* Shopping remains usable when storage is unavailable. */ }

function saveCart() {
  try { localStorage.setItem('verusCart', JSON.stringify(cart)); } catch { /* Keep the current session's cart. */ }
  renderCart();
}

function renderCart() {
  const count = cart.reduce((total,line) => total + line.qty,0);
  $('#bag-count').textContent = count;
  if (!isCart) return;
  const totalCard = cart.reduce((sum,line) => sum + productByID(line.id).card * line.qty,0);
  const totalPix = cart.reduce((sum,line) => sum + productByID(line.id).pix * line.qty,0);
  const incomplete = cart.some(needsClothingSelection);
  $('#cart-content').innerHTML = cart.length ? `<div class="cart-layout"><section class="cart-items" aria-label="Produtos no carrinho">${cart.map(line => {
    const p = productByID(line.id);
    const missing = needsClothingSelection(line);
    const editURL = `${productURL(p.id)}&editar=${encodeURIComponent(cartLineKey(line))}`;
    const label = missing ? p.modelName : p.name;
    return `<article class="cart-page-item${missing ? ' cart-needs-selection' : ''}"><a class="cart-item-photo" href="${missing ? editURL : productURL(p.id)}" aria-label="Ver ${escapeHTML(label)}">${photo(p)}</a><div class="cart-item-description"><span class="eyebrow">${escapeHTML(p.brand)}</span><h2><a href="${missing ? editURL : productURL(p.id)}">${escapeHTML(label)}</a></h2>${p.kind === 'Roupa' ? `<p>${missing ? 'Escolha a cor e o tamanho para continuar.' : `Cor: ${escapeHTML(p.color)} · <b>Tamanho: ${escapeHTML(line.size)}</b>`}</p><a class="cart-edit-link text-link" href="${editURL}">${missing ? 'Escolher cor e tamanho' : 'Alterar cor ou tamanho'} →</a>` : `<p>${escapeHTML(p.size !== '-' ? p.size : p.typ)}</p>`}<div class="cart-unit-price">${money(p.card)} <small>por unidade no cartão</small></div><p class="cart-unit-pix">${money(p.pix)} por unidade no Pix</p><div class="cart-item-controls"><div class="quantity"><button type="button" data-action="cart-minus" data-id="${p.id}" data-key="${escapeHTML(cartLineKey(line))}" aria-label="Diminuir quantidade de ${escapeHTML(label)}">−</button><output aria-label="Quantidade de ${escapeHTML(label)}">${line.qty}</output><button type="button" data-action="cart-plus" data-id="${p.id}" data-key="${escapeHTML(cartLineKey(line))}" aria-label="Aumentar quantidade de ${escapeHTML(label)}">+</button></div><button class="remove-item" type="button" data-action="cart-remove" data-id="${p.id}" data-key="${escapeHTML(cartLineKey(line))}">Remover</button></div></div><div class="cart-item-subtotal"><small>Subtotal no cartão</small><b>${money(p.card * line.qty)}</b></div></article>`;
  }).join('')}<div class="cart-bottom-actions"><a class="text-link" href="index.html#loja">← Continuar escolhendo</a><button class="text-link" type="button" data-action="cart-clear">Esvaziar carrinho ×</button></div></section><aside class="cart-summary" aria-labelledby="summary-title"><span class="eyebrow">SUAS ESCOLHAS</span><h2 id="summary-title">Resumo do pedido</h2><div class="cart-summary-row"><span>${count} ${count === 1 ? 'produto' : 'produtos'}</span><span id="cart-total">${money(totalCard)}</span></div><div class="cart-summary-total"><span>Total no cartão</span><strong>${money(totalCard)}</strong><small>até 3x de ${money(totalCard / 3)} sem juros</small></div><div class="pix-offer"><span><span class="pix-symbol" aria-hidden="true">◆</span><b id="cart-total-pix">${money(totalPix)}</b> no Pix</span><small>Economize ${money(totalCard - totalPix)} em relação ao cartão</small></div><button class="button" type="button" id="checkout" data-action="checkout" ${incomplete ? 'disabled' : ''}>Consultar pedido pelo WhatsApp →</button>${incomplete ? '<p class="cart-selection-note" role="status">Escolha cor e tamanho dos itens destacados para continuar.</p>' : ''}<p class="cart-summary-note">Confirme disponibilidade, opções e frete no atendimento. Parcelamento acima de 3x sujeito a juros.</p></aside></div>` : '<div class="cart-empty-page"><span class="eyebrow">UMA NOVA ESCOLHA ESPERA POR VOCÊ</span><h2>Seu carrinho está vazio.</h2><p>Explore os perfumes, os cuidados e a moda da VERUS.</p><a class="button" href="index.html#loja">Descobrir a curadoria →</a></div>';
  $('#cart-item-count').textContent = `${count} ${count === 1 ? 'item' : 'itens'} no carrinho`;
}

function renderCartPage() {
  document.title = 'Seu carrinho — VERUS';
  $('#conteudo').innerHTML = '<section class="cart-page wrap"><nav class="breadcrumbs" aria-label="Caminho da página"><a href="index.html">Início</a><span aria-hidden="true">/</span><span aria-current="page">Carrinho</span></nav><div class="cart-page-heading"><div><span class="eyebrow">SUAS ESCOLHAS VERUS</span><h1>Seu <em>carrinho.</em></h1></div><p id="cart-item-count" aria-live="polite"></p></div><div id="cart-content"></div></section>';
  renderCart();
}

let toastTimeout;
function showToast(message) {
  const toast = $('#toast');
  toast.innerHTML = `<span>${escapeHTML(message)}</span><a href="carrinho.html">Ver carrinho →</a>`;
  toast.classList.add('visible');clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'),2200);
}

function addToCart(id, quantity = 1, size = '') {
  const p = productByID(id);
  if (!p) return;
  if (p.kind === 'Roupa' && !availableSizes(p).includes(size)) {
    if (currentProduct?.id === p.id) { showToast('Escolha um tamanho disponível.');$('.clothing-size button')?.focus(); }
    else location.href = productURL(p.id);
    return;
  }
  const editing = p.kind === 'Roupa' && editableCartLine(p);
  if (editing) cart = cart.filter(line => cartLineKey(line) !== cartLineKey(editing));
  const normalizedSize = p.kind === 'Roupa' ? size : '';
  const existing = cart.find(line => line.id === p.id && (line.size || '') === normalizedSize);
  if (existing) existing.qty += quantity; else cart.push({id:p.id,qty:quantity,size:normalizedSize});
  saveCart();
  showToast(`${p.name}${size ? ' · tamanho '+size : ''} ${editing ? 'atualizado' : 'adicionado'} à sacola`);
  if (editing) { const url = new URL(location.href);url.searchParams.delete('editar');history.replaceState(null,'',url.pathname+url.search); }
}

function checkout() {
  if (!cart.length) return;
  if (cart.some(needsClothingSelection)) { showToast('Escolha cor e tamanho dos itens destacados.');$('.cart-edit-link')?.focus();return; }
  const lines = cart.map(line => {
    const p = productByID(line.id);
    return `• ${p.kind === 'Roupa' ? `${p.modelName} — Cor: ${p.color} — Tamanho: ${line.size}` : p.name+(p.size !== '-' ? ' ('+p.size+')' : '')} — ${line.qty} un. — ${money(p.pix)} Pix / ${money(p.card)} cartão`;
  });
  const text = 'Olá, VERUS! Gostaria de consultar os seguintes itens:\n\n' + lines.join('\n') + '\n\nPodem confirmar disponibilidade, frete e condições de pagamento?';
  window.open(whatsappURL(text),'_blank','noopener');
}

const campaignSlides = [
  {
    "theme": "sand",
    "image": "banner-verus-perfumes",
    "label": "VERUS — Sua essência, em outro nível. Perfumes que revelam sua personalidade.",
    "href": "index.html?colecao=perfumes#loja",
    "width": 2098,
    "height": 750
  },
  {
    "theme": "sand",
    "image": "banner-verus-pacific-aura",
    "label": "Pacific Aura — Frescor para acompanhar seus dias. Aromático e aquático. 100 ml.",
    "href": "produto.html?id=61",
    "width": 2098,
    "height": 749
  },
  {
    "theme": "sand",
    "image": "banner-lataffa",
    "label": "Lattafa — Descubra a coleção de perfumes.",
    "href": "index.html?busca=Lattafa&colecao=perfumes#loja",
    "width": 2060,
    "height": 763
  },
  {
    "theme": "sand",
    "image": "banner-verus-gardenia",
    "label": "Shagaf Al Ward Gardenia — Elegância que floresce. Presença que permanece.",
    "href": "produto.html?id=74",
    "width": 2061,
    "height": 763
  }
];
let slideIndex = 0;
let carouselTimer;

function showSlide(index) {
  slideIndex = (index + campaignSlides.length) % campaignSlides.length;
  $$('.campaign-slide').forEach((slide, i) => {
    const active = i === slideIndex;
    slide.classList.toggle('is-active',active);
    slide.setAttribute('aria-hidden',String(!active));
    slide.inert = !active;
    slide.querySelector('a').tabIndex = active ? 0 : -1;
  });
  $('.campaign').dataset.currentTheme = campaignSlides[slideIndex].theme;
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  if (reducedMotion.matches || document.hidden) return;
  carouselTimer = setInterval(() => {
    if (!$('.campaign').contains(document.activeElement) && !$('.campaign').matches(':hover')) showSlide(slideIndex + 1);
  }, 5500);
}

function setupCampaign() {
  $('.campaign').classList.add('campaign-banners');
  $('#campaign-slides').innerHTML = campaignSlides.map((slide, i) => `<article class="campaign-slide${i ? '' : ' is-active'}" aria-roledescription="slide" aria-label="${i + 1} de ${campaignSlides.length}" aria-hidden="${i ? 'true' : 'false'}" ${i ? 'inert' : ''}><a class="campaign-banner-link" href="${slide.href}"><picture><source media="(max-width: 600px)" type="image/webp" srcset="verus-assets/banners/${slide.image}-mobile.webp"><img class="campaign-banner" src="verus-assets/banners/${slide.image}.webp" alt="${escapeHTML(slide.label)}" width="${slide.width}" height="${slide.height}" ${i ? 'loading="eager" fetchpriority="low"' : 'fetchpriority="high"'}></picture></a></article>`).join('');
  showSlide(0);
  resetCarouselTimer();
  document.addEventListener('visibilitychange', resetCarouselTimer);
  reducedMotion.addEventListener('change', resetCarouselTimer);
}

const kitChoices = [
  {name:'Um ritual de presença',perfume:'12',lotion:'Asad'},
  {name:'Um toque de delicadeza',perfume:'88',lotion:'Yara'},
  {name:'Uma assinatura marcante',perfume:'66',lotion:'Royal Amber'}
];

function renderKits() {
  $('#kit-grid').innerHTML = kitChoices.map((kit, index) => {
    const perfume = productByID(kit.perfume);
    const lotion = items.find(p => p.kind === 'Hidratante' && p.name === kit.lotion);
    return `<article class="kit-card"><div class="kit-pictures"><a class="photo-window-link" href="${productURL(perfume.id)}" aria-label="Conhecer o perfume ${escapeHTML(perfume.name)}">${photo(perfume)}</a><span class="kit-plus" aria-hidden="true">+</span><a class="photo-window-link" href="${productURL(lotion.id)}" aria-label="Conhecer o hidratante ${escapeHTML(lotion.name)}">${photo(lotion)}</a></div><h3>${kit.name}</h3><p>${escapeHTML(perfume.name)} + hidratante corporal ${escapeHTML(lotion.name)}</p><a class="text-link" href="${whatsappURL(`Olá, VERUS! Quero montar um kit com ${perfume.name} (${perfume.size}) e o hidratante corporal ${lotion.name}. Podem confirmar disponibilidade e valor?`)}" target="_blank" rel="noopener">Consultar combinação →</a></article>`;
  }).join('');
}

let activeCollection = 'todos';
let activeSort = 'featured';
let searchTerm = '';
let visibleLimit = 24;

function syncFilterURL() {
  const url = new URL(location.href);
  for (const [key, value, defaultValue] of [['colecao',activeCollection,'todos'],['ordem',activeSort,'featured'],['busca',searchTerm,'']]) {
    if (value === defaultValue) url.searchParams.delete(key); else url.searchParams.set(key,value);
  }
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function renderCatalogue() {
  const description = $('#collection-description');
  const collectionCopy = {
    'aerossois-ambientes': ['Aerossóis ambientes · 300 ml', 'Para perfumar sua casa ou escritório e criar uma atmosfera agradável e acolhedora. O catálogo apresenta opções de Lattafa e Al Wataniah, como Special Oud. Consulte as marcas e fragrâncias disponíveis.'],
    'spray-corporal': ['Sprays corporais · 200 ml', 'Para perfumar a pele no dia a dia, com opções frescas, delicadas, doces ou intensas. O catálogo reúne marcas como Asdaaf, Lattafa e Armaf, com fragrâncias como Asad, Club de Nuit, Khamrah, Bade’e Al Oud e Ameerat Al Arab. Consulte as opções disponíveis de cada marca.']
  }[activeCollection];
  description.hidden = !collectionCopy;
  description.innerHTML = collectionCopy ? `<h3>${escapeHTML(collectionCopy[0])}</h3><p>${escapeHTML(collectionCopy[1])}</p>` : '';
  const query = normalize(searchTerm.trim()).replace(/[^a-z0-9]+/g,' ').trim();
  let selected = items.filter(p => matchesCollection(p,activeCollection));
  if (query) {
    const name = p => normalize(p.name).replace(/[^a-z0-9]+/g,' ').trim();
    const exact = selected.filter(p => name(p).replace(/ /g,'') === query.replace(/ /g,'') || (p.kind === 'Roupa' && normalize(p.modelName).replace(/[^a-z0-9]/g,'') === query.replace(/ /g,'')));
    if (exact.length) {
      const perfumes = exact.filter(p => p.kind === 'Perfume');
      selected = perfumes.length ? perfumes : exact;
    } else {
      const words = query.split(' ');
      selected = selected.filter(p => words.every(word => normalize(p.name+' '+p.brand+' '+p.size+' '+p.kind).replace(/[^a-z0-9]+/g,' ').includes(word)));
      selected.sort((a,b) => Number(name(b).startsWith(query)) - Number(name(a).startsWith(query)) || Number(b.kind === 'Perfume') - Number(a.kind === 'Perfume'));
    }
  }
  if (activeSort === 'low') selected.sort((a,b) => a.pix - b.pix);
  if (activeSort === 'high') selected.sort((a,b) => b.pix - a.pix);
  if (activeSort === 'az') selected.sort((a,b) => a.name.localeCompare(b.name,'pt-BR'));
  const visible = selected.slice(0,visibleLimit);
  $('#product-grid').innerHTML = visible.map(p => productCard(p,activeCollection === 'promocoes')).join('') || '<div class="empty-state"><h3>Ainda não encontramos sua escolha.</h3><p>Tente outro nome, marca ou categoria.</p><button class="button button-outline" type="button" data-action="clear-filters">Ver toda a curadoria</button></div>';
  $('#results-summary').textContent = `${selected.length} ${selected.length === 1 ? 'produto encontrado' : 'produtos encontrados'}${selected.length > visible.length ? ` · mostrando ${visible.length}` : ''}${searchTerm ? ` para “${searchTerm}”` : ''}`;
  $('#load-more').hidden = visible.length >= selected.length;
  $('#clear-filters').hidden = activeCollection === 'todos' && !searchTerm;
  syncFilterURL();
}

function setupHome() {
  const oldProduct = location.hash.match(/^#produto-(\d+)$/);
  if (oldProduct) { location.replace(productURL(oldProduct[1])); return; }
  setupCampaign();
  $('#featured-grid').innerHTML = ['26','12','88','22','6','7','8','15','11','31','36','42','53','54','51'].map(productByID).filter(hasPromotion).map(p => productCard(p,true)).join('');
  $$('[data-photo]').forEach(el => { el.innerHTML = photo(productByID(el.dataset.photo)); });
  renderKits();
  $('#collection').innerHTML = collections.map(([value,label]) => `<option value="${value}">${label}</option>`).join('');
  const params = new URLSearchParams(location.search);
  const legacyCollection = params.get('colecao');
  const requested = ['aerossois','ambiente'].includes(legacyCollection) ? 'aerossois-ambientes' : legacyCollection === 'casuais' ? 'camisetas' : legacyCollection;
  activeCollection = collections.some(([value]) => value === requested) ? requested : 'todos';
  activeSort = ['low','high','az'].includes(params.get('ordem')) ? params.get('ordem') : 'featured';
  searchTerm = params.get('busca') || '';
  $('#collection').value = activeCollection;
  $('#sort').value = activeSort;
  $('#search').value = searchTerm;
  $('#collection').addEventListener('change', e => { activeCollection = e.target.value;visibleLimit = 24;renderCatalogue(); });
  $('#sort').addEventListener('change', e => { activeSort = e.target.value;visibleLimit = 24;renderCatalogue(); });
  $('#search').addEventListener('input', e => { searchTerm = e.target.value;visibleLimit = 24;renderCatalogue(); });
  $('.search-form').addEventListener('submit', e => { e.preventDefault();renderCatalogue();$('#loja').scrollIntoView({behavior:reducedMotion.matches ? 'instant' : 'smooth'}); });
  renderCatalogue();
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible');observer.unobserve(entry.target); } }), {threshold:.05});
    $$('.editorial,.kit-section').forEach(section => { section.classList.add('reveal-ready');observer.observe(section); });
  }
}

let selectedClothingSize = '';
let selectedGalleryView = 0;
let sizeHintTimer;

function galleryControls(p) {
  return `<div class="fashion-gallery-main" id="fashion-gallery-main">${photo(p,true,selectedGalleryView)}</div>${p.gallery.length > 1 ? `<div class="gallery-thumbs" role="group" aria-label="Fotos do produto">${p.gallery.map((view,i) => `<button type="button" class="gallery-thumb" data-action="gallery-view" data-index="${i}" aria-pressed="${i===selectedGalleryView}" aria-label="Ver ${escapeHTML(view.label.toLowerCase())}">${photo(p,false,i)}<span>${escapeHTML(view.label)}</span></button>`).join('')}</div>` : ''}${p.photoReference ? '<p class="photo-reference-note">Fotos de referência do modelo; a cor da foto pode diferir da selecionada.</p>' : ''}`;
}

function clothingOptions(p) {
  const scale = p.sizeScale || ['P','M','G','GG'];
  return `<section class="clothing-options" aria-label="Cor e tamanho"><p class="current-color">Cor: <b>${escapeHTML(p.color)}</b></p><div class="other-colors" aria-label="Outras cores deste modelo">${items.filter(other => other.modelID === p.modelID).map(other => `<a href="${colorProductURL(other.id)}" ${other.id===p.id ? 'aria-current="page"' : ''}>${escapeHTML(other.color)}</a>`).join('')}</div><fieldset class="clothing-size"><legend>Escolha o tamanho</legend><div class="clothing-size-choices" role="radiogroup" aria-label="Tamanho">${scale.map(size => {
    const available = availableSizes(p).includes(size);
    return `<span class="size-option"><button class="size-button" type="button" role="radio" aria-checked="${selectedClothingSize===size}" aria-disabled="${!available}" aria-label="Tamanho ${size}${available ? '' : ', indisponível nesta cor'}" data-action="clothing-size" data-size="${size}"><span>${size}</span></button>${available ? '' : `<span class="size-hint" role="tooltip" id="size-hint-${size}" hidden>Indisponível nesta cor</span>`}</span>`;
  }).join('')}</div></fieldset></section>`;
}

function hideSizeHints() {
  clearTimeout(sizeHintTimer);sizeHintTimer = null;
  $$('.size-hint').forEach(hint => { hint.hidden = true; });
  $$('.size-button').forEach(button => button.removeAttribute('aria-describedby'));
}
function showSizeHint(button, pinned = false) {
  clearTimeout(sizeHintTimer);hideSizeHints();
  const hint = button.parentElement.querySelector('.size-hint');
  if (!hint) return;
  hint.hidden = false;button.setAttribute('aria-describedby',hint.id);
  if (pinned) sizeHintTimer = setTimeout(hideSizeHints,2600);
}
function updateClothingSelection(size) {
  if (!currentProduct || !availableSizes(currentProduct).includes(size)) return;
  selectedClothingSize = size;hideSizeHints();
  $$('.size-button').forEach(button => button.setAttribute('aria-checked',String(button.dataset.size===size)));
  $('[data-action="add-product"]').disabled = false;
  $('[data-action="fashion-whatsapp"]').disabled = false;
  $('#selected-size-note').textContent = `Selecionado: ${currentProduct.color} · tamanho ${size}.`;
  $('.product-help').href = whatsappURL(clothingMessage(currentProduct,size,productQuantity));
}

document.addEventListener('pointerover',event => {
  const button = event.target.closest('.size-button[aria-disabled="true"]');
  if (button && event.pointerType !== 'touch' && !button.contains(event.relatedTarget)) showSizeHint(button);
});
document.addEventListener('pointerout',event => {
  const button = event.target.closest('.size-button[aria-disabled="true"]');
  if (button && !button.contains(event.relatedTarget) && !sizeHintTimer) hideSizeHints();
});
document.addEventListener('focusin',event => {
  if (event.target.matches('.size-button[aria-disabled="true"]')) showSizeHint(event.target);
});
document.addEventListener('focusout',event => {
  if (event.target.matches('.size-button') && !sizeHintTimer) hideSizeHints();
});

let productQuantity = 1;
let currentProduct;

function renderProduct() {
  const id = new URLSearchParams(location.search).get('id');
  const p = productByID(id);
  currentProduct = p;
  selectedClothingSize = '';
  selectedGalleryView = 0;
  productQuantity = 1;
  if (p?.kind === 'Roupa') {
    const editing = editableCartLine(p);
    if (editing) {
      productQuantity = editing.qty;
      if (editing.id === p.id && availableSizes(p).includes(editing.size)) selectedClothingSize = editing.size;
    }
  }
  if (!p) {
    document.title = 'Produto não encontrado — VERUS';
    $('#conteudo').innerHTML = '<section class="error-page wrap"><span class="eyebrow">CURADORIA VERUS</span><h1>Vamos encontrar sua próxima escolha?</h1><p>Este produto não foi encontrado.</p><a class="button" href="index.html#loja">Explorar o catálogo</a></section>';
    return;
  }
  document.title = `${p.name} ${p.size !== '-' ? p.size : ''} — VERUS`;
  $('meta[name=description]').content = p.occasion || p.description || `Conheça ${p.name} na VERUS. Veja os detalhes e consulte disponibilidade.`;
  const sameProduct = items.filter(other => other.kind === p.kind && other.name === p.name && other.brand === p.brand);
  const category = p.kind === 'Perfume' ? 'Perfumaria' : p.kind === 'Roupa' ? 'Moda' : 'Cuidados';
  const type = p.kind === 'Roupa' ? p.typ : [p.typ !== '-' ? p.typ : '',p.size !== '-' ? p.size : ''].filter(Boolean).join(' · ');
  const productInfo = p.kind === 'Perfume' ? `${p.occasion.split('. ')[0]}. Conheça as notas que compõem essa fragrância e encontre o seu momento de usar.` : p.kind === 'Roupa' ? `${p.typ}. Um modelo para fazer parte do seu estilo. Escolha sua cor e seu tamanho para consultar a disponibilidade no atendimento.` : p.description || 'Conheça as opções disponíveis e encontre a que combina com você.';
  const related = items.filter(other => other.id !== p.id && other.kind === p.kind && other.name !== p.name && (p.kind !== 'Roupa' || other.modelID !== p.modelID)).sort((a,b) => Number(b.brand === p.brand) - Number(a.brand === p.brand)).slice(0,4);
  const notes = p.kind === 'Perfume' ? `<section class="fragrance-story" aria-labelledby="notes-heading"><div class="section-heading"><div><span class="eyebrow">CONHEÇA A FRAGRÂNCIA</span><h2 id="notes-heading">Uma história em <em>três notas.</em></h2><p>Cada etapa revela um pouco mais da sua assinatura.</p></div></div><div class="notes-grid">${[['top','Topo','A primeira impressão'],['heart','Coração','A personalidade'],['base','Fundo','O que permanece']].map(([key,title,subtitle],i) => `<article class="note-card"><span class="note-number" aria-hidden="true">0${i + 1}</span><span class="eyebrow">${subtitle}</span><h3>Notas de ${title.toLowerCase()}</h3><p>${escapeHTML(p.notes[key])}</p></article>`).join('')}</div><section class="occasion" aria-labelledby="occasion-heading"><div><span class="eyebrow">O MOMENTO CERTO É O SEU</span><h2 id="occasion-heading">Quando <em>usar.</em></h2></div><p>${escapeHTML(p.occasion)}</p></section></section>` : `<section class="fragrance-story" aria-labelledby="description-heading"><div class="section-heading"><div><span class="eyebrow">OS DETALHES FAZEM A DIFERENÇA</span><h2 id="description-heading">Feito para o seu <em>ritual.</em></h2></div></div><div class="product-description">${p.kind === 'Roupa' ? `<h3>Tecido e acabamento</h3><p>${escapeHTML(p.typ)}</p><p>Cor: ${escapeHTML(p.color)}</p><p class="purchase-note">Confirme a disponibilidade da cor e do tamanho desejados no atendimento.</p>` : `<h3>${escapeHTML(p.kind === 'Hidratante' ? 'Cuidado que acompanha sua essência' : 'Mais formas de perfumar')}</h3><p>${escapeHTML(p.description || 'Consulte as opções disponíveis com a VERUS.')}</p>${p.usage ? `<p class="variants-copy"><b>Uso:</b> ${escapeHTML(p.usage)}</p><p><b>Volume:</b> ${escapeHTML(p.size)}</p><p>${escapeHTML(p.fragranceOptions)}</p>` : ''}${p.profile ? `<p class="variants-copy"><b>Perfil:</b> ${escapeHTML(p.profile)}</p>` : ''}`}</div></section>`;
  $('#conteudo').innerHTML = `<div class="wrap"><nav class="breadcrumbs" aria-label="Caminho da página"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="${collectionURL(p.kind === 'Perfume' ? 'perfumes' : p.kind === 'Roupa' ? 'moda' : p.kind === 'Hidratante' ? 'hidratantes' : p.kind === 'Spray ambiente' ? 'aerossois-ambientes' : 'spray-corporal')}">${category}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHTML(p.name)}</span></nav><section class="product-layout" aria-labelledby="product-title"><div class="product-gallery${p.kind==='Roupa'?' fashion-product-gallery':''}">${p.kind==='Roupa'?galleryControls(p):photo(p,true)+'<span class="gallery-caption">SUA ESSÊNCIA. SEU ESTILO.</span>'}</div><div class="product-info"><span class="eyebrow">${escapeHTML(p.brand === '-' ? 'VERUS' : p.brand)}</span><h1 id="product-title">${escapeHTML(p.name)}</h1><div class="product-chips"><span class="chip">${escapeHTML(type)}</span>${p.kind === 'Perfume' ? `<span class="chip">${p.gender === 'unissex' ? 'Unissex' : p.gender === 'feminino' ? 'Feminino' : 'Masculino'}</span>` : ''}${p.profile && p.kind === 'Perfume' ? `<span class="chip">${escapeHTML(p.profile)}</span>` : ''}</div><p class="product-intro">${escapeHTML(productInfo)}</p>${sameProduct.length > 1 ? `<div class="size-options"><span>Volume</span>${sameProduct.map(other => `<a href="${productURL(other.id)}" ${other.id === p.id ? 'aria-current="page"' : ''}>${escapeHTML(other.size)}</a>`).join('')}</div>` : ''}${p.kind==='Roupa'?clothingOptions(p):''}<div class="product-buy-box">${price(p,true)}<div class="product-purchase-actions"><div class="quantity"><button type="button" data-action="quantity-minus" aria-label="Diminuir quantidade">−</button><output id="product-quantity" aria-label="Quantidade" aria-live="polite">${productQuantity}</output><button type="button" data-action="quantity-plus" aria-label="Aumentar quantidade">+</button></div><button class="button" type="button" data-action="add-product" data-id="${p.id}" ${p.kind==='Roupa'&&!selectedClothingSize?'disabled':''}>${icons.bag} Adicionar à sacola</button></div>${p.kind==='Roupa'?`<button class="button button-outline fashion-whatsapp" type="button" data-action="fashion-whatsapp" ${!selectedClothingSize?'disabled':''}>${icons.chat} Consultar no WhatsApp</button><p class="selected-size-note" id="selected-size-note" aria-live="polite">${selectedClothingSize?`Selecionado: ${escapeHTML(p.color)} · tamanho ${escapeHTML(selectedClothingSize)}.`:'Selecione um tamanho para continuar.'}</p>`:''}<p class="purchase-note">Pix à vista ou até 3x sem juros no cartão. Acima de 3x, parcelamento sujeito a juros. Disponibilidade e frete confirmados no atendimento.</p></div><a class="product-help" href="${whatsappURL(`Olá, VERUS! Quero saber mais sobre ${p.name} ${p.size !== '-' ? '(' + p.size + ')' : ''}.`)}" target="_blank" rel="noopener">${icons.chat} Quer uma ajuda para escolher? Fale com a gente →</a></div></section>${notes}<section class="related-section" aria-labelledby="related-heading"><div class="section-heading"><div><span class="eyebrow">CONTINUE DESCOBRINDO</span><h2 id="related-heading">Outras boas <em>escolhas.</em></h2></div><a class="text-link" href="index.html#loja">Explorar a curadoria →</a></div><div class="product-grid">${related.map(other => productCard(other)).join('')}</div></section></div>`;
}

function resetFilters() {
  activeCollection = 'todos';activeSort = 'featured';searchTerm = '';visibleLimit = 24;
  $('#collection').value = activeCollection;$('#sort').value = activeSort;$('#search').value = '';
  renderCatalogue();
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    if (!event.target.closest('.nav-group')) $$('.nav-toggle').forEach(b => setMenu(b,false));
    return;
  }
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'menu') setMenu(button,button.getAttribute('aria-expanded') !== 'true');
  if (action === 'mobile-menu') {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');$('#primary-navigation').dataset.open = String(open);
  }
  if (action === 'add') addToCart(id);
  if (action === 'add-product') addToCart(id,productQuantity,selectedClothingSize);
  if (action === 'fashion-whatsapp' && availableSizes(currentProduct).includes(selectedClothingSize)) window.open(whatsappURL(clothingMessage(currentProduct,selectedClothingSize,productQuantity)), '_blank', 'noopener');
  if (action === 'clothing-size') {
    if (availableSizes(currentProduct).includes(button.dataset.size)) updateClothingSelection(button.dataset.size);
    else showSizeHint(button,true);
  }
  if (action === 'gallery-view') {
    selectedGalleryView = Number(button.dataset.index);
    $('#fashion-gallery-main').innerHTML = photo(currentProduct,true,selectedGalleryView);
    $$('.gallery-thumb').forEach(other => other.setAttribute('aria-pressed',String(other===button)));
  }
  if (action === 'cart-plus' || action === 'cart-minus' || action === 'cart-remove') {
    const line = cart.find(line => cartLineKey(line) === button.dataset.key);
    if (line) line.qty = action === 'cart-remove' ? 0 : line.qty + (action === 'cart-plus' ? 1 : -1);
    cart = cart.filter(line => line.qty > 0);saveCart();
  }
  if (action === 'quantity-minus' || action === 'quantity-plus') {
    productQuantity = Math.max(1,productQuantity + (action === 'quantity-plus' ? 1 : -1));$('#product-quantity').textContent = productQuantity;
    if (currentProduct?.kind === 'Roupa' && selectedClothingSize) $('.product-help').href = whatsappURL(clothingMessage(currentProduct,selectedClothingSize,productQuantity));
  }
  if (action === 'cart-clear') { cart = [];saveCart(); }
  if (action === 'checkout') checkout();
  if (action === 'clear-filters' && isHome) resetFilters();
  if (action === 'load-more') { visibleLimit += 24;renderCatalogue(); }
  if (action === 'slide-next') { showSlide(slideIndex + 1);resetCarouselTimer(); }
  if (action === 'slide-previous') { showSlide(slideIndex - 1);resetCarouselTimer(); }

});

document.addEventListener('keydown', event => {
  if (event.target.matches('.size-button') && ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
    event.preventDefault();
    const buttons = $$('.size-button');
    let index = buttons.indexOf(event.target);
    index = event.key==='Home' ? 0 : event.key==='End' ? buttons.length-1 : (index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+buttons.length)%buttons.length;
    buttons[index].focus();
    if (buttons[index].getAttribute('aria-disabled')!=='true') updateClothingSelection(buttons[index].dataset.size);
  }
  if (event.key === 'Escape') {
    $$('.nav-toggle').forEach(button => setMenu(button,false));
    $('#primary-navigation').dataset.open = 'false';
    const mobileToggle = $('.mobile-menu-toggle');mobileToggle.setAttribute('aria-expanded','false');mobileToggle.setAttribute('aria-label','Abrir menu');
  }
  if (event.key === 'ArrowDown' && event.target.matches('.nav-toggle')) {
    event.preventDefault();setMenu(event.target,true);document.getElementById(event.target.getAttribute('aria-controls')).querySelector('a').focus();
  }
});

function removeNetlifyBranding() {
  const watchedRoots = new WeakSet();
  const isBrandingLabel = value => /^powered\s*by\s*netlify$/i.test(String(value || '').replace(/\s+/g, ' ').trim());

  function inspect(root) {
    if (!root.querySelectorAll) return;
    const selector = 'a,button,div,span,img,iframe,netlify-badge,[id*="netlify-badge"],[class*="netlify-badge"]';
    const candidates = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    candidates.forEach(element => {
      const labels = [element.textContent, element.getAttribute('aria-label'), element.getAttribute('title'), element.getAttribute('alt')];
      const isBadge = element.matches('netlify-badge,[id*="netlify-badge"],[class*="netlify-badge"]');
      const isBadgeFrame = element.tagName === 'IFRAME' && /netlify/i.test(element.getAttribute('src') || '') && /badge|branding|powered/i.test(element.getAttribute('src') || '');
      if (isBadge || isBadgeFrame || labels.some(isBrandingLabel)) {
        const container = element.matches('img') ? element.closest('a,button') || element : element;
        container.remove();
      }
    });
    [root, ...root.querySelectorAll('*')].forEach(element => {
      if (element.shadowRoot) watch(element.shadowRoot);
    });
  }

  function watch(root) {
    if (watchedRoots.has(root)) return;
    watchedRoots.add(root);
    inspect(root);
    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'childList') {
          record.addedNodes.forEach(inspect);
          if (record.target.nodeType === Node.ELEMENT_NODE) inspect(record.target);
        } else {
          const element = record.target.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target;
          if (element) inspect(element);
        }
      });
    }).observe(root, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['aria-label','title','alt','src','id','class']});
  }

  watch(document.body);
  window.addEventListener('load', () => inspect(document.body), {once:true});
}

removeNetlifyBranding();
renderHeader();
renderFooter();
if (isHome) setupHome(); else if (isCart) renderCartPage(); else renderProduct();
renderCart();
