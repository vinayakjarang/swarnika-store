/* Home page: banner, search, categories, product grid. No need to edit. */

const state = { category: "All", query: "", sort: "featured" };

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter((p) => {
    const inCat = state.category === "All" || p.category === state.category;
    const text = (p.name + " " + p.category + " " + p.id + " " + p.desc).toLowerCase();
    return inCat && (!q || text.includes(q));
  });

  if (state.sort === "low") list = list.slice().sort((a, b) => a.price - b.price);
  if (state.sort === "high") list = list.slice().sort((a, b) => b.price - a.price);
  if (state.sort === "discount") list = list.slice().sort((a, b) => discountOf(b) - discountOf(a));
  return list;
}

function render() {
  const grid = $("grid");
  const list = visibleProducts();
  stopAnimating(grid);
  grid.replaceChildren();

  if (list.length === 0) {
    const empty = el("div", "empty");
    empty.appendChild(el("p", "", "We could not find a match. Message us on WhatsApp and we will show you what is available."));
    const a = el("a", "btn btn-wa", "Ask on WhatsApp");
    a.href = waLink("Hello " + SHOP_NAME + ", I am looking for: " + (state.query || state.category));
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.maxWidth = "260px";
    empty.appendChild(a);
    grid.appendChild(empty);
  } else {
    list.forEach((p, i) => grid.appendChild(buildProductCard(p, i)));
  }
  $("count").textContent = "Showing " + list.length + (list.length === 1 ? " piece" : " pieces");
}

function setCategory(c) {
  state.category = c;
  document.querySelectorAll("#chips .chip").forEach((x) => {
    x.setAttribute("aria-pressed", String(x.textContent === c));
  });
  render();
}

function renderChips() {
  const box = $("chips");
  const cats = ["All"].concat([...new Set(PRODUCTS.map((p) => p.category))]);
  cats.forEach((c) => {
    const b = el("button", "chip", c);
    b.type = "button";
    b.setAttribute("aria-pressed", String(c === state.category));
    b.addEventListener("click", () => setCategory(c));
    box.appendChild(b);
  });
}

/* --------- Offers banner ---------- */
function initSlider() {
  const track = $("track");
  const dotsBox = $("dots");
  const slider = $("slider");
  const slides = [];

  SLIDES.forEach((s) => {
    const items = s.category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === s.category);
    if (!items.length) return;
    const cheapest = items.reduce((a, b) => (b.price < a.price ? b : a));
    const maxOff = Math.max.apply(null, items.map(discountOf));
    const photo = items.find(hasPhotos);

    const slide = el("div", "slide t" + (s.theme || 1));
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");

    const text = el("div", "slide-text");
    text.appendChild(el("p", "s-title", s.title));
    text.appendChild(el("p", "s-text", s.text));

    const price = el("div", "slide-price");
    price.appendChild(el("span", "from", "Starting at"));
    price.appendChild(el("span", "s-price", money(cheapest.price)));
    price.appendChild(el("span", "s-mrp", money(cheapest.mrp)));
    price.appendChild(el("span", "s-off", "Up to " + maxOff + "% off"));
    text.appendChild(price);

    const label = s.category === "All" ? "Shop all offers" : "Shop " + s.category.toLowerCase();
    const btn = el("a", "btn btn-gold", label);
    btn.href = "#shop";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setCategory(s.category);
      $("shop").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    text.appendChild(btn);
    slide.appendChild(text);

    const art = el("div", "art" + (photo ? " photo" : ""));
    art.setAttribute("aria-hidden", "true");
    if (photo) {
      const im = document.createElement("img");
      im.src = photo.images[0];
      im.alt = "";
      im.width = 400;
      im.height = 400;
      art.appendChild(im);
    }
    slide.appendChild(art);

    track.appendChild(slide);
    slides.push(slide);
  });

  const n = slides.length;
  if (!n) { slider.hidden = true; return; }

  const dots = [];
  slides.forEach((s, i) => {
    s.setAttribute("aria-label", (i + 1) + " of " + n);
    const d = el("button", "dot");
    d.type = "button";
    d.setAttribute("aria-label", "Go to offer " + (i + 1));
    d.addEventListener("click", () => { go(i); start(); });
    dotsBox.appendChild(d);
    dots.push(d);
  });

  let idx = 0;
  let timer = null;
  let lockUntil = 0;

  function markDots() {
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === idx)));
  }

  function go(i) {
    idx = (i + n) % n;
    lockUntil = Date.now() + 700;
    track.scrollTo({ left: idx * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    markDots();
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (reduceMotion || n < 2) return;
    timer = setInterval(() => {
      if (document.hidden || Date.now() - lastScrollAt < 300) return;
      go(idx + 1);
    }, SLIDE_SECONDS * 1000);
  }

  track.addEventListener("scroll", () => {
    if (Date.now() < lockUntil) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== idx && i >= 0 && i < n) { idx = i; markDots(); }
  }, { passive: true });

  $("prev").addEventListener("click", () => { go(idx - 1); start(); });
  $("next").addEventListener("click", () => { go(idx + 1); start(); });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { go(idx - 1); start(); }
    if (e.key === "ArrowRight") { go(idx + 1); start(); }
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("touchstart", stop, { passive: true });
  slider.addEventListener("touchend", start, { passive: true });
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", start);

  window.addEventListener("resize", () => {
    track.scrollTo({ left: idx * track.clientWidth, behavior: "auto" });
  });

  markDots();
  start();
}

/* --------- Product data for Google --------- */
function addStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: SITE_URL + "/product.html?id=" + encodeURIComponent(p.id),
      item: {
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
          availability: "https://schema.org/InStock"
        }
      }
    }))
  };

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

document.addEventListener("DOMContentLoaded", () => {
  initCommon();

  $("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  initSlider();
  renderChips();
  initScrollAnimations();

  /* links like index.html?cat=Necklaces open that category */
  const wanted = new URLSearchParams(window.location.search).get("cat");
  if (wanted && PRODUCTS.some((p) => p.category === wanted)) {
    setCategory(wanted);
    $("shop").scrollIntoView();
  } else {
    render();
  }

  addStructuredData();
  startPhotoTicker();
});