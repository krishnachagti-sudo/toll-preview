# BR-DE-25: Lastschrift ohne Mandatsangaben (BG-19)

BR-DE-25 bedeutet: Wenn BT-81 "Payment means type code" einen Schlüssel für Lastschriften enthält (59), muss genau BG-19 "DIRECT DEBIT" übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie bei Code 59 die Mandatsreferenz (BT-89), die Gläubiger-ID (BT-90) und das belastete Konto (BT-91) an und entfernen Sie die Überweisungsangaben.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-25 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-81 Zahlungsart |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-25-a:** Wenn BT-81 "Payment means type code" einen Schlüssel für Lastschriften enthält (59), muss genau BG-19 "DIRECT DEBIT" übermittelt werden.

**Meldung BR-DE-25-b:** Wenn BT-81 "Payment means type code" einen Schlüssel für Lastschriften enthält (59), dürfen BG-17 und BG-18 nicht übermittelt werden.

## Was das heißt

Die Zahlungsart ist SEPA-Lastschrift (Code 59). Dann muss genau eine Gruppe DIRECT DEBIT (BG-19) mit dem Mandat vorhanden sein (BR-DE-25-a), und Überweisungs- oder Kartenangaben dürfen nicht vorkommen (BR-DE-25-b).

**Häufige Ursache:** Die Zahlungsart steht auf Lastschrift, aber Mandatsreferenz und belastetes Konto fehlen, oder die eigene IBAN steht zusätzlich als Überweisungskonto in der Rechnung.

## So beheben Sie den Fehler

Geben Sie bei Code 59 die Mandatsreferenz (BT-89), die Gläubiger-ID (BT-90) und das belastete Konto (BT-91) an und entfernen Sie die Überweisungsangaben.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-25-a; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
```

Fehlerhaft:

```xml
<cbc:PaymentMeansCode>59</cbc:PaymentMeansCode>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:PaymentMeans[1]`: Wenn BT-81 "Payment means type code" einen Schlüssel für Lastschriften enthält (59), muss genau BG-19 "DIRECT DEBIT" übermittelt werden.

Dieselbe Änderung löst außerdem aus: PEPPOL-EN16931-R061, BR-DE-20, BR-DE-25-b.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = '59'] | /cn:CreditNote/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = '59']
```

Bedingung (muss erfüllt sein):

```
cac:PaymentMandate
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans[normalize-space(ram:TypeCode) = '59']
```

Bedingung (muss erfüllt sein):

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:DirectDebitMandateID or /rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:CreditorReferenceID or ram:PayerPartyDebtorFinancialAccount/ram:IBANID
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-25)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-25/  
Datenstand: 2026-11-08
