/**
 * CEM Negocios — Backend de registro en Google Sheets
 *
 * Despliegue:
 *   1. Crear un Google Sheet nuevo. Copiar su ID (la cadena entre /d/ y /edit en la URL).
 *   2. Pegar el ID en SHEET_ID (abajo).
 *   3. Extensiones → Apps Script → pegar este archivo → Guardar.
 *   4. Ejecutar la función `setup()` UNA VEZ para crear la pestaña con encabezados.
 *   5. Implementar → Nueva implementación → tipo "Aplicación web":
 *        - Ejecutar como: yo (tu cuenta)
 *        - Quién tiene acceso: cualquier usuario (también anónimo)
 *      Copiar la URL .../exec y pegarla en el atributo `action` del <form> en index.html.
 *   6. Cada vez que cambies este script, vuelve a "Implementar → Gestionar implementaciones"
 *      y crea una NUEVA versión (no edites la existente) o la URL no reflejará cambios.
 */

const SHEET_ID = '1RShdI2RqBn5-sDHd-gyl355XA3Z6_1yB2akjdxwA4HM';
const SHEET_NAME = 'Registros';
const NOTIFY_EMAIL = '';

const HEADERS = [
  'Fecha registro',
  'Tipo miembro',
  'Nombre',
  'Cargo',
  'Email',
  'WhatsApp',
  'Empresa',
  'Giro',
  'Sitio web',
  'Oferta',
  'Cliente ideal',
  'Referido por',
  'Acepta reglas',
  'Acepta datos',
  'User agent',
  'Referrer',
  'IP'
];

function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0A2A5E')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'CEM Negocios endpoint' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (params.website_url && params.website_url.trim() !== '') {
      return jsonResponse({ status: 'ok' });
    }

    const required = ['nombre', 'cargo', 'email', 'whatsapp', 'tipo_miembro', 'referido_por', 'empresa', 'giro', 'oferta'];
    for (const f of required) {
      if (!params[f] || String(params[f]).trim() === '') {
        return jsonResponse({ status: 'error', message: 'Falta el campo: ' + f }, 400);
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
      return jsonResponse({ status: 'error', message: 'Email inválido' }, 400);
    }

    const tel = String(params.whatsapp).replace(/\D/g, '');
    if (tel.length < 10) {
      return jsonResponse({ status: 'error', message: 'WhatsApp debe tener al menos 10 dígitos' }, 400);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const row = [
      params.fecha_registro || new Date().toISOString(),
      params.tipo_miembro || '',
      params.nombre || '',
      params.cargo || '',
      String(params.email || '').toLowerCase().trim(),
      tel,
      params.empresa || '',
      params.giro || '',
      params.web || '',
      params.oferta || '',
      params.cliente_ideal || '',
      params.referido_por || '',
      params.acepta_reglas || '',
      params.acepta_datos || '',
      params.user_agent || '',
      params.referrer || '',
      ''
    ];

    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: 'Nuevo registro CEM Negocios — ' + (params.nombre || ''),
          htmlBody: buildEmailHtml(params, tel)
        });
      } catch (mailErr) {
        Logger.log('Error enviando email: ' + mailErr);
      }
    }

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    Logger.log(err);
    return jsonResponse({ status: 'error', message: 'Error interno: ' + err.message }, 500);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildEmailHtml(p, tel) {
  const row = (label, val) => '<tr><td style="padding:6px 12px;color:#6B7280;font-size:13px">' + label + '</td>' +
    '<td style="padding:6px 12px;color:#1A2333;font-size:14px"><strong>' + (val || '—') + '</strong></td></tr>';
  return '<div style="font-family:Arial,sans-serif;max-width:560px">' +
    '<h2 style="color:#0A2A5E;border-bottom:3px solid #E63027;padding-bottom:8px">Nuevo registro CEM Negocios</h2>' +
    '<table style="border-collapse:collapse;width:100%">' +
    row('Tipo', p.tipo_miembro) +
    row('Nombre', p.nombre) +
    row('Cargo', p.cargo) +
    row('Empresa', p.empresa) +
    row('Giro', p.giro) +
    row('Email', p.email) +
    row('WhatsApp', tel) +
    row('Referido por', p.referido_por) +
    row('Oferta', p.oferta) +
    row('Cliente ideal', p.cliente_ideal) +
    row('Sitio web', p.web) +
    '</table></div>';
}
