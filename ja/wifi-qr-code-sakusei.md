# Wi-Fi用QRコード:コードの中に入るテキスト

Wi-Fi用QRコードには、WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;; のようなテキストが1行入っています。Tがセキュリティ(WPA、WEP、WPA2-EAP、nopass)、Sがネットワーク名、Pがパスワードで、\\ ; , " : の前にはバックスラッシュが付きます。この例は、レベルMでバージョン3(29 x 29モジュール)です。

## Wi-Fi用QRコードには、どんなテキストが入っていますか?

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

例のパスワード(tea;time42)のセミコロンの前にはバックスラッシュがあります。これがないと、スマートフォンはそこで項目が終わったと解釈します。2行目は、パスワードなしのオープンなネットワークです。

## コードの大きさはどれくらいになりますか?

この例は39バイトです。誤り訂正を強くするほどコードは大きくなり、レベルLではバージョン3(29 x 29)、Mでは3(29 x 29)、Qでは4(33 x 33)、Hでは5(37 x 37)です。大きなコードは、印刷にも広い場所が必要です。

## ステルスネットワークはどう書きますか?

最後のセミコロンの前にH:trueを付けます。このように生成されます:`WIFI:T:WPA;S:Gaeste-Netz;P:Sommer2026;H:true;;`

## 企業向けネットワークは?

企業向けネットワークでは、E:(EAP方式)、A:(匿名ID)、I:(ID)、PH2:(フェーズ2)が加わります。これはZXingの文書にある内容です。スマートフォンの対応は機種によって異なるので、ゲストが使う機種で試してください。

[作成ツールでWi-Fiのコードを作る](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-generator/?type=wifi)(コードはブラウザー上で作られ、何も送信されません)。

## ご確認ください

- スタティックコードは内容を直接持っていて有効期限はありませんが、リンク先(ウェブサイト、フォーム、ネットワーク)が存在する間だけ機能します。
- 印刷の前に、最終的な印刷サイズで必ず試しにスキャンしてください。
- 有効期限の確認:コードの内容と、現在どこに転送されるかに加え、日付を示したベンダーの公開方針を表示します。あなたのアカウントは見られず、ベンダーが今後どうするかを約束することもできません。方針は、示した日付時点のベンダー自身のページの要約で、変わることがあります。挙げているベンダーとは提携していません。
- Wi-Fiコード:スマートフォンの対応状況は機種によって異なり、特に企業向け(WPA2-EAP)の項目で差が出ます。ゲストが使う機種で試してください。
- 「QRコード」は(株)デンソーウェーブの登録商標です。
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## 出典

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), 2026年11月2日確認](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## 手順

1. **WIFI:で始める.** 続けて項目を書きます。各項目の末尾にセミコロンを付け、順序は自由です。
2. **セキュリティ.** WPA、WPA2、WPA3のパーソナルならT:WPA、T:WEP、企業向けならT:WPA2-EAP、パスワードなしのオープンならT:nopass。
3. **ネットワーク名とパスワード.** S:にネットワーク名、P:にパスワード。\\ ; , " : の前にはバックスラッシュを付けます。16進数として読めてしまう名前やパスワードは、二重引用符で囲みます。
4. **終わり.** ステルスネットワークならH:trueを足し、最後にもう1つセミコロンを付けて終えます。

## よくある質問

### Wi-Fi用QRコードには、どんなテキストが入っていますか?

WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;; のような1行です。Tがセキュリティ、Sがネットワーク名、Pがパスワードで、\\ ; , " : の前にはバックスラッシュが付きます。

### パスワードなしのWi-Fiには、どう作りますか?

T:nopassにして、パスワードを入れません。例:WIFI:T:nopass;S:Lobby;;

### すべてのスマートフォンで使えますか?

保証はできません。対応状況は機種によって異なり、特に企業向け(WPA2-EAP)の項目で差が出ます。ゲストが使う機種で試してください。

## 関連ページ

- [QRコードに有効期限はある?](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-yuko-kigen-nashi/)
- [名刺のQRコード(vCard)](https://krishnachagti-sudo.github.io/toll-preview/ja/meishi-qr-code-vcard/)
- [QRコード作成](https://krishnachagti-sudo.github.io/toll-preview/ja/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ja/wifi-qr-code-sakusei/  
データ日付: 2026-11-02
