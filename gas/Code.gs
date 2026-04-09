// ============================================================
//  SSOMA – Gestión de Compras · Google Apps Script Backend
//  Desplegar como: Web App → Ejecutar como "Yo" → Acceso "Cualquiera"
// ============================================================

const SHEET_NAME     = "Compras";
const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI"; // ← Reemplazar con el ID de tu hoja

// Índices de columna (0-based)
// ID | Título | Urgencia | Etapa | Responsable | FechaCreación | Nota_0 … Nota_6
const COL = {
  ID: 0, TITULO: 1, URGENCIA: 2, ETAPA: 3,
  RESPONSABLE: 4, FECHA: 5,
  NOTA_0: 6, NOTA_1: 7, NOTA_2: 8, NOTA_3: 9,
  NOTA_4: 10, NOTA_5: 11, NOTA_6: 12,
};

// ── Encabezados de la hoja ────────────────────────────────────────────────────
// Fila 1 debe tener exactamente:
// ID | Título | Urgencia | Etapa | Responsable | FechaCreación | Nota_0 | Nota_1 | Nota_2 | Nota_3 | Nota_4 | Nota_5 | Nota_6

// ── Punto de entrada ─────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = (e.parameter.action || "list").trim();
    let result;
    switch (action) {
      case "list":    result = actionList();                              break;
      case "advance": result = actionAdvance(e.parameter.id);            break;
      case "create":  result = actionCreate(e.parameter);                break;
      default:        result = { error: "Acción desconocida: " + action };
    }
    return respond(result);
  } catch (err) {
    return respond({ error: err.message });
  }
}

// ── Listar todas las compras ──────────────────────────────────────────────────
function actionList() {
  const data = getSheet().getDataRange().getValues();
  if (data.length <= 1) return { purchases: [] };
  return { purchases: data.slice(1).map(rowToObject) };
}

// ── Avanzar etapa ─────────────────────────────────────────────────────────────
function actionAdvance(id) {
  if (!id) return { error: "Falta parámetro: id" };
  const sheet  = getSheet();
  const data   = sheet.getDataRange().getValues();
  const rowIdx = findRowById(data, id);
  if (rowIdx === -1) return { error: "Compra no encontrada: " + id };

  const currentEtapa = Number(data[rowIdx - 1][COL.ETAPA]) || 0;
  if (currentEtapa >= 6) return { purchase: rowToObject(data[rowIdx - 1]), alreadyAtMax: true };

  sheet.getRange(rowIdx, COL.ETAPA + 1).setValue(currentEtapa + 1);
  const updated = sheet.getRange(rowIdx, 1, 1, COL.NOTA_6 + 1).getValues()[0];
  return { purchase: rowToObject(updated) };
}

// ── Crear nueva compra ────────────────────────────────────────────────────────
function actionCreate(p) {
  if (!p.titulo) return { error: "Falta parámetro: titulo" };
  const id  = "SSOMA-REQ-" + String(getNextId()).padStart(3, "0");
  const row = new Array(COL.NOTA_6 + 1).fill("");
  row[COL.ID]          = id;
  row[COL.TITULO]      = p.titulo;
  row[COL.URGENCIA]    = p.urgencia    || "Media";
  row[COL.ETAPA]       = 0;
  row[COL.RESPONSABLE] = p.responsable || "";
  row[COL.FECHA]       = new Date().toISOString().slice(0, 10);
  row[COL.NOTA_0]      = p.nota_0      || "";
  getSheet().appendRow(row);
  return { purchase: rowToObject(row) };
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function rowToObject(row) {
  return {
    id:          row[COL.ID],
    title:       row[COL.TITULO],
    urgency:     row[COL.URGENCIA],
    stage:       Number(row[COL.ETAPA]) || 0,
    responsible: row[COL.RESPONSABLE],
    createdAt:   String(row[COL.FECHA]).slice(0, 10),
    notes: {
      0: row[COL.NOTA_0] || "", 1: row[COL.NOTA_1] || "",
      2: row[COL.NOTA_2] || "", 3: row[COL.NOTA_3] || "",
      4: row[COL.NOTA_4] || "", 5: row[COL.NOTA_5] || "",
      6: row[COL.NOTA_6] || "",
    },
  };
}

function findRowById(data, id) {
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.ID]) === String(id)) return i + 1; // 1-based
  }
  return -1;
}

function getNextId() {
  const data = getSheet().getDataRange().getValues();
  return data.length; // filas existentes (incluyendo encabezado) = próximo número
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
