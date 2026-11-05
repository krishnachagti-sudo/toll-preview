# Por qué la IA se equivoca con fechas y números

Un asistente de IA predice texto probable. No consulta una regla ni una cifra publicada, su conocimiento termina en una fecha de corte y puede no mostrar su procedimiento. Por eso puede dar, en una frase segura, un conteo de días hábiles, un feriado observado o un tipo de cambio que se equivoca por 1 día o 1 decimal. Verifique el número, o dele al asistente una herramienta que lo devuelva con exactitud.

## ¿Por qué un asistente de IA se equivoca con fechas y números?

Un modelo de lenguaje escribe las palabras que siguen con más probabilidad. Eso funciona bien para la prosa. Funciona mal cuando la pregunta tiene una sola respuesta correcta que define una regla o una tabla publicada, como "cuántos días hábiles hay entre estas fechas" o "cuál era el tipo de cambio del euro ese sábado".

Fallan tres cosas, y se suman.

- **Predice texto, no aplica la regla.** Contar días hábiles exige comparar cada día con los fines de semana y con todos los feriados, incluidos los que se pasan a un viernes o a un lunes. Un modelo puede escribir una respuesta ordenada sin hacer esa revisión.
- **Su conocimiento termina en una fecha de corte.** La documentación de modelos de Anthropic distingue la fecha de corte de conocimiento confiable (reliable knowledge cutoff), hasta la cual el conocimiento del modelo es más amplio y confiable, del rango más amplio de datos de entrenamiento. Las páginas de modelos de OpenAI también indican una fecha de corte del conocimiento para cada modelo. Un tipo de cambio, un umbral o una fecha límite que cambió después de esa fecha puede no estar en el modelo, y el modelo no siempre se lo dirá.
- **Puede no mostrar su procedimiento.** Un solo número, sin la lista de días omitidos, sin la fecha del tipo de cambio y sin una fuente con nombre, no le da nada que verificar.

Los fabricantes de modelos lo dicen de sus propios productos. La guía de Anthropic para reducir las alucinaciones dice que estas técnicas no las eliminan por completo, y añade que siempre se debe validar la información crítica. Las dos empresas también documentan formas de conectar un modelo a herramientas y búsquedas externas, que es la solución con la que termina esta página. Las fuentes están abajo.

## ¿Qué fechas y números son más fáciles de equivocar?

Los que dependen de una regla pequeña. Estos son casos resueltos por las propias herramientas. Cada respuesta de abajo es la salida de la herramienta para la pregunta que se muestra, así que puede repetirla y obtendrá el mismo resultado.

## Ejemplo: Días hábiles en EE. UU. del 1 al 8 de julio de 2026

**Respuesta exacta:** 4 días hábiles. Días omitidos: Día de la Independencia (observado) (3 de julio de 2026).

**Por qué es fácil equivocarse:** El 4 de julio de 2026 cae en sábado, así que el feriado federal se observa el viernes 3 de julio. Si solo omite el día 4, que de todos modos es fin de semana, cuenta 5.

Fuente: 5 U.S.C. 6103 y las reglas de días observados de la OPM. [Pruébelo usted mismo en Business days (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Ejemplo: Un día laborable después del 24 de diciembre de 2026, en Inglaterra y Gales

**Respuesta exacta:** martes, 29 de diciembre de 2026. Días omitidos: Navidad (25 de diciembre de 2026); Boxing Day (26 de diciembre) (día sustituto) (28 de diciembre de 2026).

**Por qué es fácil equivocarse:** La Navidad cae en viernes y el Boxing Day cae en sábado, así que su feriado bancario pasa al lunes 28 de diciembre. Un día laborable después es el martes, no el lunes.

Fuente: GOV.UK, feriados bancarios (bank holidays) de Inglaterra y Gales. [Pruébelo usted mismo en Business days (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Ejemplo: Dólar estadounidense a euro el sábado 24 de octubre de 2026

**Respuesta exacta:** 1 USD = 0.893416 EUR, según el tipo fijado el 23 de octubre de 2026.

**Por qué es fácil equivocarse:** El Banco Central Europeo (BCE) no publica tipos de referencia los fines de semana. La respuesta usa el último tipo fijado antes de la fecha y lo nombra, en lugar de dar un tipo para un día que no tiene.

Fuente: Tipos de cambio de referencia del Banco Central Europeo. [Pruébelo usted mismo en Exchange rate on a date (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

## Ejemplo: Libra a yen el día de Navidad de 2024

**Respuesta exacta:** 1 GBP = 197.149931 JPY, según el tipo fijado el 24 de diciembre de 2024, a través del euro.

**Por qué es fácil equivocarse:** El BCE no publicó tipos el 25 de diciembre de 2024 y no tiene un tipo directo de libra a yen. La herramienta toma los dos tipos contra el euro del último día fijado y calcula el tipo cruzado.

Fuente: Tipos de cambio de referencia del Banco Central Europeo. [Pruébelo usted mismo en Exchange rate on a date (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/).

## Ejemplo: Un pedido hecho a las 4:30 pm, hora del centro, el día antes de Acción de Gracias de 2026, enviado por USPS Priority Mail

**Respuesta exacta:** Se envía el lunes, 30 de noviembre de 2026 y llega entre el miércoles, 2 de diciembre de 2026 y el jueves, 3 de diciembre de 2026.

**Por qué es fácil equivocarse:** El pedido llega después de la hora límite del mediodía, y el día siguiente es Acción de Gracias, un feriado federal en que la tienda no envía. Por eso se recibe el viernes y, con un fin de semana después, se entrega al transportista el lunes.

Fuente: Estándares de servicio y feriados postales del USPS. [Pruébelo usted mismo en Delivery date and holiday order-by calculator (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/delivery-date-calculator/).

## ¿Y las tarifas y las fechas límite de impuestos?

El problema es peor donde las cifras cambian cada año. Un umbral o una tarifa de millaje puede ser distinto de un año al siguiente, y algunos cambian a mitad de año. Un modelo cuyo conocimiento termina antes del cambio citará la cifra vieja en una frase segura. Las fechas límite también se trasladan: una fecha límite que cae en fin de semana pasa al siguiente día hábil, y eso es una regla que se aplica, no una frase que se recuerda.

- [1099 threshold tracker (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/1099-threshold/): el límite para declarar el Formulario 1099-NEC es $2,000 para los pagos de 2026 y $600 para los pagos de 2025, según las instrucciones del IRS. Un modelo cuyo conocimiento sea anterior al cambio daría $600 para un pago de 2026.
- [Calculadora de reembolso de millaje](https://krishnachagti-sudo.github.io/toll-preview/es/mileage-reimbursement/): la tarifa de negocio del IRS para un viaje el 30 de junio de 2026 es 72.5 centavos por milla, y 76 centavos desde el 1 de julio. Una sola tarifa para todo el año está mal para la mitad del año.
- [Calculadora de la declaración trimestral del IFTA](https://krishnachagti-sudo.github.io/toll-preview/es/ifta-calculator/): la declaración del IFTA del tercer trimestre de 2026 vence el 2 de noviembre de 2026, no el 31 de octubre de 2026, porque la fecha que fijan las reglas cae en fin de semana. La fecha de las reglas no siempre es la fecha límite para presentar.

## ¿Cómo se corrige?

Dele al asistente una herramienta para la parte exacta, y deje al modelo el resto. El modelo decide qué herramienta llamar y explica el resultado. La herramienta aplica la regla y devuelve la cifra, con su fuente.

Las herramientas de Endwise funcionan así. Se usan con un conector estándar llamado MCP (Model Context Protocol, una forma común de que un asistente de IA llame a herramientas externas) y con una API REST sencilla. No hay IA en las respuestas: la misma entrada da la misma respuesta. Guías de configuración: [Claude](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-claude/) y [ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-chatgpt/). Para configurarlo en Cursor y VS Code, vea la [guía en inglés](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/). Para su propio código, vea cómo [crear un agente (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/).

Cada herramienta se puede usar 5 veces al día en su página sin cuenta, para que compare con la respuesta de su asistente. [Cómo verificar un número que le da una IA](https://krishnachagti-sudo.github.io/toll-preview/es/guias/como-verificar-un-numero-de-la-ia/) explica los pasos.

> Si sus números son fechas, empiece con [Business days (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Fuentes

Documentación oficial, en inglés.

- [Anthropic: Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Anthropic: Models overview (reliable knowledge cutoff and training data cutoff)](https://platform.claude.com/docs/en/models/overview)
- [OpenAI: Models (knowledge cutoff listed per model, as of November 2026)](https://developers.openai.com/api/docs/models)

## Preguntas

### ¿Por qué ChatGPT se equivoca con las fechas?

Predice texto probable en lugar de aplicar una regla de fechas. Contar días hábiles exige revisar uno por uno los fines de semana y los feriados, y un predictor de texto puede saltarse ese paso y aun así escribir una respuesta segura. Verifique cualquier fecha que le dé, o dele una herramienta que calcule fechas.

### ¿Puede un asistente de IA consultar el tipo de cambio de hoy?

Solo si tiene una herramienta o una búsqueda que obtenga un tipo publicado. Sin ella, responde con lo que aprendió en el entrenamiento, que termina en una fecha de corte. El tipo de cambio de un día es un dato de una tabla publicada, no algo que se recuerde.

### ¿Qué es la fecha de corte del conocimiento?

Es la fecha después de la cual un modelo tiene pocos datos de entrenamiento, o ninguno. Anthropic define la fecha de corte de conocimiento confiable (reliable knowledge cutoff) como la fecha hasta la cual el conocimiento del modelo es más amplio y confiable. Los umbrales de impuestos y las tarifas de millaje que cambiaron después de esa fecha pueden estar mal.

### ¿Cómo evito que una IA adivine los números?

Dele una herramienta que devuelva la respuesta desde una fuente con nombre, y pídale que muestre lo que devolvió la herramienta. Así informa la cifra en lugar de producirla.

## Relacionado

- [Cómo verificar un número que le da una IA](https://krishnachagti-sudo.github.io/toll-preview/es/guias/como-verificar-un-numero-de-la-ia/)
- [Usar herramientas exactas desde Claude](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-claude/)
- [Usar herramientas exactas desde ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-chatgpt/)
- [Por qué respuestas exactas (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/why-exact/)
- [Guías en español](https://krishnachagti-sudo.github.io/toll-preview/es/guias/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/guias/por-que-la-ia-se-equivoca-con-los-numeros/  
Datos al: 2026-11-03
