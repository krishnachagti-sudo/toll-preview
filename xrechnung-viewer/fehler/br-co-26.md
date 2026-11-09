# BR-CO-26: Keine Kennung des Verkäufers (BT-29, BT-30 oder BT-31)

BR-CO-26 bedeutet: In order for the buyer to automatically identify a supplier, the Seller identifier (BT-29), the Seller legal registration identifier (BT-30) and/or the Seller VAT identifier (BT-31) shall be present. (CEN-Schematron EN 16931 1.3.16, KoSIT-Konfiguration 2026-08-31). Geben Sie die USt-IdNr. (BT-31) oder die Handelsregisternummer (BT-30) an; Kleinunternehmer ohne USt-IdNr. können eine Kennung wie die Lieferantennummer beim Kunden (BT-29) verwenden.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-CO-26 |
| Quelle | CEN-Schematron EN 16931 1.3.16 |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-29 Kennung des Verkäufers; BT-30 Registernummer; BT-31 USt-IdNr. des Verkäufers |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-CO-26:** In order for the buyer to automatically identify a supplier, the Seller identifier (BT-29), the Seller legal registration identifier (BT-30) and/or the Seller VAT identifier (BT-31) shall be present.

## Was das heißt

Damit der Käufer den Lieferanten automatisch erkennen kann, muss mindestens eine Kennung des Verkäufers angegeben sein: eine Kennung (BT-29), die Registernummer (BT-30) oder die USt-IdNr. (BT-31).

**Häufige Ursache:** Der Verkäufer hat nur eine Steuernummer (BT-32) oder gar keine Kennung angegeben.

## So beheben Sie den Fehler

Geben Sie die USt-IdNr. (BT-31) oder die Handelsregisternummer (BT-30) an; Kleinunternehmer ohne USt-IdNr. können eine Kennung wie die Lieferantennummer beim Kunden (BT-29) verwenden.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-CO-26; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:PartyTaxScheme>
        <cbc:CompanyID>DE123456789</cbc:CompanyID>
        <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
    </cac:PartyTaxScheme>
```

Fehlerhaft:

```xml
(entfernt)
```

Richtig:

```xml
<cbc:CompanyID>HRB 700001</cbc:CompanyID>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]`: In order for the buyer to automatically identify a supplier, the Seller identifier (BT-29), the Seller legal registration identifier (BT-30) and/or the Seller VAT identifier (BT-31) shall be present.

Dieselbe Änderung löst außerdem aus: BR-S-02, BR-DE-16.

## Die Prüfregel

UBL, Kontext:

```
cac:AccountingSupplierParty
```

Bedingung (muss erfüllt sein):

```
exists(cac:Party/cac:PartyTaxScheme[cac:TaxScheme/normalize-space(upper-case(cbc:ID))='VAT']/cbc:CompanyID) or exists(cac:Party/cac:PartyIdentification/cbc:ID[not(@schemeID = 'SEPA')]) or exists(cac:Party/cac:PartyLegalEntity/cbc:CompanyID)
```

CII, Kontext:

```
//ram:SellerTradeParty
```

Bedingung (muss erfüllt sein):

```
(ram:ID) or (ram:GlobalID) or (ram:SpecifiedLegalOrganization/ram:ID) or (ram:SpecifiedTaxRegistration/ram:ID[@schemeID='VA'])
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-CO-26)

## Quellen

- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-co-26/  
Datenstand: 2026-11-08
