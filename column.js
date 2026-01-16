looker.plugins.visualizations.add({
  // 1. CONFIGURATION OPTIONS
  options: {
    // --- PLOT TAB ---
    positioning: {
      type: "string",
      label: "Series Positioning",
      display: "select",
      section: "Plot",
      values: [
        { "Grouped": "grouped" },
        { "Stacked": "stacked" }
      ],
      default: "grouped"
    },
    hide_legend: {
      type: "boolean",
      label: "Hide Legend",
      section: "Plot",
      default: false
    },

    // --- SERIES TAB ---
    // (Colors handled automatically or via Looker native settings)

    // --- VALUES TAB ---
    show_values: {
      type: "boolean",
      label: "Value Labels",
      section: "Values",
      default: false
    },
    value_font_size: {
      type: "number",
      label: "Label Size",
      section: "Values",
      default: 12
    },
    // Useful for the labels ON the bars
    value_format: {
        type: "string",
        label: "Value Label Format",
        section: "Values",
        placeholder: "#,##0",
        default: ""
    },

    // --- X AXIS TAB ---
    show_xaxis_name: {
      type: "boolean",
      label: "Show Axis Name",
      section: "X",
      default: true
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

    // --- Y AXIS TAB (Replicating your Screenshot) ---
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
        display: "text", // Allows empty input
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
            {"Custom": "custom"} // Maps to a fixed count for simplicity
        ],
        default: "default"
    },
    y_axis_tick_count: {
        type: "number",
        label: "Tick Count",
        section: "Y",
        default: 10,
        display: "text",
        hidden: true // We can toggle this visibility in a more advanced setup, currently just an input
    }
  },

  // 2. SETUP
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
        .chart-container {
          position: relative;
          height: 100%;
          width: 100%;
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
        }
      </style>
      <div class="chart-container">
        <canvas id="myChart"></canvas>
      </div>
    `;
    
    this.chartLoaded = false;
    this._triggerUpdate = null;
  },

  triggerUpdate: function() {
      if(this._triggerUpdate) this._triggerUpdate();
  },

  // 3. RENDERING
  updateAsync: function(data, element, config, queryResponse, details, done) {
    this._triggerUpdate = () => { this.updateAsync(data, element, config, queryResponse, details, done); };

    if (!this.chartLoaded || typeof Chart === "undefined") return;

    if (!data || data.length === 0) {
        element.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">No Data</div>`;
        return done();
    }

    // --- DATA PROCESSING ---
    const dimensions = queryResponse.fields.dimension_like;
    const measures = queryResponse.fields.measure_like;
    const pivots = queryResponse.pivots || [];

    // X-Axis Labels
    const xLabels = data.map(row => LookerCharts.Utils.textForCell(row[dimensions[0].name]));

    // Build Datasets
    const datasets = [];
    const defaultColors = ["#6c43e0", "#a56de2", "#e384dc", "#eda3c5", "#f0c3b0", "#8bc34a", "#ffeb3b"];
    
    // Helper to get color
    const getColor = (idx) => defaultColors[idx % defaultColors.length];

    if (pivots.length > 0) {
        pivots.forEach((pivot, index) => {
            measures.forEach((measure) => {
                const datasetData = data.map(row => {
                     const cell = row[measure.name][pivot.key];
                     return cell.value !== null ? cell.value : null; 
                });
                datasets.push({
                    label: pivot.key,
                    data: datasetData,
                    backgroundColor: getColor(index),
                    borderColor: "white",
                    borderWidth: 1
                });
            });
        });
    } else {
        measures.forEach((measure, index) => {
            const datasetData = data.map(row => row[measure.name].value);
            datasets.push({
                label: measure.label_short || measure.label,
                data: datasetData,
                backgroundColor: getColor(index),
                borderColor: "white",
                borderWidth: 1
            });
        });
    }

    // --- AXIS LOGIC ---
    
    // Y-Axis Name Calculation
    let yTitle = config.y_axis_name; 
    if (!yTitle || yTitle.trim() === "") {
        // Default to the first measure name if no user override
        yTitle = measures[0].label_short || measures[0].label;
    }

    // Y-Axis Range Logic (Min/Max/Unpin)
    // "Unpin from zero" means we DO NOT begin at zero.
    const beginAtZero = !config.unpin_y_from_zero; 

    // Y-Axis Configuration Object
    const yAxisConfig = {
        stacked: config.positioning === "stacked",
        reverse: config.y_axis_reverse || false,
        type: config.y_axis_scale_type || 'linear', 
        min: (config.y_axis_min !== null && config.y_axis_min !== undefined) ? config.y_axis_min : undefined,
        max: (config.y_axis_max !== null && config.y_axis_max !== undefined) ? config.y_axis_max : undefined,
        beginAtZero: beginAtZero, 
        grid: {
            display: config.show_y_gridlines,
            drawBorder: false
        },
        title: {
            display: config.show_yaxis_name,
            text: yTitle,
            font: { family: "Nunito", weight: "bold", size: 13 },
            color: "#666"
        },
        ticks: {
            display: config.show_y_axis_values,
            font: { family: "Nunito" },
            // Handle Tick Density (Simple implementation)
            maxTicksLimit: (config.y_axis_tick_density === 'custom') ? (config.y_axis_tick_count || 20) : 10,
            callback: function(value, index, values) {
                // If format provided, we would use D3 or similar here.
                // For now, simple locale string with no decimals for cleaner axes
                return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
            }
        }
    };

    const xAxisConfig = {
        stacked: config.positioning === "stacked",
        grid: {
            display: config.show_x_gridlines,
            drawOnChartArea: config.show_x_gridlines
        },
        ticks: {
            maxRotation: config.xaxis_label_rotation,
            minRotation: config.xaxis_label_rotation,
            font: { family: "Nunito" }
        },
        title: {
            display: config.show_xaxis_name,
            text: dimensions[0].label_short || dimensions[0].label,
            font: { family: "Nunito", weight: "bold", size: 13 },
            color: "#666"
        }
    };

    // --- CHART CREATION ---
    const ctx = document.getElementById('myChart').getContext('2d');

    if (this.myChart) { this.myChart.destroy(); }
    if(typeof ChartDataLabels !== 'undefined') { Chart.register(ChartDataLabels); }

    this.myChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: xLabels, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !config.hide_legend,
                    position: 'top',
                    labels: { font: { family: "Nunito" }, usePointStyle: true }
                },
                datalabels: {
                    display: config.show_values,
                    color: '#333',
                    anchor: config.positioning === "stacked" ? 'center' : 'end',
                    align: config.positioning === "stacked" ? 'center' : 'top',
                    font: { size: config.value_font_size || 12, family: "Nunito", weight: "bold" },
                    formatter: (value) => {
                        return value.toLocaleString(); // Apply basic formatting to labels
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { family: "Nunito" },
                    bodyFont: { family: "Nunito" }
                }
            },
            scales: {
                x: xAxisConfig,
                y: yAxisConfig
            },
            layout: {
                padding: { top: config.show_values ? 25 : 10 }
            }
        }
    });

    done();
  }
});