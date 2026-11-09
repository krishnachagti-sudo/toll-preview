# Validierungsfehler und Vorsteuerabzug

Das BMF-Schreiben vom 15.10.2025 unterscheidet drei Fehlerarten: Formatfehler machen die Datei zur sonstigen Rechnung (Rn. 6a), Geschäftsregelfehler sind Verstöße gegen die Prüfregeln (Rn. 6b), und nur solche, die umsatzsteuerliche Pflichtangaben betreffen, sind Inhaltsfehler mit Folgen für die Ordnungsmäßigkeit (Rn. 35a). Die fehlende Buyer reference (BT-10) nennt das Schreiben ausdrücklich als umsatzsteuerlich unbeachtlich.

## Die drei Fehlerarten

| Art | Was das Schreiben sagt | Folge |
| --- | --- | --- |
| Formatfehler (Rn. 6a) | Die Datei entspricht nicht den zulässigen Syntaxen bzw. deren technischen Vorgaben; welcher Art der Formatfehler ist, ist unerheblich. | keine E-Rechnung, sondern sonstige Rechnung in einem anderen elektronischen Format |
| Geschäftsregelfehler (Rn. 6b) | Die Datei verstößt gegen die Geschäftsregeln: Angaben fehlen (Beispiel: BT-10 in einer XRechnung) oder widersprechen sich (Beispiel: Steuerbetrag passt nicht zum Steuersatz). | zu Inhalten ohne umsatzsteuerliche Bedeutung unbeachtlich (Rn. 35a) |
| Inhaltsfehler (Rn. 35a) | Verstoß gegen die Pflichtangaben der §§ 14 Abs. 4 und 14a UStG; kann als Geschäftsregelfehler auffallen, aber auch ohne jeden Validierungsfehler vorliegen. | nicht ordnungsmäßige Rechnung (Abschnitt 15.2a UStAE) |

## So ordnet dieser Prüfer ein

Regeln der Syntaxbindung (UBL-CR, UBL-SR, CII-SR), der Codelisten (BR-CL) und der Nachkommastellen (BR-DEC) und eine falsche Spezifikationskennung gelten als Formatfehler. Rechen- und Steuerregeln (BR-CO, BR-S, BR-Z, BR-E, BR-AE und weitere Steuerkategorien) und Regeln zu Feldern, die Pflichtangaben der Rechnung tragen (Name und Anschrift, USt-IdNr., Datum, Leistungsdatum, Menge, Entgelt, Steuersatz und Steuerbetrag), gelten als mögliches Inhaltsfehler-Thema. Alle anderen Fehler gelten als Geschäftsregelfehler. Diese Zuordnung ist eine Lesehilfe, keine Steuerberatung.

Die Beispielrechnung mit zwei Fehlern, eingeordnet

| Regel | Schweregrad | Einordnung |
| --- | --- | --- |
| BR-CO-10 | Fehler | mögliches Inhaltsfehler-Thema (Rn. 35a) |
| BR-CO-13 | Fehler | mögliches Inhaltsfehler-Thema (Rn. 35a) |
| BR-DE-15 | Fehler | Geschäftsregelfehler (Rn. 6b) |

## Beispiel prüfen und einordnen

[Beispiel im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&job=validate)

## Prüfen lohnt sich

Das Schreiben empfiehlt, die Vollständigkeit der Rechnungsangaben und die Zulässigkeit des Formats mit einer geeigneten Validierungsanwendung zu prüfen. Ein bestandenes Ergebnis heißt aber nicht, dass die Rechnung inhaltlich richtig ist: Inhaltsfehler können auch ohne Validierungsfehler vorliegen.

## Quellen

- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)
- [§ 14 Abs. 1 UStG (elektronische Rechnung, sonstige Rechnung, EN 16931) (gelesen am 8. November 2026)](https://www.gesetze-im-internet.de/ustg_1980/__14.html)

> Geprüft mit KoSIT-Konfiguration 2026-08-31 (XRechnung 3.0.2), XRechnung-Schematron 2.6.0, CEN-Schematron EN 16931 1.3.16. Die XML-Schema-Prüfung (XSD) des KoSIT-Validators läuft hier nicht. Ein bestandenes Ergebnis heißt nicht, dass die Rechnung inhaltlich richtig ist. Keine Steuerberatung.

## Fragen

### Ist eine Datei mit Formatfehler noch eine E-Rechnung?

Nein. Nach Rn. 6a des BMF-Schreibens vom 15.10.2025 ist eine Datei, die wegen Formatfehlern nicht dem strukturierten Format nach § 14 Abs. 1 Satz 6 UStG entspricht, eine sonstige Rechnung in einem anderen elektronischen Format.

### Macht jeder Geschäftsregelfehler die Rechnung steuerlich fehlerhaft?

Nein. Nach Rn. 35a sind Geschäftsregelfehler zu anderen Inhalten, etwa die fehlende Buyer reference BT-10, umsatzsteuerlich unbeachtlich. Betrifft der Fehler eine Pflichtangabe nach §§ 14 Abs. 4, 14a UStG, liegt eine nicht ordnungsmäßige Rechnung vor.

## Verwandte Seiten

- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)
- [Pflichten 2025 bis 2028](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/pflichten-2025-2028/)
- [Fehlercodes erklärt](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/fehlercodes-erklaert/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/xrechnung-validator/vorsteuerabzug/  
Datenstand: 2026-11-08
