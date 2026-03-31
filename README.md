# 📦 Privates Lagerverwaltungssystem

Ein schlankes, mobiles Lagerverwaltungssystem für graue Euroboxen — vollständig auf GitHub gehostet, kein eigener Server erforderlich.

## Funktionsweise

- Jede Box hat einen eindeutigen QR-Code, der direkt zur Box-Ansicht in der App führt
- Fotos werden per KI (GPT-4o) analysiert und der Inhalt automatisch erkannt
- Alle Box-Inhalte werden als menschenlesbare `.md`-Dateien in diesem Repository gespeichert
- Die App läuft als statische Website über GitHub Pages

---

## Einrichtung (einmalig, ca. 10 Minuten)

### Schritt 1 — Repository vorbereiten

```bash
# Klone dein Repository
git clone https://github.com/digitalyours/private-warehouse.git
cd private-warehouse

# Kopiere alle Dateien aus dem heruntergeladenen ZIP hierher
# Dann:
git add .
git commit -m "🚀 Lagerverwaltungssystem initialisiert"
git push origin main
```

> ⚠️ Lösche die Datei `boxes/BOX-000.md` vor dem Push (falls vorhanden) — sie ist ein Artefakt der Erstellung.

---

### Schritt 2 — GitHub Pages aktivieren

1. Öffne dein Repository auf GitHub
2. Klicke auf **Settings** → **Pages**
3. Unter **Source**: Branch `main`, Ordner `/ (root)`
4. Klicke **Save**
5. Nach 1–2 Minuten ist die App erreichbar unter:
   **`https://digitalyours.github.io/private-warehouse/`**

---

### Schritt 3 — OpenAI API-Key hinterlegen

1. Öffne [platform.openai.com](https://platform.openai.com) und erstelle einen API-Key
2. Gehe im Repository zu **Settings → Secrets and variables → Actions**
3. Klicke **New repository secret**
4. Name: `OPENAI_API_KEY`
5. Value: Deinen API-Key einfügen
6. **Add secret** klicken

---

### Schritt 4 — GitHub Personal Access Token (PAT) erstellen

Der PAT erlaubt der App, Box-Inhalte direkt in GitHub zu speichern.

1. Gehe zu [github.com/settings/tokens](https://github.com/settings/tokens)
2. Klicke **Generate new token (classic)**
3. Name: `Lagerverwaltung`
4. Ablaufzeit: Nach Wunsch (empfohlen: 1 Jahr)
5. Berechtigung: ✅ **public_repo**
6. Token kopieren

**In der App:**
1. Öffne `https://digitalyours.github.io/private-warehouse/`
2. Tippe auf ⚙️ **Einstellungen**
3. Füge den PAT ein und tippe **Speichern & Verbinden**

---

### Schritt 5 — QR-Codes drucken

1. Öffne die App → ⚙️ Einstellungen → **QR-Codes anzeigen**
2. Tippe auf 🖨️ (oben rechts)
3. Drucke alle 10 QR-Codes
4. Klebe jeden Code auf die entsprechende Eurobox

---

## Benutzung

### Artikel per Foto hinzufügen

1. QR-Code auf der Box scannen (oder Box in der App antippen)
2. 📷 **Foto aufnehmen** tippen
3. Foto der Box-Inhalte aufnehmen
4. GPT-4o analysiert das Bild (30–60 Sek.)
5. Erkannte Artikel bestätigen/bearbeiten
6. **Speichern** — Artikel werden in `boxes/BOX-XXX.md` gespeichert

### Artikel manuell hinzufügen

1. Box öffnen → ✏️ **Manuell** tippen
2. Artikelname eingeben → **Hinzufügen**

### Suchen

Auf der Startseite im Suchfeld nach Box-Name, Label oder Artikel suchen.

---

## Dateistruktur

```
/
├── index.html              ← Mobile-first Web-App (Deutsch)
├── boxes/
│   ├── BOX-001.md          ← Inhalt der Box 1
│   ├── BOX-002.md
│   └── ...                 ← (bis BOX-010.md)
├── incoming/
│   └── .gitkeep            ← Temporäre Bilder (werden nach Analyse gelöscht)
├── results/
│   └── .gitkeep            ← KI-Ergebnisse (werden nach Abruf gelöscht)
└── .github/workflows/
    └── analyze-image.yml   ← GitHub Action: GPT-4o Bildanalyse
```

### Box-Dateiformat (menschenlesbar)

```markdown
# BOX-001

**Label:** Winterkleidung

## Inhalt

- Winterjacke blau (2024-01-15)
- Skihandschuhe schwarz (2024-01-15)
- Wollmütze rot (2024-01-20)

---
*Zuletzt aktualisiert: 15.01.2024*
```

---

## Technische Architektur

```
[Mobiltelefon / Browser]
       │
       ├─► GitHub Pages (index.html) — statische App, kein Server
       │
       ├─► GitHub REST API — Lesen & Schreiben von .md Dateien
       │       (PAT-authentifiziert, direkt im Browser)
       │
       └─► GitHub Actions (workflow_dispatch)
               │
               ├─► Bild aus incoming/ lesen
               ├─► OpenAI GPT-4o Vision API aufrufen
               └─► Ergebnis in results/{id}.json speichern
                       └─► App pollt alle 5s bis Ergebnis vorliegt
```

**Kosten:** Nur OpenAI API-Nutzung (ca. $0.005–0.01 pro Foto-Analyse).

---

## Häufige Fragen

**Die KI-Analyse dauert sehr lange?**
GitHub Actions braucht ~30–60s um die Workflow-Infrastruktur zu starten. Das ist normal.

**Artikel werden doppelt hinzugefügt?**
Die App prüft auf Duplikate (case-insensitive). Wenn ein Artikel unter leicht verschiedenem Namen existiert, kann er doppelt erscheinen — einfach manuell löschen.

**Kann ich mehr als 10 Boxen haben?**
Ja! In `index.html` die Zeile `boxes: Array.from({length: 10, ...` auf die gewünschte Anzahl ändern und neue `.md` Dateien anlegen.

**Funktioniert die App auch offline?**
Nein — GitHub API und Bildanalyse erfordern eine Internetverbindung.

---

*Erstellt mit Claude (Anthropic)*
