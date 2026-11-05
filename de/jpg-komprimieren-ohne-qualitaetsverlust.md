# JPG komprimieren ohne Qualitätsverlust auf ein KB-Limit

Ein JPG lässt sich nicht verlustfrei auf eine feste Größe bringen, etwas geht immer verloren. Das Werkzeug hält den Verlust klein: Bei 1.000 KB behielt unser 12-Megapixel-Foto alle Pixel (Qualität 81 %), bei 100 KB blieben 2.476 × 1.857 px bei Qualität 40 %.

## Geht das ganz ohne Qualitätsverlust?

Nur wenn das Foto schon unter dem Limit liegt. Dann gibt das Werkzeug ein JPEG unverändert zurück. Sonst wird das Bild neu als JPEG gespeichert, und das verliert immer etwas. Das Werkzeug sucht dabei die höchste Qualität (höchstens 92 %), die noch unter Ihr Limit passt.

## Was ändert das Werkzeug zuerst: Qualität oder Pixel?

Zuerst die Qualität. Es probiert das Foto in voller Größe, dann Qualitätsstufen bis hinunter zu 35 %. Erst wenn auch 35 % zu groß ist, macht es das Bild 15 % schmaler und niedriger und sucht die Qualität neu, bis zu einem Zehntel der Breite.

## Ein Testfoto bei sechs Limits

Dasselbe 12-Megapixel-Querformat-Foto (4.032 × 3.024 px) bei sechs Limits:

Ergebnis des Werkzeugs für ein Foto bei sechs Limits

| Limit | Neue Größe | Pixel | Pixel behalten | JPEG-Qualität |
| --- | ---: | ---: | ---: | ---: |
| 1.000 KB | 916,5 KB | 4.032 × 3.024 px | 100 % | 81 % |
| 500 KB | 497,3 KB | 4.032 × 3.024 px | 100 % | 65 % |
| 200 KB | 199,1 KB | 3.427 × 2.570 px | 72 % | 48 % |
| 100 KB | 99,0 KB | 2.476 × 1.857 px | 38 % | 40 % |
| 50 KB | 49,0 KB | 1.521 × 1.141 px | 14 % | 40 % |
| 20 KB | 19,7 KB | 794 × 595 px | 4 % | 38 % |

> Gemessen mit dem Werkzeug in Chromium 149.0.7827.55 am 31.10.2026. Andere Browser haben eigene JPEG-Encoder, das Ergebnis kann dort um einige Prozent abweichen; es bleibt unter dem Limit.

## Brauchen alle Fotos gleich viel Platz?

Nein. Ein Foto mit feinen Details überall braucht für dieselbe Pixelzahl mehr Bytes. Bei 200 KB behielt das Querformat-Foto 72 % seiner Pixel, unsere Aufnahme von Watvögeln im bewegten Wasser nur 27 %.

## Wie bekomme ich das beste Ergebnis?

Nehmen Sie das größte Limit, das das Formular erlaubt. Bei 500 KB statt 100 KB blieben aus dem Testfoto alle Pixel (Qualität 65 %) statt 2.476 × 1.857 px.

[Bild auf Dateigröße verkleinern (Werkzeug)](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/) \| [Bild auf 100 KB verkleinern: Foto auf KB-Größe bringen](https://krishnachagti-sudo.github.io/toll-preview/de/bild-verkleinern-auf-kb/)

## Quellen

Die Testfotos stammen von der NASA und sind gemeinfrei. Die Ergebnisse stammen vom Werkzeug selbst, in der Testumgebung unten genannt.

- [NASA, KSC-20210111-PH-JBS01\_0021 gemeinfrei](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt gemeinfrei](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 gemeinfrei](https://images.nasa.gov/details/KSC-08pd4102)

## Fragen

### Kann ich ein JPG auf 100 KB bringen, ohne dass man den Unterschied sieht?

Das hängt vom Foto ab. Bei 100 KB wurde unser 12-Megapixel-Foto deutlich kleiner in Pixeln; bei 500 KB nicht. Je höher das Limit, desto weniger sichtbar.

### Wie niedrig geht die JPEG-Qualität?

Nie unter 35 %. Lieber verkleinert das Werkzeug das Bild, als schlechtere Qualität zu speichern.

### Ändert sich ein Foto, das schon unter dem Limit liegt?

Ein JPEG darunter wird unverändert zurückgegeben. Ein PNG oder WebP wird immer als JPEG gespeichert.

## Verwandte Seiten

- [Bild auf 100 KB verkleinern: Foto auf KB-Größe bringen](https://krishnachagti-sudo.github.io/toll-preview/de/bild-verkleinern-auf-kb/)
- [Bild auf Dateigröße verkleinern (Werkzeug)](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/)
- [Reduce image size in KB (auf Englisch)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/de/jpg-komprimieren-ohne-qualitaetsverlust/  
Datenstand: 2026-10-31
