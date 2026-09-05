/* lenegoeslean – Fitness-Tracker
   Alle Daten werden ausschließlich lokal auf diesem Gerät gespeichert
   (localStorage für Trainings-/Challenge-Daten, IndexedDB für Fotos). */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Konfiguration                                                     */
  /* ---------------------------------------------------------------- */

  const STORAGE_KEY = "fitpaw_data_v1";
  const DB_NAME = "fitpaw-photos";
  const DB_STORE = "photos";

  const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const SPORTS = {
    joggen:         { label: "Joggen",           icon: "🐇", bg: "#FFE3D1", fg: "#C97A3B", fields: ["pace", "distanz", "zeit", "kalorien"] },
    inclinewalk:    { label: "Incline-Walk",     icon: "🦊", bg: "#FFDCC2", fg: "#B85C1E", fields: ["zeit", "distanz", "kalorien"] },
    inlineskaten:   { label: "Inline-Skaten",    icon: "🦖", bg: "#FFD9E8", fg: "#D6488B", fields: ["pace", "distanz", "zeit", "kalorien"] },
    zirkeltraining: { label: "Zirkel-Training",  icon: "🦁", bg: "#FFF3C4", fg: "#B08A1E", fields: ["zeit", "kalorien"] },
    cycling:        { label: "Cycling",          icon: "🐝", bg: "#FFF0D6", fg: "#C08A2E", fields: ["zeit", "kalorien"] },
    schwimmen:      { label: "Schwimmen",        icon: "🦈", bg: "#D6F0FF", fg: "#2E86AB", fields: ["zeit", "distanz", "kalorien"] },
    homeworkout:    { label: "Home-Workout",     icon: "🐻", bg: "#E4E9FF", fg: "#5A64B0", fields: ["zeit", "kalorien"] },
    hulahoop:       { label: "Hula-Hoop",        icon: "🐒", bg: "#FFE7CE", fg: "#B87434", fields: ["zeit", "kalorien"] },
    pilates:        { label: "Pilates",          icon: "🫍", bg: "#E9F7EF", fg: "#3F9767", fields: ["zeit", "kalorien"] },
    reformerpilates:{ label: "Reformer-Pilates", icon: "🦒", bg: "#F3E3FF", fg: "#8C4FC9", fields: ["zeit", "kalorien"] },
    padel:          { label: "Padel",            icon: "🐤", bg: "#FFF6C7", fg: "#B8960C", fields: ["zeit", "kalorien"] },
    activerecovery: { label: "Active Recovery",  icon: "🦥", bg: "#E3F4E1", fg: "#4C8C5B", fields: ["zeit", "kalorien"] },
    custom:         { label: "Sonstiges",        icon: "🦄", bg: "#F1E9FF", fg: "#7C5CBF", fields: ["zeit", "kalorien"], custom: true },
    restday:        { label: "Rest-Day",        icon: "🐼", bg: "#ECEAFB", fg: "#6B5FBD", fields: [] }
  };

  const MAX_RESTDAYS_PER_WEEK = 2;

  const DEFAULT_STEPS_GOAL = 10000;
  const DEFAULT_WATER_GOAL_ML = 2000;
  const WATER_STEP_ML = 250;
  const DEFAULT_APP_NAME = "lenegoeslean";
  const DEFAULT_WEEKLY_GOAL_SESSIONS = 4;
  const DEFAULT_WEEKLY_GOAL_MINUTES = 150;
  const DEFAULT_PUSHUPS_GOAL = 20;
  const DEFAULT_PLANK_GOAL_SECONDS = 60;
  const STREAK_FREEZE_PER_MONTH = 1;

  /* Chaos-Modus: an ~jedem 3. Tag (deterministisch pro Datum, kein
     Neu-Würfeln bei jedem Rendern) taucht statt der üblichen Routine eine
     verrückte Mini-Challenge auf – bewusste Unberechenbarkeit gegen die
     Monotonie im Alltag. */
  const CHAOS_CHALLENGES = [
    { icon: "🔄", text: "Rückwärts zählen beim Plank – von deinem Ziel runter bis 0." },
    { icon: "💃", text: "2 Minuten zu deinem Lieblingssong tanzen, so albern wie möglich." },
    { icon: "🐢", text: "Zeitlupen-Training: alle Übungen heute doppelt so langsam wie sonst." },
    { icon: "🤫", text: "Ein Workout in völliger Stille – keine Musik, kein Podcast, nur du." },
    { icon: "🙃", text: "Bei jeder Übung heute laut lachen oder grinsen – Quatsch-Pflicht." },
    { icon: "🖐️", text: "Alles, was geht, heute mit der ungewohnten Seite/Hand machen." },
    { icon: "🎲", text: "Denk dir eine Zahl zwischen 1 und 6 aus und mach so viele Extra-Liegestütze." },
    { icon: "📸", text: "Nach dem Workout eine Siegerpose fotografieren – nur für dich." },
    { icon: "🌙", text: "Ein Teil deines Workouts mit geschlossenen Augen (nur bei sicheren Übungen)." },
    { icon: "🧦", text: "Heute alles in den lustigsten Socken machen, die du besitzt." },
    { icon: "🚶", text: "Erst überlegen, wo du in 15 Minuten sein willst – dann rückwärts-geplant losgehen." },
    { icon: "🗣️", text: "Dir selbst laut ein Kompliment machen, bevor du heute startest." }
  ];

  const MEASUREMENT_TYPES = {
    taille:       { label: "Taille",       icon: "📏" },
    huefte:       { label: "Hüfte",        icon: "📏" },
    brust:        { label: "Brust",        icon: "📏" },
    oberschenkel: { label: "Oberschenkel", icon: "📏" },
    bizeps:       { label: "Bizeps",       icon: "📏" }
  };

  const FIELD_META = {
    pace:     { label: "Pace",     unit: "min/km", type: "text",   placeholder: "z. B. 5:30" },
    distanz:  { label: "Distanz",  unit: "km",      type: "number", step: "0.01", placeholder: "z. B. 5.2" },
    zeit:     { label: "Zeit",     unit: "min",     type: "number", step: "1",    placeholder: "z. B. 30" },
    kalorien: { label: "Kalorien", unit: "kcal",    type: "number", step: "1",    placeholder: "z. B. 250" }
  };

  const THEMES = {
    pink:     { name: "Pink",         swatch: "#FF4D8D", bg: "#FFF6F9", card: "#FFFFFF", text: "#2E2530", textMuted: "#948A93", accent: "#FF4D8D", accentDark: "#E23E76", accentSoft: "#FFDCEA", accentSoft2: "#FFEEF4", border: "#FBE1EC",
      dark: { bg: "#1E1620", card: "#2A1D28", text: "#F5E6EE", textMuted: "#B79AAE", accent: "#FF4D8D", accentDark: "#E23E76", accentSoft: "#4A2836", accentSoft2: "#3A2030", border: "#40293A" } },
    lavender: { name: "Flieder",      swatch: "#8B5CF6", bg: "#F8F6FF", card: "#FFFFFF", text: "#2E2530", textMuted: "#948A93", accent: "#8B5CF6", accentDark: "#6D3FD1", accentSoft: "#E4DBFF", accentSoft2: "#F1ECFF", border: "#EDE7FB",
      dark: { bg: "#1C1830", card: "#241E3D", text: "#ECE7FA", textMuted: "#A79CC4", accent: "#8B5CF6", accentDark: "#6D3FD1", accentSoft: "#3B325C", accentSoft2: "#2E2749", border: "#3A3159" } },
    mint:     { name: "Minze",        swatch: "#2FAE83", bg: "#F2FBF7", card: "#FFFFFF", text: "#2E2530", textMuted: "#948A93", accent: "#2FAE83", accentDark: "#1F8F6A", accentSoft: "#CBF0E0", accentSoft2: "#E3F8EF", border: "#DFF3EA",
      dark: { bg: "#131F1B", card: "#1B2B25", text: "#E3F5EC", textMuted: "#8FB8A9", accent: "#37C795", accentDark: "#1F8F6A", accentSoft: "#1F4436", accentSoft2: "#18352A", border: "#23473A" } },
    peach:    { name: "Pfirsich",     swatch: "#FF8A4C", bg: "#FFF8F1", card: "#FFFFFF", text: "#2E2530", textMuted: "#948A93", accent: "#FF8A4C", accentDark: "#E06B2C", accentSoft: "#FFDFC2", accentSoft2: "#FFEEDF", border: "#FBE7D6",
      dark: { bg: "#211711", card: "#2C1D14", text: "#FBE9DC", textMuted: "#C4A28C", accent: "#FF8A4C", accentDark: "#E06B2C", accentSoft: "#4A3020", accentSoft2: "#3A2618", border: "#4A3122" } },
    sky:      { name: "Himmelblau",   swatch: "#3B9DE8", bg: "#F1F8FF", card: "#FFFFFF", text: "#2E2530", textMuted: "#948A93", accent: "#3B9DE8", accentDark: "#2478C4", accentSoft: "#CFE9FF", accentSoft2: "#E6F4FF", border: "#DDEEFB",
      dark: { bg: "#10192A", card: "#182437", text: "#E3EEFC", textMuted: "#91A9C4", accent: "#4FADF5", accentDark: "#2478C4", accentSoft: "#1F3A5C", accentSoft2: "#182D48", border: "#223A56" } }
  };

  function resolveDarkMode(settings) {
    const mode = (settings || Storage.getSettings()).darkMode || "auto";
    if (mode === "on") return true;
    if (mode === "off") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function applyTheme(key) {
    const t = THEMES[key] || THEMES.pink;
    const isDark = resolveDarkMode();
    const p = isDark && t.dark ? t.dark : t;
    const root = document.documentElement.style;
    root.setProperty("--bg", p.bg);
    root.setProperty("--card", p.card || (isDark ? "#241C22" : "#FFFFFF"));
    root.setProperty("--text", p.text || (isDark ? "#F2EBEF" : "#2E2530"));
    root.setProperty("--text-muted", p.textMuted || (isDark ? "#A79AAE" : "#948A93"));
    root.setProperty("--accent", p.accent || t.accent);
    root.setProperty("--accent-dark", p.accentDark || t.accentDark);
    root.setProperty("--accent-soft", p.accentSoft || t.accentSoft);
    root.setProperty("--accent-soft-2", p.accentSoft2 || t.accentSoft2);
    root.setProperty("--border", p.border || t.border);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute("content", p.bg);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }

  /* Ändert den in der App angezeigten Namen (Header, Titel, Home-Bildschirm-
     Beschriftung für zukünftige "Zum Home-Bildschirm"-Vorgänge). Bereits
     zum Home-Bildschirm hinzugefügte Icons behalten ihren Namen, bis sie
     neu hinzugefügt werden – das ist eine iOS-Einschränkung. */
  function applyAppName(name) {
    const safeName = (name || "").trim() || DEFAULT_APP_NAME;

    document.title = `${safeName} – Fitness-Tracker`;
    const brandEl = document.getElementById("brandName");
    if (brandEl) brandEl.textContent = safeName;
    const appleTitle = document.getElementById("appleTitleMeta");
    if (appleTitle) appleTitle.setAttribute("content", safeName);

    const link = document.getElementById("manifestLink");
    if (!link) return;

    if (safeName === DEFAULT_APP_NAME) {
      // Zurück zum Standard-Manifest (Datei), kein Blob nötig.
      if (link.dataset.blobUrl) {
        URL.revokeObjectURL(link.dataset.blobUrl);
        delete link.dataset.blobUrl;
      }
      link.href = "manifest.json";
      return;
    }

    try {
      const manifest = {
        name: `${safeName} – Fitness-Tracker`,
        short_name: safeName,
        description: "Dein persönlicher Fitness-Tracker für Workouts, Schritte, Progress-Fotos und wöchentliche Challenges.",
        start_url: new URL("./index.html", window.location.href).href,
        scope: new URL("./", window.location.href).href,
        display: "standalone",
        orientation: "portrait",
        background_color: "#FFF6F9",
        theme_color: "#FFF6F9",
        lang: "de",
        icons: [
          { src: new URL("icons/icon-192.png", window.location.href).href, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: new URL("icons/icon-512.png", window.location.href).href, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: new URL("icons/icon-maskable-192.png", window.location.href).href, sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: new URL("icons/icon-maskable-512.png", window.location.href).href, sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
      const url = URL.createObjectURL(blob);
      if (link.dataset.blobUrl) URL.revokeObjectURL(link.dataset.blobUrl);
      link.href = url;
      link.dataset.blobUrl = url;
    } catch (e) {
      console.warn("Manifest konnte nicht mit neuem Namen erzeugt werden", e);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Datum-Hilfsfunktionen                                             */
  /* ---------------------------------------------------------------- */

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function toISO(date) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function fromISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }
  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Montag = 0
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    const week = 1 + Math.round((d - firstThursday) / (7 * 86400000));
    return { year: d.getUTCFullYear(), week };
  }
  function weekKey(date) {
    const { year, week } = getISOWeek(date);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }
  /* Umkehrung von weekKey(): liefert den Montag der angegebenen ISO-Woche
     ("2026-W36" -> Datum). Nur für die Reise-Zeitleiste gebraucht, wo aus
     einer gespeicherten Wochen-ID wieder ein anzeigbares Datum werden muss. */
  function dateFromWeekKey(wKey) {
    const [yearStr, weekStr] = wKey.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    const jan4Monday = startOfWeek(new Date(year, 0, 4));
    return addDays(jan4Monday, (week - 1) * 7);
  }
  function formatWeekdayDate(date) {
    return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()}. ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
  }
  function formatShortDate(date) {
    return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.`;
  }

  /* ---------------------------------------------------------------- */
  /* Storage (localStorage)                                            */
  /* ---------------------------------------------------------------- */

  const Storage = {
    _cache: null,
    load() {
      if (this._cache) return this._cache;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        this._cache = raw ? JSON.parse(raw) : { entries: {}, challenges: {} };
      } catch (e) {
        console.warn("FitPaw: Speicher konnte nicht gelesen werden", e);
        this._cache = { entries: {}, challenges: {} };
      }
      if (!this._cache.entries) this._cache.entries = {};
      if (!this._cache.challenges) this._cache.challenges = {};
      if (!this._cache.weights) this._cache.weights = [];
      if (!this._cache.measurements) this._cache.measurements = [];
      if (!this._cache.settings) this._cache.settings = {};
      if (!this._cache.selfMessages) this._cache.selfMessages = [];
      if (!this._cache.plans) this._cache.plans = {};
      return this._cache;
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
      } catch (e) {
        showToast("Speicher voll – Daten konnten nicht gespeichert werden.");
        console.error(e);
      }
    },
    getEntry(dateISO) {
      const data = this.load();
      return data.entries[dateISO] || { steps: null, activities: [], challengeChecked: false, water: 0, pushups: null, plankSeconds: null, stretchingDone: false, chaosDone: false };
    },
    setEntry(dateISO, entry) {
      const data = this.load();
      data.entries[dateISO] = entry;
      this.save();
    },
    updateEntry(dateISO, mutator) {
      const entry = this.getEntry(dateISO);
      mutator(entry);
      this.setEntry(dateISO, entry);
    },
    getChallenge(wKey) {
      const data = this.load();
      return data.challenges[wKey] || null;
    },
    setChallengeText(wKey, text) {
      const data = this.load();
      data.challenges[wKey] = Object.assign({}, data.challenges[wKey], { text });
      this.save();
    },
    getWeights() {
      const data = this.load();
      return data.weights.slice().sort((a, b) => a.date.localeCompare(b.date));
    },
    addWeight(date, kg) {
      const data = this.load();
      const idx = data.weights.findIndex((w) => w.date === date);
      if (idx >= 0) data.weights[idx] = Object.assign({}, data.weights[idx], { kg });
      else data.weights.push({ id: genId(), date, kg });
      this.save();
    },
    deleteWeight(id) {
      const data = this.load();
      data.weights = data.weights.filter((w) => w.id !== id);
      this.save();
    },
    updateWeight(id, date, kg) {
      const data = this.load();
      const cur = data.weights.find((w) => w.id === id);
      if (!cur) return;
      // Zieldatum darf keine zweite, kollidierende Zeile erzeugen.
      data.weights = data.weights.filter((w) => w.id === id || w.date !== date);
      cur.date = date;
      cur.kg = kg;
      this.save();
    },
    restoreWeight(entry) {
      const data = this.load();
      data.weights = data.weights.filter((w) => w.id !== entry.id);
      data.weights.push(entry);
      this.save();
    },
    getMeasurements() {
      const data = this.load();
      return data.measurements.slice().sort((a, b) => a.date.localeCompare(b.date));
    },
    addMeasurement(type, date, value) {
      const data = this.load();
      const idx = data.measurements.findIndex((m) => m.type === type && m.date === date);
      if (idx >= 0) data.measurements[idx] = Object.assign({}, data.measurements[idx], { value });
      else data.measurements.push({ id: genId(), type, date, value });
      this.save();
    },
    updateMeasurement(id, type, date, value) {
      const data = this.load();
      const cur = data.measurements.find((m) => m.id === id);
      if (!cur) return;
      data.measurements = data.measurements.filter((m) => m.id === id || !(m.type === type && m.date === date));
      cur.type = type; cur.date = date; cur.value = value;
      this.save();
    },
    deleteMeasurement(id) {
      const data = this.load();
      data.measurements = data.measurements.filter((m) => m.id !== id);
      this.save();
    },
    restoreMeasurement(entry) {
      const data = this.load();
      data.measurements = data.measurements.filter((m) => m.id !== entry.id);
      data.measurements.push(entry);
      this.save();
    },
    getSelfMessages() {
      const data = this.load();
      return data.selfMessages.slice().sort((a, b) => a.date.localeCompare(b.date));
    },
    addSelfMessage(text) {
      const data = this.load();
      data.selfMessages.push({ id: genId(), date: toISO(new Date()), text });
      this.save();
    },
    deleteSelfMessage(id) {
      const data = this.load();
      data.selfMessages = data.selfMessages.filter((m) => m.id !== id);
      this.save();
    },
    getPlans(dateISO) {
      const data = this.load();
      return data.plans[dateISO] || [];
    },
    addPlan(dateISO, plan) {
      const data = this.load();
      if (!data.plans[dateISO]) data.plans[dateISO] = [];
      data.plans[dateISO].push(Object.assign({ id: genId() }, plan));
      this.save();
    },
    deletePlan(dateISO, id) {
      const data = this.load();
      if (!data.plans[dateISO]) return;
      data.plans[dateISO] = data.plans[dateISO].filter((p) => p.id !== id);
      this.save();
    },
    getSettings() {
      const data = this.load();
      return Object.assign({
        theme: "pink", darkMode: "auto", stepsGoal: DEFAULT_STEPS_GOAL, waterGoalMl: DEFAULT_WATER_GOAL_ML, appName: DEFAULT_APP_NAME,
        weeklyGoalMode: "sessions", weeklyGoalSessions: DEFAULT_WEEKLY_GOAL_SESSIONS, weeklyGoalMinutes: DEFAULT_WEEKLY_GOAL_MINUTES,
        targetWeightKg: null, pushupsGoal: DEFAULT_PUSHUPS_GOAL, plankGoalSeconds: DEFAULT_PLANK_GOAL_SECONDS, chaosMode: true,
        seenAccessoryKeys: [], equippedAccessories: {}, companionSpecies: "giraffe"
      }, data.settings);
    },
    saveSettings(patch) {
      const data = this.load();
      data.settings = Object.assign({}, data.settings, patch);
      this.save();
    },
    /* Merge-Update nur für einen einzelnen Ausrüstungs-Slot der Giraffe –
       saveSettings() ersetzt Top-Level-Keys komplett, ein naives
       saveSettings({equippedAccessories:{...}}) würde also die Wahl in
       allen anderen Slots löschen. itemKey ist entweder ein Item-Key,
       "none" (bewusst nichts tragen) oder null/undefined (automatisch
       die höchste freigeschaltete Stufe tragen). */
    setEquippedAccessory(slot, itemKey) {
      const data = this.load();
      const current = (data.settings && data.settings.equippedAccessories) || {};
      const next = Object.assign({}, current, { [slot]: itemKey });
      data.settings = Object.assign({}, data.settings, { equippedAccessories: next });
      this.save();
    },
    exportAll() {
      return JSON.stringify(this.load(), null, 2);
    },
    importAll(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object") throw new Error("Ungültiges Backup");
      this._cache = parsed;
      if (!this._cache.entries) this._cache.entries = {};
      if (!this._cache.challenges) this._cache.challenges = {};
      if (!this._cache.weights) this._cache.weights = [];
      if (!this._cache.measurements) this._cache.measurements = [];
      if (!this._cache.settings) this._cache.settings = {};
      if (!this._cache.selfMessages) this._cache.selfMessages = [];
      if (!this._cache.plans) this._cache.plans = {};
      this.save();
    },
    resetTrackingData() {
      const data = this.load();
      this._cache = { entries: {}, challenges: {}, weights: [], measurements: [], plans: {}, settings: data.settings || {}, selfMessages: data.selfMessages || [] };
      this.save();
    }
  };

  applyTheme(Storage.getSettings().theme);
  applyAppName(Storage.getSettings().appName);

  // Bei "Automatisch" live auf Wechsel des Systemfarbschemas reagieren.
  if (window.matchMedia) {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemSchemeChange = () => {
      const s = Storage.getSettings();
      if (!s.darkMode || s.darkMode === "auto") applyTheme(s.theme);
    };
    if (darkMediaQuery.addEventListener) darkMediaQuery.addEventListener("change", onSystemSchemeChange);
    else if (darkMediaQuery.addListener) darkMediaQuery.addListener(onSystemSchemeChange);
  }

  /* ---------------------------------------------------------------- */
  /* IndexedDB (Fotos)                                                  */
  /* ---------------------------------------------------------------- */

  const PhotoDB = {
    _dbPromise: null,
    open() {
      if (this._dbPromise) return this._dbPromise;
      this._dbPromise = new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) { reject(new Error("IndexedDB nicht verfügbar")); return; }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(DB_STORE)) {
            const store = db.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true });
            store.createIndex("date", "date");
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      return this._dbPromise;
    },
    async add(record) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).add(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async all() {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    },
    async remove(id) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  };

  function resizeImageFile(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Konvertierung fehlgeschlagen")), "image/jpeg", quality);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Kleine UI-Helfer                                                   */
  /* ---------------------------------------------------------------- */

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  /* Deutscher Genitiv: Namen, die schon auf s/x/z/ß enden ("Bärls"),
     bekommen nur einen Apostroph statt eines zweiten "s" ("Bärls'
     Quests" statt "Bärlss Quests"). */
  function possessive(name) {
    return /[sxzß]$/i.test(name) ? `${name}'` : `${name}s`;
  }
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerHTML = "";
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  /* Für Lösch-Aktionen: Element wird sofort entfernt, aber für ein paar
     Sekunden lässt sich die Aktion per Toast-Button rückgängig machen –
     modernere/verzeihendere Alternative zu einem confirm()-Dialog. */
  function showUndoToast(msg, onUndo) {
    const t = document.getElementById("toast");
    clearTimeout(toastTimer);
    t.innerHTML = `<span class="toast-msg"></span><button type="button" class="toast-undo-btn">Rückgängig</button>`;
    t.querySelector(".toast-msg").textContent = msg;
    t.classList.add("show");
    const hide = () => t.classList.remove("show");
    t.querySelector(".toast-undo-btn").addEventListener("click", () => {
      clearTimeout(toastTimer);
      onUndo();
      hide();
    });
    toastTimer = setTimeout(hide, 5000);
  }
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function sumField(activities, field) {
    return activities.reduce((s, a) => s + (Number(a[field]) || 0), 0);
  }

  /* ---------------------------------------------------------------- */
  /* Tages-Editor (wird in "Heute" & "Kalender" wiederverwendet)        */
  /* ---------------------------------------------------------------- */

  function entryEditorHTML(dateISO) {
    const entry = Storage.getEntry(dateISO);
    const wKey = weekKey(fromISO(dateISO));
    const challenge = Storage.getChallenge(wKey);

    const activityRows = entry.activities.length
      ? entry.activities.map((a) => {
          const sport = SPORTS[a.type] || SPORTS.restday;
          const label = sport.custom && a.customName ? a.customName : sport.label;
          const statParts = sport.fields.map((f) => {
            if (a[f] === undefined || a[f] === "" || a[f] === null) return "";
            return `${a[f]}${FIELD_META[f].unit === "min/km" ? " min/km" : " " + FIELD_META[f].unit}`;
          }).filter(Boolean).join(" · ");
          return `
          <div class="activity-item" data-activity-id="${a.id}">
            <div class="info">
              <div class="icon-badge" style="background:${sport.bg}">${sport.icon}</div>
              <div>
                <div>${esc(label)}</div>
                <div class="stats">${statParts || "&nbsp;"}</div>
              </div>
            </div>
            <div class="item-actions">
              <button type="button" class="edit-btn" data-edit-activity="${a.id}" aria-label="Bearbeiten">✎</button>
              <button class="del-btn" data-del-activity="${a.id}" aria-label="Löschen">✕</button>
            </div>
          </div>`;
        }).join("")
      : `<div class="empty-hint">Noch keine Aktivität eingetragen.</div>`;

    const sportOptions = Object.keys(SPORTS).map((key) => `<option value="${key}">${SPORTS[key].icon} ${SPORTS[key].label}</option>`).join("");

    const plans = Storage.getPlans(dateISO);
    const planRows = plans.length
      ? plans.map((p) => {
          const sport = SPORTS[p.type] || SPORTS.restday;
          return `
          <div class="activity-item plan-item" data-plan-id="${p.id}">
            <div class="info">
              <div class="icon-badge" style="background:${sport.bg}">${sport.icon}</div>
              <div>
                <div>${esc(sport.label)} ist geplant</div>
                <div class="stats">${p.note ? esc(p.note) : "&nbsp;"}</div>
              </div>
            </div>
            <div class="item-actions">
              <button class="use-plan-btn" data-use-plan="${p.id}" aria-label="In Aktivitäten-Formular übernehmen" title="Sportart unten übernehmen, Details ergänzen & eintragen">✓ Übernehmen</button>
              <button class="del-btn" data-del-plan="${p.id}" aria-label="Löschen">✕</button>
            </div>
          </div>`;
        }).join("")
      : `<div class="empty-hint">Noch nichts geplant.</div>`;

    const challengeBlock = challenge && challenge.text
      ? `<div class="row-between">
           <div class="small" style="max-width:75%;"><strong>Challenge (${wKey.replace("-W", " · KW ")}):</strong> ${esc(challenge.text)}</div>
           <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;">
             <input type="checkbox" class="challenge-check" ${entry.challengeChecked ? "checked" : ""} style="width:18px;height:18px;">
           </label>
         </div>`
      : `<div class="small muted">Noch keine Challenge für diese Woche festgelegt. <button class="btn-ghost btn-sm" data-goto="challenge" style="margin-left:4px;">Challenge festlegen</button></div>`;

    const goals = Storage.getSettings();
    const stepsVal = entry.steps || 0;
    const stepsPct = Math.min(100, Math.round((stepsVal / goals.stepsGoal) * 100));
    const stepsGoalHTML = `
      <div class="progress-bar-lg" style="margin:10px 0 4px;"><div class="fill" style="width:${stepsPct}%"></div></div>
      <div class="goal-caption">${stepsVal >= goals.stepsGoal ? `🎯 Tagesziel erreicht (${goals.stepsGoal.toLocaleString("de-DE")} Schritte)!` : `${stepsVal.toLocaleString("de-DE")} / ${goals.stepsGoal.toLocaleString("de-DE")} Schritten`}</div>
    `;

    const water = entry.water || 0;
    const waterPct = Math.min(100, Math.round((water / goals.waterGoalMl) * 100));

    const pushupsVal = entry.pushups || 0;
    const pushupsPct = Math.min(100, Math.round((pushupsVal / goals.pushupsGoal) * 100));
    const plankVal = entry.plankSeconds || 0;
    const plankPct = Math.min(100, Math.round((plankVal / goals.plankGoalSeconds) * 100));

    return `
      <h2 class="section-title">📅 Geplant</h2>
      <div class="card">
        <div class="activity-list">${planRows}</div>
        <form class="add-plan-form" style="margin-top:10px; border-top:1px solid var(--border); padding-top:14px;">
          <div class="field-grid">
            <div class="field">
              <label class="field-label">Sportart</label>
              <select class="plan-sport-select">${sportOptions}</select>
            </div>
            <div class="field">
              <label class="field-label">Notiz (optional)</label>
              <input type="text" class="plan-note-input" placeholder="z. B. 5 km, locker" maxlength="60">
            </div>
          </div>
          <button type="submit" class="btn btn-secondary btn-block plan-submit-btn" style="margin-top:8px;">+ Plan hinzufügen</button>
        </form>
        <div class="small muted" style="margin-top:10px;">Ein Plan wird nur angezeigt – er zählt erst als Aktivität, wenn du sie unten wie gewohnt wirklich einträgst.</div>
      </div>

      <div class="card">
        <label class="field-label">Schritte</label>
        <input type="number" min="0" step="1" class="steps-input" placeholder="z. B. 8000" value="${entry.steps ?? ""}">
        ${stepsGoalHTML}
      </div>

      <div class="card">
        <div class="row-between">
          <label class="field-label" style="margin-bottom:0;">💧 Wasser</label>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text-muted);">
            Ziel erreicht
            <input type="checkbox" class="water-check" ${water >= goals.waterGoalMl ? "checked" : ""}>
          </label>
        </div>
        <div class="progress-bar-lg" style="margin:10px 0 8px;"><div class="fill" style="width:${waterPct}%"></div></div>
        <div class="row-between">
          <span class="small muted">${water.toLocaleString("de-DE")} ml / ${goals.waterGoalMl.toLocaleString("de-DE")} ml</span>
          <div style="display:flex; gap:8px;">
            <button type="button" class="stepper-btn water-minus" aria-label="250 ml entfernen">−</button>
            <button type="button" class="stepper-btn water-plus" aria-label="250 ml hinzufügen">+</button>
          </div>
        </div>
      </div>

      <div class="card">
        <label class="field-label">💪 Liegestütze am Stück</label>
        <input type="number" min="0" step="1" class="pushups-input" placeholder="z. B. 15" value="${entry.pushups ?? ""}">
        <div class="progress-bar-lg" style="margin:10px 0 4px;"><div class="fill" style="width:${pushupsPct}%"></div></div>
        <div class="goal-caption">${pushupsVal >= goals.pushupsGoal ? `🎯 Tagesziel erreicht (${goals.pushupsGoal})!` : `${pushupsVal} / ${goals.pushupsGoal}`}</div>
      </div>

      <div class="card">
        <label class="field-label">🧍 Plank (Sekunden)</label>
        <input type="number" min="0" step="5" class="plank-input" placeholder="z. B. 45" value="${entry.plankSeconds ?? ""}">
        <div class="progress-bar-lg" style="margin:10px 0 4px;"><div class="fill" style="width:${plankPct}%"></div></div>
        <div class="goal-caption">${plankVal >= goals.plankGoalSeconds ? `🎯 Tagesziel erreicht (${goals.plankGoalSeconds}s)!` : `${plankVal} / ${goals.plankGoalSeconds} s`}</div>
      </div>

      <div class="card">
        <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;">
          <span class="field-label" style="margin-bottom:0;">🧘 5 Min Stretching</span>
          <input type="checkbox" class="stretch-check" ${entry.stretchingDone ? "checked" : ""} style="width:20px;height:20px;">
        </label>
      </div>

      <div class="card">
        ${challengeBlock}
      </div>

      <h2 class="section-title">Aktivitäten</h2>
      <div class="card">
        <div class="activity-list">${activityRows}</div>

        <form class="add-activity-form" style="margin-top:10px; border-top:1px solid var(--border); padding-top:14px;">
          <div class="field">
            <label class="field-label">Sportart</label>
            <select class="sport-select">${sportOptions}</select>
          </div>
          <div class="dynamic-fields field-grid"></div>
          <button type="submit" class="btn btn-primary btn-block activity-submit-btn" style="margin-top:4px;">+ Aktivität hinzufügen</button>
          <button type="button" class="btn btn-ghost btn-block cancel-edit-btn" style="margin-top:8px; display:none;">Bearbeiten abbrechen</button>
        </form>
      </div>
    `;
  }

  /* Pace (min/km) wird bei Sportarten mit Distanz + Zeit automatisch
     berechnet, statt manuell eingetippt zu werden. */
  function computePaceString(distanzKm, zeitMin) {
    const d = parseFloat(distanzKm);
    const t = parseFloat(zeitMin);
    if (!d || d <= 0 || !t || t <= 0) return "";
    const totalSeconds = Math.round((t / d) * 60);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }

  function updateAutoPace(container) {
    const paceInput = container.querySelector('[data-auto-pace="1"]');
    if (!paceInput) return;
    const distInput = container.querySelector('[data-field="distanz"]');
    const zeitInput = container.querySelector('[data-field="zeit"]');
    paceInput.value = computePaceString(distInput ? distInput.value : "", zeitInput ? zeitInput.value : "");
  }

  function renderDynamicFields(container, sportKey) {
    const sport = SPORTS[sportKey] || SPORTS.restday;
    if (sportKey === "restday") {
      container.innerHTML = `<div class="small muted" style="grid-column:1/-1;padding:4px 0 2px;">Rest-Day – keine weiteren Angaben nötig. Gönn dir die Pause! 🐼</div>`;
      return;
    }
    const autoPace = sport.fields.includes("pace") && sport.fields.includes("distanz") && sport.fields.includes("zeit");
    let html = "";
    if (sport.custom) {
      html += `<div class="field" style="grid-column:1/-1;">
        <label class="field-label">Name der Aktivität</label>
        <input type="text" placeholder="z. B. Klettern, Tanzen, Wandern …" data-field="customName">
      </div>`;
    }
    html += sport.fields.map((f) => {
      const meta = FIELD_META[f];
      if (f === "pace" && autoPace) {
        return `<div class="field">
          <label class="field-label">${meta.label} (${meta.unit}) <span class="small muted">· automatisch</span></label>
          <input type="text" readonly placeholder="–" data-field="pace" data-auto-pace="1" style="background:var(--accent-soft-2); color:var(--text-muted);">
        </div>`;
      }
      return `<div class="field">
        <label class="field-label">${meta.label} (${meta.unit})</label>
        <input type="${meta.type}" ${meta.step ? `step="${meta.step}"` : ""} placeholder="${meta.placeholder}" data-field="${f}">
      </div>`;
    }).join("");
    container.innerHTML = html;
    if (autoPace) {
      const distInput = container.querySelector('[data-field="distanz"]');
      const zeitInput = container.querySelector('[data-field="zeit"]');
      const recalc = () => updateAutoPace(container);
      if (distInput) distInput.addEventListener("input", recalc);
      if (zeitInput) zeitInput.addEventListener("input", recalc);
    }
  }

  /* Höchstens 2 Rest-Days pro Kalenderwoche – verhindert, dass die
     (jetzt streak-erhaltende) Rest-Day-Kategorie missbraucht wird, um die
     Streak dauerhaft ohne echte Aktivität am Leben zu halten. */
  function countRestdaysInWeek(dateISO) {
    const ws = startOfWeek(fromISO(dateISO));
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const dayEntry = Storage.getEntry(toISO(addDays(ws, d)));
      count += (dayEntry.activities || []).filter((a) => a.type === "restday").length;
    }
    return count;
  }

  function bindEntryEditor(container, dateISO, onChange) {
    const goals = Storage.getSettings();
    const stepsInput = container.querySelector(".steps-input");
    stepsInput.addEventListener("change", () => {
      const v = stepsInput.value === "" ? null : Math.max(0, parseInt(stepsInput.value, 10) || 0);
      Storage.updateEntry(dateISO, (e) => { e.steps = v; });
      showToast(v >= goals.stepsGoal ? "🎯 Tagesziel erreicht!" : "Schritte gespeichert");
      onChange();
    });

    const pushupsInput = container.querySelector(".pushups-input");
    if (pushupsInput) {
      pushupsInput.addEventListener("change", () => {
        const v = pushupsInput.value === "" ? null : Math.max(0, parseInt(pushupsInput.value, 10) || 0);
        Storage.updateEntry(dateISO, (e) => { e.pushups = v; });
        if (v != null && v >= goals.pushupsGoal) showToast("🎯 Liegestütze-Ziel erreicht!");
        onChange();
      });
    }
    const plankInput = container.querySelector(".plank-input");
    if (plankInput) {
      plankInput.addEventListener("change", () => {
        const v = plankInput.value === "" ? null : Math.max(0, parseInt(plankInput.value, 10) || 0);
        Storage.updateEntry(dateISO, (e) => { e.plankSeconds = v; });
        if (v != null && v >= goals.plankGoalSeconds) showToast("🎯 Plank-Ziel erreicht!");
        onChange();
      });
    }
    const stretchCheck = container.querySelector(".stretch-check");
    if (stretchCheck) {
      stretchCheck.addEventListener("change", () => {
        Storage.updateEntry(dateISO, (e) => { e.stretchingDone = stretchCheck.checked; });
        onChange();
      });
    }

    const waterCheck = container.querySelector(".water-check");
    if (waterCheck) {
      waterCheck.addEventListener("change", () => {
        Storage.updateEntry(dateISO, (e) => { e.water = waterCheck.checked ? goals.waterGoalMl : 0; });
        onChange();
      });
    }
    const waterPlus = container.querySelector(".water-plus");
    if (waterPlus) {
      waterPlus.addEventListener("click", () => {
        Storage.updateEntry(dateISO, (e) => { e.water = (e.water || 0) + WATER_STEP_ML; });
        onChange();
      });
    }
    const waterMinus = container.querySelector(".water-minus");
    if (waterMinus) {
      waterMinus.addEventListener("click", () => {
        Storage.updateEntry(dateISO, (e) => { e.water = Math.max(0, (e.water || 0) - WATER_STEP_ML); });
        onChange();
      });
    }

    const challengeCheck = container.querySelector(".challenge-check");
    if (challengeCheck) {
      challengeCheck.addEventListener("change", () => {
        Storage.updateEntry(dateISO, (e) => { e.challengeChecked = challengeCheck.checked; });
      });
    }
    container.querySelectorAll('[data-goto="challenge"]').forEach((b) => {
      b.addEventListener("click", () => switchTab("challenge"));
    });

    container.querySelectorAll("[data-del-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-plan");
        Storage.deletePlan(dateISO, id);
        onChange();
      });
    });
    const planForm = container.querySelector(".add-plan-form");
    if (planForm) {
      planForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const planSportSelect = planForm.querySelector(".plan-sport-select");
        const planNoteInput = planForm.querySelector(".plan-note-input");
        Storage.addPlan(dateISO, { type: planSportSelect.value, note: planNoteInput.value.trim() });
        showToast("Plan hinzugefügt");
        onChange();
      });
    }

    const sportSelect = container.querySelector(".sport-select");
    const dynamicFields = container.querySelector(".dynamic-fields");
    renderDynamicFields(dynamicFields, sportSelect.value);
    sportSelect.addEventListener("change", () => renderDynamicFields(dynamicFields, sportSelect.value));

    container.querySelectorAll("[data-del-activity]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-activity");
        const entry = Storage.getEntry(dateISO);
        const idx = entry.activities.findIndex((a) => a.id === id);
        if (idx < 0) return;
        const removed = entry.activities[idx];
        const sport = SPORTS[removed.type] || SPORTS.custom;
        const label = sport.custom && removed.customName ? removed.customName : sport.label;
        Storage.updateEntry(dateISO, (e) => { e.activities = e.activities.filter((a) => a.id !== id); });
        onChange();
        showUndoToast(`${label} gelöscht`, () => {
          Storage.updateEntry(dateISO, (e) => {
            const pos = Math.min(idx, e.activities.length);
            e.activities.splice(pos, 0, removed);
          });
          onChange();
        });
      });
    });

    const form = container.querySelector(".add-activity-form");
    const submitBtn = form.querySelector(".activity-submit-btn");
    const cancelEditBtn = form.querySelector(".cancel-edit-btn");
    let editingId = null;

    function resetToAddMode() {
      editingId = null;
      sportSelect.selectedIndex = 0;
      renderDynamicFields(dynamicFields, sportSelect.value);
      submitBtn.textContent = "+ Aktivität hinzufügen";
      cancelEditBtn.style.display = "none";
      container.querySelectorAll(".activity-item.editing").forEach((el) => el.classList.remove("editing"));
    }

    container.querySelectorAll("[data-edit-activity]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit-activity");
        const entry = Storage.getEntry(dateISO);
        const activity = entry.activities.find((a) => a.id === id);
        if (!activity) return;

        editingId = id;
        sportSelect.value = activity.type;
        renderDynamicFields(dynamicFields, activity.type);
        const sport = SPORTS[activity.type] || SPORTS.restday;
        if (sport.custom) {
          const nameInput = dynamicFields.querySelector('[data-field="customName"]');
          if (nameInput) nameInput.value = activity.customName || "";
        }
        sport.fields.forEach((f) => {
          const input = dynamicFields.querySelector(`[data-field="${f}"]`);
          if (input) input.value = activity[f] ?? "";
        });
        updateAutoPace(dynamicFields);

        submitBtn.textContent = "Änderungen speichern";
        cancelEditBtn.style.display = "block";
        container.querySelectorAll(".activity-item").forEach((el) => {
          el.classList.toggle("editing", el.getAttribute("data-activity-id") === id);
        });
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    cancelEditBtn.addEventListener("click", () => resetToAddMode());

    /* "✓ Übernehmen" bei einem Plan: übernimmt nur die Sportart ins
       Aktivitäten-Formular darunter (Zeit/Kalorien/Distanz etc. müssen
       noch ergänzt werden) – der Plan selbst verschwindet erst, wenn die
       Aktivität wirklich abgeschickt wird (siehe unten). */
    container.querySelectorAll("[data-use-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-use-plan");
        const plan = Storage.getPlans(dateISO).find((p) => p.id === id);
        if (!plan) return;
        editingId = null;
        sportSelect.value = plan.type;
        renderDynamicFields(dynamicFields, plan.type);
        submitBtn.textContent = "+ Aktivität hinzufügen";
        cancelEditBtn.style.display = "none";
        container.querySelectorAll(".activity-item.editing").forEach((el) => el.classList.remove("editing"));
        const sportLabel = (SPORTS[plan.type] || SPORTS.custom).label;
        showToast(`${sportLabel} ausgewählt – Details ergänzen & unten eintragen`);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const type = sportSelect.value;
      const sport = SPORTS[type];

      if (type === "restday") {
        const existingActivity = editingId ? Storage.getEntry(dateISO).activities.find((a) => a.id === editingId) : null;
        const addsNewRestday = !existingActivity || existingActivity.type !== "restday";
        if (addsNewRestday && countRestdaysInWeek(dateISO) >= MAX_RESTDAYS_PER_WEEK) {
          showToast(`Schon ${MAX_RESTDAYS_PER_WEEK} Rest-Days diese Woche eingetragen – mehr sind nicht vorgesehen 🙂`);
          return;
        }
      }

      const activity = { id: editingId || genId(), type };
      if (sport.custom) {
        const nameInput = dynamicFields.querySelector('[data-field="customName"]');
        activity.customName = (nameInput && nameInput.value.trim()) || "Sonstiges";
      }
      sport.fields.forEach((f) => {
        const input = dynamicFields.querySelector(`[data-field="${f}"]`);
        activity[f] = input ? input.value : "";
      });
      if (editingId) {
        Storage.updateEntry(dateISO, (e) => {
          const idx = e.activities.findIndex((a) => a.id === editingId);
          if (idx !== -1) e.activities[idx] = activity; else e.activities.push(activity);
        });
        showToast("Aktivität aktualisiert");
      } else {
        Storage.updateEntry(dateISO, (e) => { e.activities.push(activity); });
        // War dafür etwas geplant? Dann gilt der Plan jetzt als erledigt
        // und verschwindet automatisch – unabhängig davon, ob die
        // Sportart über "✓ Übernehmen" vorbelegt oder frei eingetippt wurde.
        const matchingPlan = Storage.getPlans(dateISO).find((p) => p.type === type);
        if (matchingPlan) {
          Storage.deletePlan(dateISO, matchingPlan.id);
          showToast(`✓ ${sport.label} eingetragen – Plan erledigt!`);
        } else {
          showToast("Aktivität hinzugefügt");
        }
      }
      editingId = null;
      onChange();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Heute                                                         */
  /* ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- */
  /* Giraffen-Begleiter                                                 */
  /* Wächst mit der Gesamt-Konsistenz, Stimmung folgt der aktuellen     */
  /* Streak/heutigen Aktivität, Accessoires werden durch die            */
  /* bestehenden Erfolgs-Badges freigeschaltet. Rein aus vorhandenen    */
  /* Daten abgeleitet, keine eigene Speicherung nötig.                  */
  /* ---------------------------------------------------------------- */

  /* Drei wählbare Begleiter-Arten, umschaltbar in den Einstellungen.
     Der eigene Name (COMPANION_NAME-Ersatz: species.name) ist reine
     Anzeigesache – Wachstumsstufen, Freischaltungen und Garderobe
     basieren weiterhin auf denselben, ohnehin berechneten Werten und
     sind über alle drei Begleiter hinweg identisch (nur die Zeichnung
     und der Name ändern sich beim Umschalten, kein Fortschritt geht
     verloren). */
  const COMPANION_SPECIES = [
    {
      key: "giraffe", name: "Giraffi", emoji: "🦒",
      stages: [
        { min: 0, key: "baby", label: "Baby-Giraffe", size: 118, spots: 3 },
        { min: 7, key: "young", label: "Junge Giraffe", size: 140, spots: 5 },
        { min: 30, key: "adult", label: "Erwachsene Giraffe", size: 160, spots: 7 },
        { min: 100, key: "majestic", label: "Stolze Giraffe", size: 176, spots: 9, crown: true }
      ]
    },
    {
      key: "bear", name: "Bärls", emoji: "🐻",
      stages: [
        { min: 0, key: "baby", label: "Baby-Bär", size: 122 },
        { min: 7, key: "young", label: "Junger Bär", size: 140 },
        { min: 30, key: "adult", label: "Erwachsener Bär", size: 158 },
        { min: 100, key: "majestic", label: "Stolzer Bär", size: 172, crown: true }
      ]
    },
    {
      key: "shark", name: "Sharky", emoji: "🦈",
      stages: [
        { min: 0, key: "baby", label: "Baby-Hai", size: 122 },
        { min: 7, key: "young", label: "Junger Hai", size: 140 },
        { min: 30, key: "adult", label: "Erwachsener Hai", size: 158 },
        { min: 100, key: "majestic", label: "Stolzer Hai", size: 172, crown: true }
      ]
    }
  ];

  function getActiveSpecies() {
    const key = Storage.getSettings().companionSpecies || "giraffe";
    return COMPANION_SPECIES.find((s) => s.key === key) || COMPANION_SPECIES[0];
  }

  /* Jeder Ausrüstungs-Platz ("Slot") an der Giraffe hat mehrere Stufen
     ("Tiers"), die nacheinander anhand echter, ohnehin schon berechneter
     Werte freigeschaltet werden. Standardmäßig trägt die Giraffe pro Slot
     automatisch die höchste freigeschaltete Stufe – man kann aber über
     die Ausstatten-Ansicht selbst wählen, was sie trägt (auch "Ohne"). */
  const COMPANION_SLOTS = [
    {
      key: "ohr", label: "Blume am Ohr", stat: "perfectWeeks", statLabel: "perfekte Challenge-Woche(n)",
      items: [
        { key: "flower", emoji: "🌸", title: "Blüte", tier: 1, threshold: 1 },
        { key: "clover", emoji: "🍀", title: "Kleeblatt", tier: 2, threshold: 3 },
        { key: "butterfly", emoji: "🦋", title: "Schmetterling", tier: 3, threshold: 6 }
      ]
    },
    {
      key: "kopf", label: "Kopfschmuck", stat: "totalActiveDays", statLabel: "aktive Tage insgesamt",
      items: [
        { key: "cap", emoji: "🧢", title: "Käppi", tier: 1, threshold: 20 },
        { key: "hat", emoji: "🎩", title: "Zylinder", tier: 2, threshold: 50 },
        { key: "partyhat", emoji: "🎉", title: "Partyhut", tier: 3, threshold: 150 }
      ]
    },
    {
      key: "bandana", label: "Hals (oben)", stat: "longestStreak", statLabel: "Tage Streak am Stück (Rekord)",
      items: [
        { key: "bandana", emoji: "🎀", title: "Bandana", tier: 1, threshold: 7 },
        { key: "bowtie", emoji: "🔷", title: "Fliege", tier: 2, threshold: 14 },
        { key: "sparklecollar", emoji: "✨", title: "Glitzer-Halsband", tier: 3, threshold: 30 }
      ]
    },
    {
      key: "brille", label: "Brille", stat: "longestStreak", statLabel: "Tage Streak am Stück (Rekord)",
      items: [
        { key: "sunglasses", emoji: "🕶️", title: "Sonnenbrille", tier: 1, threshold: 30 },
        { key: "heartglasses", emoji: "💕", title: "Herzbrille", tier: 2, threshold: 60 },
        { key: "starglasses", emoji: "⭐", title: "Stern-Brille", tier: 3, threshold: 100 }
      ]
    },
    {
      key: "schal", label: "Schal", stat: "weeklyGoalStreak", statLabel: "Wochen Wochenziel in Folge",
      items: [
        { key: "scarf", emoji: "🧣", title: "Schal", tier: 1, threshold: 4 },
        { key: "winterscarf", emoji: "🌟", title: "Winterschal", tier: 2, threshold: 8 },
        { key: "rainbowscarf", emoji: "🌈", title: "Regenbogenschal", tier: 3, threshold: 16 }
      ]
    },
    {
      key: "medaille", label: "Medaille", stat: "totalWorkouts", statLabel: "geloggte Trainingseinheiten",
      items: [
        { key: "bronze", emoji: "🥉", title: "Bronze-Medaille", tier: 1, threshold: 50 },
        { key: "gold", emoji: "🏅", title: "Gold-Medaille", tier: 2, threshold: 100 },
        { key: "trophy", emoji: "🏆", title: "Pokal", tier: 3, threshold: 250 }
      ]
    },
    {
      key: "abzeichen", label: "Quest-Abzeichen", stat: "questXP", statLabel: "gesammelte Quest-XP",
      items: [
        { key: "bronze_badge", emoji: "🔰", title: "Bronze-Abzeichen", tier: 1, threshold: 40 },
        { key: "silver_badge", emoji: "🎗️", title: "Silber-Abzeichen", tier: 2, threshold: 120 },
        { key: "gold_badge", emoji: "🏵️", title: "Gold-Abzeichen", tier: 3, threshold: 300 }
      ]
    }
  ];

  /* ---------------------------------------------------------------- */
  /* Giraffis Quests der Woche                                          */
  /* Jede Woche wählt Giraffi (deterministisch je Kalenderwoche, wie     */
  /* der Chaos-Modus) 3 von mehreren möglichen Quests aus. Sie geben     */
  /* XP, die – über alle Wochen mit Daten aufsummiert – die              */
  /* Quest-Abzeichen in der Garderobe freischalten. Alles wird live aus  */
  /* den vorhandenen Einträgen berechnet, nichts wird separat            */
  /* gespeichert – identisch zum Prinzip von Streaks/Badges.             */
  /* ---------------------------------------------------------------- */

  const QUEST_TEMPLATES = [
    {
      key: "sessions3", icon: "💪", title: "3x Sport diese Woche", xp: 20,
      evaluate: (weekStart, agg) => ({ progress: Math.min(agg.sessionsCount, 3), target: 3, done: agg.sessionsCount >= 3 })
    },
    {
      key: "steps20k", icon: "👟", title: "20.000 Schritte diese Woche", xp: 20,
      evaluate: (weekStart, agg) => ({ progress: Math.min(agg.steps, 20000), target: 20000, done: agg.steps >= 20000 })
    },
    {
      key: "water5", icon: "💧", title: "5 Tage Wasserziel erreicht", xp: 15,
      evaluate: (weekStart, agg, days, goals) => {
        const c = days.filter((e) => (e.water || 0) >= goals.waterGoalMl).length;
        return { progress: Math.min(c, 5), target: 5, done: c >= 5 };
      }
    },
    {
      key: "variety2", icon: "🎲", title: "2 verschiedene Sportarten ausprobieren", xp: 15,
      evaluate: (weekStart, agg) => {
        const types = Object.keys(agg.byType).filter((t) => t !== "restday");
        return { progress: Math.min(types.length, 2), target: 2, done: types.length >= 2 };
      }
    },
    {
      key: "pushup3", icon: "🏋️", title: "3x Liegestütze-Ziel erreicht", xp: 15,
      evaluate: (weekStart, agg, days, goals) => {
        const c = days.filter((e) => (e.pushups || 0) >= goals.pushupsGoal).length;
        return { progress: Math.min(c, 3), target: 3, done: c >= 3 };
      }
    },
    {
      key: "plank3", icon: "🧍", title: "3x Plank-Ziel erreicht", xp: 15,
      evaluate: (weekStart, agg, days, goals) => {
        const c = days.filter((e) => (e.plankSeconds || 0) >= goals.plankGoalSeconds).length;
        return { progress: Math.min(c, 3), target: 3, done: c >= 3 };
      }
    },
    {
      key: "minutes150", icon: "⏱️", title: "150 Minuten Bewegung insgesamt", xp: 20,
      evaluate: (weekStart, agg) => ({ progress: Math.min(agg.minutes, 150), target: 150, done: agg.minutes >= 150 })
    },
    {
      key: "stretch3", icon: "🧘", title: "3x Stretching gemacht", xp: 15,
      evaluate: (weekStart, agg, days) => {
        const c = days.filter((e) => e.stretchingDone).length;
        return { progress: Math.min(c, 3), target: 3, done: c >= 3 };
      }
    },
    {
      key: "fullweek", icon: "🌟", title: "Jeden Tag der Woche aktiv (7/7)", xp: 30,
      evaluate: (weekStart, agg, days) => {
        const c = days.filter((e) => (e.activities && e.activities.length > 0) || (e.steps && e.steps > 0)).length;
        return { progress: Math.min(c, 7), target: 7, done: c >= 7 };
      }
    }
  ];

  function getWeekDayEntries(weekStart) {
    return Array.from({ length: 7 }, (_, i) => Storage.getEntry(toISO(addDays(weekStart, i))));
  }

  /* Wählt deterministisch 3 Quests für eine gegebene Woche – abgeleitet
     aus der Kalenderwoche selbst (wie bei den Chaos-Challenges), damit
     dieselbe Woche immer dieselben 3 Quests zeigt, verschiedene Wochen
     aber unterschiedliche. */
  function getQuestsForWeek(weekStart) {
    const wKey = weekKey(weekStart);
    return QUEST_TEMPLATES
      .map((q) => ({ q, sort: hashString(`quest-${wKey}-${q.key}`) }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, 3)
      .map((s) => s.q);
  }

  /* Summiert die XP aller abgeschlossenen Quests über alle Wochen seit
     dem allerersten Eintrag bis einschließlich der übergebenen Woche –
     rein aus den Daten abgeleitet, keine gespeicherte Gesamtsumme. */
  function computeQuestXPTotal(uptoWeekStart) {
    const data = Storage.load();
    const entryDates = Object.keys(data.entries);
    if (!entryDates.length) return 0;
    const earliest = entryDates.reduce((min, iso) => (iso < min ? iso : min), entryDates[0]);
    let cursor = startOfWeek(fromISO(earliest));
    const goals = Storage.getSettings();
    let total = 0;
    let guard = 0;
    while (cursor <= uptoWeekStart && guard < 300) {
      const quests = getQuestsForWeek(cursor);
      const agg = weekAggregate(cursor);
      const days = getWeekDayEntries(cursor);
      quests.forEach((q) => {
        if (q.evaluate(cursor, agg, days, goals).done) total += q.xp;
      });
      cursor = addDays(cursor, 7);
      guard++;
    }
    return total;
  }

  function formatQuestProgress(r) {
    const fmt = (n) => Math.round(n).toLocaleString("de-DE");
    return r.done ? "Erledigt!" : `${fmt(r.progress)} / ${fmt(r.target)}`;
  }

  function buildQuestCardHTML() {
    const weekStart = startOfWeek(new Date());
    const quests = getQuestsForWeek(weekStart);
    const agg = weekAggregate(weekStart);
    const days = getWeekDayEntries(weekStart);
    const goals = Storage.getSettings();
    const totalXP = computeQuestXPTotal(weekStart);

    const rows = quests.map((q) => {
      const r = q.evaluate(weekStart, agg, days, goals);
      const pct = Math.min(100, Math.round((r.progress / r.target) * 100));
      return `
        <div class="quest-item${r.done ? " done" : ""}">
          <div class="quest-icon">${r.done ? "✅" : q.icon}</div>
          <div class="quest-body">
            <div class="quest-title">${esc(q.title)}</div>
            <div class="progress-bar-lg" style="margin:6px 0 2px;"><div class="fill" style="width:${pct}%"></div></div>
            <div class="small muted quest-progress-label">${formatQuestProgress(r)} · +${q.xp} XP</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <h2 class="section-title">🎯 ${esc(possessive(getActiveSpecies().name))} Quests der Woche</h2>
      <div class="card quest-card">
        <div class="quest-list">${rows}</div>
        <div class="row-between small muted quest-xp-total" style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">
          <span>Gesammelte Quest-XP</span>
          <strong>${totalXP.toLocaleString("de-DE")} XP</strong>
        </div>
      </div>
    `;
  }

  /* Merkt sich, ob die Ausstatten-Ansicht gerade offen ist (rein visueller
     UI-Zustand, kein gespeicherter Wert – soll nur Re-Renders innerhalb
     der Session überstehen). */
  let companionWardrobeOpen = false;

  function computeCompanionUnlockStats() {
    const streaks = computeStreaks();
    const weeklyStreak = computeWeeklyGoalStreak();
    const chAll = computeChallengeHistory({ limit: 1000 });
    const totalWorkouts = getAllActivitiesFlat().filter((a) => a.type !== "restday").length;
    const questXP = computeQuestXPTotal(startOfWeek(new Date()));
    return {
      totalActiveDays: streaks.totalActiveDays,
      longestStreak: streaks.longest,
      weeklyGoalStreak: weeklyStreak.streak,
      perfectWeeks: chAll.perfectWeeks,
      totalWorkouts: totalWorkouts,
      questXP: questXP
    };
  }

  /* Löst pro Slot aus, was die Giraffe tatsächlich trägt: eine bewusste
     Wahl aus den Einstellungen, wenn sie noch freigeschaltet ist – sonst
     automatisch die höchste freigeschaltete Stufe. "none" bedeutet
     ausdrücklich "nichts in diesem Slot tragen". */
  function resolveEquippedAccessories(unlockStats, chosen) {
    const result = {};
    COMPANION_SLOTS.forEach((slot) => {
      const unlockedItems = slot.items.filter((it) => unlockStats[slot.stat] >= it.threshold);
      const highestUnlocked = unlockedItems.length ? unlockedItems[unlockedItems.length - 1] : null;
      const pick = chosen ? chosen[slot.key] : undefined;
      if (pick === "none") {
        result[slot.key] = null;
      } else if (pick && unlockedItems.some((it) => it.key === pick)) {
        result[slot.key] = slot.items.find((it) => it.key === pick);
      } else {
        result[slot.key] = highestUnlocked;
      }
    });
    return result;
  }

  function computeCompanionState() {
    const streaks = computeStreaks();
    const species = getActiveSpecies();
    const stages = species.stages;
    let stage = stages[0];
    stages.forEach((s) => { if (streaks.totalActiveDays >= s.min) stage = s; });
    const stageIdx = stages.indexOf(stage);
    const next = stages[stageIdx + 1] || null;

    const todayISO = toISO(new Date());
    const t = Storage.getEntry(todayISO);
    const todayActive = !!(
      t.steps || (t.activities && t.activities.some((a) => a.type !== "restday")) ||
      t.pushups || t.plankSeconds || t.stretchingDone || t.challengeChecked
    );
    let mood = "neutral";
    if (streaks.current === 0) mood = "sad";
    else if (todayActive) mood = "happy";

    const unlockStats = computeCompanionUnlockStats();
    const settings = Storage.getSettings();
    const chosen = settings.equippedAccessories || {};
    const slots = COMPANION_SLOTS.map((slot) => Object.assign({}, slot, {
      items: slot.items.map((it) => Object.assign({}, it, { earned: unlockStats[slot.stat] >= it.threshold }))
    }));
    const equipped = resolveEquippedAccessories(unlockStats, chosen);

    return { species, stage, next, mood, slots, equipped, unlockStats, totalActiveDays: streaks.totalActiveDays, currentStreak: streaks.current };
  }

  const COMPANION_SPOT_POSITIONS_NORMAL = [
    [88, 130], [113, 118], [96, 100], [107, 148], [90, 160],
    [112, 80], [98, 62], [82, 148], [118, 135]
  ];
  const COMPANION_SPOT_POSITIONS_BABY = [
    [90, 160], [111, 150], [97, 135], [105, 175], [88, 178],
    [114, 168], [100, 120], [92, 145], [108, 130]
  ];

  function buildCompanionFaceSVG(cx, cy, mood, scale) {
    const s = scale || 1;
    const eyeDX = 7 * s, eyeDY = 1 * s;
    if (mood === "happy") {
      const l = cx - eyeDX, r = cx + eyeDX, ey = cy + eyeDY;
      return `
        <path d="M${l - 4 * s},${ey} Q${l},${ey - 5 * s} ${l + 4 * s},${ey}" stroke="#3E2723" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>
        <path d="M${r - 4 * s},${ey} Q${r},${ey - 5 * s} ${r + 4 * s},${ey}" stroke="#3E2723" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>
        <path d="M${cx - 6 * s},${cy + 9 * s} Q${cx},${cy + 14 * s} ${cx + 6 * s},${cy + 9 * s}" stroke="#3E2723" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>
      `;
    }
    if (mood === "sad") {
      const l = cx - eyeDX, r = cx + eyeDX, ey = cy + eyeDY;
      return `
        <circle cx="${l}" cy="${ey}" r="${1.8 * s}" fill="#3E2723"/>
        <circle cx="${r}" cy="${ey}" r="${1.8 * s}" fill="#3E2723"/>
        <path d="M${cx - 6 * s},${cy + 13 * s} Q${cx},${cy + 8 * s} ${cx + 6 * s},${cy + 13 * s}" stroke="#3E2723" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>
      `;
    }
    const l = cx - eyeDX, r = cx + eyeDX, ey = cy + eyeDY;
    return `
      <circle cx="${l}" cy="${ey}" r="${1.8 * s}" fill="#3E2723"/>
      <circle cx="${r}" cy="${ey}" r="${1.8 * s}" fill="#3E2723"/>
      <line x1="${cx - 5 * s}" y1="${cy + 11 * s}" x2="${cx + 5 * s}" y2="${cy + 11 * s}" stroke="#3E2723" stroke-width="${1.6 * s}" stroke-linecap="round"/>
    `;
  }

  /* Kleiner 5-zackiger Stern als SVG-Polygon, für das Quest-Abzeichen. */
  function starSVG(cx, cy, r, fill, stroke) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="0.6"/>`;
  }

  /* Die freigeschalteten Erfolgs-Accessoires werden wirklich von der
     Giraffe getragen statt nur als kleine Chip-Liste daneben zu stehen.
     Jeder Slot kann eine von mehreren Stufen tragen (siehe COMPANION_SLOTS)
     – "equipped" enthält pro Slot entweder das gewählte Item-Objekt oder
     null. Zwei Koordinatensätze (Baby- vs. normale Proportionen), analog
     zu den Flecken oben. Kopfschmuck entfällt, sobald ohnehin schon die
     Krone der "Stolzen Giraffe" sitzt (beides am Kopf, würde sich sonst
     überlagern – die Krone gewinnt als höchste Stufe). */
  /* Anker-Offsets für die Giraffe (Standard) – reproduzieren exakt die
     bisherigen fest verdrahteten Koordinaten, also 0-Deltas für alle
     Positionen, die schon absolut passend gezeichnet sind. */
  function giraffeAccessoryAnchors(isBaby) {
    return {
      ohr: isBaby ? [66, 84] : [70, 28],
      kopfDelta: [0, 0],
      bandanaDelta: [0, 0],
      brilleDelta: [0, 0],
      schalDelta: [0, 0],
      medailleDelta: [0, 0],
      abzeichen: isBaby ? [74, 120] : [74, 64]
    };
  }

  /* Zeichnet die freigeschalteten Accessoires. "anchors" verschiebt die
     (immer gleich gezeichneten) Accessoire-Formen an die passende Stelle
     der jeweiligen Tierart – so lässt sich derselbe Accessoire-Satz für
     Giraffi, Bärls und Sharky wiederverwenden, ohne jedes einzelne Teil
     für jede Tierart neu zeichnen zu müssen. */
  function buildCompanionAccessoriesSVG(equipped, isBaby, hasCrown, anchors) {
    let body = "";
    let face = "";
    const A = anchors || giraffeAccessoryAnchors(isBaby);
    const ohr = equipped.ohr, kopf = equipped.kopf, bandana = equipped.bandana,
      brille = equipped.brille, schal = equipped.schal, medaille = equipped.medaille,
      abzeichen = equipped.abzeichen;

    // --- Ohr: Blüte / Kleeblatt / Schmetterling -----------------------
    if (ohr) {
      const [ox, oy] = A.ohr;
      if (ohr.key === "flower") {
        const r = isBaby ? 3.4 : 3.2, rc = isBaby ? 3 : 2.8;
        body += `<g transform="translate(${ox} ${oy})">
          <circle cx="0" cy="-5" r="${r}" fill="#FF9FC9"/>
          <circle cx="4.7" cy="-1.5" r="${r}" fill="#FF9FC9"/>
          <circle cx="3.1" cy="4.2" r="${r}" fill="#FF9FC9"/>
          <circle cx="-3.1" cy="4.2" r="${r}" fill="#FF9FC9"/>
          <circle cx="-4.7" cy="-1.5" r="${r}" fill="#FF9FC9"/>
          <circle cx="0" cy="0" r="${rc}" fill="#F2C94C"/>
        </g>`;
      } else if (ohr.key === "clover") {
        body += `<g transform="translate(${ox} ${oy})">
          <circle cx="-3" cy="-3" r="4" fill="#7CB369"/>
          <circle cx="3" cy="-3" r="4" fill="#7CB369"/>
          <circle cx="0" cy="3" r="4" fill="#7CB369"/>
          <rect x="-0.7" y="4" width="1.4" height="7" fill="#5C9A4C"/>
        </g>`;
      } else if (ohr.key === "butterfly") {
        body += `<g transform="translate(${ox} ${oy})">
          <ellipse cx="-4" cy="-2" rx="4.5" ry="3.4" fill="#B98CE0"/>
          <ellipse cx="4" cy="-2" rx="4.5" ry="3.4" fill="#B98CE0"/>
          <ellipse cx="-3.4" cy="3" rx="3.2" ry="2.4" fill="#D6AEF0"/>
          <ellipse cx="3.4" cy="3" rx="3.2" ry="2.4" fill="#D6AEF0"/>
          <rect x="-0.6" y="-4" width="1.2" height="8" rx="0.6" fill="#5A3D7A"/>
        </g>`;
      }
    }

    // --- Kopf: Käppi / Zylinder / Partyhut (weicht der Krone) ----------
    if (!hasCrown && kopf) {
      const [kdx, kdy] = A.kopfDelta;
      let piece = "";
      if (isBaby) {
        if (kopf.key === "cap") piece = `<path d="M84,70 Q100,52 116,70 Z" fill="#5B8DEF"/><rect x="82" y="69" width="36" height="4" rx="2" fill="#3E6FD9"/>`;
        else if (kopf.key === "hat") piece = `<rect x="88" y="58" width="24" height="14" rx="2" fill="#3E2723"/><rect x="83" y="70" width="34" height="4" rx="2" fill="#3E2723"/><rect x="88" y="66" width="24" height="3" fill="#B5495A"/>`;
        else if (kopf.key === "partyhat") piece = `<path d="M100,48 L88,72 L112,72 Z" fill="#FF6FA5"/><path d="M100,48 L96,60 L104,60 Z" fill="#FFD166"/><circle cx="100" cy="46" r="3.5" fill="#F2C94C"/><rect x="86" y="70" width="28" height="3" rx="1.5" fill="#E23E76"/>`;
      } else {
        if (kopf.key === "cap") piece = `<path d="M84,14 Q100,-4 116,14 Z" fill="#5B8DEF"/><rect x="82" y="13" width="36" height="4" rx="2" fill="#3E6FD9"/>`;
        else if (kopf.key === "hat") piece = `<rect x="88" y="2" width="24" height="14" rx="2" fill="#3E2723"/><rect x="83" y="14" width="34" height="4" rx="2" fill="#3E2723"/><rect x="88" y="10" width="24" height="3" fill="#B5495A"/>`;
        else if (kopf.key === "partyhat") piece = `<path d="M100,-8 L88,16 L112,16 Z" fill="#FF6FA5"/><path d="M100,-8 L96,4 L104,4 Z" fill="#FFD166"/><circle cx="100" cy="-10" r="3.5" fill="#F2C94C"/><rect x="86" y="14" width="28" height="3" rx="1.5" fill="#E23E76"/>`;
      }
      if (piece) body += `<g transform="translate(${kdx},${kdy})">${piece}</g>`;
    }

    // --- Hals oben: Bandana / Fliege / Glitzer-Halsband -----------------
    if (bandana) {
      const [bdx, bdy] = A.bandanaDelta;
      let piece = "";
      if (isBaby) {
        if (bandana.key === "bandana") piece = `<path d="M100,112 L86,104 L86,120 Z" fill="#FF6FA5" stroke="#D6488B" stroke-width="1"/><path d="M100,112 L114,104 L114,120 Z" fill="#FF6FA5" stroke="#D6488B" stroke-width="1"/><circle cx="100" cy="112" r="4.5" fill="#E23E76"/>`;
        else if (bandana.key === "bowtie") piece = `<path d="M100,112 L88,106 L88,118 Z" fill="#5B8DEF" stroke="#3E6FD9" stroke-width="1"/><path d="M100,112 L112,106 L112,118 Z" fill="#5B8DEF" stroke="#3E6FD9" stroke-width="1"/><rect x="97" y="108" width="6" height="8" rx="1.5" fill="#3E6FD9"/>`;
        else if (bandana.key === "sparklecollar") piece = `<ellipse cx="100" cy="112" rx="15" ry="6" fill="none" stroke="#F2C94C" stroke-width="3"/><circle cx="86" cy="110" r="1.6" fill="#FFF6D9"/><circle cx="114" cy="110" r="1.6" fill="#FFF6D9"/><circle cx="100" cy="118" r="1.6" fill="#FFF6D9"/>`;
      } else {
        if (bandana.key === "bandana") piece = `<path d="M100,56 L88,49 L88,63 Z" fill="#FF6FA5" stroke="#D6488B" stroke-width="1"/><path d="M100,56 L112,49 L112,63 Z" fill="#FF6FA5" stroke="#D6488B" stroke-width="1"/><circle cx="100" cy="56" r="4" fill="#E23E76"/>`;
        else if (bandana.key === "bowtie") piece = `<path d="M100,56 L88,50 L88,62 Z" fill="#5B8DEF" stroke="#3E6FD9" stroke-width="1"/><path d="M100,56 L112,50 L112,62 Z" fill="#5B8DEF" stroke="#3E6FD9" stroke-width="1"/><rect x="97" y="52" width="6" height="8" rx="1.5" fill="#3E6FD9"/>`;
        else if (bandana.key === "sparklecollar") piece = `<ellipse cx="100" cy="56" rx="15" ry="6" fill="none" stroke="#F2C94C" stroke-width="3"/><circle cx="86" cy="54" r="1.6" fill="#FFF6D9"/><circle cx="114" cy="54" r="1.6" fill="#FFF6D9"/><circle cx="100" cy="62" r="1.6" fill="#FFF6D9"/>`;
      }
      if (piece) body += `<g transform="translate(${bdx},${bdy})">${piece}</g>`;
    }

    // --- Schal: Schal / Winterschal / Regenbogenschal -------------------
    if (schal) {
      const [sdx, sdy] = A.schalDelta;
      let piece = "";
      if (isBaby) {
        if (schal.key === "scarf") piece = `<g fill="#8C4FC9"><path d="M87,140 Q100,152 113,140 L113,150 Q100,162 87,150 Z"/><path d="M92,148 L89,178 L96,178 L98,150 Z"/><path d="M108,148 L111,174 L104,174 L102,150 Z"/></g>`;
        else if (schal.key === "winterscarf") piece = `<g><path d="M87,140 Q100,152 113,140 L113,150 Q100,162 87,150 Z" fill="#2F9E9E"/><path d="M92,148 L89,178 L96,178 L98,150 Z" fill="#2F9E9E"/><path d="M108,148 L111,174 L104,174 L102,150 Z" fill="#2F9E9E"/><rect x="90" y="155" width="6" height="4" fill="#fff" opacity="0.6"/><rect x="106" y="155" width="6" height="4" fill="#fff" opacity="0.6"/></g>`;
        else if (schal.key === "rainbowscarf") piece = `<g><path d="M87,140 Q100,152 113,140 L113,150 Q100,162 87,150 Z" fill="#FF6FA5"/><path d="M92,148 L89,163 L96,163 L97,150 Z" fill="#FFD166"/><path d="M92,163 L89,178 L96,178 L96,163 Z" fill="#5B8DEF"/><path d="M108,148 L111,161 L104,161 L102,150 Z" fill="#7CB369"/><path d="M108,161 L111,174 L104,174 L104,161 Z" fill="#B98CE0"/></g>`;
      } else {
        if (schal.key === "scarf") piece = `<g fill="#8C4FC9"><path d="M84,98 Q100,112 116,98 L116,110 Q100,124 84,110 Z"/><path d="M90,108 L86,146 L94,146 L96,110 Z"/><path d="M110,108 L114,140 L106,140 L104,110 Z"/></g>`;
        else if (schal.key === "winterscarf") piece = `<g><path d="M84,98 Q100,112 116,98 L116,110 Q100,124 84,110 Z" fill="#2F9E9E"/><path d="M90,108 L86,146 L94,146 L96,110 Z" fill="#2F9E9E"/><path d="M110,108 L114,140 L106,140 L104,110 Z" fill="#2F9E9E"/><rect x="88" y="115" width="6" height="4" fill="#fff" opacity="0.6"/><rect x="108" y="115" width="6" height="4" fill="#fff" opacity="0.6"/></g>`;
        else if (schal.key === "rainbowscarf") piece = `<g><path d="M84,98 Q100,112 116,98 L116,110 Q100,124 84,110 Z" fill="#FF6FA5"/><path d="M90,108 L86,127 L94,127 L95,110 Z" fill="#FFD166"/><path d="M90,127 L86,146 L94,146 L94,127 Z" fill="#5B8DEF"/><path d="M110,108 L114,125 L106,125 L104,110 Z" fill="#7CB369"/><path d="M110,125 L114,140 L106,140 L106,125 Z" fill="#B98CE0"/></g>`;
      }
      if (piece) body += `<g transform="translate(${sdx},${sdy})">${piece}</g>`;
    }

    // --- Medaille: Bronze / Gold / Pokal (Brustbereich) -----------------
    if (medaille) {
      const [mdx, mdy] = A.medailleDelta;
      let piece = "";
      if (isBaby) {
        if (medaille.key === "bronze") piece = `<path d="M95,166 L100,179 L105,166" stroke="#8899C9" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="100" cy="183" r="6" fill="#C97A4C" stroke="#A5613A" stroke-width="1.3"/>`;
        else if (medaille.key === "gold") piece = `<path d="M94,164 L100,180 L106,164" stroke="#5A64B0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="100" cy="185" r="7.5" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/><circle cx="100" cy="185" r="3.7" fill="#FFF6D9"/>`;
        else if (medaille.key === "trophy") piece = `<g fill="#F2C94C" stroke="#D9A824" stroke-width="1"><path d="M92,164 h16 v6 a8,8 0 0 1 -16,0 Z"/><rect x="97" y="176" width="6" height="6"/><rect x="92" y="182" width="16" height="4" rx="1.5"/><path d="M92,166 q-6,0 -6,6 q0,5 6,5" fill="none" stroke-width="2"/><path d="M108,166 q6,0 6,6 q0,5 -6,5" fill="none" stroke-width="2"/></g>`;
      } else {
        if (medaille.key === "bronze") piece = `<path d="M95,142 L100,157 L105,142" stroke="#8899C9" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="100" cy="161" r="6.5" fill="#C97A4C" stroke="#A5613A" stroke-width="1.3"/>`;
        else if (medaille.key === "gold") piece = `<path d="M94,140 L100,158 L106,140" stroke="#5A64B0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="100" cy="163" r="8" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/><circle cx="100" cy="163" r="4" fill="#FFF6D9"/>`;
        else if (medaille.key === "trophy") piece = `<g fill="#F2C94C" stroke="#D9A824" stroke-width="1"><path d="M92,140 h16 v6 a8,8 0 0 1 -16,0 Z"/><rect x="97" y="152" width="6" height="6"/><rect x="92" y="158" width="16" height="4" rx="1.5"/><path d="M92,142 q-6,0 -6,6 q0,5 6,5" fill="none" stroke-width="2"/><path d="M108,142 q6,0 6,6 q0,5 -6,5" fill="none" stroke-width="2"/></g>`;
      }
      if (piece) body += `<g transform="translate(${mdx},${mdy})">${piece}</g>`;
    }

    // --- Quest-Abzeichen: Bronze/Silber/Gold-Stern an der Schulter ------
    if (abzeichen) {
      const [ax, ay] = A.abzeichen;
      const colors = { bronze_badge: ["#C97A4C", "#A5613A"], silver_badge: ["#C7CDD6", "#9AA3AF"], gold_badge: ["#F2C94C", "#D9A824"] };
      const [fill, stroke] = colors[abzeichen.key] || colors.bronze_badge;
      body += `<g>${starSVG(ax, ay, isBaby ? 5.5 : 5, fill, stroke)}</g>`;
    }

    // --- Brille: Sonnenbrille / Herzbrille / Sternbrille (auf dem Gesicht) --
    if (brille) {
      const [grdx, grdy] = A.brilleDelta;
      let piece = "";
      if (isBaby) {
        if (brille.key === "sunglasses") piece = `<g><rect x="85" y="96.5" width="13" height="9.5" rx="3.7" fill="#2B2B2B"/><rect x="102" y="96.5" width="13" height="9.5" rx="3.7" fill="#2B2B2B"/><rect x="98" y="99.2" width="4" height="2.5" fill="#2B2B2B"/><line x1="83" y1="99.5" x2="85" y2="101" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/><line x1="115" y1="101" x2="117" y2="99.5" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/><rect x="86" y="98.5" width="11" height="4.2" rx="2" fill="#5B7FBF" opacity="0.5"/><rect x="103" y="98.5" width="11" height="4.2" rx="2" fill="#5B7FBF" opacity="0.5"/></g>`;
        else if (brille.key === "heartglasses") piece = `<g fill="#FF6FA5"><path d="M91.5,105 C85,100 88,94 91.5,97 C95,94 98,100 91.5,105 Z"/><path d="M108.5,105 C102,100 105,94 108.5,97 C112,94 115,100 108.5,105 Z"/></g>`;
        else if (brille.key === "starglasses") piece = `<g><circle cx="91.5" cy="101.5" r="6.5" fill="#FFF3B0" opacity="0.9"/><circle cx="108.5" cy="101.5" r="6.5" fill="#FFF3B0" opacity="0.9"/><path d="M91.5,95 L93,100 L98,101.5 L93,103 L91.5,108 L90,103 L85,101.5 L90,100 Z" fill="#F2C94C"/><path d="M108.5,95 L110,100 L115,101.5 L110,103 L108.5,108 L107,103 L102,101.5 L107,100 Z" fill="#F2C94C"/><rect x="98" y="99.2" width="4" height="2.5" fill="#2B2B2B"/></g>`;
      } else {
        if (brille.key === "sunglasses") piece = `<g><rect x="86" y="41" width="12" height="9" rx="3.5" fill="#2B2B2B"/><rect x="102" y="41" width="12" height="9" rx="3.5" fill="#2B2B2B"/><rect x="98" y="43.5" width="4" height="2.4" fill="#2B2B2B"/><line x1="84" y1="44" x2="86" y2="45.5" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/><line x1="114" y1="45.5" x2="116" y2="44" stroke="#2B2B2B" stroke-width="1.4" stroke-linecap="round"/><rect x="87" y="43" width="10" height="4" rx="2" fill="#5B7FBF" opacity="0.5"/><rect x="103" y="43" width="10" height="4" rx="2" fill="#5B7FBF" opacity="0.5"/></g>`;
        else if (brille.key === "heartglasses") piece = `<g fill="#FF6FA5"><path d="M92,49 C86,44 89,38 92,41 C95,38 98,44 92,49 Z"/><path d="M108,49 C102,44 105,38 108,41 C111,38 114,44 108,49 Z"/></g>`;
        else if (brille.key === "starglasses") piece = `<g><circle cx="92" cy="45.5" r="6" fill="#FFF3B0" opacity="0.9"/><circle cx="108" cy="45.5" r="6" fill="#FFF3B0" opacity="0.9"/><path d="M92,39 L93.3,44 L98,45.5 L93.3,47 L92,52 L90.7,47 L86,45.5 L90.7,44 Z" fill="#F2C94C"/><path d="M108,39 L109.3,44 L114,45.5 L109.3,47 L108,52 L106.7,47 L102,45.5 L106.7,44 Z" fill="#F2C94C"/><rect x="98" y="43.2" width="4" height="2.5" fill="#2B2B2B"/></g>`;
      }
      if (piece) face += `<g transform="translate(${grdx},${grdy})">${piece}</g>`;
    }

    return { body, face };
  }

  function buildGiraffeSVG(stage, mood, equipped) {
    const isBaby = stage.key === "baby";
    const bodyColor = "#F6D9A6", darkColor = "#E0B679", spotColor = "#C97A3B", muzzleColor = "#FBEAD0";
    const spots = (isBaby ? COMPANION_SPOT_POSITIONS_BABY : COMPANION_SPOT_POSITIONS_NORMAL)
      .slice(0, stage.spots)
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="5" fill="${spotColor}" opacity="0.85"/>`)
      .join("");
    const acc = buildCompanionAccessoriesSVG(equipped || {}, isBaby, !!stage.crown, giraffeAccessoryAnchors(isBaby));

    if (isBaby) {
      return `<svg viewBox="0 0 200 220" width="${stage.size}" height="${Math.round(stage.size * 1.1)}">
        <ellipse cx="118" cy="212" rx="34" ry="5" fill="#000" opacity="0.06"/>
        <rect x="76" y="185" width="9" height="24" rx="4.5" fill="${darkColor}"/>
        <rect x="90" y="188" width="9" height="24" rx="4.5" fill="${darkColor}"/>
        <rect x="106" y="188" width="9" height="24" rx="4.5" fill="${darkColor}"/>
        <rect x="120" y="185" width="9" height="24" rx="4.5" fill="${darkColor}"/>
        <ellipse cx="100" cy="182" rx="36" ry="24" fill="${bodyColor}"/>
        <path d="M84,168 C82,145 84,118 90,100 L112,100 C116,118 118,145 116,168 Z" fill="${bodyColor}"/>
        <ellipse cx="100" cy="93" rx="27" ry="22" fill="${bodyColor}"/>
        <ellipse cx="78" cy="82" rx="8" ry="10" fill="${bodyColor}"/>
        <ellipse cx="122" cy="82" rx="8" ry="10" fill="${bodyColor}"/>
        <rect x="90" y="66" width="4" height="12" rx="2" fill="${bodyColor}"/>
        <rect x="106" y="66" width="4" height="12" rx="2" fill="${bodyColor}"/>
        <circle cx="92" cy="66" r="4.5" fill="${darkColor}"/>
        <circle cx="108" cy="66" r="4.5" fill="${darkColor}"/>
        <ellipse cx="100" cy="106" rx="12" ry="8" fill="${muzzleColor}"/>
        ${spots}
        ${stage.crown ? `<path d="M84,60 L90,44 L100,56 L110,44 L116,60 Z" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/>` : ""}
        ${acc.body}
        ${buildCompanionFaceSVG(100, 100, mood, 1.05)}
        ${acc.face}
      </svg>`;
    }

    return `<svg viewBox="0 0 200 220" width="${stage.size}" height="${Math.round(stage.size * 1.1)}">
      <ellipse cx="100" cy="207" rx="42" ry="6" fill="#000" opacity="0.06"/>
      <rect x="72" y="168" width="10" height="42" rx="5" fill="${darkColor}"/>
      <rect x="86" y="172" width="10" height="42" rx="5" fill="${darkColor}"/>
      <rect x="104" y="172" width="10" height="42" rx="5" fill="${darkColor}"/>
      <rect x="118" y="168" width="10" height="42" rx="5" fill="${darkColor}"/>
      <ellipse cx="100" cy="165" rx="41" ry="27" fill="${bodyColor}"/>
      <path d="M85,150 C85,108 92,68 94,44 L106,44 C108,68 115,108 115,150 Z" fill="${bodyColor}"/>
      <ellipse cx="100" cy="37" rx="21" ry="17" fill="${bodyColor}"/>
      <ellipse cx="81" cy="26" rx="8" ry="6" fill="${bodyColor}" transform="rotate(-20 81 26)"/>
      <ellipse cx="119" cy="26" rx="8" ry="6" fill="${bodyColor}" transform="rotate(20 119 26)"/>
      <rect x="91" y="12" width="4" height="13" rx="2" fill="${bodyColor}"/>
      <rect x="105" y="12" width="4" height="13" rx="2" fill="${bodyColor}"/>
      <circle cx="93" cy="12" r="4.5" fill="${darkColor}"/>
      <circle cx="107" cy="12" r="4.5" fill="${darkColor}"/>
      <ellipse cx="100" cy="49" rx="10" ry="7" fill="${muzzleColor}"/>
      ${spots}
      ${stage.crown ? `<path d="M83,8 L90,-8 L100,4 L110,-8 L117,8 Z" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/>` : ""}
      ${acc.body}
      ${buildCompanionFaceSVG(100, 44, mood, 1)}
      ${acc.face}
    </svg>`;
  }

  /* Bärls und Sharky nutzen – anders als die Giraffe mit ihrem
     wachsenden Hals – für alle vier Wachstumsstufen dieselbe Zeichnung
     (nur Größe und Krone ändern sich), genau wie schon Giraffis eigene
     Stufen "Junge/Erwachsene/Stolze Giraffe" untereinander eine
     gemeinsame Vorlage teilen. Die Accessoire-Formen selbst werden 1:1
     wiederverwendet, nur an eine passende Stelle auf dem jeweiligen
     Körper verschoben (siehe Anker-Deltas unten). */
  const BEAR_ACCESSORY_ANCHORS = {
    ohr: [150, 46], kopfDelta: [0, 22], bandanaDelta: [0, 76], brilleDelta: [0, 54],
    schalDelta: [0, 42], medailleDelta: [0, 45], abzeichen: [42, 158]
  };

  /* Bärls bekommt – anders als die erste Fassung, die nur eine einzige
     große Kugel mit Ohren war – einen klar erkennbaren Kopf (eigene
     Ellipse), der leicht auf dem Körper aufsitzt, dazu einen hellen
     Bauch-Fleck wie beim Kuscheltier-Vorbild. */
  function buildBearSVG(stage, mood, equipped) {
    const bodyColor = "#8B5E3C", darkColor = "#6E4A2E", muzzleColor = "#E8C9A0";
    const acc = buildCompanionAccessoriesSVG(equipped || {}, false, !!stage.crown, BEAR_ACCESSORY_ANCHORS);
    return `<svg viewBox="0 0 200 220" width="${stage.size}" height="${Math.round(stage.size * 1.1)}">
      <ellipse cx="100" cy="216" rx="46" ry="5" fill="#000" opacity="0.06"/>
      <ellipse cx="78" cy="207" rx="16" ry="12" fill="${darkColor}"/>
      <ellipse cx="122" cy="207" rx="16" ry="12" fill="${darkColor}"/>
      <ellipse cx="38" cy="163" rx="15" ry="21" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1" transform="rotate(14 38 163)"/>
      <ellipse cx="162" cy="163" rx="15" ry="21" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1" transform="rotate(-14 162 163)"/>
      <ellipse cx="100" cy="172" rx="54" ry="46" fill="${bodyColor}"/>
      <ellipse cx="100" cy="188" rx="28" ry="24" fill="${muzzleColor}" opacity="0.3"/>
      <ellipse cx="100" cy="96" rx="46" ry="42" fill="${bodyColor}"/>
      <circle cx="62" cy="58" r="19" fill="${bodyColor}"/>
      <circle cx="138" cy="58" r="19" fill="${bodyColor}"/>
      <circle cx="62" cy="58" r="9.5" fill="${darkColor}"/>
      <circle cx="138" cy="58" r="9.5" fill="${darkColor}"/>
      <ellipse cx="100" cy="108" rx="28" ry="21" fill="${muzzleColor}"/>
      <ellipse cx="100" cy="103" rx="7" ry="5" fill="${darkColor}"/>
      ${stage.crown ? `<path d="M76,38 L84,20 L100,34 L116,20 L124,38 Z" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/>` : ""}
      ${acc.body}
      ${buildCompanionFaceSVG(100, 98, mood, 1)}
      ${acc.face}
    </svg>`;
  }

  const SHARK_ACCESSORY_ANCHORS = {
    ohr: [152, 92], kopfDelta: [0, 66], bandanaDelta: [0, 84], brilleDelta: [0, 60],
    schalDelta: [0, 22], medailleDelta: [0, 35], abzeichen: [54, 116]
  };

  function buildSharkSVG(stage, mood, equipped) {
    const bodyColor = "#7FAFC9", darkColor = "#4F7B99", bellyColor = "#F0F8FC";
    const acc = buildCompanionAccessoriesSVG(equipped || {}, false, !!stage.crown, SHARK_ACCESSORY_ANCHORS);
    return `<svg viewBox="0 0 200 220" width="${stage.size}" height="${Math.round(stage.size * 1.1)}">
      <ellipse cx="100" cy="213" rx="44" ry="6" fill="#000" opacity="0.06"/>
      <path d="M64,187 L86,187 L76,213 Z" fill="${darkColor}"/>
      <path d="M136,187 L114,187 L124,213 Z" fill="${darkColor}"/>
      <path d="M84,58 L98,16 L106,58 L116,50 L100,10 L84,50 Z" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M100,58 C144,58 168,92 165,132 C162,168 140,198 100,212 C60,198 38,168 35,132 C32,92 56,58 100,58 Z" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1.5"/>
      <path d="M35,105 L4,88 L8,138 L38,148 Z" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M165,105 L196,88 L192,138 L162,148 Z" fill="${bodyColor}" stroke="${darkColor}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M100,96 C132,96 148,120 146,150 C144,178 126,198 100,206 C74,198 56,178 54,150 C52,120 68,96 100,96 Z" fill="${bellyColor}"/>
      <path d="M42,116 q7,4 1,10" stroke="${darkColor}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
      <path d="M158,116 q-7,4 -1,10" stroke="${darkColor}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
      ${stage.crown ? `<path d="M78,46 L86,28 L100,42 L114,28 L122,46 Z" fill="#F2C94C" stroke="#D9A824" stroke-width="1.5"/>` : ""}
      ${acc.body}
      ${buildCompanionFaceSVG(100, 104, mood, 1)}
      ${acc.face}
    </svg>`;
  }

  function buildCompanionSVG(species, stage, mood, equipped) {
    if (species && species.key === "bear") return buildBearSVG(stage, mood, equipped);
    if (species && species.key === "shark") return buildSharkSVG(stage, mood, equipped);
    return buildGiraffeSVG(stage, mood, equipped);
  }

  /* Feiert neu freigeschaltete Accessoires einmalig per Toast, statt sie
     nur still im Bild auftauchen zu lassen – merkt sich dafür, welche
     Accessoires schon "gesehen" wurden. */
  function checkCompanionAccessoryUnlocks(state) {
    const settings = Storage.getSettings();
    const seen = settings.seenAccessoryKeys || [];
    const allItems = [];
    state.slots.forEach((slot) => slot.items.forEach((it) => allItems.push(it)));
    const earnedNow = allItems.filter((it) => it.earned).map((it) => it.key);
    const newlyEarned = allItems.filter((it) => it.earned && !seen.includes(it.key));
    if (newlyEarned.length) {
      const names = newlyEarned.map((it) => `${it.emoji} ${it.title}`).join(", ");
      showToast(`${getActiveSpecies().name} hat ein neues Outfit bekommen: ${names}! 🎉`);
    }
    if (newlyEarned.length || seen.length !== earnedNow.length) {
      Storage.saveSettings({ seenAccessoryKeys: earnedNow });
    }
  }

  function buildCompanionHTML(precomputedState) {
    const state = precomputedState || computeCompanionState();
    const species = state.species || getActiveSpecies();
    const name = species.name;
    const svg = buildCompanionSVG(species, state.stage, state.mood, state.equipped);
    const moodText = state.mood === "happy"
      ? `${name} freut sich – du warst heute schon aktiv! 🎉`
      : state.mood === "sad"
        ? "Deine Streak ist gerissen – ein kleiner Schritt heute baut sie wieder auf."
        : `${name} wartet gespannt auf deine erste Aktivität heute.`;
    const nextText = state.next
      ? `Noch ${state.next.min - state.totalActiveDays} aktive Tage bis „${state.next.label}"`
      : "Höchste Stufe erreicht – mehr geht nicht mehr! 🏆";

    const wornHTML = state.slots.map((slot) => {
      const item = state.equipped[slot.key];
      return `<span class="companion-acc${item ? " earned" : ""}" title="${esc(slot.label)}${item ? ": " + esc(item.title) : " (nichts ausgestattet)"}">${item ? item.emoji : "➖"}</span>`;
    }).join("");

    const wardrobeHTML = state.slots.map((slot) => {
      const equippedItem = state.equipped[slot.key];
      const equippedKey = equippedItem ? equippedItem.key : null;
      const itemsHTML = slot.items.map((it) => {
        const cls = ["wardrobe-item"];
        if (!it.earned) cls.push("locked");
        if (it.key === equippedKey) cls.push("selected");
        const missing = Math.max(0, it.threshold - (state.unlockStats[slot.stat] || 0));
        const hint = it.earned ? it.title : `Noch ${missing} ${slot.statLabel} bis „${it.title}"`;
        return `
          <button type="button" class="${cls.join(" ")}" data-equip-slot="${slot.key}" data-equip-item="${it.key}" ${it.earned ? "" : "disabled"} title="${esc(hint)}">
            <span class="wardrobe-item-emoji">${it.earned ? it.emoji : "🔒"}</span>
            <span class="wardrobe-item-title">${esc(it.title)}</span>
          </button>
        `;
      }).join("");
      const noneCls = ["wardrobe-item", "wardrobe-none"];
      if (!equippedKey) noneCls.push("selected");
      return `
        <div class="wardrobe-slot">
          <div class="wardrobe-slot-label">${esc(slot.label)}</div>
          <div class="wardrobe-slot-items">
            <button type="button" class="${noneCls.join(" ")}" data-equip-slot="${slot.key}" data-equip-item="none" title="Nichts tragen">
              <span class="wardrobe-item-emoji">➖</span>
              <span class="wardrobe-item-title">Ohne</span>
            </button>
            ${itemsHTML}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="card companion-card">
        <div class="companion-row">
          <div class="companion-svg-wrap">${svg}</div>
          <div class="companion-info">
            <div class="companion-name">${esc(name)}</div>
            <div class="companion-stage">${esc(state.stage.label)}</div>
            <div class="small muted">${esc(nextText)}</div>
            <div class="companion-mood">${esc(moodText)}</div>
          </div>
        </div>
        <div class="companion-accessories">${wornHTML}</div>
        <button type="button" class="companion-wardrobe-toggle" id="companionWardrobeToggle">🎨 ${esc(name)} ausstatten${companionWardrobeOpen ? " ▲" : " ▼"}</button>
        <div class="companion-wardrobe" id="companionWardrobe" ${companionWardrobeOpen ? "" : "hidden"}>
          <div class="small muted companion-wardrobe-hint">Wähle pro Kategorie, was ${esc(name)} tragen soll – nur Freigeschaltetes ist wählbar.</div>
          ${wardrobeHTML}
          <button type="button" class="btn btn-ghost btn-sm btn-block companion-wardrobe-close" id="companionWardrobeClose">Fertig – Garderobe schließen ✕</button>
        </div>
      </div>
    `;
  }

  function bindCompanionWardrobe() {
    const toggleBtn = document.getElementById("companionWardrobeToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        companionWardrobeOpen = !companionWardrobeOpen;
        renderHeute();
      });
    }
    const closeBtn = document.getElementById("companionWardrobeClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        companionWardrobeOpen = false;
        renderHeute();
      });
    }
    document.querySelectorAll("[data-equip-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        const slot = btn.getAttribute("data-equip-slot");
        const item = btn.getAttribute("data-equip-item");
        Storage.setEquippedAccessory(slot, item);
        companionWardrobeOpen = true;
        renderHeute();
      });
    });
  }

  /* Einfacher, deterministischer String-Hash (djb2) – dient dazu, aus
     einem Datum ohne Zufallsgenerator (und damit stabil bei jedem
     Neu-Rendern) eine Zahl abzuleiten. */
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function getChaosChallengeForDate(dateISO) {
    const settings = Storage.getSettings();
    if (settings.chaosMode === false) return null;
    const h = hashString("chaos-" + dateISO);
    if (h % 3 !== 0) return null; // an ca. jedem 3. Tag
    const idx = Math.floor(h / 3) % CHAOS_CHALLENGES.length;
    return CHAOS_CHALLENGES[idx];
  }

  function buildChaosCardHTML(dateISO, chaos) {
    const entry = Storage.getEntry(dateISO);
    return `
      <div class="card chaos-card">
        <div class="chaos-card-label">🎲 Chaos-Challenge des Tages</div>
        <div class="chaos-card-text"><span class="chaos-icon">${chaos.icon}</span> ${esc(chaos.text)}</div>
        <label class="chaos-check-row">
          <input type="checkbox" id="chaosCheck" ${entry.chaosDone ? "checked" : ""}>
          <span>Gemeistert!</span>
        </label>
      </div>
    `;
  }

  /* Nachrichten an dich selbst: taucht eine Nachricht auf, die man sich
     früher selbst geschrieben hat, wenn gerade eine schwierige Phase
     erkannt wird (eine bestehende Streak ist frisch gerissen). Wird pro
     Tag höchstens einmal angezeigt (danach per Settings-Flag
     ausgeblendet), taucht am nächsten Tag aber wieder auf, solange die
     Situation anhält. */
  function pickSelfMessageForDate(dateISO, messages) {
    if (!messages.length) return null;
    const h = hashString("selfmsg-" + dateISO);
    return messages[h % messages.length];
  }

  function shouldShowSelfMessage(dateISO) {
    const settings = Storage.getSettings();
    if (settings.lastSelfMessageDismissedDate === dateISO) return false;
    const messages = Storage.getSelfMessages();
    if (!messages.length) return false;
    const streaks = computeStreaks();
    return streaks.current === 0 && streaks.longest >= 3;
  }

  function buildSelfMessageCardHTML(dateISO) {
    if (!shouldShowSelfMessage(dateISO)) return "";
    const msg = pickSelfMessageForDate(dateISO, Storage.getSelfMessages());
    if (!msg) return "";
    return `
      <div class="card self-message-card">
        <div class="self-message-label">💌 Eine Nachricht von dir an dich</div>
        <div class="self-message-text">„${esc(msg.text)}"</div>
        <div class="self-message-date">geschrieben am ${formatShortDate(fromISO(msg.date))}</div>
        <button type="button" class="btn btn-ghost btn-sm self-message-dismiss" style="margin-top:10px;">Danke, gelesen 💛</button>
      </div>
    `;
  }

  function bindSelfMessageCard(dateISO) {
    const btn = document.querySelector(".self-message-dismiss");
    if (!btn) return;
    btn.addEventListener("click", () => {
      Storage.saveSettings({ lastSelfMessageDismissedDate: dateISO });
      renderHeute();
    });
  }

  function renderHeute() {
    const container = document.getElementById("tab-heute");
    const today = new Date();
    const dateISO = toISO(today);
    const hour = today.getHours();
    const greeting = hour < 11 ? "Guten Morgen ☀️" : hour < 18 ? "Schön, dass du da bist 👋" : "Guten Abend 🌙";
    const chaos = getChaosChallengeForDate(dateISO);
    const companionState = computeCompanionState();
    container.innerHTML = `
      <div class="hero-card">
        <div class="hero-greeting">${greeting}</div>
        <div class="hero-date">${formatWeekdayDate(today)}</div>
      </div>
      ${buildCompanionHTML(companionState)}
      ${buildQuestCardHTML()}
      ${chaos ? buildChaosCardHTML(dateISO, chaos) : ""}
      ${buildSelfMessageCardHTML(dateISO)}
      <div id="heuteEditor"></div>
    `;
    checkCompanionAccessoryUnlocks(companionState);
    bindCompanionWardrobe();
    if (chaos) {
      const chaosCheck = document.getElementById("chaosCheck");
      if (chaosCheck) {
        chaosCheck.addEventListener("change", () => {
          Storage.updateEntry(dateISO, (e) => { e.chaosDone = chaosCheck.checked; });
          if (chaosCheck.checked) showToast("🎲 Chaos-Challenge gemeistert!");
        });
      }
    }
    bindSelfMessageCard(dateISO);
    const editorRoot = document.getElementById("heuteEditor");
    editorRoot.innerHTML = entryEditorHTML(dateISO);
    bindEntryEditor(editorRoot, dateISO, renderHeute);
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Woche                                                         */
  /* ---------------------------------------------------------------- */

  let wocheAnchor = new Date();

  function weekAggregate(weekStart) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    let steps = 0, stepDays = 0, minutes = 0, calories = 0, distance = 0, sessionsCount = 0;
    const byType = {};
    days.forEach((d) => {
      const entry = Storage.getEntry(toISO(d));
      if (entry.steps) { steps += entry.steps; stepDays++; }
      entry.activities.forEach((a) => {
        const m = Number(a.zeit) || 0;
        minutes += m;
        calories += Number(a.kalorien) || 0;
        distance += Number(a.distanz) || 0;
        if (a.type !== "restday") sessionsCount++;
        if (!byType[a.type]) byType[a.type] = { count: 0, minutes: 0 };
        byType[a.type].count++;
        byType[a.type].minutes += m || 1;
      });
    });
    return { days, steps, stepDays, minutes, calories, distance, byType, sessionsCount };
  }

  function buildActivityMixBar(weights) {
    const keys = Object.keys(weights).filter((k) => weights[k] > 0 && (SPORTS[k] || SPORTS.custom));
    if (!keys.length) return "";
    const segs = keys.map((k) => {
      const s = SPORTS[k] || SPORTS.custom;
      return `<div style="flex:${weights[k]} 0 0%; background:${s.fg};" title="${esc(s.label)}"></div>`;
    }).join("");
    return `<div class="mix-bar">${segs}</div>`;
  }

  function buildVerticalBarChart(days, getValue) {
    const values = days.map(getValue);
    const maxVal = Math.max(1000, ...values);
    const today = new Date();
    const cols = days.map((d, i) => {
      const val = values[i];
      const pct = val ? Math.max(4, Math.round((val / maxVal) * 100)) : 2;
      const isToday = isSameDay(d, today);
      return `<div class="vbar-col">
        <div class="vbar-value">${val ? val.toLocaleString("de-DE") : ""}</div>
        <div class="vbar-track"><div class="vbar-fill${isToday ? " today" : ""}" style="height:${pct}%"></div></div>
        <div class="vbar-label">${WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}</div>
      </div>`;
    }).join("");
    return `<div class="vbar-chart">${cols}</div>`;
  }

  function renderWoche() {
    const container = document.getElementById("tab-woche");
    const weekStart = startOfWeek(wocheAnchor);
    const weekEnd = addDays(weekStart, 6);
    const wKey = weekKey(wocheAnchor);
    const agg = weekAggregate(weekStart);

    const typeChips = Object.keys(agg.byType).length
      ? Object.keys(agg.byType).map((k) => {
          const s = SPORTS[k] || SPORTS.custom;
          return `<span class="chip" style="background:${s.bg};color:${s.fg};"><span class="emoji">${s.icon}</span>${s.label} × ${agg.byType[k].count}</span>`;
        }).join(" ")
      : `<span class="small muted">Noch keine Aktivitäten diese Woche.</span>`;

    const mixWeights = {};
    Object.keys(agg.byType).forEach((k) => { mixWeights[k] = agg.byType[k].minutes; });
    const mixBarHTML = buildActivityMixBar(mixWeights);

    const stepsChart = buildVerticalBarChart(agg.days, (d) => Storage.getEntry(toISO(d)).steps || 0);

    const goals = Storage.getSettings();
    let weeklyGoalHTML = "";
    if (goals.weeklyGoalMode === "sessions" || goals.weeklyGoalMode === "minutes") {
      const isSessions = goals.weeklyGoalMode === "sessions";
      const target = isSessions ? (goals.weeklyGoalSessions || DEFAULT_WEEKLY_GOAL_SESSIONS) : (goals.weeklyGoalMinutes || DEFAULT_WEEKLY_GOAL_MINUTES);
      const val = isSessions ? agg.sessionsCount : agg.minutes;
      const pct = Math.min(100, Math.round((val / target) * 100));
      const label = isSessions ? "Trainingseinheiten" : "Aktive Minuten";
      const valueText = isSessions ? `${val} / ${target}` : `${val} / ${target} min`;
      weeklyGoalHTML = `
        <h2 class="section-title">Wochenziel</h2>
        <div class="card">
          <div class="row-between"><span class="field-label" style="margin-bottom:0;">${label} diese Woche</span><span class="small muted">${valueText}</span></div>
          <div class="progress-bar-lg" style="margin-top:10px;"><div class="fill" style="width:${pct}%"></div></div>
          ${val >= target ? `<div class="goal-caption">🎯 Wochenziel erreicht!</div>` : ""}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="period-nav">
        <button class="btn-icon" id="wochePrev">‹</button>
        <div style="text-align:center;">
          <div class="period-label">KW ${wKey.split("-W")[1]}</div>
          <div class="period-sub">${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)} ${weekEnd.getFullYear()}</div>
        </div>
        <button class="btn-icon" id="wocheNext">›</button>
      </div>

      <div class="stat-grid">
        <div class="stat-box"><div class="stat-value">${agg.minutes}</div><div class="stat-label">⏱ MINUTEN AKTIV</div></div>
        <div class="stat-box"><div class="stat-value">${agg.calories}</div><div class="stat-label">🔥 KCAL VERBRANNT</div></div>
        <div class="stat-box"><div class="stat-value">${agg.distance.toFixed(1)}</div><div class="stat-label">📍 KM ZURÜCKGELEGT</div></div>
        <div class="stat-box"><div class="stat-value">${agg.stepDays ? Math.round(agg.steps / agg.stepDays).toLocaleString("de-DE") : "–"}</div><div class="stat-label">👟 Ø SCHRITTE / TAG</div></div>
      </div>

      ${weeklyGoalHTML}

      <h2 class="section-title">Aktivitäten diese Woche</h2>
      <div class="card">
        ${mixBarHTML ? `<div style="margin-bottom:12px;">${mixBarHTML}</div>` : ""}
        ${typeChips}
      </div>

      <h2 class="section-title">Schritte pro Tag</h2>
      <div class="card">${stepsChart}</div>

      <h2 class="section-title">Social-Media-Post</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Erstellt automatisch aus den Daten dieser Woche einen fertig gestalteten Wochenrückblick zum Teilen.</div>
        <button class="btn btn-secondary btn-block" id="createPostBtn">📸 Post erstellen</button>
      </div>

      <h2 class="section-title">Daten exportieren</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Lädt alle Einträge dieser Woche als CSV-Datei herunter (z. B. zum Sichern oder für Excel).</div>
        <button class="btn btn-secondary btn-block" id="downloadWeekBtn">⤓ Woche herunterladen</button>
      </div>
    `;

    document.getElementById("wochePrev").addEventListener("click", () => { wocheAnchor = addDays(weekStart, -7); renderWoche(); });
    document.getElementById("wocheNext").addEventListener("click", () => { wocheAnchor = addDays(weekStart, 7); renderWoche(); });
    document.getElementById("downloadWeekBtn").addEventListener("click", () => downloadWeekCSV(weekStart));
    document.getElementById("createPostBtn").addEventListener("click", () => openPostGenerator(weekStart));
  }

  function buildTrackingCSV(dates) {
    const rows = [["Datum", "Wochentag", "Schritte", "Aktivität", "Pace", "Distanz (km)", "Zeit (min)", "Kalorien", "Challenge erledigt", "Liegestütze", "Plank (Sek.)", "Stretching"]];
    dates.forEach((d) => {
      const iso = toISO(d);
      const entry = Storage.getEntry(iso);
      const wd = WEEKDAYS_LONG[d.getDay()];
      const extra = [entry.pushups ?? "", entry.plankSeconds ?? "", entry.stretchingDone ? "Ja" : "Nein"];
      if (!entry.activities.length) {
        rows.push([iso, wd, entry.steps ?? "", "", "", "", "", "", entry.challengeChecked ? "Ja" : "Nein", ...extra]);
      } else {
        entry.activities.forEach((a) => {
          const sport = SPORTS[a.type] || SPORTS.custom;
          const label = sport.custom && a.customName ? a.customName : sport.label;
          rows.push([iso, wd, entry.steps ?? "", label, a.pace ?? "", a.distanz ?? "", a.zeit ?? "", a.kalorien ?? "", entry.challengeChecked ? "Ja" : "Nein", ...extra]);
        });
      }
    });
    return "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  }

  function triggerCSVDownload(csv, filename) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function downloadWeekCSV(weekStart) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    triggerCSVDownload(buildTrackingCSV(dates), `lenegoeslean_${weekKey(weekStart)}.csv`);
  }

  function downloadMonthCSV(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    triggerCSVDownload(buildTrackingCSV(dates), `lenegoeslean_${year}-${String(month + 1).padStart(2, "0")}.csv`);
  }

  function downloadYearCSV(year) {
    const start = new Date(year, 0, 1);
    const daysInYear = Math.round((new Date(year, 11, 31) - start) / 86400000) + 1;
    const dates = Array.from({ length: daysInYear }, (_, i) => addDays(start, i));
    triggerCSVDownload(buildTrackingCSV(dates), `lenegoeslean_${year}.csv`);
  }

  /* ---------------------------------------------------------------- */
  /* Post-Generator (Wochenrückblick-Post)                              */
  /* Erzeugt aus den echten Wochendaten (dieselben Werte wie im         */
  /* Woche-Tab) einen fertig gestalteten Instagram-Story-Post im festen */
  /* Creme/Braun-Design, unabhängig vom App-Theme. Keine manuelle       */
  /* Dateneingabe nötig – nur Kopfzeile/Fazit/Hintergrund sind editierbar. */
  /* ---------------------------------------------------------------- */

  const POST_STEP_ICON = '<svg viewBox="0 0 24 24" fill="#3E2723"><ellipse cx="8" cy="15" rx="3.4" ry="5.4" transform="rotate(-12 8 15)"/><ellipse cx="16.5" cy="9" rx="3.1" ry="4.9" transform="rotate(10 16.5 9)"/></svg>';

  const POST_ICONS = {
    schwimmen: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 3.5 3"/><path d="M3 11c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 3.5 3"/><path d="M8 6.5c.8-1.2 1.6-1.9 2.4-2.1"/></svg>',
    cycling: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.6"/><circle cx="18.5" cy="17.5" r="3.6"/><path d="M5.5 17.5 10 8h3"/><path d="M7.8 8h2.2"/><path d="M13 8l5.5 9.5"/><path d="M10 8l3.4 6h5.1"/></svg>',
    joggen: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="3.5" y1="17" x2="7.5" y2="13"/><line x1="7" y1="20" x2="13" y2="14"/><line x1="11" y1="20.5" x2="20.5" y2="11"/></svg>',
    wandern: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 9 8l3.5 5 2-3L21 19Z"/><path d="M9 8V5.6"/><circle cx="9" cy="4.3" r="1.1" fill="#3E2723" stroke="none"/></svg>',
    kraft: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5M2.3 10.5v3"/><path d="M6.6 8v8"/><line x1="6.6" y1="12" x2="17.4" y2="12"/><path d="M17.4 8v8"/><path d="M20 9.5v5M21.7 10.5v3"/></svg>',
    pilates: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="10.5" width="19" height="3" rx="1.5"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    hula: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="6.2" r="0.9" fill="#3E2723" stroke="none"/></svg>',
    padel: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="10" cy="9" rx="6.4" ry="7.4" transform="rotate(-20 10 9)"/><circle cx="9.3" cy="6.6" r="0.6" fill="#3E2723" stroke="none"/><circle cx="12.2" cy="7.6" r="0.6" fill="#3E2723" stroke="none"/><circle cx="7.6" cy="9.6" r="0.6" fill="#3E2723" stroke="none"/><circle cx="10.6" cy="10.6" r="0.6" fill="#3E2723" stroke="none"/><line x1="6" y1="14.5" x2="3" y2="18.5"/><circle cx="19" cy="6" r="1.6"/></svg>',
    ruhetag: '<svg viewBox="0 0 24 24" fill="#3E2723" stroke="none"><path d="M15 3a9 9 0 1 0 6 15 7 7 0 0 1-6-15z"/></svg>',
    generic: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E2723" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="m8.3 12.4 2.6 2.6 4.8-5.4"/></svg>'
  };

  // Ordnet jede App-Sportart einem der Post-Icons zu.
  const POST_ICON_MAP = {
    joggen: "joggen", inclinewalk: "wandern", inlineskaten: "generic", zirkeltraining: "kraft",
    cycling: "cycling", schwimmen: "schwimmen", homeworkout: "kraft", hulahoop: "hula",
    pilates: "pilates", reformerpilates: "pilates", padel: "padel", custom: "generic", restday: "ruhetag"
  };
  function getPostIcon(type) {
    return POST_ICONS[POST_ICON_MAP[type]] || POST_ICONS.generic;
  }

  let postWeekStart = null;
  let postFazitTouched = false;

  function formatWeekRangeDE(weekStart, weekEnd) {
    const d1 = weekStart.getDate(), d2 = weekEnd.getDate();
    const m1 = MONTHS_LONG[weekStart.getMonth()], m2 = MONTHS_LONG[weekEnd.getMonth()];
    const y = weekEnd.getFullYear();
    if (weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear()) {
      return `${d1}.–${d2}. ${m2} ${y}`;
    }
    return `${d1}. ${m1} – ${d2}. ${m2} ${y}`;
  }

  function getWeightForWeek(weekStart, weekEnd) {
    const startISO = toISO(weekStart), endISO = toISO(weekEnd);
    const weights = Storage.getWeights(); // aufsteigend sortiert
    const inWeek = weights.filter((w) => w.date >= startISO && w.date <= endISO);
    if (inWeek.length) return inWeek[inWeek.length - 1].kg;
    const before = weights.filter((w) => w.date < startISO);
    if (before.length) return before[before.length - 1].kg;
    return null;
  }

  function buildPostActivityDetails(a, sport) {
    const parts = [];
    (sport.fields || []).forEach((f) => {
      const v = a[f];
      if (v === undefined || v === null || v === "") return;
      if (f === "pace") parts.push(`${v} min/km`);
      else if (f === "distanz") parts.push(`${v} km`);
      else if (f === "zeit") parts.push(`${v} Min`);
      else if (f === "kalorien") parts.push(`${v} kcal`);
      else parts.push(`${v}`);
    });
    return parts.join(" · ");
  }

  function computePostWeekData(weekStart) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    let stepsSum = 0, stepsDayCount = 0, kcalSum = 0, activeCount = 0;
    const dayData = days.map((d, idx) => {
      const iso = toISO(d);
      const entry = Storage.getEntry(iso);
      const hasSteps = !!entry.steps;
      if (hasSteps) { stepsSum += entry.steps; stepsDayCount++; }
      const activities = (entry.activities || []).map((a) => {
        const isRest = a.type === "restday";
        const sport = SPORTS[a.type] || SPORTS.custom;
        const name = sport.custom && a.customName ? a.customName : sport.label;
        return { name, isRest, details: buildPostActivityDetails(a, sport), kcal: Number(a.kalorien) || 0, iconType: a.type };
      });
      const realActivities = activities.filter((a) => !a.isRest);
      if (realActivities.length) activeCount++;
      realActivities.forEach((a) => { kcalSum += a.kcal; });
      return { dow: WEEKDAYS_SHORT[idx].toUpperCase(), dateLabel: formatShortDate(d), hasSteps, steps: entry.steps || 0, activities };
    });
    return { dayData, stepsSum, stepsDayCount, kcalSum, activeCount };
  }

  function buildPostDaysHTML(dayData) {
    return dayData.map((day) => {
      const isBlank = !day.hasSteps && day.activities.length === 0;
      if (isBlank) {
        return `<div class="post-day post-blank post-glass">
          <div class="post-day-tag"><div class="post-dow">${day.dow}</div><div class="post-date">${esc(day.dateLabel)}</div></div>
          <div class="post-day-sep"></div>
          <div class="post-activities"><div class="post-dash-mark">–</div></div>
        </div>`;
      }
      const actHtml = day.activities.length
        ? day.activities.map((a) => {
            if (a.isRest) {
              return `<div class="post-act-row"><div class="post-act-icon">${getPostIcon(a.iconType)}</div><div class="post-rest-label">Ruhetag</div></div>`;
            }
            return `<div class="post-act-row"><div class="post-act-icon">${getPostIcon(a.iconType)}</div><div class="post-act-text"><div class="post-name">${esc(a.name)}</div><div class="post-meta">${esc(a.details)}</div></div></div>`;
          }).join("")
        : `<div class="post-act-row"><div class="post-act-text"><div class="post-dash-mark">–</div></div></div>`;
      const stepsColHtml = day.hasSteps
        ? `<div class="post-num">${day.steps.toLocaleString("de-DE")}</div><div class="post-lbl">${POST_STEP_ICON}<span>Schritte</span></div>`
        : `<div class="post-num">–</div><div class="post-lbl">${POST_STEP_ICON}<span>Schritte</span></div>`;
      return `<div class="post-day post-glass">
        <div class="post-day-tag"><div class="post-dow">${day.dow}</div><div class="post-date">${esc(day.dateLabel)}</div></div>
        <div class="post-day-sep"></div>
        <div class="post-activities">${actHtml}</div>
        <div class="post-steps-col">${stepsColHtml}</div>
      </div>`;
    }).join("");
  }

  function renderPostPreview() {
    if (!postWeekStart) return;
    const data = computePostWeekData(postWeekStart);

    document.getElementById("postCEyebrow").textContent = document.getElementById("postEyebrow").value;
    document.getElementById("postCTitle").textContent = document.getElementById("postTitle").value;
    document.getElementById("postCRange").textContent = document.getElementById("postRange").value;

    const weightVal = document.getElementById("postWeight").value;
    const weightPill = document.getElementById("postCWeightPill");
    if (weightVal !== "") {
      weightPill.style.display = "inline-flex";
      document.getElementById("postCWeightValue").textContent = String(weightVal).replace(".", ",");
    } else {
      weightPill.style.display = "none";
    }

    document.getElementById("postDaysCanvas").innerHTML = buildPostDaysHTML(data.dayData);
    document.getElementById("postStatKcal").textContent = Math.round(data.kcalSum).toLocaleString("de-DE");
    document.getElementById("postStatSteps").textContent = Math.round(data.stepsSum).toLocaleString("de-DE");
    document.getElementById("postStatStepsSub").textContent = data.stepsDayCount > 0
      ? `Ø ${Math.round(data.stepsSum / data.stepsDayCount).toLocaleString("de-DE")} / Tag`
      : "–";
    document.getElementById("postStatDays").textContent = `${data.activeCount}/7`;

    document.getElementById("postStatDots").innerHTML = data.dayData.map((d) => {
      const hasReal = d.activities.some((a) => !a.isRest);
      return `<div class="post-dot ${hasReal ? "on" : "off"}"></div>`;
    }).join("");

    const footerEl = document.getElementById("postCFooterLine");
    if (!postFazitTouched) {
      footerEl.innerHTML = `${data.activeCount} von 7&nbsp;Tagen aktiv <span class="post-sep">·</span> ${Math.round(data.kcalSum).toLocaleString("de-DE")}&nbsp;kcal verbrannt <span class="post-sep">·</span> ${Math.round(data.stepsSum).toLocaleString("de-DE")}&nbsp;Schritte`;
    } else {
      footerEl.textContent = document.getElementById("postFazit").value;
    }
  }

  function buildDefaultPostBg(width, height) {
    width = width || 1080; height = height || 1920;
    const c = document.createElement("canvas");
    c.width = width; c.height = height;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#F7EFE6");
    grad.addColorStop(0.5, "#F1E0D6");
    grad.addColorStop(1, "#E7CBB8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(width * 0.79, height * 0.115, width * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(width * 0.11, height * 0.86, width * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    return c.toDataURL("image/png");
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function setPostBackgroundForWeek(weekStart, weekEnd) {
    let dataUrl = null;
    try {
      const photos = await PhotoDB.all();
      const startISO = toISO(weekStart), endISO = toISO(weekEnd);
      const match = photos.find((p) => p.date >= startISO && p.date <= endISO);
      if (match && match.blob) dataUrl = await blobToDataURL(match.blob);
    } catch (e) { /* Fotos nicht verfügbar – Standardhintergrund nutzen */ }
    const img = document.getElementById("postBgImg");
    if (img) img.src = dataUrl || buildDefaultPostBg();
  }

  async function syncPostWeekFields(isFirstOpen) {
    const weekEnd = addDays(postWeekStart, 6);
    if (isFirstOpen) {
      document.getElementById("postEyebrow").value = "Wochenrückblick";
      document.getElementById("postTitle").value = "Meine Woche in Bewegung";
    }
    document.getElementById("postRange").value = formatWeekRangeDE(postWeekStart, weekEnd);
    const w = getWeightForWeek(postWeekStart, weekEnd);
    document.getElementById("postWeight").value = w != null ? w : "";
    postFazitTouched = false;
    document.getElementById("postFazit").value = "";
    document.getElementById("postWeekLabel").textContent =
      `KW ${weekKey(postWeekStart).split("-W")[1]} · ${formatShortDate(postWeekStart)}–${formatShortDate(weekEnd)}`;
    await setPostBackgroundForWeek(postWeekStart, weekEnd);
    renderPostPreview();
    fitPostStage();
  }

  function fitPostStage() {
    const scaler = document.getElementById("postStageScaler");
    const outer = document.querySelector(".post-stage-outer");
    if (!scaler || !outer) return;
    const available = Math.min(window.innerWidth, 520) - 32;
    const scale = Math.min(1, available / 1080);
    scaler.style.transform = `scale(${scale})`;
    outer.style.minHeight = `${1920 * scale + 16}px`;
  }

  async function openPostGenerator(weekStart) {
    postWeekStart = weekStart;
    document.getElementById("postOverlay").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    await syncPostWeekFields(true);
  }

  function closePostGenerator() {
    document.getElementById("postOverlay").classList.add("hidden");
    document.body.style.overflow = "";
  }

  /* iOS Safari (vor allem als installierte Home-Bildschirm-App im
     "standalone"-Modus) ignoriert das download-Attribut von <a>-Links
     und lässt sich per JS auch nicht zum Öffnen einer neuen Ansicht für
     eine data:-URL bewegen – ein Klick auf einen klassischen Download-
     Link passiert dort einfach gar nichts. Deshalb: zuerst die native
     Teilen-Funktion versuchen (öffnet das iOS-Sheet mit "Bild sichern"),
     und nur wenn die nicht verfügbar ist, das Bild großformatig anzeigen
     mit der Anweisung "antippen & halten" (funktioniert überall, auch
     offline und in der installierten App). Auf dem Desktop/Android
     bleibt zusätzlich der klassische Download-Link als schnellster Weg.
  */
  async function sharePostImage(blob, filename) {
    if (!navigator.share || !navigator.canShare) return false;
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (!navigator.canShare({ files: [file] })) return false;
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch (err) {
      // Nutzer hat das Teilen-Sheet abgebrochen -> kein Fehler, einfach fertig.
      if (err && err.name === "AbortError") return true;
      return false;
    }
  }

  function showPostSaveFallback(blob) {
    const overlay = document.getElementById("postSaveFallback");
    const img = document.getElementById("postSaveFallbackImg");
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.dataset.blobUrl = url;
    overlay.classList.remove("hidden");
  }

  function downloadPostPNG() {
    const btn = document.getElementById("postDownloadBtn");
    if (typeof html2canvas === "undefined") {
      alert("Die Export-Bibliothek konnte nicht geladen werden. Bitte prüfe deine Internetverbindung (wird einmalig von einem CDN geladen) und lade die Seite neu.");
      return;
    }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";

    const capture = document.getElementById("post-capture");
    const scaler = document.getElementById("postStageScaler");
    scaler.style.transform = "none";

    function restore() {
      fitPostStage();
      btn.disabled = false;
      btn.textContent = original;
    }

    try {
      html2canvas(capture, { width: 1080, height: 1920, scale: 2, backgroundColor: null, useCORS: true })
        .then((canvas) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { alert("Export fehlgeschlagen: Bild konnte nicht erzeugt werden."); restore(); return; }
            const filename = `wochenrueckblick_${weekKey(postWeekStart)}.png`;

            const shared = await sharePostImage(blob, filename);
            if (shared) { restore(); return; }

            const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
            if (!isIOS) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = filename;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              link.remove();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
              restore();
              return;
            }

            showPostSaveFallback(blob);
            restore();
          }, "image/png");
        })
        .catch((err) => { alert("Export fehlgeschlagen: " + err); restore(); });
    } catch (err) {
      alert("Export fehlgeschlagen: " + err);
      restore();
    }
  }

  function initPostGenerator() {
    document.getElementById("postCloseBtn").addEventListener("click", closePostGenerator);
    document.getElementById("postWeekPrev").addEventListener("click", () => {
      postWeekStart = addDays(postWeekStart, -7);
      syncPostWeekFields(false);
    });
    document.getElementById("postWeekNext").addEventListener("click", () => {
      postWeekStart = addDays(postWeekStart, 7);
      syncPostWeekFields(false);
    });
    ["postEyebrow", "postTitle", "postRange", "postWeight"].forEach((id) => {
      document.getElementById(id).addEventListener("input", renderPostPreview);
    });
    document.getElementById("postFazit").addEventListener("input", () => { postFazitTouched = true; renderPostPreview(); });
    document.getElementById("postFazitAutoBtn").addEventListener("click", () => {
      postFazitTouched = false;
      document.getElementById("postFazit").value = "";
      renderPostPreview();
    });
    document.getElementById("postChangeBgBtn").addEventListener("click", () => document.getElementById("postBgInput").click());
    document.getElementById("postBgInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { document.getElementById("postBgImg").src = ev.target.result; };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
    document.getElementById("postResetBgBtn").addEventListener("click", () => {
      setPostBackgroundForWeek(postWeekStart, addDays(postWeekStart, 6));
    });
    document.getElementById("postDownloadBtn").addEventListener("click", downloadPostPNG);
    document.getElementById("postSaveFallbackCloseBtn").addEventListener("click", () => {
      const overlay = document.getElementById("postSaveFallback");
      const img = document.getElementById("postSaveFallbackImg");
      if (img.dataset.blobUrl) { URL.revokeObjectURL(img.dataset.blobUrl); delete img.dataset.blobUrl; }
      img.src = "";
      overlay.classList.add("hidden");
    });
    window.addEventListener("resize", fitPostStage);
  }

  /* ---------------------------------------------------------------- */
  /* Post-Generator (Monatsrückblick)                                   */
  /* Gleiches Design/Schema wie der Wochen-Post (echte Daten, feste     */
  /* Creme/Braun-Optik, Icons/Share/Fallback werden wiederverwendet),   */
  /* aber im Instagram-Post-Format 4:5 (1080×1350) statt Story-Format.  */
  /* ---------------------------------------------------------------- */

  let postmYear = null;
  let postmMonth = null; // 0-basiert
  let postmFazitTouched = false;

  function computeMonthPostData(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    let steps = 0, stepDays = 0, minutes = 0, calories = 0, activeDaysWorkout = 0, restDaysCount = 0, trackedDays = 0;
    const byType = {};
    let bestDay = null;

    dates.forEach((d) => {
      const entry = Storage.getEntry(toISO(d));
      const hasSteps = !!entry.steps;
      const activities = entry.activities || [];
      const hasRest = activities.some((a) => a.type === "restday");
      const hasWorkout = activities.some((a) => a.type !== "restday");

      if (hasSteps) { steps += entry.steps; stepDays++; }
      if (hasWorkout) activeDaysWorkout++;
      if (hasRest) restDaysCount++;
      if (hasSteps || hasWorkout || hasRest) trackedDays++;

      const realToday = [];
      activities.forEach((a) => {
        if (a.type === "restday") return;
        const m = Number(a.zeit) || 0, k = Number(a.kalorien) || 0;
        minutes += m; calories += k;
        const sport = SPORTS[a.type] || SPORTS.custom;
        const label = sport.custom && a.customName ? a.customName : sport.label;
        if (!byType[a.type]) byType[a.type] = { count: 0, calories: 0, label, type: a.type };
        byType[a.type].count++;
        byType[a.type].calories += k;
        realToday.push({ label, zeit: m, kalorien: k });
      });

      if (hasSteps && (!bestDay || entry.steps > bestDay.steps)) {
        bestDay = {
          date: d,
          steps: entry.steps,
          labels: realToday.map((a) => a.label),
          totalMin: realToday.reduce((s, a) => s + a.zeit, 0),
          totalKcal: realToday.reduce((s, a) => s + a.kalorien, 0)
        };
      }
    });

    const topTypes = Object.keys(byType).sort((a, b) => byType[b].count - byType[a].count || byType[b].calories - byType[a].calories);

    return { daysInMonth, steps, stepDays, minutes, calories, activeDaysWorkout, restDaysCount, trackedDays, byType, topTypes, bestDay };
  }

  function computeMonthWeightStat(year, month) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const startISO = toISO(monthStart), endISO = toISO(monthEnd);
    const all = Storage.getWeights(); // aufsteigend sortiert
    const inMonth = all.filter((w) => w.date >= startISO && w.date <= endISO);
    if (!inMonth.length) return null;
    const last = inMonth[inMonth.length - 1];
    const before = all.filter((w) => w.date < startISO);
    const baseline = inMonth.length > 1 ? inMonth[0] : (before.length ? before[before.length - 1] : null);
    const delta = baseline ? Math.round((last.kg - baseline.kg) * 10) / 10 : null;
    return { lastKg: last.kg, lastDate: fromISO(last.date), delta };
  }

  function buildPostmActivitiesHTML(data) {
    if (!data.topTypes.length) {
      return `<div class="postm-act-more">Noch keine Aktivitäten in diesem Monat geloggt.</div>`;
    }
    const top = data.topTypes.slice(0, 4);
    const rest = data.topTypes.slice(4);
    const rows = top.map((k) => {
      const t = data.byType[k];
      return `<div class="postm-act-row">
        <div class="postm-act-icon">${getPostIcon(t.type)}</div>
        <div class="postm-act-text"><div class="postm-name">${esc(t.label)}</div><div class="postm-meta">${Math.round(t.calories).toLocaleString("de-DE")} kcal gesamt</div></div>
        <div class="postm-act-count">×${t.count}</div>
      </div>`;
    }).join("");
    const moreHTML = rest.length
      ? `<div class="postm-act-more">+ ${rest.map((k) => esc(data.byType[k].label)).join(", ")}</div>`
      : "";
    return rows + moreHTML;
  }

  function renderPostmPreview() {
    if (postmYear == null) return;
    const data = computeMonthPostData(postmYear, postmMonth);
    const weightStat = computeMonthWeightStat(postmYear, postmMonth);

    document.getElementById("postmCEyebrow").textContent = document.getElementById("postmEyebrow").value;
    document.getElementById("postmCTitle").textContent = document.getElementById("postmTitle").value;
    document.getElementById("postmCRange").textContent = document.getElementById("postmRange").value;

    document.getElementById("postmStatSteps").textContent = Math.round(data.steps).toLocaleString("de-DE");
    document.getElementById("postmStatStepsSub").textContent = data.stepDays > 0
      ? `Ø ${Math.round(data.steps / data.stepDays).toLocaleString("de-DE")} / Tag`
      : "–";

    document.getElementById("postmStatKcal").textContent = Math.round(data.calories).toLocaleString("de-DE");
    document.getElementById("postmStatKcalSub").textContent = `in ${(data.minutes / 60).toFixed(1).replace(".", ",")} Std Bewegung`;

    document.getElementById("postmStatDays").textContent = String(data.activeDaysWorkout);
    document.getElementById("postmStatDaysSub").textContent = `${data.restDaysCount} Ruhetage geloggt`;

    const weightEl = document.getElementById("postmStatWeight");
    const weightSubEl = document.getElementById("postmStatWeightSub");
    if (weightStat) {
      const dateLabel = formatShortDate(weightStat.lastDate);
      if (weightStat.delta != null) {
        const sign = weightStat.delta > 0 ? "+" : weightStat.delta < 0 ? "−" : "±";
        weightEl.textContent = `${sign}${Math.abs(weightStat.delta).toFixed(1).replace(".", ",")} kg`;
      } else {
        weightEl.textContent = `${weightStat.lastKg.toFixed(1).replace(".", ",")} kg`;
      }
      weightSubEl.textContent = `${weightStat.lastKg.toFixed(1).replace(".", ",")} kg am ${dateLabel}`;
    } else {
      weightEl.textContent = "–";
      weightSubEl.textContent = "Keine Einträge";
    }

    document.getElementById("postmActivitiesCard").innerHTML = buildPostmActivitiesHTML(data);

    const bestdayCard = document.getElementById("postmBestdayCard");
    if (data.bestDay) {
      bestdayCard.style.display = "flex";
      const bd = data.bestDay;
      document.getElementById("postmBestdayMain").textContent = `${bd.date.getDate()}. ${MONTHS_LONG[bd.date.getMonth()]} · ${bd.steps.toLocaleString("de-DE")} Schritte`;
      const iconType = bd.labels.length === 1
        ? Object.keys(data.byType).find((k) => data.byType[k].label === bd.labels[0])
        : null;
      document.getElementById("postmBestdayIcon").innerHTML = getPostIcon(iconType);
      const metaParts = [];
      if (bd.labels.length) metaParts.push(bd.labels.length <= 2 ? bd.labels.join(" + ") : `${bd.labels.length} Aktivitäten`);
      if (bd.totalMin > 0) metaParts.push(`${(bd.totalMin / 60).toFixed(1).replace(".", ",")} Std`);
      if (bd.totalKcal > 0) metaParts.push(`${Math.round(bd.totalKcal).toLocaleString("de-DE")} kcal`);
      document.getElementById("postmBestdayMeta").textContent = metaParts.length ? metaParts.join(" · ") : "Nur Schritte geloggt";
    } else {
      bestdayCard.style.display = "none";
    }

    const footerEl = document.getElementById("postmCFooterLine");
    if (!postmFazitTouched) {
      footerEl.innerHTML = `${data.activeDaysWorkout} aktive Tage <span class="postm-sep">·</span> ${Math.round(data.calories).toLocaleString("de-DE")}&nbsp;kcal verbrannt <span class="postm-sep">·</span> ${Math.round(data.steps).toLocaleString("de-DE")}&nbsp;Schritte`;
    } else {
      footerEl.textContent = document.getElementById("postmFazit").value;
    }
  }

  async function setPostmBackgroundForMonth(year, month) {
    let dataUrl = null;
    try {
      const monthStart = new Date(year, month, 1), monthEnd = new Date(year, month + 1, 0);
      const startISO = toISO(monthStart), endISO = toISO(monthEnd);
      const photos = await PhotoDB.all();
      const match = photos.find((p) => p.date >= startISO && p.date <= endISO);
      if (match && match.blob) dataUrl = await blobToDataURL(match.blob);
    } catch (e) { /* Fotos nicht verfügbar – Standardhintergrund nutzen */ }
    const img = document.getElementById("postmBgImg");
    if (img) img.src = dataUrl || buildDefaultPostBg(1080, 1350);
  }

  async function syncPostmMonthFields(isFirstOpen) {
    const daysInMonth = new Date(postmYear, postmMonth + 1, 0).getDate();
    if (isFirstOpen) {
      document.getElementById("postmEyebrow").value = "Monatsrückblick";
    }
    document.getElementById("postmTitle").value = `${MONTHS_LONG[postmMonth]} ${postmYear}`;
    const data = computeMonthPostData(postmYear, postmMonth);
    document.getElementById("postmRange").value = `${data.trackedDays} von ${daysInMonth} Tagen getrackt`;
    postmFazitTouched = false;
    document.getElementById("postmFazit").value = "";
    document.getElementById("postmMonthLabel").textContent = `${MONTHS_LONG[postmMonth]} ${postmYear}`;
    await setPostmBackgroundForMonth(postmYear, postmMonth);
    renderPostmPreview();
    fitPostmStage();
  }

  function fitPostmStage() {
    const scaler = document.getElementById("postmStageScaler");
    const outer = document.querySelector(".postm-stage-outer");
    if (!scaler || !outer) return;
    const available = Math.min(window.innerWidth, 520) - 32;
    const scale = Math.min(1, available / 1080);
    scaler.style.transform = `scale(${scale})`;
    outer.style.minHeight = `${1350 * scale + 16}px`;
  }

  async function openMonthPostGenerator(year, month) {
    postmYear = year;
    postmMonth = month;
    document.getElementById("postmOverlay").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    await syncPostmMonthFields(true);
  }

  function closeMonthPostGenerator() {
    document.getElementById("postmOverlay").classList.add("hidden");
    document.body.style.overflow = "";
  }

  function downloadPostmPNG() {
    const btn = document.getElementById("postmDownloadBtn");
    if (typeof html2canvas === "undefined") {
      alert("Die Export-Bibliothek konnte nicht geladen werden. Bitte prüfe deine Internetverbindung (wird einmalig von einem CDN geladen) und lade die Seite neu.");
      return;
    }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";

    const capture = document.getElementById("postm-capture");
    const scaler = document.getElementById("postmStageScaler");
    scaler.style.transform = "none";

    function restore() {
      fitPostmStage();
      btn.disabled = false;
      btn.textContent = original;
    }

    try {
      html2canvas(capture, { width: 1080, height: 1350, scale: 2, backgroundColor: null, useCORS: true })
        .then((canvas) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { alert("Export fehlgeschlagen: Bild konnte nicht erzeugt werden."); restore(); return; }
            const filename = `monatsrueckblick_${postmYear}-${String(postmMonth + 1).padStart(2, "0")}.png`;

            const shared = await sharePostImage(blob, filename);
            if (shared) { restore(); return; }

            const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
            if (!isIOS) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = filename;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              link.remove();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
              restore();
              return;
            }

            showPostSaveFallback(blob);
            restore();
          }, "image/png");
        })
        .catch((err) => { alert("Export fehlgeschlagen: " + err); restore(); });
    } catch (err) {
      alert("Export fehlgeschlagen: " + err);
      restore();
    }
  }

  function initMonthPostGenerator() {
    document.getElementById("postmCloseBtn").addEventListener("click", closeMonthPostGenerator);
    document.getElementById("postmMonthPrev").addEventListener("click", () => {
      const d = new Date(postmYear, postmMonth - 1, 1);
      postmYear = d.getFullYear(); postmMonth = d.getMonth();
      syncPostmMonthFields(false);
    });
    document.getElementById("postmMonthNext").addEventListener("click", () => {
      const d = new Date(postmYear, postmMonth + 1, 1);
      postmYear = d.getFullYear(); postmMonth = d.getMonth();
      syncPostmMonthFields(false);
    });
    ["postmEyebrow", "postmTitle", "postmRange"].forEach((id) => {
      document.getElementById(id).addEventListener("input", renderPostmPreview);
    });
    document.getElementById("postmFazit").addEventListener("input", () => { postmFazitTouched = true; renderPostmPreview(); });
    document.getElementById("postmFazitAutoBtn").addEventListener("click", () => {
      postmFazitTouched = false;
      document.getElementById("postmFazit").value = "";
      renderPostmPreview();
    });
    document.getElementById("postmChangeBgBtn").addEventListener("click", () => document.getElementById("postmBgInput").click());
    document.getElementById("postmBgInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { document.getElementById("postmBgImg").src = ev.target.result; };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
    document.getElementById("postmResetBgBtn").addEventListener("click", () => {
      setPostmBackgroundForMonth(postmYear, postmMonth);
    });
    document.getElementById("postmDownloadBtn").addEventListener("click", downloadPostmPNG);
    window.addEventListener("resize", fitPostmStage);
  }

  /* ---------------------------------------------------------------- */
  /* Post-Generator (Challenge der Woche)                                */
  /* Story-Format 1080×1920, gleiches Design/Schema wie die anderen     */
  /* Post-Generatoren – zeigt die Wochenchallenge + Tagesfortschritt.    */
  /* ---------------------------------------------------------------- */

  let postcWeekStart = null;
  let postcFazitTouched = false;

  function computePostcWeekData(weekStart) {
    const wKey = weekKey(weekStart);
    const challenge = Storage.getChallenge(wKey);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const dayData = days.map((d, idx) => ({
      dow: WEEKDAYS_SHORT[idx].toUpperCase(),
      done: !!Storage.getEntry(toISO(d)).challengeChecked
    }));
    const doneCount = dayData.filter((d) => d.done).length;
    return { text: (challenge && challenge.text) || "", dayData, doneCount };
  }

  function renderPostcPreview() {
    if (!postcWeekStart) return;
    const data = computePostcWeekData(postcWeekStart);

    document.getElementById("postcCEyebrow").textContent = document.getElementById("postcEyebrow").value;
    document.getElementById("postcCTitle").textContent = document.getElementById("postcTitle").value;
    document.getElementById("postcCRange").textContent = document.getElementById("postcRange").value;
    document.getElementById("postcChallengeText").textContent = document.getElementById("postcChallengeTextInput").value || "Noch keine Challenge für diese Woche festgelegt";

    document.getElementById("postcDots").innerHTML = data.dayData.map((d) => `
      <div class="postc-day-chip ${d.done ? "on" : "off"}">
        <div class="postc-day-dow">${d.dow}</div>
        <div class="postc-day-mark">${d.done ? "✓" : "–"}</div>
      </div>
    `).join("");

    document.getElementById("postcStatDays").textContent = `${data.doneCount}/7`;
    const perfect = data.doneCount === 7;
    document.getElementById("postcPerfectBadge").style.display = perfect ? "inline-flex" : "none";

    const footerEl = document.getElementById("postcCFooterLine");
    if (!postcFazitTouched) {
      footerEl.textContent = perfect ? "Perfekte Woche – 7 von 7 Tagen geschafft! 🏆" : `${data.doneCount} von 7 Tagen geschafft`;
    } else {
      footerEl.textContent = document.getElementById("postcFazit").value;
    }
  }

  async function setPostcBackgroundForWeek(weekStart, weekEnd) {
    let dataUrl = null;
    try {
      const photos = await PhotoDB.all();
      const startISO = toISO(weekStart), endISO = toISO(weekEnd);
      const match = photos.find((p) => p.date >= startISO && p.date <= endISO);
      if (match && match.blob) dataUrl = await blobToDataURL(match.blob);
    } catch (e) { /* Fotos nicht verfügbar – Standardhintergrund nutzen */ }
    const img = document.getElementById("postcBgImg");
    if (img) img.src = dataUrl || buildDefaultPostBg(1080, 1920);
  }

  async function syncPostcWeekFields(isFirstOpen) {
    const weekEnd = addDays(postcWeekStart, 6);
    const wKey = weekKey(postcWeekStart);
    if (isFirstOpen) {
      document.getElementById("postcEyebrow").value = "Challenge der Woche";
      document.getElementById("postcTitle").value = "Diese Woche geschafft";
    }
    document.getElementById("postcRange").value = formatWeekRangeDE(postcWeekStart, weekEnd);
    const challenge = Storage.getChallenge(wKey);
    document.getElementById("postcChallengeTextInput").value = (challenge && challenge.text) || "";
    postcFazitTouched = false;
    document.getElementById("postcFazit").value = "";
    document.getElementById("postcWeekLabel").textContent =
      `KW ${wKey.split("-W")[1]} · ${formatShortDate(postcWeekStart)}–${formatShortDate(weekEnd)}`;
    await setPostcBackgroundForWeek(postcWeekStart, weekEnd);
    renderPostcPreview();
    fitPostcStage();
  }

  function fitPostcStage() {
    const scaler = document.getElementById("postcStageScaler");
    const outer = document.querySelector(".postc-stage-outer");
    if (!scaler || !outer) return;
    const available = Math.min(window.innerWidth, 520) - 32;
    const scale = Math.min(1, available / 1080);
    scaler.style.transform = `scale(${scale})`;
    outer.style.minHeight = `${1920 * scale + 16}px`;
  }

  async function openChallengePostGenerator(weekStart) {
    postcWeekStart = weekStart;
    document.getElementById("postcOverlay").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    await syncPostcWeekFields(true);
  }

  function closeChallengePostGenerator() {
    document.getElementById("postcOverlay").classList.add("hidden");
    document.body.style.overflow = "";
  }

  function downloadPostcPNG() {
    const btn = document.getElementById("postcDownloadBtn");
    if (typeof html2canvas === "undefined") {
      alert("Die Export-Bibliothek konnte nicht geladen werden. Bitte prüfe deine Internetverbindung (wird einmalig von einem CDN geladen) und lade die Seite neu.");
      return;
    }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";

    const capture = document.getElementById("postc-capture");
    const scaler = document.getElementById("postcStageScaler");
    scaler.style.transform = "none";

    function restore() {
      fitPostcStage();
      btn.disabled = false;
      btn.textContent = original;
    }

    try {
      html2canvas(capture, { width: 1080, height: 1920, scale: 2, backgroundColor: null, useCORS: true })
        .then((canvas) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { alert("Export fehlgeschlagen: Bild konnte nicht erzeugt werden."); restore(); return; }
            const filename = `challenge_${weekKey(postcWeekStart)}.png`;

            const shared = await sharePostImage(blob, filename);
            if (shared) { restore(); return; }

            const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
            if (!isIOS) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = filename;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              link.remove();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
              restore();
              return;
            }

            showPostSaveFallback(blob);
            restore();
          }, "image/png");
        })
        .catch((err) => { alert("Export fehlgeschlagen: " + err); restore(); });
    } catch (err) {
      alert("Export fehlgeschlagen: " + err);
      restore();
    }
  }

  function initChallengePostGenerator() {
    document.getElementById("postcCloseBtn").addEventListener("click", closeChallengePostGenerator);
    document.getElementById("postcWeekPrev").addEventListener("click", () => {
      postcWeekStart = addDays(postcWeekStart, -7);
      syncPostcWeekFields(false);
    });
    document.getElementById("postcWeekNext").addEventListener("click", () => {
      postcWeekStart = addDays(postcWeekStart, 7);
      syncPostcWeekFields(false);
    });
    ["postcEyebrow", "postcTitle", "postcRange", "postcChallengeTextInput"].forEach((id) => {
      document.getElementById(id).addEventListener("input", renderPostcPreview);
    });
    document.getElementById("postcFazit").addEventListener("input", () => { postcFazitTouched = true; renderPostcPreview(); });
    document.getElementById("postcFazitAutoBtn").addEventListener("click", () => {
      postcFazitTouched = false;
      document.getElementById("postcFazit").value = "";
      renderPostcPreview();
    });
    document.getElementById("postcChangeBgBtn").addEventListener("click", () => document.getElementById("postcBgInput").click());
    document.getElementById("postcBgInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { document.getElementById("postcBgImg").src = ev.target.result; };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
    document.getElementById("postcResetBgBtn").addEventListener("click", () => {
      setPostcBackgroundForWeek(postcWeekStart, addDays(postcWeekStart, 6));
    });
    document.getElementById("postcDownloadBtn").addEventListener("click", downloadPostcPNG);
    window.addEventListener("resize", fitPostcStage);
  }

  /* ---------------------------------------------------------------- */
  /* Instagram-Highlight-Cover                                          */
  /* Minimalistisches quadratisches Bild (1080×1080) mit editierbarem   */
  /* "Woche X"-Label – zum Verwenden als Highlight-Titelbild.            */
  /* ---------------------------------------------------------------- */

  let postwBgCustomized = false;

  function renderPostwPreview() {
    const label = document.getElementById("postwLabelInput").value || "Woche 1";
    document.getElementById("postwLabelDisplay").textContent = label;
  }

  function stepPostwLabel(delta) {
    const input = document.getElementById("postwLabelInput");
    const m = input.value.match(/^(.*?)(\d+)(\s*)$/);
    if (m) {
      const num = Math.max(1, parseInt(m[2], 10) + delta);
      input.value = `${m[1]}${num}${m[3]}`;
    } else if (delta > 0) {
      input.value = input.value.trim() ? `${input.value.trim()} 1` : "Woche 1";
    }
    renderPostwPreview();
  }

  function fitPostwStage() {
    const scaler = document.getElementById("postwStageScaler");
    const outer = document.querySelector(".postw-stage-outer");
    if (!scaler || !outer) return;
    const available = Math.min(window.innerWidth, 520) - 32;
    const scale = Math.min(1, available / 1080);
    scaler.style.transform = `scale(${scale})`;
    outer.style.minHeight = `${1080 * scale + 16}px`;
  }

  function openHighlightGenerator() {
    document.getElementById("postwOverlay").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    document.getElementById("postwAppName").textContent = Storage.getSettings().appName || DEFAULT_APP_NAME;
    if (!postwBgCustomized) {
      document.getElementById("postwBgImg").src = buildDefaultPostBg(1080, 1080);
    }
    renderPostwPreview();
    fitPostwStage();
  }

  function closeHighlightGenerator() {
    document.getElementById("postwOverlay").classList.add("hidden");
    document.body.style.overflow = "";
  }

  function downloadPostwPNG() {
    const btn = document.getElementById("postwDownloadBtn");
    if (typeof html2canvas === "undefined") {
      alert("Die Export-Bibliothek konnte nicht geladen werden. Bitte prüfe deine Internetverbindung (wird einmalig von einem CDN geladen) und lade die Seite neu.");
      return;
    }
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";

    const capture = document.getElementById("postw-capture");
    const scaler = document.getElementById("postwStageScaler");
    scaler.style.transform = "none";

    function restore() {
      fitPostwStage();
      btn.disabled = false;
      btn.textContent = original;
    }

    try {
      html2canvas(capture, { width: 1080, height: 1080, scale: 2, backgroundColor: null, useCORS: true })
        .then((canvas) => {
          canvas.toBlob(async (blob) => {
            if (!blob) { alert("Export fehlgeschlagen: Bild konnte nicht erzeugt werden."); restore(); return; }
            const labelSlug = (document.getElementById("postwLabelInput").value || "highlight")
              .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "highlight";
            const filename = `highlight_${labelSlug}.png`;

            const shared = await sharePostImage(blob, filename);
            if (shared) { restore(); return; }

            const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
            if (!isIOS) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = filename;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              link.remove();
              setTimeout(() => URL.revokeObjectURL(url), 3000);
              restore();
              return;
            }

            showPostSaveFallback(blob);
            restore();
          }, "image/png");
        })
        .catch((err) => { alert("Export fehlgeschlagen: " + err); restore(); });
    } catch (err) {
      alert("Export fehlgeschlagen: " + err);
      restore();
    }
  }

  function initHighlightGenerator() {
    document.getElementById("postwCloseBtn").addEventListener("click", closeHighlightGenerator);
    document.getElementById("postwLabelInput").addEventListener("input", renderPostwPreview);
    document.getElementById("postwLabelMinusBtn").addEventListener("click", () => stepPostwLabel(-1));
    document.getElementById("postwLabelPlusBtn").addEventListener("click", () => stepPostwLabel(1));
    document.getElementById("postwChangeBgBtn").addEventListener("click", () => document.getElementById("postwBgInput").click());
    document.getElementById("postwBgInput").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById("postwBgImg").src = ev.target.result;
        postwBgCustomized = true;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
    document.getElementById("postwResetBgBtn").addEventListener("click", () => {
      postwBgCustomized = false;
      document.getElementById("postwBgImg").src = buildDefaultPostBg(1080, 1080);
    });
    document.getElementById("postwDownloadBtn").addEventListener("click", downloadPostwPNG);
    window.addEventListener("resize", fitPostwStage);
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Kalender                                                      */
  /* ---------------------------------------------------------------- */

  let kalenderAnchor = new Date();
  let kalenderSelected = toISO(new Date());

  function getMonthGridDates(year, monthIndex) {
    const first = new Date(year, monthIndex, 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }

  function renderKalender() {
    const container = document.getElementById("tab-kalender");
    const year = kalenderAnchor.getFullYear(), month = kalenderAnchor.getMonth();
    const dates = getMonthGridDates(year, month);
    const today = new Date();

    const cells = dates.map((d) => {
      const iso = toISO(d);
      const entry = Storage.getEntry(iso);
      const hasData = entry.activities.length > 0 || (entry.steps && entry.steps > 0);
      const hasPlans = Storage.getPlans(iso).length > 0;
      const classes = ["cal-day"];
      if (d.getMonth() !== month) classes.push("other");
      if (isSameDay(d, today)) classes.push("today");
      if (iso === kalenderSelected) classes.push("selected");
      return `<button class="${classes.join(" ")}" data-date="${iso}">
        ${hasPlans ? '<span class="plan-mark" title="Etwas geplant">📅</span>' : ""}
        ${d.getDate()}
        ${hasData ? '<span class="mark"><span></span></span>' : ""}
      </button>`;
    }).join("");

    const selDate = fromISO(kalenderSelected);

    container.innerHTML = `
      <div class="period-nav">
        <button class="btn-icon" id="kalPrev">‹</button>
        <div class="period-label">${MONTHS_LONG[month]} ${year}</div>
        <button class="btn-icon" id="kalNext">›</button>
      </div>
      <div class="card">
        <div class="cal-grid">
          ${WEEKDAYS_SHORT.map((w) => `<div class="cal-wd">${w}</div>`).join("")}
          ${cells}
        </div>
      </div>

      <h2 class="section-title">${formatWeekdayDate(selDate)}</h2>
      <div id="kalEditor"></div>
    `;

    document.getElementById("kalPrev").addEventListener("click", () => { kalenderAnchor = new Date(year, month - 1, 1); renderKalender(); });
    document.getElementById("kalNext").addEventListener("click", () => { kalenderAnchor = new Date(year, month + 1, 1); renderKalender(); });
    container.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        kalenderSelected = btn.getAttribute("data-date");
        const clicked = fromISO(kalenderSelected);
        if (clicked.getMonth() !== month) kalenderAnchor = new Date(clicked.getFullYear(), clicked.getMonth(), 1);
        renderKalender();
      });
    });

    const editorRoot = document.getElementById("kalEditor");
    editorRoot.innerHTML = entryEditorHTML(kalenderSelected);
    bindEntryEditor(editorRoot, kalenderSelected, renderKalender);
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Monat                                                         */
  /* ---------------------------------------------------------------- */

  let monatAnchor = new Date();

  function dayIntensity(entry, stepsGoal) {
    if (!entry) return 0;
    const hasRest = entry.activities.some((a) => a.type === "restday");
    const hasWorkout = entry.activities.some((a) => a.type !== "restday");
    const steps = entry.steps || 0;
    if (hasWorkout && steps >= stepsGoal) return 3;
    if (hasWorkout || steps >= stepsGoal) return 2;
    if (steps > 0 || hasRest) return 1;
    return 0;
  }

  function buildMonthHeatmapHTML(year, month, stepsGoal) {
    const dates = getMonthGridDates(year, month);
    const cells = dates.map((d) => {
      const inMonth = d.getMonth() === month;
      const level = inMonth ? dayIntensity(Storage.getEntry(toISO(d)), stepsGoal) : 0;
      return `<div class="heat-cell l${level}${inMonth ? "" : " other"}" title="${formatShortDate(d)}"></div>`;
    }).join("");
    return `
      <div class="heat-grid">${cells}</div>
      <div class="row-between small muted" style="margin-top:12px;">
        <span>Weniger</span>
        <div style="display:flex; gap:4px;">
          <span class="heat-legend-dot l0"></span><span class="heat-legend-dot l1"></span><span class="heat-legend-dot l2"></span><span class="heat-legend-dot l3"></span>
        </div>
        <span>Mehr</span>
      </div>
    `;
  }

  function renderMonat() {
    const container = document.getElementById("tab-monat");
    const year = monatAnchor.getFullYear(), month = monatAnchor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    let steps = 0, stepDays = 0, minutes = 0, calories = 0, distance = 0, activeDays = 0, restDays = 0;
    const byType = {};
    const weeksInMonth = new Set();

    dates.forEach((d) => {
      const entry = Storage.getEntry(toISO(d));
      weeksInMonth.add(weekKey(d));
      let dayActive = false;
      if (entry.steps) { steps += entry.steps; stepDays++; }
      entry.activities.forEach((a) => {
        if (a.type === "restday") { restDays++; }
        else { dayActive = true; }
        minutes += Number(a.zeit) || 0;
        calories += Number(a.kalorien) || 0;
        distance += Number(a.distanz) || 0;
        byType[a.type] = byType[a.type] || { count: 0, minutes: 0, calories: 0 };
        byType[a.type].count++;
        byType[a.type].minutes += Number(a.zeit) || 0;
        byType[a.type].calories += Number(a.kalorien) || 0;
      });
      if (dayActive || (entry.steps && entry.steps > 0)) activeDays++;
    });

    let challengeDone = 0, challengeTotal = 0;
    weeksInMonth.forEach((wk) => {
      const ch = Storage.getChallenge(wk);
      if (ch && ch.text) {
        const [wy, wn] = wk.split("-W");
        // rekonstruiere Wochenstart aus ISO-Woche
        const jan4 = new Date(Number(wy), 0, 4);
        const wkStart = addDays(startOfWeek(jan4), (Number(wn) - 1) * 7);
        for (let i = 0; i < 7; i++) {
          const d = addDays(wkStart, i);
          if (d.getMonth() === month && d.getFullYear() === year) {
            challengeTotal++;
            if (Storage.getEntry(toISO(d)).challengeChecked) challengeDone++;
          }
        }
      }
    });

    const typeRows = Object.keys(byType).length
      ? Object.keys(byType).sort((a, b) => byType[b].count - byType[a].count).map((k) => {
          const s = SPORTS[k] || SPORTS.custom;
          return `<div class="type-row">
            <span class="chip" style="background:${s.bg};color:${s.fg};"><span class="emoji">${s.icon}</span>${s.label}</span>
            <span class="small muted">${byType[k].count}× · ${byType[k].minutes} min · ${byType[k].calories} kcal</span>
          </div>`;
        }).join("")
      : `<div class="empty-hint">Noch keine Aktivitäten in diesem Monat.</div>`;

    const mixWeights = {};
    Object.keys(byType).forEach((k) => { mixWeights[k] = byType[k].minutes || byType[k].count; });
    const mixBarHTML = buildActivityMixBar(mixWeights);

    const stepsGoal = Storage.getSettings().stepsGoal;
    const heatmapHTML = buildMonthHeatmapHTML(year, month, stepsGoal);

    container.innerHTML = `
      <div class="period-nav">
        <button class="btn-icon" id="monPrev">‹</button>
        <div class="period-label">${MONTHS_LONG[month]} ${year}</div>
        <button class="btn-icon" id="monNext">›</button>
      </div>

      <div class="stat-grid">
        <div class="stat-box"><div class="stat-value">${activeDays}/${daysInMonth}</div><div class="stat-label">✅ AKTIVE TAGE</div></div>
        <div class="stat-box"><div class="stat-value">${restDays}</div><div class="stat-label">🐼 REST-DAYS</div></div>
        <div class="stat-box"><div class="stat-value">${minutes}</div><div class="stat-label">⏱ MINUTEN GESAMT</div></div>
        <div class="stat-box"><div class="stat-value">${calories.toLocaleString("de-DE")}</div><div class="stat-label">🔥 KCAL GESAMT</div></div>
        <div class="stat-box"><div class="stat-value">${distance.toFixed(1)} km</div><div class="stat-label">📍 DISTANZ GESAMT</div></div>
        <div class="stat-box"><div class="stat-value">${stepDays ? Math.round(steps / stepDays).toLocaleString("de-DE") : "–"}</div><div class="stat-label">👟 Ø SCHRITTE / TAG</div></div>
      </div>

      <h2 class="section-title">Monats-Übersicht</h2>
      <div class="card">${heatmapHTML}</div>

      <h2 class="section-title">Nach Sportart</h2>
      <div class="card">
        ${mixBarHTML ? `<div style="margin-bottom:14px;">${mixBarHTML}</div>` : ""}
        ${typeRows}
      </div>

      <h2 class="section-title">Wochen-Challenges</h2>
      <div class="card">
        ${challengeTotal ? `
          <div class="row-between"><span class="small muted">Erfolgsquote</span><span class="small" style="font-weight:700;">${Math.round((challengeDone / challengeTotal) * 100)}%</span></div>
          <div class="progress-bar-lg"><div class="fill" style="width:${Math.round((challengeDone / challengeTotal) * 100)}%"></div></div>
        ` : `<div class="empty-hint">Keine Challenges in diesem Monat festgelegt.</div>`}
      </div>

      <h2 class="section-title">Social-Media-Post</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Erstellt automatisch aus den Daten dieses Monats einen fertig gestalteten Monatsrückblick zum Teilen.</div>
        <button class="btn btn-secondary btn-block" id="createMonthPostBtn">📸 Monats-Post erstellen</button>
      </div>

      <h2 class="section-title">Daten exportieren</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Lädt alle Einträge als CSV-Datei herunter (z. B. zum Sichern oder für Excel).</div>
        <button class="btn btn-secondary btn-block" id="downloadMonthBtn">⤓ Diesen Monat herunterladen</button>
        <button class="btn btn-ghost btn-block" id="downloadYearBtn" style="margin-top:10px;">⤓ Ganzes Jahr (${year}) herunterladen</button>
      </div>
    `;

    document.getElementById("monPrev").addEventListener("click", () => { monatAnchor = new Date(year, month - 1, 1); renderMonat(); });
    document.getElementById("monNext").addEventListener("click", () => { monatAnchor = new Date(year, month + 1, 1); renderMonat(); });
    document.getElementById("createMonthPostBtn").addEventListener("click", () => openMonthPostGenerator(year, month));
    document.getElementById("downloadMonthBtn").addEventListener("click", () => downloadMonthCSV(year, month));
    document.getElementById("downloadYearBtn").addEventListener("click", () => downloadYearCSV(year));
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Fotos                                                         */
  /* ---------------------------------------------------------------- */

  async function renderFotos() {
    const container = document.getElementById("tab-fotos");
    container.innerHTML = `
      <h2 class="section-title" style="margin-top:0;">Progress-Fotos</h2>
      <div class="photo-grid" id="photoGrid">
        <label class="add-photo-tile" id="addPhotoTile">＋<input type="file" accept="image/*" id="photoInput" style="display:none;"></label>
      </div>
    `;
    const grid = document.getElementById("photoGrid");

    let photos = [];
    try { photos = await PhotoDB.all(); } catch (e) { console.warn(e); }

    photos.forEach((p) => {
      const url = URL.createObjectURL(p.blob);
      const thumb = el(`<div class="photo-thumb" data-photo-id="${p.id}">
        <img src="${url}" alt="Progress-Foto">
        <div class="pdate">${formatShortDate(fromISO(p.date))}</div>
      </div>`);
      thumb.addEventListener("click", () => openPhotoModal(p, url));
      grid.appendChild(thumb);
    });

    if (!photos.length) {
      grid.insertAdjacentHTML("beforeend", `<div class="empty-hint" style="grid-column:1/-1;">Noch keine Fotos. Tippe auf ＋, um dein erstes Progress-Foto hinzuzufügen.</div>`);
    }

    document.getElementById("photoInput").addEventListener("change", async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      try {
        const blob = await resizeImageFile(file, 1000, 0.82);
        await PhotoDB.add({ date: toISO(new Date()), note: "", blob, ts: Date.now() });
        showToast("Foto gespeichert");
        renderFotos();
      } catch (e) {
        console.error(e);
        showToast("Foto konnte nicht gespeichert werden");
      }
      ev.target.value = "";
    });
  }

  function openPhotoModal(photo, url) {
    const backdrop = document.getElementById("photoModal");
    backdrop.innerHTML = `
      <div class="modal-card">
        <img src="${url}" alt="Progress-Foto">
        <div class="row-between">
          <span class="small muted">${formatWeekdayDate(fromISO(photo.date))}</span>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-ghost btn-sm" id="closePhotoModal">Schließen</button>
            <button class="btn btn-secondary btn-sm" id="deletePhotoBtn">Löschen</button>
          </div>
        </div>
      </div>`;
    backdrop.classList.remove("hidden");
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.classList.add("hidden"); }, { once: true });
    document.getElementById("closePhotoModal").addEventListener("click", () => backdrop.classList.add("hidden"));
    document.getElementById("deletePhotoBtn").addEventListener("click", async () => {
      const restoreData = { date: photo.date, note: photo.note, blob: photo.blob, ts: photo.ts };
      await PhotoDB.remove(photo.id);
      backdrop.classList.add("hidden");
      renderFotos();
      showUndoToast("Foto gelöscht", async () => {
        await PhotoDB.add(restoreData);
        renderFotos();
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Challenge                                                     */
  /* ---------------------------------------------------------------- */

  let challengeAnchor = new Date();

  function weekStartFromKey(wKey) {
    const [wy, wn] = wKey.split("-W");
    const jan4 = new Date(Number(wy), 0, 4);
    return addDays(startOfWeek(jan4), (Number(wn) - 1) * 7);
  }

  function countChallengeDoneDays(wKey) {
    const wkStart = weekStartFromKey(wKey);
    let cnt = 0;
    for (let i = 0; i < 7; i++) if (Storage.getEntry(toISO(addDays(wkStart, i))).challengeChecked) cnt++;
    return cnt;
  }

  function computeChallengeHistory(opts) {
    const { limit, excludeKey } = opts || {};
    const data = Storage.load();
    let weeks = Object.keys(data.challenges).filter((k) => data.challenges[k] && data.challenges[k].text);
    if (excludeKey) weeks = weeks.filter((k) => k !== excludeKey);
    weeks.sort().reverse();
    const rows = weeks.map((wk) => ({
      wKey: wk, weekNum: wk.split("-W")[1], text: data.challenges[wk].text, done: countChallengeDoneDays(wk)
    }));
    const perfectWeeks = rows.filter((r) => r.done === 7).length;
    const avgPct = rows.length ? Math.round((rows.reduce((s, r) => s + r.done, 0) / (rows.length * 7)) * 100) : 0;
    return { totalWeeks: rows.length, perfectWeeks, avgPct, rows: typeof limit === "number" ? rows.slice(0, limit) : rows };
  }

  function buildChallengeHistoryRows(rows) {
    if (!rows.length) return `<div class="empty-hint">Noch keine abgeschlossenen Challenges.</div>`;
    return rows.map((r, i) => {
      const pct = Math.round((r.done / 7) * 100);
      const badge = r.done === 7 ? " 🏆" : "";
      return `
        <div style="${i < rows.length - 1 ? "margin-bottom:14px;" : ""}">
          <div class="row-between" style="margin-bottom:6px;">
            <span class="small" style="font-weight:700;">KW ${r.weekNum}${badge}</span>
            <span class="small muted">${r.done}/7</span>
          </div>
          <div class="small muted" style="margin-bottom:6px;">${esc(r.text)}</div>
          <div class="bar-track" style="height:7px;"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join("");
  }

  function renderChallenge() {
    const container = document.getElementById("tab-challenge");
    const weekStart = startOfWeek(challengeAnchor);
    const wKey = weekKey(challengeAnchor);
    const challenge = Storage.getChallenge(wKey);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();
    const doneCount = days.filter((d) => Storage.getEntry(toISO(d)).challengeChecked).length;
    const pct = Math.round((doneCount / 7) * 100);

    const dots = days.map((d) => {
      const iso = toISO(d);
      const entry = Storage.getEntry(iso);
      const isToday = isSameDay(d, today);
      return `<div class="week-dot ${isToday ? "today" : ""}">
        <button class="circle ${entry.challengeChecked ? "done" : ""}" data-toggle-day="${iso}">${entry.challengeChecked ? "✓" : ""}</button>
        <span>${WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}</span>
      </div>`;
    }).join("");

    const history = computeChallengeHistory({ limit: 10, excludeKey: wKey });
    const historyRows = buildChallengeHistoryRows(history.rows);

    container.innerHTML = `
      <div class="period-nav">
        <button class="btn-icon" id="chPrev">‹</button>
        <div style="text-align:center;">
          <div class="period-label">KW ${wKey.split("-W")[1]}</div>
          <div class="period-sub">${formatShortDate(weekStart)} – ${formatShortDate(addDays(weekStart, 6))}</div>
        </div>
        <button class="btn-icon" id="chNext">›</button>
      </div>

      <div class="card">
        <label class="field-label">Challenge für diese Woche</label>
        <textarea id="challengeText" rows="2" placeholder="z. B. Jeden Tag 10 Min. dehnen">${esc(challenge && challenge.text || "")}</textarea>
        <button class="btn btn-primary btn-block" id="saveChallengeBtn" style="margin-top:10px;">Speichern</button>
      </div>

      ${challenge && challenge.text ? `
        <h2 class="section-title">Fortschritt (${doneCount}/7)</h2>
        <div class="card">
          <div class="progress-bar-lg"><div class="fill" style="width:${pct}%"></div></div>
          <div class="week-dots">${dots}</div>
        </div>
      ` : ""}

      <h2 class="section-title">Frühere Challenges</h2>
      <div class="card">${historyRows}</div>

      <h2 class="section-title">Social-Media-Post</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Erstellt automatisch aus der Challenge dieser Woche einen fertig gestalteten Story-Post zum Teilen.</div>
        <button class="btn btn-secondary btn-block" id="createChallengePostBtn"${challenge && challenge.text ? "" : " disabled"}>🏆 Challenge-Post erstellen</button>
        ${challenge && challenge.text ? "" : `<div class="small muted" style="margin-top:8px;">Trag oben zuerst eine Challenge für diese Woche ein.</div>`}
      </div>

      <h2 class="section-title">Instagram-Highlight</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Ein schlichtes quadratisches Titelbild für deine Instagram-Story-Highlights (z. B. „Woche 3"), unabhängig von einer bestimmten Woche.</div>
        <button class="btn btn-secondary btn-block" id="createHighlightBtn">🏷️ Highlight-Cover erstellen</button>
      </div>
    `;

    document.getElementById("chPrev").addEventListener("click", () => { challengeAnchor = addDays(weekStart, -7); renderChallenge(); });
    document.getElementById("chNext").addEventListener("click", () => { challengeAnchor = addDays(weekStart, 7); renderChallenge(); });
    document.getElementById("saveChallengeBtn").addEventListener("click", () => {
      const val = document.getElementById("challengeText").value.trim();
      Storage.setChallengeText(wKey, val);
      showToast("Challenge gespeichert");
      renderChallenge();
    });
    container.querySelectorAll("[data-toggle-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const iso = btn.getAttribute("data-toggle-day");
        Storage.updateEntry(iso, (e) => { e.challengeChecked = !e.challengeChecked; });
        renderChallenge();
      });
    });
    const createChallengePostBtn = document.getElementById("createChallengePostBtn");
    if (createChallengePostBtn && !createChallengePostBtn.disabled) {
      createChallengePostBtn.addEventListener("click", () => openChallengePostGenerator(weekStart));
    }
    document.getElementById("createHighlightBtn").addEventListener("click", () => openHighlightGenerator());
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Trends                                                        */
  /* ---------------------------------------------------------------- */

  function parsePaceSeconds(str) {
    if (!str) return null;
    const m = String(str).trim().match(/^(\d+):([0-5]?\d)$/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function computeStreaks() {
    const data = Storage.load();
    // Für die Streak zählt jeder Tag mit irgendeinem Eintrag als "aktiv" –
    // auch ein reiner Rest-Day (max. 2/Woche, siehe countRestdaysInWeek).
    // Die Streak reißt also wirklich nur, wenn an einem Tag gar nichts
    // eingetragen wurde.
    const isActive = (e) => !!e && ((e.activities && e.activities.length > 0) || (e.steps && e.steps > 0));
    const activeDates = Object.keys(data.entries).filter((iso) => isActive(data.entries[iso])).sort();
    let longest = activeDates.length ? 1 : 0, run = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const diffDays = Math.round((fromISO(activeDates[i]) - fromISO(activeDates[i - 1])) / 86400000);
      run = diffDays === 1 ? run + 1 : 1;
      if (run > longest) longest = run;
    }
    // Der heutige Tag ist noch nicht vorbei: Ist er noch leer, gilt das
    // nicht als Bruch, sondern die Zählung startet einfach erst bei
    // gestern. Erst ein bereits vergangener, leerer Tag reißt die Streak
    // wirklich – und ein nachträglicher Eintrag für so einen Tag stellt
    // sie automatisch wieder her, weil hier bei jedem Aufruf neu aus den
    // gespeicherten Einträgen gerechnet wird (kein separater Zustand).
    let current = 0;
    let cursor = new Date();
    if (!isActive(data.entries[toISO(cursor)])) {
      cursor = addDays(cursor, -1);
    }
    while (isActive(data.entries[toISO(cursor)])) {
      current++;
      cursor = addDays(cursor, -1);
    }
    return { current, longest, totalActiveDays: activeDates.length };
  }

  /* Streak-Freeze (nach Duolingo-Vorbild): pro Kalendermonat darf eine
     verpasste Wochenziel-Woche die Serie retten, statt sie sofort auf 0
     zu setzen. Verlustaversion ist gut belegt – ein gerissener Streak
     demotiviert stärker, als ein einzelner Streak-Tag motiviert. Die
     Berechnung ist rein aus der Historie abgeleitet (kein manueller
     "Joker einlösen"-Klick nötig) und greift automatisch. */
  function computeWeeklyGoalStreak() {
    const goals = Storage.getSettings();
    if (goals.weeklyGoalMode !== "sessions" && goals.weeklyGoalMode !== "minutes") return { streak: 0, freezeUsed: false };
    const isSessions = goals.weeklyGoalMode === "sessions";
    const target = isSessions ? (goals.weeklyGoalSessions || DEFAULT_WEEKLY_GOAL_SESSIONS) : (goals.weeklyGoalMinutes || DEFAULT_WEEKLY_GOAL_MINUTES);
    let streak = 0;
    let freezeUsed = false;
    const freezesUsedByMonth = {};
    let cursor = addDays(startOfWeek(new Date()), -7); // letzte vollständig abgeschlossene Woche
    for (let i = 0; i < 104; i++) {
      const agg = weekAggregate(cursor);
      const val = isSessions ? agg.sessionsCount : agg.minutes;
      if (val > 0 && val >= target) {
        streak++;
        cursor = addDays(cursor, -7);
        continue;
      }
      const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const used = freezesUsedByMonth[monthKey] || 0;
      if (used < STREAK_FREEZE_PER_MONTH) {
        freezesUsedByMonth[monthKey] = used + 1;
        freezeUsed = true;
        cursor = addDays(cursor, -7);
        continue;
      }
      break;
    }
    return { streak, freezeUsed };
  }

  function computeBadges() {
    const streaks = computeStreaks();
    const weeklyStreak = computeWeeklyGoalStreak();
    const chAll = computeChallengeHistory({ limit: 1000 });
    const totalWorkouts = getAllActivitiesFlat().filter((a) => a.type !== "restday").length;
    return [
      { icon: "🔥", label: "7-Tage-Serie", sub: "7 Tage in Folge aktiv", earned: streaks.longest >= 7 },
      { icon: "🔥", label: "30-Tage-Serie", sub: "30 Tage in Folge aktiv", earned: streaks.longest >= 30 },
      { icon: "🎯", label: "Zielstrebig", sub: weeklyStreak.freezeUsed ? "4 Wochen Wochenziel in Folge · 🧊 Streak-Freeze aktiv" : "4 Wochen Wochenziel in Folge", earned: weeklyStreak.streak >= 4 },
      { icon: "🏆", label: "Perfekte Woche", sub: "Challenge 7/7 Tage geschafft", earned: chAll.perfectWeeks >= 1 },
      { icon: "💪", label: "100 Einheiten", sub: "100 Trainingseinheiten geloggt", earned: totalWorkouts >= 100 },
      { icon: "📆", label: "50 aktive Tage", sub: "50 Tage insgesamt aktiv", earned: streaks.totalActiveDays >= 50 }
    ];
  }

  function buildBadgesHTML(badges) {
    return `<div class="badge-grid">` + badges.map((b) => `
      <div class="badge-item${b.earned ? " earned" : ""}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-label">${esc(b.label)}</div>
        <div class="badge-sub">${esc(b.sub)}</div>
      </div>
    `).join("") + `</div>`;
  }

  function computeBests() {
    const data = Storage.load();
    let bestDistance = null, bestPace = null, bestCalorieSession = null;
    Object.keys(data.entries).forEach((iso) => {
      (data.entries[iso].activities || []).forEach((a) => {
        if (!SPORTS[a.type]) return;
        const dist = Number(a.distanz);
        if (dist && (!bestDistance || dist > bestDistance.value)) bestDistance = { value: dist, type: a.type, date: iso };
        const cal = Number(a.kalorien);
        if (cal && (!bestCalorieSession || cal > bestCalorieSession.value)) bestCalorieSession = { value: cal, type: a.type, date: iso };
        const paceSec = parsePaceSeconds(a.pace);
        if (paceSec && (!bestPace || paceSec < bestPace.value)) bestPace = { value: paceSec, raw: a.pace, type: a.type, date: iso };
      });
    });
    return { bestDistance, bestPace, bestCalorieSession };
  }

  function computeTopSports(limit) {
    const data = Storage.load();
    const counts = {};
    Object.values(data.entries).forEach((entry) => {
      (entry.activities || []).forEach((a) => {
        if (a.type === "restday" || !SPORTS[a.type]) return;
        counts[a.type] = (counts[a.type] || 0) + 1;
      });
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, limit).map((k) => ({ type: k, count: counts[k] }));
  }

  function trendDelta(curVal, lastVal) {
    if (!lastVal) return curVal ? { label: "neu", cls: "up" } : { label: "–", cls: "flat" };
    const pct = Math.round(((curVal - lastVal) / lastVal) * 100);
    if (pct > 0) return { label: `▲ ${pct}%`, cls: "up" };
    if (pct < 0) return { label: `▼ ${Math.abs(pct)}%`, cls: "down" };
    return { label: "±0%", cls: "flat" };
  }

  /* ---------------------------------------------------------------- */
  /* Datenkunst-Generator                                               */
  /* Verwandelt Gewichtstrend, aktive Tage, Streak und Erfolge der       */
  /* letzten 12 Wochen in ein abstraktes, generatives Bild – ein         */
  /* digitales "Andenken" statt eines Charts. Reines Canvas, kein        */
  /* html2canvas nötig, funktioniert daher auch ohne CDN.                */
  /* ---------------------------------------------------------------- */

  function computeArtData() {
    const curWeekStart = startOfWeek(new Date());
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const ws = addDays(curWeekStart, -7 * i);
      const we = addDays(ws, 6);
      let activeDays = 0;
      for (let d = 0; d < 7; d++) {
        const e = Storage.getEntry(toISO(addDays(ws, d)));
        const active = (e.activities && e.activities.some((a) => a.type !== "restday")) || (e.steps && e.steps > 0);
        if (active) activeDays++;
      }
      const wNow = getWeightForWeek(ws, we);
      const wPrev = getWeightForWeek(addDays(ws, -7), addDays(ws, -1));
      const delta = (wNow != null && wPrev != null) ? wNow - wPrev : null;
      weeks.push({ activeDays, delta });
    }
    const streaks = computeStreaks();
    const earnedCount = computeBadges().filter((b) => b.earned).length;
    return { weeks, currentStreak: streaks.current, earnedCount };
  }

  function drawDataArt(canvas) {
    const data = computeArtData();
    const size = canvas.width;
    const ctx = canvas.getContext("2d");
    const cx = size / 2, cy = size / 2;

    const bg = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, size * 0.72);
    bg.addColorStop(0, "#2E2148");
    bg.addColorStop(1, "#140F22");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const maxR = size * 0.43, minR = size * 0.15;
    const n = data.weeks.length;
    data.weeks.forEach((w, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const len = minR + (w.activeDays / 7) * (maxR - minR);
      let color;
      if (w.delta == null) color = "rgba(210,200,230,0.4)";
      else if (w.delta < -0.05) color = "#5FD9B4";
      else if (w.delta > 0.05) color = "#F2A65A";
      else color = "#C9A6F2";
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.017;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * minR, cy + Math.sin(angle) * minR);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    });

    for (let i = 0; i < data.earnedCount; i++) {
      const a = (i / Math.max(1, data.earnedCount)) * Math.PI * 2 + 0.4;
      const r = minR * 0.55;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      ctx.fillStyle = "#F2E9C9";
      ctx.beginPath();
      ctx.arc(x, y, size * 0.007, 0, Math.PI * 2);
      ctx.fill();
    }

    const coreR = size * 0.05 + Math.min(size * 0.085, data.currentStreak * size * 0.005);
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
    coreGrad.addColorStop(0, "#FFEFD6");
    coreGrad.addColorStop(1, "rgba(255,180,120,0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath(); ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD9A0";
    ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();
  }

  function downloadDataArt() {
    const canvas = document.getElementById("dataArtCanvas");
    const btn = document.getElementById("dataArtDownloadBtn");
    if (!canvas || !btn) return;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Wird erstellt …";
    canvas.toBlob(async (blob) => {
      if (!blob) { alert("Export fehlgeschlagen: Bild konnte nicht erzeugt werden."); btn.disabled = false; btn.textContent = original; return; }
      const filename = `datenkunst_${toISO(new Date())}.png`;
      const shared = await sharePostImage(blob, filename);
      if (shared) { btn.disabled = false; btn.textContent = original; return; }
      const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
      if (!isIOS) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      } else {
        showPostSaveFallback(blob);
      }
      btn.disabled = false;
      btn.textContent = original;
    }, "image/png");
  }

  /* ---------------------------------------------------------------- */
  /* Wochenbrief                                                        */
  /* Statt einzelner Zahlen ein zusammenhängender, in Worten            */
  /* geschriebener Rückblick auf die laufende Woche – verbindet         */
  /* Aktivität, Gewichtstrend, Streak und Giraffis Quests zu einer      */
  /* kleinen Geschichte statt eines Dashboards.                         */
  /* ---------------------------------------------------------------- */

  function computeWochenbrief() {
    const weekStart = startOfWeek(new Date());
    const today = new Date();
    const daysElapsed = Math.min(7, Math.floor((today - weekStart) / 86400000) + 1);
    const days = getWeekDayEntries(weekStart).slice(0, daysElapsed);
    const activeDays = days.filter((e) => (e.activities && e.activities.length > 0) || (e.steps && e.steps > 0)).length;
    const agg = weekAggregate(weekStart);

    const sportCounts = Object.keys(agg.byType).filter((k) => k !== "restday").map((k) => ({ key: k, count: agg.byType[k].count }));
    sportCounts.sort((a, b) => b.count - a.count);
    const topSport = sportCounts.length ? { sport: SPORTS[sportCounts[0].key] || SPORTS.custom, count: sportCounts[0].count } : null;

    const data = Storage.load();
    const weights = (data.weights || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    let weightText = null;
    if (weights.length >= 2) {
      const trend = computeWeightTrend(weights, 14);
      const latest = trend[trend.length - 1];
      const weekAgoISO = toISO(addDays(fromISO(latest.date), -7));
      const refCandidates = trend.filter((p) => p.date <= weekAgoISO);
      if (refCandidates.length) {
        const ref = refCandidates[refCandidates.length - 1];
        const delta = latest.value - ref.value;
        weightText = Math.abs(delta) < 0.3
          ? `Dein Trendgewicht ist stabil geblieben (${latest.value.toFixed(1)} kg) – ganz normal, das gehört dazu.`
          : `Dein Trendgewicht liegt jetzt bei ${latest.value.toFixed(1)} kg (${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg zur Vorwoche).`;
      }
    }

    const streaks = computeStreaks();
    const streakText = streaks.current > 0
      ? `Deine aktuelle Serie steht bei ${streaks.current} ${streaks.current === 1 ? "Tag" : "Tagen"}.`
      : "Deine Serie ist gerade bei 0 – ein kleiner Schritt heute baut sie wieder auf.";

    const quests = getQuestsForWeek(weekStart);
    const goals = Storage.getSettings();
    const questDone = quests.filter((q) => q.evaluate(weekStart, agg, days.length === 7 ? days : getWeekDayEntries(weekStart), goals).done).length;

    const companionState = computeCompanionState();

    return { weekStart, daysElapsed, activeDays, topSport, stepsTotal: agg.steps, minutes: agg.minutes, weightText, streakText, quests, questDone, stage: companionState.stage };
  }

  function buildWochenbriefHTML() {
    const w = computeWochenbrief();
    const fmt = (n) => n.toLocaleString("de-DE");
    const parts = [];
    parts.push(`Diese Woche warst du an ${w.activeDays} von ${w.daysElapsed} bisherigen ${w.daysElapsed === 1 ? "Tag" : "Tagen"} aktiv.`);
    if (w.topSport) parts.push(`Am häufigsten stand ${w.topSport.sport.label} auf dem Programm (${w.topSport.count}×).`);
    if (w.stepsTotal > 0) parts.push(`Insgesamt bist du ${fmt(w.stepsTotal)} Schritte gelaufen${w.minutes > 0 ? ` und warst ${w.minutes} Minuten aktiv` : ""}.`);
    if (w.weightText) parts.push(w.weightText);
    parts.push(w.streakText);
    const companionName = getActiveSpecies().name;
    parts.push(`Von ${possessive(companionName)} ${w.quests.length} Quests dieser Woche hast du ${w.questDone} geschafft.`);
    parts.push(`${companionName} ist aktuell „${w.stage.label}".`);

    return `
      <h2 class="section-title" style="margin-top:0;">✉️ Dein Wochenbrief</h2>
      <div class="card wochenbrief-card">
        <div class="wochenbrief-text">${parts.map((p) => esc(p)).join(" ")}</div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Meine Reise                                                    */
  /* Eine chronologische Zeitleiste aus Fotos, Gewichtsmeilensteinen,    */
  /* Giraffis Wachstumsstufen und Erfolgen – wie ein Tagebuch der        */
  /* ganzen Reise statt verteilter Einzelstatistiken. Alles wird aus     */
  /* vorhandenen Daten abgeleitet (bei Streak-/Trainings-/Perfekte-      */
  /* Woche-Meilensteinen wird das jeweils ERSTE Erreichen rückwirkend    */
  /* aus den Einträgen ermittelt), nichts wird separat gespeichert.      */
  /* ---------------------------------------------------------------- */

  function computeQuestBadgeEvents() {
    const data = Storage.load();
    const entryDates = Object.keys(data.entries);
    if (!entryDates.length) return [];
    const earliest = entryDates.reduce((min, iso) => (iso < min ? iso : min), entryDates[0]);
    let cursor = startOfWeek(fromISO(earliest));
    const todayWeek = startOfWeek(new Date());
    const goals = Storage.getSettings();
    const thresholds = [40, 120, 300];
    let ti = 0;
    let total = 0;
    let guard = 0;
    const events = [];
    while (cursor <= todayWeek && ti < thresholds.length && guard < 300) {
      const quests = getQuestsForWeek(cursor);
      const agg = weekAggregate(cursor);
      const days = getWeekDayEntries(cursor);
      quests.forEach((q) => { if (q.evaluate(cursor, agg, days, goals).done) total += q.xp; });
      while (ti < thresholds.length && total >= thresholds[ti]) {
        events.push({ date: toISO(addDays(cursor, 6)), type: "quest", icon: "🎖️", title: `Quest-Abzeichen freigeschaltet: ${thresholds[ti]} XP erreicht` });
        ti++;
      }
      cursor = addDays(cursor, 7);
      guard++;
    }
    return events;
  }

  function computeJourneyEvents() {
    const events = [];
    const data = Storage.load();

    const weights = (data.weights || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    weights.forEach((w, i) => {
      const prev = i > 0 ? weights[i - 1] : null;
      const delta = prev ? w.kg - prev.kg : null;
      events.push({
        date: w.date, type: "weight", icon: "⚖️",
        title: i === 0
          ? `Erster Gewichtseintrag: ${w.kg.toFixed(1)} kg`
          : `Gewicht: ${w.kg.toFixed(1)} kg${delta != null && Math.abs(delta) >= 0.1 ? ` (${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg)` : ""}`
      });
    });

    const isActive = (e) => !!e && ((e.activities && e.activities.length > 0) || (e.steps && e.steps > 0));
    const activeDates = Object.keys(data.entries).filter((iso) => isActive(data.entries[iso])).sort();

    const species = getActiveSpecies();
    species.stages.forEach((stage) => {
      if (stage.min === 0) return;
      if (activeDates.length >= stage.min) {
        events.push({ date: activeDates[stage.min - 1], type: "companion", icon: species.emoji, title: `${species.name} erreicht die Stufe „${stage.label}"` });
      }
    });

    [7, 30].forEach((threshold) => {
      let run = 1, hitDate = null;
      for (let i = 0; i < activeDates.length; i++) {
        if (i > 0) {
          const diffDays = Math.round((fromISO(activeDates[i]) - fromISO(activeDates[i - 1])) / 86400000);
          run = diffDays === 1 ? run + 1 : 1;
        }
        if (run >= threshold) { hitDate = activeDates[i]; break; }
      }
      if (hitDate) events.push({ date: hitDate, type: "streak", icon: "🔥", title: `${threshold}-Tage-Serie zum ersten Mal erreicht` });
    });

    const workouts = getAllActivitiesFlat().filter((a) => a.type !== "restday").slice().sort((a, b) => a.date.localeCompare(b.date));
    [50, 100, 250].forEach((threshold) => {
      if (workouts.length >= threshold) {
        events.push({ date: workouts[threshold - 1].date, type: "workout", icon: "💪", title: `${threshold}. Trainingseinheit geloggt` });
      }
    });

    const chHistoryAll = computeChallengeHistory({ limit: 1000 });
    const perfectRows = chHistoryAll.rows.filter((r) => r.done === 7).slice().sort((a, b) => a.wKey.localeCompare(b.wKey));
    [1, 3, 6].forEach((threshold) => {
      if (perfectRows.length >= threshold) {
        const wk = perfectRows[threshold - 1].wKey;
        events.push({ date: toISO(dateFromWeekKey(wk)), type: "perfectweek", icon: "🏆", title: `${threshold}. perfekte Challenge-Woche (KW ${wk.split("-W")[1]})` });
      }
    });

    events.push(...computeQuestBadgeEvents());

    return events;
  }

  async function renderReise() {
    const container = document.getElementById("tab-reise");
    container.innerHTML = `
      <h2 class="section-title" style="margin-top:0;">🧭 Meine Reise</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:14px;">Fotos, Gewichtsmeilensteine, ${esc(possessive(getActiveSpecies().name))} Wachstum und deine Erfolge – chronologisch an einem Ort.</div>
        <div id="journeyList" class="journey-timeline"><div class="empty-hint">Lädt …</div></div>
      </div>
    `;

    const events = computeJourneyEvents();
    let photos = [];
    try { photos = await PhotoDB.all(); } catch (e) { console.warn(e); }
    const photoEvents = photos.map((p) => ({ date: p.date, type: "photo", icon: "📷", title: "Progress-Foto", photo: p }));

    const all = events.concat(photoEvents).sort((a, b) => b.date.localeCompare(a.date));
    const list = document.getElementById("journeyList");
    if (!list) return;

    if (!all.length) {
      list.innerHTML = `<div class="empty-hint">Noch keine Meilensteine – leg los, und deine Reise füllt sich hier von selbst.</div>`;
      return;
    }

    list.innerHTML = all.map((ev, i) => {
      let extra = "";
      if (ev.type === "photo") {
        const url = URL.createObjectURL(ev.photo.blob);
        extra = `<div class="journey-photo-thumb" data-journey-photo="${i}"><img src="${url}" alt="Progress-Foto"></div>`;
      }
      return `
        <div class="journey-event">
          <div class="journey-marker">${ev.icon}</div>
          <div class="journey-date">${formatShortDate(fromISO(ev.date))}</div>
          <div class="journey-title">${esc(ev.title)}</div>
          ${extra}
        </div>
      `;
    }).join("");

    list.querySelectorAll("[data-journey-photo]").forEach((thumbEl) => {
      const idx = parseInt(thumbEl.getAttribute("data-journey-photo"), 10);
      const ev = all[idx];
      if (!ev || ev.type !== "photo") return;
      const url = thumbEl.querySelector("img").src;
      thumbEl.addEventListener("click", () => openPhotoModal(ev.photo, url));
    });
  }

  function renderTrends() {
    const container = document.getElementById("tab-trends");
    const today = new Date();
    const curStart = startOfWeek(today);
    const lastStart = addDays(curStart, -7);
    const cur = weekAggregate(curStart);
    const last = weekAggregate(lastStart);
    const curStepsAvg = cur.stepDays ? Math.round(cur.steps / cur.stepDays) : 0;
    const lastStepsAvg = last.stepDays ? Math.round(last.steps / last.stepDays) : 0;

    const compareDefs = [
      { label: "Ø Schritte/Tag", cur: curStepsAvg, last: lastStepsAvg, fmt: (v) => (v ? v.toLocaleString("de-DE") : "–") },
      { label: "Minuten aktiv", cur: cur.minutes, last: last.minutes, fmt: (v) => String(v) },
      { label: "Kalorien", cur: cur.calories, last: last.calories, fmt: (v) => v.toLocaleString("de-DE") },
      { label: "Distanz (km)", cur: cur.distance, last: last.distance, fmt: (v) => v.toFixed(1) }
    ];
    const compareRows = compareDefs.map((r) => {
      const d = trendDelta(r.cur, r.last);
      return `<div class="trend-row">
        <span class="trend-label">${r.label}</span>
        <span class="trend-value">${r.fmt(r.cur)}</span>
        <span class="trend-delta ${d.cls}">${d.label}</span>
      </div>`;
    }).join("");

    const weeks = [];
    for (let i = 7; i >= 0; i--) weeks.push({ ws: addDays(curStart, -7 * i), agg: weekAggregate(addDays(curStart, -7 * i)) });

    const maxMinutes = Math.max(30, ...weeks.map((w) => w.agg.minutes));
    const minuteBars = weeks.map((w) => {
      const pct = Math.min(100, Math.round((w.agg.minutes / maxMinutes) * 100));
      return `<div class="bar-row">
        <div class="bar-label">KW${weekKey(w.ws).split("-W")[1]}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="bar-val">${w.agg.minutes} min</div>
      </div>`;
    }).join("");

    const maxStepsAvg = Math.max(1000, ...weeks.map((w) => (w.agg.stepDays ? Math.round(w.agg.steps / w.agg.stepDays) : 0)));
    const stepBars = weeks.map((w) => {
      const avg = w.agg.stepDays ? Math.round(w.agg.steps / w.agg.stepDays) : 0;
      const pct = Math.min(100, Math.round((avg / maxStepsAvg) * 100));
      return `<div class="bar-row">
        <div class="bar-label">KW${weekKey(w.ws).split("-W")[1]}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="bar-val">${avg ? avg.toLocaleString("de-DE") : "–"}</div>
      </div>`;
    }).join("");

    const streaks = computeStreaks();
    const bests = computeBests();

    const bestRows = `
      <div class="best-row">
        <span class="best-label">Aktuelle Serie</span>
        <div class="best-value">${streaks.current} ${streaks.current === 1 ? "Tag" : "Tage"}</div>
      </div>
      <div class="best-row">
        <span class="best-label">Längste Serie</span>
        <div class="best-value">${streaks.longest} ${streaks.longest === 1 ? "Tag" : "Tage"}</div>
      </div>
      <div class="best-row">
        <span class="best-label">Längste Strecke</span>
        <div class="best-value">${bests.bestDistance ? `${bests.bestDistance.value} km<div class="best-sub">${SPORTS[bests.bestDistance.type].icon} ${formatShortDate(fromISO(bests.bestDistance.date))}</div>` : "–"}</div>
      </div>
      <div class="best-row">
        <span class="best-label">Schnellste Pace</span>
        <div class="best-value">${bests.bestPace ? `${bests.bestPace.raw} min/km<div class="best-sub">${SPORTS[bests.bestPace.type].icon} ${formatShortDate(fromISO(bests.bestPace.date))}</div>` : "–"}</div>
      </div>
      <div class="best-row">
        <span class="best-label">Meiste Kalorien (Einheit)</span>
        <div class="best-value">${bests.bestCalorieSession ? `${bests.bestCalorieSession.value} kcal<div class="best-sub">${SPORTS[bests.bestCalorieSession.type].icon} ${formatShortDate(fromISO(bests.bestCalorieSession.date))}</div>` : "–"}</div>
      </div>
    `;

    const topSports = computeTopSports(3);
    const topSportsHTML = topSports.length
      ? topSports.map((t) => {
          const s = SPORTS[t.type];
          return `<span class="chip" style="background:${s.bg};color:${s.fg};"><span class="emoji">${s.icon}</span>${s.label} × ${t.count}</span>`;
        }).join(" ")
      : `<span class="small muted">Noch keine Aktivitäten erfasst.</span>`;

    const curWKey = weekKey(today);
    const chHistory = computeChallengeHistory({ limit: 6, excludeKey: curWKey });
    const challengeSectionHTML = chHistory.totalWeeks ? `
      <h2 class="section-title">Challenge-Erfolge</h2>
      <div class="card">
        <div class="best-row">
          <span class="best-label">🏆 Perfekte Wochen (7/7)</span>
          <div class="best-value">${chHistory.perfectWeeks} ${chHistory.perfectWeeks === 1 ? "Woche" : "Wochen"}</div>
        </div>
        <div class="best-row">
          <span class="best-label">Ø Erfüllung pro Woche</span>
          <div class="best-value">${chHistory.avgPct}%</div>
        </div>
      </div>

      <h2 class="section-title">Challenge-Verlauf</h2>
      <div class="card">${buildChallengeHistoryRows(chHistory.rows)}</div>
    ` : "";

    const sportFilterOptions = `<option value="">Alle Sportarten</option>` +
      Object.keys(SPORTS).map((key) => `<option value="${key}">${SPORTS[key].icon} ${SPORTS[key].label}</option>`).join("");

    container.innerHTML = `
      ${buildWochenbriefHTML()}

      <h2 class="section-title">Diese Woche vs. letzte Woche</h2>
      <div class="card">${compareRows}</div>

      <h2 class="section-title">Minuten – letzte 8 Wochen</h2>
      <div class="card">${minuteBars}</div>

      <h2 class="section-title">Ø Schritte/Tag – letzte 8 Wochen</h2>
      <div class="card">${stepBars}</div>

      <h2 class="section-title">Bestwerte</h2>
      <div class="card">${bestRows}</div>

      <h2 class="section-title">Erfolge</h2>
      <div class="card">
        ${buildBadgesHTML(computeBadges())}
        <div class="small muted" style="margin-top:14px;">🧊 Streak-Freeze: 1× pro Monat rettet deine Wochenziel-Serie automatisch, falls du eine Woche mal nicht schaffst.</div>
      </div>

      <h2 class="section-title">Beliebteste Sportarten</h2>
      <div class="card">${topSportsHTML}</div>

      ${challengeSectionHTML}

      <h2 class="section-title">Aktivitäten durchsuchen</h2>
      <div class="card">
        <div class="field" style="margin-bottom:0;">
          <select id="historyFilterSelect">${sportFilterOptions}</select>
        </div>
      </div>
      <div class="card" id="historyResults"></div>

      <h2 class="section-title">Deine Datenkunst</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:12px;">Ein generatives Bild aus deinen letzten 12 Wochen: jeder Strahl ist eine Woche (Länge = aktive Tage), die Farbe zeigt die Gewichtsrichtung (🟢 runter · 🟣 stabil · 🟠 hoch), der Kern in der Mitte wächst mit deiner aktuellen Streak, die kleinen Funken zählen deine Erfolge.</div>
        <div class="data-art-canvas-wrap"><canvas id="dataArtCanvas" width="1000" height="1000"></canvas></div>
        <button class="btn btn-secondary btn-block" id="dataArtDownloadBtn" style="margin-top:14px;">🖼️ Als Bild speichern</button>
      </div>
    `;

    const historyResults = document.getElementById("historyResults");
    const historyFilterSelect = document.getElementById("historyFilterSelect");
    renderActivityHistoryResults(historyResults, historyFilterSelect.value);
    historyFilterSelect.addEventListener("change", () => {
      renderActivityHistoryResults(historyResults, historyFilterSelect.value);
    });

    const dataArtCanvas = document.getElementById("dataArtCanvas");
    if (dataArtCanvas) drawDataArt(dataArtCanvas);
    const dataArtDownloadBtn = document.getElementById("dataArtDownloadBtn");
    if (dataArtDownloadBtn) dataArtDownloadBtn.addEventListener("click", downloadDataArt);
  }

  function getAllActivitiesFlat() {
    const data = Storage.load();
    const list = [];
    Object.keys(data.entries).forEach((iso) => {
      (data.entries[iso].activities || []).forEach((a) => list.push(Object.assign({ date: iso }, a)));
    });
    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }

  function renderActivityHistoryResults(container, filterType) {
    const all = getAllActivitiesFlat();
    const filtered = filterType ? all.filter((a) => a.type === filterType) : all;

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-hint">Keine Einträge gefunden.</div>`;
      return;
    }

    const shown = filtered.slice(0, 25);
    const summary = filterType
      ? `<div class="small muted" style="margin-bottom:12px;">Zuletzt: <strong>${formatShortDate(fromISO(filtered[0].date))}</strong> · insgesamt ${filtered.length}×</div>`
      : `<div class="small muted" style="margin-bottom:12px;">${filtered.length} Aktivitäten insgesamt</div>`;

    const rows = shown.map((a) => {
      const sport = SPORTS[a.type] || SPORTS.custom;
      const label = sport.custom && a.customName ? a.customName : sport.label;
      const statParts = sport.fields.map((f) => {
        if (a[f] === undefined || a[f] === "" || a[f] === null) return "";
        return `${a[f]}${FIELD_META[f].unit === "min/km" ? " min/km" : " " + FIELD_META[f].unit}`;
      }).filter(Boolean).join(" · ");
      return `
        <div class="activity-item">
          <div class="info">
            <div class="icon-badge" style="background:${sport.bg}">${sport.icon}</div>
            <div>
              <div>${esc(label)} <span class="small muted">· ${formatShortDate(fromISO(a.date))}</span></div>
              <div class="stats">${statParts || "&nbsp;"}</div>
            </div>
          </div>
        </div>`;
    }).join("");

    const more = filtered.length > shown.length
      ? `<div class="small muted" style="text-align:center; padding-top:4px;">…und ${filtered.length - shown.length} weitere</div>`
      : "";

    container.innerHTML = summary + rows + more;
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Gewicht                                                       */
  /* ---------------------------------------------------------------- */

  function buildLineChartSVG(points, color, unit) {
    if (points.length < 2) return null;
    const w = 300, h = 140, padX = 10, padY = 16;
    const values = points.map((p) => p.value);
    const min = Math.min(...values), max = Math.max(...values);
    const range = (max - min) || 1;
    const stepX = points.length > 1 ? (w - padX * 2) / (points.length - 1) : 0;
    const pts = points.map((p, i) => ({
      x: padX + i * stepX,
      y: padY + (h - padY * 2) * (1 - (p.value - min) / range)
    }));
    const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
    const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${color}"/>`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <text x="${padX}" y="12" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${max.toFixed(1)}${unit}</text>
      <text x="${padX}" y="${h - 4}" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${min.toFixed(1)}${unit}</text>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  /* Trendgewicht: gleitender Durchschnitt über die letzten 14 Tage statt
     des rohen Tageswerts. Tageswerte schwanken 1-2 kg durch Wasser, Salz,
     Zyklus etc. – der Trend zeigt die eigentliche Entwicklung, ohne dass
     ein einzelner "schlechter" Tag frustriert. */
  function computeWeightTrend(weights, windowDays) {
    const win = windowDays || 14;
    return weights.map((w) => {
      const windowStartISO = toISO(addDays(fromISO(w.date), -(win - 1)));
      const inWindow = weights.filter((x) => x.date >= windowStartISO && x.date <= w.date);
      const avg = inWindow.reduce((s, x) => s + x.kg, 0) / inWindow.length;
      return { id: w.id, date: w.date, value: avg };
    });
  }

  function buildWeightTrendChartSVG(rawPoints, trendPoints, unit) {
    if (rawPoints.length < 2) return null;
    const w = 300, h = 140, padX = 10, padY = 16;
    const allValues = rawPoints.map((p) => p.kg).concat(trendPoints.map((p) => p.value));
    const min = Math.min(...allValues), max = Math.max(...allValues);
    const range = (max - min) || 1;
    const stepX = (w - padX * 2) / (rawPoints.length - 1);
    const mapY = (v) => padY + (h - padY * 2) * (1 - (v - min) / range);
    const rawDots = rawPoints.map((p, i) =>
      `<circle cx="${(padX + i * stepX).toFixed(1)}" cy="${mapY(p.kg).toFixed(1)}" r="2.6" fill="#FF4D8D" opacity="0.28"/>`
    ).join("");
    const trendPts = trendPoints.map((p, i) => ({ x: padX + i * stepX, y: mapY(p.value) }));
    const pathD = trendPts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <text x="${padX}" y="12" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${max.toFixed(1)}${unit}</text>
      <text x="${padX}" y="${h - 4}" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${min.toFixed(1)}${unit}</text>
      ${rawDots}
      <path d="${pathD}" fill="none" stroke="#FF4D8D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /* Plateau-Erkennung: Wenn sich das Trendgewicht seit ~14+ Tagen kaum
     bewegt hat, aktiv einordnen statt einfach nichts zu sagen. */
  function detectWeightPlateau(trendPoints) {
    if (trendPoints.length < 2) return null;
    const latest = trendPoints[trendPoints.length - 1];
    const cutoffISO = toISO(addDays(fromISO(latest.date), -14));
    const refCandidates = trendPoints.filter((p) => p.date <= cutoffISO);
    if (!refCandidates.length) return null;
    const ref = refCandidates[refCandidates.length - 1];
    const days = Math.round((fromISO(latest.date) - fromISO(ref.date)) / 86400000);
    if (days < 14) return null;
    const diff = Math.abs(latest.value - ref.value);
    if (diff <= 0.3) return { days };
    return null;
  }

  /* Ziel-Datum-Prognose: lineare Hochrechnung aus dem jüngsten Trendtempo. */
  function computeGoalDateProjection(trendPoints, targetKg) {
    if (targetKg == null || trendPoints.length < 2) return null;
    const recent = trendPoints.slice(-8);
    const first = recent[0], last = recent[recent.length - 1];
    const days = (fromISO(last.date) - fromISO(first.date)) / 86400000;
    if (days < 5) return { status: "insufficient" };
    const ratePerDay = (last.value - first.value) / days;
    const remaining = targetKg - last.value;
    if (Math.abs(remaining) < 0.05) return { status: "reached" };
    if (Math.abs(ratePerDay) < 0.004) return { status: "stalled" };
    const movingTowardTarget = (remaining < 0 && ratePerDay < 0) || (remaining > 0 && ratePerDay > 0);
    if (!movingTowardTarget) return { status: "wrong-direction" };
    const daysNeeded = Math.round(remaining / ratePerDay);
    const projectedDate = addDays(fromISO(last.date), daysNeeded);
    return { status: "ok", date: projectedDate, ratePerWeek: ratePerDay * 7 };
  }

  function findNearestWeightBefore(weights, isoDate) {
    let best = null;
    weights.forEach((w) => {
      if (w.date <= isoDate && (!best || w.date > best.date)) best = w;
    });
    return best;
  }

  function computeWeightGoalProgress(startKg, currentKg, targetKg) {
    if (startKg == null || currentKg == null || targetKg == null) return null;
    if (startKg === targetKg) return null;
    const reached = (startKg > targetKg && currentKg <= targetKg) || (startKg < targetKg && currentKg >= targetKg);
    const pct = reached ? 100 : Math.max(0, Math.min(100, Math.round(((startKg - currentKg) / (startKg - targetKg)) * 100)));
    return { pct, remaining: Math.abs(currentKg - targetKg), reached };
  }

  let measurementSelectedType = "taille";

  function buildStatPairHTML(points, unit, currentLabel, changeLabel) {
    if (!points.length) return `<div class="empty-hint">Noch keine Einträge.</div>`;
    const latest = points[points.length - 1];
    const first = points[0];
    const change = first.id !== latest.id ? latest.value - first.value : null;
    const fmtChange = (v) => (v == null ? "–" : `${v > 0 ? "+" : ""}${v.toFixed(1)} ${unit}`);
    return `
      <div class="stat-grid" style="margin-bottom:0;">
        <div class="stat-box"><div class="stat-value">${latest.value.toFixed(1)} ${unit}</div><div class="stat-label">${currentLabel}</div></div>
        <div class="stat-box"><div class="stat-value">${fmtChange(change)}</div><div class="stat-label">${changeLabel}</div></div>
      </div>
    `;
  }

  function renderGewicht() {
    const container = document.getElementById("tab-gewicht");
    const weights = Storage.getWeights();
    const settings = Storage.getSettings();
    const todayISO = toISO(new Date());
    const latest = weights.length ? weights[weights.length - 1] : null;
    const first = weights.length ? weights[0] : null;

    const trend = computeWeightTrend(weights);
    const latestTrend = trend.length ? trend[trend.length - 1] : null;

    let statsHTML = `<div class="empty-hint">Noch kein Gewicht erfasst. Trag dein erstes Gewicht unten ein.</div>`;
    let plateauHTML = "";
    let goalDateHTML = "";
    if (latest) {
      const totalChange = first && latestTrend ? latestTrend.value - first.kg : null;
      const thirtyDaysAgoISO = toISO(addDays(fromISO(latest.date), -30));
      const trendRefCandidates = trend.filter((t) => t.date <= thirtyDaysAgoISO);
      const trendRef = trendRefCandidates.length ? trendRefCandidates[trendRefCandidates.length - 1] : trend[0];
      const monthChange = trendRef && latestTrend && trendRef.id !== latestTrend.id ? latestTrend.value - trendRef.value : null;
      const fmtChange = (v) => (v == null ? "–" : `${v > 0 ? "+" : ""}${v.toFixed(1)} kg`);
      const goalProgress = computeWeightGoalProgress(first.kg, latestTrend.value, settings.targetWeightKg);
      const rawVsTrendDiff = latest.kg - latestTrend.value;
      statsHTML = `
        <div class="stat-grid" style="margin-bottom:0;">
          <div class="stat-box"><div class="stat-value">${latestTrend.value.toFixed(1)} kg</div><div class="stat-label">TRENDGEWICHT</div></div>
          <div class="stat-box"><div class="stat-value">${fmtChange(monthChange)}</div><div class="stat-label">LETZTE 30 TAGE (TREND)</div></div>
        </div>
        <div class="small muted" style="margin-top:12px;">Letzter Rohwert (${formatShortDate(fromISO(latest.date))}): <strong>${latest.kg.toFixed(1)} kg</strong>${Math.abs(rawVsTrendDiff) >= 0.15 ? ` <span style="opacity:.75;">(${rawVsTrendDiff > 0 ? "+" : ""}${rawVsTrendDiff.toFixed(1)} kg zum Trend – normale Tagesschwankung)</span>` : ""} · Gesamtverlauf seit ${formatShortDate(fromISO(first.date))}: <strong>${fmtChange(totalChange)}</strong></div>
        ${goalProgress ? `
          <div class="row-between" style="margin-top:14px;">
            <span class="field-label" style="margin-bottom:0;">Zielgewicht ${settings.targetWeightKg.toFixed(1)} kg</span>
            <span class="small muted">${goalProgress.reached ? "🎯 erreicht!" : `noch ${goalProgress.remaining.toFixed(1)} kg`}</span>
          </div>
          <div class="progress-bar-lg" style="margin-top:8px;"><div class="fill" style="width:${goalProgress.pct}%"></div></div>
        ` : ""}
      `;

      const plateau = detectWeightPlateau(trend);
      if (plateau) {
        plateauHTML = `
          <div class="card" style="background:var(--accent-soft-2); border:1px solid var(--border);">
            <div class="small" style="line-height:1.5;">📊 <strong>Dein Trendgewicht ist seit ${plateau.days} Tagen stabil</strong> (±0,3 kg). Das ist normal – Plateaus gehören zum Abnehmen dazu, oft durch Wassereinlagerungen, Muskelaufbau oder eine natürliche Verlangsamung. Es bedeutet nicht, dass nichts passiert. Bleib dran, meistens geht es danach weiter.</div>
          </div>
        `;
      }

      if (settings.targetWeightKg != null && !(goalProgress && goalProgress.reached)) {
        const projection = computeGoalDateProjection(trend, settings.targetWeightKg);
        if (projection && projection.status === "ok") {
          goalDateHTML = `<div class="small muted" style="margin-top:10px;">Bei aktuellem Tempo (Ø ${Math.abs(projection.ratePerWeek).toFixed(2)} kg/Woche) Ziel erreicht am ca. <strong>${formatShortDate(projection.date)}</strong>.</div>`;
        }
      }
    }

    const chartSVG = buildWeightTrendChartSVG(weights, trend, " kg");
    const chartHTML = chartSVG ? chartSVG : `<div class="chart-empty">Sobald mindestens 2 Einträge vorhanden sind, siehst du hier den Trend als Diagramm.</div>`;

    const historyRows = weights.length
      ? weights.slice().reverse().map((w) => `
        <div class="type-row">
          <span class="small">${formatWeekdayDate(fromISO(w.date))}</span>
          <span style="display:flex; align-items:center; gap:6px;">
            <strong>${w.kg.toFixed(1)} kg</strong>
            <div class="item-actions">
              <button type="button" class="edit-btn" data-edit-weight="${w.id}" aria-label="Bearbeiten">✎</button>
              <button class="del-btn" data-del-weight="${w.id}" aria-label="Löschen">✕</button>
            </div>
          </span>
        </div>`).join("")
      : `<div class="empty-hint">Noch keine Einträge.</div>`;

    const allMeasurements = Storage.getMeasurements();
    const measurePoints = allMeasurements.filter((m) => m.type === measurementSelectedType);
    const measureUnit = "cm";
    const measureTypeOptions = Object.keys(MEASUREMENT_TYPES).map((k) =>
      `<option value="${k}" ${k === measurementSelectedType ? "selected" : ""}>${MEASUREMENT_TYPES[k].label}</option>`
    ).join("");
    const measureStatsHTML = buildStatPairHTML(measurePoints, measureUnit, "AKTUELLER WERT", "GESAMTVERLAUF");
    const measureChartSVG = buildLineChartSVG(measurePoints, "#8B5CF6", " cm");
    const measureChartHTML = measureChartSVG ? measureChartSVG : `<div class="chart-empty">Sobald mindestens 2 Einträge vorhanden sind, siehst du hier den Verlauf als Diagramm.</div>`;
    const measureHistoryHTML = measurePoints.length
      ? measurePoints.slice().reverse().map((m) => `
        <div class="type-row">
          <span class="small">${formatWeekdayDate(fromISO(m.date))}</span>
          <span style="display:flex; align-items:center; gap:6px;">
            <strong>${m.value.toFixed(1)} cm</strong>
            <div class="item-actions">
              <button type="button" class="edit-btn" data-edit-measure="${m.id}" aria-label="Bearbeiten">✎</button>
              <button class="del-btn" data-del-measure="${m.id}" aria-label="Löschen">✕</button>
            </div>
          </span>
        </div>`).join("")
      : `<div class="empty-hint">Noch keine Einträge für diese Körperstelle.</div>`;

    container.innerHTML = `
      <h2 class="section-title" style="margin-top:0;">Gewicht</h2>
      <div class="card">${statsHTML}</div>

      <h2 class="section-title">Verlauf</h2>
      <div class="card chart-card">${chartHTML}</div>
      <div class="small muted" style="margin:-10px 0 4px;">Kräftige Linie = Trend (Ø 14 Tage) · blasse Punkte = einzelne Messungen</div>

      ${plateauHTML}

      <h2 class="section-title">Zielgewicht</h2>
      <div class="card">
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">Ziel (kg)</label>
          <input type="number" id="targetWeightInput" step="0.1" min="0" value="${settings.targetWeightKg != null ? settings.targetWeightKg : ""}" placeholder="optional">
        </div>
        <button class="btn btn-secondary btn-block" id="saveTargetWeightBtn" style="margin-top:12px;">Zielgewicht speichern</button>
        ${goalDateHTML}
      </div>

      <h2 class="section-title">Eintragen</h2>
      <div class="card">
        <form id="weightForm">
          <div class="field-grid">
            <div class="field">
              <label class="field-label">Datum</label>
              <input type="date" id="weightDate" value="${todayISO}" max="${todayISO}">
            </div>
            <div class="field">
              <label class="field-label">Gewicht (kg)</label>
              <input type="number" id="weightInput" step="0.1" min="0" placeholder="z. B. 68.4">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="weightSubmitBtn">Speichern</button>
          <button type="button" class="btn btn-ghost btn-block" id="cancelWeightEditBtn" style="margin-top:8px; display:none;">Bearbeiten abbrechen</button>
        </form>
      </div>

      <h2 class="section-title">Einträge</h2>
      <div class="card">${historyRows}</div>

      <h2 class="section-title">Körpermaße</h2>
      <div class="card">
        <div class="row-between" style="margin-bottom:14px;">
          <span class="field-label" style="margin-bottom:0;">Verlauf: ${MEASUREMENT_TYPES[measurementSelectedType].icon} ${MEASUREMENT_TYPES[measurementSelectedType].label}</span>
        </div>
        ${measureStatsHTML}
        <div class="chart-card" style="margin-top:14px;">${measureChartHTML}</div>
      </div>

      <h2 class="section-title">Maß eintragen</h2>
      <div class="card">
        <form id="measureForm">
          <div class="field">
            <label class="field-label">Für welche Körperstelle?</label>
            <select id="measureTypeSelect">${measureTypeOptions}</select>
          </div>
          <div class="field-grid">
            <div class="field">
              <label class="field-label">Datum</label>
              <input type="date" id="measureDate" value="${todayISO}" max="${todayISO}">
            </div>
            <div class="field">
              <label class="field-label" id="measureValueLabel">Wert für ${MEASUREMENT_TYPES[measurementSelectedType].label} (cm)</label>
              <input type="number" id="measureInput" step="0.1" min="0" placeholder="z. B. 74.5">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="measureSubmitBtn">Speichern</button>
          <button type="button" class="btn btn-ghost btn-block" id="cancelMeasureEditBtn" style="margin-top:8px; display:none;">Bearbeiten abbrechen</button>
        </form>
      </div>

      <h2 class="section-title">Maße – Verlauf</h2>
      <div class="card">${measureHistoryHTML}</div>
    `;

    document.getElementById("saveTargetWeightBtn").addEventListener("click", () => {
      const raw = document.getElementById("targetWeightInput").value;
      const val = raw === "" ? null : parseFloat(raw);
      if (raw !== "" && (!val || val <= 0)) { showToast("Bitte ein gültiges Zielgewicht eingeben"); return; }
      Storage.saveSettings({ targetWeightKg: val });
      showToast(val == null ? "Zielgewicht entfernt" : "Zielgewicht gespeichert");
      renderGewicht();
    });

    function resetWeightFormMode() {
      editingWeightId = null;
      document.getElementById("weightDate").value = todayISO;
      document.getElementById("weightInput").value = "";
      document.getElementById("weightSubmitBtn").textContent = "Speichern";
      document.getElementById("cancelWeightEditBtn").style.display = "none";
    }
    let editingWeightId = null;
    container.querySelectorAll("[data-edit-weight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit-weight");
        const w = weights.find((x) => x.id === id);
        if (!w) return;
        editingWeightId = id;
        document.getElementById("weightDate").value = w.date;
        document.getElementById("weightInput").value = w.kg;
        document.getElementById("weightSubmitBtn").textContent = "Aktualisieren";
        document.getElementById("cancelWeightEditBtn").style.display = "block";
        document.getElementById("weightInput").focus();
      });
    });
    document.getElementById("cancelWeightEditBtn").addEventListener("click", resetWeightFormMode);

    document.getElementById("weightForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const dateVal = document.getElementById("weightDate").value || todayISO;
      const kgVal = parseFloat(document.getElementById("weightInput").value);
      if (!kgVal || kgVal <= 0) { showToast("Bitte ein gültiges Gewicht eingeben"); return; }
      if (editingWeightId) {
        Storage.updateWeight(editingWeightId, dateVal, kgVal);
        showToast("Gewicht aktualisiert");
      } else {
        Storage.addWeight(dateVal, kgVal);
        showToast("Gewicht gespeichert");
      }
      renderGewicht();
    });

    container.querySelectorAll("[data-del-weight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-weight");
        const removed = weights.find((w) => w.id === id);
        Storage.deleteWeight(id);
        renderGewicht();
        if (removed) {
          showUndoToast("Gewichtseintrag gelöscht", () => {
            Storage.restoreWeight(removed);
            renderGewicht();
          });
        }
      });
    });

    document.getElementById("measureTypeSelect").addEventListener("change", (e) => {
      measurementSelectedType = e.target.value;
      renderGewicht();
    });

    let editingMeasureId = null;
    function resetMeasureFormMode() {
      editingMeasureId = null;
      document.getElementById("measureDate").value = todayISO;
      document.getElementById("measureInput").value = "";
      document.getElementById("measureSubmitBtn").textContent = "Speichern";
      document.getElementById("cancelMeasureEditBtn").style.display = "none";
    }
    container.querySelectorAll("[data-edit-measure]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit-measure");
        const m = measurePoints.find((x) => x.id === id);
        if (!m) return;
        editingMeasureId = id;
        document.getElementById("measureDate").value = m.date;
        document.getElementById("measureInput").value = m.value;
        document.getElementById("measureSubmitBtn").textContent = "Aktualisieren";
        document.getElementById("cancelMeasureEditBtn").style.display = "block";
        document.getElementById("measureInput").focus();
      });
    });
    document.getElementById("cancelMeasureEditBtn").addEventListener("click", resetMeasureFormMode);

    document.getElementById("measureForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const dateVal = document.getElementById("measureDate").value || todayISO;
      const val = parseFloat(document.getElementById("measureInput").value);
      if (!val || val <= 0) { showToast("Bitte einen gültigen Wert eingeben"); return; }
      if (editingMeasureId) {
        Storage.updateMeasurement(editingMeasureId, measurementSelectedType, dateVal, val);
        showToast("Maß aktualisiert");
      } else {
        Storage.addMeasurement(measurementSelectedType, dateVal, val);
        showToast("Maß gespeichert");
      }
      renderGewicht();
    });

    container.querySelectorAll("[data-del-measure]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-measure");
        const removed = measurePoints.find((m) => m.id === id);
        Storage.deleteMeasurement(id);
        renderGewicht();
        if (removed) {
          showUndoToast("Maß gelöscht", () => {
            Storage.restoreMeasurement(removed);
            renderGewicht();
          });
        }
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Einstellungen                                                 */
  /* ---------------------------------------------------------------- */

  function renderEinstellungen() {
    const container = document.getElementById("tab-einstellungen");
    const settings = Storage.getSettings();

    const themeSwatches = Object.keys(THEMES).map((key) => {
      const t = THEMES[key];
      const active = settings.theme === key;
      return `<button type="button" class="theme-swatch${active ? " active" : ""}" data-theme="${key}" style="background:${t.swatch};" aria-label="${t.name}"></button>`;
    }).join("");

    const activeSpeciesKey = settings.companionSpecies || "giraffe";
    const companionSpeciesHTML = COMPANION_SPECIES.map((s) => {
      const active = activeSpeciesKey === s.key;
      return `
        <button type="button" class="companion-species-btn${active ? " active" : ""}" data-species="${s.key}">
          <span class="companion-species-emoji">${s.emoji}</span>
          <span class="companion-species-name">${esc(s.name)}</span>
        </button>
      `;
    }).join("");

    const selfMessages = Storage.getSelfMessages();
    const selfMessagesHTML = selfMessages.length
      ? selfMessages.slice().reverse().map((m) => `
        <div class="type-row">
          <span class="small" style="flex:1; margin-right:10px;">„${escapeHtml(m.text)}"</span>
          <div class="item-actions">
            <button class="del-btn" data-del-selfmsg="${m.id}" aria-label="Löschen">✕</button>
          </div>
        </div>`).join("")
      : `<div class="empty-hint">Noch keine Nachrichten gespeichert.</div>`;

    container.innerHTML = `
      <h2 class="section-title" style="margin-top:0;">Einstellungen</h2>

      <h2 class="section-title" style="margin-top:0;">App-Name</h2>
      <div class="card">
        <div class="field" style="margin-bottom:10px;">
          <label class="field-label">Angezeigter Name</label>
          <input type="text" id="appNameInput" maxlength="30" value="${escapeHtml(settings.appName || "")}" placeholder="lenegoeslean">
        </div>
        <button class="btn btn-primary btn-block" id="saveAppNameBtn">Name speichern</button>
        <div class="small muted" style="margin-top:10px;">
          Ändert den Namen im Header und den Titel der App. Für ein Icon,
          das du <strong>noch nicht</strong> zum Home-Bildschirm hinzugefügt
          hast, wird dieser Name beim Hinzufügen mit übernommen. Ein bereits
          vorhandenes Icon behält seinen Namen – lösche es in dem Fall vom
          Home-Bildschirm und füge die Seite danach erneut hinzu.
        </div>
      </div>

      <h2 class="section-title">Farbschema</h2>
      <div class="card">
        <div class="theme-swatch-row">${themeSwatches}</div>
        <div class="field" style="margin-top:16px; margin-bottom:0;">
          <label class="field-label">Dunkelmodus</label>
          <select id="darkModeInput">
            <option value="auto" ${settings.darkMode === "auto" ? "selected" : ""}>Automatisch (Systemeinstellung)</option>
            <option value="on" ${settings.darkMode === "on" ? "selected" : ""}>Immer an</option>
            <option value="off" ${settings.darkMode === "off" ? "selected" : ""}>Immer aus</option>
          </select>
        </div>
      </div>

      <h2 class="section-title">🐾 Begleiter</h2>
      <div class="card">
        <div class="companion-species-row">${companionSpeciesHTML}</div>
        <div class="small muted" style="margin-top:10px;">Dein Fortschritt – Wachstumsstufe, Garderobe, Quest-XP – bleibt beim Wechseln erhalten. Nur Aussehen und Name ändern sich.</div>
      </div>

      <h2 class="section-title">Tagesziele</h2>
      <div class="card">
        <div class="field">
          <label class="field-label">Schritte-Ziel</label>
          <input type="number" min="1000" step="500" id="goalStepsInput" value="${settings.stepsGoal}">
        </div>
        <div class="field">
          <label class="field-label">Wasser-Ziel (ml)</label>
          <input type="number" min="250" step="250" id="goalWaterInput" value="${settings.waterGoalMl}">
        </div>
        <div class="field">
          <label class="field-label">Liegestütze-Ziel (am Stück)</label>
          <input type="number" min="1" step="1" id="goalPushupsInput" value="${settings.pushupsGoal}">
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">Plank-Ziel (Sekunden)</label>
          <input type="number" min="5" step="5" id="goalPlankInput" value="${settings.plankGoalSeconds}">
        </div>
        <button class="btn btn-primary btn-block" id="saveGoalsBtn" style="margin-top:12px;">Ziele speichern</button>
      </div>

      <h2 class="section-title">Wochenziel</h2>
      <div class="card">
        <div class="field">
          <label class="field-label">Art des Ziels</label>
          <select id="weeklyGoalModeInput">
            <option value="sessions" ${settings.weeklyGoalMode === "sessions" ? "selected" : ""}>Anzahl Trainingseinheiten</option>
            <option value="minutes" ${settings.weeklyGoalMode === "minutes" ? "selected" : ""}>Aktive Minuten</option>
            <option value="off" ${settings.weeklyGoalMode === "off" ? "selected" : ""}>Kein Wochenziel</option>
          </select>
        </div>
        <div class="field" id="weeklyGoalSessionsField">
          <label class="field-label">Trainingseinheiten pro Woche</label>
          <input type="number" min="1" step="1" id="weeklyGoalSessionsInput" value="${settings.weeklyGoalSessions}">
        </div>
        <div class="field" id="weeklyGoalMinutesField" style="margin-bottom:0;">
          <label class="field-label">Aktive Minuten pro Woche</label>
          <input type="number" min="10" step="10" id="weeklyGoalMinutesInput" value="${settings.weeklyGoalMinutes}">
        </div>
        <button class="btn btn-primary btn-block" id="saveWeeklyGoalBtn" style="margin-top:12px;">Wochenziel speichern</button>
        <div class="small muted" style="margin-top:10px;">Erscheint als Fortschrittsbalken oben im Tab „Woche".</div>
      </div>

      <h2 class="section-title">🎲 Chaos-Modus</h2>
      <div class="card">
        <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;">
          <span class="field-label" style="margin-bottom:0;">Ab und zu eine verrückte Mini-Challenge statt der Routine</span>
          <input type="checkbox" id="chaosModeInput" ${settings.chaosMode !== false ? "checked" : ""} style="width:20px;height:20px;flex-shrink:0;">
        </label>
        <div class="small muted" style="margin-top:10px;">An ca. jedem 3. Tag erscheint im Tab „Heute" statt der gewohnten Ansicht eine unerwartete kleine Aufgabe – bewusste Abwechslung gegen Monotonie.</div>
      </div>

      <h2 class="section-title">💌 Nachrichten an dich selbst</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Schreib dir eine Nachricht, die dich in einer schwierigen Phase wieder motiviert – dein eigenes „Warum". Sie taucht automatisch auf, wenn eine Streak gerissen ist.</div>
        <div class="field" style="margin-bottom:10px;">
          <textarea id="selfMessageInput" rows="3" placeholder="z. B. Denk daran, warum du angefangen hast …" style="resize:vertical;"></textarea>
        </div>
        <button class="btn btn-primary btn-block" id="saveSelfMessageBtn">Nachricht speichern</button>
        <div style="margin-top:14px;">${selfMessagesHTML}</div>
      </div>

      <h2 class="section-title">Daten</h2>
      <div class="card">
        <div class="small muted" style="margin-bottom:10px;">Sichere ein vollständiges Backup aller App-Daten (Workouts, Challenges, Gewicht, Einstellungen) als Datei, oder spiele ein zuvor gesichertes Backup wieder ein. Progress-Fotos sind hier nicht enthalten.</div>
        <button class="btn btn-secondary btn-block" id="exportAllBtn">⤓ Backup exportieren</button>
        <label class="btn btn-ghost btn-block" style="margin-top:10px; text-align:center; display:block; cursor:pointer;">
          Backup importieren
          <input type="file" accept="application/json" id="importInput" style="display:none;">
        </label>
        <button class="btn btn-ghost btn-block" id="resetBtn" style="margin-top:10px; color:#B5495A;">Trainings-, Challenge- &amp; Gewichtsdaten löschen</button>
      </div>

      <h2 class="section-title">Über die App</h2>
      <div class="card small muted">
        ${escapeHtml(settings.appName || DEFAULT_APP_NAME)} · Alle Daten werden ausschließlich lokal auf diesem Gerät gespeichert.
      </div>
    `;

    document.getElementById("saveAppNameBtn").addEventListener("click", () => {
      const raw = document.getElementById("appNameInput").value.trim();
      const name = raw || DEFAULT_APP_NAME;
      Storage.saveSettings({ appName: name });
      applyAppName(name);
      showToast("Name gespeichert");
      renderEinstellungen();
    });

    container.querySelectorAll(".theme-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-theme");
        Storage.saveSettings({ theme: key });
        applyTheme(key);
        renderEinstellungen();
      });
    });

    container.querySelectorAll(".companion-species-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-species");
        if (key === (Storage.getSettings().companionSpecies || "giraffe")) return;
        Storage.saveSettings({ companionSpecies: key });
        const s = COMPANION_SPECIES.find((sp) => sp.key === key);
        showToast(`Ab jetzt begleitet dich ${s ? s.name : ""}! 🎉`);
        renderEinstellungen();
      });
    });

    document.getElementById("darkModeInput").addEventListener("change", (e) => {
      Storage.saveSettings({ darkMode: e.target.value });
      applyTheme(Storage.getSettings().theme);
    });

    document.getElementById("saveGoalsBtn").addEventListener("click", () => {
      const steps = Math.max(1000, parseInt(document.getElementById("goalStepsInput").value, 10) || DEFAULT_STEPS_GOAL);
      const water = Math.max(250, parseInt(document.getElementById("goalWaterInput").value, 10) || DEFAULT_WATER_GOAL_ML);
      const pushups = Math.max(1, parseInt(document.getElementById("goalPushupsInput").value, 10) || DEFAULT_PUSHUPS_GOAL);
      const plank = Math.max(5, parseInt(document.getElementById("goalPlankInput").value, 10) || DEFAULT_PLANK_GOAL_SECONDS);
      Storage.saveSettings({ stepsGoal: steps, waterGoalMl: water, pushupsGoal: pushups, plankGoalSeconds: plank });
      showToast("Ziele gespeichert");
    });

    function updateWeeklyGoalFieldsVisibility() {
      const mode = document.getElementById("weeklyGoalModeInput").value;
      document.getElementById("weeklyGoalSessionsField").style.display = mode === "sessions" ? "block" : "none";
      document.getElementById("weeklyGoalMinutesField").style.display = mode === "minutes" ? "block" : "none";
    }
    updateWeeklyGoalFieldsVisibility();
    document.getElementById("weeklyGoalModeInput").addEventListener("change", updateWeeklyGoalFieldsVisibility);

    document.getElementById("saveWeeklyGoalBtn").addEventListener("click", () => {
      const mode = document.getElementById("weeklyGoalModeInput").value;
      const sessions = Math.max(1, parseInt(document.getElementById("weeklyGoalSessionsInput").value, 10) || DEFAULT_WEEKLY_GOAL_SESSIONS);
      const minutes = Math.max(10, parseInt(document.getElementById("weeklyGoalMinutesInput").value, 10) || DEFAULT_WEEKLY_GOAL_MINUTES);
      Storage.saveSettings({ weeklyGoalMode: mode, weeklyGoalSessions: sessions, weeklyGoalMinutes: minutes });
      showToast("Wochenziel gespeichert");
    });

    document.getElementById("chaosModeInput").addEventListener("change", (e) => {
      Storage.saveSettings({ chaosMode: e.target.checked });
      showToast(e.target.checked ? "Chaos-Modus aktiviert 🎲" : "Chaos-Modus deaktiviert");
    });

    document.getElementById("saveSelfMessageBtn").addEventListener("click", () => {
      const input = document.getElementById("selfMessageInput");
      const text = input.value.trim();
      if (!text) { showToast("Bitte zuerst eine Nachricht schreiben."); return; }
      Storage.addSelfMessage(text);
      showToast("Nachricht gespeichert 💛");
      renderEinstellungen();
    });

    container.querySelectorAll("[data-del-selfmsg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-selfmsg");
        Storage.deleteSelfMessage(id);
        renderEinstellungen();
      });
    });

    document.getElementById("exportAllBtn").addEventListener("click", () => {
      const json = Storage.exportAll();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lenegoeslean_backup_${toISO(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    document.getElementById("importInput").addEventListener("change", (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (!confirm("Backup einspielen? Deine aktuellen App-Daten werden dabei überschrieben.")) return;
        try {
          Storage.importAll(reader.result);
          const s = Storage.getSettings();
          applyTheme(s.theme);
          applyAppName(s.appName);
          showToast("Backup eingespielt");
          renderEinstellungen();
        } catch (e) {
          console.error(e);
          showToast("Backup konnte nicht gelesen werden");
        }
      };
      reader.readAsText(file);
      ev.target.value = "";
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      if (!confirm("Wirklich alle Trainings-, Challenge- und Gewichtsdaten unwiderruflich löschen? (Fotos und Einstellungen bleiben erhalten.)")) return;
      Storage.resetTrackingData();
      showToast("Daten gelöscht");
      renderEinstellungen();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tab-Steuerung                                                      */
  /* ---------------------------------------------------------------- */

  const renderers = { heute: renderHeute, woche: renderWoche, kalender: renderKalender, monat: renderMonat, fotos: renderFotos, challenge: renderChallenge, trends: renderTrends, gewicht: renderGewicht, reise: renderReise, einstellungen: renderEinstellungen };

  function switchTab(tab) {
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById("tab-" + tab).classList.add("active");
    document.querySelectorAll("nav.tabbar button").forEach((b) => {
      const active = b.dataset.tab === tab;
      b.classList.toggle("active", active);
      if (active) b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    window.scrollTo(0, 0);
    if (renderers[tab]) renderers[tab]();
  }

  function initNav() {
    document.querySelectorAll("nav.tabbar button").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
  }

  function initTopbar() {
    document.getElementById("topbarDate").textContent = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) settingsBtn.addEventListener("click", () => switchTab("einstellungen"));
  }

  /* ---------------------------------------------------------------- */
  /* Service Worker & Auto-Update                                       */
  /* ---------------------------------------------------------------- */

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW-Registrierung fehlgeschlagen", e));

    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update());
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Init                                                               */
  /* ---------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    initTopbar();
    initNav();
    initPostGenerator();
    initMonthPostGenerator();
    initChallengePostGenerator();
    initHighlightGenerator();
    renderHeute();
    initServiceWorker();
  });
})();
