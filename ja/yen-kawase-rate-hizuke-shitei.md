# 日付を指定してユーロ円・ドル円のECB参照レートを調べる

ECBの参照レートでは、2026年10月24日の1ユーロは175.5100円、1米ドルは156.803359円でした。これは2026年10月23日のレートで、ECBは土曜日には新しいレートを公表しません。

## 日付を指定してレートを調べる

[ツールでレートを調べる](https://krishnachagti-sudo.github.io/toll-preview/ja/fx-on-date/?base=EUR&quote=JPY&date=2026-10-24)

## ECB参照レートとは何ですか?

ユーロ圏の中央銀行である欧州中央銀行(ECB)は、TARGETの休業日を除く営業日ごとに、1ユーロで各通貨がいくら買えるかを公表しています。ECB自身の説明では、中央ヨーロッパ時間の16時ごろです。日本円(JPY)もその一覧に入っています。これはECBがその日のレートとして記録したもので、銀行が両替する価格ではありません。ECBのページは英語のみです([Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html))。

## 2026年10月24日のユーロ円・ドル円はいくらでしたか?

| 項目 | 値 |
| --- | ---: |
| 指定した日付 | 2026年10月24日土曜日 |
| 使ったレートの日付 | 2026年10月23日金曜日 |
| 1ユーロ(円) | 175.5100 |
| 1円(ユーロ、逆数) | 0.005698 |
| 1米ドル(円) | 156.803359 |
| 1円(米ドル、逆数) | 0.006377 |
| 1,000ユーロ(円) | 175,510.00 |

ECBの表はユーロに対するレートだけなので、ドル円はツールが計算します。同じ日の「1ユーロあたりの円」を「1ユーロあたりの米ドル」で割り、小数第6位まで丸めます。最後の行は、1,000に175.5100を掛けて、小数第2位で丸めたものです。

## 土日・祝日のレートはどうなりますか?

その日はECBが公表しないため、その前の最後のレートを使います。くわしくは2つ目のガイドをご覧ください:[土日・祝日の為替レートはどうなる?](https://krishnachagti-sudo.github.io/toll-preview/ja/doyobi-nichiyobi-shukujitsu-kawase-rate/)。

## 出典

- [欧州中央銀行(ECB):Euro foreign exchange reference rates(英語)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [欧州中央銀行(ECB):全履歴(zipファイル内のCSV)](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [欧州中央銀行(ECB):T2、休業日(英語)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)

## 手順

1. **通貨ペアを選ぶ.** 「換算元」にユーロ(EUR)または米ドル(USD)、「換算先」に日本円(JPY)を選びます。
2. **日付を入れる.** 知りたい日を入れます。1999年1月4日以降なら、どの日付でも使えます。
3. **出典を確かめる.** 出典は「ECB参照レート」のままにします。
4. **レートを調べる.** レート、その逆数、実際に使ったレートの日付が表示されます。指定日が土日・祝日なら、その前の日が表示されます。

## よくある質問

### 過去の日付のユーロ円レートはどう調べますか?

このページのツールに日付と EUR、JPY を入れると、ECBの参照レートと、実際に使ったレートの日付がわかります。2026年10月24日の結果は1ユーロ=175.5100円です。

### 日本円はECBの通貨リストに入っていますか?

はい。ECBは、ユーロに対する日本円(JPY)の参照レートも公表しています。米ドルと円のレートは、ツールが同じ日の2つのユーロレートから計算します。

### ECBのレートは、銀行が使うレートと同じですか?

いいえ。ECBはこのレートを参考情報としてのみ公表し、取引に使うことを強く控えるよう呼びかけています。銀行やカード会社は、それぞれ自社のレートと手数料を使います。税務や経理で特定のレートが指定されている場合は、そのレートを使ってください。

## 関連ページ

- [土日・祝日の為替レートはどうなる?ECBの最後の公表値](https://krishnachagti-sudo.github.io/toll-preview/ja/doyobi-nichiyobi-shukujitsu-kawase-rate/)
- [ツール:日付指定の為替レート](https://krishnachagti-sudo.github.io/toll-preview/ja/fx-on-date/)
- [Deutsch: EZB-Referenzkurs an einem bestimmten Datum nachschlagen](https://krishnachagti-sudo.github.io/toll-preview/de/ezb-referenzkurs-an-einem-datum/)
- [Français : taux de référence BCE à une date donnée](https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-reference-bce-a-une-date/)
- [Português: cotação do euro e do dólar em relação ao real em uma data](https://krishnachagti-sudo.github.io/toll-preview/pt/cotacao-do-euro-e-do-dolar-em-uma-data/)
- [हिन्दी: किसी तारीख़ पर डॉलर और यूरो के मुकाबले रुपये का रेट](https://krishnachagti-sudo.github.io/toll-preview/hi/dollar-euro-ke-mukable-rupaye-ka-rate/)
- [Exchange rate on a date (English)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ja/yen-kawase-rate-hizuke-shitei/  
データ日付: 2026-11-05
