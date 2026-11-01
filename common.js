/* Shared code used by the home page and the product page. */

const CURRENCY = "₹";
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const money = (n) => CURRENCY + Number(n).toLocaleString("en-IN");
const discountOf = (p) => Math.round(((p.mrp - p.price) / p.mrp) * 100);
const productUrl = (p) => "product.html?id=" + encodeURIComponent(p.id);
const categoryUrl = (c) => "index.html?cat=" + encodeURIComponent(c) + "#shop";
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

function waLink(text) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
}

function orderMessage(p) {
  return [
    "Hello " + SHOP_NAME + ", I want to buy this product:",
    "",
    p.name,
    "Code: " + p.id,
    "MRP: " + money(p.mrp),
    "Discount: " + discountOf(p) + "% off",
    "Final price: " + money(p.price),
    "",
    "Please send me the order details."
  ].join("\n");
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ================= Cart System (localStorage) ================= */
const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("sw_cart") || "[]");
    } catch {
      return [];
    }
  },
  save(items) {
    localStorage.setItem("sw_cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  },
  add(p) {
    const items = this.get();
    const existing = items.find((x) => x.id === p.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ id: p.id, qty: 1 });
    }
    this.save(items);
    this.openDrawer();
  },
  updateQty(id, qty) {
    let items = this.get();
    if (qty <= 0) {
      items = items.filter((x) => x.id !== id);
    } else {
      const match = items.find((x) => x.id === id);
      if (match) match.qty = qty;
    }
    this.save(items);
  },
  count() {
    return this.get().reduce((sum, item) => sum + item.qty, 0);
  },
  openDrawer() {
    const d = $("cartDrawer");
    if (d) d.classList.add("open");
  },
  closeDrawer() {
    const d = $("cartDrawer");
    if (d) d.classList.remove("open");
  }
};

function buildCartWhatsAppMessage() {
  const cartItems = Cart.get();
  if (!cartItems.length) return "";

  let total = 0;
  let lines = ["Hello " + SHOP_NAME + ", I would like to place an order for:\n"];

  cartItems.forEach((c, index) => {
    const p = findProduct(c.id);
    if (p) {
      const sub = p.price * c.qty;
      total += sub;
      lines.push(`${index + 1}. ${p.name} (Code: ${p.id})`);
      lines.push(`   Qty: ${c.qty} × ${money(p.price)} = ${money(sub)}`);
    }
  });

  lines.push("\nTotal Cart Amount: " + money(total));
  lines.push("Please confirm availability and share payment details.");
  return lines.join("\n");
}

function renderCartDrawer() {
  const container = $("cartItemsList");
  const totalEl = $("cartTotalAmount");
  const badgeEl = $("cartFloatingCount");
  const waBtn = $("cartCheckoutBtn");
  if (!container) return;

  const items = Cart.get();
  container.innerHTML = "";
  let total = 0;

  if (items.length === 0) {
    container.innerHTML = '<p class="cart-empty-text">Your jewellery bag is empty.</p>';
    if (totalEl) totalEl.textContent = money(0);
    if (badgeEl) badgeEl.textContent = "0";
    if (waBtn) {
      waBtn.removeAttribute("href");
      waBtn.style.opacity = "0.5";
      waBtn.style.pointerEvents = "none";
    }
    return;
  }

  items.forEach((item) => {
    const p = findProduct(item.id);
    if (!p) return;
    const subtotal = p.price * item.qty;
    total += subtotal;

    const row = el("div", "cart-row");
    row.innerHTML = `
      <div class="cart-row-info">
        <p class="cart-row-title">${p.name}</p>
        <p class="cart-row-price">${money(p.price)}</p>
      </div>
      <div class="cart-qty-ctrl">
        <button type="button" class="qty-btn dec" data-id="${p.id}">-</button>
        <span class="qty-val">${item.qty}</span>
        <button type="button" class="qty-btn inc" data-id="${p.id}">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  if (totalEl) totalEl.textContent = money(total);
  if (badgeEl) badgeEl.textContent = String(Cart.count());
  if (waBtn) {
    waBtn.href = waLink(buildCartWhatsAppMessage());
    waBtn.style.opacity = "1";
    waBtn.style.pointerEvents = "auto";
  }

  container.querySelectorAll(".qty-btn.dec").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.id;
      const current = Cart.get().find((x) => x.id === id);
      if (current) Cart.updateQty(id, current.qty - 1);
    };
  });
  container.querySelectorAll(".qty-btn.inc").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.id;
      const current = Cart.get().find((x) => x.id === id);
      if (current) Cart.updateQty(id, current.qty + 1);
    };
  });
}

/* ================= Image Lightbox Modal ================= */
function openLightbox(src, alt) {
  let box = $("imgLightbox");
  if (!box) {
    box = el("div", "lightbox-modal");
    box.id = "imgLightbox";
    box.innerHTML = `
      <button class="lightbox-close" aria-label="Close zoomed photo">&times;</button>
      <img class="lightbox-img" src="" alt="">
    `;
    document.body.appendChild(box);
    box.querySelector(".lightbox-close").onclick = () => box.classList.remove("active");
    box.onclick = (e) => {
      if (e.target === box) box.classList.remove("active");
    };
  }
  const img = box.querySelector(".lightbox-img");
  img.src = src;
  img.alt = alt || "Enlarged view";
  box.classList.add("active");
}

/* ---------- Pictures ---------- */
function placeholder(variant) {
  const bg = ["#EFEBE0", "#E6EFEA", "#F3E6EA"][variant % 3];
  const shapes = [
    '<circle cx="200" cy="190" r="78" fill="none" stroke="#C9962B" stroke-width="16"/><circle cx="200" cy="112" r="13" fill="#C9962B"/>',
    '<path d="M200 120C150 170 150 235 200 285C250 235 250 170 200 120Z" fill="#C9962B"/><circle cx="200" cy="205" r="18" fill="#fff"/>',
    '<circle cx="145" cy="185" r="42" fill="none" stroke="#C9962B" stroke-width="12"/><circle cx="255" cy="185" r="42" fill="none" stroke="#C9962B" stroke-width="12"/><circle cx="145" cy="250" r="11" fill="#C9962B"/><circle cx="255" cy="250" r="11" fill="#C9962B"/>'
  ][variant % 3];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="' + bg + '"/>' +
    shapes +
    '<text x="200" y="350" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#8A6410">Photo coming soon</text></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const hasPhotos = (p) => Array.isArray(p.images) && p.images.length > 0;
const productImages = (p) => (hasPhotos(p) ? p.images : [0, 1, 2].map(placeholder));

/* ---------- Photo slider ---------- */
const photoSliders = [];
let lastScrollAt = 0;
window.addEventListener("scroll", () => { lastScrollAt = Date.now(); }, { passive: true });

function createPhotoSlider(images, altBase, opts) {
  opts = opts || {};
  const n = images.length;
  const wrap = el("div", "pslider" + (opts.big ? " big" : ""));
  const track = el("div", "ptrack");

  images.forEach((src, i) => {
    const im = document.createElement("img");
    im.src = src;
    im.alt = altBase + " - photo " + (i + 1);
    im.width = 400;
    im.height = 400;
    im.decoding = "async";
    im.draggable = false;
    im.loading = i === 0 && opts.eager ? "eager" : "lazy";
    if (opts.big) {
      im.style.cursor = "zoom-in";
      im.onclick = () => openLightbox(src, im.alt);
    }
    track.appendChild(im);
  });
  wrap.appendChild(track);

  const api = { wrap, idx: 0, paused: false, n, onChange: null };
  let lockUntil = 0;

  const dotsBox = el("div", "pdots");
  const dots = [];
  if (n > 1) {
    images.forEach((_, i) => {
      let d;
      if (opts.big) {
        d = el("button", "dot");
        d.type = "button";
        d.setAttribute("aria-label", "Show photo " + (i + 1));
        d.addEventListener("click", () => { api.go(i); holdAutoplay(); });
      } else {
        d = el("span");
        d.setAttribute("aria-hidden", "true");
      }
      dotsBox.appendChild(d);
      dots.push(d);
    });
    wrap.appendChild(dotsBox);
  }

  function mark() {
    dots.forEach((d, i) => {
      if (opts.big) d.setAttribute("aria-current", String(i === api.idx));
      else d.classList.toggle("on", i === api.idx);
    });
    if (api.onChange) api.onChange(api.idx);
  }

  api.go = (i) => {
    api.idx = (i + n) % n;
    lockUntil = Date.now() + 700;
    track.scrollTo({ left: api.idx * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    mark();
  };

  api.next = () => api.go(api.idx + 1);

  function holdAutoplay() {
    api.paused = true;
    setTimeout(() => { api.paused = false; }, 4000);
  }

  track.addEventListener("scroll", () => {
    if (Date.now() < lockUntil) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== api.idx && i >= 0 && i < n) { api.idx = i; mark(); }
  }, { passive: true });

  wrap.addEventListener("mouseenter", () => { api.paused = true; });
  wrap.addEventListener("mouseleave", () => { api.paused = false; });
  wrap.addEventListener("touchstart", () => { api.paused = true; }, { passive: true });
  wrap.addEventListener("touchend", () => { setTimeout(() => { api.paused = false; }, 1500); }, { passive: true });

  if (opts.big && n > 1) {
    const prev = el("button", "arrow prev", "<");
    const next = el("button", "arrow next", ">");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Previous photo");
    next.setAttribute("aria-label", "Next photo");
    prev.addEventListener("click", () => { api.go(api.idx - 1); holdAutoplay(); });
    next.addEventListener("click", () => { api.go(api.idx + 1); holdAutoplay(); });
    wrap.appendChild(prev);
    wrap.appendChild(next);
  }

  api.hold = holdAutoplay;
  mark();
  if (n > 1 && !reduceMotion) photoSliders.push(api);
  return api;
}

let tickerStarted = false;
function startPhotoTicker() {
  if (tickerStarted || reduceMotion) return;
  tickerStarted = true;
  setInterval(() => {
    if (document.hidden || Date.now() - lastScrollAt < 300) return;
    let k = 0;
    for (let i = photoSliders.length - 1; i >= 0; i--) {
      const s = photoSliders[i];
      if (!s.wrap.isConnected) { photoSliders.splice(i, 1); continue; }
      if (s.paused) continue;
      const r = s.wrap.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        setTimeout(() => s.next(), k * 120);
        k++;
      }
    }
  }, PHOTO_SECONDS * 1000);
}

/* ---------- Scroll animations ---------- */
const rvObserver = ("IntersectionObserver" in window && !reduceMotion)
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const n = e.target;
        if (e.isIntersecting) {
          n.classList.remove("above", "below");
          n.classList.add("in");
        } else {
          n.classList.remove("in");
          n.classList.add(e.boundingClientRect.top < 0 ? "above" : "below");
        }
      });
    }, { threshold: 0 })
  : null;

function animateIn(node, delayMs) {
  if (!rvObserver || !node) return;
  node.classList.add("rv", "below");
  if (delayMs) node.style.setProperty("--d", delayMs + "ms");
  rvObserver.observe(node);
}

function stopAnimating(container) {
  if (!rvObserver) return;
  container.querySelectorAll(".rv").forEach((n) => rvObserver.unobserve(n));
}

function initScrollAnimations() {
  [
    ".intro h1", ".points li", ".shop h2", ".tools", ".chips",
    ".how h2", ".steps li", ".about h2", ".about p", ".faq h2",
    ".faq details", ".gallery", ".pd-info", ".similar h2", ".foot > div"
  ].forEach((sel) => {
    document.querySelectorAll(sel).forEach((n, i) => animateIn(n, (i % 4) * 70));
  });
}

/* ---------- Product card with Cart Button & Badges ---------- */
function buildProductCard(p, index) {
  const card = el("article", "card");

  const media = el("div", "media");
  const slider = createPhotoSlider(productImages(p), p.name + " - 1 gram gold plated", { eager: index < 4 });
  media.appendChild(slider.wrap);

  // Discount badge
  media.appendChild(el("span", "off", discountOf(p) + "% off"));

  // Status Badge
  if (p.badge) {
    media.appendChild(el("span", "status-badge", p.badge));
  }

  media.addEventListener("click", () => { window.location.href = productUrl(p); });
  card.appendChild(media);

  const body = el("div", "body");
  body.appendChild(el("p", "cat", p.category));
  const h3 = el("h3");
  const link = el("a", "", p.name);
  link.href = productUrl(p);
  h3.appendChild(link);
  body.appendChild(h3);
  body.appendChild(el("p", "desc", p.desc));
  body.appendChild(el("p", "code", "Code: " + p.id));

  const tag = el("div", "tag");
  tag.appendChild(el("span", "final", money(p.price)));
  const mrp = el("span", "mrp", money(p.mrp));
  mrp.setAttribute("aria-label", "MRP " + money(p.mrp));
  tag.appendChild(mrp);
  tag.appendChild(el("span", "save", "You save " + money(p.mrp - p.price)));
  body.appendChild(tag);

  const btnRow = el("div", "card-actions");
  
  const addCartBtn = el("button", "btn btn-outline btn-sm", "+ Add to Bag");
  addCartBtn.type = "button";
  addCartBtn.onclick = (e) => {
    e.stopPropagation();
    Cart.add(p);
  };
  btnRow.appendChild(addCartBtn);

  const buyNow = el("a", "btn btn-wa btn-sm", "Buy Now");
  buyNow.href = waLink(orderMessage(p));
  buyNow.target = "_blank";
  buyNow.rel = "noopener noreferrer";
  btnRow.appendChild(buyNow);

  body.appendChild(btnRow);
  card.appendChild(body);
  animateIn(card, (index % 4) * 70);
  return card;
}

/* ---------- Common Setup across pages ---------- */
function initCommon() {
  document.querySelectorAll("[data-wa-general]").forEach((a) => {
    a.href = waLink("Hello " + SHOP_NAME + ", I would like to see your jewellery collection.");
  });

  const y = $("year");
  if (y) y.textContent = new Date().getFullYear();

  const bar = $("progress");
  if (bar) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // Cart Drawer listeners
  const closeBtn = $("cartCloseBtn");
  const drawerOverlay = $("cartDrawerOverlay");
  const openCartBtn = $("openCartBtn");

  if (closeBtn) closeBtn.onclick = () => Cart.closeDrawer();
  if (drawerOverlay) drawerOverlay.onclick = () => Cart.closeDrawer();
  if (openCartBtn) openCartBtn.onclick = () => Cart.openDrawer();

  window.addEventListener("cart-updated", renderCartDrawer);
  renderCartDrawer();
}