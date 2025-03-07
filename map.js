// Use dotenv configuration
require('dotenv').config();
// import { createClient } from '@supabase/supabase-js';

// Select the SVG element
const svg = d3.select('svg');
// const width = +svg.attr('width');
// const height = +svg.attr('height');
const width = window.innerWidth;
const height = window.innerHeight;

// Define the projection and path generator
const projection = d3.geoNaturalEarth1()
        // .scale(120).translate([width / 2, height / 3.2]);
        // .scale(width / 6)
        // .translate([width / 2, height / 2.5]);
const pathGenerator = d3.geoPath().projection(projection);

// Append a sphere to represent the globe
svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }));

// Function to load the data
async function loadData() {
    try {
        // Use environment variables for URLs if available
        const tsvURL = process.env.TSV_URL || 'https://unpkg.com/world-atlas@1.1.4/world/50m.tsv';
        const jsonURL = process.env.JSON_URL || 'https://unpkg.com/world-atlas@1.1.4/world/50m.json';
        
        const [tsvResponse, jsonResponse] = await Promise.all([
            fetch(tsvURL),
            fetch(jsonURL)
        ]);

        const tsvData = await tsvResponse.text();
        const topoJSONdata = await jsonResponse.json();

        return { tsvData: d3.tsvParse(tsvData), topoJSONdata };
    } catch (error) {
        console.error('Failed to load data', error);
        return { tsvData: null, topoJSONdata: null };
    }
}

// // Supabase URL and anon key
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// // Initialize Supabase client
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// // Example: Fetch data from a table
// async function fetchData() {
//   let { data, error } = await supabase
//     .from('your_table_name')
//     .select('*');

//   if (error) {
//     console.error('Error fetching data:', error);
//   } else {
//     console.log('Data:', data);
//     // Process and display data in your HTML
//   }
// }

// fetchData();


// Function to get Factbook data
async function getFactbookData(continent, a2Code) {
    // Validate inputs
    if (!continent || !a2Code) {
        console.error('Missing required parameters: continent or a2Code');
        throw new Error('Missing required parameters: continent or a2Code');
    }
    
    try {
        const formattedContinent = continent.replace(/\s+/g, '-').toLowerCase();
        const lowercaseA2Code = a2Code.toLowerCase();
        const url = `https://raw.githubusercontent.com/factbook/factbook.json/master/${formattedContinent}/${lowercaseA2Code}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch data for ${a2Code}: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching data for ${a2Code}:`, error);
        throw error; // Rethrow to handle at caller level
    }
}

// Function to render charts
function renderCharts(data) {
    console.log('Factbook Data:', data); // debug
    
    try {
        // Safely access nested properties with optional chaining
        const countryName = data?.Government?.['Country name']?.['conventional short form']?.text || 'Unknown Country';
        const etymology = data?.Government?.['Country name']?.etymology?.text || 'No etymology data';
        
        // Update text with safe property access
        d3.select('#name').text(`
           Name: ${countryName}
           Etymology: ${etymology}
        `);
        
        // Safely access language data which has inconsistent structure
        const languageText = data?.['People and Society']?.Languages?.Languages?.text || 
                            data?.['People and Society']?.Languages?.text || 
                            'No language data available';
        
        d3.select('#lang').text(`
            Languages: ${languageText}
        `);

        // Update charts with safe property access
        d3.select('#chart1').text(`
            Scatter Plot 
        `);
        
        const revenue = data?.Economy?.Budget?.revenues?.text || 'No revenue data';
        d3.select('#chart2').text(`
            Bar Chart
            GDP: ${revenue}
        `);
        
        const landArea = data?.Geography?.Area?.land?.text || 'No land area data';
        const waterArea = data?.Geography?.Area?.water?.text || 'No water area data';
        d3.select('#chart3').text(`
            Choropleth Map
            Land Area: ${landArea}
            Water Area: ${waterArea}
        `);
        
        const climate = data?.Environment?.Climate?.text || 'No climate data';
        d3.select('#chart4').text(`
            Tree Map
            Climate: ${climate}
        `);

        // Apply the fade-in effect
        d3.selectAll('.chart')
            .classed('visible', true);
    } catch (error) {
        console.error('Error rendering charts:', error);
        // Show error in charts
        d3.selectAll('.chart').text('Error loading chart data');
    }
}

// Main function to render the map
async function renderCountries() {
    const { tsvData, topoJSONdata } = await loadData();

    if (!tsvData || !topoJSONdata) {
        console.error('Data is not loaded properly.');
        return;
    }

    // Create a lookup object for country information
    const countryInfo = tsvData.reduce((acc, d) => {
        acc[d.iso_n3] = {
            name: d.name,
            continent: d.continent,
            a2Code: d.iso_a2
        };
        return acc;
    }, {});

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

    svg.selectAll('path.country')
        .data(countries.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('id', d => {
            const country = countryInfo[d.id];
            return country ? country.a2Code : 'A2Code Unknown';
        })
        .attr('d', pathGenerator)
        .on('click', async function (d) {
            const country = countryInfo[d.id];
            if (country) {
                const factbookData = await getFactbookData(country.continent, country.a2Code);
                renderCharts(factbookData);
            } else {
                console.log('Country data not found.');
            }
        })
        .append('title')
        .text(d => { //tooltip
            const country = countryInfo[d.id];
            return country ? `${country.name} / ${country.a2Code}` : 'Country Unknown';
        });

    //     // Add zoom behavior to the SVG
    //     const zoomBehavior = d3.zoom()
    //         .scaleExtent([0.5, 4]) // Set zoom scale limits
    //         .on('zoom', zoomed);

    // svg.call(zoomBehavior);

    // function reset() {
    //     states.transition().style("fill", null);
    //     svg.transition().duration(750).call(
    //       zoom.transform,
    //       d3.zoomIdentity,
    //       d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    //     );
    //   }
    
    //   function clicked(event, d) {
    //     const [[x0, y0], [x1, y1]] = path.bounds(d);
    //     event.stopPropagation();
    //     states.transition().style("fill", null);
    //     d3.select(this).transition().style("fill", "red");
    //     svg.transition().duration(750).call(
    //       zoom.transform,
    //       d3.zoomIdentity
    //         .translate(width / 2, height / 2)
    //         .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
    //         .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    //       d3.pointer(event, svg.node())
    //     );
    //   }
    
    //   function zoomed(event) {
    //     const {transform} = event;
    //     g.attr("transform", transform);
    //     g.attr("stroke-width", 1 / transform.k);
    //   }
    
    //   return svg.node();

}

// Render the countries on the map
renderCountries();
