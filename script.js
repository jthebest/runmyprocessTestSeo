'use strict';

/**
 * CONFIGURACIÓN DE LA APLICACIÓN
 * Centralizada para fácil mantenimiento y optimización
 */
const APP_CONFIG = {
    DEBOUNCE_DELAY: 250, // Reducido para mejor respuesta
    STORAGE_KEY: 'catalog-search-term',
    MIN_SEARCH_LENGTH: 2,
    PRODUCTS_PER_PAGE: 12 // Para futura paginación
};

/**
 * DATOS DE PRODUCTOS
 * Estructura clara y completa para mejor mantenibilidad
 */
const PRODUCTS_DATA = [
    { 
        id: 1, 
        name: "Auriculares Wave", 
        price: 59.9, 
        description: "Auriculares inalámbricos con cancelación de ruido." 
    },
    { 
        id: 2, 
        name: "Teclado Luna", 
        price: 89.0, 
        description: "Teclado mecánico compacto con switches rojos." 
    },
    { 
        id: 3, 
        name: "Mouse Orion", 
        price: 39.5, 
        description: "Mouse ergonómico de alta precisión." 
    },
    { 
        id: 4, 
        name: "Monitor Eclipse", 
        price: 199.99, 
        description: "Monitor 24\" Full HD con tecnología IPS." 
    },
    { 
        id: 5, 
        name: "Altavoces Nova", 
        price: 79.49, 
        description: "Sistema de altavoces 2.1 con sonido envolvente." 
    }
];

/**
 * CACHE DE ELEMENTOS DOM
 * Referencias globales para mejor performance
 */
const DOMCache = {
    searchInput: null,
    productsContainer: null,
    searchStatus: null,
    statusTop: null,
    emptyState: null
};

/**
 * CONFIGURAR URLs DINÁMICAS
 * Optimizado para SEO y diferentes entornos
 * @returns {string} URL actual sin parámetros
 */
function configureDynamicURLs() {
    const currentURL = window.location.href.split('?')[0];
    
    // Actualizar URLs importantes para SEO
    const canonicalElement = document.querySelector('link[rel="canonical"]');
    const ogUrlElement = document.querySelector('meta[property="og:url"]');
    
    if (canonicalElement) canonicalElement.href = currentURL;
    if (ogUrlElement) ogUrlElement.content = currentURL;
    
    return currentURL;
}

/**
 * INYECTAR DATOS ESTRUCTURADOS
 * JSON-LD para SEO, ejecutado después de la carga crítica
 */
function injectStructuredData() {
    // Usar requestIdleCallback para no bloquear el hilo principal
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            createStructuredDataScript();
        });
    } else {
        // Fallback para navegadores que no soportan requestIdleCallback
        setTimeout(createStructuredDataScript, 1000);
    }
}

/**
 * CREAR SCRIPT DE DATOS ESTRUCTURADOS
 * Función separada para mejor organización
 */
function createStructuredDataScript() {
    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/ld+json';
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Catálogo de Productos Electrónicos",
        "description": "Catálogo de productos electrónicos con buscador en vivo",
        "url": configureDynamicURLs(),
        "numberOfItems": PRODUCTS_DATA.length,
        "itemListElement": PRODUCTS_DATA.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "offers": {
                    "@type": "Offer",
                    "price": product.price.toFixed(2),
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                }
            }
        }))
    };
    
    scriptElement.textContent = JSON.stringify(structuredData);
    document.head.appendChild(scriptElement);
}

/**
 * NORMALIZAR TEXTO DE BÚSQUEDA
 * Optimizado para performance
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeSearchText(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * FILTRAR PRODUCTOS
 * Algoritmo optimizado para búsquedas rápidas
 * @param {string} query - Término de búsqueda
 * @returns {Array} Productos filtrados
 */
function filterProducts(query) {
    if (!query || query.length < APP_CONFIG.MIN_SEARCH_LENGTH) {
        return PRODUCTS_DATA;
    }
    
    const normalizedQuery = normalizeSearchText(query);
    
    return PRODUCTS_DATA.filter(product => {
        const searchableText = normalizeSearchText(
            `${product.name} ${product.description}`
        );
        return searchableText.includes(normalizedQuery);
    });
}

/**
 * CREAR ELEMENTO DE PRODUCTO
 * Usando createElement para mejor performance que innerHTML
 * @param {Object} product - Datos del producto
 * @returns {HTMLElement} Elemento del producto
 */
function createProductElement(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.setAttribute('data-product-id', product.id);
    
    const title = document.createElement('h3');
    title.textContent = product.name;
    
    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `$${product.price.toFixed(2)}`;
    
    const description = document.createElement('p');
    description.textContent = product.description;
    
    article.appendChild(title);
    article.appendChild(price);
    article.appendChild(description);
    
    return article;
}

/**
 * RENDERIZAR PRODUCTOS
 * Optimizado para mínimo reflow y repaint
 * @param {Array} products - Productos a mostrar
 */
function renderProducts(products) {
    const { productsContainer, emptyState, searchStatus, statusTop } = DOMCache;
    
    // Limpiar productos existentes de forma eficiente
    const existingProducts = productsContainer.querySelectorAll('.product-card');
    if (existingProducts.length > 0) {
        existingProducts.forEach(product => product.remove());
    }
    
    if (products.length === 0) {
        // Mostrar estado vacío
        emptyState.hidden = false;
        const message = "No se encontraron productos que coincidan con tu búsqueda.";
        searchStatus.textContent = message;
        statusTop.textContent = message;
        return;
    }
    
    // Ocultar estado vacío
    emptyState.hidden = true;
    
    // Usar DocumentFragment para inserción batch
    const fragment = document.createDocumentFragment();
    products.forEach(product => {
        fragment.appendChild(createProductElement(product));
    });
    
    // Una sola operación DOM
    productsContainer.appendChild(fragment);
    
    // Actualizar mensajes de estado
    const productCount = products.length;
    const message = `${productCount} ${productCount === 1 ? 'producto encontrado' : 'productos encontrados'}`;
    searchStatus.textContent = message;
    statusTop.textContent = message;
}

/**
 * FUNCIÓN DEBOUNCE OPTIMIZADA
 * @param {Function} callback - Función a ejecutar
 * @param {number} delay - Tiempo de espera
 * @returns {Function} Función debounced
 */
function createDebouncedFunction(callback, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
}

/**
 * MANEJAR BÚSQUEDA
 * Procesa la entrada del usuario y actualiza la interfaz
 */
function handleSearch() {
    const query = DOMCache.searchInput.value.trim();
    
    // Persistir en localStorage de forma segura
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, query);
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
    
    const filteredProducts = filterProducts(query);
    renderProducts(filteredProducts);
}

/**
 * LIMPIAR BÚSQUEDA
 * Restablece el estado de búsqueda
 */
function clearSearch() {
    DOMCache.searchInput.value = '';
    
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, '');
    } catch (error) {
        console.warn('No se pudo limpiar localStorage:', error);
    }
    
    renderProducts(PRODUCTS_DATA);
    DOMCache.searchInput.blur();
}

/**
 * MANEJAR EVENTOS DE TECLADO
 * Para accesibilidad y shortcuts
 * @param {KeyboardEvent} event - Evento de teclado
 */
function handleKeyboardEvents(event) {
    if (event.key === 'Escape' && document.activeElement === DOMCache.searchInput) {
        event.preventDefault();
        clearSearch();
    }
}

/**
 * INICIALIZAR CACHE DOM
 * Obtiene y valida todos los elementos necesarios
 * @returns {boolean} True si todos los elementos existen
 */
function initializeDOMCache() {
    DOMCache.searchInput = document.getElementById('search-input');
    DOMCache.productsContainer = document.getElementById('products-container');
    DOMCache.searchStatus = document.getElementById('search-status');
    DOMCache.statusTop = document.getElementById('status-top');
    DOMCache.emptyState = document.getElementById('empty-state');
    
    // Validar que todos los elementos críticos existen
    const requiredElements = [
        'searchInput', 
        'productsContainer', 
        'emptyState'
    ];
    
    const missingElements = requiredElements.filter(key => !DOMCache[key]);
    
    if (missingElements.length > 0) {
        console.error('Elementos DOM críticos faltantes:', missingElements);
        return false;
    }
    
    return true;
}

/**
 * CONFIGURAR EVENT LISTENERS
 * Establece todas las interacciones de usuario
 */
function setupEventListeners() {
    const debouncedSearchHandler = createDebouncedFunction(
        handleSearch, 
        APP_CONFIG.DEBOUNCE_DELAY
    );
    
    DOMCache.searchInput.addEventListener('input', debouncedSearchHandler);
    DOMCache.searchInput.addEventListener('keydown', handleKeyboardEvents);
}

/**
 * RESTAURAR ESTADO PREVIO
 * Carga el término de búsqueda desde localStorage
 */
function restorePreviousState() {
    try {
        const previousSearch = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
        if (previousSearch) {
            DOMCache.searchInput.value = previousSearch;
        }
    } catch (error) {
        console.warn('No se pudo restaurar desde localStorage:', error);
    }
}

/**
 * INICIALIZAR APLICACIÓN
 * Punto de entrada principal después de que el DOM esté listo
 */
function initializeApplication() {
    // Inicializar cache DOM
    if (!initializeDOMCache()) {
        return;
    }
    
    // Configurar estado inicial
    restorePreviousState();
    setupEventListeners();
    
    // Renderizar productos iniciales
    const initialProducts = filterProducts(DOMCache.searchInput.value);
    renderProducts(initialProducts);
    
    // Inyectar datos estructurados después de la carga crítica
    injectStructuredData();
}

/**
 * INICIAR APLICACIÓN
 * Maneja el inicio seguro de la aplicación
 */
function startApplication() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApplication);
    } else {
        // DOM ya está listo, inicializar inmediatamente
        initializeApplication();
    }
}

// Iniciar la aplicación
startApplication();