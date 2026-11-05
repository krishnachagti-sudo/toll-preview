# Código QR para WiFi: cómo es el texto del código

Un código QR de WiFi contiene una línea de texto, por ejemplo WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T es la seguridad (WPA, WEP, WPA2-EAP o nopass), S el nombre de la red y P la contraseña; los caracteres \\ ; , " : se escapan con una barra invertida. Este ejemplo es la versión 3 (29 x 29 módulos) con el nivel M.

## ¿Cómo es el texto de un código QR de WiFi?

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

El punto y coma de la contraseña del ejemplo (tea;time42) lleva una barra invertida delante; sin ella, el teléfono daría por terminado el campo ahí. La segunda línea es una red abierta, sin contraseña.

## ¿Qué tamaño tiene el código?

El ejemplo ocupa 39 bytes. Cuanta más corrección de errores, más grande el código: con el nivel L es la versión 3 (29 x 29), con M la 3 (29 x 29), con Q la 4 (33 x 33) y con H la 5 (37 x 37). Un código más grande necesita más espacio al imprimir.

## ¿Cómo escribo una red oculta?

Con H:true antes del punto y coma final, como en este texto generado: `WIFI:T:WPA;S:Gaeste-Netz;P:Sommer2026;H:true;;`

## ¿Y las redes empresariales?

Las redes empresariales agregan E: (método EAP), A: (identidad anónima), I: (identidad) y PH2: (fase 2), como documenta ZXing. El soporte de los teléfonos varía; pruebe con los teléfonos que usan sus invitados.

[Cree el código de WiFi en el generador](https://krishnachagti-sudo.github.io/toll-preview/es/qr-code-generator/?type=wifi) (el código se crea en su navegador, no se envía nada).

## Lea esto

- Un código estático guarda su contenido directamente y no caduca, pero solo funciona mientras exista su destino (sitio web, formulario, red).
- Escanee de prueba cada código en su tamaño final de impresión antes de imprimir la tirada.
- Revisión de caducidad: informa de lo que codifica el código y adónde redirige hoy, más la política publicada del proveedor en la fecha indicada; no ve su cuenta ni puede prometer lo que hará un proveedor. Las políticas se resumen de las páginas del propio proveedor en la fecha indicada y pueden cambiar; no tenemos ninguna afiliación con los proveedores mencionados.
- Códigos WiFi: el soporte de los teléfonos varía, sobre todo en los campos empresariales (WPA2-EAP); pruebe con los teléfonos que usan sus invitados.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Fuentes

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard), leído el 2 de noviembre de 2026](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## Pasos

1. **Empiece con WIFI:.** Después van los campos, cada uno terminado en punto y coma, en cualquier orden.
2. **Seguridad.** T:WPA para redes personales WPA, WPA2 y WPA3, T:WEP, T:WPA2-EAP para redes empresariales o T:nopass para una red abierta.
3. **Nombre y contraseña.** S: el nombre de la red, P: la contraseña. Ponga una barra invertida antes de cualquier \\ ; , " o :. Un nombre o contraseña que pudiera leerse como hexadecimal va entre comillas dobles.
4. **Final.** Agregue H:true para una red oculta y termine con un segundo punto y coma.

## Preguntas

### ¿Cómo es el texto de un código QR de WiFi?

Una línea como WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. T es la seguridad, S el nombre de la red y P la contraseña; los caracteres \\ ; , " : se escapan con una barra invertida.

### ¿Cómo hago un código QR para una red WiFi abierta?

Con T:nopass y sin contraseña, por ejemplo WIFI:T:nopass;S:Lobby;;.

### ¿Funciona en todos los teléfonos?

No está garantizado: el soporte varía, sobre todo en los campos empresariales (WPA2-EAP). Pruebe con los teléfonos que usan sus invitados.

## Relacionado

- [¿Caduca un código QR?](https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-que-no-caduca/)
- [Código QR para el menú de un restaurante](https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-menu-restaurante/)
- [Generador de código QR](https://krishnachagti-sudo.github.io/toll-preview/es/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/codigo-qr-wifi/  
Datos al: 2026-11-02
