# Fehlercodes in XRechnungen erklärt

Ein Fehlercode nennt die Regel, gegen die eine E-Rechnung verstößt: BR steht für Business Rule der EN 16931, BR-CO für Rechenregeln, BR-S und die anderen Buchstaben für Regeln je Umsatzsteuerkategorie, BR-DE für die deutschen Regeln der XRechnung; BR-DE-15 zum Beispiel heißt, die Käuferreferenz (BT-10, bei öffentlichen Auftraggebern die Leitweg-ID) fehlt.

## Die Präfixe

Anzahl der Regeln in der KoSIT-Konfiguration 2026-08-31

| Präfix | Bedeutung | Regeln |
| --- | --- | ---: |
| BR- | Kernregeln der EN 16931: Pflichtfelder und ihre Beziehungen | 58 |
| BR-CO- | Rechen- und Konsistenzregeln (Summen, Steuer, Rundung) | 23 |
| BR-S-, BR-Z-, BR-E-, BR-AE-, BR-IC-, BR-G-, BR-O-, BR-AF-, BR-AG- | Regeln je Umsatzsteuerkategorie | 96 |
| BR-CL- | Codelisten (Ländercodes, Währungen, Einheiten, Rechnungsarten) | 23 |
| BR-DEC- | höchstens zwei Nachkommastellen bei Beträgen | 21 |
| BR-DE- | deutsche Regeln der XRechnung (KoSIT) | 39 |
| BR-DEX-, BR-TMP- | XRechnung-Extension und vorläufige Regeln (KoSIT) | 22 |
| PEPPOL-EN16931-R | Peppol-Regeln, die die XRechnung-Schematron übernimmt | 23 |
| UBL-CR, UBL-SR, UBL-DT | Syntaxregeln für UBL | 756 |
| CII-SR, CII-DT | Syntaxregeln für CII | 583 |

## Fehler, Warnung, Hinweis

Im Schematron hat jede Regel einen Schweregrad: fatal (Fehler), warning (Warnung) oder information (Hinweis). Die Rechnung ist gültig, wenn keine Meldung den Schweregrad Fehler hat. Die KoSIT-Konfiguration ändert für einzelne Regeln den Schweregrad, etwa BR-CL-21 und BR-CL-23 zur Warnung in XRechnung oder UBL-CR-646 zum Fehler.

## Die häufig gesuchten Fehler

| Code | Bedeutung |
| --- | --- |
| [BR-DE-1](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-1/) | Zahlungsangaben (BG-16) fehlen |
| [BR-DE-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/) | Käuferreferenz (BT-10) fehlt, meist die Leitweg-ID |
| [BR-DE-16](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-16/) | USt-IdNr. oder Steuernummer des Verkäufers fehlt |
| [BR-DE-18](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-18/) | Skonto-Angabe in den Zahlungsbedingungen falsch formatiert |
| [BR-DE-21](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-21/) | Spezifikationskennung (BT-24) entspricht nicht XRechnung |
| [BR-DE-23](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-23/) | Überweisung ohne Kontoangaben (BG-17), oder mit Karte oder Lastschrift gemischt |
| [BR-CO-10](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-10/) | Summe der Positionen (BT-106) stimmt nicht mit den Positionen überein |
| [BR-CO-13](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-13/) | Gesamtbetrag ohne Umsatzsteuer (BT-109) falsch berechnet |
| [BR-CO-14](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-14/) | Umsatzsteuer gesamt (BT-110) stimmt nicht mit der Aufschlüsselung überein |
| [BR-CO-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-15/) | Gesamtbetrag mit Umsatzsteuer (BT-112) falsch berechnet |
| [BR-CO-16](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-16/) | Zahlbetrag (BT-115) falsch berechnet |
| [BR-CO-17](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-17/) | Steuerbetrag je Steuersatz (BT-117) falsch gerundet oder berechnet |
| [BR-S-08](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-s-08/) | Bemessungsgrundlage (BT-116) beim Normalsatz passt nicht zu den Positionen |

## Ein Beispiel

Die erfundene Beispielrechnung mit zwei Fehlern meldet BR-CO-10, BR-CO-13, BR-DE-15. Die fehlende Leitweg-ID ist BR-DE-15; die um 0,10 EUR zu niedrige Summe der Positionen verletzt BR-CO-10 (Summe der Positionen) und, weil der Gesamtbetrag ohne Steuer aus derselben Summe folgt, auch BR-CO-13.

## Beispiel prüfen

[Beispiel im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&job=validate)

## Quellen

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Keine Steuerberatung.

## Fragen

### Was bedeutet BR-DE-15?

BR-DE-15 ist eine deutsche Regel der XRechnung: das Element „Buyer reference“ (BT-10) muss übermittelt werden. Bei öffentlichen Auftraggebern steht dort die Leitweg-ID.

### Ist eine Warnung ein Fehler?

Nein. Nur Meldungen mit dem Schweregrad Fehler (im Schematron „fatal“) machen die Rechnung ungültig; Warnungen und Hinweise nicht. Die KoSIT-Konfiguration setzt für einzelne Regeln und Szenarien eigene Schweregrade.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [BR-DE-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/  
Datenstand: 2026-11-08
