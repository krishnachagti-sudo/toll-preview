# BR-CO-14: Umsatzsteuer gesamt (BT-110) stimmt nicht mit der Aufschlüsselung überein

BR-CO-14 bedeutet: Invoice total VAT amount (BT-110) = Σ VAT category tax amount (BT-117). (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Berechnen Sie zuerst die Steuer je Steuersatz (gerundet auf zwei Stellen) und bilden Sie BT-110 als deren Summe.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-14 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-110 Umsatzsteuer gesamt; BT-117 Steuerbetrag |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-14:** Invoice total VAT amount (BT-110) = Σ VAT category tax amount (BT-117).

## Was das heißt

Die gesamte Umsatzsteuer (BT-110) muss genau der Summe der Steuerbeträge je Steuersatz (BT-117) entsprechen.

**Häufige Ursache:** Die Steuer wird einmal über die Gesamtsumme und einmal je Steuersatz gerundet, mit unterschiedlichem Ergebnis.

## So beheben Sie den Fehler

Berechnen Sie zuerst die Steuer je Steuersatz (gerundet auf zwei Stellen) und bilden Sie BT-110 als deren Summe.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-14; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:TaxAmount currencyID="EUR">113.48</cbc:TaxAmount>
```

Fehlerhaft:

```xml
<cbc:TaxAmount currencyID="EUR">113.50</cbc:TaxAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:TaxTotal[1]`: Invoice total VAT amount (BT-110) = Σ VAT category tax amount (BT-117).

Dieselbe Änderung löst außerdem aus: BR-CO-15.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:TaxTotal | /cn:CreditNote/cac:TaxTotal
```

Bedingung (muss erfüllt sein):

```
(xs:decimal(child::cbc:TaxAmount)= round((sum(cac:TaxSubtotal/xs:decimal(cbc:TaxAmount)) * 10 * 10)) div 100) or not(cac:TaxSubtotal)
```

CII, Kontext:

```
//ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount[@currencyID=/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:InvoiceCurrencyCode]
```

Bedingung (muss erfüllt sein):

```
. = (round(sum(/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax/ram:CalculatedAmount)*10*10)div 100)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-14)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-14/  
Datenstand: 2026-11-08
