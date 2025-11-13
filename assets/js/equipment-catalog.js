// ==========================================
// WELL-TEGRA EQUIPMENT CATALOG DATABASE
// ==========================================

const equipmentDatabase = [
    // --- FISHING TOOLS ---
    {
        id: 'FSH-001',
        name: 'Bowen Series 150 Overshot',
        category: 'fishing',
        manufacturer: 'Nov',
        od: '4.625 in',
        connection: '3-1/2 Reg',
        description: 'The industry standard for external catching. Features a spiral grapple and basket grapple control.',
        specs: { tensile: '350,000 lbs', maxCatch: '3.75 in' },
        image: 'https://welltegra.network/assets/equipment/overshot.png'
    },
    {
        id: 'FSH-002',
        name: 'Itco Type Spear',
        category: 'fishing',
        manufacturer: 'Logan',
        od: '3.500 in',
        connection: '2-3/8 PAC',
        description: 'Internal catch fishing tool. heavy duty design for jarring operations.',
        specs: { tensile: '280,000 lbs', minCatch: '2.00 in' },
        image: 'https://welltegra.network/assets/equipment/spear.png'
    },
    {
        id: 'FSH-003',
        name: 'Reverse Circulating Junk Basket',
        category: 'fishing',
        manufacturer: 'Baker',
        od: '4.500 in',
        connection: '3-1/2 IF',
        description: 'Uses venturi effect to retrieve small debris and junk from the wellbore.',
        specs: { type: 'RCJB', capacity: '0.5 bbl' },
        image: 'https://welltegra.network/assets/equipment/junk-basket.png'
    },
    {
        id: 'FSH-004',
        name: 'Concave Mill',
        category: 'fishing',
        manufacturer: 'Smith',
        od: '4.500 in',
        connection: '3-1/2 Reg',
        description: 'Dressed with crushed tungsten carbide for milling out bit cones and other loose junk.',
        specs: { face: 'Concave', carbide: 'Medium' },
        image: 'https://welltegra.network/assets/equipment/mill.png'
    },

    // --- COILED TUBING TOOLS ---
    {
        id: 'CT-001',
        name: 'High-Torque Motor',
        category: 'coiled-tubing',
        manufacturer: 'Bico',
        od: '2.875 in',
        connection: '2-3/8 PAC',
        description: 'Positive displacement motor (PDM) optimized for milling hard scale and composite plugs.',
        specs: { flow: '1.5-3.5 bpm', torque: '1200 ft-lbs' },
        image: 'https://welltegra.network/assets/equipment/motor.png'
    },
    {
        id: 'CT-002',
        name: 'Rotating Jetting Nozzle',
        category: 'coiled-tubing',
        manufacturer: 'StoneAge',
        od: '1.688 in',
        connection: '1 in AMMT',
        description: 'Self-rotating nozzle for 360-degree wellbore cleaning and scale removal.',
        specs: { pressure: '5000 psi', flow: '1.0 bpm' },
        image: 'https://welltegra.network/assets/equipment/nozzle.png'
    },
    {
        id: 'CT-003',
        name: 'Dimple Connector',
        category: 'coiled-tubing',
        manufacturer: 'Global',
        od: '2.000 in',
        connection: '1-1/2 MT',
        description: 'External grapple connector for coiled tubing. Grub screw retention.',
        specs: { pull: '50,000 lbs', pressure: '10,000 psi' },
        image: 'https://welltegra.network/assets/equipment/connector.png'
    },
    {
        id: 'CT-004',
        name: 'Hydraulic Disconnect',
        category: 'coiled-tubing',
        manufacturer: 'Hunting',
        od: '2.875 in',
        connection: '2-3/8 PAC',
        description: 'Allows controlled release of the BHA via ball drop in event of stuck pipe.',
        specs: { ballSize: '0.75 in', shear: 'Adjustable' },
        image: 'https://welltegra.network/assets/equipment/disconnect.png'
    },

    // --- WIRELINE TOOLS ---
    {
        id: 'WL-001',
        name: 'Rope Socket (Pear Drop)',
        category: 'wireline',
        manufacturer: 'Elmar',
        od: '1.500 in',
        connection: '15/16 SR',
        description: 'Standard attachment point for slickline. Wedges wire for secure hold.',
        specs: { wire: '0.108 / 0.125', break: 'Wire dependent' },
        image: 'https://welltegra.network/assets/equipment/rope-socket.png'
    },
    {
        id: 'WL-002',
        name: 'Spang Jar',
        category: 'wireline',
        manufacturer: 'Otis',
        od: '1.500 in',
        connection: '15/16 SR',
        description: 'Mechanical link jar for delivering upward and downward impact.',
        specs: { stroke: '20 in', type: 'Mechanical' },
        image: 'https://welltegra.network/assets/equipment/jar.png'
    },
    {
        id: 'WL-003',
        name: 'Gauge Cutter / Blind Box',
        category: 'wireline',
        manufacturer: 'Generic',
        od: '2.313 in',
        connection: '15/16 SR',
        description: 'Used to verify tubing ID and clear light obstructions like wax or scale.',
        specs: { hardfaced: 'Yes', bottom: 'Flat' },
        image: 'https://welltegra.network/assets/equipment/gauge-cutter.png'
    },
    {
        id: 'WL-004',
        name: 'Impression Block (LIB)',
        category: 'wireline',
        manufacturer: 'Generic',
        od: '2.200 in',
        connection: '15/16 SR',
        description: 'Lead-filled housing used to take an impression of an obstruction (fish).',
        specs: { face: 'Soft Lead', refillable: 'Yes' },
        image: 'https://welltegra.network/assets/equipment/lib.png'
    },

    // --- COMPLETION & PCE ---
    {
        id: 'PCE-001',
        name: 'Quad BOP',
        category: 'pce',
        manufacturer: 'Texas Oil Tools',
        od: 'N/A',
        connection: '4-1/16 10K',
        description: 'Wireline blowout preventer with Blind, Shear, Slip, and Pipe rams.',
        specs: { rating: '10,000 psi', service: 'H2S' },
        image: 'https://welltegra.network/assets/equipment/bop.png'
    },
    {
        id: 'CMP-001',
        name: 'Retrievable Bridge Plug',
        category: 'completion',
        manufacturer: 'Halliburton',
        od: '4.300 in',
        connection: 'Baker #10',
        description: 'High-performance plug for temporary zonal isolation.',
        specs: { rating: '7,500 psi', temp: '350F' },
        image: 'https://welltegra.network/assets/equipment/plug.png'
    }
];

// ==========================================
// CATALOG LOGIC
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Equipment Catalog Module Loaded');
    
    // Initialize if we are on the equipment view
    const catalogGrid = document.getElementById('equipment-catalog-grid');
    if (catalogGrid) {
        renderCatalog(equipmentDatabase);
        setupSearch();
    }
});

function renderCatalog(data) {
    const grid = document.getElementById('equipment-catalog-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center p-8 text-gray-500">
                <p class="text-xl">No equipment found matching your criteria.</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        // Determine badge color based on category
        let badgeColor = 'bg-gray-600';
        if (item.category === 'fishing') badgeColor = 'bg-red-600';
        if (item.category === 'coiled-tubing') badgeColor = 'bg-blue-600';
        if (item.category === 'wireline') badgeColor = 'bg-yellow-600';

        const card = document.createElement('div');
        card.className = 'equipment-category-card relative group cursor-pointer';
        card.innerHTML = `
            <div class="absolute top-4 right-4">
                <span class="px-2 py-1 text-xs font-bold text-white rounded ${badgeColor} uppercase tracking-wider">
                    ${item.category.replace('-', ' ')}
                </span>
            </div>
            <div class="mb-4">
                <h3 class="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">${item.name}</h3>
                <p class="text-sm text-gray-400">${item.manufacturer} | ${item.id}</p>
            </div>
            <p class="text-sm text-gray-300 mb-4 h-12 overflow-hidden">${item.description}</p>
            
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4 bg-slate-800/50 p-2 rounded">
                <div>OD: <span class="text-white">${item.od}</span></div>
                <div>Conn: <span class="text-white">${item.connection}</span></div>
                ${Object.entries(item.specs).map(([key, val]) => 
                    `<div>${key}: <span class="text-white">${val}</span></div>`
                ).join('')}
            </div>

            <button class="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2" onclick="addToToolString('${item.id}')">
                <span>+</span> Add to Tool String
            </button>
        `;
        grid.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('equipment-catalog-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = equipmentDatabase.filter(item => 
            item.name.toLowerCase().includes(term) || 
            item.manufacturer.toLowerCase().includes(term) || 
            item.description.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
        renderCatalog(filtered);
    });
}

// Global function to handle filtering by category buttons
window.filterEquipmentCategory = function(category) {
    if (category === 'all') {
        renderCatalog(equipmentDatabase);
    } else {
        // Partial match to handle 'fishing', 'coiled-tubing' etc.
        const filtered = equipmentDatabase.filter(item => item.category.includes(category));
        renderCatalog(filtered);
    }
};

// Global function to handle tabs
window.switchEquipmentTab = function(tabName) {
    // Hide all content
    document.querySelectorAll('.equipment-tab-content').forEach(el => el.classList.add('hidden'));
    // Show selected content
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Update tab styling
    document.querySelectorAll('.equipment-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`button[data-tab="${tabName}"]`).classList.add('active');
};

// Global function stub for adding to tool string (functionality to be expanded later)
window.addToToolString = function(id) {
    const item = equipmentDatabase.find(i => i.id === id);
    if (item) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-bounce';
        toast.textContent = `Added ${item.name} to Tool String`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
