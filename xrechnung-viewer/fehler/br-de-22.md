# BR-DE-22: Dateinamen der Anhänge nicht eindeutig

BR-DE-22 bedeutet: Das "filename"-Attribut aller "EmbeddedDocumentBinaryObject"-Elemente muss eindeutig sein (XRechnung-Schematron 2.6.0 (KoSIT), KoSIT-Konfiguration 2026-08-31).

## Die Regel

| Angabe | Wert |
| --- | --- |
| Regel | BR-DE-22 |
| Quelle | XRechnung-Schematron 2.6.0 (KoSIT) |
| Schweregrad | Fehler: die Rechnung ist damit ungültig |
| Gilt für | UBL und CII |
| Betroffene Felder | siehe Meldung |
| BMF-Schreiben 15.10.2025 | Geschäftsregelfehler (Rn. 6b) |

**Meldung BR-DE-22:** Das "filename"-Attribut aller "EmbeddedDocumentBinaryObject"-Elemente muss eindeutig sein

## Was das heißt

Zwei oder mehr eingebettete Anhänge (BT-125) haben denselben Dateinamen. Jeder Dateiname muss in der Rechnung nur einmal vorkommen.

**Häufige Ursache:** Mehrere Belege werden mit einem festen Namen wie anhang.pdf eingebettet.

## So beheben Sie den Fehler

Vergeben Sie für jeden Anhang einen eigenen Dateinamen, zum Beispiel mit laufender Nummer.

## Geprüftes Beispiel

Ausgangspunkt ist eine erfundene, gültige XRechnung 3.0 (UBL). Mit der folgenden Änderung meldet der Prüfer BR-DE-22; ohne sie ist die Rechnung gültig.

Richtig:

```xml
</cac:OrderReference>
```

Fehlerhaft:

```xml
</cac:OrderReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>Stundennachweis-anhang.pdf</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="anhang.pdf">JVBERi0xLjQK</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>Lieferschein</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="anhang.pdf">JVBERi0xLjQK</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
```

Gemeldet an der Stelle `/ubl:Invoice[1]`: Das "filename"-Attribut aller "EmbeddedDocumentBinaryObject"-Elemente muss eindeutig sein

## Die Prüfregel

UBL, Kontext:

```
/ubl:Invoice | /cn:CreditNote
```

Bedingung (muss erfüllt sein):

```
count(cac:AdditionalDocumentReference) = count(cac:AdditionalDocumentReference[not(./cac:Attachment/cbc:EmbeddedDocumentBinaryObject/@filename = preceding-sibling::cac:AdditionalDocumentReference/cac:Attachment/cbc:EmbeddedDocumentBinaryObject/@filename)])
```

CII, Kontext:

```
/rsm:CrossIndustryInvoice
```

Bedingung (muss erfüllt sein):

```
count(//ram:AdditionalReferencedDocument) = count(//ram:AdditionalReferencedDocument[not(./ram:AttachmentBinaryObject/@filename = preceding-sibling::ram:AdditionalReferencedDocument/ram:AttachmentBinaryObject/@filename)])
```

## Eigene Datei prüfen

[Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&rule=BR-DE-22)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [Alle Fehlercodes](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-22/  
Datenstand: 2026-11-08
