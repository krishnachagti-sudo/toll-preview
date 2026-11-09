# XRechnung oder ZUGFeRD?

XRechnung ist reines XML, ZUGFeRD eine PDF mit eingebetteter XML; beide erfüllen die EN 16931 (ZUGFeRD in den Profilen BASIC, EN 16931, EXTENDED und XRECHNUNG). Erkennbar ist das Format an der Datei selbst: die Beispiel-XRechnung ist XRechnung 3.0 (Syntax UBL Invoice), die Beispiel-PDF ZUGFeRD / Factur-X EN 16931 (Syntax UN/CEFACT CII), eingebettet in die PDF als factur-x.xml.

| Merkmal | XRechnung | ZUGFeRD |
| --- | --- | --- |
| Datei | .xml (UBL oder CII) | .pdf (PDF/A-3) mit eingebetteter XML (CII) |
| Lesbar ohne Viewer | nein, nur Code | ja, das PDF-Bild |
| Maßgeblich | die XML | die XML (führender Teil laut FeRD) |
| Deutsche Regeln (BR-DE) | ja | nur im Referenzprofil XRECHNUNG |
| Typischer Einsatz | öffentliche Auftraggeber verlangen sie, mit Leitweg-ID | zwischen Unternehmen, weil Menschen das PDF lesen können |

## Für Sender und Empfänger

ZUGFeRD ist für Empfänger ohne Viewer bequemer, weil das PDF lesbar ist; dafür müssen Bild und XML übereinstimmen, und geprüft werden muss die XML. XRechnung ist eindeutig, braucht aber zum Lesen einen Viewer.

## Format einer Datei erkennen

[Viewer mit Beispiel-PDF öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=pdf)

## Quellen

- [FeRD, ZUGFeRD/Factur-X FAQ (Profile, Referenzprofil XRECHNUNG, führender XML-Teil) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd-faq)
- [FeRD, Was ist ZUGFeRD? (PDF/A-3 mit eingebetteter XML, inhaltliche Identität) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd)
- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)

## Fragen

### Was ist der Unterschied zwischen XRechnung und ZUGFeRD?

XRechnung ist reines XML nach der deutschen Nutzungsspezifikation der EN 16931; ZUGFeRD ist eine PDF/A-3, in die eine XML eingebettet ist. Beide können EN 16931 erfüllen.

## Verwandte Seiten

- [Die XML in der ZUGFeRD-PDF](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/zugferd-xml-auslesen/)
- [Leitweg-ID](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/leitweg-id/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/xrechnung-vs-zugferd/  
Datenstand: 2026-11-08
