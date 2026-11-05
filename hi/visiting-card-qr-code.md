# विज़िटिंग कार्ड के लिए QR कोड: vCard फॉर्मेट

संपर्क QR कोड में एक vCard होता है: BEGIN:VCARD, VERSION:3.0, नाम, फोन, ईमेल और दूसरी पंक्तियाँ, फिर END:VCARD, जिसमें टेक्स्ट के कॉमा, सेमीकोलन और बैकस्लैश के आगे बैकस्लैश लगता है (RFC 2426)। नीचे का उदाहरण लेवल M पर वर्शन 9 (53 x 53 मॉड्यूल) है; QR कोड में लेवल L पर ज़्यादा से ज़्यादा 2,953 बाइट आते हैं।

## QR कोड में vCard कैसा दिखता है?

```
BEGIN:VCARD
VERSION:3.0
N:Sharma;Anu;;;
FN:Anu Sharma
ORG:Example Pvt Ltd
TEL;TYPE=WORK,VOICE:+919876543210
EMAIL;TYPE=INTERNET:anu@example.com
END:VCARD
```

यह vCard 160 बाइट का है। हर अतिरिक्त पंक्ति (पता, वेबसाइट, नोट) कोड को बड़ा और घना बनाती है। लेवल M लगभग 15% कोडवर्ड वापस ला सकता है और DENSO WAVE के अनुसार सबसे ज़्यादा चुना जाता है; घने कोड को बड़ा छापें।

## कार्ड छपवाते समय क्या ध्यान रखें?

अंतिम साइज़ में छापकर स्कैन करके देखें। हल्के बैकग्राउंड पर गहरे मॉड्यूल और चारों ओर चार मॉड्यूल का खाली किनारा सबसे अच्छा पढ़े जाते हैं; कॉन्ट्रास्ट, किनारा या हर मॉड्यूल पर प्रिंटर डॉट कम पड़ें तो जनरेटर चेतावनी देता है।

[जनरेटर में संपर्क कार्ड बनाएँ](https://krishnachagti-sudo.github.io/toll-preview/hi/qr-code-generator/?type=vcard) (कोड आपके ब्राउज़र में बनता है, कुछ भेजा नहीं जाता)।

## ज़रूर पढ़ें

- स्टैटिक कोड आपकी सामग्री सीधे अपने अंदर रखता है और उसकी कोई एक्सपायरी नहीं होती, पर वह तभी चलता है जब उसका ठिकाना (वेबसाइट, फॉर्म, नेटवर्क) मौजूद हो।
- छपाई का बड़ा ऑर्डर देने से पहले हर कोड को उसके अंतिम प्रिंट साइज़ में स्कैन करके देख लें।
- एक्सपायरी जाँच: यह बताती है कि कोड में क्या लिखा है और वह आज कहाँ भेजता है, साथ में दी गई तारीख पर वेंडर की प्रकाशित नीति; यह आपका अकाउंट नहीं देख सकती और यह वादा नहीं कर सकती कि वेंडर आगे क्या करेगा। नीतियाँ दी गई तारीख पर वेंडर के अपने पेजों से सार रूप में ली गई हैं और बदल सकती हैं; जिन वेंडरों के नाम आए हैं उनसे हमारा कोई संबंध नहीं है।
- WiFi कोड: फोन का सपोर्ट अलग-अलग होता है, खासकर एंटरप्राइज़ (WPA2-EAP) फील्ड में; अपने मेहमानों के फोन से आज़माकर देखें।
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## स्रोत

- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines), 2 नवंबर 2026 को पढ़ा गया](https://www.rfc-editor.org/rfc/rfc2426)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), 2 नवंबर 2026 को पढ़ा गया](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [DENSO WAVE: Error correction (Level M 15% is most often selected), 2 नवंबर 2026 को पढ़ा गया](https://www.qrcode.com/en/about/error_correction.html)

## सवाल

### अपने विज़िटिंग कार्ड का QR कोड कैसे बनाएँ?

जनरेटर में संपर्क कार्ड चुनें, नाम, फोन और ईमेल भरें और PNG, SVG या PDF डाउनलोड करें। कोड में vCard 3.0 होता है, जिसे फोन संपर्क के रूप में सहेज सकते हैं।

### क्या विज़िटिंग कार्ड का QR कोड एक्सपायर होता है?

अगर स्टैटिक है तो नहीं: जानकारी कोड में ही है। वह तभी पुराना पड़ता है जब आपकी जानकारी बदले; तब नया कोड बनाना होगा।

## संबंधित पेज

- [WiFi QR कोड कैसे बनाएँ](https://krishnachagti-sudo.github.io/toll-preview/hi/wifi-qr-code-kaise-banaye/)
- [क्या QR कोड एक्सपायर होता है?](https://krishnachagti-sudo.github.io/toll-preview/hi/qr-code-expire-nahi-hota/)
- [QR कोड जनरेटर](https://krishnachagti-sudo.github.io/toll-preview/hi/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hi/visiting-card-qr-code/  
डेटा की तारीख: 2026-11-02
