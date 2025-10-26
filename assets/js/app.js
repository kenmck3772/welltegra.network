document.addEventListener('DOMContentLoaded', function() {
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

        container.innerHTML = `
            <div class="relative" style="width:${size}px; height:${size}px;">
                <svg class="w-full h-full" viewBox="0 0 ${size} ${size}">
                    <circle class="gauge-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"></circle>
                    <circle class="gauge-fg stroke-normal" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
                            style="transition: stroke-dashoffset 0.5s;"></circle>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="gauge-value text-2xl font-bold gauge-text text-normal">0</span>
                    <span class="gauge-units text-xs text-slate-400">${units}</span>
                </div>
            </div>
            <h4 class="mt-2 text-sm font-semibold text-slate-300">${label}</h4>
        `;
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
        container.innerHTML = `
            <h4 class="text-sm font-semibold text-slate-300">${label}</h4>
            <div class="w-full bar-bg rounded-full h-2.5 my-2">
                <div class="bar-fg bg-normal h-2.5 rounded-full" style="width: 0%"></div>
            </div>
            <div class="text-center">
                <span class="bar-value text-2xl font-bold gauge-text text-normal">0</span>
                <span class="bar-units text-xs text-slate-400">${units}</span>
            </div>
        `;
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

    // --- DATA STORE (REWRITTEN FOR NARRATIVE) ---
    const wellData = [
        { 
            id: 'W666', 
            name: 'The Perfect Storm',
            field: 'Montrose', 
            region: 'UKCS', 
            type: 'HPHT Gas Condensate', 
            depth: '18,500ft', 
            status: 'Shut-in - Well Integrity Issues', 
            issue: 'A nightmare well with multiple, compounding failures: severe casing deformation, a hard scale blockage, and a failed primary safety valve. Requires a complex, multi-stage intervention plan.', 
            history: [ 
                { date: '2024-03-15', operation: 'Slickline Surveillance', problem: 'Unable to pass 8,500ft due to casing restriction.', lesson: 'This well combines multiple known failure modes from this field into a single asset.' },
                { date: '2024-04-01', operation: 'Production Test', problem: 'Well died after brief flow period. Pressure analysis suggests deep blockage.', lesson: 'Suspect combination of scale and integrity issues.' },
                { date: '2024-04-10', operation: 'DHSV Test', problem: 'TRSSV failed to close on command. Well shut-in on annulus valves.', lesson: 'Well integrity is critically compromised.' }
            ], 
            dailyReports: [], 
            completion: { 
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 18500, isProblem: true}], 
                tubing: [{type: 'Production', size: '4 1/2', top: 0, bottom: 18300}], 
                equipment: [
                    {item: 'SSSV', top: 2500, comments: 'Failed test', isProblem: true}, 
                    {item: 'Casing Deformation', top: 8500, comments: 'Severe Ovalization', isProblem: true},
                    {item: 'BaSO4 Scale Bridge', top: 14200, comments: 'Solid blockage', isProblem: true},
                    {item: 'Packer', top: 18250}
                ], 
                perforations: [{top: 18350, bottom: 18450}] 
            } 
        },
        { 
            id: 'M-21', 
            name: 'CASE STUDY: The Montrose Squeeze', 
            field: 'Montrose', 
            region: 'UKCS', 
            type: 'HPHT Gas Condensate', 
            depth: '9,000ft', 
            status: 'Active - Restored Production', 
            issue: 'SOLUTION: Casing deformation was successfully remediated with an expandable patch.', 
            history: [ 
                { date: '2023-11-10', operation: 'Slickline Surveillance', problem: 'Standard 2.313" OD toolstring unable to pass 8,500ft, encountering a hard stop.', lesson: 'Significant reservoir depletion in this area is causing geomechanical stresses leading to casing deformation, a known regional risk. MFC log confirms this is ovalization, not collapse.' },
                { date: '2023-12-05', operation: 'Expandable Casing Patch', problem: 'Successfully installed a 60ft expandable steel patch across the deformed section.', lesson: 'This operation proves that an expandable patch is a viable, rigless solution for restoring full-bore access in this field, restoring production and well access.' }
            ], 
            dailyReports: [], 
            completion: { 
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 9000}], 
                tubing: [{type: 'Production', size: '4 1/2', top: 0, bottom: 8800}], 
                equipment: [
                    {item: 'SSSV', top: 1500}, 
                    {item: 'Tubing Patch', top: 8500, comments: 'Restored ID'},
                    {item: 'Packer', top: 8750}
                ], 
                perforations: [{top: 8850, bottom: 8950}] 
            } 
        },
        { 
            id: 'S-15', 
            name: 'CASE STUDY: The Scale Trap', 
            field: 'Montrose', 
            region: 'UKCS', 
            type: 'HPHT Gas Condensate', 
            depth: '11,000ft', 
            status: 'Active - Restored Production', 
            issue: 'SOLUTION: Severe BaSO4 scale was successfully removed with a chemical/jetting treatment.', 
            history: [ 
                { date: '2024-01-05', operation: 'Production Logging', problem: 'PLT toolstring unable to pass 9,200ft due to a hard obstruction. Produced water analysis confirmed high Barium and Sulfate content.', lesson: 'Commingling of injected seawater and formation water is causing severe, insoluble scale deposition. A previous attempt to mill scale on a nearby well resulted in stuck pipe.'},
                { date: '2024-02-12', operation: 'CT Chemical/Jetting', problem: 'A 48hr soak with DTPA dissolver followed by a run with a high-pressure rotating jetting tool successfully cleared the blockage.', lesson: 'This two-stage approach is a proven, lower-risk method for removing hard scale compared to aggressive milling.' }
            ], 
            dailyReports: [], 
            completion: { 
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 11000}], 
                tubing: [{type: 'Production', size: '4 1/2', top: 0, bottom: 10800}], 
                equipment: [{item: 'SSSV', top: 1800}, {item: 'Packer', top: 10750}], 
                perforations: [{top: 10850, bottom: 10950}] 
            } 
        },
        { 
            id: 'F-11', 
            name: 'CASE STUDY: The Broken Barrier', 
            field: 'Montrose', 
            region: 'UKCS', 
            type: 'HPHT Gas Condensate', 
            depth: '9,800ft', 
            status: 'Active - Restored Production', 
            issue: 'SOLUTION: Failed TRSSV was locked open and replaced with a slickline-retrievable insert valve.', 
            history: [ 
                { date: '2024-02-18', operation: 'Routine DHSV Test', problem: 'Valve failed to close reliably during routine 6-month test. Well was mandatorily shut-in by regulatory authority.', lesson: 'An attempted repair on a similar well with a hydraulic tool failed; a mechanical lock-open tool is more reliable.' },
                { date: '2024-03-20', operation: 'Slickline Insert Valve Job', problem: 'Successfully locked open the failed valve with a mechanical tool and installed a new wireline-retrievable insert valve.', lesson: 'This standard slickline operation is a proven, cost-effective method for restoring the primary safety barrier without a rig.' }
            ], 
            dailyReports: [], 
            completion: { 
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 9800}], 
                tubing: [{type: 'Production', size: '4 1/2', top: 0, bottom: 9600}], 
                equipment: [{item: 'SSSV', top: 1500, comments: 'New Insert Valve'}, {item: 'Packer', top: 9550}], 
                perforations: [{top: 9650, bottom: 9750}] 
            } 
        },
        { 
            id: 'C-08', 
            name: 'CASE STUDY: The Sandstorm', 
            field: 'Montrose', 
            region: 'UKCS', 
            type: 'HPHT Gas Condensate', 
            depth: '10,000ft', 
            status: 'Active - Restored Production', 
            issue: 'SOLUTION: Failed sand screen was repaired with a through-tubing patch.', 
            history: [ 
                { date: '2023-08-15', operation: 'Surface Choke Replacement', problem: 'Replaced choke for the 3rd time in 6 months due to severe erosional wear from high sand content.', lesson: 'Choking back the well is a temporary fix; the root cause of sand control failure must be addressed. Downhole video confirmed screen erosion.' },
                { date: '2023-09-10', operation: 'Through-Tubing Patch', problem: 'Successfully installed an expandable patch across the failed sand screen, restoring sand control.', lesson: 'This confirms that a through-tubing patch is a viable rigless repair for this failure mode in this field.'}
            ], 
            dailyReports: [], 
            completion: { 
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 10000}], 
                tubing: [{type: 'Production', size: '4 1/2', top: 0, bottom: 9800}], 
                equipment: [{item: 'SSSV', top: 1600}, {item: 'Packer', top: 9750}, {item: 'Standalone Sand Screen', top: 9850, comments: 'Patched'}], 
                perforations: [{top: 9850, bottom: 9950}] 
            } 
        },
        {
            id: 'P-12',
            name: 'CASE STUDY: The Wax Plug',
            field: 'Piper',
            region: 'UKCS',
            type: 'Oil Producer',
            depth: '7,500ft',
            status: 'Active - Restored Production',
            issue: 'SOLUTION: Severe paraffin wax blockage was cleared using CT with a chemical/mechanical approach.',
            history: [
                { date: '2024-01-15', operation: 'Slickline Gauge Ring Run', problem: 'Gauge ring tagged a soft, waxy obstruction at 6,000ft. Unable to pass.', lesson: 'A previous attempt on another well with only chemicals was slow and ineffective; a combined approach is needed.' },
                { date: '2024-02-01', operation: 'CT Wax Cleanout', problem: 'Successfully removed wax blockage using a combination of heated chemical dissolvers and a mechanical scraper tool on Coiled Tubing.', lesson: 'The dual chemical/mechanical approach is highly effective for severe paraffin blockages.' }
            ],
            dailyReports: [],
            completion: {
                casing: [{type: 'Production', size: '7', top: 0, bottom: 7500}],
                tubing: [{type: 'Production', size: '3 1/2', top: 0, bottom: 7300}],
                equipment: [{item: 'SSSV', top: 1200}, {item: 'Packer', top: 7250}],
                perforations: [{top: 7350, bottom: 7450}]
            }
        },
        {
            id: 'S-77',
            name: 'CASE STUDY: Field of Dreams',
            field: 'Schiehallion',
            region: 'UKCS',
            type: 'HPHT Oil Producer',
            depth: '19,200ft',
            status: 'Active - Peak Performance',
            issue: 'SOLUTION: Multi-barrier failure resolution - Combined lessons from all interventions delivered exceptional results.',
            history: [
                { date: '2023-08-20', operation: 'Complex Multi-Stage Intervention', problem: 'Well experiencing compound failures: partial casing restriction, minor scale buildup, aging safety systems, and intermittent sand production.', lesson: 'This well demonstrated that multiple smaller issues, if left unaddressed, compound into major operational challenges requiring comprehensive intervention planning.' },
                { date: '2023-09-15', operation: 'Integrated Solution Deployment', problem: 'Successfully executed a staged intervention combining expandable patch technology, chemical scale treatment, safety valve replacement, and sand control installation - all in a single campaign.', lesson: 'Integrated multi-discipline approach saved 45 days vs. sequential interventions. This became the blueprint for tackling W666.' },
                { date: '2023-10-01', operation: 'Post-Intervention Performance', problem: 'Well exceeded pre-intervention production by 180%, with zero NPT and full barrier integrity restored.', lesson: 'Proves that comprehensive planning and execution of multiple remediation strategies simultaneously is not only feasible but highly effective. This success story directly informed the W666 intervention strategy.' }
            ],
            dailyReports: [],
            completion: {
                casing: [{type: 'Production', size: '9 5/8', top: 0, bottom: 19200}],
                tubing: [{type: 'Production', size: '5 1/2', top: 0, bottom: 19000}],
                equipment: [
                    {item: 'SSSV', top: 2800, comments: 'Replaced - Now Operational'},
                    {item: 'Expandable Patch', top: 9200, comments: 'Successfully Installed'},
                    {item: 'Sand Screen', top: 17500, comments: 'Through-Tubing Installation'},
                    {item: 'Packer', top: 18950}
                ],
                perforations: [{top: 19050, bottom: 19150}]
            }
        },
    ];
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
            { objectiveId: 'obj1', confidence: 95, outcome: 'Full-bore access restored', reason: 'Historical analysis of case study <strong>M-21 (The Montrose Squeeze)</strong> confirms an expandable steel patch is the standard, high-success-rate rigless solution for this specific failure mode in this field.' } 
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
    const programSectionTemplates = [
        {
            id: 'dataIntake',
            title: '1. Data Intake & Validation',
            templateChecklist: [
                'Collect all structured files (schematics, cost trackers, survey exports) and upload through the LangExtract intake workspace.',
                'Normalize filenames, metadata, and key-value fields using the W66x parsing ruleset before unlocking design tasks.',
                'Confirm mandatory attributes (well name, latest integrity status, last intervention date) are populated in the scrubbed dataset.'
            ]
        },
        {
            id: 'design',
            title: '2. Detailed Design & Engineering',
            templateChecklist: [
                'Validate well trajectory, completion schematic, and pressure envelopes from the approved master data set.',
                'Select the intervention objective and verify engineering calculations (loads, volumes, hydraulics) meet company standards.',
                'Align cost codes and success criteria with the project charter before final design sign-off.'
            ]
        },
        {
            id: 'execution',
            title: '3. Execution Program & Procedures',
            templateChecklist: [
                'Break the intervention into phased operations with measurable acceptance criteria.',
                'Reference the approved equipment catalogue for tool selection and dimensional control.',
                'Embed contingency triggers and hold points that map to the risk register.'
            ]
        },
        {
            id: 'logistics',
            title: '4. Logistics, Costing & Cost Codes',
            templateChecklist: [
                'Cross-check equipment availability, certification status, and transit timing against the logistics workspace.',
                'Populate personnel roster with competency validation and travel plans.',
                'Assign corporate cost codes with daily cost estimates for budget governance.'
            ]
        },
        {
            id: 'risk',
            title: '5. Risk, HSE & Contingency Planning',
            templateChecklist: [
                'Review risk register entries and ensure each has an owner, response plan, and escalation contact.',
                'Confirm permits-to-work, SIMOPS constraints, and barrier health status before execution.',
                'Document contingency equipment/personnel mobilization paths for high-impact scenarios.'
            ]
        },
        {
            id: 'handover',
            title: '6. Handover, Reporting & Lessons Learned',
            templateChecklist: [
                'Capture operational metrics (time vs. depth, spend vs. AFE, NPT) for the final report package.',
                'Compile lessons learned, vendor scorecards, and barrier compliance sign-off.',
                'Schedule the multi-discipline close-out review and archive artefacts to the knowledge base.'
            ]
        }
    ];
    const programDossiers = {
        obj1: {
            dataIntake: {
                uniqueHighlights: [
                    'Include the April 2024 multi-finger caliper CSV (W666_MFC_2024-04-12.csv) that quantifies the 8,480–8,540 ft restriction.',
                    'Attach LangExtract QA summary showing 100% field coverage for casing deformation attributes.',
                    'Pull expandable patch vendor run history from case study M-21 to demonstrate proven metallurgy for HPHT service.'
                ],
                documents: [
                    'LangExtract_Report_W666_Structural.json',
                    'VendorQualification_ExpandablePatch_M21.pdf'
                ]
            },
            design: {
                uniqueHighlights: [
                    'Patch length locked at 60 ft to span the ovalised interval with 10 ft overlap above and below.',
                    'Expansion pressure verified at 9,800 psi against 9 5/8" 53.5# casing to avoid burst risk.',
                    'Thermal expansion model updated to reflect HPHT shut-in temperature of 285°C.'
                ],
                costCodes: [
                    { code: 'INT-W666-PATCH-ENG', description: 'Engineering review & simulations', estimate: 45000 },
                    { code: 'INT-W666-PATCH-TOOLS', description: 'Expandable patch hardware & deployment kit', estimate: 520000 }
                ]
            },
            execution: {
                uniqueHighlights: [
                    'Phase 1 clean-out requires 2 slickline runs with 2.125" gauge cutter to confirm drift prior to HWU rig-up.',
                    'HWU deployment scheduled as 24 hr operation with continuous monitoring of hookload vs. modeled TFA curves.',
                    'Pressure test hold point at 5,000 psi for 30 minutes prior to handing back to production operations.'
                ],
                watchItems: [
                    'Potential for debris accumulation above patch causing overpull; stage swabbing equipment on deck.',
                    'Annulus pressure monitoring must remain within 50 psi of model; exceedance triggers barrier management call.',
                    'If expansion delta-P falls below 8,500 psi, halt and investigate hydraulic system losses.'
                ]
            },
            logistics: {
                uniqueHighlights: [
                    'HWU spread to sail from Aberdeen base with 48 hr weather window; vessel slot confirmed with marine logistics.',
                    'Expandable patch kit staged at quayside rack B12 with humidity-controlled storage.',
                    'Wireline contingency crew on 12 hr call-out to support clean-up post expansion.'
                ],
                costCodes: [
                    { code: 'LOG-W666-HWU-MOB', description: 'HWU mobilization & demob', estimate: 180000 },
                    { code: 'LOG-W666-VESSEL', description: 'Marine spread day rate (3 days firm)', estimate: 210000 }
                ]
            },
            risk: {
                uniqueHighlights: [
                    'Primary risk remains casing failure during expansion—maintain slow pump ramp and real-time strain trending.',
                    'SIMOPS conflict with production chemical dosing schedule resolved via night shift window.',
                    'Barrier diagram updated to reflect temporary lock-open status of the TRSSV during HWU operations.'
                ],
                watchItems: [
                    'Issue contingency plan W666-CAS-01 if strain gauge exceeds 80% limit.',
                    'Hold sand clean-out package on standby should debris settle above patch.',
                    'Escalate to drilling manager if annulus pressure rises >150 psi during expansion.'
                ]
            },
            handover: {
                uniqueHighlights: [
                    'Capture final caliper log to confirm restored ID of 2.441" minimum.',
                    'Document HWU performance curve vs. model as benchmarking input for future expansions.',
                    'Log lessons around vendor torque-turn monitoring and share with completions community.'
                ],
                deliverables: [
                    'As-built expandable patch schematic with depth correlation.',
                    'Barrier restoration certificate signed by Well Examiner.',
                    'Updated digital twin inputs uploaded to Well-Tegra knowledge base.'
                ]
            }
        },
        obj2: {
            dataIntake: {
                uniqueHighlights: [
                    'Load produced water chemistry logs highlighting elevated BaSO4 risk factors (Sample_W666_2024-03-22.xlsx).',
                    'LangExtract ingestion flagged missing tubing roughness coefficients—manual entry completed 2024-04-05.',
                    'Import CT string tally from vendor to cross-check against wax removal operations.'
                ],
                documents: [
                    'ScaleDiagnostics_W666_Q1-2024.pdf',
                    'LangExtract_QA_W666_Scale.json'
                ]
            },
            design: {
                uniqueHighlights: [
                    'Chemical soak volume set at 2,400 gal 28% DTPA with corrosion inhibitor blend validated by lab report 24-017.',
                    'Jetting nozzle selection based on 8,000 psi circulating pressure and 3/16" orifice combination.',
                    'Hydraulics model updated with friction factors from 2024 caliper data to avoid exceeding tubing MAOP.'
                ],
                costCodes: [
                    { code: 'INT-W666-SCALE-CHEM', description: 'Chemical package & lab QA', estimate: 190000 },
                    { code: 'INT-W666-SCALE-CT', description: 'Coiled tubing unit & crew', estimate: 320000 }
                ]
            },
            execution: {
                uniqueHighlights: [
                    'Stage 1 chemical soak executed over 36 hrs with continuous annulus pressure monitoring.',
                    'Stage 2 jetting run limited to 40 fpm downward speed to prevent nozzle erosion.',
                    'Post-job slickline drift to verify 2.313" ID clearance before handover.'
                ],
                watchItems: [
                    'Monitor return pH and density; if below target, extend soak by 6 hrs.',
                    'Keep bullheading pressure under 6,500 psi to protect weak annulus barrier.',
                    'Deploy scale basket on surface to capture debris and avoid separator fouling.'
                ]
            },
            logistics: {
                uniqueHighlights: [
                    'CT reel weights exceed 70t—confirm crane lift plan and deck reinforcement (Structural memo STR-2024-11).',
                    'Chemical tote staging requires heated storage; allocate zone on deck C with spill containment.',
                    'Pump spread to mobilize two days early for pressure testing with offshore team.'
                ],
                costCodes: [
                    { code: 'LOG-W666-CHEM-SEA', description: 'Hazardous chemical transport & heating', estimate: 85000 },
                    { code: 'LOG-W666-CT-LOG', description: 'CT spread logistics & standby', estimate: 120000 }
                ]
            },
            risk: {
                uniqueHighlights: [
                    'Primary HSE focus on chemical handling—double-check PPE matrix and eyewash availability.',
                    'Lost circulation while jetting flagged as medium risk; contingency includes staged viscous pills.',
                    'Gas breakthrough while circulating requires immediate diversion to flare per procedure.'
                ],
                watchItems: [
                    'Trigger contingency plan W666-SCL-02 if return solids exceed 2 bbl/hr.',
                    'Deploy spill response team if tote temperature sensors fail.',
                    'Escalate to operations manager upon any MAASP exceedance.'
                ]
            },
            handover: {
                uniqueHighlights: [
                    'Compile before/after production test showing restored condensate rate (+165%).',
                    'Archive chemical batch certificates with QA signatures in the completions drive.',
                    'Share CT drag vs. model comparison for future scale removal jobs.'
                ],
                deliverables: [
                    'Updated tubing condition report with drift confirmation.',
                    'Chemical usage reconciliation spreadsheet for finance review.',
                    'Lessons learned entry covering soak duration optimization.'
                ]
            }
        },
        obj3: {
            dataIntake: {
                uniqueHighlights: [
                    'LangExtract scrub flagged missing valve function tests—added 2024-04-08 DHSV results.',
                    'Include vendor datasheet for target WRSV model (Size 3.813" XN profile).',
                    'Upload regulatory correspondence mandating barrier restoration timeline.'
                ],
                documents: [
                    'DHSV_Test_Log_W666_Apr2024.pdf',
                    'LangExtract_W666_Barrier.json'
                ]
            },
            design: {
                uniqueHighlights: [
                    'Lock-open tool shear value confirmed at 5,500 lbf to avoid accidental release.',
                    'Insert valve sized for 5,000 psi working pressure with ambient temperature factor 1.15.',
                    'Function test script aligned with regulatory checklist OGUK-DHSV-17.'
                ],
                costCodes: [
                    { code: 'INT-W666-DHSV-ENG', description: 'Barrier restoration engineering & assurance', estimate: 28000 },
                    { code: 'INT-W666-DHSV-VALVE', description: 'Insert safety valve hardware & accessories', estimate: 165000 }
                ]
            },
            execution: {
                uniqueHighlights: [
                    'Step 1 slickline run to mechanically lock open the failed valve with surface verification sign-off.',
                    'Step 2 run with new WRSV includes 12 hr nitrogen pressure hold before retrieving running tool.',
                    'Barrier verification performed with inflow test at 3,000 psi differential.'
                ],
                watchItems: [
                    'Confirm control line pressure remains stable within ±50 psi during install.',
                    'Have contingency insert valve available on deck in case of seal stack damage.',
                    'If drift check fails post-install, re-run with smaller gauge to diagnose restriction.'
                ]
            },
            logistics: {
                uniqueHighlights: [
                    'Wireline crew scheduled for 48 hr campaign with backup crew on 24 hr standby.',
                    'Insert valve shipping case stored in climate-controlled container to protect elastomers.',
                    'Pressure test equipment calibrated the week prior; certificate stored under QA# PT-5541.'
                ],
                costCodes: [
                    { code: 'LOG-W666-WL-MOB', description: 'Wireline spread mobilization', estimate: 60000 },
                    { code: 'LOG-W666-QA-TEST', description: 'Pressure test package & QA support', estimate: 35000 }
                ]
            },
            risk: {
                uniqueHighlights: [
                    'Barrier compliance is critical—any failed test triggers immediate operations manager notification.',
                    'Slickline operations performed under suspended production; SIMOPS ban in place for duration.',
                    'Track fatigue on slickline cable due to high tension runs—replace if >85% fatigue life reached.'
                ],
                watchItems: [
                    'If lock-open tool fails to set, switch to contingency hydraulic tool and notify completions lead.',
                    'Monitor for hydrate formation during inflow test; methanol contingency on standby.',
                    'Ensure BOP test remains valid; retest if operation exceeds 48 hrs.'
                ]
            },
            handover: {
                uniqueHighlights: [
                    'Submit updated barrier status report to regulator within 24 hrs of completion.',
                    'Record slickline depth correlation with composite log tie for future maintenance.',
                    'Document vendor performance rating for contractual KPIs.'
                ],
                deliverables: [
                    'Signed OGUK barrier verification checklist.',
                    'Function test charts appended to final report.',
                    'Updated well file in Well-Tegra with new valve serial number.'
                ]
            }
        },
        obj4: {
            dataIntake: {
                uniqueHighlights: [
                    'Integrate sand production logs from C-08 intervention to benchmark expected fines levels.',
                    'LangExtract scrub identifies missing gravel-pack data—manual entry completed 2024-03-29.',
                    'Capture ESS vendor compatibility statement for existing tubing ID.'
                ],
                documents: [
                    'SandControl_History_W666.pdf',
                    'LangExtract_W666_Sand.json'
                ]
            },
            design: {
                uniqueHighlights: [
                    'ESS length selected at 120 ft covering perforations 17,420–17,540 ft.',
                    'Expansion forces modeled to stay below tubing collapse envelope using vendor software.',
                    'Flowback choke schedule produced to manage fines during cleanup.'
                ],
                costCodes: [
                    { code: 'INT-W666-ESS-ENG', description: 'ESS engineering & modeling', estimate: 67000 },
                    { code: 'INT-W666-ESS-HARD', description: 'Expandable sand screen hardware', estimate: 740000 }
                ]
            },
            execution: {
                uniqueHighlights: [
                    'CT cleanout prior to ESS run uses dual-filter BHA to capture fines.',
                    'Expansion performed in three stages to manage axial loads.',
                    'Post-expansion flowback limited to 1.2 MMSCFD for 24 hrs before ramp-up.'
                ],
                watchItems: [
                    'Monitor torque and drag; if deviation >15% from model, pause and analyze.',
                    'Have gravel-pack squeezes on standby if ESS fails to seat.',
                    'Track sand cut at separator; escalate if >100 ppm after 12 hrs.'
                ]
            },
            logistics: {
                uniqueHighlights: [
                    'ESS kit shipped in temperature-controlled container; maintain below 30°C.',
                    'HWU availability aligned with obj1 schedule to optimize spread days.',
                    'Sand management package (cyclones & desanders) mobilized alongside main equipment.'
                ],
                costCodes: [
                    { code: 'LOG-W666-ESS-MOB', description: 'ESS logistics & handling', estimate: 160000 },
                    { code: 'LOG-W666-SAND-MGMT', description: 'Surface sand management equipment rental', estimate: 95000 }
                ]
            },
            risk: {
                uniqueHighlights: [
                    'Risk of screen damage during expansion mitigated with staged pressurization and vendor oversight.',
                    'SIMOPS with production inhibited; ensure methanol injection offline during cleanout.',
                    'Barrier plan accounts for packer integrity; verify with annulus pressure test prior to ESS run.'
                ],
                watchItems: [
                    'Keep emergency milling equipment on standby if ESS fails to collapse fully.',
                    'Escalate to completions superintendent if sand cut remains high beyond cleanup window.',
                    'Deploy acoustic monitoring to detect potential screen tearing.'
                ]
            },
            handover: {
                uniqueHighlights: [
                    'Provide production ramp-up guidance to reservoir team for fines management.',
                    'Archive expansion pressure charts for future ESS installs.',
                    'Log lesson learned on simultaneous CT/HWU resource sharing.'
                ],
                deliverables: [
                    'ESS post-job report with expansion summary.',
                    'Updated sand monitoring dashboard inputs.',
                    'Vendor performance evaluation worksheet.'
                ]
            }
        },
        obj5: {
            dataIntake: {
                uniqueHighlights: [
                    'Upload paraffin deposition trend charts from PI historian to quantify wax build-up rate.',
                    'LangExtract flagged missing CT mechanical scraper specs—added vendor sheet 2024-03-18.',
                    'Include ambient sea temperature data for thermal modeling.'
                ],
                documents: [
                    'WaxAnalysis_W666_Q1.csv',
                    'LangExtract_W666_Wax.json'
                ]
            },
            design: {
                uniqueHighlights: [
                    'Heated solvent blend sized for 1.5x tubing volume with recirculation to maintain 80°C downhole.',
                    'Scraper blades configured for 4.5" tubing with tungsten-carbide inserts for stubborn wax.',
                    'Thermal model ensures annulus pressure remains below 2,200 psi during heating cycle.'
                ],
                costCodes: [
                    { code: 'INT-W666-WAX-CHEM', description: 'Heated chemical package', estimate: 140000 },
                    { code: 'INT-W666-WAX-CT', description: 'Coiled tubing operations', estimate: 210000 }
                ]
            },
            execution: {
                uniqueHighlights: [
                    'Initial circulation with hot solvent for 6 hrs followed by scraper runs at 30 fpm.',
                    'Monitor tubing head temperature; maintain between 70–80°C for effective wax removal.',
                    'Final flush with inhibitor-laced condensate to delay future deposition.'
                ],
                watchItems: [
                    'Watch for rapid temperature drop indicating heater failure—trigger backup generator.',
                    'If scraper differential pressure spikes >500 psi, pull out and inspect blades.',
                    'Monitor VOC levels on deck; deploy gas detection alarms per HSE plan.'
                ]
            },
            logistics: {
                uniqueHighlights: [
                    'Heater unit requires 415V supply; electrical team to install temporary feed with load permit.',
                    'Chemical totes stored in heated ISO containers; verify thermostat redundancy.',
                    'CT crew shared with scale program—align schedules to avoid conflicts.'
                ],
                costCodes: [
                    { code: 'LOG-W666-WAX-HEAT', description: 'Heater package logistics & fuel', estimate: 65000 },
                    { code: 'LOG-W666-WAX-STBY', description: 'Standby allowance for CT crew overlap', estimate: 40000 }
                ]
            },
            risk: {
                uniqueHighlights: [
                    'Primary HSE risk is hot-fluid exposure—enforce exclusion zones and thermal PPE.',
                    'Potential for wax chunks to plug surface equipment; install inline strainers.',
                    'Heating cycle may disturb annulus pressure; monitor continuously.'
                ],
                watchItems: [
                    'Trigger contingency plan W666-WAX-03 if annulus pressure trend exceeds 100 psi rise.',
                    'Ensure chemical handling team follows hot-work permit with fire watch.',
                    'Escalate to operations manager upon detection of hydrocarbon vapor alarms.'
                ]
            },
            handover: {
                uniqueHighlights: [
                    'Deliver wax deposition forecast showing extended cleanout interval to 9 months.',
                    'Document heater performance and energy consumption for optimization.',
                    'Share inhibitor selection rationale with flow assurance engineers.'
                ],
                deliverables: [
                    'Wax removal job recap with before/after flowline pressures.',
                    'Updated flow assurance model inputs uploaded to central library.',
                    'Lessons learned note on thermal management best practices.'
                ]
            }
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
    const appContainer = document.getElementById('app-container');
    const views = document.querySelectorAll('.view-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerTitle = document.getElementById('header-title');
    const headerDetails = document.getElementById('header-details');
    const headerNav = document.getElementById('header-nav');
    const heroVideo = document.getElementById('hero-video');
    const heroVideoToggle = document.getElementById('hero-video-toggle');
    
    // Planner

    const stepIndicators = { 
        1: document.getElementById('step-1-indicator'), 
        2: document.getElementById('step-2-indicator'), 
        3: document.getElementById('step-3-indicator') 
    };
    
    const stepConnectors = {
        1: document.getElementById('step-1-connector'),
        2: document.getElementById('step-2-connector')
    };
    
    const stepSections = { 
        1: document.getElementById('step-1'), 
        2: document.getElementById('step-2'), 
        3: document.getElementById('step-3') 
    };
    
    const wellSelectionGrid = document.getElementById('well-selection-grid');
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
    
    const initializeHeroVideoToggle = () => {
        if (!heroVideo || !heroVideoToggle) return;

        const heroVideoToggleIcon = heroVideoToggle.querySelector('.hero-video-toggle-icon');
        const heroVideoToggleText = heroVideoToggle.querySelector('.hero-video-toggle-text');

        const updateToggleState = () => {
            const isPlaying = !heroVideo.paused && !heroVideo.ended;
            heroVideoToggle.setAttribute('aria-pressed', String(isPlaying));
            heroVideoToggle.dataset.state = isPlaying ? 'playing' : 'paused';

            if (heroVideoToggleText) {
                heroVideoToggleText.textContent = isPlaying ? 'Pause background video' : 'Play background video';
            } else {
                heroVideoToggle.textContent = isPlaying ? 'Pause background video' : 'Play background video';
            }

            if (heroVideoToggleIcon) {
                heroVideoToggleIcon.textContent = isPlaying ? '⏸' : '▶';
                heroVideoToggleIcon.dataset.state = isPlaying ? 'playing' : 'paused';
            }
        };

        const applyReducedMotionPreference = (prefersReducedMotion) => {
            if (prefersReducedMotion) {
                heroVideo.pause();
                heroVideo.autoplay = false;
                heroVideo.removeAttribute('autoplay');
                heroVideoToggle.setAttribute('data-reduced-motion', 'true');
            } else {
                heroVideoToggle.removeAttribute('data-reduced-motion');
            }

            updateToggleState();
        };

        const bindReducedMotionListener = () => {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                updateToggleState();
                return;
            }

            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const handlePreferenceChange = (event) => applyReducedMotionPreference(event.matches);

            applyReducedMotionPreference(motionQuery.matches);

            if (typeof motionQuery.addEventListener === 'function') {
                motionQuery.addEventListener('change', handlePreferenceChange);
            } else if (typeof motionQuery.addListener === 'function') {
                motionQuery.addListener(handlePreferenceChange);
            }
        };

        heroVideoToggle.addEventListener('click', () => {
            if (heroVideo.paused || heroVideo.ended) {
                const playPromise = heroVideo.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {
                        updateToggleState();
                    });
                }
            } else {
                heroVideo.pause();
            }
        });

        heroVideo.addEventListener('play', updateToggleState);
        heroVideo.addEventListener('pause', updateToggleState);

        bindReducedMotionListener();
    };

    // --- VIEW & STATE MANAGEMENT ---

    const switchView = (viewName) => {
        if (appState.liveDataInterval) {
            clearInterval(appState.liveDataInterval);
            appState.liveDataInterval = null;
        }

        appState.currentView = viewName;
        body.className = `theme-${localStorage.getItem('theme') || 'light'}`;
        if (viewName === 'performer') {
            body.classList.add('theme-dark');
        }

        views.forEach(view => {
            view.classList.add('hidden');
            view.setAttribute('aria-hidden', 'true');
        });
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.removeAttribute('aria-hidden');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        const activeLink = document.getElementById(`${viewName}-nav-link`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
        
        headerDetails.innerHTML = ''; 
        const theme = viewName === 'performer' ? 'dark' : localStorage.getItem('theme') || 'light';
        setTheme(theme);

        let viewTitle = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        if(viewName === 'pob') viewTitle = 'POB & ER';
        if(viewName === 'hse') viewTitle = 'HSE & Risk';
        if(viewName === 'whitepaper') viewTitle = 'White Paper';
        headerTitle.textContent = `Well-Tegra: ${viewTitle}`;

        if (viewName === 'performer' && appState.selectedWell && appState.generatedPlan) {
            headerDetails.innerHTML = `<span id="job-status" class="text-lg font-semibold text-emerald-400">&bull; LIVE</span><div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
            headerDetails.innerHTML = `<span id="job-status" class="text-lg font-semibold text-emerald-400">â— LIVE</span><div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
            initializePerformer();
        } else if (['analyzer', 'commercial', 'hse', 'pob'].includes(viewName)) {
            if(appState.selectedWell && appState.generatedPlan) {
                headerDetails.innerHTML = `<div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
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
        document.querySelectorAll('.planner-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-pressed', 'false');
        });
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
            const isGatedView = !['home', 'planner', 'about', 'faq', 'whitepaper'].includes(id);
            if (isGatedView && !planExists) {
                link.classList.add('disabled');
                link.setAttribute('aria-disabled', 'true');
                if (link.tagName === 'BUTTON') {
                    link.disabled = true;
                }
            } else {
                link.classList.remove('disabled');
                link.removeAttribute('aria-disabled');
                if (link.tagName === 'BUTTON') {
                    link.disabled = false;
                    link.removeAttribute('disabled');
                }
            }
        });
    };

    // --- PLANNER LOGIC ---

    const renderWellCards = () => { 
        wellSelectionGrid.innerHTML = wellData.map(well => {
            const isWellFromHell = well.id === 'W666';
            const statusClass = well.status.toLowerCase().replace(/[\s-]/g, '');
            const statusColor = isWellFromHell ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400';

            return `
                <article class="well-card-enhanced planner-card light-card ${isWellFromHell ? 'border-red-500' : 'border-gray-200'}" data-well-id="${well.id}" role="button" tabindex="0" aria-pressed="false">
            
            return `
                <div class="well-card-enhanced planner-card light-card ${isWellFromHell ? 'border-red-500' : 'border-gray-200'}" data-well-id="${well.id}">
                    <div class="card-header ${isWellFromHell ? 'bg-red-500' : 'bg-blue-500'}">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-bold text-white">${well.name}</h3>
                            ${isWellFromHell ? '<span class="bg-red-700 text-white text-xs px-2 py-1 rounded-full">CRITICAL</span>' : '<span class="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">CASE STUDY</span>'}
                        </div>
                        <p class="text-sm text-blue-100">${well.field} - ${well.type}</p>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full status-${statusClass}">${well.status}</span>
                        </div>
                        <p class="text-sm">${well.issue}</p>
                    </div>
                    <div class="card-footer">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">Depth: ${well.depth}</span>
                            <button class="view-details-btn text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold" data-well-id="${well.id}">View Details</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
                </div>
            `;
        }).join(''); 
    };

    const renderObjectives = () => { 
        objectivesFieldset.innerHTML = objectivesData.map(obj => `
            <div class="objective-card light-card" data-objective-id="${obj.id}">
                <input type="radio" name="objective" id="${obj.id}" value="${obj.id}" class="sr-only">
                <label for="${obj.id}" class="cursor-pointer h-full">
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">${obj.icon}</span>
                        <div>
                            <span class="font-semibold text-lg">${obj.name}</span>
                            <p class="text-sm mt-1">${obj.description}</p>
                        </div>
                    </div>
                </label>
            </div>
        `).join(''); 
    };

    const renderBulletList = (items, emptyText) => {
        if (!items || items.length === 0) {
            return `<p class="text-sm italic text-slate-500 dark:text-slate-400">${emptyText}</p>`;
        }
        return `
            <ul class="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                ${items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    };
    const renderOptionalList = (title, items) => {
        if (!items || items.length === 0) return '';
        return `
            <div class="mt-6">
                <h6 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">${title}</h6>
                ${renderBulletList(items, '')}
            </div>
        `;
    };
    const renderCostCodeTable = (codes) => {
        if (!codes || codes.length === 0) return '';
        return `
            <div class="mt-6">
                <h6 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Cost Codes</h6>
                <div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                        <thead class="bg-slate-50 dark:bg-slate-800/60">
                            <tr>
                                <th class="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Code</th>
                                <th class="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Description</th>
                                <th class="px-3 py-2 text-right font-semibold text-slate-600 dark:text-slate-300">Estimate</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                            ${codes.map(code => `
                                <tr>
                                    <td class="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">${code.code}</td>
                                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${code.description}</td>
                                    <td class="px-3 py-2 text-right text-slate-600 dark:text-slate-300">$${code.estimate.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
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
        3: document.getElementById('step-3-indicator') 
    };
    
    const stepConnectors = {
        1: document.getElementById('step-1-connector'),
        2: document.getElementById('step-2-connector')
    };
    
    const stepSections = { 
        1: document.getElementById('step-1'), 
        2: document.getElementById('step-2'), 
        3: document.getElementById('step-3') 
    };
    
    const wellSelectionGrid = document.getElementById('well-selection-grid');
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
        body.className = `theme-${localStorage.getItem('theme') || 'light'}`;
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
        const theme = viewName === 'performer' ? 'dark' : localStorage.getItem('theme') || 'light';
        setTheme(theme);

        let viewTitle = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        if(viewName === 'pob') viewTitle = 'POB & ER';
        if(viewName === 'hse') viewTitle = 'HSE & Risk';
        if(viewName === 'whitepaper') viewTitle = 'White Paper';
        headerTitle.textContent = `Well-Tegra: ${viewTitle}`;

        if (viewName === 'performer' && appState.selectedWell && appState.generatedPlan) {
            headerDetails.innerHTML = `<span id="job-status" class="text-lg font-semibold text-emerald-400">â— LIVE</span><div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
            initializePerformer();
        } else if (['analyzer', 'commercial', 'hse', 'pob'].includes(viewName)) {
            if(appState.selectedWell && appState.generatedPlan) {
                headerDetails.innerHTML = `<div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
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
        wellSelectionGrid.innerHTML = wellData.map(well => {
            const isWellFromHell = well.id === 'W666';
            const statusClass = well.status.toLowerCase().replace(/[\s-]/g, '');
            const statusColor = isWellFromHell ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400';
            
            return `
                <div class="well-card-enhanced planner-card light-card ${isWellFromHell ? 'border-red-500' : 'border-gray-200'}" data-well-id="${well.id}">
                    <div class="card-header ${isWellFromHell ? 'bg-red-500' : 'bg-blue-500'}">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-bold text-white">${well.name}</h3>
                            ${isWellFromHell ? '<span class="bg-red-700 text-white text-xs px-2 py-1 rounded-full">CRITICAL</span>' : '<span class="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">CASE STUDY</span>'}
                        </div>
                        <p class="text-sm text-blue-100">${well.field} - ${well.type}</p>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full status-${statusClass}">${well.status}</span>
                        </div>
                        <p class="text-sm">${well.issue}</p>
                    </div>
                    <div class="card-footer">
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">Depth: ${well.depth}</span>
                            <button class="view-details-btn text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold" data-well-id="${well.id}">View Details</button>
                        </div>
                    </div>
                </div>
            `;
        }).join(''); 
    };

    const renderObjectives = () => { 
        objectivesFieldset.innerHTML = objectivesData.map(obj => `
            <div class="objective-card light-card" data-objective-id="${obj.id}">
                <input type="radio" name="objective" id="${obj.id}" value="${obj.id}" class="sr-only">
                <label for="${obj.id}" class="cursor-pointer h-full">
                    <div class="flex items-start">
                        <span class="text-2xl mr-3">${obj.icon}</span>
                        <div>
                            <span class="font-semibold text-lg">${obj.name}</span>
                            <p class="text-sm mt-1">${obj.description}</p>
                        </div>
                    </div>
                </label>
            </div>
        `).join(''); 
    };


    const renderProblems = () => {
        // Only show problems relevant to the "Well From Hell"
        if (appState.selectedWell && appState.selectedWell.id === 'W666') {
             problemsFieldset.innerHTML = problemsData.map(prob => `
                <div class="objective-card light-card" data-problem-id="${prob.id}">
                    <input type="radio" name="problem" id="${prob.id}" value="${prob.id}" class="sr-only">
                    <label for="${prob.id}" class="cursor-pointer h-full">
                        <div class="flex items-start">
                            <span class="text-2xl mr-3">${prob.icon}</span>
                            <div>
                                <span class="font-semibold text-lg">${prob.name}</span>
                                <p class="text-sm mt-1">${prob.description}</p>
                            </div>
                        </div>
                    </label>
                </div>
            `).join('');
        } else {
            problemsFieldset.innerHTML = `
                <div class="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg text-center">
                    <p class="text-yellow-800 dark:text-yellow-200">Please select the 'Well From Hell' (W666) to use the AI Advisor.</p>
                </div>
            `;
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
                                <span class="text-red-800 dark:text-red-300">${c}</span>
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
                                            <p class="font-semibold">${item.name}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                                Source: ${item.source}
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
                                <p class="text-sm">${step}</p>
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

        let planHtml = `
            <div class="plan-summary-card light-card overflow-hidden mb-8">
                <div class="card-header bg-gradient-to-r from-blue-600 to-teal-500">
                    <h3 class="text-2xl font-bold text-white">Intervention Plan: ${well.name}</h3>
                    <p class="text-lg text-blue-100">${appState.selectedObjective.name}</p>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p class="text-sm font-medium">Selected Well</p>
                            <p class="text-lg font-semibold">${well.name}</p>
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
        const dossierData = programDossiers[appState.selectedObjective.id];
        if (dossierData) {
            const dossierSections = programSectionTemplates.map(section => {
                const sectionData = dossierData[section.id] || {};
                return `
                    <section class="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-100">${section.title}</h4>
                            <span class="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Template vs. ${well.id} Inputs</span>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h5 class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Template Checklist</h5>
                                ${renderBulletList(section.templateChecklist, 'No template guidance recorded yet.')}
                            </div>
                            <div>
                                <h5 class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">${well.name} Specific Inputs</h5>
                                ${renderBulletList(sectionData.uniqueHighlights, 'Use the template checklist for this section.')}
                            </div>
                        </div>
                        ${renderOptionalList('Attachments & Evidence', sectionData.documents)}
                        ${renderCostCodeTable(sectionData.costCodes)}
                        ${renderOptionalList('Watch Items', sectionData.watchItems)}
                        ${renderOptionalList('Handover Deliverables', sectionData.deliverables)}
                    </section>
                `;
            }).join('');

            planHtml += `
                <div class="plan-summary-card light-card overflow-hidden mt-8">
                    <div class="card-header bg-slate-800">
                        <h4 class="text-xl font-semibold text-white">Structured Program Dossier</h4>
                        <p class="text-sm text-slate-200 mt-1">Each section pairs the reusable Well-Tegra template with the W666-specific data points captured during planning.</p>
                    </div>
                    <div class="p-6 space-y-6">
                        ${dossierSections}
                    </div>
                </div>
            `;
        }
        planOutput.innerHTML = planHtml;

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
        procedureStepsContainer.innerHTML = appState.generatedPlan.procedure.map(step => `
            <div id="step-${step.id}" data-step-id="${step.id}" class="procedure-step p-3 rounded-md ${step.completed ? 'completed' : ''} ${currentStepId === step.id ? 'active' : ''}">
                <p class="font-semibold text-sm">${step.id}. ${step.text}</p>
            </div>
        `).join('');
        
        const activeStepElement = document.getElementById(`step-${currentStepId}`);
        if (activeStepElement) { 
            activeStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        }
    };

    const renderPerformerLog = () => { 
        logEntriesContainer.innerHTML = appState.logEntries.slice().reverse().map(entry => `
            <div class="log-entry p-2">
                <p class="text-xs text-gray-400">${entry.time.toLocaleTimeString()} - ${entry.user}</p>
                <p class="text-sm">${entry.text}</p>
            </div>
        `).join(''); 
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
                <p class="text-sm font-medium">${label}</p>
                <p class="text-lg font-semibold">${actual} <span class="text-sm font-normal">(Plan: ${plan})</span></p>
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
                    <p>${lesson}</p>
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
        
        equipmentTableBody.innerHTML = filteredEquipment.map(e => `
            <tr>
                <td class="p-2">${e.id}</td>
                <td class="p-2">${e.type}</td>
                <td class="p-2">${e.location}</td>
                <td class="p-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full status-${e.status.toLowerCase()}">${e.status}</span>
                </td>
                <td class="p-2">
                    <button class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50" 
                            ${e.location === 'Onboard - Pump Room' && e.testStatus === 'Pending' ? '' : 'disabled'}>
                        Test
                    </button>
                </td>
            </tr>
        `).join('');

        const persF = persFilter.toLowerCase();
        const filteredPersonnel = personnelData.filter(p => 
            requiredRoles.includes(p.role) && 
            (p.name.toLowerCase().includes(persF) || p.role.toLowerCase().includes(persF))
        );
        
        personnelTableBody.innerHTML = filteredPersonnel.map(p => `
            <tr>
                <td class="p-2">${p.name}</td>
                <td class="p-2">${p.role}</td>
                <td class="p-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full status-${p.status.toLowerCase().replace(/\s/g, '')}">${p.status}</span>
                </td>
                <td class="p-2">${p.certsValid ? 'âœ… Valid' : 'âŒ Expired'}</td>
            </tr>
        `).join('');
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
                <h4 class="font-semibold">${ms.name}</h4>
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
                                    <td class="p-2">${p.name}</td>
                                    <td class="p-2">${p.company}</td>
                                    <td class="p-2">${p.role}</td>
                                    <td class="p-2">${p.muster}</td>
                                    <td class="p-2">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full status-${p.musterStatus.toLowerCase().replace(' ', '')}">${p.musterStatus}</span>
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
                                        <td class="p-2">${t.description}</td>
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
                    <strong>Match!</strong> Invoice amount of $${invoiceAmount.toLocaleString()} matches validated system cost.
                </div>
            `;
        } else { 
            resultContainer.innerHTML = `
                <div class="p-3 rounded-md bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 text-red-800 dark:text-red-300">
                    <strong>Discrepancy Found!</strong> Invoice is <strong>$${Math.abs(difference).toLocaleString()} ${difference > 0 ? 'over' : 'under'}</strong> system-validated cost.
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
                                    <td class="p-2">${r.hazard}</td>
                                    <td class="p-2">${r.consequence}</td>
                                    <td class="p-2">${r.mitigation}</td>
                                    <td class="p-2">
                                        <span class="risk-${r.risk.toLowerCase()} px-2 py-1 text-xs font-medium rounded-full">${r.risk}</span>
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
                            <span class="font-medium">${p.name}</span>
                            <span class="px-2 py-1 text-xs font-medium rounded-full status-${p.status.toLowerCase()}">${p.status}</span>
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
        if (!accordion) return;

        accordion.innerHTML = faqData.map((item, index) => {
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;
            return `
            <div>
                <button id="${questionId}" type="button" class="faq-question flex justify-between items-center" aria-expanded="false" aria-controls="${answerId}">
                    <span>${item.question}</span>
                    <svg class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="${answerId}" class="faq-answer" role="region" aria-labelledby="${questionId}" hidden>${item.answer}</div>
            </div>
        `;
        }).join('');

        if (!accordion.dataset.accordionInitialized) {
            accordion.addEventListener('click', (e) => {
            const questionButton = e.target.closest('.faq-question');
            if (!questionButton) return;

            const answer = document.getElementById(questionButton.getAttribute('aria-controls'));
            const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

            accordion.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(btn => {
                if (btn !== questionButton) {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                    const controlledPanel = document.getElementById(btn.getAttribute('aria-controls'));
                    if (controlledPanel) {
                        controlledPanel.setAttribute('hidden', '');
                    }
                }
            });

            questionButton.classList.toggle('active', !isExpanded);
            questionButton.setAttribute('aria-expanded', String(!isExpanded));

            if (answer) {
                if (isExpanded) {
                    answer.setAttribute('hidden', '');
                } else {
                    answer.removeAttribute('hidden');
                }
            }
            });
            accordion.dataset.accordionInitialized = 'true';
        }
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
    };

    const renderModalTabs = (well) => {
        document.getElementById('history-content').innerHTML = well.history.length ? well.history.map(h => `
            <div class="p-4 mb-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p class="font-bold text-lg">${h.operation} <span class="text-sm font-normal">- ${h.date}</span></p>
                <div class="mt-3 space-y-3">
                    <div class="flex items-start">
                        <span class="text-xl mr-3">âš ï¸</span>
                        <div>
                            <strong class="font-semibold text-red-600 dark:text-red-400">Problem:</strong>
                            <p class="text-sm">${h.problem}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-xl mr-3">ðŸ’¡</span>
                        <div>
                            <strong class="font-semibold text-green-600 dark:text-green-400">Lesson Learned:</strong>
                            <p class="text-sm">${h.lesson}</p>
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
                            <td class="p-2 align-top">${r.date}</td>
                            <td class="p-2 align-top">${r.summary}</td>
                            <td class="p-2 align-top">${r.npt}</td>
                            <td class="p-2 align-top font-mono text-xs">
                                <ul class="space-y-1">
                                    ${r.toolstringRun.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p>No daily reports available.</p>';
    };

    const closeModal = () => modal.classList.add('hidden');

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
            const topY = c.top * scale; 
            const height = (c.bottom - c.top) * scale; 
            svgContent += `<rect x="60" y="${topY}" width="60" height="${height}" fill="none" stroke="${c.isProblem ? '#ef4444' : '#6b7280'}" stroke-width="2"/>`; 
        });
        
        well.completion.tubing?.forEach(t => { 
            const topY = t.top * scale; 
            const height = (t.bottom - t.top) * scale; 
            svgContent += `<rect x="85" y="${topY}" width="10" height="${height}" fill="${t.isProblem ? 'rgba(239, 68, 68, 0.3)' : (isDark ? '#6b7280' : '#d1d5db')}" stroke="${t.isProblem ? '#ef4444' : (isDark ? '#4b5563' : '#9ca3af')}" stroke-width="0.5"/>`; 
        });
        
        well.completion.equipment?.forEach(e => { 
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

    const initializeApp = () => {
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.classList.add('flex');
        }
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        switchView('home');
    };

    initializeApp();

    // --- EVENT LISTENERS ---

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.classList.contains('disabled')) return;
            switchView(e.currentTarget.id.replace('-nav-link', ''));
        });
    });

    // Well selection event listener
    wellSelectionGrid.addEventListener('click', (e) => {
        // Handle view details button
        if (e.target.closest('.view-details-btn')) { 
            e.stopPropagation(); 
            openModal(e.target.closest('.view-details-btn').dataset.wellId); 
            return; 
        }
        
        // Handle well card selection
        const card = e.target.closest('.planner-card'); 
        if (!card) return;
        
        appState.selectedWell = wellData.find(w => w.id === card.dataset.wellId);
        document.querySelectorAll('.planner-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
        document.querySelectorAll('.planner-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        renderProblems(); // Update the problems list based on selection
        updatePlannerStepUI(2);
    });

    wellSelectionGrid.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) return;
        const card = e.target.closest('.planner-card');
        if (!card) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });

    // Objective selection event listener
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
        generatePlanBtnManual.disabled = !appState.selectedObjective; 
    });

    // Problem selection event listener
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
                                <h4 class="font-bold text-lg text-teal-700 dark:text-teal-400">${objective.icon} ${objective.name}</h4>
                            </div>
                            <p class="text-sm mb-1"><strong>Projected Outcome:</strong> ${rec.outcome}</p>
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
            
            generatePlanBtnAi.disabled = false;
        }));
    });

    // AI toggle event listener
    aiToggle.addEventListener('change', (e) => { 
        manualPlanningView.classList.toggle('hidden', e.target.checked); 
        aiAdvisorView.classList.toggle('hidden', !e.target.checked);
        
        if(e.target.checked && appState.selectedWell && appState.selectedWell.id !== 'W666') {
             aiAdvisorView.innerHTML = `
                <div class="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg text-center">
                    <p class="text-yellow-800 dark:text-yellow-200">The AI Advisor is configured for the 'Well From Hell' (W666) scenario. Please select W666 to see AI recommendations.</p>
                </div>
            `;
        } else {
             renderProblems(); // Re-render problems list
        }
    });

    // Generate plan buttons event listeners
    generatePlanBtnManual.addEventListener('click', () => { 
        if (!appState.selectedWell || !appState.selectedObjective) return; 
        appState.generatedPlan = proceduresData[appState.selectedObjective.id]; 
        renderPlan(); 
        updatePlannerStepUI(3); 
    });

    generatePlanBtnAi.addEventListener('click', () => { 
        if (!appState.selectedWell || !appState.ai.selectedRecommendation) return; 
        appState.selectedObjective = objectivesData.find(o => o.id === appState.ai.selectedRecommendation.objectiveId); 
        appState.generatedPlan = proceduresData[appState.selectedObjective.id]; 
        renderPlan(); 
        updatePlannerStepUI(3); 
    });

    // Control buttons event listeners
    startOverBtn.addEventListener('click', () => resetApp(false));
    beginOpBtn.addEventListener('click', () => { 
        if (!appState.generatedPlan) return; 
        switchView('performer'); 
    });

    addLogBtn.addEventListener('click', () => { 
        addLogEntry('Operator', logInput.value); 
        logInput.value = ''; 
    });

    procedureStepsContainer.addEventListener('click', (e) => {
        const stepDiv = e.target.closest('.procedure-step');
        if (!stepDiv || !appState.liveData.jobRunning) return;

        const targetStepId = parseInt(stepDiv.dataset.stepId);
        const currentStepId = appState.liveData.currentStep;
        
        if (targetStepId > currentStepId) {
            jumpToStep(targetStepId);
        }
    });

    viewAnalysisBtn.addEventListener('click', () => {
        switchView('analyzer');
        if (window.initializeAnalyzer) {
            window.initializeAnalyzer();
        } else {
            initializeAnalyzer();
            initializeVendorScorecard();
        }
    });

    addLessonBtn.addEventListener('click', () => { 
        if(lessonInput.value.trim()){ 
            appState.lessonsLearned.push(lessonInput.value.trim()); 
            lessonInput.value = ''; 
            renderLessons(); 
        } 
    });

    planNewJobBtn.addEventListener('click', () => resetApp(true));

    equipmentSearch.addEventListener('input', (e) => 
        renderAssetManagementViews(e.target.value, personnelSearch.value)
    );

    personnelSearch.addEventListener('input', (e) => 
        renderAssetManagementViews(equipmentSearch.value, e.target.value)
    );

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

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
                        <h4 class="font-bold text-lg">${anomaly.message}</h4>
                        <span class="text-sm opacity-75">t=${time} min</span>
                    </div>
                    <div class="text-sm mb-2">
                        <strong>${anomaly.parameter}:</strong> ${anomaly.value.toFixed(1)}
                        (Threshold: ${anomaly.threshold})
                    </div>
                    <div class="bg-white/20 p-3 rounded text-sm">
                        <strong>Recommendation:</strong> ${anomaly.recommendation}
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

    // --- INITIALIZATION ---

    const init = () => {
        initializeHeroVideoToggle();
        renderWellCards();
        renderObjectives();
        renderProblems();
        initSavingsChart();
        updateNavLinks();
    };

    const pdfExportButton = document.getElementById('pdf-export-button');
    if (pdfExportButton) {
        pdfExportButton.addEventListener('click', generatePDFReport);
    }

    init();
});

// --- PDF EXPORT SYSTEM ---

async function generatePDFReport(event) {
    const evt = event || window.event;
    const button = evt?.currentTarget || evt?.target || document.getElementById('pdf-export-button');
    if (!button) {
        console.warn('PDF export button reference not found.');
        return;
    }

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

