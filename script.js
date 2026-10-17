 
import { db, isFirebaseConfigured } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// अपना Admin WhatsApp नंबर देश कोड सहित डालें।
// उदाहरण: भारत के 9876543210 के लिए "919876543210"
const ADMIN_WHATSAPP = "918873207481";

let institutes = [];
let language = "hi";
let activeCategory = "";

const grid = document.getElementById("coachingGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function whatsappLink(number, name = "") {
  const digits = String(number || "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "";

  const message = encodeURIComponent(
    `नमस्ते, मुझे ${name || "आपकी कोचिंग"} के बारे में जानकारी चाहिए।`
  );

  return `https://wa.me/${digits}?text=${message}`;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = activeCategory || categoryFilter.value;

  const filtered = institutes.filter(item => {
    const courses = [
      ...(item.courses || []),
      ...(item.coursesEn || [])
    ];

    const searchable = [
      item.name, item.nameEn, item.area, item.areaEn,
      ...courses
    ].join(" ").toLowerCase();

    return searchable.includes(query) &&
      (!category || item.category === category);
  });

  grid.innerHTML = filtered.map(item => {
    const name = language === "hi"
      ? (item.name || "")
      : (item.nameEn || item.name || "");

    const area = language === "hi"
      ? (item.area || "")
      : (item.areaEn || item.area || "");

    const courses = language === "hi"
      ? (item.courses || [])
      : (item.coursesEn || item.courses || []);

    const link = whatsappLink(item.whatsapp, name);

    return `
      <article class="institute-card">
        <div class="institute-top">
          <div class="institute-logo">${escapeHTML(item.icon || "🎓")}</div>
          <div>
            <h3>${escapeHTML(name)}</h3>
            <div class="location">📍 ${escapeHTML(area)}</div>
          </div>
        </div>

        <div class="tags">
          ${courses.map(course =>
            `<span class="tag">${escapeHTML(course)}</span>`
          ).join("")}
        </div>

        ${item.phone ? `
          <p>📞 ${escapeHTML(item.phone)}</p>
        ` : ""}

        ${item.note ? `
          <div class="card-note">ℹ️ ${escapeHTML(item.note)}</div>
        ` : ""}

        <div class="card-actions">
          ${link ? `
            <a href="${link}" target="_blank"
               rel="noopener noreferrer">
              ${language === "hi"
                ? "WhatsApp पर संपर्क करें"
                : "Contact on WhatsApp"}
            </a>
          ` : ""}

          ${item.website && /^https?:\/\//i.test(item.website) ? `
            <a class="secondary"
               href="${escapeHTML(item.website)}"
               target="_blank" rel="noopener noreferrer">
              ${language === "hi" ? "वेबसाइट" : "Website"}
            </a>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("noResults").hidden =
    filtered.length !== 0;

  document.getElementById("resultCount").textContent =
    language === "hi"
      ? `${filtered.length} संस्थान`
      : `${filtered.length} institutes`;
}

async function loadInstitutes() {
  if (!isFirebaseConfigured) {
    grid.textContent = "Firebase कॉन्फ़िगरेशन उपलब्ध नहीं है।";
    return;
  }

  grid.textContent = language === "hi"
    ? "संस्थान लोड हो रहे हैं…"
    : "Loading institutes…";

  try {
    const snapshot = await getDocs(collection(db, "institutes"));
    institutes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    render();
  } catch (error) {
    console.error("Firestore load error:", error);
    grid.textContent = language === "hi"
      ? "डेटा लोड नहीं हुआ। कृपया बाद में फिर कोशिश करें।"
      : "Could not load data. Please try again later.";
  }
}

document.getElementById("searchButton")
  .addEventListener("click", render);

searchInput.addEventListener("input", render);

categoryFilter.addEventListener("change", () => {
  activeCategory = "";
  document.querySelectorAll(".category-card")
    .forEach(card => card.classList.remove("active"));
  render();
});

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    const value = card.dataset.category;
    activeCategory = activeCategory === value ? "" : value;
    categoryFilter.value = "";

    document.querySelectorAll(".category-card").forEach(other => {
      other.classList.toggle(
        "active",
        other.dataset.category === activeCategory
      );
    });

    render();
  });
});

document.getElementById("langToggle").addEventListener("click", () => {
  language = language === "hi" ? "en" : "hi";
  document.documentElement.lang = language;

  document.querySelectorAll("[data-hi][data-en]").forEach(el => {
    el.textContent = el.dataset[language];
  });

  searchInput.placeholder =
    searchInput.dataset[`placeholder${language.toUpperCase()}`] || "";

  document.getElementById("langToggle").textContent =
    language === "hi" ? "English" : "हिंदी";

  render();
});

// वेबसाइट के Admin का WhatsApp संपर्क
const contactSection = document.getElementById("contact");
const adminLink = whatsappLink(ADMIN_WHATSAPP, "SamastipurCoaching");

if (contactSection && adminLink) {
  const link = document.createElement("a");
  link.className = "primary-button";
  link.href = adminLink;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Admin से WhatsApp पर संपर्क करें";
  contactSection.appendChild(link);
}

document.getElementById("year").textContent =
  new Date().getFullYear();

loadInstitutes();
