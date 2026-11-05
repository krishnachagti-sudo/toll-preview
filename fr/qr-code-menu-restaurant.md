# QR code pour le menu d’un restaurant : bien le faire

Pour le menu d’un restaurant, créez un QR code statique avec l’adresse de votre menu sur un domaine à vous : https://example.com/menu tient dans la version 2 (25 x 25 modules) au niveau M, et n’expire pas puisqu’aucun prestataire n’intervient. Chaque code par table issu d’un tableur coûte $0.002, avec un minimum de 10 par commande.

## Comment faire un QR code pour le menu d’un restaurant ?

Choisissez **Lien vers un site web** dans le [générateur](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-generator/), saisissez l’adresse du menu et téléchargez le fichier. La page montre le texte exact que contient le code et le relit avant que vous le téléchargiez.

```
https://example.com/menu
```

Ce lien donne un code de version 2, de 25 x 25 modules, au niveau M.

## Statique ou dynamique pour un menu ?

Un code dynamique contient un lien court d’un prestataire et ne fonctionne que tant que celui-ci le transmet ; ce que les prestataires disent des abonnements terminés figure dans [ce guide](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-sans-expiration/). Avec un code statique et une page de menu sur votre propre domaine, vous pouvez changer le menu quand vous voulez sans toucher à ce qui est imprimé.

## Quelle taille imprimer ?

La largeur de départ de la page est de 30 mm : avec 33 modules de large (marge de quatre modules de chaque côté comprise), chaque module fait 0,91 mm, soit environ 10,7 points d’une imprimante à 300 ppp. DENSO WAVE recommande 4 points ou plus par module ; à 300 ppp, ce code ne devrait pas être imprimé à moins de 11,2 mm de large. Scannez-le en test à la taille définitive.

## Comment faire un code par table ?

Préparez un tableur avec une colonne url et une colonne label, une ligne par table, et ouvrez-le dans la section « Beaucoup de codes » du générateur. Avec ces lignes, l’outil a prévu :

| Ligne | Fichier | Contenu | Version et niveau |
| --- | --- | --- | --- |
| 2 | table-1.png | https://example.com/menu/table-1 | 3, Q |
| 3 | table-2.png | https://example.com/menu/table-2 | 3, Q |
| 4 | table-3.png | https://example.com/menu/table-3 | 3, Q |

Le prix est de $0.002 par code, avec un minimum de 10 par commande ($0.02) ; 12 tables coûtent $0.024. Les lignes qui ne peuvent pas devenir un code ne sont jamais facturées. Dans les fichiers du lot, l’outil relève le niveau de correction d’erreurs quand le code garde la même taille, ce qui explique le niveau Q du tableau.

## À lire

- Un code statique stocke directement votre contenu et n’expire pas, mais il ne fonctionne que tant que sa destination (site web, formulaire, réseau) existe.
- Scannez chaque code en test à sa taille d’impression définitive avant un tirage.
- Vérification d’expiration : elle indique ce que le code contient et où il redirige aujourd’hui, plus la règle publiée du prestataire à la date indiquée ; elle ne voit pas votre compte et ne peut rien promettre sur ce que fera un prestataire. Les règles sont résumées d’après les pages du prestataire à la date indiquée et peuvent changer ; nous ne sommes affiliés à aucun des prestataires nommés.
- Codes Wi-Fi : la prise en charge varie selon les téléphones, surtout pour les champs entreprise (WPA2-EAP) ; testez avec les téléphones de vos invités.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Sources

- [DENSO WAVE: Module size (4 or more printer dots a module), lue le 2 novembre 2026](https://www.qrcode.com/en/howto/cell.html)
- [DENSO WAVE: Points for using QR Code (quiet zone of four modules), lue le 2 novembre 2026](https://www.qrcode.com/en/howto/code.html)

## Étapes

1. **Mettez le menu sur une page à vous.** Utilisez une adresse sur un domaine que vous contrôlez, par exemple https://example.com/menu. Le code dira cette adresse pour toujours.
2. **Créez un code statique.** Dans le générateur, choisissez Lien vers un site web et saisissez l’adresse. Le code est créé dans votre navigateur, gratuitement et sans compte.
3. **Téléchargez et testez.** Téléchargez le SVG ou le PDF, imprimez un essai à la taille définitive et scannez-le avec plusieurs téléphones avant le tirage.

## Questions

### Le QR code du menu d’un restaurant expire-t-il ?

Un code statique n’expire pas. Mais si le lien mène à une page de menu qui change d’adresse ou à un domaine qui expire, le code ne mène plus à rien. Faites pointer le code vers une page de votre propre domaine et changez le menu à cet endroit.

### Statique ou dynamique pour un menu ?

Un code dynamique permet de changer la destination sans réimprimer, mais il dépend de la transmission continue par le prestataire ; un code statique ne dépend que de votre site. Si vous contrôlez votre domaine, vous pouvez changer la page du menu sans changer le code.

### Peut-on faire un code différent par table ?

Oui : un tableur avec une ligne par table produit un code par ligne, avec un fichier manifeste et une planche d’étiquettes à imprimer.

## Pages liées

- [Un QR code peut-il expirer ?](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-sans-expiration/)
- [QR code Wi-Fi](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-wifi/)
- [Générateur de QR code](https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/qr-code-menu-restaurant/  
Données au: 2026-11-02
