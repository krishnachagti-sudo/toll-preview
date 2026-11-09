# BR-DE-30: Lastschrift ohne Gläubiger-Identifikationsnummer (BT-90)

BR-DE-30 bedeutet: Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Bank assigned creditor identifier" BT-90 übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-30 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-90 Gläubiger-ID |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-30:** Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Bank assigned creditor identifier" BT-90 übermittelt werden.

## Was das heißt

Die Rechnung enthält ein Lastschriftmandat (BG-19), aber keine Gläubiger-ID des Verkäufers.

**Häufige Ursache:** Die Gläubiger-ID ist in den Firmendaten nicht hinterlegt.

## So beheben Sie den Fehler

Geben Sie die Gläubiger-ID an: in UBL als `cac:PartyIdentification/cbc:ID` mit schemeID="SEPA" beim Verkäufer oder Zahlungsempfänger, in CII als `ram:CreditorReferenceID`.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-30; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:PaymentMeans>
        <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>
        <cbc:PaymentID>RE-2026-0417</cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>DE79000000001234567890</cbc:ID>
            <cbc:Name>Muster Elektro GmbH</cbc:Name>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>
```

Fehlerhaft:

```xml
<cac:PaymentMeans>
        <cbc:PaymentMeansCode>59</cbc:PaymentMeansCode>
        <cbc:PaymentID>RE-2026-0417</cbc:PaymentID>
        <cac:PaymentMandate>
            <cbc:ID>MANDAT-0815</cbc:ID>
            <cac:PayerFinancialAccount>
                <cbc:ID>DE79000000001234567890</cbc:ID>
            </cac:PayerFinancialAccount>
        </cac:PaymentMandate>
    </cac:PaymentMeans>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Bank assigned creditor identifier" BT-90 übermittelt werden.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
not(cac:PaymentMeans/cac:PaymentMandate) or (cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='SEPA'] | cac:PayeeParty/cac:PartyIdentification/cbc:ID[@schemeID='SEPA'])
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
(($BT-89-path or $BT-91-path) and $BT-90-path) or $BG-19-not-existing
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-30)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-30/  
Datenstand: 2026-11-08
