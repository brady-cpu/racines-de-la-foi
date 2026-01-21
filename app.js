/* ============================================================
   CHARGEMENT DES DONNÉES LOCALES (question, classement, pensées)
   ============================================================ */

// Lecture fichier texte (question du jour)
async function chargerQuestion() {
  const el = document.getElementById("question-du-jour");
  if (!el) return;

  // Vérifie si une version locale existe
  const localQ = localStorage.getItem("question_du_jour");
  if (localQ) {
    el.textContent = localQ;
    return;
  }

  try {
    const res = await fetch("data/question.txt");
    const txt = await res.text();
    el.textContent = txt.trim();
  } catch {
    el.textContent = "Impossible de charger la question.";
  }
}

// Lecture classement
async function chargerClassement() {
  const el = document.getElementById("classement-container");
  if (!el) return;

  // Version locale ?
  const localC = localStorage.getItem("classement");
  let data;

  if (localC) {
    data = JSON.parse(localC);
  } else {
    try {
      const res = await fetch("data/classement.json");
      data = await res.json();
    } catch {
      el.textContent = "Impossible de charger le classement.";
      return;
    }
  }

  let html = "<ol>";
  data.forEach(item => {
    html += `<li><strong>${item.nom}</strong> — ${item.points} pts</li>`;
  });
  html += "</ol>";

  el.innerHTML = html;
}

// Lecture pensées de la semaine
async function chargerPensees() {
  const elements = document.querySelectorAll(".week-thought-line");
  if (!elements.length) return;

  // Version locale ?
  const localP = localStorage.getItem("pensees");
  let data;

  if (localP) {
    data = JSON.parse(localP);
  } else {
    try {
      const res = await fetch("data/pensees.json");
      data = await res.json();
    } catch {
      return;
    }
  }

  elements.forEach(el => {
    const week = el.getAttribute("data-week");
    el.textContent = data[week] || "—";
  });
}

/* ============================================================
   BOUTON SECRET ADMIN (appui long sur le titre)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const secretBtn = document.getElementById("secret-admin-button");
  if (secretBtn) {
    let pressTimer;

    secretBtn.addEventListener("mousedown", () => {
      pressTimer = setTimeout(() => {
        window.location.href = "admin.html";
      }, 2000); // 2 secondes
    });

    secretBtn.addEventListener("mouseup", () => clearTimeout(pressTimer));
    secretBtn.addEventListener("mouseleave", () => clearTimeout(pressTimer));
  }

  // Chargement auto
  chargerQuestion();
  chargerClassement();
  chargerPensees();

  // Chargement admin si on est sur admin.html
  chargerAdmin();
});

/* ============================================================
   LOGIQUE ADMIN
   ============================================================ */

function chargerAdmin() {
  // On vérifie si on est sur admin.html
  if (!document.getElementById("admin-question")) return;

  // Charger question
  const localQ = localStorage.getItem("question_du_jour");
  if (localQ) {
    document.getElementById("admin-question").value = localQ;
  }

  // Charger classement
  const localC = localStorage.getItem("classement");
  let classement;

  if (localC) {
    classement = JSON.parse(localC);
  } else {
    fetch("data/classement.json")
      .then(res => res.json())
      .then(data => {
        classement = data;
        afficherAdminClassement(classement);
      });
  }

  if (localC) afficherAdminClassement(classement);

  // Charger pensées
  const localP = localStorage.getItem("pensees");
  let pensees;

  if (localP) {
    pensees = JSON.parse(localP);
    afficherAdminPensees(pensees);
  } else {
    fetch("data/pensees.json")
      .then(res => res.json())
      .then(data => {
        pensees = data;
        afficherAdminPensees(pensees);
      });
  }
}

/* ============================================================
   ADMIN — QUESTION DU JOUR
   ============================================================ */

function adminSaveQuestion() {
  const q = document.getElementById("admin-question").value.trim();
  localStorage.setItem("question_du_jour", q);
  alert("Question enregistrée !");
}

/* ============================================================
   ADMIN — CLASSEMENT
   ============================================================ */

function afficherAdminClassement(data) {
  const container = document.getElementById("admin-classement-list");
  container.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "admin-player-row";

    row.innerHTML = `
      <input value="${item.nom}" onchange="adminEditPlayer(${index}, 'nom', this.value)" />
      <input type="number" value="${item.points}" onchange="adminEditPlayer(${index}, 'points', this.value)" />
      <button class="admin-delete-btn" onclick="adminDeletePlayer(${index})">X</button>
    `;

    container.appendChild(row);
  });
}

function adminEditPlayer(index, field, value) {
  const data = JSON.parse(localStorage.getItem("classement"));
  data[index][field] = field === "points" ? Number(value) : value;
  localStorage.setItem("classement", JSON.stringify(data));
}

function adminDeletePlayer(index) {
  const data = JSON.parse(localStorage.getItem("classement"));
  data.splice(index, 1);
  localStorage.setItem("classement", JSON.stringify(data));
  afficherAdminClassement(data);
}

function adminAddPlayer() {
  const name = document.getElementById("new-player-name").value.trim();
  const points = Number(document.getElementById("new-player-points").value);

  if (!name) return alert("Nom manquant");

  const data = JSON.parse(localStorage.getItem("classement")) || [];
  data.push({ nom: name, points: points || 0 });

  localStorage.setItem("classement", JSON.stringify(data));
  afficherAdminClassement(data);

  document.getElementById("new-player-name").value = "";
  document.getElementById("new-player-points").value = "";
}

/* ============================================================
   ADMIN — PENSÉES DE LA SEMAINE
   ============================================================ */

function afficherAdminPensees(data) {
  const container = document.getElementById("admin-pensees-list");
  container.innerHTML = "";

  Object.keys(data).forEach(week => {
    const row = document.createElement("div");
    row.className = "admin-player-row";

    row.innerHTML = `
      <label style="width:120px; color:var(--or);">${week}</label>
      <input value="${data[week]}" onchange="adminEditPensee('${week}', this.value)" />
    `;

    container.appendChild(row);
  });
}

function adminEditPensee(week, value) {
  const data = JSON.parse(localStorage.getItem("pensees"));
  data[week] = value;
  localStorage.setItem("pensees", JSON.stringify(data));
}

function adminSavePensees() {
  alert("Pensées enregistrées !");
}