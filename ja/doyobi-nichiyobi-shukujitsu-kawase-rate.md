# 土日・祝日の為替レートはどうなる?ECBの最後の公表値

ECBのレートがない日は、直前のレート(最大7日前まで)を使います。イースターマンデーの2026年4月6日は、2026年4月2日のレートで、1ユーロ=183.9400円です。

## レートのない日を試す

[ツールでレートを調べる](https://krishnachagti-sudo.github.io/toll-preview/ja/fx-on-date/?base=EUR&quote=JPY&date=2026-10-24)

## レートのない日をツールはどう扱いますか?

指定日を含む過去7日間で最後のレートを探し、どの日のものかを表示します。見つからない場合や、1999年1月4日より前の日付の場合は、その旨を表示し、実行は無料のままです。

## 例:土曜日、イースターマンデー、クリスマス

ECBのレートがない日のユーロ円

| 指定した日付 | 使ったレートの日付 | 1ユーロあたりの円 |
| --- | --- | ---: |
| 2026年10月24日土曜日 | 2026年10月23日金曜日 | 175.5100 |
| 2026年4月6日月曜日(イースターマンデー) | 2026年4月2日木曜日 | 183.9400 |
| 2024年12月25日水曜日(クリスマス) | 2024年12月24日火曜日 | 163.2500 |

イースターは、レートがどこまで遡るかを示す例です。木曜日からイースターマンデーまでの間に、聖金曜日、土曜日、日曜日、そして祝日そのものがあります。

## ECBが公表しない日はいつですか?

ECBは、TARGETの休業日として1月1日、聖金曜日、イースターマンデー、5月1日、12月25日と26日を挙げており、これに土日が加わります([ECBのT2ページ(英語)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html))。TARGETの休業日にあたらない日本の祝日には、ECBのレートがあります。

## 申告や請求書に使うレートですか?

どのレートや基準日を使うかは、提出先や取引の相手が決めます。このツールが答えるのは、その日のECBのレートはいくらで、どの日のものか、ということだけです。レートの調べ方は1つ目のガイドをご覧ください:[日付を指定してユーロ円・ドル円のECB参照レートを調べる](https://krishnachagti-sudo.github.io/toll-preview/ja/yen-kawase-rate-hizuke-shitei/)。

## 出典

- [欧州中央銀行(ECB):Euro foreign exchange reference rates(英語)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [欧州中央銀行(ECB):全履歴(zipファイル内のCSV)](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [欧州中央銀行(ECB):T2、休業日(英語)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)

## よくある質問

### 土曜日・日曜日にもECBのレートはありますか?

いいえ。ECBは営業日にレートを公表します。土曜日や日曜日には、直前のレート、多くは金曜日のものを使うのが一般的です。ツールはこれを自動で行い、日付を表示します。

### ECBが公表しないのはどんな日ですか?

土日のほか、TARGETの休業日です。1月1日、聖金曜日、イースターマンデー、5月1日、12月25日と26日で、ECBのT2のページに書かれています。TARGETの休業日にあたらない日本の祝日には、ECBのレートが公表されます。

### その日のレートをECBがまだ公表していない場合は?

ツールは古いレートを現在のものとして出さず、「レートなし」と表示します。この実行は無料です。公表後(中央ヨーロッパ時間の16時ごろ)にもう一度お試しください。

## 関連ページ

- [日付を指定してユーロ円・ドル円のECB参照レートを調べる](https://krishnachagti-sudo.github.io/toll-preview/ja/yen-kawase-rate-hizuke-shitei/)
- [ツール:日付指定の為替レート](https://krishnachagti-sudo.github.io/toll-preview/ja/fx-on-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ja/doyobi-nichiyobi-shukujitsu-kawase-rate/  
データ日付: 2026-11-05
