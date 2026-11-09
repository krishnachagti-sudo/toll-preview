# XRechnung öffnen

Eine XRechnung öffnen Sie, indem Sie die .xml-Datei in einen Viewer legen: er liest die beschrifteten Felder (Rechnungsnummer BT-1, Positionen, Steuer, Bankverbindung) und zeigt sie als Rechnung. Dieser Viewer macht das in Ihrem Browser, kostenlos und ohne Upload.

## XRechnung im Browser öffnen

[Viewer mit Beispiel öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=ubl)

## Warum ein Doppelklick nur Code zeigt

Eine XRechnung ist reines XML ohne Layout. Ihr Betriebssystem öffnet sie im Browser oder Editor und zeigt die Felder als Text. Die Datei ist dadurch nicht kaputt; sie braucht einen Viewer, der die Felder der Norm EN 16931 als Rechnung anordnet.

## Nicht in Excel öffnen und neu speichern

Excel kann XML importieren, ordnet die Felder aber als Tabelle an, und wer die Datei danach speichert, verändert das Original. Die XML-Datei ist die Rechnung; bewahren Sie sie unverändert auf. Für die Positionen in Excel gibt es einen eigenen Weg: [Positionen als CSV](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/in-excel/).

## Datenschutz

Zum Anzeigen bleibt die Datei auf Ihrem Gerät: der Viewer liest sie mit JavaScript im Browser. Erst wenn Sie „Prüfen“ oder „PDF mit Prüfbericht“ wählen, geht die Datei an den Server; sie wird dort im Speicher verarbeitet und nicht gespeichert.

## Situationen

- [XRechnung auf dem Mac öffnen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/mac/)
- [XRechnung drucken](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/drucken/)
- [Positionen in Excel übernehmen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/in-excel/)
- [XRechnung in PDF umwandeln](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-in-pdf/)
- [ZUGFeRD-PDF: wo steckt die XML?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/zugferd-xml-auslesen/)
- [Kleinunternehmer: E-Rechnung empfangen und ausstellen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/e-rechnung-fuer-kleinunternehmer/)

## Quellen

- [§ 14b Abs. 1 UStG (acht Jahre Aufbewahrung) (gelesen am 8. November 2026)](https://www.gesetze-im-internet.de/ustg_1980/__14b.html)
- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)
- [§ 14 Abs. 1 UStG (elektronische Rechnung, sonstige Rechnung, EN 16931) (gelesen am 8. November 2026)](https://www.gesetze-im-internet.de/ustg_1980/__14.html)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Schritte

1. **Anhang speichern.** Speichern Sie die .xml-Datei aus der E-Mail. Öffnen Sie sie nicht in Excel und speichern Sie sie nicht neu.
2. **Im Viewer ablegen.** Ziehen Sie die Datei in den Viewer. Sie wird in Ihrem Browser gelesen, nicht hochgeladen.
3. **Lesen und weiterverarbeiten.** Lesen Sie die Rechnung, kopieren Sie IBAN und Betrag, drucken Sie sie oder sichern Sie sie als PDF. Bewahren Sie die XML-Datei auf.

## Fragen

### Warum zeigt ein Doppelklick auf die XRechnung nur Code?

Eine XRechnung ist eine XML-Datei ohne Layout. Sie enthält die Rechnungsdaten als beschriftete Felder; erst ein Viewer ordnet sie zu einer lesbaren Rechnung.

### Welche Datei muss ich aufbewahren?

Die XML-Datei. Nach § 14b UStG sind Rechnungen acht Jahre aufzubewahren, und bei einer E-Rechnung ist laut BMF-Schreiben zumindest der strukturierte Teil unversehrt in seiner ursprünglichen Form aufzubewahren. Die Ansicht oder PDF ist eine Lesekopie.

## Verwandte Seiten

- [Auf dem Mac](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/mac/)
- [Drucken](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/drucken/)
- [Positionen in Excel](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/in-excel/)
- [ELSTER-Viewer oder dieser Viewer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/elster/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/  
Datenstand: 2026-11-08
