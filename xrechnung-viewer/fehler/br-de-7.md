# BR-DE-7: E-Mail des Verkäufers (BT-43) fehlt

BR-DE-7 bedeutet: Das Element "Seller contact email address" (BT-43) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie im Kontakt eine E-Mail-Adresse an (UBL cac:Contact/cbc:ElectronicMail, CII ram:EmailURIUniversalCommunication/ram:URIID).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-7 (auch geschrieben BR-DE-07) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-43 E-Mail |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-7:** Das Element "Seller contact email address" (BT-43) muss übermittelt werden.

## Was das heißt

Der Kontakt des Verkäufers hat keine E-Mail-Adresse.

**Häufige Ursache:** Die E-Mail steht nur als elektronische Adresse (BT-34) in der Rechnung, nicht im Kontakt.

## So beheben Sie den Fehler

Geben Sie im Kontakt eine E-Mail-Adresse an (UBL cac:Contact/cbc:ElectronicMail, CII ram:EmailURIUniversalCommunication/ram:URIID).

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-7; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:ElectronicMail>rechnung@muster-elektro.example</cbc:ElectronicMail>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]/cac:Party[1]/cac:Contact[1]`: Das Element "Seller contact email address" (BT-43) muss übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-DE-28.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact | /cn:CreditNote/cac:AccountingSupplierParty/cac:Party/cac:Contact
```

Bedingung (muss erfüllt sein):

```
cbc:ElectronicMail[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty/ram:DefinedTradeContact
```

Bedingung (muss erfüllt sein):

```
ram:EmailURIUniversalCommunication/ram:URIID[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-7)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-7/  
Datenstand: 2026-11-08
