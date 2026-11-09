# XRechnung auf dem Mac öffnen

Auf dem Mac öffnen Sie eine XRechnung, indem Sie die .xml-Datei (bis 5 MB) im Browser (Safari, Chrome oder Firefox) in den Viewer ziehen; sie wird lokal gelesen und als Rechnung angezeigt, ohne Installation und ohne Upload. Über den Druckdialog sichern Sie sie als PDF.

## Viewer öffnen

[Viewer im Browser öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=ubl)

## Warum Vorschau und TextEdit nicht reichen

Vorschau öffnet keine XML-Dateien, und TextEdit oder ein Browser zeigt nur die Felder als Text. Eine ZUGFeRD-PDF öffnet Vorschau zwar, zeigt aber nur das Bild, nicht die eingebettete XML, die steuerlich maßgeblich ist.

Für ZUGFeRD-PDFs: [ZUGFeRD Viewer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-viewer/) liest die eingebettete XML.

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Schritte

1. **Datei sichern.** Ziehen Sie den .xml-Anhang aus Apple Mail auf den Schreibtisch, oder sichern Sie ihn über „Anhang sichern“.
2. **Viewer öffnen.** Öffnen Sie den Viewer in Safari, Chrome oder Firefox und ziehen Sie die Datei auf das Feld „E-Rechnung wählen oder hier ablegen“.
3. **Speichern.** Mit „Drucken oder als PDF sichern“ öffnet sich der Druckdialog von macOS; dort wählen Sie unten „Als PDF sichern“.

## Verwandte Seiten

- [XRechnung öffnen](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/)
- [Drucken](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/drucken/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-oeffnen/mac/  
Datenstand: 2026-11-08
