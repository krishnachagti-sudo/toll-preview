# XRechnung in PDF umwandeln

Eine XRechnung wird zur PDF, indem man sie lesbar darstellt und diese Ansicht speichert; das geht hier kostenlos über den Druckdialog oder für $0.03 als PDF mit Prüfbericht. Die PDF ist eine Lesekopie: rechtlich maßgeblich bleibt die XML-Datei.

## Beispiel öffnen

[Beispiel-XRechnung im Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=ubl)

## Was in der PDF mit Prüfbericht steht

- Kopf mit Rechnungsart und -nummer, Verkäufer und Käufer mit Anschrift, USt-IdNr. und Kontakt
- Referenzen: Rechnungsdatum, Leistungsdatum, Fälligkeit, Leitweg-ID, Bestellnummer
- Alle Positionen mit Menge, Einheit, Preis, Steuersatz und Nettobetrag
- Umsatzsteueraufschlüsselung, Summen und Zahlbetrag
- Zahlungsangaben, Bemerkungen und die Liste der Anhänge
- Auf eigener Seite: der Prüfbericht mit Szenario, Regelversionen und jedem Fehler mit Stelle und Einordnung nach dem BMF-Schreiben
- In der Fußzeile jeder Seite: der SHA-256-Fingerabdruck der Originaldatei, damit die Lesekopie der XML zugeordnet werden kann

Die PDF wird bei gleicher Datei Byte für Byte gleich erzeugt (es wird kein Datum eingestempelt). Sie ist keine PDF/A-3-Datei und keine ZUGFeRD-Rechnung: sie enthält die XML nicht.

Zum Aufbewahren: [E-Rechnung archivieren](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/archivierung-gobd/).

## Preis

Öffnen und Anzeigen kostenlos im Browser; Prüfung $0.01 je Datei, PDF mit Prüfbericht $0.03; dieselbe Datei 30 Tage frei.

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Schritte

1. **Öffnen.** Legen Sie die XRechnung im Viewer ab; sie wird als Rechnung angezeigt.
2. **Kostenlos: drucken.** Wählen Sie „Drucken oder als PDF sichern“ und im Druckdialog „Als PDF sichern“. Gedruckt wird nur die Rechnung.
3. **Mit Prüfbericht.** Oder wählen Sie „PDF mit Prüfbericht“: der Server erstellt eine PDF mit der Rechnung, dem Prüfergebnis nach den offiziellen Regeln und dem SHA-256-Fingerabdruck der Originaldatei.

## Verwandte Seiten

- [XRechnung drucken](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/drucken/)
- [E-Rechnung archivieren](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/archivierung-gobd/)
- [XRechnung öffnen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-in-pdf/  
Datenstand: 2026-11-08
