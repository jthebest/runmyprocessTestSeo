// --------------------------------------
// Example data: minimum product list
// --------------------------------------
const productos = [
  {
    id: 1,
    nombre: "Auriculares Wave",
    precio: 59.9,
    descripcion: "Auriculares inalámbricos con cancelación de ruido."
  },
  {
    id: 2,
    nombre: "Teclado Luna",
    precio: 89.0,
    descripcion: "Teclado mecánico compacto con switches rojos."
  },
  {
    id: 3,
    nombre: "Mouse Orion",
    precio: 39.5,
    descripcion: "Mouse ergonómico de alta precisión."
  },
  {
    id: 4,
    nombre: "Monitor Vega 24”",
    precio: 139.0,
    descripcion: "Monitor IPS 1080p con baja latencia y 75Hz."
  }
];

// References to DOM elements
const $q = document.getElementById("q");
const $list = document.getElementById("list");
const $status = document.getElementById("status");
const $statusTop = document.getElementById("statusTop");

// Key used in localStorage to remember the last search term
const LAST_KEY = "ultima-busqueda";

// Restore the last saved search, if it exists
$q.value = localStorage.getItem(LAST_KEY) || "";

/**
* Normalizes text to lowercase and without accents for flexible comparison.
*/
function normalizar(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
* Displays the product list on screen.
* Also updates the accessible message (aria-live).
*/
function render(items) {
  // Clear previous content
  $list.innerHTML = "";

  if (items.length === 0) {
    // Message accessible when there are no results
    $status.textContent = "No se encontraron resultados.";
    $status.className = "status status--empty";
    $statusTop.textContent = "No se encontraron productos que coincidan con tu búsqueda.";
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((p) => {
    const article = document.createElement("article");
    article.className = "card";
    article.setAttribute("role", "listitem");
    article.setAttribute("aria-label", `${p.nombre}, precio: $${p.precio.toFixed(2)}`);

    article.innerHTML = `
      <h3>${p.nombre}</h3>
      <p class="price">$${p.precio.toFixed(2)}</p>
      <p>${p.descripcion}</p>
    `;

    frag.appendChild(article);
  });

  $list.appendChild(frag);

  // Dynamic message accessible with aria-live='polite'
  const message = `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'} encontrado${items.length === 1 ? '' : 's'}.`;
  $status.textContent = message;
  $status.className = "status status--success";
  $statusTop.textContent = message;
}

/**
* Applies the filter based on the input text
* and saves the term to localStorage.
*/
function filtrar() {
  const query = normalizar($q.value.trim());

  // Save the last search term
  localStorage.setItem(LAST_KEY, $q.value);

  if (!query) {
    render(productos);
    return;
  }

  // Filter by name + description
  const filtrados = productos.filter((p) =>
    normalizar(p.nombre + " " + p.descripcion).includes(query)
  );

  render(filtrados);
}

// Live search: runs the filter as the user types
$q.addEventListener("input", filtrar);

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
  // Focus management for accessibility
  if (e.key === 'Escape' && document.activeElement === $q) {
    $q.value = '';
    filtrar();
  }
});

// First load: show products (and apply filter if anything remains in localStorage)
filtrar();