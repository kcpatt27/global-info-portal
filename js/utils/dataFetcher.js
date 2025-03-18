// dataFetcher.js - Utilities for fetching and processing country data
// This file contains functionality for fetching data from external APIs

import { getSpecialFolder, determineFolder } from '../map.js';

// Keeps track of pending requests to prevent duplicates
const pendingRequests = {};

/**
 * Fetch country data from the Factbook API
 * @param {Object} country - Country object with a2Code and continent properties
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Country data
 */
export async function fetchCountryData(country, options = {}) {
    if (!country || !country.a2Code) {
        throw new Error('Missing required country information');
    }

    const a2 = country.a2Code.toLowerCase();
    
    // If request is already in progress, return the existing promise
    if (pendingRequests[a2]) {
        return pendingRequests[a2];
    }
    
    // Determine the folder to use for fetching the data
    let folder = determineFolder(country);
    
    if (!folder) {
        throw new Error(`Could not determine folder for ${a2}`);
    }
    
    console.log(`Using folder: ${folder} for ${a2}`);
    
    // Create a promise for the request
    const requestPromise = new Promise(async (resolve, reject) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

            const url = `https://raw.githubusercontent.com/factbook/factbook.json/master/${folder}/${a2}.json`;
            console.log("Fetching data from:", url);
            
            try {
                const response = await fetch(url, { signal: controller.signal });
                
                if (!response.ok) {
                    // Try alternative URL if first attempt fails
                    const altUrl = `https://raw.githubusercontent.com/factbook/factbook.json/master/factbook/${folder}/${a2}.json`;
                    console.log("First attempt failed, trying alternative URL:", altUrl);
                    
                    const altController = new AbortController();
                    const altTimeoutId = setTimeout(() => altController.abort(), options.timeout || 10000);
                    
                    try {
                        const altResponse = await fetch(altUrl, { signal: altController.signal });
                        clearTimeout(altTimeoutId);
                        
                        if (!altResponse.ok) {
                            throw new Error(`HTTP error! status: ${altResponse.status}`);
                        }
                        
                        const data = await altResponse.json();
                        resolve(data);
                    } catch (altError) {
                        clearTimeout(altTimeoutId);
                        throw altError;
                    }
                } else {
                    clearTimeout(timeoutId);
                    const data = await response.json();
                    resolve(data);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        } catch (error) {
            console.error(`Error fetching data for ${a2}:`, error);
            reject(error);
        } finally {
            // Remove from pending requests
            delete pendingRequests[a2];
        }
    });
    
    // Store the promise
    pendingRequests[a2] = requestPromise;
    
    return requestPromise;
}

/**
 * Process text data to handle common inconsistencies in the Factbook API
 * @param {String} text - Text to process
 * @returns {String} - Processed text
 */
export function processText(text) {
    if (!text) return "";
    
    // Remove HTML tags
    return text.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Extract a specific data point from a country dataset
 * @param {Object} data - Country data object
 * @param {String} path - Dot notation path to the desired data
 * @param {*} defaultValue - Value to return if path not found
 * @returns {*} - Extracted data or default value
 */
export function extractDataPoint(data, path, defaultValue = "N/A") {
    if (!data || !path) return defaultValue;
    
    const keys = path.split('.');
    let result = data;
    
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    
    // If result is an object and has a text property, return that
    if (result && typeof result === 'object' && 'text' in result) {
        return result.text;
    }
    
    return result || defaultValue;
}

/**
 * Detect time-series data in a dataset
 * @param {Object} data - Data object to scan
 * @param {Number} minYears - Minimum number of years to count as time-series
 * @returns {Array} - Array of detected time-series objects
 */
export function detectTimeSeriesData(data, minYears = 3) {
    const timeSeries = [];
    const yearPattern = /^(19|20)\d{2}$/; // Match years from 1900-2099
    
    function scanForYears(obj, path = []) {
        if (!obj || typeof obj !== 'object') return;
        
        // Check if this object has year keys
        const keys = Object.keys(obj);
        const yearKeys = keys.filter(key => yearPattern.test(key));
        
        if (yearKeys.length >= minYears) {
            // Extract the series
            const series = {};
            const yearData = {};
            
            yearKeys.forEach(year => {
                yearData[year] = obj[year].text || obj[year];
            });
            
            // Find a name for this series
            const parentKey = path[path.length - 1] || 'unknown';
            
            series.name = parentKey;
            series.path = path.join('.');
            series.years = yearData;
            
            timeSeries.push(series);
            return;
        }
        
        // Recursively scan deeper
        for (const key of keys) {
            if (obj[key] && typeof obj[key] === 'object') {
                scanForYears(obj[key], [...path, key]);
            }
        }
    }
    
    scanForYears(data);
    return timeSeries;
} 