# BR-DE-28: E-Mail-Adresse (BT-43) hat kein gültiges Format

BR-DE-28 bedeutet: In BT-43 soll genau ein @-Zeichen enthalten sein, welches nicht von einem Leerzeichen, einem Punkt, aber mindestens zwei Zeichen auf beiden Seiten flankiert werden soll. Ein Punkt sollte nicht am Anfang oder am Ende stehen. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-28 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-43 E-Mail |

**Meldung BR-DE-28:** In BT-43 soll genau ein @-Zeichen enthalten sein, welches nicht von einem Leerzeichen, einem Punkt, aber mindestens zwei Zeichen auf beiden Seiten flankiert werden soll. Ein Punkt sollte nicht am Anfang oder am Ende stehen.

## Was das heißt

Die E-Mail-Adresse im Kontakt des Verkäufers entspricht nicht dem erwarteten Aufbau: genau ein @, auf beiden Seiten mindestens zwei Zeichen, kein Punkt am Anfang oder Ende. Das ist eine Warnung.

**Häufige Ursache:** Die Adresse ist verschleiert (rechnung(at)firma.de) oder enthält Leerzeichen.

## So beheben Sie den Fehler

Geben Sie eine normale E-Mail-Adresse an.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-28; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:ElectronicMail>rechnung@muster-elektro.example</cbc:ElectronicMail>
```

Fehlerhaft:

```xml
<cbc:ElectronicMail>rechnung(at)muster-elektro.example</cbc:ElectronicMail>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:AccountingSupplierParty[1]/cac:Party[1]/cac:Contact[1]`: In BT-43 soll genau ein @-Zeichen enthalten sein, welches nicht von einem Leerzeichen, einem Punkt, aber mindestens zwei Zeichen auf beiden Seiten flankiert werden soll. Ein Punkt sollte nicht am Anfang oder am Ende stehen.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact | /cn:CreditNote/cac:AccountingSupplierParty/cac:Party/cac:Contact
```

Bedingung (muss erfüllt sein):

```
matches(normalize-space(cbc:ElectronicMail), $XR-EMAIL-REGEX)
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:SellerTradeParty/ram:DefinedTradeContact
```

Bedingung (muss erfüllt sein):

```
matches(normalize-space(ram:EmailURIUniversalCommunication/ram:URIID), $XR-EMAIL-REGEX)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-28)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-28/  
Datenstand: 2026-11-08
