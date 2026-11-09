# BR-DE-20: Belastetes Konto (BT-91) ist keine gültige IBAN bei SEPA-Lastschrift

BR-DE-20 bedeutet: "Debited account identifier" (BT-91) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 59 SEPA als Zahlungsmittel gefordert wird. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-20 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Warnung: die Rechnung bleibt gültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-91 Belastetes Konto; BT-81 Zahlungsart |

**Meldung BR-DE-20:** "Debited account identifier" (BT-91) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 59 SEPA als Zahlungsmittel gefordert wird.

## Was das heißt

Die Zahlungsart ist SEPA-Lastschrift (Code 59), aber das zu belastende Konto des Käufers ist keine gültige IBAN. Das ist eine Warnung.

**Häufige Ursache:** Ein Tippfehler in der IBAN des Kunden oder eine alte Kontonummer.

## So beheben Sie den Fehler

Prüfen Sie die IBAN aus dem SEPA-Mandat des Kunden.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-20; ohne sie ist die Rechnung gültig.

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
            <cac:PayerFinancialAccount>
                <cbc:ID>DE79000000001234567899</cbc:ID>
            </cac:PayerFinancialAccount>
        </cac:PaymentMandate>
    </cac:PaymentMeans>
```

Gemeldet an der Stelle `/ubl:Invoice[1]/cac:PaymentMeans[1]`: "Debited account identifier" (BT-91) soll eine korrekte IBAN enthalten, wenn in "Payment means type code" (BT-81) mit dem Code 59 SEPA als Zahlungsmittel gefordert wird.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = '59'] | /cn:CreditNote/cac:PaymentMeans[normalize-space(cbc:PaymentMeansCode) = '59']
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(cbc:PaymentMeansCode) = '59') or xr:checkIBAN(string(cac:PaymentMandate/cac:PayerFinancialAccount/cbc:ID))
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice/rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradeSettlementPaymentMeans[normalize-space(ram:TypeCode) = '59']
```

Bedingung (muss erfüllt sein):

```
not(normalize-space(ram:TypeCode) = '59') or xr:checkIBAN(string(ram:PayerPartyDebtorFinancialAccount/ram:IBANID))
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-20)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-20/  
Datenstand: 2026-11-08
