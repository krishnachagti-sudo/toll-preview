# ZUGFeRD Validator

Die eingebettete XML einer ZUGFeRD-Rechnung im Profil EN 16931 hat die Kennung urn:cen.eu:en16931:2017, und dafür hat die KoSIT-Konfiguration das Szenario „EN16931 (CII)“; die Beispiel-PDF ist danach gültig (0 Fehler, 0 Warnungen, 0 Hinweise).

## Beispiel-PDF prüfen

[ZUGFeRD-PDF im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=pdf&job=validate)

## Welche Regeln für welches Profil

| Profil | E-Rechnung nach BMF | Geprüft mit |
| --- | --- | --- |
| MINIMUM | nein (ausdrücklich ausgenommen) | nicht geprüft: das Profil ist keine Rechnung im Sinne der EN 16931 |
| BASIC WL | nein (ausdrücklich ausgenommen) | nicht geprüft, aus demselben Grund |
| BASIC | ja | EN-16931-Regeln für CII; kein eigenes KoSIT-Szenario |
| EN 16931 (COMFORT) | ja | KoSIT-Szenario „EN16931 (CII)“ |
| EXTENDED | ja | EN-16931-Regeln für CII; kein eigenes KoSIT-Szenario, zusätzliche Elemente können als Syntax-Warnung erscheinen |
| XRECHNUNG | ja | KoSIT-Szenario „EN16931 XRechnung (CII)“ mit allen BR-DE-Regeln |

Die Profile MINIMUM und BASIC WL nimmt das BMF-Schreiben vom 15.10.2025 ausdrücklich von den zulässigen E-Rechnungsformaten aus; ZUGFeRD ist ab Version 2.0.1 zulässig. Für BASIC und EXTENDED gibt es von FeRD eigene Prüfregeln, die hier nicht ausgeführt werden: sie werden über FeRD bezogen, und ihre Lizenz erlaubt das Mitliefern nicht nachweislich.

Die PDF selbst wird nicht auf PDF/A-3-Konformität geprüft. Der Viewer zeigt aber die PDF/A-Angabe und die Factur-X-Angaben aus den Metadaten der Datei.

## Quellen

- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)
- [FeRD, ZUGFeRD/Factur-X FAQ (Profile, Referenzprofil XRECHNUNG, führender XML-Teil) (gelesen am 8. November 2026)](https://www.ferd-net.de/standards/zugferd-faq)
- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Verwandte Seiten

- [ZUGFeRD Viewer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-viewer/)
- [FeRD oder dieser Prüfer](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/vs/ferd/)
- [XRechnung Validator](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-validator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/zugferd-validator/  
Datenstand: 2026-11-08
