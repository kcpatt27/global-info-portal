// require('dotenv').config;
import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
// Remove hardcoded credentials for security
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const projection = d3.geoNaturalEarth1()
    .scale(width / 6)
    .translate([width / 2, height / 2]);
const pathGenerator = d3.geoPath().projection(projection);

svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

async function loadData() {
    try {
        const [jsonResponse, supabaseResponse] = await Promise.all([
            fetch('https://unpkg.com/world-atlas@1.1.4/world/50m.json'),
            supabase.from('world_atlas_tsv').select('*')
        ]);

        const topoJSONdata = await jsonResponse.json();
        const { data: countryData, error } = supabaseResponse;

        if (error) throw error;

        return { countryData, topoJSONdata };
    } catch (error) {
        console.error('Failed to load data', error);
        return { countryData: null, topoJSONdata: null };
    }
}

async function getFactbookData(folder, a2Code) {
    // Special case mappings for known problematic countries
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
    
    const lowercaseA2Code = a2Code.toLowerCase();
    
    let folderPath;
    
    // First try the hardcoded special cases
    if (specialFolders[lowercaseA2Code]) {
        folderPath = specialFolders[lowercaseA2Code];
        console.log(`Using special case folder: ${folderPath} for ${a2Code}`);
    }
    // Use the provided folder as a fallback
    else {
        folderPath = folder.toLowerCase().replace(/\s+/g, '-');
        console.log(`Using provided folder: ${folderPath} for ${a2Code}`);
    }
    
    const url = `https://raw.githubusercontent.com/factbook/factbook.json/master/${folderPath}/${lowercaseA2Code}.json`;
    console.log("Fetching data from:", url);
    
    const response = await fetch(url);

    if (!response.ok) {
        // If the first attempt fails, try with world-factbook subfolder
        const altUrl = `https://raw.githubusercontent.com/factbook/factbook.json/master/factbook/${folderPath}/${lowercaseA2Code}.json`;
        console.log("First attempt failed, trying alternative URL:", altUrl);
        
        const altResponse = await fetch(altUrl);
        if (!altResponse.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return altResponse.json();
    }

    return response.json();
}

    let currentChartIndex = 0;
    const chartData = [];

    function renderCharts(data) {
        console.log('Factbook Data:', data); // debug
        
        d3.select('.country-info').text(`
           ${data.Government['Country name']['conventional short form'].text} / 
           ${data.Government.Capital.name.text}
        `);
        d3.select('.language-info').text(`
            ${data['People and Society'].Languages ? 
            (data['People and Society'].Languages.text || 
             (data['People and Society'].Languages.Languages ? 
              data['People and Society'].Languages.Languages.text : 'Languages not available')) : 
            'Languages not available'}
        `);
        
        // Handle background text - truncate if necessary to avoid layout issues
        const backgroundText = data.Introduction?.Background?.text || 'No background information available';
        d3.select('.background-info').text(backgroundText);

        chartData.length = 0; // Clear previous chart data
        
        // Safely extract data with optional chaining and provide default values
        chartData.push(
            { 
                title: 'GDP', 
                value: data.Economy?.GDP?.purchasing_power_parity?.text || 'Data not available' 
            },
            { 
                title: 'Revenue', 
                value: data.Economy?.Budget?.revenues?.text || 'Data not available' 
            },
            { 
                title: 'Population', 
                value: data['People and Society']?.Population?.text || 'Data not available' 
            },
            { 
                title: 'Area', 
                value: data.Geography?.Area?.total?.text || 'Data not available' 
            }
        );

        showChart(0); // Show the first chart by default
    }

    function showChart(index) {
        currentChartIndex = index;
        const chartContainer = d3.select('.chart');
        chartContainer.html(`<div>${chartData[index].title}: ${chartData[index].value}</div>`);

        // Update pagination dots
        d3.selectAll('.pagination-dot').classed('active', (d, i) => i === index);
    }

    // Add click event listeners to pagination dots
    d3.selectAll('.pagination-dot').on('click', function(d, i) {
        showChart(i);
    });

    // Add the missing formatFolder function
    function formatFolder(continent) {
        return continent.toLowerCase().replace(/\s+/g, '-');
    }

    async function renderCountries() {
        const { countryData, topoJSONdata } = await loadData();
    
        if (!countryData || !topoJSONdata) {
            console.error('Data is not loaded properly.');
            return;
        }
    
        const countryInfo = countryData.reduce((acc, d) => {
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
            .attr('d', pathGenerator)
            .on('click', async function (d) {
                const country = countryInfo[d.id];
                if (country) {
                    try {
                        const folder = formatFolder(country.continent);
                        const factbookData = await getFactbookData(folder, country.a2Code);
                        renderCharts(factbookData);
                    } catch (error) {
                        console.error('Error fetching factbook data:', error);
                        d3.select('.chart').html('<div>Data not available for this country</div>');
                    }
                } else {
                    console.log('Country data not found.');
                    d3.select('.chart').html('<div>Country data not found</div>');
                }
            })
            .append('title')
            .text(d => {
                const country = countryInfo[d.id];
                return country ? `${country.name} / ${country.a2Code}` : 'Country Unknown';
            });
    }
    
    renderCountries();
    