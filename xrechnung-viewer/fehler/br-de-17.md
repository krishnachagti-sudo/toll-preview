# BR-DE-17: Rechnungsart (BT-3) außerhalb der in XRechnung vorgesehenen Codes

BR-DE-17 bedeutet: Mit dem Element "Invoice type code" (BT-3) sollen ausschließlich folgende Codes aus der Codeliste UNTDID 1001 übermittelt werden: 326 (Partial invoice), 380 (Commercial invoice), 384 (Corrected invoice), 389 (Self-billed invoice) und 381 (Credit note),875 (Partial construction invoice), 876 (Partial final construction invoice), 877 (Final construction invoice). (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Verwenden Sie für eine normale Rechnung 380, für eine Gutschrift (Rechnungskorrektur) 381, für eine korrigierte Rechnung 384, für eine Teilrechnung 326 und für eine Gutschrift im Gutschriftsverfahren 389.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-17 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-3 Rechnungsart |

**Meldung BR-DE-17:** Mit dem Element "Invoice type code" (BT-3) sollen ausschließlich folgende Codes aus der Codeliste UNTDID 1001 übermittelt werden: 326 (Partial invoice), 380 (Commercial invoice), 384 (Corrected invoice), 389 (Self-billed invoice) und 381 (Credit note),875 (Partial construction invoice), 876 (Partial final construction invoice), 877 (Final construction invoice).

## Was das heißt

Der Code der Rechnungsart ist zwar in der Codeliste UNTDID 1001 enthalten, aber XRechnung sieht nur einige Codes vor, darunter 326, 380, 381, 384 und 389. Das ist eine Warnung, kein Fehler.

**Häufige Ursache:** Das Programm verwendet einen allgemeinen Code wie 383 (Belastungsanzeige) oder 393.

## So beheben Sie den Fehler

Verwenden Sie für eine normale Rechnung 380, für eine Gutschrift (Rechnungskorrektur) 381, für eine korrigierte Rechnung 384, für eine Teilrechnung 326 und für eine Gutschrift im Gutschriftsverfahren 389.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-17; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
```

Fehlerhaft:

```xml
<cbc:InvoiceTypeCode>383</cbc:InvoiceTypeCode>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Mit dem Element "Invoice type code" (BT-3) sollen ausschließlich folgende Codes aus der Codeliste UNTDID 1001 übermittelt werden: 326 (Partial invoice), 380 (Commercial invoice), 384 (Corrected invoice), 389 (Self-billed invoice) und 381 (Credit note),875 (Partial construction invoice), 876 (Partial final construction invoice), 877 (Final construction invoice).

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
normalize-space(cbc:InvoiceTypeCode) = $supportedInvAndCNTypeCodes or normalize-space(cbc:CreditNoteTypeCode) = $supportedInvAndCNTypeCodes
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
normalize-space(rsm:ExchangedDocument/ram:TypeCode) = ('326', '380', '384', '389', '381', '875', '876', '877')
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-17)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-17/  
Datenstand: 2026-11-08
