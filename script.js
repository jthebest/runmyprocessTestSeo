'use strict';

// Datos mínimos
const products = [
  {id:1,name:"Auriculares Wave",price:59.9,desc:"Auriculares inalámbricos con cancelación de ruido."},
  {id:2,name:"Teclado Luna",price:89,desc:"Teclado mecánico compacto con switches rojos."},
  {id:3,name:"Mouse Orion",price:39.5,desc:"Mouse ergonómico de alta precisión."},
  {id:4,name:"Monitor Zenith 24\"",price:149.99,desc:"Monitor Full HD con tecnología IPS."},
  {id:5,name:"Disco Duro Externo 1TB",price:64.75,desc:"Disco duro portátil con conexión USB 3.0."},
  {id:6,name:"Cámara Web Crystal",price:79.9,desc:"Cámara web HD con micrófono integrado."}
];

// Cache DOM
let s,p,st,stt,e;

// JSON-LD
const ld=document.createElement('script');
ld.type='application/ld+json';
ld.textContent=JSON.stringify({
  "@context":"https://schema.org",
  "@type":"ItemList",
  name:"Catálogo de Productos",
  description:"Catálogo de productos electrónicos",
  url:location.href,
  numberOfItems:3,
  itemListElement:products.map((p,i)=>({
    "@type":"ListItem",
    position:i+1,
    item:{
      "@type":"Product",
      name:p.name,
      description:p.desc,
      offers:{
        "@type":"Offer",
        price:p.price.toFixed(2),
        priceCurrency:"USD",
        availability:"https://schema.org/InStock"
      }
    }
  }))
});
document.head.appendChild(ld);

// Normalizar texto
const n=t=>t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();

// Filtrar productos
const f=q=>!q||q.length<2?products:products.filter(p=>n(p.name+p.desc).includes(n(q)));

// Crear tarjeta
const c=p=>{
  const a=document.createElement('article');
  a.className='product-card';
  a.innerHTML=`<h3>${p.name}</h3><p class="price">$${p.price.toFixed(2)}</p><p>${p.desc}</p>`;
  return a;
};

// Renderizar
const r=ps=>{
  p.querySelectorAll('.product-card').forEach(el=>el.remove());
  if(ps.length===0){
    e.hidden=false;
    const m="No se encontraron productos.";
    st.textContent=stt.textContent=m;
  }else{
    e.hidden=true;
    const f=document.createDocumentFragment();
    ps.forEach(pr=>f.appendChild(c(pr)));
    p.appendChild(f);
    const m=`${ps.length} producto${ps.length===1?'':'s'} encontrado${ps.length===1?'':'s'}`;
    st.textContent=stt.textContent=m;
  }
};

// Debounce
const d=(f,w)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),w)}};

// Manejador
const h=d(()=>{
  const q=s.value.trim();
  try{localStorage.setItem('ls',q)}catch{}
  r(f(q));
},300);

// Inicializar
const i=()=>{
  s=document.getElementById('search');
  p=document.getElementById('products');
  st=document.getElementById('search-status');
  stt=document.getElementById('status-top');
  e=document.getElementById('empty-state');
  
  try{s.value=localStorage.getItem('ls')||''}catch{}
  s.addEventListener('input',h);
  s.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){
      s.value='';
      try{localStorage.setItem('ls','')}catch{}
      r(products);
      s.blur();
    }
  });
  r(f(s.value));
};

// Inicio
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',i);
else i();