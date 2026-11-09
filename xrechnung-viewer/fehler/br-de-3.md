# BR-DE-3: Ort des Verkäufers (BT-37) fehlt

BR-DE-3 bedeutet: Das Element "Seller city" (BT-37) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-3 (auch geschrieben BR-DE-03) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-37 Ort |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-DE-3:** Das Element "Seller city" (BT-37) muss übermittelt werden.

## Was das heißt

In der Anschrift des Verkäufers fehlt der Ort. XRechnung verlangt ihn, auch wenn EN 16931 allein ihn nicht vorschreibt.

**Häufige Ursache:** Ort und Postleitzahl stehen in den Stammdaten in einem gemeinsamen Feld oder nur in einer Adresszeile.

## So beheben Sie den Fehler

Tragen Sie den Ort in das eigene Feld ein (UBL `cbc:CityName`, CII `ram:CityName`) und nicht in die Straßenzeile.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-3; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:CityName>Stuttgart</cbc:CityName>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]/cac:Party[1]/cac:PostalAddress[1]`: Das Element "Seller city" (BT-37) muss übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress | /cn:CreditNote/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress
```

Bedingung (muss erfüllt sein):

```
cbc:CityName[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty/ram:PostalTradeAddress
```

Bedingung (muss erfüllt sein):

```
ram:CityName[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-3)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-3/  
Datenstand: 2026-11-08
