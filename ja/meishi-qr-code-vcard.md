# 名刺に入れるQRコード:vCardの書式

連絡先のQRコードには、vCardが入っています。BEGIN:VCARD、VERSION:3.0、名前、電話、メールなどの行が続き、最後がEND:VCARDです。テキスト中のカンマ、セミコロン、バックスラッシュの前には、バックスラッシュを付けます(RFC 2426)。下の例は、レベルMでバージョン9(53 x 53モジュール)です。QRコードには、レベルLで最大2,953バイト入ります。

## QRコードの中のvCardはどんな形ですか?

```
BEGIN:VCARD
VERSION:3.0
N:Yamada;Taro;;;
FN:Taro Yamada
ORG:Sample Inc
TEL;TYPE=WORK,VOICE:+81312345678
EMAIL;TYPE=INTERNET:taro@example.com
END:VCARD
```

このvCardは157バイトです。住所、ウェブサイト、メモなどの行を足すほど、コードは大きく細かくなります。レベルMはコード語の約15%を復元でき、DENSO WAVEによれば最もよく選ばれています。細かいコードは、大きめに印刷してください。

## 日本語の名前を入れると、サイズはどうなりますか?

日本語の文字はUTF-8で入るので、バイト数が増えます。この例で、姓名と会社名を漢字(山田 太郎、株式会社サンプル)にすると、157バイトが175バイトになります。この例では、どちらもレベルMでバージョン9(53 x 53モジュール)に収まります。

## 名刺に印刷するときの注意は?

最終サイズで必ず試しにスキャンしてください。明るい背景に暗いモジュール、四方に4モジュール分の余白があると、最も読み取りやすくなります。コントラスト、余白、1モジュールあたりのプリンターのドット数が足りないときは、作成ツールが警告します。

[作成ツールで連絡先カードを作る](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-generator/?type=vcard)(コードはブラウザー上で作られ、何も送信されません)。

## ご確認ください

- スタティックコードは内容を直接持っていて有効期限はありませんが、リンク先(ウェブサイト、フォーム、ネットワーク)が存在する間だけ機能します。
- 印刷の前に、最終的な印刷サイズで必ず試しにスキャンしてください。
- 有効期限の確認:コードの内容と、現在どこに転送されるかに加え、日付を示したベンダーの公開方針を表示します。あなたのアカウントは見られず、ベンダーが今後どうするかを約束することもできません。方針は、示した日付時点のベンダー自身のページの要約で、変わることがあります。挙げているベンダーとは提携していません。
- Wi-Fiコード:スマートフォンの対応状況は機種によって異なり、特に企業向け(WPA2-EAP)の項目で差が出ます。ゲストが使う機種で試してください。
- 「QRコード」は(株)デンソーウェーブの登録商標です。
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## 出典

- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines), 2026年11月2日確認](https://www.rfc-editor.org/rfc/rfc2426)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), 2026年11月2日確認](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [DENSO WAVE: Error correction (Level M 15% is most often selected), 2026年11月2日確認](https://www.qrcode.com/en/about/error_correction.html)

## よくある質問

### 名刺用のQRコードはどう作りますか?

作成ツールで「連絡先カード」を選び、名前、電話、メールを入力して、PNG、SVG、PDFをダウンロードします。コードにはvCard 3.0が入っていて、スマートフォンは連絡先として保存できます。

### 名刺のQRコードに有効期限はありますか?

スタティックなら、ありません。情報がコードの中に入っているからです。電話番号などが変わったときだけ古くなるので、そのときは新しいコードを作ってください。

## 関連ページ

- [Wi-Fi用QRコードの作り方](https://krishnachagti-sudo.github.io/toll-preview/ja/wifi-qr-code-sakusei/)
- [QRコードに有効期限はある?](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-yuko-kigen-nashi/)
- [QRコード作成](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ja/meishi-qr-code-vcard/  
データ日付: 2026-11-02
