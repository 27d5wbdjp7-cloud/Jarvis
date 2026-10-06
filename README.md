# Jarvis – dein persönlicher Assistent mit Gedächtnis

Eine installierbare Web-App (PWA) fürs Handy und den PC. Jarvis spricht mit dir über Beruf, Firma, Finanzen, Projekte und Alltag, merkt sich alles Wichtige und hat es in jedem Gespräch im Kopf. Angetrieben von Claude (Anthropic API).

**Gedächtnis und Verlauf bleiben auf deinem Gerät.** Es gibt keinen eigenen Server: Nachrichten gehen direkt an `api.anthropic.com`, und dein Gedächtnis liegt im Browser-Speicher (IndexedDB). Die einzige weitere Gegenstelle ist der Sprachdienst deines Geräts, wenn du diktierst oder vorlesen lässt.

## Was Jarvis kann

- **Chat mit Gedächtnis**: Profil, Fakten (nach Kategorien: Firma, Finanzen, Projekte, Personen, Ziele …), Projekte, Aufgaben und Tagebuch fließen in jede Antwort ein. Jarvis speichert selbstständig, was du ihm erzählst.
- **Sprechen statt tippen**: Mikrofon-Taste für Spracheingabe, Vorlesen der Antworten, optional „Freisprechen“ (hört nach dem Vorlesen automatisch wieder zu). Auf dem Handy fügt die Return-Taste eine neue Zeile ein; gesendet wird mit dem Pfeil. In der installierten iPhone-App ist die Mikrofon-Taste nicht verfügbar; dort das Mikrofon der Tastatur nutzen („Spracheingabe erneut versuchen“ unter *Mehr*, falls sie wieder funktioniert).
- **Gefundene Fakten prüfen**: Beim Einspeisen zeigt Jarvis alle gefundenen Einträge zur Auswahl, bevor sie gespeichert werden.
- **Heute**: Tages-Check-in, Abend-Reflexion, Wochenrückblick, fällige Aufgaben, aktive Projekte, Tagebuch.
- **Wissen einspeisen**: Texte einfügen oder PDFs, Bilder und Textdateien hochladen. Jarvis zieht die Fakten heraus und sortiert sie ein.
- **Gedächtnis aufräumen**: Doppeltes zusammenführen, Veraltetes archivieren.
- **Backup**: Alle Daten als Textdatei (`jarvis-backup-….txt`, JSON-Inhalt) sichern und wiederherstellen; beim Laden wahlweise zusammenführen (neuere Einträge gewinnen) oder ersetzen.

## Einrichtung (einmalig)

1. **API-Schlüssel holen**: Auf [console.anthropic.com](https://console.anthropic.com) ein Konto anlegen, unter *Billing* Guthaben aufladen (z. B. 20 $), unter *API Keys* einen Schlüssel erstellen (`sk-ant-…`). Der Schlüssel wird nur im Browser deines Geräts gespeichert. Tipp: Lege in der Console einen eigenen *Workspace* „Jarvis“ mit monatlichem Ausgabenlimit an und erstelle den Schlüssel darin, dann kann nichts aus dem Ruder laufen.
2. **App veröffentlichen**: Der Ordner muss über **HTTPS** erreichbar sein, sonst funktionieren Installation, Mikrofon und Offline-Betrieb nicht. Kostenlose Möglichkeiten:
   - **GitHub Pages**: Repository anlegen, Dateien hochladen, unter *Settings → Pages* den Branch `main` veröffentlichen. Achtung: Alle Pages-Seiten eines GitHub-Kontos teilen sich die Adresse `<name>.github.io` und damit den Browser-Speicher (API-Schlüssel, Gedächtnis). Veröffentliche unter diesem Konto nichts anderes oder nutze eine eigene Domain.
   - **Cloudflare Pages** oder **Netlify**: Ordner per Drag-and-drop hochladen.
3. **Auf dem Handy installieren**:
   - **iPhone**: Link in **Safari** öffnen → Teilen-Symbol → *Zum Home-Bildschirm*.
   - **Android**: Link in **Chrome** öffnen → Menü ⋮ → *App installieren* (oder den Knopf in der App unter *Mehr*).
4. Beim ersten Start Namen und API-Schlüssel eintragen. Fertig.

Wichtig: Name, Icon und Adresse der App stehen nach der ersten Installation fest. Die App-Identität wird aus der Installationsadresse abgeleitet und darf später nicht geändert werden. Erst die endgültige Adresse wählen, dann installieren.

## Lokal ausprobieren (PC)

```bash
python -m http.server 8765
```

Dann `http://localhost:8765` im Browser öffnen. (Auf `localhost` funktionieren Mikrofon und Service Worker auch ohne HTTPS.)

## Kosten

Jede Nachricht kostet je nach Länge des Gedächtnisses wenige Cent. Die App zeigt unter *Mehr* eine Schätzung der Tageskosten an und nutzt Prompt-Caching, damit das Gedächtnis nicht bei jeder Nachricht voll berechnet wird. Modell und Denktiefe sind einstellbar (Opus 5.5 ist am klügsten, Haiku 4.5 am günstigsten).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Oberfläche |
| `app.js` | Logik: Speicher, Gedächtnis, Claude-API, Werkzeuge, Sprache |
| `styles.css` | Gestaltung (dunkel/hell) |
| `sw.js` | Service Worker (Offline-Shell, Updates) |
| `manifest.webmanifest` | App-Manifest (Name, Icons, Installation) |
| `icons/` | App-Icons (erzeugt mit `tools/make_icons.py`) |
| `fonts/` | Selbst gehostete Schriften (SIL Open Font License) |

## Sicherheit und Datenschutz

- Der API-Schlüssel liegt im `localStorage` des Geräts und wird ausschließlich an `api.anthropic.com` gesendet. Teile die installierte App bzw. den Browser nicht mit anderen.
- Backups enthalten dein gesamtes Gedächtnis (ohne API-Schlüssel). Bewahre sie sicher auf.
- Eingespeiste Dokumente werden an Anthropic zur Auswertung gesendet, aber nicht dauerhaft dort gespeichert (siehe Anthropics Datenschutzbedingungen für API-Nutzung).
- Keine Passwörter, PINs oder vollständige Kontonummern einspeisen.
- Spracheingabe nutzt die Spracherkennung des Browsers/Geräts (Chrome/Android: Google; iPhone: Apple-Diktat); Gesprochenes wird dorthin gesendet. Beim Vorlesen mit einer „online“-Stimme geht der Text an deren Anbieter; Standard ist eine Gerätestimme.
- Unter `<name>.github.io` teilen sich alle deine Pages-Projekte den Browser-Speicher; veröffentliche dort nichts anderes.
