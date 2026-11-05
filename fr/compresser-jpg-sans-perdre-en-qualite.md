# Compresser un JPG sans perdre en qualité, avec une limite en Ko

Un JPG ne peut pas être ramené sans aucune perte à un poids imposé : quelque chose se perd toujours. L’outil limite cette perte : à 1 000 Ko, notre photo de 12 mégapixels a gardé tous ses pixels (qualité 81 %) ; à 100 Ko, il en est resté 2 476 × 1 857 px en qualité 40 %.

## Est-ce possible sans aucune perte de qualité ?

Seulement si la photo est déjà sous la limite : l’outil rend alors le JPEG tel quel. Sinon, l’image est réenregistrée en JPEG, ce qui perd toujours un peu. L’outil cherche la qualité la plus haute (au plus 92 %) qui tient sous votre limite.

## Que change l’outil en premier : la qualité ou les pixels ?

La qualité. Il essaie la photo à sa taille d’origine, puis des niveaux de qualité jusqu’à 35 %. Ce n’est que si même 35 % reste trop lourd qu’il rend l’image 15 % plus étroite et plus basse, et cherche de nouveau la qualité, jusqu’à un dixième de la largeur.

## Une photo de test, six limites

La même photo paysage de 12 mégapixels (4 032 × 3 024 px), pour six limites :

Résultat de l’outil pour une photo, six limites

| Limite | Nouveau poids | Pixels | Pixels conservés | Qualité JPEG |
| --- | ---: | ---: | ---: | ---: |
| 1 000 Ko | 916,5 Ko | 4 032 × 3 024 px | 100 % | 81 % |
| 500 Ko | 497,3 Ko | 4 032 × 3 024 px | 100 % | 65 % |
| 200 Ko | 199,1 Ko | 3 427 × 2 570 px | 72 % | 48 % |
| 100 Ko | 99,0 Ko | 2 476 × 1 857 px | 38 % | 40 % |
| 50 Ko | 49,0 Ko | 1 521 × 1 141 px | 14 % | 40 % |
| 20 Ko | 19,7 Ko | 794 × 595 px | 4 % | 38 % |

> Mesuré avec l’outil dans Chromium 149.0.7827.55 le 31/10/2026. Les autres navigateurs ont leur propre encodeur JPEG : le résultat peut y varier de quelques pour cent, mais reste sous la limite.

## Toutes les photos demandent-elles la même place ?

Non. Une photo pleine de détails fins demande plus d’octets pour le même nombre de pixels. À 200 Ko, la photo paysage a gardé 72 % de ses pixels, contre 27 % pour notre photo d’échassiers dans une eau ridée.

## Comment obtenir le meilleur résultat ?

Prenez la plus grande limite que le formulaire accepte. À 500 Ko au lieu de 100 Ko, la photo de test a gardé tous ses pixels (qualité 65 %) au lieu de 2 476 × 1 857 px.

[Réduire une photo à un poids en Ko (l’outil)](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/) \| [Réduire une photo en Ko : 20, 50, 100 ou 200 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/reduire-photo-en-ko/)

## Sources

Les photos de test viennent de la NASA et sont dans le domaine public. Les résultats viennent de l’outil lui-même, dans les conditions de test indiquées plus haut.

- [NASA, KSC-20210111-PH-JBS01\_0021 domaine public](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt domaine public](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 domaine public](https://images.nasa.gov/details/KSC-08pd4102)

## Questions

### Peut-on mettre un JPG à 100 Ko sans que cela se voie ?

Cela dépend de la photo. À 100 Ko, notre photo de 12 mégapixels a nettement perdu en pixels ; à 500 Ko, non. Plus la limite est haute, moins cela se voit.

### Jusqu’où descend la qualité JPEG ?

Jamais sous 35 %. L’outil préfère réduire l’image plutôt qu’enregistrer en qualité plus basse.

### Une photo déjà sous la limite est-elle modifiée ?

Un JPEG déjà dessous est rendu tel quel. Un PNG ou un WebP est toujours enregistré en JPEG.

## Pages liées

- [Réduire une photo en Ko : 20, 50, 100 ou 200 Ko](https://krishnachagti-sudo.github.io/toll-preview/fr/reduire-photo-en-ko/)
- [Réduire une photo à un poids en Ko (l’outil)](https://krishnachagti-sudo.github.io/toll-preview/fr/image-to-size/)
- [Reduce image size in KB (en anglais)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/compresser-jpg-sans-perdre-en-qualite/  
Données au: 2026-10-31
