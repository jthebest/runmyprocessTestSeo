# Simple Catalog – Frontend Technical Test

This project is a small, accessible, SEO-friendly product catalog built with **vanilla JavaScript, HTML and CSS only**.  
It implements a **live search**, basic **SEO**, **Open Graph / Twitter Card tags**, **JSON-LD structured data**, and **accessibility best practices**.

The page runs **without any server** – you can open `index.html` directly in the browser.

---

## 1. How to run

1. Download or clone the project.
2. Make sure the following files are in the same folder:
   - `index.html`
   - `style.css`
   - `script.js`
3. Open `index.html` in any modern browser (Chrome, Edge, Firefox, etc.).

No build step, no bundler, and no framework are required.

---

## 2. Functional requirements

**Implemented:**

1. **At least 3 products**  
   - The catalog contains 5 sample products (name, price and description).

2. **Live search (no page reload)**  
   - The search input filters products in real-time as the user types.
   - Filtering is case-insensitive and accent-insensitive (e.g. "teclado" and "tècládo" behave the same).

3. **Accessible “no results” message**  
   - When no products match, an “empty state” message is shown:
     - Heading + explanatory text.
     - Announced through an `aria-live="polite"` region.

4. **Persist last search in `localStorage`**  
   - The last search term is stored under a key (e.g. `catalog-search-term`).
   - On reload, the input restores the previous search and re-applies the filter.

---

## 3. SEO implementation

**Meta tags:**

- `<title>` and `meta name="description">` configured.
- `link rel="canonical"` uses an **absolute URL**.
- `meta name="robots" content="index,follow">`.

**Open Graph:**

- `og:title`
- `og:description`
- `og:type`
- `og:image`
- `og:url`

**Twitter Card:**

- `twitter:card` (summary_large_image)
- `twitter:title`
- `twitter:description`
- `twitter:image`

**JSON-LD structured data:**

- Implemented dynamically in `script.js`.
- Uses **ItemList** with **Product** elements:
  - each product includes `name`, `description`, `price`, `priceCurrency` and `availability`.
- The JSON-LD is injected via a `<script type="application/ld+json">` element appended to `<head>`.
- Injection is scheduled using `requestIdleCallback` / `setTimeout` to avoid impacting performance and Lighthouse metrics.

---

## 4. Accessibility implementation

**a) Language**

- The root HTML tag uses `lang="es"` to reflect the Spanish content.

**b) Labels / hidden text**

- The search input is associated with a visually hidden `<label>` using the `sr-only` class.
- This keeps the UI clean while remaining screen-reader friendly.

**c) Keyboard navigation**

- A **“Skip to content”** link (`Saltar al contenido`) is the first focusable element.
- It becomes visible on focus and jumps directly to the `<main>` content.
- Focus styles are clearly visible to help keyboard users.

**d) Live regions**

- Two `aria-live="polite"` regions:
  - One near the header (`status-top`) for global status.
  - One near the search (`search-status`) for search results feedback.
- These are updated with messages like:
  - `"No se encontraron productos."`
  - `"<n> producto(s) encontrados"`

**e) Dark mode**

- The design uses `@media (prefers-color-scheme: dark)` to support dark mode automatically when the user’s OS/browser prefers it.

---

## 5. Technical details (JavaScript)

- All logic is in **`script.js`** and uses vanilla JavaScript.
- The products are defined in a `PRODUCTS_DATA` array.
- Cards are created and mounted using `document.createElement` and a `DocumentFragment`, to minimize layout thrashing.
- A small **debounce** helper is used on the `"input"` event to avoid doing work on every keystroke.
- The filter:
  - Normalizes text to lowercase.
  - Removes diacritics (accents) using Unicode normalization.
  - Matches against both product name and description.
- JSON-LD is generated based on the same product data used by the UI, ensuring that SEO data and visual data are always consistent.

---

## 6. Design & layout

- Responsive layout using **CSS Grid**:
  - `grid-template-columns: repeat(auto-fill, minmax(...))` to adapt cards to various screen sizes.
- Uses system fonts for performance and a minimal, clean appearance.
- Cards have a basic but readable design: name, price in highlight color, and description.

---

## 7. Lighthouse notes

- Performance, SEO and Accessibility are optimized for a lightweight, static page.
- Layout shift (CLS) is minimized:
  - The main grid has a reserved min-height.
  - Status messages and dynamic regions reserve vertical space.
- JavaScript is intentionally **not minified** in this repository to keep it readable for code review.  
  In a real production setup, the script would be minified and bundled in a build step (Webpack, esbuild, etc.).

---

## 8. Files

- `index.html` – main page, SEO tags, accessibility structure.
- `style.css` – responsive layout, theme, dark mode, focus styles.
- `script.js` – data, live search, localStorage, JSON-LD, accessibility logic.
