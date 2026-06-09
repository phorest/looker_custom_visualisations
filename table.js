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
      default: true
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
    font_size: {
      type: "number",
      label: "Font Size (px)",
      section: "Style",
      default: 14,
      display: "text"
    },
    sticky_header: {
      type: "boolean",
      label: "Sticky Header",
      section: "Style",
      default: true
    },

    // --- HEADER ---
    header_bg_color: {
      type: "string",
      label: "Header Background",
      display: "color",
      section: "Header",
      default: "#6c43e0"
    },
    header_text_color: {
      type: "string",
      label: "Header Text Color",
      display: "color",
      section: "Header",
      default: "#ffffff"
    },
    header_uppercase: {
      type: "boolean",
      label: "Uppercase Headers",
      section: "Header",
      default: true
    },

    // --- TOTALS ---
    show_totals_row: {
      type: "boolean",
      label: "Show Totals Row",
      section: "Totals",
      default: false
    }
  },

  create: function(element, config) {
    this._sortCol = null;
    this._sortDir = 'asc';

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
          overflow: auto;
          font-family: 'Nunito', sans-serif;
          box-sizing: border-box;
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

        .vis-table {
          width: 100%;
          border-collapse: collapse;
        }

        .vis-table thead th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.4px;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          border-bottom: 2px solid rgba(0,0,0,0.08);
          z-index: 10;
        }

        .vis-table thead th.sticky-header {
          position: sticky;
          top: 0;
        }

        .vis-table thead th:hover {
          filter: brightness(1.1);
        }

        .vis-table thead th .col-inner {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vis-table thead th.measure-header .col-inner {
          justify-content: flex-end;
        }

        .sort-icon {
          font-size: 10px;
          opacity: 0.5;
          flex-shrink: 0;
        }

        .sort-icon.active {
          opacity: 1;
        }

        .vis-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }

        .vis-table tbody tr:last-child td {
          border-bottom: none;
        }

        .vis-table tbody tr:hover td {
          background: #f9fafb !important;
        }

        .vis-table tbody td.measure-cell {
          text-align: right;
          font-weight: 600;
          color: #111111;
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
          color: #6c43e0;
          font-weight: 600;
        }

        .vis-table tbody td.has-link:hover {
          text-decoration: underline;
        }

        .vis-table tfoot td {
          padding: 10px 16px;
          font-weight: 700;
          color: #111;
          border-top: 2px solid #e5e7eb;
          background: #f9fafb;
          white-space: nowrap;
        }

        .vis-table tfoot td.measure-cell {
          text-align: right;
        }

        .compact .vis-table thead th,
        .compact .vis-table tbody td,
        .compact .vis-table tfoot td {
          padding: 6px 12px;
        }
      </style>

      <div class="vis-table-outer">
        <div class="vis-table-wrapper style-card" id="table-wrapper">
          <table class="vis-table" id="vis-table">
            <thead id="table-head"></thead>
            <tbody id="table-body"></tbody>
            <tfoot id="table-foot"></tfoot>
          </table>
        </div>
      </div>
    `;
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    const dimensions = queryResponse.fields.dimension_like || [];
    const measures = queryResponse.fields.measure_like || [];
    const pivots = queryResponse.pivots || [];

    if (dimensions.length === 0 && measures.length === 0) {
      this.addError({ title: 'No Fields', message: 'Add at least one dimension or measure to the query.' });
      return done();
    }

    const wrapper = element.querySelector('#table-wrapper');
    const thead = element.querySelector('#table-head');
    const tbody = element.querySelector('#table-body');
    const tfoot = element.querySelector('#table-foot');

    if (!wrapper) return done();

    // Card style
    wrapper.className = 'vis-table-wrapper ' + (config.card_style === 'transparent' ? 'style-transparent' : 'style-card');
    if (config.compact) wrapper.classList.add('compact');

    wrapper.style.fontSize = (config.font_size || 14) + 'px';

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="100" style="text-align:center;color:#9ca3af;padding:32px;font-family:'Nunito',sans-serif;">No data</td></tr>`;
      thead.innerHTML = '';
      tfoot.innerHTML = '';
      return done();
    }

    // Build column definitions
    const columns = [];

    if (config.show_row_numbers) {
      columns.push({ key: '__rownum__', label: '#', type: 'row_number', sortable: false });
    }

    dimensions.forEach(dim => {
      columns.push({
        key: dim.name,
        label: dim.label_short || dim.label,
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
            label: `${pivot.key} — ${measure.label_short || measure.label}`,
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
          label: measure.label_short || measure.label,
          type: 'measure',
          field: measure,
          measureName: measure.name,
          pivotKey: null,
          sortable: true
        });
      });
    }

    // Styling vars
    const headerBg = config.header_bg_color || '#6c43e0';
    const headerText = config.header_text_color || '#ffffff';
    const stickyClass = config.sticky_header !== false ? 'sticky-header' : '';
    const headerTransform = config.header_uppercase !== false ? 'text-transform:uppercase;' : '';

    // Build header
    thead.innerHTML = `
      <tr>
        ${columns.map(col => {
          const isMeasure = col.type === 'measure';
          const isActive = this._sortCol === col.key;
          const sortIcon = isActive
            ? (this._sortDir === 'asc' ? '↑' : '↓')
            : '↕';
          return `
            <th
              class="${isMeasure ? 'measure-header' : ''} ${stickyClass}"
              style="background:${headerBg};color:${headerText};${headerTransform}"
              data-col-key="${col.key}"
            >
              <div class="col-inner">
                <span>${col.label}</span>
                ${col.sortable ? `<span class="sort-icon ${isActive ? 'active' : ''}">${sortIcon}</span>` : ''}
              </div>
            </th>
          `;
        }).join('')}
      </tr>
    `;

    // Sort data
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

    // Build rows
    tbody.innerHTML = sortedData.map((row, rowIdx) => {
      const zebraStyle = config.zebra_striping && rowIdx % 2 === 1
        ? 'background:#f9fafb;'
        : '';

      const cells = columns.map(col => {
        if (col.type === 'row_number') {
          return `<td class="row-number-cell" style="${zebraStyle}">${rowIdx + 1}</td>`;
        }

        let cell;
        if (col.type === 'dimension') {
          cell = row[col.key];
        } else if (col.pivotKey) {
          cell = row[col.measureName] && row[col.measureName][col.pivotKey];
        } else {
          cell = row[col.measureName];
        }

        if (!cell) return `<td style="${zebraStyle}"></td>`;

        const formatted = LookerCharts.Utils.htmlForCell(cell);
        const hasLinks = cell.links && cell.links.length > 0;
        const isMeasure = col.type === 'measure';

        return `
          <td
            class="${isMeasure ? 'measure-cell' : ''} ${hasLinks ? 'has-link' : ''}"
            data-row-idx="${rowIdx}"
            data-col-key="${col.key}"
            style="${zebraStyle}"
          >${formatted}</td>
        `;
      }).join('');

      return `<tr>${cells}</tr>`;
    }).join('');

    // Build totals row
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

    // Sort click handlers
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
        this.updateAsync(data, element, config, queryResponse, details, done);
      });
    });

    // Drill click handlers
    tbody.querySelectorAll('td.has-link').forEach(td => {
      td.addEventListener('click', (event) => {
        const rowIdx = parseInt(td.getAttribute('data-row-idx'));
        const colKey = td.getAttribute('data-col-key');
        const col = columns.find(c => c.key === colKey);
        if (!col) return;

        const row = sortedData[rowIdx];
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

    done();
  }
});
