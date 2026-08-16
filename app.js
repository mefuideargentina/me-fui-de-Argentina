const SUPABASE_URL = "https://xagsdvhibdgfmotiomoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_dipmh2_QaDQ-fZ69o_C3hQ_KaarUTlv";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const listings = [
  {category:"vivienda",title:"Habitación en Malasaña",city:"Madrid",location:"Madrid · Centro",price:"450 €/mes",description:"Habitación luminosa en piso compartido. Gastos incluidos.",age:"Hace 1 h"},
  {category:"trabajo",title:"Buscamos camarero/a",city:"Barcelona",location:"Barcelona · Eixample",price:"Media jornada",description:"Para bar argentino. Buena onda y experiencia.",age:"Hace 2 h"},
  {category:"eventos",title:"Asado argentino en la playa",city:"Valencia",location:"Valencia",price:"Sábado 15:00",description:"Este sábado a las 15:00 hs. Traé tu reposera.",age:"Hace 3 h"},
  {category:"compraventa",title:"Vendo bicicleta urbana",city:"Sevilla",location:"Sevilla",price:"120 €",description:"Excelente estado, muy poco uso.",age:"Hace 5 h"},
  {category:"vivienda",title:"Busco habitación",city:"Málaga",location:"Málaga",price:"Hasta 550 €",description:"Trabajo estable. Busco zona bien conectada.",age:"Hace 1 día"},
  {category:"trabajo",title:"Administrativo/a junior",city:"Alicante",location:"Alicante",price:"Jornada completa",description:"Excel y tareas administrativas generales.",age:"Hace 1 día"}
];

let currentFilter = "todos";
let currentCity = "todas";

const labels = {
  vivienda:"VIVIENDA",
  trabajo:"TRABAJO",
  eventos:"EVENTOS",
  compraventa:"COMPRA / VENTA"
};

function safe(s=""){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

let supabaseListings = [];

async function loadApprovedListings(){
    const { data, error } = await supabaseClient
        .from("anuncios")
        .select("*")
        .eq("estado", "aprobado")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando anuncios:", error);
        return;
    }

   supabaseListings = data.map(x => ({
    category: x.categoria,
    title: x.titulo,
    city: x.ciudad,
    location: x.ciudad,
    price: x.precio,
    description: x.descripcion,
    contact: x.contacto,
    images: x.imagen_url ? JSON.parse(x.imagen_url) : [],
    age: "Publicado recientemente",
    featured: x.destacado === true && x.destacado_hasta && new Date(x.destacado_hasta) > new Date(),
    featuredUntil: x.destacado_hasta
}));

supabaseListings.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
});

    render();
}

function getAll(){
return supabaseListings;
}

function render(){
  const grid = document.getElementById("listingGrid");
  const data = getAll().filter(x=>{
    const cat = currentFilter==="todos" || x.category===currentFilter;
    const city = currentCity==="todas" || x.city===currentCity;
    return cat && city;
  });

  if(!data.length){
    grid.innerHTML = `<div class="empty">No hay publicaciones para este filtro todavía.</div>`;
    return;
  }

  grid.innerHTML = data.map(x=>`
   <article class="listing-card ${x.featured ? "featured-card" : ""}">
    ${x.images && x.images.length ? `
  <div class="listing-images">
    ${x.images.map(img => `
      <img
  src="${safe(img)}"
  alt="${safe(x.title)}"
  onclick="openImage('${safe(img)}')"
>
    `).join("")}
  </div>
` : ""}
      <div class="meta">
  <div>
    ${x.featured ? `<span class="featured-badge">⭐ DESTACADO</span>` : ""}
    <span class="badge">${labels[x.category] || "PUBLICACIÓN"}</span>
  </div>

  <span class="age">${safe(x.age)}</span>
</div>
      <h3>${safe(x.title)}</h3>
      <p>${safe(x.description)}</p>
      <div class="bottom">
        <span>📍 ${safe(x.location)}</span>
        <strong>${x.price ? `${safe(x.price)} €` : "Consultar"}</strong>
      </div>
      <div class="contacto">
  ${renderContact(x.contact)}
</div>
    </article>
  `).join("");
}

document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===currentFilter));
    render();
    if(btn.classList.contains("category")){
      document.querySelector(".recent").scrollIntoView({behavior:"smooth"});
    }
  });
});

document.getElementById("citySelect").addEventListener("change",e=>{
  currentCity=e.target.value;
  render();
});

document.getElementById("publishForm").addEventListener("submit", async e => {
  e.preventDefault();

  const ciudad = document.getElementById("location").value.trim();

  const files = Array.from(document.getElementById("images").files);

if (files.length > 3) {
  document.getElementById("formStatus").textContent =
    "❌ Podés subir como máximo 3 fotos.";
  return;
}

const imageUrls = [];

for (const file of files) {

  if (file.size > 1024 * 1024) {
    document.getElementById("formStatus").textContent =
      "❌ Cada foto debe pesar menos de 1 MB.";
    return;
  }

  const extension = file.name.split(".").pop();
  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("anuncios")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    document.getElementById("formStatus").textContent =
      "❌ No se pudieron subir las fotos.";
    return;
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from("anuncios")
    .getPublicUrl(fileName);

  imageUrls.push(publicUrlData.publicUrl);
}

const anuncio = {
  categoria: document.getElementById("category").value,
  titulo: document.getElementById("title").value.trim(),
  descripcion: document.getElementById("description").value.trim(),
  ciudad: ciudad,
  precio: document.getElementById("price").value.trim(),
  contacto: document.getElementById("contact").value.trim(),
  imagen_url: imageUrls.length ? JSON.stringify(imageUrls) : null,
  estado: "pendiente"
};

  document.getElementById("formStatus").textContent = "Publicando...";

  const { error } = await supabaseClient
    .from("anuncios")
    .insert([anuncio]);

  if (error) {
    console.error(error);
    document.getElementById("formStatus").textContent =
      "❌ No se pudo publicar. Probá de nuevo.";
    return;
  }

  e.target.reset();

  document.getElementById("formStatus").textContent =
    "✅ Anuncio enviado. Quedó pendiente de aprobación.";
});


render();


let communityGroups = [];

async function loadCommunityGroups() {
  const { data, error } = await supabaseClient
    .from("grupos")
    .select("*")
    .eq("estado", "aprobado")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error cargando grupos:", error);
    return;
  }

  communityGroups = data.map(g => ({
    name: g.nombre,
    category: g.categoria,
    icon: getGroupIcon(g.categoria, g.nombre),
    description: g.descripcion,
    url: g.enlace,
    city: g.ciudad
  }));

  renderGroups();
}

function getGroupIcon(category, name) {
  const groupName = (name || "").toLowerCase();

  if (groupName.includes("volley") || groupName.includes("voley")) {
    return "🏐";
  }

  if (groupName.includes("futbol") || groupName.includes("fulbito")) {
    return "⚽";
  }

  const icons = {
    trabajo: "💼",
    vivienda: "🏠",
    general: "🇦🇷",
    servicios: "📢",
    compraventa: "🛒",
    social: "🧉",
    deportes: "⚽"
  };

  return icons[category] || "💬";
}
let groupFilter = "todos";

function renderGroups(){
  const directory = document.getElementById("groupDirectory");
  if(!directory) return;
  const city = document.getElementById("groupCity").value;

  if(city === "proximamente"){
    directory.innerHTML = `<div class="empty">Estamos empezando por Valencia 🇦🇷🇪🇸<br><br>Madrid, Barcelona, Málaga, Alicante y otras ciudades se irán sumando.</div>`;
    return;
  }

  const groups = communityGroups.filter(g =>
  g.city === city &&
  (groupFilter === "todos" || g.category === groupFilter)
);
  directory.innerHTML = groups.map(g => `
    <a href="#" class="group-card" onclick="return openCommunityGroup(event,'${g.url}')">
      <span>${g.icon}</span>
      <div>
        <strong>${safe(g.name)}</strong>
        <small>${safe(g.description)}</small>
      </div>
      <span class="join">UNIRME →</span>
    </a>
  `).join("");
}

function openCommunityGroup(e,url){
  e.preventDefault();
  window.open(url,"_blank","noopener");
  return false;
}

document.querySelectorAll(".group-filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    groupFilter = btn.dataset.groupFilter;
    document.querySelectorAll(".group-filter").forEach(x=>x.classList.toggle("active",x===btn));
    renderGroups();
  });
});

document.getElementById("groupCity").addEventListener("change",renderGroups);
function renderContact(contact){
  if(!contact) return "📩 Contacto: No especificado";

  const c = contact.trim();

  if(c.startsWith("@")){
    const user = c.substring(1);
    return `📸 <a href="https://instagram.com/${safe(user)}" target="_blank" rel="noopener">Contactar por Instagram</a>`;
  }

  if(c.includes("@") && c.includes(".")){
    return `✉️ <a href="mailto:${safe(c)}">Enviar email</a>`;
  }

  const digits = c.replace(/\D/g,"");

  if(digits.length >= 9){
    return `💬 <a href="https://wa.me/${digits}" target="_blank" rel="noopener">Contactar por WhatsApp</a>`;
  }

  if(c.startsWith("http://") || c.startsWith("https://")){
    return `🔗 <a href="${safe(c)}" target="_blank" rel="noopener">Abrir contacto</a>`;
  }

  return `📩 Contacto: ${safe(c)}`;
}

function openImage(url){
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";

  viewer.innerHTML = `
    <div class="image-viewer-bg" onclick="this.parentElement.remove()"></div>
    <img src="${url}" alt="Imagen ampliada">
  `;

  document.body.appendChild(viewer);
}
renderGroups();
loadApprovedListings();
loadCommunityGroups();
