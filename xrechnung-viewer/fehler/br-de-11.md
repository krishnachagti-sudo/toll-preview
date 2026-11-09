# BR-DE-11: Postleitzahl der Lieferanschrift (BT-78) fehlt

BR-DE-11 bedeutet: Das Element "Deliver to post code" (BT-78) muss übermittelt werden, wenn die Gruppe "DELIVER TO ADDRESS" (BG-15) übermittelt wird. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-11 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-78 Postleitzahl |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-11:** Das Element "Deliver to post code" (BT-78) muss übermittelt werden, wenn die Gruppe "DELIVER TO ADDRESS" (BG-15) übermittelt wird.

## Was das heißt

Die Rechnung hat eine abweichende Lieferanschrift (BG-15), aber ohne Postleitzahl.

**Häufige Ursache:** Eine Baustellen- oder Lieferadresse wurde nur mit Straße und Ort übernommen.

## So beheben Sie den Fehler

Vervollständigen Sie die Lieferanschrift um die Postleitzahl.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-11; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:Delivery>
    <cbc:ActualDeliveryDate>2026-10-28</cbc:ActualDeliveryDate>
```

Fehlerhaft:

```xml
<cac:Delivery>
    <cbc:ActualDeliveryDate>2026-10-28</cbc:ActualDeliveryDate>
    <cac:DeliveryLocation>
        <cac:Address>
            <cbc:StreetName>Schulweg 4</cbc:StreetName>
            <cbc:CityName>Musterstadt</cbc:CityName>
            <cac:Country>
                <cbc:IdentificationCode>DE</cbc:IdentificationCode>
            </cac:Country>
        </cac:Address>
    </cac:DeliveryLocation>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:Delivery[1]/cac:DeliveryLocation[1]/cac:Address[1]`: Das Element "Deliver to post code" (BT-78) muss übermittelt werden, wenn die Gruppe "DELIVER TO ADDRESS" (BG-15) übermittelt wird.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:Delivery/cac:DeliveryLocation/cac:Address | /cn:CreditNote/cac:Delivery/cac:DeliveryLocation/cac:Address
```

Bedingung (muss erfüllt sein):

```
cbc:PostalZone[boolean(normalize-space(.))]
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeDelivery/ram:ShipToTradeParty/ram:PostalTradeAddress
```

Bedingung (muss erfüllt sein):

```
ram:PostcodeCode[boolean(normalize-space(.))]
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-11)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-11/  
Datenstand: 2026-11-08
