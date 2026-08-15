
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

function getAll(){
  const saved = JSON.parse(localStorage.getItem("mfa_v2_posts") || "[]");
  return [...saved, ...listings];
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

document.getElementById("publishForm").addEventListener("submit",e=>{
  e.preventDefault();

  const city = document.getElementById("location").value.trim();

  const post = {
    category:document.getElementById("category").value,
    title:document.getElementById("title").value.trim(),
    city:city,
    location:city,
    price:document.getElementById("price").value.trim(),
    description:document.getElementById("description").value.trim(),
    contact:document.getElementById("contact").value.trim(),
    age:"Recién publicado"
  };

  const saved=JSON.parse(localStorage.getItem("mfa_v2_posts")||"[]");
  saved.unshift(post);
  localStorage.setItem("mfa_v2_posts",JSON.stringify(saved));

  e.target.reset();
  document.getElementById("formStatus").textContent="✓ Publicado en esta demo.";
  currentCity="todas";
  document.getElementById("citySelect").value="todas";
  currentFilter="todos";
  render();
  setTimeout(()=>document.querySelector(".recent").scrollIntoView({behavior:"smooth"}),250);
});

function demoGroup(e){
  e.preventDefault();
  alert("Acá vamos a poner el enlace real de tu grupo de WhatsApp.");
  return false;
}

render();
