# BR-DE-19: IBAN (BT-84) ungültig bei SEPA-Überweisung

BR-DE-19 bedeutet: "Payment account identifier" (BT-84) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 58 SEPA als Zahlungsmittel gefordert wird. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-19 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-84 IBAN / Kontonummer; BT-81 Zahlungsart |

**Meldung BR-DE-19:** "Payment account identifier" (BT-84) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 58 SEPA als Zahlungsmittel gefordert wird.

## Was das heißt

Die Zahlungsart ist SEPA-Überweisung (Code 58), aber die angegebene Kontonummer ist keine gültige IBAN: Aufbau oder Prüfziffer stimmen nicht. Das ist eine Warnung.

**Häufige Ursache:** Ein Tippfehler in der IBAN, Leerzeichen an falscher Stelle, oder eine Kontonummer ohne IBAN-Format.

## So beheben Sie den Fehler

Prüfen Sie die IBAN in den Stammdaten. Leerzeichen sind erlaubt und werden für die Prüfung entfernt; die Prüfziffer (Stellen 3 und 4) muss stimmen.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-19; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:ID>DE79000000001234567890</cbc:ID>
```

Fehlerhaft:

```xml
<cbc:ID>DE79000000001234567891</cbc:ID>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:PaymentMeans[1]`: "Payment account identifier" (BT-84) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 58 SEPA als Zahlungsmittel gefordert wird.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('30','58')] | /cn:CreditNote/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = ('30','58')]
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(cbc:PaymentMeansCode) = '58') or xr:checkIBAN(string(cac:PayeeFinancialAccount/cbc:ID))
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans[normalize-space(ram:TypeCode) = ('30','58')]
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(ram:TypeCode) = '58') or xr:checkIBAN(string(ram:PayeePartyCreditorFinancialAccount/ram:IBANID))
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-19)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-19/  
Datenstand: 2026-11-08
