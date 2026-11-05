# Comprimir JPG sem perder qualidade com limite em KB

Um JPG não pode ser levado a um tamanho fixo sem nenhuma perda: sempre se perde algo. A ferramenta mantém a perda baixa: com 1.000 KB, nossa foto de 12 megapixels manteve todos os pixels (qualidade 81%); com 100 KB ficaram 2.476 × 1.857 px em qualidade 40%.

## Dá para fazer sem nenhuma perda de qualidade?

Só se a foto já estiver abaixo do limite: aí a ferramenta devolve o JPEG como está. Caso contrário, a imagem é salva de novo como JPEG, e isso sempre perde um pouco. A ferramenta procura a qualidade mais alta (no máximo 92%) que cabe no seu limite.

## O que a ferramenta muda primeiro, a qualidade ou os pixels?

A qualidade. Ela testa a foto no tamanho original e depois níveis de qualidade até 35%. Só se até 35% ainda ficar pesado demais é que deixa a imagem 15% mais estreita e baixa, e procura a qualidade de novo, até um décimo da largura.

## Uma foto de teste em seis limites

A mesma foto em paisagem de 12 megapixels (4.032 × 3.024 px) em seis limites:

Resultado da ferramenta para uma foto em seis limites

| Limite | Novo tamanho | Pixels | Pixels mantidos | Qualidade JPEG |
| --- | ---: | ---: | ---: | ---: |
| 1.000 KB | 916,5 KB | 4.032 × 3.024 px | 100% | 81% |
| 500 KB | 497,3 KB | 4.032 × 3.024 px | 100% | 65% |
| 200 KB | 199,1 KB | 3.427 × 2.570 px | 72% | 48% |
| 100 KB | 99,0 KB | 2.476 × 1.857 px | 38% | 40% |
| 50 KB | 49,0 KB | 1.521 × 1.141 px | 14% | 40% |
| 20 KB | 19,7 KB | 794 × 595 px | 4% | 38% |

> Medido com a ferramenta no Chromium 149.0.7827.55 em 31/10/2026. Outros navegadores têm seu próprio codificador JPEG, então o resultado pode variar alguns pontos percentuais; ele continua abaixo do limite.

## Todas as fotos precisam do mesmo espaço?

Não. Uma foto com detalhes finos por toda parte precisa de mais bytes para os mesmos pixels. Com 200 KB, a foto em paisagem manteve 72% dos pixels; nossa foto de aves pernaltas em água agitada, só 27%.

## Como conseguir o melhor resultado?

Use o maior limite que o formulário aceitar. Com 500 KB em vez de 100 KB, a foto de teste manteve todos os pixels (qualidade 65%) em vez de 2.476 × 1.857 px.

[Reduzir foto para um tamanho em KB (a ferramenta)](https://krishnachagti-sudo.github.io/toll-preview/pt/image-to-size/) \| [Reduzir foto para 20, 50, 100 ou 200 KB](https://krishnachagti-sudo.github.io/toll-preview/pt/reduzir-foto-para-kb/)

## Fontes

As fotos de teste são da NASA e de domínio público. Os resultados vêm da própria ferramenta, nas condições de teste indicadas acima.

- [NASA, KSC-20210111-PH-JBS01\_0021 domínio público](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt domínio público](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 domínio público](https://images.nasa.gov/details/KSC-08pd4102)

## Perguntas

### Dá para deixar um JPG em 100 KB sem que se note?

Depende da foto. Com 100 KB, nossa foto de 12 megapixels perdeu bastante em pixels; com 500 KB, não. Quanto maior o limite, menos se nota.

### Até onde a qualidade JPEG desce?

Nunca abaixo de 35%. A ferramenta prefere reduzir a imagem a salvar com qualidade menor.

### Uma foto que já está abaixo do limite muda?

Um JPEG que já está abaixo é devolvido como está. Um PNG ou WebP sempre é salvo como JPEG.

## Páginas relacionadas

- [Reduzir foto para 20, 50, 100 ou 200 KB](https://krishnachagti-sudo.github.io/toll-preview/pt/reduzir-foto-para-kb/)
- [Reduzir foto para um tamanho em KB (a ferramenta)](https://krishnachagti-sudo.github.io/toll-preview/pt/image-to-size/)
- [Reduce image size in KB (em inglês)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pt/comprimir-jpg-sem-perder-qualidade/  
Dados de: 2026-10-31
