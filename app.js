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
    custom:         { label: "Sonstiges",        icon: "🦄", bg: "#F1E9FF", fg: "#7C5CBF", fields: ["zeit", "kalorien"], custom: true },
    restday:        { label: "Rest-Day",        icon: "🐼", bg: "#ECEAFB", fg: "#6B5FBD", fields: [] }
  };

  const DEFAULT_STEPS_GOAL = 10000;
  const DEFAULT_WATER_GOAL_ML = 2000;
  const WATER_STEP_ML = 250;
  const DEFAULT_APP_NAME = "lenegoeslean";
  const DEFAULT_WEEKLY_GOAL_SESSIONS = 4;
  const DEFAULT_WEEKLY_GOAL_MINUTES = 150;

  const FIELD_META = {
    pace:     { label: "Pace",     unit: "min/km", type: "text",   placeholder: "z. B. 5:30" },
    distanz:  { label: "Distanz",  unit: "km",      type: "number", step: "0.01", placeholder: "z. B. 5.2" },
    zeit:     { label: "Zeit",     unit: "min",     type: "number", step: "1",    placeholder: "z. B. 30" },
    kalorien: { label: "Kalorien", unit: "kcal",    type: "number", step: "1",    placeholder: "z. B. 250" }
  };

  const THEMES = {
    pink:     { name: "Pink",         swatch: "#FF4D8D", bg: "#FFF6F9", accent: "#FF4D8D", accentDark: "#E23E76", accentSoft: "#FFDCEA", accentSoft2: "#FFEEF4", border: "#FBE1EC" },
    lavender: { name: "Flieder",      swatch: "#8B5CF6", bg: "#F8F6FF", accent: "#8B5CF6", accentDark: "#6D3FD1", accentSoft: "#E4DBFF", accentSoft2: "#F1ECFF", border: "#EDE7FB" },
    mint:     { name: "Minze",        swatch: "#2FAE83", bg: "#F2FBF7", accent: "#2FAE83", accentDark: "#1F8F6A", accentSoft: "#CBF0E0", accentSoft2: "#E3F8EF", border: "#DFF3EA" },
    peach:    { name: "Pfirsich",     swatch: "#FF8A4C", bg: "#FFF8F1", accent: "#FF8A4C", accentDark: "#E06B2C", accentSoft: "#FFDFC2", accentSoft2: "#FFEEDF", border: "#FBE7D6" },
    sky:      { name: "Himmelblau",   swatch: "#3B9DE8", bg: "#F1F8FF", accent: "#3B9DE8", accentDark: "#2478C4", accentSoft: "#CFE9FF", accentSoft2: "#E6F4FF", border: "#DDEEFB" }
  };

  function applyTheme(key) {
    const t = THEMES[key] || THEMES.pink;
    const root = document.documentElement.style;
    root.setProperty("--bg", t.bg);
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-dark", t.accentDark);
    root.setProperty("--accent-soft", t.accentSoft);
    root.setProperty("--accent-soft-2", t.accentSoft2);
    root.setProperty("--border", t.border);
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
      if (!this._cache.settings) this._cache.settings = {};
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
      return data.entries[dateISO] || { steps: null, activities: [], challengeChecked: false, water: 0 };
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
    getSettings() {
      const data = this.load();
      return Object.assign({
        theme: "pink", stepsGoal: DEFAULT_STEPS_GOAL, waterGoalMl: DEFAULT_WATER_GOAL_ML, appName: DEFAULT_APP_NAME,
        weeklyGoalMode: "sessions", weeklyGoalSessions: DEFAULT_WEEKLY_GOAL_SESSIONS, weeklyGoalMinutes: DEFAULT_WEEKLY_GOAL_MINUTES
      }, data.settings);
    },
    saveSettings(patch) {
      const data = this.load();
      data.settings = Object.assign({}, data.settings, patch);
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
      if (!this._cache.settings) this._cache.settings = {};
      this.save();
    },
    resetTrackingData() {
      const data = this.load();
      this._cache = { entries: {}, challenges: {}, weights: [], settings: data.settings || {} };
      this.save();
    }
  };

  applyTheme(Storage.getSettings().theme);
  applyAppName(Storage.getSettings().appName);

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
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
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

    return `
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

  function renderDynamicFields(container, sportKey) {
    const sport = SPORTS[sportKey] || SPORTS.restday;
    if (sportKey === "restday") {
      container.innerHTML = `<div class="small muted" style="grid-column:1/-1;padding:4px 0 2px;">Rest-Day – keine weiteren Angaben nötig. Gönn dir die Pause! 🐼</div>`;
      return;
    }
    let html = "";
    if (sport.custom) {
      html += `<div class="field" style="grid-column:1/-1;">
        <label class="field-label">Name der Aktivität</label>
        <input type="text" placeholder="z. B. Klettern, Tanzen, Wandern …" data-field="customName">
      </div>`;
    }
    html += sport.fields.map((f) => {
      const meta = FIELD_META[f];
      return `<div class="field">
        <label class="field-label">${meta.label} (${meta.unit})</label>
        <input type="${meta.type}" ${meta.step ? `step="${meta.step}"` : ""} placeholder="${meta.placeholder}" data-field="${f}">
      </div>`;
    }).join("");
    container.innerHTML = html;
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

    const sportSelect = container.querySelector(".sport-select");
    const dynamicFields = container.querySelector(".dynamic-fields");
    renderDynamicFields(dynamicFields, sportSelect.value);
    sportSelect.addEventListener("change", () => renderDynamicFields(dynamicFields, sportSelect.value));

    container.querySelectorAll("[data-del-activity]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del-activity");
        Storage.updateEntry(dateISO, (e) => { e.activities = e.activities.filter((a) => a.id !== id); });
        onChange();
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

        submitBtn.textContent = "Änderungen speichern";
        cancelEditBtn.style.display = "block";
        container.querySelectorAll(".activity-item").forEach((el) => {
          el.classList.toggle("editing", el.getAttribute("data-activity-id") === id);
        });
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    cancelEditBtn.addEventListener("click", () => resetToAddMode());

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const type = sportSelect.value;
      const sport = SPORTS[type];
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
        showToast("Aktivität hinzugefügt");
      }
      editingId = null;
      onChange();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tab: Heute                                                         */
  /* ---------------------------------------------------------------- */

  function renderHeute() {
    const container = document.getElementById("tab-heute");
    const today = new Date();
    const dateISO = toISO(today);
    const hour = today.getHours();
    const greeting = hour < 11 ? "Guten Morgen ☀️" : hour < 18 ? "Schön, dass du da bist 👋" : "Guten Abend 🌙";
    container.innerHTML = `
      <div class="hero-card">
        <div class="hero-greeting">${greeting}</div>
        <div class="hero-date">${formatWeekdayDate(today)}</div>
      </div>
      <div id="heuteEditor"></div>
    `;
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

  function downloadWeekCSV(weekStart) {
    const rows = [["Datum", "Wochentag", "Schritte", "Aktivität", "Pace", "Distanz (km)", "Zeit (min)", "Kalorien", "Challenge erledigt"]];
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const iso = toISO(d);
      const entry = Storage.getEntry(iso);
      const wd = WEEKDAYS_LONG[d.getDay()];
      if (!entry.activities.length) {
        rows.push([iso, wd, entry.steps ?? "", "", "", "", "", "", entry.challengeChecked ? "Ja" : "Nein"]);
      } else {
        entry.activities.forEach((a) => {
          const sport = SPORTS[a.type] || SPORTS.custom;
          const label = sport.custom && a.customName ? a.customName : sport.label;
          rows.push([iso, wd, entry.steps ?? "", label, a.pace ?? "", a.distanz ?? "", a.zeit ?? "", a.kalorien ?? "", entry.challengeChecked ? "Ja" : "Nein"]);
        });
      }
    }
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitpaw_${weekKey(weekStart)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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

  function buildDefaultPostBg() {
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1920;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, "#F7EFE6");
    grad.addColorStop(0.5, "#F1E0D6");
    grad.addColorStop(1, "#E7CBB8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(850, 220, 260, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(120, 1650, 300, 0, Math.PI * 2); ctx.fill();
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
    const prevTransform = scaler.style.transform;
    scaler.style.transform = "none";

    function restore() {
      fitPostStage();
      btn.disabled = false;
      btn.textContent = original;
    }

    try {
      html2canvas(capture, { width: 1080, height: 1920, scale: 2, backgroundColor: null, useCORS: true })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `wochenrueckblick_${weekKey(postWeekStart)}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          restore();
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
    window.addEventListener("resize", fitPostStage);
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
      const classes = ["cal-day"];
      if (d.getMonth() !== month) classes.push("other");
      if (isSameDay(d, today)) classes.push("today");
      if (iso === kalenderSelected) classes.push("selected");
      return `<button class="${classes.join(" ")}" data-date="${iso}">
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
    `;

    document.getElementById("monPrev").addEventListener("click", () => { monatAnchor = new Date(year, month - 1, 1); renderMonat(); });
    document.getElementById("monNext").addEventListener("click", () => { monatAnchor = new Date(year, month + 1, 1); renderMonat(); });
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
      await PhotoDB.remove(photo.id);
      backdrop.classList.add("hidden");
      renderFotos();
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
    const isActive = (e) => !!e && ((e.activities && e.activities.some((a) => a.type !== "restday")) || (e.steps && e.steps > 0));
    const activeDates = Object.keys(data.entries).filter((iso) => isActive(data.entries[iso])).sort();
    let longest = activeDates.length ? 1 : 0, run = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const diffDays = Math.round((fromISO(activeDates[i]) - fromISO(activeDates[i - 1])) / 86400000);
      run = diffDays === 1 ? run + 1 : 1;
      if (run > longest) longest = run;
    }
    let current = 0;
    let cursor = new Date();
    while (isActive(data.entries[toISO(cursor)])) {
      current++;
      cursor = addDays(cursor, -1);
    }
    return { current, longest };
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
      <h2 class="section-title" style="margin-top:0;">Diese Woche vs. letzte Woche</h2>
      <div class="card">${compareRows}</div>

      <h2 class="section-title">Minuten – letzte 8 Wochen</h2>
      <div class="card">${minuteBars}</div>

      <h2 class="section-title">Ø Schritte/Tag – letzte 8 Wochen</h2>
      <div class="card">${stepBars}</div>

      <h2 class="section-title">Bestwerte</h2>
      <div class="card">${bestRows}</div>

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
    `;

    const historyResults = document.getElementById("historyResults");
    const historyFilterSelect = document.getElementById("historyFilterSelect");
    renderActivityHistoryResults(historyResults, historyFilterSelect.value);
    historyFilterSelect.addEventListener("change", () => {
      renderActivityHistoryResults(historyResults, historyFilterSelect.value);
    });
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

  function buildWeightChartSVG(weights) {
    if (weights.length < 2) return null;
    const w = 300, h = 140, padX = 10, padY = 16;
    const values = weights.map((p) => p.kg);
    const min = Math.min(...values), max = Math.max(...values);
    const range = (max - min) || 1;
    const stepX = weights.length > 1 ? (w - padX * 2) / (weights.length - 1) : 0;
    const points = weights.map((p, i) => ({
      x: padX + i * stepX,
      y: padY + (h - padY * 2) * (1 - (p.kg - min) / range)
    }));
    const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
    const dots = points.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#FF4D8D"/>`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <text x="${padX}" y="12" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${max.toFixed(1)} kg</text>
      <text x="${padX}" y="${h - 4}" font-size="10" fill="#948A93" font-family="Inter, sans-serif">${min.toFixed(1)} kg</text>
      <path d="${pathD}" fill="none" stroke="#FF4D8D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  function findNearestWeightBefore(weights, isoDate) {
    let best = null;
    weights.forEach((w) => {
      if (w.date <= isoDate && (!best || w.date > best.date)) best = w;
    });
    return best;
  }

  function renderGewicht() {
    const container = document.getElementById("tab-gewicht");
    const weights = Storage.getWeights();
    const todayISO = toISO(new Date());
    const latest = weights.length ? weights[weights.length - 1] : null;
    const first = weights.length ? weights[0] : null;

    let statsHTML = `<div class="empty-hint">Noch kein Gewicht erfasst. Trag dein erstes Gewicht unten ein.</div>`;
    if (latest) {
      const totalChange = first && first.id !== latest.id ? latest.kg - first.kg : null;
      const thirtyDaysAgoISO = toISO(addDays(fromISO(latest.date), -30));
      const refPoint = findNearestWeightBefore(weights.filter((w) => w.date !== latest.date), thirtyDaysAgoISO) || findNearestWeightBefore(weights.filter((w) => w.date !== latest.date), latest.date);
      const monthChange = refPoint ? latest.kg - refPoint.kg : null;
      const fmtChange = (v) => (v == null ? "–" : `${v > 0 ? "+" : ""}${v.toFixed(1)} kg`);
      statsHTML = `
        <div class="stat-grid" style="margin-bottom:0;">
          <div class="stat-box"><div class="stat-value">${latest.kg.toFixed(1)} kg</div><div class="stat-label">AKTUELLES GEWICHT</div></div>
          <div class="stat-box"><div class="stat-value">${fmtChange(monthChange)}</div><div class="stat-label">LETZTE 30 TAGE</div></div>
        </div>
        <div class="small muted" style="margin-top:12px;">Gesamtverlauf seit ${formatShortDate(fromISO(first.date))}: <strong>${fmtChange(totalChange)}</strong></div>
      `;
    }

    const chartSVG = buildWeightChartSVG(weights);
    const chartHTML = chartSVG ? chartSVG : `<div class="chart-empty">Sobald mindestens 2 Einträge vorhanden sind, siehst du hier den Verlauf als Diagramm.</div>`;

    const historyRows = weights.length
      ? weights.slice().reverse().map((w) => `
        <div class="type-row">
          <span class="small">${formatWeekdayDate(fromISO(w.date))}</span>
          <span style="display:flex; align-items:center; gap:10px;">
            <strong>${w.kg.toFixed(1)} kg</strong>
            <button class="del-btn" data-del-weight="${w.id}" aria-label="Löschen">✕</button>
          </span>
        </div>`).join("")
      : `<div class="empty-hint">Noch keine Einträge.</div>`;

    container.innerHTML = `
      <h2 class="section-title" style="margin-top:0;">Gewicht</h2>
      <div class="card">${statsHTML}</div>

      <h2 class="section-title">Verlauf</h2>
      <div class="card chart-card">${chartHTML}</div>

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
          <button type="submit" class="btn btn-primary btn-block">Speichern</button>
        </form>
      </div>

      <h2 class="section-title">Einträge</h2>
      <div class="card">${historyRows}</div>
    `;

    document.getElementById("weightForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const dateVal = document.getElementById("weightDate").value || todayISO;
      const kgVal = parseFloat(document.getElementById("weightInput").value);
      if (!kgVal || kgVal <= 0) { showToast("Bitte ein gültiges Gewicht eingeben"); return; }
      Storage.addWeight(dateVal, kgVal);
      showToast("Gewicht gespeichert");
      renderGewicht();
    });

    container.querySelectorAll("[data-del-weight]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Storage.deleteWeight(btn.getAttribute("data-del-weight"));
        renderGewicht();
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
      </div>

      <h2 class="section-title">Tagesziele</h2>
      <div class="card">
        <div class="field">
          <label class="field-label">Schritte-Ziel</label>
          <input type="number" min="1000" step="500" id="goalStepsInput" value="${settings.stepsGoal}">
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">Wasser-Ziel (ml)</label>
          <input type="number" min="250" step="250" id="goalWaterInput" value="${settings.waterGoalMl}">
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

    document.getElementById("saveGoalsBtn").addEventListener("click", () => {
      const steps = Math.max(1000, parseInt(document.getElementById("goalStepsInput").value, 10) || DEFAULT_STEPS_GOAL);
      const water = Math.max(250, parseInt(document.getElementById("goalWaterInput").value, 10) || DEFAULT_WATER_GOAL_ML);
      Storage.saveSettings({ stepsGoal: steps, waterGoalMl: water });
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

  const renderers = { heute: renderHeute, woche: renderWoche, kalender: renderKalender, monat: renderMonat, fotos: renderFotos, challenge: renderChallenge, trends: renderTrends, gewicht: renderGewicht, einstellungen: renderEinstellungen };

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
    renderHeute();
    initServiceWorker();
  });
})();
