# SSOMA – Gestión de Compras

Dashboard web para el seguimiento de solicitudes de compra del departamento SSOMA.  
Desarrollado con React + Tailwind CSS (vía CDN). Sin dependencias de build.

## Demo

Desplegado en Vercel: **[ver demo →](#)**  
*(actualizar este link tras el primer deploy)*

---

## Flujo de Compras (7 etapas)

| # | Etapa | Descripción |
|---|-------|-------------|
| 1 | Necesidad | Identificación y registro |
| 2 | Armado de Requerimientos | Especificaciones técnicas |
| 3 | Precios | Estimación de presupuesto |
| 4 | Proveedores | Búsqueda y propuestas |
| 5 | Comparativo | Cuadro comparativo |
| 6 | Solicitud | Orden interna de compra |
| 7 | Procura ✅ | Subida al sistema general |

---

## Conectar con Google Sheets

### 1. Preparar la hoja de cálculo

Crear una hoja llamada **`Compras`** con estos encabezados exactos en la fila 1:

```
ID | Título | Urgencia | Etapa | Responsable | FechaCreación | Nota_0 | Nota_1 | Nota_2 | Nota_3 | Nota_4 | Nota_5 | Nota_6
```

### 2. Crear el script backend

1. En la hoja: **Extensiones → Apps Script**
2. Borrar el contenido y pegar el contenido de [`gas/Code.gs`](gas/Code.gs)
3. Reemplazar `TU_SPREADSHEET_ID_AQUI` con el ID de tu hoja  
   *(el ID está en la URL: `docs.google.com/spreadsheets/d/**ID_AQUI**/edit`)*
4. Guardar (Ctrl+S)

### 3. Autorizar y desplegar

1. En Apps Script: **Ejecutar** cualquier función → autorizar permisos
2. **Desplegar → Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
3. Copiar la URL `/exec` que aparece

### 4. Configurar la app

En `index.html`, reemplazar la línea:

```javascript
const GAS_URL = 'TU_URL_AQUI';
```

con la URL copiada en el paso anterior.

---

## Desarrollo local

```bash
# Python (sin instalación extra)
python3 -m http.server 8080

# O con Node.js
npx serve . -p 3000
```

Abrir: `http://localhost:8080`

---

## Estructura del proyecto

```
ssoma-compras/
├── index.html          ← App completa (frontend)
├── gas/
│   └── Code.gs         ← Backend (Google Apps Script)
└── .claude/
    └── launch.json     ← Configuración de servidores locales
```
