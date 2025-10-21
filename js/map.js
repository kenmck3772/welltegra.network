// Import well data from main data source
import { wellData } from './data.js';

// Add formatting function
function fmt(n) { return new Intl.NumberFormat().format(n); }

// Use wellData imported from data.js
const wells = wellData;

// Calculate center point
var lat = wells.reduce((sum, w) => sum + w.lat, 0) / wells.length;
var lon = wells.reduce((sum, w) => sum + w.lon, 0) / wells.length;

// Initialize map centered on North Sea
var m = L.map('map').setView([lat, lon], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(m);

// Add well markers
wells.forEach(function(well) {
    const color = well.status === 'Shut-in' ? '#ef4444' : '#22c55e';
    const fillColor = well.status === 'Shut-in' ? '#fecaca' : '#dcfce7';
    
    L.circleMarker([well.lat, well.lon], {
        radius: 8,
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.8,
        weight: 2
    }).addTo(m).bindPopup(`
        <b>${well.name}</b><br>
        Field: ${well.field}<br>
        Oil: ${fmt(well.oil_daily)} bbl/d<br>
        Status: ${well.status}
    `);
});