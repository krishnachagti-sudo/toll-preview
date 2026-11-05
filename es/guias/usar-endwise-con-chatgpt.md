# Cómo usar Endwise con ChatGPT

Sí, en 3 pasos: en ChatGPT en la web, agregue Endwise como servidor MCP personalizado con OAuth, inicie sesión en Endwise y apruebe ChatGPT con un límite mensual. Desde su propio código, la herramienta MCP remota de la API de OpenAI puede enviar una clave de API en su lugar.

## ¿Puede ChatGPT conectarse al servidor MCP de Endwise?

Sí. ChatGPT puede agregar un **servidor MCP** personalizado (MCP, el Model Context Protocol, es la forma estándar en que una aplicación de IA encuentra y llama a herramientas externas). OpenAI indica tres formas de iniciar sesión en uno: **OAuth**, **sin autenticación** y una mezcla de las dos. Endwise ofrece inicio de sesión con OAuth, así que elija **OAuth** e inicie sesión en Endwise cuando ChatGPT se lo pida.

La página de OpenAI dice que los servidores MCP personalizados se agregan en ChatGPT en la web, y que se aplican los permisos y la configuración de seguridad del espacio de trabajo. Si no ve la opción en un espacio de trabajo de su empresa o escuela, pregunte a su administrador.

## ¿Cómo lo agrego?

En ChatGPT en la web, vaya a **Plugins**, seleccione el botón de más y luego **Add custom MCP server**. Póngale un nombre y escriba esto como Server URL. Los nombres de los menús son los de la interfaz en inglés:

```text
https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Configure la autenticación como **OAuth**. ChatGPT lee los datos de inicio de sesión de Endwise del propio servidor, así que deje vacío cualquier ID de cliente y secreto. Revise la advertencia, elija **Create as a plugin** e instale el plugin antes de usarlo en una conversación.

## ¿Cómo es el inicio de sesión?

ChatGPT abre una página de Endwise. Si no ha iniciado sesión, primero inicia sesión o crea una cuenta y vuelve de inmediato. La página nombra la aplicación que lo pide (chatgpt.com), dice qué podrá hacer y a dónde vuelve usted después de aprobar.

- Puede ver la lista de herramientas y sus precios, ejecutar herramientas y pagar cada ejecución con su saldo, y preguntar cuánto costaría una ejecución.
- No puede ver su contraseña, agregar dinero, cambiar su cuenta ni crear claves de API.
- Usted fija su límite mensual en esa página. Las ejecuciones que pasen del límite se rechazan y no se cobran.

Después de aprobar, ChatGPT aparece en la [página de su cuenta](https://krishnachagti-sudo.github.io/toll-preview/account) en Connected apps, con su límite y lo que ha gastado este mes. Elija Disconnect allí para detenerlo de inmediato.

La página de OpenAI dice que ChatGPT trata una herramienta como una acción de escritura a menos que la herramienta diga otra cosa, y que por defecto le pide confirmar las acciones de escritura. Lo que elija para una conversación puede mantenerse durante esa conversación.

## ¿Qué recibe ChatGPT de una herramienta de Endwise?

ChatGPT envía la entrada de la herramienta como JSON y recibe la respuesta de la herramienta. Ejemplo: contar los días hábiles entre el 1 de julio de 2026 y el 8 de julio de 2026 en EE. UU. La entrada:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

El resultado:

```json
{
  "businessDays": 4,
  "holidaysSkipped": [
    {
      "date": "2026-07-03",
      "name": "Independence Day (observed)"
    }
  ]
}
```

Esa llamada cuesta $0.0005, y se descuenta de su saldo. Vea la página de [Business days (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/business-days/) para las reglas detrás de la respuesta.

## ¿Y los GPT personalizados?

No necesita uno. El centro de ayuda de OpenAI tiene una guía de preguntas sobre el retiro de los GPT personalizados y su migración. Da el 11 de diciembre de 2026 como la fecha programada en que los GPT personalizados dejan de funcionar, dice que el plazo puede variar según la cuenta y el espacio de trabajo, y dice que las Actions de GPT existentes no pasan automáticamente. Hay que rehacerlas como una aplicación o como un servidor MCP personalizado, que es la ruta de arriba.

## ¿Puedo usar Endwise con la API de OpenAI?

Sí. En la Responses API se agrega un servidor MCP remoto como herramienta. La referencia de la API de OpenAI indica un campo opcional `headers` para ella, descrito como encabezados HTTP que se envían al servidor MCP, para autenticación u otros fines. Ahí va una clave de API de la [página de su cuenta](https://krishnachagti-sudo.github.io/toll-preview/account):

```python
from openai import OpenAI
import os

client = OpenAI()

resp = client.responses.create(
    model="gpt-6-astra",
    input="How many US business days are there from 2026-07-01 to 2026-07-08?",
    tools=[{
        "type": "mcp",
        "server_label": "endwise",
        "server_url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
        "headers": {"Authorization": "Bearer " + os.environ["ENDWISE_API_KEY"]},
        "require_approval": "never",
    }],
)
print(resp.output_text)
```

Por defecto, OpenAI le pide su aprobación antes de que los datos vayan a un servidor MCP remoto. Si pone `require_approval` en `"never"`, se omite. Hágalo solo con una clave que tenga un límite mensual bajo. La [guía para crear un agente (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/) explica las aprobaciones, las cotizaciones antes de las llamadas caras y el manejo de errores.

## ¿Qué guarda OpenAI?

Con el inicio de sesión, ChatGPT guarda un token que sirve solo para el servidor MCP de Endwise y solo para esa conexión. Dura una hora, y ChatGPT puede renovarlo con un token de actualización hasta que usted desconecte. No se da ninguna contraseña ni clave de API a OpenAI, y desconectar en la página de su cuenta termina el token de inmediato.

Con la API, su código envía la clave a OpenAI en la solicitud. La guía de MCP de OpenAI dice que la Responses API no guarda el valor de su campo `authorization`. No dice lo mismo de `headers`, así que suponga que una clave puesta allí llega a OpenAI. Cree una clave para ese único uso, fije un límite mensual bajo y revóquela cuando termine.

## ¿Puede ChatGPT hacer cálculos exactos de fechas?

No por sí solo. Un modelo de chat produce texto que parece una respuesta, así que un conteo de fechas puede salir con un día de error sin ninguna advertencia. El motivo se explica en [por qué la IA se equivoca con fechas y números](https://krishnachagti-sudo.github.io/toll-preview/es/guias/por-que-la-ia-se-equivoca-con-los-numeros/). Si la cifra viene de una herramienta, la llamada a la herramienta muestra la entrada que envió y el resultado que recibió, y usted puede [compararla con la página de la herramienta](https://krishnachagti-sudo.github.io/toll-preview/es/guias/como-verificar-un-numero-de-la-ia/). Sin ninguna configuración, también puede usar las herramientas directamente en la web: 5 ejecuciones gratis al día, sin cuenta.

## Fuentes

Documentación oficial, en inglés. Verificada el 4 de noviembre de 2026.

- [OpenAI: Add custom MCP server (ChatGPT plugins)](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [OpenAI Apps SDK: Authentication](https://developers.openai.com/apps-sdk/build/auth)
- [OpenAI: MCP servers in the Responses API](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI: Responses API reference (the mcp tool and its headers field)](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI Help Center: Custom GPT retirement and migration FAQ](https://help.openai.com/en/articles/20001519)

## Pasos

1. **Agregue un servidor MCP personalizado.** En ChatGPT en la web, vaya a Plugins, seleccione el botón de más y luego Add custom MCP server.
2. **Escriba la dirección del servidor.** Póngale un nombre, como Endwise, y escriba la dirección del servidor MCP de Endwise como Server URL.
3. **Elija OAuth.** Configure la autenticación como OAuth. ChatGPT encuentra solo la página de inicio de sesión de Endwise, así que no hay que escribir ningún ID de cliente ni secreto.
4. **Créelo e instálelo.** Revise la advertencia, seleccione Create as a plugin y luego instale el plugin desde sus plugins.
5. **Inicie sesión en Endwise y apruebe.** ChatGPT abre una página de Endwise. Inicie sesión, compruebe que la aplicación que aparece es chatgpt.com, fije un límite mensual para ella y elija Approve.
6. **Pruebe con una pregunta que pueda verificar.** Haga una pregunta con una respuesta conocida y compare el resultado de la llamada a la herramienta con la página de la herramienta.

## Preguntas

### ¿Puede ChatGPT conectarse al servidor MCP de Endwise?

Sí. OpenAI indica OAuth como una forma de iniciar sesión en un servidor MCP personalizado en ChatGPT, y Endwise ofrece inicio de sesión con OAuth. Agregue el servidor con OAuth y luego apruebe ChatGPT en la página de Endwise que se abre.

### ¿Necesito una clave de API para ChatGPT?

No. Al iniciar sesión se crea una conexión que funciona como una clave: tiene su propio límite mensual y aparece en Connected apps en la página de su cuenta, donde puede desconectarla. No hay nada que copiar ni pegar.

### ¿Puedo usar Endwise con la API de OpenAI?

Sí. La Responses API tiene una herramienta MCP remota con un campo headers, así que puede enviar una clave de API de Endwise como encabezado Bearer desde su propio código. La guía para crear un agente tiene un ejemplo completo.

### ¿Todavía necesito un GPT personalizado con una Action?

No. OpenAI programó que los GPT personalizados dejen de funcionar el 11 de diciembre de 2026, y dice que sus Actions no pasan solas a otro formato. Un servidor MCP personalizado con OAuth es la ruta que perdura.

### ¿Puede ChatGPT hacer cálculos exactos de fechas sin una herramienta?

Un modelo de chat escribe su respuesta como texto, así que una fecha o una suma puede salir mal sin ninguna señal. Con las herramientas de Endwise la cifra viene de una herramienta que da la misma respuesta para la misma entrada, y la llamada a la herramienta muestra la entrada y el resultado.

## Relacionado

- [Usar Endwise con Claude](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-claude/)
- [Por qué la IA se equivoca con fechas y números](https://krishnachagti-sudo.github.io/toll-preview/es/guias/por-que-la-ia-se-equivoca-con-los-numeros/)
- [Cómo verificar un número que le da una IA](https://krishnachagti-sudo.github.io/toll-preview/es/guias/como-verificar-un-numero-de-la-ia/)
- [Dele a su propio agente de IA herramientas exactas (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/guides/build-an-agent/)
- [Servidor MCP para agentes de IA (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Guías en español](https://krishnachagti-sudo.github.io/toll-preview/es/guias/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-chatgpt/  
Datos al: 2026-11-04
