# XRechnung abgelehnt: die sieben häufigen Gründe

Die häufigste Ursache ist eine fehlende oder falsche Leitweg-ID in der Käuferreferenz (BR-DE-15), die zweithäufigste sind Rechenfehler bei Summen und Rundung (BR-CO-10 bis BR-CO-17); beides findet die Prüfung vor dem Versand, wie bei der Beispielrechnung: BR-CO-10, BR-CO-13, BR-DE-15.

## Die Gründe

| Grund | Fehlercode | Lösung |
| --- | --- | --- |
| Leitweg-ID fehlt oder steht im falschen Feld | [BR-DE-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/) | Leitweg-ID in BT-10 |
| Summen passen nicht zu den Positionen, Rundung | [BR-CO-10](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-10/), [BR-CO-13](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-13/), [BR-CO-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-15/) | jede Position auf Cent runden, Summen aus den gerundeten Beträgen bilden |
| Steuer je Satz falsch berechnet oder zusammengefasst | [BR-CO-17](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-17/), [BR-S-08](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-s-08/) | je Steuersatz eine eigene Aufschlüsselung |
| Pflichtangaben des Verkäufers fehlen | [BR-DE-2](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-2/), [BR-DE-16](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-16/) | Kontakt und USt-IdNr. oder Steuernummer angeben |
| Zahlungsangaben fehlen oder passen nicht zur Zahlungsart | [BR-DE-1](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-1/), [BR-DE-23](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-23/) | Zahlungsart und IBAN in BG-16 |
| Leistungsdatum fehlt | [BR-DE-TMP-32](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-tmp-32/) | Lieferdatum oder Abrechnungszeitraum angeben |
| Falscher Übertragungsweg, etwa E-Mail statt Portal | keiner: das erkennt keine Prüfregel | den vom Auftraggeber genannten Weg nutzen |

## Vor dem Versand prüfen

[Beispiel im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&job=validate)

## Quellen

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die Annahme einer Rechnung entscheidet der Empfänger; ein gültiges Prüfergebnis ist keine Zusage.

## Verwandte Seiten

- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Leitweg-ID](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/leitweg-id/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/  
Datenstand: 2026-11-08
