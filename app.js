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
const chatbotButton = document.getElementById("chatbotButton");
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotClose = document.getElementById("chatbotClose");

if (chatbotButton && chatbotPanel) {
  chatbotButton.addEventListener("click", () => {
    chatbotPanel.classList.toggle("open");
  });
}

if (chatbotClose && chatbotPanel) {
  chatbotClose.addEventListener("click", () => {
    chatbotPanel.classList.remove("open");
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

      <h3>${cityNames[winner]}</h3>

      <p>${cityDescriptions[winner]}</p>

      <div class="quiz-alternatives">
        <strong>También podrían encajar con vos:</strong>
        <span>${cityNames[second]} · ${cityNames[third]}</span>
      </div>

      <button class="btn btn-blue" onclick="restartCityQuiz()">
        Repetir test
      </button>
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
