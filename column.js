looker.plugins.visualizations.add({
  // Options
  options: {
    bar_color: {
      type: "array",
      label: "Chart Colors",
      display: "colors",
      default: ["#4285F4", "#34A853", "#EA4335", "#FBBC04"]
    },
    show_trend: {
      type: "boolean",
      label: "Show Trend %",
      default: true
    }
  },

  // Setup
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .kpi-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 10px;
          font-family: 'Roboto', 'Open Sans', sans-serif;
          background-color: #f8f9fa;
          height: 100%;
        }
        .kpi-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          border: 1px solid #e0e0e0;
          height: 100%;
        }
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        .kpi-title {
          font-size: 14px;
          color: #5f6368;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .kpi-value {
          font-size: 32px;
          font-weight: 700;
          color: #202124;
        }
        .trend-pill {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 16px;
          display: inline-block;
        }
        .trend-up { background-color: #e6f4ea; color: #137333; }
        .trend-down { background-color: #fce8e6; color: #c5221f; }
        
        .chart-area {
          position: relative;
          flex-grow: 1; 
          width: 100%;
          min-height: 150px;
        }
        #loading-msg { padding: 20px; font-size: 14px; color: #666; font-family: sans-serif; }
      </style>
      <div id="loading-msg">Loading Visualization Library...</div>
      <div id="vis-wrapper" class="kpi-container" style="display:none;"></div>
    `;

    if (typeof Chart === "undefined") {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.async = true;
      document.head.appendChild(script);
    }
  },

  // Render
  updateAsync: function(data, element, config, queryResponse, details, done) {
    var loader = element.querySelector("#loading-msg");
    var wrapper = element.querySelector("#vis-wrapper");

    // 1. Library Safety Check
    if (typeof Chart === "undefined") {
      loader.innerHTML = "Downloading Chart.js...";
      setTimeout(() => { this.updateAsync(data, element, config, queryResponse, details, done) }, 200);
      return;
    }

    // 2. Data Safety Check
    if (!data || data.length === 0) {
      loader.innerHTML = "No data found. Check 'Raw Data' panel.";
      return done();
    }

    // 3. Config Safety Check
    var safeColors = config.bar_color;
    if (!safeColors || typeof safeColors.length === 'undefined') {
      safeColors = ["#4285F4", "#34A853", "#EA4335", "#FBBC04"]; 
    }

    loader.style.display = 'none';
    wrapper.style.display = 'flex';
    wrapper.innerHTML = ""; 

    var measures = queryResponse.fields.measures;
    var dateField = queryResponse.fields.dimensions[0].name;

    // --- CALCULATE GRAND TOTAL ---
    var grandTotal = 0;
    var firstRowTotal = 0;
    var lastRowTotal = 0;

    data.forEach((row, rowIndex) => {
      var rowSum = 0;
      measures.forEach(m => {
        var val = row[m.name].value;
        if (typeof val === 'number') rowSum += val;
      });
      grandTotal += rowSum;

      if (rowIndex === data.length - 1) firstRowTotal = rowSum; 
      if (rowIndex === 0) lastRowTotal = rowSum; 
    });

    var formattedTotal = grandTotal.toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });

    // --- CALCULATE TREND ---
    var trendPct = firstRowTotal === 0 ? 0 : ((lastRowTotal - firstRowTotal) / firstRowTotal) * 100;
    var trendClass = trendPct >= 0 ? "trend-up" : "trend-down";
    var trendIcon = trendPct >= 0 ? "↑" : "↓";
    var trendHtml = config.show_trend ? 
      `<div class="trend-pill ${trendClass}">${trendIcon} ${Math.abs(trendPct).toFixed(1)}%</div>` : '';

    // --- BUILD DATASETS ---
    var datasets = measures.map((measure, i) => {
      return {
        label: measure.label_short || measure.label,
        data: data.map(row => row[measure.name].value),
        backgroundColor: safeColors[i % safeColors.length],
        borderRadius: 2,
        stack: 'Stack 0' 
      };
    });

    // --- BUILD HTML ---
    var card = document.createElement('div');
    card.className = "kpi-card";
    card.innerHTML = `
      <div class="kpi-header">
        <div>
          <div class="kpi-title">Total Sales</div>
          <div class="kpi-value">${formattedTotal}</div>
        </div>
        ${trendHtml}
      </div>
      <div class="chart-area">
        <canvas id="stackedChart"></canvas>
      </div>
    `;
    wrapper.appendChild(card);

    // --- DRAW CHART ---
    var ctx = card.querySelector('canvas').getContext('2d');
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(row => {
          const raw = row[dateField].value;
          const d = new Date(raw);
          if (isNaN(d)) return raw;
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }), 
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index', 
          intersect: false,
        },
        plugins: {
          legend: { display: false }, 
          tooltip: {
            enabled: true,
            backgroundColor: '#ffffff',
            titleColor: '#ffffff', 
            bodyColor: '#333333',
            footerColor: '#757575',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            
            callbacks: {
              title: function() { return ''; },
              label: function(context) {
                let label = context.dataset.label || '';
                let value = context.parsed.y;
                let valStr = new Intl.NumberFormat('en-IE', { minimumFractionDigits: 2 }).format(value);
                return label + ':  ' + valStr;
              },
              footer: function(context) {
                const index = context[0].dataIndex;
                const rawDate = data[index][dateField].value;
                const dateObj = new Date(rawDate);
                
                if (isNaN(dateObj)) return rawDate;
                return dateObj.toLocaleDateString('en-GB', { 
                  weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' 
                });
              }
            },
            titleFont: { size: 0 },
            bodyFont: { size: 13, weight: 'bold' },
            footerFont: { size: 11, weight: 'normal' },
            footerMarginTop: 8 
          }
        },
        scales: {
          x: { 
            stacked: true, 
            display: true, 
            grid: {
              display: false, // Vertical lines hidden
              drawBorder: false,
            },
            ticks: {
              color: '#999', 
              font: { size: 10 },
              maxTicksLimit: 6,
              autoSkip: true,
              maxRotation: 0 
            }
          }, 
          y: { 
            stacked: true, 
            display: true,
            min: 0, // <--- HIDES LESS THAN 0
            grid: {
              display: true,
              color: '#f0f0f0', 
              borderDash: [5, 5], // <--- DOTTED GRID LINES
              drawBorder: false, 
            },
            ticks: {
              color: '#999', 
              font: { size: 10 },
              maxTicksLimit: 5, 
              callback: function(val) {
                if (val >= 1000) return '€' + (val/1000) + 'k';
                return '€' + val;
              }
            }
          }
        }
      }
    });

    done();
  }
});