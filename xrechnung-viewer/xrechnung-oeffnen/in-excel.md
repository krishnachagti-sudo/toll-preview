# E-Rechnung in Excel: die Positionen als CSV

Die Positionen einer E-Rechnung kommen als CSV nach Excel: der Viewer schreibt je Position Nummer (BT-126), Artikelnummer (BT-155), Name (BT-153), Beschreibung, Menge (BT-129), Einheit, Nettopreis (BT-146), Preiseinheit, Nettobetrag (BT-131), Steuerkategorie und Steuersatz; für die Beispielrechnung sind das 3 Zeilen. Die XML bleibt unverändert.

## Beispiel öffnen

[Beispiel im Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=ubl)

## Die Spalten

| Spalte | Feld |
| --- | --- |
| Positionsnummer | BT-126 |
| Artikelnummer des Verkäufers | BT-155 |
| Artikelname | BT-153 |
| Artikelbeschreibung | BT-154 |
| Menge | BT-129 |
| Einheit | BT-130 |
| Nettopreis | BT-146 |
| Preiseinheit | BT-149 |
| Nettobetrag der Position | BT-131 |
| Steuerkategorie der Position | BT-151 |
| Steuersatz der Position | BT-152 |

Zellen, die Excel als Formel ausführen würde (beginnend mit =, +, - oder @), werden mit einem Apostroph geschrieben, Zahlen nicht.

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Schritte

1. **Öffnen.** Legen Sie die E-Rechnung im Viewer ab.
2. **CSV laden.** Wählen Sie „Positionen als CSV“. Die Datei ist mit Semikolon getrennt, mit Dezimalkomma und UTF-8 mit BOM, so dass Excel sie mit Umlauten direkt öffnet.

## Verwandte Seiten

- [XRechnung öffnen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/in-excel/  
Datenstand: 2026-11-08
