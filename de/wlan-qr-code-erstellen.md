# WLAN-QR-Code erstellen: so ist der Text im Code aufgebaut

Ein WLAN-QR-Code enthält eine Zeile Text, zum Beispiel WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T ist die Verschlüsselung (WPA, WEP, WPA2-EAP oder nopass), S der Netzwerkname, P das Passwort; die Zeichen \\ ; , " : werden mit einem Backslash maskiert. Dieses Beispiel ist Version 3 (29 x 29 Module) bei Stufe M.

## Wie sieht der Text in einem WLAN-QR-Code aus?

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

Das Semikolon im Passwort des Beispiels (tea;time42) ist mit einem Backslash maskiert, sonst würde das Handy dort das Feld beenden. Die zweite Zeile ist ein offenes Netz ohne Passwort.

## Wie groß wird der Code?

Das Beispiel ist 39 Byte lang. Je höher die Fehlerkorrektur, desto größer der Code: bei Stufe L Version 3 (29 x 29), bei M Version 3 (29 x 29), bei Q Version 4 (33 x 33), bei H Version 5 (37 x 37). Ein größerer Code braucht beim Druck mehr Platz.

## Wie schreibe ich ein verstecktes Netzwerk?

Mit H:true vor dem abschließenden Semikolon, so wie hier erzeugt: `WIFI:T:WPA;S:Gaeste-Netz;P:Sommer2026;H:true;;`

## Was ist mit Unternehmensnetzen?

Unternehmensnetze ergänzen E: (EAP-Methode), A: (anonyme Identität), I: (Identität) und PH2: (Phase 2), wie ZXing dokumentiert. Die Unterstützung der Handys ist hier unterschiedlich; testen Sie mit den Handys, die Ihre Gäste benutzen.

[WLAN-Code im Generator erstellen](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-generator/?type=wifi) (der Code entsteht in Ihrem Browser, nichts wird gesendet).

## Bitte lesen

- Ein statischer Code speichert Ihren Inhalt direkt und hat kein Ablaufdatum, funktioniert aber nur, solange sein Ziel (Website, Formular, Netzwerk) existiert.
- Scannen Sie jeden Code vor einem Druckauftrag in der endgültigen Druckgröße zur Probe.
- Ablauf-Prüfung: Sie zeigt, was der Code enthält und wohin er heute weiterleitet, dazu die veröffentlichte Regel des Anbieters am angegebenen Datum; sie sieht Ihr Konto nicht und kann nichts darüber versprechen, was ein Anbieter tun wird. Anbieterregeln stammen von den eigenen Seiten der Anbieter am angegebenen Datum und können sich ändern; wir sind mit keinem genannten Anbieter verbunden.
- WLAN-Codes: Die Unterstützung der Handys ist unterschiedlich, besonders bei Unternehmensfeldern (WPA2-EAP); testen Sie mit den Handys Ihrer Gäste.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Quellen

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), gelesen am 2. November 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## Schritte

1. **Mit WIFI: beginnen.** Danach folgen die Felder, jedes mit einem Semikolon am Ende, in beliebiger Reihenfolge.
2. **Verschlüsselung.** T:WPA für private WPA-, WPA2- und WPA3-Netze, T:WEP, T:WPA2-EAP für Unternehmensnetze oder T:nopass für ein offenes Netz.
3. **Name und Passwort.** S: der Netzwerkname, P: das Passwort. Setzen Sie vor jedes \\ ; , " oder : einen Backslash. Ein Name oder Passwort, das sich als Hex-Zahl lesen ließe, steht in doppelten Anführungszeichen.
4. **Abschluss.** Für ein verstecktes Netzwerk H:true ergänzen, dann mit einem zweiten Semikolon enden.

## Fragen

### Wie sieht der Text in einem WLAN-QR-Code aus?

Eine Zeile wie WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T ist die Verschlüsselung, S der Netzwerkname, P das Passwort; die Zeichen \\ ; , " : werden mit einem Backslash maskiert.

### Wie mache ich einen QR-Code für ein offenes WLAN?

Mit T:nopass und ohne Passwort, zum Beispiel WIFI:T:nopass;S:Lobby;;.

### Funktioniert der Code auf jedem Handy?

Nicht garantiert: Die Unterstützung ist unterschiedlich, besonders bei Unternehmensfeldern (WPA2-EAP). Testen Sie mit den Handys, die Ihre Gäste benutzen.

## Verwandte Seiten

- [Läuft ein QR-Code ab?](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-laeuft-nie-ab/)
- [Visitenkarte als QR-Code (vCard)](https://krishnachagti-sudo.github.io/toll-preview/de/visitenkarte-qr-code-vcard/)
- [QR-Code-Generator](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/de/wlan-qr-code-erstellen/  
Datenstand: 2026-11-02
