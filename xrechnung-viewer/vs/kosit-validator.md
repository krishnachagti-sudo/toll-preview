# KoSIT Validator oder dieser Prüfer: Unterschiede

Der KoSIT Validator ist die Referenzimplementierung der Prüfung (Java 11 oder neuer, Kommandozeile, aktuell Version 1.6.3 mit der Konfiguration 2026-08-31). Dieser Prüfer führt dieselben Schematron-Dateien derselben Konfiguration aus und prüft alle 86 Rechnungen der KoSIT-Testsuite gültig, führt aber die XML-Schema-Prüfung (XSD) nicht aus.

## Gegenüberstellung

| Merkmal | KoSIT Validator | Dieser Viewer |
| --- | --- | --- |
| Herausgeber | KoSIT (im Auftrag des IT-Planungsrats) | Endwise |
| Installation | Java 11 oder neuer, Kommandozeile | keine, im Browser |
| Regeln | Konfiguration 2026-08-31: XSD und Schematron | KoSIT-Konfiguration 2026-08-31: CEN 1.3.16, XRechnung-Schematron 2.6.0; ohne XSD |
| Bericht | XML- und HTML-Bericht | Ergebnis mit Erklärung je Fehlercode, PDF mit Prüfbericht |
| ZUGFeRD-PDF | nein, nur XML | ja, die eingebettete XML wird gelesen |
| Kosten | kostenlos (Apache-2.0) | Anzeige kostenlos; Prüfung $0.01, PDF mit Prüfbericht $0.03 je Datei |
| Daten | bleiben im eigenen Haus | Anzeige im Browser; Prüfung im Speicher, nicht gespeichert |

## Wann KoSIT Validator besser ist

Der KoSIT Validator ist besser, wenn Sie die offizielle Referenz brauchen, das XML-Schema mitprüfen wollen, viele Dateien automatisch im eigenen Haus prüfen und Java betreiben können. Er ist kostenlos.

## Wann dieser Viewer besser ist

Dieser Prüfer ist besser, wenn Sie nichts installieren wollen, eine ZUGFeRD-PDF prüfen, die Rechnung zugleich lesbar sehen und jeden Fehlercode auf Deutsch erklärt haben wollen.

## Quellen

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [KoSIT Validator Configuration: docs/usage.md (Java 11 oder neuer, Validator 1.6.3) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/blob/master/docs/usage.md)
- [XRechnung Testsuite 2026-08-31 (sample 02.01a-cvd\_INVOICE\_ubl.xml bundled, line endings made LF) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-testsuite/releases/tag/v2026-08-31)

> Angaben zu anderen Produkten stammen von deren eigenen Seiten und wurden am 8. November 2026 gelesen; Preise und Funktionen können sich ändern. Keine Steuerberatung.

## Verwandte Seiten

- [XRechnung Validator](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-validator/)
- [ELSTER-Viewer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/elster/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/kosit-validator/  
Datenstand: 2026-11-08
