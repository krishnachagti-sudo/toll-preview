# BR-DE-9: Postleitzahl des Käufers (BT-53) fehlt

BR-DE-9 bedeutet: Das Element "Buyer post code" (BT-53) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-9 (auch geschrieben BR-DE-09) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-53 Postleitzahl |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-DE-9:** Das Element "Buyer post code" (BT-53) muss übermittelt werden.

## Was das heißt

In der Anschrift des Käufers fehlt die Postleitzahl.

**Häufige Ursache:** Die Kundenanschrift ist unvollständig, oft bei Postfach-Adressen.

## So beheben Sie den Fehler

Geben Sie die Postleitzahl des Käufers im eigenen Feld an.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-9; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:PostalZone>12345</cbc:PostalZone>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingCustomerParty[1]/cac:Party[1]/cac:PostalAddress[1]`: Das Element "Buyer post code" (BT-53) muss übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PostalAddress | /cn:CreditNote/cac:AccountingCustomerParty/cac:Party/cac:PostalAddress
```

Bedingung (muss erfüllt sein):

```
cbc:PostalZone[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:BuyerTradeParty/ram:PostalTradeAddress
```

Bedingung (muss erfüllt sein):

```
ram:PostcodeCode[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-9)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-9/  
Datenstand: 2026-11-08
