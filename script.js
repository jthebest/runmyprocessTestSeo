// Products data - Spanish content
const products = [
  {
    id: 1,
    name: "Auriculares Wave",
    price: 59.9,
    description: "Auriculares inalámbricos con cancelación de ruido.",
    category: "Audio"
  },
  {
    id: 2,
    name: "Teclado Luna",
    price: 89.0,
    description: "Teclado mecánico compacto con switches rojos.",
    category: "Periféricos"
  },
  {
    id: 3,
    name: "Mouse Orion",
    price: 39.5,
    description: "Mouse ergonómico de alta precisión.",
    category: "Periféricos"
  },
  {
    id: 4,
    name: "Monitor Vega 24”",
    price: 139.0,
    description: "Monitor IPS 1080p con baja latencia y 75Hz.",
    category: "Monitores"
  }
];

// DOM elements
const searchInput = document.getElementById('search-input');
const productsList = document.getElementById('products-list');
const searchStatus = document.getElementById('search-status');
const statusTop = document.getElementById('statusTop');

// Configuration
const CONFIG = {
  STORAGE_KEY: 'last-search',
  DEBOUNCE_DELAY: 300
};

// Normalize text for search
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

// Filter products based on search query
function filterProducts(query) {
  if (!query || query.length < 2) {
    return [...products];
  }

  const normalizedQuery = normalizeText(query);
  
  return products.filter(product => {
    const searchText = normalizeText(
      `${product.name} ${product.description} ${product.category}`
    );
    return searchText.includes(normalizedQuery);
  });
}

// Create product card
function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('aria-labelledby', `product-${product.id}-title`);

  article.innerHTML = `
    <h3 id="product-${product.id}-title">${product.name}</h3>
    <p class="price">$${product.price.toFixed(2)}</p>
    <p>${product.description}</p>
  `;

  return article;
}

// Render products list
function renderProducts(filteredProducts) {
  productsList.innerHTML = '';

  if (filteredProducts.length === 0) {
    productsList.innerHTML = `
      <div class="empty-state">
        <h3>No se encontraron productos</h3>
        <p>Intenta con otros términos de búsqueda o revisa la ortografía.</p>
      </div>
    `;
    
    const emptyMessage = "No se encontraron productos que coincidan con tu búsqueda.";
    searchStatus.textContent = emptyMessage;
    searchStatus.className = "status status--empty";
    statusTop.textContent = emptyMessage;
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    fragment.appendChild(card);
  });

  productsList.appendChild(fragment);

  // Update status messages
  const message = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}`;
  searchStatus.textContent = message;
  searchStatus.className = "status status--success";
  statusTop.textContent = message;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Main filter function
const filterProductsHandler = debounce(function() {
  const query = searchInput.value.trim();
  
  // Save search term
  localStorage.setItem(CONFIG.STORAGE_KEY, query);

  // Filter and render
  const filtered = filterProducts(query);
  renderProducts(filtered);
}, CONFIG.DEBOUNCE_DELAY);

// Clear search
function clearSearch() {
  searchInput.value = '';
  localStorage.setItem(CONFIG.STORAGE_KEY, '');
  renderProducts(products);
}

// Initialize app
function init() {
  // Restore last search
  const lastSearch = localStorage.getItem(CONFIG.STORAGE_KEY) || '';
  searchInput.value = lastSearch;

  // Event listeners
  searchInput.addEventListener('input', filterProductsHandler);
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      clearSearch();
      searchInput.blur();
    }
  });

  // Initial render
  if (lastSearch) {
    filterProductsHandler();
  } else {
    renderProducts(products);
  }
}

// Start application
document.addEventListener('DOMContentLoaded', init);