# BR-DE-21: Spezifikationskennung (BT-24) entspricht nicht XRechnung

BR-DE-21 bedeutet: Das Element "Specification identifier" (BT-24) soll syntaktisch der Kennung des Standards XRechnung entsprechen. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Setzen Sie BT-24 auf die Kennung der Version, nach der die Rechnung erstellt ist. In der Praxis meldet der KoSIT-Validator bei einer falschen Kennung meist gar kein passendes Prüfszenario, weil er das Szenario an genau dieser Kennung erkennt; dieser Prüfer sagt dann ebenfalls, dass kein XRechnung-Szenario passt.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-21 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-24 Spezifikationskennung |

**Meldung BR-DE-21:** Das Element "Specification identifier" (BT-24) soll syntaktisch der Kennung des Standards XRechnung entsprechen.

## Was das heißt

Die Kennung in BT-24 (UBL cbc:CustomizationID, CII GuidelineSpecifiedDocumentContextParameter/ram:ID) ist keine der XRechnung-Kennungen. Für XRechnung 3.0 lautet sie urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung\_3.0.

**Häufige Ursache:** Das Programm schreibt eine ältere Version (xrechnung\_2.3) oder die allgemeine EN-16931-Kennung.

## So beheben Sie den Fehler

Setzen Sie BT-24 auf die Kennung der Version, nach der die Rechnung erstellt ist. In der Praxis meldet der KoSIT-Validator bei einer falschen Kennung meist gar kein passendes Prüfszenario, weil er das Szenario an genau dieser Kennung erkennt; dieser Prüfer sagt dann ebenfalls, dass kein XRechnung-Szenario passt.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
cbc:CustomizationID = $XR-CIUS-ID or cbc:CustomizationID = $XR-EXTENSION-ID or cbc:CustomizationID = $XR-CVD-ID
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:ExchangedDocumentContext
```

Bedingung (muss erfüllt sein):

```
ram:GuidelineSpecifiedDocumentContextParameter/ram:ID = $XR-CIUS-ID or ram:GuidelineSpecifiedDocumentContextParameter/ram:ID = $XR-EXTENSION-ID or ram:GuidelineSpecifiedDocumentContextParameter/ram:ID = $XR-CVD-ID
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-21)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-21/  
Datenstand: 2026-11-08
