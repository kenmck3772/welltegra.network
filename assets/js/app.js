document.addEventListener('DOMContentLoaded', async function() {
    // --- DATA LOADER FOR COMPREHENSIVE WELL DATA ---
    let comprehensiveData = null;

    /**
     * Loads comprehensive well data from JSON file
     */
    async function loadComprehensiveWellData() {
        try {
            const response = await fetch('comprehensive-well-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load comprehensive well data: ${response.status}`);
            }
            comprehensiveData = await response.json();
            console.log(`Loaded comprehensive data for ${comprehensiveData.wells.length} wells`);
            return comprehensiveData;
        } catch (error) {
            console.error('Error loading comprehensive well data:', error);
            return null;
        }
    }

    /**
     * Transforms comprehensive well data to the app's expected format
     */
    function transformComprehensiveToAppFormat(comprehensiveWell) {
        try {
            const foundation = comprehensiveWell.foundationalIdentity || {};
            const design = comprehensiveWell.designAndConstruction || {};
            const operational = comprehensiveWell.operationalHistory || { events: [] };
            const integrity = comprehensiveWell.wellIntegrityAndRisk || { liveAnomalies: [] };

            // Build history array from operational events
            const history = (operational.events || []).map(event => ({
                date: event.eventDate || '',
                operation: event.eventType || '',
                problem: event.description || '',
                lesson: event.lessonsLearned || event.outcome || ''
            }));

        // Build daily reports from operational events with toolstrings
        const dailyReports = (operational.events || [])
            .filter(event => event.toolstringRun && event.toolstringRun.length > 0)
            .map(event => ({
                date: event.startDate || event.eventDate || '',
                summary: `${event.eventType || 'Event'} - ${event.outcome || ''}`,
                npt: event.npt_hours || event.nptHours || 0,
                toolstringRun: event.toolstringRun || []
            }));

        // Build casing array
        const casing = (design.casingStrings || []).map(str => {
            const isProblem = str.integrityStatus && str.integrityStatus.includes('CRITICAL');
            // Format size properly (e.g., "9 5/8" for 9.625)
            const size = str.outerDiameter_in.toString().replace('.', ' ');
            return {
                type: str.type,
                size: size,
                top: str.topDepthMD_ft,
                bottom: str.bottomDepthMD_ft,
                isProblem: isProblem
            };
        });

        // Build tubing array
        const tubing = (design.tubingStrings || []).map(str => {
            const size = (str.outerDiameter_in || 0).toString().replace('.', ' ');
            return {
                type: str.type || 'Tubing',
                size: size,
                top: str.topDepthMD_ft || 0,
                bottom: str.bottomDepthMD_ft || 0
            };
        });

        // Build equipment array from downhole equipment
        const equipment = (design.downholeEquipment || []).map(eq => {
            const isProblem = eq.functionalStatus && (eq.functionalStatus.includes('Failed') || eq.functionalStatus.includes('CRITICAL'));
            return {
                item: eq.itemType.split('(')[0].trim(),
                top: eq.depthMD_ft,
                comments: eq.functionalStatus || eq.description,
                isProblem: isProblem
            };
        });

        // Add anomalies as equipment problems
        if (integrity.liveAnomalies && integrity.liveAnomalies.length > 0) {
            integrity.liveAnomalies.forEach(anomaly => {
                if (anomaly.severity === 'Critical' || anomaly.severity === 'High') {
                    equipment.push({
                        item: anomaly.type,
                        top: anomaly.locationMD_ft,
                        comments: anomaly.description,
                        isProblem: true
                    });
                }
            });
        }

        // Build perforations array
        const perforations = design.perforations ? design.perforations.map(perf => ({
            top: perf.topDepthMD_ft,
            bottom: perf.bottomDepthMD_ft
        })) : [];

            return {
                id: foundation.wellId || 'UNKNOWN',
                name: foundation.commonWellName || 'Unnamed Well',
                field: foundation.fieldName || 'Unknown Field',
                region: foundation.regulatoryAuthority === 'North Sea Transition Authority (NSTA)' ? 'UKCS' : 'Unknown',
                type: foundation.wellType || 'Unknown Type',
                depth: `${(foundation.totalDepthMD_ft || 0).toLocaleString()}ft`,
                status: foundation.currentStatus || 'Unknown Status',
                issue: `${(integrity.liveAnomalies || []).length > 0 ? 'Multiple integrity issues requiring intervention' : 'Well operational with comprehensive monitoring'}`,
                history: history,
                dailyReports: dailyReports,
                completion: {
                    casing: casing,
                    tubing: tubing,
                    equipment: equipment,
                    perforations: perforations
                },
                // Store reference to comprehensive data for future use
                _comprehensiveData: comprehensiveWell
            };
        } catch (error) {
            console.error('Error transforming well data:', error, comprehensiveWell);
            return null;
        }
    }

    // --- SECURITY UTILITIES ---
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} The escaped text safe for HTML insertion
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- UI COMPONENT BUILDERS ---
    /**
     * Creates a radial gauge component and injects it into a container.
     * @param {string} containerId - The ID of the element to contain the gauge.
     * @param {string} label - The text label for the gauge.
     * @param {string} units - The units for the gauge value.
     * @param {number} maxValue - The maximum value for the gauge's scale.
     */
    function createRadialGauge(containerId, label, units, maxValue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const size = 120;
        const strokeWidth = 10;
        const radius = (size / 2) - (strokeWidth * 2);
        const circumference = radius * 2 * Math.PI;

        // Clear container first
        container.textContent = '';

        // Create outer div
        const outerDiv = document.createElement('div');
        outerDiv.className = 'relative';
        outerDiv.style.width = size + 'px';
        outerDiv.style.height = size + 'px';

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'w-full h-full');
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

        // Create background circle
        const circleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleBg.setAttribute('class', 'gauge-bg');
        circleBg.setAttribute('cx', size/2);
        circleBg.setAttribute('cy', size/2);
        circleBg.setAttribute('r', radius);
        circleBg.setAttribute('stroke-width', strokeWidth);

        // Create foreground circle
        const circleFg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleFg.setAttribute('class', 'gauge-fg stroke-normal');
        circleFg.setAttribute('cx', size/2);
        circleFg.setAttribute('cy', size/2);
        circleFg.setAttribute('r', radius);
        circleFg.setAttribute('stroke-width', strokeWidth);
        circleFg.setAttribute('stroke-dasharray', circumference);
        circleFg.setAttribute('stroke-dashoffset', circumference);
        circleFg.style.transition = 'stroke-dashoffset 0.5s';

        svg.appendChild(circleBg);
        svg.appendChild(circleFg);

        // Create inner div with gauge value and units
        const innerDiv = document.createElement('div');
        innerDiv.className = 'absolute inset-0 flex flex-col items-center justify-center';

        const valueSpan = document.createElement('span');
        valueSpan.className = 'gauge-value text-2xl font-bold gauge-text text-normal';
        valueSpan.textContent = '0';

        const unitsSpan = document.createElement('span');
        unitsSpan.className = 'gauge-units text-xs text-slate-400';
        unitsSpan.textContent = units; // Auto-escaped

        innerDiv.appendChild(valueSpan);
        innerDiv.appendChild(unitsSpan);

        outerDiv.appendChild(svg);
        outerDiv.appendChild(innerDiv);

        // Create label
        const labelH4 = document.createElement('h4');
        labelH4.className = 'mt-2 text-sm font-semibold text-slate-300';
        labelH4.textContent = label; // Auto-escaped

        container.appendChild(outerDiv);
        container.appendChild(labelH4);
    }

    /**
     * Updates an existing radial gauge component with a new value.
     * @param {string} containerId - The ID of the gauge's container element.
     * @param {number} value - The new value to display.
     * @param {number} maxValue - The maximum value of the gauge's scale.
     */
    function updateRadialGauge(containerId, value, maxValue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const gaugeFg = container.querySelector('.gauge-fg');
        const gaugeValue = container.querySelector('.gauge-value');
        if (!gaugeFg || !gaugeValue) return;

        const radius = gaugeFg.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (value / maxValue) * circumference;
        gaugeFg.style.strokeDashoffset = Math.max(0, Math.min(circumference, offset));

        gaugeValue.textContent = value.toFixed(0);

        const percentage = (value / maxValue) * 100;
        let colorClass = 'normal';
        if (percentage > 90) colorClass = 'danger';
        else if (percentage > 75) colorClass = 'warning';

        gaugeFg.classList.remove('stroke-normal', 'stroke-warning', 'stroke-danger');
        gaugeValue.classList.remove('text-normal', 'text-warning', 'text-danger');
        gaugeFg.classList.add(`stroke-${colorClass}`);
        gaugeValue.classList.add(`text-${colorClass}`);
    }

    /**
     * Creates a horizontal bar gauge component.
     * @param {string} containerId - The ID of the element to contain the gauge.
     * @param {string} label - The text label for the gauge.
     * @param {string} units - The units for the gauge value.
     * @param {number} maxValue - The maximum value for the gauge's scale.
     */
    function createBarGauge(containerId, label, units, maxValue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        // Clear container first
        container.textContent = '';

        // Create label
        const labelH4 = document.createElement('h4');
        labelH4.className = 'text-sm font-semibold text-slate-300';
        labelH4.textContent = label; // Auto-escaped

        // Create outer bar container
        const outerBarDiv = document.createElement('div');
        outerBarDiv.className = 'w-full bar-bg rounded-full h-2.5 my-2';

        // Create inner bar (foreground)
        const innerBarDiv = document.createElement('div');
        innerBarDiv.className = 'bar-fg bg-normal h-2.5 rounded-full';
        innerBarDiv.style.width = '0%';

        outerBarDiv.appendChild(innerBarDiv);

        // Create value display container
        const valueDiv = document.createElement('div');
        valueDiv.className = 'text-center';

        const valueSpan = document.createElement('span');
        valueSpan.className = 'bar-value text-2xl font-bold gauge-text text-normal';
        valueSpan.textContent = '0';

        const unitsSpan = document.createElement('span');
        unitsSpan.className = 'bar-units text-xs text-slate-400';
        unitsSpan.textContent = units; // Auto-escaped

        valueDiv.appendChild(valueSpan);
        valueDiv.appendChild(document.createTextNode(' '));
        valueDiv.appendChild(unitsSpan);

        container.appendChild(labelH4);
        container.appendChild(outerBarDiv);
        container.appendChild(valueDiv);
    }

    /**
     * Updates an existing bar gauge component with a new value.
     * @param {string} containerId - The ID of the gauge's container element.
     * @param {number} value - The new value to display.
     * @param {number} maxValue - The maximum value of the gauge's scale.
     */
    function updateBarGauge(containerId, value, maxValue) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const barFg = container.querySelector('.bar-fg');
        const barValue = container.querySelector('.bar-value');
        if (!barFg || !barValue) return;

        const absValue = Math.abs(value);
        const percentage = Math.min(100, (absValue / maxValue) * 100);
        barFg.style.width = `${percentage}%`;
        barValue.textContent = value.toFixed(0);

        let colorClass = 'normal';
        if (percentage > 90) colorClass = 'danger';
        else if (percentage > 75) colorClass = 'warning';

        barFg.classList.remove('bg-normal', 'bg-warning', 'bg-danger');
        barValue.classList.remove('text-normal', 'text-warning', 'text-danger');
        barFg.classList.add(`bg-${colorClass}`);
        barValue.classList.add(`text-${colorClass}`);
    }

    // --- DATA STORE (LOADED FROM COMPREHENSIVE WELL DATA) ---
    // Initialize with empty array - will be populated from comprehensive-well-data.json
    let wellData = [];
    let dataLoaded = false;

    // Load and transform comprehensive well data
    async function initializeWellData() {
        try {
            const compData = await loadComprehensiveWellData();
            if (compData && compData.wells) {
                wellData = compData.wells
                    .map(transformComprehensiveToAppFormat)
                    .filter(well => well !== null); // Filter out any transformation errors
                console.log(`Initialized ${wellData.length} wells from comprehensive dataset`);
                dataLoaded = true;
                return true;
            } else {
                console.warn('Failed to load comprehensive well data');
                return false;
            }
        } catch (error) {
            console.error('Error initializing well data:', error);
            return false;
        }
    }
    const objectivesData = [ 
        { id: 'obj1', name: 'Remediate Casing Deformation', description: 'Install an expandable steel patch to restore wellbore access.', icon: 'ðŸ”§' }, 
        { id: 'obj2', name: 'Remove BaSO4 Scale', description: 'Use a chemical and mechanical method to clear tubing blockage.', icon: 'ðŸ§ª' }, 
        { id: 'obj3', name: 'Restore Downhole Safety Valve', description: 'Lock open the failed TRSSV and install a new insert valve.', icon: 'ðŸ”’' }, 
        { id: 'obj4', name: 'Repair Sand Control', description: 'Install a through-tubing expandable sand screen patch.', icon: 'ðŸ–ï¸' }, 
        { id: 'obj5', name: 'Paraffin Wax Removal', description: 'Use CT with chemicals and tools to remove wax blockage.', icon: 'ðŸ•¯ï¸' } 
    ];
    const problemsData = [ 
        { id: 'prob1', name: 'Loss of Well Access (Casing Deformation)', description: 'Wellbore is restricted due to geomechanical forces.', linked_objectives: ['obj1'], icon: 'ðŸš«' }, 
        { id: 'prob2', name: 'Severe Scale Blockage', description: 'Production is blocked by hard, insoluble scale.', linked_objectives: ['obj2'], icon: 'ðŸš°' }, 
        { id: 'prob3', name: 'Failed Primary Safety Barrier (DHSV)', description: 'Well is legally shut-in due to a failed safety valve.', linked_objectives: ['obj3'], icon: 'âš ï¸' }, 
        { id: 'prob4', name: 'Sand Control Failure', description: 'Excessive sand production is damaging equipment and limiting rates.', linked_objectives: ['obj4'], icon: 'ðŸœï¸' }, 
        { id: 'prob5', name: 'Flow Assurance Blockage (Wax)', description: 'Production is severely restricted by paraffin deposits.', linked_objectives: ['obj5'], icon: 'ðŸ•¯ï¸' } 
    ];
    const aiRecommendations = {
        prob1: [ 
            { objectiveId: 'obj1', confidence: 95, outcome: 'Full-bore access restored', reason: 'Historical analysis of case study <strong>11 (The Brahan Squeeze)</strong> confirms an expandable steel patch is the standard, high-success-rate rigless solution for this specific failure mode in this field.' } 
        ],
        prob2: [ 
            { objectiveId: 'obj2', confidence: 92, outcome: 'Blockage cleared, production restored', reason: 'Based on the successful intervention on case study <strong>S-15 (The Scale Trap)</strong>, a two-stage chemical (DTPA) and mechanical (jetting) intervention has the highest probability of success. This avoids the high risk of stuck pipe associated with milling.' } 
        ],
        prob3: [ 
            { objectiveId: 'obj3', confidence: 99, outcome: 'Well returned to safe, compliant production', reason: 'This is a standard operation. The critical lesson from case study <strong>F-11 (The Broken Barrier)</strong> is to use a reliable mechanical lock-open tool to avoid procedural failures and ensure a successful, single-run repair.' } 
        ],
        prob4: [ 
            { objectiveId: 'obj4', confidence: 88, outcome: 'Sand-free production at >80% potential', reason: 'The success on case study <strong>C-08 (The Sandstorm)</strong> proves a through-tubing expandable sand screen is the optimal rigless solution. This avoids a costly workover.' } 
        ],
        prob5: [ 
            { objectiveId: 'obj5', confidence: 90, outcome: 'Wax blockage removed, production increased by >400%', reason: 'The case study from <strong>P-12 (The Wax Plug)</strong> shows that a Coiled Tubing intervention with both heated chemical dissolvers and a mechanical scraper tool is the most effective procedure.' } 
        ]
    };
    const proceduresData = {
        obj1: { 
            name: "Expandable Casing Patch Installation", 
            personnel: ["Wellsite Engineer", "HWU Supervisor"], 
            steps: [
                "Perform wellbore cleanout trip with scraper and gauge ring.",
                "RIH with expandable patch on jointed pipe.",
                "Position patch across deformed interval using GR/CCL correlation.",
                "Set patch using hydraulic setting tool.",
                "Pressure test patch to verify seal.",
                "POOH and return well to service."
            ], 
            risks: { operational: 4, geological: 2, equipment: 4, hse: 3, financial: 3 }, 
            cost: 1200000, 
            duration: 8, 
            tfaModel: { pickUp: [[0,0], [9000, 60]], slackOff: [[0,0], [9000, -60]], alarmUpper: [[0,10], [9000, 70]], alarmLower: [[0,-10], [9000, -70]] } 
        },
        obj2: { 
            name: "CT Chemical & Mechanical Scale Removal", 
            personnel: ["Coiled Tubing Supervisor", "Pump Operator"], 
            steps: [
                "RIH with CT and spot DTPA chemical dissolver across scale.",
                "POOH with CT and let chemical soak for 36 hours.",
                "RIH with CT and rotating jetting BHA.",
                "Mechanically break up and circulate out softened scale.",
                "Circulate well clean and POOH.",
                "Return well to production."
            ], 
            risks: { operational: 5, geological: 2, equipment: 4, hse: 4, financial: 3 }, 
            cost: 950000, 
            duration: 6, 
            tfaModel: { pickUp: [[0,0], [14500, 35]], slackOff: [[0,0], [14500, -35]], alarmUpper: [[0,2], [14500, 37]], alarmLower: [[0,-2], [14500, -37]] } 
        },
        obj3: { 
            name: "Slickline Insert Safety Valve Installation", 
            personnel: ["Slickline Supervisor"], 
            steps: [
                "RIH with heavy-duty toolstring and mechanically lock open the failed TRSSV.",
                "POOH and confirm lock-open.",
                "RIH with new Wireline-Retrievable Safety Valve (WRSV) on a running tool.",
                "Set and lock the new WRSV in the old valve's nipple profile.",
                "Pressure up control line to hold new valve open, then retrieve running tool.",
                "Perform full inflow and function test of new valve to certify.",
                "Return well to production."
            ], 
            risks: { operational: 3, geological: 1, equipment: 4, hse: 3, financial: 2 }, 
            cost: 350000, 
            duration: 3, 
            tfaModel: { pickUp: [[0, 100], [9800, 160]], slackOff: [[0, 100], [9800, 40]], alarmUpper: [[0, 110], [9800, 170]], alarmLower: [[0, 90], [9800, 30]] } 
        },
        obj4: { 
            name: "Through-Tubing ESS Patch Installation", 
            personnel: ["Wellsite Engineer", "HWU Supervisor"], 
            steps: [
                "Perform CT cleanout of sand from inside existing screen.",
                "RIH with Expandable Sand Screen (ESS) patch on jointed pipe.",
                "Position patch across failed screen interval.",
                "Expand patch using mechanical expansion tool.",
                "POOH and slowly bring well back online, monitoring sand production."
            ], 
            risks: { operational: 4, geological: 3, equipment: 5, hse: 3, financial: 4 }, 
            cost: 1500000, 
            duration: 10, 
            tfaModel: { pickUp: [[0,0], [10000, 50]], slackOff: [[0,0], [10000, -50]], alarmUpper: [[0,5], [10000, 55]], alarmLower: [[0,-5], [10000, -55]] } 
        },
        obj5: { 
            name: "CT Wax Removal", 
            personnel: ["Coiled Tubing Supervisor", "Pump Operator"], 
            steps: [
                "Rig up Coiled Tubing unit.",
                "Pump heated solvent to dissolve wax.",
                "RIH with CT and a mechanical scraper BHA to clear remaining deposits.",
                "Circulate well clean with hot fluid.",
                "POOH with CT.",
                "Return well to production."
            ], 
            risks: { operational: 4, geological: 2, equipment: 3, hse: 3, financial: 2 }, 
            cost: 650000, 
            duration: 4, 
            tfaModel: { pickUp: [[0,0], [7500, 20]], slackOff: [[0,0], [7500, -20]], alarmUpper: [[0,2], [7500, 22]], alarmLower: [[0,-2], [7500, -22]] } 
        }
    };
    const equipmentRequirements = {
        obj1: [ { name: "Hydraulic Workover Unit (HWU)", source: "Vendor", price: 300000 }, { name: "Expandable Steel Patch & Setting Tool", source: "Vendor", price: 500000 } ],
        obj2: [ { name: "Coiled Tubing Unit", source: "Vendor", price: 125000 }, { name: "Rotating Jetting Nozzle", source: "Vendor", price: 25000 }, { name: "DTPA Chemical", source: "Vendor", price: 80000 } ],
        obj3: [ { name: "Slickline Unit", source: "Vendor", price: 75000 }, { name: "Insert Safety Valve (WRSV)", source: "Vendor", price: 150000 }, { name: "Lock-Open Tool", source: "Vendor", price: 20000 } ],
        obj4: [ { name: "Hydraulic Workover Unit (HWU)", source: "Vendor", price: 300000 }, { name: "Expandable Sand Screen & Expansion Tool", source: "Vendor", price: 600000 } ],
        obj5: [ { name: "Coiled Tubing Unit", source: "Vendor", price: 125000 }, { name: "Wax Dissolver Chemical", source: "Vendor", price: 50000 }, { name: "Mechanical Scraper BHA", source: "Vendor", price: 15000 } ]
    };
    const equipmentData = [ 
        { id: 'CTU-01', type: 'Coiled Tubing Unit', location: 'Onboard - Deck A', testStatus: 'Passed', nextMaint: '2025-09-15', rate: 25000, status: 'On Job' }, 
        { id: 'CTU-02', type: 'Coiled Tubing Unit', location: 'Onshore Base', testStatus: 'Pending', nextMaint: '2025-07-10', rate: 25000, status: 'Maintenance' }, 
        { id: 'WL-01', type: 'Wireline Truck/Skid', location: 'Onshore Base', testStatus: 'Passed', nextMaint: '2025-08-22', rate: 18000, status: 'Available' }, 
        { id: 'SL-01', type: 'Slickline Unit', location: 'In Transit', testStatus: 'Passed', nextMaint: '2025-07-20', rate: 15000, status: 'In Transit' }, 
        { id: 'PUMP-01', type: 'High-Pressure Pumps', location: 'Onboard - Pump Room', testStatus: 'Pending', nextMaint: '2025-10-01', rate: 8000, status: 'On Job' }, 
        { id: 'PUMP-02', type: 'High-Pressure Pumps', location: 'Onshore Base', testStatus: 'Passed', nextMaint: '2025-11-05', rate: 8000, status: 'Available' }, 
        { id: 'RIG-01', type: 'Workover Rig', location: 'Onboard - Drill Floor', testStatus: 'Passed', nextMaint: '2025-08-01', rate: 85000, status: 'On Job' }, 
    ];
    const personnelData = [ 
        { id: 'P001', name: 'Bob Raker', role: 'Wellsite Engineer', company: 'Operator', status: 'Onboard', certsValid: true, rate: 2200, muster: 'A', lifeboat: 1 }, 
        { id: 'P002', name: 'Jane Smith', role: 'Coiled Tubing Supervisor', company: 'Service Co.', status: 'Onboard', certsValid: true, rate: 2500, muster: 'A', lifeboat: 1 }, 
        { id: 'P003', name: 'Mike Johnson', role: 'Wireline Supervisor', company: 'Service Co.', status: 'On Job', certsValid: true, rate: 2300, muster: 'B', lifeboat: 2 }, 
        { id: 'P004', name: 'Emily White', role: 'Slickline Supervisor', company: 'Service Co.', status: 'Available', certsValid: false, rate: 2300, muster: 'B', lifeboat: 2 }, 
        { id: 'P005', name: 'Chris Green', role: 'Pump Operator', company: 'Service Co.', status: 'In Transit', certsValid: true, rate: 1800, muster: 'A', lifeboat: 1 }, 
        { id: 'P006', name: 'Alex Brown', role: 'Rig Supervisor', company: 'Operator', status: 'Onboard', certsValid: true, rate: 3000, muster: 'B', lifeboat: 2 }, 
        { id: 'P007', name: 'David Chen', role: 'ESP Specialist', company: 'Service Co.', status: 'Standby', certsValid: true, rate: 3500, muster: 'A', lifeboat: 2 } 
    ];
    const musterStations = [ { id: 'A', name: 'Muster Station A', capacity: 50, current: 0 }, { id: 'B', name: 'Muster Station B', capacity: 50, current: 0 } ];
    
    // --- FAQ DATA ---

    const faqData = [
        {
            question: "What is Well-Tegra?",
            answer: `<p>Well-Tegra is an advanced technology platform designed to foster collaborative intelligence within the energy sector. It provides a comprehensive architectural blueprint that integrates privacy-preserving Artificial Intelligence (AI) and enterprise blockchain technology to solve long-standing challenges in energy operations.</p><p>Its primary mission is to transform the vast, fragmented, and often inaccessible data generated by oil and gas operations into a unified, analysis-ready asset, enabling competing firms to securely pool operational insights for mutual benefit.</p>`
        },
        {
            question: "What fundamental problem does Well-Tegra solve?",
            answer: `<p>The fundamental problem Well-Tegra addresses is the <strong>endemic data fragmentation</strong> that plagues the modern energy sector. Data is typically locked in isolated "silos," hindering the application of advanced analytics and machine learning.</p><p>This fragmentation comes from disparate sources, incompatible digital formats, and inaccessible physical data, meaning decades of invaluable operational knowledge remain locked away and unusable.</p>`
        },
        {
            question: "Who is the target audience for the Well-Tegra platform?",
            answer: `<p>The primary target audience consists of <strong>oil and gas operators</strong> and other firms within the energy industry's operational ecosystem. The platform is designed to serve both individual companies seeking to optimize their internal operations and consortia of competing firms aiming to achieve shared intelligence.</p>`
        },
        {
            question: "Why does Well-Tegra use blockchain technology?",
            answer: `<p>Well-Tegra uses a <strong>private, permissioned blockchain</strong> to create a trusted, transparent, and tamper-proof foundation for its multi-client collaborative ecosystem. This is not a public cryptocurrency blockchain, but a secure environment for vetted partners.</p><p>It provides three core guarantees:</p><ul><li><strong>Cryptographic Hashing:</strong> A unique digital fingerprint for data, making tampering obvious.</li><li><strong>Block Chaining:</strong> An unbreakable, interlocking chain where altering one block invalidates all subsequent blocks.</li><li><strong>Decentralization:</strong> The ledger is copied across all members, requiring majority consensus for changes, making fraudulent changes practically impossible.</li></ul>`
        },
        {
            question: "How can competing companies share data without revealing confidential information?",
            answer: `<p>Well-Tegra implements a sophisticated, multi-stage anonymization protocol. This "defense-in-depth" strategy layers several advanced privacy-enhancing technologies:</p><ul><li><strong>Stage 1: Identification and Suppression:</strong> Removing explicit identifiers like company and well names.</li><li><strong>Stage 2: Generalization for K-Anonymity and L-Diversity:</strong> Making records indistinguishable from others to prevent re-identification from combined attributes.</li><li><strong>Stage 3: Perturbation with Differential Privacy:</strong> Adding calibrated statistical "noise" to sensitive numerical data to provide a formal, mathematical guarantee of privacy.</li></ul><p>The platform's most innovative feature is <strong>"verifiable privacy,"</strong> where the anonymization rules are coded into a smart contract on the blockchain, allowing participants to cryptographically verify that the agreed-upon privacy protocol was executed.</p>`
        },
        {
            question: "What is the 'network effect' and how does it benefit data providers?",
            answer: `<p>The "network effect" is the principle that the value of the platform increases for every participant as more members join. This is achieved by securely leveraging the collective, anonymized data of the entire consortium to build predictive models that are far more powerful than any single organization could develop alone.</p><p>This creates a <strong>virtuous cycle</strong>: more data leads to better models, which provides a powerful incentive for new members to join, which in turn makes the models even more powerful for everyone.</p>`
        },
    ];

    // --- GLOBAL STATE ---

    let appState = {
        currentView: 'home', 
        selectedWell: null, 
        selectedObjective: null, 
        generatedPlan: null, 
        liveData: null, 
        logEntries: [], 
        lessonsLearned: [], 
        tfaChartInstance: null, 
        nptChartInstance: null, 
        savingsChartInstance: null, 
        liveDataInterval: null,
        commercial: { afe: 0, actualCost: 0, serviceTickets: [] },
        ai: { selectedProblemId: null, selectedRecommendation: null },
        hse: { permits: [], riskRegister: [] },
        pob: { musterActive: false, musterInterval: null, personnel: [] }
    };

    // --- DOM ELEMENTS ---

    const body = document.body;
    const welcomeScreen = document.getElementById('welcome-screen');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const views = document.querySelectorAll('.view-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerTitle = document.getElementById('header-title');
    const headerDetails = document.getElementById('header-details');
    const headerNav = document.getElementById('header-nav');
    
    // Planner

    const stepIndicators = {
        1: document.getElementById('step-1-indicator'),
        2: document.getElementById('step-2-indicator'),
        3: document.getElementById('step-3-indicator'),
        4: document.getElementById('step-4-indicator'),
        5: document.getElementById('step-5-indicator'),
        6: document.getElementById('step-6-indicator')
    };

    const stepConnectors = {
        1: document.getElementById('step-1-connector'),
        2: document.getElementById('step-2-connector'),
        3: document.getElementById('step-3-connector'),
        4: document.getElementById('step-4-connector'),
        5: document.getElementById('step-5-connector')
    };

    const stepSections = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4'),
        5: document.getElementById('step-5'),
        6: document.getElementById('step-6')
    };
    
    const wellSelectionGrid = document.getElementById('well-selection-grid');
    const backToPlannerBtn = document.getElementById('back-to-planner-btn');
    const objectivesFieldset = document.getElementById('objectives-fieldset');
    const problemsFieldset = document.getElementById('problems-fieldset');
    const generatePlanBtnManual = document.getElementById('generate-plan-btn-manual');
    const generatePlanBtnAi = document.getElementById('generate-plan-btn-ai');
    const planOutput = document.getElementById('plan-output');
    const startOverBtn = document.getElementById('start-over-btn');
    const beginOpBtn = document.getElementById('begin-op-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const manualPlanningView = document.getElementById('manual-planning-view');
    const aiAdvisorView = document.getElementById('ai-advisor-view');
    const aiRecommendationsContainer = document.getElementById('ai-recommendations');
    const step1ContinueBtn = document.getElementById('step-1-continue');
    const step2ContinueBtn = document.getElementById('step-2-continue');
    const step4ContinueBtn = document.getElementById('step-4-continue');
    const step5ContinueBtn = document.getElementById('step-5-continue');

    // Performer

    const kpiGrid = document.getElementById('kpi-grid');
    const procedureStepsContainer = document.getElementById('procedure-steps');
    const logEntriesContainer = document.getElementById('log-entries'), 
    logInput = document.getElementById('log-input'), 
    addLogBtn = document.getElementById('add-log-btn');
    const chartCard = document.getElementById('chart-card');
    const performerControls = document.getElementById('performer-controls');
    const viewAnalysisBtn = document.getElementById('view-analysis-btn');

    // Analyzer

    const analyzerSubtitle = document.getElementById('analyzer-subtitle'), 
    summaryKpis = document.getElementById('summary-kpis'), 
    lessonsLearnedList = document.getElementById('lessons-learned-list'), 
    lessonInput = document.getElementById('lesson-input'), 
    addLessonBtn = document.getElementById('add-lesson-btn'), 
    planNewJobBtn = document.getElementById('plan-new-job-btn');

    // Logistics

    const logisticsSubtitle = document.getElementById('logistics-subtitle');
    const logisticsContent = document.getElementById('logistics-content');
    const equipmentTableBody = document.getElementById('equipment-table-body'), 
    personnelTableBody = document.getElementById('personnel-table-body');
    const equipmentSearch = document.getElementById('equipment-search'), 
    personnelSearch = document.getElementById('personnel-search');

    // Commercial

    const commercialContent = document.getElementById('commercial-content'), 
    commercialSubtitle = document.getElementById('commercial-subtitle');

    // HSE & POB

    const hseContent = document.getElementById('hse-content'), 
    hseSubtitle = document.getElementById('hse-subtitle');
    const pobContent = document.getElementById('pob-content'), 
    pobSubtitle = document.getElementById('pob-subtitle');

    // Modal

    const modal = document.getElementById('well-history-modal'), 
    modalTitle = document.getElementById('modal-title'), 
    modalContent = document.getElementById('modal-content'), 
    closeModalBtn = document.getElementById('close-modal-btn');
    
    // Theme

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // --- VIEW & STATE MANAGEMENT ---

    const switchView = (viewName) => {
        if (appState.liveDataInterval) {
            clearInterval(appState.liveDataInterval);
            appState.liveDataInterval = null;
        }

        appState.currentView = viewName;
        body.className = `theme-${localStorage.getItem('theme') || 'dark'}`;
        if (viewName === 'performer') {
            body.classList.add('theme-dark');
        }

        views.forEach(v => v.classList.add('hidden'));
        document.getElementById(`${viewName}-view`).classList.remove('hidden');

        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.getElementById(`${viewName}-nav-link`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        headerDetails.innerHTML = '';
        const theme = viewName === 'performer' ? 'dark' : localStorage.getItem('theme') || 'dark';
        setTheme(theme);

        let viewTitle = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        if(viewName === 'pob') viewTitle = 'POB & ER';
        if(viewName === 'hse') viewTitle = 'HSE & Risk';
        if(viewName === 'whitepaper') viewTitle = 'White Paper';
        headerTitle.textContent = `Well-Tegra: ${viewTitle}`;

        if (viewName === 'performer' && appState.selectedWell && appState.generatedPlan) {
            // Clear and rebuild headerDetails with safe DOM methods
            headerDetails.textContent = '';

            const statusSpan = document.createElement('span');
            statusSpan.id = 'job-status';
            statusSpan.className = 'text-lg font-semibold text-emerald-400';
            statusSpan.textContent = '● LIVE';

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'text-right';

            const wellP = document.createElement('p');
            wellP.className = 'text-sm';
            wellP.textContent = 'Well: ' + appState.selectedWell.name; // Auto-escaped

            const jobP = document.createElement('p');
            jobP.className = 'text-sm';
            jobP.textContent = 'Job: ' + appState.generatedPlan.name; // Auto-escaped

            detailsDiv.appendChild(wellP);
            detailsDiv.appendChild(jobP);

            headerDetails.appendChild(statusSpan);
            headerDetails.appendChild(detailsDiv);
            initializePerformer();
        } else if (['analyzer', 'commercial', 'hse', 'pob'].includes(viewName)) {
            if(appState.selectedWell && appState.generatedPlan) {
                // Clear and rebuild headerDetails with safe DOM methods
                headerDetails.textContent = '';

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'text-right';

                const wellP = document.createElement('p');
                wellP.className = 'text-sm';
                wellP.textContent = 'Well: ' + appState.selectedWell.name; // Auto-escaped

                const jobP = document.createElement('p');
                jobP.className = 'text-sm';
                jobP.textContent = 'Job: ' + appState.generatedPlan.name; // Auto-escaped

                detailsDiv.appendChild(wellP);
                detailsDiv.appendChild(jobP);

                headerDetails.appendChild(detailsDiv);
            }
            if (viewName === 'commercial') renderCommercialView();
            if (viewName === 'hse') renderHSEView();
            if (viewName === 'pob') renderPOBView();
        } else if (viewName === 'logistics') {
            renderAssetManagementViews();
        } else if (viewName === 'faq') {
            initializeFaqAccordion();
        }
    };
    
    const resetApp = (switchToHome = false) => {
        appState.selectedWell = null; 
        appState.selectedObjective = null; 
        appState.generatedPlan = null; 
        appState.lessonsLearned = [];
        appState.commercial = { afe: 0, actualCost: 0, serviceTickets: [] };
        appState.ai = { selectedProblemId: null, selectedRecommendation: null };
        
        // Reset well selection
        document.querySelectorAll('.planner-card').forEach(c => c.classList.remove('selected'));
        
        // Reset objective selection
        const checkedObjective = document.querySelector('input[name="objective"]:checked');
        if(checkedObjective) { checkedObjective.checked = false; }
        
        // Reset problem selection
        const checkedProblem = document.querySelector('input[name="problem"]:checked');
        if(checkedProblem) { checkedProblem.checked = false; }
        
        // Reset buttons
        generatePlanBtnManual.disabled = true;
        generatePlanBtnAi.disabled = true;
        if (step1ContinueBtn) step1ContinueBtn.disabled = true;
        if (step2ContinueBtn) step2ContinueBtn.disabled = true;

        // Reset AI recommendations
        aiRecommendationsContainer.classList.add('hidden');
        
        // Reset AI toggle
        aiToggle.checked = false;
        manualPlanningView.classList.remove('hidden');
        aiAdvisorView.classList.add('hidden');
        
        switchView(switchToHome ? 'home' : 'planner');
        updatePlannerStepUI(1);
        updateNavLinks();
    };

    const updateNavLinks = () => {
        const planExists = !!appState.generatedPlan;
        navLinks.forEach(link => {
            const id = link.id.replace('-nav-link', '');
            if (id !== 'home' && id !== 'planner' && id !== 'about' && id !== 'faq' && id !== 'whitepaper') {
                if (planExists) {
                    link.classList.remove('disabled');
                } else {
                    link.classList.add('disabled');
                }
            }
        });
    };

    // --- PLANNER LOGIC ---

    const renderWellCards = () => {
        wellSelectionGrid.textContent = '';
        wellData.forEach(well => {
            const isWellFromHell = well.id === '666';
            const statusClass = well.status.toLowerCase().replace(/[\s-]/g, '');
            const statusColor = isWellFromHell ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400';
            const compData = well._comprehensiveData || {};
            const foundation = compData.foundationalIdentity || {};
            const design = compData.designAndConstruction || {};
            const operational = compData.operationalHistory || {};
            const integrity = compData.wellIntegrityAndRisk || {};
            const equipment = compData.equipmentAndAssets || {};
            const safety = compData.safetyAndCompliance || {};

            const card = document.createElement('div');
            card.className = 'well-card-enhanced planner-card light-card ' + (isWellFromHell ? 'border-red-500' : 'border-gray-200');
            card.setAttribute('data-well-id', well.id);

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header ' + (isWellFromHell ? 'bg-red-500' : 'bg-blue-500');

            const headerFlex = document.createElement('div');
            headerFlex.className = 'flex justify-between items-center';

            const h3 = document.createElement('h3');
            h3.className = 'text-xl font-bold text-white';
            h3.textContent = well.name; // Auto-escaped

            const badge = document.createElement('span');
            badge.className = (isWellFromHell ? 'bg-red-700' : 'bg-blue-700') + ' text-white text-xs px-2 py-1 rounded-full';
            badge.textContent = isWellFromHell ? 'CRITICAL' : 'CASE STUDY';

            headerFlex.appendChild(h3);
            headerFlex.appendChild(badge);

            const headerP = document.createElement('p');
            headerP.className = 'text-sm text-blue-100';
            headerP.textContent = well.field + ' - ' + well.type; // Auto-escaped

            cardHeader.appendChild(headerFlex);
            cardHeader.appendChild(headerP);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'mb-3';

            const statusSpan = document.createElement('span');
            statusSpan.className = 'inline-block px-2 py-1 text-xs font-medium rounded-full status-' + statusClass;
            statusSpan.textContent = well.status; // Auto-escaped

            bodyDiv.appendChild(statusSpan);

            const issueP = document.createElement('p');
            issueP.className = 'text-sm mb-4';
            issueP.textContent = well.issue; // Auto-escaped

            cardBody.appendChild(bodyDiv);
            cardBody.appendChild(issueP);

            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';

            const footerFlex = document.createElement('div');
            footerFlex.className = 'flex justify-between items-center';

            const depthSpan = document.createElement('span');
            depthSpan.className = 'text-xs text-gray-500';
            depthSpan.textContent = 'Depth: ' + well.depth; // Auto-escaped

            const viewBtn = document.createElement('button');
            viewBtn.className = 'view-details-btn text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold';
            viewBtn.setAttribute('data-well-id', well.id);
            viewBtn.textContent = 'View Details';

            footerFlex.appendChild(depthSpan);
            footerFlex.appendChild(viewBtn);

            cardFooter.appendChild(footerFlex);

            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);

            wellSelectionGrid.appendChild(card);
        })
    };

    const renderObjectives = () => {
        objectivesFieldset.textContent = '';
        objectivesData.forEach(obj => {
            const card = document.createElement('div');
            card.className = 'objective-card light-card';
            card.setAttribute('data-objective-id', obj.id);

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'objective';
            input.id = obj.id;
            input.value = obj.id;
            input.className = 'sr-only';

            const label = document.createElement('label');
            label.setAttribute('for', obj.id);
            label.className = 'cursor-pointer h-full';

            const flexDiv = document.createElement('div');
            flexDiv.className = 'flex items-start';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'text-2xl mr-3';
            iconSpan.textContent = obj.icon; // Auto-escaped

            const contentDiv = document.createElement('div');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'font-semibold text-lg';
            nameSpan.textContent = obj.name; // Auto-escaped

            const descP = document.createElement('p');
            descP.className = 'text-sm mt-1';
            descP.textContent = obj.description; // Auto-escaped

            contentDiv.appendChild(nameSpan);
            contentDiv.appendChild(descP);

            flexDiv.appendChild(iconSpan);
            flexDiv.appendChild(contentDiv);

            label.appendChild(flexDiv);

            card.appendChild(input);
            card.appendChild(label);

            objectivesFieldset.appendChild(card);
        });
    };

    const renderProblems = () => {
        // Only show problems relevant to the "Well From Hell"
        if (appState.selectedWell && appState.selectedWell.id === '666') {
             problemsFieldset.textContent = '';
             problemsData.forEach(prob => {
                const card = document.createElement('div');
                card.className = 'objective-card light-card';
                card.setAttribute('data-problem-id', prob.id);

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'problem';
                input.id = prob.id;
                input.value = prob.id;
                input.className = 'sr-only';

                const label = document.createElement('label');
                label.setAttribute('for', prob.id);
                label.className = 'cursor-pointer h-full';

                const flexDiv = document.createElement('div');
                flexDiv.className = 'flex items-start';

                const iconSpan = document.createElement('span');
                iconSpan.className = 'text-2xl mr-3';
                iconSpan.textContent = prob.icon; // Auto-escaped

                const contentDiv = document.createElement('div');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'font-semibold text-lg';
                nameSpan.textContent = prob.name; // Auto-escaped

                const descP = document.createElement('p');
                descP.className = 'text-sm mt-1';
                descP.textContent = prob.description; // Auto-escaped

                contentDiv.appendChild(nameSpan);
                contentDiv.appendChild(descP);

                flexDiv.appendChild(iconSpan);
                flexDiv.appendChild(contentDiv);

                label.appendChild(flexDiv);

                card.appendChild(input);
                card.appendChild(label);

                problemsFieldset.appendChild(card);
            });
        } else {
            problemsFieldset.textContent = '';
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg text-center';

            const messageP = document.createElement('p');
            messageP.className = 'text-yellow-800 dark:text-yellow-200';
            messageP.textContent = "Please select the 'Well From Hell' (666) to use the AI Advisor.";

            messageDiv.appendChild(messageP);
            problemsFieldset.appendChild(messageDiv);
        }
    };

    const renderPlan = () => {
        const well = appState.selectedWell, 
        procedure = appState.generatedPlan, 
        riskLabels = ['Operational', 'Geological', 'Equipment', 'HSE', 'Financial'], 
        riskData = Object.values(procedure.risks);
        
        const getRiskTag = (level) => { 
            if (level <= 2) return `<span class="risk-badge risk-low">Low</span>`; 
            if (level <= 3) return `<span class="risk-badge risk-medium">Medium</span>`; 
            return `<span class="risk-badge risk-high">High</span>`; 
        };
        
        const logisticsConflicts = checkLogistics();
        let logisticsHtml = logisticsConflicts.length > 0 ? `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-red-500">
                    <h4 class="text-xl font-semibold text-white">Logistics & Resource Conflicts</h4>
                </div>
                <div class="p-6">
                    <ul class="space-y-2">
                        ${logisticsConflicts.map(c => `
                            <li class="flex items-start p-3 rounded-md bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400">
                                <span class="text-red-600 mr-2 font-bold">âš ï¸</span>
                                <span class="text-red-800 dark:text-red-300">${escapeHtml(c)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        ` : '';
        
        const equipmentList = equipmentRequirements[appState.selectedObjective.id];
        let equipmentHtml = `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-blue-500">
                    <h4 class="text-xl font-semibold text-white">Equipment Requirements</h4>
                </div>
                <div class="p-6">
                    <div class="space-y-3">
                        ${equipmentList.map(item => `
                            <div class="equipment-card">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-4" ${item.source !== 'Vendor' ? 'checked disabled' : ''}>
                                        <div>
                                            <p class="font-semibold">${escapeHtml(item.name)}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                                Source: ${escapeHtml(item.source)}
                                            </p>
                                        </div>
                                    </div>
                                    <p class="font-semibold text-sm">${item.price > 0 ? `$${item.price.toLocaleString()}` : 'N/A'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Create timeline for procedure steps
        const timelineHtml = `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-green-500">
                    <h4 class="text-xl font-semibold text-white">Procedure Timeline</h4>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        ${procedure.steps.map((step, index) => `
                            <div class="timeline-step">
                                <h5 class="font-semibold">Step ${index + 1}</h5>
                                <p class="text-sm">${escapeHtml(step)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Create risk assessment visualization
        const riskHtml = `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-purple-500">
                    <h4 class="text-xl font-semibold text-white">Risk Assessment</h4>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div class="space-y-3">
                            ${riskLabels.map((label, i) => `
                                <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <span class="font-medium">${label}</span>
                                    ${getRiskTag(riskData[i])}
                                </div>
                            `).join('')}
                        </div>
                        <div class="h-64 md:h-80">
                            <canvas id="riskChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Cost estimation
        const costHtml = `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-yellow-500">
                    <h4 class="text-xl font-semibold text-white">Cost Estimation</h4>
                </div>
                <div class="p-6">
                    <div class="space-y-2">
                        <div class="cost-estimation">
                            <span class="label">Estimated Duration:</span>
                            <span class="value">${procedure.duration} days</span>
                        </div>
                        <div class="cost-estimation">
                            <span class="label">Estimated Cost (AFE):</span>
                            <span class="value">$${procedure.cost.toLocaleString()}</span>
                        </div>
                        <div class="cost-estimation">
                            <span class="label">Daily Cost:</span>
                            <span class="value">$${Math.round(procedure.cost / procedure.duration).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        planOutput.innerHTML = `
            <div class="plan-summary-card light-card overflow-hidden mb-8">
                <div class="card-header bg-gradient-to-r from-blue-600 to-teal-500">
                    <h3 class="text-2xl font-bold text-white">Intervention Plan: ${escapeHtml(well.name)}</h3>
                    <p class="text-lg text-blue-100">${escapeHtml(appState.selectedObjective.name)}</p>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p class="text-sm font-medium">Selected Well</p>
                            <p class="text-lg font-semibold">${escapeHtml(well.name)}</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p class="text-sm font-medium">Est. Duration</p>
                            <p class="text-lg font-semibold">${procedure.duration} days</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p class="text-sm font-medium">Est. Cost (AFE)</p>
                            <p class="text-lg font-semibold">$${procedure.cost.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${timelineHtml}
                ${equipmentHtml}
            </div>
            
            <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${riskHtml}
                ${costHtml}
            </div>
            
            ${logisticsHtml}
        `;
        
        // Initialize risk chart
        const riskChartCtx = document.getElementById('riskChart');
        if (riskChartCtx) {
            const chartTheme = getChartThemeOptions();
            new Chart(riskChartCtx.getContext('2d'), { 
                type: 'radar', 
                data: { 
                    labels: riskLabels, 
                    datasets: [{ 
                        label: 'Risk Level', 
                        data: riskData, 
                        backgroundColor: 'rgba(139, 92, 246, 0.2)', 
                        borderColor: 'rgba(139, 92, 246, 1)', 
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(139, 92, 246, 1)'
                    }] 
                }, 
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    scales: { 
                        r: { 
                            suggestedMin: 0, 
                            suggestedMax: 5, 
                            ticks: { 
                                display: false,
                                stepSize: 1
                            }, 
                            grid: { 
                                color: chartTheme.scales.x.grid.color 
                            }, 
                            angleLines: { 
                                color: chartTheme.scales.x.grid.color 
                            }, 
                            pointLabels: { 
                                color: chartTheme.scales.x.ticks.color,
                                font: {
                                    size: 12
                                }
                            } 
                        } 
                    }, 
                    plugins: { 
                        legend: { 
                            display: false 
                        }
                    }
                } 
            });
        }
        
        updateNavLinks();
    };

    const updatePlannerStepUI = (currentStep) => { 
        // Reset all step indicators and connectors
        Object.values(stepIndicators).forEach(ind => {
            ind.classList.remove('active', 'completed');
            ind.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
        });
        
        Object.values(stepConnectors).forEach(conn => {
            conn.classList.remove('active', 'completed');
        });
        
        // Mark completed steps
        for (let i = 1; i < currentStep; i++) {
            stepIndicators[i].classList.add('completed');
            stepIndicators[i].classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
            stepIndicators[i].classList.add('bg-blue-600', 'text-white');
            
            if (stepConnectors[i]) {
                stepConnectors[i].classList.add('completed');
                stepConnectors[i].classList.remove('bg-gray-200');
                stepConnectors[i].classList.add('bg-blue-600');
            }
        }
        
        // Mark active step
        stepIndicators[currentStep].classList.add('active');
        stepIndicators[currentStep].classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
        stepIndicators[currentStep].classList.add('bg-blue-600', 'text-white');

        // Show/hide step sections
        Object.keys(stepSections).forEach(key => {
            stepSections[key].classList.toggle('hidden', key != currentStep);
        });

        // If moving to step 3, render historical toolstrings
        if (currentStep === 3) {
            renderHistoricalToolStrings();
            renderSavedToolStrings();
            switchEquipmentTab('historical');
        }
    };

    // --- PERFORMER LOGIC ---

    const initializePerformer = () => {
        const isSlickline = appState.generatedPlan.name.toLowerCase().includes('slickline');
        
        kpiGrid.innerHTML = `
            <div id="kpi-weight-card" class="kpi-card p-4 flex flex-col items-center justify-center"></div>
            <div id="kpi-pressure-card" class="kpi-card p-4 flex flex-col items-center justify-center"></div>
            <div id="kpi-annulus-card" class="kpi-card p-4 flex flex-col items-center justify-center"></div>
            <div id="kpi-speed-card" class="kpi-card p-4 flex flex-col items-center justify-center"></div>
            <div id="kpi-depth-card" class="kpi-card p-4 flex flex-col items-center justify-center"></div>
        `;
        kpiGrid.className = 'grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6';

        if (isSlickline) {
            createRadialGauge('kpi-weight-card', 'Weight', 'lbs', 2000);
            document.getElementById('kpi-pressure-card').style.display = 'none';
            document.getElementById('kpi-annulus-card').style.display = 'none';
            kpiGrid.className = 'grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6';
        } else {
            createRadialGauge('kpi-weight-card', 'Hookload', 'klbf', 100);
            createRadialGauge('kpi-pressure-card', 'Tubing Pressure', 'psi', 5000);
            createRadialGauge('kpi-annulus-card', 'Annulus Pressure', 'psi', 3000);
        }
        createBarGauge('kpi-speed-card', 'Line Speed', 'ft/min', 150);
        createRadialGauge('kpi-depth-card', 'Depth', 'ft', 18500);

        appState.liveData = { 
            depth: 0, 
            hookload: 0, 
            pressure: 0, 
            annulusPressure: 1500, 
            speed: 0, 
            currentStep: 1, 
            isRIH: true, 
            jobRunning: true, 
            alarmState: false, 
            npt: { weather: 0, equipment: 0, operational: 0 }, 
            opTime: 0, 
            stepStartTime: Date.now() 
        };
        
        appState.logEntries = [{ 
            time: new Date(), 
            user: 'System', 
            text: 'Job initiated.' 
        }];
        
        appState.generatedPlan.procedure = appState.generatedPlan.steps.map((s, i) => ({ 
            id: i + 1, 
            text: s, 
            completed: false, 
            active: false 
        }));
        
        if (appState.tfaChartInstance) {
            appState.tfaChartInstance.destroy();
            appState.tfaChartInstance = null;
        }
        
        chartCard.style.display = isSlickline ? 'none' : 'flex';
        
        if (!isSlickline) {
            const chartCtx = document.getElementById('tfaChart').getContext('2d');
            const chartThemeOptions = getChartThemeOptions();
            chartThemeOptions.scales.y.title.text = 'Hookload (klbf)';
            appState.tfaChartInstance = new Chart(chartCtx, { 
                type: 'line', 
                data: { 
                    datasets: [ 
                        { 
                            label: 'Planned Pick-up', 
                            data: appState.generatedPlan.tfaModel.pickUp.map(p => ({x: p[0], y: p[1]})), 
                            borderColor: 'rgba(52, 211, 153, 0.8)', 
                            borderWidth: 2, 
                            pointRadius: 0, 
                            tension: 0.1 
                        }, 
                        { 
                            label: 'Planned Slack-off', 
                            data: appState.generatedPlan.tfaModel.slackOff.map(p => ({x: p[0], y: p[1]})), 
                            borderColor: 'rgba(96, 165, 250, 0.8)', 
                            borderWidth: 2, 
                            pointRadius: 0, 
                            tension: 0.1 
                        }, 
                        { 
                            label: 'Upper Alarm', 
                            data: appState.generatedPlan.tfaModel.alarmUpper.map(p => ({x: p[0], y: p[1]})), 
                            borderColor: 'rgba(239, 68, 68, 0.4)', 
                            borderWidth: 1, 
                            pointRadius: 0, 
                            borderDash: [5, 5], 
                            fill: '+1' 
                        }, 
                        { 
                            label: 'Lower Alarm', 
                            data: appState.generatedPlan.tfaModel.alarmLower.map(p => ({x: p[0], y: p[1]})), 
                            borderColor: 'rgba(239, 68, 68, 0.4)', 
                            borderWidth: 1, 
                            pointRadius: 0, 
                            borderDash: [5, 5], 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            fill: '-1' 
                        }, 
                        { 
                            label: 'Actual Hookload', 
                            data: [], 
                            borderColor: '#f59e0b', 
                            borderWidth: 3, 
                            pointRadius: 0, 
                            tension: 0.1 
                        } 
                    ] 
                }, 
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    ...chartThemeOptions 
                } 
            });
        }
        
        renderPerformerProcedure(); 
        renderPerformerLog();
        updatePerformerState();
        
        performerControls.classList.add('hidden');

        if (appState.liveDataInterval) clearInterval(appState.liveDataInterval);
        appState.liveDataInterval = setInterval(simulateLiveData, 1000);
    };
    
    const simulateLiveData = () => {
        if (!appState.liveData.jobRunning) {
            clearInterval(appState.liveDataInterval);
            appState.liveDataInterval = null;
            return;
        }

        const step = appState.generatedPlan.procedure.find(s => s.id === appState.liveData.currentStep);
        if (!step) return;

        const stepText = step.text.toLowerCase();
        const targetDepth = 18500;
        let isMoving = false;

        if (stepText.includes('rih')) {
            isMoving = true;
            appState.liveData.speed = 100 + Math.random() * 10 - 5;
            appState.liveData.depth = Math.min(targetDepth, appState.liveData.depth + appState.liveData.speed / 60 * 2); // Simulate 2 sec interval
            if (appState.liveData.depth >= targetDepth) {
                advancePerformerStep();
            }
        } else if (stepText.includes('pooh')) {
            isMoving = true;
            appState.liveData.speed = -100 + Math.random() * 10 - 5;
            appState.liveData.depth = Math.max(0, appState.liveData.depth + appState.liveData.speed / 60 * 2);
             if (appState.liveData.depth <= 0) {
                advancePerformerStep();
            }
        } else if (stepText.includes('spot') || stepText.includes('pump') || stepText.includes('circulate')) {
            isMoving = false;
            appState.liveData.speed = 0;
            appState.liveData.pressure = Math.min(2500, appState.liveData.pressure + 250);
            appState.liveData.annulusPressure += 50;
        } else {
             isMoving = false;
             appState.liveData.speed = 0;
             appState.liveData.pressure = Math.max(0, appState.liveData.pressure - 250);
             appState.liveData.annulusPressure = Math.max(1500, appState.liveData.annulusPressure - 50);
        }
        
        if (!isMoving && (Date.now() - appState.liveData.stepStartTime > 2000)) {
            advancePerformerStep();
        }
        
        const modelPoints = appState.liveData.isRIH ? appState.generatedPlan.tfaModel.slackOff : appState.generatedPlan.tfaModel.pickUp;
        appState.liveData.hookload = interpolate(modelPoints, appState.liveData.depth) + (Math.random() * 2 - 1);
        if(appState.liveData.depth > 6000 && appState.liveData.depth < 7000 && appState.liveData.isRIH) { 
            appState.liveData.hookload -= 5; 
            appState.liveData.npt.operational += 0.005; 
        }
        
        updatePerformerState();
    };

    const updatePerformerState = () => {
        if (!appState.liveData || !appState.generatedPlan) return;
        const isSlickline = appState.generatedPlan.name.toLowerCase().includes('slickline');

        const upperLimit = interpolate(appState.generatedPlan.tfaModel.alarmUpper, appState.liveData.depth);
        const lowerLimit = interpolate(appState.generatedPlan.tfaModel.alarmLower, appState.liveData.depth);
        
        if (appState.liveData.hookload > upperLimit || appState.liveData.hookload < lowerLimit) { 
            if (!appState.liveData.alarmState) { 
                addLogEntry('System', 'ALARM: Primary tension outside envelope!'); 
                appState.liveData.alarmState = true; 
                if (!isSlickline) chartCard.classList.add('alarm'); 
                appState.liveData.npt.equipment += 0.01; 
            } 
        } else { 
            if (appState.liveData.alarmState) { 
                addLogEntry('System', 'INFO: Primary tension back in envelope.'); 
                appState.liveData.alarmState = false; 
                if (!isSlickline) chartCard.classList.remove('alarm'); 
            } 
        }

        if (isSlickline) {
            updateRadialGauge('kpi-weight-card', appState.liveData.hookload * 1000, 2000);
        } else {
            updateRadialGauge('kpi-weight-card', appState.liveData.hookload, 100);
            updateRadialGauge('kpi-pressure-card', appState.liveData.pressure, 5000);
            updateRadialGauge('kpi-annulus-card', appState.liveData.annulusPressure, 3000);
        }
        updateBarGauge('kpi-speed-card', appState.liveData.speed, 150);
        updateRadialGauge('kpi-depth-card', appState.liveData.depth, 18500);
        
        if (appState.tfaChartInstance) {
            const actualData = appState.tfaChartInstance.data.datasets[4].data;
            actualData.push({ x: appState.liveData.depth, y: appState.liveData.hookload }); 
            actualData.sort((a, b) => a.x - b.x);
            if (actualData.length > 500) {
                actualData.splice(0, actualData.length - 500);
            }
            appState.tfaChartInstance.update('none');
        }
    };

    const renderPerformerProcedure = () => {
        const currentStepId = appState.liveData.currentStep;
        procedureStepsContainer.textContent = '';
        appState.generatedPlan.procedure.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.id = 'step-' + step.id;
            stepDiv.setAttribute('data-step-id', step.id);
            stepDiv.className = 'procedure-step p-3 rounded-md';
            if (step.completed) stepDiv.classList.add('completed');
            if (currentStepId === step.id) stepDiv.classList.add('active');

            const p = document.createElement('p');
            p.className = 'font-semibold text-sm';
            p.textContent = step.id + '. ' + step.text; // Auto-escaped

            stepDiv.appendChild(p);
            procedureStepsContainer.appendChild(stepDiv);
        });

        const activeStepElement = document.getElementById(`step-${currentStepId}`);
        if (activeStepElement) {
            activeStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const renderPerformerLog = () => {
        logEntriesContainer.textContent = '';
        appState.logEntries.slice().reverse().forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'log-entry p-2';

            const timeP = document.createElement('p');
            timeP.className = 'text-xs text-gray-400';
            timeP.textContent = entry.time.toLocaleTimeString() + ' - ' + entry.user; // Auto-escaped

            const textP = document.createElement('p');
            textP.className = 'text-sm';
            textP.textContent = entry.text; // Auto-escaped

            entryDiv.appendChild(timeP);
            entryDiv.appendChild(textP);

            logEntriesContainer.appendChild(entryDiv);
        });
        logEntriesContainer.scrollTop = 0;
    };

    const addLogEntry = (user, text) => { 
        if (!text.trim()) return; 
        appState.logEntries.push({ 
            time: new Date(), 
            user, 
            text 
        }); 
        renderPerformerLog(); 
    };

    const advancePerformerStep = () => {
        const current = appState.generatedPlan.procedure.find(s => s.id === appState.liveData.currentStep); 
        if (current) current.completed = true;
        
        if (appState.liveData.currentStep < appState.generatedPlan.procedure.length) {
            appState.liveData.currentStep++; 
            const next = appState.generatedPlan.procedure.find(s => s.id === appState.liveData.currentStep); 
            addLogEntry('System', `Starting Step ${next.id}: ${next.text}`); 
            appState.liveData.isRIH = next.text.toLowerCase().includes('rih');
            appState.liveData.stepStartTime = Date.now();
        } else { 
            appState.liveData.jobRunning = false; 
            addLogEntry('System', 'Job procedure complete.'); 
            document.getElementById('job-status').textContent = "â— JOB COMPLETE"; 
            document.getElementById('job-status').classList.replace('text-emerald-400', 'text-gray-500'); 
            performerControls.classList.remove('hidden'); 
        }
        
        renderPerformerProcedure();
    };

    const jumpToStep = (targetStepId) => {
        addLogEntry('Operator', `Jumping forward to Step ${targetStepId}.`);
        
        for (let i = appState.liveData.currentStep; i < targetStepId; i++) {
            const stepToComplete = appState.generatedPlan.procedure.find(s => s.id === i);
            if (stepToComplete) {
                stepToComplete.completed = true;
            }
        }
        
        appState.liveData.currentStep = targetStepId;
        const newStep = appState.generatedPlan.procedure.find(s => s.id === targetStepId);
        addLogEntry('System', `Starting Step ${targetStepId}: ${newStep.text}`);
        
        let lastDepth = appState.liveData.depth;
        const previousStep = appState.generatedPlan.procedure.find(s => s.id === targetStepId - 1);
        if (previousStep) {
            const prevStepText = previousStep.text.toLowerCase();
            if (prevStepText.includes('rih')) { lastDepth = 18500; }
            else if (prevStepText.includes('pooh')) { lastDepth = 0; }
        }
        
        appState.liveData.depth = lastDepth;
        appState.liveData.stepStartTime = Date.now();
        updatePerformerState();
        renderPerformerProcedure();
    };

    function interpolate(points, x) { 
        for (let i = 0; i < points.length - 1; i++) { 
            if (x >= points[i][0] && x <= points[i+1][0]) { 
                return points[i][1] + (points[i+1][1] - points[i][1]) * (x - points[i][0]) / (points[i+1][0] - points[i][0]); 
            } 
        } 
        return points[points.length - 1][1]; 
    }

    // --- ANALYZER LOGIC ---

    const initializeAnalyzer = () => {
        analyzerSubtitle.textContent = `Analysis for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;
        const plannedDuration = appState.generatedPlan.duration;
        const actualDuration = plannedDuration + appState.liveData.npt.weather + appState.liveData.npt.equipment + appState.liveData.npt.operational;
        const plannedCost = appState.generatedPlan.cost;
        const actualCost = appState.commercial.actualCost;
        
        const renderKPI = (label, plan, actual) => `
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p class="text-sm font-medium">${escapeHtml(label)}</p>
                <p class="text-lg font-semibold">${escapeHtml(actual)} <span class="text-sm font-normal">(Plan: ${escapeHtml(plan)})</span></p>
            </div>
        `;

        summaryKpis.innerHTML = renderKPI('Job Duration (Days)', plannedDuration.toFixed(1), actualDuration.toFixed(1)) +
                              renderKPI('Total Cost (USD)', `$${plannedCost.toLocaleString()}`, `$${actualCost.toLocaleString()}`);
        
        if (appState.nptChartInstance) appState.nptChartInstance.destroy();
        
        const nptCtx = document.getElementById('nptChart');
        if (nptCtx) {
            const chartThemeOptions = getChartThemeOptions();
            appState.nptChartInstance = new Chart(nptCtx.getContext('2d'), { 
                type: 'doughnut', 
                data: { 
                    labels: ['Weather', 'Equipment Failure', 'Operational Inefficiency'], 
                    datasets: [{ 
                        data: [appState.liveData.npt.weather, appState.liveData.npt.equipment, appState.liveData.npt.operational], 
                        backgroundColor: ['#3b82f6', '#f97316', '#ef4444'], 
                        borderColor: body.classList.contains('theme-dark') ? '#0f172a' : 'white', 
                        borderWidth: 4 
                    }] 
                }, 
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { 
                        legend: { 
                            position: 'bottom', 
                            labels: { 
                                color: chartThemeOptions.plugins.legend.labels.color 
                            } 
                        } 
                    } 
                } 
            });
        }
        
        renderLessons();
    };

    const renderLessons = () => {
        lessonsLearnedList.innerHTML = appState.lessonsLearned.length ?
            appState.lessonsLearned.map(lesson => `
                <div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                    <p>${escapeHtml(lesson)}</p>
                </div>
            `).join('') :
            '<p class="text-center">No lessons learned have been added for this job.</p>';
    };
    
    // --- ASSET & POB LOGIC ---

    const renderAssetManagementViews = (eqFilter = '', persFilter = '') => {
        if (!appState.generatedPlan) {
            logisticsSubtitle.textContent = "Please generate a plan in the Planner to view job-specific logistics.";
            logisticsContent.innerHTML = `
                <div class="text-center col-span-2 light-card p-8 rounded-lg">
                    <p>No plan is currently active. Please use the Planner module to generate an intervention plan, and the required tooling and personnel will be displayed here.</p>
                </div>
            `;
            return;
        }
        
        logisticsSubtitle.textContent = `Logistics for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;
        
        const requiredEquipment = equipmentRequirements[appState.selectedObjective.id];
        const requiredRoles = appState.generatedPlan.personnel;

        const eqF = eqFilter.toLowerCase();
        const filteredEquipment = equipmentData.filter(e => 
            requiredEquipment.some(req => req.name === e.type) && 
            (e.id.toLowerCase().includes(eqF) || e.type.toLowerCase().includes(eqF))
        );
        
        equipmentTableBody.textContent = '';
        filteredEquipment.forEach(e => {
            const tr = document.createElement('tr');

            const idTd = document.createElement('td');
            idTd.className = 'p-2';
            idTd.textContent = e.id; // Auto-escaped

            const typeTd = document.createElement('td');
            typeTd.className = 'p-2';
            typeTd.textContent = e.type; // Auto-escaped

            const locationTd = document.createElement('td');
            locationTd.className = 'p-2';
            locationTd.textContent = e.location; // Auto-escaped

            const statusTd = document.createElement('td');
            statusTd.className = 'p-2';
            const statusSpan = document.createElement('span');
            statusSpan.className = 'px-2 py-1 text-xs font-medium rounded-full status-' + e.status.toLowerCase();
            statusSpan.textContent = e.status; // Auto-escaped
            statusTd.appendChild(statusSpan);

            const actionTd = document.createElement('td');
            actionTd.className = 'p-2';
            const testBtn = document.createElement('button');
            testBtn.className = 'text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50';
            testBtn.textContent = 'Test';
            if (!(e.location === 'Onboard - Pump Room' && e.testStatus === 'Pending')) {
                testBtn.disabled = true;
            }
            actionTd.appendChild(testBtn);

            tr.appendChild(idTd);
            tr.appendChild(typeTd);
            tr.appendChild(locationTd);
            tr.appendChild(statusTd);
            tr.appendChild(actionTd);

            equipmentTableBody.appendChild(tr);
        });

        const persF = persFilter.toLowerCase();
        const filteredPersonnel = personnelData.filter(p => 
            requiredRoles.includes(p.role) && 
            (p.name.toLowerCase().includes(persF) || p.role.toLowerCase().includes(persF))
        );
        
        personnelTableBody.textContent = '';
        filteredPersonnel.forEach(p => {
            const tr = document.createElement('tr');

            const nameTd = document.createElement('td');
            nameTd.className = 'p-2';
            nameTd.textContent = p.name; // Auto-escaped

            const roleTd = document.createElement('td');
            roleTd.className = 'p-2';
            roleTd.textContent = p.role; // Auto-escaped

            const statusTd = document.createElement('td');
            statusTd.className = 'p-2';
            const statusSpan = document.createElement('span');
            statusSpan.className = 'px-2 py-1 text-xs font-medium rounded-full status-' + p.status.toLowerCase().replace(/\s/g, '');
            statusSpan.textContent = p.status; // Auto-escaped
            statusTd.appendChild(statusSpan);

            const certsTd = document.createElement('td');
            certsTd.className = 'p-2';
            certsTd.textContent = p.certsValid ? '✅ Valid' : '❌ Expired';

            tr.appendChild(nameTd);
            tr.appendChild(roleTd);
            tr.appendChild(statusTd);
            tr.appendChild(certsTd);

            personnelTableBody.appendChild(tr);
        });
    };

    const checkLogistics = () => {
        const conflicts = [];
        const requiredEquipment = equipmentRequirements[appState.selectedObjective.id];

        requiredEquipment.forEach(req => {
            if (req.source === 'Vendor') {
                const availableTool = equipmentData.find(e => e.type === req.name && e.status === 'Available');
                if (!availableTool) {
                    conflicts.push(`No available equipment of type: <strong>${req.name}</strong>. Must be ordered from vendor.`);
                }
            }
        });

        appState.generatedPlan.personnel.forEach(roleName => {
            const availablePerson = personnelData.find(p => p.role === roleName && p.status === 'Available');
            if (!availablePerson) {
                conflicts.push(`No available personnel for role: <strong>${roleName}</strong>.`);
            } else if (!availablePerson.certsValid) {
                conflicts.push(`Personnel <strong>${availablePerson.name} (${roleName})</strong> has expired certifications.`);
            }
        });
        
        return conflicts;
    };

    const renderPOBView = () => {
        if (!appState.generatedPlan) {
            pobSubtitle.textContent = "Please generate a plan in the Planner to view job-specific POB.";
            pobContent.innerHTML = `
                <div class="text-center light-card p-8 rounded-lg">
                    <p>No plan is currently active. Please use the Planner module to generate an intervention plan, and the required personnel for that job will be displayed here.</p>
                </div>
            `;
            return;
        }

        const requiredPersonnel = personnelData.filter(p => appState.generatedPlan.personnel.includes(p.role));
        appState.pob.personnel = JSON.parse(JSON.stringify(requiredPersonnel)).map(p => ({
            ...p, 
            musterStatus: 'Unaccounted'
        }));
        
        pobSubtitle.textContent = `Live POB manifest for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;



        const totalPOB = appState.pob.personnel.length;
        const musteredCount = appState.pob.personnel.filter(p => p.musterStatus === 'Mustered').length;
        
        musterStations.forEach(ms => { 
            ms.current = appState.pob.personnel.filter(p => p.muster === ms.id && p.musterStatus === 'Mustered').length; 
        });
        
        const summaryHtml = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Total POB</p>
                    <p class="text-4xl font-bold">${totalPOB}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Accounted For</p>
                    <p class="text-4xl font-bold text-green-600">${musteredCount}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Unaccounted For</p>
                    <p class="text-4xl font-bold text-red-600">${totalPOB - musteredCount}</p>
                </div>
            </div>
        `;
        
        const musterStationHtml = musterStations.map(ms => `
            <div class="light-card p-4 rounded-lg">
                <h4 class="font-semibold">${escapeHtml(ms.name)}</h4>
                <p class="text-sm">Capacity: ${ms.capacity}</p>
                <p class="text-2xl font-bold">${ms.current}</p>
            </div>
        `).join('');
        
        const pobTableHtml = `
            <div class="light-card p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">Live POB Manifest</h3>
                <div class="h-96 overflow-y-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="table-header sticky top-0">
                            <tr>
                                <th class="p-2">Name</th>
                                <th class="p-2">Company</th>
                                <th class="p-2">Role</th>
                                <th class="p-2">Muster Station</th>
                                <th class="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appState.pob.personnel.map(p => `
                                <tr class="border-b table-row-alt dark:border-gray-700">
                                    <td class="p-2">${escapeHtml(p.name)}</td>
                                    <td class="p-2">${escapeHtml(p.company)}</td>
                                    <td class="p-2">${escapeHtml(p.role)}</td>
                                    <td class="p-2">${escapeHtml(p.muster)}</td>
                                    <td class="p-2">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full status-${p.musterStatus.toLowerCase().replace(' ', '')}">${escapeHtml(p.musterStatus)}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        pobContent.innerHTML = `
            ${summaryHtml}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-2">${pobTableHtml}</div>
                <div>
                    <div class="light-card p-6 rounded-lg">
                        <h3 class="text-xl font-semibold mb-4">Muster Stations</h3>
                        <div class="grid grid-cols-2 gap-4">${musterStationHtml}</div>
                    </div>
                    <div class="mt-8">
                        <button id="muster-drill-btn" class="w-full rounded-md ${appState.pob.musterActive ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-500 hover:bg-yellow-400'} px-6 py-3 text-base font-semibold text-white shadow-sm">
                            ${appState.pob.musterActive ? 'End Muster Drill' : 'Simulate Emergency Muster'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('muster-drill-btn').addEventListener('click', toggleMusterDrill);
    };

    const toggleMusterDrill = () => {
        appState.pob.musterActive = !appState.pob.musterActive;
        
        if (appState.pob.musterActive) {
            headerNav.classList.add('emergency-header');
            appState.pob.musterInterval = setInterval(() => {
                const unaccounted = appState.pob.personnel.filter(p => p.musterStatus === 'Unaccounted');
                if (unaccounted.length > 0) {
                    unaccounted[Math.floor(Math.random() * unaccounted.length)].musterStatus = 'Mustered';
                    renderPOBView();
                } else {
                    clearInterval(appState.pob.musterInterval);
                }
            }, 1000);
        } else {
            clearInterval(appState.pob.musterInterval);
            headerNav.classList.remove('emergency-header');
        }
        
        renderPOBView();
    };

    // --- COMMERCIAL & HSE LOGIC ---

    const initializeCommercial = () => {
        if (!appState.generatedPlan) { 
            commercialContent.innerHTML = `
                <div class="text-center light-card p-8 rounded-lg">
                    <p>No plan is currently active. Please use the Planner module to generate an intervention plan, and the associated financial data will be displayed here.</p>
                </div>
            `;
            commercialSubtitle.textContent = "No active operation."
            return; 
        }
        
        commercialSubtitle.textContent = `Live financial tracking for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;


        appState.commercial.afe = appState.generatedPlan.cost;
        appState.commercial.actualCost = 0;
        appState.commercial.serviceTickets = [];
        
        const equipmentList = equipmentRequirements[appState.selectedObjective.id] || [];
        equipmentList.forEach(item => {
            if (item.price > 0) {
                const cost = item.price * appState.generatedPlan.duration;
                appState.commercial.serviceTickets.push({ 
                    description: `Rental: ${item.name}`, 
                    cost: cost, 
                    validated: true 
                });
                appState.commercial.actualCost += cost;
            }
        });
        
        renderCommercialView();
    };

    const renderCommercialView = () => {
        if (!appState.generatedPlan) {
            initializeCommercial();
            return;
        }
        
        const afe = appState.commercial.afe, 
        actual = appState.commercial.actualCost;
        const burnPercent = afe > 0 ? Math.min(100, (actual / afe) * 100) : 0;
        const burnColor = burnPercent > 90 ? 'bg-red-500' : burnPercent > 75 ? 'bg-yellow-500' : 'bg-teal-500';
        
        commercialContent.innerHTML = `
            <div class="grid gap-8 lg:grid-cols-3">
                <div class="lg:col-span-2 light-card p-6 rounded-lg">
                    <h3 class="text-xl font-semibold mb-4">Live AFE vs. Actual</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Actual Cost</span>
                            <span>$${actual.toLocaleString()}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div class="${burnColor} h-4 rounded-full" style="width: ${burnPercent}%"></div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Budget (AFE): $${afe.toLocaleString()}</span>
                            <span>${burnPercent.toFixed(1)}% Used</span>
                        </div>
                    </div>
                    <h3 class="text-xl font-semibold mt-8 mb-4">Automated Service Tickets</h3>
                    <div class="h-64 overflow-y-auto border dark:border-gray-700 rounded-md">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header sticky top-0">
                                <tr>
                                    <th class="p-2">Description</th>
                                    <th class="p-2">Cost</th>
                                    <th class="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody id="service-ticket-body">
                                ${appState.commercial.serviceTickets.map(t => `
                                    <tr class="border-b table-row-alt dark:border-gray-700">
                                        <td class="p-2">${escapeHtml(t.description)}</td>
                                        <td class="p-2">$${t.cost.toLocaleString()}</td>
                                        <td class="p-2">
                                            <span class="status-approved px-2 py-1 text-xs font-medium rounded-full">Validated</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="light-card p-6 rounded-lg">
                    <h3 class="text-xl font-semibold mb-4">Invoice Validation</h3>
                    <p class="text-sm mb-4">Enter a service company invoice amount to check it against validated, system-generated costs.</p>
                    <div class="space-y-2">
                        <label for="invoice-amount" class="text-sm font-medium">Invoice Amount (USD)</label>
                        <input type="number" id="invoice-amount" class="w-full p-2 rounded-md" placeholder="e.g., 850000">
                    </div>
                    <button id="validate-invoice-btn" class="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-blue-500">
                        Validate Invoice
                    </button>
                    <div id="invoice-result" class="mt-4"></div>
                </div>
            </div>
        `;
        
        document.getElementById('validate-invoice-btn').addEventListener('click', validateInvoice);
    };

    const validateInvoice = () => {
        const invoiceAmount = parseFloat(document.getElementById('invoice-amount').value);
        const validatedCost = appState.commercial.actualCost;
        const resultContainer = document.getElementById('invoice-result');
        
        if(isNaN(invoiceAmount)) {
            resultContainer.innerHTML = `
                <div class="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300">
                    Please enter a valid amount.
                </div>
            `;
            return;
        }

        const difference = invoiceAmount - validatedCost;

        if (Math.abs(difference) < 0.01) {
            resultContainer.innerHTML = `
                <div class="p-3 rounded-md bg-green-50 dark:bg-green-900/50 border-l-4 border-green-400 text-green-800 dark:text-green-300">
                    <strong>Match!</strong> Invoice amount of $${escapeHtml(invoiceAmount.toLocaleString())} matches validated system cost.
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="p-3 rounded-md bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 text-red-800 dark:text-red-300">
                    <strong>Discrepancy Found!</strong> Invoice is <strong>$${escapeHtml(Math.abs(difference).toLocaleString())} ${difference > 0 ? 'over' : 'under'}</strong> system-validated cost.
                </div>
            `;
        }
    };

    const initializeHSE = () => {
        if (!appState.generatedPlan) { 
            hseContent.innerHTML = `
                <div class="text-center light-card p-8 rounded-lg">
                    <p>No plan is currently active. Please use the Planner module to generate an intervention plan, and the associated HSE & Risk data will be displayed here.</p>
                </div>
            `;
            hseSubtitle.textContent = "No active operation."
            return; 
        }
        
        hseSubtitle.textContent = `Risk register and permits for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;


        appState.hse.permits = [ 
            { id: 'PTW001', name: 'General Permit to Work', status: 'Approved' }, 
            { id: 'PTW002', name: 'Hot Work Permit', status: 'Pending' }, 
            { id: 'PTW003', name: 'Confined Space Entry', status: 'Approved' }, 
        ];
        
        appState.hse.riskRegister = [ 
            { 
                hazard: 'Dropped Objects during Rig Up', 
                consequence: 'Personnel Injury', 
                mitigation: 'Establish exclusion zones; secure all items aloft.', 
                risk: 'Medium' 
            }, 
            { 
                hazard: 'Loss of Containment', 
                consequence: 'Environmental Spill', 
                mitigation: 'Verify PCE integrity; function test all valves.', 
                risk: 'High' 
            } 
        ];
        
        renderHSEView();
    };

    const renderHSEView = () => {
        if (!appState.generatedPlan) {
            initializeHSE();
            return;
        }
        
        const riskRegisterHtml = `
            <div class="light-card p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">Dynamic Risk Register</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="table-header">
                            <tr>
                                <th class="p-2">Hazard</th>
                                <th class="p-2">Consequence</th>
                                <th class="p-2">Mitigation</th>
                                <th class="p-2">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appState.hse.riskRegister.map(r => `
                                <tr class="border-b table-row-alt dark:border-gray-700">
                                    <td class="p-2">${escapeHtml(r.hazard)}</td>
                                    <td class="p-2">${escapeHtml(r.consequence)}</td>
                                    <td class="p-2">${escapeHtml(r.mitigation)}</td>
                                    <td class="p-2">
                                        <span class="risk-${r.risk.toLowerCase()} px-2 py-1 text-xs font-medium rounded-full">${escapeHtml(r.risk)}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        const ptwHtml = `
            <div class="light-card p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">Permit to Work (PTW) Status</h3>
                <div class="space-y-3">
                    ${appState.hse.permits.map(p => `
                        <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <span class="font-medium">${escapeHtml(p.name)}</span>
                            <span class="px-2 py-1 text-xs font-medium rounded-full status-${p.status.toLowerCase()}">${escapeHtml(p.status)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        hseContent.innerHTML = `
            <div class="grid gap-8 lg:grid-cols-2">
                ${riskRegisterHtml}
                ${ptwHtml}
            </div>
        `;
    };
    
    // --- FAQ LOGIC ---

    const initializeFaqAccordion = () => {
        const accordion = document.getElementById('faq-accordion');
        accordion.textContent = '';
        faqData.forEach(item => {
            const container = document.createElement('div');

            const button = document.createElement('button');
            button.className = 'faq-question flex justify-between items-center';

            const questionSpan = document.createElement('span');
            questionSpan.textContent = item.question; // Auto-escaped

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'icon w-5 h-5');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('d', 'M19 9l-7 7-7-7');

            svg.appendChild(path);

            button.appendChild(questionSpan);
            button.appendChild(svg);

            const answerDiv = document.createElement('div');
            answerDiv.className = 'faq-answer';
            answerDiv.textContent = item.answer; // Auto-escaped

            container.appendChild(button);
            container.appendChild(answerDiv);

            accordion.appendChild(container);
        });

        accordion.addEventListener('click', (e) => {
            const questionButton = e.target.closest('.faq-question');
            if (questionButton) {
                const currentlyActive = document.querySelector('.faq-question.active');
                if (currentlyActive && currentlyActive !== questionButton) {
                    currentlyActive.classList.remove('active');
                }
                questionButton.classList.toggle('active');
            }
        });
    };

    // --- MODAL LOGIC ---

    const openModal = (wellId) => {
        const well = wellData.find(w => w.id === wellId); 
        if (!well) return;
        
        modalTitle.textContent = `Well History & Schematic: ${well.name}`;
        modalContent.innerHTML = `
            <div class="mb-4 border-b dark:border-gray-700">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <a href="#" class="modal-tab active whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="history">History & Schematic</a>
                    <a href="#" class="modal-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="reports">Daily Reports</a>
                </nav>
            </div>
            <div id="modal-tab-history">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2">
                        <h4 class="text-xl font-semibold mb-4">Operational History</h4>
                        <div id="history-content" class="max-h-96 overflow-y-auto pr-2"></div>
                    </div>
                    <div class="md:col-span-1">
                        <h4 class="text-xl font-semibold mb-4">Wellbore Schematic</h4>
                        <div class="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-inner border dark:border-slate-700">
                            ${renderWellSchematic(well)}
                        </div>
                    </div>
                </div>
            </div>
            <div id="modal-tab-reports" class="hidden">
                <h4 class="text-xl font-semibold mb-4">Daily Reports (from legacy spreadsheets)</h4>
                <div id="reports-content" class="h-96 overflow-y-auto"></div>
            </div>
        `;
        
        renderModalTabs(well);
        
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('modal-tab-history').classList.toggle('hidden', e.target.dataset.tab !== 'history');
                document.getElementById('modal-tab-reports').classList.toggle('hidden', e.target.dataset.tab !== 'reports');
            });
        });

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    };

    const renderModalTabs = (well) => {
        document.getElementById('history-content').innerHTML = well.history.length ? well.history.map(h => `
            <div class="p-4 mb-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p class="font-bold text-lg">${escapeHtml(h.operation)} <span class="text-sm font-normal">- ${escapeHtml(h.date)}</span></p>
                <div class="mt-3 space-y-3">
                    <div class="flex items-start">
                        <span class="text-xl mr-3">âš ï¸</span>
                        <div>
                            <strong class="font-semibold text-red-600 dark:text-red-400">Problem:</strong>
                            <p class="text-sm">${escapeHtml(h.problem)}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-xl mr-3">ðŸ’¡</span>
                        <div>
                            <strong class="font-semibold text-green-600 dark:text-green-400">Lesson Learned:</strong>
                            <p class="text-sm">${escapeHtml(h.lesson)}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') : '<p>No historical data available.</p>';
        
        document.getElementById('reports-content').innerHTML = well.dailyReports.length ? `
            <table class="w-full text-sm text-left">
                <thead class="table-header">
                    <tr>
                        <th class="p-2">Date</th>
                        <th class="p-2">Summary</th>
                        <th class="p-2">NPT (hrs)</th>
                        <th class="p-2">Toolstring Run</th>
                    </tr>
                </thead>
                <tbody>
                    ${well.dailyReports.map(r => `
                        <tr class="border-b table-row-alt dark:border-gray-700">
                            <td class="p-2 align-top">${escapeHtml(r.date)}</td>
                            <td class="p-2 align-top">${escapeHtml(r.summary)}</td>
                            <td class="p-2 align-top">${r.npt}</td>
                            <td class="p-2 align-top font-mono text-xs">
                                <ul class="space-y-1">
                                    ${r.toolstringRun.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                                </ul>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p>No daily reports available.</p>';
    };

    const closeModal = () => {
        // Remove focus from any element inside the modal before hiding
        // This prevents aria-hidden accessibility warnings
        if (document.activeElement && modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    };

    const renderWellSchematic = (well) => {
        const isDark = body.classList.contains('theme-dark');
        const maxDepth = Math.max(...well.completion.casing.map(c => c.bottom), 18500); // Dynamic max depth
        const scale = 600 / maxDepth;

        let svgContent = `<svg viewBox="0 0 150 600" class="w-full h-auto">`;
        
        // Depth markers
        svgContent += `<g class="schematic-depth-marker" text-anchor="end" fill="${isDark ? '#94a3b8' : '#1d4ed8'}">`;
        for (let d = 0; d <= maxDepth; d += 5000) {
            const y = d * scale;
            svgContent += `<text x="25" y="${y+3}">${d/1000}k</text><line x1="28" y1="${y}" x2="35" y2="${y}" stroke="${isDark ? '#4b5563' : '#d1d5db'}" stroke-width="1"/>`;
        }
        svgContent += `</g>`;

        // Wellbore background
        svgContent += `
            <rect x="40" y="0" width="100" height="600" fill="${isDark ? '#281e14' : '#eaddc7'}" />
            <rect x="50" y="0" width="80" height="600" fill="${isDark ? '#3a2d21' : '#d2b48c'}" />
            <rect x="50" y="20" width="80" height="10" fill="${isDark ? '#4b5563' : '#9ca3af'}"/>
            <rect x="75" y="10" width="30" height="10" fill="${isDark ? '#6b7280' : '#6b7280'}"/>
        `;
        
        // Components
        well.completion.casing?.forEach(c => {
            if (c.top !== undefined && c.bottom !== undefined) {
                const topY = c.top * scale;
                const height = (c.bottom - c.top) * scale;
                svgContent += `<rect x="60" y="${topY}" width="60" height="${height}" fill="none" stroke="${c.isProblem ? '#ef4444' : '#6b7280'}" stroke-width="2"/>`;
            }
        });

        well.completion.tubing?.forEach(t => {
            if (t.top !== undefined && t.bottom !== undefined) {
                const topY = t.top * scale;
                const height = (t.bottom - t.top) * scale;
                svgContent += `<rect x="85" y="${topY}" width="10" height="${height}" fill="${t.isProblem ? 'rgba(239, 68, 68, 0.3)' : (isDark ? '#6b7280' : '#d1d5db')}" stroke="${t.isProblem ? '#ef4444' : (isDark ? '#4b5563' : '#9ca3af')}" stroke-width="0.5"/>`;
            }
        });

        well.completion.equipment?.forEach(e => {
            if (e.top === undefined) return; // Skip equipment without depth data
            const y = e.top * scale; 
            const fillProblem = 'rgba(239, 68, 68, 0.5)';
            const strokeProblem = '#ef4444';
            const fillNormal = isDark ? '#9ca3af' : '#4b5563';
            const fillSuccess = 'rgba(22, 163, 74, 0.5)';
            const strokeSuccess = '#16a34a';

            if(e.item.includes('Packer')) { 
                svgContent += `<polygon points="75,${y-10} 105,${y-10} 110,${y} 70,${y}" fill="${fillNormal}"/>`; 
            } else if (e.item.includes('SSSV')) { 
                svgContent += `
                    <rect x="82" y="${y}" width="16" height="20" fill="${e.isProblem ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.5)'}" stroke="${e.isProblem ? strokeProblem : '#6b7280'}" stroke-width="1"/>
                    <path d="M 85 ${y+3} l 10 14 M 85 ${y+17} l 10 -14" stroke="${e.isProblem ? strokeProblem : '#6b7280'}" stroke-width="1.5"/>
                `; 
            } else if (e.item.includes('Scale')) { 
                svgContent += `
                    <path d="M 85 ${y-10} C 80 ${y}, 80 ${y+10}, 85 ${y+20}" stroke="#c2410c" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M 95 ${y-10} C 100 ${y}, 100 ${y+10}, 95 ${y+20}" stroke="#c2410c" stroke-width="2" fill="none" stroke-linecap="round"/>
                `; 
            } else if (e.item.includes('Casing Deformation')) { 
                svgContent += `
                    <path d="M 60 ${y} C 50 ${y+10}, 70 ${y+20}, 60 ${y+30}" stroke="${strokeProblem}" stroke-width="1.5" fill="none" />
                    <path d="M 120 ${y} C 130 ${y+10}, 110 ${y+20}, 120 ${y+30}" stroke="${strokeProblem}" stroke-width="1.5" fill="none" />
                `; 
            } else if (e.item.includes('Fish')) { 
                svgContent += `
                    <g transform="translate(90 ${y})">
                        <path d="M-5 -10 L 5 -10 L 3 -5 L -3 -5 Z M-2 -5 L 2 -5 L 2 10 L -2 10 Z" fill="${fillProblem}" stroke="${strokeProblem}" stroke-width="1" />
                        <text x="15" y="5" class="schematic-label" fill="${strokeProblem}">${e.item}</text>
                    </g>
                `; 
            } else if (e.item.includes('Tubing Patch')) { 
                svgContent += `
                    <rect x="82" y="${y}" width="16" height="50" fill="${fillSuccess}" stroke="${strokeSuccess}" stroke-width="1.5"/>
                    <text x="105" y="${y+25}" class="schematic-label" fill="${strokeSuccess}">${e.item}</text>
                `;
            }
        });
        
        well.completion.perforations?.forEach(p => { 
            const topY = p.top * scale; 
            const bottomY = p.bottom * scale; 
            for(let y = topY; y <= bottomY; y += 10) { 
                svgContent += `<path d="M 60 ${y} L 40 ${y}" stroke="${p.isProblem ? '#ef4444' : '#1d4ed8'}" stroke-width="1.5" />`; 
                if(p.isProblem) svgContent += `<path d="M 40 ${y} l 4 4 m -4 0 l 4 -4" stroke="#ef4444" stroke-width="1.5"/>`; 
            } 
        });
        
        well.completion.plugs?.forEach(p => { 
            const topY = p.top * scale; 
            const height = (p.bottom - p.top) * scale; 
            svgContent += `<rect x="55" y="${topY}" width="70" height="${height}" fill="#a8a29e"/>`; 
        });
        
        svgContent += `</svg>`; 
        return svgContent;
    };

    // --- THEME & CHART LOGIC ---

    const setTheme = (theme) => {
        body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
        if(appState.currentView === 'performer') body.classList.add('theme-dark');

        // Update charts
        const charts = [appState.savingsChartInstance, appState.tfaChartInstance, appState.nptChartInstance];
        charts.forEach(chart => {
            if (chart) {
                const chartTheme = getChartThemeOptions();
                if(chart.options.scales.x) {
                    chart.options.scales.x.grid.color = chartTheme.scales.x.grid.color;
                    chart.options.scales.x.ticks.color = chartTheme.scales.x.ticks.color;
                }
                 if(chart.options.scales.y) {
                    chart.options.scales.y.grid.color = chartTheme.scales.y.grid.color;
                    chart.options.scales.y.ticks.color = chartTheme.scales.y.ticks.color;
                }
                if(chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = chartTheme.plugins.legend.labels.color;
                }
                if(chart.config.type === 'doughnut') {
                    chart.data.datasets[0].borderColor = theme === 'dark' ? '#0f172a' : 'white';
                }
                chart.update();
            }
        });
    };

    const getChartThemeOptions = () => {
        const isDark = body.classList.contains('theme-dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
        const textColor = isDark ? '#d1d5db' : '#4b5563';
        return {
            scales: { 
                x: { 
                    grid: { color: gridColor }, 
                    ticks: { color: textColor }, 
                    title: { display: true, text: 'Depth (ft)', color: textColor } 
                }, 
                y: { 
                    grid: { color: gridColor }, 
                    ticks: { color: textColor }, 
                    title: { display: true, text: 'Value', color: textColor } 
                } 
            },
            plugins: { 
                legend: { 
                    labels: { color: textColor } 
                } 
            }
        };
    };

    // --- ROI CALCULATOR LOGIC (Home Page) ---

    const engineerCountSlider = document.getElementById('engineerCount');
    const nptReductionSlider = document.getElementById('nptReduction');
    const timeSavingsSlider = document.getElementById('timeSavings');
    const engineerCountValue = document.getElementById('engineerCountValue');
    const nptReductionValue = document.getElementById('nptReductionValue');
    const timeSavingsValue = document.getElementById('timeSavingsValue');
    const totalSavingsValue = document.getElementById('totalSavings');
    const savingsChartCanvas = document.getElementById('savingsChart');

    const calculateROI = () => {
        if (!engineerCountSlider) return;
        
        const engineers = parseInt(engineerCountSlider.value);
        const nptReduction = parseInt(nptReductionSlider.value) / 100;
        const timeSavings = parseInt(timeSavingsSlider.value) / 100;

        const avgEngineerSalary = 120000;
        const avgNptCostPerDay = 250000;
        const avgNptDaysPerYear = 15;

        const engineerSavings = engineers * avgEngineerSalary * timeSavings;
        const nptSavings = avgNptCostPerDay * avgNptDaysPerYear * nptReduction;
        const totalSavings = engineerSavings + nptSavings;

        engineerCountValue.textContent = engineers;
        nptReductionValue.textContent = `${nptReduction * 100}%`;
        timeSavingsValue.textContent = `${timeSavings * 100}%`;
        totalSavingsValue.textContent = `$${Math.round(totalSavings).toLocaleString()}`;

        updateSavingsChart(engineerSavings, nptSavings);
    };

    const updateSavingsChart = (engineerSavings, nptSavings) => {
        if(appState.savingsChartInstance) {
            appState.savingsChartInstance.data.datasets[0].data = [engineerSavings, nptSavings];
            appState.savingsChartInstance.update();
        }
    };

    const initSavingsChart = () => {
        if (!savingsChartCanvas) return;
        
        const ctx = savingsChartCanvas.getContext('2d');
        const isDark = body.classList.contains('theme-dark');
        
        appState.savingsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Engineering Time', 'NPT Reduction'],
                datasets: [{
                    label: 'Annual Savings',
                    data: [0, 0],
                    backgroundColor: ['#0d9488', '#0891b2'],
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        ticks: {
                            callback: (value) => `$${(value / 1000).toLocaleString()}k`,
                            color: isDark ? '#d1d5db' : '#4b5563'
                        },
                        grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }
                    },
                    y: { 
                        ticks: { color: isDark ? '#d1d5db' : '#4b5563' }, 
                        grid: { display: false } 
                    }
                },
                plugins: { 
                    legend: { display: false } 
                }
            }
        });
        
        calculateROI();
    };

    if (engineerCountSlider) {
        [engineerCountSlider, nptReductionSlider, timeSavingsSlider].forEach(slider => {
            slider.addEventListener('input', calculateROI);
        });
    }

    // --- WELL DETAILS PAGE ---

    function showWellDetails(wellId) {
        const well = wellData.find(w => w.id === wellId);
        if (!well) return;

        const compData = well._comprehensiveData || {};
        const foundation = compData.foundationalIdentity || {};
        const design = compData.designAndConstruction || {};
        const operational = compData.operationalHistory || {};
        const integrity = compData.wellIntegrityAndRisk || {};
        const equipment = compData.equipmentAndAssets || {};
        const safety = compData.safetyAndCompliance || {};

        // Update page title
        document.getElementById('well-details-title').textContent = `${well.name} - ${foundation.wellId || wellId}`;
        document.getElementById('well-details-subtitle').textContent = `${foundation.fieldName || well.field} | ${foundation.wellType || well.type} | ${well.status}`;

        // Get content container
        const contentContainer = document.getElementById('well-details-content');
        contentContainer.innerHTML = '';

        // Create comprehensive details sections (same code as before, but now on dedicated page)
        // We'll reuse the same rendering logic from the well cards

        const sections = [];

        // Foundational Identity
        if (Object.keys(foundation).length > 0) {
            sections.push({
                title: '📋 Foundational Identity',
                className: 'bg-gray-100',
                content: `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-800">
                        ${foundation.apiNumber ? `<div><span class="font-semibold text-gray-900">API Number:</span> ${foundation.apiNumber}</div>` : ''}
                        ${foundation.blockNumber ? `<div><span class="font-semibold text-gray-900">Block:</span> ${foundation.blockNumber}</div>` : ''}
                        ${foundation.licenseNumber ? `<div><span class="font-semibold text-gray-900">License:</span> ${foundation.licenseNumber}</div>` : ''}
                        ${foundation.operator ? `<div><span class="font-semibold text-gray-900">Operator:</span> ${foundation.operator}</div>` : ''}
                        ${foundation.operatorShare_percent ? `<div><span class="font-semibold text-gray-900">Operator Share:</span> ${foundation.operatorShare_percent}%</div>` : ''}
                        ${foundation.slotIdentifier ? `<div><span class="font-semibold text-gray-900">Slot:</span> ${foundation.slotIdentifier}</div>` : ''}
                        ${foundation.waterDepth_ft ? `<div><span class="font-semibold text-gray-900">Water Depth:</span> ${foundation.waterDepth_ft.toLocaleString()}ft</div>` : ''}
                        ${foundation.totalDepthMD_ft ? `<div><span class="font-semibold text-gray-900">Total Depth (MD):</span> ${foundation.totalDepthMD_ft.toLocaleString()}ft</div>` : ''}
                        ${foundation.totalDepthTVD_ft ? `<div><span class="font-semibold text-gray-900">Total Depth (TVD):</span> ${foundation.totalDepthTVD_ft.toLocaleString()}ft</div>` : ''}
                        ${foundation.wellProfile ? `<div><span class="font-semibold text-gray-900">Well Profile:</span> ${foundation.wellProfile}</div>` : ''}
                    </div>
                    ${foundation.surfaceCoordinates ? `
                        <div class="mt-3 text-sm text-gray-800">
                            <span class="font-semibold text-gray-900">Coordinates:</span>
                            ${foundation.surfaceCoordinates.latitude}°N, ${foundation.surfaceCoordinates.longitude}°E
                        </div>
                    ` : ''}
                    ${foundation.jointVenturePartners && foundation.jointVenturePartners.length > 0 ? `
                        <div class="mt-3 text-sm text-gray-800">
                            <span class="font-semibold text-gray-900">JV Partners:</span>
                            <ul class="ml-4 mt-2">
                                ${foundation.jointVenturePartners.map(p => `<li>${p.company} (${p.share}%)</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `
            });
        }

        // Design & Construction (with schematic and deviation survey included)
        if (Object.keys(design).length > 0) {
            let designContent = '';

            if (design.spudDate || design.completionDate || design.firstProductionDate) {
                designContent += '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-800 mb-4">';
                if (design.spudDate) designContent += `<div><span class="font-semibold text-gray-900">Spud Date:</span> ${design.spudDate}</div>`;
                if (design.completionDate) designContent += `<div><span class="font-semibold text-gray-900">Completion:</span> ${design.completionDate}</div>`;
                if (design.firstProductionDate) designContent += `<div><span class="font-semibold text-gray-900">First Production:</span> ${design.firstProductionDate}</div>`;
                designContent += '</div>';
            }

            // Well Schematic
            designContent += `
                <div class="mt-6 mb-6">
                    <h4 class="text-lg font-bold text-gray-900 mb-3">📐 Well Schematic</h4>
                    <div class="bg-white p-6 rounded-lg border-2 border-indigo-300">
                        <svg viewBox="0 0 400 600" class="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
                            <!-- Water line -->
                            <line x1="0" y1="50" x2="400" y2="50" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5"/>
                            <text x="10" y="45" fill="#3b82f6" font-size="12" class="font-semibold">Sea Level</text>
                            <text x="340" y="45" fill="#3b82f6" font-size="12">${foundation.waterDepth_ft || 0}ft</text>

                            <!-- Conductor -->
                            ${design.casingStrings && design.casingStrings.find(c => c.type === 'Conductor') ? `
                            <rect x="180" y="50" width="40" height="60" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
                            <text x="230" y="80" fill="#1e293b" font-size="10">30" Conductor</text>
                            ` : ''}

                            <!-- Surface Casing -->
                            ${design.casingStrings && design.casingStrings.find(c => c.type === 'Surface Casing') ? `
                            <rect x="185" y="110" width="30" height="100" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
                            <text x="225" y="160" fill="#1e293b" font-size="10">20" Surface</text>
                            ` : ''}

                            <!-- Intermediate Casing -->
                            ${design.casingStrings && design.casingStrings.find(c => c.type === 'Intermediate Casing') ? `
                            <rect x="190" y="210" width="20" height="150" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                            <text x="220" y="285" fill="#1e293b" font-size="10">13⅜" Int</text>
                            ` : ''}

                            <!-- Production Casing with potential deformation -->
                            ${design.casingStrings && design.casingStrings.find(c => c.type === 'Production Casing') ? `
                            <rect x="192" y="360" width="16" height="220" fill="${design.casingStrings.find(c => c.type === 'Production Casing').integrityStatus?.includes('CRITICAL') ? '#fee2e2' : '#f1f5f9'}" stroke="${design.casingStrings.find(c => c.type === 'Production Casing').integrityStatus?.includes('CRITICAL') ? '#dc2626' : '#475569'}" stroke-width="2"/>
                            <text x="218" y="470" fill="#1e293b" font-size="10">9⅝" Prod</text>
                            ${design.casingStrings.find(c => c.type === 'Production Casing').integrityStatus?.includes('CRITICAL') ? `
                            <circle cx="200" cy="430" r="10" fill="none" stroke="#dc2626" stroke-width="3"/>
                            <text x="215" y="435" fill="#dc2626" font-size="9" class="font-bold">Deformation</text>
                            ` : ''}
                            ` : ''}

                            <!-- Tubing -->
                            ${design.tubingStrings && design.tubingStrings.length > 0 ? `
                            <rect x="195" y="110" width="10" height="470" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
                            <text x="210" y="350" fill="#92400e" font-size="10">4½" Tbg</text>
                            ` : ''}

                            <!-- Depth markers -->
                            <text x="10" y="110" fill="#64748b" font-size="10">${design.casingStrings?.find(c => c.type === 'Conductor')?.bottomDepthMD_ft || 325}ft</text>
                            <text x="10" y="210" fill="#64748b" font-size="10">${design.casingStrings?.find(c => c.type === 'Surface Casing')?.bottomDepthMD_ft || 3850}ft</text>
                            <text x="10" y="360" fill="#64748b" font-size="10">${design.casingStrings?.find(c => c.type === 'Intermediate Casing')?.bottomDepthMD_ft || 14200}ft</text>
                            <text x="10" y="580" fill="#64748b" font-size="10">${foundation.totalDepthMD_ft || 18500}ft TD</text>

                            <!-- Perforations -->
                            ${design.perforations && design.perforations.length > 0 ? `
                            <circle cx="200" cy="560" r="4" fill="#10b981"/>
                            <circle cx="195" cy="565" r="4" fill="#10b981"/>
                            <circle cx="205" cy="565" r="4" fill="#10b981"/>
                            <text x="210" y="565" fill="#065f46" font-size="10">Perfs</text>
                            ` : ''}
                        </svg>
                    </div>
                </div>

                <div class="mt-6 mb-6">
                    <h4 class="text-lg font-bold text-gray-900 mb-3">📍 3D Deviation Survey</h4>
                    <div class="bg-white p-6 rounded-lg border-2 border-cyan-300">
                        <svg viewBox="0 0 400 400" class="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
                            <!-- Grid -->
                            <defs>
                                <pattern id="grid-${well.id}" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                                </pattern>
                            </defs>
                            <rect width="400" height="400" fill="url(#grid-${well.id})" />

                            <!-- Labels -->
                            <text x="10" y="20" fill="#6b7280" font-size="11" class="font-semibold">North →</text>
                            <text x="10" y="390" fill="#6b7280" font-size="11" class="font-semibold">East →</text>

                            <!-- Surface -->
                            <circle cx="200" cy="200" r="7" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2"/>
                            <text x="210" y="205" fill="#1e3a8a" font-size="12" class="font-bold">Surface</text>

                            ${(() => {
                                const maxDeviation = foundation.wellProfile?.match(/(\d+)°/) ? parseInt(foundation.wellProfile.match(/(\d+)°/)[1]) : 0;
                                const isDeviated = maxDeviation > 5;

                                if (isDeviated) {
                                    return `
                                    <!-- Deviated path -->
                                    <path d="M 200 200 Q 200 250, ${200 + (maxDeviation * 2)} 300 T ${200 + (maxDeviation * 3)} 400"
                                          stroke="#f59e0b" stroke-width="4" fill="none" stroke-dasharray="5,5"/>
                                    <circle cx="200" cy="250" r="5" fill="#f59e0b" />
                                    <text x="210" y="255" fill="#92400e" font-size="10">${Math.round(foundation.totalDepthMD_ft / 4)}ft</text>
                                    <circle cx="${200 + (maxDeviation * 2)}" cy="300" r="5" fill="#f59e0b" />
                                    <text x="${210 + (maxDeviation * 2)}" y="305" fill="#92400e" font-size="10">${Math.round(foundation.totalDepthMD_ft / 2)}ft</text>
                                    <circle cx="${200 + (maxDeviation * 3)}" cy="350" r="5" fill="#f59e0b" />
                                    <text x="${210 + (maxDeviation * 3)}" y="355" fill="#92400e" font-size="10">${Math.round(foundation.totalDepthMD_ft * 0.75)}ft</text>
                                    <circle cx="${200 + (maxDeviation * 3)}" cy="390" r="7" fill="#10b981" stroke="#065f46" stroke-width="2"/>
                                    <text x="${210 + (maxDeviation * 3)}" y="395" fill="#065f46" font-size="12" class="font-bold">TD</text>
                                    <text x="250" y="330" fill="#dc2626" font-size="12" class="font-bold">${maxDeviation}° max</text>
                                    `;
                                } else {
                                    return `
                                    <!-- Vertical well -->
                                    <line x1="200" y1="200" x2="200" y2="390" stroke="#10b981" stroke-width="4" stroke-dasharray="5,5"/>
                                    <circle cx="200" cy="390" r="7" fill="#10b981" stroke="#065f46" stroke-width="2"/>
                                    <text x="210" y="395" fill="#065f46" font-size="12" class="font-bold">TD (Vertical)</text>
                                    `;
                                }
                            })()}
                        </svg>
                        <div class="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-800">
                            <div><span class="font-semibold text-gray-900">Total Depth MD:</span> ${foundation.totalDepthMD_ft?.toLocaleString() || 'N/A'}ft</div>
                            <div><span class="font-semibold text-gray-900">Total Depth TVD:</span> ${foundation.totalDepthTVD_ft?.toLocaleString() || 'N/A'}ft</div>
                        </div>
                    </div>
                </div>
            `;

            sections.push({
                title: '🏗️ Design & Construction',
                className: 'bg-blue-50',
                content: designContent
            });
        }

        // Intervention History - Show each intervention with full details
        if (operational.events && operational.events.length > 0) {
            let interventionHTML = `
                <div class="text-sm text-gray-800 mb-4">
                    <span class="font-semibold text-gray-900">Total Interventions:</span> ${operational.events.length}
                </div>
            `;

            operational.events.forEach((event, index) => {
                const eventDate = event.eventDate || event.startDate || 'Unknown Date';
                const hasToolstring = event.toolstringRun && event.toolstringRun.length > 0;
                const npt = event.npt_hours || event.nptHours || 0;

                interventionHTML += `
                    <div class="border-2 border-green-300 rounded-lg p-4 mb-4 bg-white">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="text-lg font-bold text-gray-900">${index + 1}. ${event.eventType || 'Intervention'}</h4>
                                <p class="text-sm text-gray-600">${eventDate}</p>
                            </div>
                            <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                ${event.outcome ? 'Completed' : 'In Progress'}
                            </span>
                        </div>

                        ${event.description ? `
                            <div class="mb-3">
                                <span class="font-semibold text-gray-900 text-sm">Description:</span>
                                <p class="text-sm text-gray-800 mt-1">${event.description}</p>
                            </div>
                        ` : ''}

                        ${event.outcome ? `
                            <div class="mb-3">
                                <span class="font-semibold text-gray-900 text-sm">Outcome:</span>
                                <p class="text-sm text-gray-800 mt-1">${event.outcome}</p>
                            </div>
                        ` : ''}

                        ${npt > 0 ? `
                            <div class="mb-3">
                                <span class="font-semibold text-gray-900 text-sm">NPT:</span>
                                <span class="text-sm text-red-600 font-semibold">${npt} hours</span>
                            </div>
                        ` : ''}

                        ${hasToolstring ? `
                            <div class="mt-4 bg-gray-50 p-3 rounded">
                                <h5 class="font-semibold text-gray-900 text-sm mb-2">🔧 Toolstring Run</h5>
                                <ol class="list-decimal list-inside text-sm text-gray-800 space-y-1">
                                    ${event.toolstringRun.map(tool => `
                                        <li>${tool.item || tool.name || tool} ${tool.size ? `(${tool.size})` : ''}</li>
                                    `).join('')}
                                </ol>
                            </div>
                        ` : ''}

                        ${event.lessonsLearned ? `
                            <div class="mt-4 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                                <h5 class="font-semibold text-gray-900 text-sm mb-1">💡 Lessons Learned</h5>
                                <p class="text-sm text-gray-800">${event.lessonsLearned}</p>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            sections.push({
                title: '📊 Intervention History',
                className: 'bg-green-50',
                content: interventionHTML
            });
        }

        // Well Integrity & Risk
        if (integrity.liveAnomalies && integrity.liveAnomalies.length > 0) {
            let integrityContent = `<div class="text-sm text-red-600 font-semibold mb-3">Active Anomalies: ${integrity.liveAnomalies.length}</div>`;

            integrity.liveAnomalies.forEach(anomaly => {
                const severityClass = anomaly.severity === 'Critical' ? 'border-red-500 bg-red-50' : 'border-orange-300 bg-orange-50';
                integrityContent += `
                    <div class="border-2 ${severityClass} rounded-lg p-4 mb-3">
                        <h4 class="font-bold text-gray-900 text-base">${anomaly.type}</h4>
                        <span class="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded mt-1">${anomaly.severity}</span>
                        <p class="text-sm text-gray-800 mt-2">${anomaly.description}</p>
                        ${anomaly.locationMD_ft ? `<p class="text-sm text-gray-600 mt-1">Location: ${anomaly.locationMD_ft}ft MD</p>` : ''}
                    </div>
                `;
            });

            sections.push({
                title: '⚠️ Well Integrity & Risk',
                className: 'bg-red-50',
                content: integrityContent
            });
        }

        // Render all sections
        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = `${section.className} p-6 rounded-lg shadow`;
            sectionDiv.innerHTML = `
                <h3 class="text-xl font-bold text-gray-900 mb-4">${section.title}</h3>
                ${section.content}
            `;
            contentContainer.appendChild(sectionDiv);
        });

        // Switch to well details view
        switchView('well-details');
    }

    // --- EVENT LISTENERS ---

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                welcomeScreen.classList.add('hidden');
                appContainer.classList.remove('hidden');
                appContainer.classList.add('flex');
                const savedTheme = localStorage.getItem('theme') || 'dark';
                setTheme(savedTheme);
                switchView('home');
            }, 500);
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.classList.contains('disabled')) return;
                switchView(e.currentTarget.id.replace('-nav-link', ''));
            });
        });
    }

    // Well selection event listener
    if (wellSelectionGrid) {
        wellSelectionGrid.addEventListener('click', (e) => {
        // Handle view details button
        if (e.target.closest('.view-details-btn')) {
            e.stopPropagation();
            showWellDetails(e.target.closest('.view-details-btn').dataset.wellId);
            return;
        }
        
        // Handle well card selection
        const card = e.target.closest('.planner-card');
        if (!card) return;

        appState.selectedWell = wellData.find(w => w.id === card.dataset.wellId);
        document.querySelectorAll('.planner-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Enable the continue button
        if (step1ContinueBtn) {
            step1ContinueBtn.disabled = false;
        }

        renderProblems(); // Update the problems list based on selection
        });
    }

    // Step 1 Continue button event listener
    if (step1ContinueBtn) {
        step1ContinueBtn.addEventListener('click', () => {
            if (appState.selectedWell) {
                updatePlannerStepUI(2);
            }
        });
    }

    // Function to render the engineering blueprint
    const renderEngineeringBlueprint = () => {
        const blueprintContainer = document.getElementById('design-blueprint');
        if (!blueprintContainer) return;

        // Get the objective - either from manual selection or AI recommendation
        let objective = appState.selectedObjective;
        if (!objective && appState.ai.selectedRecommendation) {
            objective = objectivesData.find(o => o.id === appState.ai.selectedRecommendation.objectiveId);
        }

        if (!objective) {
            blueprintContainer.innerHTML = `<p class="text-sm text-slate-400 text-center">Select an objective or AI recommendation to load the engineering blueprint.</p>`;
            return;
        }

        const procedure = proceduresData[objective.id];
        if (!procedure) {
            blueprintContainer.innerHTML = `<p class="text-sm text-red-400 text-center">Blueprint data not found for this objective.</p>`;
            return;
        }

        // Build the blueprint HTML
        blueprintContainer.innerHTML = `
            <div class="space-y-6">
                <div class="border-b border-slate-700 pb-4">
                    <h4 class="text-2xl font-bold text-teal-600 dark:text-teal-400">${objective.icon} ${escapeHtml(objective.name)}</h4>
                    <p class="mt-2 text-sm text-slate-300">${escapeHtml(objective.description)}</p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <h5 class="text-lg font-semibold text-blue-400">Procedure Name</h5>
                        <p class="text-sm">${escapeHtml(procedure.name)}</p>
                    </div>
                    <div class="space-y-2">
                        <h5 class="text-lg font-semibold text-blue-400">Key Personnel</h5>
                        <ul class="text-sm space-y-1">
                            ${procedure.personnel.map(p => `<li>• ${escapeHtml(p)}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div>
                    <h5 class="text-lg font-semibold text-blue-400 mb-3">Execution Steps</h5>
                    <ol class="space-y-2 text-sm">
                        ${procedure.steps.map((step, i) => `<li class="flex"><span class="font-bold text-teal-500 mr-2">${i + 1}.</span><span>${escapeHtml(step)}</span></li>`).join('')}
                    </ol>
                </div>

                <div class="grid md:grid-cols-3 gap-4">
                    <div class="bg-slate-800/50 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-400 mb-1">Estimated Cost</h5>
                        <p class="text-2xl font-bold text-emerald-400">$${(procedure.cost / 1000000).toFixed(2)}M</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-400 mb-1">Duration</h5>
                        <p class="text-2xl font-bold text-blue-400">${procedure.duration} days</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-400 mb-1">Overall Risk</h5>
                        <p class="text-2xl font-bold text-amber-400">${Math.round((procedure.risks.operational + procedure.risks.equipment + procedure.risks.hse) / 3)}/5</p>
                    </div>
                </div>

                <div>
                    <h5 class="text-lg font-semibold text-blue-400 mb-3">Risk Profile</h5>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div class="flex flex-col items-center p-3 bg-slate-800/50 rounded">
                            <span class="text-slate-400">Operational</span>
                            <span class="text-xl font-bold ${procedure.risks.operational >= 4 ? 'text-red-400' : procedure.risks.operational >= 3 ? 'text-amber-400' : 'text-emerald-400'}">${procedure.risks.operational}/5</span>
                        </div>
                        <div class="flex flex-col items-center p-3 bg-slate-800/50 rounded">
                            <span class="text-slate-400">Geological</span>
                            <span class="text-xl font-bold ${procedure.risks.geological >= 4 ? 'text-red-400' : procedure.risks.geological >= 3 ? 'text-amber-400' : 'text-emerald-400'}">${procedure.risks.geological}/5</span>
                        </div>
                        <div class="flex flex-col items-center p-3 bg-slate-800/50 rounded">
                            <span class="text-slate-400">Equipment</span>
                            <span class="text-xl font-bold ${procedure.risks.equipment >= 4 ? 'text-red-400' : procedure.risks.equipment >= 3 ? 'text-amber-400' : 'text-emerald-400'}">${procedure.risks.equipment}/5</span>
                        </div>
                        <div class="flex flex-col items-center p-3 bg-slate-800/50 rounded">
                            <span class="text-slate-400">HSE</span>
                            <span class="text-xl font-bold ${procedure.risks.hse >= 4 ? 'text-red-400' : procedure.risks.hse >= 3 ? 'text-amber-400' : 'text-emerald-400'}">${procedure.risks.hse}/5</span>
                        </div>
                        <div class="flex flex-col items-center p-3 bg-slate-800/50 rounded">
                            <span class="text-slate-400">Financial</span>
                            <span class="text-xl font-bold ${procedure.risks.financial >= 4 ? 'text-red-400' : procedure.risks.financial >= 3 ? 'text-amber-400' : 'text-emerald-400'}">${procedure.risks.financial}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Enable the "Generate Integrated Program" button
        const generateProgramBtn = document.getElementById('generate-program-btn');
        if (generateProgramBtn) {
            generateProgramBtn.disabled = false;
        }
    };

    // Step 2 Continue button event listener
    if (step2ContinueBtn) {
        step2ContinueBtn.addEventListener('click', () => {
            if (appState.selectedObjective || appState.ai.selectedRecommendation) {
                renderEngineeringBlueprint();
                updatePlannerStepUI(3);
            }
        });
    }

    // Objective selection event listener
    if (objectivesFieldset) {
        objectivesFieldset.addEventListener('change', (e) => {
            // Find the selected objective card and update its styling
            document.querySelectorAll('.objective-card').forEach(card => {
                card.classList.remove('selected');
            });

            const selectedCard = document.querySelector(`input[name="objective"]:checked`).closest('.objective-card');
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }

            appState.selectedObjective = objectivesData.find(o => o.id === e.target.value);
            if (generatePlanBtnManual) {
                generatePlanBtnManual.disabled = !appState.selectedObjective;
            }
            if (step2ContinueBtn) {
                step2ContinueBtn.disabled = !appState.selectedObjective;
            }
        });
    }

    // Problem selection event listener
    if (problemsFieldset && aiRecommendationsContainer) {
        problemsFieldset.addEventListener('change', (e) => {
        // Find the selected problem card and update its styling
        document.querySelectorAll('.objective-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`input[name="problem"]:checked`).closest('.objective-card');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        appState.ai.selectedProblemId = e.target.value;
        const recommendations = aiRecommendations[appState.ai.selectedProblemId] || [];
        
        aiRecommendationsContainer.innerHTML = `
            <h3 class="text-lg font-semibold text-center mb-4 mt-6">AI Recommendations</h3>
            <div class="space-y-4">
                ${recommendations.map((rec, i) => {
                    const objective = objectivesData.find(o => o.id === rec.objectiveId);
                    return `
                        <div class="ai-recommendation-enhanced" data-rec-index="${i}">
                            <div class="confidence-badge">${rec.confidence}% Confidence</div>
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-bold text-lg text-teal-700 dark:text-teal-400">${objective.icon} ${escapeHtml(objective.name)}</h4>
                            </div>
                            <p class="text-sm mb-1"><strong>Projected Outcome:</strong> ${escapeHtml(rec.outcome)}</p>
                            <p class="text-xs"><strong>Reasoning:</strong> ${rec.reason}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        aiRecommendationsContainer.classList.remove('hidden');
        
        // Add event listeners to recommendation cards
        document.querySelectorAll('.ai-recommendation-enhanced').forEach(card => card.addEventListener('click', (ev) => {
            const selectedCard = ev.target.closest('.ai-recommendation-enhanced');
            const recIndex = parseInt(selectedCard.dataset.recIndex);
            appState.ai.selectedRecommendation = aiRecommendations[appState.ai.selectedProblemId][recIndex];

            document.querySelectorAll('.ai-recommendation-enhanced').forEach(c => c.classList.remove('selected'));
            selectedCard.classList.add('selected');

            if (generatePlanBtnAi) {
                generatePlanBtnAi.disabled = false;
            }
            if (step2ContinueBtn) {
                step2ContinueBtn.disabled = false;
            }
        }));
        });
    }

    // AI toggle event listener
    if (aiToggle && manualPlanningView && aiAdvisorView) {
        aiToggle.addEventListener('change', (e) => {
            manualPlanningView.classList.toggle('hidden', e.target.checked);
            aiAdvisorView.classList.toggle('hidden', !e.target.checked);

            // Update step 2 continue button based on mode
            if (step2ContinueBtn) {
                if (e.target.checked) {
                    // AI mode - enable only if AI recommendation selected
                    step2ContinueBtn.disabled = !appState.ai.selectedRecommendation;
                } else {
                    // Manual mode - enable only if objective selected
                    step2ContinueBtn.disabled = !appState.selectedObjective;
                }
            }

            if(e.target.checked && appState.selectedWell && appState.selectedWell.id !== '666') {
                aiAdvisorView.innerHTML = `
                <div class="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg text-center">
                    <p class="text-yellow-800 dark:text-yellow-200">The AI Advisor is configured for the 'Well From Hell' (${escapeHtml(appState.selectedWell.id)}) scenario. Please select 666 to see AI recommendations.</p>
                </div>
            `;
            } else {
                renderProblems(); // Re-render problems list
            }
        });
    }

    // Generate plan buttons event listeners
    if (generatePlanBtnManual) {
        generatePlanBtnManual.addEventListener('click', () => {
            if (!appState.selectedWell || !appState.selectedObjective) return;
            appState.generatedPlan = proceduresData[appState.selectedObjective.id];
            renderPlan();
            updatePlannerStepUI(3);
        });
    }

    if (generatePlanBtnAi) {
        generatePlanBtnAi.addEventListener('click', () => {
            if (!appState.selectedWell || !appState.ai.selectedRecommendation) return;
            appState.selectedObjective = objectivesData.find(o => o.id === appState.ai.selectedRecommendation.objectiveId);
            appState.generatedPlan = proceduresData[appState.selectedObjective.id];
            renderPlan();
            updatePlannerStepUI(3);
        });
    }

    // Control buttons event listeners
    if (startOverBtn) {
        startOverBtn.addEventListener('click', () => resetApp(false));
    }

    if (backToPlannerBtn) {
        backToPlannerBtn.addEventListener('click', () => {
            switchView('planner');
        });
    }

    if (beginOpBtn) {
        beginOpBtn.addEventListener('click', () => {
            if (!appState.generatedPlan) return;
            switchView('performer');
        });
    }

    // --- BRAHAN ENGINE INTEGRATION ---

    /**
     * Collects all context data for the Brahan Engine
     * @returns {Object} Formatted JSON payload matching Brahan Engine input spec
     */
    function collectBrahanEnginePayload() {
        // Get the objective - either from manual selection or AI recommendation
        let objective = appState.selectedObjective;
        if (!objective && appState.ai.selectedRecommendation) {
            objective = objectivesData.find(o => o.id === appState.ai.selectedRecommendation.objectiveId);
        }

        const procedure = proceduresData[objective.id];
        const well = appState.selectedWell;

        // Build the payload in the exact format specified by the Brahan Engine prompt
        return {
            target_well: {
                id: well.id + ' - ' + well.name,
                type: well.type,
                status: well.status,
                known_issues: [well.issue],
                depth: well.depth
            },
            selected_intervention_objective: {
                title: objective.name,
                description: objective.description
            },
            proposed_engineering_plan: procedure.steps,
            human_led_assessment: {
                estimated_cost: (procedure.cost / 1000000).toFixed(2) + 'M',
                estimated_duration: procedure.duration + ' days',
                overall_risk_score: Math.round((procedure.risks.operational + procedure.risks.equipment + procedure.risks.hse) / 3) + '/5',
                risk_profile: {
                    operational: procedure.risks.operational + '/5',
                    geological: procedure.risks.geological + '/5',
                    equipment: procedure.risks.equipment + '/5',
                    hse: procedure.risks.hse + '/5',
                    financial: procedure.risks.financial + '/5'
                }
            },
            reference_offset_well_data: [
                {
                    id: 'The Brahan Squeeze (Case Study)',
                    type: 'HPHT Gas Producer',
                    status: 'Active - Restored Production',
                    lessons_learned: [
                        'Initial deformation remediation on this field took 11 days, not 8, due to unexpected setting tool failures.',
                        'High operational risk (4/5) on similar jobs was linked to failure to perform adequate pre-job-simulation of hydraulic setting pressures.',
                        'Equipment risk (4/5) was realized when the first-choice expandable patch failed to set, requiring a 2-day POOH and contingency mobilization.'
                    ]
                }
            ]
        };
    }

    /**
     * Simulates the Brahan Engine AI response
     * In production, this would call a backend API
     * @param {Object} payload - The input payload
     * @returns {Object} Formatted Brahan Engine response with analysis
     */
    function simulateBrahanEngineResponse(payload) {
        // Mock AI response based on the payload
        const isHighRisk = payload.human_led_assessment.risk_profile.operational === '4/5' &&
                           payload.human_led_assessment.risk_profile.equipment === '4/5';

        const duration = parseInt(payload.human_led_assessment.estimated_duration);
        const cost = parseFloat(payload.human_led_assessment.estimated_cost);

        // AI increases estimates based on offset data
        const aiDuration = {
            p50: duration + 2,
            p90: duration + 3
        };
        const aiCost = {
            p50: (cost * 1.15).toFixed(2) + 'M',
            p90: (cost * 1.25).toFixed(2) + 'M'
        };

        return {
            executive_summary: isHighRisk
                ? `This plan is **feasible**, but the ${duration}-day estimate is **highly optimistic**. Historical data from **The Brahan Squeeze** case study shows similar jobs took ${aiDuration.p50} days (P50) due to setting tool failures. The high operational and equipment risk scores are validated by offset data.`
                : `This plan is **feasible** with moderate risk. The ${duration}-day estimate aligns with historical data, though contingency time should be added for equipment-related delays.`,

            validated_program: {
                steps: payload.proposed_engineering_plan,
                cost_analysis: {
                    human_estimate: payload.human_led_assessment.estimated_cost,
                    ai_estimate_p50: aiCost.p50,
                    ai_estimate_p90: aiCost.p90,
                    rationale: isHighRisk
                        ? `The Brahan Squeeze case study shows contingency costs for backup equipment and extended rig time average 15-25% over initial estimates for high-risk operations.`
                        : `Cost estimate is reasonable based on historical data for similar interventions.`
                },
                duration_analysis: {
                    human_estimate: payload.human_led_assessment.estimated_duration,
                    ai_estimate_p50: aiDuration.p50 + ' days',
                    ai_estimate_p90: aiDuration.p90 + ' days',
                    rationale: isHighRisk
                        ? `Historical analysis shows setting tool failures and contingency mobilization add 2-3 days. The Brahan Squeeze took 11 days vs. planned 8 days.`
                        : `Duration estimate aligns with offset data for similar operations.`
                }
            },

            key_risks: [
                {
                    risk: 'Patch Setting Failure',
                    probability: 'High (4/5)',
                    impact: 'Critical',
                    mitigation: 'Pre-job: Conduct full-scale hydraulic simulation of setting tool with vendor. Verify setting pressure compatibility with wellbore conditions.'
                },
                {
                    risk: 'Equipment Failure',
                    probability: 'High (4/5)',
                    impact: 'Major',
                    mitigation: 'Contingency: Mobilize backup expandable patch assembly to rig site before job starts. Reduces delay from 48hrs to 4hrs.'
                },
                {
                    risk: 'Wellbore Access Issues',
                    probability: 'Medium (3/5)',
                    impact: 'Major',
                    mitigation: 'Pre-job: Run gauge ring and scraper on first trip. If restrictions found, consider additional cleanout run before patch deployment.'
                }
            ],

            recommendations: [
                '**Pre-job Simulation:** Conduct full-scale hydraulic simulation of setting tool to validate setting pressures match wellbore conditions.',
                '**Contingency Planning:** Mobilize backup expandable patch to rig site before job commencement to reduce NPT from equipment failure.',
                '**Wellbore Survey:** Run advanced caliper log to map exact deformation geometry and confirm patch length/placement.',
                '**Lessons Applied:** Review failure mode from The Brahan Squeeze case study with operations team before execution.'
            ]
        };
    }

    /**
     * Renders the Brahan Engine output in Step 4
     * @param {Object} response - The Brahan Engine response object
     */
    function renderBrahanEngineOutput(response) {
        const planOutput = document.getElementById('plan-output');
        if (!planOutput) return;

        // Build the HTML for the Brahan Engine output
        planOutput.innerHTML = `
            <!-- Executive Summary -->
            <div class="light-card p-6 rounded-lg border-l-4 border-teal-500">
                <h4 class="text-xl font-bold text-teal-600 dark:text-teal-400 mb-3 flex items-center">
                    <span class="mr-2">🧠</span> Executive Summary
                </h4>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${response.executive_summary}</p>
            </div>

            <!-- Validated Program & Risk Analysis -->
            <div class="light-card p-6 rounded-lg">
                <h4 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
                    <span class="mr-2">📋</span> Validated Program & Risk Analysis
                </h4>

                <!-- Program Steps -->
                <div class="mb-6">
                    <h5 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Engineering Steps</h5>
                    <ol class="space-y-2 text-sm">
                        ${response.validated_program.steps.map((step, i) => `
                            <li class="flex">
                                <span class="font-bold text-teal-600 dark:text-teal-400 mr-3">${i + 1}.</span>
                                <span class="text-slate-700 dark:text-slate-300">${escapeHtml(step)}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>

                <!-- Data-Driven Critique -->
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <!-- Cost Analysis -->
                    <div class="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Cost Analysis</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">Human Estimate:</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">$${response.validated_program.cost_analysis.human_estimate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">AI Estimate (P50):</span>
                                <span class="font-bold text-amber-600 dark:text-amber-400">$${response.validated_program.cost_analysis.ai_estimate_p50}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">AI Estimate (P90):</span>
                                <span class="font-bold text-red-600 dark:text-red-400">$${response.validated_program.cost_analysis.ai_estimate_p90}</span>
                            </div>
                        </div>
                        <p class="mt-3 text-xs text-slate-600 dark:text-slate-400 italic">${response.validated_program.cost_analysis.rationale}</p>
                    </div>

                    <!-- Duration Analysis -->
                    <div class="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">Duration Analysis</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">Human Estimate:</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">${response.validated_program.duration_analysis.human_estimate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">AI Estimate (P50):</span>
                                <span class="font-bold text-amber-600 dark:text-amber-400">${response.validated_program.duration_analysis.ai_estimate_p50}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 dark:text-slate-400">AI Estimate (P90):</span>
                                <span class="font-bold text-red-600 dark:text-red-400">${response.validated_program.duration_analysis.ai_estimate_p90}</span>
                            </div>
                        </div>
                        <p class="mt-3 text-xs text-slate-600 dark:text-slate-400 italic">${response.validated_program.duration_analysis.rationale}</p>
                    </div>
                </div>

                <!-- Key Risk Dashboard -->
                <div class="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4">
                    <h5 class="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
                        <span class="mr-2">⚠️</span> Top 3 Risks
                    </h5>
                    <div class="space-y-3">
                        ${response.key_risks.map((risk, i) => `
                            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${i === 0 ? 'border-red-500' : i === 1 ? 'border-orange-500' : 'border-yellow-500'}">
                                <div class="flex justify-between items-start mb-2">
                                    <h6 class="font-bold text-slate-800 dark:text-slate-200">${i + 1}. ${escapeHtml(risk.risk)}</h6>
                                    <span class="text-xs font-semibold px-2 py-1 rounded ${i === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'}">${escapeHtml(risk.probability)}</span>
                                </div>
                                <p class="text-xs text-slate-600 dark:text-slate-400 mb-2"><strong>Impact:</strong> ${escapeHtml(risk.impact)}</p>
                                <p class="text-xs text-slate-700 dark:text-slate-300"><strong>Mitigation:</strong> ${escapeHtml(risk.mitigation)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Actionable Recommendations -->
            <div class="light-card p-6 rounded-lg border-l-4 border-emerald-500">
                <h4 class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center">
                    <span class="mr-2">💡</span> Actionable Recommendations (Lessons Learned)
                </h4>
                <ul class="space-y-3">
                    ${response.recommendations.map(rec => `
                        <li class="flex items-start">
                            <span class="text-emerald-500 mr-2 mt-1">✓</span>
                            <span class="text-slate-700 dark:text-slate-300">${rec}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Enable the continue button
        const step4ContinueBtn = document.getElementById('step-4-continue');
        if (step4ContinueBtn) {
            step4ContinueBtn.disabled = false;
        }
    }

    // "Generate Integrated Program" button event listener
    const generateProgramBtn = document.getElementById('generate-program-btn');
    if (generateProgramBtn) {
        generateProgramBtn.addEventListener('click', () => {
            // Show loading state
            generateProgramBtn.disabled = true;
            generateProgramBtn.textContent = 'Generating...';

            // Simulate API call delay
            setTimeout(() => {
                // Collect payload
                const payload = collectBrahanEnginePayload();
                console.log('Brahan Engine Payload:', payload);

                // Simulate AI response
                const response = simulateBrahanEngineResponse(payload);
                console.log('Brahan Engine Response:', response);

                // Render output
                renderBrahanEngineOutput(response);

                // Navigate to Step 4
                updatePlannerStepUI(4);

                // Reset button
                generateProgramBtn.disabled = false;
                generateProgramBtn.textContent = 'Generate Integrated Program';
            }, 1500); // 1.5 second delay to simulate API call
        });
    }

    // Step 4 Continue button event listener
    if (step4ContinueBtn) {
        step4ContinueBtn.addEventListener('click', () => {
            updatePlannerStepUI(5);
        });
    }

    // Step 5 Continue button event listener
    if (step5ContinueBtn) {
        step5ContinueBtn.addEventListener('click', () => {
            updatePlannerStepUI(6);
        });
    }

    if (addLogBtn && logInput) {
        addLogBtn.addEventListener('click', () => {
            addLogEntry('Operator', logInput.value);
            logInput.value = '';
        });
    }

    if (procedureStepsContainer) {
        procedureStepsContainer.addEventListener('click', (e) => {
            const stepDiv = e.target.closest('.procedure-step');
            if (!stepDiv || !appState.liveData.jobRunning) return;

            const targetStepId = parseInt(stepDiv.dataset.stepId);
            const currentStepId = appState.liveData.currentStep;

            if (targetStepId > currentStepId) {
                jumpToStep(targetStepId);
            }
        });
    }

    if (viewAnalysisBtn) {
        viewAnalysisBtn.addEventListener('click', () => {
            switchView('analyzer');
            if (window.initializeAnalyzer) {
                window.initializeAnalyzer();
            } else {
                initializeAnalyzer();
                initializeVendorScorecard();
            }
        });
    }

    if (addLessonBtn && lessonInput) {
        addLessonBtn.addEventListener('click', () => {
            if(lessonInput.value.trim()){
                appState.lessonsLearned.push(lessonInput.value.trim());
                lessonInput.value = '';
                renderLessons();
            }
        });
    }

    if (planNewJobBtn) {
        planNewJobBtn.addEventListener('click', () => resetApp(true));
    }

    if (equipmentSearch && personnelSearch) {
        equipmentSearch.addEventListener('input', (e) =>
            renderAssetManagementViews(e.target.value, personnelSearch.value)
        );

        personnelSearch.addEventListener('input', (e) =>
            renderAssetManagementViews(equipmentSearch.value, e.target.value)
        );
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    /* ========================================
       V23 FEATURE FUNCTIONS
       ======================================== */

    // --- ANOMALY DETECTION SYSTEM ---

    let anomalyCounter = 0;
    let detectedAnomalies = [];

    function detectAnomalies(whp, hookload, depth, time) {
        const anomalies = [];

        // WHP Anomaly Detection
        if (whp > 8000) {
            anomalies.push({
                type: 'critical',
                parameter: 'WHP',
                value: whp,
                threshold: 8000,
                message: 'Wellhead Pressure critically high',
                recommendation: 'STOP OPERATIONS. Initiate well control procedures. Check for kick indicators.',
                icon: '🔴'
            });
        } else if (whp > 6500) {
            anomalies.push({
                type: 'warning',
                parameter: 'WHP',
                value: whp,
                threshold: 6500,
                message: 'Wellhead Pressure elevated',
                recommendation: 'Monitor closely. Prepare for pressure management. Review mud weight.',
                icon: '⚠️'
            });
        }

        // Hookload Anomaly Detection
        if (hookload > 450) {
            anomalies.push({
                type: 'critical',
                parameter: 'Hookload',
                value: hookload,
                threshold: 450,
                message: 'Hookload critically high - Stuck pipe likely',
                recommendation: 'STOP PULLING. Initiate stuck pipe procedures. Work pipe gently.',
                icon: '🔴'
            });
        } else if (hookload > 380) {
            anomalies.push({
                type: 'warning',
                parameter: 'Hookload',
                value: hookload,
                threshold: 380,
                message: 'Hookload elevated - Monitor for stuck pipe',
                recommendation: 'Reduce pulling speed. Increase circulation. Monitor for drag trends.',
                icon: '⚠️'
            });
        } else if (hookload < 150) {
            anomalies.push({
                type: 'warning',
                parameter: 'Hookload',
                value: hookload,
                threshold: 150,
                message: 'Hookload unusually low',
                recommendation: 'Check for free-falling pipe or equipment failure. Verify weight readings.',
                icon: '⚠️'
            });
        }

        return anomalies;
    }

    function displayAnomaly(anomaly, time) {
        const alertsContainer = document.getElementById('anomaly-alerts');
        if (!alertsContainer) return;

        const alertId = `anomaly-${anomalyCounter++}`;

        // Remove "all systems normal" message if present
        if (detectedAnomalies.length === 0) {
            alertsContainer.innerHTML = '';
        }

        const alertDiv = document.createElement('div');
        alertDiv.id = alertId;
        alertDiv.className = `anomaly-alert anomaly-${anomaly.type} p-4 rounded-lg`;

        alertDiv.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="text-2xl anomaly-icon-${anomaly.type}">${anomaly.icon}</div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg">${escapeHtml(anomaly.message)}</h4>
                        <span class="text-sm opacity-75">t=${time} min</span>
                    </div>
                    <div class="text-sm mb-2">
                        <strong>${escapeHtml(anomaly.parameter)}:</strong> ${anomaly.value.toFixed(1)}
                        (Threshold: ${escapeHtml(anomaly.threshold)})
                    </div>
                    <div class="bg-white/20 p-3 rounded text-sm">
                        <strong>Recommendation:</strong> ${escapeHtml(anomaly.recommendation)}
                    </div>
                </div>
            </div>
        `;

        alertsContainer.insertBefore(alertDiv, alertsContainer.firstChild);
        detectedAnomalies.push({ id: alertId, anomaly, time });

        // Auto-resolve warnings after 5 minutes (300000ms)
        if (anomaly.type === 'warning') {
            setTimeout(() => resolveAnomaly(alertId), 300000);
        }
    }

    function resolveAnomaly(alertId) {
        const alertDiv = document.getElementById(alertId);
        if (alertDiv) {
            alertDiv.classList.remove('anomaly-warning', 'anomaly-critical');
            alertDiv.classList.add('anomaly-resolved');
            const icon = alertDiv.querySelector('.anomaly-icon-warning, .anomaly-icon-critical');
            if (icon) {
                icon.classList.remove('anomaly-icon-warning', 'anomaly-icon-critical');
            }
        }
    }

    // Integrate anomaly detection with gauge updates
    const originalUpdateGauges = window.updateGauges || function() {};
    window.updateGauges = function(whp, hookload, depth, time) {
        originalUpdateGauges(whp, hookload, depth, time);

        // Run anomaly detection
        if (appState.liveData.jobRunning) {
            const anomalies = detectAnomalies(whp, hookload, depth, time);
            anomalies.forEach(anomaly => displayAnomaly(anomaly, time));
        }
    };

    // --- VENDOR SCORECARD SYSTEM ---

    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let html = '';

        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star">★</span>';
        }
        if (hasHalfStar) {
            html += '<span class="star">★</span>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star empty">★</span>';
        }

        return html;
    }

    function initializeVendorScorecard() {
        const metrics = {
            'delivery': 4.8,    // 95%
            'quality': 4.4,     // 88%
            'support': 4.6,     // 92%
            'cost': 3.9,        // 78%
            'safety': 4.9,      // 98%
            'response': 4.3     // 85%
        };

        // Calculate overall rating
        const overall = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;

        // Update overall rating
        const overallRatingEl = document.getElementById('vendor-overall-rating');
        const overallStarsEl = document.getElementById('vendor-overall-stars');

        if (overallRatingEl) {
            overallRatingEl.textContent = overall.toFixed(1);
        }
        if (overallStarsEl) {
            overallStarsEl.innerHTML = generateStarRating(overall);
        }

        // Update individual metrics
        Object.keys(metrics).forEach(metric => {
            const element = document.getElementById(`metric-${metric}-stars`);
            if (element) {
                element.innerHTML = generateStarRating(metrics[metric]);
            }
        });
    }

    // Store the original initializeAnalyzer function
    const originalInitializeAnalyzer = initializeAnalyzer;

    // Create wrapper function for vendor scorecard initialization
    const initializeAnalyzerWithVendor = function() {
        originalInitializeAnalyzer();
        initializeVendorScorecard();
    };

    // Replace the function globally
    window.initializeAnalyzer = initializeAnalyzerWithVendor;

    // --- HOME WELL CARDS RENDERING ---

    const renderHomeWellCards = () => {
        const container = document.getElementById('home-well-cards-grid');
        if (!container) return;

        // Sort wells: 666 last, others first
        const sortedWells = [...wellData].sort((a, b) => {
            if (a.id === '666') return 1;
            if (b.id === '666') return -1;
            return 0;
        });

        container.innerHTML = sortedWells.map(well => {
            const is666 = well.id === '666';
            const isDark = body.classList.contains('theme-dark');

            // Calculate total NPT
            const totalNPT = well.dailyReports.reduce((sum, report) => sum + (report.npt || 0), 0);

            return `
                <div class="well-detail-card ${is666 ? 'critical-well-card' : 'case-study-card'}" data-well-id="${escapeHtml(well.id)}">
                    <!-- Card Header -->
                    <div class="card-header-detailed ${is666 ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h3 class="text-2xl font-extrabold text-white">${escapeHtml(well.id)}</h3>
                                    <span class="px-3 py-1 rounded-full text-xs font-bold ${is666 ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'}">
                                        ${is666 ? 'CRITICAL - SHUT IN' : 'CASE STUDY'}
                                    </span>
                                </div>
                                <h4 class="text-xl font-bold text-white mb-2">${escapeHtml(well.name)}</h4>
                                <div class="grid grid-cols-2 gap-2 text-sm text-white/90">
                                    <div><span class="font-semibold">Field:</span> ${escapeHtml(well.field)}</div>
                                    <div><span class="font-semibold">Region:</span> ${escapeHtml(well.region)}</div>
                                    <div><span class="font-semibold">Type:</span> ${escapeHtml(well.type)}</div>
                                    <div><span class="font-semibold">Depth:</span> ${escapeHtml(well.depth)}</div>
                                </div>
                            </div>
                            <button class="toggle-card-btn text-white hover:bg-white/20 p-2 rounded-lg transition" data-well-id="${escapeHtml(well.id)}">
                                <svg class="w-8 h-8 transform transition-transform expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                        </div>
                        <div class="mt-4 p-3 bg-white/10 rounded-lg">
                            <p class="text-sm font-semibold text-white mb-1">Status:</p>
                            <p class="text-sm text-white/90">${escapeHtml(well.status)}</p>
                        </div>
                        <div class="mt-3 p-3 ${is666 ? 'bg-red-900/50' : 'bg-blue-900/50'} rounded-lg">
                            <p class="text-sm font-semibold text-white mb-1">${is666 ? 'Problem Description:' : 'Solution Overview:'}</p>
                            <p class="text-sm text-white/90">${escapeHtml(well.issue)}</p>
                        </div>
                    </div>

                    <!-- Expandable Content -->
                    <div class="card-expandable-content hidden" data-well-id="${escapeHtml(well.id)}">
                        <div class="p-6 space-y-6">
                            <!-- Quick Stats -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="stat-card">
                                    <div class="stat-label">Historical Operations</div>
                                    <div class="stat-value">${well.history.length}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-label">Daily Reports</div>
                                    <div class="stat-value">${well.dailyReports.length}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-label">Total NPT</div>
                                    <div class="stat-value ${totalNPT > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">${totalNPT} days</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-label">Equipment Count</div>
                                    <div class="stat-value">${well.completion.equipment.length}</div>
                                </div>
                            </div>

                            <!-- Tabs -->
                            <div class="border-b border-gray-200 dark:border-gray-700">
                                <nav class="-mb-px flex space-x-4" aria-label="Tabs">
                                    <button class="well-detail-tab active" data-well-id="${escapeHtml(well.id)}" data-tab="history">
                                        History & Lessons
                                    </button>
                                    <button class="well-detail-tab" data-well-id="${escapeHtml(well.id)}" data-tab="schematic">
                                        Wellbore Schematic
                                    </button>
                                    <button class="well-detail-tab" data-well-id="${escapeHtml(well.id)}" data-tab="reports">
                                        Daily Reports
                                    </button>
                                    <button class="well-detail-tab" data-well-id="${escapeHtml(well.id)}" data-tab="completion">
                                        Completion Details
                                    </button>
                                </nav>
                            </div>

                            <!-- Tab Content -->
                            <div class="tab-content-container">
                                <!-- History Tab -->
                                <div class="tab-pane active" data-well-id="${escapeHtml(well.id)}" data-tab-content="history">
                                    <h4 class="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Operational History</h4>
                                    ${well.history.length ? `
                                        <div class="space-y-4">
                                            ${well.history.map((h, idx) => `
                                                <div class="history-item p-5 rounded-lg border-l-4 ${is666 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}">
                                                    <div class="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h5 class="font-bold text-lg text-slate-900 dark:text-slate-100">${escapeHtml(h.operation)}</h5>
                                                            <p class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(h.date)}</p>
                                                        </div>
                                                        <span class="text-sm font-semibold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                            Entry ${idx + 1} of ${well.history.length}
                                                        </span>
                                                    </div>
                                                    <div class="space-y-3">
                                                        <div class="flex items-start gap-3">
                                                            <svg class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                                            </svg>
                                                            <div class="flex-1">
                                                                <strong class="font-semibold text-red-700 dark:text-red-400">Problem Encountered:</strong>
                                                                <p class="text-sm mt-1 text-slate-700 dark:text-slate-300">${escapeHtml(h.problem)}</p>
                                                            </div>
                                                        </div>
                                                        <div class="flex items-start gap-3">
                                                            <svg class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            </svg>
                                                            <div class="flex-1">
                                                                <strong class="font-semibold text-green-700 dark:text-green-400">Lesson Learned:</strong>
                                                                <p class="text-sm mt-1 text-slate-700 dark:text-slate-300">${escapeHtml(h.lesson)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : '<p class="text-slate-600 dark:text-slate-400">No historical data available.</p>'}
                                </div>

                                <!-- Schematic Tab -->
                                <div class="tab-pane hidden" data-well-id="${escapeHtml(well.id)}" data-tab-content="schematic">
                                    <h4 class="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Wellbore Schematic</h4>
                                    <div class="schematic-container bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                                        ${renderWellSchematic(well)}
                                    </div>
                                    <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h5 class="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2">Schematic Legend:</h5>
                                        <ul class="text-xs space-y-1 text-blue-800 dark:text-blue-300">
                                            <li><span class="inline-block w-3 h-3 bg-red-500 mr-2"></span>Problem Areas (Red)</li>
                                            <li><span class="inline-block w-3 h-3 bg-green-500 mr-2"></span>Successful Repairs (Green)</li>
                                            <li><span class="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Normal Equipment (Gray)</li>
                                            <li><span class="inline-block w-3 h-3 bg-blue-700 mr-2"></span>Perforations (Blue)</li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Daily Reports Tab -->
                                <div class="tab-pane hidden" data-well-id="${escapeHtml(well.id)}" data-tab-content="reports">
                                    <h4 class="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Daily Operational Reports</h4>
                                    ${well.dailyReports.length ? `
                                        <div class="overflow-x-auto">
                                            <table class="w-full text-sm">
                                                <thead class="bg-slate-100 dark:bg-slate-800">
                                                    <tr>
                                                        <th class="p-3 text-left font-semibold">Date</th>
                                                        <th class="p-3 text-left font-semibold">Operation Summary</th>
                                                        <th class="p-3 text-left font-semibold">NPT (days)</th>
                                                        <th class="p-3 text-left font-semibold">Tool String</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                                                    ${well.dailyReports.map(r => `
                                                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td class="p-3 align-top font-mono text-xs whitespace-nowrap">${escapeHtml(r.date)}</td>
                                                            <td class="p-3 align-top">${escapeHtml(r.summary)}</td>
                                                            <td class="p-3 align-top">
                                                                <span class="px-2 py-1 rounded text-xs font-bold ${r.npt > 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}">
                                                                    ${r.npt}
                                                                </span>
                                                            </td>
                                                            <td class="p-3 align-top">
                                                                <div class="font-mono text-xs space-y-1 max-w-md">
                                                                    ${r.toolstringRun.map((item, idx) => `
                                                                        <div class="flex gap-2">
                                                                            <span class="text-cyan-600 dark:text-cyan-400 font-bold">${idx + 1}.</span>
                                                                            <span class="text-slate-700 dark:text-slate-300">${escapeHtml(item)}</span>
                                                                        </div>
                                                                    `).join('')}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <h5 class="font-semibold text-sm mb-2">NPT Summary:</h5>
                                            <p class="text-sm text-slate-600 dark:text-slate-400">Total Non-Productive Time: <span class="font-bold ${totalNPT > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">${totalNPT} days</span> across ${well.dailyReports.length} operations</p>
                                        </div>
                                    ` : '<p class="text-slate-600 dark:text-slate-400">No daily reports available.</p>'}
                                </div>

                                <!-- Completion Details Tab -->
                                <div class="tab-pane hidden" data-well-id="${escapeHtml(well.id)}" data-tab-content="completion">
                                    <h4 class="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Completion Architecture</h4>

                                    <!-- Casing -->
                                    <div class="mb-6">
                                        <h5 class="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-100">Casing</h5>
                                        <div class="space-y-2">
                                            ${well.completion.casing.map(c => `
                                                <div class="p-4 rounded-lg ${c.isProblem ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : 'bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-300'}">
                                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Type:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${c.type}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Size:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${c.size}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Top Depth:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${c.top.toLocaleString()}ft</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Bottom Depth:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${c.bottom.toLocaleString()}ft</span>
                                                        </div>
                                                    </div>
                                                    ${c.isProblem ? '<div class="mt-2"><span class="text-xs font-bold text-red-700 dark:text-red-300">⚠️ PROBLEM AREA</span></div>' : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <!-- Tubing -->
                                    <div class="mb-6">
                                        <h5 class="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-100">Tubing</h5>
                                        <div class="space-y-2">
                                            ${well.completion.tubing.map(t => `
                                                <div class="p-4 rounded-lg ${t.isProblem ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : 'bg-slate-50 dark:bg-slate-800 border-l-4 border-blue-300'}">
                                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Type:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${t.type}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Size:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${t.size}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Top Depth:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${t.top.toLocaleString()}ft</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Bottom Depth:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${t.bottom.toLocaleString()}ft</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <!-- Equipment -->
                                    <div class="mb-6">
                                        <h5 class="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-100">Downhole Equipment</h5>
                                        <div class="space-y-2">
                                            ${well.completion.equipment.map(e => `
                                                <div class="p-4 rounded-lg ${e.isProblem ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : e.comments && e.comments.includes('Restored') ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : 'bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-300'}">
                                                    <div class="flex justify-between items-start">
                                                        <div class="flex-1">
                                                            <div class="font-semibold text-slate-900 dark:text-slate-100">${e.item}</div>
                                                            <div class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                Depth: <span class="font-mono">${e.top ? e.top.toLocaleString() : 'N/A'}ft</span>
                                                            </div>
                                                            ${e.comments ? `<div class="text-sm mt-2 text-slate-700 dark:text-slate-300">${e.comments}</div>` : ''}
                                                        </div>
                                                        ${e.isProblem ? '<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' : ''}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <!-- Perforations -->
                                    <div>
                                        <h5 class="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-100">Perforations</h5>
                                        <div class="space-y-2">
                                            ${well.completion.perforations.map((p, idx) => `
                                                <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                                                    <div class="grid grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Interval:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">#${idx + 1}</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Top:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${p.top.toLocaleString()}ft</span>
                                                        </div>
                                                        <div>
                                                            <span class="font-semibold block text-slate-600 dark:text-slate-400">Bottom:</span>
                                                            <span class="text-slate-900 dark:text-slate-100">${p.bottom.toLocaleString()}ft</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for expand/collapse
        document.querySelectorAll('.toggle-card-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const wellId = this.dataset.wellId;
                const content = document.querySelector(`.card-expandable-content[data-well-id="${wellId}"]`);
                const icon = this.querySelector('.expand-icon');

                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    content.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });

        // Add event listeners for tab switching
        document.querySelectorAll('.well-detail-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const wellId = this.dataset.wellId;
                const tabName = this.dataset.tab;

                // Update active tab
                document.querySelectorAll(`.well-detail-tab[data-well-id="${wellId}"]`).forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Update visible pane
                document.querySelectorAll(`.tab-pane[data-well-id="${wellId}"]`).forEach(pane => pane.classList.add('hidden'));
                document.querySelector(`.tab-pane[data-well-id="${wellId}"][data-tab-content="${tabName}"]`).classList.remove('hidden');
            });
        });
    };

    // --- INITIALIZATION ---

    const init = async () => {
        // Load comprehensive well data first
        await initializeWellData();

        // Render UI components
        renderHomeWellCards();
        renderWellCards(); // Render planner well cards
        renderObjectives();
        renderProblems();
        initSavingsChart();
        updateNavLinks();

        // Wire up navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = link.id.replace('-nav-link', '');
                if (!link.classList.contains('disabled')) {
                    switchView(viewName);
                    window.location.hash = `#${viewName}-view`;
                }
            });
        });

        // Wire up hero "Try the Planner" button
        const heroPlannerBtn = document.getElementById('hero-planner-btn');
        if (heroPlannerBtn) {
            heroPlannerBtn.addEventListener('click', () => {
                switchView('planner');
                window.location.hash = '#planner-view';
            });
        }

        // Handle browser back/forward with hash navigation
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1); // Remove the #
            if (hash) {
                const viewName = hash.replace('-view', '');
                const navLink = document.getElementById(`${viewName}-nav-link`);
                if (navLink && !navLink.classList.contains('disabled')) {
                    switchView(viewName);
                }
            }
        });

        // Handle initial hash on page load
        if (window.location.hash) {
            const hash = window.location.hash.slice(1);
            const viewName = hash.replace('-view', '');
            const navLink = document.getElementById(`${viewName}-nav-link`);
            if (navLink && !navLink.classList.contains('disabled')) {
                switchView(viewName);
            }
        }
    };

    init();
});

// --- PDF EXPORT SYSTEM (Global scope for onclick) ---

async function generatePDFReport() {
    const button = event.target;
    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML = '<span class="pdf-spinner"></span> Generating PDF...';
    button.classList.add('pdf-generating');

    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            throw new Error('PDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;

        // --- COVER PAGE ---
        pdf.setFillColor(37, 99, 235); // Blue background
        pdf.rect(0, 0, pageWidth, 80, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(32);
        pdf.setFont(undefined, 'bold');
        pdf.text('Well-Tegra', pageWidth / 2, 35, { align: 'center' });

        pdf.setFontSize(20);
        pdf.text('Well Intervention Close-Out Report', pageWidth / 2, 50, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('Generated: ' + new Date().toLocaleDateString(), pageWidth / 2, 65, { align: 'center' });

        yPosition = 100;
        pdf.setTextColor(0, 0, 0);

        // --- EXECUTIVE SUMMARY ---
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('Executive Summary', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        const summaryText = 'This report provides a comprehensive analysis of the well intervention campaign, including operational performance, financial impact, vendor evaluation, and key learnings.';
        const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
        pdf.text(splitSummary, margin, yPosition);
        yPosition += splitSummary.length * 5 + 10;

        // --- KEY PERFORMANCE INDICATORS ---
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text('Key Performance Indicators', margin, yPosition);
        yPosition += 8;

        const kpis = [
            { label: 'Total Cost Savings', value: '$2,847,000', color: [34, 197, 94] },
            { label: 'Time Saved', value: '18.5 days', color: [59, 130, 246] },
            { label: 'NPT Avoided', value: '12.3 days', color: [168, 85, 247] },
            { label: 'Well Integrity', value: '100%', color: [34, 197, 94] },
            { label: 'Safety Record', value: 'Zero incidents', color: [34, 197, 94] }
        ];

        kpis.forEach(kpi => {
            pdf.setFillColor(249, 250, 251);
            pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 10, 2, 2, 'F');

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(75, 85, 99);
            pdf.text(kpi.label, margin + 3, yPosition + 6);

            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(...kpi.color);
            pdf.text(kpi.value, pageWidth - margin - 3, yPosition + 6, { align: 'right' });

            yPosition += 12;
        });

        yPosition += 5;

        // --- VENDOR PERFORMANCE ---
        if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Vendor Performance Scorecard', margin, yPosition);
        yPosition += 8;

        const vendorMetrics = [
            { metric: 'On-Time Delivery', score: '95%', rating: '★★★★★' },
            { metric: 'Equipment Quality', score: '88%', rating: '★★★★☆' },
            { metric: 'Technical Support', score: '92%', rating: '★★★★★' },
            { metric: 'Cost Competitiveness', score: '78%', rating: '★★★★☆' },
            { metric: 'Safety Record', score: '98%', rating: '★★★★★' },
            { metric: 'Responsiveness', score: '85%', rating: '★★★★☆' }
        ];

        // Table header
        pdf.setFillColor(37, 99, 235);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Metric', margin + 3, yPosition + 5);
        pdf.text('Score', margin + 100, yPosition + 5);
        pdf.text('Rating', margin + 130, yPosition + 5);
        yPosition += 8;

        // Table rows
        pdf.setTextColor(0, 0, 0);
        vendorMetrics.forEach((item, index) => {
            if (index % 2 === 0) {
                pdf.setFillColor(249, 250, 251);
                pdf.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
            }

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            pdf.text(item.metric, margin + 3, yPosition + 5);
            pdf.text(item.score, margin + 100, yPosition + 5);
            pdf.text(item.rating, margin + 130, yPosition + 5);
            yPosition += 7;
        });

        yPosition += 5;

        // Overall rating
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text('Overall Vendor Rating: 4.2/5.0 ★★★★☆', margin, yPosition);
        yPosition += 8;

        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Recommendation: Excellent performance. Continue partnership.', margin, yPosition);

        // --- FOOTER ---
        const addFooter = (pageNum) => {
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Well-Tegra | Confidential', margin, pageHeight - 10);
            pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        addFooter(1);

        // --- SAVE PDF ---
        const fileName = `WellTegra_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        // Success feedback
        button.innerHTML = '✓ PDF Downloaded!';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('pdf-generating');
        }, 3000);

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please try again.');
        button.innerHTML = originalText;
        button.classList.remove('pdf-generating');
    }
}

/* ========================================
   TOOL STRING VIEWER & EQUIPMENT CATALOG
   ======================================== */

// Tool String Management
let savedToolStrings = [];
let builderComponents = [];

// Load saved tool strings from localStorage
function loadSavedToolStrings() {
    const saved = localStorage.getItem('welltegra_toolstrings');
    savedToolStrings = saved ? JSON.parse(saved) : [];
    renderSavedToolStrings();
}

// Save tool strings to localStorage
function saveToolStringsToStorage() {
    localStorage.setItem('welltegra_toolstrings', JSON.stringify(savedToolStrings));
}

// Switch between tabs
function switchEquipmentTab(tabName) {
    // Guard clause: check if equipment tabs exist
    const equipmentTabs = document.querySelectorAll('.equipment-tab');
    if (equipmentTabs.length === 0) {
        console.log('[Equipment Tabs] Equipment catalog UI not available');
        return;
    }

    // Update tab buttons
    equipmentTabs.forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('active', isActive);
        tab.style.color = isActive ? '#14b8a6' : '#94a3b8';
        tab.style.borderBottomColor = isActive ? '#14b8a6' : 'transparent';
    });

    // Update tab content
    document.querySelectorAll('.equipment-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Refresh content if needed
    if (tabName === 'historical') {
        renderHistoricalToolStrings();
    } else if (tabName === 'toolstrings') {
        renderSavedToolStrings();
    } else if (tabName === 'builder') {
        updateBuilderPreview();
    }
}

// Extract and render historical tool strings from selected well
function renderHistoricalToolStrings() {
    const list = document.getElementById('historical-toolstrings-list');
    const empty = document.getElementById('empty-historical');

    // Guard clause: if elements don't exist (removed from DOM), exit gracefully
    if (!list || !empty) {
        console.log('[Tool Strings] Historical tool strings UI not available');
        return;
    }

    if (!appState.selectedWell) {
        list.innerHTML = '';
        list.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    const well = wellData.find(w => w.id === appState.selectedWell);
    if (!well || !well.dailyReports || well.dailyReports.length === 0) {
        list.innerHTML = '';
        list.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    empty.classList.add('hidden');

    // Extract unique tool strings from daily reports
    const toolStrings = well.dailyReports.map((report, index) => ({
        id: `hist-${well.id}-${index}`,
        date: report.date,
        summary: report.summary,
        components: report.toolstringRun,
        wellName: well.name
    }));

    list.innerHTML = toolStrings.map(ts => `
        <div class="p-6 mb-4 rounded-lg border-2 border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-blue-900/10">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h4 class="text-lg font-bold text-cyan-400">${escapeHtml(ts.summary)}</h4>
                    <p class="text-sm text-gray-400 mt-1">Date: ${escapeHtml(ts.date)} | Well: ${escapeHtml(ts.wellName)}</p>
                </div>
                <button onclick='loadHistoricalToolString(${JSON.stringify(ts).replace(/'/g, "\\'")})'
                        class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors">
                    Load into Builder
                </button>
            </div>
            <div class="border-l-4 border-cyan-500 pl-4">
                <p class="text-xs font-semibold text-gray-300 mb-2">Tool String Components:</p>
                <ul class="space-y-1">
                    ${ts.components.map((comp, idx) => `
                        <li class="text-sm text-gray-300">
                            <span class="text-cyan-400 font-mono">${idx + 1}.</span> ${escapeHtml(comp)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

// Load historical tool string into builder
function loadHistoricalToolString(toolString) {
    // Switch to builder tab
    switchEquipmentTab('builder');

    // Populate the builder
    document.getElementById('new-toolstring-name').value = `${toolString.summary} (from ${toolString.date})`;

    // Add components to textarea
    const textarea = document.getElementById('toolstring-components-input');
    textarea.value = toolString.components.join('\n');

    // Update preview
    updateBuilderPreview();

    // Show success message
    showToast(`Loaded historical tool string: ${toolString.summary}`);
}

// Render saved tool strings
function renderSavedToolStrings() {
    const list = document.getElementById('saved-toolstrings-list');
    const empty = document.getElementById('empty-toolstrings');

    // Guard clause: if elements don't exist (removed from DOM), exit gracefully
    if (!list || !empty) {
        console.log('[Tool Strings] Saved tool strings UI not available');
        return;
    }

    if (savedToolStrings.length === 0) {
        list.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    empty.classList.add('hidden');

    list.innerHTML = savedToolStrings.map((toolString, index) => `
        <div class="p-6 mb-4 rounded-lg border-2 border-teal-500 bg-gradient-to-br from-teal-900/20 to-emerald-900/10">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h4 class="text-lg font-bold text-teal-400">${escapeHtml(toolString.name)}</h4>
                    <div class="mt-1 flex items-center gap-2">
                        <span class="px-2 py-1 bg-teal-600 text-white text-xs font-bold rounded">${escapeHtml(toolString.serviceLine)}</span>
                        <span class="text-xs text-gray-400">Created: ${new Date(toolString.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="useToolString(${index})"
                            class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors">
                        Use
                    </button>
                    <button onclick="deleteToolString(${index})"
                            class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md transition-colors">
                        Delete
                    </button>
                </div>
            </div>
            <div class="border-l-4 border-teal-500 pl-4">
                <p class="text-xs font-semibold text-gray-300 mb-2">Components:</p>
                <ul class="space-y-1">
                    ${toolString.components.map((comp, idx) => `
                        <li class="text-sm text-gray-300">
                            <span class="text-teal-400 font-mono">${idx + 1}.</span> ${escapeHtml(comp)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

// Update builder preview
function updateBuilderPreview() {
    const nameInput = document.getElementById('new-toolstring-name');
    const textarea = document.getElementById('toolstring-components-input');
    const previewName = document.getElementById('preview-name');
    const componentsList = document.getElementById('builder-components-list');

    // Guard clause: if builder elements don't exist, exit gracefully
    if (!nameInput || !textarea || !previewName || !componentsList) {
        console.log('[Tool String Builder] Builder UI not available');
        return;
    }

    previewName.textContent = nameInput.value || 'Untitled Assembly';

    // Parse components from textarea
    const components = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (components.length === 0) {
        componentsList.textContent = '';
        const li = document.createElement('li');
        li.className = 'text-gray-500 italic';
        li.textContent = 'No components added yet';
        componentsList.appendChild(li);
    } else {
        componentsList.innerHTML = components.map((comp, index) => `
            <li class="text-sm text-gray-300 py-1 border-l-3 border-cyan-500 pl-3">
                ${index + 1}. ${escapeHtml(comp)}
            </li>
        `).join('');
    }

    // Update live as user types
    if (nameInput) {
        nameInput.addEventListener('input', updateBuilderPreview);
    }
    if (textarea) {
        textarea.addEventListener('input', updateBuilderPreview);
    }
}

// Save tool string
function saveToolString() {
    const nameInput = document.getElementById('new-toolstring-name');
    const serviceSelect = document.getElementById('new-toolstring-service');
    const textarea = document.getElementById('toolstring-components-input');

    if (!nameInput.value.trim()) {
        alert('Please enter a name for the tool string');
        return;
    }

    const components = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (components.length === 0) {
        alert('Please add at least one component to the tool string');
        return;
    }

    const newToolString = {
        id: Date.now().toString(),
        name: nameInput.value.trim(),
        serviceLine: serviceSelect.value,
        components: components,
        createdAt: new Date().toISOString()
    };

    savedToolStrings.push(newToolString);
    saveToolStringsToStorage();

    // Reset builder
    nameInput.value = '';
    textarea.value = '';
    updateBuilderPreview();

    // Switch to tool strings tab
    switchEquipmentTab('toolstrings');

    showToast(`Tool string "${newToolString.name}" saved successfully!`);
}

// Use saved tool string
function useToolString(index) {
    const toolString = savedToolStrings[index];
    if (!toolString) return;

    // Switch to builder and populate
    switchEquipmentTab('builder');

    document.getElementById('new-toolstring-name').value = `${toolString.name} (Copy)`;
    document.getElementById('new-toolstring-service').value = toolString.serviceLine;
    document.getElementById('toolstring-components-input').value = toolString.components.join('\n');

    updateBuilderPreview();
    showToast(`Loaded tool string: ${toolString.name}`);
}

// Delete tool string
function deleteToolString(index) {
    if (confirm('Are you sure you want to delete this tool string?')) {
        const toolString = savedToolStrings[index];
        savedToolStrings.splice(index, 1);
        saveToolStringsToStorage();
        renderSavedToolStrings();
        showToast(`Deleted tool string: ${toolString.name}`);
    }
}

// Simple toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize tool string viewer when well is selected
const originalSelectWell = window.selectWell || function() {};
window.selectWell = function(wellId) {
    originalSelectWell(wellId);
    // Refresh historical tool strings when a well is selected
    setTimeout(() => renderHistoricalToolStrings(), 100);
};

// Load saved tool strings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedToolStrings();
});

