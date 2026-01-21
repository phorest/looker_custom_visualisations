looker.plugins.visualizations.add({
  options: {
    // --- PLOT ---
    positioning: {
      type: "string",
      label: "Series Positioning",
      display: "select",
      section: "Plot",
      values: [
        { "Grouped": "grouped" },
        { "Stacked": "stacked" }
      ],
      default: "stacked"
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
        default: 50,
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
      label: "Show Value Labels",
      section: "Values",
      default: false
    },
    show_totals_labels: {
      type: "boolean",
      label: "Show Totals Labels",
      section: "Values",
      default: false
    },
    value_font_size: {
      type: "number",
      label: "Label Size (px)",
      section: "Values",
      default: 12
    },

    // --- X AXIS ---
    show_xaxis_name: {
      type: "boolean",
      label: "Show Axis Name",
      section: "X",
      default: true
    },
    xaxis_name_override: {
      type: "string",
      label: "Axis Name (Override)",
      section: "X",
      placeholder: "Leave blank for default"
    },
    reverse_x_names: {
        type: "boolean",
        label: "Reverse Names (Last, First)",
        section: "X",
        default: false,
        order: 1
    },
    truncate_x_labels: {
        type: "boolean",
        label: "Truncate Labels",
        section: "X",
        default: false,
        order: 2
    },
    truncate_x_length: {
        type: "number",
        label: "Max Length (chars)",
        section: "X",
        default: 15,
        display: "text",
        order: 3
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
    y_axis_format_as_percent: {
        type: "boolean",
        label: "Format as Percent (0-1 = 0%-100%)",
        section: "Y",
        default: false,
        order: 0
    },
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
    y_axis_scale_type: {
        type: "string",
        label: "Scale Type",
        display: "select",
        section: "Y",
        values: [
           {"Linear": "linear"},
           {"Logarithmic": "logarithmic"}
        ],
        default: "linear"
    },
    show_yaxis_name: {
        type: "boolean",
        label: "Show Axis Name",
        section: "Y",
        default: true
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
    y_axis_tick_density: {
        type: "string",
        label: "Tick Density",
        display: "select",
        section: "Y",
        values: [
            {"Default": "default"},
            {"Custom": "custom"} 
        ],
        default: "default"
    },
    y_axis_tick_count: {
        type: "number",
        label: "Tick Count",
        section: "Y",
        default: 10,
        display: "text"
    }
  },

  create: function(element, config) {
    if (!document.getElementById('chartjs-script')) {
        const script = document.createElement('script');
        script.id = 'chartjs-script';
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            const pluginScript = document.createElement('script');
            pluginScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0';
            pluginScript.onload = () => { this.chartLoaded = true; this.triggerUpdate(); };
            document.head.appendChild(pluginScript);
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
          font-family: 'Nunito', sans-serif;
          background: #f4f5f7;
        }

        .style-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 16px;
            color: #111;
            pointer-events: none;
            position: absolute;
            /* FIX 1: REMOVED TRANSFORM TRANSLATE TO ALLOW MANUAL JS POSITIONING */
            /* transform: translate(-50%, 0); */ 
            transition: all 0.1s ease;
            z-index: 100;
            min-width: 150px;
        }
        .tooltip-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        }
        .tooltip-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }
        .tooltip-value {
            font-size: 28px;
            font-weight: 800;
            color: #111;
            line-height: 1.2;
        }
        .tooltip-date {
            font-size: 13px;
            color: #9CA3AF;
            margin-top: 4px;
            font-weight: 500;
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
    
    this.chartLoaded = false;
    this._triggerUpdate = null;
  },

  triggerUpdate: function() {
      if(this._triggerUpdate) this._triggerUpdate();
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this._triggerUpdate = () => { this.updateAsync(data, element, config, queryResponse, details, done); };

    if (!this.chartLoaded || typeof Chart === "undefined") return;

    const chartContainer = element.querySelector(".chart-container");
    if (!data || data.length === 0) {
        if(chartContainer) chartContainer.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">No Data</div>`;
        return done();
    }

    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const pivots = queryResponse.pivots || [];

    const xLabels = data.map(row => {
        let val = row[dimensions[0].name].value;
        val = val !== null ? LookerCharts.Utils.textForCell(row[dimensions[0].name]) : "Unknown";
        if (config.reverse_x_names) {
            const parts = val.trim().split(' ');
            if (parts.length > 1) {
                const last = parts.pop();
                val = `${last}, ${parts.join(' ')}`;
            }
        }
        return val;
    });

    const PALETTES = {
        "shoreline": ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"], 
        "phorest": ["#6c43e0", "#a56de2", "#e384dc", "#eda3c5", "#f0c3b0"],
        "vivid": ["#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3"],
        "boardwalk": ["#3D52B9", "#00A2E8", "#45BF55", "#F2C744", "#F28B20"],
        "neutral": ["#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"]
    };

    let selectedColors = PALETTES[config.color_theme] || PALETTES["shoreline"];
    if (config.custom_color_overrides && config.custom_color_overrides.trim().length > 0) {
        selectedColors = config.custom_color_overrides.split(',').map(c => c.trim());
    }
    if (config.reverse_colors) selectedColors = [...selectedColors].reverse();
    const getColor = (idx) => selectedColors[idx % selectedColors.length];

    let seriesOverrides = [];
    if (config.series_labels_overrides && config.series_labels_overrides.trim() !== "") {
        seriesOverrides = config.series_labels_overrides.split(',').map(s => s.trim());
    }

    const datasets = [];
    const SPACER = "   "; 

    if (pivots.length > 0) {
        pivots.forEach((pivot, index) => {
            measures.forEach((measure) => {
                const datasetData = data.map(row => {
                     const cell = row[measure.name][pivot.key];
                     return cell.value !== null ? cell.value : null; 
                });
                
                let rawLabel = seriesOverrides[index] ? seriesOverrides[index] : pivot.key;
                
                datasets.push({
                    label: SPACER + rawLabel, 
                    originalLabel: rawLabel,
                    _measureName: measure.name,
                    _pivotKey: pivot.key,
                    data: datasetData,
                    backgroundColor: getColor(index),
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                });
            });
        });
    } else {
        measures.forEach((measure, index) => {
            const datasetData = data.map(row => row[measure.name].value);
            let rawLabel = seriesOverrides[index] ? seriesOverrides[index] : (measure.label_short || measure.label);
            datasets.push({
                label: SPACER + rawLabel, 
                originalLabel: rawLabel,
                _measureName: measure.name,
                _pivotKey: null,
                data: datasetData,
                backgroundColor: getColor(index),
                borderRadius: 4, 
                barPercentage: 0.6
            });
        });
    }

    const canvas = document.getElementById('myChart');
    if (!canvas) return done();
    const existingChart = Chart.getChart(canvas);
    if (existingChart) { existingChart.destroy(); }

    const safeFormat = (value) => {
        if (value === null || value === undefined) return "";
        if (config.y_axis_format_as_percent) {
            return (value * 100).toLocaleString(undefined, { maximumFractionDigits: 0 }) + '%';
        }
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const clickHandler = (evt, elements, chart) => {
        if (!elements || elements.length === 0) return;
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const rowIndex = element.index;
        const dataset = chart.data.datasets[datasetIndex];
        const measureName = dataset._measureName;
        const pivotKey = dataset._pivotKey;
        const row = data[rowIndex];
        
        let cell;
        if (pivotKey) {
            if (row[measureName] && row[measureName][pivotKey]) { cell = row[measureName][pivotKey]; }
        } else {
            if (row[measureName]) { cell = row[measureName]; }
        }

        if (cell && cell.links) {
            LookerCharts.Utils.openDrillMenu({
                links: cell.links,
                event: evt.native || evt
            });
        }
    };

    const drawTotalsPlugin = {
        id: 'drawTotals',
        afterDatasetsDraw: (chart, args, options) => {
            if (!config.show_totals_labels) return; 

            const { ctx, scales: { x, y } } = chart;
            ctx.save();
            ctx.font = "bold 12px 'Nunito', sans-serif";
            ctx.fillStyle = "#6b7280"; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            chart.data.labels.forEach((label, index) => {
                let total = 0;
                let topY = y.getPixelForValue(0); 
                let hasValue = false;

                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    if (!meta.hidden && dataset.data[index] !== null && dataset.data[index] !== undefined) {
                        const val = dataset.data[index];
                        if (val > 0) {
                           total += val;
                           hasValue = true;
                           const barModel = meta.data[index];
                           if (barModel && barModel.y < topY) {
                               topY = barModel.y;
                           }
                        }
                    }
                });

                if (hasValue) {
                    ctx.fillText(safeFormat(total), x.getPixelForValue(index), topY - 5); 
                }
            });
            ctx.restore();
        }
    };

    const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div#chartjs-tooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            chart.canvas.parentNode.appendChild(tooltipEl);
        }
        return tooltipEl;
    };

    // --- FIX 2: UPDATED TOOLTIP POSITIONING LOGIC ---
    const externalTooltipHandler = (context) => {
        const {chart, tooltip} = context;
        const tooltipEl = getOrCreateTooltip(chart);

        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        if (tooltip.body) {
            const dataPoint = tooltip.dataPoints[0];
            const rawSeriesName = dataPoint.dataset.originalLabel || dataPoint.dataset.label.trim();
            const color = dataPoint.dataset.backgroundColor;
            const value = safeFormat(dataPoint.raw); 
            const fullDateLabel = chart.data.labels[dataPoint.dataIndex]; 

            const innerHtml = `
                <div>
                    <div class="tooltip-header">
                        <span class="tooltip-color-dot" style="background:${color}"></span>
                        ${rawSeriesName}
                    </div>
                    <div class="tooltip-value">${value}</div>
                    <div class="tooltip-date">${fullDateLabel}</div>
                </div>
            `;
            tooltipEl.innerHTML = innerHtml;
        }

        const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
        const tooltipWidth = tooltipEl.offsetWidth;
        const chartWidth = chart.width;

        // Start with standard centered position
        let targetLeft = positionX + tooltip.caretX - (tooltipWidth / 2);

        // Prevent Left Clipping
        if (targetLeft < 0) {
            targetLeft = 0; 
        }

        // Prevent Right Clipping
        if (targetLeft + tooltipWidth > chartWidth) {
            targetLeft = chartWidth - tooltipWidth;
        }

        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = targetLeft + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.fontFamily = tooltip.options.bodyFont.family;
    };

    Chart.defaults.font.family = "'Nunito', sans-serif";
    Chart.defaults.color = "#6b7280"; 

    let yTitle = config.y_axis_name || (measures[0].label_short || measures[0].label);
    let xTitle = config.xaxis_name_override || (dimensions[0].label_short || dimensions[0].label);
    let chartTitleText = config.chart_title_text || `${measures[0].label_short || measures[0].label} by ${dimensions[0].label_short || dimensions[0].label}`;

    this.myChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: xLabels, datasets: datasets },
        plugins: [drawTotalsPlugin], 
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: clickHandler,
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
            interaction: {
                mode: 'nearest', 
                axis: 'x',
                intersect: true 
            },
            plugins: {
                title: {
                    display: config.show_chart_title,
                    text: chartTitleText,
                    align: config.chart_title_align || 'start',
                    font: { 
                        size: config.chart_title_size || 24, 
                        weight: "700", 
                        family: "'Nunito', sans-serif" 
                    },
                    color: "#111",
                    padding: { 
                        bottom: config.chart_title_padding || 50
                    }
                },
                legend: {
                    display: !config.hide_legend,
                    position: 'bottom',
                    align: 'center', 
                    labels: { 
                        usePointStyle: true, 
                        boxWidth: 8, 
                        padding: 30, 
                        font: { size: 12, weight: "600" } 
                    }
                },
                datalabels: {
                    display: config.show_values,
                    color: '#444',
                    anchor: config.positioning === "stacked" ? 'center' : 'end',
                    align: config.positioning === "stacked" ? 'center' : 'top',
                    offset: 4,
                    font: { size: config.value_font_size || 12, weight: "700" },
                    formatter: (value) => safeFormat(value)
                },
                tooltip: {
                    enabled: false, 
                    external: externalTooltipHandler
                }
            },
            scales: {
                x: {
                    stacked: config.positioning === "stacked",
                    grid: { display: config.show_x_gridlines, color: "#f0f0f0", drawBorder: false },
                    ticks: { 
                        maxRotation: config.xaxis_label_rotation, 
                        minRotation: config.xaxis_label_rotation, 
                        padding: 10, 
                        font: { weight: "600" },
                        callback: function(val, index) {
                            let label = this.getLabelForValue(val);
                            if (config.truncate_x_labels && label.length > config.truncate_x_length) {
                                return label.substr(0, config.truncate_x_length) + '...';
                            }
                            return label;
                        }
                    },
                    title: { display: config.show_xaxis_name, text: xTitle, font: { weight: "700", size: 13 }, color: "#111" }
                },
                y: {
                    stacked: config.positioning === "stacked",
                    reverse: config.y_axis_reverse || false,
                    type: config.y_axis_scale_type || 'linear', 
                    min: (config.y_axis_min !== null && config.y_axis_min) ? config.y_axis_min : undefined,
                    max: (config.y_axis_max !== null && config.y_axis_max) ? config.y_axis_max : undefined,
                    beginAtZero: !config.unpin_y_from_zero, 
                    grid: { display: config.show_y_gridlines, color: "#f3f4f6", drawBorder: false },
                    title: { display: config.show_yaxis_name, text: yTitle, font: { weight: "700", size: 13 }, color: "#111" },
                    ticks: { 
                        display: config.show_y_axis_values, padding: 10, font: { weight: "600" },
                        maxTicksLimit: (config.y_axis_tick_density === 'custom') ? (config.y_axis_tick_count || 20) : 8,
                        callback: (value) => safeFormat(value)
                    }
                }
            },
            layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
            animation: { duration: 500 }
        }
    });

    done();
  }
});