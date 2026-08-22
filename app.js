const SUPABASE_URL = "https://xagsdvhibdgfmotiomoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_dipmh2_QaDQ-fZ69o_C3hQ_KaarUTlv";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

function icon(name, className = "ui-icon") {
  const safeName = String(name || "chat").replace(/[^a-z-]/g, "");
  const safeClass = String(className).replace(/[^a-z0-9-_ ]/gi, "");
  return `<svg class="${safeClass}" aria-hidden="true" focusable="false"><use href="#icon-${safeName}"></use></svg>`;
}

function parseListingImages(value) {
  if (!value) return [];
  try {
    const images = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(images) ? images.filter(image => typeof image === "string") : [];
  } catch (error) {
    console.warn("Una publicación tiene imágenes con formato no válido.", error);
    return [];
  }
}

function formatListingAge(createdAt) {
  if (!createdAt) return "Publicado recientemente";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Publicado recientemente";
  const elapsedHours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3600000));
  if (elapsedHours < 1) return "Hace menos de 1 h";
  if (elapsedHours < 24) return `Hace ${elapsedHours} h`;
  const days = Math.floor(elapsedHours / 24);
  return days === 1 ? "Hace 1 día" : `Hace ${days} días`;
}

const categoryIcons = {
  vivienda: "home",
  trabajo: "work",
  eventos: "calendar",
  compraventa: "shop"
};

const categoryPlaceholderLabels = {
  vivienda: "ALOJAMIENTO SIN FOTO",
  trabajo: "OPORTUNIDAD LABORAL",
  eventos: "EVENTO O PLAN",
  compraventa: "PRODUCTO SIN FOTO"
};

let supabaseListings = [];

async function loadApprovedListings(){
    const { data, error } = await supabaseClient
        .from("anuncios")
        .select("*")
        .eq("estado", "aprobado")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando anuncios:", error);
        document.getElementById("listingGrid").innerHTML =
          `<div class="empty-state"><span>↻</span><h3>No pudimos cargar los anuncios</h3><p>Puede ser algo momentáneo. Probá otra vez.</p><div class="empty-actions"><button class="empty-primary" onclick="loadApprovedListings()">Reintentar</button></div></div>`;
        return;
    }

   supabaseListings = data.map(x => ({
    id: String(x.id),
    category: x.categoria,
    title: x.titulo,
    city: x.ciudad,
    location: x.ciudad,
    price: x.precio,
    description: x.descripcion,
    contact: x.contacto,
    images: parseListingImages(x.imagen_url),
    age: formatListingAge(x.created_at),
    createdAt: x.created_at,
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

function renderPrice(value){
  if(!value) return "Consultar";
  const price = String(value).trim();
  return /^\d+(?:[.,]\d+)?$/.test(price) ? `${safe(price)} €` : safe(price);
}

function render(){
  const grid = document.getElementById("listingGrid");
  const resultsCount = document.getElementById("resultsCount");
  const data = getAll().filter(x=>{
    const cat = currentFilter==="todos" || x.category===currentFilter;
    const city =
  currentCity === "todas" ||
  (x.city || "").trim().toLowerCase() === currentCity.trim().toLowerCase();
    return cat && city;
  });

  if (resultsCount) {
    resultsCount.textContent = data.length === 1 ? "1 resultado" : `${data.length} resultados`;
  }

  if(!data.length){
    const place = currentCity !== "todas" ? ` en ${safe(currentCity)}` : "";
    grid.innerHTML = `
      <div class="empty-state">
        <span>${icon("search")}</span>
        <h3>Todavía no hay publicaciones${place}</h3>
        <p>Probá viendo todas las categorías o publicá gratis para que otra persona pueda encontrarte.</p>
        <div class="empty-actions">
          <button onclick="resetListingFilters()">Ver todas</button>
          <button class="empty-primary" onclick="goToPublish()">Publicar primero</button>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = data.map(x=>`
   <article class="listing-card category-${safe(x.category)} ${x.featured ? "featured-card" : ""} ${x.images && x.images.length ? "has-images" : "no-images"}">
      <div class="meta">
  <div>
    ${x.featured ? `<span class="featured-badge">DESTACADO</span>` : ""}
    <span class="badge">${labels[x.category] || "PUBLICACIÓN"}</span>
  </div>

  <span class="age">${safe(x.age)}</span>
</div>
    ${x.images && x.images.length ? `
  <div class="listing-images">
    ${x.images.slice(0, 3).map((img, imageIndex) => `
      <img
  src="${safe(img)}"
  alt="${safe(x.title)}"
  loading="lazy"
  onclick="openListingDetail('${safe(x.id)}', ${imageIndex})"
>
    `).join("")}
  </div>
` : `<button class="listing-placeholder listing-placeholder-${safe(x.category)}" onclick="openListingDetail('${safe(x.id)}')" aria-label="Ver ${safe(x.title)}"><span>${icon(categoryIcons[x.category] || "doc")}</span><small>${categoryPlaceholderLabels[x.category] || "PUBLICACIÓN"}</small></button>`}
      <h3>${safe(x.title)}</h3>
      <p>${safe(x.description)}</p>
      <div class="bottom">
        <span>${icon("pin")} ${safe(x.location)}</span>
        <strong>${renderPrice(x.price)}</strong>
      </div>
      <div class="contacto">
  ${renderContact(x.contact)}
</div>
<div class="listing-actions">
  <button class="listing-detail-button" onclick="openListingDetail('${safe(x.id)}')">Ver publicación <span>→</span></button>
  <button class="listing-share-button" onclick="shareListing('${safe(x.id)}')" aria-label="Compartir ${safe(x.title)}">Compartir</button>
  <button class="report-button" onclick="reportListingById('${safe(x.id)}')">Reportar</button>
</div>
    </article>
  `).join("");

  openListingFromUrl();
}

function resetListingFilters(){
  currentFilter = "todos";
  currentCity = "todas";
  const citySelect = document.getElementById("citySelect");
  if(citySelect) citySelect.value = "todas";
  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === "todos");
  });
  render();
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

const publishForm = document.getElementById("publishForm");
const imageInput = document.getElementById("images");
const imagePreview = document.getElementById("imagePreview");
const publishSubmit = document.getElementById("publishSubmit");
const formStatus = document.getElementById("formStatus");
let selectedPublishImages = [];
let previewObjectUrls = [];

function clearPreviewObjectUrls() {
  previewObjectUrls.forEach(url => URL.revokeObjectURL(url));
  previewObjectUrls = [];
}

function renderImagePreview() {
  if (!imagePreview) return;
  clearPreviewObjectUrls();
  if (!selectedPublishImages.length) {
    imagePreview.innerHTML = "";
    return;
  }
  imagePreview.innerHTML = selectedPublishImages.map((file, index) => {
    const url = URL.createObjectURL(file);
    previewObjectUrls.push(url);
    return `<figure><img src="${url}" alt="Vista previa ${index + 1}"><button type="button" data-remove-image="${index}" aria-label="Quitar imagen ${index + 1}">×</button><figcaption>${index === 0 ? "Portada" : `Foto ${index + 1}`}</figcaption></figure>`;
  }).join("");
  imagePreview.querySelectorAll("[data-remove-image]").forEach(button => {
    button.addEventListener("click", () => {
      selectedPublishImages.splice(Number(button.dataset.removeImage), 1);
      renderImagePreview();
    });
  });
}

imageInput?.addEventListener("change", event => {
  const files = Array.from(event.target.files || []);
  const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (files.length > 3) {
    formStatus.textContent = "Podés seleccionar como máximo 3 fotos.";
  }
  const validFiles = files.filter(file => {
    if (!validTypes.has(file.type)) return false;
    return file.size <= 8 * 1024 * 1024;
  }).slice(0, 3);
  if (validFiles.length !== Math.min(files.length, 3)) {
    formStatus.textContent = "Alguna imagen no era compatible o superaba los 8 MB.";
  } else if (files.length <= 3) {
    formStatus.textContent = "";
  }
  selectedPublishImages = validFiles;
  renderImagePreview();
  event.target.value = "";
});

async function optimizeImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", .82));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

publishForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const ciudad = document.getElementById("location").value.trim();
  const imageUrls = [];
  publishSubmit.disabled = true;
  publishSubmit.textContent = "Preparando publicación…";
  formStatus.textContent = selectedPublishImages.length ? "Optimizando imágenes…" : "Enviando publicación…";

for (let index = 0; index < selectedPublishImages.length; index += 1) {
  let file;
  try {
    file = await optimizeImage(selectedPublishImages[index]);
  } catch (error) {
    console.error(error);
    formStatus.textContent = "No pudimos procesar una de las imágenes. Probá con otra foto.";
    publishSubmit.disabled = false;
    publishSubmit.textContent = "Enviar para revisión";
    return;
  }
  formStatus.textContent = `Subiendo imagen ${index + 1} de ${selectedPublishImages.length}…`;
  const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const fileName = `${Date.now()}-${uniqueId}.${file.type === "image/webp" ? "webp" : file.name.split(".").pop()}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("anuncios")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    formStatus.textContent = "No se pudieron subir las fotos. Probá nuevamente.";
    publishSubmit.disabled = false;
    publishSubmit.textContent = "Enviar para revisión";
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

  formStatus.textContent = "Guardando publicación…";

  const { error } = await supabaseClient
    .from("anuncios")
    .insert([anuncio]);

  if (error) {
    console.error(error);
    formStatus.textContent = "No se pudo enviar. Probá nuevamente.";
    publishSubmit.disabled = false;
    publishSubmit.textContent = "Enviar para revisión";
    return;
  }

  e.target.reset();
  selectedPublishImages = [];
  renderImagePreview();
  publishSubmit.disabled = false;
  publishSubmit.textContent = "Enviar para revisión";
  formStatus.innerHTML = "<strong>Publicación recibida.</strong><br>Quedó pendiente de revisión antes de aparecer en la web.";
});


render();


let communityGroups = [];
let communityGroupsLoaded = false;

async function loadCommunityGroups() {
  const { data, error } = await supabaseClient
    .from("grupos")
    .select("*")
    .eq("estado", "aprobado")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error cargando grupos:", error);
    document.getElementById("groupDirectory").innerHTML =
      `<div class="empty-state"><span>↻</span><h3>No pudimos cargar los grupos</h3><p>Probá nuevamente en unos minutos.</p><div class="empty-actions"><button class="empty-primary" onclick="loadCommunityGroups()">Reintentar</button></div></div>`;
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

  communityGroupsLoaded = true;

  renderGroups();
}

function getGroupIcon(category, name) {
  const groupName = (name || "").toLowerCase();

  // Vóley
  if (
    groupName.includes("volley") ||
    groupName.includes("voley") ||
    groupName.includes("vóley")
  ) {
    return "ball";
  }

  // Fútbol
  if (
    groupName.includes("futbol") ||
    groupName.includes("fútbol") ||
    groupName.includes("fulbito") ||
    groupName.includes("football")
  ) {
    return "ball";
  }

  const icons = {
    trabajo: "work",
    vivienda: "home",
    general: "people",
    servicios: "megaphone",
    compraventa: "shop",
    social: "chat",
    deportes: "ball"
  };

  return icons[category] || "chat";
}
let groupFilter = "todos";

function renderGroups(){
  const directory = document.getElementById("groupDirectory");
  if(!directory) return;
  if(!communityGroupsLoaded){
    directory.innerHTML = `<div class="empty">Cargando grupos de la comunidad…</div>`;
    return;
  }
  const city = document.getElementById("groupCity").value;

  if(city === "proximamente"){
    directory.innerHTML = `<div class="empty">Estamos empezando por Valencia 🇦🇷🇪🇸<br><br>Madrid, Barcelona, Málaga, Alicante y otras ciudades se irán sumando.</div>`;
    return;
  }

const groups = communityGroups.filter(g =>
  g.city === city &&
  (groupFilter === "todos" || g.category === groupFilter)
);
  if(!groups.length){
    directory.innerHTML = `
      <div class="empty-state">
        <span>${icon("chat")}</span>
        <h3>Todavía no hay grupos para este filtro</h3>
        <p>Podés volver a ver todos los grupos disponibles en Valencia.</p>
        <div class="empty-actions"><button class="empty-primary" onclick="resetGroupFilters()">Ver todos</button></div>
      </div>`;
    return;
  }
  directory.innerHTML = groups.map(g => `
    <a href="#" class="group-card" onclick="return openCommunityGroup(event,'${g.url}')">
      <span>${icon(g.icon)}</span>
      <div>
        <strong>${safe(g.name)}</strong>
        <small>${safe(g.description)}</small>
      </div>
      <span class="join">UNIRME →</span>
    </a>
  `).join("");
}

function resetGroupFilters(){
  groupFilter = "todos";
  document.querySelectorAll(".group-filter").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.groupFilter === "todos");
  });
  renderGroups();
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
  if(!contact) return `${icon("chat")} <span>Contacto no especificado</span>`;

  const c = contact.trim();

  if(c.startsWith("@")){
    const user = c.substring(1);
    return `${icon("chat")} <a href="https://instagram.com/${safe(user)}" target="_blank" rel="noopener">Contactar por Instagram</a>`;
  }

  if(c.includes("@") && c.includes(".")){
    return `${icon("chat")} <a href="mailto:${safe(c)}">Enviar email</a>`;
  }

  const digits = c.replace(/\D/g,"");

  if(digits.length >= 9){
    return `${icon("chat")} <a href="https://wa.me/${digits}" target="_blank" rel="noopener">Contactar por WhatsApp</a>`;
  }

  if(c.startsWith("http://") || c.startsWith("https://")){
    return `${icon("arrow")} <a href="${safe(c)}" target="_blank" rel="noopener">Abrir contacto</a>`;
  }

  return `${icon("chat")} <span>Contacto: ${safe(c)}</span>`;
}

let openedListingId = null;

function findListing(id) {
  return supabaseListings.find(listing => String(listing.id) === String(id));
}

function reportListingById(id) {
  const listing = findListing(id);
  if (listing) reportListing(listing.title);
}

function listingShareUrl(id) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("anuncio", id);
  url.hash = "anuncios";
  return url.toString();
}

function setDetailImage(index) {
  const listing = findListing(openedListingId);
  const mainImage = document.getElementById("listingDetailImage");
  if (!listing || !mainImage || !listing.images[index]) return;
  mainImage.src = listing.images[index];
  mainImage.alt = `${listing.title} · imagen ${index + 1}`;
  document.querySelectorAll(".listing-detail-thumb").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
  });
}

function openListingDetail(id, initialImage = 0) {
  const listing = findListing(id);
  if (!listing) return;

  closeListingDetail(false);
  openedListingId = String(id);
  const modal = document.createElement("div");
  modal.id = "listingDetailModal";
  modal.className = "listing-detail-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "listingDetailTitle");

  const gallery = listing.images.length
    ? `<div class="listing-detail-gallery">
        <div class="listing-detail-main"><img id="listingDetailImage" src="${safe(listing.images[initialImage] || listing.images[0])}" alt="${safe(listing.title)}"></div>
        ${listing.images.length > 1 ? `<div class="listing-detail-thumbs">${listing.images.map((image, index) => `<button type="button" class="listing-detail-thumb ${index === initialImage ? "active" : ""}" data-detail-image="${index}" aria-label="Ver imagen ${index + 1}"><img src="${safe(image)}" alt=""></button>`).join("")}</div>` : ""}
      </div>`
    : `<div class="listing-detail-placeholder listing-placeholder-${safe(listing.category)}"><span>${icon(categoryIcons[listing.category] || "doc")}</span><small>${categoryPlaceholderLabels[listing.category] || "PUBLICACIÓN"}</small></div>`;

  modal.innerHTML = `
    <button class="listing-detail-backdrop" type="button" aria-label="Cerrar publicación"></button>
    <div class="listing-detail-card category-${safe(listing.category)}">
      <button class="listing-detail-close" type="button" aria-label="Cerrar publicación">×</button>
      ${gallery}
      <div class="listing-detail-content">
        <div class="listing-detail-meta">
          <div>${listing.featured ? `<span class="featured-badge">DESTACADO</span>` : ""}<span class="badge">${labels[listing.category] || "PUBLICACIÓN"}</span></div>
          <span>${safe(listing.age)}</span>
        </div>
        <h2 id="listingDetailTitle">${safe(listing.title)}</h2>
        <div class="listing-detail-facts"><span>${icon("pin")} ${safe(listing.location)}</span><strong>${renderPrice(listing.price)}</strong></div>
        <p>${safe(listing.description)}</p>
        <div class="listing-detail-contact">${renderContact(listing.contact)}</div>
        <div class="listing-detail-safety"><strong>Antes de acordar</strong><span>Verificá identidad, condiciones y existencia. Me Fui de Argentina no recibe ni intermedia pagos.</span></div>
        <div class="listing-detail-actions">
          <button type="button" class="btn btn-blue" id="shareListingDetail">Compartir publicación</button>
          <button type="button" class="listing-detail-report" id="reportListingDetail">Reportar</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  modal.querySelector(".listing-detail-backdrop").addEventListener("click", closeListingDetail);
  modal.querySelector(".listing-detail-close").addEventListener("click", closeListingDetail);
  modal.querySelectorAll("[data-detail-image]").forEach(button => {
    button.addEventListener("click", () => setDetailImage(Number(button.dataset.detailImage)));
  });
  modal.querySelector("#shareListingDetail").addEventListener("click", () => shareListing(id));
  modal.querySelector("#reportListingDetail").addEventListener("click", () => {
    closeListingDetail();
    reportListing(listing.title);
  });

  const url = new URL(window.location.href);
  url.searchParams.set("anuncio", id);
  history.replaceState({}, "", `${url.pathname}${url.search}#anuncios`);
  modal.querySelector(".listing-detail-close").focus();
}

function closeListingDetail(updateUrl = true) {
  document.getElementById("listingDetailModal")?.remove();
  document.body.classList.remove("modal-open");
  openedListingId = null;
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.delete("anuncio");
    history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

async function shareListing(id) {
  const listing = findListing(id);
  if (!listing) return;
  const shareData = {
    title: listing.title,
    text: `${listing.title} · ${listing.location}`,
    url: listingShareUrl(id)
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    showGlobalToast("Enlace copiado");
  } catch (error) {
    if (error?.name !== "AbortError") showGlobalToast("No pudimos compartir el enlace");
  }
}

function showGlobalToast(message) {
  document.querySelector(".global-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "global-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

function openListingFromUrl() {
  const id = new URL(window.location.href).searchParams.get("anuncio");
  if (id && id !== openedListingId && findListing(id)) openListingDetail(id);
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
const chatbotButton = document.getElementById("chatbotButton");
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotClose = document.getElementById("chatbotClose");
const chatConversation = document.getElementById("chatConversation");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

if (chatbotButton && chatbotPanel) {
  chatbotButton.addEventListener("click", () => {
    chatbotPanel.classList.toggle("open");
    chatbotButton.setAttribute("aria-expanded", chatbotPanel.classList.contains("open"));
    if (chatbotPanel.classList.contains("open")) {
      window.setTimeout(() => chatInput?.focus(), 120);
    }
  });
}

if (chatbotClose && chatbotPanel) {
  chatbotClose.addEventListener("click", () => {
    chatbotPanel.classList.remove("open");
    chatbotButton?.setAttribute("aria-expanded", "false");
  });
}

function normalizeChatText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function addChatMessage(text, role = "bot", actions = []) {
  if (!chatConversation) return;
  const message = document.createElement("div");
  message.className = `chat-message ${role === "user" ? "user-message" : "bot-message"}`;

  if (role !== "user") {
    const avatar = document.createElement("span");
    avatar.className = "chat-avatar";
    avatar.textContent = "MF";
    message.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  bubble.appendChild(paragraph);

  if (actions.length) {
    const actionRow = document.createElement("div");
    actionRow.className = "chat-actions";
    actions.forEach(action => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.addEventListener("click", () => handleChatAction(action));
      actionRow.appendChild(button);
    });
    bubble.appendChild(actionRow);
  }

  message.appendChild(bubble);
  chatConversation.appendChild(message);
  chatConversation.scrollTop = chatConversation.scrollHeight;
}

function getChatReply(rawText) {
  const text = normalizeChatText(rawText);

  if (/hola|buenas|buen dia|buenas tardes|buenas noches/.test(text)) {
    return { text: "¡Buenas! Puedo orientarte con vivienda, trabajo, grupos, publicaciones, lugares argentinos y servicios en Valencia.", actions: [] };
  }
  if (/vivienda|alquiler|habitacion|piso|casa|alojamiento/.test(text)) {
    return {
      text: "Te muestro las publicaciones de vivienda. Antes de reservar, verificá identidad, condiciones y que el alojamiento exista.",
      actions: [
        { label: "Ver vivienda", type: "listings", value: "vivienda" },
        { label: "Consejos de seguridad", type: "section", value: "seguridad" }
      ]
    };
  }
  if (/trabajo|empleo|curro|oferta laboral|cv|curriculum/.test(text)) {
    return {
      text: "Podés revisar las publicaciones de trabajo disponibles. Si todavía no aparece lo tuyo, probá también el grupo de la comunidad.",
      actions: [
        { label: "Ver trabajo", type: "listings", value: "trabajo" },
        { label: "Ir a grupos", type: "groups" }
      ]
    };
  }
  if (/grupo|whatsapp|comunidad|conocer gente|amistad|futbol|voley|planes/.test(text)) {
    return {
      text: "Valencia es nuestra primera comunidad activa. Ahí podés encontrar grupos por intereses y necesidades.",
      actions: [{ label: "Ver grupos de Valencia", type: "groups" }]
    };
  }
  if (/publicar|publicacion|anuncio|vendo|ofrezco|busco compartir/.test(text)) {
    return {
      text: "Podés publicar gratis. Revisamos el anuncio antes de mostrarlo para cuidar la calidad de la comunidad.",
      actions: [{ label: "Crear publicación", type: "publish" }]
    };
  }
  if (/gestor|gestoria|abogado|psicolog|mudanza|profesional|servicio|tramite|nie|tie|inmobiliaria|agencia inmobiliaria|seguro|poliza/.test(text)) {
    return {
      text: "Estamos preparando la red profesional en Valencia. Todavía no mostramos perfiles hasta que estén listos para recibir consultas.",
      actions: [
        { label: "Ver servicios", type: "section", value: "servicios" },
        { label: "Presentar mi servicio", type: "instagram" }
      ]
    };
  }
  if (/tienda|productos argentinos|producto argentino|mate|yerba|alfajor|restaurante|cafeteria|comida argentina|empanada|parrilla|comercio latino|tienda latina/.test(text)) {
    return {
      text: "Estamos preparando un directorio de tiendas, productos, mate y gastronomía argentina en Valencia. Publicaremos lugares reales a medida que los revisemos.",
      actions: [
        { label: "Ver futuro directorio", type: "section", value: "lugares" },
        { label: "Compartir un lugar", type: "instagram" }
      ]
    };
  }
  if (/ciudad|madrid|barcelona|malaga|alicante|sevilla|bilbao|donde vivir|valencia/.test(text)) {
    return {
      text: "Si estás comparando ciudades, el test puede ayudarte a ordenar preferencias de clima, tamaño y estilo de vida.",
      actions: [{ label: "Hacer el test", type: "quiz" }]
    };
  }
  if (/estafa|segur|pago|transferencia|reserva|sospech|report/.test(text)) {
    return {
      text: "No intermediamos pagos. Nunca transfieras una reserva sin verificar a la persona, las condiciones y la existencia del alojamiento o servicio.",
      actions: [{ label: "Ver recomendaciones", type: "section", value: "seguridad" }]
    };
  }
  if (/negocio|marca|colaboracion|publicidad|destacar|patrocin/.test(text)) {
    return {
      text: "Tenemos opciones para negocios y colaboraciones, cuidando que lo destacado o patrocinado se identifique con claridad.",
      actions: [
        { label: "Ver opciones", type: "business" },
        { label: "Contactar", type: "instagram" }
      ]
    };
  }

  return {
    text: "Todavía estoy aprendiendo. Probá preguntarme por vivienda, trabajo, grupos, lugares argentinos, publicar, ciudades, seguridad o servicios profesionales.",
    actions: [
      { label: "Explorar publicaciones", type: "section", value: "anuncios" },
      { label: "Ver grupos", type: "groups" }
    ]
  };
}

function handleChatAction(action) {
  if (action.type === "listings") goToListings(action.value);
  if (action.type === "groups") goToGroups();
  if (action.type === "publish") goToPublish();
  if (action.type === "quiz") goToCityQuiz();
  if (action.type === "business") goToBusiness();
  if (action.type === "instagram") contactCollaborations();
  if (action.type === "section") {
    document.getElementById(action.value)?.scrollIntoView({ behavior: "smooth" });
    chatbotPanel?.classList.remove("open");
    chatbotButton?.setAttribute("aria-expanded", "false");
  }
}

function askChat(question) {
  const cleanQuestion = String(question || "").trim();
  if (!cleanQuestion) return;
  addChatMessage(cleanQuestion, "user");
  const reply = getChatReply(cleanQuestion);
  window.setTimeout(() => addChatMessage(reply.text, "bot", reply.actions), 240);
}

document.querySelectorAll("[data-chat-question]").forEach(button => {
  button.addEventListener("click", () => askChat(button.dataset.chatQuestion));
});

chatForm?.addEventListener("submit", event => {
  event.preventDefault();
  const question = chatInput?.value;
  if (chatInput) chatInput.value = "";
  askChat(question);
});
function goToGroups() {
  const groupsSection = document.getElementById("grupos");

  if (groupsSection) {
    groupsSection.scrollIntoView({
      behavior: "smooth"
    });
  }

  chatbotPanel.classList.remove("open");
}
function goToPublish() {
  const publishSection = document.getElementById("publicar");

  if (publishSection) {
    publishSection.scrollIntoView({
      behavior: "smooth"
    });
  }

  chatbotPanel.classList.remove("open");
}

function goToListings(category) {
  const listingsSection = document.getElementById("anuncios");

  const filterButton = document.querySelector(
    `.filter[data-filter="${category}"]`
  );

  if (filterButton) {
    filterButton.click();
  }

  if (listingsSection) {
    listingsSection.scrollIntoView({
      behavior: "smooth"
    });
  }

  chatbotPanel.classList.remove("open");
}

function showCityQuizSoon() {
  alert("🇪🇸 Muy pronto vas a poder descubrir qué ciudad de España encaja mejor con vos.");
  chatbotPanel.classList.remove("open");
}
function contactCollaborations() {
  window.open(
    "https://www.instagram.com/mefuideargentina",
    "_blank",
    "noopener"
  );

  chatbotPanel.classList.remove("open");
}
const startCityQuiz = document.getElementById("startCityQuiz");
const cityQuizStart = document.getElementById("cityQuizStart");
const cityQuizContent = document.getElementById("cityQuizContent");

const cityQuizQuestions = [
  {
    question: "¿Qué clima preferís?",
    answers: [
      { text: "☀️ Calor y mucho sol", points: { Malaga: 3, Sevilla: 3, Alicante: 2, Valencia: 2 } },
      { text: "🌤️ Clima templado", points: { Valencia: 3, Alicante: 3, Barcelona: 2, Malaga: 2 } },
      { text: "❄️ Fresco y estaciones marcadas", points: { Bilbao: 3, Madrid: 2, Barcelona: 1 } }
    ]
  },
  {
    question: "¿Qué tamaño de ciudad te gusta más?",
    answers: [
      { text: "🏙️ Grande, con de todo", points: { Madrid: 3, Barcelona: 3, Valencia: 1 } },
      { text: "🌆 Mediana y activa", points: { Valencia: 3, Malaga: 2, Alicante: 2, Bilbao: 2 } },
      { text: "🌿 Más tranquila", points: { Alicante: 3, Malaga: 2, Sevilla: 2 } }
    ]
  },
  {
    question: "¿Qué tan importante es tener mar cerca?",
    answers: [
      { text: "🌊 Imprescindible", points: { Valencia: 3, Barcelona: 3, Malaga: 3, Alicante: 3, Bilbao: 2 } },
      { text: "🙂 Me gusta, pero no es decisivo", points: { Madrid: 2, Sevilla: 2, Valencia: 2, Barcelona: 2 } },
      { text: "⛰️ Me da igual, prefiero otras cosas", points: { Madrid: 3, Bilbao: 2, Sevilla: 2 } }
    ]
  },
  {
    question: "¿Qué tan importante es gastar poco en alquiler?",
    answers: [
      { text: "💸 Muchísimo", points: { Alicante: 3, Sevilla: 3, Malaga: 2 } },
      { text: "⚖️ Busco equilibrio", points: { Valencia: 3, Malaga: 2, Bilbao: 2 } },
      { text: "💳 Puedo pagar más si la ciudad lo vale", points: { Madrid: 3, Barcelona: 3, Valencia: 1 } }
    ]
  },
  {
    question: "¿Qué ritmo de vida preferís?",
    answers: [
      { text: "⚡ Mucho movimiento", points: { Madrid: 3, Barcelona: 3 } },
      { text: "👌 Equilibrado", points: { Valencia: 3, Malaga: 2, Bilbao: 2 } },
      { text: "😌 Más tranquilo", points: { Alicante: 3, Sevilla: 2, Malaga: 2 } }
    ]
  },
  {
    question: "¿Qué priorizás más al elegir ciudad?",
    answers: [
      { text: "💼 Trabajo y oportunidades", points: { Madrid: 3, Barcelona: 3, Valencia: 2 } },
      { text: "🍻 Vida social y planes", points: { Madrid: 3, Barcelona: 3, Valencia: 2, Malaga: 2 } },
      { text: "❤️ Calidad de vida", points: { Valencia: 3, Malaga: 3, Alicante: 2, Bilbao: 2 } }
    ]
  }
];

let cityQuizCurrentQuestion = 0;

let cityQuizScores = {
  Madrid: 0,
  Barcelona: 0,
  Valencia: 0,
  Malaga: 0,
  Alicante: 0,
  Sevilla: 0,
  Bilbao: 0
};

if (startCityQuiz && cityQuizStart && cityQuizContent) {
  startCityQuiz.addEventListener("click", () => {
    cityQuizStart.style.display = "none";
    cityQuizContent.style.display = "block";

    cityQuizCurrentQuestion = 0;

    cityQuizScores = {
      Madrid: 0,
      Barcelona: 0,
      Valencia: 0,
      Malaga: 0,
      Alicante: 0,
      Sevilla: 0,
      Bilbao: 0
    };

    renderCityQuizQuestion();
  });
}

function renderCityQuizQuestion() {
  const question = cityQuizQuestions[cityQuizCurrentQuestion];

  cityQuizContent.innerHTML = `
    <div class="quiz-question">
      <span class="quiz-step">
        Pregunta ${cityQuizCurrentQuestion + 1} de ${cityQuizQuestions.length}
      </span>

      <h3>${question.question}</h3>

      <div class="quiz-answers">
        ${question.answers.map((answer, index) => `
          <button onclick="answerCityQuiz(${index})">
            ${answer.text}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function answerCityQuiz(answerIndex) {
  const question = cityQuizQuestions[cityQuizCurrentQuestion];
  const answer = question.answers[answerIndex];

  Object.entries(answer.points).forEach(([city, points]) => {
    cityQuizScores[city] += points;
  });

  cityQuizCurrentQuestion++;

  if (cityQuizCurrentQuestion < cityQuizQuestions.length) {
    renderCityQuizQuestion();
  } else {
    showCityQuizResult();
  }
}

function showCityQuizResult() {
  const sortedCities = Object.entries(cityQuizScores)
    .sort((a, b) => b[1] - a[1]);

  const winner = sortedCities[0][0];
  const second = sortedCities[1][0];
  const third = sortedCities[2][0];

  const winnerScore = sortedCities[0][1];
  const maxPossibleScore = cityQuizQuestions.length * 3;
  const matchPercent = Math.round((winnerScore / maxPossibleScore) * 100);

  const cityNames = {
    Madrid: "Madrid",
    Barcelona: "Barcelona",
    Valencia: "Valencia",
    Malaga: "Málaga",
    Alicante: "Alicante",
    Sevilla: "Sevilla",
    Bilbao: "Bilbao"
  };

  const cityDescriptions = {
    Madrid: "Movimiento, trabajo, cultura y una ciudad que nunca para.",
    Barcelona: "Gran ciudad, mar, cultura y muchísima vida social.",
    Valencia: "Mar, buen clima y un equilibrio muy fuerte entre ciudad y calidad de vida.",
    Malaga: "Sol, costa y un ritmo relajado sin renunciar a una ciudad activa.",
    Alicante: "Mar, tranquilidad y una vida más relajada.",
    Sevilla: "Calor, cultura, vida social y mucho carácter.",
    Bilbao: "Naturaleza, gastronomía y una ciudad más fresca y tranquila."
  };

  cityQuizContent.innerHTML = `
    <div class="quiz-result">
      <span class="quiz-step">🎉 TU CIUDAD IDEAL</span>

      <div class="quiz-match">${matchPercent}% match</div>

      <h3>${cityNames[winner]}</h3>

      <p>${cityDescriptions[winner]}</p>

      <div class="quiz-alternatives">
        <strong>También podrían encajar con vos:</strong>
        <span>${cityNames[second]} · ${cityNames[third]}</span>
      </div>

      <div class="quiz-result-actions">
        ${winner === "Valencia" ? `
  <button class="btn btn-blue" onclick="goToCityListings('${winner}')">
    Ver anuncios en ${cityNames[winner]}
  </button>
` : `
  <button class="btn btn-blue" onclick="showCityComingSoon('${cityNames[winner]}')">
    Próximamente en ${cityNames[winner]}
  </button>
`}

        <button class="btn" onclick="restartCityQuiz()">
          Repetir test
        </button>
      </div>
    </div>
  `;
}

function restartCityQuiz() {
  cityQuizCurrentQuestion = 0;

  cityQuizScores = {
    Madrid: 0,
    Barcelona: 0,
    Valencia: 0,
    Malaga: 0,
    Alicante: 0,
    Sevilla: 0,
    Bilbao: 0
  };

  renderCityQuizQuestion();
}
function goToCityQuiz() {
  const quizSection = document.getElementById("cityQuiz");

  if (quizSection) {
    quizSection.scrollIntoView({
      behavior: "smooth"
    });
  }

  chatbotPanel.classList.remove("open");
}
function goToCityListings(city) {
  const citySelect = document.getElementById("citySelect");
  const listingsSection = document.getElementById("anuncios");

  const cityNames = {
    Madrid: "Madrid",
    Barcelona: "Barcelona",
    Valencia: "Valencia",
    Malaga: "Málaga",
    Alicante: "Alicante",
    Sevilla: "Sevilla",
    Bilbao: "Bilbao"
  };

  const cityName = cityNames[city];

  // Volver a mostrar todas las categorías
  currentFilter = "todos";

  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === "todos");
  });

  if (citySelect && cityName) {
    citySelect.value = cityName;
    currentCity = cityName;
  }

  render();

  if (listingsSection) {
    listingsSection.scrollIntoView({
      behavior: "smooth"
    });
  }
}
function showCityComingSoon(cityName) {
  alert(`🚀 Estamos preparando la comunidad en ${cityName}. Muy pronto vas a poder ver anuncios, grupos y recomendaciones.`);
}
function goToBusiness() {
  const businessSection = document.getElementById("negocios");

  if (businessSection) {
    businessSection.scrollIntoView({
      behavior: "smooth"
    });
  }

  chatbotPanel.classList.remove("open");
}
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    mobileMenuButton.setAttribute("aria-expanded", mobileMenu.classList.contains("open"));
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const scrollProgress = document.getElementById("scrollProgress");
const desktopNavLinks = Array.from(document.querySelectorAll(".topbar nav a[href^='#']"));
const observedSections = desktopNavLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${Math.min(progress, 100)}%`;

  let activeSection = observedSections[0]?.id;
  observedSections.forEach(section => {
    if (section.getBoundingClientRect().top <= 150) activeSection = section.id;
  });
  desktopNavLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeSection}`);
  });
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

const revealTargets = document.querySelectorAll(
  ".section-title, .recent-heading, .category, .listing-card, .group-card, .journey-heading, .journey-steps, .valencia-guide-head, .valencia-guide-grid, .valencia-faq, .business-card, .service-card, .places-heading, .place-card, .safety-heading, .safety-list, .publish-info, .publish-card"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -35px" });

  revealTargets.forEach(target => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  mobileMenu?.classList.remove("open");
  mobileMenuButton?.setAttribute("aria-expanded", "false");
  chatbotPanel?.classList.remove("open");
  chatbotButton?.setAttribute("aria-expanded", "false");
  reportModal?.classList.remove("open");
  closeListingDetail();
});
let currentReportedListing = "";

function reportListing(title) {
  currentReportedListing = title;

  const modal = document.getElementById("reportModal");
  const titleElement = document.getElementById("reportListingTitle");
  const status = document.getElementById("reportStatus");
  const comment = document.getElementById("reportComment");

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (status) {
    status.textContent = "";
  }

  if (comment) {
    comment.value = "";
  }

  if (modal) {
    modal.classList.add("open");
  }
}
const reportModal = document.getElementById("reportModal");
const reportModalClose = document.getElementById("reportModalClose");
const sendReportButton = document.getElementById("sendReportButton");

if (reportModalClose && reportModal) {
  reportModalClose.addEventListener("click", () => {
    reportModal.classList.remove("open");
  });
}

if (reportModal) {
  reportModal.addEventListener("click", (e) => {
    if (e.target === reportModal) {
      reportModal.classList.remove("open");
    }
  });
}

if (sendReportButton) {
  sendReportButton.addEventListener("click", async () => {
    const reason = document.getElementById("reportReason").value;
    const comment = document.getElementById("reportComment").value.trim();
    const status = document.getElementById("reportStatus");

    status.textContent = "Enviando reporte...";

    const { error } = await supabaseClient
      .from("reportes")
      .insert({
        anuncio_titulo: currentReportedListing,
        motivo: reason,
        comentario: comment,
        estado: "pendiente"
      });

    if (error) {
      console.error("Error enviando reporte:", error);
      status.textContent = "❌ No se pudo enviar el reporte.";
      return;
    }

    status.textContent = "✅ Reporte enviado. Gracias por avisarnos.";

    setTimeout(() => {
      reportModal.classList.remove("open");
    }, 1500);
  });
}
