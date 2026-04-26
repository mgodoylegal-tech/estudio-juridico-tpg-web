# Formulario con Google Sheets y Google Apps Script

Esta guía deja el formulario de Estudio Jurídico TPG preparado para guardar cada consulta en Google Sheets y, al mismo tiempo, mantener la redirección a WhatsApp con el mensaje prellenado.

## 1. Crear el Google Sheet

1. Crear una hoja nueva en Google Drive.
2. Nombrarla, por ejemplo: `Leads Estudio Jurídico TPG`.
3. Renombrar la primera pestaña como `Leads`.
4. En la fila 1 agregar estas columnas, en este orden:

```text
lead_id | fecha_hora | nombre | telefono | email | tipo_consulta | mensaje | abogado_asignado | numero_whatsapp_asignado | origen | estado | pagina_origen | user_agent
```

El campo `lead_id` lo genera la web con formato similar a `TPG-20260425183022-A1B2C3`.

El estado inicial que envía la web es `Nuevo`.

El origen que envía la web es `Web estudiojuridicotpg.com.ar`.

## 2. Crear el Apps Script

1. Dentro del Sheet, ir a `Extensiones > Apps Script`.
2. Borrar el contenido inicial.
3. Pegar este código:

```javascript
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`No existe la hoja "${SHEET_NAME}".`);
    }

    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    sheet.appendRow([
      clean(payload.lead_id),
      payload.fecha_hora || new Date().toISOString(),
      clean(payload.nombre),
      clean(payload.telefono),
      clean(payload.email),
      clean(payload.tipo_consulta),
      clean(payload.mensaje),
      clean(payload.abogado_asignado),
      clean(payload.numero_whatsapp_asignado),
      clean(payload.origen) || 'Web estudiojuridicotpg.com.ar',
      clean(payload.estado) || 'Nuevo',
      clean(payload.pagina_origen),
      clean(payload.user_agent)
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'TPG leads endpoint' });
}

function clean(value) {
  return String(value || '').trim().slice(0, 2000);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Desplegar como Web App

1. Hacer clic en `Implementar > Nueva implementación`.
2. Elegir tipo `Aplicación web`.
3. Configurar:
   - `Ejecutar como`: `Yo`.
   - `Quién tiene acceso`: `Cualquier usuario`.
4. Autorizar los permisos solicitados por Google.
5. Copiar la URL final de la aplicación web.

## 4. Pegar la URL en el proyecto

En `script.js`, reemplazar:

```javascript
const LEADS_ENDPOINT = 'PEGAR_URL_DE_APPS_SCRIPT';
```

por la URL de Apps Script:

```javascript
const LEADS_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

## 5. Probar el flujo completo

1. Abrir la web local o publicada.
2. Completar el formulario de `Orientación inicial del caso`.
3. Elegir un tipo de consulta.
4. Escribir una descripción breve.
5. Enviar.
6. Verificar que aparece el mensaje `Registrando consulta...`.
7. Confirmar que WhatsApp abre con el texto prellenado.
8. Revisar el Google Sheet y confirmar que se agregó una fila nueva.

## 6. Verificar la asignación por abogado

La web envía estos responsables:

- `Fraude bancario`: Matías Godoy, `5491155857623`.
- `Empresas / PYMES`: Matías Godoy, `5491155857623`.
- `Laboral / ART`: Pablo Tuozzo, `5491154845455`.
- `Daños / accidentes`: Pablo Tuozzo, `5491154845455`.
- `Sucesiones`: Iñaki Pericoli, `5491160231009`.
- `Usucapión`: Iñaki Pericoli, `5491160231009`.
- `Amparos de salud`: Matías Godoy, `5491155857623`.
- `Otro`: Matías Godoy, `5491155857623`.

## 7. Si aparece un error de CORS

El formulario usa `fetch` con `mode: 'no-cors'` para evitar que el navegador bloquee la consulta por las limitaciones habituales de Google Apps Script. Eso significa que el navegador no puede leer con precisión la respuesta del servidor, pero la solicitud se envía.

Si ves una advertencia o no aparece la fila:

1. Confirmar que la URL termina en `/exec`, no en `/dev`.
2. Confirmar que la implementación está publicada para `Cualquier usuario`.
3. Revisar que la pestaña se llame exactamente `Leads`.
4. Probar la URL del endpoint en el navegador. Debería responder un JSON simple con `ok: true`.
5. Crear una nueva implementación si cambiaste permisos o código.
6. Como evolución futura, usar un Cloudflare Worker como proxy para tener CORS, validación y logs más robustos.

## 8. Privacidad y seguridad mínima

- No pedir DNI en este formulario inicial.
- No pedir claves, tokens, contraseñas, números completos de cuenta ni datos completos de tarjetas.
- No pedir documentación médica ni diagnóstico detallado para amparos de salud.
- No almacenar documentación sensible en el Sheet.
- Usar el campo `mensaje` solo para una descripción breve.
- Limitar el acceso al Sheet a personas autorizadas del estudio.
- Revisar periódicamente los permisos de Google Drive y Apps Script.
- Considerar una política interna de retención de leads y eliminación de datos antiguos.
