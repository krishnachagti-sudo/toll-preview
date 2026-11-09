# BR-DE-15: Käuferreferenz (BT-10) fehlt, meist die Leitweg-ID

BR-DE-15 bedeutet: Das Element "Buyer reference" (BT-10) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-15 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-10 Käuferreferenz (Leitweg-ID) |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-15:** Das Element "Buyer reference" (BT-10) muss übermittelt werden.

## Was das heißt

Die Rechnung enthält keine Käuferreferenz. Bei Rechnungen an öffentliche Auftraggeber steht hier die Leitweg-ID; ohne sie kann die Rechnung nicht zugestellt werden.

**Häufige Ursache:** Die Leitweg-ID wurde nicht beim Kunden hinterlegt, oder das Programm schreibt sie in ein anderes Feld wie die Bestellnummer.

## So beheben Sie den Fehler

Tragen Sie die Leitweg-ID (oder bei privaten Kunden die vereinbarte Referenz) in BT-10 ein: UBL `cbc:BuyerReference`, CII `ram:ApplicableHeaderTradeAgreement/ram:BuyerReference`. Die Leitweg-ID nennt Ihnen der öffentliche Auftraggeber.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-15; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:BuyerReference>04011000-12345-03</cbc:BuyerReference>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Das Element "Buyer reference" (BT-10) muss übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
cbc:BuyerReference[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:BuyerReference[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-15)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/  
Datenstand: 2026-11-08
