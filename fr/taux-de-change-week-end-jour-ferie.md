# Taux de change un week-end ou un jour férié : quel taux BCE ?

Un jour sans taux BCE, c’est le dernier taux publié avant, au plus 7 jours en arrière : pour le lundi de Pâques, le 6 avril 2026, il s’agit du taux du jeudi 2 avril 2026, soit 1,1525 dollar pour 1 euro.

## Essayer un jour sans taux

[Obtenir le taux dans l’outil](https://krishnachagti-sudo.github.io/toll-preview/fr/fx-on-date/?base=EUR&quote=USD&date=2026-10-24)

## Comment l’outil traite-t-il les jours sans taux ?

Il cherche le dernier taux dans les 7 jours jusqu’à votre date incluse et indique de quel jour il vient. S’il n’en trouve pas, ou si la date précède le 4 janvier 1999, il le dit et la recherche reste gratuite.

## Exemples : un samedi, le lundi de Pâques et Noël

Euro en dollar américain les jours sans taux BCE

| Date demandée | Taux utilisé du | Dollars pour 1 euro |
| --- | --- | ---: |
| samedi 24 octobre 2026 | vendredi 23 octobre 2026 | 1,1193 |
| lundi 6 avril 2026 (lundi de Pâques) | jeudi 2 avril 2026 | 1,1525 |
| mercredi 25 décembre 2024 (Noël) | mardi 24 décembre 2024 | 1,0395 |

Pâques montre jusqu’où le taux peut remonter : entre le jeudi et le lundi de Pâques, il y a le Vendredi saint, le samedi, le dimanche et le jour férié lui-même.

## Quels jours la BCE n’a-t-elle pas de taux ?

La BCE indique comme jours de fermeture de TARGET le 1er janvier, le Vendredi saint, le lundi de Pâques, le 1er mai et les 25 et 26 décembre, en plus des week-ends ([page T2 de la BCE, en anglais](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)). Un jour férié national qui n’est pas un jour de fermeture de TARGET a, lui, un taux.

## Est-ce le taux pour ma déclaration ou ma facture ?

Le taux et la date de référence à utiliser sont fixés par l’organisme concerné. L’outil répond seulement à : quel est le taux de la BCE pour ce jour, et de quel jour vient-il. Pour la recherche d’un taux, voir le premier guide : [Taux de référence BCE à une date donnée](https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-reference-bce-a-une-date/).

## Sources

- [Banque centrale européenne : Euro foreign exchange reference rates (en anglais)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [Banque centrale européenne : historique complet en CSV dans un fichier zip](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [Banque centrale européenne : T2, jours de fermeture (en anglais)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)

## Questions

### Y a-t-il un taux de référence de la BCE le week-end ?

Non. La BCE publie ses taux les jours ouvrables. Pour un samedi ou un dimanche, on prend en général le dernier taux avant, le plus souvent celui du vendredi. L’outil le fait et indique la date.

### Quels jours la BCE ne publie-t-elle pas de taux ?

Outre les samedis et dimanches, les jours de fermeture de TARGET : 1er janvier, Vendredi saint, lundi de Pâques, 1er mai, 25 et 26 décembre, selon la page T2 de la BCE.

### Que se passe-t-il si la BCE n’a pas encore publié le taux du jour ?

L’outil ne donne alors aucun taux, plutôt qu’un taux plus ancien présenté comme actuel. La recherche est gratuite. Réessayez après la publication, vers 16 h, heure d’Europe centrale.

## Pages liées

- [Taux de référence BCE à une date donnée : comment le trouver](https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-reference-bce-a-une-date/)
- [L’outil : taux de change à une date](https://krishnachagti-sudo.github.io/toll-preview/fr/fx-on-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-change-week-end-jour-ferie/  
Données au: 2026-11-05
