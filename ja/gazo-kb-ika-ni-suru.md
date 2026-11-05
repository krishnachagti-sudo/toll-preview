# 画像を100KB以下にする方法：20・50・100・200KBの圧縮

ツールを開き、写真と上限（例：100KB）を選んで、結果をダウンロードします。テストでは、12メガピクセルで2.08MBの写真が、100KBの上限で99.0KB（2,476 × 1,857 px、JPEG画質40%）になりました。

## 上限を選んだ状態でツールを開くには？

上限があらかじめ選ばれた状態で開きます：[20KB](https://krishnachagti-sudo.github.io/toll-preview/ja/image-to-size/?kb=20)、[50KB](https://krishnachagti-sudo.github.io/toll-preview/ja/image-to-size/?kb=50)、[100KB](https://krishnachagti-sudo.github.io/toll-preview/ja/image-to-size/?kb=100)、[200KB](https://krishnachagti-sudo.github.io/toll-preview/ja/image-to-size/?kb=200)。無料です。

## 20・50・100・200KBで写真はどうなる？

スマホで保存されるサイズ（12メガピクセル）のテスト写真2枚を、ツールで圧縮した結果です。

4つの上限でのツールの結果

| 上限 | 写真 | 新しいサイズ | ピクセル数 | JPEG画質 |
| --- | --- | ---: | ---: | ---: |
| 20KB | 横向き | 19.7KB | 794 × 595 px | 38% |
| 20KB | 縦向き | 19.9KB | 366 × 487 px | 46% |
| 50KB | 横向き | 49.0KB | 1,521 × 1,141 px | 40% |
| 50KB | 縦向き | 49.9KB | 700 × 934 px | 41% |
| 100KB | 横向き | 99.0KB | 2,476 × 1,857 px | 40% |
| 100KB | 縦向き | 97.7KB | 1,141 × 1,521 px | 37% |
| 200KB | 横向き | 199.1KB | 3,427 × 2,570 px | 48% |
| 200KB | 縦向き | 198.2KB | 1,857 × 2,476 px | 35% |

> Chromium 149.0.7827.55でツールを動かして2026年10月31日に測定しました。ブラウザごとにJPEGの圧縮方式が違うため、結果は数パーセント変わることがありますが、上限は超えません。

## 画質はどうなる？

ツールはまずJPEGの画質だけを下げます（92%から35%の間）。それでも収まらないときに、ピクセル数を減らします。テストの横向きの写真は、200KBでピクセルの72%を残しました（3,427 × 2,570 px）。すべてのピクセルが残ったのは、テストでは240KBからでした。20KBや50KBでは画像がかなり小さくなりますが、フォーム用の写真ならそれで足りることが多いです。

## 写真はサーバーにアップロードされますか？

いいえ。写真はブラウザの中で小さくされ、ページには写真をどこかへ送るコードがありません。ブラウザのネットワークタブにも、アップロードは出てきません。

## 100KBは100,000バイト？ 102,400バイト？

フォームはほとんど明記していません。1KBを1,000バイトとすると100KBは100,000バイト、1,024バイトとすると102,400バイトです。ツールは小さいほうの100,000バイトを超えないようにするので、どちらの場合でも通ります。

## 出典

テスト用の写真はNASAのもので、パブリックドメインです。結果はツール自身が出したもので、上記のテスト環境で測りました。

- [NASA, KSC-20210111-PH-JBS01\_0021 パブリックドメイン](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt パブリックドメイン](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 パブリックドメイン](https://images.nasa.gov/details/KSC-08pd4102)

## 手順

1. **ツールを開く.** 「画像をKB指定で圧縮」を開きます。ブラウザの中で動くので、写真はどこにもアップロードされません。
2. **写真を選ぶ.** JPEG、PNG、WebPの写真を選ぶか、枠の中にドロップします。
3. **上限を決める.** 20、50、100、200KBのボタンを押すか、KBで上限を入力します。
4. **結果をダウンロード.** 新しいサイズが表示されます。ファイルをダウンロードしてください。ファイル名は元の写真の名前の後ろに「-100kb.jpg」がついたもの（例：ryoko-100kb.jpg）です。

## よくある質問

### 写真を100KBにするには？

ツールで写真を選び、上限を100KBにして、結果をダウンロードします。テストでは12メガピクセルの写真が99.0KB（2,476 × 1,857 px）になりました。

### PNGはJPEGになりますか？

はい。結果は必ずJPEGです。PNGの透明な部分は白になります。

### なぜ圧縮後にピクセル数が減るのですか？

最低の画質（35%）でも大きすぎるときは、収まるまで15%ずつ画像を小さくします。上限が大きいほど、残るピクセルは多くなります。

### 上限が小さすぎる場合は？

ツールは画像を元の10分の1より小さくしません。その場合はお知らせするので、もっと大きい上限でお試しください。

## 関連ページ

- [JPEGを画質を落とさずKB制限に収める方法](https://krishnachagti-sudo.github.io/toll-preview/ja/jpeg-gazoshitsu-kb-seigen/)
- [マイナンバーカードの顔写真を20KB〜7MBに収める方法](https://krishnachagti-sudo.github.io/toll-preview/ja/mynumber-card-kaoshashin-size/)
- [画像をKB指定で圧縮（ツール）](https://krishnachagti-sudo.github.io/toll-preview/ja/image-to-size/)
- [Reduce image size in KB（英語）](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [Reducir foto a un tamaño en KB: Reducir una foto a 20, 50, 100 o 200 KB, gratis](https://krishnachagti-sudo.github.io/toll-preview/es/reducir-foto-a-kb/)
- [Bild auf Dateigröße verkleinern: Bild auf 100 KB verkleinern: Foto auf KB-Größe bringen](https://krishnachagti-sudo.github.io/toll-preview/de/bild-verkleinern-auf-kb/)
- [Réduire une photo à un poids en Ko: Réduire une photo en Ko : 20, 50, 100 ou 200 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/reduire-photo-en-ko/)
- [Reduzir foto para um tamanho em KB: Reduzir foto para 20, 50, 100 ou 200 KB, grátis](https://krishnachagti-sudo.github.io/toll-preview/pt/reduzir-foto-para-kb/)
- [फोटो का साइज़ KB में कम करें: फोटो का साइज़ 20, 50, 100 या 200 KB कैसे करें](https://krishnachagti-sudo.github.io/toll-preview/hi/photo-size-kb-kam-kaise-kare/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ja/gazo-kb-ika-ni-suru/  
データ日付: 2026-10-31
