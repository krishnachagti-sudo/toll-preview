# BR-DE-CVD-06: CVD-Klassifikation und cva-Attribut nicht in derselben Position

BR-DE-CVD-06 bedeutet: Wenn der Scheme identifier von ... "Item classification identifier" (BT-158) mit dem Wert 'CVD' angegeben ist, muss in derselben Rechnungszeile genau ein ... "Item attribute name" (BT-160) mit dem Wert 'cva' vorhanden sein. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-CVD-06 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-CVD-06-a:** Wenn der Scheme identifier von ... "Item classification identifier" (BT-158) mit dem Wert 'CVD' angegeben ist, muss in derselben Rechnungszeile genau ein ... "Item attribute name" (BT-160) mit dem Wert 'cva' vorhanden sein.

**Meldung BR-DE-CVD-06-b:** Wenn ... "Item attribute name" (BT-160) mit dem Wert 'cva' angegeben ist, muss in derselben Rechnungszeile genau ein ... "Item classification identifier" (BT-158) mit dem Scheme identifier 'CVD' vorhanden sein.

## Was das heißt

In einer Position steht die Fahrzeugklassifikation CVD ohne das Attribut cva (BR-DE-CVD-06-a), oder das Attribut cva ohne die Klassifikation CVD (BR-DE-CVD-06-b). Beides gehört in dieselbe Rechnungsposition.

**Häufige Ursache:** Die Angaben wurden auf zwei Positionen verteilt oder eine davon vergessen.

## So beheben Sie den Fehler

Geben Sie in der Fahrzeugposition genau eine Klassifikation mit listID CVD und genau ein Attribut cva an.

## Geprüftes Beispiel

Ausgangspunkt ist eine Testrechnung der KoSIT-Testsuite (XRechnung CVD). Mit der folgenden Änderung meldet der Prüfer BR-DE-CVD-06-a; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:Name>cva</cbc:Name>
```

Fehlerhaft:

```xml
<cbc:Name>Antrieb</cbc:Name>
```

Gemeldet an der Stelle `/Invoice[1]/cac:InvoiceLine[1]/cac:Item[1]`: Wenn der Scheme identifier von cac:Item "Item classification identifier" (BT-158) mit dem Wert 'CVD' angegeben ist, muss in derselben Rechnungszeile genau ein cac:Item "Item attribute name" (BT-160) mit dem Wert 'cva' vorhanden sein.

Dieselbe Änderung löst außerdem aus: BR-CL-13, BR-DE-CVD-03.

## Die Prüfregel

UBL, Kontext:

```
(/ubl:Invoice[$isCVD]/cac:InvoiceLine | /cn:CreditNote[$isCVD]/cac:CreditNoteLine)/cac:Item
```

Bedingung (muss erfüllt sein):

```
not(cac:CommodityClassification/cbc:ItemClassificationCode[@listID = 'CVD']) or count(cac:AdditionalItemProperty[cbc:Name = 'cva']) = 1
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice[$isCVD]/rsm:SupplyChainTradeTransaction/ram:IncludedSupplyChainTradeLineItem/ram:SpecifiedTradeProduct
```

Bedingung (muss erfüllt sein):

```
not(ram:DesignatedProductClassification/ram:ClassCode/@listID = 'CVD') or count(ram:ApplicableProductCharacteristic[ram:Description = 'cva']) = 1
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-CVD-06)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-cvd-06/  
Datenstand: 2026-11-08
