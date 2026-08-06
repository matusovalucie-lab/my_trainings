const STORAGE_KEY = "my-trainings-state-v5";
let SETTINGS = { language: "cs", defaultLocation: "gym", weightUnit: "kg", version: "0.6.0-alpha.4" };
const LEGACY_KEY = "my-trainings-v4";

let WORKOUTS = [];
let AREAS = {};
let EXERCISES = [];
let state = loadState();
let route = { screen: "home", workoutId: null, location: null, area: null, slotIndex: null, historyId: null };

function defaultState() { return { selections: {}, activeSession: null, history: [] }; }
function loadState() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (current) return { ...defaultState(), ...current };
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    return legacy ? { ...defaultState(), ...legacy } : defaultState();
  } catch { return defaultState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function loadData() {
  const [workouts, areas, exercises, settings] = await Promise.all([
    fetchJson("./data/workouts.json"),
    fetchJson("./data/areas.json"),
    fetchJson("./data/exercises.json"),
    fetchJson("./data/settings.json")
  ]);
  WORKOUTS = workouts;
  AREAS = areas;
  EXERCISES = exercises;
  SETTINGS = { ...SETTINGS, ...settings };
}

function workoutById(id) { return WORKOUTS.find(w => w.id === id); }
function exerciseById(id) { return EXERCISES.find(e => e.id === id); }
function areaMeta(id) { return AREAS[id] || { name: id, icon: "•", color: "#64748b" }; }
function selectionKey(workoutId, location) { return `${workoutId}:${location}`; }
function getSelections(workoutId, location) {
  const key = selectionKey(workoutId, location);
  if (!state.selections[key]) state.selections[key] = {};
  return state.selections[key];
}
function selectedFor(workoutId, location, area) { return getSelections(workoutId, location)[area] || []; }
function formatExercise(ex) { return `<strong>${ex.cs}</strong><span class="en-name">(${ex.en})</span>`; }
function locationLabel(location) { return location === "gym" ? "🏋️ Posilovna" : "🏠 Doma"; }
function pluralCvik(n) { return n === 1 ? "cvik" : n < 5 ? "cviky" : "cviků"; }
function navigate(screen, extra = {}) {
  route = { screen, workoutId: null, location: null, area: null, slotIndex: null, historyId: null, ...extra };
  render(); window.scrollTo({ top: 0, behavior: "instant" });
}

function chooseWorkout(id) {
  const workout = workoutById(id);
  if (workout.fixedLocation) navigate("builder", { workoutId: id, location: workout.fixedLocation });
  else navigate("location", { workoutId: id });
}
function chooseExercise(id) {
  const selections = getSelections(route.workoutId, route.location);
  const list = selections[route.area] || [];
  list[route.slotIndex] = id; selections[route.area] = list; saveState();
  navigate("builder", { workoutId: route.workoutId, location: route.location });
}
function removeExercise(area, index) {
  const selections = getSelections(route.workoutId, route.location);
  const list = selections[area] || []; list[index] = null; selections[area] = list; saveState(); render();
}
function builderComplete(workoutId, location) {
  const workout = workoutById(workoutId);
  return workout.sections.every(section => Array.from({ length: section.count }, (_, i) => Boolean(selectedFor(workoutId, location, section.area)[i])).every(Boolean));
}

function startWorkout() {
  const workout = workoutById(route.workoutId);
  const selections = getSelections(route.workoutId, route.location);
  const exercises = [];
  workout.sections.forEach(section => {
    (selections[section.area] || []).slice(0, section.count).forEach(sourceId => {
      const source = exerciseById(sourceId); if (!source) return;
      exercises.push({
        id: crypto.randomUUID(), sourceId: source.id, cs: source.cs, en: source.en, area: source.primary,
        target: source.reps, status: "waiting",
        sets: Array.from({ length: source.sets }, (_, i) => ({ id: crypto.randomUUID(), number: i + 1, weight: "", reps: "", completed: false }))
      });
    });
  });
  if (exercises[0]) exercises[0].status = "active";
  state.activeSession = { id: crypto.randomUUID(), workoutId: workout.id, workoutName: workout.name, theme: workout.theme, location: route.location, startedAt: new Date().toISOString(), currentIndex: 0, exercises };
  saveState(); navigate("workout");
}
function currentExercise() { return state.activeSession?.exercises[state.activeSession.currentIndex]; }

function nextExerciseIndex(session, fromIndex = session.currentIndex) {
  if (!session?.exercises?.length) return -1;

  const total = session.exercises.length;
  const findByStatus = status => {
    for (let offset = 1; offset <= total; offset += 1) {
      const index = (fromIndex + offset) % total;
      if (index !== fromIndex && session.exercises[index].status === status) return index;
    }
    return -1;
  };

  const waiting = findByStatus("waiting");
  if (waiting >= 0) return waiting;
  return findByStatus("postponed");
}

function activateExercise(index) {
  const session = state.activeSession;
  if (!session || index < 0 || index >= session.exercises.length) return;

  const current = session.exercises[session.currentIndex];
  if (current && current.status === "active" && session.currentIndex !== index) {
    current.status = "postponed";
  }

  session.currentIndex = index;
  if (session.exercises[index].status !== "completed") {
    session.exercises[index].status = "active";
  }

  saveState();
  navigate("workout");
}

function nextExercise() {
  const session = state.activeSession;
  if (!session) return null;
  const index = nextExerciseIndex(session);
  return index >= 0 ? session.exercises[index] : null;
}

function remainingExerciseQueue(session) {
  if (!session?.exercises?.length) return [];

  const total = session.exercises.length;
  const ordered = [];

  for (let offset = 1; offset <= total; offset += 1) {
    const index = (session.currentIndex + offset) % total;
    const exercise = session.exercises[index];
    if (exercise.status === "waiting") ordered.push({ exercise, index });
  }

  for (let offset = 1; offset <= total; offset += 1) {
    const index = (session.currentIndex + offset) % total;
    const exercise = session.exercises[index];
    if (exercise.status === "postponed") ordered.push({ exercise, index });
  }

  return ordered;
}

function updateSet(exerciseId, setId, field, value) {
  const ex = state.activeSession.exercises.find(e => e.id === exerciseId);
  const set = ex.sets.find(s => s.id === setId); set[field] = value; saveState();
}
function toggleSet(exerciseId, setId) {
  const session = state.activeSession;
  const ex = session.exercises.find(e => e.id === exerciseId);
  const set = ex.sets.find(s => s.id === setId);

  set.completed = !set.completed;

  if (ex.sets.every(s => s.completed)) {
    ex.status = "completed";
    const next = nextExerciseIndex(session);

    if (next >= 0) {
      session.currentIndex = next;
      session.exercises[next].status = "active";
    } else {
      saveState();
      navigate("finish");
      return;
    }
  } else if (ex.status === "completed") {
    ex.status = "active";
  }

  saveState();
  render();
}
function addSet() {
  const ex = currentExercise(); ex.sets.push({ id: crypto.randomUUID(), number: ex.sets.length + 1, weight: "", reps: "", completed: false }); saveState(); render();
}
function postponeCurrent() {
  const session = state.activeSession;
  if (!session) return;

  const currentIndex = session.currentIndex;
  session.exercises[currentIndex].status = "postponed";

  const next = nextExerciseIndex(session, currentIndex);
  if (next >= 0) {
    session.currentIndex = next;
    session.exercises[next].status = "active";
    saveState();
    render();
  } else {
    saveState();
    navigate("finish");
  }
}
function closeAndSaveWorkout() {
  const session = state.activeSession;
  if (!session) { navigate("home"); return; }

  session.completedAt = new Date().toISOString();
  state.history.unshift(session);
  state.activeSession = null;
  saveState();
  navigate("history");
}

function finishWorkout() {
  const session = state.activeSession;
  if (!session) { navigate("home"); return; }

  session.completedAt = new Date().toISOString();
  state.history.unshift(session);
  state.activeSession = null;
  saveState();
  navigate("history");
}

function header(title, back = null, subtitle = "") {
  return `<header class="header">${back ? `<button class="back" data-action="${back}">←</button>` : `<span class="header-spacer"></span>`}<div class="header-copy"><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div><span class="header-spacer"></span></header>`;
}
function homeScreen() {
  const lastWorkoutId = state.history[0]?.workoutId || null;
  return `${header("My Trainings", null, "Vyber dnešní trénink.")}
  ${state.activeSession ? `<section class="resume-card"><div><span>Rozpracovaný trénink</span><strong>${state.activeSession.workoutName}</strong></div><button data-action="resume">Pokračovat</button></section>` : ""}
  <main class="workout-grid">${WORKOUTS.map(w => `<button class="workout-card ${w.theme}" data-workout="${w.id}"><span><strong>${w.name}</strong><small>${w.subtitle}</small>${w.id === lastWorkoutId ? `<span class="last-badge">Naposledy</span>` : ""}</span><b>›</b></button>`).join("")}</main>
  <nav class="home-nav"><button data-action="history">Historie</button><button data-action="catalog">Cviky</button></nav>`;
}
function locationScreen() {
  const w = workoutById(route.workoutId);
  return `${header(w.name, "home", w.subtitle)}<h2 class="question">Kde dnes cvičíš?</h2><div class="location-grid"><button class="location-card" data-location="home"><span>🏠</span><strong>Doma</strong></button><button class="location-card" data-location="gym"><span>🏋️</span><strong>Posilovna</strong></button></div>`;
}
function builderScreen() {
  const w = workoutById(route.workoutId); const complete = builderComplete(w.id, route.location);
  return `${header(w.name, "home", w.subtitle)}<div class="context-pill">${locationLabel(route.location)}</div><div class="section-stack">${w.sections.map(section => {
    const meta = areaMeta(section.area), selected = selectedFor(w.id, route.location, section.area), filled = selected.slice(0, section.count).filter(Boolean).length;
    return `<section class="area-card" style="--area:${meta.color}"><div class="area-heading"><div class="area-title"><span>${meta.icon}</span><div><h3>${meta.name}</h3><small>Vyber ${section.count} ${pluralCvik(section.count)}</small></div></div><b>${filled}/${section.count}</b></div><div class="slots">${Array.from({ length: section.count }, (_, i) => {
      const ex = exerciseById(selected[i]);
      return ex ? `<div class="selected-slot"><button data-pick="${section.area}:${i}"><span class="number">${i + 1}</span><span>${formatExercise(ex)}<small>${ex.sets} série • ${ex.reps}</small></span></button><button class="remove" data-remove="${section.area}:${i}" aria-label="Odebrat">×</button></div>` : `<button class="empty-slot" data-pick="${section.area}:${i}"><span class="number">${i + 1}</span><span>Vybrat cvik</span><b>+</b></button>`;
    }).join("")}</div></section>`;
  }).join("")}</div><div class="sticky-action"><button class="primary ${w.theme}" data-action="start" ${complete ? "" : "disabled"}>${complete ? "Začít cvičit" : "Nejdřív vyber všechny cviky"}</button></div>`;
}
function libraryScreen() {
  const meta = areaMeta(route.area), selected = selectedFor(route.workoutId, route.location, route.area);
  const available = EXERCISES.filter(e => e.primary === route.area && e.locations.includes(route.location));
  return `${header(meta.name, "builder", `Slot ${route.slotIndex + 1} • ${locationLabel(route.location)}`)}<div class="exercise-list">${available.map(ex => {
    const used = selected.some((id, i) => id === ex.id && i !== route.slotIndex); const active = selected[route.slotIndex] === ex.id;
    return `<button class="exercise-card ${used ? "disabled" : ""}" data-exercise="${ex.id}" ${used ? "disabled" : ""}><span>${formatExercise(ex)}<small>${ex.sets} série • ${ex.reps}</small><em>${ex.equipment?.join(" • ") || "bez pomůcek"}</em></span><b>${active ? "✓" : "›"}</b></button>`;
  }).join("")}</div>`;
}
function workoutScreen() {
  const s = state.activeSession;
  if (!s) return homeScreen();

  const ex = currentExercise();
  const meta = areaMeta(ex.area);
  const remaining = remainingExerciseQueue(s);

  return `${header(s.workoutName, null, `${locationLabel(s.location)} • ${s.currentIndex + 1}/${s.exercises.length}`)}
  <section class="training-card" style="--area:${meta.color}">
    <div class="exercise-area">${meta.icon} ${meta.name}</div>
    <h2>${ex.cs}</h2>
    <p class="english">(${ex.en})</p>
    <p class="target">Cíl: ${ex.target}</p>
    <div class="sets-header"><span>Série</span><span>kg</span><span>opak.</span><span></span></div>
    <div class="sets">${ex.sets.map(set => `<div class="set-row"><strong>${set.number}</strong><input type="number" step="0.5" inputmode="decimal" placeholder="0" value="${set.weight}" data-set="${ex.id}:${set.id}:weight"><input type="number" inputmode="numeric" placeholder="0" value="${set.reps}" data-set="${ex.id}:${set.id}:reps"><button class="check ${set.completed ? "done" : ""}" data-complete="${ex.id}:${set.id}">${set.completed ? "✓" : ""}</button></div>`).join("")}</div>
    <button class="add-set" data-action="add-set">+ Přidat sérii</button>
  </section>

  <section class="remaining-strip-section">
    <div class="remaining-strip-heading">
      <strong>Zbývající cviky</strong>
      <span>${remaining.length}</span>
    </div>
    ${remaining.length ? `
      <div class="remaining-strip" aria-label="Zbývající cviky">
        ${remaining.map((item, position) => {
          const itemMeta = areaMeta(item.exercise.area);
          const postponed = item.exercise.status === "postponed";
          return `<button class="remaining-card ${postponed ? "postponed" : ""}"
            style="--area:${itemMeta.color}"
            data-jump-exercise="${item.index}">
            <span class="remaining-card-label">${position === 0 ? "Další" : postponed ? "Přeskočeno" : itemMeta.name}</span>
            <strong>${item.exercise.cs}</strong>
            <small>${itemMeta.icon} ${itemMeta.name}</small>
          </button>`;
        }).join("")}
      </div>
    ` : `<div class="remaining-strip-empty">Žádné další cviky.</div>`}
  </section>

  <div class="training-actions">
    <button data-action="postpone">Prozatím přeskočit</button>
    <button data-action="close">Zavřít a uložit</button>
  </div>`;
}
function finishScreen() {
  const s = state.activeSession;
  const done = s.exercises.filter(e => e.status === "completed").length;
  const remaining = s.exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(item => item.exercise.status !== "completed");

  return `${header(remaining.length ? "Zbývající cviky" : "Trénink dokončen", remaining.length ? "workout" : null)}
  <section class="finish-card">
    <span class="finish-icon">${remaining.length ? "↩" : "✓"}</span>
    <h2>${s.workoutName}</h2>
    <p>${done} z ${s.exercises.length} cviků dokončeno</p>

    ${remaining.length ? `
      <div class="remaining-exercises">
        ${remaining.map(item => `
          <button data-return-exercise="${item.index}">
            <span>${item.exercise.cs}</span>
            <b>Vrátit se</b>
          </button>
        `).join("")}
      </div>
    ` : ""}

    <button class="primary ${s.theme}" data-action="finish">Uložit trénink</button>
  </section>`;
}
function historyScreen() {
  return `${header("Historie", "home", "Tvoje dokončené tréninky.")}<div class="history-list">${state.history.length ? state.history.map(s => `<button class="history-card" data-history="${s.id}"><span><strong>${s.workoutName}</strong><small>${new Date(s.completedAt || s.startedAt).toLocaleDateString("cs-CZ", { day:"numeric", month:"long", year:"numeric" })}</small></span><b>›</b></button>`).join("") : `<div class="empty-state">Zatím tu není žádný dokončený trénink.</div>`}</div>`;
}
function historyDetailScreen() {
  const s = state.history.find(h => h.id === route.historyId); if (!s) return historyScreen();
  return `${header(s.workoutName, "history", new Date(s.completedAt || s.startedAt).toLocaleDateString("cs-CZ", { day:"numeric", month:"long", year:"numeric" }))}<div class="history-exercises">${s.exercises.map(ex => `<section class="history-exercise"><h3>${ex.cs || ex.name}</h3>${ex.en ? `<p>(${ex.en})</p>` : ""}<div>${ex.sets.map(set => `<span>${set.weight || "—"} kg × ${set.reps || "—"}</span>`).join("")}</div></section>`).join("")}</div>`;
}
function catalogScreen() {
  return `${header("Cviky", "home", "Český název a anglický název v závorce.")}<div class="catalog">${Object.entries(AREAS).map(([id, meta]) => {
    const items = EXERCISES.filter(e => e.primary === id); if (!items.length) return "";
    return `<section class="catalog-area" style="--area:${meta.color}"><h2>${meta.icon} ${meta.name}</h2>${items.map(ex => `<div class="catalog-exercise">${formatExercise(ex)}<small>${ex.sets} série • ${ex.reps} • ${ex.locations.map(l => l === "home" ? "🏠" : "🏋️").join(" ")}</small></div>`).join("")}</section>`;
  }).join("")}</div>`;
}
function loadingScreen(message = "Načítám…") { return `<div class="loading">${message}</div>`; }

function render() {
  const screens = { home: homeScreen, location: locationScreen, builder: builderScreen, library: libraryScreen, workout: workoutScreen, finish: finishScreen, history: historyScreen, historyDetail: historyDetailScreen, catalog: catalogScreen };
  document.querySelector("#app").innerHTML = (screens[route.screen] || homeScreen)(); bindEvents();
}
function bindEvents() {
  document.querySelectorAll("[data-workout]").forEach(b => b.onclick = () => chooseWorkout(b.dataset.workout));
  document.querySelectorAll("[data-location]").forEach(b => b.onclick = () => navigate("builder", { workoutId: route.workoutId, location: b.dataset.location }));
  document.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { const [area, index] = b.dataset.pick.split(":"); navigate("library", { workoutId: route.workoutId, location: route.location, area, slotIndex: Number(index) }); });
  document.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { const [area, index] = b.dataset.remove.split(":"); removeExercise(area, Number(index)); });
  document.querySelectorAll("[data-exercise]").forEach(b => b.onclick = () => chooseExercise(b.dataset.exercise));
  document.querySelectorAll("[data-complete]").forEach(b => b.onclick = () => { const [ex, set] = b.dataset.complete.split(":"); toggleSet(ex, set); });
  document.querySelectorAll("[data-set]").forEach(i => i.onchange = () => { const [ex, set, field] = i.dataset.set.split(":"); updateSet(ex, set, field, i.value); });
  document.querySelectorAll("[data-history]").forEach(b => b.onclick = () => navigate("historyDetail", { historyId: b.dataset.history }));
  document.querySelectorAll("[data-return-exercise]").forEach(b => b.onclick = () => activateExercise(Number(b.dataset.returnExercise)));
  document.querySelectorAll("[data-jump-exercise]").forEach(b => b.onclick = () => activateExercise(Number(b.dataset.jumpExercise)));
  document.querySelectorAll("[data-action]").forEach(b => b.onclick = () => {
    const a = b.dataset.action;
    if (a === "home") navigate("home");
    if (a === "builder") navigate("builder", { workoutId: route.workoutId, location: route.location });
    if (a === "resume" || a === "workout") navigate("workout");
    if (a === "start") startWorkout();
    if (a === "add-set") addSet();
    if (a === "postpone") postponeCurrent();
    if (a === "close") closeAndSaveWorkout();
    if (a === "finish") finishWorkout();
    if (a === "history") navigate("history");
    if (a === "catalog") navigate("catalog");
  });
}

async function init() {
  document.querySelector("#app").innerHTML = loadingScreen();
  try { await loadData(); render(); }
  catch (error) { console.error(error); document.querySelector("#app").innerHTML = loadingScreen("Data se nepodařilo načíst. Obnov stránku po nasazení všech souborů."); }
}
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
init();
