# BR-DE-26: Korrigierte Rechnung (384) ohne Bezug auf die ursprüngliche Rechnung

BR-DE-26 bedeutet: Wenn im Element "Invoice type code" (BT-3) der Code 384 (Corrected invoice) übergeben wird, soll PRECEDING INVOICE REFERENCE BG-3 mind. einmal vorhanden sein. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie die Nummer der ursprünglichen Rechnung (BT-25) und möglichst ihr Datum (BT-26) an: UBL cac:BillingReference/cac:InvoiceDocumentReference, CII ram:InvoiceReferencedDocument.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-26 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-3 Rechnungsart |

**Meldung BR-DE-26:** Wenn im Element "Invoice type code" (BT-3) der Code 384 (Corrected invoice) übergeben wird, soll PRECEDING INVOICE REFERENCE BG-3 mind. einmal vorhanden sein.

## Was das heißt

Die Rechnungsart ist 384 (korrigierte Rechnung), aber die Rechnung nennt nicht die Rechnung, die sie korrigiert (BG-3). Das ist eine Warnung.

**Häufige Ursache:** Die Korrektur wird als neue Rechnung angelegt, ohne Verweis auf die Originalnummer.

## So beheben Sie den Fehler

Geben Sie die Nummer der ursprünglichen Rechnung (BT-25) und möglichst ihr Datum (BT-26) an: UBL cac:BillingReference/cac:InvoiceDocumentReference, CII ram:InvoiceReferencedDocument.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-26; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
```

Fehlerhaft:

```xml
<cbc:InvoiceTypeCode>384</cbc:InvoiceTypeCode>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Wenn im Element "Invoice type code" (BT-3) der Code 384 (Corrected invoice) übergeben wird, soll PRECEDING INVOICE REFERENCE BG-3 mind. einmal vorhanden sein.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
((not(normalize-space(cbc:InvoiceTypeCode) = '384' or normalize-space(cbc:CreditNoteTypeCode) = '384') or (cac:BillingReference/cac:InvoiceDocumentReference)))
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(rsm:ExchangedDocument/ram:TypeCode) = '384') or (rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:InvoiceReferencedDocument)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-26)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-26/  
Datenstand: 2026-11-08
