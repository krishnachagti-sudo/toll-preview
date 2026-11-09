# BR-DE-CVD-03: CVD-Rechnung ohne Fahrzeugposition

BR-DE-CVD-03 bedeutet: In einer Rechnung muss mindestens eine ... INVOICE LINE (BG-25) enthalten sein, in der der Scheme identifier von ... "Item classification identifier" (BT-158) den Wert 'CVD' und der ... "Item attribute name" (BT-160) den Wert 'cva' enthält. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-CVD-03 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-DE-CVD-03:** In einer Rechnung muss mindestens eine ... INVOICE LINE (BG-25) enthalten sein, in der der Scheme identifier von ... "Item classification identifier" (BT-158) den Wert 'CVD' und der ... "Item attribute name" (BT-160) den Wert 'cva' enthält.

## Was das heißt

Eine Rechnung nach XRechnung CVD muss mindestens eine Position enthalten, die das Fahrzeug mit der Klassifikation CVD (BT-158) und dem Attribut cva (BT-160) beschreibt.

**Häufige Ursache:** Die Fahrzeugkategorie oder die Angabe zur Sauberkeit des Fahrzeugs wurde nicht strukturiert übertragen.

## So beheben Sie den Fehler

Geben Sie in der Fahrzeugposition die Fahrzeugkategorie mit listID CVD und das Attribut cva mit einem der zulässigen Werte an.

## Geprüftes Beispiel

Ausgangspunkt ist eine Testrechnung der KoSIT-Testsuite (XRechnung CVD). Mit der folgenden Änderung meldet der Prüfer BR-DE-CVD-03; ohne sie ist die Rechnung gültig.

Richtig:

```xml
listID="CVD">M2<
```

Fehlerhaft:

```xml
listID="STI">M2<
```

Richtig:

```xml
<cbc:Name>cva</cbc:Name>
```

Fehlerhaft:

```xml
<cbc:Name>Antrieb</cbc:Name>
```

Gemeldet an der Stelle `/Invoice[1]`: In einer Rechnung muss mindestens eine Invoice INVOICE LINE (BG-25) enthalten sein, in der der Scheme identifier von Invoice "Item classification identifier" (BT-158) den Wert 'CVD' und der Invoice "Item attribute name" (BT-160) den Wert 'cva' enthält.

## Die Prüfregel

UBL, Kontext:

```
(/ubl:Invoice | /cn:CreditNote)[$isCVD]
```

Bedingung (muss erfüllt sein):

```
(cac:InvoiceLine/cac:Item | cac:CreditNoteLine/cac:Item)[cac:CommodityClassification/cbc:ItemClassificationCode/@listID = 'CVD' and cac:AdditionalItemProperty/cbc:Name = 'cva']
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice[$isCVD]/rsm:SupplyChainTradeTransaction
```

Bedingung (muss erfüllt sein):

```
ram:IncludedSupplyChainTradeLineItem/ram:SpecifiedTradeProduct[ram:DesignatedProductClassification/ram:ClassCode/@listID = 'CVD' and ram:ApplicableProductCharacteristic/ram:Description = 'cva']
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-CVD-03)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-cvd-03/  
Datenstand: 2026-11-08
