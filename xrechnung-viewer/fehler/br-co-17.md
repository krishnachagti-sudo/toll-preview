# BR-CO-17: Steuerbetrag je Steuersatz (BT-117) falsch gerundet oder berechnet

BR-CO-17 bedeutet: VAT category tax amount (BT-117) = VAT category taxable amount (BT-116) x (VAT category rate (BT-119) / 100), rounded to two decimals. (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Berechnen Sie die Steuer je Steuersatz auf die Summe der Bemessungsgrundlage und runden Sie einmal auf zwei Stellen (kaufmännisch).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-17 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-117 Steuerbetrag; BT-116 Bemessungsgrundlage; BT-119 Steuersatz |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-17:** VAT category tax amount (BT-117) = VAT category taxable amount (BT-116) x (VAT category rate (BT-119) / 100), rounded to two decimals.

## Was das heißt

Der Steuerbetrag einer Aufschlüsselung (BT-117) soll gleich der Bemessungsgrundlage (BT-116) mal Steuersatz (BT-119) durch 100 sein, auf zwei Nachkommastellen gerundet. Die Prüfregel in der CEN-Schematron 1.3.16 lässt dabei eine Abweichung von weniger als einer Währungseinheit (1,00 EUR) zu; sie schlägt also erst bei größeren Abweichungen an. Ein einzelner Rundungscent fällt eher bei BR-CO-14 oder BR-S-09 auf.

**Häufige Ursache:** Der Steuerbetrag wurde mit einem anderen Satz oder einer anderen Grundlage berechnet als angegeben, zum Beispiel 19 % auf eine Grundlage, die auch 7-%-Positionen enthält.

## So beheben Sie den Fehler

Berechnen Sie die Steuer je Steuersatz auf die Summe der Bemessungsgrundlage und runden Sie einmal auf zwei Stellen (kaufmännisch).

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-17; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:TaxAmount currencyID="EUR">110.69</cbc:TaxAmount>
```

Fehlerhaft:

```xml
<cbc:TaxAmount currencyID="EUR">112.69</cbc:TaxAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:TaxTotal[1]/cac:TaxSubtotal[1]`: VAT category tax amount (BT-117) = VAT category taxable amount (BT-116) x (VAT category rate (BT-119) / 100), rounded to two decimals.

Dieselbe Änderung löst außerdem aus: BR-CO-14, BR-S-09.

## Die Prüfregel

UBL, Kontext:

```
cac:TaxTotal/cac:TaxSubtotal
```

Bedingung (muss erfüllt sein):

```
(round(cac:TaxCategory[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/xs:decimal(cbc:Percent)) = 0 and (round(xs:decimal(cbc:TaxAmount)) = 0)) or (round(cac:TaxCategory[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/xs:decimal(cbc:Percent)) != 0 and ((abs(xs:decimal(cbc:TaxAmount)) - 1 < round(abs(xs:decimal(cbc:TaxableAmount)) * (cac:TaxCategory[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/xs:decimal(cbc:Percent) div 100) * 10 * 10) div 100 ) and (abs(xs:decimal(cbc:TaxAmount)) + 1 > round(abs(xs:decimal(cbc:TaxableAmount)) * (cac:TaxCategory[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/xs:decimal(cbc:Percent) div 100) * 10 * 10) div 100 ))) or (not(exists(cac:TaxCategory[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/xs:decimal(cbc:Percent))) and (round(xs:decimal(cbc:TaxAmount)) = 0))
```

CII, Kontext:

```
//ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax
```

Bedingung (muss erfüllt sein):

```
(round(.[normalize-space(upper-case(ram:TypeCode)) = 'VAT']/xs:decimal(ram:RateApplicablePercent)) = 0 and (round(xs:decimal(ram:CalculatedAmount)) = 0)) or (round(.[normalize-space(upper-case(ram:TypeCode)) = 'VAT']/xs:decimal(ram:RateApplicablePercent)) != 0 and ((abs(xs:decimal(ram:CalculatedAmount)) - 1 <= round(abs(xs:decimal(ram:BasisAmount)) * (.[normalize-space(upper-case(ram:TypeCode)) = 'VAT']/xs:decimal(ram:RateApplicablePercent) div 100) * 10 * 10) div 100 ) and (abs(xs:decimal(ram:CalculatedAmount)) + 1 >= round(abs(xs:decimal(ram:BasisAmount)) * (.[normalize-space(upper-case(ram:TypeCode)) = 'VAT']/xs:decimal(ram:RateApplicablePercent) div 100) * 10 * 10) div 100 ))) or (not(exists(.[normalize-space(upper-case(ram:TypeCode))='VAT']/xs:decimal(ram:RateApplicablePercent))) and (round(xs:decimal(ram:CalculatedAmount)) = 0))
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-17)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-17/  
Datenstand: 2026-11-08
