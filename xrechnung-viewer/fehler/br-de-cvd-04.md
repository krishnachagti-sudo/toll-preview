# BR-DE-CVD-04: Unzulässige Fahrzeugkategorie in einer CVD-Rechnung

BR-DE-CVD-04 bedeutet: Ein ... "Item classification identifier" (BT-158) mit dem Scheme identifier 'CVD' muss einen Wert aus der Liste der zulässigen Fahrzeugkategorien enthalten. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Verwenden Sie eine der Kategorien M1, M2, M3, N1, N2 oder N3.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-CVD-04 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-CVD-04:** Ein ... "Item classification identifier" (BT-158) mit dem Scheme identifier 'CVD' muss einen Wert aus der Liste der zulässigen Fahrzeugkategorien enthalten.

## Was das heißt

Die Fahrzeugkategorie (BT-158 mit listID CVD) ist keine der zulässigen Kategorien M1, M2, M3, N1, N2 oder N3.

**Häufige Ursache:** Eine andere Kategorie oder ein Freitext wurde eingetragen.

## So beheben Sie den Fehler

Verwenden Sie eine der Kategorien M1, M2, M3, N1, N2 oder N3.

## Geprüftes Beispiel

Ausgangspunkt ist eine Testrechnung der KoSIT-Testsuite (XRechnung CVD). Mit der folgenden Änderung meldet der Prüfer BR-DE-CVD-04; ohne sie ist die Rechnung gültig.

Richtig:

```xml
listID="CVD">M2<
```

Fehlerhaft:

```xml
listID="CVD">Bus<
```

Gemeldet an der Stelle `/Invoice[1]/cac:InvoiceLine[1]/cac:Item[1]/cac:CommodityClassification[1]/cbc:ItemClassificationCode[1]`: Ein cbc:ItemClassificationCode "Item classification identifier" (BT-158) mit dem Scheme identifier 'CVD' muss einen Wert aus der Liste der zulässigen Fahrzeugkategorien enthalten.

Dieselbe Änderung löst außerdem aus: BR-CL-13.

## Die Prüfregel

UBL, Kontext:

```
(/ubl:Invoice[$isCVD]/cac:InvoiceLine | /cn:CreditNote[$isCVD]/cac:CreditNoteLine)/cac:Item/cac:CommodityClassification/cbc:ItemClassificationCode
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(@listID) = 'CVD') or normalize-space(.) = $CVD-VEHICLE-CATEGORY
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice[$isCVD]/rsm:SupplyChainTradeTransaction/ram:IncludedSupplyChainTradeLineItem/ram:SpecifiedTradeProduct/ram:DesignatedProductClassification/ram:ClassCode
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(@listID) = 'CVD') or normalize-space(.) = $CVD-VEHICLE-CATEGORY
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-CVD-04)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-cvd-04/  
Datenstand: 2026-11-08
