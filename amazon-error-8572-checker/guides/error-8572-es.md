# Error 8572 de Amazon: cómo resolverlo

El error 8572 aparece cuando el UPC, EAN, ISBN o JAN no coincide con la marca o el producto: según la ayuda de Amazon, "the barcode you are using doesn't belong to the brand"; Amazon verifica los UPC contra la base de datos de GS1, así que la marca del anuncio debe corresponder a la empresa que tiene licenciado el código en GS1, o usted debe demostrar la relación con documentos.

## Compruebe un código (gratis)

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+and+Pine&licensee=Harbor+%26+Pine+LLC&prefix=0614141&role=brand-owner)

## Qué revisa Amazon

- Que el código tenga el largo correcto: 12 dígitos un UPC, 13 un EAN o JAN, 14 un GTIN-14.
- Que el código esté en la base de datos de GS1 con la información correcta: los UPC que no coinciden con GS1 se consideran inválidos.
- Que el código pertenezca a la marca del anuncio.
- Amazon no acepta códigos de terceros: recomienda obtener los UPC directamente de GS1.

## Un ejemplo

614141000012 con la marca "Harbor and Pine" y la empresa "Harbor & Pine LLC" en GS1: el dígito de control es válido, el prefijo GS1 es 061 (GS1 US) y está dentro del prefijo de empresa 0614141, pero los nombres no son idénticos (difieren en la forma legal (LLC), & written as "and"). La ayuda de Amazon pide al dueño de la marca una prueba de que la entidad legal del certificado de GS1 está relacionada con la marca, por ejemplo una marca registrada o un sitio web que muestre la marca y nombre a la entidad legal.

## Los documentos que pide Amazon

- Captura del error con el código, la marca, el fabricante y la hora (o el ID del lote si subió un archivo).
- Nombre del producto, fabricante, marca y el UPC, EAN, JAN o ISBN.
- Una foto real del producto donde se vean el código de barras y la marca fijados de forma permanente.
- El certificado de GS1 con su entidad legal y el prefijo, o una captura del sitio de GS1.
- Si no es dueño de la marca: una carta o acuerdo del fabricante o de la marca que confirme que el GTIN es válido y suyo.

## Fuentes

- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Valid UPCs (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS)
- [Amazon Seller Central help: Find your product ID (GTIN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200211450)
- [GS1: GS1 Company Prefix (the GS1 Prefixes) (read November 8, 2026)](https://www.gs1.org/standards/id-keys/company-prefix)

> Este verificador no consulta registros de GS1: compara el nombre que usted le da con la marca. Amazon decide qué anuncios acepta. No es asesoría legal.

## Pasos

1. **Revise el dígito de control.** El último dígito de un UPC o EAN se calcula con el método de GS1; un error de tipeo lo delata.
2. **Compare la marca con la empresa en GS1.** Busque el código en Verified by GS1 o mire su certificado de GS1 y compare ese nombre con la marca que escribe en Amazon.
3. **Espere 72 horas si los códigos son nuevos.** La ayuda de Amazon recomienda esperar al menos 72 horas después de comprar GTIN nuevos a GS1.
4. **Reúna los documentos.** Captura del error, nombre del producto, fabricante, marca, el código, una foto del producto con el código y la marca, y el certificado de GS1.
5. **Demuestre la relación.** Dueño de la marca: prueba de que la entidad legal del certificado está relacionada con la marca. Si no es dueño: carta o acuerdo del fabricante o de la marca.

## Relacionado

- [Error 8572 explained (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-explained/)
- [Letter of affiliation (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/letter-of-affiliation/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-es/  
Datos al: 2026-11-08
