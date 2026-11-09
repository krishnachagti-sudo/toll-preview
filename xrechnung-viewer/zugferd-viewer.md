# ZUGFeRD Viewer

Eine ZUGFeRD-PDF enthält die Rechnung zweimal: als Bild und als eingebettete XML. Der Viewer liest die XML; für die Beispiel-PDF heißt das: ZUGFeRD / Factur-X EN 16931 (Syntax UN/CEFACT CII), eingebettet in die PDF als factur-x.xml, Rechnung RE-2026-0418 über 461,24 EUR.

## Beispiel-PDF öffnen

[ZUGFeRD-PDF im Viewer öffnen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=pdf)

## Was der Viewer aus der PDF liest

| Angabe | Beispiel-PDF |
| --- | --- |
| Eingebettete Datei | factur-x.xml |
| Beziehung zur PDF (AFRelationship) | Alternative |
| Profil (BT-24) | ZUGFeRD / Factur-X EN 16931 |
| Spezifikationskennung | `urn:cen.eu:en16931:2017` |
| Rechnungsnummer (BT-1) | RE-2026-0418 |
| Verkäufer (BT-27) | Muster Haustechnik GmbH |
| Käufer (BT-44) | Beispiel Bürogebäude KG |
| Zahlbetrag (BT-115) | 461,24 EUR |

Gesucht wird die eingebettete Datei mit einem der Standardnamen factur-x.xml, zugferd-invoice.xml (ZUGFeRD 2.0), ZUGFeRD-invoice.xml (ZUGFeRD 1.0) oder xrechnung.xml, auch wenn ihre Dateibeschreibung in einem komprimierten Objektstrom steht. Ist keine Rechnungs-XML eingebettet, sagt der Viewer das: dann ist die Datei eine normale PDF-Rechnung und keine E-Rechnung.

Laut FeRD ist der strukturierte XML-Teil der führende Teil; das PDF-Bild ist eine bildhafte Darstellung derselben Rechnung. [Mehr zur XML in der PDF](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/zugferd-xml-auslesen/).

## Quellen

- [FeRD, ZUGFeRD/Factur-X FAQ (Profile, Referenzprofil XRECHNUNG, führender XML-Teil) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd-faq)
- [FeRD, Was ist ZUGFeRD? (PDF/A-3 mit eingebetteter XML, inhaltliche Identität) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [ZUGFeRD-PDF: wo steckt die XML?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/zugferd-xml-auslesen/)
- [ZUGFeRD Validator](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-validator/)
- [XRechnung oder ZUGFeRD?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/xrechnung-vs-zugferd/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-viewer/  
Datenstand: 2026-11-08
