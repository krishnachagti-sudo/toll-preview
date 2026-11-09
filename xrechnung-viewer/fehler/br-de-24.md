# BR-DE-24: Kartenzahlung ohne Kartenangaben (BG-18)

BR-DE-24 bedeutet: Wenn BT-81 "Payment means type code" einen Schlüssel für Kartenzahlungen enthält (48, 54, 55), muss genau BG-18 "PAYMENT CARD INFORMATION" übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie bei Kartenzahlung die gekürzte Kartennummer (BT-87, höchstens die ersten 6 und letzten 4 Ziffern) an und entfernen Sie die Bankverbindung.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-24 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-81 Zahlungsart |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-24-a:** Wenn BT-81 "Payment means type code" einen Schlüssel für Kartenzahlungen enthält (48, 54, 55), muss genau BG-18 "PAYMENT CARD INFORMATION" übermittelt werden.

**Meldung BR-DE-24-b:** Wenn BT-81 "Payment means type code" einen Schlüssel für Kartenzahlungen enthält (48, 54, 55), dürfen BG-17 und BG-19 nicht übermittelt werden.

## Was das heißt

Die Zahlungsart ist Kartenzahlung (Code 48, 54 oder 55). Dann muss genau eine Gruppe PAYMENT CARD INFORMATION (BG-18) vorhanden sein (BR-DE-24-a), und Überweisungs- oder Lastschriftangaben dürfen nicht vorkommen (BR-DE-24-b).

**Häufige Ursache:** Die Zahlungsart wird auf Karte gesetzt, die Kartenangaben (gekürzte Kartennummer) fehlen aber, oder die IBAN bleibt zusätzlich stehen.

## So beheben Sie den Fehler

Geben Sie bei Kartenzahlung die gekürzte Kartennummer (BT-87, höchstens die ersten 6 und letzten 4 Ziffern) an und entfernen Sie die Bankverbindung.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-24-a; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
```

Fehlerhaft:

```xml
<cbc:PaymentMeansCode>54</cbc:PaymentMeansCode>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:PaymentMeans[1]`: Wenn BT-81 "Payment means type code" einen Schlüssel für Kartenzahlungen enthält (48, 54, 55), muss genau BG-18 "PAYMENT CARD INFORMATION" übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-DE-24-b.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('48','54','55')] |/cn:CreditNote/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('48','54','55')]
```

Bedingung (muss erfüllt sein):

```
cac:CardAccount
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans[normalize-space(ram:TypeCode) = ('48','54','55')]
```

Bedingung (muss erfüllt sein):

```
ram:ApplicableTradeSettlementFinancialCard
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-24)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-24/  
Datenstand: 2026-11-08
