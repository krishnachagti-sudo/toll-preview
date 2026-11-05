# Taux de référence BCE à une date donnée : comment le trouver

Le taux de référence de la BCE pour le samedi 24 octobre 2026 est de 1,1193 dollar américain pour 1 euro. C’est le taux du vendredi 23 octobre 2026, car la BCE ne publie pas de nouveau taux un samedi.

## Obtenir le taux d’une date

[Obtenir le taux dans l’outil](https://krishnachagti-sudo.github.io/toll-preview/fr/fx-on-date/?base=EUR&quote=USD&date=2026-10-24)

## Qu’est-ce que le taux de référence de la BCE ?

La Banque centrale européenne, banque centrale de la zone euro, publie chaque jour ouvrable, sauf les jours de fermeture de TARGET, combien d’unités d’une devise vaut un euro, vers 16 h, heure d’Europe centrale, d’après elle. Ces taux sont l’inscription de la BCE pour ce jour, pas un prix auquel une banque change. La page de la BCE n’existe qu’en anglais ([Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)).

## Comment convertir des euros en dollars à une date donnée ?

Prenez le taux du jour et multipliez. Pour le 24 octobre 2026, l’outil a calculé :

| Donnée | Valeur |
| --- | ---: |
| Date demandée | samedi 24 octobre 2026 |
| Taux utilisé du | vendredi 23 octobre 2026 |
| 1 euro en dollars américains | 1,1193 |
| 1 dollar américain en euros (inverse) | 0,893416 |
| 1 000 euros en dollars américains | 1 119,30 |

La dernière ligne est simplement 1 000 fois 1,1193, arrondi au centime. L’inverse est calculé à partir du taux non arrondi, pas du taux arrondi.

## Et une paire sans l’euro, comme dollar américain en dollar canadien ?

La BCE ne donne que des taux face à l’euro. Pour deux autres devises, l’outil divise les dollars canadiens par euro par les dollars américains par euro du même jour, puis arrondit à 6 décimales. Le 24 octobre 2026, cela donne : 1 dollar américain = 1,399535 dollar canadien, et 1 dollar canadien = 0,714523 dollar américain. La date du taux est là aussi le 23 octobre 2026.

## Quel taux demande ma comptabilité ou mon administration ?

C’est l’organisme auquel vous déclarez qui le décide. Cet outil donne le taux de référence de la BCE et nomme sa source ; si votre organisme exige un autre taux, utilisez-le. Ce qui se passe les week-ends et jours fériés est expliqué dans le second guide : [Taux de change un week-end ou un jour férié](https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-change-week-end-jour-ferie/).

## Sources

- [Banque centrale européenne : Euro foreign exchange reference rates (en anglais)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [Banque centrale européenne : historique complet en CSV dans un fichier zip](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)
- [Banque centrale européenne : T2, jours de fermeture (en anglais)](https://www.ecb.europa.eu/paym/target/t2/html/index.en.html)

## Étapes

1. **Choisir la paire de devises.** Dans « De », choisissez la devise que vous convertissez, et dans « Vers » la devise cible, par exemple euro et dollar américain.
2. **Saisir la date.** Indiquez le jour voulu. Les dates vont du 4 janvier 1999 à aujourd’hui.
3. **Vérifier la source.** Laissez la source sur « Taux de référence BCE ». Les sources du Trésor américain, de l’IRS et de la HMRC ne servent que si l’un de ces organismes les demande.
4. **Obtenir le taux.** Vous voyez le taux, son inverse et la date du taux utilisé. Si votre date tombe un week-end ou un jour férié, c’est le jour précédent qui s’affiche.

## Questions

### Où trouver le taux de référence de la BCE à une date précise ?

Sur le site de la BCE, sous forme de tableau pour chaque jour et de fichier d’historique depuis 1999. Plus vite : l’outil de cette page, où vous saisissez la date et la paire, et qui donne le taux et la date dont il provient. Pour le 24 octobre 2026, il donne 1,1193 dollar pour 1 euro.

### À quelle heure la BCE publie-t-elle ses taux de référence ?

D’après la BCE, généralement vers 16 h, heure d’Europe centrale, chaque jour ouvrable, sauf les jours de fermeture de TARGET.

### Le taux de référence de la BCE est-il celui que ma banque applique ?

Non. La BCE publie ces taux à titre d’information uniquement et déconseille fortement de les utiliser pour des transactions. Les banques et les cartes appliquent leurs propres taux et marges.

## Pages liées

- [Taux de change un week-end ou un jour férié : quel taux BCE ?](https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-change-week-end-jour-ferie/)
- [L’outil : taux de change à une date](https://krishnachagti-sudo.github.io/toll-preview/fr/fx-on-date/)
- [Deutsch: EZB-Referenzkurs an einem bestimmten Datum nachschlagen](https://krishnachagti-sudo.github.io/toll-preview/de/ezb-referenzkurs-an-einem-datum/)
- [Português: cotação do euro e do dólar em relação ao real em uma data](https://krishnachagti-sudo.github.io/toll-preview/pt/cotacao-do-euro-e-do-dolar-em-uma-data/)
- [हिन्दी: किसी तारीख़ पर डॉलर और यूरो के मुकाबले रुपये का रेट](https://krishnachagti-sudo.github.io/toll-preview/hi/dollar-euro-ke-mukable-rupaye-ka-rate/)
- [日本語:日付を指定してユーロ円・ドル円のECB参照レートを調べる](https://krishnachagti-sudo.github.io/toll-preview/ja/yen-kawase-rate-hizuke-shitei/)
- [Exchange rate on a date (English)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fr/taux-de-reference-bce-a-une-date/  
Données au: 2026-11-05
