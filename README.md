# FitPaw – dein Fitness-Tracker 🐾

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

1. Erstelle auf [github.com](https://github.com) ein neues **öffentliches** Repository, z. B. `fitpaw`.
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

Jetzt hast du ein FitPaw-Icon auf deinem Home-Bildschirm, das sich wie
eine normale App öffnet (ohne Safari-Adressleiste).

## 3. Updates ausrollen

Wenn du später etwas an der App änderst (z. B. neue Sportarten): Lade die
geänderten Dateien einfach erneut auf GitHub hoch (Datei ersetzen). Sobald
du die App auf deinem iPhone das nächste Mal mit Internetverbindung
öffnest, erkennt sie automatisch die neue Version und lädt sich einmal
neu – du musst nichts weiter tun.

> Hinweis: iOS prüft Service-Worker-Updates nur, wenn die App aktiv
> geöffnet wird. Solltest du eine Änderung mal nicht sofort sehen, schließe
> die App komplett (im App-Wechsler nach oben wischen) und öffne sie erneut.

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

🐇 Joggen · 🦩 Inline-Skaten · 🦁 Zirkel-Training · 🐝 Cycling ·
🐬 Schwimmen · 🐨 Home-Workout · 🐒 Hula-Hoop · 🦢 Pilates ·
🦄 Reformer-Pilates · 🐼 Rest-Day

## Mögliche nächste Schritte

Ein paar Ideen, mit denen wir die App als Nächstes weiter ausbauen können:

- Eigener App-Name/Icon-Feinschliff
- Erinnerungen/Push-Benachrichtigungen (auf iOS aktuell technisch eingeschränkt)
- Zusätzliche Auswertungen/Diagramme
- Passwortschutz oder Face-ID-Sperre für die App
- Cloud-Sync, falls du die App später doch auf mehreren Geräten nutzen möchtest
