const STORAGE_KEY = "my-trainings-v4";

const LABELS = {
  glutes: "Hýždě",
  hamstrings: "Zadní stehna",
  quads: "Přední stehna",
  back: "Záda",
  shoulders: "Ramena",
  arms: "Paže",
  chest: "Hrudník",
  core: "Core",
  hipMobility: "Mobilita kyčlí",
  stability: "Stabilita",
  balance: "Rovnováha",
  coordination: "Koordinace",
  ankles: "Kotníky"
};

const TEMPLATES = [
  {
    id: "workout-a",
    name: "Workout A",
    subtitle: "Síla spodní poloviny těla",
    sections: [
      { category: "glutes", count: 3 },
      { category: "hamstrings", count: 2 },
      { category: "quads", count: 2 },
      { category: "core", count: 1 },
      { category: "hipMobility", count: 1 }
    ]
  },
  {
    id: "workout-b",
    name: "Workout B",
    subtitle: "Horní část těla + držení těla",
    sections: [
      { category: "back", count: 3 },
      { category: "shoulders", count: 2 },
      { category: "arms", count: 2 },
      { category: "chest", count: 1 },
      { category: "core", count: 1 }
    ]
  },
  {
    id: "workout-c",
    name: "Workout C",
    subtitle: "Funkční celé tělo",
    sections: [
      { category: "glutes", count: 2 },
      { category: "back", count: 2 },
      { category: "core", count: 1 },
      { category: "stability", count: 1 },
      { category: "balance", count: 1 },
      { category: "coordination", count: 1 }
    ]
  },
  {
    id: "hiking",
    name: "Hiking",
    subtitle: "Krátký doplněk pro turistiku",
    sections: [
      { category: "hipMobility", count: 1 },
      { category: "core", count: 1 },
      { category: "stability", count: 1 },
      { category: "ankles", count: 1 },
      { category: "glutes", count: 1 }
    ]
  },
  {
    id: "micro",
    name: "Micro Workout",
    subtitle: "15–20 minut doma",
    fixedLocation: "home",
    sections: [
      { category: "glutes", count: 1 },
      { category: "back", count: 1 },
      { category: "core", count: 1 },
      { category: "hipMobility", count: 1 }
    ]
  }
];

const EXERCISES = [
  {id:"hip_thrust",name:"Hip thrust",category:"glutes",locations:["home","gym"],sets:3,reps:"8–10"},
  {id:"glute_drive",name:"Glute drive na stroji",category:"glutes",locations:["gym"],sets:3,reps:"8–10"},
  {id:"step_up",name:"Výstupy na lavičku",category:"glutes",locations:["home","gym"],sets:3,reps:"8–10 / noha"},
  {id:"bulgarian_split",name:"Bulharský dřep",category:"glutes",locations:["home","gym"],sets:3,reps:"8–10 / noha"},
  {id:"hip_abduction",name:"Unožování",category:"glutes",locations:["home","gym"],sets:3,reps:"12–15"},
  {id:"cable_kickback",name:"Zakopávání nohy na kladce",category:"glutes",locations:["gym"],sets:3,reps:"12–15 / noha"},
  {id:"glute_bridge",name:"Glute bridge",category:"glutes",locations:["home"],sets:3,reps:"12–15"},
  {id:"frog_pump",name:"Frog pumps",category:"glutes",locations:["home"],sets:3,reps:"15–20"},

  {id:"rdl",name:"Rumunský mrtvý tah",category:"hamstrings",locations:["home","gym"],sets:3,reps:"8–10"},
  {id:"good_morning",name:"Good morning",category:"hamstrings",locations:["home","gym"],sets:3,reps:"8–12"},
  {id:"leg_curl_seated",name:"Zakopávání vsedě",category:"hamstrings",locations:["gym"],sets:3,reps:"10–12"},
  {id:"leg_curl_lying",name:"Zakopávání vleže",category:"hamstrings",locations:["gym"],sets:3,reps:"10–12"},
  {id:"ball_curl",name:"Zakopávání na míči",category:"hamstrings",locations:["home"],sets:3,reps:"10–12"},
  {id:"band_curl",name:"Zakopávání s gumou",category:"hamstrings",locations:["home"],sets:3,reps:"12–15"},

  {id:"leg_press",name:"Leg press",category:"quads",locations:["gym"],sets:3,reps:"8–12"},
  {id:"hack_squat",name:"Hack squat",category:"quads",locations:["gym"],sets:3,reps:"8–12"},
  {id:"goblet_squat",name:"Goblet dřep",category:"quads",locations:["home","gym"],sets:3,reps:"8–12"},
  {id:"split_squat",name:"Dělený dřep",category:"quads",locations:["home","gym"],sets:3,reps:"8–10 / noha"},
  {id:"leg_extension",name:"Předkopávání",category:"quads",locations:["gym"],sets:3,reps:"10–15"},
  {id:"band_leg_extension",name:"Předkopávání s gumou",category:"quads",locations:["home"],sets:3,reps:"12–15"},

  {id:"lat_pulldown",name:"Přítahy horní kladky",category:"back",locations:["gym"],sets:3,reps:"8–12"},
  {id:"seated_row",name:"Přítahy spodní kladky",category:"back",locations:["gym"],sets:3,reps:"8–12"},
  {id:"chest_row",name:"Přítahy s oporou hrudníku",category:"back",locations:["gym"],sets:3,reps:"8–12"},
  {id:"one_arm_row",name:"Přítah jednoručky",category:"back",locations:["home","gym"],sets:3,reps:"8–12 / strana"},
  {id:"band_row",name:"Přítahy gumy",category:"back",locations:["home"],sets:3,reps:"12–15"},
  {id:"face_pull",name:"Face pull",category:"back",locations:["home","gym"],sets:3,reps:"12–15"},

  {id:"external_rotation",name:"Zevní rotace ramene",category:"shoulders",locations:["home","gym"],sets:3,reps:"12–15"},
  {id:"y_raise",name:"Y raise",category:"shoulders",locations:["home","gym"],sets:3,reps:"10–15"},
  {id:"reverse_fly",name:"Obrácené rozpažování",category:"shoulders",locations:["home","gym"],sets:3,reps:"10–15"},
  {id:"wall_slide",name:"Wall slide",category:"shoulders",locations:["home","gym"],sets:3,reps:"10–12"},

  {id:"hammer_curl",name:"Kladivový zdvih",category:"arms",locations:["home","gym"],sets:3,reps:"10–12"},
  {id:"biceps_curl",name:"Bicepsový zdvih",category:"arms",locations:["home","gym"],sets:3,reps:"10–12"},
  {id:"triceps_pushdown",name:"Stahování kladky na triceps",category:"arms",locations:["gym"],sets:3,reps:"10–12"},
  {id:"overhead_triceps",name:"Tricepsový tlak nad hlavou",category:"arms",locations:["home","gym"],sets:3,reps:"10–12"},

  {id:"chest_press",name:"Chest press",category:"chest",locations:["gym"],sets:3,reps:"8–12"},
  {id:"dumbbell_press",name:"Tlaky s jednoručkami",category:"chest",locations:["home","gym"],sets:3,reps:"8–12"},
  {id:"push_up",name:"Kliky",category:"chest",locations:["home","gym"],sets:3,reps:"6–15"},
  {id:"incline_push_up",name:"Kliky o vyvýšenou oporu",category:"chest",locations:["home","gym"],sets:3,reps:"8–15"},

  {id:"pallof",name:"Pallof press",category:"core",locations:["home","gym"],sets:3,reps:"10–12 / strana"},
  {id:"dead_bug",name:"Dead bug",category:"core",locations:["home","gym"],sets:3,reps:"8–10 / strana"},
  {id:"side_plank",name:"Boční plank",category:"core",locations:["home","gym"],sets:3,reps:"25–40 s / strana"},
  {id:"plank",name:"Plank",category:"core",locations:["home","gym"],sets:3,reps:"30–45 s"},
  {id:"suitcase_carry",name:"Suitcase carry",category:"core",locations:["home","gym"],sets:3,reps:"30–40 m / strana"},

  {id:"hip_90_90",name:"90/90 kyčle",category:"hipMobility",locations:["home","gym"],sets:2,reps:"6–8 / strana"},
  {id:"hip_flexor_stretch",name:"Protažení flexorů kyčle",category:"hipMobility",locations:["home","gym"],sets:2,reps:"30–45 s / strana"},
  {id:"adductor_rockback",name:"Adductor rock back",category:"hipMobility",locations:["home","gym"],sets:2,reps:"8–10 / strana"},
  {id:"cossack_mobility",name:"Kozácký dřep pro mobilitu",category:"hipMobility",locations:["home","gym"],sets:2,reps:"6–8 / strana"},

  {id:"single_balance",name:"Stoj na jedné noze",category:"stability",locations:["home","gym"],sets:3,reps:"30–45 s / noha"},
  {id:"single_rdl_balance",name:"Jednonožní tah s dosahem",category:"stability",locations:["home","gym"],sets:3,reps:"8 / noha"},
  {id:"step_down_control",name:"Kontrolovaný sestup",category:"stability",locations:["home","gym"],sets:3,reps:"8–10 / noha"},

  {id:"tandem_walk",name:"Chůze pata–špička",category:"balance",locations:["home","gym"],sets:3,reps:"10–15 kroků"},
  {id:"single_leg_reach",name:"Dosahy ve stoji na jedné noze",category:"balance",locations:["home","gym"],sets:3,reps:"6–8 / směr"},
  {id:"balance_pad",name:"Stoj na balanční podložce",category:"balance",locations:["gym"],sets:3,reps:"30–45 s"},

  {id:"cross_crawl",name:"Cross crawl",category:"coordination",locations:["home","gym"],sets:3,reps:"30–45 s"},
  {id:"bear_crawl",name:"Bear crawl",category:"coordination",locations:["home","gym"],sets:3,reps:"20–30 s"},
  {id:"lateral_step_pattern",name:"Boční krokový vzor",category:"coordination",locations:["home","gym"],sets:3,reps:"30–45 s"},

  {id:"calf_raise",name:"Výpony lýtek",category:"ankles",locations:["home","gym"],sets:3,reps:"12–20"},
  {id:"tibialis_raise",name:"Zvedání špiček",category:"ankles",locations:["home","gym"],sets:3,reps:"12–20"},
  {id:"ankle_mobility",name:"Mobilita kotníku u stěny",category:"ankles",locations:["home","gym"],sets:2,reps:"8–10 / strana"}
];

let state = loadState();
let route = { screen: "home", templateId: null, location: null, category: null, slotIndex: null };

function defaultState() {
  return { selections: {}, activeSession: null, history: [] };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaultState(), ...saved };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function templateById(id) {
  return TEMPLATES.find(t => t.id === id);
}

function exerciseById(id) {
  return EXERCISES.find(ex => ex.id === id);
}

function selectionKey(templateId, location) {
  return `${templateId}:${location}`;
}

function getSelections(templateId, location) {
  const key = selectionKey(templateId, location);
  if (!state.selections[key]) state.selections[key] = {};
  return state.selections[key];
}

function selectedFor(templateId, location, category) {
  return getSelections(templateId, location)[category] || [];
}

function navigate(screen, extra = {}) {
  route = { screen, templateId: null, location: null, category: null, slotIndex: null, ...extra };
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function chooseTemplate(templateId) {
  const template = templateById(templateId);
  if (template.fixedLocation) {
    navigate("builder", { templateId, location: template.fixedLocation });
  } else {
    navigate("location", { templateId });
  }
}

function chooseExercise(exerciseId) {
  const list = selectedFor(route.templateId, route.location, route.category);
  list[route.slotIndex] = exerciseId;
  getSelections(route.templateId, route.location)[route.category] = list;
  saveState();
  navigate("builder", { templateId: route.templateId, location: route.location });
}

function removeExercise(category, index) {
  const selections = getSelections(route.templateId, route.location);
  const list = selections[category] || [];
  list[index] = null;
  selections[category] = list;
  saveState();
  render();
}

function isBuilderComplete(templateId, location) {
  const template = templateById(templateId);
  return template.sections.every(section => {
    const ids = selectedFor(templateId, location, section.category);
    return Array.from({ length: section.count }).every((_, index) => Boolean(ids[index]));
  });
}

function startWorkout() {
  const template = templateById(route.templateId);
  const selections = getSelections(route.templateId, route.location);
  const exercises = [];

  template.sections.forEach(section => {
    (selections[section.category] || []).slice(0, section.count).forEach(id => {
      const ex = exerciseById(id);
      if (ex) exercises.push({
        id: crypto.randomUUID(),
        sourceId: ex.id,
        name: ex.name,
        category: ex.category,
        sets: Array.from({ length: ex.sets }, (_, index) => ({
          id: crypto.randomUUID(),
          number: index + 1,
          weight: 0,
          reps: "",
          completed: false
        })),
        target: ex.reps,
        status: "waiting"
      });
    });
  });

  if (exercises.length) exercises[0].status = "active";

  state.activeSession = {
    id: crypto.randomUUID(),
    templateId: template.id,
    workoutName: template.name,
    location: route.location,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    exercises
  };
  saveState();
  navigate("workout");
}

function currentExercise() {
  return state.activeSession?.exercises[state.activeSession.currentIndex];
}

function toggleSet(exerciseId, setId) {
  const session = state.activeSession;
  const exercise = session.exercises.find(ex => ex.id === exerciseId);
  const set = exercise.sets.find(item => item.id === setId);
  set.completed = !set.completed;

  if (exercise.sets.every(item => item.completed)) {
    exercise.status = "completed";
    const next = session.exercises.findIndex(ex => ex.status === "waiting");
    if (next >= 0) {
      session.currentIndex = next;
      session.exercises[next].status = "active";
    } else {
      navigate("finish");
    }
  }
  saveState();
  render();
}

function updateSet(exerciseId, setId, field, value) {
  const exercise = state.activeSession.exercises.find(ex => ex.id === exerciseId);
  const set = exercise.sets.find(item => item.id === setId);
  set[field] = value;
  saveState();
}

function postponeCurrent() {
  const session = state.activeSession;
  session.exercises[session.currentIndex].status = "postponed";
  let next = session.exercises.findIndex(ex => ex.status === "waiting");
  if (next < 0) next = session.exercises.findIndex(ex => ex.status === "postponed");
  if (next >= 0) {
    session.currentIndex = next;
    session.exercises[next].status = "active";
    saveState();
    render();
  } else {
    navigate("finish");
  }
}

function finishWorkout() {
  const session = state.activeSession;
  session.completedAt = new Date().toISOString();
  state.history.unshift(session);
  state.activeSession = null;
  saveState();
  navigate("home");
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
  return `
    ${header("My Trainings")}
    ${state.activeSession ? `
      <div class="card" style="margin-bottom:12px">
        <div class="small muted">Rozpracovaný trénink</div>
        <h3>${state.activeSession.workoutName}</h3>
        <button class="primary" data-action="resume">Pokračovat</button>
      </div>` : ""}
    <div class="stack">
      ${TEMPLATES.map(template => `
        <button class="workout-button" data-template="${template.id}">
          <span>
            <strong>${template.name}</strong>
            <span class="small muted block">${template.subtitle}</span>
          </span>
          <span>›</span>
        </button>`).join("")}
    </div>`;
}

function locationScreen() {
  const template = templateById(route.templateId);
  return `
    ${header(template.name, "home")}
    <h2>Kde dnes cvičíš?</h2>
    <div class="location-grid">
      <button class="location-card" data-location="gym">
        <span class="location-icon">🏋️</span>
        <strong>Posilovna</strong>
      </button>
      <button class="location-card" data-location="home">
        <span class="location-icon">🏠</span>
        <strong>Doma</strong>
      </button>
    </div>`;
}

function builderScreen() {
  const template = templateById(route.templateId);
  const complete = isBuilderComplete(route.templateId, route.location);

  return `
    ${header(template.name, "home")}
    <div class="context-pill">${route.location === "gym" ? "🏋️ Posilovna" : "🏠 Doma"}</div>
    <p class="muted">${template.subtitle}</p>

    <div class="stack">
      ${template.sections.map(section => {
        const selected = selectedFor(template.id, route.location, section.category);
        return `
          <section class="card">
            <div class="section-heading">
              <div>
                <h3>${LABELS[section.category]}</h3>
                <div class="small muted">Vyber ${section.count} ${section.count === 1 ? "cvik" : section.count < 5 ? "cviky" : "cviků"}</div>
              </div>
              <div class="slot-count">${selected.filter(Boolean).slice(0, section.count).length}/${section.count}</div>
            </div>
            <div class="slot-list">
              ${Array.from({ length: section.count }, (_, index) => {
                const ex = exerciseById(selected[index]);
                return ex ? `
                  <div class="selected-slot">
                    <button class="slot-main" data-pick="${section.category}:${index}">
                      <span class="slot-number">${index + 1}</span>
                      <span><strong>${ex.name}</strong><span class="small muted block">${ex.sets} × ${ex.reps}</span></span>
                    </button>
                    <button class="slot-remove" data-remove="${section.category}:${index}" aria-label="Odebrat">×</button>
                  </div>
                ` : `
                  <button class="empty-slot" data-pick="${section.category}:${index}">
                    <span class="slot-number">${index + 1}</span>
                    <span>Vybrat cvik</span>
                    <span>+</span>
                  </button>`;
              }).join("")}
            </div>
          </section>`;
      }).join("")}
    </div>

    <div class="sticky-action">
      <button class="primary" data-action="start" ${complete ? "" : "disabled"}>
        ${complete ? "Začít trénink" : "Nejdřív vyber všechny cviky"}
      </button>
    </div>`;
}

function libraryScreen() {
  const available = EXERCISES.filter(ex =>
    ex.category === route.category && ex.locations.includes(route.location)
  );
  const selected = selectedFor(route.templateId, route.location, route.category);

  return `
    ${header(LABELS[route.category], "builder")}
    <p class="muted">Slot ${route.slotIndex + 1} · ${route.location === "gym" ? "Posilovna" : "Doma"}</p>
    <div class="stack">
      ${available.map(ex => {
        const usedInOtherSlot = selected.some((id, index) => id === ex.id && index !== route.slotIndex);
        return `
          <button class="exercise-choice ${usedInOtherSlot ? "disabled-choice" : ""}"
            data-exercise="${ex.id}" ${usedInOtherSlot ? "disabled" : ""}>
            <span>
              <strong>${ex.name}</strong>
              <span class="small muted block">${ex.sets} × ${ex.reps}</span>
            </span>
            <span>${selected[route.slotIndex] === ex.id ? "✓" : "›"}</span>
          </button>`;
      }).join("")}
    </div>`;
}

function workoutScreen() {
  const session = state.activeSession;
  if (!session) return homeScreen();
  const ex = currentExercise();

  return `
    ${header(session.workoutName)}
    <div class="context-pill">${session.location === "gym" ? "🏋️ Posilovna" : "🏠 Doma"} · ${session.currentIndex + 1}/${session.exercises.length}</div>
    <div class="card">
      <div class="small muted">${LABELS[ex.category]}</div>
      <h2>${ex.name}</h2>
      <p class="muted">Cíl: ${ex.target}</p>
      <div class="stack">
        ${ex.sets.map(set => `
          <div class="set-row">
            <strong>${set.number}.</strong>
            <input inputmode="decimal" type="number" step="0.5" placeholder="kg"
              value="${set.weight || ""}" data-set-field="${ex.id}:${set.id}:weight">
            <input inputmode="numeric" type="number" placeholder="opak."
              value="${set.reps}" data-set-field="${ex.id}:${set.id}:reps">
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

function finishScreen() {
  const session = state.activeSession;
  const completed = session.exercises.filter(ex => ex.status === "completed").length;
  return `
    ${header("Dokončení", "workout")}
    <div class="card">
      <h2>${session.workoutName}</h2>
      <p class="muted">Dokončeno ${completed} z ${session.exercises.length} cviků.</p>
      <button class="primary" data-action="finish">Dokončit trénink</button>
    </div>`;
}

function render() {
  const screens = {
    home: homeScreen,
    location: locationScreen,
    builder: builderScreen,
    library: libraryScreen,
    workout: workoutScreen,
    finish: finishScreen
  };
  document.querySelector("#app").innerHTML = (screens[route.screen] || homeScreen)();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-template]").forEach(button =>
    button.addEventListener("click", () => chooseTemplate(button.dataset.template))
  );

  document.querySelectorAll("[data-location]").forEach(button =>
    button.addEventListener("click", () =>
      navigate("builder", { templateId: route.templateId, location: button.dataset.location })
    )
  );

  document.querySelectorAll("[data-pick]").forEach(button =>
    button.addEventListener("click", () => {
      const [category, index] = button.dataset.pick.split(":");
      navigate("library", {
        templateId: route.templateId,
        location: route.location,
        category,
        slotIndex: Number(index)
      });
    })
  );

  document.querySelectorAll("[data-remove]").forEach(button =>
    button.addEventListener("click", () => {
      const [category, index] = button.dataset.remove.split(":");
      removeExercise(category, Number(index));
    })
  );

  document.querySelectorAll("[data-exercise]").forEach(button =>
    button.addEventListener("click", () => chooseExercise(button.dataset.exercise))
  );

  document.querySelectorAll("[data-complete]").forEach(button =>
    button.addEventListener("click", () => {
      const [exerciseId, setId] = button.dataset.complete.split(":");
      toggleSet(exerciseId, setId);
    })
  );

  document.querySelectorAll("[data-set-field]").forEach(input =>
    input.addEventListener("change", () => {
      const [exerciseId, setId, field] = input.dataset.setField.split(":");
      updateSet(exerciseId, setId, field, input.value);
    })
  );

  document.querySelectorAll("[data-action]").forEach(button =>
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "home") navigate("home");
      if (action === "builder") navigate("builder", { templateId: route.templateId, location: route.location });
      if (action === "resume" || action === "workout") navigate("workout");
      if (action === "start") startWorkout();
      if (action === "postpone") postponeCurrent();
      if (action === "close") navigate("home");
      if (action === "finish") finishWorkout();
    })
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
}

render();
