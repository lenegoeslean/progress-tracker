# lenegoeslean – dein Fitness-Tracker 🦒

Eine kleine, installierbare Web-App (PWA) für dein iPhone. Läuft komplett
im Browser, speichert alle Daten **nur lokal auf deinem iPhone** und
aktualisiert sich beim Öffnen automatisch, sobald du eine neue Version
auf GitHub hochlädst.

## Dateien in diesem Projekt

| Datei | Zweck |
|---|---|
| `index.html` | Grundgerüst der App |
| `app.js` | Gesamte Logik (Tabs, Speicherung, Kalender, Fotos …) |
| `manifest.json` | Macht die App auf dem iPhone installierbar |
| `sw.js` | Service Worker – sorgt für Offline-Fähigkeit & Auto-Update |
| `icons/` | App-Icons |

## 1. Auf GitHub hochladen

1. Erstelle auf [github.com](https://github.com) ein neues **öffentliches** Repository, z. B. `lenegoeslean`.
   (Öffentlich ist unproblematisch – es werden nur die leeren App-Dateien
   veröffentlicht, deine persönlichen Trainingsdaten bleiben ausschließlich
   auf deinem iPhone gespeichert und werden nie hochgeladen.)
2. Lade **alle Dateien dieses Ordners** (`index.html`, `app.js`,
   `manifest.json`, `sw.js`, den Ordner `icons/`) in das Repository hoch
   (per Drag & Drop auf GitHub im Browser, oder per `git push`).
3. Gehe im Repository auf **Settings → Pages**.
4. Wähle bei „Source" den Branch `main` und den Ordner `/ (root)` aus und
   speichere.
5. Nach ein bis zwei Minuten ist deine App erreichbar unter:
   `https://<dein-github-name>.github.io/<repo-name>/`

## 2. Auf dem iPhone installieren

1. Öffne den Link aus Schritt 5 in **Safari** auf deinem iPhone (wichtig:
   nur Safari unterstützt die Installation, nicht Chrome o. Ä.).
2. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben).
3. Wähle **„Zum Home-Bildschirm"**.
4. Bestätige mit **„Hinzufügen"**.

Jetzt hast du ein lenegoeslean-Icon (die Giraffe) auf deinem Home-Bildschirm,
das sich wie eine normale App öffnet (ohne Safari-Adressleiste).

**Warum sehe ich beim „Zum Home-Bildschirm hinzufügen" evtl. noch kein
eigenes Icon?**

- Am häufigsten liegt es daran, dass die App noch nicht über die echte
  GitHub-Pages-Adresse geöffnet wurde (z. B. nur lokal als Datei geöffnet,
  oder die `icons/`-Dateien wurden nicht mit hochgeladen). Prüfe, dass der
  Ordner `icons/` komplett im Repository liegt und lade die Seite in Safari
  einmal frisch über die `https://…github.io/…`-Adresse.
- Im Safari-Dialog „Zum Home-Bildschirm hinzufügen" zeigt die Vorschau oben
  manchmal kurzzeitig einen Screenshot der Seite statt des Icons – das ist
  nur die Dialog-Vorschau. Das eigentliche Icon auf deinem Home-Bildschirm
  ist danach trotzdem die Giraffe.
- Falls du die App vorher schon einmal (z. B. als FitPaw) hinzugefügt
  hattest: lösche das alte Icon vom Home-Bildschirm und füge die Seite
  erneut hinzu, damit iOS das neue Icon lädt (iOS cacht das Icon pro
  hinzugefügtem Eintrag).

## 3. Updates ausrollen

Wenn du später etwas an der App änderst (z. B. neue Sportarten): Lade die
geänderten Dateien einfach erneut auf GitHub hoch (Datei ersetzen). Sobald
du die App auf deinem iPhone das nächste Mal mit Internetverbindung
öffnest, erkennt sie automatisch die neue Version und lädt sich einmal
neu – du musst nichts weiter tun.

> Hinweis: iOS prüft Service-Worker-Updates nur, wenn die App aktiv
> geöffnet wird. Solltest du eine Änderung mal nicht sofort sehen, schließe
> die App komplett (im App-Wechsler nach oben wischen) und öffne sie erneut.

**Bleiben meine Daten (Workouts, Gewicht, Fotos …) bei einem Update
erhalten?** Ja, automatisch – du musst dafür nichts einstellen. Der
Service Worker aktualisiert nur die App-Dateien (HTML/JS/Icons), niemals
deine gespeicherten Daten. Deine Trainings-, Wasser-, Challenge- und
Gewichtsdaten liegen im `localStorage` deines iPhones, deine Fotos in
IndexedDB – beides ist komplett getrennt vom Service-Worker-Cache und wird
bei einem Update nie gelöscht oder überschrieben. Wichtig ist nur, dass du
immer **dieselbe GitHub-Pages-Adresse** (also denselben Repository-Namen)
weiter benutzt – Browser speichern Daten pro Adresse. Solange du den
Repo-Namen nicht änderst, bleiben alle Daten bei jedem zukünftigen Update
erhalten.

## 4. Wichtig: Datensicherung

Alle Trainingsdaten, Schritte, Challenges und Fotos werden **ausschließlich
lokal im Browser-Speicher deines iPhones** gespeichert – es gibt keinen
Server und kein Konto. Das bedeutet:

- Die Daten sind nur auf diesem einen Gerät verfügbar.
- Wenn du Safari-Website-Daten löschst, die App deinstallierst oder das
  Gerät wechselst, gehen die Daten verloren, sofern kein Backup existiert.
- Nutze deshalb regelmäßig den **Download-Button im Tab „Woche"**, um deine
  Daten als CSV-Datei zu sichern.

## 5. Über die Sportarten-Icons

Jede Sportart hat eine eigene Pastellfarbe und ein Tier-Icon:

🐇 Joggen · 🦊 Incline-Walk · 🦖 Inline-Skaten · 🦁 Zirkel-Training ·
🐝 Cycling · 🦈 Schwimmen · 🐻 Home-Workout · 🐒 Hula-Hoop ·
🫍 Pilates · 🦒 Reformer-Pilates · 🐼 Rest-Day

## 6. Tagesziele

Auf der Heute- (und Kalender-)Seite gibt es jetzt automatische Tagesziele:

- **10.000 Schritte**: wird automatisch als erreicht angezeigt, sobald du
  10.000 oder mehr Schritte einträgst – keine weitere Aktion nötig.
- **2 Liter Wasser**: kannst du in 250-ml-Schritten über die `+`/`−`-Buttons
  eintragen, oder direkt über die Checkbox „Ziel erreicht" komplett
  abhaken (setzt den Wert auf 2.000 ml; erneutes Abwählen setzt ihn wieder
  auf 0 ml zurück).

## 7. Gewicht-Tab

Im Tab „Gewicht" kannst du dein Gewicht für ein beliebiges Datum eintragen
(auch rückwirkend). Du siehst dort dein aktuelles Gewicht, die Veränderung
der letzten 30 Tage, den Gesamtverlauf seit deinem ersten Eintrag sowie ein
Diagramm, sobald mindestens zwei Einträge vorhanden sind. Auch diese Daten
bleiben rein lokal auf deinem iPhone gespeichert.

## 8. Trends-Tab

Im Tab „Trends" siehst du automatisch berechnete Auswertungen auf Basis
deiner bisherigen Einträge: aktuelle Woche im Vergleich zur Vorwoche,
Minuten- und Schritte-Verlauf der letzten 8 Wochen, persönliche Bestwerte
(längste Strecke, schnellste Pace, meiste Kalorien in einer Einheit,
aktuelle & längste Aktiv-Serie) sowie deine beliebtesten Sportarten. Alles
wird live aus deinen lokal gespeicherten Daten berechnet, es gibt keinen
zusätzlichen Speicherort.

## Mögliche nächste Schritte

Ein paar Ideen, mit denen wir die App als Nächstes weiter ausbauen könnten:

- Zusätzliche Körpermaße (z. B. Taille, Hüfte) mit eigenem Verlauf
- Individuell einstellbare Ziele (z. B. eigenes Schritte- oder Wasserziel statt der festen 10.000/2 L)
- Erinnerungen/Push-Benachrichtigungen (auf iOS aktuell technisch eingeschränkt)
- Passwortschutz oder Face-ID-Sperre für die App
- Motivierende Kurznachrichten/Badges bei Streaks oder erreichten Zielen
- Cloud-Sync, falls du die App später doch auf mehreren Geräten nutzen möchtest
