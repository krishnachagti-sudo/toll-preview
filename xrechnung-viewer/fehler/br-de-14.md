# BR-DE-14: Steuersatz in der Umsatzsteueraufschlüsselung (BT-119) fehlt

BR-DE-14 bedeutet: Das Element "VAT category rate" (BT-119) muss übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-14 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-119 Steuersatz |
| BMF-Schreiben 15.10.2025 | mögliches Inhaltsfehler-Thema (Rn. 35a) |

**Meldung BR-DE-14:** Das Element "VAT category rate" (BT-119) muss übermittelt werden.

## Was das heißt

Eine Zeile der Umsatzsteueraufschlüsselung (BG-23) nennt keinen Steuersatz. XRechnung verlangt ihn in jeder Aufschlüsselung, auch bei 0 %.

**Häufige Ursache:** Bei steuerfreien Umsätzen oder Reverse Charge wird der Satz weggelassen statt als 0 übertragen.

## So beheben Sie den Fehler

Geben Sie in jeder Steueraufschlüsselung den Satz an (UBL `cac:TaxCategory/cbc:Percent`, CII `ram:RateApplicablePercent`), bei steuerfreien Umsätzen 0.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-14; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:Percent>7</cbc:Percent>
```

Fehlerhaft:

```xml
(entfernt)
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:TaxTotal[1]/cac:TaxSubtotal[2]`: Das Element "VAT category rate" (BT-119) muss übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-48, BR-CO-17, BR-S-09.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:TaxTotal/cac:TaxSubtotal | /cn:CreditNote/cac:TaxTotal/cac:TaxSubtotal
```

Bedingung (muss erfüllt sein):

```
cac:TaxCategory/cbc:Percent[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:ApplicableTradeTax
```

Bedingung (muss erfüllt sein):

```
ram:RateApplicablePercent[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-14)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-14/  
Datenstand: 2026-11-08
