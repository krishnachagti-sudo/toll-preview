# QR-Code für die Visitenkarte: das vCard-Format

Ein Kontakt-QR-Code enthält eine vCard: BEGIN:VCARD, VERSION:3.0, Name, Telefon, E-Mail und weitere Zeilen, dann END:VCARD, wobei Kommas, Semikolons und Backslashes im Text mit einem Backslash maskiert werden (RFC 2426). Das Beispiel unten ist Version 9 (53 x 53 Module) bei Stufe M; ein QR-Code fasst bei Stufe L höchstens 2.953 Byte.

## Wie sieht die vCard in einem QR-Code aus?

```
BEGIN:VCARD
VERSION:3.0
N:Schmidt;Anna;;;
FN:Anna Schmidt
ORG:Muster GmbH
TEL;TYPE=WORK,VOICE:+4930123456
EMAIL;TYPE=INTERNET:anna@example.com
END:VCARD
```

Die vCard hat 159 Byte. Jede weitere Zeile (Adresse, Website, Notiz) macht den Code größer und dichter. Stufe M stellt etwa 15% der Codewörter wieder her und ist laut DENSO WAVE die am häufigsten gewählte; drucken Sie einen dichten Code größer.

## Was passiert bei einer Visitenkarte zum Ausdrucken?

Scannen Sie den Code vor dem Druck in der endgültigen Größe zur Probe. Dunkle Module auf hellem Grund und eine freie Ruhezone von vier Modulen rundherum lesen sich am besten; der Generator warnt, wenn Kontrast, Rand oder Druckpunkte pro Modul zu knapp sind.

[Kontaktkarte im Generator erstellen](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-generator/?type=vcard) (der Code entsteht in Ihrem Browser, nichts wird gesendet).

## Bitte lesen

- Ein statischer Code speichert Ihren Inhalt direkt und hat kein Ablaufdatum, funktioniert aber nur, solange sein Ziel (Website, Formular, Netzwerk) existiert.
- Scannen Sie jeden Code vor einem Druckauftrag in der endgültigen Druckgröße zur Probe.
- Ablauf-Prüfung: Sie zeigt, was der Code enthält und wohin er heute weiterleitet, dazu die veröffentlichte Regel des Anbieters am angegebenen Datum; sie sieht Ihr Konto nicht und kann nichts darüber versprechen, was ein Anbieter tun wird. Anbieterregeln stammen von den eigenen Seiten der Anbieter am angegebenen Datum und können sich ändern; wir sind mit keinem genannten Anbieter verbunden.
- WLAN-Codes: Die Unterstützung der Handys ist unterschiedlich, besonders bei Unternehmensfeldern (WPA2-EAP); testen Sie mit den Handys Ihrer Gäste.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Quellen

- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines), gelesen am 2. November 2026](https://www.rfc-editor.org/rfc/rfc2426)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), gelesen am 2. November 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [DENSO WAVE: Error correction (Level M 15% is most often selected), gelesen am 2. November 2026](https://www.qrcode.com/en/about/error_correction.html)

## Fragen

### Wie mache ich einen QR-Code für meine Visitenkarte?

Wählen Sie im Generator die Kontaktkarte, tragen Sie Name, Telefon und E-Mail ein und laden Sie PNG, SVG oder PDF herunter. Der Code enthält eine vCard 3.0, die Handys als Kontakt speichern können.

### Läuft ein Visitenkarten-QR-Code ab?

Nein, wenn er statisch ist: Die Angaben stecken im Code. Er ist nur veraltet, wenn sich Ihre Daten ändern; dann brauchen Sie einen neuen Code.

## Verwandte Seiten

- [WLAN-QR-Code erstellen](https://krishnachagti-sudo.github.io/toll-preview/de/wlan-qr-code-erstellen/)
- [Läuft ein QR-Code ab?](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-laeuft-nie-ab/)
- [QR-Code-Generator](https://krishnachagti-sudo.github.io/toll-preview/de/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/de/visitenkarte-qr-code-vcard/  
Datenstand: 2026-11-02
