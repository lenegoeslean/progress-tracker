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

Der mit Abstand häufigste Grund: Die Seite wurde **nicht über die echte
GitHub-Pages-Adresse** geöffnet, sondern z. B. direkt als Datei (aus den
Dateien, per AirDrop oder als Chat-Anhang). Das erkennst du so: Schau oben
in Safari in die Adressleiste. Steht dort etwas wie
`https://dein-name.github.io/lenegoeslean/` → alles gut, das ist die
richtige Adresse. Steht dort stattdessen `file://…` oder gar nichts
Lesbares → genau das ist das Problem. In diesem Fall funktionieren weder
Icon noch Auto-Update noch das Speichern der Daten zuverlässig, weil das
alles eine „echte" Webadresse braucht, keine lokale Datei.

Prüfe daher der Reihe nach:

1. Liegt der Ordner `icons/` **komplett** (alle 5 PNG-Dateien) im
   GitHub-Repository, auf derselben Ebene wie `index.html`?
2. Ist unter **Settings → Pages** im Repository eine grüne Meldung „Your
   site is live at https://…" zu sehen?
3. Öffnest du genau diese `https://…github.io/…`-Adresse in Safari (nicht
   eine `file://`-Adresse, nicht über die GitHub-App, nicht über einen
   Datei-Anhang)?
4. Falls du die App vorher schon einmal (z. B. als FitPaw) hinzugefügt
   hattest: lösche das alte Icon vom Home-Bildschirm und füge die Seite
   über die `https://…`-Adresse erneut hinzu, damit iOS das neue Icon lädt
   (iOS cacht das Icon pro hinzugefügtem Eintrag).
5. Im Safari-Dialog „Zum Home-Bildschirm hinzufügen" zeigt die Vorschau
   oben manchmal kurzzeitig einen Screenshot der Seite statt des Icons –
   das ist nur die Dialog-Vorschau, keine Fehlfunktion. Das eigentliche
   Icon auf dem Home-Bildschirm ist danach trotzdem die Giraffe.

Wenn du magst, schick mir kurz die genaue Adresse, die bei dir in der
Safari-Adressleiste steht, wenn du die App öffnest – dann kann ich gezielt
sagen, woran es liegt.

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
🫍 Pilates · 🦒 Reformer-Pilates · 🐤 Padel · 🐼 Rest-Day

Dazu gibt es jetzt **🦄 Sonstiges**: Wählst du diese Option im
Sport-Dropdown, erscheint ein zusätzliches Textfeld, in das du einen
eigenen Namen eintragen kannst (z. B. „Klettern" oder „Tanzen"). So
kannst du auch Aktivitäten eintragen, die nicht in der festen Liste
stehen – inklusive Zeit/Kalorien und Anzeige in Liste, Wochen-/
Monatsübersicht sowie im CSV-Export.

Jede eingetragene Aktivität lässt sich über das ✎-Symbol direkt bearbeiten
(z. B. um nur die Kalorienzahl nachträglich zu ändern) – das Formular
füllt sich mit den vorhandenen Werten, du musst nicht mehr löschen und
neu eintragen. Über „Bearbeiten abbrechen" kommst du ohne Speichern
zurück in den normalen Eintragen-Modus.

## 6. Tagesziele

Auf der Heute- (und Kalender-)Seite gibt es automatische Tagesziele:

- **Schritte** (Standard: 10.000): wird automatisch als erreicht angezeigt,
  sobald du dein Ziel oder mehr Schritte einträgst – keine weitere Aktion
  nötig.
- **Wasser** (Standard: 2 Liter): kannst du in 250-ml-Schritten über die
  `+`/`−`-Buttons eintragen, oder direkt über die Checkbox „Ziel erreicht"
  komplett abhaken (setzt den Wert auf dein Wasserziel; erneutes Abwählen
  setzt ihn wieder auf 0 ml zurück).

Beide Ziele kannst du dir im Tab **Einstellungen** individuell anpassen
(siehe Abschnitt 9).

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

Außerdem enthält der Trends-Tab jetzt:

- **Challenge-Erfolge**: zeigt, wie viele Wochen-Challenges du komplett
  geschafft hast (7/7 Tage) und deine durchschnittliche Erfüllung über alle
  bisherigen Wochen. Darunter ein **Challenge-Verlauf** mit den letzten
  abgeschlossenen Wochenchallenges als kleine Fortschrittsbalken
  (🏆 markiert perfekt geschaffte Wochen) – so verschwinden vergangene
  Challenges nicht mehr einfach, sondern werden zum Erfolgserlebnis.
- **Aktivitäten durchsuchen**: ein Dropdown zum Filtern nach Sportart zeigt
  dir alle bisherigen Einträge dieser Sportart, neueste zuerst, inklusive
  „Zuletzt am …" und Gesamtanzahl. Damit findest du z. B. schnell heraus,
  wann du zuletzt schwimmen warst, ohne dich durch den Kalender zu klicken.

## 9. Einstellungen-Tab

Über das ⚙️-Symbol oben rechts im Header öffnest du den Tab
**Einstellungen**. Dort kannst du:

- **App-Namen ändern**: trägst du hier einen neuen Namen ein (Standard:
  „lenegoeslean") und speicherst, ändert sich sofort der Name im Header und
  der Browser-/App-Titel. Wichtig: Ein Icon, das du **bereits** zum
  Home-Bildschirm hinzugefügt hast, behält seine Beschriftung dort – das
  ist eine iOS-Einschränkung, iOS liest den Namen nur beim Hinzufügen ein.
  Möchtest du auch die Beschriftung auf dem Home-Bildschirm ändern: Namen
  hier speichern → altes Icon vom Home-Bildschirm löschen → Seite in
  Safari neu laden → erneut über „Zum Home-Bildschirm" hinzufügen.
- **Farbdesign wählen**: fünf Farboptionen stehen zur Auswahl – Pink
  (Standard), Lavendel, Minze, Pfirsich und Himmelblau. Ein Tipp auf eine
  Farbe wechselt das komplette App-Design sofort (Hintergrund, Akzentfarbe,
  Diagramme, Heatmap …) und wird dauerhaft gespeichert.
- **Tagesziele anpassen**: eigenes Schritte-Ziel und eigenes Wasser-Ziel
  (in ml) eintragen und mit „Speichern" übernehmen – wirkt sich sofort auf
  Heute, Kalender sowie die Fortschrittsanzeigen aus.
- **Wochenziel festlegen**: Wähle zwischen „Anzahl Trainingseinheiten"
  (Standard: 4 pro Woche) und „Aktive Minuten" (Standard: 150 pro Woche),
  oder stelle das Wochenziel ganz ab. Das Ziel erscheint dann oben im Tab
  „Woche" als Fortschrittsbalken mit Hinweis, sobald du es erreicht hast.
- **Daten sichern (Backup)**: Der Button „Backup exportieren" lädt eine
  JSON-Datei mit allen deinen Daten (Trainings, Wasser, Challenges,
  Gewicht, Einstellungen) herunter – zusätzlich zum CSV-Export in „Woche".
  Über „Backup importieren" kannst du eine zuvor exportierte JSON-Datei
  wieder einspielen (z. B. nach einem Gerätewechsel oder wenn du
  Website-Daten gelöscht hast).
- **Alle Trainingsdaten zurücksetzen**: löscht Trainings, Wasser,
  Challenges und Gewichtseinträge auf diesem Gerät unwiderruflich (nach
  Sicherheitsabfrage) – deine Einstellungen (Farbe, Ziele) bleiben dabei
  erhalten.

## 10. Coolere Wochen- und Monatsübersicht

Die Tabs „Woche" und „Monat" wurden grafisch überarbeitet:

- Eine **Aktivitäts-Mix-Leiste** zeigt auf einen Blick, wie sich deine
  Trainingszeit auf die einzelnen Sportarten verteilt (farblich nach
  Sportart).
- Ein **Balkendiagramm** stellt deine Schritte pro Tag der Woche
  übersichtlich als Säulen dar (der heutige Tag ist hervorgehoben).
- Im Tab „Monat" gibt es zusätzlich eine **Kalender-Heatmap**: Jeder Tag
  des Monats wird als Kachel eingefärbt – je dunkler/intensiver, desto
  näher warst du an deinem Schritteziel. So siehst du auf einen Blick,
  wie aktiv dein Monat war.
- Alle Diagramme passen sich automatisch an dein gewähltes Farbdesign an.

## 11. Optisches Update

Die App hat einen hochwertigeren Look bekommen: weiche Schatten und
Tiefe auf Karten, Buttons und Icons statt flacher Flächen, dezente
Farbverläufe bei Buttons, Fortschrittsbalken und den Statistik-Kacheln
(inklusive farbigem Akzentstreifen), ein Glas-/Blur-Effekt bei Header und
unterer Navigation, eigene Icons pro Tab in der Navigationsleiste sowie
sanfte Antipp-Animationen bei Buttons, Kacheln und Aktivitäten. Funktional
ändert sich dadurch nichts – alle Bedienelemente sitzen an derselben
Stelle wie zuvor.

Ein zweiter Feinschliff-Durchgang hat außerdem ergänzt: eine
Begrüßungs-Kachel oben im Tab „Heute" (je nach Tageszeit „Guten Morgen",
„Guten Abend" …), einheitliche Zahlendarstellung (Ziffern stehen jetzt
bündig statt wackelig), einen dezenten Glanz-Effekt auf Sport-Icons und
Chips, sowie einen klareren leeren Zustand bei den Wochen-Trend-Balken
(zuvor sah eine Woche ganz ohne Aktivität optisch fast wie „fast voll" aus
– die leere Balken-Schiene ist jetzt deutlich blasser).

## 12. Social-Media-Post erstellen

Im Tab „Woche" gibt es jetzt unter der Karte „Social-Media-Post" den
Button **„📸 Post erstellen"**. Er öffnet einen Editor, der aus den
echten Daten der gerade angezeigten Woche automatisch einen fertig
gestalteten Wochenrückblick im Instagram-Story-Format (1080×1920)
zusammenstellt – im festen, warmen Creme-/Braun-Design, unabhängig von
deinem gewählten App-Farbdesign.

Automatisch befüllt werden: alle Tage der Woche mit Aktivitäten,
Details (Pace/Distanz/Zeit/Kalorien) und Schritten, die
Kalorien-/Schritte-/Trainingstage-Statistik oben sowie das Fazit
("X von 7 Tagen aktiv · … kcal verbrannt · … Schritte"). Editierbar
bleiben:

- **Eyebrow, Titel und Zeitraum** der Kopfzeile
- **Gewicht** – wird automatisch aus deinen Gewichtseinträgen dieser
  Woche vorbefüllt (oder dem letzten bekannten Wert davor), lässt sich
  aber überschreiben oder leeren
- **Fazit** – standardmäßig automatisch generiert; sobald du selbst
  etwas einträgst, wird dein Text verwendet (Button „Automatisch
  generieren" setzt wieder zurück)
- **Hintergrundbild** – ist für die Woche bereits ein Progress-Foto
  gespeichert, wird es automatisch als Hintergrund verwendet, sonst ein
  dezenter Verlauf; du kannst jederzeit ein eigenes Bild wählen oder
  zurücksetzen

Mit den Pfeilen oben rechts lässt sich zwischen Wochen wechseln (die
automatisch befüllten Felder aktualisieren sich dabei, Titel und
Eyebrow bleiben erhalten). Der Button **„Als PNG herunterladen"**
erstellt das fertige Bild – bereit zum Teilen. Auch dieser Export läuft
komplett lokal auf deinem Gerät; es werden keine Daten irgendwohin
hochgeladen.

**Wichtig für iPhone/iOS:** Safari erlaubt auf iOS keinen klassischen
Datei-Download per Link – das gilt besonders innerhalb der installierten
Home-Bildschirm-App. Der Button nutzt deshalb zuerst die native
Teilen-Funktion (öffnet das iOS-Sheet mit „Bild sichern" direkt in die
Fotos). Ist das nicht verfügbar, wird das fertige Bild stattdessen
großformatig angezeigt – dann einfach **antippen und halten** und „Zu
Fotos hinzufügen" wählen. Auf dem Desktop/Android lädt der Button das
Bild wie gewohnt direkt herunter.

## 13. Social-Media-Post für den Monat

Nach demselben Prinzip gibt es im Tab „Monat" die Karte
„Social-Media-Post" mit dem Button **„📸 Monats-Post erstellen"**.
Gleiches Design und Schema wie beim Wochen-Post (warmes Creme-/
Braun-Design, automatisch aus echten Daten befüllt, Teilen-Funktion
bzw. „antippen & halten"-Fallback auf iOS) – nur im klassischen
Instagram-**Post**-Format 4:5 (1080×1350) statt im Story-Format.

Automatisch befüllt werden für den gerade angezeigten Monat:

- **Schritte** (Gesamt + Ø pro Tag mit Schritten)
- **Kalorien** (Gesamt + Trainingsstunden)
- **Aktive Tage** (echte Trainingstage) + Anzahl geloggter Ruhetage
- **Gewicht** – Veränderung über den Monat (Differenz zum letzten
  bekannten Wert davor bzw. zum ersten Eintrag des Monats) plus
  aktuellem Wert und Datum; ohne Gewichtseinträge bleibt das Feld leer
- **Top Aktivitäten** – deine häufigsten Sportarten des Monats mit
  Gesamt-Kalorien und Anzahl, weitere Sportarten als kurze Aufzählung
- **Bester Tag** – der Tag mit den meisten Schritten, inklusive der an
  diesem Tag geloggten Aktivität(en); erscheint nur, wenn im Monat
  überhaupt Schritte erfasst wurden
- **Fazit** – automatisch generiert ("X aktive Tage · … kcal verbrannt
  · … Schritte"), überschreibbar wie beim Wochen-Post

Editierbar bleiben auch hier Eyebrow, Titel, Zeitraum, Fazit und
Hintergrundbild (mit automatischem Progress-Foto des Monats, falls
vorhanden). Mit den Pfeilen oben rechts wechselst du zwischen Monaten.

## 14. Löschen mit Rückgängig-Funktion

Aktivitäten, Gewichtseinträge und Fotos werden beim Löschen nicht mehr
sofort ohne Rückfrage entfernt: Nach dem Antippen erscheint unten ein
Toast **„Aktivität gelöscht" / „Gewichtseintrag gelöscht" / „Foto
gelöscht"** mit einem **„Rückgängig"**-Button. 5 Sekunden lang lässt
sich die Löschung damit rückgängig machen, danach verschwindet der
Toast automatisch und der Eintrag ist endgültig weg. Der komplette
Reset und das Einspielen eines Backups fragen weiterhin klassisch mit
einem Bestätigungsdialog nach, da diese Aktionen viel mehr Daten auf
einmal betreffen.

## 15. Gewicht wirklich bearbeiten

Im Gewicht-Tab gibt es bei jedem Eintrag jetzt neben dem Löschen-Symbol
(✕) auch ein Bearbeiten-Symbol (✎). Antippen füllt das Formular oben
mit Datum und Wert des Eintrags, der Button wechselt zu
**„Aktualisieren"**, und ein **„Abbrechen"**-Link erscheint daneben.
So lässt sich ein Tippfehler korrigieren, ohne den Eintrag zu löschen
und neu anzulegen.

## 16. Monats- und Jahres-CSV-Export

Im Monat-Tab gibt es eine neue Karte **„Daten exportieren"** mit zwei
Buttons: **„Monat als CSV"** lädt alle Einträge des gerade angezeigten
Monats herunter, **„Jahr als CSV"** alle Einträge des gesamten Jahres.
Der wöchentliche Export (im Woche-Tab) bleibt zusätzlich bestehen. Die
Dateien heißen jetzt einheitlich `lenegoeslean_woche_…`,
`lenegoeslean_monat_…` bzw. `lenegoeslean_jahr_….csv`.

## 17. Zielgewicht

Im Gewicht-Tab kannst du oben ein **Zielgewicht** eintragen. Sobald
mindestens ein Gewichtseintrag vorhanden ist, zeigt eine Fortschrittsleiste
an, wie weit du vom Startgewicht (erster Eintrag) bis zum Ziel bereits
gekommen bist, plus Text wie „noch 2,3 kg bis zum Ziel" bzw. „Ziel
erreicht 🎉". Das Zielgewicht ist rein informativ und wird nirgendwo
sonst in der App vorausgesetzt.

## 18. Dunkelmodus

Unter Einstellungen → Farbschema gibt es jetzt „Dunkelmodus" mit den
Optionen **Automatisch** (folgt der Systemeinstellung deines iPhones,
wechselt live mit), **Immer an** und **Immer aus**. Jedes der 5
Farbschemata (Pink, Lila, Grün, Orange, Blau) hat eine eigens
abgestimmte dunkle Variante – Akzentfarbe bleibt erhalten, Hintergrund
und Textfarben wechseln auf ein dunkles, augenfreundliches Farbschema.
Die Statusleiste des iPhones passt sich beim Umschalten automatisch an.

## 19. Badges/Erfolge

Im Trends-Tab gibt es eine neue Sektion **„Erfolge"** mit 6
Erfolgs-Badges, die auf Basis deiner bereits vorhandenen
Streak-Berechnung automatisch freigeschaltet werden: 7 bzw. 30 Tage
Aktivität am Stück, 4 bzw. 12 Wochen in Folge mit erreichtem
Wochenziel, sowie Meilensteine für insgesamt geloggte aktive Tage (50
und 100 Tage). Nicht erreichte Badges werden ausgegraut angezeigt, so
siehst du auf einen Blick, was als Nächstes ansteht.

## 20. Körpermaße-Tracking

Im Gewicht-Tab gibt es unterhalb des Gewichtsverlaufs jetzt eine
eigene Sektion **„Körpermaße"**. Im Formular „Maß eintragen" wählst du
zuerst explizit die Körperstelle (Taille, Hüfte, Brust, Oberschenkel,
Bizeps), für die der Wert gilt, bevor du Datum und Wert in cm einträgst
– so ist immer klar, wofür der gerade eingegebene Wert steht, statt
sich auf eine weiter oben stehende Filterauswahl zu verlassen. Sobald
mindestens 2 Einträge für eine Stelle vorhanden sind, siehst du einen
eigenen Verlaufschart plus aktuellen Wert und Gesamtveränderung.
Einträge lassen sich wie beim Gewicht bearbeiten und löschen (inkl.
Rückgängig-Toast), jede Körperstelle führt ihren eigenen, unabhängigen
Verlauf.

## 21. Pace wird automatisch berechnet

Bei Joggen und Inline-Skaten ist das Pace-Feld jetzt kein manuelles
Eingabefeld mehr, sondern wird automatisch aus Distanz und Zeit
berechnet und live aktualisiert, sobald du eines der beiden Felder
änderst (z. B. 5,2 km in 32 Minuten → 6:09 min/km). Auch beim
nachträglichen Bearbeiten einer Aktivität wird die Pace passend zu den
gespeicherten Werten neu berechnet, damit Distanz, Zeit und Pace immer
konsistent zueinander sind.

## 22. Social-Media-Post für die Wochen-Challenge

Im Challenge-Tab gibt es jetzt ebenfalls eine Karte „Social-Media-Post"
mit dem Button **„🏆 Challenge-Post erstellen"** (erscheint aktiv,
sobald für die aktuelle Woche eine Challenge eingetragen ist). Gleiches
Design/Schema wie die anderen Posts, im Instagram-**Story**-Format
(1080×1920): großer Titel, die Challenge selbst als Zitat-Karte, eine
Tagesreihe Mo–So mit ✓/– je nachdem ob der Tag abgehakt wurde, die
Anzahl geschaffter Tage („X/7") sowie ein „Perfekte Woche!"-Abzeichen
bei 7/7. Eyebrow, Titel, Zeitraum, Challenge-Text, Fazit und
Hintergrundbild (mit automatischem Progress-Foto der Woche, falls
vorhanden) bleiben editierbar, Download läuft über dieselbe
Teilen-/„antippen & halten"-Logik wie bei den anderen Posts.

## 23. Instagram-Highlight-Cover

Ebenfalls im Challenge-Tab: **„🏷️ Highlight-Cover erstellen"** erzeugt
ein schlichtes quadratisches Titelbild (1080×1080) für deine
Instagram-Story-Highlights – groß die Beschriftung (z. B. „Woche 3"),
das App-Icon und der App-Name, sonst bewusst ohne weitere Daten, damit
es auch als kleines rundes Highlight-Icon gut aussieht. Die
Beschriftung ist frei editierbar; zwei ±-Buttons erhöhen bzw.
verringern automatisch die Zahl am Ende (z. B. „Woche 3" → „Woche 4").
Anders als die anderen Post-Generatoren ist dieser nicht an eine
bestimmte Kalenderwoche gebunden. Der Hintergrund lässt sich per
eigenem Foto ersetzen, Download läuft über dieselbe Logik wie überall.

## 24. Trendgewicht statt Tagesgewicht

Der Gewicht-Tab zeigt als Hauptwert jetzt nicht mehr den rohen
Tageswert, sondern das **Trendgewicht** – einen gleitenden Durchschnitt
über die letzten 14 Tage. Tageswerte schwanken 1–2 kg durch Wasser,
Salz oder Zyklus, ohne dass sich am eigentlichen Fortschritt etwas
ändert; der Trend zeigt die tatsächliche Entwicklung, ohne dass ein
einzelner "schlechter" Tag frustriert. Der letzte Rohwert wird darunter
weiterhin transparent angezeigt. Im Verlaufs-Chart ist die kräftige
Linie der Trend, die blassen Punkte sind die einzelnen Messungen.

## 25. Plateau-Erkennung

Ist das Trendgewicht seit mindestens 14 Tagen nahezu unverändert
(±0,3 kg), erscheint direkt im Gewicht-Tab ein einordnender Hinweis
statt einfach nichts zu sagen: Plateaus gehören zum Abnehmen dazu (z. B.
durch Wassereinlagerungen, Muskelaufbau oder eine natürliche
Verlangsamung) und bedeuten nicht, dass nichts passiert.

## 26. Streak-Freeze fürs Wochenziel

Die Wochenziel-Serie (im Trends-Tab als Badge „Zielstrebig" sichtbar)
verzeiht jetzt einmal pro Kalendermonat automatisch eine verpasste
Woche, ohne die Serie auf 0 zurückzusetzen – nach dem Vorbild von
Duolingos „Streak Freeze". Das greift automatisch bei der Berechnung,
ganz ohne manuellen Klick.

## 27. Ziel-Datum-Prognose

Ist ein Zielgewicht hinterlegt, rechnet die App im Gewicht-Tab aus dem
aktuellen Trendtempo hoch, wann du dein Ziel bei gleichbleibendem Tempo
ungefähr erreichst ("Ziel erreicht am ca. …"). Bewegt sich der Trend
gerade nicht in Richtung Ziel oder ist er zu flach für eine seriöse
Schätzung, bleibt die Prognose bewusst weg, statt eine irreführende
Zahl zu zeigen.

## 28. Neue Tagesziele: Liegestütze, Plank, Stretching

Im Heute-Tab (und im Kalender-Editor) gibt es drei neue Tagesziele,
analog zu Schritten und Wasser:

- **💪 Liegestütze am Stück** – wie viele du geschafft hast, mit
  konfigurierbarem Tagesziel (Standard: 20).
- **🧍 Plank** – Sekundenzahl, mit konfigurierbarem Tagesziel (Standard:
  60 Sekunden).
- **🧘 5 Min Stretching** – einfacher Haken, ob du heute gedehnt hast.

Die Ziele für Liegestütze und Plank lassen sich unter Einstellungen →
Tagesziele anpassen. Alle drei Werte werden auch im CSV-Export
mitgeliefert.

## 29. Giraffen-Begleiter

Statt nur Zahlen anzustarren, hast du jetzt ein App-Maskottchen im
Heute-Tab, das sich mit deiner Konsistenz weiterentwickelt – nach dem
Prinzip von Apps wie Finch oder Habitica, bei denen ein Charakter durch
echte Gewohnheiten wächst statt nur eine Statistik zu optimieren.

- **4 Wachstumsstufen**, abhängig von deinen insgesamt aktiven Tagen:
  Baby-Giraffe (ab 0 Tagen) → Junge Giraffe (ab 7) → Erwachsene Giraffe
  (ab 30) → Stolze Giraffe mit Krone (ab 100).
- **Stimmung**: traurig, wenn deine aktuelle Streak gerissen ist,
  fröhlich, wenn du heute schon etwas eingetragen hast, sonst neutral
  wartend.
- **18 Accessoires in 6 Kategorien zum Freischalten** (siehe Abschnitt 36
  für die ausführliche Garderobe), gekoppelt an echte, ohnehin berechnete
  Werte wie Streak-Rekord oder aktive Tage – ausgegraut/gesperrt, solange
  sie noch nicht verdient sind.
- **Die Giraffe trägt ihre Belohnungen wirklich**: sobald ein Accessoire
  freigeschaltet ist, erscheint es direkt am Giraffen-Bild selbst –
  Kopfschmuck, Halsschmuck (oben und als Schal), Brille, Blume am Ohr,
  Medaille auf der Brust. Kopfschmuck entfällt bei der "Stolzen Giraffe",
  weil dort schon die Krone sitzt. Beim allerersten Freischalten eines
  Accessoires gibt's zusätzlich einen kurzen Feier-Hinweis ("Deine Giraffe
  hat ein neues Outfit bekommen: 🎀 …"). Die Giraffe selbst (Form,
  Wachstumsstufen, Stimmung) bleibt unverändert.

## 30. Datenkunst-Generator

Im Trends-Tab erzeugt die App aus deinen letzten 12 Wochen ein
abstraktes, sich veränderndes Muster – ein digitales "Andenken" an
deinen Fortschritt statt eines klassischen Charts, das du dir per Klick
als Bild speichern oder teilen kannst.

- Jeder **Strahl** steht für eine Woche, seine **Länge** für die Anzahl
  aktiver Tage in dieser Woche.
- Die **Farbe** zeigt die Gewichtsrichtung dieser Woche (🟢 runter · 🟣
  stabil · 🟠 hoch).
- Der **leuchtende Kern** in der Mitte wächst mit deiner aktuellen
  Streak, die kleinen **Funken** zählen deine freigeschalteten Erfolge.
- Export per "🖼️ Als Bild speichern" – auf iOS über das Teilen-Menü
  bzw. "Bild sichern" (gleiches Verfahren wie bei den anderen
  Social-Media-Posts), sonst als direkter Download.

## 31. Chaos-Modus

An ca. jedem 3. Tag (deterministisch aus dem Datum berechnet, würfelt
also nicht bei jedem Neuladen neu) zeigt der Heute-Tab statt der
gewohnten Routine eine unerwartete kleine "Chaos-Challenge des Tages" –
bewusste Unberechenbarkeit gegen Monotonie, z. B. "Rückwärts zählen
beim Plank" oder "2 Minuten zu deinem Lieblingssong tanzen". Ein Haken
markiert sie als gemeistert. Lässt sich unter Einstellungen →
Chaos-Modus jederzeit deaktivieren.

## 32. Nachrichten an dich selbst

Unter Einstellungen → Nachrichten an dich selbst kannst du dir Notizen
schreiben – dein eigenes "Warum", eingefroren für später. Erkennt die
App eine schwierige Phase (eine bestehende Streak von mindestens 3
Tagen ist gerade gerissen), taucht automatisch eine dieser Nachrichten
im Heute-Tab auf. Ein Klick auf "Danke, gelesen" blendet sie für den
Tag aus; die Nachrichten selbst lassen sich jederzeit verwalten und
löschen.

## 33. Streak-Logik überarbeitet: Gnadenzeit für den heutigen Tag

Die Streak (Giraffe, "Nachricht an dich selbst") reißt jetzt wirklich
erst, wenn ein bereits **vergangener** Tag komplett ohne Eintrag
geblieben ist – nicht mehr schon dann, wenn der heutige Tag noch
einfach nicht befüllt ist. Solange heute noch offen ist, zählt die
Streak einfach ab dem letzten Tag mit Eintrag weiter, ohne auf 0 zu
springen.

Da die Streak bei jedem Aufruf frisch aus den gespeicherten Tagen
berechnet wird (es gibt keinen separat gespeicherten "gerissen"-Status),
stellt ein **nachträglicher Eintrag** für einen verpassten Tag die
Streak automatisch wieder her, sobald die Lücke geschlossen ist.

Die bestehende **Streak-Freeze** (ein verpasster Wochenziel-Joker pro
Monat, siehe Abschnitt 26) ist davon unabhängig – sie betrifft nur den
separaten *Wochenziel*-Streak hinter dem "Zielstrebig"-Badge, nicht
diese tägliche Aktivitäts-Streak. Für die tägliche Streak gilt jetzt
bewusst eine strengere Regel: Sie verzeiht keine echten Lücken, sondern
reißt nur nicht mehr fälschlich wegen eines noch nicht abgeschlossenen
heutigen Tages.

## 34. Active Recovery & Rest-Days zählen für die Streak

Neue Sportart **🦥 Active Recovery** für lockere Bewegung, die kein
richtiges Workout, aber auch keine echte Pause ist (z. B. entspannter
Spaziergang, sanftes Dehnen).

Außerdem zählt ein eingetragener **Rest-Day** jetzt selbst zur Streak
dazu, statt sie zu unterbrechen – die Streak reißt wirklich nur noch,
wenn an einem Tag *gar nichts* eingetragen wurde. Damit das nicht zum
Schlupfloch wird, sind **maximal 2 Rest-Days pro Kalenderwoche**
erlaubt; ein dritter wird beim Eintragen blockiert.

## 35. Plan-Funktion

Im Kalender- und im Heute-Tab gibt es jetzt einen Bereich "📅 Geplant",
in dem du dir (auch für zukünftige Tage) vormerken kannst, was ansteht
– z. B. "Joggen" mit einer Notiz wie "5 km, locker". Ein Plan ist rein
informativ und wird **nicht automatisch** als Aktivität gewertet oder in
deine Statistiken übernommen – dafür trägst du die Aktivität wie gewohnt
im Abschnitt "Aktivitäten" ein, sobald sie wirklich stattgefunden hat.
Steht für heute etwas im Plan, taucht das automatisch oben auf dem
Heute-Tab auf ("Joggen ist geplant"). Pläne lassen sich jederzeit über
das ✕ wieder entfernen.

## 36. Erweiterte Garderobe für die Giraffe: mehr Accessoires, frei wählbar

Die Giraffen-Accessoires (Abschnitt 29) wurden deutlich ausgebaut:

- **6 Kategorien ("Slots")**, jede mit **3 Stufen** – insgesamt 18
  Accessoires statt vorher 6:
  - **Blume am Ohr**: Blüte 🌸 → Kleeblatt 🍀 → Schmetterling 🦋
    (perfekte Challenge-Wochen)
  - **Kopfschmuck**: Käppi 🧢 → Zylinder 🎩 → Partyhut 🎉
    (aktive Tage insgesamt)
  - **Hals oben**: Bandana 🎀 → Fliege 🔷 → Glitzer-Halsband ✨
    (Streak-Rekord in Tagen)
  - **Brille**: Sonnenbrille 🕶️ → Herzbrille 💕 → Stern-Brille ⭐
    (Streak-Rekord in Tagen)
  - **Schal**: Schal 🧣 → Winterschal 🌟 → Regenbogenschal 🌈
    (Wochen mit erreichtem Wochenziel in Folge)
  - **Medaille**: Bronze 🥉 → Gold 🏅 → Pokal 🏆
    (geloggte Trainingseinheiten insgesamt)
- **Selbst aussuchen, was die Giraffe trägt**: über den neuen Button
  "🎨 Giraffe ausstatten" unter dem Giraffen-Bild öffnet sich eine
  Übersicht mit allen 6 Kategorien. Pro Kategorie lässt sich per Klick
  wählen, welche freigeschaltete Stufe getragen wird – oder "Ohne", falls
  du in dem Slot lieber nichts tragen möchtest. Noch gesperrte Stufen
  sind ausgegraut mit 🔒 und zeigen beim Antippen (Tooltip), wie viel bis
  zur Freischaltung fehlt.
  - Ohne eigene Auswahl trägt die Giraffe automatisch die jeweils
    höchste bereits freigeschaltete Stufe pro Kategorie – die Garderobe
    ist also von Anfang an sinnvoll bestückt, ohne dass du etwas
    einstellen musst.
  - Deine Auswahl wird gespeichert und bleibt auch nach dem
    Schließen/Neuladen der App erhalten.
- Der Feier-Hinweis beim ersten Freischalten funktioniert für alle 18
  Accessoires, unabhängig davon, was gerade ausgestattet ist.

## Mögliche nächste Schritte

Ein paar Ideen, mit denen wir die App als Nächstes weiter ausbauen könnten:

- **Wiederkehrende Pläne** – die Plan-Funktion (Abschnitt 35) deckt bisher
  nur einzelne Tage ab; eine Vorlage wie "jeden Montag Krafttraining", die
  sich automatisch für kommende Wochen einträgt, wäre der nächste Schritt
- **Erinnerungen/Push-Benachrichtigungen** (auf iOS als installierte PWA
  aktuell technisch eingeschränkt, aber z. B. eine sanfte "heute noch
  nichts eingetragen"-Erinnerung beim App-Öffnen wäre schon ohne Push
  möglich)
- **Passwortschutz oder Face-ID-Sperre** für die App
- **Foto-Vergleich** – zwei Progress-Fotos aus unterschiedlichen Monaten
  nebeneinander anzeigen (Vorher/Nachher-Ansicht) statt nur der
  Einzelansicht
- **Erweiterte CSV-Auswertung** – ein "Alle Daten (gesamter Verlauf)"-Export
  zusätzlich zu Woche/Monat/Jahr
- **Nicht-Skalen-Erfolge (Non-Scale Victories)** – ein Log für Fortschritte
  ohne Waagenbezug (Hose sitzt lockerer, mehr Energie, Sport-PR)
- **Recomposition-Hinweis** – automatisch erkennen, wenn Gewicht stabil,
  aber ein Körpermaß (z. B. Taille) rückläufig ist
- **Vorher/Nachher-Foto-Vergleich mit Schieberegler**
- Cloud-Sync, falls du die App später doch auf mehreren Geräten nutzen
  möchtest
