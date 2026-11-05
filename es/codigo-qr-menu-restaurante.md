# Código QR para el menú de un restaurante: cómo hacerlo bien

Para el menú de un restaurante, cree un código QR estático con la dirección de su menú en un dominio suyo: https://example.com/menu cabe en la versión 2 (25 x 25 módulos) con el nivel M, y no caduca porque no pasa por ningún proveedor. Cada código por mesa desde una hoja de cálculo cuesta $0.002, con un mínimo de 10 por trabajo.

## ¿Cómo hago un código QR para el menú de un restaurante?

Elija **Enlace a un sitio web** en el [generador](https://krishnachagti-sudo.github.io/toll-preview/es/qr-code-generator/), escriba la dirección del menú y descargue el archivo. La página muestra el texto exacto que contiene el código y lo lee de vuelta antes de que lo descargue.

```
https://example.com/menu
```

Ese enlace da un código de la versión 2, 25 x 25 módulos, con el nivel M (mismo texto, mismo código cada vez).

## ¿Estático o dinámico para un menú?

Si el código es dinámico, lleva un enlace corto de un proveedor y funciona solo mientras ese proveedor lo reenvíe; lo que dicen los proveedores sobre planes terminados está en [esta guía](https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-que-no-caduca/). Con un código estático y una página de menú en su propio dominio, puede cambiar el menú cuando quiera sin tocar lo impreso.

## ¿De qué tamaño lo imprimo?

El ancho inicial de la página es 30 mm: con 33 módulos de ancho (incluido el margen de cuatro módulos por cada lado), cada módulo mide 0.91 mm, unos 10.7 puntos de una impresora de 300 ppp. DENSO WAVE recomienda 4 o más puntos por módulo; a 300 ppp este código no debería salir de menos de 11.2 mm de ancho. Escanee de prueba en el tamaño final.

## ¿Cómo hago un código para cada mesa?

Prepare una hoja de cálculo con una columna url y otra label, una fila por mesa, y ábrala en la sección "Muchos códigos" del generador. Con estas filas (`url,label`) la herramienta planeó:

| Fila | Archivo | Contenido | Versión y nivel |
| --- | --- | --- | --- |
| 2 | mesa-1.png | https://example.com/menu/mesa-1 | 3, Q |
| 3 | mesa-2.png | https://example.com/menu/mesa-2 | 3, Q |
| 4 | mesa-3.png | https://example.com/menu/mesa-3 | 3, Q |

El precio es $0.002 por código y mínimo 10 por trabajo ($0.02); 12 mesas son $0.024. Las filas que no pueden convertirse en un código nunca se cobran. En los archivos por lote, la herramienta sube el nivel de corrección de errores cuando el código sigue siendo del mismo tamaño, por eso la tabla muestra el nivel Q.

## Lea esto

- Un código estático guarda su contenido directamente y no caduca, pero solo funciona mientras exista su destino (sitio web, formulario, red).
- Escanee de prueba cada código en su tamaño final de impresión antes de imprimir la tirada.
- Revisión de caducidad: informa de lo que codifica el código y adónde redirige hoy, más la política publicada del proveedor en la fecha indicada; no ve su cuenta ni puede prometer lo que hará un proveedor. Las políticas se resumen de las páginas del propio proveedor en la fecha indicada y pueden cambiar; no tenemos ninguna afiliación con los proveedores mencionados.
- Códigos WiFi: el soporte de los teléfonos varía, sobre todo en los campos empresariales (WPA2-EAP); pruebe con los teléfonos que usan sus invitados.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Fuentes

- [DENSO WAVE: Module size (4 or more printer dots a module), leído el 2 de noviembre de 2026](https://www.qrcode.com/en/howto/cell.html)
- [DENSO WAVE: Points for using QR Code (quiet zone of four modules), leído el 2 de noviembre de 2026](https://www.qrcode.com/en/howto/code.html)

## Pasos

1. **Ponga el menú en una página suya.** Use una dirección en un dominio que usted controle, por ejemplo https://example.com/menu. El código dirá esa dirección para siempre.
2. **Cree un código estático.** En el generador elija Enlace a un sitio web y escriba la dirección. Se crea en su navegador, gratis y sin cuenta.
3. **Descargue y pruebe.** Descargue SVG o PDF para imprimir, e imprima una prueba en el tamaño final. Escanéela con varios teléfonos antes de la tirada.

## Preguntas

### ¿Un código QR para el menú de un restaurante caduca?

Uno estático no caduca. Pero si el enlace lleva a una página del menú que se mueve o a un dominio que vence, el código deja de llevar a nada. Apunte el código a una página de su propio dominio y cambie el menú ahí.

### ¿Es mejor un código estático o uno dinámico para un menú?

Uno dinámico permite cambiar el destino sin reimprimir, pero depende de que el proveedor siga reenviándolo; uno estático no depende de nadie, solo de su sitio. Si controla su dominio, puede cambiar la página del menú sin cambiar el código.

### ¿Puedo hacer un código distinto para cada mesa?

Sí: una hoja de cálculo con una fila por mesa produce un código por fila, con un archivo de manifiesto y una hoja de etiquetas para imprimir.

## Relacionado

- [¿Caduca un código QR?](https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-que-no-caduca/)
- [Código QR para WiFi](https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-wifi/)
- [Generador de código QR](https://krishnachagti-sudo.github.io/toll-preview/es/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-menu-restaurante/  
Datos al: 2026-11-02
