looker.plugins.visualizations.add({
  options: {
    // --- STYLE ---
    compact: {
      type: "boolean",
      label: "Compact Mode",
      section: "Style",
      default: false
    },
    zebra_striping: {
      type: "boolean",
      label: "Zebra Striping",
      section: "Style",
      default: false
    },
    show_row_numbers: {
      type: "boolean",
      label: "Show Row Numbers",
      section: "Style",
      default: false
    },
    card_style: {
      type: "string",
      label: "Card Background",
      display: "select",
      section: "Style",
      values: [
        {"Phorest Card (Shadow & Border)": "card"},
        {"Content Only (Transparent)": "transparent"}
      ],
      default: "card"
    },
    sticky_header: {
      type: "boolean",
      label: "Sticky Header",
      section: "Style",
      default: true
    },

    // --- COLUMNS ---
    font_size: {
      type: "number",
      label: "Row Font Size (px)",
      section: "Columns",
      default: 15,
      display: "text"
    },
    size_columns_to_fit: {
      type: "boolean",
      label: "Size Columns to Fit Content",
      section: "Columns",
      default: false
    },
    min_column_width: {
      type: "number",
      label: "Minimum Column Width (px)",
      section: "Columns",
      default: 120,
      display: "text"
    },
    truncate_column_names: {
      type: "boolean",
      label: "Truncate Column Names",
      section: "Columns",
      default: false
    },
    truncate_column_length: {
      type: "number",
      label: "Max Header Length (chars)",
      section: "Columns",
      default: 20,
      display: "text"
    },
    show_full_field_name: {
      type: "boolean",
      label: "Show Full Field Name",
      section: "Columns",
      default: false
    },

    // --- HEADER ---
    header_bg_color: {
      type: "string",
      label: "Header Background",
      display: "color",
      section: "Header",
      default: "#1B4769"
    },
    header_text_color: {
      type: "string",
      label: "Header Text Color",
      display: "color",
      section: "Header",
      default: "#ffffff"
    },
    header_font_size: {
      type: "number",
      label: "Header Font Size (px)",
      section: "Header",
      default: 13,
      display: "text"
    },
    header_uppercase: {
      type: "boolean",
      label: "Uppercase Headers",
      section: "Header",
      default: false
    },

    // --- PAGINATION ---
    enable_pagination: {
      type: "boolean",
      label: "Enable Pagination",
      section: "Pagination",
      default: true
    },
    page_size: {
      type: "number",
      label: "Rows Per Page",
      section: "Pagination",
      default: 20,
      display: "text"
    },

    // --- TOTALS ---
    show_totals_row: {
      type: "boolean",
      label: "Show Totals Row",
      section: "Totals",
      default: false
    },

    // --- CONDITIONAL FORMATTING ---
    enable_cf: {
      type: "boolean",
      label: "Enable Conditional Formatting",
      section: "Conditional Formatting",
      default: false
    },
    cf_apply_to: {
      type: "string",
      label: "Apply To",
      display: "select",
      section: "Conditional Formatting",
      values: [
        {"All Measures": "measures"},
        {"All Numeric Fields": "all_numeric"}
      ],
      default: "measures"
    },
    cf_palette: {
      type: "string",
      label: "Palette",
      display: "select",
      section: "Conditional Formatting",
      values: [
        {"Blue (White → Blue)": "blue"},
        {"Pink (White → Pink)": "pink"},
        {"Purple (White → Purple)": "purple"},
        {"Green (White → Green)": "green"},
        {"Red → White → Green (Diverging)": "redwhitegreen"},
        {"White → Red (Negative = Bad)": "white_red"}
      ],
      default: "blue"
    },
    cf_reverse_colors: {
      type: "boolean",
      label: "Reverse Colors",
      section: "Conditional Formatting",
      default: false
    },
    cf_null_as_zero: {
      type: "boolean",
      label: "Include Null Values as Zero",
      section: "Conditional Formatting",
      default: false
    },
    cf_range: {
      type: "string",
      label: "Scale Range",
      display: "select",
      section: "Conditional Formatting",
      values: [
        {"Per Column": "column"},
        {"Global (across all columns)": "global"}
      ],
      default: "column"
    }
  },

  create: function(element, config) {
    this._sortCol = null;
    this._sortDir = 'asc';
    this._currentPage = 1;

    element.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');

        html, body, #vis {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .vis-table-outer {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          background: #f4f5f7;
          font-family: 'Nunito', sans-serif;
          display: flex;
          align-items: stretch;
        }

        .vis-table-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }

        .vis-table-wrapper.style-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
        }

        .vis-table-wrapper.style-transparent {
          background: transparent;
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        .vis-table-scroll {
          overflow: auto;
          flex: 1;
          min-height: 0;
        }

        .vis-table {
          border-collapse: collapse;
        }

        .vis-table.size-fit {
          width: 100%;
        }

        /* ---- HEADER ---- */
        .vis-table thead th {
          padding: 14px 24px;
          text-align: left;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          border-bottom: none;
          z-index: 10;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vis-table thead th.sticky-header {
          position: sticky;
          top: 0;
        }

        .vis-table thead th:first-child { border-radius: 12px 0 0 0; }
        .vis-table thead th:last-child  { border-radius: 0 12px 0 0; }

        .vis-table-wrapper.style-transparent thead th:first-child,
        .vis-table-wrapper.style-transparent thead th:last-child {
          border-radius: 0;
        }

        .vis-table thead th:hover { filter: brightness(1.2); }

        .vis-table thead th .col-inner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Force any SVGs Looker injects into headers to be white */
        .vis-table thead th svg,
        .vis-table thead th svg path,
        .vis-table thead th svg rect,
        .vis-table thead th svg circle {
          fill: rgba(255,255,255,0.75) !important;
          stroke: rgba(255,255,255,0.75) !important;
          color: rgba(255,255,255,0.75) !important;
        }

        .sort-icon {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.5;
          color: #ffffff;
          transition: opacity 0.15s ease;
        }

        .sort-icon svg {
          width: 12px;
          height: 12px;
          fill: #ffffff !important;
          stroke: none !important;
        }

        th:hover .sort-icon { opacity: 0.8; }
        .sort-icon.active   { opacity: 1; }
        .sort-icon.active svg { fill: #ffffff !important; }

        /* ---- BODY ---- */
        .vis-table tbody td {
          padding: 18px 24px;
          border-bottom: 1px solid #f0f2f5;
          color: #1a1a2e;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vis-table.size-fit tbody td {
          max-width: none;
        }

        .vis-table:not(.size-fit) tbody td {
          max-width: 300px;
        }

        .vis-table tbody tr:last-child td { border-bottom: none; }
        .vis-table tbody tr:hover td { background: #f5f7fa !important; }

        .vis-table tbody td.measure-cell {
          text-align: right;
          font-weight: 500;
          color: #1a1a2e;
        }

        .vis-table tbody td.row-number-cell {
          color: #9ca3af;
          font-size: 12px;
          text-align: right;
          width: 36px;
          padding-right: 8px;
        }

        .vis-table tbody td.has-link {
          cursor: pointer;
          color: #1B4769;
          font-weight: 600;
        }

        .vis-table tbody td.has-link:hover { text-decoration: underline; }

        /* Prevent Looker's anchor from double-navigating */
        .vis-table tbody td.has-link a {
          pointer-events: none;
          text-decoration: none;
          color: inherit;
        }

        /* Conditional formatting cells — text color is set inline */
        .vis-table tbody td.cf-cell {
          font-weight: 600;
        }

        /* ---- TOTALS ---- */
        .vis-table tfoot td {
          padding: 14px 24px;
          font-weight: 700;
          color: #111;
          border-top: 2px solid #e5e7eb;
          background: #f9fafb;
          white-space: nowrap;
          font-size: 15px;
        }

        .vis-table tfoot td.measure-cell { text-align: right; }

        /* ---- COMPACT ---- */
        .compact .vis-table thead th,
        .compact .vis-table tbody td,
        .compact .vis-table tfoot td {
          padding: 8px 16px;
        }

        /* ---- ZEBRA ---- */
        .zebra-on .vis-table tbody tr:nth-child(even) td { background: #f8f9fb; }
        .zebra-on .vis-table tbody tr:nth-child(even):hover td { background: #f0f2f5 !important; }

        /* ---- PAGINATION ---- */
        .vis-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-top: 1px solid #f0f2f5;
          flex-shrink: 0;
          gap: 12px;
          flex-wrap: wrap;
        }

        .vis-pagination-info {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }

        .vis-pagination-controls { display: flex; align-items: center; gap: 4px; }

        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 6px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Nunito', sans-serif;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          user-select: none;
        }

        .page-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
        .page-btn.active { background: #F5A623; border-color: #F5A623; color: #ffffff; }
        .page-btn:disabled { opacity: 0.35; cursor: default; }
        .page-btn.ellipsis { cursor: default; border-color: transparent; background: transparent; }
        .page-btn.ellipsis:hover { background: transparent; border-color: transparent; }
      </style>

      <div class="vis-table-outer">
        <div class="vis-table-wrapper style-card" id="table-wrapper">
          <div class="vis-table-scroll" id="table-scroll">
            <table class="vis-table" id="vis-table">
              <thead id="table-head"></thead>
              <tbody id="table-body"></tbody>
              <tfoot id="table-foot"></tfoot>
            </table>
          </div>
          <div class="vis-pagination" id="table-pagination" style="display:none;"></div>
        </div>
      </div>
    `;
  },

  // ─── Colour helpers ────────────────────────────────────────────────────────

  _hexToRgb: function(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  },

  _interpolateRgb: function(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  },

  _luminance: function(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  },

  _cfColor: function(value, min, max, palette, reverse) {
    const CF_PALETTES = {
      blue:          { type: 'linear', start: '#ffffff', end: '#3B82F6' },
      pink:          { type: 'linear', start: '#ffffff', end: '#EC4899' },
      purple:        { type: 'linear', start: '#ffffff', end: '#6c43e0' },
      green:         { type: 'linear', start: '#ffffff', end: '#22C55E' },
      white_red:     { type: 'linear', start: '#ffffff', end: '#EF4444' },
      redwhitegreen: { type: 'diverging', low: '#EF4444', mid: '#ffffff', high: '#22C55E' }
    };

    const def = CF_PALETTES[palette] || CF_PALETTES.blue;
    let t = (max === min) ? 0.5 : (value - min) / (max - min);
    t = Math.max(0, Math.min(1, t));
    if (reverse) t = 1 - t;

    let rgb;
    if (def.type === 'diverging') {
      const low  = this._hexToRgb(def.low);
      const mid  = this._hexToRgb(def.mid);
      const high = this._hexToRgb(def.high);
      if (t < 0.5) {
        rgb = this._interpolateRgb(low, mid, t * 2);
      } else {
        rgb = this._interpolateRgb(mid, high, (t - 0.5) * 2);
      }
    } else {
      rgb = this._interpolateRgb(this._hexToRgb(def.start), this._hexToRgb(def.end), t);
    }

    const textColor = this._luminance(...rgb) > 0.45 ? '#111111' : '#ffffff';
    return { bg: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, text: textColor };
  },

  // ─── Main render ───────────────────────────────────────────────────────────

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    const dimensions = queryResponse.fields.dimension_like || [];
    const measures   = queryResponse.fields.measure_like   || [];
    const pivots     = queryResponse.pivots || [];

    if (dimensions.length === 0 && measures.length === 0) {
      this.addError({ title: 'No Fields', message: 'Add at least one dimension or measure to the query.' });
      return done();
    }

    const wrapper    = element.querySelector('#table-wrapper');
    const thead      = element.querySelector('#table-head');
    const tbody      = element.querySelector('#table-body');
    const tfoot      = element.querySelector('#table-foot');
    const pagination = element.querySelector('#table-pagination');
    const table      = element.querySelector('#vis-table');
    const scroll     = element.querySelector('#table-scroll');

    if (!wrapper) return done();

    // Apply wrapper styles
    wrapper.className = 'vis-table-wrapper ' + (config.card_style === 'transparent' ? 'style-transparent' : 'style-card');
    if (config.compact) wrapper.classList.add('compact');
    if (config.zebra_striping) wrapper.classList.add('zebra-on');

    scroll.style.fontSize = (config.font_size || 15) + 'px';

    // Size-to-fit: natural table width vs 100%
    if (config.size_columns_to_fit) {
      table.classList.add('size-fit');
      table.style.tableLayout = 'auto';
    } else {
      table.classList.remove('size-fit');
      table.style.tableLayout = '';
      table.style.width = '100%';
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="100" style="text-align:center;color:#9ca3af;padding:40px;font-family:'Nunito',sans-serif;">No data</td></tr>`;
      thead.innerHTML = '';
      tfoot.innerHTML = '';
      pagination.style.display = 'none';
      return done();
    }

    // ── Column definitions ──────────────────────────────────────────────────

    const getLabel = (field) => {
      if (config.show_full_field_name) return field.label;
      return field.label_short || field.label;
    };

    const truncLabel = (label) => {
      if (!config.truncate_column_names) return label;
      const max = config.truncate_column_length || 20;
      return label.length > max ? label.slice(0, max) + '…' : label;
    };

    const columns = [];

    if (config.show_row_numbers) {
      columns.push({ key: '__rownum__', label: '#', type: 'row_number', sortable: false });
    }

    dimensions.forEach(dim => {
      columns.push({
        key: dim.name,
        label: truncLabel(getLabel(dim)),
        fullLabel: getLabel(dim),
        type: 'dimension',
        field: dim,
        sortable: true
      });
    });

    if (pivots.length > 0) {
      pivots.forEach(pivot => {
        measures.forEach(measure => {
          columns.push({
            key: `${measure.name}$$${pivot.key}`,
            label: truncLabel(`${pivot.key} — ${getLabel(measure)}`),
            fullLabel: `${pivot.key} — ${getLabel(measure)}`,
            type: 'measure',
            field: measure,
            measureName: measure.name,
            pivotKey: pivot.key,
            sortable: true
          });
        });
      });
    } else {
      measures.forEach(measure => {
        columns.push({
          key: measure.name,
          label: truncLabel(getLabel(measure)),
          fullLabel: getLabel(measure),
          type: 'measure',
          field: measure,
          measureName: measure.name,
          pivotKey: null,
          sortable: true
        });
      });
    }

    // ── Sorting ─────────────────────────────────────────────────────────────

    const getCellValue = (row, col) => {
      if (col.type === 'row_number') return null;
      if (col.type === 'dimension') return row[col.key] ? row[col.key].value : null;
      if (col.pivotKey) return row[col.measureName] && row[col.measureName][col.pivotKey] ? row[col.measureName][col.pivotKey].value : null;
      return row[col.measureName] ? row[col.measureName].value : null;
    };

    let sortedData = [...data];
    if (this._sortCol) {
      const sortCol = columns.find(c => c.key === this._sortCol);
      if (sortCol && sortCol.sortable) {
        sortedData.sort((a, b) => {
          const aVal = getCellValue(a, sortCol);
          const bVal = getCellValue(b, sortCol);
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return this._sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }

    // ── Conditional Formatting ranges ───────────────────────────────────────

    const cfRanges = {};
    if (config.enable_cf) {
      const cfCols = columns.filter(col =>
        col.type === 'measure' ||
        (config.cf_apply_to === 'all_numeric' && col.type === 'dimension')
      );

      let globalMin = Infinity, globalMax = -Infinity;

      cfCols.forEach(col => {
        let min = Infinity, max = -Infinity;
        sortedData.forEach(row => {
          let val = getCellValue(row, col);
          if (val === null && config.cf_null_as_zero) val = 0;
          if (val !== null && typeof val === 'number') {
            if (val < min) min = val;
            if (val > max) max = val;
            if (val < globalMin) globalMin = val;
            if (val > globalMax) globalMax = val;
          }
        });
        cfRanges[col.key] = { min, max };
      });

      if (config.cf_range === 'global') {
        cfCols.forEach(col => { cfRanges[col.key] = { min: globalMin, max: globalMax }; });
      }
    }

    // ── Pagination ──────────────────────────────────────────────────────────

    const usePagination = config.enable_pagination !== false;
    const pageSize  = Math.max(1, config.page_size || 20);
    const totalRows = sortedData.length;
    const totalPages = Math.ceil(totalRows / pageSize);

    if (this._currentPage > totalPages) this._currentPage = 1;

    const pageData = usePagination
      ? sortedData.slice((this._currentPage - 1) * pageSize, this._currentPage * pageSize)
      : sortedData;

    // ── Header ──────────────────────────────────────────────────────────────

    const headerBg    = config.header_bg_color   || '#1B4769';
    const headerText  = config.header_text_color  || '#ffffff';
    const headerSize  = config.header_font_size   || 13;
    const stickyClass = config.sticky_header !== false ? 'sticky-header' : '';
    const headerTransform = config.header_uppercase ? 'text-transform:uppercase;letter-spacing:0.5px;' : '';

    const ICON_UNSORTED = `<svg viewBox="0 0 10 14" xmlns="http://www.w3.org/2000/svg"><path d="M5 0L9 5H1L5 0Z"/><path d="M5 14L1 9H9L5 14Z"/></svg>`;
    const ICON_ASC      = `<svg viewBox="0 0 10 8"  xmlns="http://www.w3.org/2000/svg"><path d="M5 0L9 8H1L5 0Z"/></svg>`;
    const ICON_DESC     = `<svg viewBox="0 0 10 8"  xmlns="http://www.w3.org/2000/svg"><path d="M5 8L1 0H9L5 8Z"/></svg>`;

    thead.innerHTML = `
      <tr>
        ${columns.map(col => {
          const isActive  = this._sortCol === col.key;
          const sortSvg   = isActive ? (this._sortDir === 'asc' ? ICON_ASC : ICON_DESC) : ICON_UNSORTED;
          const titleAttr = col.fullLabel !== col.label ? `title="${col.fullLabel}"` : '';
          return `
            <th
              class="${stickyClass}"
              style="background:${headerBg};color:${headerText};font-size:${headerSize}px;${headerTransform}"
              data-col-key="${col.key}"
              ${titleAttr}
            >
              <div class="col-inner">
                <span>${col.label}</span>
                ${col.sortable ? `<span class="sort-icon ${isActive ? 'active' : ''}">${sortSvg}</span>` : ''}
              </div>
            </th>
          `;
        }).join('')}
      </tr>
    `;

    // ── Rows ────────────────────────────────────────────────────────────────

    tbody.innerHTML = pageData.map((row, rowIdx) => {
      const absIdx = usePagination ? (this._currentPage - 1) * pageSize + rowIdx : rowIdx;
      const zebraStyle = config.zebra_striping && absIdx % 2 === 1 ? 'background:#f8f9fb;' : '';

      const cells = columns.map(col => {
        if (col.type === 'row_number') {
          return `<td class="row-number-cell" style="${zebraStyle}">${absIdx + 1}</td>`;
        }

        let cell;
        if (col.type === 'dimension') {
          cell = row[col.key];
        } else if (col.pivotKey) {
          cell = row[col.measureName] && row[col.measureName][col.pivotKey];
        } else {
          cell = row[col.measureName];
        }

        const formatted = cell ? LookerCharts.Utils.htmlForCell(cell) : '';
        const hasLinks  = cell && cell.links && cell.links.length > 0;
        const isMeasure = col.type === 'measure';

        // Conditional formatting
        let cfStyle = zebraStyle;
        let cfClass = '';
        if (config.enable_cf && cfRanges[col.key]) {
          let val = getCellValue(row, col);
          if (val === null && config.cf_null_as_zero) val = 0;
          if (val !== null && typeof val === 'number') {
            const { min, max } = cfRanges[col.key];
            const { bg, text } = this._cfColor(val, min, max, config.cf_palette || 'blue', config.cf_reverse_colors || false);
            cfStyle = `background:${bg};color:${text};`;
            cfClass = 'cf-cell';
          }
        }

        const minWidthStyle = config.size_columns_to_fit
          ? `min-width:${config.min_column_width || 120}px;`
          : '';

        return `
          <td
            class="${isMeasure ? 'measure-cell' : ''} ${hasLinks ? 'has-link' : ''} ${cfClass}"
            data-row-idx="${rowIdx}"
            data-col-key="${col.key}"
            style="${cfStyle}${minWidthStyle}"
          >${formatted}</td>
        `;
      }).join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    // ── Totals row ──────────────────────────────────────────────────────────

    if (config.show_totals_row && queryResponse.totals_data && queryResponse.totals_data.length > 0) {
      const totals = queryResponse.totals_data[0];
      tfoot.innerHTML = `
        <tr>
          ${columns.map(col => {
            if (col.type === 'row_number') return `<td></td>`;
            if (col.type === 'dimension') return `<td><strong>Total</strong></td>`;
            let cell;
            if (col.pivotKey) {
              cell = totals[col.measureName] && totals[col.measureName][col.pivotKey];
            } else {
              cell = totals[col.measureName];
            }
            const formatted = cell ? LookerCharts.Utils.htmlForCell(cell) : '';
            return `<td class="measure-cell">${formatted}</td>`;
          }).join('')}
        </tr>
      `;
    } else {
      tfoot.innerHTML = '';
    }

    // ── Pagination footer ───────────────────────────────────────────────────

    if (usePagination && totalPages > 1) {
      const start = (this._currentPage - 1) * pageSize + 1;
      const end   = Math.min(this._currentPage * pageSize, totalRows);
      const pageButtons = this._buildPageButtons(this._currentPage, totalPages);

      pagination.style.display = 'flex';
      pagination.innerHTML = `
        <span class="vis-pagination-info">Showing ${start} to ${end} of ${totalRows} results</span>
        <div class="vis-pagination-controls">
          <button class="page-btn" data-page="${this._currentPage - 1}" ${this._currentPage === 1 ? 'disabled' : ''}>&#8249;</button>
          ${pageButtons.map(p => {
            if (p === '...') return `<button class="page-btn ellipsis" disabled>…</button>`;
            return `<button class="page-btn ${p === this._currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
          }).join('')}
          <button class="page-btn" data-page="${this._currentPage + 1}" ${this._currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>
        </div>
      `;
    } else if (usePagination && totalRows > 0) {
      pagination.style.display = 'flex';
      pagination.innerHTML = `<span class="vis-pagination-info">Showing all ${totalRows} results</span>`;
    } else {
      pagination.style.display = 'none';
    }

    // ── Event listeners ─────────────────────────────────────────────────────

    thead.querySelectorAll('th[data-col-key]').forEach(th => {
      th.addEventListener('click', () => {
        const colKey = th.getAttribute('data-col-key');
        const col = columns.find(c => c.key === colKey);
        if (!col || !col.sortable) return;
        if (this._sortCol === colKey) {
          this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this._sortCol = colKey;
          this._sortDir = 'asc';
        }
        this._currentPage = 1;
        this.updateAsync(data, element, config, queryResponse, details, done);
      });
    });

    tbody.querySelectorAll('td.has-link').forEach(td => {
      td.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const rowIdx = parseInt(td.getAttribute('data-row-idx'));
        const colKey = td.getAttribute('data-col-key');
        const col    = columns.find(c => c.key === colKey);
        if (!col) return;
        const row = pageData[rowIdx];
        let cell;
        if (col.type === 'dimension') {
          cell = row[col.key];
        } else if (col.pivotKey) {
          cell = row[col.measureName] && row[col.measureName][col.pivotKey];
        } else {
          cell = row[col.measureName];
        }
        if (cell && cell.links && cell.links.length > 0) {
          LookerCharts.Utils.openDrillMenu({ links: cell.links, event });
        }
      });
    });

    pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'));
        if (!page || page < 1 || page > totalPages) return;
        this._currentPage = page;
        this.updateAsync(data, element, config, queryResponse, details, done);
      });
    });

    done();
  },

  _buildPageButtons: function(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }
});
