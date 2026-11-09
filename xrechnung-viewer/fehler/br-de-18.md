# BR-DE-18: Skonto-Angabe in den Zahlungsbedingungen falsch formatiert

BR-DE-18 bedeutet: Skonto Zeilen in ... müssen diesem regulärem Ausdruck entsprechen: (^\|\\r?\\n)#(SKONTO)#TAGE=(\[0-9\]+#PROZENT=\[0-9\]+\\.\[0-9\]{2})(#BASISBETRAG=-?\[0-9\]+\\.\[0-9\]{2})?#$. Die Informationen zur Gewährung von Skonto müssen wie folgt im Element "Payment terms" (BT-20) übermittelt werden: Anzugeben ist im ersten Segment "SKONTO", im zweiten "TAGE=n", im dritten "PROZENT=n". Prozentzahlen sind ohne Vorzeichen sowie mit Punkt getrennt von zwei Nachkommastellen anzugeben. Liegt dem zu berechnenden Betrag nicht BT-115, "fälliger Betrag" zugrunde, sondern nur ein Teil des fälligen Betrags der Rechnung, ist der Grundwert zur Berechnung von Skonto als viertes Segment "BASISBETRAG=n" gemäß dem semantischen Datentypen Amount anzugeben. Jeder Eintrag beginnt mit einer #, die Segmente sind mit einer # getrennt und eine Zeile schließt mit einer # ab. Am Ende einer vollständigen Skontoangabe muss ein XML-konformer Zeilenumbruch folgen. Alle Angaben zur Gewährung von Skonto müssen in Großbuchstaben gemacht werden. Zusätzliches Whitespace (Leerzeichen, Tabulatoren oder Zeilenumbrüche) ist nicht zulässig. Andere Zeichen oder Texte als in den oberen Vorgaben genannt sind nicht zulässig. (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31). Schreiben Sie jede Skonto-Stufe als eigene Zeile: #SKONTO#TAGE=10#PROZENT=2.00# und gegebenenfalls #BASISBETRAG=100.00#, in Großbuchstaben, ohne Leerzeichen, mit Punkt als Dezimaltrennzeichen, und beenden Sie die Zeile mit einem Zeilenumbruch.

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-18 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | BT-20 Zahlungsbedingungen; BT-115 Zahlbetrag |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-18:** Skonto Zeilen in ... müssen diesem regulärem Ausdruck entsprechen: (^\|\\r?\\n)#(SKONTO)#TAGE=(\[0-9\]+#PROZENT=\[0-9\]+\\.\[0-9\]{2})(#BASISBETRAG=-?\[0-9\]+\\.\[0-9\]{2})?#$. Die Informationen zur Gewährung von Skonto müssen wie folgt im Element "Payment terms" (BT-20) übermittelt werden: Anzugeben ist im ersten Segment "SKONTO", im zweiten "TAGE=n", im dritten "PROZENT=n". Prozentzahlen sind ohne Vorzeichen sowie mit Punkt getrennt von zwei Nachkommastellen anzugeben. Liegt dem zu berechnenden Betrag nicht BT-115, "fälliger Betrag" zugrunde, sondern nur ein Teil des fälligen Betrags der Rechnung, ist der Grundwert zur Berechnung von Skonto als viertes Segment "BASISBETRAG=n" gemäß dem semantischen Datentypen Amount anzugeben. Jeder Eintrag beginnt mit einer #, die Segmente sind mit einer # getrennt und eine Zeile schließt mit einer # ab. Am Ende einer vollständigen Skontoangabe muss ein XML-konformer Zeilenumbruch folgen. Alle Angaben zur Gewährung von Skonto müssen in Großbuchstaben gemacht werden. Zusätzliches Whitespace (Leerzeichen, Tabulatoren oder Zeilenumbrüche) ist nicht zulässig. Andere Zeichen oder Texte als in den oberen Vorgaben genannt sind nicht zulässig.

## Was das heißt

In den Zahlungsbedingungen (BT-20) steht eine Skonto-Zeile, die nicht dem vorgeschriebenen Muster folgt. XRechnung erwartet für jede Skonto-Stufe eine eigene Zeile der Form #SKONTO#TAGE=14#PROZENT=2.00# und danach einen Zeilenumbruch.

**Häufige Ursache:** Der Prozentsatz ist ohne zwei Nachkommastellen geschrieben (2 statt 2.00), mit Komma statt Punkt, in Kleinbuchstaben, oder die Zeile endet ohne Zeilenumbruch.

## So beheben Sie den Fehler

Schreiben Sie jede Skonto-Stufe als eigene Zeile: #SKONTO#TAGE=10#PROZENT=2.00# und gegebenenfalls #BASISBETRAG=100.00#, in Großbuchstaben, ohne Leerzeichen, mit Punkt als Dezimaltrennzeichen, und beenden Sie die Zeile mit einem Zeilenumbruch.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-18; ohne sie ist die Rechnung gültig.

Richtig:

```xml
<cbc:Note>Zahlbar bis 02.12.2026 ohne Abzug.</cbc:Note>
```

Fehlerhaft:

```xml
<cbc:Note>Zahlbar bis 02.12.2026 ohne Abzug.
#SKONTO#TAGE=10#PROZENT=2#
</cbc:Note>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Skonto Zeilen in ubl:Invoice müssen diesem regulärem Ausdruck entsprechen: (^\|\\r?\\n)#(SKONTO)#TAGE=(\[0-9\]+#PROZENT=\[0-9\]+\\.\[0-9\]{2})(#BASISBETRAG=-?\[0-9\]+\\.\[0-9\]{2})?#$. Die Informationen zur Gewährung von Skonto müssen wie folgt im Element "Payment terms" (BT-20) übermittelt werden: Anzugeben ist im ersten Segment "SKONTO", im zweiten "TAGE=n", im dritten "PROZENT=n". Prozentzahlen sind ohne Vorzeichen sowie mit Punkt getrennt von zwei Nachkommastellen anzugeben. Liegt dem zu berechnenden Betrag nicht BT-115, "fälliger Betrag" zugrunde, sondern nur ein Teil des fälligen Betrags der Rechnung, ist der Grundwert zur Berechnung von Skonto als viertes Segment "BASISBETRAG=n" gemäß dem semantischen Datentypen Amount anzugeben. Jeder Eintrag beginnt mit einer #, die Segmente sind mit einer # getrennt und eine Zeile schließt mit einer # ab. Am Ende einer vollständigen Skontoangabe muss ein XML-konformer Zeilenumbruch folgen. Alle Angaben zur Gewährung von Skonto müssen in Großbuchstaben gemacht werden. Zusätzliches Whitespace (Leerzeichen, Tabulatoren oder Zeilenumbrüche) ist nicht zulässig. Andere Zeichen oder Texte als in den oberen Vorgaben genannt sind nicht zulässig.

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
every $line in cac:PaymentTerms/cbc:Note[1]/tokenize(. , '(\r?\n)')[starts-with( normalize-space(.) , '#')] satisfies matches ( normalize-space ($line), $XR-SKONTO-REGEX) and matches( cac:PaymentTerms/cbc:Note[1]/tokenize(. , '#.+#')[last()], '^\s*\n' )
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
every $line in rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:Description[1]/tokenize(. , '(\r?\n)')[starts-with( normalize-space(.) , '#')] satisfies matches ( normalize-space ($line), $XR-SKONTO-REGEX ) and matches( rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeSettlement/ram:SpecifiedTradePaymentTerms/ram:Description[1]/tokenize(. , '#.+#')[last()], '^\s*\n' )
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-18)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-18/  
Datenstand: 2026-11-08
