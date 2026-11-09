# BR-CO-15: Gesamtbetrag mit Umsatzsteuer (BT-112) falsch berechnet

BR-CO-15 bedeutet: Invoice total amount with VAT (BT-112) = Invoice total amount without VAT (BT-109) + Invoice total VAT amount (BT-110). (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Bilden Sie BT-112 als BT-109 + BT-110, beide auf zwei Stellen gerundet.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-15 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-112 Gesamtbetrag mit Umsatzsteuer; BT-109 Gesamtbetrag ohne Umsatzsteuer; BT-110 Umsatzsteuer gesamt |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-15:** Invoice total amount with VAT (BT-112) = Invoice total amount without VAT (BT-109) + Invoice total VAT amount (BT-110).

## Was das heißt

Der Gesamtbetrag mit Umsatzsteuer (BT-112) muss gleich dem Betrag ohne Umsatzsteuer (BT-109) plus der Umsatzsteuer (BT-110) sein.

**Häufige Ursache:** Der Bruttobetrag wird aus Bruttopreisen summiert statt aus Netto plus Steuer, und die Rundung weicht um einen Cent ab.

## So beheben Sie den Fehler

Bilden Sie BT-112 als BT-109 + BT-110, beide auf zwei Stellen gerundet.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-15; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:TaxInclusiveAmount currencyID="EUR">735.98</cbc:TaxInclusiveAmount>
```

Fehlerhaft:

```xml
<cbc:TaxInclusiveAmount currencyID="EUR">736.00</cbc:TaxInclusiveAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Invoice total amount with VAT (BT-112) = Invoice total amount without VAT (BT-109) + Invoice total VAT amount (BT-110).

Dieselbe Änderung löst außerdem aus: BR-CO-16.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
every $Currency in cbc:DocumentCurrencyCode satisfies (count(cac:TaxTotal/xs:decimal(cbc:TaxAmount[@currencyID=$Currency])) eq 1) and (cac:LegalMonetaryTotal/xs:decimal(cbc:TaxInclusiveAmount) = round( (cac:LegalMonetaryTotal/xs:decimal(cbc:TaxExclusiveAmount) + cac:TaxTotal/xs:decimal(cbc:TaxAmount[@currencyID=$Currency])) * 10 * 10) div 100)
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
every $Currency in /rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:InvoiceCurrencyCode satisfies ( ( count(/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount[@currencyID = $Currency]) = 1 and xs:decimal((/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:GrandTotalAmount)[1]) = round( ( xs:decimal((/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxBasisTotalAmount)[1]) + xs:decimal((/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount[@currencyID = $Currency])[1]) ) * 100 ) div 100 ) or ( xs:decimal((/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:GrandTotalAmount)[1]) = xs:decimal((/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxBasisTotalAmount)[1]) ) )
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-15)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-15/  
Datenstand: 2026-11-08
