# Looker Custom Visualizations

This repository contains custom visualizations built for Looker using the Looker Visualization JS API. These visualizations are used in the Phorest Looker instance to provide enhanced reporting capabilities to clients building dashboards.

## Overview

Custom visualizations extend Looker's native charting capabilities with specialized, branded components designed for specific business use cases. All visualizations in this repository are built with vanilla JavaScript and Chart.js from a CDN, requiring no additional build tools or dependencies.

## Available Visualizations

### Phorest KPI Card (`single_value_card.js`)

A highly customizable, responsive Single Value (KPI) card designed to replace Looker's native single-value visualization.

**Features:**

- **Multiple Layouts**: Choose from Standard (vertical stack with metric above label), Slim (horizontal row), and Centered layouts to fit different dashboard designs.
- **Responsive Typography**: Font sizes automatically scale based on the tile width (e.g., smaller fonts for narrow tiles) or can be manually overridden via the config menu.
- **Trend Indicators**: Displays percentage change with dynamic color coding—green for positive trends, red for negative. Includes a toggle to reverse the logic when a negative trend is favorable (e.g., churn rate, bounce rate).
- **Custom Icons**: Built-in SVG hero icons (Cash, Users, Chart, Calendar, Home) with full support for pasting custom SVG code directly into the Looker UI configuration.
- **Drill-down Support**: Metrics are clickable and trigger Looker's native drill menu for deeper data exploration.

### Chart Visualizations

Additional visualizations using Chart.js for enhanced charting:

- **`area.js`** – Area chart visualization
- **`column.js`** – Column/bar chart visualization
- **`line.js`** – Line chart visualization
- **`table.js`** – Enhanced table visualization

## Deployment in Looker

### Hosting & URL Format

Custom visualizations must be hosted and referenced via the Looker Admin panel or a Looker project Manifest file.

If referencing directly from GitHub via jsDelivr CDN, use the following format:

```
https://cdn.jsdelivr.net/gh/phorest/looker_custom_visualisations@main/single_value_card.js?v=1
```

Replace `single_value_card.js` with the desired visualization filename, and adjust the organization and repository names as needed.

### Cache Management

**Important:** CDNs like jsDelivr cache files heavily (up to 24 hours). Whenever you push a code update to this repository, you **must increment the version number** at the end of the URL:

```
?v=1 → ?v=2 → ?v=3
```

This forces Looker to bypass the cache and fetch the latest code. Without incrementing the version, users will continue to see the old visualization in their dashboards.

**Steps:**
1. Push code changes to this repository
2. In Looker Admin settings, update the visualization URL with the new version number
3. Test the visualization in a development dashboard to confirm the changes are live

## Developer Guide & Best Practices

If you are building new visualizations or modifying existing ones, keep the following Looker-specific quirks in mind:

### 1. The DOM Clears on Tile Resize

When a user resizes a dashboard tile, Looker often clears the HTML inside the main visualization element to prepare for a redraw, but it does not always re-run the `create()` function.

**The Fix:** Always run a safety check in `updateAsync()` to see if your container exists, and rebuild it if Looker wiped it.

```javascript
var container = element.querySelector(".vis-container");
if (!container) {
  this._addBaseStructure(element); // Rebuild HTML
  container = element.querySelector(".vis-container");
}
```

### 2. Avoid Using IDs (`id="something"`)

Dashboards can render multiple instances of the same custom visualization. If your code uses `id="vis-container"`, multiple tiles will share the same ID, causing invalid HTML and preventing `querySelector` from targeting the correct tile.

**The Fix:** Always use classes (e.g., `.vis-container`) and limit `querySelector` searches to the specific `element` passed into the function:

```javascript
element.querySelector(".vis-container") // ✓ Correct
document.querySelector(".vis-container") // ✗ Wrong - searches entire page
```

### 3. Looker's Default "20px Gap"

By default, Looker injects CSS into the iframe (`height: calc(100% - 20px)`) to prevent scrollbar clipping on native charts. For "full bleed" visualizations like cards, this leaves a frustrating empty gap at the bottom of the tile.

**The Fix:** Force a global override in your visualization's `<style>` block to ensure it occupies the full height:

```css
html, body, #vis {
    height: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}
```

### 4. Handling Custom SVGs

If you allow users to paste custom SVG code via the Looker config menu (as in the KPI card), ensure you extract the inner paths correctly. Simply grabbing the first `<path>` tag won't work for complex icons that use multiple paths.

**The Fix:** Parse the string and extract the full SVG content:

```javascript
var parser = new DOMParser();
var doc = parser.parseFromString(svgString, "image/svg+xml");
var svgContent = doc.documentElement.innerHTML;
```

Then inject this into your visualization with appropriate sizing and styling.

### 5. Enabling Looker Drill-Downs

To make a metric clickable and open Looker's native data drill table, attach an event listener that passes the cell's `links` array to Looker's utility function:

```javascript
if (cell.links && cell.links.length > 0) {
  targetElement.addEventListener("click", function(event) {
    LookerCharts.Utils.openDrillMenu({
      links: cell.links,
      event: event
    });
  });
}
```

This provides users with seamless drill-down navigation without leaving the dashboard.

## Configuration & Customization

Each visualization accepts configuration options via the Looker UI. Users can:

- Choose layouts and styles
- Adjust font sizes and colors
- Select or upload icons
- Enable/disable trend indicators
- Configure drill-down behavior

Configuration is passed to the visualization through Looker's config object, typically accessible in the `updateAsync()` function via the second parameter.

## Testing

When modifying visualizations:

1. Create a test dashboard in your Looker development environment
2. Add your visualization and test with various data scenarios
3. Verify responsive behavior by resizing the tile
4. Test drill-down functionality if applicable
5. Test on multiple screen sizes and browsers

## Contributing

When adding new visualizations to this repository:

- Follow the established file structure (single `.js` file per visualization)
- Include comprehensive comments explaining the Looker-specific workarounds
- Test thoroughly with actual Looker instances before committing
- Update the version number in any jsDelivr URLs before deployment
- Document configuration options in the visualization's Looker UI labels

## Resources

- [Looker Visualization API Documentation](https://cloud.google.com/looker/docs/r/api/looker-customization/visualization-api)
- [Chart.js Documentation](https://www.chartjs.org/)
- [jsDelivr CDN](https://www.jsdelivr.com/)

---

Built for Phorest • Last Updated: 2026-09-11
