'use strict';

/********************************************
 * CONFIGURACIÓN
 ********************************************/
const APP_CONFIG = {
  DEBOUNCE_DELAY: 250,
  STORAGE_KEY: 'catalog-search-term',
  MIN_SEARCH_LENGTH: 2
};

/********************************************
 * CACHE DOM
 ********************************************/
const DOMCache = {
  searchInput: null,
  productsContainer: null,
  emptyState: null,
  searchStatus: null,
  statusTop: null,
  productCards: []
};

let PRODUCT_ITEMS = [];

/********************************************
 * UTIL: NORMALIZAR TEXTO
 ********************************************/
function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/********************************************
 * INICIALIZAR CACHE Y MODELO
 ********************************************/
function initDOMCache() {
  DOMCache.searchInput       = document.getElementById("search-input");
  DOMCache.productsContainer = document.getElementById("products-container");
  DOMCache.emptyState        = document.getElementById("empty-state");
  DOMCache.searchStatus      = document.getElementById("search-status");
  DOMCache.statusTop         = document.getElementById("status-top");

  DOMCache.productCards = Array.from(
    DOMCache.productsContainer.querySelectorAll(".product-card")
  );
}

function buildProductItems() {
  PRODUCT_ITEMS = DOMCache.productCards.map(card => {
    const name        = card.querySelector("h3")?.textContent.trim() || "";
    const description = card.querySelector("p:not(.product-price)")?.textContent.trim() || "";
    const priceAttr   = card.dataset.price;
    const price       = Number(priceAttr || "0");

    return {
      element: card,
      name,
      description,
      price,
      searchable: normalize(name + " " + description)
    };
  });
}

/********************************************
 * FILTRO
 ********************************************/
function applyFilter(query) {
  const q = normalize(query);
  let found = 0;

  PRODUCT_ITEMS.forEach(item => {
    const match =
      !q ||
      q.length < APP_CONFIG.MIN_SEARCH_LENGTH ||
      item.searchable.includes(q);

    item.element.hidden = !match;
    if (match) found++;
  });

  DOMCache.emptyState.hidden = found > 0;

  const msg = found > 0
    ? `${found} producto(s) encontrados`
    : "No se encontraron productos.";

  DOMCache.searchStatus.textContent = msg;
  DOMCache.statusTop.textContent = msg;
}

/********************************************
 * LOCALSTORAGE
 ********************************************/
function restoreSearchValue() {
  try {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    if (saved) {
      DOMCache.searchInput.value = saved;
      // No llamamos applyFilter aquí para evitar tocar el layout antes de interacción.
    }
  } catch {}
}

function saveSearchValue(value) {
  try {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, value);
  } catch {}
}

/********************************************
 * JSON-LD DINÁMICO
 ********************************************/
function injectJSONLD() {
  const canonical =
    document.querySelector('link[rel="canonical"]')?.href ||
    window.location.href.split('#')[0].split('?')[0];

  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de Productos Electrónicos",
    "description": "Catálogo de productos electrónicos con buscador en vivo",
    "url": canonical,
    "numberOfItems": PRODUCT_ITEMS.length,
    "itemListElement": PRODUCT_ITEMS.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "description": item.description,
        "offers": {
          "@type": "Offer",
          "price": item.price.toFixed(2),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(json);

  document.head.appendChild(script);
}

function scheduleJSONLD() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(injectJSONLD);
  } else {
    setTimeout(injectJSONLD, 500);
  }
}

/********************************************
 * EVENTOS
 ********************************************/
function setupListeners() {
  const debounce = (fn, ms) => {
    let id;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
  };

  const debouncedSearch = debounce(() => {
    const value = DOMCache.searchInput.value.trim();
    saveSearchValue(value);
    applyFilter(value);
  }, APP_CONFIG.DEBOUNCE_DELAY);

  DOMCache.searchInput.addEventListener("input", debouncedSearch);

  DOMCache.searchInput.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      DOMCache.searchInput.value = "";
      saveSearchValue("");
      applyFilter("");
    }
  });
}

/********************************************
 * INICIALIZACIÓN
 ********************************************/
function init() {
  initDOMCache();
  buildProductItems();
  restoreSearchValue();
  setupListeners();
  scheduleJSONLD();
}

document.addEventListener("DOMContentLoaded", init);
