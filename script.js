// --- Firebase إعداد ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, setDoc,
  doc, query, where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCv4hz5821FEigAUouDnzJzQf0QzsT0Ihs",
  authDomain: "cashier-a1d32.firebaseapp.com",
  projectId: "cashier-a1d32",
  storageBucket: "cashier-a1d32.appspot.com",
  messagingSenderId: "909595103212",
  appId: "1:909595103212:web:b5fe2a52710d2bfe993ac9",
  measurementId: "G-ZGH8JX7LF3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- تعريف المستخدم الحالي ---
let currentUser = null;
let currentLang = 'ar';

// --- ترجمة ---
const translations = { /* ... (نفس الترجمة السابقة كاملة) */ };

// --- تشغيل التطبيق ---
function startApp() {
  document.getElementById('welcomeScreen').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('loginScreen').classList.add('visible');
  }, 2000);
}

// --- تسجيل الدخول ---
async function login() {
  const empId = document.getElementById('empId').value.trim();
  const q = query(collection(db, "users"), where("empId", "==", empId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    currentUser = doc.data();
    document.getElementById('userWelcome').textContent = `${translations[currentLang].welcome} ${currentUser.name}`;
    document.getElementById('siteName').value = currentUser.site;
    document.getElementById('loginScreen').classList.remove('visible');
    document.getElementById('dashboardScreen').classList.add('visible');
    document.getElementById('usersBtn').style.display = currentUser.empId === '70062' ? 'inline-block' : 'none';
    document.getElementById('settingsBtn').style.display = currentUser.empId === '70062' ? 'inline-block' : 'none';
    loadSettings();
    renderUsers();
    applyLanguage();
  } else {
    alert(translations[currentLang].invalidId);
  }
}

// --- إدخال بيانات ---
document.getElementById("dataForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const entry = {
    date: document.getElementById("dateInput").value,
    site: currentUser.site,
    barn: document.getElementById("barnName").value,
    license: document.getElementById("licenseNo").value,
    animal: document.getElementById("animalType").value,
    gender: document.getElementById("gender").value,
    sample: document.getElementById("sampleType").value,
    result: document.getElementById("resultType").value,
    notes: document.getElementById("notes").value,
    user: currentUser.name,
    type: currentUser.type
  };
  await addDoc(collection(db, "entries"), entry);
  alert(translations[currentLang].saved);
  this.reset();
  document.getElementById("siteName").value = currentUser.site;
});

// --- توليد التقرير ---
async function generateReport() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const filterSite = document.getElementById("filterSite").value;
  const filterType = document.getElementById("filterType").value;

  const snapshot = await getDocs(collection(db, "entries"));
  let filtered = snapshot.docs.map(doc => doc.data());

  if (from) filtered = filtered.filter(e => e.date >= from);
  if (to) filtered = filtered.filter(e => e.date <= to);
  if (filterSite) filtered = filtered.filter(e => e.site === filterSite);
  if (currentUser.type === "سوق") filtered = filtered.filter(e => e.type === "سوق");
  if (currentUser.type === "مسلخ") filtered = filtered.filter(e => e.type === "مسلخ");

  const html = filtered.map(e => `
    <tr>
      <td>${e.date}</td><td>${e.site}</td><td>${e.barn}</td>
      <td>${e.license}</td><td>${e.animal}</td><td>${e.gender}</td>
      <td>${e.sample}</td><td>${e.result}</td><td>${e.notes}</td><td>${e.user}</td>
    </tr>
  `).join("");

  document.getElementById("reportContent").innerHTML = `
    <table><thead><tr>
      <th>التاريخ</th><th>الموقع</th><th>الحظيرة</th><th>الرخصة</th><th>الحيوان</th>
      <th>الجنس</th><th>العينة</th><th>النتيجة</th><th>ملاحظات</th><th>المدخل</th>
    </tr></thead><tbody>${html}</tbody></table>
  `;
}

// --- حفظ الإعدادات ---
async function saveSettings() {
  await setDoc(doc(db, "settings", "lists"), {
    animals: document.getElementById("animalList").value,
    samples: document.getElementById("sampleList").value,
    results: document.getElementById("resultList").value
  });
  alert(translations[currentLang].saved);
  loadSettings();
}

// --- تحميل الإعدادات ---
async function loadSettings() {
  const docSnap = await getDocs(collection(db, "settings"));
  const doc = docSnap.docs.find(d => d.id === "lists");
  const data = doc ? doc.data() : {};
  const animals = (data.animals || "جمل,بقر,غنم").split(',');
  const samples = (data.samples || "دم,أنسجة,براز").split(',');
  const results = (data.results || "سلبي,إيجابي").split(',');
  fillSelect("animalType", animals);
  fillSelect("sampleType", samples);
  fillSelect("resultType", results);
}

function fillSelect(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = '';
  items.forEach(item => {
    const option = document.createElement("option");
    option.textContent = item;
    select.appendChild(option);
  });
}

// --- إضافة مستخدم جديد ---
async function addUser() {
  if (currentUser.empId !== '70062') return;
  const id = document.getElementById("newEmpId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const type = document.getElementById("newType").value;
  const site = document.getElementById("newSite").value.trim();
  if (!id || !name || !site) return alert("يرجى ملء جميع الحقول");
  await setDoc(doc(db, "users", id), { empId: id, name, type, site });
  renderUsers();
  alert("تمت إضافة المستخدم");
}

// --- عرض المستخدمين ---
async function renderUsers() {
  const list = document.getElementById("usersList");
  list.innerHTML = "";
  const snapshot = await getDocs(collection(db, "users"));
  snapshot.forEach(doc => {
    const u = doc.data();
    const div = document.createElement("div");
    div.textContent = `${u.empId} - ${u.name} - ${u.type} - ${u.site}`;
    list.appendChild(div);
  });
}

// --- اللغة ---
function changeLanguage() {
  currentLang = document.getElementById("langSelect").value;
  applyLanguage();
}

function applyLanguage() {
  const t = translations[currentLang];
  // يتم تعميم الترجمة حسب معرفات العناصر
  // كما هو موضح سابقًا (نفس دالة applyLanguage السابقة)
}

function openScreen(id) {
  document.querySelectorAll(".screen").forEach(div => div.classList.remove("visible"));
  document.getElementById(id).classList.add("visible");
}

function goBack() {
  openScreen("dashboardScreen");
}

function logout() {
  currentUser = null;
  document.querySelectorAll(".screen").forEach(div => div.classList.remove("visible"));
  document.getElementById("loginScreen").classList.add("visible");
}
