# BR-DE-2: Kontaktdaten des Verkäufers (BG-6) fehlen

BR-DE-2 bedeutet: Die Gruppe "SELLER CONTACT" (BG-6) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Ergänzen Sie den Kontakt des Verkäufers (UBL cac:Contact, CII ram:DefinedTradeContact) mit Name (BT-41), Telefon (BT-42) und E-Mail (BT-43). Fehlt nur eines der drei Felder, melden sich BR-DE-5, BR-DE-6 oder BR-DE-7.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-2 (auch geschrieben BR-DE-02) |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-2:** Die Gruppe "SELLER CONTACT" (BG-6) muss übermittelt werden.

## Was das heißt

In einer XRechnung muss der Verkäufer einen Ansprechpartner mit Namen, Telefon und E-Mail angeben. Die ganze Gruppe SELLER CONTACT fehlt.

**Häufige Ursache:** Viele Programme füllen den Kontakt nur, wenn in den Stammdaten ein Ansprechpartner gepflegt ist.

## So beheben Sie den Fehler

Ergänzen Sie den Kontakt des Verkäufers (UBL cac:Contact, CII ram:DefinedTradeContact) mit Name (BT-41), Telefon (BT-42) und E-Mail (BT-43). Fehlt nur eines der drei Felder, melden sich BR-DE-5, BR-DE-6 oder BR-DE-7.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-2; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:Contact>
        <cbc:Name>Anna Beispiel</cbc:Name>
        <cbc:Telephone>+49 711 123456</cbc:Telephone>
        <cbc:ElectronicMail>rechnung@muster-elektro.example</cbc:ElectronicMail>
    </cac:Contact>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]`: Die Gruppe "SELLER CONTACT" (BG-6) muss übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty | /cn:CreditNote/cac:AccountingSupplierParty
```

Bedingung (muss erfüllt sein):

```
cac:Party/cac:Contact
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty
```

Bedingung (muss erfüllt sein):

```
ram:DefinedTradeContact
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-2)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-2/  
Datenstand: 2026-11-08
