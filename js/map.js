// map.js - Module for interactive map rendering and country selection
// This file contains all map-related functionality extracted from draggable

/**
 * Map Module
 * Handles map rendering, country selection, and zoom/pan functionality
 */

// import dotenv from 'dotenv'
// dotenv.config()

// Map state
let mapState = {
    selectedCountry: null,
    mapElement: null,
    mapGroup: null,
    countryInfo: null,
    zoom: null
};

// Configuration options with defaults
const mapConfig = {
    width: 960,
    height: 500,
    initialFill: "lightgreen",
    selectedFill: "red",
    zoomMin: 1,
    zoomMax: 9,
    transitionDuration: 300
};

/**
 * Initialize the map
 * @param {Object} options - Configuration options
 * @param {String} options.svgSelector - CSS selector for SVG element
 * @param {Function} options.onCountrySelect - Callback when country is selected
 * @param {Function} options.onCountryDeselect - Callback when country is deselected
 */
export function initMap(options = {}) {
    const config = { ...mapConfig, ...options };
    // Select the SVG element
    const svg = d3.select(options.svgSelector || "svg");
    mapState.mapElement = svg;
    
    // Create a group for map elements (to enable zoom/pan)
    mapState.mapGroup = svg.append("g");
    
    // Ensure browser doesn't hijack gestures (enables D3 pinch/zoom on touch)
    mapState.mapElement.style("touch-action", "none");
    
    // Set up event handlers
    setupMapEvents(options);
    
    // Load and render map data
    loadMapData(config);
    
    return {
        selectCountry: selectCountryById,
        clearSelection,
        resetZoom,
        zoomTo,
        zoomBy,
        panBy
    };
}

/**
 * Set up event handlers for the map
 */
function setupMapEvents(options) {
    // Clear selection when clicking on the map background
    mapState.mapElement.on("click", function() {
        if (!d3.event.target.classList.contains("country")) {
            clearSelection();
            if (options.onCountryDeselect) options.onCountryDeselect();
        }
    });
    
    // Reset zoom and clear selection on right-click
    mapState.mapElement.on("contextmenu", function() {
        d3.event.preventDefault();
        clearSelection();
        if (options.onCountryDeselect) options.onCountryDeselect();
        resetZoom();
    });
}

/**
 * Load map data and initialize the visualization
 */
async function loadMapData(config) {
    const jsonURL = "https://raw.githubusercontent.com/kcpatt27/world-atlas-2-world-factbook/main/world%20atlas%20json%2050m";
    const tsvURL = "https://raw.githubusercontent.com/kcpatt27/world-atlas-2-world-factbook/main/world%20atlas%20tsv_rows.tsv";
    // const jsonURL = process.env.WORLD_ATLAS_JSON_URL;
    // const tsvURL = process.env.WORLD_ATLAS_TSV_URL;
    
    try {
        // Load data sources
        const [topoJSONdata, tsvData] = await Promise.all([
            d3.json(jsonURL),
            d3.tsv(tsvURL)
        ]);
        
        // Process country info
        mapState.countryInfo = createCountryInfoLookup(tsvData);
        
        // Set up map projection
        const projection = d3.geoNaturalEarth1()
            .scale(config.width / 6)
            .translate([config.width / 2, config.height / 2]);
        const pathGenerator = d3.geoPath().projection(projection);
        
        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries).features;
        
        // Render countries
        renderCountries(countries, pathGenerator, config);
        
        // Initialize zoom behavior
        initZoom(config);
        
    } catch (error) {
        console.error("Error loading map data:", error);
    }
}

/**
 * Create a lookup object for country information
 */
function createCountryInfoLookup(tsvData) {
    return tsvData.reduce((acc, d) => {
        const keyOriginal = d.iso_n3; // e.g. '036'
        const keyNumeric = String(parseInt(d.iso_n3, 10)); // e.g. '36'
        const record = {
            name: d.name,
            continent: d.continent,
            a2Code: d.iso_a2,
            folder: d.folder
        };
        acc[keyOriginal] = record;
        // Also store numeric key without leading zeros so lookups by either form work
        acc[keyNumeric] = record;
        return acc;
    }, {});
}

/**
 * Render country shapes on the map
 */
function renderCountries(countries, pathGenerator, config) {
    // Add the ocean background first
    mapState.mapGroup.append("path")
        .attr("class", "ocean")
        .attr("d", pathGenerator({type: "Sphere"}));
    
    mapState.mapGroup.selectAll("path.country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("id", d => {
            const country = mapState.countryInfo[d.id];
            return country ? `country-${country.a2Code.toLowerCase()}` : `country-unknown-${d.id}`;
        })
        .attr("d", pathGenerator)
        .style("fill", config.initialFill)
        .on("mouseover", function(d) {
            if (!d3.select(this).classed("selected")) {
                d3.select(this).transition()
                    .duration(config.transitionDuration)
                    .style("fill", config.selectedFill);
            }
        })
        .on("mouseout", function(d) {
            if (!d3.select(this).classed("selected")) {
                d3.select(this).transition()
                    .duration(config.transitionDuration)
                    .style("fill", config.initialFill);
            }
        })
        .on("click", function(d) {
            d3.event.stopPropagation();
            const country = mapState.countryInfo[d.id];
            
            if (!country) return;
            
            const isSelected = d3.select(this).classed("selected");
            
            if (isSelected) {
                clearSelection();
                if (config.onCountryDeselect) config.onCountryDeselect();
            } else {
                selectCountry(this, country, d.id, config);
            }
        })
        .append("title")
        .text(function(d) {
            const country = mapState.countryInfo[d.id];
            return country ? country.name + " (" + country.a2Code + ")" : "Country Unknown";
        });
}

/**
 * Initialize zoom behavior
 */
function initZoom(config) {
    // Compute viewport extent from SVG and content extent from map group
    var svgNode = mapState.mapElement.node();
    var svgWidth = (svgNode && (+svgNode.getAttribute('width') || svgNode.clientWidth)) || config.width;
    var svgHeight = (svgNode && (+svgNode.getAttribute('height') || svgNode.clientHeight)) || config.height;
    var bbox = { x: 0, y: 0, width: svgWidth, height: svgHeight };
    try {
        var gNode = mapState.mapGroup.node();
        if (gNode) {
            var gb = gNode.getBBox();
            if (isFinite(gb.x) && isFinite(gb.y) && isFinite(gb.width) && isFinite(gb.height)) {
                bbox = gb;
            }
        }
    } catch (e) {
        // Fallback to SVG size if getBBox fails (e.g., not in DOM yet)
    }

    // Add a small margin so panning is possible even at min zoom
    var margin = Math.max(bbox.width, bbox.height) * 0.05;

    mapState.zoom = d3.zoom()
        .filter(function() {
            // Unify mouse and touch controls: allow wheel, dblclick, mouse (left/middle), and touch/pointer
            var e = d3.event;
            if (!e) return true;
            if (e.type === "wheel" || e.type === "dblclick") return true;
            if (e.type === "mousedown") return e.button === 0 || e.button === 1;
            if (e.type === "touchstart" || e.type === "pointerdown") return true;
            return false;
        })
        .scaleExtent([config.zoomMin, config.zoomMax])
        .extent([[0, 0], [svgWidth, svgHeight]])
        .translateExtent([[bbox.x - margin, bbox.y - margin], [bbox.x + bbox.width + margin, bbox.y + bbox.height + margin]])
        .on("zoom", function() {
            mapState.mapGroup.attr("transform", d3.event.transform);
        })
        .on("end", function() {
            var t = d3.event.transform;
            // Only enforce minimum scale
            if (t.k < config.zoomMin) resetZoom();
        });
    
    mapState.mapElement.call(mapState.zoom);
}

/**
 * Select a country by its ID
 */
export function selectCountryById(countryId) {
    const countryElement = mapState.mapElement.select(`#country-${countryId.toLowerCase()}`);
    if (!countryElement.empty()) {
        const d = countryElement.datum();
        const country = mapState.countryInfo[d.id];
        selectCountry(countryElement.node(), country, d.id, mapConfig);
        return true;
    }
    return false;
}

/**
 * Select a country and trigger the callback
 */
function selectCountry(countryElement, country, countryId, config) {
    clearSelection();
    
    d3.select(countryElement)
        .raise()
        .style("opacity", 0)
        .classed("selected", true)
        .transition()
        .duration(config.transitionDuration)
        .style("opacity", 1)
        .style("fill", config.selectedFill);
    
    mapState.selectedCountry = countryId;
    
    if (config.onCountrySelect) {
        config.onCountrySelect(country, countryId);
    }
}

/**
 * Clear the current selection
 */
export function clearSelection() {
    mapState.mapElement.selectAll('path.country')
        .classed('selected', false)
        .transition()
        .duration(mapConfig.transitionDuration)
        .style('fill', mapConfig.initialFill);
    
    mapState.selectedCountry = null;
}

/**
 * Reset zoom to default view
 */
export function resetZoom() {
    mapState.mapElement.transition()
        .duration(750)
        .call(mapState.zoom.transform, d3.zoomIdentity);
}

/**
 * Programmatically zoom to an absolute scale, optionally centered on a point
 * @param {number} scale - Target zoom scale
 * @param {number[]} [point] - Optional [x, y] point within the SVG to zoom around
 */
function zoomTo(scale, point) {
    if (!mapState.zoom || !mapState.mapElement) return;
    if (Array.isArray(point)) {
        mapState.mapElement
            .transition()
            .duration(300)
            .call(mapState.zoom.scaleTo, scale, point);
    } else {
        mapState.mapElement
            .transition()
            .duration(300)
            .call(mapState.zoom.scaleTo, scale);
    }
}

/**
 * Programmatically zoom by a relative factor, optionally centered on a point
 * @param {number} factor - Zoom multiplier (>1 to zoom in, <1 to zoom out)
 * @param {number[]} [point] - Optional [x, y] point within the SVG to zoom around
 */
function zoomBy(factor, point) {
    if (!mapState.zoom || !mapState.mapElement) return;
    if (Array.isArray(point)) {
        mapState.mapElement
            .transition()
            .duration(300)
            .call(mapState.zoom.scaleBy, factor, point);
    } else {
        mapState.mapElement
            .transition()
            .duration(300)
            .call(mapState.zoom.scaleBy, factor);
    }
}

/**
 * Programmatically pan by a relative delta
 * @param {number} dx - Delta x in pixels
 * @param {number} dy - Delta y in pixels
 */
function panBy(dx, dy) {
    if (!mapState.zoom || !mapState.mapElement) return;
    mapState.mapElement
        .transition()
        .duration(0)
        .call(mapState.zoom.translateBy, dx, dy);
}

// Additional utility functions for map-related tasks

/**
 * Get special folder mapping for a country
 */
export function getSpecialFolder(a2Code) {
    // Hardcoded special cases as fallback
    const specialFolders = {
        "in": "south-asia", // India
        "rs": "central-asia", // Russia
        "ch": "east-n-southeast-asia", // China
        "us": "north-america", // United States
        "ca": "north-america", // Canada
        "au": "australia-oceania", // Australia
        "nz": "australia-oceania", // New Zealand
        "jp": "east-n-southeast-asia", // Japan
        "kr": "east-n-southeast-asia", // South Korea
        "gb": "europe", // United Kingdom
        "de": "europe", // Germany
        "fr": "europe", // France
        "br": "south-america", // Brazil
        "za": "africa", // South Africa
    };
    
    return specialFolders[a2Code.toLowerCase()];
}

/**
 * Determine folder name for a country
 */
export function determineFolder(country) {
    if (!country || !country.a2Code) {
        return null;
    }
    
    const a2 = country.a2Code.toLowerCase();
    
    if (country.folder) {
        return country.folder.toLowerCase().replace(/\s+/g, '-');
    } 
    
    if (getSpecialFolder(a2)) {
        return getSpecialFolder(a2);
    } 
    
    if (country.continent) {
        return country.continent.replace(/\s+/g, '-').toLowerCase();
    }
    
    return null;
}