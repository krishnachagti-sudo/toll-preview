# Wechselkurs am Wochenende oder Feiertag: welcher Kurs gilt?

An einem Tag ohne EZB-Kurs gilt der letzte Kurs davor, höchstens 7 Tage zurück: Für Ostermontag, den 6. April 2026, ist das der Kurs vom Donnerstag, 2. April 2026 mit 1,1525 US-Dollar je Euro.

## Einen Tag ohne Kurs ausprobieren

[Kurs im Werkzeug abrufen](https://krishnachagti-sudo.github.io/toll-preview/de/fx-on-date/?base=EUR&quote=USD&date=2026-10-24)

## Wie behandelt das Werkzeug Tage ohne Kurs?

Es sucht den letzten Kurs in den 7 Tagen bis einschließlich Ihrem Datum und zeigt, aus welchem Tag er stammt. Findet es keinen, oder liegt das Datum vor dem 4. Januar 1999, sagt es das, und der Abruf bleibt kostenlos.

## Beispiele: Samstag, Ostermontag und Weihnachten

Euro in US-Dollar an Tagen ohne EZB-Kurs

| Gefragtes Datum | Kurs verwendet vom | US-Dollar je Euro |
| --- | --- | ---: |
| Samstag, 24. Oktober 2026 | Freitag, 23. Oktober 2026 | 1,1193 |
| Montag, 6. April 2026 (Ostermontag) | Donnerstag, 2. April 2026 | 1,1525 |
| Mittwoch, 25. Dezember 2024 (1. Weihnachtstag) | Dienstag, 24. Dezember 2024 | 1,0395 |

Ostern zeigt, wie weit der Kurs zurückliegen kann: Zwischen dem Donnerstag und dem Ostermontag liegen Karfreitag, Samstag, Sonntag und der Feiertag selbst.

## Welche Tage hat die EZB nicht?

Die EZB nennt als TARGET-Schließtage den 1. Januar, Karfreitag, Ostermontag, den 1. Mai sowie den 25. und 26. Dezember, zusätzlich zu den Wochenenden ([T2-Seite der EZB, Englisch](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)). An nationalen Feiertagen, die kein TARGET-Schließtag sind, gibt es dagegen einen Kurs.

## Ist das der Kurs für meine Abrechnung?

Welchen Kurs und welchen Stichtag Ihre Stelle verlangt, legt sie fest. Das Werkzeug beantwortet nur, was der EZB-Kurs für den Tag ist und aus welchem Tag er stammt. Wie Sie den Kurs nachschlagen, steht in der ersten Anleitung: [EZB-Referenzkurs an einem bestimmten Datum nachschlagen](https://krishnachagti-sudo.github.io/toll-preview/de/ezb-referenzkurs-an-einem-datum/).

## Quellen

- [Europäische Zentralbank: Euro foreign exchange reference rates (Englisch)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [Europäische Zentralbank: gesamte Kurshistorie als CSV in einer ZIP-Datei](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [Europäische Zentralbank: T2, Schließtage (Englisch)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)

## Fragen

### Gibt es am Wochenende einen EZB-Referenzkurs?

Nein. Die EZB veröffentlicht ihre Kurse an Arbeitstagen. Für einen Samstag oder Sonntag nimmt man üblicherweise den letzten Kurs davor, in der Regel den vom Freitag. Das Werkzeug macht das und nennt das Datum.

### Welche Tage sind keine EZB-Kurstage?

Neben Samstag und Sonntag die TARGET-Schließtage: 1. Januar, Karfreitag, Ostermontag, 1. Mai, 25. und 26. Dezember, wie die EZB auf ihrer T2-Seite schreibt.

### Was passiert, wenn die EZB heute noch keinen Kurs veröffentlicht hat?

Dann gibt das Werkzeug keinen Kurs aus, statt einen älteren als aktuell auszugeben. Der Abruf kostet nichts. Fragen Sie nach der Veröffentlichung gegen 16:00 Uhr MEZ noch einmal.

## Verwandte Seiten

- [EZB-Referenzkurs an einem bestimmten Datum nachschlagen](https://krishnachagti-sudo.github.io/toll-preview/de/ezb-referenzkurs-an-einem-datum/)
- [Das Werkzeug: Wechselkurs an einem Datum](https://krishnachagti-sudo.github.io/toll-preview/de/fx-on-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/de/wechselkurs-wochenende-feiertag/  
Datenstand: 2026-11-05
