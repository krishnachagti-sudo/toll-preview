# BR-DE-31: Lastschrift ohne belastetes Konto (BT-91)

BR-DE-31 bedeutet: Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Debited account identifier" BT-91 übermittelt werden. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Geben Sie die IBAN des Käufers als belastetes Konto an: UBL cac:PaymentMandate/cac:PayerFinancialAccount/cbc:ID, CII ram:PayerPartyDebtorFinancialAccount/ram:IBANID.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-31 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-91 Belastetes Konto |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-31:** Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Debited account identifier" BT-91 übermittelt werden.

## Was das heißt

Die Rechnung enthält ein Lastschriftmandat (BG-19), aber nicht das Konto des Käufers, das belastet wird.

**Häufige Ursache:** Nur die Mandatsreferenz wird übertragen, die IBAN des Kunden nicht.

## So beheben Sie den Fehler

Geben Sie die IBAN des Käufers als belastetes Konto an: UBL cac:PaymentMandate/cac:PayerFinancialAccount/cbc:ID, CII ram:PayerPartyDebtorFinancialAccount/ram:IBANID.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-31; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cac:PartyName>
    <cbc:Name>Muster Elektro</cbc:Name>
```

Fehlerhaft:

```xml
<cac:PartyIdentification>
        <cbc:ID schemeID="SEPA">DE98ZZZ09999999999</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
        <cbc:Name>Muster Elektro</cbc:Name>
```

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
        </cac:PaymentMandate>
    </cac:PaymentMeans>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Wenn "DIRECT DEBIT" BG-19 vorhanden ist, dann muss "Debited account identifier" BT-91 übermittelt werden.

Dieselbe Änderung löst außerdem aus: BR-DE-20.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
not(cac:PaymentMeans/cac:PaymentMandate) or (cac:PaymentMeans/cac:PaymentMandate/cac:PayerFinancialAccount/cbc:ID)
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
(($BT-89-path or $BT-90-path) and $BT-91-path) or $BG-19-not-existing
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-31)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-31/  
Datenstand: 2026-11-08
