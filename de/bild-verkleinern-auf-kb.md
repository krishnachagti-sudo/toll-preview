# Bild auf 100 KB verkleinern: Foto auf KB-Größe bringen

Öffnen Sie das Werkzeug, wählen Sie Ihr Foto und das Limit, zum Beispiel 100 KB, und laden Sie das Ergebnis herunter. In unserem Test wurde ein 12-Megapixel-Foto mit 2,08 MB auf 99,0 KB verkleinert, bei 2.476 × 1.857 px und JPEG-Qualität 40 %.

## Wie öffne ich das Werkzeug mit dem richtigen Limit?

Das Werkzeug öffnet sich mit dem Limit schon eingestellt: [20 KB](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/?kb=20), [50 KB](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/?kb=50), [100 KB](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/?kb=100) oder [200 KB](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/?kb=200). Es ist kostenlos.

## Wie groß bleibt ein Foto bei 20, 50, 100 und 200 KB?

Zwei Testfotos, wie ein Handy sie speichert (12 Megapixel), und was das Werkzeug daraus gemacht hat:

Ergebnis des Werkzeugs bei vier Limits

| Limit | Foto | Neue Größe | Pixel | JPEG-Qualität |
| --- | --- | ---: | ---: | ---: |
| 20 KB | Querformat | 19,7 KB | 794 × 595 px | 38 % |
| 20 KB | Hochformat | 19,9 KB | 366 × 487 px | 46 % |
| 50 KB | Querformat | 49,0 KB | 1.521 × 1.141 px | 40 % |
| 50 KB | Hochformat | 49,9 KB | 700 × 934 px | 41 % |
| 100 KB | Querformat | 99,0 KB | 2.476 × 1.857 px | 40 % |
| 100 KB | Hochformat | 97,7 KB | 1.141 × 1.521 px | 37 % |
| 200 KB | Querformat | 199,1 KB | 3.427 × 2.570 px | 48 % |
| 200 KB | Hochformat | 198,2 KB | 1.857 × 2.476 px | 35 % |

> Gemessen mit dem Werkzeug in Chromium 149.0.7827.55 am 31.10.2026. Andere Browser haben eigene JPEG-Encoder, das Ergebnis kann dort um einige Prozent abweichen; es bleibt unter dem Limit.

## Was passiert mit der Qualität?

Zuerst senkt das Werkzeug nur die JPEG-Qualität (zwischen 92 % und 35 %). Reicht das nicht, verkleinert es das Bild in Pixeln. Unser Querformat-Foto behielt bei 200 KB noch 72 % seiner Pixel (3.427 × 2.570 px); alle Pixel blieben erst bei 240 KB. Bei 20 und 50 KB wird das Bild deutlich kleiner, für ein Formularfoto reicht das oft.

## Wird mein Foto hochgeladen?

Nein. Das Foto wird in Ihrem Browser verkleinert, die Seite enthält keinen Code, der es irgendwohin sendet. Im Netzwerk-Tab Ihres Browsers sehen Sie keinen Upload.

## Sind 100 KB 100.000 oder 102.400 Bytes?

Formulare sagen es selten. 100 KB sind 100.000 Bytes, wenn 1 KB gleich 1.000 Bytes ist, und 102.400 Bytes bei 1.024. Das Werkzeug bleibt unter 100.000 Bytes, dem kleineren Wert, und passt damit in beiden Fällen.

## Quellen

Die Testfotos stammen von der NASA und sind gemeinfrei. Die Ergebnisse stammen vom Werkzeug selbst, in der Testumgebung unten genannt.

- [NASA, KSC-20210111-PH-JBS01\_0021 gemeinfrei](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt gemeinfrei](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 gemeinfrei](https://images.nasa.gov/details/KSC-08pd4102)

## Schritte

1. **Werkzeug öffnen.** Öffnen Sie „Bild auf Dateigröße verkleinern“. Es läuft in Ihrem Browser, das Foto wird nirgendwohin hochgeladen.
2. **Foto auswählen.** Wählen Sie ein JPEG-, PNG- oder WebP-Foto aus oder ziehen Sie es in das Feld.
3. **Limit einstellen.** Tippen Sie auf 20, 50, 100 oder 200 KB oder geben Sie Ihr eigenes Limit in KB ein.
4. **Ergebnis herunterladen.** Das Werkzeug zeigt die neue Größe an. Laden Sie die Datei herunter: Sie heißt wie Ihr Foto, mit der Endung „-100kb.jpg“, zum Beispiel urlaub-100kb.jpg.

## Fragen

### Wie verkleinere ich ein Foto auf 100 KB?

Foto im Werkzeug auswählen, 100 KB einstellen, Ergebnis herunterladen. Ein 12-Megapixel-Foto kam in unserem Test auf 99,0 KB bei 2.476 × 1.857 px.

### Wird aus meinem PNG ein JPEG?

Ja. Das Ergebnis ist immer ein JPEG. Durchsichtige Bereiche eines PNG werden weiß.

### Warum ist mein Foto danach kleiner in Pixeln?

Wenn schon die niedrigste Qualität (35 %) zu groß wäre, verkleinert das Werkzeug das Bild in Schritten von 15 %, bis es passt. Ein größeres Limit erhält mehr Pixel.

### Was, wenn das Limit zu klein für mein Foto ist?

Das Werkzeug verkleinert ein Bild nicht auf weniger als ein Zehntel seiner Größe. Dann meldet es das, und Sie können ein größeres Limit versuchen.

## Verwandte Seiten

- [JPG komprimieren ohne Qualitätsverlust: was bei einem KB-Limit passiert](https://krishnachagti-sudo.github.io/toll-preview/de/jpg-komprimieren-ohne-qualitaetsverlust/)
- [Bild auf Dateigröße verkleinern (Werkzeug)](https://krishnachagti-sudo.github.io/toll-preview/de/image-to-size/)
- [Reduce image size in KB (auf Englisch)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [Reducir foto a un tamaño en KB: Reducir una foto a 20, 50, 100 o 200 KB, gratis](https://krishnachagti-sudo.github.io/toll-preview/es/reducir-foto-a-kb/)
- [Réduire une photo à un poids en Ko: Réduire une photo en Ko : 20, 50, 100 ou 200 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/reduire-photo-en-ko/)
- [Reduzir foto para um tamanho em KB: Reduzir foto para 20, 50, 100 ou 200 KB, grátis](https://krishnachagti-sudo.github.io/toll-preview/pt/reduzir-foto-para-kb/)
- [फोटो का साइज़ KB में कम करें: फोटो का साइज़ 20, 50, 100 या 200 KB कैसे करें](https://krishnachagti-sudo.github.io/toll-preview/hi/photo-size-kb-kam-kaise-kare/)
- [画像をKB指定で圧縮: 画像を100KB以下にする方法：20・50・100・200KBの圧縮](https://krishnachagti-sudo.github.io/toll-preview/ja/gazo-kb-ika-ni-suru/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/de/bild-verkleinern-auf-kb/  
Datenstand: 2026-10-31
