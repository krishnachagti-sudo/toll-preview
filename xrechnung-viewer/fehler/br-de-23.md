# BR-DE-23: Überweisung ohne Kontoangaben (BG-17), oder mit Karte oder Lastschrift gemischt

BR-DE-23 bedeutet: Wenn BT-81 "Payment means type code" einen Schlüssel für Überweisungen enthält (30, 58), muss BG-17 "CREDIT TRANSFER" übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie bei Code 30 oder 58 die IBAN in BT-84 an (UBL cac:PayeeFinancialAccount/cbc:ID, CII ram:PayeePartyCreditorFinancialAccount/ram:IBANID) und entfernen Sie Karten- und Mandatsangaben.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-23 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-81 Zahlungsart |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-23-a:** Wenn BT-81 "Payment means type code" einen Schlüssel für Überweisungen enthält (30, 58), muss BG-17 "CREDIT TRANSFER" übermittelt werden.

**Meldung BR-DE-23-b:** Wenn BT-81 "Payment means type code" einen Schlüssel für Überweisungen enthält (30, 58), dürfen BG-18 und BG-19 nicht übermittelt werden.

## Was das heißt

Die Zahlungsart ist Überweisung (Code 30 oder 58). Dann muss die Gruppe CREDIT TRANSFER (BG-17) mit der IBAN vorhanden sein (BR-DE-23-a), und Karten- oder Lastschriftangaben dürfen nicht vorkommen (BR-DE-23-b).

**Häufige Ursache:** Die Zahlungsart steht auf Überweisung, aber die Bankverbindung fehlt in den strukturierten Feldern.

## So beheben Sie den Fehler

Geben Sie bei Code 30 oder 58 die IBAN in BT-84 an (UBL cac:PayeeFinancialAccount/cbc:ID, CII ram:PayeePartyCreditorFinancialAccount/ram:IBANID) und entfernen Sie Karten- und Mandatsangaben.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-23-a; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:PayeeFinancialAccount>
        <cbc:ID>DE79000000001234567890</cbc:ID>
        <cbc:Name>Muster Elektro GmbH</cbc:Name>
    </cac:PayeeFinancialAccount>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:PaymentMeans[1]`: Wenn BT-81 "Payment means type code" einen Schlüssel für Überweisungen enthält (30, 58), muss BG-17 "CREDIT TRANSFER" übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-61, BR-DE-19.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('30','58')] | /cn:CreditNote/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('30','58')]
```

Bedingung (muss erfüllt sein):

```
cac:PayeeFinancialAccount
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans[normalize-space(ram:TypeCode) = ('30','58')]
```

Bedingung (muss erfüllt sein):

```
ram:PayeePartyCreditorFinancialAccount
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-23)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-23/  
Datenstand: 2026-11-08
