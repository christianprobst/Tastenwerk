# Tastenwerk

10-Finger-Schreibtrainer im Browser – statische Seite ohne Build-Schritt und ohne Abhängigkeiten.
Der Fortschritt wird nur im Browser gespeichert (`localStorage`).

## Funktionen

- 15 aufeinander aufbauende Lektionen (Grundstellung bis Zahlen), je 4 Übungen: neue Tasten, Kombinationen, Wörter, Text
- Bewertung mit bis zu 3 Sternen nach Fehlerquote (bestanden ab höchstens 2 % Fehlern)
- Tempotest (1, 3 oder 5 Minuten) mit Verlauf der letzten Ergebnisse
- Eigener Text zum Abtippen
- Chronik aller abgeschlossenen Übungen mit Datum, Anschlägen und Fehlern (die letzten 500)
- Bildschirmtastatur mit Fingerfarben und Hinweis, welcher Finger die nächste Taste drückt
- Tastaturlayouts: Schweiz (QWERTZ CH) und Deutschland
- Optionen: bei Fehler anhalten, Fingerfarben, Schreibmaschinenton
- Hell- und Dunkelmodus, auch auf dem Handy nutzbar

## Aufbau

```
index.html      Seitenstruktur (HTML)
css/style.css   Gestaltung, Farben für hell/dunkel
js/data.js      Feste Daten: Tastaturlayouts, Lektionen, Wortliste, Tempotexte
js/app.js       Programmlogik: Übungen erzeugen, Eingabe auswerten, Anzeige
```

`js/data.js` muss vor `js/app.js` geladen werden.

## Anpassen

- Neue Wörter: in `WORDS` (`js/data.js`) ergänzen, Nomen gross geschrieben.
- Neue Tempotexte: in `PASSAGES` (`js/data.js`) ergänzen.
- Lektionen: Liste `DEFS` (`js/data.js`).

## Starten

`index.html` im Browser öffnen. Oder über GitHub Pages veröffentlichen
(Settings → Pages → Branch `main`, Ordner `/ (root)`).
