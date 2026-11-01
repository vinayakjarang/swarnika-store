/* Product page: photos, price, order button, pincode checker, similar items. */

function setAttr(selector, attr, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute(attr, value);
}

function absoluteUrl(path) {
  return /^https?:/.test(path) ? path : SITE_URL + "/" + path.replace(/^\//, "");
}

function setPageMeta(p) {
  const singular = p.category.replace(/s$/, "");
  const title = p.name + " - 1 Gram Gold " + singular + " | " + SHOP_NAME;
  const desc = p.name + " in 1 gram gold plating. MRP " + money(p.mrp) + ", now " + money(p.price) +
    " (" + discountOf(p) + "% off). Order on WhatsApp.";
  const url = SITE_URL + "/product.html?id=" + encodeURIComponent(p.id);

  document.title = title;
  setAttr('meta[name="description"]', "content", desc);
  setAttr('link[rel="canonical"]', "href", url);
  setAttr('meta[property="og:title"]', "content", title);
  setAttr('meta[property="og:description"]', "content", desc);
  setAttr('meta[property="og:url"]', "content", url);
  setAttr('meta[property="product:price:amount"]', "content", p.price);
  setAttr('meta[property="product:price:currency"]', "content", "INR");

  if (hasPhotos(p)) setAttr('meta[property="og:image"]', "content", absoluteUrl(p.images[0]));
}

function renderCrumbs(p) {
  const ol = el("ol");
  const items = [
    { text: "Home", href: "index.html" },
    { text: p.category, href: categoryUrl(p.category) },
    { text: p.name }
  ];
  items.forEach((it) => {
    const li = el("li");
    if (it.href) {
      const a = el("a", "", it.text);
      a.href = it.href;
      li.appendChild(a);
    } else {
      li.textContent = it.text;
      li.setAttribute("aria-current", "page");
    }
    ol.appendChild(li);
  });
  $("crumbs").appendChild(ol);
}

function renderDetail(p) {
  const root = $("detail");
  root.replaceChildren();

  /* ----- photos ----- */
  const images = productImages(p);
  const gallery = el("div", "gallery");
  const slider = createPhotoSlider(images, p.name + " - 1 gram gold plated", { big: true, eager: true });
  gallery.appendChild(slider.wrap);

  if (images.length > 1) {
    const thumbs = el("div", "thumbs");
    const thumbBtns = images.map((src, i) => {
      const b = el("button", "thumb");
      b.type = "button";
      b.setAttribute("aria-label", "Show photo " + (i + 1));
      const im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.width = 64;
      im.height = 64;
      im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", () => { slider.go(i); slider.hold(); });
      thumbs.appendChild(b);
      return b;
    });
    slider.onChange = (idx) => thumbBtns.forEach((b, i) => b.setAttribute("aria-current", String(i === idx)));
    slider.onChange(0);
    gallery.appendChild(thumbs);
  }
  root.appendChild(gallery);

  /* ----- information ----- */
  const info = el("div", "pd-info");
  
  if (p.badge) {
    const badge = el("span", "status-badge-inline", p.badge);
    info.appendChild(badge);
  }

  const catLink = el("a", "cat-link", p.category);
  catLink.href = categoryUrl(p.category);
  info.appendChild(catLink);
  info.appendChild(el("h1", "", p.name));
  info.appendChild(el("p", "code", "Product code: " + p.id));

  const tag = el("div", "tag lg");
  tag.appendChild(el("span", "final", money(p.price)));
  tag.appendChild(el("span", "mrp", money(p.mrp)));
  tag.appendChild(el("span", "s-off", discountOf(p) + "% off"));
  tag.appendChild(el("span", "save", "You save " + money(p.mrp - p.price)));
  info.appendChild(tag);

  info.appendChild(el("p", "pd-desc", p.desc));

  // Specifications
  const specs = el("ul", "specs");
  ["Material: 1 gram gold plated", "Category: " + p.category]
    .concat(Array.isArray(p.details) ? p.details : [])
    .forEach((t) => specs.appendChild(el("li", "", t)));
  info.appendChild(specs);

  // Pincode Delivery Estimator
  const pinBox = el("div", "pincode-box");
  pinBox.innerHTML = `
    <label for="pincodeInput"><strong>Check Delivery Timeline</strong></label>
    <div class="pin-row">
      <input type="text" id="pincodeInput" placeholder="Enter 6-digit Pincode" maxlength="6" inputmode="numeric">
      <button type="button" id="pincodeCheckBtn" class="btn btn-outline">Check</button>
    </div>
    <p id="pincodeResult" class="pin-result"></p>
  `;
  info.appendChild(pinBox);

  // Action Buttons
  const actions = el("div", "pd-actions");
  
  const addBag = el("button", "btn btn-outline btn-lg", "Add to Bag");
  addBag.onclick = () => Cart.add(p);
  actions.appendChild(addBag);

  const order = el("a", "btn btn-wa btn-lg", "Buy Now via WhatsApp");
  order.href = waLink(orderMessage(p));
  order.target = "_blank";
  order.rel = "noopener noreferrer";
  actions.appendChild(order);

  info.appendChild(actions);

  const share = el("a", "btn btn-share", "Share with a friend on WhatsApp");
  share.href = "https://wa.me/?text=" + encodeURIComponent(p.name + " - " + money(p.price) + "\n" + window.location.href);
  share.target = "_blank";
  share.rel = "noopener noreferrer";
  info.appendChild(share);

  // Jewellery Care Pills
  const careBox = el("div", "care-card");
  careBox.innerHTML = `
    <h4>Jewellery Care Guide</h4>
    <ul>
      <li>Keep away from perfumes, hairspray, and body lotions.</li>
      <li>Remove before bathing, workouts, or swimming.</li>
      <li>Wipe gently with a dry cotton cloth and store in an airtight bag.</li>
    </ul>
  `;
  info.appendChild(careBox);

  const assure = el("ul", "assure");
  [
    "Direct verification & chat on WhatsApp",
    "Express courier tracking across all Indian pin codes",
    "High-grade micro gold plating for lasting shine"
  ].forEach((t) => assure.appendChild(el("li", "", t)));
  info.appendChild(assure);

  root.appendChild(info);

  // Hook up Pincode Checker logic
  setupPincodeChecker();
}

function setupPincodeChecker() {
  const btn = $("pincodeCheckBtn");
  const input = $("pincodeInput");
  const res = $("pincodeResult");
  if (!btn || !input || !res) return;

  btn.onclick = () => {
    const code = input.value.trim();
    if (!/^\d{6}$/.test(code)) {
      res.textContent = "Please enter a valid 6-digit Indian PIN code.";
      res.className = "pin-result err";
      return;
    }
    const metroPrefixes = ["11", "40", "56", "60", "70", "50"]; // Delhi, Mumbai, BLR, Chennai, Kolkata, HYD
    const isMetro = metroPrefixes.some(pre => code.startsWith(pre));
    if (isMetro) {
      res.textContent = "Fast Delivery: Estimated 3–4 business days via express air courier.";
    } else {
      res.textContent = "Standard Delivery: Estimated 5–7 business days to this location.";
    }
    res.className = "pin-result ok";
  };
}

function renderRelated(p) {
  const same = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id);
  if (same.length) {
    $("similar-title").textContent = "Similar " + p.category.toLowerCase();
    same.forEach((x, i) => $("similarGrid").appendChild(buildProductCard(x, i + 10)));
  } else {
    $("similar").hidden = true;
  }

  const byCat = {};
  PRODUCTS.filter((x) => x.category !== p.category).forEach((x) => {
    (byCat[x.category] = byCat[x.category] || []).push(x);
  });
  const lists = Object.keys(byCat).map((k) => byCat[k]);
  const picks = [];
  for (let round = 0; picks.length < 4 && lists.some((l) => l.length > round); round++) {
    lists.forEach((l) => { if (l[round] && picks.length < 4) picks.push(l[round]); });
  }
  if (picks.length) {
    picks.forEach((x, i) => $("moreGrid").appendChild(buildProductCard(x, i + 10)));
  } else {
    $("more").hidden = true;
  }

  const cats = [...new Set(PRODUCTS.map((x) => x.category))];
  const box = $("catLinks");
  cats.forEach((c) => {
    const a = el("a", "chip", c);
    a.href = categoryUrl(c);
    box.appendChild(a);
  });
}

function addSchema(p) {
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.id,
    category: p.category,
    description: p.desc,
    brand: { "@type": "Brand", name: SHOP_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: String(p.price),
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: SITE_URL + "/product.html?id=" + encodeURIComponent(p.id)
    }
  };
  if (hasPhotos(p)) product.image = p.images.map(absoluteUrl);

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: p.category, item: SITE_URL + "/index.html?cat=" + encodeURIComponent(p.category) },
      { "@type": "ListItem", position: 3, name: p.name }
    ]
  };

  [product, crumbs].forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

function renderNotFound() {
  const root = $("detail");
  root.replaceChildren();
  const box = el("div", "empty notfound");
  box.appendChild(el("p", "", "We could not find this product. It may have been removed or sold out."));
  const a = el("a", "btn btn-gold", "See all jewellery");
  a.href = "index.html#shop";
  box.appendChild(a);
  root.appendChild(box);
  $("similar").hidden = true;
  $("more").hidden = true;
  $("crumbs").hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
  initCommon();
  const id = new URLSearchParams(window.location.search).get("id");
  const p = findProduct(id);
  if (!p) { renderNotFound(); return; }

  setPageMeta(p);
  renderCrumbs(p);
  renderDetail(p);
  renderRelated(p);
  initScrollAnimations();
  addSchema(p);
  startPhotoTicker();
});