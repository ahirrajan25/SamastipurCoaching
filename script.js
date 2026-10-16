const institutes = [
  {name:"उदाहरण कोचिंग संस्थान 1", nameEn:"Sample Coaching Institute 1", area:"समस्तीपुर शहर", areaEn:"Samastipur town", category:"school", courses:["कक्षा 6–10","गणित","विज्ञान"], coursesEn:["Classes 6–10","Maths","Science"], icon:"📘", phone:"", note:"डेमो एंट्री — वास्तविक नाम, पता और संपर्क भरें।"},
  {name:"उदाहरण प्रतियोगी क्लासेस", nameEn:"Sample Competitive Classes", area:"समस्तीपुर (पता जोड़ें)", areaEn:"Samastipur (add address)", category:"competitive", courses:["BPSC","SSC","रेलवे"], coursesEn:["BPSC","SSC","Railway"], icon:"📝", phone:"", note:"डेमो एंट्री — संस्थान से जानकारी सत्यापित करें।"},
  {name:"उदाहरण साइंस अकादमी", nameEn:"Sample Science Academy", area:"समस्तीपुर (पता जोड़ें)", areaEn:"Samastipur (add address)", category:"medical", courses:["NEET","JEE","फिजिक्स"], coursesEn:["NEET","JEE","Physics"], icon:"🔬", phone:"", note:"डेमो एंट्री — वास्तविक फीस और कोर्स बाद में जोड़ें।"}
];
let language = "hi";
let activeCategory = "";
const grid = document.getElementById("coachingGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = activeCategory || categoryFilter.value;
  const filtered = institutes.filter(item => {
    const searchable = [item.name,item.nameEn,item.area,item.areaEn,...item.courses,...item.coursesEn].join(" ").toLowerCase();
    return searchable.includes(query) && (!category || item.category === category);
  });
  grid.innerHTML = filtered.map(item => `
    <article class="institute-card">
      <div class="institute-top">
        <div class="institute-logo">${item.icon}</div>
        <div><h3>${language === "hi" ? item.name : item.nameEn}</h3>
        <div class="location">📍 ${language === "hi" ? item.area : item.areaEn}</div></div>
      </div>
      <div class="tags">${(language === "hi" ? item.courses : item.coursesEn).map(course => `<span class="tag">${course}</span>`).join("")}</div>
      <div class="card-note">ℹ️ ${language === "hi" ? item.note : "Demo listing — replace with verified institute details."}</div>
      <div class="card-actions"><a href="#contact">${language === "hi" ? "जानकारी जोड़ें" : "Add details"}</a><a class="secondary" href="#contact">${language === "hi" ? "संपर्क" : "Contact"}</a></div>
    </article>`).join("");
  document.getElementById("noResults").hidden = filtered.length !== 0;
  document.getElementById("resultCount").textContent = language === "hi" ? `${filtered.length} संस्थान` : `${filtered.length} institutes`;
}
document.getElementById("searchButton").addEventListener("click", render);
searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", () => { activeCategory = ""; document.querySelectorAll(".category-card").forEach(x=>x.classList.remove("active")); render(); });
document.querySelectorAll(".category-card").forEach(card => card.addEventListener("click", () => {
  const value = card.dataset.category;
  activeCategory = activeCategory === value ? "" : value;
  categoryFilter.value = "";
  document.querySelectorAll(".category-card").forEach(x=>x.classList.toggle("active", x.dataset.category === activeCategory));
  render();
}));
document.getElementById("langToggle").addEventListener("click", () => {
  language = language === "hi" ? "en" : "hi";
  document.documentElement.lang = language;
  document.querySelectorAll("[data-hi][data-en]").forEach(el => el.textContent = el.dataset[language]);
  searchInput.placeholder = searchInput.dataset[`placeholder${language.toUpperCase()}`] || "";
  document.getElementById("langToggle").textContent = language === "hi" ? "English" : "हिंदी";
  render();
});
document.getElementById("year").textContent = new Date().getFullYear();
render();