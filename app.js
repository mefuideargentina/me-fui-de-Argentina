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
        document.getElementById("listingGrid").innerHTML =
          `<div class="empty-state"><span>↻</span><h3>No pudimos cargar los anuncios</h3><p>Puede ser algo momentáneo. Probá otra vez.</p><div class="empty-actions"><button class="empty-primary" onclick="loadApprovedListings()">Reintentar</button></div></div>`;
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

function renderPrice(value){
  if(!value) return "Consultar";
  const price = String(value).trim();
  return /^\d+(?:[.,]\d+)?$/.test(price) ? `${safe(price)} €` : safe(price);
}

function render(){
  const grid = document.getElementById("listingGrid");
  const data = getAll().filter(x=>{
    const cat = currentFilter==="todos" || x.category===currentFilter;
    const city =
  currentCity === "todas" ||
  (x.city || "").trim().toLowerCase() === currentCity.trim().toLowerCase();
    return cat && city;
  });

  if(!data.length){
    const place = currentCity !== "todas" ? ` en ${safe(currentCity)}` : "";
    grid.innerHTML = `
      <div class="empty-state">
        <span>⌕</span>
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
        <strong>${renderPrice(x.price)}</strong>
      </div>
      <div class="contacto">
  ${renderContact(x.contact)}
</div>
<button class="report-button" onclick="reportListing('${safe(x.title)}')">
  ⚠️ Reportar publicación
</button>
    </article>
  `).join("");
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
    return "🏐";
  }

  // Fútbol
  if (
    groupName.includes("futbol") ||
    groupName.includes("fútbol") ||
    groupName.includes("fulbito") ||
    groupName.includes("football")
  ) {
    return "⚽";
  }

  const icons = {
    trabajo: "💼",
    vivienda: "🏠",
    general: "👥",
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
        <span>💬</span>
        <h3>Todavía no hay grupos para este filtro</h3>
        <p>Podés volver a ver todos los grupos disponibles en Valencia.</p>
        <div class="empty-actions"><button class="empty-primary" onclick="resetGroupFilters()">Ver todos</button></div>
      </div>`;
    return;
  }
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
const chatbotButton = document.getElementById("chatbotButton");
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotClose = document.getElementById("chatbotClose");

if (chatbotButton && chatbotPanel) {
  chatbotButton.addEventListener("click", () => {
    chatbotPanel.classList.toggle("open");
    chatbotButton.setAttribute("aria-expanded", chatbotPanel.classList.contains("open"));
  });
}

if (chatbotClose && chatbotPanel) {
  chatbotClose.addEventListener("click", () => {
    chatbotPanel.classList.remove("open");
    chatbotButton?.setAttribute("aria-expanded", "false");
  });
}
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
  ".section-title, .recent-heading, .category, .listing-card, .group-card, .journey-heading, .journey-steps, .business-card, .service-card, .safety-heading, .safety-list, .publish-info, .publish-card"
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
