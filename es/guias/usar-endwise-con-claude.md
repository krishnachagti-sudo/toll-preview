# Cómo usar Endwise con Claude (aplicaciones y Claude Code)

Sí, en 3 pasos: en claude.ai o Claude Desktop, agregue Endwise como conector personalizado en `https://krishnachagti-sudo.github.io/toll-preview/mcp`, inicie sesión en Endwise y apruebe a Claude con un límite mensual. En Claude Code, ejecute `claude mcp add --transport http` con la misma dirección e inicie sesión con `/mcp`, o envíe una clave de API como encabezado.

## ¿Puede Claude conectarse a Endwise?

Sí. Endwise es un servidor MCP remoto (MCP es una forma estándar de que una aplicación de IA llame a herramientas externas) en `https://krishnachagti-sudo.github.io/toll-preview/mcp`. Claude puede ver la lista de sus herramientas sin iniciar sesión. Para ejecutar una, Claude le pide que inicie sesión en Endwise y la apruebe, el inicio de sesión habitual con OAuth. Después Claude aparece en la [página de su cuenta](https://krishnachagti-sudo.github.io/toll-preview/account) en Connected apps, con su propio límite mensual, como una clave de API.

Esta página está al día a noviembre de 2026. Las funciones de Claude cambian, así que las fuentes del final tienen la última palabra.

## ¿Cómo lo agrego a claude.ai o a Claude Desktop?

En un plan Free, Pro, Max o Ultra, vaya a **Customize \> Connectors**, elija **Add custom connector** y escriba la dirección del servidor. Los nombres de los menús son los de la interfaz en inglés:

```text
https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Deje vacíos el ID de cliente y el secreto de OAuth. Si el cuadro de diálogo pregunta cómo iniciar sesión, **Sign in when needed** deja que Claude vea primero la lista de herramientas y le pida iniciar sesión cuando llame a una. Para el cliente de OAuth, Anthropic recomienda **Use Claude's published identity**; Endwise también acepta **Register automatically**.

En un plan Team o Enterprise, un Owner lo agrega para la organización en **Organization settings \> Connectors** eligiendo **Add** y luego **Custom**. En Enterprise, un miembro cuyo rol personalizado incluya administrar las bibliotecas de la organización también puede agregar uno. Después, los miembros se conectan desde **Customize \> Connectors** con su propia cuenta de Endwise.

## ¿Cómo es el inicio de sesión?

Claude abre una página de Endwise. Si no ha iniciado sesión, primero inicia sesión o crea una cuenta y vuelve de inmediato. La página dice qué aplicación lo pide (para Claude, claude.ai), qué podrá hacer y a dónde vuelve usted después de aprobar.

- Puede ver la lista de herramientas y sus precios, ejecutar herramientas y pagar cada ejecución con su saldo, y preguntar cuánto costaría una ejecución.
- No puede ver su contraseña, agregar dinero, cambiar su cuenta ni crear claves de API.
- Usted fija su límite mensual en esa página. Las ejecuciones que pasen del límite se rechazan y no se cobran.

Elija **Approve** y Claude continúa. Si más adelante aprueba a Claude otra vez, se mantienen la misma conexión, su límite y su historial de gasto.

## ¿Cómo lo agrego a Claude Code?

Ejecute un comando en su terminal:

```bash
claude mcp add --transport http endwise https://krishnachagti-sudo.github.io/toll-preview/mcp
```

Luego escriba `/mcp` dentro de Claude Code y elija iniciar sesión. Se abre en el navegador una página de Endwise como la de arriba. Claude Code se ejecuta en su computadora, así que la página añade una línea que le pide aprobar solo si usted inició la conexión.

Claude Code también puede enviar una clave de API en lugar de iniciar sesión. Cree una clave en la [página de su cuenta](https://krishnachagti-sudo.github.io/toll-preview/account) y agregue el servidor con un encabezado:

```bash
claude mcp add --transport http endwise https://krishnachagti-sudo.github.io/toll-preview/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

Compruebe que funcionó:

```bash
claude mcp list
claude mcp get endwise
# inside Claude Code:
/mcp
```

## ¿Qué alcance (scope) debo usar en Claude Code?

Claude Code guarda un servidor en uno de tres alcances. Use --scope (o -s) para elegir. Local es el predeterminado.

| Alcance (scope) | Se carga en | Compartido con su equipo | Se guarda en |
| --- | --- | --- | --- |
| local | Solo este proyecto | No | ~/.claude.json |
| project | Solo este proyecto | Sí, mediante el control de versiones | .mcp.json en la raíz del proyecto |
| user | Todos sus proyectos | No | ~/.claude.json |

Con inicio de sesión no hay ninguna clave en el archivo, así que cualquier alcance es seguro para compartir. Con una clave de API, evite `--scope project` y una clave escrita tal cual, porque ese archivo está pensado para subirse al control de versiones. Claude Code expande las variables de entorno en un archivo de proyecto, así que puede escribir el encabezado así y mantener la clave en su shell:

```json
{
  "mcpServers": {
    "endwise": {
      "type": "http",
      "url": "https://krishnachagti-sudo.github.io/toll-preview/mcp",
      "headers": {
        "Authorization": "Bearer ${ENDWISE_API_KEY}"
      }
    }
  }
}
```

> Primero defina `ENDWISE_API_KEY` en su entorno. La documentación de Claude Code dice que una variable sin definir y sin valor predeterminado se deja como el texto literal ${VAR}, y entonces la llamada fallaría con una clave no válida.

## ¿Qué debo preguntar primero?

Pregunte algo que tenga una sola respuesta correcta. Pruebe: "Cuente los días hábiles entre el 1 de julio de 2026 y el 8 de julio de 2026 en EE. UU."

Primero Claude le pregunta al servidor qué ofrece (una solicitud `tools/list`, que no necesita iniciar sesión). Luego elige la herramienta `business-days` y la llama con argumentos como estos:

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

La herramienta devuelve la misma respuesta cada vez para la misma entrada:

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

Claude luego redacta la respuesta para usted. Nada de la cifra salió de un modelo de lenguaje. Esta llamada cuesta **$0.0005**. Claude le pide permiso antes de llamar a una herramienta, a menos que usted haya elegido permitirla siempre.

## ¿Cómo mantengo el gasto bajo control?

- **Fije un límite mensual al aprobar.** Una llamada que lo pasaría se rechaza y no se cobra. Puede cambiarlo después en la página de su cuenta.
- **Mantenga separadas las aplicaciones.** Claude en las aplicaciones y Claude Code son conexiones distintas, cada una con su propio límite.
- **Pida una cotización.** La herramienta gratis `quote_price` dice cuánto costaría una llamada a su cuenta sin ejecutarla. Pruebe: "Usa quote\_price para decirme cuánto costaría eso antes de ejecutarlo."
- **Mantenga activa la aprobación.** Claude pregunta antes de llamar a una herramienta. Evite "permitir siempre" con un límite alto.

## ¿Cómo desconecto a Claude?

Abra la [página de su cuenta](https://krishnachagti-sudo.github.io/toll-preview/account), busque Claude en Connected apps y elija Disconnect. Le pide que haga clic otra vez para confirmar. Desde ese momento, las llamadas de Claude fallan. Quite también el conector en Claude, en **Customize \> Connectors** (los Owners usan **Organization settings \> Connectors**). En Claude Code:

```bash
claude mcp remove endwise
```

Una clave de API se revoca de la misma forma, en API keys en la página de la cuenta.

## ¿Qué puede salir mal?

- **Claude le pide iniciar sesión otra vez.** La conexión se desconectó, o no se usó durante 60 días. Inicie sesión otra vez; el límite que fijó se mantiene.
- **La página de Endwise dice que la aplicación no puede conectarse.** Quite el conector y agréguelo otra vez. Si la opción del cliente de OAuth es Use Claude's published identity, pruebe Register automatically.
- **Límite alcanzado.** La conexión o la cuenta llegó a su límite mensual. Súbalo en la página de su cuenta. No se cobró nada.
- **Unauthorized en Claude Code con una clave.** Falta la clave, es incorrecta o está revocada. Compruebe que el encabezado diga "Bearer " y luego la clave.

## Fuentes

Documentación oficial de Anthropic, en inglés.

- [Claude docs: Add a connector that isn't in the directory](https://claude.com/docs/connectors/custom)
- [Claude docs: Authentication for connectors](https://claude.com/docs/connectors/building/authentication)
- [Claude Code docs: Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## Pasos

1. **Agregue un conector personalizado.** En claude.ai o Claude Desktop, vaya a Customize \> Connectors y elija Add custom connector. En los planes Team y Enterprise, un Owner lo agrega para la organización.
2. **Escriba la dirección del servidor.** Escriba la dirección del servidor MCP de Endwise. Deje vacíos el ID de cliente y el secreto de OAuth.
3. **Inicie sesión en Endwise y apruebe.** Claude abre una página de Endwise. Inicie sesión, compruebe que la aplicación que aparece es Claude, fije un límite mensual para ella y elija Approve.
4. **Haga una pregunta que necesite una respuesta exacta.** Pida un conteo de fechas, un tipo de cambio o una cifra de millaje. Claude enumera las herramientas, elige una y la llama.
5. **Vigile el gasto y desconecte si hace falta.** Pida a Claude que ejecute primero quote\_price para una llamada de la que no esté seguro. Desconecte a Claude desde la página de su cuenta en cualquier momento.

## Preguntas

### ¿Puede Claude conectarse a Endwise?

Sí. Agregue Endwise como conector personalizado por su dirección e inicie sesión en Endwise cuando Claude se lo pida. Usted aprueba a Claude en una página de Endwise y le da un límite mensual. No necesita copiar una clave de API en Claude.

### ¿Quién puede agregar un conector personalizado en las aplicaciones de Claude?

Según la documentación de Anthropic, un servidor remoto se puede agregar como conector personalizado en los planes Free, Pro, Max, Ultra, Team y Enterprise. En Team y Enterprise lo agrega un Owner para la organización, y luego cada miembro se conecta con su propia cuenta. El plan Free permite un conector personalizado.

### ¿Me cobrará Claude por cada llamada a una herramienta?

Claude no. Las herramientas cobran a su saldo prepagado por cada llamada, igual que la API. Cada aplicación conectada tiene un límite mensual, y una llamada que pase del límite se rechaza y no se cobra.

### ¿Cómo dejo de usar Endwise en Claude?

Abra la página de su cuenta, busque Claude en Connected apps y elija Disconnect. Desde ese momento, las llamadas de Claude fallan. También puede quitar el conector en Claude, en Customize \> Connectors.

### ¿Puedo seguir usando una clave de API con Claude Code?

Sí. Claude Code acepta una opción header en claude mcp add, así que una clave de API Bearer funciona allí como antes.

## Relacionado

- [Usar Endwise con ChatGPT](https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-chatgpt/)
- [Por qué la IA se equivoca con fechas y números](https://krishnachagti-sudo.github.io/toll-preview/es/guias/por-que-la-ia-se-equivoca-con-los-numeros/)
- [Cómo verificar un número que le da una IA](https://krishnachagti-sudo.github.io/toll-preview/es/guias/como-verificar-un-numero-de-la-ia/)
- [Usar las herramientas en Cursor y VS Code (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/guides/use-in-cursor-and-vs-code/)
- [MCP para agentes de IA (en inglés)](https://krishnachagti-sudo.github.io/toll-preview/developers/mcp/)
- [Su cuenta y las aplicaciones conectadas](https://krishnachagti-sudo.github.io/toll-preview/account)
- [Guías en español](https://krishnachagti-sudo.github.io/toll-preview/es/guias/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/es/guias/usar-endwise-con-claude/  
Datos al: 2026-11-04
