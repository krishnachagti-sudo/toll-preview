# Comprimir un JPG sin perder calidad con un límite en KB

Un JPG no se puede llevar a un peso fijo sin ninguna pérdida: siempre se pierde algo. La herramienta mantiene la pérdida baja: con 1 000 KB, nuestra foto de 12 megapíxeles conservó todos sus píxeles (calidad 81 %); con 100 KB quedaron 2 476 × 1 857 px en calidad 40 %.

## ¿Se puede hacer sin ninguna pérdida de calidad?

Solo si la foto ya está bajo el límite: entonces la herramienta devuelve el JPEG tal cual. Si no, la imagen se vuelve a guardar como JPEG, y eso siempre pierde algo. La herramienta busca la calidad más alta (como máximo 92 %) que cabe bajo su límite.

## ¿Qué cambia primero la herramienta, la calidad o los píxeles?

La calidad. Prueba la foto a su tamaño completo y luego niveles de calidad hasta 35 %. Solo si incluso 35 % sigue siendo demasiado pesado, hace la imagen un 15 % más angosta y baja, y busca la calidad de nuevo, hasta una décima parte del ancho.

## Una foto de prueba con seis límites

La misma foto horizontal de 12 megapíxeles (4032 × 3024 px) con seis límites:

Resultado de la herramienta para una foto con seis límites

| Límite | Peso nuevo | Píxeles | Píxeles conservados | Calidad JPEG |
| --- | ---: | ---: | ---: | ---: |
| 1 000 KB | 916,5 KB | 4 032 × 3 024 px | 100 % | 81 % |
| 500 KB | 497,3 KB | 4 032 × 3 024 px | 100 % | 65 % |
| 200 KB | 199,1 KB | 3 427 × 2 570 px | 72 % | 48 % |
| 100 KB | 99,0 KB | 2 476 × 1 857 px | 38 % | 40 % |
| 50 KB | 49,0 KB | 1 521 × 1 141 px | 14 % | 40 % |
| 20 KB | 19,7 KB | 794 × 595 px | 4 % | 38 % |

> Medido con la herramienta en Chromium 149.0.7827.55 el 31/10/2026. Otros navegadores tienen su propio codificador JPEG, así que el resultado puede variar unos puntos porcentuales; sigue quedando bajo el límite.

## ¿Todas las fotos necesitan el mismo espacio?

No. Una foto con detalle fino por todas partes necesita más bytes para los mismos píxeles. Con 200 KB, la foto horizontal conservó el 72 % de sus píxeles; nuestra foto de aves zancudas en agua rizada, solo el 27 %.

## ¿Cómo consigo el mejor resultado?

Use el límite más alto que acepte el formulario. Con 500 KB en lugar de 100 KB, la foto de prueba conservó todos sus píxeles (calidad 65 %) en lugar de 2 476 × 1 857 px.

[Reducir foto a un tamaño en KB (la herramienta)](https://krishnachagti-sudo.github.io/toll-preview/es/image-to-size/) \| [Reducir una foto a 20, 50, 100 o 200 KB](https://krishnachagti-sudo.github.io/toll-preview/es/reducir-foto-a-kb/)

## Fuentes

Las fotos de prueba son de la NASA y de dominio público. Los resultados vienen de la propia herramienta, en las condiciones de prueba indicadas arriba.

- [NASA, KSC-20210111-PH-JBS01\_0021 dominio público](https://images.nasa.gov/details/KSC-20210111-PH-JBS01_0021)
- [NASA, jsc2025e068207\_alt dominio público](https://images.nasa.gov/details/jsc2025e068207_alt)
- [NASA, KSC-08pd4102 dominio público](https://images.nasa.gov/details/KSC-08pd4102)

## Preguntas

### ¿Puedo dejar un JPG en 100 KB sin que se note?

Depende de la foto. Con 100 KB, nuestra foto de 12 megapíxeles perdió bastantes píxeles; con 500 KB, no. Cuanto más alto el límite, menos se nota.

### ¿Hasta dónde baja la calidad JPEG?

Nunca por debajo del 35 %. La herramienta prefiere reducir la imagen antes que guardarla con menos calidad.

### ¿Cambia una foto que ya está bajo el límite?

Un JPEG que ya está debajo se devuelve tal cual. Un PNG o un WebP siempre se guarda como JPEG.

## Relacionado

- [Reducir una foto a 20, 50, 100 o 200 KB](https://krishnachagti-sudo.github.io/toll-preview/es/reducir-foto-a-kb/)
- [Reducir foto a un tamaño en KB (la herramienta)](https://krishnachagti-sudo.github.io/toll-preview/es/image-to-size/)
- [Reduce image size in KB (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/image-to-size/reduce-image-size-in-kb/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/comprimir-jpg-sin-perder-calidad/  
Datos al: 2026-10-31
