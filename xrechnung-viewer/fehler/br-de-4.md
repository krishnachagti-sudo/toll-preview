# BR-DE-4: Postleitzahl des Verkäufers (BT-38) fehlt

BR-DE-4 bedeutet: Das Element "Seller post code" (BT-38) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-4 (auch geschrieben BR-DE-04) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-38 Postleitzahl |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-DE-4:** Das Element "Seller post code" (BT-38) muss übermittelt werden.

## Was das heißt

In der Anschrift des Verkäufers fehlt die Postleitzahl.

**Häufige Ursache:** Die Postleitzahl steht zusammen mit dem Ort in einem Feld oder fehlt in den Stammdaten.

## So beheben Sie den Fehler

Geben Sie die Postleitzahl im eigenen Feld an (UBL `cbc:PostalZone`, CII `ram:PostcodeCode`).

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-4; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:PostalZone>70173</cbc:PostalZone>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]/cac:Party[1]/cac:PostalAddress[1]`: Das Element "Seller post code" (BT-38) muss übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress | /cn:CreditNote/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress
```

Bedingung (muss erfüllt sein):

```
cbc:PostalZone[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty/ram:PostalTradeAddress
```

Bedingung (muss erfüllt sein):

```
ram:PostcodeCode[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-4)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-4/  
Datenstand: 2026-11-08
