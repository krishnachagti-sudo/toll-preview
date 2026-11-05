# QR code Wi-Fi : à quoi ressemble le texte du code

Un QR code Wi-Fi contient une ligne de texte, par exemple WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T est la sécurité (WPA, WEP, WPA2-EAP ou nopass), S le nom du réseau, P le mot de passe ; les caractères \\ ; , " : sont échappés par une barre oblique inverse. Cet exemple est de version 3 (29 x 29 modules) au niveau M.

## À quoi ressemble le texte d’un QR code Wi-Fi ?

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

Le point-virgule du mot de passe de l’exemple (tea;time42) est précédé d’une barre oblique inverse ; sans elle, le téléphone considérerait le champ comme terminé à cet endroit. La deuxième ligne est un réseau ouvert, sans mot de passe.

## Quelle taille fait le code ?

L’exemple fait 39 octets. Plus la correction d’erreurs est forte, plus le code grandit : version 3 (29 x 29) au niveau L, 3 (29 x 29) au niveau M, 4 (33 x 33) au niveau Q et 5 (37 x 37) au niveau H. Un code plus grand demande plus de place à l’impression.

## Comment écrire un réseau masqué ?

Avec H:true avant le point-virgule final, comme dans ce texte généré : `WIFI:T:WPA;S:Gaeste-Netz;P:Sommer2026;H:true;;`

## Et les réseaux d’entreprise ?

Les réseaux d’entreprise ajoutent E: (méthode EAP), A: (identité anonyme), I: (identité) et PH2: (phase 2), comme le documente ZXing. La prise en charge varie selon les téléphones ; testez avec ceux de vos invités.

[Créer le code Wi-Fi dans le générateur](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-generator/?type=wifi) (le code est créé dans votre navigateur, rien n’est envoyé).

## À lire

- Un code statique stocke directement votre contenu et n’expire pas, mais il ne fonctionne que tant que sa destination (site web, formulaire, réseau) existe.
- Scannez chaque code en test à sa taille d’impression définitive avant un tirage.
- Vérification d’expiration : elle indique ce que le code contient et où il redirige aujourd’hui, plus la règle publiée du prestataire à la date indiquée ; elle ne voit pas votre compte et ne peut rien promettre sur ce que fera un prestataire. Les règles sont résumées d’après les pages du prestataire à la date indiquée et peuvent changer ; nous ne sommes affiliés à aucun des prestataires nommés.
- Codes Wi-Fi : la prise en charge varie selon les téléphones, surtout pour les champs entreprise (WPA2-EAP) ; testez avec les téléphones de vos invités.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Sources

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), lue le 2 novembre 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## Étapes

1. **Commencez par WIFI:.** Viennent ensuite les champs, chacun terminé par un point-virgule, dans n’importe quel ordre.
2. **Sécurité.** T:WPA pour les réseaux personnels WPA, WPA2 et WPA3, T:WEP, T:WPA2-EAP pour l’entreprise, ou T:nopass pour un réseau ouvert.
3. **Nom et mot de passe.** S: le nom du réseau, P: le mot de passe. Mettez une barre oblique inverse devant tout \\ ; , " ou :. Un nom ou mot de passe qui pourrait se lire comme de l’hexadécimal se met entre guillemets doubles.
4. **Fin.** Ajoutez H:true pour un réseau masqué, puis terminez par un second point-virgule.

## Questions

### À quoi ressemble le texte d’un QR code Wi-Fi ?

À une ligne comme WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T est la sécurité, S le nom du réseau, P le mot de passe ; les caractères \\ ; , " : sont échappés par une barre oblique inverse.

### Comment faire un QR code pour un Wi-Fi ouvert ?

Avec T:nopass et sans mot de passe, par exemple WIFI:T:nopass;S:Lobby;;.

### Fonctionne-t-il sur tous les téléphones ?

Ce n’est pas garanti : la prise en charge varie, surtout pour les champs entreprise (WPA2-EAP). Testez avec les téléphones de vos invités.

## Pages liées

- [Un QR code peut-il expirer ?](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-sans-expiration/)
- [QR code pour le menu d’un restaurant](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-menu-restaurant/)
- [Générateur de QR code](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-wifi/  
Données au: 2026-11-02
