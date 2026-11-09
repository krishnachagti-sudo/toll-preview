# XRechnung Validator

Dieser Validator prüft eine XRechnung mit denselben Schematron-Regeln wie der KoSIT-Validator in der Konfiguration 2026-08-31 (CEN EN 16931 1.3.16, XRechnung-Schematron 2.6.0). Die Beispielrechnung mit zwei Fehlern ergibt: ungültig nach KoSIT-Szenario „EN16931 XRechnung (UBL Invoice)“, 3 Fehler, 0 Warnungen, 0 Hinweise.

## Beispiel prüfen

[Beispiel im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&job=validate)

## Das Ergebnis für die Beispielrechnung

Die erfundene XRechnung 3.0 (UBL) hat zwei Fehler: die Leitweg-ID fehlt, und die Summe der Positionen ist um 0,10 EUR zu niedrig. Der zweite Fehler verletzt zwei Rechenregeln.

Ergebnis: ungültig, 3 Fehler, 0 Warnungen, 0 Hinweise

| Regel | Schweregrad | Meldung (wie veröffentlicht) |
| --- | --- | --- |
| [BR-CO-10](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-10/) | Fehler | Sum of Invoice line net amount (BT-106) = Σ Invoice line net amount (BT-131). |
| [BR-CO-13](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-13/) | Fehler | Invoice total amount without VAT (BT-109) = Σ Invoice line net amount (BT-131) - Sum of allowances on document level (BT-107) + Sum of charges on document level (BT-108). |
| [BR-DE-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/) | Fehler | Das Element "Buyer reference" (BT-10) muss übermittelt werden. |

Ohne die beiden Fehler ist dieselbe Rechnung gültig: 0 Fehler, 0 Warnungen, 0 Hinweise.

## Was geprüft wird

| Regelwerk | Version | Regeln |
| --- | --- | --- |
| EN 16931 (CEN), Modell-, Codelisten- und Syntaxregeln für UBL und CII | 1.3.16 | 1562 |
| XRechnung (KoSIT), BR-DE- und Peppol-Regeln, Extension und CVD | 2.6.0 | 84 |
| Szenarien und abweichende Schweregrade (KoSIT-Konfiguration) | 2026-08-31 | 11 Szenarien |

Nicht geprüft wird das XML-Schema (XSD): der KoSIT-Validator prüft UBL-Dateien zusätzlich gegen das UBL-2.1-Schema. Hier wird die Datei auf Wohlgeformtheit und Namensräume geprüft und jede Schematron-Regel ausgeführt.

Alle 86 Rechnungen der KoSIT-Testsuite 2026-08-31 werden mit diesem Prüfer gültig geprüft, wie beim KoSIT-Validator. [Wie der KoSIT-Validator selbst sich unterscheidet](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/kosit-validator/).

## Preis

Öffnen und Anzeigen kostenlos im Browser; Prüfung $0.01 je Datei, PDF mit Prüfbericht $0.03; dieselbe Datei 30 Tage frei.

## Quellen

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [XRechnung Testsuite 2026-08-31 (sample 02.01a-cvd\_INVOICE\_ubl.xml bundled, line endings made LF) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-testsuite/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Schritte

1. **Datei ablegen.** Legen Sie die XRechnung (.xml, UBL oder CII) im Viewer ab. Sie wird im Browser gelesen und als Rechnung angezeigt.
2. **Prüfen.** Die Prüfung schickt die Datei an den Server. Er wählt das KoSIT-Szenario anhand der Spezifikationskennung (BT-24) und führt alle Regeln aus.
3. **Ergebnis lesen.** Sie sehen gültig oder ungültig, jeden Fehler mit Regel, Meldung, Stelle in der Datei und Einordnung nach dem BMF-Schreiben, und für häufige Codes eine Seite mit Lösung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [KoSIT Validator oder dieser Prüfer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/kosit-validator/)
- [Validierungsfehler und Vorsteuerabzug](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-validator/vorsteuerabzug/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-validator/  
Datenstand: 2026-11-08
