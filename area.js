looker.plugins.visualizations.add({
  options: {
    // --- PLOT ---
    positioning: {
      type: "string",
      label: "Series Mode",
      display: "select",
      section: "Plot",
      values: [
        { "Overlay (Standard)": "overlay" },
        { "Stacked": "stacked" }
      ],
      default: "overlay"
    },
    line_tension: {
      type: "number",
      label: "Line Curvature (0-1)",
      section: "Plot",
      default: 0.4,
      min: 0,
      max: 1,
      step: 0.1
    },
    fill_opacity: {
      type: "number",
      label: "Area Fill Opacity (0-1)",
      section: "Plot",
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.1
    },
    enable_crossfilter: {
      type: "boolean",
      label: "Enable Cross-Filtering",
      section: "Plot",
      default: false,
      order: 10
    },
    hide_legend: {
      type: "boolean",
      label: "Hide Legend",
      section: "Plot",
      default: false
    },

    // --- TITLE ---
    show_chart_title: {
      type: "boolean",
      label: "Show Chart Title",
      section: "Title",
      default: true
    },
    chart_title_text: {
      type: "string",
      label: "Title Text",
      section: "Title",
      placeholder: "Leave blank to use default",
      display: "text"
    },
    chart_title_align: {
      type: "string",
      label: "Alignment",
      display: "select",
      section: "Title",
      values: [
        {"Left": "start"},
        {"Center": "center"},
        {"Right": "end"}
      ],
      default: "start"
    },
    chart_title_size: {
      type: "number",
      label: "Title Font Size (px)",
      section: "Title",
      default: 24,
      display: "text"
    },
    chart_title_padding: {
      type: "number",
      label: "Title Padding (px)",
      section: "Title",
      default: 20,
      display: "text"
    },

    // --- SERIES ---
    color_theme: {
      type: "string",
      label: "Color Collection",
      display: "select",
      section: "Series",
      values: [
        {"Shoreline (Blues/Teals)": "shoreline"},
        {"Phorest (Purples)": "phorest"},
        {"Vivid (Bright)": "vivid"},
        {"Boardwalk (Classic)": "boardwalk"},
        {"Neutral (Greys)": "neutral"}
      ],
      default: "shoreline"
    },
    custom_color_overrides: {
      type: "string",
      label: "Custom Colors (Comma separated)",
      section: "Series",
      placeholder: "#336699, #cc0000, #00cc00"
    },
    series_labels_overrides: {
      type: "string",
      label: "Series Rename (Comma separated)",
      section: "Series",
      placeholder: "Services, Products, Courses",
      order: 1
    },
    reverse_colors: {
      type: "boolean",
      label: "Reverse Color Order",
      section: "Series",
      default: false
    },

    // --- VALUES ---
    show_values: {
      type: "boolean",
      label: "Show Point Labels",
      section: "Values",
      default: false
    },
    value_font_size: {
      type: "number",
      label: "Label Size (px)",
      section: "Values",
      default: 11
    },

    // --- X AXIS ---
    show_xaxis_name: {
      type: "boolean",
      label: "Show Axis Name",
      section: "X",
      default: false
    },
    xaxis_name_override: {
      type: "string",
      label: "Axis Name (Override)",
      section: "X",
      placeholder: "Leave blank for default"
    },
    xaxis_label_rotation: {
      type: "number",
      label: "Label Rotation",
      section: "X",
      default: 0,
      min: -360,
      max: 360
    },
    show_x_gridlines: {
      type: "boolean",
      label: "Show Gridlines",
      section: "X",
      default: false
    },

    // --- Y AXIS ---
    show_y_gridlines: {
      type: "boolean",
      label: "Show Gridlines",
      section: "Y",
      default: true
    },
    y_axis_reverse: {
      type: "boolean",
      label: "Reverse Axis",
      section: "Y",
      default: false
    },
    show_yaxis_name: {
      type: "boolean",
      label: "Show Axis Name",
      section: "Y",
      default: false
    },
    y_axis_name: {
      type: "string",
      label: "Axis Name (Override)",
      section: "Y",
      placeholder: "Leave blank for default"
    },
    show_y_axis_values: {
      type: "boolean",
      label: "Show Axis Values",
      section: "Y",
      default: true
    },
    unpin_y_from_zero: {
      type: "boolean",
      label: "Unpin Axis From Zero",
      section: "Y",
      default: false
    },
    y_axis_min: {
      type: "number",
      label: "Minimum Value",
      section: "Y",
      display: "text",
      placeholder: "Auto"
    },
    y_axis_max: {
      type: "number",
      label: "Maximum Value",
      section: "Y",
      display: "text",
      placeholder: "Auto"
    },
    y_axis_tick_count: {
      type: "number",
      label: "Tick Count",
      section: "Y",
      default: 6,
      display: "text"
    },

    // --- REFERENCE LINE ---
    show_reference_line: {
      type: "boolean",
      label: "Show Reference Line",
      section: "Reference Line",
      default: false
    },
    reference_line_value: {
      type: "number",
      label: "Value",
      section: "Reference Line",
      display: "text",
      placeholder: "e.g. 1000"
    },
    reference_line_label: {
      type: "string",
      label: "Label",
      section: "Reference Line",
      placeholder: "e.g. Target"
    },
    reference_line_color: {
      type: "string",
      label: "Color",
      display: "color",
      section: "Reference Line",
      default: "#EF4444"
    }
  },

  create: function(element, config) {
    this.chartLoaded = false;
    this._triggerUpdate = null;
    this._resizeObserver = null;

    const _markLoaded = () => { this.chartLoaded = true; this.triggerUpdate(); };

    if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
      this.chartLoaded = true;
    } else if (!document.getElementById('chartjs-script')) {
      const script = document.createElement('script');
      script.id = 'chartjs-script';
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4';
      script.onload = () => {
        if (document.getElementById('chartjs-datalabels')) { _markLoaded(); return; }
        const dlScript = document.createElement('script');
        dlScript.id = 'chartjs-datalabels';
        dlScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0';
        dlScript.onload = dlScript.onerror = () => {
          if (document.getElementById('chartjs-annotation')) { _markLoaded(); return; }
          const annScript = document.createElement('script');
          annScript.id = 'chartjs-annotation';
          annScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3/dist/chartjs-plugin-annotation.min.js';
          annScript.onload = annScript.onerror = _markLoaded;
          document.head.appendChild(annScript);
        };
        document.head.appendChild(dlScript);
      };
      document.head.appendChild(script);
    }

    element.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

        html, body, #vis {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          font-family: 'Nunito', sans-serif;
        }

        .vis-wrapper {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          padding: 0;
          background: #ffffff;
        }

        .style-card {
          background: #ffffff;
          padding: 20px;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .chart-container {
          position: relative;
          flex-grow: 1;
          width: 100%;
          overflow: hidden;
        }

        #chartjs-tooltip {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          padding: 12px 16px;
          color: #111;
          pointer-events: none;
          position: absolute;
          transition: opacity 0.1s ease;
          z-index: 100;
          min-width: 160px;
          font-family: 'Nunito', sans-serif;
        }

        .tooltip-date {
          font-size: 12px;
          color: #9CA3AF;
          font-weight: 500;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f0f0f0;
        }

        .tooltip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 3px 0;
        }

        .tooltip-series {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tooltip-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          display: inline-block;
        }

        .tooltip-name {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .tooltip-value {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          white-space: nowrap;
        }
      </style>

      <div class="vis-wrapper">
        <div class="style-card">
          <div class="chart-container">
            <canvas id="myChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  triggerUpdate: function() {
    if (this._triggerUpdate) this._triggerUpdate();
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this._triggerUpdate = () => { this.updateAsync(data, element, config, queryResponse, details, done); };

    if (!this.chartLoaded || typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') return;

    this.clearErrors();

    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;

    if (!dimensions || dimensions.length === 0) {
      this.addError({ title: 'Missing Dimension', message: 'Add at least one dimension to the query.' });
      return done();
    }
    if (!measures || measures.length === 0) {
      this.addError({ title: 'Missing Measure', message: 'Add at least one measure to the query.' });
      return done();
    }

    const chartContainer = element.querySelector('.chart-container');
    if (!data || data.length === 0) {
      if (chartContainer) chartContainer.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">No Data</div>`;
      return done();
    }

    const pivots = queryResponse.pivots || [];

    const xLabels = data.map(row => {
      const val = row[dimensions[0].name].value;
      return val !== null ? LookerCharts.Utils.textForCell(row[dimensions[0].name]) : 'Unknown';
    });

    const PALETTES = {
      "shoreline": ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
      "phorest": ["#6c43e0", "#a56de2", "#e384dc", "#eda3c5", "#f0c3b0"],
      "vivid": ["#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3"],
      "boardwalk": ["#3D52B9", "#00A2E8", "#45BF55", "#F2C744", "#F28B20"],
      "neutral": ["#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"]
    };

    const hexToRgba = (hex, opacity) => {
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        let c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${opacity})`;
      }
      return hex;
    };

    let selectedColors = PALETTES[config.color_theme] || PALETTES["shoreline"];
    if (config.custom_color_overrides && config.custom_color_overrides.trim().length > 0) {
      selectedColors = config.custom_color_overrides.split(',').map(c => c.trim());
    }
    if (config.reverse_colors) selectedColors = [...selectedColors].reverse();
    const getColor = (idx) => selectedColors[idx % selectedColors.length];

    let seriesOverrides = [];
    if (config.series_labels_overrides && config.series_labels_overrides.trim() !== '') {
      seriesOverrides = config.series_labels_overrides.split(',').map(s => s.trim());
    }

    const datasets = [];
    const SPACER = '   ';

    const commonStyle = {
      fill: true,
      spanGaps: true,
      tension: config.line_tension !== undefined ? config.line_tension : 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2
    };

    if (pivots.length > 0) {
      pivots.forEach((pivot, index) => {
        measures.forEach((measure) => {
          const datasetData = data.map(row => {
            const cell = row[measure.name][pivot.key];
            return cell.value !== null ? cell.value : null;
          });
          const rawLabel = seriesOverrides[index] ? seriesOverrides[index] : pivot.key;
          const baseColor = getColor(index);
          datasets.push({
            ...commonStyle,
            label: SPACER + rawLabel,
            originalLabel: rawLabel,
            _measureName: measure.name,
            _pivotKey: pivot.key,
            data: datasetData,
            borderColor: baseColor,
            pointBorderColor: baseColor,
            backgroundColor: hexToRgba(baseColor, config.fill_opacity !== undefined ? config.fill_opacity : 0.3)
          });
        });
      });
    } else {
      measures.forEach((measure, index) => {
        const datasetData = data.map(row => row[measure.name].value);
        const rawLabel = seriesOverrides[index] ? seriesOverrides[index] : (measure.label_short || measure.label);
        const baseColor = getColor(index);
        datasets.push({
          ...commonStyle,
          label: SPACER + rawLabel,
          originalLabel: rawLabel,
          _measureName: measure.name,
          _pivotKey: null,
          data: datasetData,
          borderColor: baseColor,
          pointBorderColor: baseColor,
          backgroundColor: hexToRgba(baseColor, config.fill_opacity !== undefined ? config.fill_opacity : 0.3)
        });
      });
    }

    const canvas = document.getElementById('myChart');
    if (!canvas) return done();
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const safeFormat = (value) => {
      if (value === null || value === undefined) return '';
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const clickHandler = (evt, elements, chart) => {
      if (!elements || elements.length === 0) return;
      const el = elements[0];
      const rowIndex = el.index;
      const dataset = chart.data.datasets[el.datasetIndex];

      if (config.enable_crossfilter && LookerCharts.Utils.toggleCrossfilter) {
        LookerCharts.Utils.toggleCrossfilter({ row: data[rowIndex], event: evt.native || evt });
        return;
      }

      const row = data[rowIndex];
      const cell = dataset._pivotKey
        ? (row[dataset._measureName] && row[dataset._measureName][dataset._pivotKey])
        : row[dataset._measureName];
      if (cell && cell.links && cell.links.length > 0) {
        LookerCharts.Utils.openDrillMenu({ links: cell.links, event: evt.native || evt });
      }
    };

    const getOrCreateTooltip = (chart) => {
      let el = chart.canvas.parentNode.querySelector('div#chartjs-tooltip');
      if (!el) {
        el = document.createElement('div');
        el.id = 'chartjs-tooltip';
        chart.canvas.parentNode.appendChild(el);
      }
      return el;
    };

    const externalTooltipHandler = (context) => {
      const { chart, tooltip } = context;
      const tooltipEl = getOrCreateTooltip(chart);

      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
      }

      if (tooltip.body && tooltip.dataPoints && tooltip.dataPoints.length > 0) {
        const dateLabel = tooltip.dataPoints[0].label;

        const rowsHtml = tooltip.dataPoints.map(dp => {
          const dataset = dp.dataset;
          const color = dataset.borderColor;
          const seriesName = dataset.originalLabel || dataset.label.trim();
          const row = data[dp.dataIndex];
          let formattedValue = safeFormat(dp.raw);
          let isLink = false;
          if (row) {
            const cell = dataset._pivotKey
              ? (row[dataset._measureName] && row[dataset._measureName][dataset._pivotKey])
              : row[dataset._measureName];
            if (cell) {
              formattedValue = LookerCharts.Utils.textForCell(cell);
              isLink = !!(cell.links && cell.links.length > 0);
            }
          }
          const valueStyle = isLink
            ? 'color:#3B82F6;text-decoration:underline;text-underline-offset:2px;'
            : '';
          return `
            <div class="tooltip-row">
              <div class="tooltip-series">
                <span class="tooltip-dot" style="background:${color}"></span>
                <span class="tooltip-name">${seriesName}</span>
              </div>
              <span class="tooltip-value" style="${valueStyle}">${formattedValue}</span>
            </div>
          `;
        }).join('');

        tooltipEl.innerHTML = `
          <div class="tooltip-date">${dateLabel}</div>
          ${rowsHtml}
        `;
      }

      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
      const tooltipWidth = tooltipEl.offsetWidth;
      const chartWidth = chart.width;

      let targetLeft = positionX + tooltip.caretX - tooltipWidth / 2;
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft + tooltipWidth > chartWidth) targetLeft = chartWidth - tooltipWidth;

      tooltipEl.style.opacity = 1;
      tooltipEl.style.left = targetLeft + 'px';
      tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    };

    const annotationConfig = {};
    if (config.show_reference_line && config.reference_line_value != null) {
      const refVal = parseFloat(config.reference_line_value);
      if (!isNaN(refVal)) {
        const lineColor = config.reference_line_color || '#EF4444';
        annotationConfig.refLine = {
          type: 'line',
          yMin: refVal,
          yMax: refVal,
          borderColor: lineColor,
          borderWidth: 2,
          borderDash: [6, 4],
          label: {
            display: true,
            content: config.reference_line_label || safeFormat(refVal),
            position: 'end',
            backgroundColor: lineColor,
            color: '#fff',
            font: { size: 11, weight: '600', family: "'Nunito', sans-serif" },
            padding: { x: 8, y: 4 },
            borderRadius: 4
          }
        };
      }
    }

    Chart.defaults.font.family = "'Nunito', sans-serif";
    Chart.defaults.color = '#6b7280';

    const yTitle = config.y_axis_name || (measures[0].label_short || measures[0].label);
    const xTitle = config.xaxis_name_override || (dimensions[0].label_short || dimensions[0].label);
    const chartTitleText = config.chart_title_text || `${measures[0].label_short || measures[0].label} by ${dimensions[0].label_short || dimensions[0].label}`;

    this.myChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: xLabels, datasets: datasets },
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: clickHandler,
        onHover: (event, chartElement) => {
          const cursor = config.enable_crossfilter ? 'pointer' : (chartElement[0] ? 'pointer' : 'default');
          event.native.target.style.cursor = cursor;
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: config.show_chart_title,
            text: chartTitleText,
            align: config.chart_title_align || 'start',
            font: { size: config.chart_title_size || 24, weight: '700', family: "'Nunito', sans-serif" },
            color: '#111',
            padding: { bottom: config.chart_title_padding || 20 }
          },
          legend: {
            display: !config.hide_legend,
            position: 'bottom',
            align: 'center',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 30,
              font: { size: 12, weight: '600' }
            }
          },
          datalabels: {
            display: config.show_values,
            color: '#3B82F6',
            backgroundColor: '#ffffff',
            borderRadius: 4,
            padding: 2,
            anchor: 'end',
            align: 'top',
            offset: 4,
            font: { size: config.value_font_size || 11, weight: '700' },
            formatter: (value) => (value !== null && value !== undefined) ? value.toLocaleString() : ''
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          },
          annotation: {
            annotations: annotationConfig
          }
        },
        scales: {
          x: {
            grid: { display: config.show_x_gridlines, color: '#f0f0f0', drawBorder: false },
            ticks: {
              maxRotation: config.xaxis_label_rotation,
              minRotation: config.xaxis_label_rotation,
              padding: 10,
              font: { weight: '600' }
            },
            title: { display: config.show_xaxis_name, text: xTitle, font: { weight: '700', size: 13 }, color: '#111' }
          },
          y: {
            stacked: config.positioning === 'stacked',
            reverse: config.y_axis_reverse || false,
            min: (config.y_axis_min !== null && config.y_axis_min !== undefined && config.y_axis_min !== '') ? config.y_axis_min : undefined,
            max: (config.y_axis_max !== null && config.y_axis_max !== undefined && config.y_axis_max !== '') ? config.y_axis_max : undefined,
            beginAtZero: !config.unpin_y_from_zero,
            grid: { display: config.show_y_gridlines, color: '#f3f4f6', borderDash: [5, 5], drawBorder: false },
            title: { display: config.show_yaxis_name, text: yTitle, font: { weight: '700', size: 13 }, color: '#111' },
            ticks: {
              display: config.show_y_axis_values,
              padding: 10,
              font: { weight: '600' },
              maxTicksLimit: config.y_axis_tick_count || 6,
              callback: (value) => safeFormat(value)
            }
          }
        },
        layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        animation: { duration: 500 }
      }
    });

    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._resizeObserver = new ResizeObserver(() => {
      if (this.myChart) this.myChart.resize();
    });
    this._resizeObserver.observe(chartContainer);

    done();
  }
});
