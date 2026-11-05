// The QR code page. core.js (the same file the server runs) makes every single code here, in the
// browser, free and without a call: the payload, the symbol, the SVG, PNG and PDF, and the read-back
// that proves each file. The expiry check sends only the code's text to the server, which follows
// the redirects; the spreadsheet job is the server's paid answer to the same rows.
import {
  QrError, TYPES, TYPE_NAMES, WIFI_SECURITY, SHEETS, ECC_RESTORE,
  buildPayload, encodeText, designOf, printChecks, svgOf, rasterOf, pngOf, pngScanlines, pdfOf,
  verifyPixels, verifySvg, rgbaToLuminance, decodeLuminance, payloadKind, zipEntries, parseCsv, xlsxRows,
  rowsFromTable, planBulk,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'qr-code-generator';
const $ = (id) => document.getElementById(id);
const BODY_LIMIT = 90_000; // a request body is at most 100 kB; a big sheet goes in parts

// ---------- the page's language ----------
// A page in another language (page.<code>.html) sets <html lang>; every word this script writes is
// then looked up in TX[language] by key, and English, written at the call site, is the fallback.
// The English page is unchanged.
const LANG = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
const NUM_LOCALE = { es: 'es-US', de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR' };
const COMMA_DECIMAL = LANG === 'de' || LANG === 'fr' || LANG === 'pt';
const MONTHS = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
};
const TX = {
  de: {
    'type.url': 'Website-Link', 'type.text': 'Einfacher Text', 'type.wifi': 'WLAN-Zugang', 'type.vcard': 'Kontaktkarte (vCard 3.0)', 'type.email': 'E-Mail', 'type.sms': 'Textnachricht (SMS)', 'type.phone': 'Anruf', 'type.location': 'Standort auf der Karte',
    'f.url.url': 'Internetadresse', 'ph.text': 'Beliebiger Text', 'f.text.text': 'Text',
    'f.wifi.ssid': 'Netzwerkname (SSID)', 'f.wifi.password': 'Passwort', 'f.wifi.security': 'Verschlüsselung', 'f.wifi.hidden': 'Verstecktes Netzwerk', 'f.wifi.eapMethod': 'EAP-Methode (Unternehmen)', 'f.wifi.identity': 'Identität (Unternehmen)', 'f.wifi.anonymousIdentity': 'Anonyme Identität (Unternehmen)', 'f.wifi.phase2': 'Phase 2 (Unternehmen)',
    'f.vcard.firstName': 'Vorname', 'f.vcard.lastName': 'Nachname', 'f.vcard.organization': 'Firma', 'f.vcard.title': 'Position', 'f.vcard.phone': 'Telefon (geschäftlich)', 'f.vcard.mobile': 'Mobil', 'f.vcard.email': 'E-Mail', 'f.vcard.website': 'Website', 'f.vcard.street': 'Straße und Hausnummer', 'f.vcard.city': 'Ort', 'f.vcard.region': 'Bundesland oder Region', 'f.vcard.postalCode': 'Postleitzahl', 'f.vcard.country': 'Land', 'f.vcard.note': 'Notiz',
    'f.email.to': 'An', 'f.email.subject': 'Betreff', 'f.email.body': 'Nachricht', 'f.email.cc': 'Cc', 'f.email.bcc': 'Bcc', 'f.sms.phone': 'Telefonnummer', 'f.sms.message': 'Nachricht', 'f.phone.phone': 'Telefonnummer',
    'f.location.latitude': 'Breitengrad', 'f.location.longitude': 'Längengrad', 'f.location.altitude': 'Höhe in Metern (optional)',
    'sec.nopass': 'Offen (ohne Passwort)', 'sec.WPA': 'WPA / WPA2 / WPA3 privat', 'sec.WPA2-EAP': 'WPA2 Enterprise (EAP)',
    'sheet.letter-30': 'US Letter, 30 Etiketten à 1 x 2-5/8 Zoll (Etikettengröße von Avery 5160)', 'sheet.letter-12-square': 'US Letter, 12 quadratische Etiketten à 2 x 2 Zoll (Etikettengröße von Avery 22816)', 'sheet.a4-21': 'A4, 21 Etiketten à 63,5 x 38,1 mm (3 nebeneinander, 7 untereinander)',
    readBack: 'Zurückgelesen: Der Code enthält genau den Text unten (Version {0}, Stufe {1}, Maske {2}).', inside: 'Inhalt des Codes', kind: 'Art', staticKind: 'Statisch: {0}', size: 'Größe', sizeVal: 'Version {0}, {1} x {2}', ecc: 'Fehlerkorrektur', eccVal: '{0}, etwa {1}', mask: 'Maske',
    raised: 'Auf Stufe {0} erhöht, ohne dass der Code größer wird: Der Text passt in dieselbe Version.', fillIn: 'Füllen Sie die Felder aus, um den Code zu sehen.', logoFail: 'Mit diesem Logo lässt sich der Code nicht mehr zurücklesen. Wählen Sie die Fehlerkorrektur Q oder H oder ein kleineres Logo.',
    'n.https': 'Am Anfang wurde https:// ergänzt, weil Handys die vollständige Adresse brauchen.', 'n.wpa3': 'WPA3-Netzwerke werden als T:WPA geschrieben, so wie Handys es lesen; reine WPA3-Felder werden nicht ergänzt.', 'n.esc': 'Die Sonderzeichen \\ ; , " : wurden mit einem Backslash maskiert.', 'n.vcard': 'vCard 3.0 (RFC 2426): Kommas, Semikolons und Backslashes im Text werden mit einem Backslash maskiert.', 'n.pct': 'Betreff und Nachricht sind prozentcodiert (ein Leerzeichen wird zu %20).', 'n.sms': 'SMSTO:Nummer:Nachricht ist die Form, die Kamera-Apps lesen; einen offiziellen Standard dafür gibt es nicht.',
    'n.quiet': 'Die Ruhezone beträgt {0} Module. DENSO WAVE, der Erfinder des QR-Codes, verlangt auf allen Seiten eine Ruhezone von vier Modulen. Lassen Sie rund um den Code so viel Platz frei, wenn Sie ihn platzieren.', 'n.dark': 'Der Code ist hell auf dunkel. Manche älteren Scanner-Apps lesen nur dunkle Codes auf hellem Grund; testen Sie ihn mit den Handys Ihrer Zielgruppe.', 'n.contrast': 'Das Kontrastverhältnis der Farben beträgt {0}:1. Zu wenig Kontrast ist ein häufiger Grund, warum Codes nicht scannen; dunkle Module auf hellem Grund lesen sich am besten.',
    'n.module': 'Jedes Modul wird {0} mm breit gedruckt ({1} x {1} Module, Version {2}).', 'n.dots': 'Bei {0} dpi sind das {1} Druckerpunkte pro Modul. DENSO WAVE empfiehlt 4 oder mehr Punkte pro Modul für sicheres Lesen; drucken Sie größer oder mit einem feineren Drucker.', 'n.logo': 'Ein Logo verdeckt einen Teil des Codes, der Code verlässt sich also auf die Fehlerkorrektur (Stufe {0} stellt etwa {1} der Codewörter wieder her). Die Datei wurde zurückgelesen, um zu prüfen, dass sie noch lesbar ist.',
    'n.wifi': 'Ein WLAN-Code funktioniert nur dann nicht mehr, wenn sich Netzwerkname oder Passwort ändern.', 'n.contact': 'Eine Kontaktkarte funktioniert dauerhaft; sie ist nur veraltet, wenn sich die Angaben ändern.', 'n.stored': 'Der Inhalt steckt im Code selbst.', 'n.hops': 'Nach {0} Weiterleitungen abgebrochen, ohne eine Seite zu erreichen.', 'n.stopped': 'Abgebrochen bei {0}: {1}',
    'n.vendorChain': 'Der Link liegt auf einer Domain, die nicht auf der Anbieterliste steht, leitet aber über die Domain eines Anbieters weiter. So funktionieren eigene Domains bei Anbietern oft.', 'n.nopolicy': 'Wir haben keine veröffentlichte Regel dieses Anbieters gelesen, was mit Codes passiert, wenn ein Tarif endet. Fragen Sie den Anbieter oder sehen Sie in Ihrem Konto nach.', 'n.endsvendor': 'Die Kette endet auf der Domain oder Website des Anbieters, nicht auf einer Zielseite: Der Code ist möglicherweise schon pausiert oder zeigt auf eine Anbieterseite.',
    'n.http': 'Die letzte Seite antwortete mit HTTP {0}. Der Code funktioniert für Scanner möglicherweise schon nicht mehr.', 'n.dies': 'Ein Link, der heute funktioniert, ist trotzdem tot, wenn seine Website oder Domain ausläuft.', 'n.script': 'Weiterleitungen per Skript innerhalb einer Seite werden nicht verfolgt; die Kette zeigt nur HTTP-Weiterleitungen.',
    'v.static': 'Statisch', 'v.direct': 'Statischer Link', 'v.vendor-redirect': 'Anbieter-Weiterleitung', 'v.own-redirect': 'Ihre eigene Weiterleitung', 'v.unknown-redirect': 'Unbekannte Weiterleitung', 'v.unknown': 'Nicht verfolgbar',
    'vt.static': 'Statisch: Der Code enthält seinen Inhalt direkt. Dazwischen kann nichts ablaufen.', 'vt.direct': 'Statischer Link: Der Code enthält diese Internetadresse direkt, ohne Weiterleitungsdienst dazwischen. Er funktioniert, solange diese Website besteht.', 'vt.vendor-redirect': 'Anbieter-Weiterleitung: Der Code enthält einen Kurzlink auf der Domain eines QR-Code-Anbieters, der Scans zum Ziel weiterleitet. Er funktioniert nur, solange der Anbieter weiterleitet.', 'vt.own-redirect': 'Ihre eigene Weiterleitung: Der Code enthält einen Link auf einer Domain, die Sie als Ihre angegeben haben und die woandershin weiterleitet. Er funktioniert, solange Sie diese Weiterleitung betreiben.', 'vt.unknown-redirect': 'Unbekannte Weiterleitung: Der Code enthält einen Link, der Scans auf eine andere Website weiterleitet. Das kann ein QR-Code-Anbieter mit eigener oder nicht gelisteter Domain sein, oder ein Kurzlink-Dienst; er funktioniert nur, solange dieser Dienst weiterleitet.', 'vt.unknown': 'Unbekannt: Der Link ließ sich nicht verfolgen, deshalb ist nicht bekannt, wohin er heute führt.',
    'err.req.url': 'Geben Sie eine Internetadresse ein, zum Beispiel https://example.com/menu.', 'err.req.text': 'Geben Sie einen Text ein.', 'err.req.ssid': 'Geben Sie den Netzwerknamen (SSID) ein.', 'err.req.to': 'Geben Sie die E-Mail-Adresse des Empfängers ein.', 'err.req.phone': 'Geben Sie eine Telefonnummer ein.',
    'err.space': 'Ein Link darf keine Leerzeichen enthalten; ersetzen Sie sie durch %20.', 'err.url': 'Das ist keine vollständige Internetadresse. Sie muss mit http:// oder https:// beginnen und einen Domainnamen wie example.com enthalten.', 'err.email': '"{0}" ist keine E-Mail-Adresse.', 'err.phone': '"{0}" ist keine Telefonnummer: Verwenden Sie Ziffern, für Anrufe aus dem Ausland mit + und Ländervorwahl (zum Beispiel +4930123456).',
    'err.pw': 'Für ein geschütztes Netzwerk ist ein Passwort nötig; wählen Sie "Offen" für ein Netzwerk ohne Passwort.', 'err.name': 'Geben Sie einen Vor- oder Nachnamen oder eine Firma an.', 'err.eap': 'EAP-Methode, Identität und Phase 2 gibt es nur bei WPA2-EAP-Netzwerken (Unternehmen).',
    'err.latitude': 'Der Breitengrad muss eine Dezimalzahl von -90 bis 90 sein, zum Beispiel 52.52 (mit Punkt).', 'err.longitude': 'Der Längengrad muss eine Dezimalzahl von -180 bis 180 sein, zum Beispiel 13.405 (mit Punkt).', 'err.altitude': 'Die Höhe wird in Metern als Dezimalzahl angegeben (mit Punkt).', 'err.big': 'Das passt nicht in einen QR-Code bei Fehlerkorrektur {0}. Kürzen Sie den Inhalt oder wählen Sie eine niedrigere Stufe.',
    'img.open': 'Diese Datei ist kein Bild, das dieser Browser öffnen kann. PDF-Dateien werden hier nicht gelesen; machen Sie stattdessen einen Screenshot des Codes.', 'img.none': 'Aus diesem Bild ließ sich kein QR-Code lesen. Versuchen Sie einen geraden Screenshot, der auf den Code zugeschnitten ist, oder tippen Sie ein, was der Code sagt.', 'logo.open': 'Dieses Bild ließ sich nicht öffnen.',
    'check.say': 'Der Code enthält', 'check.vendor': 'Anbieter: {0}', 'check.vendorEn': 'Wortlaut der Anbieterseite, auf Englisch.', 'check.page': 'Die Seite des Anbieters', 'check.read': ', gelesen am {0}', 'check.dated': ', Seitendatum {0}', 'check.leads': 'Wohin er heute führt', 'check.http': 'HTTP {0}', 'check.noanswer': 'keine Antwort',
    'check.repl': 'Ein statischer Ersatz für den Neudruck', 'check.replNote': 'Ein statischer Code für die Seite, zu der der alte Code heute führt. Drucken Sie ihn mindestens so groß wie den alten und scannen Sie ihn vor dem Druck zur Probe. Wenn Sie das Ziel später ohne Neudruck ändern möchten, verweisen Sie auf eine Seite unter einer Domain, die Ihnen gehört.', 'check.open': 'Im Generator oben öffnen', 'check.pick': 'Wählen Sie ein Bild des Codes oder tippen Sie ein, was er sagt.',
    'bulk.few': 'Geben Sie eine Kopfzeile und mindestens eine Zeile an.', 'bulk.code1': 'Code', 'bulk.codeN': 'Codes', 'bulk.row1': 'Zeile', 'bulk.rowN': 'Zeilen', 'bulk.refused': '{0} {1} abgelehnt, nie berechnet', 'bulk.rate': '$0.002 pro Code, mindestens 10 pro Auftrag', 'bulk.beyond': '; Codes über 5.000 in einem Kalendermonat kosten $0.0005', 'bulk.about': 'Etwa {0} für diesen Auftrag ({1}).', 'bulk.exact': 'Der genaue Preis wird angezeigt, bevor etwas berechnet wird.',
    'bulk.unused': 'Nicht verwendet: {0} (in Dateinamen als {1} nutzbar).', 'bulk.rowErr': 'Zeile {0}: {1}', 'bulk.more': 'und {0} weitere, aufgeführt im Manifest.', 'th.row': 'Zeile', 'th.file': 'Datei', 'th.inside': 'Inhalt', 'bulk.dl': '{0} herunterladen', 'bulk.done': ' {0} Codes, jede Datei zurückgelesen{1}. Berechnet: {2}.', 'bulk.pages1': ', mit {0} Etikettenseite', 'bulk.pagesN': ', mit {0} Etikettenseiten', 'bulk.codewidth': 'Die Codes werden {0} mm breit gedruckt.',
    'bulk.signin': 'Melden Sie sich an, um die Dateien zu erstellen; die Zeilen oben bleiben auf dieser Seite.', 'bulk.signinLink': ' Anmelden', 'bulk.isOpen': '{0} ist geöffnet.',
  },
  es: {
    'type.url': 'Enlace a un sitio web', 'type.text': 'Texto sin formato', 'type.wifi': 'Acceso WiFi', 'type.vcard': 'Tarjeta de contacto (vCard 3.0)', 'type.email': 'Correo electrónico', 'type.sms': 'Mensaje de texto (SMS)', 'type.phone': 'Llamada telefónica', 'type.location': 'Ubicación en el mapa',
    'f.url.url': 'Dirección web', 'ph.text': 'Cualquier texto', 'f.text.text': 'Texto',
    'f.wifi.ssid': 'Nombre de la red (SSID)', 'f.wifi.password': 'Contraseña', 'f.wifi.security': 'Seguridad', 'f.wifi.hidden': 'Red oculta', 'f.wifi.eapMethod': 'Método EAP (empresas)', 'f.wifi.identity': 'Identidad (empresas)', 'f.wifi.anonymousIdentity': 'Identidad anónima (empresas)', 'f.wifi.phase2': 'Fase 2 (empresas)',
    'f.vcard.firstName': 'Nombre', 'f.vcard.lastName': 'Apellido', 'f.vcard.organization': 'Empresa u organización', 'f.vcard.title': 'Cargo', 'f.vcard.phone': 'Teléfono del trabajo', 'f.vcard.mobile': 'Celular', 'f.vcard.email': 'Correo electrónico', 'f.vcard.website': 'Sitio web', 'f.vcard.street': 'Calle y número', 'f.vcard.city': 'Ciudad', 'f.vcard.region': 'Estado, provincia o región', 'f.vcard.postalCode': 'Código postal', 'f.vcard.country': 'País', 'f.vcard.note': 'Nota',
    'f.email.to': 'Para', 'f.email.subject': 'Asunto', 'f.email.body': 'Mensaje', 'f.email.cc': 'Cc', 'f.email.bcc': 'Cco', 'f.sms.phone': 'Número de teléfono', 'f.sms.message': 'Mensaje', 'f.phone.phone': 'Número de teléfono',
    'f.location.latitude': 'Latitud', 'f.location.longitude': 'Longitud', 'f.location.altitude': 'Altitud en metros (opcional)',
    'sec.nopass': 'Abierta (sin contraseña)', 'sec.WPA': 'WPA / WPA2 / WPA3 personal', 'sec.WPA2-EAP': 'WPA2 empresarial (EAP)',
    'sheet.letter-30': 'US Letter, 30 etiquetas de 1 x 2-5/8 pulgadas (el tamaño de etiqueta de Avery 5160)', 'sheet.letter-12-square': 'US Letter, 12 etiquetas cuadradas de 2 x 2 pulgadas (el tamaño de etiqueta de Avery 22816)', 'sheet.a4-21': 'A4, 21 etiquetas de 63.5 x 38.1 mm (3 de ancho, 7 de alto)',
    readBack: 'Leído de vuelta: el código dice exactamente el texto de abajo (versión {0}, nivel {1}, máscara {2}).', inside: 'Lo que contiene el código', kind: 'Tipo', staticKind: 'Estático: {0}', size: 'Tamaño', sizeVal: 'Versión {0}, {1} x {2}', ecc: 'Corrección de errores', eccVal: '{0}, alrededor de {1}', mask: 'Máscara',
    raised: 'Subido al nivel {0} sin costo en tamaño: el texto cabe en la misma versión.', fillIn: 'Complete los campos para ver el código.', logoFail: 'Con este logo el código ya no se lee de vuelta. Elija la corrección de errores Q o H, o un logo más pequeño.',
    'n.https': 'Se agregó https:// al principio, porque los teléfonos necesitan la dirección completa.', 'n.wpa3': 'Las redes WPA3 se escriben como T:WPA, la forma que leen los teléfonos; no se agregan campos exclusivos de WPA3.', 'n.esc': 'Los caracteres especiales \\ ; , " : se escaparon con una barra invertida.', 'n.vcard': 'vCard 3.0 (RFC 2426): las comas, los puntos y coma y las barras invertidas del texto se escapan con una barra invertida.', 'n.pct': 'El asunto y el mensaje van codificados con porcentajes (un espacio es %20).', 'n.sms': 'SMSTO:número:mensaje es la forma que leen las aplicaciones de cámara; no existe un estándar oficial para ella.',
    'n.quiet': 'La zona de silencio es de {0} módulos. DENSO WAVE, el inventor del código QR, indica que necesita un margen de cuatro módulos en todos los lados. Deje ese espacio en blanco alrededor del código cuando lo coloque.', 'n.dark': 'El código es claro sobre oscuro. Algunas aplicaciones de escaneo antiguas solo leen códigos oscuros sobre fondo claro; pruébelo con los teléfonos de su público.', 'n.contrast': 'Los colores tienen una relación de contraste de {0}:1. El poco contraste es una causa común de códigos que no se escanean; los módulos oscuros sobre fondo claro se leen mejor.',
    'n.module': 'Cada módulo se imprime de {0} mm de ancho ({1} x {1} módulos, versión {2}).', 'n.dots': 'A {0} ppp eso son {1} puntos de impresora por módulo. DENSO WAVE recomienda 4 o más puntos por módulo para una lectura estable; imprímalo más grande o con una impresora de mayor resolución.', 'n.logo': 'Un logo cubre parte del código, así que depende de la corrección de errores (el nivel {0} restaura cerca de {1} de las palabras de código). El archivo se leyó de vuelta para comprobar que aún se decodifica.',
    'n.wifi': 'Un código WiFi solo deja de funcionar si cambia el nombre de la red o la contraseña.', 'n.contact': 'Una tarjeta de contacto funciona para siempre; solo queda desactualizada si cambian los datos.', 'n.stored': 'El contenido está guardado en el propio código.', 'n.hops': 'Se detuvo tras {0} redirecciones sin llegar a una página.', 'n.stopped': 'Se detuvo en {0}: {1}',
    'n.vendorChain': 'El enlace está en un dominio que no figura en la lista de proveedores, pero se redirige a través del dominio de un proveedor, que es como suelen funcionar los dominios personalizados de los proveedores.', 'n.nopolicy': 'No hemos leído una política publicada de este proveedor sobre qué pasa con los códigos cuando termina un plan; pregunte al proveedor o revise su cuenta.', 'n.endsvendor': 'La cadena termina en el dominio o el sitio web del proveedor, no en una página de destino: el código puede estar ya en pausa o apuntar a una página del proveedor.',
    'n.http': 'La última página respondió con HTTP {0}, así que el código puede estar fallando ya para quienes lo escanean.', 'n.dies': 'Un enlace que funciona hoy deja de funcionar si caduca su sitio web o su dominio.', 'n.script': 'Las redirecciones hechas por un script dentro de una página no se siguen; la cadena muestra solo redirecciones HTTP.',
    'v.static': 'Estático', 'v.direct': 'Enlace estático', 'v.vendor-redirect': 'Redirección de un proveedor', 'v.own-redirect': 'Su propia redirección', 'v.unknown-redirect': 'Redirección desconocida', 'v.unknown': 'No se pudo seguir',
    'vt.static': 'Estático: el código contiene su contenido directamente. Nada intermedio puede caducar.', 'vt.direct': 'Enlace estático: el código contiene esta dirección web directamente, sin un servicio de redirección intermedio. Sigue funcionando mientras ese sitio web exista.', 'vt.vendor-redirect': 'Redirección de un proveedor: el código contiene un enlace corto en el dominio de un proveedor de códigos QR, que reenvía los escaneos al destino. Funciona solo mientras ese proveedor siga reenviándolo.', 'vt.own-redirect': 'Su propia redirección: el código contiene un enlace en un dominio que usted indicó que es suyo, que reenvía a otro lugar. Funciona mientras usted mantenga esa redirección.', 'vt.unknown-redirect': 'Redirección desconocida: el código contiene un enlace que reenvía los escaneos a otro sitio. Puede ser un proveedor de códigos QR con un dominio personalizado o no listado, o un acortador de enlaces; funciona solo mientras ese servicio siga reenviándolo.', 'vt.unknown': 'Desconocido: no se pudo seguir el enlace, así que no se sabe adónde lleva hoy.',
    'err.req.url': 'Escriba una dirección web, por ejemplo https://example.com/menu.', 'err.req.text': 'Escriba un texto.', 'err.req.ssid': 'Escriba el nombre de la red (SSID).', 'err.req.to': 'Escriba la dirección de correo del destinatario.', 'err.req.phone': 'Escriba un número de teléfono.',
    'err.space': 'Un enlace no puede tener espacios; reemplácelos por %20.', 'err.url': 'Esa no es una dirección web completa. Debe empezar con http:// o https:// y tener un nombre de dominio como example.com.', 'err.email': '"{0}" no es una dirección de correo electrónico.', 'err.phone': '"{0}" no es un número de teléfono: use dígitos, con + y el código del país para llamadas desde el extranjero (por ejemplo +12125551212).',
    'err.pw': 'Una red protegida necesita contraseña; elija "Abierta" para una red sin contraseña.', 'err.name': 'Indique un nombre o un apellido, o una organización.', 'err.eap': 'El método EAP, la identidad y la fase 2 son solo para redes WPA2-EAP (empresariales).',
    'err.latitude': 'La latitud debe ser un número decimal de -90 a 90, por ejemplo 40.71872 (con punto).', 'err.longitude': 'La longitud debe ser un número decimal de -180 a 180, por ejemplo -73.98905 (con punto).', 'err.altitude': 'La altitud va en metros, como número decimal (con punto).', 'err.big': 'Es demasiado para un solo código QR con corrección de errores {0}. Acorte el contenido o elija un nivel más bajo.',
    'img.open': 'Ese archivo no es una imagen que este navegador pueda abrir. Aquí no se leen archivos PDF; tome una captura de pantalla del código.', 'img.none': 'No se pudo leer ningún código QR de esa imagen. Pruebe con una captura de pantalla de frente y recortada al código, o escriba lo que dice el código.', 'logo.open': 'No se pudo abrir esa imagen.',
    'check.say': 'El código dice', 'check.vendor': 'Proveedor: {0}', 'check.vendorEn': 'Texto de la página del proveedor, en inglés.', 'check.page': 'La página del proveedor', 'check.read': ', leída el {0}', 'check.dated': ', con fecha {0}', 'check.leads': 'Adónde lleva hoy', 'check.http': 'HTTP {0}', 'check.noanswer': 'sin respuesta',
    'check.repl': 'Un reemplazo estático para la reimpresión', 'check.replNote': 'Un código estático para la página a la que lleva hoy el código antiguo. Imprímalo al menos tan grande como el antiguo y escanéelo de prueba antes de imprimir la tirada. Si quiere cambiar el destino más adelante sin reimprimir, apúntelo a una página de un dominio que sea suyo.', 'check.open': 'Abrir en el generador de arriba', 'check.pick': 'Elija una imagen del código o escriba lo que dice.',
    'bulk.few': 'Indique una fila de encabezados y al menos una fila.', 'bulk.code1': 'código', 'bulk.codeN': 'códigos', 'bulk.row1': 'fila', 'bulk.rowN': 'filas', 'bulk.refused': '{0} {1} rechazadas, nunca se cobran', 'bulk.rate': '$0.002 por código, mínimo 10 por trabajo', 'bulk.beyond': '; los códigos por encima de 5,000 en un mes calendario cuestan $0.0005', 'bulk.about': 'Unos {0} por este trabajo ({1}).', 'bulk.exact': 'El precio exacto se muestra antes de cobrar nada.',
    'bulk.unused': 'No se usan: {0} (se pueden usar en los nombres de archivo como {1}).', 'bulk.rowErr': 'Fila {0}: {1}', 'bulk.more': 'y {0} más, listadas en el manifiesto.', 'th.row': 'Fila', 'th.file': 'Archivo', 'th.inside': 'Contenido', 'bulk.dl': 'Descargar {0}', 'bulk.done': ' {0} códigos, cada archivo leído de vuelta{1}. Cobrado: {2}.', 'bulk.pages1': ', con {0} página de etiquetas', 'bulk.pagesN': ', con {0} páginas de etiquetas', 'bulk.codewidth': 'Los códigos se imprimen de {0} mm de ancho.',
    'bulk.signin': 'Inicie sesión para crear los archivos; las filas de arriba se quedan en esta página.', 'bulk.signinLink': ' Iniciar sesión', 'bulk.isOpen': '{0} está abierto.',
  },
  fr: {
    'type.url': 'Lien vers un site web', 'type.text': 'Texte brut', 'type.wifi': 'Connexion Wi-Fi', 'type.vcard': 'Carte de contact (vCard 3.0)', 'type.email': 'E-mail', 'type.sms': 'SMS', 'type.phone': 'Appel téléphonique', 'type.location': 'Position sur la carte',
    'f.url.url': 'Adresse web', 'ph.text': 'Un texte quelconque', 'f.text.text': 'Texte',
    'f.wifi.ssid': 'Nom du réseau (SSID)', 'f.wifi.password': 'Mot de passe', 'f.wifi.security': 'Sécurité', 'f.wifi.hidden': 'Réseau masqué', 'f.wifi.eapMethod': 'Méthode EAP (entreprise)', 'f.wifi.identity': 'Identité (entreprise)', 'f.wifi.anonymousIdentity': 'Identité anonyme (entreprise)', 'f.wifi.phase2': 'Phase 2 (entreprise)',
    'f.vcard.firstName': 'Prénom', 'f.vcard.lastName': 'Nom', 'f.vcard.organization': 'Société ou organisation', 'f.vcard.title': 'Fonction', 'f.vcard.phone': 'Téléphone professionnel', 'f.vcard.mobile': 'Mobile', 'f.vcard.email': 'E-mail', 'f.vcard.website': 'Site web', 'f.vcard.street': 'Numéro et rue', 'f.vcard.city': 'Ville', 'f.vcard.region': 'Région', 'f.vcard.postalCode': 'Code postal', 'f.vcard.country': 'Pays', 'f.vcard.note': 'Note',
    'f.email.to': 'À', 'f.email.subject': 'Objet', 'f.email.body': 'Message', 'f.email.cc': 'Cc', 'f.email.bcc': 'Cci', 'f.sms.phone': 'Numéro de téléphone', 'f.sms.message': 'Message', 'f.phone.phone': 'Numéro de téléphone',
    'f.location.latitude': 'Latitude', 'f.location.longitude': 'Longitude', 'f.location.altitude': 'Altitude en mètres (facultatif)',
    'sec.nopass': 'Ouvert (sans mot de passe)', 'sec.WPA': 'WPA / WPA2 / WPA3 personnel', 'sec.WPA2-EAP': 'WPA2 entreprise (EAP)',
    'sheet.letter-30': 'US Letter, 30 étiquettes de 1 x 2-5/8 pouces (la taille d’étiquette de l’Avery 5160)', 'sheet.letter-12-square': 'US Letter, 12 étiquettes carrées de 2 x 2 pouces (la taille d’étiquette de l’Avery 22816)', 'sheet.a4-21': 'A4, 21 étiquettes de 63,5 x 38,1 mm (3 en largeur, 7 en hauteur)',
    readBack: 'Relu : le code contient exactement le texte ci-dessous (version {0}, niveau {1}, masque {2}).', inside: 'Contenu du code', kind: 'Type', staticKind: 'Statique : {0}', size: 'Taille', sizeVal: 'Version {0}, {1} x {2}', ecc: 'Correction d’erreurs', eccVal: '{0}, environ {1}', mask: 'Masque',
    raised: 'Passé au niveau {0} sans augmenter la taille : le texte tient dans la même version.', fillIn: 'Remplissez les champs pour voir le code.', logoFail: 'Avec ce logo, le code ne se relit plus. Choisissez la correction d’erreurs Q ou H, ou un logo plus petit.',
    'n.https': 'https:// a été ajouté au début, car les téléphones ont besoin de l’adresse complète.', 'n.wpa3': 'Les réseaux WPA3 s’écrivent T:WPA, la forme que lisent les téléphones ; les champs propres à WPA3 ne sont pas ajoutés.', 'n.esc': 'Les caractères spéciaux \\ ; , " : ont été échappés avec une barre oblique inverse.', 'n.vcard': 'vCard 3.0 (RFC 2426) : les virgules, points-virgules et barres obliques inverses du texte sont échappés avec une barre oblique inverse.', 'n.pct': 'L’objet et le message sont codés en pourcentage (une espace devient %20).', 'n.sms': 'SMSTO:numéro:message est la forme que lisent les applications d’appareil photo ; il n’existe pas de norme officielle pour elle.',
    'n.quiet': 'La zone de silence est de {0} modules. DENSO WAVE, l’inventeur du QR code, indique qu’un QR code a besoin d’une marge de quatre modules de chaque côté. Laissez cet espace blanc autour du code lors de sa mise en page.', 'n.dark': 'Le code est clair sur fond sombre. Certaines anciennes applications de lecture ne lisent que les codes sombres sur fond clair ; testez-le avec les téléphones de votre public.', 'n.contrast': 'Les couleurs ont un rapport de contraste de {0}:1. Un contraste trop faible est une cause fréquente de codes qui ne se scannent pas ; des modules sombres sur fond clair se lisent le mieux.',
    'n.module': 'Chaque module s’imprime sur {0} mm de large ({1} x {1} modules, version {2}).', 'n.dots': 'À {0} ppp, cela fait {1} points d’imprimante par module. DENSO WAVE recommande 4 points ou plus par module pour une lecture stable ; imprimez plus grand ou avec une imprimante plus fine.', 'n.logo': 'Un logo recouvre une partie du code, qui s’appuie donc sur la correction d’erreurs (le niveau {0} restitue environ {1} des mots de code). Le fichier a été relu pour vérifier qu’il se décode encore.',
    'n.wifi': 'Un code Wi-Fi ne cesse de fonctionner que si le nom du réseau ou le mot de passe change.', 'n.contact': 'Une carte de contact fonctionne indéfiniment ; elle n’est périmée que si les coordonnées changent.', 'n.stored': 'Le contenu est stocké dans le code lui-même.', 'n.hops': 'Arrêt après {0} redirections sans atteindre une page.', 'n.stopped': 'Arrêt à {0} : {1}',
    'n.vendorChain': 'Le lien se trouve sur un domaine absent de la liste des prestataires, mais il passe par le domaine d’un prestataire, ce qui est souvent le cas des domaines personnalisés des prestataires.', 'n.nopolicy': 'Nous n’avons lu aucune règle publiée de ce prestataire sur ce qui arrive aux codes quand un abonnement se termine ; demandez au prestataire ou consultez votre compte.', 'n.endsvendor': 'La chaîne se termine sur le domaine ou le site du prestataire, et non sur une page de destination : le code est peut-être déjà suspendu ou renvoie vers une page du prestataire.',
    'n.http': 'La dernière page a répondu HTTP {0} : le code est peut-être déjà en échec pour ceux qui le scannent.', 'n.dies': 'Un lien qui fonctionne aujourd’hui cesse de fonctionner si son site web ou son domaine expire.', 'n.script': 'Les redirections faites par un script dans une page ne sont pas suivies ; la chaîne n’affiche que les redirections HTTP.',
    'v.static': 'Statique', 'v.direct': 'Lien statique', 'v.vendor-redirect': 'Redirection d’un prestataire', 'v.own-redirect': 'Votre propre redirection', 'v.unknown-redirect': 'Redirection inconnue', 'v.unknown': 'Impossible à suivre',
    'vt.static': 'Statique : le code contient directement son contenu. Rien d’intermédiaire ne peut expirer.', 'vt.direct': 'Lien statique : le code contient directement cette adresse web, sans service de redirection intermédiaire. Il fonctionne tant que ce site existe.', 'vt.vendor-redirect': 'Redirection d’un prestataire : le code contient un lien court sur le domaine d’un prestataire de QR codes, qui transmet les scans vers la destination. Il ne fonctionne que tant que ce prestataire continue de le transmettre.', 'vt.own-redirect': 'Votre propre redirection : le code contient un lien sur un domaine que vous avez indiqué être le vôtre, qui renvoie ailleurs. Il fonctionne tant que vous maintenez cette redirection.', 'vt.unknown-redirect': 'Redirection inconnue : le code contient un lien qui transmet les scans vers un autre site. Il peut s’agir d’un prestataire de QR codes avec un domaine personnalisé ou non listé, ou d’un raccourcisseur de liens ; il ne fonctionne que tant que ce service continue de le transmettre.', 'vt.unknown': 'Inconnu : le lien n’a pas pu être suivi, on ignore donc où il mène aujourd’hui.',
    'err.req.url': 'Saisissez une adresse web, par exemple https://example.com/menu.', 'err.req.text': 'Saisissez un texte.', 'err.req.ssid': 'Saisissez le nom du réseau (SSID).', 'err.req.to': 'Saisissez l’adresse e-mail du destinataire.', 'err.req.phone': 'Saisissez un numéro de téléphone.',
    'err.space': 'Un lien ne peut pas contenir d’espaces ; remplacez-les par %20.', 'err.url': 'Ce n’est pas une adresse web complète. Elle doit commencer par http:// ou https:// et contenir un nom de domaine comme example.com.', 'err.email': '« {0} » n’est pas une adresse e-mail.', 'err.phone': '« {0} » n’est pas un numéro de téléphone : utilisez des chiffres, avec + et l’indicatif du pays pour les appels depuis l’étranger (par exemple +33123456789).',
    'err.pw': 'Un réseau protégé demande un mot de passe ; choisissez « Ouvert » pour un réseau sans mot de passe.', 'err.name': 'Indiquez un prénom ou un nom, ou une organisation.', 'err.eap': 'La méthode EAP, l’identité et la phase 2 ne concernent que les réseaux WPA2-EAP (entreprise).',
    'err.latitude': 'La latitude doit être un nombre décimal de -90 à 90, par exemple 48.8566 (avec un point).', 'err.longitude': 'La longitude doit être un nombre décimal de -180 à 180, par exemple 2.3522 (avec un point).', 'err.altitude': 'L’altitude s’exprime en mètres, en nombre décimal (avec un point).', 'err.big': 'C’est trop pour un seul QR code avec la correction d’erreurs {0}. Raccourcissez le contenu ou choisissez un niveau plus bas.',
    'img.open': 'Ce fichier n’est pas une image que ce navigateur peut ouvrir. Les fichiers PDF ne sont pas lus ici ; faites plutôt une capture d’écran du code.', 'img.none': 'Aucun QR code n’a pu être lu dans cette image. Essayez une capture d’écran bien droite, recadrée sur le code, ou saisissez ce que dit le code.', 'logo.open': 'Cette image n’a pas pu être ouverte.',
    'check.say': 'Le code contient', 'check.vendor': 'Prestataire : {0}', 'check.vendorEn': 'Texte de la page du prestataire, en anglais.', 'check.page': 'La page du prestataire', 'check.read': ', lue le {0}', 'check.dated': ', datée du {0}', 'check.leads': 'Où il mène aujourd’hui', 'check.http': 'HTTP {0}', 'check.noanswer': 'pas de réponse',
    'check.repl': 'Un remplaçant statique pour la réimpression', 'check.replNote': 'Un code statique pour la page où mène aujourd’hui l’ancien code. Imprimez-le au moins aussi grand que l’ancien et scannez-le en test avant le tirage. Si vous voulez changer la destination plus tard sans réimprimer, faites-le pointer vers une page d’un domaine qui vous appartient.', 'check.open': 'Ouvrir dans le générateur ci-dessus', 'check.pick': 'Choisissez une image du code ou saisissez ce qu’il dit.',
    'bulk.few': 'Indiquez une ligne d’en-tête et au moins une ligne.', 'bulk.code1': 'code', 'bulk.codeN': 'codes', 'bulk.row1': 'ligne', 'bulk.rowN': 'lignes', 'bulk.refused': '{0} {1} refusées, jamais facturées', 'bulk.rate': '$0.002 par code, 10 par commande au minimum', 'bulk.beyond': ' ; les codes au-delà de 5 000 dans un mois civil coûtent $0.0005', 'bulk.about': 'Environ {0} pour cette commande ({1}).', 'bulk.exact': 'Le prix exact s’affiche avant tout débit.',
    'bulk.unused': 'Non utilisées : {0} (utilisables dans les noms de fichier sous la forme {1}).', 'bulk.rowErr': 'Ligne {0} : {1}', 'bulk.more': 'et {0} autres, listées dans le manifeste.', 'th.row': 'Ligne', 'th.file': 'Fichier', 'th.inside': 'Contenu', 'bulk.dl': 'Télécharger {0}', 'bulk.done': ' {0} codes, chaque fichier relu{1}. Facturé : {2}.', 'bulk.pages1': ', avec {0} page d’étiquettes', 'bulk.pagesN': ', avec {0} pages d’étiquettes', 'bulk.codewidth': 'Les codes s’impriment sur {0} mm de large.',
    'bulk.signin': 'Connectez-vous pour créer les fichiers ; les lignes ci-dessus restent sur cette page.', 'bulk.signinLink': ' Se connecter', 'bulk.isOpen': '{0} est ouvert.',
  },
  pt: {
    'type.url': 'Link de site', 'type.text': 'Texto simples', 'type.wifi': 'Acesso ao Wi-Fi', 'type.vcard': 'Cartão de contato (vCard 3.0)', 'type.email': 'E-mail', 'type.sms': 'Mensagem de texto (SMS)', 'type.phone': 'Ligação telefônica', 'type.location': 'Localização no mapa',
    'f.url.url': 'Endereço do site', 'ph.text': 'Qualquer texto', 'f.text.text': 'Texto',
    'f.wifi.ssid': 'Nome da rede (SSID)', 'f.wifi.password': 'Senha', 'f.wifi.security': 'Segurança', 'f.wifi.hidden': 'Rede oculta', 'f.wifi.eapMethod': 'Método EAP (corporativo)', 'f.wifi.identity': 'Identidade (corporativo)', 'f.wifi.anonymousIdentity': 'Identidade anônima (corporativo)', 'f.wifi.phase2': 'Fase 2 (corporativo)',
    'f.vcard.firstName': 'Nome', 'f.vcard.lastName': 'Sobrenome', 'f.vcard.organization': 'Empresa', 'f.vcard.title': 'Cargo', 'f.vcard.phone': 'Telefone comercial', 'f.vcard.mobile': 'Celular', 'f.vcard.email': 'E-mail', 'f.vcard.website': 'Site', 'f.vcard.street': 'Rua e número', 'f.vcard.city': 'Cidade', 'f.vcard.region': 'Estado ou região', 'f.vcard.postalCode': 'CEP', 'f.vcard.country': 'País', 'f.vcard.note': 'Observação',
    'f.email.to': 'Para', 'f.email.subject': 'Assunto', 'f.email.body': 'Mensagem', 'f.email.cc': 'Cc', 'f.email.bcc': 'Cco', 'f.sms.phone': 'Número de telefone', 'f.sms.message': 'Mensagem', 'f.phone.phone': 'Número de telefone',
    'f.location.latitude': 'Latitude', 'f.location.longitude': 'Longitude', 'f.location.altitude': 'Altitude em metros (opcional)',
    'sec.nopass': 'Aberta (sem senha)', 'sec.WPA': 'WPA / WPA2 / WPA3 pessoal', 'sec.WPA2-EAP': 'WPA2 corporativo (EAP)',
    'sheet.letter-30': 'US Letter, 30 etiquetas de 1 x 2-5/8 pol. (o tamanho de etiqueta da Avery 5160)', 'sheet.letter-12-square': 'US Letter, 12 etiquetas quadradas de 2 x 2 pol. (o tamanho de etiqueta da Avery 22816)', 'sheet.a4-21': 'A4, 21 etiquetas de 63,5 x 38,1 mm (3 na largura, 7 na altura)',
    readBack: 'Lido de volta: o código diz exatamente o texto abaixo (versão {0}, nível {1}, máscara {2}).', inside: 'O que há dentro do código', kind: 'Tipo', staticKind: 'Estático: {0}', size: 'Tamanho', sizeVal: 'Versão {0}, {1} x {2}', ecc: 'Correção de erros', eccVal: '{0}, cerca de {1}', mask: 'Máscara',
    raised: 'Subiu para o nível {0} sem custo em tamanho: o texto cabe na mesma versão.', fillIn: 'Preencha os campos para ver o código.', logoFail: 'Com este logotipo, o código não é mais lido de volta. Escolha a correção de erros Q ou H, ou um logotipo menor.',
    'n.https': 'Foi adicionado https:// no início, porque os celulares precisam do endereço completo.', 'n.wpa3': 'Redes WPA3 são escritas como T:WPA, a forma que os celulares leem; campos exclusivos do WPA3 não são adicionados.', 'n.esc': 'Os caracteres especiais \\ ; , " : receberam uma barra invertida na frente.', 'n.vcard': 'vCard 3.0 (RFC 2426): vírgulas, pontos e vírgulas e barras invertidas no texto recebem uma barra invertida na frente.', 'n.pct': 'O assunto e a mensagem são codificados com porcentagem (um espaço vira %20).', 'n.sms': 'SMSTO:número:mensagem é a forma que os aplicativos de câmera leem; não existe um padrão oficial para ela.',
    'n.quiet': 'A zona de silêncio é de {0} módulos. A DENSO WAVE, inventora do QR Code, diz que um QR Code precisa de uma margem de quatro módulos em todos os lados. Deixe esse espaço em branco ao redor dele quando for posicioná-lo.', 'n.dark': 'O código é claro sobre escuro. Alguns aplicativos de leitura mais antigos só leem códigos escuros sobre fundo claro; teste com os celulares do seu público.', 'n.contrast': 'As cores têm uma razão de contraste de {0}:1. Pouco contraste é um motivo comum de códigos que não leem; módulos escuros sobre fundo claro são lidos melhor.',
    'n.module': 'Cada módulo é impresso com {0} mm de largura ({1} x {1} módulos, versão {2}).', 'n.dots': 'A {0} dpi, isso dá {1} pontos de impressora por módulo. A DENSO WAVE recomenda 4 ou mais pontos por módulo para uma leitura estável; imprima maior ou com uma impressora de resolução mais fina.', 'n.logo': 'Um logotipo cobre parte do código, então ele depende da correção de erros (o nível {0} restaura cerca de {1} das palavras-código). O arquivo foi lido de volta para conferir que ainda é decodificado.',
    'n.wifi': 'Um código de Wi-Fi só deixa de funcionar se o nome da rede ou a senha mudar.', 'n.contact': 'Um cartão de contato funciona para sempre; só fica desatualizado se os dados mudarem.', 'n.stored': 'O conteúdo fica guardado no próprio código.', 'n.hops': 'Parou depois de {0} redirecionamentos sem chegar a uma página.', 'n.stopped': 'Parou em {0}: {1}',
    'n.vendorChain': 'O link está em um domínio que não consta na lista de fornecedores, mas é encaminhado pelo domínio de um fornecedor, que é como costumam funcionar os domínios personalizados dos fornecedores.', 'n.nopolicy': 'Não lemos uma política publicada deste fornecedor sobre o que acontece com os códigos quando um plano termina; pergunte ao fornecedor ou veja sua conta.', 'n.endsvendor': 'A cadeia termina no domínio ou no site do fornecedor, e não em uma página de destino: o código pode já estar pausado ou apontando para uma página do fornecedor.',
    'n.http': 'A última página respondeu com HTTP {0}, então o código pode já estar falhando para quem o escaneia.', 'n.dies': 'Um link que funciona hoje deixa de funcionar se o site ou o domínio dele expirar.', 'n.script': 'Redirecionamentos feitos por script dentro de uma página não são seguidos; a cadeia mostra só redirecionamentos HTTP.',
    'v.static': 'Estático', 'v.direct': 'Link estático', 'v.vendor-redirect': 'Redirecionamento de fornecedor', 'v.own-redirect': 'Seu próprio redirecionamento', 'v.unknown-redirect': 'Redirecionamento desconhecido', 'v.unknown': 'Não foi possível seguir',
    'vt.static': 'Estático: o código guarda o conteúdo diretamente. Nada no meio pode expirar.', 'vt.direct': 'Link estático: o código guarda este endereço diretamente, sem serviço de redirecionamento no meio. Ele funciona enquanto esse site existir.', 'vt.vendor-redirect': 'Redirecionamento de fornecedor: o código guarda um link curto no domínio de um fornecedor de QR Code, que encaminha os escaneamentos ao destino. Ele só funciona enquanto esse fornecedor continuar encaminhando.', 'vt.own-redirect': 'Seu próprio redirecionamento: o código guarda um link em um domínio que você disse ser seu, que encaminha para outro lugar. Ele funciona enquanto você mantiver esse redirecionamento.', 'vt.unknown-redirect': 'Redirecionamento desconhecido: o código guarda um link que encaminha os escaneamentos para outro site. Pode ser um fornecedor de QR Code com domínio personalizado ou fora da lista, ou um encurtador de links; só funciona enquanto esse serviço continuar encaminhando.', 'vt.unknown': 'Desconhecido: não foi possível seguir o link, então não se sabe para onde ele leva hoje.',
    'err.req.url': 'Digite um endereço de site, por exemplo https://example.com/menu.', 'err.req.text': 'Digite um texto.', 'err.req.ssid': 'Digite o nome da rede (SSID).', 'err.req.to': 'Digite o e-mail do destinatário.', 'err.req.phone': 'Digite um número de telefone.',
    'err.space': 'Um link não pode ter espaços; troque-os por %20.', 'err.url': 'Esse não é um endereço de site completo. Ele precisa começar com http:// ou https:// e ter um nome de domínio como example.com.', 'err.email': '"{0}" não é um endereço de e-mail.', 'err.phone': '"{0}" não é um número de telefone: use dígitos, com + e o código do país para ligações do exterior (por exemplo +5511912345678).',
    'err.pw': 'Uma rede protegida precisa de senha; escolha "Aberta" para uma rede sem senha.', 'err.name': 'Informe um nome ou sobrenome, ou uma empresa.', 'err.eap': 'Método EAP, identidade e fase 2 são só para redes WPA2-EAP (corporativas).',
    'err.latitude': 'A latitude deve ser um número decimal de -90 a 90, por exemplo -23.55 (com ponto).', 'err.longitude': 'A longitude deve ser um número decimal de -180 a 180, por exemplo -46.63 (com ponto).', 'err.altitude': 'A altitude é em metros, um número decimal (com ponto).', 'err.big': 'É coisa demais para um único QR Code com correção de erros {0}. Encurte o conteúdo ou escolha um nível mais baixo.',
    'img.open': 'Esse arquivo não é uma imagem que este navegador consiga abrir. Arquivos PDF não são lidos aqui; tire uma captura de tela do código.', 'img.none': 'Não foi possível ler nenhum QR Code nessa imagem. Tente uma captura de tela de frente, recortada no código, ou digite o que o código diz.', 'logo.open': 'Não foi possível abrir essa imagem.',
    'check.say': 'O código diz', 'check.vendor': 'Fornecedor: {0}', 'check.vendorEn': 'Texto da página do fornecedor, em inglês.', 'check.page': 'A página do fornecedor', 'check.read': ', lida em {0}', 'check.dated': ', datada de {0}', 'check.leads': 'Para onde leva hoje', 'check.http': 'HTTP {0}', 'check.noanswer': 'sem resposta',
    'check.repl': 'Um substituto estático para a reimpressão', 'check.replNote': 'Um código estático para a página aonde o código antigo leva hoje. Imprima pelo menos do tamanho do antigo e faça um escaneamento de teste antes da tiragem. Se quiser mudar o destino depois sem reimprimir, aponte-o para uma página em um domínio seu.', 'check.open': 'Abrir no gerador acima', 'check.pick': 'Escolha uma imagem do código ou digite o que ele diz.',
    'bulk.few': 'Informe uma linha de cabeçalho e pelo menos uma linha.', 'bulk.code1': 'código', 'bulk.codeN': 'códigos', 'bulk.row1': 'linha', 'bulk.rowN': 'linhas', 'bulk.refused': '{0} {1} recusadas, nunca cobradas', 'bulk.rate': '$0.002 por código, mínimo de 10 por trabalho', 'bulk.beyond': '; os códigos acima de 5.000 em um mês-calendário custam $0.0005', 'bulk.about': 'Cerca de {0} por este trabalho ({1}).', 'bulk.exact': 'O preço exato aparece antes de qualquer cobrança.',
    'bulk.unused': 'Não usadas: {0} (podem ser usadas nos nomes de arquivo como {1}).', 'bulk.rowErr': 'Linha {0}: {1}', 'bulk.more': 'e mais {0}, listadas no manifesto.', 'th.row': 'Linha', 'th.file': 'Arquivo', 'th.inside': 'Conteúdo', 'bulk.dl': 'Baixar {0}', 'bulk.done': ' {0} códigos, cada arquivo lido de volta{1}. Cobrado: {2}.', 'bulk.pages1': ', com {0} página de etiquetas', 'bulk.pagesN': ', com {0} páginas de etiquetas', 'bulk.codewidth': 'Os códigos são impressos com {0} mm de largura.',
    'bulk.signin': 'Entre na sua conta para gerar os arquivos; as linhas acima ficam nesta página.', 'bulk.signinLink': ' Entrar', 'bulk.isOpen': '{0} está aberto.',
  },
  hi: {
    'type.url': 'वेबसाइट लिंक', 'type.text': 'सादा टेक्स्ट', 'type.wifi': 'WiFi लॉगिन', 'type.vcard': 'संपर्क कार्ड (vCard 3.0)', 'type.email': 'ईमेल', 'type.sms': 'टेक्स्ट मैसेज (SMS)', 'type.phone': 'फोन कॉल', 'type.location': 'मैप लोकेशन',
    'f.url.url': 'वेब एड्रेस', 'ph.text': 'कोई भी टेक्स्ट', 'f.text.text': 'टेक्स्ट',
    'f.wifi.ssid': 'नेटवर्क का नाम (SSID)', 'f.wifi.password': 'पासवर्ड', 'f.wifi.security': 'सिक्योरिटी', 'f.wifi.hidden': 'छिपा हुआ नेटवर्क', 'f.wifi.eapMethod': 'EAP मेथड (एंटरप्राइज़)', 'f.wifi.identity': 'आइडेंटिटी (एंटरप्राइज़)', 'f.wifi.anonymousIdentity': 'अनाम आइडेंटिटी (एंटरप्राइज़)', 'f.wifi.phase2': 'फेज़ 2 (एंटरप्राइज़)',
    'f.vcard.firstName': 'पहला नाम', 'f.vcard.lastName': 'सरनेम', 'f.vcard.organization': 'कंपनी या संस्था', 'f.vcard.title': 'पद', 'f.vcard.phone': 'ऑफिस का फोन', 'f.vcard.mobile': 'मोबाइल', 'f.vcard.email': 'ईमेल', 'f.vcard.website': 'वेबसाइट', 'f.vcard.street': 'पता (गली, मोहल्ला)', 'f.vcard.city': 'शहर', 'f.vcard.region': 'राज्य', 'f.vcard.postalCode': 'पिन कोड', 'f.vcard.country': 'देश', 'f.vcard.note': 'नोट',
    'f.email.to': 'प्रति', 'f.email.subject': 'विषय', 'f.email.body': 'संदेश', 'f.email.cc': 'Cc', 'f.email.bcc': 'Bcc', 'f.sms.phone': 'फोन नंबर', 'f.sms.message': 'संदेश', 'f.phone.phone': 'फोन नंबर',
    'f.location.latitude': 'अक्षांश (latitude)', 'f.location.longitude': 'देशांतर (longitude)', 'f.location.altitude': 'ऊँचाई मीटर में (वैकल्पिक)',
    'sec.nopass': 'खुला (बिना पासवर्ड)', 'sec.WPA': 'WPA / WPA2 / WPA3 पर्सनल', 'sec.WPA2-EAP': 'WPA2 एंटरप्राइज़ (EAP)',
    'sheet.letter-30': 'US Letter, 1 x 2-5/8 इंच के 30 लेबल (Avery 5160 का लेबल साइज़)', 'sheet.letter-12-square': 'US Letter, 2 x 2 इंच के 12 चौकोर लेबल (Avery 22816 का लेबल साइज़)', 'sheet.a4-21': 'A4, 63.5 x 38.1 mm के 21 लेबल (3 कॉलम, 7 पंक्तियाँ)',
    readBack: 'वापस पढ़कर जाँचा: कोड में ठीक वही टेक्स्ट है जो नीचे दिखता है (वर्शन {0}, लेवल {1}, मास्क {2})।', inside: 'कोड के अंदर क्या है', kind: 'प्रकार', staticKind: 'स्टैटिक: {0}', size: 'साइज़', sizeVal: 'वर्शन {0}, {1} x {2}', ecc: 'एरर करेक्शन', eccVal: '{0}, लगभग {1}', mask: 'मास्क',
    raised: 'साइज़ बढ़ाए बिना लेवल {0} कर दिया गया: टेक्स्ट उसी वर्शन में आ जाता है।', fillIn: 'कोड देखने के लिए खाने भरें।', logoFail: 'इस लोगो के साथ कोड वापस पढ़ा नहीं जा रहा। एरर करेक्शन Q या H चुनें, या लोगो छोटा करें।',
    'n.https': 'शुरू में https:// जोड़ा गया है, क्योंकि फोन को पूरा एड्रेस चाहिए।', 'n.wpa3': 'WPA3 नेटवर्क T:WPA के रूप में लिखे जाते हैं, जो फोन पढ़ते हैं; सिर्फ WPA3 वाले फील्ड नहीं जोड़े जाते।', 'n.esc': 'खास चिह्न \\ ; , " : के आगे बैकस्लैश लगा दिया गया है।', 'n.vcard': 'vCard 3.0 (RFC 2426): टेक्स्ट में कॉमा, सेमीकोलन और बैकस्लैश के आगे बैकस्लैश लगता है।', 'n.pct': 'विषय और संदेश प्रतिशत-कोडिंग में हैं (स्पेस %20 बन जाता है)।', 'n.sms': 'SMSTO:नंबर:संदेश वह रूप है जो कैमरा ऐप पढ़ते हैं; इसके लिए कोई आधिकारिक मानक नहीं है।',
    'n.quiet': 'क्वाइट ज़ोन (खाली किनारा) {0} मॉड्यूल का है। QR कोड बनाने वाली कंपनी DENSO WAVE के अनुसार हर तरफ चार मॉड्यूल का खाली किनारा चाहिए। कोड कहीं लगाते समय उसके चारों ओर इतनी जगह खाली छोड़ें।', 'n.dark': 'कोड गहरे रंग पर हल्का है। कुछ पुराने स्कैनर ऐप सिर्फ हल्के रंग पर गहरे कोड पढ़ते हैं; इसे अपने लोगों के फोन से आज़माएँ।', 'n.contrast': 'रंगों का कॉन्ट्रास्ट अनुपात {0}:1 है। कम कॉन्ट्रास्ट कोड के स्कैन न होने की आम वजह है; हल्के बैकग्राउंड पर गहरे मॉड्यूल सबसे अच्छे पढ़े जाते हैं।',
    'n.module': 'हर मॉड्यूल {0} mm चौड़ा छपेगा ({1} x {1} मॉड्यूल, वर्शन {2})।', 'n.dots': '{0} dpi पर यह हर मॉड्यूल के लिए {1} प्रिंटर डॉट है। DENSO WAVE भरोसेमंद रीडिंग के लिए हर मॉड्यूल पर 4 या ज़्यादा डॉट सुझाता है; बड़ा छापें या बेहतर प्रिंटर इस्तेमाल करें।', 'n.logo': 'लोगो कोड का कुछ हिस्सा ढकता है, इसलिए कोड एरर करेक्शन पर टिकता है (लेवल {0} लगभग {1} कोडवर्ड वापस ला सकता है)। फाइल को वापस पढ़कर जाँचा गया कि वह अब भी डिकोड होती है।',
    'n.wifi': 'WiFi कोड तभी काम करना बंद करता है जब नेटवर्क का नाम या पासवर्ड बदल जाए।', 'n.contact': 'संपर्क कार्ड हमेशा काम करता है; वह तभी पुराना पड़ता है जब जानकारी बदल जाए।', 'n.stored': 'सामग्री कोड के अंदर ही रखी है।', 'n.hops': '{0} रीडायरेक्ट के बाद रुक गया, कोई पेज नहीं मिला।', 'n.stopped': '{0} पर रुक गया: {1}',
    'n.vendorChain': 'लिंक ऐसे डोमेन पर है जो वेंडर सूची में नहीं है, पर किसी वेंडर के डोमेन से होकर आगे जाता है। वेंडरों के कस्टम डोमेन अक्सर इसी तरह काम करते हैं।', 'n.nopolicy': 'हमने इस वेंडर की कोई प्रकाशित नीति नहीं पढ़ी है कि प्लान खत्म होने पर कोड का क्या होता है; वेंडर से पूछें या अपना अकाउंट देखें।', 'n.endsvendor': 'यह श्रृंखला वेंडर के अपने डोमेन या वेबसाइट पर खत्म होती है, किसी गंतव्य पेज पर नहीं: हो सकता है कोड पहले से रुका हुआ हो या वेंडर के पेज की ओर जा रहा हो।',
    'n.http': 'आखिरी पेज ने HTTP {0} दिया, इसलिए हो सकता है कोड स्कैन करने वालों के लिए अभी ही फेल हो रहा हो।', 'n.dies': 'आज चलने वाला लिंक भी बंद हो जाता है अगर उसकी वेबसाइट या डोमेन की अवधि खत्म हो जाए।', 'n.script': 'पेज के अंदर स्क्रिप्ट से होने वाले रीडायरेक्ट नहीं फॉलो किए जाते; श्रृंखला सिर्फ HTTP रीडायरेक्ट दिखाती है।',
    'v.static': 'स्टैटिक', 'v.direct': 'स्टैटिक लिंक', 'v.vendor-redirect': 'वेंडर रीडायरेक्ट', 'v.own-redirect': 'आपका अपना रीडायरेक्ट', 'v.unknown-redirect': 'अज्ञात रीडायरेक्ट', 'v.unknown': 'फॉलो नहीं हो सका',
    'vt.static': 'स्टैटिक: कोड अपनी सामग्री सीधे अपने अंदर रखता है। बीच में कुछ नहीं है जो एक्सपायर हो सके।', 'vt.direct': 'स्टैटिक लिंक: कोड यह वेब एड्रेस सीधे रखता है, बीच में कोई रीडायरेक्ट सेवा नहीं है। यह तब तक चलेगा जब तक वह वेबसाइट चलती है।', 'vt.vendor-redirect': 'वेंडर रीडायरेक्ट: कोड में किसी QR कोड वेंडर के डोमेन का छोटा लिंक है, जो स्कैन को गंतव्य तक भेजता है। यह तभी तक चलता है जब तक वह वेंडर इसे आगे भेजता रहे।', 'vt.own-redirect': 'आपका अपना रीडायरेक्ट: कोड में आपके बताए अपने डोमेन का एक लिंक है, जो आगे कहीं और भेजता है। यह तब तक चलता है जब तक आप वह रीडायरेक्ट चालू रखें।', 'vt.unknown-redirect': 'अज्ञात रीडायरेक्ट: कोड में ऐसा लिंक है जो स्कैन को किसी दूसरी साइट पर भेजता है। यह कस्टम या सूची से बाहर के डोमेन वाला QR कोड वेंडर हो सकता है, या लिंक शॉर्टनर; यह तभी तक चलता है जब तक वह सेवा इसे आगे भेजती रहे।', 'vt.unknown': 'अज्ञात: लिंक को फॉलो नहीं किया जा सका, इसलिए पता नहीं कि वह आज कहाँ जाता है।',
    'err.req.url': 'वेब एड्रेस लिखें, जैसे https://example.com/menu।', 'err.req.text': 'टेक्स्ट लिखें।', 'err.req.ssid': 'नेटवर्क का नाम (SSID) लिखें।', 'err.req.to': 'पाने वाले का ईमेल एड्रेस लिखें।', 'err.req.phone': 'फोन नंबर लिखें।',
    'err.space': 'लिंक में स्पेस नहीं हो सकते; उन्हें %20 से बदलें।', 'err.url': 'यह पूरा वेब एड्रेस नहीं है। यह http:// या https:// से शुरू होना चाहिए और उसमें example.com जैसा डोमेन नाम होना चाहिए।', 'err.email': '"{0}" ईमेल एड्रेस नहीं है।', 'err.phone': '"{0}" फोन नंबर नहीं है: अंक लिखें, और विदेश से कॉल के लिए + और देश कोड के साथ (जैसे +919876543210)।',
    'err.pw': 'सुरक्षित नेटवर्क के लिए पासवर्ड चाहिए; बिना पासवर्ड वाले नेटवर्क के लिए "खुला" चुनें।', 'err.name': 'पहला नाम या सरनेम, या कोई संस्था लिखें।', 'err.eap': 'EAP मेथड, आइडेंटिटी और फेज़ 2 सिर्फ WPA2-EAP (एंटरप्राइज़) नेटवर्क के लिए हैं।',
    'err.latitude': 'अक्षांश -90 से 90 के बीच दशमलव संख्या होनी चाहिए, जैसे 28.6139 (बिंदु के साथ)।', 'err.longitude': 'देशांतर -180 से 180 के बीच दशमलव संख्या होनी चाहिए, जैसे 77.2090 (बिंदु के साथ)।', 'err.altitude': 'ऊँचाई मीटर में, दशमलव संख्या के रूप में लिखें (बिंदु के साथ)।', 'err.big': 'एरर करेक्शन {0} पर यह एक QR कोड में नहीं समाता। सामग्री छोटी करें या कम लेवल चुनें।',
    'img.open': 'यह फाइल ऐसी इमेज नहीं है जिसे यह ब्राउज़र खोल सके। यहाँ PDF फाइलें नहीं पढ़ी जातीं; कोड का स्क्रीनशॉट लें।', 'img.none': 'इस इमेज से कोई QR कोड नहीं पढ़ा जा सका। कोड पर क्रॉप किया हुआ सीधा स्क्रीनशॉट आज़माएँ, या कोड में जो लिखा है वह टाइप करें।', 'logo.open': 'यह इमेज खोली नहीं जा सकी।',
    'check.say': 'कोड में यह लिखा है', 'check.vendor': 'वेंडर: {0}', 'check.vendorEn': 'वेंडर के पेज की मूल भाषा (अंग्रेज़ी) में लिखा हुआ।', 'check.page': 'वेंडर का पेज', 'check.read': ', {0} को पढ़ा गया', 'check.dated': ', पेज की तारीख {0}', 'check.leads': 'आज यह कहाँ पहुँचता है', 'check.http': 'HTTP {0}', 'check.noanswer': 'कोई जवाब नहीं',
    'check.repl': 'दोबारा छपाई के लिए स्टैटिक विकल्प', 'check.replNote': 'उस पेज के लिए स्टैटिक कोड जहाँ पुराना कोड आज पहुँचता है। इसे कम से कम पुराने जितना बड़ा छापें और पूरी छपाई से पहले स्कैन करके देख लें। अगर आप बाद में दोबारा छापे बिना ठिकाना बदलना चाहते हैं, तो इसे अपने डोमेन के किसी पेज की ओर रखें।', 'check.open': 'ऊपर के जनरेटर में खोलें', 'check.pick': 'कोड की इमेज चुनें, या उसमें जो लिखा है वह टाइप करें।',
    'bulk.few': 'एक हेडिंग पंक्ति और कम से कम एक पंक्ति दें।', 'bulk.code1': 'कोड', 'bulk.codeN': 'कोड', 'bulk.row1': 'पंक्ति', 'bulk.rowN': 'पंक्तियाँ', 'bulk.refused': '{0} {1} नामंज़ूर, इनका शुल्क कभी नहीं लगता', 'bulk.rate': '$0.002 प्रति कोड, एक काम में कम से कम 10', 'bulk.beyond': '; एक कैलेंडर महीने में 5,000 से ऊपर के कोड $0.0005 के', 'bulk.about': 'इस काम का लगभग {0} ({1})।', 'bulk.exact': 'कुछ भी चार्ज होने से पहले सही कीमत दिखाई जाती है।',
    'bulk.unused': 'इस्तेमाल नहीं हुए: {0} (फाइल नामों में {1} के रूप में इस्तेमाल हो सकते हैं)।', 'bulk.rowErr': 'पंक्ति {0}: {1}', 'bulk.more': 'और {0} और, मैनिफेस्ट में सूचीबद्ध।', 'th.row': 'पंक्ति', 'th.file': 'फाइल', 'th.inside': 'अंदर क्या है', 'bulk.dl': '{0} डाउनलोड करें', 'bulk.done': ' {0} कोड, हर फाइल वापस पढ़कर जाँची गई{1}। चार्ज: {2}।', 'bulk.pages1': ', {0} लेबल पेज के साथ', 'bulk.pagesN': ', {0} लेबल पेज के साथ', 'bulk.codewidth': 'कोड {0} mm चौड़े छपते हैं।',
    'bulk.signin': 'फाइलें बनाने के लिए साइन इन करें; ऊपर की पंक्तियाँ इसी पेज पर रहती हैं।', 'bulk.signinLink': ' साइन इन', 'bulk.isOpen': '{0} खुली है।',
  },
  ja: {
    'type.url': 'ウェブサイトのリンク', 'type.text': 'テキスト', 'type.wifi': 'Wi-Fi接続', 'type.vcard': '連絡先カード（vCard 3.0）', 'type.email': 'メール', 'type.sms': 'ショートメッセージ（SMS）', 'type.phone': '電話', 'type.location': '地図の位置',
    'f.url.url': 'URL', 'ph.text': '任意のテキスト', 'f.text.text': 'テキスト',
    'f.wifi.ssid': 'ネットワーク名（SSID）', 'f.wifi.password': 'パスワード', 'f.wifi.security': 'セキュリティ', 'f.wifi.hidden': 'ステルスネットワーク（SSIDを隠している）', 'f.wifi.eapMethod': 'EAP方式（企業向け）', 'f.wifi.identity': 'ID（企業向け）', 'f.wifi.anonymousIdentity': '匿名ID（企業向け）', 'f.wifi.phase2': 'フェーズ2（企業向け）',
    'f.vcard.firstName': '名', 'f.vcard.lastName': '姓', 'f.vcard.organization': '会社・組織名', 'f.vcard.title': '役職', 'f.vcard.phone': '勤務先の電話', 'f.vcard.mobile': '携帯電話', 'f.vcard.email': 'メールアドレス', 'f.vcard.website': 'ウェブサイト', 'f.vcard.street': '番地・建物名', 'f.vcard.city': '市区町村', 'f.vcard.region': '都道府県', 'f.vcard.postalCode': '郵便番号', 'f.vcard.country': '国', 'f.vcard.note': 'メモ',
    'f.email.to': '宛先', 'f.email.subject': '件名', 'f.email.body': '本文', 'f.email.cc': 'Cc', 'f.email.bcc': 'Bcc', 'f.sms.phone': '電話番号', 'f.sms.message': 'メッセージ', 'f.phone.phone': '電話番号',
    'f.location.latitude': '緯度', 'f.location.longitude': '経度', 'f.location.altitude': '標高（メートル、任意）',
    'sec.nopass': 'パスワードなし（オープン）', 'sec.WPA': 'WPA / WPA2 / WPA3 パーソナル', 'sec.WPA2-EAP': 'WPA2 エンタープライズ（EAP）',
    'sheet.letter-30': 'USレター、1 x 2-5/8インチのラベル30面（Avery 5160のラベルサイズ）', 'sheet.letter-12-square': 'USレター、2 x 2インチの正方形ラベル12面（Avery 22816のラベルサイズ）', 'sheet.a4-21': 'A4、63.5 x 38.1 mmのラベル21面（横3列、縦7行）',
    readBack: '読み取り確認済み：コードの内容は下のテキストと完全に一致します（バージョン{0}、レベル{1}、マスク{2}）。', inside: 'コードの中身', kind: '種類', staticKind: 'スタティック：{0}', size: 'サイズ', sizeVal: 'バージョン{0}、{1} x {2}', ecc: '誤り訂正', eccVal: '{0}、約{1}', mask: 'マスク',
    raised: 'サイズを変えずにレベル{0}に上げました。同じバージョンに収まります。', fillIn: '入力欄を埋めるとコードが表示されます。', logoFail: 'このロゴでは、コードを読み取り確認できません。誤り訂正をQまたはHにするか、ロゴを小さくしてください。',
    'n.https': '携帯電話は完全なアドレスを必要とするため、先頭にhttps://を追加しました。', 'n.wpa3': 'WPA3のネットワークは、スマートフォンが読み取る形式のT:WPAとして書きます。WPA3専用の項目は追加されません。', 'n.esc': '特殊文字 \\ ; , " : の前にバックスラッシュを付けました。', 'n.vcard': 'vCard 3.0(RFC 2426):テキスト中のカンマ、セミコロン、バックスラッシュの前にはバックスラッシュを付けます。', 'n.pct': '件名と本文はパーセントエンコードされます（スペースは%20になります）。', 'n.sms': 'SMSTO:番号:メッセージは、カメラアプリが読み取る形式です。公式の標準はありません。',
    'n.quiet': 'クワイエットゾーン（余白）は{0}モジュールです。QRコードの考案元であるDENSO WAVEは、四方に4モジュール分の余白が必要だとしています。配置するときは、その分の余白を空けてください。', 'n.dark': 'コードが暗い背景に明るい色です。古いスキャナーアプリの中には、明るい背景に暗いコードしか読めないものがあります。想定する利用者のスマートフォンで試してください。', 'n.contrast': '色のコントラスト比は{0}:1です。コントラストが低いことは、コードが読み取れない原因としてよくあります。明るい背景に暗いモジュールが最も読み取りやすくなります。',
    'n.module': '1モジュールの印刷幅は{0} mmです（{1} x {1}モジュール、バージョン{2}）。', 'n.dots': '{0} dpiでは、1モジュールあたり{1}ドットです。DENSO WAVEは、安定して読み取るには1モジュールあたり4ドット以上を推奨しています。大きく印刷するか、より高精細なプリンターを使ってください。', 'n.logo': 'ロゴがコードの一部を覆うため、誤り訂正に頼ることになります（レベル{0}でコード語の約{1}を復元できます）。ファイルを読み取り直して、まだ読み取れることを確認しました。',
    'n.wifi': 'Wi-Fiのコードが使えなくなるのは、ネットワーク名かパスワードが変わったときだけです。', 'n.contact': '連絡先カードはずっと使えます。情報が変わったときだけ古くなります。', 'n.stored': '内容はコード自体に入っています。', 'n.hops': 'ページに到達しないまま、{0}回の転送で停止しました。', 'n.stopped': '{0}で停止しました：{1}',
    'n.vendorChain': 'このリンクはベンダー一覧にないドメインにありますが、ベンダーのドメインを経由して転送されます。ベンダーの独自ドメインは、よくこのように動きます。', 'n.nopolicy': 'このベンダーが、プラン終了後のコードをどう扱うかについて公開している方針は確認できていません。ベンダーに問い合わせるか、アカウントを確認してください。', 'n.endsvendor': '転送がベンダー自身のドメインまたはウェブサイトで終わっていて、転送先のページに着いていません。コードがすでに停止しているか、ベンダーのページを指している可能性があります。',
    'n.http': '最後のページはHTTP {0}を返しました。スキャンする人にとって、コードはすでに機能していない可能性があります。', 'n.dies': '今は使えるリンクでも、そのウェブサイトやドメインの契約が切れれば使えなくなります。', 'n.script': 'ページ内のスクリプトによる転送は追跡しません。表示される経路はHTTPの転送だけです。',
    'v.static': 'スタティック', 'v.direct': 'スタティックなリンク', 'v.vendor-redirect': 'ベンダー経由の転送', 'v.own-redirect': '自分で管理している転送', 'v.unknown-redirect': '不明な転送', 'v.unknown': '追跡できませんでした',
    'vt.static': 'スタティック：コードが内容を直接持っています。間に入るものがないので、期限切れになりません。', 'vt.direct': 'スタティックなリンク：コードはこのURLを直接持っており、間に転送サービスはありません。そのウェブサイトがある限り使えます。', 'vt.vendor-redirect': 'ベンダー経由の転送：コードはQRコードベンダーのドメインの短縮リンクを持ち、ベンダーがスキャンを転送先に転送します。そのベンダーが転送を続けている間だけ使えます。', 'vt.own-redirect': '自分で管理している転送：コードは、あなたが自分のものとして指定したドメインのリンクを持ち、そこから別の場所に転送されます。その転送を維持している間は使えます。', 'vt.unknown-redirect': '不明な転送：コードは、スキャンを別のサイトに転送するリンクを持っています。独自ドメインや一覧にないドメインのQRコードベンダー、またはリンク短縮サービスの可能性があります。そのサービスが転送を続けている間だけ使えます。', 'vt.unknown': '不明：リンクを追跡できなかったため、現在どこにつながっているかは分かりません。',
    'err.req.url': 'URLを入力してください（例：https://example.com/menu）。', 'err.req.text': 'テキストを入力してください。', 'err.req.ssid': 'ネットワーク名（SSID）を入力してください。', 'err.req.to': '宛先のメールアドレスを入力してください。', 'err.req.phone': '電話番号を入力してください。',
    'err.space': 'リンクにスペースは入れられません。%20に置き換えてください。', 'err.url': '完全なURLではありません。http://またはhttps://で始まり、example.comのようなドメイン名が必要です。', 'err.email': '「{0}」はメールアドレスではありません。', 'err.phone': '「{0}」は電話番号ではありません。数字を使い、海外からの発信用には+と国番号を付けてください（例：+81312345678）。',
    'err.pw': 'セキュリティのあるネットワークにはパスワードが必要です。パスワードなしのネットワークは「パスワードなし（オープン）」を選んでください。', 'err.name': '姓か名、または会社・組織名を入力してください。', 'err.eap': 'EAP方式、ID、フェーズ2は、WPA2-EAP（企業向け）のネットワークでのみ使います。',
    'err.latitude': '緯度は-90から90までの小数で入力してください（例：35.6812）。小数点はピリオドです。', 'err.longitude': '経度は-180から180までの小数で入力してください（例：139.7671）。小数点はピリオドです。', 'err.altitude': '標高はメートル単位の小数で入力してください。小数点はピリオドです。', 'err.big': '誤り訂正{0}では、1つのQRコードに収まりません。内容を短くするか、低いレベルを選んでください。',
    'img.open': 'このブラウザーで開ける画像ではありません。PDFファイルはここでは読み取れません。コードのスクリーンショットを撮ってください。', 'img.none': 'この画像からQRコードを読み取れませんでした。コードの部分だけを切り抜いた正面からのスクリーンショットを試すか、コードの内容を入力してください。', 'logo.open': 'この画像を開けませんでした。',
    'check.say': 'コードの内容', 'check.vendor': 'ベンダー：{0}', 'check.vendorEn': 'ベンダーのページの文言（英語）です。', 'check.page': 'ベンダーのページ', 'check.read': '、確認日{0}', 'check.dated': '、ページの日付{0}', 'check.leads': '現在の転送先', 'check.http': 'HTTP {0}', 'check.noanswer': '応答なし',
    'check.repl': '再印刷用のスタティックな代替コード', 'check.replNote': '古いコードが現在つながっているページ用のスタティックコードです。古いコードと同じかそれ以上の大きさで印刷し、本番の印刷前に試しにスキャンしてください。再印刷せずに後から転送先を変えたい場合は、自分のドメインのページを指すようにしてください。', 'check.open': '上の作成フォームで開く', 'check.pick': 'コードの画像を選ぶか、コードの内容を入力してください。',
    'bulk.few': '見出し行と、少なくとも1行のデータを入れてください。', 'bulk.code1': '個のコード', 'bulk.codeN': '個のコード', 'bulk.row1': '行', 'bulk.rowN': '行', 'bulk.refused': '{0}{1}を除外（請求なし）', 'bulk.rate': '1コードあたり$0.002、1回の依頼につき最低10コード', 'bulk.beyond': '。暦月で5,000を超えるコードは$0.0005', 'bulk.about': 'この依頼で約{0}です（{1}）。', 'bulk.exact': '正確な料金は、請求の前に表示されます。',
    'bulk.unused': '使われなかった列：{0}（ファイル名では{1}として使えます）。', 'bulk.rowErr': '{0}行目：{1}', 'bulk.more': 'ほか{0}件はマニフェストに一覧があります。', 'th.row': '行', 'th.file': 'ファイル', 'th.inside': '中身', 'bulk.dl': '{0}をダウンロード', 'bulk.done': ' {0}個のコード、すべてのファイルを読み取り確認済み{1}。請求額：{2}。', 'bulk.pages1': '、ラベル{0}ページ付き', 'bulk.pagesN': '、ラベル{0}ページ付き', 'bulk.codewidth': 'コードの印刷幅は{0} mmです。',
    'bulk.signin': 'ファイルを作成するにはログインしてください。上の行はこのページに残ります。', 'bulk.signinLink': ' ログイン', 'bulk.isOpen': '{0}を開きました。',
  },
};
const fmt = (s, args) => s.replace(/\{(\d+)\}/g, (m, i) => (args[i] === undefined ? '' : String(args[i])));
// t(key, english, ...args): the page's language when it has the key, otherwise the English as written.
const t = (key, en, ...args) => {
  const s = (TX[LANG] ?? {})[key];
  return s === undefined ? en : fmt(s, args);
};
const nf = (n) => n.toLocaleString(LANG === 'en' ? 'en-US' : (NUM_LOCALE[LANG] ?? 'en-US'));
const dec = (s) => (COMMA_DECIMAL ? String(s).replace('.', ',') : String(s));
// A date written 2026-11-02 in the page's order.
const dateOf = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m || LANG === 'en') return iso;
  const [, y, mo, d] = m;
  const day = Number(d);
  const mon = MONTHS[LANG]?.[Number(mo) - 1];
  if (LANG === 'ja') return `${y}年${Number(mo)}月${day}日`;
  if (!mon) return iso;
  if (LANG === 'de') return `${day}. ${mon} ${y}`;
  if (LANG === 'fr') return `${day === 1 ? '1er' : day} ${mon} ${y}`;
  if (LANG === 'hi') return `${day} ${mon} ${y}`;
  return `${day} de ${mon} de ${y}`; // es, pt
};

// What the engine and the server say in English (core.js, check.js), put into the page's language
// when it is one of these, with the numbers they carry. Anything not matched stays as the engine wrote it.
const NOTES = [
  ['n.https', /^https:\/\/ was added/],
  ['n.wpa3', /^WPA3 networks are written/],
  ['n.esc', /^Special characters /],
  ['n.vcard', /^vCard 3\.0 \(RFC 2426\)/],
  ['n.pct', /^Subject and body are percent-encoded/],
  ['n.sms', /^SMSTO:number:message/],
  ['n.quiet', /^The quiet zone is (\d+) modules/],
  ['n.dark', /^The code is light on dark/],
  ['n.contrast', /^The colours have a contrast ratio of ([\d.]+):1/],
  ['n.module', /^Each module prints ([\d.]+) mm wide \((\d+) x \d+ modules, version (\d+)\)/],
  ['n.dots', /^At (\d+) dpi that is ([\d.]+) printer dots/],
  ['n.logo', /^A logo covers part of the code.*\(level (\w) restores about (\d+%)/],
  ['n.wifi', /^A WiFi code stops working only/],
  ['n.contact', /^A contact card works for good/],
  ['n.stored', /^The content is stored in the code itself/],
  ['n.hops', /^Stopped after (\d+) redirects/],
  ['n.stopped', /^Stopped at (\S+): (.*)$/],
  ['n.vendorChain', /^The link is on a domain that is not on the vendor list/],
  ['n.nopolicy', /^We have not read a published policy/],
  ['n.endsvendor', /^The chain ends on the vendor/],
  ['n.http', /^The last page answered with HTTP (\d+)/],
  ['n.dies', /^A link that works today still dies/],
  ['n.script', /^Redirects made by a script/],
];
const DECIMAL_NOTES = new Set(['n.contrast', 'n.module', 'n.dots']);
function say(text) {
  if (LANG === 'en' || !TX[LANG]) return text;
  for (const [key, re] of NOTES) {
    const m = re.exec(text);
    if (!m || TX[LANG][key] === undefined) continue;
    return fmt(TX[LANG][key], m.slice(1).map((x) => (DECIMAL_NOTES.has(key) ? dec(x) : x)));
  }
  return text;
}
// An engine error for a field, in the page's language where the page knows it.
function errorText(e) {
  if (LANG === 'en' || !TX[LANG]) return e.message;
  const m = e.message;
  const REQUIRED = { 'A link': 'url', Text: 'text', 'The network name (SSID)': 'ssid', 'The address to write to': 'to', 'A phone number': 'phone' };
  const f = e.field ?? REQUIRED[m.replace(/ is required\.$/, '')];
  const get = (k, ...a) => (TX[LANG][k] === undefined ? null : fmt(TX[LANG][k], a));
  let r = null;
  if (/ is required\.$/.test(m)) r = get(`err.req.${f}`);
  else if (/cannot contain spaces/.test(m)) r = get('err.space');
  else if (f === 'url' || /is not a web address|must start with http|is not a full domain/.test(m)) r = get('err.url');
  else if (/is not an email address/.test(m)) r = get('err.email', (/"([^"]*)"/.exec(m) ?? [])[1] ?? '');
  else if (/is not a phone number/.test(m)) r = get('err.phone', (/^"([^"]*)"/.exec(m) ?? [])[1] ?? '');
  else if (/^A password is required/.test(m)) r = get('err.pw');
  else if (/^Give a first or last name/.test(m)) r = get('err.name');
  else if (/^EAP method, identity/.test(m)) r = get('err.eap');
  else if (f === 'latitude' || f === 'longitude' || f === 'altitude') r = get(`err.${f}`);
  else if (/^Too much to fit/.test(m)) r = get('err.big', (/error correction (\w)/.exec(m) ?? [])[1] ?? '');
  return r ?? m;
}

// ---------- the fields of each type ----------

const FIELD_UI = {
  url: [['url', 'Web address', 'https://example.com/menu']],
  text: [['text', 'Text', 'Any text', 'textarea']],
  wifi: [['ssid', 'Network name (SSID)', 'Cafe Guest'], ['password', 'Password', ''], ['security', 'Security', '', 'select', WIFI_SECURITY.map((s) => [s, t(`sec.${s}`, s === 'nopass' ? 'Open (no password)' : s === 'WPA' ? 'WPA / WPA2 / WPA3 personal' : s === 'WPA2-EAP' ? 'WPA2 enterprise (EAP)' : s)])], ['hidden', 'Hidden network', '', 'checkbox'],
    ['eapMethod', 'EAP method (enterprise)', 'PEAP'], ['identity', 'Identity (enterprise)', ''], ['anonymousIdentity', 'Anonymous identity (enterprise)', ''], ['phase2', 'Phase 2 (enterprise)', 'MSCHAPV2']],
  vcard: [['firstName', 'First name', 'Jane'], ['lastName', 'Last name', 'Rivera'], ['organization', 'Organization', ''], ['title', 'Job title', ''], ['phone', 'Work phone', '+12125551212'], ['mobile', 'Mobile', ''], ['email', 'Email', ''], ['website', 'Website', ''], ['street', 'Street', ''], ['city', 'City', ''], ['region', 'State or region', ''], ['postalCode', 'ZIP or postal code', ''], ['country', 'Country', ''], ['note', 'Note', '']],
  email: [['to', 'To', 'hello@example.com'], ['subject', 'Subject', ''], ['body', 'Message', '', 'textarea'], ['cc', 'Cc', ''], ['bcc', 'Bcc', '']],
  sms: [['phone', 'Phone number', '+12125551212'], ['message', 'Message', '', 'textarea']],
  phone: [['phone', 'Phone number', '+12125551212']],
  location: [['latitude', 'Latitude', '40.71872'], ['longitude', 'Longitude', '-73.98905'], ['altitude', 'Altitude in meters (optional)', '']],
};
const ENTERPRISE = ['eapMethod', 'identity', 'anonymousIdentity', 'phase2'];
const START = { url: 'https://example.com/menu', ssid: 'Cafe Guest', password: 'tea;time42', security: 'WPA' };

function drawFields() {
  const box = $('qr-fields');
  box.textContent = '';
  for (const [name, label0, placeholder0, kind, options] of FIELD_UI[$('qr-type').value]) {
    const id = `qr-f-${name}`;
    const label = t(`f.${$('qr-type').value}.${name}`, label0);
    const placeholder = name === 'text' ? t('ph.text', placeholder0) : placeholder0;
    let control;
    if (kind === 'textarea') control = h('textarea', { id, rows: '3', placeholder });
    else if (kind === 'select') control = h('select', { id }, options.map(([v, t]) => h('option', { value: v }, t)));
    else if (kind === 'checkbox') {
      box.appendChild(h('label', { class: 'check', 'data-field': name }, [h('input', { type: 'checkbox', id }), h('span', null, label)]));
      continue;
    } else control = h('input', { type: 'text', id, placeholder, spellcheck: 'false' });
    if (START[name] !== undefined) control.value = START[name];
    box.appendChild(h('div', { class: 'field', 'data-field': name }, [h('label', { for: id }, label), control, h('p', { class: 'field-error', id: `${id}-err` })]));
  }
  showEnterprise();
}

function showEnterprise() {
  const sec = $('qr-f-security');
  for (const f of ENTERPRISE) {
    const el = document.querySelector(`[data-field="${f}"]`);
    if (el) el.hidden = !sec || sec.value !== 'WPA2-EAP';
  }
}

function fieldValues() {
  const out = {};
  for (const [name, , , kind] of FIELD_UI[$('qr-type').value]) {
    const el = $(`qr-f-${name}`);
    if (!el || el.closest('[hidden]')) continue;
    if (kind === 'checkbox') { if (el.checked) out[name] = true; } else if (el.value !== '') out[name] = el.value;
  }
  return out;
}

// ---------- the logo ----------

let logo = null; // { rgba, width, height, dataUrl }

async function readLogo(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(t('logo.open', 'That image could not be opened.')));
      i.src = url;
    });
    const max = 256;
    const k = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max));
    const w = Math.max(1, Math.round((img.naturalWidth || max) * k));
    const ht = Math.max(1, Math.round((img.naturalHeight || max) * k));
    const c = h('canvas', { width: String(w), height: String(ht) });
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, w, ht);
    return { rgba: g.getImageData(0, 0, w, ht).data, width: w, height: ht, dataUrl: c.toDataURL('image/png') };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- making one code ----------

const typeName = (type) => t(`type.${type}`, TYPE_NAMES[type]);
const num = (id, fallback) => { const n = Number(String($(id).value).trim()); return Number.isFinite(n) && n > 0 ? n : fallback; };

function designNow() {
  return designOf({
    fg: $('qr-fg').value,
    bg: $('qr-transparent').checked ? 'transparent' : $('qr-bg').value,
    margin: Math.max(0, Math.min(20, Math.round(num('qr-margin', 0) || 0))),
    logo,
    logoShare: Number($('qr-logo-share').value) / 100,
  });
}

let current = null;

function make() {
  for (const el of document.querySelectorAll('#qr-fields .field-error')) el.textContent = '';
  $('qr-error').textContent = '';
  const out = $('qr-out');
  try {
    const type = $('qr-type').value;
    const { payload, notes } = buildPayload(type, fieldValues());
    const qr = encodeText(payload, { ecc: $('qr-ecc').value });
    const design = designNow();
    const svg = svgOf(qr, design);
    // The read-back: the pixels the PNG and PDF are drawn from, and the SVG's own modules.
    const raster = rasterOf(qr, design, 4);
    const back = verifyPixels(raster.rgba, raster.width, raster.height, payload);
    verifySvg(svg, payload);
    const widthMm = num('qr-width', 30);
    const moduleMm = widthMm / (qr.size + 2 * design.margin);
    current = { type, payload, qr, design, widthMm };
    out.textContent = '';
    const preview = h('div', { class: 'qr-preview' });
    preview.innerHTML = svg; // svgOf writes only numbers, colours and the logo's data URL
    out.appendChild(preview);
    out.appendChild(h('p', { class: 'qr-verified' }, t('readBack', `Read back: it says exactly the text below (version ${back.version}, level ${back.ecc}, mask ${back.mask}).`, back.version, back.ecc, back.mask)));
    out.appendChild(h('div', { class: 'qr-downloads' }, [
      h('button', { class: 'btn', type: 'button', id: 'qr-dl-png' }, 'PNG'),
      h('button', { class: 'btn btn-ghost', type: 'button', id: 'qr-dl-svg' }, 'SVG'),
      h('button', { class: 'btn btn-ghost', type: 'button', id: 'qr-dl-pdf' }, `PDF, ${widthMm} mm`),
    ]));
    out.appendChild(h('p', { class: 'qr-heading' }, t('inside', 'Inside the code')));
    out.appendChild(h('pre', { class: 'qr-payload' }, payload));
    out.appendChild(h('dl', { class: 'qr-facts' }, [
      h('div', null, [h('dt', null, t('kind', 'Kind')), h('dd', null, t('staticKind', `Static: ${TYPE_NAMES[type]}`, typeName(type)))]),
      h('div', null, [h('dt', null, t('size', 'Size')), h('dd', null, t('sizeVal', `Version ${qr.version}, ${qr.size} x ${qr.size}`, qr.version, qr.size, qr.size))]),
      h('div', null, [h('dt', null, t('ecc', 'Error correction')), h('dd', null, t('eccVal', `${qr.ecc}, about ${ECC_RESTORE[qr.ecc]}`, qr.ecc, ECC_RESTORE[qr.ecc]))]),
      h('div', null, [h('dt', null, t('mask', 'Mask')), h('dd', null, String(qr.mask))]),
    ]));
    if (qr.ecc !== $('qr-ecc').value) out.appendChild(h('p', { class: 'qr-aside' }, t('raised', `Raised to level ${qr.ecc} at no cost in size: the text fits at the same version.`, qr.ecc)));
    const checks = [...notes.map((t) => ({ level: 'info', text: t })), ...printChecks(qr, design, { moduleMm, printerDpi: num('qr-dpi', null) })];
    if (checks.length) out.appendChild(h('ul', { class: 'qr-checks' }, checks.map((c) => h('li', { class: c.level === 'warn' ? 'warn' : '' }, say(c.text)))));
    $('qr-dl-png').addEventListener('click', downloadPng);
    $('qr-dl-svg').addEventListener('click', () => save(new Blob([svgOf(qr, design, { px: 1000 })], { type: 'image/svg+xml' }), 'qr-code.svg'));
    $('qr-dl-pdf').addEventListener('click', () => save(new Blob([pdfOf(qr, design, { widthMm })], { type: 'application/pdf' }), 'qr-code.pdf'));
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    current = null;
    const err = e.field && $(`qr-f-${e.field}-err`);
    if (err) err.textContent = errorText(e); else $('qr-error').textContent = errorText(e);
    out.textContent = '';
    out.appendChild(h('p', { class: 'muted' }, e.message.includes('read back') || e.message.includes('No readable')
      ? t('logoFail', 'With this logo the code no longer reads back. Choose error correction Q or H, or make the logo smaller.')
      : t('fillIn', 'Fill in the fields to see the code.')));
  }
}

// zlib with the browser's own compressor, for a smaller PNG.
async function zlib(bytes) {
  if (typeof CompressionStream !== 'function') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function downloadPng() {
  if (!current) return;
  const { qr, design } = current;
  const total = qr.size + 2 * design.margin;
  const scale = Math.max(1, Math.floor(Math.min(4000, num('qr-px', 1000)) / total));
  const img = rasterOf(qr, design, scale);
  verifyPixels(img.rgba, img.width, img.height, current.payload);
  const z = await zlib(pngScanlines(img).raw);
  const png = pngOf(img, { dpi: Math.round(num('qr-dpi', 300)), ...(z ? { deflate: () => z } : {}) });
  save(new Blob([png], { type: 'image/png' }), 'qr-code.png');
}

function save(blob, name) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------- reading an image of a code ----------

async function imagePixels(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(t('img.open', 'That file is not an image this browser can open. PDF files are not read here; take a screenshot of the code instead.')));
      i.src = url;
    });
    const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k);
    const ht = Math.round(img.naturalHeight * k);
    const c = h('canvas', { width: String(w), height: String(ht) });
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, ht);
    g.drawImage(img, 0, 0, w, ht);
    return { canvas: c, data: g.getImageData(0, 0, w, ht).data, width: w, height: ht };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readCode(file) {
  const px = await imagePixels(file);
  try {
    return decodeLuminance(rgbaToLuminance(px.data, px.width, px.height), px.width, px.height).text;
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    if ('BarcodeDetector' in window) {
      try {
        const found = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(px.canvas);
        if (found.length) return found[0].rawValue;
      } catch { /* fall through to the message */ }
    }
    throw new Error(t('img.none', 'No QR code could be read from that picture. Try a straight-on screenshot cropped to the code, or type what the code says.'));
  }
}

// ---------- the expiry check ----------

const VERDICT_LABEL = {
  static: 'Static', direct: 'Static link', 'vendor-redirect': 'Vendor redirect', 'own-redirect': 'Your own redirect', 'unknown-redirect': 'Unknown redirect', unknown: 'Could not follow',
};
const verdictLabel = (v) => t(`v.${v}`, VERDICT_LABEL[v]);

function drawCheck(r) {
  const out = $('qr-check-out');
  out.textContent = '';
  out.appendChild(h('p', { class: `qr-verdict v-${r.verdict}` }, verdictLabel(r.verdict)));
  out.appendChild(h('p', { class: 'qr-sub' }, t(`vt.${r.verdict}`, r.verdictText)));
  out.appendChild(h('p', { class: 'qr-heading' }, t('check.say', 'The code says')));
  out.appendChild(h('pre', { class: 'qr-payload' }, r.encoded));
  if (r.vendor) {
    out.appendChild(h('p', { class: 'qr-heading' }, t('check.vendor', `Vendor: ${r.vendor.name}`, r.vendor.name)));
    if (r.vendor.policy) {
      const p = r.vendor.policy;
      const stop = LANG === 'ja' ? '。' : LANG === 'hi' ? '।' : '.';
      const tail = LANG === 'en' ? `, read ${p.readOn}${p.pageDate ? `, dated ${p.pageDate}` : ''}.` : `${t('check.read', '', dateOf(p.readOn))}${p.pageDate ? t('check.dated', '', dateOf(p.pageDate)) : ''}${stop}`;
      out.appendChild(h('blockquote', { class: 'qr-quote' }, [h('p', null, `"${p.quote}"`), h('p', { class: 'small muted' }, [LANG === 'en' ? `${p.context} ` : `${t('check.vendorEn', '')} ${p.context} `, h('a', { href: p.url, rel: 'nofollow noopener' }, t('check.page', 'The vendor\'s page')), tail])]));
    }
  }
  if (r.chain.length) {
    out.appendChild(h('p', { class: 'qr-heading' }, t('check.leads', 'Where it leads today')));
    out.appendChild(h('ol', { class: 'qr-chain' }, r.chain.map((s) => h('li', null, [h('span', { class: 'when' }, s.status ? t('check.http', `HTTP ${s.status}`, s.status) : t('check.noanswer', 'no answer')), h('span', { class: 'qr-url' }, s.url), s.error ? h('span', { class: 'muted' }, s.error) : null]))));
  }
  if (r.notes.length) out.appendChild(h('ul', { class: 'qr-checks' }, r.notes.map((n) => h('li', null, say(n)))));
  if (r.replacement) {
    out.appendChild(h('p', { class: 'qr-heading' }, t('check.repl', 'A static replacement for the reprint')));
    out.appendChild(h('p', { class: 'qr-sub' }, t('check.replNote', r.replacement.note)));
    const b = h('button', { class: 'btn', type: 'button' }, t('check.open', 'Open it in the maker above'));
    b.addEventListener('click', () => {
      $('qr-type').value = 'url';
      drawFields();
      $('qr-f-url').value = r.replacement.payload;
      make();
      $('qr-form').scrollIntoView({ behavior: 'smooth' });
    });
    out.appendChild(b);
  }
}

async function onCheck(e) {
  e.preventDefault();
  $('qr-check-error').textContent = '';
  const btn = $('qr-check-run');
  btn.disabled = true;
  try {
    let text = $('qr-check-text').value.trim();
    const file = $('qr-check-image').files[0];
    if (file && !text) {
      text = await readCode(file);
      $('qr-check-text').value = text;
    }
    if (!text) throw new Error(t('check.pick', 'Choose a picture of the code, or type what it says.'));
    const mine = $('qr-check-mine').value.split(/[\s,]+/).map((d) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(Boolean);
    const json = await T.run(SLUG, { op: 'expiry-check', text, ...(mine.length ? { myDomains: mine } : {}) });
    drawCheck(json.result);
  } catch (err) {
    $('qr-check-error').textContent = err.fields ? Object.values(err.fields)[0] : err.message;
  } finally {
    btn.disabled = false;
  }
}

// ---------- the spreadsheet ----------

let sheet = null; // { table, name }

async function readSheetFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/\.xlsx$/i.test(file.name)) {
    const entries = zipEntries(bytes);
    const texts = {};
    for (const e of entries) {
      if (!/^xl\/(sharedStrings|worksheets\/sheet1)\.xml$/.test(e.name)) continue;
      if (e.method === 0) texts[e.name] = new TextDecoder().decode(e.data);
      else texts[e.name] = await new Response(new Blob([e.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    return xlsxRows((name) => texts[name] ?? null);
  }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { text = new TextDecoder('windows-1252').decode(bytes); }
  return parseCsv(text);
}

const csvLine = (r) => r.map((v) => (/[",\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(',');

// The sheet in parts that fit one request: each part is the heading row and a run of rows, with
// the sheet row number of its first data row.
function parts(table) {
  const [head, ...body] = table;
  const out = [];
  let lines = [];
  let size = 0;
  let first = 2;
  body.forEach((r, i) => {
    const line = csvLine(r);
    if (lines.length && size + line.length > BODY_LIMIT - 4000) {
      out.push({ firstRow: first, csv: `${[csvLine(head), ...lines].join('\r\n')}\r\n` });
      lines = [];
      size = 0;
      first = i + 2;
    }
    lines.push(line);
    size += line.length + 2;
  });
  if (lines.length) out.push({ firstRow: first, csv: `${[csvLine(head), ...lines].join('\r\n')}\r\n` });
  return out;
}

function bulkOptions() {
  const d = designNow();
  const opts = { type: $('qr-bulk-type').value, filename: $('qr-bulk-name').value.trim() || 'qr-{row}', format: $('qr-bulk-format').value, ecc: $('qr-ecc').value, margin: d.margin, fg: $('qr-fg').value, bg: $('qr-transparent').checked ? 'transparent' : $('qr-bg').value };
  if ($('qr-bulk-sheet').value) opts.sheet = $('qr-bulk-sheet').value;
  return opts;
}

const money = (n) => `$${n.toFixed(n < 1 ? 3 : 2)}`;

function analyseBulk() {
  $('qr-bulk-error').textContent = '';
  const box = $('qr-bulk-out');
  box.textContent = '';
  $('qr-bulk-run').hidden = true;
  $('qr-bulk-note').hidden = true;
  try {
    const table = sheet ? sheet.table : parseCsv($('qr-bulk-paste').value);
    if (table.length < 2) throw new QrError(t('bulk.few', 'Give a heading row and at least one row.'));
    const { rows, ignored } = rowsFromTable(table);
    const opts = bulkOptions();
    const plan = planBulk(rows, { type: opts.type, ecc: opts.ecc, filename: opts.filename });
    const codes = plan.ok.length;
    const refusedN = plan.errors.length;
    box.appendChild(h('p', { class: 'qr-answer' }, [LANG === 'en' ? `${codes.toLocaleString('en-US')} ${codes === 1 ? 'code' : 'codes'}` : `${nf(codes)}${LANG === 'ja' ? '' : ' '}${t(codes === 1 ? 'bulk.code1' : 'bulk.codeN', '')}`, h('small', null, LANG === 'en' ? `${refusedN} ${refusedN === 1 ? 'row' : 'rows'} refused, never charged` : t('bulk.refused', '', nf(refusedN), t(refusedN === 1 ? 'bulk.row1' : 'bulk.rowN', '')))]));
    const price = Math.max(10, codes) * 0.002;
    // The rate in the page's currency (T.prices); the estimate for the job only in dollars, where
    // it is worked out here.
    // On a page in another language the amounts stay in US dollars, as the page's prices do.
    const Wrate = LANG === 'en' ? T.prices(`$0.002 a code, at least 10 a job${codes > 5000 ? '; codes beyond 5,000 in a calendar month are $0.0005' : ''}`)
      : `${t('bulk.rate', '')}${codes > 5000 ? t('bulk.beyond', '') : ''}`;
    const rate = Wrate;
    const about = LANG !== 'en' ? t('bulk.about', '', money(price), rate) : (T.currency === 'USD' ? `About ${money(price)} for this job (${rate}).` : `${rate[0].toUpperCase()}${rate.slice(1)}.`);
    if (codes) box.appendChild(h('p', { class: 'qr-sub' }, `${about} ${t('bulk.exact', 'The exact price is shown before anything is charged.')}`));
    if (ignored.length) box.appendChild(h('p', { class: 'qr-aside' }, t('bulk.unused', `Not used: ${ignored.join(', ')} (usable in file names as {${ignored[0]}}).`, ignored.join(', '), `{${ignored[0]}}`)));
    const list = [...plan.errors.map((e) => ({ row: e.row, text: e.text, err: true })), ...plan.warnings].sort((a, b) => a.row - b.row);
    if (list.length) box.appendChild(h('ul', { class: 'qr-checks' }, list.slice(0, 12).map((x) => h('li', { class: x.err ? 'warn' : '' }, t('bulk.rowErr', `Row ${x.row}: ${x.text}`, x.row, errorText({ message: x.text }))))));
    if (list.length > 12) box.appendChild(h('p', { class: 'small muted' }, t('bulk.more', `and ${list.length - 12} more, listed in the manifest.`, list.length - 12)));
    if (plan.ok.length) {
      const sample = plan.ok.slice(0, 3);
      box.appendChild(h('table', { class: 'qr-table' }, [
        h('thead', null, h('tr', null, [h('th', null, t('th.row', 'Row')), h('th', null, t('th.file', 'File')), h('th', null, t('th.inside', 'Inside'))])),
        h('tbody', null, sample.map((x) => h('tr', null, [h('td', null, String(x.row)), h('td', null, x.file), h('td', { class: 'qr-url' }, x.payload)]))),
      ]));
      $('qr-bulk-run').hidden = false;
      $('qr-bulk-note').hidden = false;
    }
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    $('qr-bulk-error').textContent = e.message;
  }
}

async function runBulk() {
  $('qr-bulk-error').textContent = '';
  const out = $('qr-bulk-files');
  out.textContent = '';
  const btn = $('qr-bulk-run');
  btn.disabled = true;
  try {
    const table = sheet ? sheet.table : parseCsv($('qr-bulk-paste').value);
    const jobs = parts(table);
    const opts = bulkOptions();
    for (const [i, part] of jobs.entries()) {
      const json = await T.run(SLUG, { op: 'bulk', ...opts, csv: part.csv, firstRow: part.firstRow });
      const r = json.result;
      const name = jobs.length > 1 ? `qr-codes-part-${i + 1}.zip` : 'qr-codes.zip';
      const bytes = Uint8Array.from(atob(r.zip.base64), (c) => c.charCodeAt(0));
      const a = h('a', { class: 'btn', href: URL.createObjectURL(new Blob([bytes], { type: 'application/zip' })), download: name }, t('bulk.dl', `Download ${name}`, name));
      const pagesEn = r.sheet ? `, with ${r.sheet.pages} label ${r.sheet.pages === 1 ? 'page' : 'pages'}` : '';
      const pagesT = r.sheet ? t(r.sheet.pages === 1 ? 'bulk.pages1' : 'bulk.pagesN', pagesEn, nf(r.sheet.pages)) : '';
      out.appendChild(h('p', null, [a, t('bulk.done', ` ${r.made} codes, every file read back${pagesEn}. Charged ${json.charged.display}.`, nf(r.made), pagesT, json.charged.display)]));
      if (r.sheet) out.appendChild(h('p', { class: 'small muted' }, `${r.sheet.note} ${t('bulk.codewidth', `Codes print ${r.sheet.codeWidthMm} mm wide.`, dec(r.sheet.codeWidthMm))}`));
    }
  } catch (err) {
    $('qr-bulk-error').textContent = err.status === 401 ? t('bulk.signin', 'Sign in to make the files; the rows above stay on this page.') : (err.fields ? Object.values(err.fields)[0] : err.message);
    if (err.status === 401) $('qr-bulk-error').appendChild(h('a', { class: 'endwise-fix', href: T.signInHref() }, t('bulk.signinLink', ' Sign in')));
  } finally {
    btn.disabled = false;
  }
}

// ---------- wiring ----------

function boot() {
  for (const ty of TYPES) $('qr-bulk-type').appendChild(h('option', { value: ty }, typeName(ty)));
  for (const [k, s] of Object.entries(SHEETS)) $('qr-bulk-sheet').appendChild(h('option', { value: k }, t(`sheet.${k}`, s.name)));
  const q = new URLSearchParams(window.location.search);
  if (q.get('type') && TYPES.includes(q.get('type'))) $('qr-type').value = q.get('type');
  drawFields();
  if (q.get('url') && $('qr-f-url')) $('qr-f-url').value = q.get('url');
  // A WiFi link carries the network and its security, never a password: for any network but the
  // example's, the password box starts empty for the visitor to type.
  if (q.get('ssid') && $('qr-f-ssid')) {
    $('qr-f-ssid').value = q.get('ssid').slice(0, 64);
    if (q.get('ssid') !== START.ssid) $('qr-f-password').value = '';
  }
  if (q.get('security') && WIFI_SECURITY.includes(q.get('security')) && $('qr-f-security')) $('qr-f-security').value = q.get('security');
  if (q.get('ecc') && ['L', 'M', 'Q', 'H'].includes(q.get('ecc'))) $('qr-ecc').value = q.get('ecc');
  $('qr-type').addEventListener('change', () => { drawFields(); make(); });
  $('qr-form').addEventListener('input', (e) => { if (e.target.id === 'qr-f-security') showEnterprise(); make(); });
  $('qr-form').addEventListener('change', make);
  $('qr-form').addEventListener('submit', (e) => { e.preventDefault(); make(); });
  $('qr-logo-share').addEventListener('input', () => { $('qr-logo-share-out').textContent = `${$('qr-logo-share').value}%`; });
  $('qr-logo').addEventListener('change', async () => {
    const f = $('qr-logo').files[0];
    try { logo = f ? await readLogo(f) : null; } catch (e) { $('qr-error').textContent = e.message; logo = null; }
    if (logo && ($('qr-ecc').value === 'L' || $('qr-ecc').value === 'M')) $('qr-ecc').value = 'H';
    make();
  });
  $('qr-check-form').addEventListener('submit', onCheck);
  $('qr-check-image').addEventListener('change', () => { $('qr-check-text').value = ''; });
  $('qr-bulk-file').addEventListener('change', async () => {
    const f = $('qr-bulk-file').files[0];
    if (!f) return;
    try {
      sheet = { table: await readSheetFile(f), name: f.name };
      $('qr-bulk-paste').value = '';
      $('qr-bulk-paste').placeholder = t('bulk.isOpen', `${f.name} is open.`, f.name);
      analyseBulk();
    } catch (e) {
      $('qr-bulk-error').textContent = e.message;
    }
  });
  $('qr-bulk-paste').addEventListener('input', () => { sheet = null; analyseBulk(); });
  for (const id of ['qr-bulk-type', 'qr-bulk-name', 'qr-bulk-format', 'qr-bulk-sheet']) $(id).addEventListener('change', analyseBulk);
  $('qr-bulk-run').addEventListener('click', runBulk);
  make();
  analyseBulk();
  T.mountCodePanel($('qr-code'), SLUG);
}

boot();

// For the expiry checker's kind label on non-link codes.
export { payloadKind };
