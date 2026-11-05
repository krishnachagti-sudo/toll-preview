# Réduire une photo en Ko : 20, 50, 100 ou 200 Ko

Ouvrez l’outil, choisissez votre photo et la limite, par exemple 100 Ko, puis téléchargez le résultat. Dans notre test, une photo de 12 mégapixels de 2,08 Mo est passée à 99,0 Ko, à 2 476 × 1 857 px et en qualité JPEG 40 %.

## Comment ouvrir l’outil avec la bonne limite ?

L’outil s’ouvre avec la limite déjà choisie : [20 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/?kb=20), [50 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/?kb=50), [100 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/?kb=100) ou [200 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/?kb=200). Il est gratuit.

## Que devient une photo à 20, 50, 100 et 200 Ko ?

Deux photos de test, au format d’un téléphone (12 mégapixels), et ce que l’outil en a fait :

Résultat de l’outil pour quatre limites

| Limite | Photo | Nouveau poids | Pixels | Qualité JPEG |
| --- | --- | ---: | ---: | ---: |
| 20 Ko | Paysage | 19,7 Ko | 794 × 595 px | 38 % |
| 20 Ko | Portrait | 19,9 Ko | 366 × 487 px | 46 % |
| 50 Ko | Paysage | 49,0 Ko | 1 521 × 1 141 px | 40 % |
| 50 Ko | Portrait | 49,9 Ko | 700 × 934 px | 41 % |
| 100 Ko | Paysage | 99,0 Ko | 2 476 × 1 857 px | 40 % |
| 100 Ko | Portrait | 97,7 Ko | 1 141 × 1 521 px | 37 % |
| 200 Ko | Paysage | 199,1 Ko | 3 427 × 2 570 px | 48 % |
| 200 Ko | Portrait | 198,2 Ko | 1 857 × 2 476 px | 35 % |

> Mesuré avec l’outil dans Chromium 149.0.7827.55 le 31/10/2026. Les autres navigateurs ont leur propre encodeur JPEG : le résultat peut y varier de quelques pour cent, mais reste sous la limite.

## Que devient la qualité ?

L’outil baisse d’abord seulement la qualité JPEG (entre 92 % et 35 %). Si cela ne suffit pas, il réduit l’image en pixels. Notre photo paysage gardait encore 72 % de ses pixels à 200 Ko (3 427 × 2 570 px) ; elle n’a gardé tous ses pixels que dans notre test à 240 Ko. À 20 et 50 Ko, l’image devient nettement plus petite, ce qui suffit souvent pour une photo de formulaire.

## Ma photo est-elle envoyée sur un serveur ?

Non. La photo est réduite dans votre navigateur et la page ne contient aucun code qui l’envoie quelque part. L’onglet réseau de votre navigateur ne montre aucun envoi.

## 100 Ko, est-ce 100 000 ou 102 400 octets ?

Les formulaires le précisent rarement. 100 Ko font 100 000 octets si 1 Ko vaut 1 000 octets, et 102 400 octets s’il vaut 1 024. L’outil reste sous 100 000 octets, la plus petite des deux valeurs, et passe donc dans les deux cas.

## Sources

Les photos de test viennent de la NASA et sont dans le domaine public. Les résultats viennent de l’outil lui-même, dans les conditions de test indiquées plus haut.

- [NASA, KSC-20210111-PH-JBS01\_0021 domaine public](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt domaine public](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 domaine public](https://images.nasa.gov/details/KSC-08pd4102)

## Étapes

1. **Ouvrir l’outil.** Ouvrez « Réduire une photo à un poids en Ko ». Il fonctionne dans votre navigateur : la photo n’est envoyée nulle part.
2. **Choisir la photo.** Choisissez une photo JPEG, PNG ou WebP, ou déposez-la dans la zone.
3. **Régler la limite.** Touchez 20, 50, 100 ou 200 Ko, ou saisissez votre propre limite en Ko.
4. **Télécharger le résultat.** L’outil affiche le nouveau poids. Téléchargez le fichier : il porte le nom de votre photo suivi de « -100kb.jpg », par exemple vacances-100kb.jpg.

## Questions

### Comment réduire une photo à 100 Ko ?

Choisissez la photo dans l’outil, réglez 100 Ko et téléchargez le résultat. Une photo de 12 mégapixels est passée à 99,0 Ko, à 2 476 × 1 857 px, dans notre test.

### Mon PNG devient-il un JPEG ?

Oui. Le résultat est toujours un JPEG. Les zones transparentes d’un PNG deviennent blanches.

### Pourquoi ma photo a-t-elle moins de pixels ensuite ?

Si même la qualité la plus basse (35 %) reste trop lourde, l’outil réduit l’image par étapes de 15 % jusqu’à ce qu’elle passe. Une limite plus haute conserve plus de pixels.

### Et si la limite est trop petite pour ma photo ?

L’outil ne réduit pas une image en dessous d’un dixième de sa taille. Il vous le dit alors, et vous pouvez essayer une limite plus haute.

## Pages liées

- [Compresser un JPG sans perdre en qualité : ce qui se passe avec une limite en Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/compresser-jpg-sans-perdre-en-qualite/)
- [Réduire une photo à un poids en Ko (l’outil)](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/)
- [Reduce image size in KB (en anglais)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)
- [Reducir foto a un tamaño en KB: Reducir una foto a 20, 50, 100 o 200 KB, gratis](https://krishnachagti-sudo.github.io/toll-preview/es/reducir-foto-a-kb/)
- [Bild auf Dateigröße verkleinern: Bild auf 100 KB verkleinern: Foto auf KB-Größe bringen](https://krishnachagti-sudo.github.io/toll-preview/de/bild-verkleinern-auf-kb/)
- [Reduzir foto para um tamanho em KB: Reduzir foto para 20, 50, 100 ou 200 KB, grátis](https://krishnachagti-sudo.github.io/toll-preview/pt/reduzir-foto-para-kb/)
- [फोटो का साइज़ KB में कम करें: फोटो का साइज़ 20, 50, 100 या 200 KB कैसे करें](https://krishnachagti-sudo.github.io/toll-preview/hi/photo-size-kb-kam-kaise-kare/)
- [画像をKB指定で圧縮: 画像を100KB以下にする方法：20・50・100・200KBの圧縮](https://krishnachagti-sudo.github.io/toll-preview/ja/gazo-kb-ika-ni-suru/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/reduire-photo-en-ko/  
Données au: 2026-10-31
