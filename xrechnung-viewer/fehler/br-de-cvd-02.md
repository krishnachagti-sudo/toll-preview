# BR-DE-CVD-02: CVD-Rechnung ohne Vergabe- oder Losnummer (BT-17)

BR-DE-CVD-02 bedeutet: Das Element ... "Tender or lot reference" (BT-17) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie die Vergabe- oder Losnummer in BT-17 an (UBL cac:OriginatorDocumentReference/cbc:ID, CII AdditionalReferencedDocument mit TypeCode 50).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-CVD-02 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-17 Ausschreibung/Los |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-CVD-02:** Das Element ... "Tender or lot reference" (BT-17) muss übermittelt werden.

## Was das heißt

Eine Rechnung nach XRechnung CVD muss die Kennung der Ausschreibung oder des Loses nennen.

**Häufige Ursache:** Die Vergabenummer fehlt in den Auftragsdaten.

## So beheben Sie den Fehler

Geben Sie die Vergabe- oder Losnummer in BT-17 an (UBL cac:OriginatorDocumentReference/cbc:ID, CII AdditionalReferencedDocument mit TypeCode 50).

## Geprüftes Beispiel

Ausgangspunkt ist eine Testrechnung der KoSIT-Testsuite (XRechnung CVD). Mit der folgenden Änderung meldet der Prüfer BR-DE-CVD-02; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:OriginatorDocumentReference>
    <cbc:ID>ANG987654321</cbc:ID>
  </cac:OriginatorDocumentReference>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/Invoice[1]`: Das Element Invoice "Tender or lot reference" (BT-17) muss übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-CL-13.

## Die Prüfregel

UBL, Kontext:

```
(/ubl:Invoice | /cn:CreditNote)[$isCVD]
```

Bedingung (muss erfüllt sein):

```
cac:OriginatorDocumentReference/cbc:ID[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice[$isCVD]/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement
```

Bedingung (muss erfüllt sein):

```
ram:AdditionalReferencedDocument[normalize-space(ram:TypeCode) = '50' and normalize-space(ram:IssuerAssignedID)]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-CVD-02)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-cvd-02/  
Datenstand: 2026-11-08
