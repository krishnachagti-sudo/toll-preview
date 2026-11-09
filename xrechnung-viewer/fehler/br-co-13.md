# BR-CO-13: Gesamtbetrag ohne Umsatzsteuer (BT-109) falsch berechnet

BR-CO-13 bedeutet: Invoice total amount without VAT (BT-109) = Σ Invoice line net amount (BT-131) - Sum of allowances on document level (BT-107) + Sum of charges on document level (BT-108). (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Geben Sie jeden Rabatt und jeden Zuschlag auf Rechnungsebene als eigene Zeile an (BG-20, BG-21) und berechnen Sie BT-109 daraus.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-13 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-109 Gesamtbetrag ohne Umsatzsteuer; BT-131 Nettobetrag der Position; BT-107 Summe der Nachlässe; BT-108 Summe der Zuschläge |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-13:** Invoice total amount without VAT (BT-109) = Σ Invoice line net amount (BT-131) - Sum of allowances on document level (BT-107) + Sum of charges on document level (BT-108).

## Was das heißt

Der Gesamtbetrag ohne Umsatzsteuer (BT-109) muss gleich der Summe der Positionen (BT-131) minus der Nachlässe (BT-107) plus der Zuschläge (BT-108) auf Dokumentebene sein.

**Häufige Ursache:** Ein Rabatt oder eine Versandpauschale ist im Gesamtbetrag enthalten, aber nicht als Nachlass oder Zuschlag in der Rechnung angegeben, oder umgekehrt.

## So beheben Sie den Fehler

Geben Sie jeden Rabatt und jeden Zuschlag auf Rechnungsebene als eigene Zeile an (BG-20, BG-21) und berechnen Sie BT-109 daraus.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-13; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:TaxExclusiveAmount currencyID="EUR">622.50</cbc:TaxExclusiveAmount>
```

Fehlerhaft:

```xml
<cbc:TaxExclusiveAmount currencyID="EUR">620.00</cbc:TaxExclusiveAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:LegalMonetaryTotal[1]`: Invoice total amount without VAT (BT-109) = Σ Invoice line net amount (BT-131) - Sum of allowances on document level (BT-107) + Sum of charges on document level (BT-108).

Dieselbe Änderung löst außerdem aus: BR-CO-15.

## Die Prüfregel

UBL, Kontext:

```
cac:LegalMonetaryTotal
```

Bedingung (muss erfüllt sein):

```
((cbc:ChargeTotalAmount) and (cbc:AllowanceTotalAmount) and (xs:decimal(cbc:TaxExclusiveAmount) = round((xs:decimal(cbc:LineExtensionAmount) + xs:decimal(cbc:ChargeTotalAmount) - xs:decimal(cbc:AllowanceTotalAmount)) * 10 * 10) div 100 )) or (not(cbc:ChargeTotalAmount) and (cbc:AllowanceTotalAmount) and (xs:decimal(cbc:TaxExclusiveAmount) = round((xs:decimal(cbc:LineExtensionAmount) - xs:decimal(cbc:AllowanceTotalAmount)) * 10 * 10 ) div 100)) or ((cbc:ChargeTotalAmount) and not(cbc:AllowanceTotalAmount) and (xs:decimal(cbc:TaxExclusiveAmount) = round((xs:decimal(cbc:LineExtensionAmount) + xs:decimal(cbc:ChargeTotalAmount)) * 10 * 10 ) div 100)) or (not(cbc:ChargeTotalAmount) and not(cbc:AllowanceTotalAmount) and (xs:decimal(cbc:TaxExclusiveAmount) = xs:decimal(cbc:LineExtensionAmount)))
```

CII, Kontext:

```
//ram:SpecifiedTradeSettlementHeaderMonetarySummation
```

Bedingung (muss erfüllt sein):

```
(xs:decimal(ram:TaxBasisTotalAmount[1]) = round((xs:decimal(ram:LineTotalAmount[1]) - xs:decimal(ram:AllowanceTotalAmount[1]) + xs:decimal(ram:ChargeTotalAmount[1])) * 10 * 10) div 100) or ((xs:decimal(ram:TaxBasisTotalAmount[1]) = round((xs:decimal(ram:LineTotalAmount[1]) - xs:decimal(ram:AllowanceTotalAmount[1])) * 10 * 10) div 100) and not(ram:ChargeTotalAmount)) or ((xs:decimal(ram:TaxBasisTotalAmount[1]) = round((xs:decimal(ram:LineTotalAmount[1]) + xs:decimal(ram:ChargeTotalAmount[1])) * 10 * 10) div 100) and not(ram:AllowanceTotalAmount)) or ((xs:decimal(ram:TaxBasisTotalAmount[1]) = round((xs:decimal(ram:LineTotalAmount[1])) * 10 * 10) div 100) and not(ram:ChargeTotalAmount) and not(ram:AllowanceTotalAmount))
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-13)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-13/  
Datenstand: 2026-11-08
