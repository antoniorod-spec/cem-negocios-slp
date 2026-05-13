# CEM Negocios — Registro al grupo

Landing page de una sola página (`index.html`) con formulario de registro que escribe en un Google Sheet vía Google Apps Script.

## Estructura

```
cem-negocios-slp/
├── index.html         Landing + formulario
├── apps-script.gs     Backend (pegar en Google Apps Script)
└── README.md
```

## Puesta en producción

### 1. Crear el Google Sheet
1. Entra a [sheets.new](https://sheets.new) y crea una hoja nueva (ej. *CEM Negocios — Registros*).
2. Copia el **ID de la hoja**: es la cadena entre `/d/` y `/edit` en la URL.
   `https://docs.google.com/spreadsheets/d/`**`ESTO_ES_EL_ID`**`/edit`

### 2. Desplegar el Apps Script
1. En la misma hoja: **Extensiones → Apps Script**.
2. Borra el contenido por defecto. Pega [apps-script.gs](apps-script.gs) completo.
3. Reemplaza `SHEET_ID = 'REEMPLAZAR_CON_TU_SHEET_ID'` por el ID que copiaste.
4. (Opcional) En `NOTIFY_EMAIL` pon tu correo para recibir aviso de cada registro.
5. Guarda con **Ctrl/Cmd + S**, ponle nombre al proyecto.
6. En el selector de función elige **`setup`** → **Ejecutar**. La primera vez te pedirá permisos (acéptalos con tu cuenta).
   - Esto crea la pestaña *Registros* con los encabezados.
7. **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Descripción: *CEM Negocios v1*
   - Ejecutar como: **Yo** (tu cuenta)
   - Quién tiene acceso: **Cualquier usuario** (incluye "incluso anónimos")
   - Implementar.
8. Copia la **URL de la aplicación web** (termina en `/exec`).

### 3. Conectar la landing
En [index.html](index.html), línea del `<form>`:

```html
<form id="registroForm" action="https://script.google.com/macros/s/REEMPLAZAR_DEPLOYMENT_ID/exec" method="POST" novalidate>
```

Reemplaza el `action` por la URL `/exec` que copiaste.

### 4. Probar
- Abre `index.html` en el navegador (vía Laragon: `http://cem-negocios-slp.test` o doble click).
- Envía un registro de prueba. Verifica que llegue a la hoja.
- Si activaste `NOTIFY_EMAIL`, revisa también tu correo.

### 5. Actualizaciones al script
Si modificas [apps-script.gs](apps-script.gs) después:
- **Implementar → Gestionar implementaciones → ✏️ (editar)** → **Versión: Nueva versión** → Implementar.
- La URL `/exec` se mantiene; los cambios solo aplican tras crear una nueva versión.

## Características del formulario

- **Honeypot anti-spam** (`website_url`): bots lo llenan y el backend descarta el envío.
- **Validación cliente**: HTML5 + normalización de WhatsApp (solo dígitos, mínimo 10).
- **Validación servidor**: campos obligatorios, formato de email, longitud de teléfono.
- **Metadata capturada**: fecha ISO, user-agent, referrer (para saber de dónde vino el lead).
- **CORS-friendly**: usa `FormData`, que cuenta como *simple request* — no requiere preflight.
- **Sin dependencias JS**: vanilla, ~1KB de lógica.

## Columnas que se escriben en la hoja

| # | Columna | Origen |
|---|---|---|
| 1 | Fecha registro | ISO desde el cliente |
| 2 | Tipo miembro | Afiliado / Invitado |
| 3 | Nombre | Input |
| 4 | Cargo | Input |
| 5 | Email | Input (lowercase) |
| 6 | WhatsApp | Input normalizado a dígitos |
| 7 | Empresa | Input |
| 8 | Giro | Input |
| 9 | Sitio web | Input (opcional) |
| 10 | Oferta | Textarea |
| 11 | Cliente ideal | Textarea (opcional) |
| 12 | Referido por | Input |
| 13 | Acepta reglas | `acepto` |
| 14 | Acepta datos | `acepto` |
| 15 | User agent | navigator.userAgent |
| 16 | Referrer | document.referrer |
| 17 | IP | (vacío — Apps Script no expone la IP) |

## Hosting

El archivo es estático. Opciones gratuitas que funcionan:
- **GitHub Pages** (recomendado: ya está el repo)
- Netlify drop, Vercel, Cloudflare Pages
- Subdirectorio en un VPS / Laragon
