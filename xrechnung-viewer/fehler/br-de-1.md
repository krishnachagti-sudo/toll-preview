# BR-DE-1: Zahlungsangaben (BG-16) fehlen

BR-DE-1 bedeutet: Eine Rechnung (INVOICE) muss Angaben zu "PAYMENT INSTRUCTIONS" (BG-16) enthalten. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-1 (auch geschrieben BR-DE-01) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-1:** Eine Rechnung (INVOICE) muss Angaben zu "PAYMENT INSTRUCTIONS" (BG-16) enthalten.

## Was das heißt

Die Rechnung enthält keine Zahlungsanweisungen. Eine XRechnung muss sagen, wie bezahlt werden soll: mindestens den Code der Zahlungsart (BT-81), bei Überweisung auch die IBAN.

**Häufige Ursache:** Das Rechnungsprogramm schreibt die Bankverbindung nur ins PDF oder in eine Bemerkung, nicht in die strukturierten Felder.

## So beheben Sie den Fehler

Fügen Sie die Gruppe PAYMENT INSTRUCTIONS ein (in UBL `cac:PaymentMeans`, in CII `ram:SpecifiedTradeSettlementPaymentMeans`) mit Zahlungsart, zum Beispiel 58 für SEPA-Überweisung, und der IBAN des Verkäufers.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-1; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:PaymentMeans>
        <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
        <cbc:PaymentID>RE-2026-0417</cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>DE79000000001234567890</cbc:ID>
            <cbc:Name>Muster Elektro GmbH</cbc:Name>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Eine Rechnung (INVOICE) muss Angaben zu "PAYMENT INSTRUCTIONS" (BG-16) enthalten.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
cac:PaymentMeans
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-1)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-1/  
Datenstand: 2026-11-08
