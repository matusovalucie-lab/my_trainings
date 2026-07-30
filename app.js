const STORAGE_KEY = "my-trainings-state-v1";

const templates = [
  {
    id: "workout-a",
    name: "Workout A",
    exercises: [
      { name: "Hip Thrust", sets: 3, reps: 10, weight: 50, range: "8–10" },
      { name: "Leg Curl", sets: 3, reps: 10, weight: 35, range: "10–12" },
      { name: "Step Up", sets: 3, reps: 10, weight: 12, range: "8–10 / noha" },
      { name: "Pallof Press", sets: 3, reps: 10, weight: 15, range: "10 / strana" }
    ]
  },
  { id: "workout-b", name: "Workout B", exercises: [] },
  { id: "workout-c", name: "Workout C", exercises: [] },
  { id: "hiking", name: "Hiking", exercises: [] },
  { id: "micro", name: "Micro Workout", exercises: [] }
];

let state = loadState();
let route = { screen: "home", templateId: null, historyId: null };

function defaultState() {
  return { activeSession: null, history: [] };
}

function loadState() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sessionFromTemplate(template) {
  return {
    id: crypto.randomUUID(),
    templateId: template.id,
    workoutName: template.name,
    startedAt: new Date().toISOString(),
    completedAt: null,
    currentIndex: 0,
    exercises: template.exercises.map((ex, index) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      position: index,
      range: ex.range,
      status: index === 0 ? "active" : "waiting",
      sets: Array.from({ length: ex.sets }, (_, setIndex) => ({
        id: crypto.randomUUID(),
        position: setIndex,
        weight: ex.weight,
        reps: ex.reps,
        completed: false
      }))
    }))
  };
}

function navigate(screen, extra = {}) {
  route = { screen, templateId: null, historyId: null, ...extra };
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function startWorkout(templateId) {
  const template = templates.find(t => t.id === templateId);
  if (!template || template.exercises.length === 0) return;
  state.activeSession = sessionFromTemplate(template);
  saveState();
  navigate("workout");
}

function currentExercise() {
  return state.activeSession?.exercises[state.activeSession.currentIndex] || null;
}

function completeSet(exerciseId, setId) {
  const session = state.activeSession;
  const exercise = session.exercises.find(e => e.id === exerciseId);
  const set = exercise.sets.find(s => s.id === setId);
  set.completed = !set.completed;

  if (exercise.sets.every(s => s.completed)) {
    exercise.status = "completed";
    moveNext();
  }
  saveState();
  render();
}

function updateSet(exerciseId, setId, field, value) {
  const exercise = state.activeSession.exercises.find(e => e.id === exerciseId);
  const set = exercise.sets.find(s => s.id === setId);
  set[field] = field === "weight" ? Number(value) : parseInt(value || "0", 10);
  saveState();
}

function moveNext() {
  const session = state.activeSession;
  const current = session.exercises[session.currentIndex];

  const waitingIndex = session.exercises.findIndex(e => e.status === "waiting");
  if (waitingIndex >= 0) {
    current.status = current.status === "completed" ? "completed" : current.status;
    session.currentIndex = waitingIndex;
    session.exercises[waitingIndex].status = "active";
    return;
  }

  const postponedIndex = session.exercises.findIndex(e => e.status === "postponed");
  if (postponedIndex >= 0) {
    session.currentIndex = postponedIndex;
    session.exercises[postponedIndex].status = "active";
    return;
  }

  navigate("finish");
}

function postponeCurrent() {
  const session = state.activeSession;
  session.exercises[session.currentIndex].status = "postponed";
  moveNext();
  saveState();
  render();
}

function openExercise(index) {
  const session = state.activeSession;
  const current = session.exercises[session.currentIndex];
  if (current && current.status === "active" && current.position !== index) {
    current.status = "waiting";
  }
  session.currentIndex = index;
  const target = session.exercises[index];
  if (!["completed", "skipped"].includes(target.status)) target.status = "active";
  saveState();
  navigate("workout");
}

function skipExercise(id) {
  const ex = state.activeSession.exercises.find(e => e.id === id);
  ex.status = "skipped";
  saveState();
  render();
}

function finishWorkout() {
  const session = state.activeSession;
  session.completedAt = new Date().toISOString();
  state.history.unshift(session);
  state.activeSession = null;
  saveState();
  navigate("history");
}

function resetAllData() {
  if (!confirm("Opravdu smazat rozpracovaný trénink i historii?")) return;
  state = defaultState();
  saveState();
  navigate("home");
}

function statusIcon(status) {
  return {
    waiting: "○",
    active: "▶",
    postponed: "⏭",
    completed: "✓",
    skipped: "—"
  }[status] || "○";
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(new Date(iso));
}

function header(title, backAction = null) {
  return `
    <div class="header">
      <div>
        ${backAction ? `<button class="ghost" data-action="${backAction}">← Zpět</button>` : ""}
        <h1>${title}</h1>
      </div>
    </div>`;
}

function homeScreen() {
  const active = state.activeSession;
  return `
    ${header("My Trainings")}
    ${active ? `
      <div class="card" style="margin-bottom:14px">
        <div class="muted small">Rozpracovaný trénink</div>
        <h3>${active.workoutName}</h3>
        <p class="muted">${active.exercises.filter(e => e.status === "completed").length}/${active.exercises.length} cviků</p>
        <button class="primary" data-action="resume">Pokračovat</button>
      </div>` : ""}
    <div class="stack">
      ${templates.map(t => `
        <button class="workout-button" data-template="${t.id}">
          <span><strong>${t.name}</strong>${t.exercises.length ? `<div class="small muted">${t.exercises.length} cviky</div>` : `<div class="small muted">Připravujeme</div>`}</span>
          <span>›</span>
        </button>`).join("")}
    </div>
    <div class="nav">
      <button class="secondary" data-action="history">Historie</button>
      <button class="secondary" data-action="settings">Nastavení</button>
    </div>`;
}

function preparationScreen() {
  const template = templates.find(t => t.id === route.templateId);
  if (!template) return homeScreen();

  if (!template.exercises.length) {
    return `${header(template.name, "home")}
      <div class="notice">Tento trénink ještě není připravený.</div>`;
  }

  return `
    ${header(template.name, "home")}
    <div class="card">
      <ul class="exercise-list">
        ${template.exercises.map(ex => `
          <li class="exercise-row">
            <div><strong>${ex.name}</strong><div class="small muted">${ex.sets} × ${ex.range}</div></div>
          </li>`).join("")}
      </ul>
    </div>
    <div class="actions">
      <button class="primary" data-start="${template.id}">Začít trénink</button>
    </div>`;
}

function workoutScreen() {
  const session = state.activeSession;
  if (!session) return homeScreen();
  const ex = currentExercise();
  if (!ex) return finishScreen();

  return `
    ${header(session.workoutName)}
    <button class="ghost" data-action="overview">${ex.position + 1} / ${session.exercises.length} · Přehled</button>
    <div class="progress">
      ${session.exercises.map((item, i) => `<span class="${item.status === "completed" ? "done" : i === session.currentIndex ? "current" : ""}"></span>`).join("")}
    </div>
    <div class="card">
      <h2>${ex.name}</h2>
      <p class="muted">${ex.sets.length} × ${ex.range}</p>
      <div class="stack">
        ${ex.sets.map(set => `
          <div class="set-row">
            <strong>${set.position + 1}.</strong>
            <input aria-label="Váha v kg" inputmode="decimal" type="number" step="0.5"
              value="${set.weight}" data-exercise="${ex.id}" data-set="${set.id}" data-field="weight" />
            <input aria-label="Opakování" inputmode="numeric" type="number"
              value="${set.reps}" data-exercise="${ex.id}" data-set="${set.id}" data-field="reps" />
            <button class="check ${set.completed ? "done" : ""}" data-complete="${ex.id}:${set.id}">
              ${set.completed ? "✓" : ""}
            </button>
          </div>`).join("")}
      </div>
    </div>
    <div class="actions">
      <button class="secondary" data-action="postpone">Přeskočit prozatím</button>
      <button class="ghost" data-action="close">Zavřít a uložit</button>
    </div>`;
}

function overviewScreen() {
  const s = state.activeSession;
  return `
    ${header(s.workoutName, "workout")}
    <div class="card">
      <ul class="exercise-list">
        ${s.exercises.map((ex, i) => `
          <li>
            <button class="workout-button" style="box-shadow:none;padding-left:0;padding-right:0" data-open-exercise="${i}">
              <span class="status">${statusIcon(ex.status)}</span>
              <span style="flex:1"><strong>${ex.name}</strong><div class="small muted">${ex.sets.filter(x => x.completed).length}/${ex.sets.length} sérií</div></span>
              <span>›</span>
            </button>
          </li>`).join("")}
      </ul>
    </div>`;
}

function finishScreen() {
  const s = state.activeSession;
  if (!s) return homeScreen();
  const unfinished = s.exercises.filter(e => !["completed", "skipped"].includes(e.status));
  const completedSets = s.exercises.flatMap(e => e.sets).filter(x => x.completed).length;

  return `
    ${header("Dokončení", "workout")}
    <div class="summary-grid">
      <div class="summary-item"><strong>${s.exercises.filter(e => e.status === "completed").length}/${s.exercises.length}</strong><span class="muted small">cviků</span></div>
      <div class="summary-item"><strong>${completedSets}</strong><span class="muted small">sérií</span></div>
    </div>
    ${unfinished.length ? `
      <div class="card" style="margin-top:12px">
        <h3>Nedokončené cviky</h3>
        ${unfinished.map(ex => `
          <div class="exercise-row">
            <span>${ex.name}</span>
            <button class="ghost" data-skip="${ex.id}">Vynechat</button>
          </div>`).join("")}
      </div>` : ""}
    <div class="actions">
      <button class="primary" data-action="finish">Dokončit trénink</button>
    </div>`;
}

function historyScreen() {
  return `
    ${header("Historie", "home")}
    ${state.history.length === 0 ? `<div class="card muted">Zatím žádný dokončený trénink.</div>` :
      state.history.map(item => `
        <button class="workout-button history-item" data-history="${item.id}">
          <span><strong>${item.workoutName}</strong><div class="small muted">${formatDate(item.completedAt || item.startedAt)}</div></span>
          <span>›</span>
        </button>`).join("")}`;
}

function historyDetailScreen() {
  const s = state.history.find(x => x.id === route.historyId);
  if (!s) return historyScreen();

  return `
    ${header(s.workoutName, "history")}
    <p class="muted">${formatDate(s.completedAt || s.startedAt)}</p>
    <div class="stack">
      ${s.exercises.map(ex => `
        <div class="card">
          <h3>${ex.name}</h3>
          ${ex.status === "skipped" ? `<p class="muted">Neodcvičeno</p>` :
            ex.sets.filter(x => x.completed).map(set =>
              `<div>${set.weight} kg × ${set.reps}</div>`
            ).join("") || `<p class="muted">Bez dokončených sérií</p>`}
        </div>`).join("")}
    </div>`;
}

function settingsScreen() {
  return `
    ${header("Nastavení", "home")}
    <div class="card">
      <p class="muted">Data jsou uložená pouze v tomto Safari na tomto iPhonu.</p>
      <button class="danger" data-action="reset">Smazat všechna data</button>
    </div>`;
}

function render() {
  const app = document.querySelector("#app");
  const html = {
    home: homeScreen,
    preparation: preparationScreen,
    workout: workoutScreen,
    overview: overviewScreen,
    finish: finishScreen,
    history: historyScreen,
    historyDetail: historyDetailScreen,
    settings: settingsScreen
  }[route.screen]?.() || homeScreen();

  app.innerHTML = html;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-template]").forEach(el =>
    el.addEventListener("click", () => navigate("preparation", { templateId: el.dataset.template }))
  );

  document.querySelectorAll("[data-start]").forEach(el =>
    el.addEventListener("click", () => startWorkout(el.dataset.start))
  );

  document.querySelectorAll("[data-complete]").forEach(el =>
    el.addEventListener("click", () => {
      const [exerciseId, setId] = el.dataset.complete.split(":");
      completeSet(exerciseId, setId);
    })
  );

  document.querySelectorAll("input[data-field]").forEach(el =>
    el.addEventListener("change", () =>
      updateSet(el.dataset.exercise, el.dataset.set, el.dataset.field, el.value)
    )
  );

  document.querySelectorAll("[data-open-exercise]").forEach(el =>
    el.addEventListener("click", () => openExercise(Number(el.dataset.openExercise)))
  );

  document.querySelectorAll("[data-skip]").forEach(el =>
    el.addEventListener("click", () => skipExercise(el.dataset.skip))
  );

  document.querySelectorAll("[data-history]").forEach(el =>
    el.addEventListener("click", () => navigate("historyDetail", { historyId: el.dataset.history }))
  );

  document.querySelectorAll("[data-action]").forEach(el =>
    el.addEventListener("click", () => {
      const action = el.dataset.action;
      if (action === "home") navigate("home");
      if (action === "resume" || action === "workout") navigate("workout");
      if (action === "overview") navigate("overview");
      if (action === "postpone") postponeCurrent();
      if (action === "close") navigate("home");
      if (action === "finish") finishWorkout();
      if (action === "history") navigate("history");
      if (action === "settings") navigate("settings");
      if (action === "reset") resetAllData();
    })
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}

render();
