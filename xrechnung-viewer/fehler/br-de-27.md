# BR-DE-27: Telefonnummer (BT-42) hat weniger als drei Ziffern

BR-DE-27 bedeutet: In BT-42 sollen mindestens drei Ziffern enthalten sein. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie eine echte Telefonnummer an.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-27 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-42 Telefon |

**Meldung BR-DE-27:** In BT-42 sollen mindestens drei Ziffern enthalten sein.

## Was das heißt

Die Telefonnummer des Verkäufers enthält weniger als drei Ziffern. Das ist eine Warnung.

**Häufige Ursache:** Im Telefonfeld steht ein Text wie „siehe Website“ oder „Zentrale“.

## So beheben Sie den Fehler

Geben Sie eine echte Telefonnummer an.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-27; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:Telephone>+49 711 123456</cbc:Telephone>
```

Fehlerhaft:

```xml
<cbc:Telephone>Zentrale</cbc:Telephone>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]/cac:Party[1]/cac:Contact[1]`: In BT-42 sollen mindestens drei Ziffern enthalten sein.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact | /cn:CreditNote/cac:AccountingSupplierParty/cac:Party/cac:Contact
```

Bedingung (muss erfüllt sein):

```
matches(normalize-space(cbc:Telephone), $XR-TELEPHONE-REGEX)
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty/ram:DefinedTradeContact
```

Bedingung (muss erfüllt sein):

```
matches(normalize-space(ram:TelephoneUniversalCommunication/ram:CompleteNumber), $XR-TELEPHONE-REGEX)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-27)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-27/  
Datenstand: 2026-11-08
