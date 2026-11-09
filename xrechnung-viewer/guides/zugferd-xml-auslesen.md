# ZUGFeRD-PDF: wo steckt die XML?

In einer ZUGFeRD-Rechnung steckt die XML als eingebettete Datei in der PDF/A-3, meist unter dem Namen factur-x.xml; bei der Beispiel-PDF findet der Viewer „factur-x.xml“ (Beziehung Alternative) im Profil ZUGFeRD / Factur-X EN 16931, Rechnung RE-2026-0418 über 461,24 EUR.

## Beispiel-PDF öffnen

[ZUGFeRD-PDF im Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=pdf)

## Die Dateinamen

| Dateiname | Version |
| --- | --- |
| factur-x.xml | ZUGFeRD ab 2.1 und Factur-X |
| zugferd-invoice.xml | ZUGFeRD 2.0 |
| ZUGFeRD-invoice.xml | ZUGFeRD 1.0 (keine zulässige E-Rechnung) |
| xrechnung.xml | Referenzprofil XRECHNUNG |

## Die Profile

| Profil | Kennung (BT-24) | E-Rechnung |
| --- | --- | --- |
| MINIMUM | `urn:factur-x.eu:1p0:minimum` | nein |
| BASIC WL | `urn:factur-x.eu:1p0:basicwl` | nein |
| BASIC | `urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic` | ja |
| EN 16931 | `urn:cen.eu:en16931:2017` | ja |
| EXTENDED | `urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended` | ja |
| XRECHNUNG | `urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0` | ja |

Der Viewer erkennt das Profil an diesen Kennungen; die Kennungen der Beispiel-PDF und der Test-PDFs der Prüfung stammen aus den Dateien selbst.

## Checkliste

- Hat die PDF eine eingebettete XML? Wenn nein: keine E-Rechnung.
- Welches Profil? MINIMUM und BASIC WL: keine E-Rechnung.
- Besteht die XML die Prüfung nach den Regeln?
- Stimmen Beträge, Datum und Empfänger in Bild und XML überein? Maßgeblich ist die XML.
- Bewahren Sie die PDF mit der eingebetteten XML unverändert auf.

## Quellen

- [FeRD, ZUGFeRD/Factur-X FAQ (Profile, Referenzprofil XRECHNUNG, führender XML-Teil) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd-faq)
- [FeRD, Was ist ZUGFeRD? (PDF/A-3 mit eingebetteter XML, inhaltliche Identität) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd)
- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)

> Die Viewer-Ansicht und die PDF-Prüfung prüfen die PDF nicht auf PDF/A-3-Konformität. Keine Steuerberatung.

## Schritte

1. **PDF-Anhänge ansehen.** In Adobe Acrobat Reader öffnen Sie die Anhänge über das Büroklammer-Symbol in der linken Leiste. Eine ZUGFeRD-Rechnung hat dort eine XML-Datei, meist factur-x.xml.
2. **Oder den Viewer nutzen.** Legen Sie die PDF im Viewer ab. Er sucht die eingebettete XML, nennt Dateiname und Profil und zeigt die Rechnung aus der XML.
3. **Profil prüfen.** MINIMUM und BASIC WL gelten nicht als E-Rechnung; BASIC, EN 16931, EXTENDED und XRECHNUNG schon.

## Fragen

### Welche Daten gelten, wenn PDF-Bild und XML voneinander abweichen?

Nach FeRD ist der strukturierte XML-Teil der führende Teil; der Bildteil ist eine bildhafte Darstellung derselben Rechnung. FeRD empfiehlt, die inhaltliche Identität beider Teile selbst zu prüfen.

### Welche ZUGFeRD-Profile sind eine E-Rechnung?

Laut FeRD gelten drei der fünf Profile nach deutschem Recht als Rechnung: EN 16931, EXTENDED und BASIC. MINIMUM und BASIC WL nimmt auch das BMF-Schreiben vom 15.10.2025 aus. Hinzu kommt das Referenzprofil XRECHNUNG.

## Verwandte Seiten

- [ZUGFeRD Viewer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-viewer/)
- [XRechnung oder ZUGFeRD?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/xrechnung-vs-zugferd/)
- [ZUGFeRD Validator](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-validator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/zugferd-xml-auslesen/  
Datenstand: 2026-11-08
