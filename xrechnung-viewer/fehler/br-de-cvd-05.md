# BR-DE-CVD-05: Unzulässiger Wert für cva in einer CVD-Rechnung

BR-DE-CVD-05 bedeutet: Wenn innerhalb von ... ITEM ATTRIBUTES (BG-32) der ... "Item attribute name" (BT-160) den Wert 'cva' hat, muss der ... "Item attribute value" (BT-161) einen der zulässigen Werte enthalten. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Verwenden Sie genau einen der Werte clean, zero-emission oder other.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-CVD-05 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-CVD-05:** Wenn innerhalb von ... ITEM ATTRIBUTES (BG-32) der ... "Item attribute name" (BT-160) den Wert 'cva' hat, muss der ... "Item attribute value" (BT-161) einen der zulässigen Werte enthalten.

## Was das heißt

Das Attribut cva (BT-161) hat keinen der zulässigen Werte clean, zero-emission oder other.

**Häufige Ursache:** Der Wert wurde übersetzt oder frei formuliert, etwa „sauber“.

## So beheben Sie den Fehler

Verwenden Sie genau einen der Werte clean, zero-emission oder other.

## Geprüftes Beispiel

Ausgangspunkt ist eine Testrechnung der KoSIT-Testsuite (XRechnung CVD). Mit der folgenden Änderung meldet der Prüfer BR-DE-CVD-05; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:Value>clean</cbc:Value>
```

Fehlerhaft:

```xml
<cbc:Value>sauber</cbc:Value>
```

Gemeldet an der Stelle `/Invoice[1]/cac:InvoiceLine[1]/cac:Item[1]/cac:AdditionalItemProperty[1]`: Wenn innerhalb von cac:AdditionalItemProperty ITEM ATTRIBUTES (BG-32) der cac:AdditionalItemProperty "Item attribute name" (BT-160) den Wert 'cva' hat, muss der cac:AdditionalItemProperty "Item attribute value" (BT-161) einen der zulässigen Werte enthalten.

Dieselbe Änderung löst außerdem aus: BR-CL-13.

## Die Prüfregel

UBL, Kontext:

```
(/ubl:Invoice[$isCVD]/cac:InvoiceLine | /cn:CreditNote[$isCVD]/cac:CreditNoteLine)/cac:Item/cac:AdditionalItemProperty[cbc:Name = 'cva']
```

Bedingung (muss erfüllt sein):

```
normalize-space(cbc:Value) = $CVA-CODES
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice[$isCVD]/rsm:SupplyChainTradeTransaction/ram:IncludedSupplyChainTradeLineItem/ram:SpecifiedTradeProduct/ram:ApplicableProductCharacteristic[ram:Description = 'cva']
```

Bedingung (muss erfüllt sein):

```
normalize-space(ram:Value) = $CVA-CODES
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-CVD-05)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-cvd-05/  
Datenstand: 2026-11-08
