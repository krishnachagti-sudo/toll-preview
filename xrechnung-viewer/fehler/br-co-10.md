# BR-CO-10: Summe der Positionen (BT-106) stimmt nicht mit den Positionen überein

BR-CO-10 bedeutet: Sum of Invoice line net amount (BT-106) = Σ Invoice line net amount (BT-131). (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Runden Sie jeden Positionsbetrag auf zwei Nachkommastellen und bilden Sie BT-106 als Summe dieser gerundeten Beträge. Nachlässe auf Dokumentebene gehören nicht in BT-106, sondern in BT-107.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-10 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-106 Summe der Positionen (netto); BT-131 Nettobetrag der Position |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-10:** Sum of Invoice line net amount (BT-106) = Σ Invoice line net amount (BT-131).

## Was das heißt

Die Summe der Nettobeträge aller Positionen (BT-106) muss genau der Summe der einzelnen Positionsbeträge (BT-131) entsprechen, auf den Cent.

**Häufige Ursache:** Meist Rundung: das Programm rundet die Gesamtsumme anders als die einzelnen Positionen, rechnet mit Bruttopreisen und zieht die Steuer zurück, oder eine Position mit Menge 0 oder ein Rabatt wird in der Summe anders behandelt.

## So beheben Sie den Fehler

Runden Sie jeden Positionsbetrag auf zwei Nachkommastellen und bilden Sie BT-106 als Summe dieser gerundeten Beträge. Nachlässe auf Dokumentebene gehören nicht in BT-106, sondern in BT-107.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-10; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:LineExtensionAmount currencyID="EUR">622.50</cbc:LineExtensionAmount>
```

Fehlerhaft:

```xml
<cbc:LineExtensionAmount currencyID="EUR">622.40</cbc:LineExtensionAmount>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:LegalMonetaryTotal[1]`: Sum of Invoice line net amount (BT-106) = Σ Invoice line net amount (BT-131).

Dieselbe Änderung löst außerdem aus: BR-CO-13.

## Die Prüfregel

UBL, Kontext:

```
cac:LegalMonetaryTotal
```

Bedingung (muss erfüllt sein):

```
(xs:decimal(cbc:LineExtensionAmount) = xs:decimal(round(sum(//(cac:InvoiceLine|cac:CreditNoteLine)/xs:decimal(cbc:LineExtensionAmount)) * 10 * 10) div 100))
```

CII, Kontext:

```
//ram:SpecifiedTradeSettlementHeaderMonetarySummation
```

Bedingung (muss erfüllt sein):

```
xs:decimal(ram:LineTotalAmount) = round(xs:decimal(sum(../../ram:IncludedSupplyChainTradeLineItem/ram:SpecifiedLineTradeSettlement/ram:SpecifiedTradeSettlementLineMonetarySummation/ram:LineTotalAmount)) * xs:decimal(100)) div xs:decimal(100)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-10)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-10/  
Datenstand: 2026-11-08
