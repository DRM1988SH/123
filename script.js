// --- تعريف المستخدم الحالي ---
let currentUser = null;
let currentLang = 'ar';
let localDB = {
  users: [
    { empId: '70062', name: 'Musab Ali', type: 'مسلخ', site: 'مسلخ مدينة زايد' },
    { empId: '70061', name: 'Safi Eldaw', type: 'سوق', site: 'سوق المواشي غياثي' }
  ],
  entries: [],
  settings: {
    animals: "جمل,بقر,غنم",
    samples: "دم,أنسجة,براز",
    results: "سلبي,إيجابي"
  }
};

// --- ترجمة ---
const translations = { /* ... (نفس الترجمة السابقة كاملة) */ };

function startApp() {
  document.getElementById('welcomeScreen').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('loginScreen').classList.add('visible');
  }, 2000);
}

function login() {
  const empId = document.getElementById('empId').value.trim();
  const user = localDB.users.find(u => u.empId === empId);
  if (user) {
    currentUser = user;
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

document.getElementById("dataForm").addEventListener("submit", function (e) {
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
  localDB.entries.push(entry);
  alert(translations[currentLang].saved);
  this.reset();
  document.getElementById("siteName").value = currentUser.site;
});

function generateReport() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const filterSite = document.getElementById("filterSite").value;
  const filterType = document.getElementById("filterType").value;

  let filtered = localDB.entries.slice();

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

function saveSettings() {
  localDB.settings.animals = document.getElementById("animalList").value;
  localDB.settings.samples = document.getElementById("sampleList").value;
  localDB.settings.results = document.getElementById("resultList").value;
  alert(translations[currentLang].saved);
  loadSettings();
}

function loadSettings() {
  const animals = (localDB.settings.animals || "جمل,بقر,غنم").split(',');
  const samples = (localDB.settings.samples || "دم,أنسجة,براز").split(',');
  const results = (localDB.settings.results || "سلبي,إيجابي").split(',');
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

function addUser() {
  if (currentUser.empId !== '70062') return;
  const id = document.getElementById("newEmpId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const type = document.getElementById("newType").value;
  const site = document.getElementById("newSite").value.trim();
  if (!id || !name || !site) return alert("يرجى ملء جميع الحقول");
  localDB.users.push({ empId: id, name, type, site });
  renderUsers();
  alert("تمت إضافة المستخدم");
}

function renderUsers() {
  const list = document.getElementById("usersList");
  list.innerHTML = "";
  localDB.users.forEach(u => {
    const div = document.createElement("div");
    div.textContent = `${u.empId} - ${u.name} - ${u.type} - ${u.site}`;
    list.appendChild(div);
  });
}

function changeLanguage() {
  currentLang = document.getElementById("langSelect").value;
  applyLanguage();
}

function applyLanguage() {
  const t = translations[currentLang];
  // تحديث النصوص بناء على اللغة
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
