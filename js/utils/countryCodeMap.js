/**
 * Mapping of FIPS 10-4 (CIA World Factbook) codes to ISO 3166-1 alpha-2 codes.
 * This ensures that flags (which use ISO codes) display correctly for countries
 * where the data source uses FIPS codes.
 */
export const fipsToIso = {
    'aa': 'aw', // Aruba
    'ac': 'ag', // Antigua and Barbuda
    'ag': 'dz', // Algeria
    'aj': 'az', // Azerbaijan
    'al': 'al', // Albania
    'am': 'am', // Armenia
    'an': 'ad', // Andorra
    'ao': 'ao', // Angola
    'aq': 'as', // American Samoa
    'ar': 'ar', // Argentina
    'as': 'au', // Australia
    // 'at' is NOT Austria in Factbook/FIPS; avoid mapping it to ISO 'at' (Austria) to prevent collisions.
    // If a Factbook entry uses a non-standard code without a real ISO, we leave it unmapped.
    'at': '',   // Ashmore and Cartier Islands (no ISO)
    'au': 'at', // Austria
    'av': 'ai', // Anguilla
    'ay': 'aq', // Antarctica
    'ba': 'bh', // Bahrain
    'bb': 'bb', // Barbados
    'bc': 'bw', // Botswana
    'bd': 'bm', // Bermuda
    'be': 'be', // Belgium
    'bf': 'bs', // Bahamas
    'bg': 'bd', // Bangladesh
    'bh': 'bz', // Belize
    'bk': 'ba', // Bosnia and Herzegovina
    'bl': 'bo', // Bolivia
    'bm': 'mm', // Burma (Myanmar)
    'bn': 'bj', // Benin
    'bo': 'by', // Belarus
    'bp': 'sb', // Solomon Islands
    'br': 'br', // Brazil
    'bt': 'bt', // Bhutan
    'bu': 'bg', // Bulgaria
    'bv': 'bv', // Bouvet Island
    'bx': 'bn', // Brunei
    'by': 'bi', // Burundi
    'ca': 'ca', // Canada
    'cb': 'kh', // Cambodia
    'cd': 'td', // Chad
    'ce': 'lk', // Sri Lanka
    'cf': 'cg', // Congo (Brazzaville)
    'cg': 'cd', // Congo (Kinshasa)
    'ch': 'cn', // China
    'ci': 'cl', // Chile
    'cj': 'ky', // Cayman Islands
    'ck': 'cc', // Cocos (Keeling) Islands
    'cl': 'ck', // Cook Islands
    'cm': 'cm', // Cameroon
    'cn': 'km', // Comoros
    'co': 'co', // Colombia
    'cq': 'mp', // Northern Mariana Islands
    'cs': 'cr', // Costa Rica
    'ct': 'cf', // Central African Republic
    'cu': 'cu', // Cuba
    'cv': 'cv', // Cape Verde
    'cw': 'ck', // Cook Islands (Duplicate?)
    'cy': 'cy', // Cyprus
    'da': 'dk', // Denmark
    'dj': 'dj', // Djibouti
    'do': 'dm', // Dominica
    'dr': 'do', // Dominican Republic
    'dx': '',   // Dhekelia (No ISO)
    'ec': 'ec', // Ecuador
    'eg': 'eg', // Egypt
    'ei': 'ie', // Ireland
    'ek': 'gq', // Equatorial Guinea
    'en': 'ee', // Estonia
    'er': 'er', // Eritrea
    'es': 'sv', // El Salvador
    'et': 'et', // Ethiopia
    'ez': 'cz', // Czech Republic
    'fi': 'fi', // Finland
    'fj': 'fj', // Fiji
    'fk': 'fk', // Falkland Islands
    'fm': 'fm', // Micronesia
    'fo': 'fo', // Faroe Islands
    'fp': 'pf', // French Polynesia
    'fr': 'fr', // France
    'fs': 'tf', // French Southern and Antarctic Lands
    'ga': 'gm', // Gambia
    'gb': 'ga', // Gabon
    'gg': 'ge', // Georgia
    'gh': 'gh', // Ghana
    'gj': 'gd', // Grenada
    'gk': 'gg', // Guernsey
    'gl': 'gl', // Greenland
    'gm': 'de', // Germany
    'gq': 'gu', // Guam
    'gr': 'gr', // Greece
    'gt': 'gt', // Guatemala
    'gv': 'gn', // Guinea
    'gy': 'gy', // Guyana
    'ha': 'ht', // Haiti
    'hk': 'hk', // Hong Kong
    'hm': 'hm', // Heard Island and McDonald Islands
    'ho': 'hn', // Honduras
    'hr': 'hr', // Croatia
    'hu': 'hu', // Hungary
    'ic': 'is', // Iceland
    'id': 'id', // Indonesia
    'im': 'im', // Isle of Man
    'in': 'in', // India
    'io': 'io', // British Indian Ocean Territory
    'ir': 'ir', // Iran
    'is': 'il', // Israel
    'it': 'it', // Italy
    'iv': 'ci', // Cote d'Ivoire
    'iz': 'iq', // Iraq
    'ja': 'jp', // Japan
    'je': 'je', // Jersey
    'jm': 'jm', // Jamaica
    'jo': 'jo', // Jordan
    'ke': 'ke', // Kenya
    'kg': 'kg', // Kyrgyzstan
    'kn': 'kp', // Korea, North
    'kr': 'ki', // Kiribati
    'ks': 'kr', // Korea, South
    'ku': 'kw', // Kuwait
    'kv': 'xk', // Kosovo
    'kz': 'kz', // Kazakhstan
    'la': 'la', // Laos
    'le': 'lb', // Lebanon
    'lg': 'lv', // Latvia
    'lh': 'lt', // Lithuania
    'li': 'lr', // Liberia
    'lo': 'sk', // Slovakia
    'ls': 'li', // Liechtenstein
    'lt': 'ls', // Lesotho
    'lu': 'lu', // Luxembourg
    'ly': 'ly', // Libya
    'ma': 'mg', // Madagascar
    'mc': 'mo', // Macau
    'md': 'md', // Moldova
    'mg': 'mn', // Mongolia
    'mh': 'ms', // Montserrat
    'mi': 'mw', // Malawi
    'mj': 'me', // Montenegro
    'mk': 'mk', // Macedonia (North Macedonia)
    'ml': 'ml', // Mali
    'mn': 'mc', // Monaco
    'mo': 'ma', // Morocco
    'mp': 'mu', // Mauritius
    'mr': 'mr', // Mauritania
    'mt': 'mt', // Malta
    'mu': 'om', // Oman
    'mv': 'mv', // Maldives
    'mx': 'mx', // Mexico
    'my': 'my', // Malaysia
    'mz': 'mz', // Mozambique
    'nc': 'nc', // New Caledonia
    'ne': 'nu', // Niue
    'nf': 'nf', // Norfolk Island
    'ng': 'ne', // Niger
    'nh': 'vu', // Vanuatu
    'ni': 'ng', // Nigeria
    'nl': 'nl', // Netherlands
    'nn': 'sx', // Sint Maarten
    'no': 'no', // Norway
    'np': 'np', // Nepal
    'nr': 'nr', // Nauru
    'ns': 'sr', // Suriname
    'nu': 'ni', // Nicaragua
    'nz': 'nz', // New Zealand
    'od': 'ss', // South Sudan
    'pa': 'py', // Paraguay
    'pc': 'pn', // Pitcairn Islands
    'pe': 'pe', // Peru
    'pk': 'pk', // Pakistan
    'pl': 'pl', // Poland
    'pm': 'pa', // Panama
    'po': 'pt', // Portugal
    'pp': 'pg', // Papua New Guinea
    'ps': 'pw', // Palau
    'pu': 'gw', // Guinea-Bissau
    'qa': 'qa', // Qatar
    'ri': 'rs', // Serbia
    'rm': 'mh', // Marshall Islands
    'rn': 'mf', // Saint Martin
    'ro': 'ro', // Romania
    'rp': 'ph', // Philippines
    'rq': 'pr', // Puerto Rico
    'rs': 'ru', // Russia
    'rw': 'rw', // Rwanda
    'sa': 'sa', // Saudi Arabia
    'sb': 'pm', // Saint Pierre and Miquelon
    'sc': 'kn', // Saint Kitts and Nevis
    'se': 'sc', // Seychelles
    'sf': 'za', // South Africa
    'za': 'zm', // Zambia (FIPS ZA -> ISO ZM) - avoids collision with South Africa ISO 'za'
    'sg': 'sn', // Senegal
    'sh': 'sh', // Saint Helena
    'si': 'si', // Slovenia
    'sl': 'sl', // Sierra Leone
    'sm': 'sm', // San Marino
    'sn': 'sg', // Singapore
    'so': 'so', // Somalia
    'sp': 'es', // Spain
    'st': 'lc', // Saint Lucia
    'su': 'sd', // Sudan
    'sv': 'sj', // Svalbard
    'sw': 'se', // Sweden
    'sx': 'gs', // South Georgia and the South Sandwich Islands
    'sy': 'sy', // Syria
    'sz': 'ch', // Switzerland
    'tb': 'bl', // Saint Barthelemy
    'td': 'tt', // Trinidad and Tobago
    'th': 'th', // Thailand
    'ti': 'tj', // Tajikistan
    'tk': 'tc', // Turks and Caicos Islands
    'tl': 'tk', // Tokelau
    'tn': 'to', // Tonga
    'to': 'tg', // Togo
    'tp': 'st', // Sao Tome and Principe
    'ts': 'tn', // Tunisia
    'tt': 'tl', // Timor-Leste
    'tu': 'tr', // Turkey
    'tv': 'tv', // Tuvalu
    'tw': 'tw', // Taiwan
    'tx': 'tm', // Turkmenistan
    'tz': 'tz', // Tanzania
    'uc': 'cw', // Curacao
    'ug': 'ug', // Uganda
    'uk': 'gb', // United Kingdom
    'up': 'ua', // Ukraine
    'us': 'us', // United States
    'uv': 'bf', // Burkina Faso
    'uy': 'uy', // Uruguay
    'uz': 'uz', // Uzbekistan
    'vc': 'vc', // Saint Vincent and the Grenadines
    've': 've', // Venezuela
    'vi': 'vg', // British Virgin Islands
    'vm': 'vn', // Vietnam
    'vq': 'vi', // U.S. Virgin Islands
    'vt': 'va', // Holy See (Vatican City)
    'wa': 'na', // Namibia
    'we': 'ps', // West Bank (Palestine)
    'wf': 'wf', // Wallis and Futuna
    'wi': 'eh', // Western Sahara
    'ws': 'ws', // Samoa
    'wz': 'sz', // Eswatini (Swaziland)
    'xk': 'xk', // Kosovo (Already mapped above as kv->xk)
    'xo': 'io', // Indian Ocean? Check
    'ym': 'ye', // Yemen
    'za': 'zm', // Zambia
    'zi': 'zw', // Zimbabwe
};

/**
 * Inverted mapping: ISO 3166-1 alpha-2 -> Factbook/FIPS code.
 * Used when we receive an ISO code from the map or "Internet country code"
 * but need the Factbook code to fetch `.../{folder}/{code}.json`.
 *
 * NOTE: Only includes truthy ISO targets to avoid collisions like the removed 'at' mapping.
 */
export const isoToFactbook = Object.entries(fipsToIso).reduce((acc, [factbookCode, isoCode]) => {
    if (!isoCode) return acc;
    // Preserve first-seen mapping (most entries are 1:1); special cases are handled by fipsToIso itself.
    if (!acc[isoCode]) acc[isoCode] = factbookCode;
    return acc;
}, {});/**
 * Convert ISO code to Factbook code when possible.
 * @param {string} code
 * @returns {string}
 */
export function toFactbookFromIso(code) {
    const c = String(code || '').toLowerCase().replace(/^\./, '');
    return isoToFactbook[c] || c;
}