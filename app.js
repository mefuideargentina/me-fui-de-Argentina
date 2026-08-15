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
        age: "Publicado recientemente"
    }));

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
    <article class="listing-card">
      <div class="meta">
        <span class="badge">${labels[x.category] || "PUBLICACIÓN"}</span>
        <span class="age">${safe(x.age)}</span>
      </div>
      <h3>${safe(x.title)}</h3>
      <p>${safe(x.description)}</p>
      <div class="bottom">
        <span>📍 ${safe(x.location)}</span>
        <strong>${safe(x.price || "Consultar")}</strong>
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

  const anuncio = {
    categoria: document.getElementById("category").value,
    titulo: document.getElementById("title").value.trim(),
    descripcion: document.getElementById("description").value.trim(),
    ciudad: ciudad,
    precio: document.getElementById("price").value.trim(),
    contacto: document.getElementById("contact").value.trim(),
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


const communityGroups = [
  {name:"Avisos de trabajo", category:"trabajo", icon:"💼", description:"Ofertas y avisos laborales de la comunidad.", url:"https://chat.whatsapp.com/It0t7nSSTTlCnKe2Paz62S?s=cl&p=i&ilr=0&amv=0"},
  {name:"Alquileres", category:"vivienda", icon:"🏠", description:"Habitaciones, pisos, alquileres y búsquedas.", url:"https://chat.whatsapp.com/BHNmPRwp8ZV1yKyiJFUtwJ?s=cl&p=i&ilr=0&amv=0"},
  {name:"Argentinos en Valencia", category:"general", icon:"🇦🇷", description:"Grupo general de la comunidad en Valencia.", url:"https://chat.whatsapp.com/CVkPDgrrWp140wUBtkrPLw?s=cl&p=i&ilr=0&amv=0"},
  {name:"Servicios / publicidad", category:"servicios", icon:"📢", description:"Servicios, emprendimientos y publicidad útil.", url:"https://chat.whatsapp.com/CgK5dnG4Nip1ljYgAGLBDz?s=cl&p=i&ilr=0&amv=0"},
  {name:"Compra / Venta (productos)", category:"compraventa", icon:"🛒", description:"Compra y venta de productos entre miembros.", url:"https://chat.whatsapp.com/CyrfZgMsfzNIGnQWovsEEH?s=cl&p=i&ilr=0&amv=0"},
  {name:"Argentinos en Valencia 2", category:"general", icon:"🇦🇷", description:"Segundo grupo general de la comunidad.", url:"https://chat.whatsapp.com/JYmRpGAJUL418XmwGg6rag?s=cl&p=i&ilr=0&amv=0"},
  {name:"Charlas informales / Juntadas", category:"social", icon:"🧉", description:"Conocer gente, organizar salidas y juntadas.", url:"https://chat.whatsapp.com/I8DQ0Wfwd5pGz4wpQziBZM?s=cl&p=i&ilr=0&amv=0"},
  {name:"Fulbito", category:"deportes", icon:"⚽", description:"Partidos y gente para jugar al fútbol.", url:"https://chat.whatsapp.com/GnqQLGuhjQdCInh7MPfdwT"},
  {name:"BeachVolley", category:"deportes", icon:"🏐", description:"Grupo para organizar partidos de vóley playa.", url:"https://chat.whatsapp.com/LlA8Bxr8zxFCB8xhppWMU5?s=cl&p=a&ilr=4"}
];

let groupFilter = "todos";

function renderGroups(){
  const directory = document.getElementById("groupDirectory");
  if(!directory) return;
  const city = document.getElementById("groupCity").value;

  if(city === "proximamente"){
    directory.innerHTML = `<div class="empty">Estamos empezando por Valencia 🇦🇷🇪🇸<br><br>Madrid, Barcelona, Málaga, Alicante y otras ciudades se irán sumando.</div>`;
    return;
  }

  const groups = communityGroups.filter(g => groupFilter === "todos" || g.category === groupFilter);
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
  if(url.startsWith("ENLACE_")){
    alert("Este grupo todavía necesita su enlace de invitación de WhatsApp. Lo vas a pegar en app.js.");
    return false;
  }
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
renderGroups();
loadApprovedListings();
