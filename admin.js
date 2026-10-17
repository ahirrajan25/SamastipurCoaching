import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const $ = id => document.getElementById(id);
const setupMessage = $("setupMessage");
const loginCard = $("loginCard");
const editorCard = $("editorCard");
const listCard = $("listCard");
const loginMessage = $("loginMessage");
const editorMessage = $("editorMessage");

function showMessage(el, message, type = "") {
  el.textContent = message;
  el.className = `status ${type}`.trim();
}
function hideMessage(el) { el.classList.add("hidden"); }

if (!isFirebaseConfigured) {
  showMessage(setupMessage, "पहले firebase-config.js में Firebase Web App की config भरें, फिर Firebase Authentication और Firestore सेट करें। अभी लॉगिन/सेव काम नहीं करेगा।", "error");
} else {
  showMessage(setupMessage, "Firebase config मिली। Admin login करें।", "ok");
}

function csv(value) {
  return value.split(",").map(s => s.trim()).filter(Boolean);
}
function formData() {
  return {
    name: $("name").value.trim(),
    nameEn: $("nameEn").value.trim() || $("name").value.trim(),
    area: $("area").value.trim(),
    areaEn: $("areaEn").value.trim() || $("area").value.trim(),
    category: $("category").value,
    icon: $("icon").value.trim() || "🎓",
    courses: csv($("courses").value),
    coursesEn: csv($("coursesEn").value || $("courses").value),
    phone: $("phone").value.trim(),
    whatsapp: $("whatsapp").value.replace(/\D/g, ""),
    website: $("website").value.trim(),
    note: $("note").value.trim(),
    updatedAt: serverTimestamp()
  };
}
function resetForm() {
  $("instituteForm").reset();
  $("docId").value = "";
  $("icon").value = "🎓";
  $("formTitle").textContent = "नई कोचिंग जोड़ें";
  hideMessage(editorMessage);
}
function fillForm(item) {
  $("docId").value = item.id;
  $("name").value = item.name || "";
  $("nameEn").value = item.nameEn || "";
  $("area").value = item.area || "";
  $("areaEn").value = item.areaEn || "";
  $("category").value = item.category || "school";
  $("icon").value = item.icon || "🎓";
  $("courses").value = (item.courses || []).join(", ");
  $("coursesEn").value = (item.coursesEn || []).join(", ");
  $("phone").value = item.phone || "";
  $("whatsapp").value = item.whatsapp || "";
  $("website").value = item.website || "";
  $("note").value = item.note || "";
  $("formTitle").textContent = "कोचिंग की जानकारी बदलें";
  window.scrollTo({ top: editorCard.offsetTop, behavior: "smooth" });
}
async function refreshList() {
  const snapshot = await getDocs(collection(db, "institutes"));
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const container = $("instituteList");
  if (!items.length) {
    container.textContent = "अभी कोई संस्थान नहीं जोड़ा गया है। ऊपर का फॉर्म भरकर पहली कोचिंग जोड़ें।";
    return;
  }
  container.innerHTML = items.map(item => `
    <div class="admin-list-item">
      <div><strong>${escapeHTML(item.name || "बिना नाम")}</strong><p>${escapeHTML(item.area || "")} · ${(item.courses || []).map(escapeHTML).join(", ")}</p></div>
      <div class="admin-actions" style="margin:0">
        <button class="secondary-button" type="button" data-edit="${escapeHTML(item.id)}">Edit</button>
        <button class="danger-button" type="button" data-delete="${escapeHTML(item.id)}">Delete</button>
      </div>
    </div>`).join("");
  container.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => {
    const item = items.find(x => x.id === button.dataset.edit);
    if (item) fillForm(item);
  }));
  container.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", async () => {
    const item = items.find(x => x.id === button.dataset.delete);
    if (!item || !confirm(`क्या "${item.name}" को हटाना चाहते हैं?`)) return;
    try {
      await deleteDoc(doc(db, "institutes", item.id));
      await refreshList();
      showMessage(editorMessage, "संस्थान हटा दिया गया।", "ok");
    } catch (error) {
      showMessage(editorMessage, `हटाया नहीं जा सका: ${error.message}`, "error");
    }
  }));
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  hideMessage(loginMessage);
  if (!isFirebaseConfigured) {
    showMessage(loginMessage, "पहले Firebase setup पूरा करें।", "error");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
  } catch (error) {
    showMessage(loginMessage, "लॉगिन नहीं हुआ। ईमेल/पासवर्ड जाँचें और Firebase Authentication setup देखें।", "error");
  }
});
$("logoutButton").addEventListener("click", () => signOut(auth));
$("resetButton").addEventListener("click", resetForm);
$("instituteForm").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const data = formData();
    const id = $("docId").value;
    if (id) {
      await updateDoc(doc(db, "institutes", id), data);
      showMessage(editorMessage, "जानकारी अपडेट हो गई।", "ok");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "institutes"), data);
      showMessage(editorMessage, "नई कोचिंग सेव हो गई।", "ok");
    }
    resetForm();
    await refreshList();
  } catch (error) {
    showMessage(editorMessage, `सेव नहीं हुआ। Firebase Rules और कनेक्शन जाँचें। विवरण: ${error.message}`, "error");
  }
});

if (isFirebaseConfigured) {
  onAuthStateChanged(auth, async user => {
    const signedIn = Boolean(user);
    loginCard.classList.toggle("hidden", signedIn);
    editorCard.classList.toggle("hidden", !signedIn);
    listCard.classList.toggle("hidden", !signedIn);
    if (signedIn) {
      try { await refreshList(); }
      catch (error) { showMessage(editorMessage, `डेटा लोड नहीं हुआ: ${error.message}`, "error"); }
    }
  });
}
