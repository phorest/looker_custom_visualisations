looker.plugins.visualizations.add({
  // --- 1. CONFIG OPTIONS ---
  options: {
    card_layout: {
      type: "string",
      label: "Layout",
      display: "select",
      section: "Style",
      values: [
        {"Standard (Vertical)": "standard"},
        {"Slim (Horizontal)": "slim"},
        {"Slim (No Icon)": "slim_no_icon"}
      ],
      default: "slim_no_icon" 
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
    selected_icon: {
      type: "string",
      label: "Select Icon",
      display: "select",
      section: "Icon Settings",
      values: [
        {"Cash / Finance": "cash"},
        {"Users / Staff": "users"},
        {"Chart / Growth": "chart"},
        {"Calendar": "calendar"},
        {"Home": "home"},
        {"-- Use Custom SVG --": "custom"}
      ],
      default: "cash"
    },
    custom_svg_path: {
      type: "string",
      label: "Custom SVG Path",
      section: "Icon Settings",
      default: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />',
      placeholder: "Paste path code here..."
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
        /* Base Container */
        .phorest-card {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          display: flex;
          font-family: 'Roboto', 'Open Sans', sans-serif;
          overflow: hidden;
        }

        /* STYLES */
        .style-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f0f0f0;
        }
        .style-transparent {
          background: transparent;
          padding: 0;
          box-shadow: none;
          border: none;
        }

        /* --- LAYOUTS --- */
        .layout-standard {
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 16px; 
        }
        .layout-standard .content-group { gap: 12px; }

        .layout-slim {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .layout-slim .content-group {
          flex-direction: row;
          align-items: center;
          gap: 16px;
        }

        /* --- RESPONSIVE OVERRIDES --- */
        
        /* When "is-small" class is added via JS */
        .phorest-card.is-small .icon-box {
          display: none !important; /* HIDE ICON */
        }
        
        .phorest-card.is-small .metric-value {
          font-size: 32px !important; /* Reduce font (36 -> 32) */
        }
        
        .phorest-card.is-small.style-card {
          padding: 16px !important; /* Reduce padding to save space */
        }

        /* --- COMPONENTS --- */
        .content-group {
          display: flex;
          flex-direction: column;
        }

        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0; 
        }
        .icon-svg { width: 24px; height: 24px; stroke-width: 1.5; }

        .text-box { display: flex; flex-direction: column; }

        .metric-value {
          font-size: 36px;
          font-weight: 700;
          color: #111111 !important;
          line-height: 1;
          margin-bottom: 6px;
        }
        .metric-value a { color: #111111 !important; text-decoration: none !important; pointer-events: none; }

        .metric-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .trend-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          gap: 4px;
        }
        .chevron-svg { width: 16px; height: 16px; stroke-width: 2.5; }
      </style>
      <div id="vis-container" style="padding: 10px; width:100%; height:100%; box-sizing:border-box; display: flex;">
        </div>
    `;
  },

  // --- 3. RENDER ---
  updateAsync: function(data, element, config, queryResponse, details, done) {
    var container = element.querySelector("#vis-container");

    // --- SMART RESIZER ---
    // Calculate width of the container
    var rect = element.getBoundingClientRect();
    var width = rect.width;
    
    // Logic: If width is less than 260px, enable "Small Mode"
    var responsiveClass = "";
    if (width < 260) {
      responsiveClass = "is-small";
    }

    if (!data || data.length === 0) {
      container.innerHTML = `<div style="color:#999;">No Data</div>`;
      return done();
    }

    // A. Data
    var measure = queryResponse.fields.measures[0];
    var value = data[0][measure.name].value;
    var formattedValue = LookerCharts.Utils.htmlForCell(data[0][measure.name]);

    // B. Trend
    var trendHtml = "";
    if (data.length > 1) {
      var prevValue = data[1][measure.name].value;
      var trendPct = ((value - prevValue) / prevValue) * 100;
      var isUp = trendPct >= 0;
      
      var pillBg = isUp ? "#DCFCE7" : "#FFE9E9"; 
      var pillText = isUp ? "#008236" : "#FF1818"; 
      var chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="chevron-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>`;
      var chevronDown = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="chevron-svg"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>`;
      var icon = isUp ? chevronUp : chevronDown;
      trendHtml = `<div class="trend-pill" style="background-color: ${pillBg}; color: ${pillText};">${icon} ${Math.abs(trendPct).toFixed(1)}%</div>`;
    }

    // C. Config
    var layout = config.card_layout || "slim_no_icon"; 
    var styleMode = config.card_style || "card"; 
    var userColor = config.theme_color || "#34A853";
    var label = config.label_override || measure.label_short || measure.label;

    // Icons
    const HERO_ICONS = {
      "cash": '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />',
      "users": '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />',
      "chart": '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M6 16.5V2.25m0 14.25h12A2.25 2.25 0 0020.25 14.25V2.25M6 2.25h12M9 13.5l3-3m0 0l3 3m-3-3v7.5" />',
      "calendar": '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />',
      "home": '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />'
    };

    var iconName = config.selected_icon || "cash";
    var svgPath = HERO_ICONS[iconName];

    if (iconName === "custom") {
      svgPath = config.custom_svg_path || HERO_ICONS["cash"]; 
      if (svgPath.includes("<svg")) {
         var parser = new DOMParser();
         var doc = parser.parseFromString(svgPath, "image/svg+xml");
         var path = doc.querySelector("path");
         if(path) svgPath = path.outerHTML;
      }
    }

    var layoutClass = (layout === "standard") ? "layout-standard" : "layout-slim";
    var styleClass = (styleMode === "transparent") ? "style-transparent" : "style-card";

    var iconHtml = "";
    // Only show icon if "No Icon" is NOT selected
    if (layout !== "slim_no_icon") {
      iconHtml = `
        <div class="icon-box" style="background-color: ${userColor}20;"> 
          <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="${userColor}">
            ${svgPath}
          </svg>
        </div>
      `;
    }

    var html = `
      <div class="phorest-card ${layoutClass} ${styleClass} ${responsiveClass}">
        
        <div class="content-group">
          ${iconHtml}
          <div class="text-box">
            <div class="metric-value">${formattedValue}</div>
            <div class="metric-label">${label}</div>
          </div>
        </div>

        <div class="trend-box">
          ${trendHtml}
        </div>

      </div>
    `;

    container.innerHTML = html;
    done();
  }
});