looker.plugins.visualizations.add({
  // --- 1. CONFIG OPTIONS ---
  options: {
    custom_svg_path: {
      type: "string",
      label: "SVG Path",
      section: "Icon Settings",
      // Default set to the "Cash" icon path
      default: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />',
      placeholder: "Paste <path> code here..."
    },
    theme_color: {
      type: "string",
      label: "Theme Color",
      display: "color",
      section: "Style",
      default: "#34A853" 
    },
    label_override: {
      type: "string",
      label: "Label Override",
      section: "Style",
      placeholder: "Leave blank for default"
    }
  },

  // --- 2. SETUP ---
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .phorest-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          font-family: 'Roboto', 'Open Sans', sans-serif;
          
          /* Vertical Stack Layout */
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          
          height: auto;
          min-height: 140px;
        }
        
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .icon-svg {
          width: 24px;
          height: 24px;
          stroke-width: 1.5;
        }

        /* Value Styling */
        .metric-value {
          font-size: 36px;
          font-weight: 700;
          color: #111111 !important;
          line-height: 1;
          margin-bottom: 8px;
        }
        /* Override Looker Links */
        .metric-value a {
          color: #111111 !important;
          text-decoration: none !important;
          pointer-events: none;
        }

        .metric-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 12px;
        }

        /* Trend Pill Styling */
        .trend-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          width: fit-content;
          gap: 4px;
        }
        .chevron-svg {
          width: 16px;
          height: 16px;
          stroke-width: 2;
        }
      </style>
      <div id="vis-container" style="padding:10px; height:100%; box-sizing:border-box; background:#f8f9fa;"></div>
    `;
  },

  // --- 3. RENDER ---
  updateAsync: function(data, element, config, queryResponse, details, done) {
    var container = element.querySelector("#vis-container");

    if (!data || data.length === 0) {
      container.innerHTML = `<div style="color:#999; padding:20px;">No Data</div>`;
      return done();
    }

    // A. Data Extraction
    var measure = queryResponse.fields.measures[0];
    var value = data[0][measure.name].value;
    var formattedValue = LookerCharts.Utils.htmlForCell(data[0][measure.name]);

    // B. Trend Logic
    var trendHtml = "";
    if (data.length > 1) {
      var prevValue = data[1][measure.name].value;
      var trendPct = ((value - prevValue) / prevValue) * 100;
      var isUp = trendPct >= 0;
      
      // User requested Trend Colors
      var pillBg = isUp ? "#DCFCE7" : "#FFE9E9"; 
      var pillText = isUp ? "#008236" : "#FF1818"; 
      
      var chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="chevron-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>`;
      var chevronDown = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="chevron-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>`;
      
      var icon = isUp ? chevronUp : chevronDown;
      
      trendHtml = `<div class="trend-pill" style="background-color: ${pillBg}; color: ${pillText};">${icon} ${Math.abs(trendPct).toFixed(1)}%</div>`;
    }

    // C. Configuration
    var userColor = config.theme_color || "#34A853";
    
    // Get SVG from text box, cleaning it if user pasted a full <svg> tag
    var svgPath = config.custom_svg_path;
    // Fallback if empty
    if (!svgPath) {
       svgPath = '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />';
    }
    
    if (svgPath.includes("<svg")) {
       var parser = new DOMParser();
       var doc = parser.parseFromString(svgPath, "image/svg+xml");
       var path = doc.querySelector("path");
       if(path) svgPath = path.outerHTML;
    }

    var label = config.label_override || measure.label_short || measure.label;

    // D. Build HTML
    var html = `
      <div class="phorest-card">
        <div class="icon-box" style="background-color: ${userColor}20;"> 
          <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="${userColor}">
            ${svgPath}
          </svg>
        </div>
        
        <div class="metric-value">${formattedValue}</div>
        <div class="metric-label">${label}</div>
        ${trendHtml}
      </div>
    `;

    container.innerHTML = html;
    done();
  }
});