// require('dotenv').config();
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
        const [tsvResponse, jsonResponse] = await Promise.all([
            fetch('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
            fetch('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
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
    const formattedContinent = continent.replace(/\s+/g, '-').toLowerCase();
    const lowercaseA2Code = a2Code.toLowerCase();
    const url = `https://raw.githubusercontent.com/factbook/factbook.json/master/${formattedContinent}/${lowercaseA2Code}.json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Function to render charts
function renderCharts(data) {
    console.log('Factbook Data:', data); // debug
    
    // Select the info containers, updating their content
    d3.select('#name').text(`
       Name: ${data.Government['Country name']['conventional short form'].text}
       Etymology: ${data.Government['Country name'].etymology.text}
    `);
    d3.select('#lang').text(`
        Languages: ${data['People and Society'].Languages.Languages.text}
    `);
    // d3.select('#bg-info').text(`
    //     ${data.Introduction.Background.text}
    // `);

    // Select the chart containers and update their content
    d3.select('#chart1').text(`
        Scatter Plot 
    `);
    d3.select('#chart2').text(`
        Bar Chart
        GDP: ${data.Economy.Budget.revenues.text}
    `);
    d3.select('#chart3').text(`
        Choropleth Map
        Land Area: ${data.Geography.Area.land.text}
        Water Area: ${data.Geography.Area.water.text}
    `);
    d3.select('#chart4').text(`
        Tree Map
        Language: ${data.Environment.Climate.text}
    `);

    // Apply the fade-in effect
    d3.selectAll('.chart')
        .classed('visible', true);
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
