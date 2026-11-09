# BR-DE-TMP-32: Liefer- oder Leistungsdatum fehlt (Hinweis)

BR-DE-TMP-32 bedeutet: Eine Rechnung sollte zur Angabe des Liefer-/Leistungsdatums entweder BT-72 "Actual delivery date", BG-14 "Invoicing period" oder in jeder Rechnungsposition BG-26 "Invoice line period" enthalten. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-TMP-32 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Hinweis: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-72 Liefer- oder Leistungsdatum |

**Meldung BR-DE-TMP-32:** Eine Rechnung sollte zur Angabe des Liefer-/Leistungsdatums entweder BT-72 "Actual delivery date", BG-14 "Invoicing period" oder in jeder Rechnungsposition BG-26 "Invoice line period" enthalten.

## Was das heißt

Die Rechnung nennt weder ein Lieferdatum (BT-72) noch einen Abrechnungszeitraum (BG-14) noch in jeder Position einen Leistungszeitraum (BG-26). Der Validator meldet das als Hinweis; das Leistungsdatum gehört aber zu den Pflichtangaben einer Rechnung nach § 14 Abs. 4 UStG.

**Häufige Ursache:** Das Leistungsdatum steht nur im Freitext („Leistung im Oktober“) oder wird weggelassen, wenn es dem Rechnungsdatum entspricht.

## So beheben Sie den Fehler

Geben Sie das Liefer- oder Leistungsdatum an (UBL `cac:Delivery/cbc:ActualDeliveryDate`, CII `ram:ActualDeliverySupplyChainEvent`) oder den Abrechnungszeitraum (UBL `cac:InvoicePeriod`, CII `ram:BillingSpecifiedPeriod`).

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-TMP-32; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:Delivery>
        <cbc:ActualDeliveryDate>2026-10-28</cbc:ActualDeliveryDate>
    </cac:Delivery>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Eine Rechnung sollte zur Angabe des Liefer-/Leistungsdatums entweder BT-72 "Actual delivery date", BG-14 "Invoicing period" oder in jeder Rechnungsposition BG-26 "Invoice line period" enthalten.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
cac:Delivery/cbc:ActualDeliveryDate or cac:InvoicePeriod or (every $line in (cac:InvoiceLine | cac:CreditNoteLine) satisfies $line/cac:InvoicePeriod)
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction
```

Bedingung (muss erfüllt sein):

```
ram:ApplicableHeaderTradeDelivery/ram:ActualDeliverySupplyChainEvent/ram:OccurrenceDateTime or ram:ApplicableHeaderTradeSettlement/ram:BillingSpecifiedPeriod or (every $line in ram:IncludedSupplyChainTradeLineItem satisfies $line/ram:SpecifiedLineTradeSettlement/ram:BillingSpecifiedPeriod)
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-TMP-32)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-tmp-32/  
Datenstand: 2026-11-08
