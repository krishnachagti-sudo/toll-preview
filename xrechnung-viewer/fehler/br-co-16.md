# BR-CO-16: Zahlbetrag (BT-115) falsch berechnet

BR-CO-16 bedeutet: Amount due for payment (BT-115) = Invoice total amount with VAT (BT-112) -Paid amount (BT-113) +Rounding amount (BT-114). (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Geben Sie Anzahlungen in BT-113 an und ziehen Sie Skonto nicht vom Zahlbetrag ab; Skonto gehört in die Zahlungsbedingungen (siehe BR-DE-18).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-16 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-115 Zahlbetrag; BT-112 Gesamtbetrag mit Umsatzsteuer; BT-113 Bereits gezahlt; BT-114 Rundungsbetrag |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-16:** Amount due for payment (BT-115) = Invoice total amount with VAT (BT-112) -Paid amount (BT-113) +Rounding amount (BT-114).

Abweichende Schweregrade in der KoSIT-Konfiguration

| Szenario | Regel | Schweregrad |
| --- | --- | --- |
| EN16931 XRechnung Extension (UBL Invoice) | BR-CO-16 | Hinweis |

## Was das heißt

Der zu zahlende Betrag (BT-115) muss gleich dem Gesamtbetrag mit Umsatzsteuer (BT-112) minus bereits gezahlter Beträge (BT-113) plus Rundungsbetrag (BT-114) sein.

**Häufige Ursache:** Eine Anzahlung oder Abschlagszahlung ist vom Zahlbetrag abgezogen, aber nicht als bereits gezahlter Betrag BT-113 angegeben, oder ein Skonto wurde schon abgezogen.

## So beheben Sie den Fehler

Geben Sie Anzahlungen in BT-113 an und ziehen Sie Skonto nicht vom Zahlbetrag ab; Skonto gehört in die Zahlungsbedingungen (siehe BR-DE-18).

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-16; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:PayableAmount currencyID="EUR">735.98</cbc:PayableAmount>
```

Fehlerhaft:

```xml
<cbc:PayableAmount currencyID="EUR">700.00</cbc:PayableAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:LegalMonetaryTotal[1]`: Amount due for payment (BT-115) = Invoice total amount with VAT (BT-112) -Paid amount (BT-113) +Rounding amount (BT-114).

## Die Prüfregel

UBL, Kontext:

```
cac:LegalMonetaryTotal
```

Bedingung (muss erfüllt sein):

```
(exists(cbc:PrepaidAmount) and not(exists(cbc:PayableRoundingAmount)) and (xs:decimal(cbc:PayableAmount) = (round((xs:decimal(cbc:TaxInclusiveAmount) - xs:decimal(cbc:PrepaidAmount)) * 10 * 10) div 100))) or (not(exists(cbc:PrepaidAmount)) and not(exists(cbc:PayableRoundingAmount)) and xs:decimal(cbc:PayableAmount) = xs:decimal(cbc:TaxInclusiveAmount)) or (exists(cbc:PrepaidAmount) and exists(cbc:PayableRoundingAmount) and ((round((xs:decimal(cbc:PayableAmount) - xs:decimal(cbc:PayableRoundingAmount)) * 10 * 10) div 100) = (round((xs:decimal(cbc:TaxInclusiveAmount) - xs:decimal(cbc:PrepaidAmount)) * 10 * 10) div 100))) or (not(exists(cbc:PrepaidAmount)) and exists(cbc:PayableRoundingAmount) and ((round((xs:decimal(cbc:PayableAmount) - xs:decimal(cbc:PayableRoundingAmount)) * 10 * 10) div 100) = xs:decimal(cbc:TaxInclusiveAmount)))
```

CII, Kontext:

```
//ram:SpecifiedTradeSettlementHeaderMonetarySummation
```

Bedingung (muss erfüllt sein):

```
(xs:decimal(ram:DuePayableAmount[1]) = xs:decimal(ram:GrandTotalAmount[1]) - xs:decimal(ram:TotalPrepaidAmount[1]) + xs:decimal(ram:RoundingAmount[1])) or ((xs:decimal(ram:DuePayableAmount[1]) = xs:decimal(ram:GrandTotalAmount[1]) + xs:decimal(ram:RoundingAmount[1])) and not(ram:TotalPrepaidAmount)) or ((xs:decimal(ram:DuePayableAmount[1]) = xs:decimal(ram:GrandTotalAmount[1]) - xs:decimal(ram:TotalPrepaidAmount[1])) and not(ram:RoundingAmount)) or ((xs:decimal(ram:DuePayableAmount[1]) = xs:decimal(ram:GrandTotalAmount[1])) and not(ram:TotalPrepaidAmount) and not(ram:RoundingAmount))
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-16)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-16/  
Datenstand: 2026-11-08
