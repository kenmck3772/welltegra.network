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
            <div class="relative gauge-container">
                <svg class="w-full h-full" viewBox="0 0 ${size} ${size}">
                    <circle class="gauge-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"></circle>
                    <circle class="gauge-fg stroke-normal gauge-circle" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="gauge-value text-2xl font-bold gauge-text text-normal">0</span>
                    <span class="gauge-units text-xs text-slate-400">${units}</span>
                </div>
            </div>
            <h4 class="mt-2 text-sm font-semibold text-slate-300">${label}</h4>
        `;

        // Apply styles via JavaScript (CSP compliant with CSS custom properties)
        const gaugeContainer = container.querySelector('.gauge-container');
        if (gaugeContainer) {
            gaugeContainer.style.setProperty('--gauge-size', `${size}px`);
        }
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
        gaugeFg.style.setProperty('--gauge-offset', Math.max(0, Math.min(circumference, offset)));

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
                <div class="bar-fg bg-normal h-2.5 rounded-full"></div>
            </div>
            <div class="text-center">
                <span class="bar-value text-2xl font-bold gauge-text text-normal">0</span>
                <span class="bar-units text-xs text-slate-400">${units}</span>
            </div>
        `;

        // Apply initial width via CSS custom property (CSP compliant)
        const barFg = container.querySelector('.bar-fg');
        if (barFg) {
            barFg.style.setProperty('--bar-width', '0%');
        }
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
        barFg.style.setProperty('--bar-width', `${percentage}%`);
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
            icon: {
                id: 'critical-alert',
                glyph: '🚨',
                label: 'Critical intervention required'
            },
            kind: 'critical',
            themes: ['integrity', 'flow-assurance', 'controls'],
            dataQuality: 92,
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
            icon: {
                id: 'wrench',
                glyph: '🛠️',
                label: 'Expandable patch success story'
            },
            kind: 'case',
            themes: ['integrity', 'productivity'],
            dataQuality: 88,
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
            icon: {
                id: 'chemistry',
                glyph: '🧪',
                label: 'Chemical treatment case study'
            },
            kind: 'case',
            themes: ['flow-assurance', 'productivity'],
            dataQuality: 85,
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
            icon: {
                id: 'lock',
                glyph: '🔐',
                label: 'Barrier integrity restored'
            },
            kind: 'case',
            themes: ['integrity', 'controls'],
            dataQuality: 82,
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
            icon: {
                id: 'layers',
                glyph: '🏖️',
                label: 'Sand control remediation'
            },
            kind: 'case',
            themes: ['flow-assurance', 'productivity'],
            dataQuality: 78,
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
            icon: {
                id: 'thermal',
                glyph: '🧊',
                label: 'Wax blockage cleared'
            },
            kind: 'case',
            themes: ['flow-assurance', 'productivity'],
            dataQuality: 76,
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
            icon: {
                id: 'rocket',
                glyph: '🚀',
                label: 'Integrated multi-discipline win'
            },
            kind: 'case',
            themes: ['integrity', 'flow-assurance', 'controls', 'productivity'],
            dataQuality: 95,
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
    const plannerIconLibrary = {
        'critical-alert': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11.9998 9.00006V12.7501M2.69653 16.1257C1.83114 17.6257 2.91371 19.5001 4.64544 19.5001H19.3541C21.0858 19.5001 22.1684 17.6257 21.303 16.1257L13.9487 3.37819C13.0828 1.87736 10.9167 1.87736 10.0509 3.37819L2.69653 16.1257ZM11.9998 15.7501H12.0073V15.7576H11.9998V15.7501Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'wrench': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11.4194 15.1694L17.25 21C18.2855 22.0355 19.9645 22.0355 21 21C22.0355 19.9645 22.0355 18.2855 21 17.25L15.1233 11.3733M11.4194 15.1694L13.9155 12.1383C14.2315 11.7546 14.6542 11.5132 15.1233 11.3733M11.4194 15.1694L6.76432 20.8219C6.28037 21.4096 5.55897 21.75 4.79768 21.75C3.39064 21.75 2.25 20.6094 2.25 19.2023C2.25 18.441 2.59044 17.7196 3.1781 17.2357L10.0146 11.6056M15.1233 11.3733C15.6727 11.2094 16.2858 11.1848 16.8659 11.2338C16.9925 11.2445 17.1206 11.25 17.25 11.25C19.7353 11.25 21.75 9.23528 21.75 6.75C21.75 6.08973 21.6078 5.46268 21.3523 4.89779L18.0762 8.17397C16.9605 7.91785 16.0823 7.03963 15.8262 5.92397L19.1024 2.64774C18.5375 2.39223 17.9103 2.25 17.25 2.25C14.7647 2.25 12.75 4.26472 12.75 6.75C12.75 6.87938 12.7555 7.00749 12.7662 7.13411C12.8571 8.20956 12.6948 9.39841 11.8617 10.0845L11.7596 10.1686M10.0146 11.6056L5.90901 7.5H4.5L2.25 3.75L3.75 2.25L7.5 4.5V5.90901L11.7596 10.1686M10.0146 11.6056L11.7596 10.1686M18.375 18.375L15.75 15.75M4.86723 19.125H4.87473V19.1325H4.86723V19.125Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'chemistry': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9.75001 3.10408V8.81802C9.75001 9.41476 9.51295 9.98705 9.091 10.409L5.00001 14.5M9.75001 3.10408C9.49886 3.12743 9.24884 3.15465 9.00001 3.18568M9.75001 3.10408C10.4908 3.03521 11.2413 3 12 3C12.7587 3 13.5093 3.03521 14.25 3.10408M14.25 3.10408V8.81802C14.25 9.41476 14.4871 9.98705 14.909 10.409L19.8 15.3M14.25 3.10408C14.5011 3.12743 14.7512 3.15465 15 3.18568M19.8 15.3L18.2299 15.6925C16.1457 16.2136 13.9216 15.9608 12 15C10.0784 14.0392 7.85435 13.7864 5.7701 14.3075L5.00001 14.5M19.8 15.3L21.2022 16.7022C22.4341 17.9341 21.8527 20.0202 20.1354 20.3134C17.4911 20.7649 14.773 21 12 21C9.227 21 6.50891 20.7649 3.86459 20.3134C2.14728 20.0202 1.56591 17.9341 2.7978 16.7022L5.00001 14.5"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'lock': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M6.75 21.75H17.25C18.4926 21.75 19.5 20.7426 19.5 19.5V12.75C19.5 11.5074 18.4926 10.5 17.25 10.5H6.75C5.50736 10.5 4.5 11.5074 4.5 12.75V19.5C4.5 20.7426 5.50736 21.75 6.75 21.75Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'layers': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6.87803V6C6 4.75736 7.00736 3.75 8.25 3.75H15.75C16.9926 3.75 18 4.75736 18 6V6.87803M6 6.87803C6.23458 6.79512 6.48702 6.75 6.75 6.75H17.25C17.513 6.75 17.7654 6.79512 18 6.87803M6 6.87803C5.12611 7.18691 4.5 8.02034 4.5 9V9.87803M18 6.87803C18.8739 7.18691 19.5 8.02034 19.5 9V9.87803M19.5 9.87803C19.2654 9.79512 19.013 9.75 18.75 9.75H5.25C4.98702 9.75 4.73458 9.79512 4.5 9.87803M19.5 9.87803C20.3739 10.1869 21 11.0203 21 12V18C21 19.2426 19.9926 20.25 18.75 20.25H5.25C4.00736 20.25 3 19.2426 3 18V12C3 11.0203 3.62611 10.1869 4.5 9.87803"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'thermal': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15.3622 5.21361C18.2427 6.50069 20.25 9.39075 20.25 12.7497C20.25 17.306 16.5563 20.9997 12 20.9997C7.44365 20.9997 3.75 17.306 3.75 12.7497C3.75 10.5376 4.62058 8.52889 6.03781 7.04746C6.8043 8.11787 7.82048 8.99731 9.00121 9.60064C9.04632 6.82497 10.348 4.35478 12.3621 2.73413C13.1255 3.75788 14.1379 4.61821 15.3622 5.21361Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18C14.0711 18 15.75 16.3211 15.75 14.25C15.75 12.3467 14.3321 10.7746 12.4949 10.5324C11.4866 11.437 10.7862 12.6779 10.5703 14.0787C9.78769 13.8874 9.06529 13.5425 8.43682 13.0779C8.31559 13.4467 8.25 13.8407 8.25 14.25C8.25 16.3211 9.92893 18 12 18Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'rocket': {
            svg: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15.5904 14.3696C15.6948 14.8128 15.75 15.275 15.75 15.75C15.75 19.0637 13.0637 21.75 9.75 21.75V16.9503M15.5904 14.3696C19.3244 11.6411 21.75 7.22874 21.75 2.25C16.7715 2.25021 12.3595 4.67586 9.63122 8.40975M15.5904 14.3696C13.8819 15.6181 11.8994 16.514 9.75 16.9503M9.63122 8.40975C9.18777 8.30528 8.72534 8.25 8.25 8.25C4.93629 8.25 2.25 10.9363 2.25 14.25H7.05072M9.63122 8.40975C8.38285 10.1183 7.48701 12.1007 7.05072 14.25M9.75 16.9503C9.64659 16.9713 9.54279 16.9912 9.43862 17.0101C8.53171 16.291 7.70991 15.4692 6.99079 14.5623C7.00969 14.4578 7.02967 14.3537 7.05072 14.25M4.81191 16.6408C3.71213 17.4612 3 18.7724 3 20.25C3 20.4869 3.0183 20.7195 3.05356 20.9464C3.28054 20.9817 3.51313 21 3.75 21C5.22758 21 6.53883 20.2879 7.35925 19.1881M16.5 9C16.5 9.82843 15.8284 10.5 15 10.5C14.1716 10.5 13.5 9.82843 13.5 9C13.5 8.17157 14.1716 7.5 15 7.5C15.8284 7.5 16.5 8.17157 16.5 9Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        }
    };

    const escapeHtml = (value = '') => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderPlannerIcon = (icon = {}, fallbackLabel = 'Well insight', tone = 'case') => {
        const iconEntry = icon.id ? plannerIconLibrary[icon.id] : null;
        const label = escapeHtml(icon.label || fallbackLabel);
        const wrapperClass = tone === 'critical' ? 'planner-icon planner-icon--critical' : 'planner-icon planner-icon--case';

        if (iconEntry?.svg) {
            return `<span class="${wrapperClass}" role="img" aria-label="${label}">${iconEntry.svg.trim()}</span>`;
        }

        const glyph = escapeHtml(icon.glyph || iconEntry?.glyph || '🛢️');
        return `<span class="${wrapperClass}" role="img" aria-label="${label}">${glyph}</span>`;
    };

    const objectivesData = [
        { id: 'obj1', name: 'Remediate Casing Deformation', description: 'Install an expandable steel patch to restore wellbore access.', icon: '🔧' },
        { id: 'obj2', name: 'Remove BaSO4 Scale', description: 'Use a chemical and mechanical method to clear tubing blockage.', icon: '🧪' },
        { id: 'obj3', name: 'Restore Downhole Safety Valve', description: 'Lock open the failed TRSSV and install a new insert valve.', icon: '🔒' },
        { id: 'obj4', name: 'Repair Sand Control', description: 'Install a through-tubing expandable sand screen patch.', icon: '🛠️' },
        { id: 'obj5', name: 'Paraffin Wax Removal', description: 'Use CT with chemicals and tools to remove wax blockage.', icon: '🕯️' }
    ];
    const problemsData = [
        { id: 'prob1', name: 'Loss of Well Access (Casing Deformation)', description: 'Wellbore is restricted due to geomechanical forces.', linked_objectives: ['obj1'], icon: '🚫' },
        { id: 'prob2', name: 'Severe Scale Blockage', description: 'Production is blocked by hard, insoluble scale.', linked_objectives: ['obj2'], icon: '🚰' },
        { id: 'prob3', name: 'Failed Primary Safety Barrier (DHSV)', description: 'Well is legally shut-in due to a failed safety valve.', linked_objectives: ['obj3'], icon: '⚠️' },
        { id: 'prob4', name: 'Sand Control Failure', description: 'Excessive sand production is damaging equipment and limiting rates.', linked_objectives: ['obj4'], icon: '🏝️' },
        { id: 'prob5', name: 'Flow Assurance Blockage (Wax)', description: 'Production is severely restricted by paraffin deposits.', linked_objectives: ['obj5'], icon: '🧊' }
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

    const dataScrubbingPipelines = Object.freeze({
        W666: {
            overview: 'Every raw drop from the operator or a Well-Tegra engineer is scrubbed the moment it lands. LangExtract runs against the intake to normalize barrier failures, obstruction depths, and recommended actions before the planner ever consumes the data.',
            stages: [
                {
                    title: '1. Intake & Hashing',
                    status: 'Completed',
                    badgeClass: 'border-emerald-400 text-emerald-300',
                    description: 'Encrypted SFTP drop validates checksums and timestamps each inbound artifact so the provenance is locked before parsing begins.',
                    artifacts: [
                        'Slickline DDR • 2024-04-10',
                        'Vendor BaSO₄ Scale Survey • 2024-03-28',
                        'TRSSV Negative Test Worksheet • 2024-04-10'
                    ]
                },
                {
                    title: '2. LangExtract Structuring',
                    status: 'Completed',
                    badgeClass: 'border-emerald-400 text-emerald-300',
                    description: 'LangExtract prompt library extracts barrier failures, obstruction depths, annulus pressures, and recommended actions with direct citations back to the source sentences.',
                    artifacts: [
                        'Model: gemini-2.5-flash (dry-run sandbox)',
                        'Prompt template: wtgr/w666/barrier_rules.json',
                        'Output bundle: w666_ingest_2024-04-10.jsonl'
                    ]
                },
                {
                    title: '3. Engineer QA & Publish',
                    status: 'Signed Off',
                    badgeClass: 'border-sky-400 text-sky-300',
                    description: 'Well-Tegra engineer cross-checks citations, resolves flagged anomalies, and publishes the normalized dataset to the planning workspace.',
                    artifacts: [
                        'Reviewer: M. Singh (Integrity SME)',
                        'Anomalies resolved: 2 (unit mismatch & duplicated entry)',
                        'Publish time: 2024-04-12 18:20 UTC'
                    ]
                }
            ],
            schema: [
                {
                    label: 'Prompt Goal',
                    value: 'Extract barrier failures, obstruction or debris depths, annulus pressure excursions, and recommended mitigations for W666 with direct evidence spans.'
                },
                {
                    label: 'Extraction Classes',
                    value: 'well_summary, barrier_failure, obstruction, recommended_action, risk_alert, confidence_score'
                },
                {
                    label: 'Output Controls',
                    value: 'LangExtract enforces JSON schema + cite_range_id so every field references its originating document coordinates.'
                }
            ],
            rawExcerpt: '“DHSV failed to close during negative test. Pressure at A-annulus climbed to 1,850 psi. Suspect scale at ~14,200 ft restricting travel.”',
            rawSource: 'Slickline Daily Report — 2024-04-10',
            normalizedFindings: [
                {
                    label: 'barrier_failure.event',
                    value: 'Surface-controlled subsurface safety valve failed to seal on negative test.',
                    evidence: 'TRSSV Negative Test Worksheet §4.1 (cite_range 201-242)',
                    confidence: 0.94
                },
                {
                    label: 'obstruction.depth_ft',
                    value: '14,200',
                    evidence: 'Slickline DDR 2024-04-10 line 57 (cite_range 871-896)',
                    confidence: 0.91
                },
                {
                    label: 'risk_alert.detail',
                    value: 'A-annulus pressure sustained at 1,850 psi with no bleed-off path — flagged for immediate pressure management plan.',
                    evidence: 'LangExtract merge across DDR + scale survey (cite_ranges 901-940, 1104-1130)',
                    confidence: 0.89
                },
                {
                    label: 'recommended_action',
                    value: 'Execute expandable patch + chemical jetting train before TRSSV change-out; align with integrated plan W666-INT-24-01.',
                    evidence: 'Engineer QA annotation referencing historical case M-21 (cite_range 1304-1350)',
                    confidence: 0.93
                }
            ],
            qaSummary: [
                '12 of 13 high-priority statements grounded with citations (92% coverage).',
                'Operator and vendor identifiers hashed; canonical asset preserved as W666 for traceability.',
                'Sign-off recorded by Well-Tegra engineer M. Singh on 2024-04-12 18:20 UTC.'
            ]
        }
    });

    window.dataScrubbingPipelines = dataScrubbingPipelines;
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
            tfaModel: { pickUp: [[0,0], [9000, 60]], slackOff: [[0,0], [9000, -60]], alarmUpper: [[0,10], [9000, 70]], alarmLower: [[0,-10], [9000, -70]] },
            sustainability: {
                badge: 'AI Verified Impact',
                highlight: 'Rigless expandable patch avoids a 40-day workover and keeps the deformed casing in a certified recycling loop.',
                metrics: [
                    {
                        label: 'CO₂e Avoided',
                        value: '280 t',
                        context: 'Versus a heavy workover rig campaign',
                        trend: '▼ 36% vs. baseline',
                        direction: 'down'
                    },
                    {
                        label: 'Diesel Eliminated',
                        value: '42,000 L',
                        context: 'Electrified hydraulic units on location',
                        trend: '▼ 41% fuel burn',
                        direction: 'down'
                    },
                    {
                        label: 'Recovered Steel',
                        value: '12.5 t',
                        context: 'Returned to circular supply chain',
                        trend: '▲ 18% reuse uplift',
                        direction: 'up'
                    }
                ],
                assurance: {
                    label: 'Digital Twin Coverage',
                    value: '92%',
                    context: 'Downhole/mechanical states mirrored in simulator for execution handoff'
                }
            }
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
            tfaModel: { pickUp: [[0,0], [14500, 35]], slackOff: [[0,0], [14500, -35]], alarmUpper: [[0,2], [14500, 37]], alarmLower: [[0,-2], [14500, -37]] },
            sustainability: {
                badge: 'Low-Carbon CT Campaign',
                highlight: 'Closed-loop chemical handling slashes trucking miles and captures spent solvents for reprocessing.',
                metrics: [
                    {
                        label: 'Hazardous Waste Avoided',
                        value: '18.4 t',
                        context: 'On-site neutralisation & recovery skid',
                        trend: '▼ 52% disposal volume',
                        direction: 'down'
                    },
                    {
                        label: 'AI Optimised Pump Time',
                        value: '−11 hrs',
                        context: 'Adaptive soak modelling',
                        trend: '▼ 14% runtime',
                        direction: 'down'
                    },
                    {
                        label: 'Water Recycled',
                        value: '68%',
                        context: 'Filtration loop for jetting returns',
                        trend: '▲ 9 pts from 2023',
                        direction: 'up'
                    }
                ],
                assurance: {
                    label: 'AI Confidence Envelope',
                    value: '89%',
                    context: 'Confidence that emissions stay within sustainability guardrails'
                }
            }
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
            tfaModel: { pickUp: [[0, 100], [9800, 160]], slackOff: [[0, 100], [9800, 40]], alarmUpper: [[0, 110], [9800, 170]], alarmLower: [[0, 90], [9800, 30]] },
            sustainability: {
                badge: 'Barrier Reinstated, Carbon Lite',
                highlight: 'Single-run slickline repair restores compliance without mobilising a workover rig or flaring events.',
                metrics: [
                    {
                        label: 'CO₂e Avoided',
                        value: '96 t',
                        context: 'No standby rig or flaring required',
                        trend: '▼ 44% vs. historical fix',
                        direction: 'down'
                    },
                    {
                        label: 'Site Visits Eliminated',
                        value: '5 trips',
                        context: 'Remote barrier verification pack',
                        trend: '▼ 62% travel emissions',
                        direction: 'down'
                    },
                    {
                        label: 'Smart Valve Telemetry',
                        value: '100%',
                        context: 'Continuous monitoring via blockchain contract',
                        trend: '▲ Full remote assurance',
                        direction: 'up'
                    }
                ],
                assurance: {
                    label: 'Safety Envelope Confidence',
                    value: '95%',
                    context: 'AI confirms regulatory readiness post job'
                }
            }
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
            tfaModel: { pickUp: [[0,0], [10000, 50]], slackOff: [[0,0], [10000, -50]], alarmUpper: [[0,5], [10000, 55]], alarmLower: [[0,-5], [10000, -55]] },
            sustainability: {
                badge: 'Circular Sand Control',
                highlight: 'Through-tubing repair extends completion life while keeping 80% of legacy hardware in service.',
                metrics: [
                    {
                        label: 'Material Reuse',
                        value: '81%',
                        context: 'Legacy completion components retained',
                        trend: '▲ 12 pts retention',
                        direction: 'up'
                    },
                    {
                        label: 'Flaring Avoided',
                        value: '18 hrs',
                        context: 'Live flowback managed via simulator envelope',
                        trend: '▼ 100% routine flaring',
                        direction: 'down'
                    },
                    {
                        label: 'Logistics Miles Saved',
                        value: '1,120 km',
                        context: 'Regional vendor pooling',
                        trend: '▼ 27% transport footprint',
                        direction: 'down'
                    }
                ],
                assurance: {
                    label: 'Digital Twin Fidelity',
                    value: '90%',
                    context: 'AI anomaly detection coverage across sand control envelope'
                }
            }
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
            tfaModel: { pickUp: [[0,0], [7500, 20]], slackOff: [[0,0], [7500, -20]], alarmUpper: [[0,2], [7500, 22]], alarmLower: [[0,-2], [7500, -22]] },
            sustainability: {
                badge: 'Thermal Efficiency Boost',
                highlight: 'Integrated thermal modelling minimises heater runtime and captures wax for reuse in additives.',
                metrics: [
                    {
                        label: 'Energy Intensity',
                        value: '−18%',
                        context: 'Versus baseline wax removal',
                        trend: '▼ 18% power demand',
                        direction: 'down'
                    },
                    {
                        label: 'Recovered Wax Blend',
                        value: '7.4 t',
                        context: 'Repurposed into inhibitor stock',
                        trend: '▲ 24% recovery',
                        direction: 'up'
                    },
                    {
                        label: 'Remote Supervision',
                        value: '45%',
                        context: 'Live digital twin oversight',
                        trend: '▲ 45% virtual coverage',
                        direction: 'up'
                    }
                ],
                assurance: {
                    label: 'AI Emissions Guardrail',
                    value: '91%',
                    context: 'Probability of staying under carbon budget with current design'
                }
            }
        }
    };
    const designBlueprints = {
        obj1: {
            title: 'Expandable Patch Engineering Blueprint',
            summary: 'Restore 9 5/8" casing integrity at 9,200 ft to regain access and reinstate the primary barrier.',
            conceptual: [
                'Confirm regulatory objective: reinstate dual-barrier compliance so W666 can be returned to production.',
                'Leverage case study M-21 to benchmark expansion loads, annular clearances, and metallurgy.',
                'Ensure the workover unit envelope covers the 80 ft patch length and 350k lbs hookload requirement.'
            ],
            detailed: {
                trajectory: [
                    'Existing well profile: S-shaped with 32° maximum inclination, build from 2,800–4,000 ft MD.',
                    'Dogleg severity validated at <3°/100 ft allowing expandable tools to pass.',
                    'Correlate GR/CCL to confirm deformation top at 9,180 ft MD before setting patch.'
                ],
                casing: [
                    'Surface: 30" x 608 ft, 20" x 2,090 ft, 13-3/8" x 4,931 ft, 9-5/8" production string to 9,060 ft.',
                    'Patch envelope: 9-5/8" 47 ppf L-80 with expandable liner OD 8.7" providing post-expansion drift 7.9".',
                    'Post-install test: 4,500 psi internal pressure with 10% overpull contingency.'
                ],
                fluids: [
                    'Kill fluid: 10.2 ppg inhibited brine to balance 0.45 psi/ft gradient above 8,200 ft fluid level.',
                    'Viscous sweeps scheduled prior to patch run to remove scale fines.',
                    'Displacement with filtered brine to ensure clean expansion interface.'
                ],
                bha: [
                    'Gauge ring and caliper run to verify minimum ID prior to mobilising HWU.',
                    'Expandable patch on jointed pipe with hydraulic setting tool; confirm stroke vs. packer load table.',
                    'Pressure-testing string equipped with double-barrier safety valves for well control.'
                ],
                wellControl: [
                    'HWU BOP stack: 11" 10k with annular + double ram, tested to 7,500 psi prior to operations.',
                    'Secondary barrier via lubricator tree; emergency shut-in plan validated with control room.',
                    'Kick tolerance calculated at 3.2 ppg margin with current fluid program.'
                ],
                completion: [
                    'Post-expansion drift run to confirm ID.',
                    'Update completion schematic and barrier certification prior to handover.',
                    'Schedule production logging run post job to confirm inflow stability.'
                ]
            },
            contingencies: [
                'If patch fails to expand on first attempt, execute controlled bleed-off and re-pressurise up to vendor maximum.',
                'Should deformation exceed 1.5", mobilise contingency milling BHA from vendor hot-shot list.',
                'Maintain chemical scale inhibitor on location in case solids loading spikes during cleanout.'
            ]
        },
        obj2: {
            title: 'Scale Removal Engineering Blueprint',
            summary: 'Eliminate BaSO₄ blockage between 14,500–15,200 ft using chemical soak and mechanical jetting.',
            conceptual: [
                'Restore production deliverability and tubing drift to 5.5" by clearing hard scale.',
                'Validate fluid compatibility with completion metallurgy per Scale Trap case study.',
                'Coordinate CT spread, pumping services, and waste handling for 48-hour chemical soak.'
            ],
            detailed: {
                trajectory: [
                    'High-angle section: 38° inclination from 12,000 ft MD onward; CT drag model verified for 1.75" coil.',
                    'Anti-collision check complete against parallel injector wellbore using latest survey set.',
                    'Pressure drop modelling confirms pump rate 1.5 bbl/min delivers jetting energy at TD.'
                ],
                casing: [
                    '9-5/8" casing to 9,060 ft with 5-1/2" production tubing landed at 8,546 ft.',
                    'Scale concentrated in liner top interval; ensure pup joint restrictions cleared before CT run.',
                    'Check annular pressure rating for heated chemical circulation.'
                ],
                fluids: [
                    'Primary treatment: 12% DTPA chelating agent with corrosion inhibitor, 36 hr soak.',
                    'Spacer and overflush volumes calculated for 1.3 hole volumes.',
                    'Post-cleanout displacement with filtered completion brine to minimise residue.'
                ],
                bha: [
                    'CT BHA: rotating jetting head with real-time downhole pressure sub and nozzle selection for 3,000 psi delta.',
                    'Optional motor + mill contingency staged on location for hard nodules.',
                    'Wireline plug available to isolate lower perforations if required.'
                ],
                wellControl: [
                    'CT BOP stack: 7-1/16" 10k, annular test 7,500 psi, shear/blind rams verified.',
                    'Kick tolerance 2.8 ppg with heated chemical; monitor pit gains via historian link.',
                    'Emergency shutdown matrix shared with pumping crew and control room.'
                ],
                completion: [
                    'Post-job drift and production logging to confirm full ID restored.',
                    'Reinstate scale inhibition program aligned with new water cut forecast.',
                    'Update corrosion coupon plan to validate chemical compatibility.'
                ]
            },
            contingencies: [
                'If jetting stalls, apply oscillation mode and increase pump rate by 10% within CT tension limits.',
                'Switch to mechanical scraper BHA if residual plugs detected after chemical stage.',
                'Have nitrogen lift package on standby in case of heavy returns during cleanout.'
            ]
        },
        obj3: {
            title: 'Safety Valve Restoration Blueprint',
            summary: 'Replace failed TRSSV with a wireline-retrievable safety valve and certify barrier integrity.',
            conceptual: [
                'Re-establish primary barrier to remove regulatory shut-in status.',
                'Match insert valve envelope to nipple profile verified from offset jobs.',
                'Minimise rig time by sequencing slickline tasks in a single campaign.'
            ],
            detailed: {
                trajectory: [
                    'Primary tubing string vertical to 2,500 ft then 20° inclination at valve depth (~2,800 ft).',
                    'Wireline catenary analysis confirms 0.108" slickline can reach profile without rollers.',
                    'Correlate depth using CCL/pressure signatures from previous logging passes.'
                ],
                casing: [
                    'Focus zone: TRSSV located inside 5-1/2" production tubing at 2,820 ft.',
                    'Lock mandrel selection: XN profile, 4.5" rating, 10k psi working pressure.',
                    'Surface control line integrity verified up to 5,000 psi.'
                ],
                fluids: [
                    'Well under balanced control with 10.2 ppg brine; no additional kill required.',
                    'Lubricator filled with treated brine to protect valve internals.',
                    'Optional methanol pill available to manage hydrate risk during shut-in.'
                ],
                bha: [
                    'Phase 1: heavy-duty pulling tool + lock-open key to secure failed flapper.',
                    'Phase 2: run WRSSV with running tool and equalising prong, verify setting via pressure test.',
                    'Contingency: gauge run to ensure no debris prior to valve deployment.'
                ],
                wellControl: [
                    'Slickline PCE stack tested to 10k psi; wireline valve at tree provides secondary barrier.',
                    'Emergency shut-in via ESD panel rehearsed with crew prior to job start.',
                    'Shear seal contingency available should pressure spike during retrieval.'
                ],
                completion: [
                    'Function test new valve (open/close cycles) and chart pressure response.',
                    'Update barrier schematic and issue reinstatement certificate to regulator.',
                    'Schedule quarterly proof tests per field operating standard.'
                ]
            },
            contingencies: [
                'If lock-open tool fails, mobilise electric line to cut flapper and retrieve debris.',
                'Have backup WRSSV in hot shot logistics queue in case of seal failure.',
                'Prepare lubricator extension if lubricator stroke insufficient for WRSSV length.'
            ]
        },
        obj4: {
            title: 'Sand Control Repair Blueprint',
            summary: 'Install through-tubing expandable sand screen to stabilise production interval at 17,500 ft.',
            conceptual: [
                'Eliminate sanding events that forced repeated shut-ins and erosion of topside equipment.',
                'Use lessons from case C-08 to validate expandable screen sizing and deployment envelope.',
                'Coordinate CT cleanout, patch expansion, and flowback strategy as a single integrated package.'
            ],
            detailed: {
                trajectory: [
                    'High-angle section: 42° inclination at perforated interval; screen run confirmed with deviation model.',
                    'Dogleg smoothing trip planned with roller stem to reduce friction.',
                    'Set depth correlated with gamma/resistivity from offset log library.'
                ],
                casing: [
                    'Lower completion: 5-1/2" liner with failed premium screen between 17,450–17,520 ft.',
                    'Expandable screen OD 4.6" to be expanded to 5.2" sealing inside existing liner.',
                    'Top packer at 18,950 ft verified to hold planned drawdown.'
                ],
                fluids: [
                    'Pre-job CT sweep with viscous gel to remove mobile sand.',
                    'Displacement fluid: filtered 9.5 ppg brine to avoid plugging screen matrix.',
                    'Return the well with ramped drawdown (10%, 30%, 60% choke schedule) to seat sand bed.'
                ],
                bha: [
                    'CT cleanout BHA with dual wiper trip, followed by gauge drift.',
                    'Expandable screen run on jointed pipe with mechanical expansion tool; confirm force vs. torque curve.',
                    'Memory pressure gauge installed above screen to monitor stability during flowback.'
                ],
                wellControl: [
                    'HWU stack + CT stack integration tested; ensure simultaneous operations procedures approved.',
                    'Sour gas contingency: H2S scavenger packaged due to historical trace readings.',
                    'Emergency sand shutoff plan defined with production ops.'
                ],
                completion: [
                    'Flowback under controlled choke schedule with real-time sand monitoring.',
                    'Update completion drawing and production strategy to reflect new ESS configuration.',
                    'Plan follow-up sand probe log 14 days post job to confirm performance.'
                ]
            },
            contingencies: [
                'If expansion stalls, apply incremental overpull while monitoring hookload envelope.',
                'Maintain spare ESS joints on location to extend coverage if sand interval larger than forecast.',
                'Deploy real-time acoustic sand detector to trigger choke back should production spike.'
            ]
        },
        obj5: {
            title: 'Wax Removal Blueprint',
            summary: 'Remove paraffin build-up restricting flow between 7,200–8,100 ft and restore production deliverability.',
            conceptual: [
                'Stabilise flow assurance by clearing wax and reinstating thermal management plan.',
                'Blend chemical dissolution with mechanical scraping to avoid repeat interventions.',
                'Align CT, chemical vendors, and operations crew on 24-hour heating schedule.'
            ],
            detailed: {
                trajectory: [
                    'Tubing vertical to 6,000 ft then slight deviation 15°; CT drag minimal for 1.5" coil.',
                    'Temperature modelling confirms surface heating + insulated circulation maintains 140°F at wax zone.',
                    'Deploy distributed temperature survey post job to monitor cooldown rate.'
                ],
                casing: [
                    'Wax build-up inside 5-1/2" tubing above packer; ensure scraper BHA sized to avoid packer damage.',
                    'Check tubing drift to 4.65" prior to running mechanical tools.',
                    'Confirm tree valve seals rated for heated solvent exposure.'
                ],
                fluids: [
                    'Heated solvent blend (xylene + mutual solvent + inhibitor) circulated at 150°F for 6 hours.',
                    'Follow with hot oil flush to transport loosened wax to surface handling units.',
                    'Implement continuous paraffin inhibitor injection post job at 5 gal/day.'
                ],
                bha: [
                    'CT string with insulated umbilical, positive displacement motor, and scraper for final pass.',
                    'Inline temperature sub to monitor downhole temp vs. wax melting point.',
                    'Optional jetting nozzle for stubborn deposits at nipple shoulders.'
                ],
                wellControl: [
                    'CT BOP 7-1/16" 10k with ram locks engaged; annular packer lubricated for high temp operations.',
                    'Gas detection enhanced due to potential VOC release from solvent.',
                    'Emergency shutdown integrates chemical pumps and CT injector stop.'
                ],
                completion: [
                    'Post-job spinner survey to confirm full bore flow restored.',
                    'Update flow assurance model and restart plan to include insulation and chemical dosing.',
                    'Schedule monitoring checks at 30/60/90 days to ensure wax does not re-accumulate.'
                ]
            },
            contingencies: [
                'If solvent returns excessive wax, divert through filtration skid to avoid plugging separator.',
                'Deploy heating blankets on surface tubulars if ambient drops below 40°F during job.',
                'Have coiled tubing milling head on standby if scraper cannot remove hardened deposits.'
            ]
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
    const handoverPackages = {
        obj1: {
            readiness: {
                binderId: 'W666-INT-24-01',
                operationsLead: 'Elena Marsh',
                qaLead: 'M. Singh',
                goLive: '18 Apr 2024',
                closeout: '22 Apr 2024',
                knowledgeSync: 'Digital twin + analyzer bundle queued',
                summary: 'Expandable patch program handover is staged for integrity and production sign-off.',
                metrics: [
                    { label: 'Program Duration', value: '8 days', context: 'Matches approved readiness schedule.' },
                    { label: 'AFE vs. Actual', value: '$1.20MM / $1.08MM', context: 'Projected 10% underrun before final tickets.' },
                    { label: 'Lessons Logged', value: '5 entries', context: 'Auto-synced to the completions knowledge base.' }
                ]
            },
            deliverables: [
                { title: 'As-built expandable patch schematic', owner: 'Wellsite Engineer', due: '18 Apr 2024', status: 'Complete', channel: 'Engineering Vault' },
                { title: 'Barrier restoration certificate', owner: 'Well Examiner', due: '19 Apr 2024', status: 'In Progress', channel: 'Integrity Hub' },
                { title: 'Digital twin sync package', owner: 'Data Engineer', due: '20 Apr 2024', status: 'Scheduled', channel: 'AI Knowledge Base' }
            ],
            signoffs: [
                { role: 'Operations Manager', name: 'L. Ramirez', status: 'Approved', timestamp: 'Signed 17 Apr 2024 09:20 UTC' },
                { role: 'Integrity Authority', name: 'M. Singh', status: 'Pending', timestamp: 'Due after caliper validation' },
                { role: 'Production Superintendent', name: 'I. Yamada', status: 'At Risk', timestamp: 'Awaiting rate stabilisation sample' }
            ],
            automations: [
                { name: 'Vendor performance scorecard', status: 'Generated', detail: 'Export pushed to commercial dashboard for variance review.' },
                { name: 'LangExtract citation bundle', status: 'In Progress', detail: 'Annotating final soak data prior to blockchain notarisation.' }
            ],
            notes: [
                'Schedule final caliper validation before integrity sign-off.',
                'Synchronise live operations log with analyzer prior to archiving.',
                'Share torque-turn learnings with completions community channel.'
            ]
        },
        obj2: {
            readiness: {
                binderId: 'W666-INT-24-02',
                operationsLead: 'Noor Patel',
                qaLead: 'R. Gallagher',
                goLive: '21 Apr 2024',
                closeout: '25 Apr 2024',
                knowledgeSync: 'Chemical usage ledger reconciled with finance',
                summary: 'Scale removal closeout emphasises solvent reconciliation and flow assurance monitoring.',
                metrics: [
                    { label: 'Program Duration', value: '6 days', context: 'Includes 36 hr soak and QA window.' },
                    { label: 'Waste Recovery', value: '18.4 t captured', context: 'Closed-loop handling verified by ESG office.' },
                    { label: 'Return to Production', value: '+165% uplift', context: 'Post-job test logged for economics team.' }
                ]
            },
            deliverables: [
                { title: 'Tubing condition & drift report', owner: 'Flow Assurance Engineer', due: '22 Apr 2024', status: 'Complete', channel: 'Production Fileshare' },
                { title: 'Chemical reconciliation workbook', owner: 'Finance Analyst', due: '23 Apr 2024', status: 'In Progress', channel: 'Commercial Ledger' },
                { title: 'Lessons learned submission', owner: 'CT Supervisor', due: '24 Apr 2024', status: 'Pending', channel: 'Knowledge Base' }
            ],
            signoffs: [
                { role: 'HSE Advisor', name: 'K. Okoye', status: 'Approved', timestamp: 'Safety log cleared 21 Apr 2024' },
                { role: 'Production Engineer', name: 'S. Thorsen', status: 'Pending', timestamp: 'Awaiting 72 hr stabilised data' },
                { role: 'Sustainability Lead', name: 'G. Alvarez', status: 'Scheduled', timestamp: 'ESG review on 24 Apr 2024' }
            ],
            automations: [
                { name: 'Solvent disposal compliance check', status: 'In Progress', detail: 'Regulatory upload pending final lab certs.' },
                { name: 'Digital twin flow regime replay', status: 'Generated', detail: 'Simulator snapshots exported to AI advisor for benchmarking.' }
            ],
            notes: [
                'Confirm inhibitor dosing schedule is live before production ramp-up.',
                'Upload jetting telemetry to anomaly detection model training set.',
                'Coordinate CT crew debrief with wax removal task force.'
            ]
        },
        obj3: {
            readiness: {
                binderId: 'W666-INT-24-03',
                operationsLead: 'Mateo Rojas',
                qaLead: 'P. Chidike',
                goLive: '16 Apr 2024',
                closeout: '18 Apr 2024',
                knowledgeSync: 'Barrier compliance ledger waiting final regulator note',
                summary: 'Insert safety valve installation focuses on compliance evidence and remote monitoring setup.',
                metrics: [
                    { label: 'Program Duration', value: '3 days', context: 'Single-run slickline campaign verified.' },
                    { label: 'Barrier Assurance', value: '95% confidence', context: 'Matches sustainability readiness card.' },
                    { label: 'Remote Coverage', value: '100% telemetry', context: 'Valve linked to blockchain control contract.' }
                ]
            },
            deliverables: [
                { title: 'Barrier reinstatement package', owner: 'Integrity Engineer', due: '17 Apr 2024', status: 'Complete', channel: 'Integrity Hub' },
                { title: 'Regulatory notification letter', owner: 'Compliance Lead', due: '18 Apr 2024', status: 'Awaiting QA', channel: 'Regulatory Workspace' },
                { title: 'Telemetry onboarding checklist', owner: 'Controls Engineer', due: '18 Apr 2024', status: 'In Progress', channel: 'Controls Portal' }
            ],
            signoffs: [
                { role: 'Well Examiner', name: 'A. Fraser', status: 'Approved', timestamp: 'Barrier sign-off logged 16 Apr 2024' },
                { role: 'Regulator Liaison', name: 'H. Biswas', status: 'Pending', timestamp: 'Submission queued for 18 Apr 2024' },
                { role: 'Operations Superintendent', name: 'C. Wells', status: 'Approved', timestamp: 'Operational acceptance recorded' }
            ],
            automations: [
                { name: 'Valve telemetry heartbeat', status: 'Generated', detail: 'Smart valve reporting cadence synced with AI advisor.' },
                { name: 'Barrier compliance notarisation', status: 'In Progress', detail: 'Blockchain contract awaiting regulator acknowledgement.' }
            ],
            notes: [
                'Confirm remote control handshake before returning well to autonomous mode.',
                'Archive negative test trace with annotations in analyzer workspace.',
                'Brief regulator on blockchain verification dashboard access.'
            ]
        },
        obj4: {
            readiness: {
                binderId: 'W666-INT-24-04',
                operationsLead: 'Renee Dupont',
                qaLead: 'D. Sato',
                goLive: '24 Apr 2024',
                closeout: '30 Apr 2024',
                knowledgeSync: 'Sand control model merged with simulator baseline',
                summary: 'Expandable sand screen closeout aligns production restart, ESG metrics, and logistics demob.',
                metrics: [
                    { label: 'Program Duration', value: '10 days', context: 'Includes sand cleanout contingency buffer.' },
                    { label: 'Material Reuse', value: '81%', context: 'Matches sustainability material retention metric.' },
                    { label: 'Vendor Scorecards', value: '3 issued', context: 'Shared with commercial and ESG liaisons.' }
                ]
            },
            deliverables: [
                { title: 'ESS expansion verification log', owner: 'Completion Engineer', due: '26 Apr 2024', status: 'In Progress', channel: 'Completion Vault' },
                { title: 'Sand management restart plan', owner: 'Production Engineer', due: '27 Apr 2024', status: 'Pending', channel: 'Production Workspace' },
                { title: 'Vendor debrief minutes', owner: 'Operations Coordinator', due: '28 Apr 2024', status: 'Scheduled', channel: 'Collaboration Hub' }
            ],
            signoffs: [
                { role: 'Production Manager', name: 'S. Idris', status: 'Pending', timestamp: 'Restart review booked 27 Apr 2024' },
                { role: 'ESG Office', name: 'L. Navarro', status: 'Scheduled', timestamp: 'Sustainability audit on 29 Apr 2024' },
                { role: 'Operations Manager', name: 'W. Chen', status: 'In Progress', timestamp: 'Monitoring sand trend delta vs. model' }
            ],
            automations: [
                { name: 'Anomaly model retraining', status: 'In Progress', detail: 'Feeding sand rate data into live simulator guardrails.' },
                { name: 'Logistics demob tracker', status: 'Generated', detail: 'Auto-updates vessel and HWU release in logistics workspace.' }
            ],
            notes: [
                'Ensure flowback team reviews updated sand threshold guardrails.',
                'Capture thermal cycling data for future expandable hardware campaigns.',
                'Confirm demobilisation aligns with marine slot to avoid standby fees.'
            ]
        },
        obj5: {
            readiness: {
                binderId: 'W666-INT-24-05',
                operationsLead: 'Chiara Rossi',
                qaLead: 'N. Beaumont',
                goLive: '12 Apr 2024',
                closeout: '15 Apr 2024',
                knowledgeSync: 'Wax analytics pushed to AI advisor',
                summary: 'Wax removal handover captures thermal learnings and inhibitor strategy updates.',
                metrics: [
                    { label: 'Program Duration', value: '4 days', context: 'Thermal soak and scraper passes completed as planned.' },
                    { label: 'Energy Intensity', value: '−18%', context: 'Aligns with sustainability energy reduction target.' },
                    { label: 'Recovered Wax', value: '7.4 t', context: 'Prepared for reuse in inhibitor blend.' }
                ]
            },
            deliverables: [
                { title: 'Thermal profile & heater runtime log', owner: 'CT Engineer', due: '13 Apr 2024', status: 'Complete', channel: 'Thermal Lab' },
                { title: 'Inhibitor program update', owner: 'Flow Assurance Lead', due: '14 Apr 2024', status: 'In Progress', channel: 'Production Workspace' },
                { title: 'Recovered wax disposition form', owner: 'ESG Analyst', due: '15 Apr 2024', status: 'Pending', channel: 'ESG Vault' }
            ],
            signoffs: [
                { role: 'Production Superintendent', name: 'J. Rahman', status: 'Approved', timestamp: 'Ramp-up authorised 13 Apr 2024' },
                { role: 'ESG Coordinator', name: 'F. Ogun', status: 'Pending', timestamp: 'Awaiting waste tracking upload' },
                { role: 'Chemicals Vendor', name: 'A. Duarte', status: 'Approved', timestamp: 'Performance warranty accepted' }
            ],
            automations: [
                { name: 'Heater efficiency replay', status: 'Generated', detail: 'Energy analytics exported to sustainability dashboard.' },
                { name: 'Wax recovery ledger', status: 'In Progress', detail: 'Final weights validating before blockchain notarisation.' }
            ],
            notes: [
                'Confirm inhibitor storage temperature sensors are recalibrated post-job.',
                'Share heater efficiency curves with operations simulator library.',
                'Notify ESG partners once recovered wax shipment is manifested.'
            ]
        }
    };

    const objectiveEquipmentRequirements = {
        obj1: [ { name: "Hydraulic Workover Unit (HWU)", source: "Vendor", price: 300000 }, { name: "Expandable Steel Patch & Setting Tool", source: "Vendor", price: 500000 } ],
        obj2: [ { name: "Coiled Tubing Unit", source: "Vendor", price: 125000 }, { name: "Rotating Jetting Nozzle", source: "Vendor", price: 25000 }, { name: "DTPA Chemical", source: "Vendor", price: 80000 } ],
        obj3: [ { name: "Slickline Unit", source: "Vendor", price: 75000 }, { name: "Insert Safety Valve (WRSV)", source: "Vendor", price: 150000 }, { name: "Lock-Open Tool", source: "Vendor", price: 20000 } ],
        obj4: [ { name: "Hydraulic Workover Unit (HWU)", source: "Vendor", price: 300000 }, { name: "Expandable Sand Screen & Expansion Tool", source: "Vendor", price: 600000 } ],
        obj5: [ { name: "Coiled Tubing Unit", source: "Vendor", price: 125000 }, { name: "Wax Dissolver Chemical", source: "Vendor", price: 50000 }, { name: "Mechanical Scraper BHA", source: "Vendor", price: 15000 } ]
    };

    const fallbackEquipmentData = [
        { id: 'CTU-01', type: 'Coiled Tubing Unit', category: 'Coiled Tubing', vendor: 'Baker Hughes', location: 'Onboard - Deck A', testStatus: 'Passed', nextMaint: '2025-09-15', rate: 25000, status: 'On Job', notes: '1.75in OD, 15k psi rated spread' },
        { id: 'CTU-02', type: 'Coiled Tubing Unit', category: 'Coiled Tubing', vendor: 'Archer', location: 'Onshore Base', testStatus: 'Passed', nextMaint: '2025-07-10', rate: 24000, status: 'Available', notes: '2.0in OD, 18kft reel' },
        { id: 'WL-01', type: 'Wireline Unit', category: 'Wireline', vendor: 'Halliburton', location: 'Onshore Base', testStatus: 'Passed', nextMaint: '2025-08-22', rate: 18000, status: 'Available', notes: '7-conductor, deep HPHT spec' },
        { id: 'SL-01', type: 'Slickline Unit', category: 'Wireline', vendor: 'SLB', location: 'In Transit', testStatus: 'Passed', nextMaint: '2025-07-20', rate: 15000, status: 'In Transit', notes: '0.108in alloy line, 18kft' },
        { id: 'HWU-01', type: 'Hydraulic Workover Unit', category: 'Lifting', vendor: 'Key Energy', location: 'Onshore Base', testStatus: 'Pending', nextMaint: '2025-10-01', rate: 32000, status: 'Standby', notes: '350k lb jack, self-contained' },
        { id: 'PUMP-01', type: 'High-Pressure Pumps', category: 'Pumping', vendor: 'NOV', location: 'Onboard - Pump Room', testStatus: 'Pending', nextMaint: '2025-10-01', rate: 8000, status: 'On Job', notes: '10k psi twin triplex' },
        { id: 'PUMP-02', type: 'High-Pressure Pumps', category: 'Pumping', vendor: 'NOV', location: 'Onshore Base', testStatus: 'Passed', nextMaint: '2025-11-05', rate: 8200, status: 'Available', notes: 'Spare unit with full certification' },
        { id: 'JET-01', type: 'Rotating Jetting Nozzle', category: 'Downhole Tools', vendor: 'NOV', location: 'Tool House', testStatus: 'Passed', nextMaint: '2025-07-30', rate: 4500, status: 'Available', notes: 'High-energy jetting head for CT scale removal' },
        { id: 'SCR-01', type: 'Mechanical Scraper BHA', category: 'Downhole Tools', vendor: 'Weatherford', location: 'Tool House', testStatus: 'Passed', nextMaint: '2025-08-15', rate: 6000, status: 'Available', notes: '4.5in OD coil-ready scraper assembly' },
        { id: 'CHEM-01', type: 'Wax Dissolver Chemical', category: 'Chemicals', vendor: 'ChampionX', location: 'Chemical Lab', testStatus: 'Passed', nextMaint: '2025-08-05', rate: 4200, status: 'Available', notes: 'High-temp solvent blend' },
        { id: 'CHEM-02', type: 'DTPA Chemical', category: 'Chemicals', vendor: 'Baker Hughes', location: 'Chemical Lab', testStatus: 'Passed', nextMaint: '2025-08-20', rate: 5200, status: 'Available', notes: 'Chelating acid blend for scale removal' },
        { id: 'WRSV-01', type: 'Insert Safety Valve (WRSV)', category: 'Well Control', vendor: 'Baker Hughes', location: 'Vendor - Houston', testStatus: 'Passed', nextMaint: '2025-12-01', rate: 42000, status: 'Available', notes: 'HPHT qualified 4.5in valve' },
        { id: 'LOT-01', type: 'Lock-Open Tool', category: 'Wireline Tools', vendor: 'SLB', location: 'Tool House', testStatus: 'Passed', nextMaint: '2025-06-28', rate: 3200, status: 'Available', notes: 'Heavy-duty lock-open tool' },
        { id: 'PATCH-01', type: 'Expandable Patch 9in', category: 'Mechanical', vendor: 'Enventure', location: 'Vendor Warehouse - Aberdeen', testStatus: 'Pending', nextMaint: '2025-09-30', rate: 0, status: 'Maintenance', notes: '80ft expandable casing patch' },
        { id: 'PATCH-02', type: 'Expandable Steel Patch & Setting Tool', category: 'Mechanical', vendor: 'Enventure', location: 'Vendor Warehouse - Aberdeen', testStatus: 'Pending', nextMaint: '2025-10-12', rate: 0, status: 'Maintenance', notes: 'Requires vendor specialist crew' },
        { id: 'ESS-01', type: 'Expandable Sand Screen', category: 'Sand Control', vendor: 'Halliburton', location: 'Vendor Warehouse - Stavanger', testStatus: 'Pending', nextMaint: '2025-09-12', rate: 0, status: 'Maintenance', notes: 'Through-tubing ESS assembly' },
        { id: 'ESS-02', type: 'Expandable Sand Screen & Expansion Tool', category: 'Sand Control', vendor: 'Baker Hughes', location: 'Vendor Warehouse - Stavanger', testStatus: 'Pending', nextMaint: '2025-09-18', rate: 0, status: 'Maintenance', notes: 'Expansion tool requires mobilised crew' }
    ];

    const fallbackPersonnelData = [
        { id: 'P001', name: 'Bob Raker', role: 'Wellsite Engineer', company: 'Operator', status: 'Onboard', certsValid: true, rate: 3600, perDiem: 200, muster: 'A', lifeboat: 1 },
        { id: 'P002', name: 'Jane Smith', role: 'Coiled Tubing Supervisor', company: 'Service Co.', status: 'Onboard', certsValid: true, rate: 2280, perDiem: 180, muster: 'A', lifeboat: 1 },
        { id: 'P003', name: 'Mike Johnson', role: 'Wireline Engineer', company: 'Service Co.', status: 'On Job', certsValid: true, rate: 2640, perDiem: 180, muster: 'B', lifeboat: 2 },
        { id: 'P004', name: 'Emily White', role: 'Slickline Supervisor', company: 'Service Co.', status: 'Available', certsValid: false, rate: 2300, perDiem: 150, muster: 'B', lifeboat: 2 },
        { id: 'P005', name: 'Chris Green', role: 'Pump Operator', company: 'Service Co.', status: 'In Transit', certsValid: true, rate: 1560, perDiem: 150, muster: 'A', lifeboat: 1 },
        { id: 'P006', name: 'Alex Brown', role: 'HWU Supervisor', company: 'Service Co.', status: 'Standby', certsValid: true, rate: 2280, perDiem: 180, muster: 'C', lifeboat: 3 },
        { id: 'P007', name: 'David Chen', role: 'Rig Supervisor', company: 'Operator', status: 'Onboard', certsValid: true, rate: 3000, perDiem: 200, muster: 'B', lifeboat: 2 }
    ];

    let equipmentData = fallbackEquipmentData.map(item => ({ ...item }));
    let personnelData = fallbackPersonnelData.map(person => ({ ...person }));
    let serviceLineTemplatesIndex = {};
    let equipmentCatalogIndex = {};

    const objectiveTemplateMap = {
        obj1: 'spec_multi_intervention',
        obj2: 'ct_scale_removal',
        obj3: 'whm_safety_valve',
        obj4: 'whm_completion_standard',
        obj5: 'ct_wellbore_cleanout'
    };

    const normalizeString = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    const toStatusClass = (value) => normalizeString(value).replace(/\s+/g, '');

    const formatCurrency = (value) => {
        const number = Number(value);
        if (!number || Number.isNaN(number)) return '—';
        return `$${Math.round(number).toLocaleString()}`;
    };

    const equipmentSynonyms = new Map([
        [normalizeString('Hydraulic Workover Unit (HWU)'), ['hydraulic workover unit', 'workover unit', 'hwu']],
        [normalizeString('Expandable Steel Patch & Setting Tool'), ['expandable patch', 'setting tool']],
        [normalizeString('Expandable Sand Screen & Expansion Tool'), ['expandable sand screen', 'ess']],
        [normalizeString('Coiled Tubing Unit'), ['coiled tubing', 'ct unit']],
        [normalizeString('Slickline Unit'), ['slickline', 'wireline']],
        [normalizeString('Insert Safety Valve (WRSV)'), ['safety valve', 'wrs v', 'wireline retrievable safety valve']],
        [normalizeString('Lock-Open Tool'), ['lock open', 'lockopen']],
        [normalizeString('DTPA Chemical'), ['dtpa', 'chemical']],
        [normalizeString('Wax Dissolver Chemical'), ['wax dissolver', 'chemical']],
        [normalizeString('Mechanical Scraper BHA'), ['scraper', 'bha']],
        [normalizeString('Rotating Jetting Nozzle'), ['jetting nozzle', 'rotary nozzle']],
        [normalizeString('High-Pressure Pumps'), ['high pressure pump', 'pump']]
    ]);

    const personnelRoleSynonyms = new Map([
        [normalizeString('Slickline Supervisor'), ['wireline supervisor', 'wireline engineer']],
        [normalizeString('Wireline Supervisor'), ['wireline engineer', 'wireline operator']],
        [normalizeString('Rig Supervisor'), ['toolpusher']],
        [normalizeString('HWU Supervisor'), ['hydraulic workover', 'hwu supervisor']]
    ]);

    const matchesEquipmentRequirement = (requiredName, equipmentItem) => {
        if (!requiredName || !equipmentItem) return false;
        const normalizedRequired = normalizeString(requiredName);
        const normalizedType = normalizeString(equipmentItem.type);
        const normalizedCategory = normalizeString(equipmentItem.category);
        if (normalizedType.includes(normalizedRequired) || normalizedRequired.includes(normalizedType)) return true;
        if (normalizedCategory && (normalizedCategory.includes(normalizedRequired) || normalizedRequired.includes(normalizedCategory))) return true;
        const synonyms = equipmentSynonyms.get(normalizedRequired);
        if (synonyms) {
            return synonyms.some(syn => normalizedType.includes(syn) || normalizedCategory.includes(syn));
        }
        return false;
    };

    const matchesPersonnelRole = (requiredRole, person) => {
        if (!requiredRole || !person) return false;
        const normalizedRequired = normalizeString(requiredRole);
        const normalizedRole = normalizeString(person.role);
        if (normalizedRequired === normalizedRole) return true;
        if (normalizedRole.includes(normalizedRequired) || normalizedRequired.includes(normalizedRole)) return true;
        const synonyms = personnelRoleSynonyms.get(normalizedRequired);
        return synonyms ? synonyms.some(syn => normalizedRole.includes(syn)) : false;
    };

    const findMatchingEquipment = (requiredName) => {
        const candidates = equipmentData.filter(item => matchesEquipmentRequirement(requiredName, item));
        if (!candidates.length) return null;
        return candidates.slice().sort((a, b) => {
            const score = (item) => {
                switch ((item.status || '').toLowerCase()) {
                    case 'available':
                        return 0;
                    case 'standby':
                        return 1;
                    case 'on job':
                        return 2;
                    default:
                        return 3;
                }
            };
            return score(a) - score(b);
        })[0];
    };

    const getServiceTemplateForObjective = (objectiveId) => {
        const templateKey = objectiveTemplateMap[objectiveId];
        if (!templateKey) return null;
        return serviceLineTemplatesIndex[templateKey] || null;
    };

    const resolveVendor = (name) => {
        const match = findMatchingEquipment(name);
        return match && match.vendor ? match.vendor : 'Vendor TBD';
    };

    const parseCsv = (text) => {
        const rows = [];
        let current = '';
        let currentRow = [];
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                if (inQuotes && text[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(current.trim());
                current = '';
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && text[i + 1] === '\n') i++;
                currentRow.push(current.trim());
                if (currentRow.some(value => value !== '')) {
                    rows.push(currentRow);
                }
                current = '';
                currentRow = [];
            } else {
                current += char;
            }
        }
        if (current !== '' || currentRow.length) {
            currentRow.push(current.trim());
            rows.push(currentRow);
        }
        if (!rows.length) return [];
        const headers = rows.shift();
        return rows.map(row => {
            const record = {};
            headers.forEach((header, index) => {
                record[header] = row[index] || '';
            });
            return record;
        });
    };

    const deriveMaintenanceDate = (index) => {
        const base = new Date(Date.UTC(2025, 0, 15));
        base.setDate(base.getDate() + (index + 1) * 11);
        return base.toISOString().split('T')[0];
    };

    const mergeEquipmentCsvData = (csvText) => {
        const records = parseCsv(csvText);
        if (!records.length) return;
        const statusCycle = ['Available', 'On Job', 'Maintenance', 'In Transit', 'Standby'];
        const testCycle = ['Passed', 'Pending'];
        records.forEach((row, index) => {
            const record = {
                id: row['Equipment_ID'] || `EQ-${index + 101}`,
                type: row['Item_Name'] || row['Category'] || 'Equipment',
                category: row['Category'] || 'General',
                vendor: row['Vendor'] || 'Vendor TBD',
                location: row['Vendor'] ? `Vendor - ${row['Vendor']}` : 'Warehouse',
                testStatus: testCycle[index % testCycle.length],
                nextMaint: deriveMaintenanceDate(index),
                rate: Number(row['Daily_Rate_USD']) || 0,
                status: statusCycle[index % statusCycle.length],
                notes: row['Specifications'] || row['Typical_Use'] || ''
            };
            const normalizedType = normalizeString(record.type);
            const existing = equipmentData.find(item => normalizeString(item.type) === normalizedType);
            if (existing) {
                Object.assign(existing, { ...record, id: existing.id || record.id });
            } else {
                equipmentData.push(record);
            }
        });
    };

    const mergePersonnelCsvData = (csvText) => {
        const records = parseCsv(csvText);
        if (!records.length) return;
        const statusCycle = ['Onboard', 'Available', 'On Job', 'Standby', 'In Transit'];
        const musterCycle = ['A', 'B', 'C'];
        const lifeboatCycle = [1, 2, 3];
        const sampleNames = [
            'Jordan Chen', 'Priya Desai', 'Lucia Gomez', 'Amir Hassan',
            'Morgan Lee', 'Noah Patel', 'Sofia Rossi', 'Theo Schmidt',
            'Nora Williams', 'Ethan Young'
        ];
        records.forEach((row, index) => {
            const normalizedRole = normalizeString(row['Role_Title']);
            const existing = personnelData.find(person => normalizeString(person.role) === normalizedRole);
            const record = {
                id: row['Role_ID'] || `P-${index + 101}`,
                role: row['Role_Title'] || 'Crew Member',
                company: row['Category'] && row['Category'].toLowerCase().includes('engineering') ? 'Operator' : 'Service Co.',
                status: statusCycle[index % statusCycle.length],
                certsValid: ((index + normalizedRole.length) % 4) !== 0,
                rate: Number(row['Daily_Rate_USD']) || 0,
                perDiem: Number(row['Per_Diem_USD']) || 0,
                muster: musterCycle[index % musterCycle.length],
                lifeboat: lifeboatCycle[index % lifeboatCycle.length],
                certifications: row['Certifications_Required'] || ''
            };
            if (existing) {
                const preservedName = existing.name;
                Object.assign(existing, record, { name: preservedName });
            } else {
                record.name = sampleNames[index % sampleNames.length];
                personnelData.push(record);
            }
        });
    };

    const buildServiceLineIndex = (data) => {
        const index = {};
        Object.entries(data || {}).forEach(([categoryKey, payload]) => {
            const categoryName = payload.name || categoryKey;
            (payload.templates || []).forEach(template => {
                index[template.id] = { ...template, category: categoryName };
            });
        });
        return index;
    };

    const buildEquipmentCatalogIndex = (data) => {
        const index = {};
        Object.values(data || {}).forEach(category => {
            const categoryName = category.name || 'Catalog';
            (category.items || []).forEach(item => {
                index[item.id] = { ...item, categoryName };
            });
        });
        return index;
    };

    const musterStations = [
        { id: 'A', name: 'Muster Station A', capacity: 50, current: 0 },
        { id: 'B', name: 'Muster Station B', capacity: 50, current: 0 },
        { id: 'C', name: 'Muster Station C', capacity: 40, current: 0 }
    ];
    
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

    const createWellFilters = () => ({ query: '', focus: 'all', themes: new Set() });

    const createInitialAppState = () => ({
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
        pob: { musterActive: false, musterInterval: null, personnel: [] },
        dataExportHandlersBound: false,
        wellFilters: createWellFilters(),
        handoverReady: false,
        planBroadcastKey: null
    });

    const appState = createInitialAppState();

    // --- DOM ELEMENTS ---

    const body = document.body;
    const welcomeScreen = document.getElementById('welcome-screen');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const views = document.querySelectorAll('.view-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const alwaysAccessibleViews = new Set(['home', 'planner', 'toolstring', 'christmas-tree', 'data', 'about', 'faq', 'whitepaper', 'security']);
    const headerTitle = document.getElementById('header-title');
    const headerDetails = document.getElementById('header-details');
    const headerNav = document.getElementById('header-nav');
    const dataExportHub = document.getElementById('data-export-hub');
    const dataExportSchemas = {
        'data-well-666.csv': [
            {
                name: 'Section',
                sqlType: 'TEXT',
                description: 'Top-level grouping that distinguishes general attributes, historical events, and completion data.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Context-specific subcategory such as a specific date, equipment type, or tubing component.'
            },
            {
                name: 'Attribute',
                sqlType: 'TEXT',
                description: 'Attribute name within the category (e.g., Operation, Problem, Equipment item).'
            },
            {
                name: 'Value',
                sqlType: 'TEXT',
                description: 'Human-readable detail or measurement describing the attribute.'
            }
        ],
        'data-well-portfolio.csv': [
            {
                name: 'ID',
                sqlType: 'VARCHAR(10)',
                description: 'Well identifier or case study reference code.'
            },
            {
                name: 'Name',
                sqlType: 'TEXT',
                description: 'Well nickname or case study headline.'
            },
            {
                name: 'Field',
                sqlType: 'TEXT',
                description: 'Field where the operation occurred.'
            },
            {
                name: 'Region',
                sqlType: 'TEXT',
                description: 'Geographic basin or operating area.'
            },
            {
                name: 'Well Type',
                sqlType: 'TEXT',
                description: 'Primary production type for the well (e.g., HPHT Gas Condensate).'
            },
            {
                name: 'Measured Depth (ft)',
                sqlType: 'INTEGER',
                description: 'Reported measured depth of the wellbore in feet.'
            },
            {
                name: 'Current Status',
                sqlType: 'TEXT',
                description: 'Operational state summarising if the well is active, shut-in, or restored.'
            },
            {
                name: 'Primary Narrative',
                sqlType: 'TEXT',
                description: 'Summary of the dominant challenge or solution story.'
            },
            {
                name: 'Key Lessons Learned',
                sqlType: 'TEXT',
                description: 'Distilled learnings or recommendations captured from the case study.'
            }
        ],
        'data-activity-cost-rates.csv': [
            {
                name: 'Activity_Code',
                sqlType: 'VARCHAR(12)',
                description: 'Unique identifier that maps to the intervention activity catalog.'
            },
            {
                name: 'Activity_Name',
                sqlType: 'TEXT',
                description: 'Human-readable description of the activity to schedule.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Operational grouping such as Surveillance, Barriers, or Evaluation.'
            },
            {
                name: 'Typical_Duration_Hours',
                sqlType: 'INTEGER',
                description: 'Expected duration in hours for planning cycle estimates.'
            },
            {
                name: 'Base_Cost_USD',
                sqlType: 'INTEGER',
                description: 'Baseline activity cost before contingency or risk multipliers.'
            },
            {
                name: 'Equipment_Primary',
                sqlType: 'TEXT',
                description: 'Primary equipment identifier(s) required to execute the activity.'
            },
            {
                name: 'Personnel_Primary',
                sqlType: 'TEXT',
                description: 'Key personnel identifiers typically assigned to the activity.'
            },
            {
                name: 'Personnel_Count',
                sqlType: 'INTEGER',
                description: 'Total number of people expected on task.'
            },
            {
                name: 'Consumables_Typical',
                sqlType: 'TEXT',
                description: 'Consumable IDs or notes that inform cost burn rates.'
            },
            {
                name: 'Risk_Factor',
                sqlType: 'TEXT',
                description: 'Qualitative risk flag to guide contingency planning.'
            },
            {
                name: 'NPT_Risk_Percent',
                sqlType: 'INTEGER',
                description: 'Non-productive time probability expressed as a percent.'
            }
        ],
        'data-equipment-tools.csv': [
            {
                name: 'Equipment_ID',
                sqlType: 'VARCHAR(12)',
                description: 'Primary key for the equipment catalog entry.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Equipment grouping such as Wireline Unit or Coiled Tubing.'
            },
            {
                name: 'Item_Name',
                sqlType: 'TEXT',
                description: 'Specific tool or equipment description.'
            },
            {
                name: 'Vendor',
                sqlType: 'TEXT',
                description: 'Supplier or service company providing the asset.'
            },
            {
                name: 'Daily_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Standard daily rental rate in US dollars.'
            },
            {
                name: 'Mobilization_USD',
                sqlType: 'INTEGER',
                description: 'Mobilization charge to move equipment to site.'
            },
            {
                name: 'Demobilization_USD',
                sqlType: 'INTEGER',
                description: 'Demobilization charge to return equipment after operations.'
            },
            {
                name: 'Standby_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Daily standby cost when the asset is idle.'
            },
            {
                name: 'Min_Rental_Days',
                sqlType: 'INTEGER',
                description: 'Minimum contractual rental period in days.'
            },
            {
                name: 'Specifications',
                sqlType: 'TEXT',
                description: 'Key technical specifications such as capacity or limits.'
            },
            {
                name: 'Typical_Use',
                sqlType: 'TEXT',
                description: 'Common operational scenarios for the equipment.'
            }
        ],
        'data-personnel-rates.csv': [
            {
                name: 'Role_ID',
                sqlType: 'VARCHAR(12)',
                description: 'Primary key used to cross-reference planner staffing tables.'
            },
            {
                name: 'Role_Title',
                sqlType: 'TEXT',
                description: 'Position title for the role or discipline.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Functional grouping such as Engineering or Technical.'
            },
            {
                name: 'Hourly_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Standard hourly billing rate in US dollars.'
            }
        ],
        'data-well-portfolio.csv': [
            {
                name: 'ID',
                sqlType: 'VARCHAR(10)',
                description: 'Well identifier or case study reference code.'
            },
            {
                name: 'Name',
                sqlType: 'TEXT',
                description: 'Well nickname or case study headline.'
            },
            {
                name: 'Field',
                sqlType: 'TEXT',
                description: 'Field where the operation occurred.'
            },
            {
                name: 'Region',
                sqlType: 'TEXT',
                description: 'Geographic basin or operating area.'
            },
            {
                name: 'Well Type',
                sqlType: 'TEXT',
                description: 'Primary production type for the well (e.g., HPHT Gas Condensate).'
            },
            {
                name: 'Measured Depth (ft)',
                sqlType: 'INTEGER',
                description: 'Reported measured depth of the wellbore in feet.'
            },
            {
                name: 'Current Status',
                sqlType: 'TEXT',
                description: 'Operational state summarising if the well is active, shut-in, or restored.'
            },
            {
                name: 'Primary Narrative',
                sqlType: 'TEXT',
                description: 'Summary of the dominant challenge or solution story.'
            },
            {
                name: 'Key Lessons Learned',
                sqlType: 'TEXT',
                description: 'Distilled learnings or recommendations captured from the case study.'
            }
        ],
        'data-activity-cost-rates.csv': [
            {
                name: 'Activity_Code',
                sqlType: 'VARCHAR(12)',
                description: 'Unique identifier that maps to the intervention activity catalog.'
            },
            {
                name: 'Activity_Name',
                sqlType: 'TEXT',
                description: 'Human-readable description of the activity to schedule.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Operational grouping such as Surveillance, Barriers, or Evaluation.'
            },
            {
                name: 'Typical_Duration_Hours',
                sqlType: 'INTEGER',
                description: 'Expected duration in hours for planning cycle estimates.'
            },
            {
                name: 'Base_Cost_USD',
                sqlType: 'INTEGER',
                description: 'Baseline activity cost before contingency or risk multipliers.'
            },
            {
                name: 'Equipment_Primary',
                sqlType: 'TEXT',
                description: 'Primary equipment identifier(s) required to execute the activity.'
            },
            {
                name: 'Personnel_Primary',
                sqlType: 'TEXT',
                description: 'Key personnel identifiers typically assigned to the activity.'
            },
            {
                name: 'Personnel_Count',
                sqlType: 'INTEGER',
                description: 'Total number of people expected on task.'
            },
            {
                name: 'Consumables_Typical',
                sqlType: 'TEXT',
                description: 'Consumable IDs or notes that inform cost burn rates.'
            },
            {
                name: 'Risk_Factor',
                sqlType: 'TEXT',
                description: 'Qualitative risk flag to guide contingency planning.'
            },
            {
                name: 'NPT_Risk_Percent',
                sqlType: 'INTEGER',
                description: 'Non-productive time probability expressed as a percent.'
            }
        ],
        'data-equipment-tools.csv': [
            {
                name: 'Equipment_ID',
                sqlType: 'VARCHAR(12)',
                description: 'Primary key for the equipment catalog entry.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Equipment grouping such as Wireline Unit or Coiled Tubing.'
            },
            {
                name: 'Item_Name',
                sqlType: 'TEXT',
                description: 'Specific tool or equipment description.'
            },
            {
                name: 'Vendor',
                sqlType: 'TEXT',
                description: 'Supplier or service company providing the asset.'
            },
            {
                name: 'Daily_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Standard daily rental rate in US dollars, used as the baseline for full-shift planning.'
            },
            {
                name: 'Mobilization_USD',
                sqlType: 'INTEGER',
                description: 'Mobilization stipend typically invoiced per assignment.'
            },
            {
                name: 'Per_Diem_USD',
                sqlType: 'INTEGER',
                description: 'Per diem allowance per day on location.'
            },
            {
                name: 'Min_Call_Days',
                sqlType: 'INTEGER',
                description: 'Minimum guaranteed billing days per deployment.'
            },
            {
                name: 'Certifications_Required',
                sqlType: 'TEXT',
                description: 'Licenses or credentials required before mobilization.'
            },
            {
                name: 'Typical_Team_Size',
                sqlType: 'TEXT',
                description: 'Typical number of personnel mobilized per role.'
            },
            {
                name: 'Demobilization_USD',
                sqlType: 'INTEGER',
                description: 'Demobilization charge to return equipment after operations.'
            },
            {
                name: 'Standby_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Daily standby cost when the asset is idle.'
            },
            {
                name: 'Min_Rental_Days',
                sqlType: 'INTEGER',
                description: 'Minimum contractual rental period in days.'
            },
            {
                name: 'Specifications',
                sqlType: 'TEXT',
                description: 'Key technical specifications such as capacity or limits.'
            },
            {
                name: 'Typical_Use',
                sqlType: 'TEXT',
                description: 'Common operational scenarios for the equipment.'
            }
        ],
        'data-personnel-rates.csv': [
            {
                name: 'Role_ID',
                sqlType: 'VARCHAR(12)',
                description: 'Primary key used to cross-reference planner staffing tables.'
            },
            {
                name: 'Role_Title',
                sqlType: 'TEXT',
                description: 'Position title for the role or discipline.'
            },
            {
                name: 'Category',
                sqlType: 'TEXT',
                description: 'Functional grouping such as Engineering or Technical.'
            },
            {
                name: 'Hourly_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Standard hourly billing rate in US dollars.'
            },
            {
                name: 'Daily_Rate_USD',
                sqlType: 'INTEGER',
                description: 'Daily rate baseline for full-shift planning.'
            },
            {
                name: 'Mobilization_USD',
                sqlType: 'INTEGER',
                description: 'Mobilization stipend typically invoiced per assignment.'
            },
            {
                name: 'Per_Diem_USD',
                sqlType: 'INTEGER',
                description: 'Per diem allowance per day on location.'
            },
            {
                name: 'Min_Call_Days',
                sqlType: 'INTEGER',
                description: 'Minimum guaranteed billing days per deployment.'
            },
            {
                name: 'Certifications_Required',
                sqlType: 'TEXT',
                description: 'Licenses or credentials required before mobilization.'
            },
            {
                name: 'Typical_Team_Size',
                sqlType: 'TEXT',
                description: 'Typical number of personnel mobilized per role.'
            }
        ]
    };
    const dataExportElements = {
        w666: {
            recordCount: document.getElementById('data-well-666-count'),
            columnsList: document.getElementById('data-well-666-columns'),
            size: document.getElementById('data-well-666-size'),
            previewHead: document.getElementById('data-well-666-preview-head'),
            previewBody: document.getElementById('data-well-666-preview-body'),
            previewNotice: document.getElementById('data-well-666-preview-notice'),
            copyButton: document.querySelector('[data-export-copy="data-well-666"]'),
            copyStatus: document.getElementById('data-well-666-copy-status'),
            curlButton: document.querySelector('[data-export-curl="data-well-666"]'),
            curlStatus: document.getElementById('data-well-666-curl-status'),
            sqlButton: document.querySelector('[data-export-sql="data-well-666"]'),
            sqlStatus: document.getElementById('data-well-666-sql-status')
        },
        portfolio: {
            recordCount: document.getElementById('data-well-portfolio-count'),
            columnsList: document.getElementById('data-well-portfolio-columns'),
            size: document.getElementById('data-well-portfolio-size'),
            previewHead: document.getElementById('data-well-portfolio-preview-head'),
            previewBody: document.getElementById('data-well-portfolio-preview-body'),
            previewNotice: document.getElementById('data-well-portfolio-preview-notice'),
            copyButton: document.querySelector('[data-export-copy="data-well-portfolio"]'),
            copyStatus: document.getElementById('data-well-portfolio-copy-status'),
            curlButton: document.querySelector('[data-export-curl="data-well-portfolio"]'),
            curlStatus: document.getElementById('data-well-portfolio-curl-status'),
            sqlButton: document.querySelector('[data-export-sql="data-well-portfolio"]'),
            sqlStatus: document.getElementById('data-well-portfolio-sql-status')
        },
        activities: {
            recordCount: document.getElementById('data-activity-count'),
            columnsList: document.getElementById('data-activity-columns'),
            size: document.getElementById('data-activity-size'),
            previewHead: document.getElementById('data-activity-preview-head'),
            previewBody: document.getElementById('data-activity-preview-body'),
            previewNotice: document.getElementById('data-activity-preview-notice'),
            copyButton: document.querySelector('[data-export-copy="data-activity-cost-rates"]'),
            copyStatus: document.getElementById('data-activity-copy-status'),
            curlButton: document.querySelector('[data-export-curl="data-activity-cost-rates"]'),
            curlStatus: document.getElementById('data-activity-curl-status'),
            sqlButton: document.querySelector('[data-export-sql="data-activity-cost-rates"]'),
            sqlStatus: document.getElementById('data-activity-sql-status')
        },
        equipment: {
            recordCount: document.getElementById('data-equipment-count'),
            columnsList: document.getElementById('data-equipment-columns'),
            size: document.getElementById('data-equipment-size'),
            previewHead: document.getElementById('data-equipment-preview-head'),
            previewBody: document.getElementById('data-equipment-preview-body'),
            previewNotice: document.getElementById('data-equipment-preview-notice'),
            copyButton: document.querySelector('[data-export-copy="data-equipment-tools"]'),
            copyStatus: document.getElementById('data-equipment-copy-status'),
            curlButton: document.querySelector('[data-export-curl="data-equipment-tools"]'),
            curlStatus: document.getElementById('data-equipment-curl-status'),
            sqlButton: document.querySelector('[data-export-sql="data-equipment-tools"]'),
            sqlStatus: document.getElementById('data-equipment-sql-status')
        },
        personnel: {
            recordCount: document.getElementById('data-personnel-count'),
            columnsList: document.getElementById('data-personnel-columns'),
            size: document.getElementById('data-personnel-size'),
            previewHead: document.getElementById('data-personnel-preview-head'),
            previewBody: document.getElementById('data-personnel-preview-body'),
            previewNotice: document.getElementById('data-personnel-preview-notice'),
            copyButton: document.querySelector('[data-export-copy="data-personnel-rates"]'),
            copyStatus: document.getElementById('data-personnel-copy-status'),
            curlButton: document.querySelector('[data-export-curl="data-personnel-rates"]'),
            curlStatus: document.getElementById('data-personnel-curl-status'),
            sqlButton: document.querySelector('[data-export-sql="data-personnel-rates"]'),
            sqlStatus: document.getElementById('data-personnel-sql-status')
        },
        pob: { musterActive: false, musterInterval: null, personnel: [] }
    };

    const DATA_PREVIEW_MAX_ROWS = 3;
    const DATA_PREVIEW_MAX_COLUMNS = 5;

    const dataExportDatasets = [
        {
            file: 'data-well-666.csv',
            elements: dataExportElements.w666,
            schema: dataExportSchemas['data-well-666.csv']
        },
        {
            file: 'data-well-portfolio.csv',
            elements: dataExportElements.portfolio,
            schema: dataExportSchemas['data-well-portfolio.csv']
        },
        {
            file: 'data-activity-cost-rates.csv',
            elements: dataExportElements.activities,
            schema: dataExportSchemas['data-activity-cost-rates.csv']
        },
        {
            file: 'data-equipment-tools.csv',
            elements: dataExportElements.equipment,
            schema: dataExportSchemas['data-equipment-tools.csv']
        },
        {
            file: 'data-personnel-rates.csv',
            elements: dataExportElements.personnel,
            schema: dataExportSchemas['data-personnel-rates.csv']
        }
    ];
    
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

    const wellFocusFilters = [
        { id: 'all', label: 'All Wells', predicate: () => true },
        { id: 'critical', label: 'Critical Path', predicate: (well) => well.kind === 'critical' },
        { id: 'case', label: 'Case Studies', predicate: (well) => well.kind === 'case' }
    ];

    const wellThemeFilters = [
        {
            id: 'integrity',
            label: 'Integrity',
            description: 'Casing deformation, barrier failures, or structural threats',
            predicate: (well) => Array.isArray(well.themes) && well.themes.includes('integrity')
        },
        {
            id: 'flow-assurance',
            label: 'Flow Assurance',
            description: 'Scale, sand, wax, or production-blocking deposition',
            predicate: (well) => Array.isArray(well.themes) && well.themes.includes('flow-assurance')
        },
        {
            id: 'controls',
            label: 'Controls & Safety',
            description: 'Safety valves, automation, or control system reliability',
            predicate: (well) => Array.isArray(well.themes) && well.themes.includes('controls')
        },
        {
            id: 'productivity',
            label: 'Production Recovery',
            description: 'Demonstrated uplift in production or uptime',
            predicate: (well) => Array.isArray(well.themes) && well.themes.includes('productivity')
        }
    ];

    const wellFocusFilterMap = new Map(wellFocusFilters.map((filter) => [filter.id, filter]));
    const wellThemeFilterMap = new Map(wellThemeFilters.map((filter) => [filter.id, filter]));

    const evaluateTheme = (themeId, well) => {
        const themeFilter = wellThemeFilterMap.get(themeId);
        return themeFilter ? !!themeFilter.predicate(well) : false;
    };

    const totalFocusCounts = new Map(
        wellFocusFilters.map((filter) => [filter.id, wellData.filter((well) => filter.predicate(well)).length])
    );

    const totalThemeCounts = new Map(
        wellThemeFilters.map((filter) => [filter.id, wellData.filter((well) => filter.predicate(well)).length])
    );

    const portfolioSignalDefinitions = [
        {
            id: 'critical',
            label: 'Critical Path Wells',
            icon: '🚨',
            description: 'Assets requiring immediate intervention.',
            predicate: (well) => {
                const focusFilter = wellFocusFilterMap.get('critical');
                return focusFilter ? focusFilter.predicate(well) : false;
            },
            cardClass: 'border-red-500/40 bg-red-500/10',
            progressClass: 'bg-red-500'
        },
        {
            id: 'integrity',
            label: 'Integrity Threats',
            icon: '🛡️',
            description: 'Casing & barrier risks captured across the portfolio.',
            predicate: (well) => evaluateTheme('integrity', well),
            cardClass: 'border-amber-500/40 bg-amber-500/10',
            progressClass: 'bg-amber-500'
        },
        {
            id: 'flow-assurance',
            label: 'Flow Assurance Risks',
            icon: '💧',
            description: 'Scale, wax, and sand threats to production continuity.',
            predicate: (well) => evaluateTheme('flow-assurance', well),
            cardClass: 'border-blue-500/40 bg-blue-500/10',
            progressClass: 'bg-sky-500'
        },
        {
            id: 'productivity',
            label: 'Production Recovery Wins',
            icon: '📈',
            description: 'Demonstrated uplift after intervention.',
            predicate: (well) => evaluateTheme('productivity', well),
            cardClass: 'border-emerald-500/40 bg-emerald-500/10',
            progressClass: 'bg-emerald-500'
        }
    ];
    
    const wellSelectionGrid = document.getElementById('well-selection-grid');
    const wellPortfolioSignals = document.getElementById('portfolio-signals');
    const wellFilterSummary = document.getElementById('well-filter-summary');
    const wellSearchInput = document.getElementById('well-search-input');
    const wellFocusGroup = document.getElementById('well-focus-group');
    const wellThemeGroup = document.getElementById('well-theme-group');
    const objectivesFieldset = document.getElementById('objectives-fieldset');
    const problemsFieldset = document.getElementById('problems-fieldset');
    const generatePlanBtnManual = document.getElementById('generate-plan-btn-manual');
    const generatePlanBtnAi = document.getElementById('generate-plan-btn-ai');
    const planOutput = document.getElementById('plan-output');
    const startOverBtn = document.getElementById('start-over-btn');
    const readinessOutput = document.getElementById('readiness-output');
    const beginOpBtn = document.getElementById('begin-op-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const manualPlanningView = document.getElementById('manual-planning-view');
    const aiAdvisorView = document.getElementById('ai-advisor-view');
    const aiRecommendationsContainer = document.getElementById('ai-recommendations');
    const getDesignBlueprintContainer = () => document.getElementById('design-blueprint');
    const designBlueprintContainer = document.getElementById('design-blueprint');
    const plannerStatusRegion = document.getElementById('planner-status');
    const plannerToast = document.getElementById('planner-toast');

    let plannerToastTimeout = null;

    const announcePlannerStatus = (message) => {
        if (!plannerStatusRegion || !message) return;
        plannerStatusRegion.textContent = '';
        requestAnimationFrame(() => {
            plannerStatusRegion.textContent = message;
        });
    };

    const showPlannerToast = (message) => {
        if (!plannerToast || !message) return;
        plannerToast.textContent = message;
        plannerToast.classList.remove('hidden');
        if (plannerToastTimeout) {
            clearTimeout(plannerToastTimeout);
        }
        plannerToastTimeout = setTimeout(() => {
            plannerToast.classList.add('hidden');
        }, 2600);
    };
    const step1ContinueBtn = document.getElementById('step-1-continue');
    const step2ContinueBtn = document.getElementById('step-2-continue');
    const step4ContinueBtn = document.getElementById('step-4-continue');
    const step5ContinueBtn = document.getElementById('step-5-continue');
    const generateProgramBtn = document.getElementById('generate-program-btn');
    const openLogisticsBtn = document.getElementById('open-logistics-btn');
    const openCommercialBtn = document.getElementById('open-commercial-btn');
    const openHseBtn = document.getElementById('open-hse-btn');
    const reviewAnalysisBtnFinal = document.getElementById('review-analysis-btn-final');
    const handoverOutput = document.getElementById('handover-output');

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
    const logisticsReferenceCard = document.getElementById('logistics-reference-card');
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
    let lastFocusedElement = null;
    
    // Theme

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const dataScrubbingPanel = document.getElementById('data-scrubbing-panel');
    const dataScrubbingOverview = document.getElementById('data-scrubbing-overview');
    const dataScrubbingStages = document.getElementById('data-scrubbing-stages');
    const dataScrubbingSchema = document.getElementById('data-scrubbing-schema');
    const dataScrubbingRaw = document.getElementById('data-scrubbing-raw');
    const dataScrubbingNormalized = document.getElementById('data-scrubbing-normalized');
    const dataScrubbingSummary = document.getElementById('data-scrubbing-summary');
    const heroPlannerBtn = document.getElementById('hero-planner-btn');

    const addListener = (element, eventName, handler, options) => {
        if (element) {
            element.addEventListener(eventName, handler, options);
        }
    };
    
    // --- VIEW & STATE MANAGEMENT ---

    const planRequiredMessages = new Map([
        ['analyzer', 'Generate a plan to unlock the analysis workspace.'],
        ['commercial', 'Generate a plan to review commercial readiness.'],
        ['hse', 'Generate a plan to review HSE & risk readiness.'],
        ['logistics', 'Generate a plan to orchestrate logistics & supply chain readiness.'],
        ['performer', 'Generate a plan to launch Live Operations.'],
        ['pob', 'Generate a plan to prepare POB & emergency response readiness.']
    ]);

    const enforcePlanAccess = (viewName, sourceLabel) => {
        if (!viewName) return false;
        if (alwaysAccessibleViews.has(viewName) || appState.generatedPlan) {
            return false;
        }

        const normalizedView = viewName.toLowerCase();
        const plannerMessage = planRequiredMessages.get(normalizedView)
            ?? `Generate a plan to open the ${sourceLabel || 'selected'} workspace.`;
        announcePlannerStatus(plannerMessage);
        showPlannerToast(plannerMessage);
        if (appState.currentView !== 'planner') {
            switchView('planner');
        }
        return true;
    };

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

        const targetView = document.getElementById(`${viewName}-view`);
        if (!targetView) {
            console.warn(`Requested view "${viewName}" is not available in the DOM.`);
            return;
        }

        views.forEach(v => v.classList.add('hidden'));
        targetView.classList.remove('hidden');

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
        if(viewName === 'ai-helper') viewTitle = 'AI Assistant';
        headerTitle.textContent = `Well-Tegra: ${viewTitle}`;

        if (viewName === 'performer' && appState.selectedWell && appState.generatedPlan) {
            headerDetails.innerHTML = `<span id="job-status" class="text-lg font-semibold text-emerald-400">● LIVE</span><div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
            initializePerformer();
        } else if (['analyzer', 'commercial', 'hse', 'pob'].includes(viewName)) {
            if(appState.selectedWell && appState.generatedPlan) {
                headerDetails.innerHTML = `<div class="text-right"><p class="text-sm">Well: ${appState.selectedWell.name}</p><p class="text-sm">Job: ${appState.generatedPlan.name}</p></div>`;
            }
        } else if (viewName === 'toolstring') {
            // Initialize toolstring builder
            if (window.ToolstringBuilder && typeof window.ToolstringBuilder.init === 'function') {
                window.ToolstringBuilder.init();
            }
        } else if (viewName === 'christmas-tree') {
            // Initialize Christmas tree integrity system
            if (window.ChristmasTreeIntegrity && typeof window.ChristmasTreeIntegrity.init === 'function') {
                window.ChristmasTreeIntegrity.init();
            }
        }
    };
    window.showView = (viewName, sourceLabel) => {
        if (!viewName) return;
        if (enforcePlanAccess(viewName, sourceLabel)) {
            return;
        }
        switchView(viewName);
    };
    
    const resetApp = (switchToHome = false) => {
        appState.selectedWell = null;
        appState.selectedObjective = null;
        appState.generatedPlan = null;
        appState.lessonsLearned = [];
        appState.commercial = { afe: 0, actualCost: 0, serviceTickets: [] };
        appState.ai = { selectedProblemId: null, selectedRecommendation: null };
        appState.handoverReady = false;
        appState.planBroadcastKey = null;
        window.dispatchEvent(new CustomEvent('welltegra:plan-reset'));

        // Reset well selection
        document.querySelectorAll('.planner-card').forEach(c => c.classList.remove('selected'));
        
        // Reset objective selection
        const checkedObjective = document.querySelector('input[name="objective"]:checked');
        if(checkedObjective) { checkedObjective.checked = false; }
        
        // Reset problem selection
        const checkedProblem = document.querySelector('input[name="problem"]:checked');
        if(checkedProblem) { checkedProblem.checked = false; }
        
        // Reset buttons
        if (generatePlanBtnManual) generatePlanBtnManual.disabled = true;
        if (generatePlanBtnAi) generatePlanBtnAi.disabled = true;

        // Reset AI recommendations
        if (aiRecommendationsContainer) aiRecommendationsContainer.classList.add('hidden');

        // Reset AI toggle
        if (aiToggle) aiToggle.checked = false;
        if (manualPlanningView) manualPlanningView.classList.remove('hidden');
        if (aiAdvisorView) aiAdvisorView.classList.add('hidden');

        switchView(switchToHome ? 'home' : 'planner');
        renderWellCards();
        updatePlannerStepUI(1);
        updateNavLinks();
    };

    const updateNavLinks = () => {
        const planExists = !!appState.generatedPlan;
        navLinks.forEach(link => {
            const id = link.id.replace('-nav-link', '');
            const isGatedView = !alwaysAccessibleViews.has(id);

            if (isGatedView && !planExists) {
                link.classList.add('disabled');
                link.setAttribute('aria-disabled', 'true');
                link.setAttribute('tabindex', '-1');
            } else {
                link.classList.remove('disabled');
                link.removeAttribute('aria-disabled');
                link.removeAttribute('tabindex');
            }
        });
    };

    // --- PLANNER LOGIC ---

    const assetCodePattern = /^[a-z]{1,3}-?\d{2,}$/;

    const filterWellPortfolio = () => {
        const filters = appState.wellFilters || { query: '', focus: 'all', themes: new Set() };
        const query = (filters.query || '').trim().toLowerCase();
        const focusFilter = wellFocusFilterMap.get(filters.focus) || wellFocusFilterMap.get('all');
        const activeThemes = filters.themes instanceof Set ? filters.themes : new Set();

        return wellData.filter((well) => {
            if (focusFilter && !focusFilter.predicate(well)) {
                return false;
            }

            if (activeThemes.size > 0) {
                const wellThemes = new Set(well.themes || []);
                for (const themeId of activeThemes) {
                    if (!wellThemes.has(themeId)) {
                        return false;
                    }
                }
            }

            if (query) {
                const coreHaystack = [
                    well.id,
                    well.name,
                    well.field,
                    well.region,
                    well.type,
                    well.status,
                    well.issue,
                    ...(well.themes || [])
                ].join(' ').toLowerCase();

                const matchesCoreFields = coreHaystack.includes(query);
                let matchesExtendedFields = false;

                if (!matchesCoreFields && !assetCodePattern.test(query)) {
                    matchesExtendedFields = (well.history || []).some((entry) => {
                        const historyText = `${entry.operation} ${entry.problem} ${entry.lesson}`.toLowerCase();
                        return historyText.includes(query);
                    });
                }

                if (!matchesCoreFields && !matchesExtendedFields) {
                    return false;
                }
            }

            return true;
        });
    };

    const syncFocusChipStates = () => {
        if (!wellFocusGroup) return;
        const activeFocus = (appState.wellFilters && appState.wellFilters.focus) || 'all';
        wellFocusGroup.querySelectorAll('[data-focus-filter]').forEach((button) => {
            const isActive = button.dataset.focusFilter === activeFocus;
            button.classList.toggle('filter-chip--active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    const syncThemeChipStates = () => {
        if (!wellThemeGroup) return;
        const activeThemes = (appState.wellFilters && appState.wellFilters.themes instanceof Set)
            ? appState.wellFilters.themes
            : new Set();
        wellThemeGroup.querySelectorAll('[data-theme-filter]').forEach((button) => {
            const themeId = button.dataset.themeFilter;
            const isActive = activeThemes.has(themeId);
            button.classList.toggle('filter-chip--active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    const updateFocusCounts = (filteredWells) => {
        if (!wellFocusGroup) return;
        const filteredCounts = new Map();
        filteredWells.forEach((well) => {
            wellFocusFilters.forEach((filter) => {
                if (filter.predicate(well)) {
                    filteredCounts.set(filter.id, (filteredCounts.get(filter.id) || 0) + 1);
                }
            });
        });

        wellFocusFilters.forEach((filter) => {
            const countElement = wellFocusGroup.querySelector(`[data-focus-count="${filter.id}"]`);
            if (!countElement) return;
            const visible = filteredCounts.get(filter.id) || 0;
            const total = totalFocusCounts.get(filter.id) || 0;
            countElement.textContent = `${visible}/${total}`;
        });
    };

    const updateThemeCounts = (filteredWells) => {
        if (!wellThemeGroup) return;
        const filteredThemeCounts = new Map();
        filteredWells.forEach((well) => {
            (well.themes || []).forEach((themeId) => {
                filteredThemeCounts.set(themeId, (filteredThemeCounts.get(themeId) || 0) + 1);
            });
        });

        wellThemeFilters.forEach((filter) => {
            const countElement = wellThemeGroup.querySelector(`[data-theme-count="${filter.id}"]`);
            if (!countElement) return;
            const visible = filteredThemeCounts.get(filter.id) || 0;
            const total = totalThemeCounts.get(filter.id) || 0;
            countElement.textContent = `${visible}/${total}`;
        });
    };

    const updateWellFilterSummary = (filteredWells) => {
        if (!wellFilterSummary) return;
        const total = wellData.length;
        const filtered = filteredWells.length;
        const filters = appState.wellFilters || { query: '', focus: 'all', themes: new Set() };
        const descriptors = [];

        if (filters.focus && filters.focus !== 'all') {
            const focusLabel = wellFocusFilterMap.get(filters.focus)?.label;
            if (focusLabel) descriptors.push(focusLabel);
        }

        if (filters.themes instanceof Set && filters.themes.size > 0) {
            const themeLabels = Array.from(filters.themes)
                .map((themeId) => wellThemeFilterMap.get(themeId)?.label)
                .filter(Boolean);
            if (themeLabels.length) {
                descriptors.push(`Themes: ${themeLabels.join(', ')}`);
            }
        }

        if (filters.query) {
            descriptors.push(`Search: “${filters.query.trim()}”`);
        }

        const selectedHidden = appState.selectedWell
            ? !filteredWells.some((well) => well.id === appState.selectedWell.id)
            : false;

        const filterDescription = descriptors.length ? `Filters active — ${descriptors.join(' · ')}` : 'No filters applied.';
        const hiddenNotice = selectedHidden ? ' The selected well is hidden by the current filters.' : '';

        wellFilterSummary.textContent = `Showing ${filtered} of ${total} wells. ${filterDescription}${hiddenNotice}`;
    };

    const renderPortfolioSignals = (filteredWells) => {
        if (!wellPortfolioSignals) return;
        const cards = portfolioSignalDefinitions.map((signal) => {
            const predicate = signal.predicate || (() => false);
            const total = wellData.filter(predicate).length;
            const visible = filteredWells.filter(predicate).length;
            const percent = total === 0 ? 0 : Math.round((visible / total) * 100);

            return `
                <article class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-inner ${signal.cardClass}" data-signal-id="${signal.id}">
                    <div class="flex items-center gap-3">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-lg">${signal.icon}</span>
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">${signal.label}</p>
                            <p class="text-xs text-slate-400">${signal.description}</p>
                        </div>
                    </div>
                    <div class="mt-4 flex items-baseline gap-2">
                        <span class="text-3xl font-bold text-white">${visible}</span>
                        <span class="text-xs uppercase tracking-wide text-slate-400">visible now</span>
                    </div>
                    <p class="text-xs text-slate-400">Portfolio total: ${total}</p>
                    <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
                        <div class="h-full ${signal.progressClass} portfolio-progress-bar" data-width="${percent}"></div>
                    </div>
                </article>
            `;
        });

        wellPortfolioSignals.innerHTML = cards.join('');

        // Apply widths via JavaScript (CSP compliant)
        wellPortfolioSignals.querySelectorAll('.portfolio-progress-bar').forEach(bar => {
            const width = bar.getAttribute('data-width');
            if (width !== null) {
                bar.style.setProperty('--bar-width', `${width}%`);
            }
        });
    };

    const getWellCardMarkup = (well, isSelected) => {
        const isWellFromHell = well.id === 'W666';
        const statusClass = well.status.toLowerCase().replace(/[\s-]/g, '');
        const iconMarkup = renderPlannerIcon(
            well.icon || {},
            `${well.name} insight icon`,
            isWellFromHell ? 'critical' : 'case'
        );
        const badgeMarkup = isWellFromHell
            ? '<span class="bg-red-700 text-white text-xs px-2 py-1 rounded-full" aria-label="Critical intervention focus well">CRITICAL</span>'
            : '<span class="bg-blue-700 text-white text-xs px-2 py-1 rounded-full" aria-label="Case study well">CASE STUDY</span>';

        // Data quality badge
        const dataQuality = well.dataQuality || 0;
        let qualityColor, qualityLabel, qualityBgClass;
        if (dataQuality >= 90) {
            qualityColor = 'emerald';
            qualityLabel = 'Excellent';
            qualityBgClass = 'bg-emerald-600';
        } else if (dataQuality >= 80) {
            qualityColor = 'blue';
            qualityLabel = 'Good';
            qualityBgClass = 'bg-blue-600';
        } else if (dataQuality >= 70) {
            qualityColor = 'yellow';
            qualityLabel = 'Fair';
            qualityBgClass = 'bg-yellow-600';
        } else if (dataQuality >= 60) {
            qualityColor = 'orange';
            qualityLabel = 'Poor';
            qualityBgClass = 'bg-orange-600';
        } else {
            qualityColor = 'red';
            qualityLabel = 'Critical';
            qualityBgClass = 'bg-red-600';
        }

        return `
            <article class="well-card-enhanced planner-card light-card ${isWellFromHell ? 'border-red-500' : 'border-gray-200'} ${isSelected ? 'selected' : ''}"
                data-well-id="${well.id}"
                role="button"
                tabindex="0"
                aria-pressed="${isSelected}">
                <div class="card-header ${isWellFromHell ? 'bg-red-500' : 'bg-blue-500'}">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-3">
                            ${iconMarkup}
                            <div>
                                <h3 class="text-xl font-bold text-white">${well.name}</h3>
                                <p class="mt-1 text-blue-100 text-sm">${well.field} — ${well.type}</p>
                            </div>
                        </div>
                        ${badgeMarkup}
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3 flex items-center gap-2">
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full status-${statusClass}">${well.status}</span>
                        <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded ${qualityBgClass}"
                              aria-label="Data quality score: ${dataQuality}% - ${qualityLabel}"
                              title="Data Quality: ${dataQuality}% (${qualityLabel})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                            ${dataQuality}%
                        </span>
                    </div>
                    <p class="text-sm">${well.issue}</p>
                </div>
                <div class="card-footer">
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-gray-500">Depth: ${well.depth}</span>
                        <button class="view-details-btn text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold"
                            type="button"
                            data-well-id="${well.id}"
                            aria-label="View historical dossier for ${well.name}">View Details</button>
                    </div>
                </div>
            </article>
        `;
    };

    const renderWellCards = () => {
        if (!wellSelectionGrid) return;
        const filteredWells = filterWellPortfolio();

        syncFocusChipStates();
        syncThemeChipStates();
        updateFocusCounts(filteredWells);
        updateThemeCounts(filteredWells);
        updateWellFilterSummary(filteredWells);
        renderPortfolioSignals(filteredWells);

        if (!filteredWells.length) {
            wellSelectionGrid.innerHTML = `
                <div class="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
                    No wells match the current filters. Adjust your search or theme filters to continue planning.
                </div>
            `;
            return;
        }

        const selectedWellId = appState.selectedWell?.id || null;
        wellSelectionGrid.innerHTML = filteredWells
            .map((well) => getWellCardMarkup(well, well.id === selectedWellId))
            .join('');
    };
    
    function renderObjectives() {
    const renderObjectives = () => {
        if (!objectivesFieldset) return;

        if (!Array.isArray(objectivesData) || objectivesData.length === 0) {
            objectivesFieldset.innerHTML = `
                <div class="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
                    Objective catalog unavailable. Load a scenario to continue planning.
                </div>
            `;
            return;
        }

        const selectedId = appState.selectedObjective?.id || null;

        objectivesFieldset.innerHTML = objectivesData.map((objective) => {
            const objectiveId = escapeHtml(objective.id);
            const isSelected = selectedId === objective.id;
            const selectedClass = isSelected ? ' selected' : '';
            const checkedAttribute = isSelected ? 'checked' : '';
            const iconMarkup = escapeHtml(objective.icon || '🎯');
            const nameMarkup = escapeHtml(objective.name || 'Objective');
            const descriptionMarkup = escapeHtml(objective.description || '');

            return `
                <div class="objective-card light-card${selectedClass}" data-objective-id="${objectiveId}">
                    <input type="radio" name="objective" id="${objectiveId}" value="${objectiveId}" class="sr-only" ${checkedAttribute}>
                    <label for="${objectiveId}" class="flex h-full cursor-pointer flex-col gap-3 p-4">
                        <span class="text-2xl" aria-hidden="true">${iconMarkup}</span>
                        <div>
                            <span class="block text-lg font-semibold text-slate-100">${nameMarkup}</span>
                            <p class="mt-2 text-sm text-slate-300">${descriptionMarkup}</p>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    const renderProblems = () => {
        if (!problemsFieldset) return;

        const selectedWellId = appState.selectedWell?.id || null;

        if (!selectedWellId) {
            appState.ai.selectedProblemId = null;
            appState.ai.selectedRecommendation = null;
            if (aiRecommendationsContainer) {
                aiRecommendationsContainer.classList.add('hidden');
            }
            problemsFieldset.innerHTML = `
                <div class="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
                    Select a well to unlock AI-assisted problem diagnostics.
                </div>
            `;
            return;
        }

        if (selectedWellId !== 'W666') {
            appState.ai.selectedProblemId = null;
            appState.ai.selectedRecommendation = null;
            if (aiRecommendationsContainer) {
                aiRecommendationsContainer.classList.add('hidden');
            }
            problemsFieldset.innerHTML = `
                <div class="rounded-lg border border-amber-400/40 bg-amber-500/10 p-6 text-center text-sm text-amber-200">
                    The AI Advisor is currently tuned for the W666 critical well scenario. Switch to W666 to see curated problem insights.
                </div>
            `;
            return;
        }

        if (!Array.isArray(problemsData) || problemsData.length === 0) {
            problemsFieldset.innerHTML = `
                <div class="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
                    Problem catalog unavailable. Check back after data sync completes.
                </div>
            `;
            return;
        }

        const selectedProblemId = appState.ai.selectedProblemId || null;

        problemsFieldset.innerHTML = problemsData.map((problem) => {
            const problemId = escapeHtml(problem.id);
            const isSelected = selectedProblemId === problem.id;
            const selectedClass = isSelected ? ' selected' : '';
            const checkedAttribute = isSelected ? 'checked' : '';
            const iconMarkup = escapeHtml(problem.icon || '⚠️');
            const nameMarkup = escapeHtml(problem.name || 'Problem');
            const descriptionMarkup = escapeHtml(problem.description || '');

            const linkedObjectives = Array.isArray(problem.linked_objectives)
                ? problem.linked_objectives
                    .map((objectiveId) => objectivesData.find((objective) => objective.id === objectiveId))
                    .filter(Boolean)
                : [];

            const linkedMarkup = linkedObjectives.length
                ? `
                    <div class="mt-3 flex flex-wrap gap-2">
                        ${linkedObjectives.map((objective) => `
                            <span class="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200" data-linked-objective="${escapeHtml(objective.id)}">
                                ${escapeHtml(objective.icon || '🎯')} ${escapeHtml(objective.name)}
                            </span>
                        `).join('')}
                    </div>
                `
                : '';

            return `
                <div class="objective-card light-card${selectedClass}" data-problem-id="${problemId}">
                    <input type="radio" name="problem" id="${problemId}" value="${problemId}" class="sr-only" ${checkedAttribute}>
                    <label for="${problemId}" class="flex h-full cursor-pointer flex-col gap-3 p-4">
                        <span class="text-2xl" aria-hidden="true">${iconMarkup}</span>
                        <div>
                            <span class="block text-lg font-semibold text-slate-100">${nameMarkup}</span>
                            <p class="mt-2 text-sm text-slate-300">${descriptionMarkup}</p>
                            ${linkedMarkup}
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    // expose planners so other modules (e.g., PDF export, analytics replay) can re-render when datasets update
    window.renderObjectives = renderObjectives;
    window.renderProblems = renderProblems;
    };

    const renderDesignBlueprint = () => {
        const designBlueprintContainer = getDesignBlueprintContainer();
        if (!designBlueprintContainer) return;
        if (!appState.selectedObjective) {
            designBlueprintContainer.innerHTML = '<p class="text-sm text-slate-400 text-center">Select an objective or AI recommendation to load the engineering blueprint.</p>';
            if (generateProgramBtn) generateProgramBtn.disabled = true;
            return;
        }

        const blueprint = designBlueprints[appState.selectedObjective.id];
        if (!blueprint) {
            designBlueprintContainer.innerHTML = '<p class="text-sm text-slate-400 text-center">Blueprint content coming soon for this objective.</p>';
            if (generateProgramBtn) generateProgramBtn.disabled = true;
            return;
        }

        const conceptualHtml = (blueprint.conceptual || []).map(item => `<li>${item}</li>`).join('');
        const detailSections = [
            { label: 'Trajectory & Geomechanics', items: blueprint.detailed?.trajectory },
            { label: 'Casing & Barriers', items: blueprint.detailed?.casing },
            { label: 'Fluids & Hydraulics', items: blueprint.detailed?.fluids },
            { label: 'BHA & Tooling Strategy', items: blueprint.detailed?.bha },
            { label: 'Well Control Envelope', items: blueprint.detailed?.wellControl },
            { label: 'Completion & Verification', items: blueprint.detailed?.completion }
        ].filter(section => Array.isArray(section.items) && section.items.length > 0);

        const detailHtml = detailSections.map(section => `
            <div class="light-card p-5 rounded-lg h-full">
                <h4 class="text-lg font-semibold mb-3">${section.label}</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                    ${section.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        const contingenciesHtml = (blueprint.contingencies || []).map(item => `<li>${item}</li>`).join('');

        designBlueprintContainer.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h4 class="text-xl font-semibold">${blueprint.title}</h4>
                    <p class="text-sm text-slate-300 mt-2">${blueprint.summary}</p>
                </div>
                <div class="light-card p-5 rounded-lg">
                    <h4 class="text-lg font-semibold mb-2">Conceptual Drivers</h4>
                    <ul class="list-disc pl-5 space-y-1 text-sm">
                        ${conceptualHtml}
                    </ul>
                </div>
                <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    ${detailHtml}
                </div>
                <div class="light-card p-5 rounded-lg">
                    <h4 class="text-lg font-semibold mb-2">Contingency Envelope</h4>
                    <ul class="list-disc pl-5 space-y-1 text-sm">
                        ${contingenciesHtml}
                    </ul>
                </div>
            </div>
        `;

        if (generateProgramBtn) {
            generateProgramBtn.disabled = false;
        }
    };

    const renderDataScrubbingPipeline = (wellId) => {
        if (!dataScrubbingPanel || !dataScrubbingOverview || !dataScrubbingStages || !dataScrubbingSchema || !dataScrubbingRaw || !dataScrubbingNormalized || !dataScrubbingSummary) {
            return;
        }

        const pipelineRegistry = window.dataScrubbingPipelines || dataScrubbingPipelines || {};
        const pipeline = pipelineRegistry[wellId];

        if (!pipeline) {
            dataScrubbingPanel.classList.add('hidden');
            dataScrubbingOverview.textContent = '';
            dataScrubbingStages.innerHTML = '';
            dataScrubbingSchema.innerHTML = '';
            dataScrubbingRaw.innerHTML = '';
            dataScrubbingNormalized.innerHTML = '';
            dataScrubbingSummary.innerHTML = '';
            return;
        }

        dataScrubbingPanel.classList.remove('hidden');
        dataScrubbingOverview.textContent = pipeline.overview;

        dataScrubbingStages.innerHTML = pipeline.stages.map(stage => `
            <div class="light-card p-5 rounded-lg h-full">
                <div class="flex items-center justify-between">
                    <h5 class="text-lg font-semibold">${stage.title}</h5>
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${stage.badgeClass}">${stage.status}</span>
                </div>
                <p class="mt-2 text-sm text-slate-400">${stage.description}</p>
                <ul class="mt-3 space-y-1 text-xs text-slate-400">
                    ${stage.artifacts.map(item => `<li class="flex items-start gap-2"><span class="mt-1 text-slate-500">•</span><span>${item}</span></li>`).join('')}
                </ul>
            </div>
        `).join('');

        dataScrubbingSchema.innerHTML = pipeline.schema.map(item => `
            <div>
                <dt class="text-xs font-semibold tracking-wide text-slate-400 uppercase">${item.label}</dt>
                <dd class="mt-1 text-sm text-slate-200">${item.value}</dd>
            </div>
        `).join('');

        dataScrubbingRaw.innerHTML = `
            <p>${pipeline.rawExcerpt}</p>
            ${pipeline.rawSource ? `<p class="mt-2 text-xs not-italic text-slate-400">Source: ${pipeline.rawSource}</p>` : ''}
        `;

        dataScrubbingNormalized.innerHTML = pipeline.normalizedFindings.map(item => `
            <li class="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                <div class="flex items-center justify-between text-xs text-slate-400">
                    <span>${item.label}</span>
                    ${item.confidence ? `<span>${Math.round(item.confidence * 100)}% confidence</span>` : ''}
                </div>
                <p class="mt-2 text-sm font-semibold text-slate-100">${item.value}</p>
                <p class="mt-2 text-xs text-slate-400"><span class="font-semibold text-slate-300">Evidence:</span> ${item.evidence}</p>
            </li>
        `).join('');

        dataScrubbingSummary.innerHTML = pipeline.qaSummary.map(item => `
            <li class="flex items-start gap-2">
                <span class="mt-1 text-emerald-400">✔</span>
                <span>${item}</span>
            </li>
        `).join('');
    };

    const describeRiskLevel = (value) => {
        if (value <= 1) return 'Minimal';
        if (value <= 2) return 'Low';
        if (value <= 3) return 'Moderate';
        if (value <= 4) return 'High';
        return 'Severe';
    };

    const buildRiskSummary = (risks) => {
        if (!risks || typeof risks !== 'object') return [];
        return Object.entries(risks).map(([category, level]) => {
            const numericLevel = Number(level) || 0;
            return {
                category,
                level: numericLevel,
                label: describeRiskLevel(numericLevel)
            };
        });
    };

    const broadcastPlanSnapshot = (plan) => {
        if (!plan || !appState.selectedObjective || !appState.selectedWell) return;
        const keyParts = [
            appState.selectedWell.id,
            appState.selectedObjective.id,
            plan.name,
            Number(plan.cost) || 0,
            Number(plan.duration) || 0,
            Array.isArray(plan.steps) ? plan.steps.length : 0
        ];
        const snapshotKey = keyParts.join('|');
        if (appState.planBroadcastKey === snapshotKey) {
            return;
        }
        appState.planBroadcastKey = snapshotKey;

        const timestamp = Date.now();
        const personnel = Array.isArray(plan.personnel) ? plan.personnel.slice() : [];
        const costValue = Number(plan.cost) || 0;
        const durationValue = Number(plan.duration) || 0;
        const metrics = {
            totalDaily: costValue ? formatCurrency(costValue) : null,
            length: durationValue ? `${durationValue} hrs` : null,
            equipmentDaily: personnel.length ? `${personnel.length} roles` : null
        };

        const rawSteps = Array.isArray(plan.steps) ? plan.steps : [];
        const topSteps = rawSteps
            .slice(0, 4)
            .map((step, index) => {
                if (typeof step === 'string') {
                    return { order: index + 1, text: step };
                }
                if (step && typeof step === 'object') {
                    const text = step.text || step.title || step.description || '';
                    if (!text) {
                        return null;
                    }
                    return { order: step.order || index + 1, text };
                }
                return null;
            })
            .filter(Boolean);

        const detail = {
            plan: {
                name: plan.name,
                objectiveId: appState.selectedObjective.id,
                objectiveName: appState.selectedObjective.name,
                objectiveDescription: appState.selectedObjective.description || null,
                wellId: appState.selectedWell.id,
                wellName: appState.selectedWell.name,
                wellField: appState.selectedWell.field || null,
                wellRegion: appState.selectedWell.region || null,
                costUSD: Number(plan.cost) || 0,
                costFormatted: typeof plan.cost !== 'undefined' ? formatCurrency(Number(plan.cost) || 0) : null,
                durationHours: Number(plan.duration) || 0,
                personnel,
                personnelCount: personnel.length,
                risks: plan.risks ? { ...plan.risks } : {},
                riskSummary: buildRiskSummary(plan.risks),
                sustainabilityBadge: plan.sustainability?.badge || null,
                sustainabilityHighlight: plan.sustainability?.highlight || null,
                stepCount: Array.isArray(plan.steps) ? plan.steps.length : 0,
                topSteps,
                metrics
            },
            timestamp
        };

        window.dispatchEvent(new CustomEvent('welltegra:plan-saved', { detail }));
        showPlannerToast('Integrated program synced to Mobile Communicator');
    };

    const renderBulletList = (items, emptyMessage = '') => {
        if (!Array.isArray(items) || items.length === 0) {
            if (!emptyMessage) {
                return '';
            }
            return `<p class="text-sm italic text-slate-500 dark:text-slate-400">${escapeHtml(emptyMessage)}</p>`;
        }

        return `
            <ul class="space-y-2 text-sm text-slate-300">
                ${items
                    .map(item => `
                        <li class="flex items-start gap-2">
                            <span class="mt-1 text-blue-400">•</span>
                            <span>${escapeHtml(item)}</span>
                        </li>
                    `)
                    .join('')}
            </ul>
        `;
    };

    const renderOptionalList = (title, items) => {
        if (!Array.isArray(items) || items.length === 0) {
            return '';
        }

        return `
            <div class="mt-6">
                <h5 class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">${escapeHtml(title)}</h5>
                ${renderBulletList(items)}
            </div>
        `;
    };

    const renderCostCodeTable = (costCodes) => {
        if (!Array.isArray(costCodes) || costCodes.length === 0) {
            return '';
        }

        const rows = costCodes
            .map(code => {
                const estimate = typeof code.estimate === 'number' ? code.estimate : Number(code.estimate) || 0;
                return `
                    <tr>
                        <td class="px-3 py-2 text-sm text-slate-200">${escapeHtml(code.code || '')}</td>
                        <td class="px-3 py-2 text-sm text-slate-300">${escapeHtml(code.description || '')}</td>
                        <td class="px-3 py-2 text-sm text-right text-slate-200">$${estimate.toLocaleString()}</td>
                    </tr>
                `;
            })
            .join('');

        return `
            <div class="mt-6 overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-700 text-left">
                    <thead>
                        <tr class="text-xs uppercase tracking-wide text-slate-400">
                            <th class="px-3 py-2 font-semibold">Cost Code</th>
                            <th class="px-3 py-2 font-semibold">Description</th>
                            <th class="px-3 py-2 font-semibold text-right">Estimate (USD)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderPlan = () => {
        if (!appState.selectedWell || !appState.generatedPlan || !appState.selectedObjective) {
            return;
        }
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
                                <span class="text-red-600 mr-2 font-bold">⚠️</span>
                                <span class="text-red-800 dark:text-red-300">${c}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        ` : '';

        const equipmentList = objectiveEquipmentRequirements[appState.selectedObjective.id] || [];
        const enrichedEquipment = equipmentList.map(item => {
            const matchedEquipment = findMatchingEquipment(item.name);
            const vendor = matchedEquipment?.vendor || resolveVendor(item.name);
            const location = matchedEquipment?.location || 'TBD';
            const status = matchedEquipment?.status || 'Standby';
            const rate = matchedEquipment?.rate || item.price || 0;
            const notes = matchedEquipment?.notes || '';
            const satisfied = item.source !== 'Vendor' || ['available', 'on job'].includes((matchedEquipment?.status || '').toLowerCase());
            return {
                ...item,
                vendor,
                location,
                status,
                rate,
                notes,
                checkboxAttr: satisfied ? 'checked disabled' : ''
            };
        });

        const equipmentHtml = `
            <div class="plan-summary-card light-card overflow-hidden">
                <div class="card-header bg-blue-500">
                    <h4 class="text-xl font-semibold text-white">Equipment Requirements</h4>
                </div>
                <div class="p-6 space-y-3">
                    ${enrichedEquipment.map(item => `
                        <div class="equipment-card">
                            <div class="flex justify-between items-start gap-4">
                                <div class="flex items-start gap-3">
                                    <input type="checkbox" class="h-4 w-4 mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500" ${item.checkboxAttr}>
                                    <div>
                                        <p class="font-semibold">${item.name}</p>
                                        <p class="text-xs text-slate-400">Source: ${item.source}</p>
                                        <p class="text-xs text-slate-400">Vendor: ${item.vendor}</p>
                                        <p class="text-xs text-slate-400">Location: ${item.location}</p>
                                        ${item.notes ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${item.notes}</p>` : ''}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="block text-sm font-semibold">${formatCurrency(item.rate)}</span>
                                    <span class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full status-${toStatusClass(item.status)}">${item.status}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const serviceTemplate = getServiceTemplateForObjective(appState.selectedObjective.id);
        let serviceTemplateHtml = '';
        if (serviceTemplate) {
            const toolingList = (serviceTemplate.equipment_ids || []).map(id => {
                const catalogItem = equipmentCatalogIndex[id];
                const matchedEquipment = catalogItem ? findMatchingEquipment(catalogItem.name) : null;
                const vendorDetail = matchedEquipment?.vendor ? ` • Vendor: ${matchedEquipment.vendor}` : '';
                const rateDetail = matchedEquipment?.rate ? ` • Rate: ${formatCurrency(matchedEquipment.rate)}` : '';
                return `
                    <li class="border-b border-slate-700/40 pb-2 last:border-0">
                        <p class="font-semibold">${catalogItem ? catalogItem.name : id}</p>
                        <p class="text-xs text-slate-400">${catalogItem ? catalogItem.categoryName : 'Tooling'}${vendorDetail}${rateDetail}</p>
                    </li>
                `;
            }).join('') || '<li class="text-sm text-slate-400">Tooling catalog entry coming soon.</li>';

            serviceTemplateHtml = `
                <div class="plan-summary-card light-card overflow-hidden">
                    <div class="card-header bg-emerald-500">
                        <h4 class="text-xl font-semibold text-white">Service Line Template</h4>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <p class="text-sm font-medium text-slate-400">Category</p>
                            <p class="font-semibold">${serviceTemplate.category}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Package</p>
                            <p class="font-semibold">${serviceTemplate.name}</p>
                            <p class="text-sm text-slate-400">${serviceTemplate.description}</p>
                            ${serviceTemplate.duration_hours ? `<p class="text-xs text-slate-400 mt-1">Estimated duration: ${serviceTemplate.duration_hours} hours</p>` : ''}
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Applications</p>
                            <ul class="list-disc pl-5 text-sm space-y-1">${(serviceTemplate.applications || []).map(app => `<li>${app}</li>`).join('')}</ul>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Tooling Pull</p>
                            <ul class="space-y-2">${toolingList}</ul>
                        </div>
                    </div>
                </div>
            `;
        }

        const supplementalCards = [];
        if (serviceTemplateHtml) supplementalCards.push(serviceTemplateHtml);
        if (logisticsHtml) supplementalCards.push(logisticsHtml);
        const supplementalSection = supplementalCards.length ? `<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">${supplementalCards.join('')}</div>` : '';

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
            ${supplementalSection}
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

        renderAssetManagementViews(equipmentSearch ? equipmentSearch.value : '', personnelSearch ? personnelSearch.value : '');
        initializeCommercial();
        initializeHSE();
        renderPOBView();

        broadcastPlanSnapshot(procedure);

        updateNavLinks();

        appState.handoverReady = false;
        renderHandoverPackage();

        if (step4ContinueBtn) step4ContinueBtn.disabled = false;
        if (step5ContinueBtn) step5ContinueBtn.disabled = true;
        if (beginOpBtn) beginOpBtn.disabled = true;
        if (readinessOutput) {
            readinessOutput.innerHTML = '';
        }
    };

    const renderReadinessSummary = () => {
        if (!readinessOutput) return;
        if (!appState.generatedPlan || !appState.selectedObjective) {
            readinessOutput.innerHTML = '<div class="light-card p-6 rounded-lg text-sm text-slate-400 text-center">Generate an integrated program to view logistics and commercial readiness.</div>';
            if (step5ContinueBtn) step5ContinueBtn.disabled = true;
            return;
        }

        const plan = appState.generatedPlan;
        const equipmentList = objectiveEquipmentRequirements[appState.selectedObjective.id] || [];
        const enrichedEquipment = equipmentList.map(item => {
            const matched = findMatchingEquipment(item.name);
            return {
                name: item.name,
                vendor: matched?.vendor || resolveVendor(item.name),
                status: matched?.status || 'TBD',
                location: matched?.location || 'TBD',
                rate: matched?.rate || item.price || 0
            };
        });
        const personnelList = plan.personnel || [];
        const conflicts = checkLogistics();
        const riskEntries = Object.entries(plan.risks || {});

        const equipmentHtml = enrichedEquipment.length > 0 ? enrichedEquipment.map(item => `
            <li class="flex justify-between items-start gap-4 border-b border-slate-700/40 py-2 last:border-0">
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-xs text-slate-400">Vendor: ${item.vendor} • Location: ${item.location}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-slate-400 uppercase">Status</p>
                    <span class="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full status-${toStatusClass(item.status)}">${item.status}</span>
                    <p class="text-xs text-slate-400 mt-1">${formatCurrency(item.rate)} / day</p>
                </div>
            </li>
        `).join('') : '<li class="text-sm text-slate-400">No catalogue requirements for this objective.</li>';

        const personnelHtml = personnelList.length > 0 ? personnelList.map(role => `
            <li class="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
                <span>${role}</span>
                <span class="text-xs text-slate-400">Certification check scheduled</span>
            </li>
        `).join('') : '<li class="text-sm text-slate-400">No personnel assigned.</li>';

        const riskHtml = riskEntries.length > 0 ? riskEntries.map(([key, value]) => `
            <li class="flex items-center justify-between">
                <span class="capitalize">${key}</span>
                <span>${value}/5 ${value >= 4 ? '⚠️' : value >= 3 ? '▲' : '✔️'}</span>
            </li>
        `).join('') : '<li class="text-sm text-slate-400">Risk profile pending.</li>';

        const conflictHtml = conflicts.length > 0 ? `
            <div class="light-card p-5 rounded-lg border border-red-400/40">
                <h4 class="text-lg font-semibold text-red-300 mb-2">Outstanding Actions</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm text-red-200">
                    ${conflicts.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        ` : `
            <div class="light-card p-5 rounded-lg border border-emerald-400/30">
                <h4 class="text-lg font-semibold text-emerald-300 mb-2">All Logistics Checks Cleared</h4>
                <p class="text-sm text-emerald-100">No resource conflicts detected. Mobilisation can proceed when approvals are complete.</p>
            </div>
        `;
        const getTrendClass = (direction) => direction === 'up' ? 'sustainability-trend--up' : 'sustainability-trend--down';
        const sustainability = plan.sustainability;
        const sustainabilityMetricsMarkup = sustainability && Array.isArray(sustainability.metrics)
            ? sustainability.metrics.map(metric => {
                const context = metric.context ? `<span class="sustainability-context">${metric.context}</span>` : '';
                const trend = metric.trend
                    ? `<span class="sustainability-trend ${getTrendClass(metric.direction)}">${metric.trend}</span>`
                    : '';
                return `
                    <dt class="sustainability-metric__label">${metric.label}</dt>
                    <dd class="sustainability-metric__value">
                        <span class="sustainability-value">${metric.value}</span>
                        ${context}
                        ${trend}
                    </dd>
                `;
            }).join('')
            : '';
        const sustainabilityAssuranceHtml = sustainability && sustainability.assurance
            ? `
                <div class="sustainability-assurance mt-5">
                    <span class="sustainability-assurance__label">${sustainability.assurance.label}</span>
                    <span class="sustainability-assurance__value">${sustainability.assurance.value}</span>
                    ${sustainability.assurance.context ? `<p class="sustainability-assurance__context">${sustainability.assurance.context}</p>` : ''}
                </div>
            `
            : '';
        const sustainabilityHighlightHtml = sustainability && sustainability.highlight
            ? `<p class="text-sm text-slate-400">${sustainability.highlight}</p>`
            : '';
        const sustainabilityBadgeHtml = sustainability && sustainability.badge
            ? `<span class="sustainability-badge">${sustainability.badge}</span>`
            : '';
        const sustainabilityCard = sustainability
            ? `
                <div class="light-card p-5 rounded-lg sustainability-card" data-test-sustainability-card="true">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h4 class="text-lg font-semibold mb-1">Energy &amp; Emissions Impact</h4>
                            ${sustainabilityHighlightHtml}
                        </div>
                        ${sustainabilityBadgeHtml}
                    </div>
                    ${sustainabilityMetricsMarkup ? `<dl class="sustainability-metric-grid mt-5">${sustainabilityMetricsMarkup}</dl>` : ''}
                    ${sustainabilityAssuranceHtml}
                </div>
            `
            : '';
        const crewCard = `
            <div class="light-card p-5 rounded-lg">
                <h4 class="text-lg font-semibold mb-2">Crew Line-Up</h4>
                <ul>${personnelHtml}</ul>
                <p class="text-xs text-slate-500 mt-3">Detailed certifications and travel plans are managed in the Logistics workspace.</p>
            </div>
        `;
        const rightColumnCards = [crewCard, conflictHtml, sustainabilityCard].filter(Boolean).join('');

        readinessOutput.innerHTML = `
            <div class="grid gap-6 lg:grid-cols-2">
                <div class="space-y-6">
                    <div class="light-card p-5 rounded-lg">
                        <h4 class="text-lg font-semibold mb-2">Schedule & Cost Snapshot</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-slate-400">Planned Duration</p>
                                <p class="text-xl font-semibold">${plan.duration} days</p>
                            </div>
                            <div>
                                <p class="text-slate-400">Program Budget</p>
                                <p class="text-xl font-semibold">${formatCurrency(plan.cost)}</p>
                            </div>
                            <div>
                                <p class="text-slate-400">Objective</p>
                                <p class="text-sm">${appState.selectedObjective.name}</p>
                            </div>
                            <div>
                                <p class="text-slate-400">Risk Summary</p>
                                <ul class="space-y-1 mt-1 text-xs">
                                    ${riskHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="light-card p-5 rounded-lg">
                        <h4 class="text-lg font-semibold mb-2">Equipment Mobilisation</h4>
                        <ul class="divide-y divide-slate-700/40">${equipmentHtml}</ul>
                    </div>
                </div>
                <div class="space-y-6">
                    ${rightColumnCards}
                </div>
            </div>
        `;

        if (step5ContinueBtn) step5ContinueBtn.disabled = false;
    };

    const renderHandoverPackage = () => {
        if (!handoverOutput) return;

        if (!appState.generatedPlan || !appState.selectedObjective || !appState.selectedWell) {
            handoverOutput.innerHTML = `
                <div class="light-card p-6 rounded-lg text-sm text-slate-400 text-center">
                    Generate an integrated program to populate the digital handover binder.
                </div>
            `;
            return;
        }

        if (!appState.handoverReady) {
            handoverOutput.innerHTML = `
                <div class="light-card p-6 rounded-lg text-sm text-slate-400 text-center">
                    Complete the readiness review to unlock the execution handover package.
                </div>
            `;
            return;
        }

        const packageData = handoverPackages[appState.selectedObjective.id];
        if (!packageData) {
            handoverOutput.innerHTML = `
                <div class="light-card p-6 rounded-lg text-sm text-slate-400 text-center">
                    Handover template coming soon for this intervention objective.
                </div>
            `;
            return;
        }

        const {
            readiness = {},
            deliverables = [],
            signoffs = [],
            automations = [],
            notes = []
        } = packageData;

        const metadata = [
            ['Binder ID', readiness.binderId],
            ['Operations Lead', readiness.operationsLead],
            ['QA Lead', readiness.qaLead],
            ['Go-Live', readiness.goLive],
            ['Close-Out Review', readiness.closeout],
            ['Knowledge Sync', readiness.knowledgeSync]
        ].filter(([, value]) => Boolean(value));

        const metadataHtml = metadata.length
            ? `<div class="grid gap-4 text-sm sm:grid-cols-2 lg:w-1/2">${metadata.map(([label, value]) => `
                    <div>
                        <dt class="text-xs uppercase tracking-wide text-slate-400">${escapeHtml(label)}</dt>
                        <dd class="mt-1 font-semibold text-slate-100">${escapeHtml(value)}</dd>
                    </div>
                `).join('')}</div>`
            : '';

        const metrics = Array.isArray(readiness.metrics) ? readiness.metrics : [];
        const metricColumns = Math.max(1, Math.min(metrics.length, 3));
        const metricsHtml = metrics.length
            ? `<div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-${metricColumns}">${metrics.map(metric => `
                    <div class="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                        <p class="text-xs uppercase tracking-wide text-slate-400">${escapeHtml(metric.label || '')}</p>
                        <p class="mt-2 text-xl font-semibold text-slate-100">${escapeHtml(metric.value || '—')}</p>
                        ${metric.context ? `<p class="mt-1 text-xs text-slate-400">${escapeHtml(metric.context)}</p>` : ''}
                    </div>
                `).join('')}</div>`
            : '';

        const binderSummaryCard = `
            <div class="light-card p-5 rounded-lg">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div class="lg:w-1/2">
                        <h4 class="text-lg font-semibold">Digital Handover Binder</h4>
                        <p class="text-sm text-slate-400 mt-2">${escapeHtml(readiness.summary || `Closeout package staged for ${appState.selectedWell.name}.`)}</p>
                    </div>
                    ${metadataHtml}
                </div>
                ${metricsHtml}
            </div>
        `;

        const deliverableRows = deliverables.length
            ? deliverables.map(item => {
                const statusLabel = item.status || 'Pending';
                const statusClass = toStatusClass(statusLabel);
                return `
                    <tr class="border-b border-slate-800/60 last:border-0">
                        <td class="p-2 align-top">
                            <p class="font-semibold">${escapeHtml(item.title)}</p>
                            ${item.channel ? `<p class="text-xs text-slate-400 mt-1">${escapeHtml(item.channel)}</p>` : ''}
                        </td>
                        <td class="p-2 align-top">${escapeHtml(item.owner || '—')}</td>
                        <td class="p-2 align-top">${escapeHtml(item.due || '—')}</td>
                        <td class="p-2 text-right align-top">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full status-${statusClass}">${escapeHtml(statusLabel)}</span>
                        </td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="4" class="p-4 text-sm text-slate-400 text-center">No deliverables have been captured yet.</td></tr>';

        const deliverablesCard = `
            <div class="light-card p-5 rounded-lg">
                <h4 class="text-lg font-semibold mb-4">Close-Out Deliverables</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="table-header">
                            <tr>
                                <th class="p-2">Deliverable</th>
                                <th class="p-2">Owner</th>
                                <th class="p-2">Due</th>
                                <th class="p-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>${deliverableRows}</tbody>
                    </table>
                </div>
            </div>
        `;

        const signoffItems = signoffs.length
            ? signoffs.map(entry => {
                const statusLabel = entry.status || 'Pending';
                const statusClass = toStatusClass(statusLabel);
                return `
                    <li class="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex items-start justify-between gap-4">
                        <div>
                            <p class="text-sm font-semibold">${escapeHtml(entry.role || 'Sign-off')}</p>
                            <p class="text-xs text-slate-400 mt-1">${escapeHtml(entry.name || 'Owner pending')}</p>
                            ${entry.timestamp ? `<p class="text-xs text-slate-500 mt-1">${escapeHtml(entry.timestamp)}</p>` : ''}
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full status-${statusClass}">${escapeHtml(statusLabel)}</span>
                    </li>
                `;
            }).join('')
            : '<li class="text-sm text-slate-400">No sign-offs have been requested yet.</li>';

        const signoffCard = `
            <div class="light-card p-5 rounded-lg">
                <h4 class="text-lg font-semibold mb-4">Sign-Off Trail</h4>
                <ul class="space-y-3">${signoffItems}</ul>
            </div>
        `;

        const automationItems = automations.length
            ? automations.map(task => {
                const statusLabel = task.status || 'Pending';
                const statusClass = toStatusClass(statusLabel);
                return `
                    <li class="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-sm font-semibold">${escapeHtml(task.name || 'Automation')}</p>
                                ${task.detail ? `<p class="text-xs text-slate-400 mt-1">${escapeHtml(task.detail)}</p>` : ''}
                            </div>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full status-${statusClass}">${escapeHtml(statusLabel)}</span>
                        </div>
                    </li>
                `;
            }).join('')
            : '<li class="text-sm text-slate-400">No automation hooks have been triggered for this handover.</li>';

        const automationCard = `
            <div class="light-card p-5 rounded-lg">
                <h4 class="text-lg font-semibold mb-4">Automation & Ledger Updates</h4>
                <ul class="space-y-3">${automationItems}</ul>
            </div>
        `;

        const notesList = notes.length
            ? `<ul class="mt-4 space-y-2 text-sm">${notes.map(note => `
                    <li class="flex items-start gap-2">
                        <span class="mt-1 text-emerald-400">✔</span>
                        <span>${escapeHtml(note)}</span>
                    </li>
                `).join('')}</ul>`
            : '<p class="text-sm text-slate-400 mt-2">No additional reminders captured for this handover.</p>';

        const notesCard = `
            <div class="light-card p-5 rounded-lg">
                <h4 class="text-lg font-semibold">Final Reminders</h4>
                <p class="text-sm text-slate-400">Ensure these actions are logged before the handover is archived.</p>
                ${notesList}
            </div>
        `;

        handoverOutput.innerHTML = [
            binderSummaryCard,
            `<div class="grid gap-6 lg:grid-cols-2">
                ${deliverablesCard}
                <div class="space-y-6">
                    ${signoffCard}
                    ${automationCard}
                </div>
            </div>`,
            notesCard
        ].join('');
    };

    const updatePlannerStepUI = (currentStep) => {
        // Reset all step indicators and connectors
        Object.values(stepIndicators).forEach(indicator => {
            if (!indicator) return;
            indicator.classList.remove('active', 'completed', 'bg-blue-600', 'text-white');
            indicator.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
        });

        Object.values(stepConnectors).forEach(connector => {
            if (!connector) return;
            connector.classList.remove('active', 'completed', 'bg-blue-600');
            connector.classList.add('bg-gray-200');
        });

        // Mark completed steps
        for (let i = 1; i < currentStep; i++) {
            const indicator = stepIndicators[i];
            if (indicator) {
                indicator.classList.add('completed', 'bg-blue-600', 'text-white');
                indicator.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
            }

            const connector = stepConnectors[i];
            if (connector) {
                connector.classList.add('completed', 'bg-blue-600');
                connector.classList.remove('bg-gray-200');
            }
        }

        // Mark active step
        const activeIndicator = stepIndicators[currentStep];
        if (activeIndicator) {
            activeIndicator.classList.add('active', 'bg-blue-600', 'text-white');
            activeIndicator.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-500');
        }

        // Show all completed sections and hide future ones
        Object.entries(stepSections).forEach(([key, section]) => {
            if (!section) return;
            const stepNumber = Number(key);
            if (Number.isNaN(stepNumber)) return;
            if (stepNumber <= currentStep) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });

        if (currentStep === 6) {
            renderHandoverPackage();
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
            const pressureCard = document.getElementById('kpi-pressure-card');
            const annulusCard = document.getElementById('kpi-annulus-card');
            if (pressureCard) pressureCard.classList.add('csp-hidden');
            if (annulusCard) annulusCard.classList.add('csp-hidden');
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

        if (isSlickline) {
            chartCard.classList.add('csp-hidden');
            chartCard.classList.remove('csp-flex');
        } else {
            chartCard.classList.remove('csp-hidden');
            chartCard.classList.add('csp-flex');
        }

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
            document.getElementById('job-status').textContent = "• JOB COMPLETE"; 
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
        if (!equipmentTableBody || !personnelTableBody) return;

        const setEmptyTables = (message) => {
            equipmentTableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-sm text-slate-400">${message}</td></tr>`;
            personnelTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-sm text-slate-400">${message}</td></tr>`;
        };

        if (!appState.referenceDataLoaded) {
            logisticsSubtitle.textContent = "Loading catalog data...";
            setEmptyTables('Loading reference datasets…');
            if (logisticsReferenceCard) {
                logisticsReferenceCard.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">Service Line Reference</h3>
                    <p class="text-sm text-slate-400">Fetching service-line templates and tooling catalog…</p>
                `;
            }
            return;
        }

        if (!appState.generatedPlan) {
            logisticsSubtitle.textContent = "Please generate a plan in the Planner to view job-specific logistics.";
            setEmptyTables('Generate a plan to load logistics data.');
            if (logisticsReferenceCard) {
                logisticsReferenceCard.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">Service Line Reference</h3>
                    <p class="text-sm text-slate-400">Generate a plan to view recommended templates and vendor pairings.</p>
                `;
            }
            return;
        }

        logisticsSubtitle.textContent = `Logistics for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;

        const requiredEquipment = objectiveEquipmentRequirements[appState.selectedObjective.id] || [];
        const requiredRoles = appState.generatedPlan.personnel || [];

        const eqF = eqFilter.toLowerCase();
        const filteredEquipment = equipmentData.filter(item => {
            const matchesRequirement = requiredEquipment.some(req => matchesEquipmentRequirement(req.name, item));
            if (!matchesRequirement) return false;
            if (!eqF) return true;
            return [item.id, item.type, item.vendor, item.location]
                .filter(Boolean)
                .some(val => val.toLowerCase().includes(eqF));
        });

        equipmentTableBody.innerHTML = filteredEquipment.length ? filteredEquipment.map(item => {
            const testStatus = item.testStatus || 'Pending';
            const statusClass = toStatusClass(testStatus || 'pending');
            const testDisabled = testStatus !== 'Pending';
            return `
                <tr>
                    <td class="p-2">${item.id}</td>
                    <td class="p-2">${item.type}</td>
                    <td class="p-2">${item.vendor || 'Vendor TBD'}</td>
                    <td class="p-2">${item.location || 'TBD'}</td>
                    <td class="p-2">${formatCurrency(item.rate)}</td>
                    <td class="p-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full status-${statusClass || 'pending'}">${testStatus}</span>
                    </td>
                    <td class="p-2">
                        <button class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200${testDisabled ? ' opacity-50 cursor-not-allowed' : ''}" ${testDisabled ? 'disabled' : ''}>Test</button>
                    </td>
                </tr>
            `;
        }).join('') : `<tr><td colspan="7" class="p-4 text-center text-sm text-slate-400">No matching equipment found.</td></tr>`;

        const persF = persFilter.toLowerCase();

        const filteredPersonnel = personnelData.filter(person => {
            const matchesRole = requiredRoles.some(role => matchesPersonnelRole(role, person));
            if (!matchesRole) return false;
            if (!persF) return true;
            return [person.name, person.role, person.company, person.id]
                .filter(Boolean)
                .some(val => val.toLowerCase().includes(persF));
        });

        personnelTableBody.innerHTML = filteredPersonnel.length ? filteredPersonnel.map(person => {
            const statusClass = toStatusClass(person.status || 'available');
            const perDiem = person.perDiem ? `<span class="block text-xs text-slate-400">Per diem ${formatCurrency(person.perDiem)}</span>` : '';
            return `
                <tr>
                    <td class="p-2">
                        <div class="flex flex-col">
                            <span class="font-semibold">${person.name}</span>
                            <span class="text-xs text-slate-400">${person.id}</span>
                        </div>
                    </td>
                    <td class="p-2">${person.role}</td>
                    <td class="p-2">${person.company}</td>
                    <td class="p-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full status-${statusClass || 'available'}">${person.status}</span>
                    </td>
                    <td class="p-2">
                        ${formatCurrency(person.rate)}
                        ${perDiem}
                    </td>
                    <td class="p-2">${person.certsValid ? '✅ Valid' : '⚠️ Needs Renewal'}</td>
                </tr>
            `;
        }).join('') : `<tr><td colspan="6" class="p-4 text-center text-sm text-slate-400">No matching personnel found.</td></tr>`;

        if (logisticsReferenceCard) {
            const template = getServiceTemplateForObjective(appState.selectedObjective.id);
            if (!template) {
                logisticsReferenceCard.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">Service Line Reference</h3>
                    <p class="text-sm text-slate-400">No service template mapped to this objective yet.</p>
                `;
            } else {
                const toolingList = (template.equipment_ids || []).map(id => {
                    const catalogItem = equipmentCatalogIndex[id];
                    const matchedEquipment = catalogItem ? findMatchingEquipment(catalogItem.name) : null;
                    const vendorDetail = matchedEquipment?.vendor ? ` • Vendor: ${matchedEquipment.vendor}` : '';
                    const rateDetail = matchedEquipment?.rate ? ` • Rate: ${formatCurrency(matchedEquipment.rate)}` : '';
                    return `
                        <li class="border-b border-slate-700/40 pb-2 last:border-0">
                            <p class="font-semibold">${catalogItem ? catalogItem.name : id}</p>
                            <p class="text-xs text-slate-400">${catalogItem ? catalogItem.categoryName : 'Tooling'}${vendorDetail}${rateDetail}</p>
                        </li>
                    `;
                }).join('') || '<li class="text-sm text-slate-400">Tooling catalog entry coming soon.</li>';

                logisticsReferenceCard.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">Service Line Reference</h3>
                    <div class="space-y-4">
                        <div>
                            <p class="text-sm font-medium text-slate-400">Category</p>
                            <p class="font-semibold">${template.category}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Package</p>
                            <p class="font-semibold">${template.name}</p>
                            <p class="text-sm text-slate-400">${template.description}</p>
                            ${template.duration_hours ? `<p class="text-xs text-slate-400 mt-1">Estimated duration: ${template.duration_hours} hours</p>` : ''}
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Applications</p>
                            <ul class="list-disc pl-5 text-sm space-y-1">${(template.applications || []).map(app => `<li>${app}</li>`).join('')}</ul>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-400">Tooling Pull</p>
                            <ul class="space-y-2">${toolingList}</ul>
                        </div>
                    </div>
                `;
            }
        }
    };

    const checkLogistics = () => {
        const conflicts = [];
        const requiredEquipment = objectiveEquipmentRequirements[appState.selectedObjective.id] || [];

        requiredEquipment.forEach(req => {
            if (req.source === 'Vendor') {
                const availableTool = equipmentData.find(item => matchesEquipmentRequirement(req.name, item) && item.status === 'Available');
                if (!availableTool) {
                    const vendor = resolveVendor(req.name);
                    conflicts.push(`No available equipment of type: <strong>${req.name}</strong>. Coordinate with <strong>${vendor}</strong> for mobilisation.`);
                }
            }
        });

        (appState.generatedPlan.personnel || []).forEach(roleName => {
            const availablePerson = personnelData.find(person => matchesPersonnelRole(roleName, person) && person.status === 'Available');
            if (!availablePerson) {
                const candidate = personnelData.find(person => matchesPersonnelRole(roleName, person));
                if (candidate && !candidate.certsValid) {
                    conflicts.push(`Personnel <strong>${candidate.name} (${roleName})</strong> has certifications that require renewal.`);
                } else {
                    conflicts.push(`No available personnel for role: <strong>${roleName}</strong>.`);
                }
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
        
        const unaccountedCount = totalPOB - musteredCount;
        const totalDailyRate = appState.pob.personnel.reduce((sum, person) => sum + (Number(person.rate) || 0), 0);
        const totalPerDiem = appState.pob.personnel.reduce((sum, person) => sum + (Number(person.perDiem) || 0), 0);

        const summaryHtml = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Total POB</p>
                    <p class="text-4xl font-bold">${totalPOB}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Accounted For</p>
                    <p class="text-4xl font-bold text-green-600">${musteredCount}</p>
                    <p class="mt-2 text-xs text-slate-400">Unaccounted: ${unaccountedCount}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Daily Crew Rate</p>
                    <p class="text-3xl font-bold">${formatCurrency(totalDailyRate)}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Daily Crew Rate</p>
                    <p class="text-3xl font-bold">${formatCurrency(totalDailyRate)}</p>
                </div>
                <div class="light-card p-6 text-center rounded-lg">
                    <p class="text-sm font-medium">Daily Per Diem</p>
                    <p class="text-3xl font-bold">${formatCurrency(totalPerDiem)}</p>
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
                                <th class="p-2">Daily Rate</th>
                                <th class="p-2">Per Diem</th>
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
                                    <td class="p-2">${formatCurrency(p.rate)}</td>
                                    <td class="p-2">${formatCurrency(p.perDiem)}</td>
                                    <td class="p-2">${p.muster}</td>
                                    <td class="p-2">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full status-${toStatusClass(p.musterStatus || 'pending')}">${p.musterStatus}</span>
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
        
        const musterDrillBtn = document.getElementById('muster-drill-btn');
        addListener(musterDrillBtn, 'click', toggleMusterDrill);
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
            commercialSubtitle.textContent = "No active operation.";
            return;
        }

        commercialSubtitle.textContent = `Live financial tracking for ${appState.generatedPlan.name} on ${appState.selectedWell.name}`;

        const planDuration = Math.max(1, Number(appState.generatedPlan.duration) || 1);
        appState.commercial.afe = Number(appState.generatedPlan.cost) || 0;
        appState.commercial.actualCost = 0;
        appState.commercial.serviceTickets = [];

        const pushTicket = ({ description, cost = 0, vendor = 'Vendor TBD', status = 'Pending' }) => {
            const ticketCost = Number(cost) || 0;
            appState.commercial.serviceTickets.push({
                description,
                cost: ticketCost,
                vendor,
                status
            });
            appState.commercial.actualCost += ticketCost;
        };

        const equipmentList = objectiveEquipmentRequirements[appState.selectedObjective.id] || [];
        equipmentList.forEach(item => {
            const matchedEquipment = findMatchingEquipment(item.name);
            const vendor = matchedEquipment?.vendor || 'Vendor TBD';
            const status = matchedEquipment?.status || 'Pending';
            const rate = matchedEquipment?.rate || item.price || 0;
            const cost = rate * planDuration;

            pushTicket({
                description: `Rental: ${item.name}`,
                cost,
                vendor,
                status
            });
        });

        const crewRoles = appState.generatedPlan.personnel || [];
        crewRoles.forEach(roleName => {
            const crewMember = personnelData.find(person => matchesPersonnelRole(roleName, person));
            if (!crewMember) {
                pushTicket({
                    description: `Crew mobilisation: ${roleName}`,
                    vendor: 'Crew TBD',
                    status: 'Pending'
                });
                return;
            }

            const dailyRate = Number(crewMember.rate) || 0;
            const perDiem = Number(crewMember.perDiem) || 0;
            const totalCost = (dailyRate + perDiem) * planDuration;

            pushTicket({
                description: `Crew: ${crewMember.role}`,
                cost: totalCost,
                vendor: crewMember.company || 'Service Co.',
                status: crewMember.status || 'Scheduled'
            });
        });

        renderCommercialView();
    };


    const renderCommercialView = () => {
        if (!appState.generatedPlan) {
            initializeCommercial();
            return;
        }

        const afe = Number(appState.commercial.afe) || 0,
        actual = Number(appState.commercial.actualCost) || 0;
        const burnPercent = afe > 0 ? Math.min(100, (actual / afe) * 100) : 0;
        const burnColor = burnPercent > 90 ? 'bg-red-500' : burnPercent > 75 ? 'bg-yellow-500' : 'bg-teal-500';

        commercialContent.innerHTML = `
            <div class="grid gap-8 lg:grid-cols-3">
                <div class="lg:col-span-2 light-card p-6 rounded-lg">
                    <h3 class="text-xl font-semibold mb-4">Live AFE vs. Actual</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between font-bold text-lg">
                            <span>Actual Cost</span>
                            <span>${formatCurrency(actual)}</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div class="${burnColor} h-4 rounded-full burn-rate-progress" data-width="${burnPercent}"></div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Budget (AFE): ${formatCurrency(afe)}</span>
                            <span>${burnPercent.toFixed(1)}% Used</span>
                        </div>
                    </div>
                    <h3 class="text-xl font-semibold mt-8 mb-4">Automated Service Tickets</h3>
                    <div class="h-64 overflow-y-auto border dark:border-gray-700 rounded-md">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header sticky top-0">
                                <tr>
                                    <th class="p-2">Description</th>
                                    <th class="p-2">Vendor</th>
                                    <th class="p-2">Cost</th>
                                    <th class="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody id="service-ticket-body">
                                ${appState.commercial.serviceTickets.length ? appState.commercial.serviceTickets.map(t => {
                                    const statusLabel = t.status || 'Pending';
                                    const statusClass = toStatusClass(statusLabel || 'pending');
                                    return `
                                        <tr class="border-b table-row-alt dark:border-gray-700">
                                            <td class="p-2">${t.description}</td>
                                            <td class="p-2">${t.vendor || 'Vendor TBD'}</td>
                                            <td class="p-2">${formatCurrency(t.cost)}</td>
                                            <td class="p-2">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full status-${statusClass || 'pending'}">${statusLabel}</span>
                                            </td>
                                        </tr>
                                    `;
                                }).join('') : `
                                    <tr>
                                        <td colspan="4" class="p-4 text-center text-sm text-slate-400">Service tickets will appear after a plan is generated.</td>
                                    </tr>
                                `}
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

        // Apply burn rate width via JavaScript (CSP compliant)
        const burnRateBar = commercialContent.querySelector('.burn-rate-progress');
        if (burnRateBar) {
            const width = burnRateBar.getAttribute('data-width');
            if (width !== null) {
                burnRateBar.style.setProperty('--bar-width', `${width}%`);
            }
        }

        const validateInvoiceBtn = document.getElementById('validate-invoice-btn');
        addListener(validateInvoiceBtn, 'click', validateInvoice);
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
        if (!well || !modal || !modalTitle || !modalContent) return;

        const activeElement = document.activeElement;
        lastFocusedElement = activeElement instanceof HTMLElement ? activeElement : null;

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
        modal.removeAttribute('aria-hidden');
        requestAnimationFrame(() => {
            closeModalBtn?.focus();
        });
    };

    const renderModalTabs = (well) => {
        document.getElementById('history-content').innerHTML = well.history.length ? well.history.map(h => `
            <div class="p-4 mb-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p class="font-bold text-lg">${h.operation} <span class="text-sm font-normal">- ${h.date}</span></p>
                <div class="mt-3 space-y-3">
                    <div class="flex items-start">
                        <span class="text-xl mr-3">⚠️</span>
                        <div>
                            <strong class="font-semibold text-red-600 dark:text-red-400">Problem:</strong>
                            <p class="text-sm">${h.problem}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-xl mr-3" role="img" aria-label="Lesson learned">💡</span>
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

    const closeModal = () => {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement) {
            requestAnimationFrame(() => {
                lastFocusedElement?.focus();
            });
        }
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
        engineerCountSlider.setAttribute('aria-valuenow', engineers);
        engineerCountSlider.setAttribute('aria-valuetext', `${engineers} well engineers`);
        nptReductionValue.textContent = `${nptReduction * 100}%`;
        nptReductionSlider.setAttribute('aria-valuenow', nptReduction * 100);
        nptReductionSlider.setAttribute('aria-valuetext', `${nptReduction * 100}% projected reduction`);
        timeSavingsValue.textContent = `${timeSavings * 100}%`;
        timeSavingsSlider.setAttribute('aria-valuenow', timeSavings * 100);
        timeSavingsSlider.setAttribute('aria-valuetext', `${timeSavings * 100}% engineering time reclaimed`);
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

    if (engineerCountSlider || nptReductionSlider || timeSavingsSlider) {
        [engineerCountSlider, nptReductionSlider, timeSavingsSlider]
            .filter(Boolean)
            .forEach(slider => slider.addEventListener('input', calculateROI));
    }

    const formatByteSize = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) return '—';

        const units = ['B', 'KB', 'MB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }

        const precision = size % 1 === 0 ? 0 : 1;
        return `${size.toFixed(precision)} ${units[unitIndex]}`;
    };

    const copyToClipboard = async (text) => {
        if (!text) return false;

        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {
            // Fallback to execCommand path below
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.classList.add('csp-offscreen');
        document.body.appendChild(textarea);
        textarea.select();

        let succeeded = false;

        try {
            succeeded = document.execCommand('copy');
        } catch (_) {
            succeeded = false;
        }

        document.body.removeChild(textarea);
        return succeeded;
    };

    const announceCopyStatus = (statusEl, message, isError = false) => {
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.classList.toggle('text-emerald-400', !isError);
        statusEl.classList.toggle('text-rose-400', isError);

        if (message) {
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.classList.remove('text-emerald-400', 'text-rose-400');
            }, 4000);
        }
    };

    const buildPandasSnippet = (file) => {
        const fileUrl = new URL(file, window.location.origin).href;
        return [
            'import pandas as pd',
            `df = pd.read_csv("${fileUrl}", parse_dates=True)`,
            'print(df.head())'
        ].join('\n');
    };

    const buildCurlSnippet = (file) => {
        const fileUrl = new URL(file, window.location.origin).href;
        return `curl -L -o ${file} "${fileUrl}"`;
    };

    const buildSqlSchemaSnippet = (file) => {
        const schema = dataExportSchemas[file];
        if (!schema || !schema.length) return '';

        const tableName = file
            .replace(/\.csv$/i, '')
            .replace(/[^a-zA-Z0-9_]+/g, '_');

        const columnDefinitions = schema
            .map((column) => `    "${column.name}" ${column.sqlType || 'TEXT'}`)
            .join(',\n');

        const columnList = schema
            .map((column) => `"${column.name}"`)
            .join(', ');

        return [
            `-- Quick-start table definition for ${file}`,
            `CREATE TABLE ${tableName} (`,
            `${columnDefinitions}`,
            ');',
            '',
            `-- Bulk load from local CSV`,
            `COPY ${tableName} (${columnList})`,
            "FROM '/path/to/" + file + "'",
            "DELIMITER ','",
            "CSV HEADER" + ';'
        ].join('\n');
    };

    const parseCsvLine = (line) => {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    };

    const renderDataPreview = (elements, headerColumns, dataLines) => {
        if (!elements || !elements.previewBody || !elements.previewHead) return;

        const previewColumns = headerColumns.slice(0, DATA_PREVIEW_MAX_COLUMNS);
        const truncatedColumns = headerColumns.length > previewColumns.length;
        const rowsToDisplay = dataLines.slice(0, DATA_PREVIEW_MAX_ROWS);

        elements.previewHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        previewColumns.forEach((columnName) => {
            const th = document.createElement('th');
            th.textContent = columnName;
            th.className = 'px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400';
            headerRow.appendChild(th);
        });
        elements.previewHead.appendChild(headerRow);
        elements.previewHead.dataset.previewColumns = previewColumns.length.toString();

        elements.previewBody.innerHTML = '';

        if (rowsToDisplay.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.className = 'px-3 py-2 text-slate-500';
            cell.colSpan = Math.max(previewColumns.length, 1);
            cell.textContent = 'No records available';
            row.appendChild(cell);
            elements.previewBody.appendChild(row);
        } else {
            rowsToDisplay.forEach((line) => {
                const values = parseCsvLine(line);
                const row = document.createElement('tr');
                previewColumns.forEach((_, index) => {
                    const cell = document.createElement('td');
                    cell.textContent = values[index] || '';
                    cell.className = 'px-3 py-2 whitespace-nowrap text-slate-200';
                    row.appendChild(cell);
                });
                elements.previewBody.appendChild(row);
            });
        }

        if (elements.previewNotice) {
            if (rowsToDisplay.length === 0) {
                elements.previewNotice.textContent = 'Preview unavailable — dataset is empty.';
            } else {
                const rowLabel = rowsToDisplay.length === 1 ? 'record' : 'records';
                const columnDescriptor = truncatedColumns
                    ? `first ${previewColumns.length} columns`
                    : `${previewColumns.length} column${previewColumns.length === 1 ? '' : 's'}`;
                const columnText = previewColumns.length === 0
                    ? 'dataset metadata'
                    : columnDescriptor;
                elements.previewNotice.textContent = `Showing first ${rowsToDisplay.length} ${rowLabel} across ${columnText}.`;
            }
        }
    };

    const renderDataPreviewError = (elements, message) => {
        if (!elements || !elements.previewBody || !elements.previewHead) return;

        const storedColumnCount = parseInt(elements.previewHead.dataset.previewColumns || '0', 10);
        elements.previewHead.innerHTML = '';
        elements.previewHead.dataset.previewColumns = '0';
        elements.previewBody.innerHTML = '';

        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'px-3 py-2 text-slate-500';
        const colSpan = Number.isNaN(storedColumnCount) ? DATA_PREVIEW_MAX_COLUMNS : Math.max(storedColumnCount, 1);
        cell.colSpan = colSpan;
        cell.textContent = message;
        row.appendChild(cell);
        elements.previewBody.appendChild(row);

        if (elements.previewNotice) {
            elements.previewNotice.textContent = message;
        }
    };

    const bindDataExportCopyHandlers = () => {
        if (!dataExportHub || appState.dataExportHandlersBound) return;

        dataExportDatasets.forEach(({ file, elements }) => {
            if (!elements || !elements.copyButton) return;

            elements.copyButton.addEventListener('click', async () => {
                const snippet = buildPandasSnippet(file);
                const success = await copyToClipboard(snippet);

                if (success) {
                    announceCopyStatus(elements.copyStatus, 'Copied pandas import snippet to clipboard');
                } else {
                    announceCopyStatus(elements.copyStatus, 'Unable to copy. Select and copy the snippet manually.', true);
                }
            });
        });

        dataExportDatasets.forEach(({ file, elements }) => {
            if (!elements || !elements.curlButton) return;

            elements.curlButton.addEventListener('click', async () => {
                const snippet = buildCurlSnippet(file);
                const success = await copyToClipboard(snippet);

                if (success) {
                    announceCopyStatus(elements.curlStatus, 'Copied curl download command to clipboard');
                } else {
                    announceCopyStatus(elements.curlStatus, 'Unable to copy. Highlight and copy the command manually.', true);
                }
            });
        });

        dataExportDatasets.forEach(({ file, elements }) => {
            if (!elements || !elements.sqlButton) return;

            elements.sqlButton.addEventListener('click', async () => {
                const snippet = buildSqlSchemaSnippet(file);

                if (!snippet) {
                    announceCopyStatus(elements.sqlStatus, 'SQL schema unavailable. Download the CSV to inspect the structure.', true);
                    return;
                }

                const success = await copyToClipboard(snippet);

                if (success) {
                    announceCopyStatus(elements.sqlStatus, 'Copied SQL table definition to clipboard');
                } else {
                    announceCopyStatus(elements.sqlStatus, 'Unable to copy. Highlight the SQL snippet manually.', true);
                }
            });
        });

        appState.dataExportHandlersBound = true;
    };

    const hydrateDataExportMetadata = () => {
        if (!dataExportHub) return;

        dataExportDatasets.forEach(({ file, elements }) => {
            if (!elements || (!elements.recordCount && !elements.columnsList && !elements.size)) {
                return;
            }

            fetch(file)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${file}`);
                    }
                    return response.text();
                })
                .then((text) => {
                    const lines = text
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0);

                    if (!lines.length) {
                        return;
                    }

                    const headerColumns = parseCsvLine(lines[0]);
                    const dataLines = lines.slice(1);
                    const schema = dataExportSchemas[file];
                    const schemaMatchesHeader = Array.isArray(schema)
                        ? headerColumns.every((columnName) => schema.some((column) => column.name === columnName))
                        : false;

                    if (elements.recordCount) {
                        elements.recordCount.textContent = Math.max(0, dataLines.length).toString();
                    }

                    if (elements.columnsList) {
                        elements.columnsList.innerHTML = '';

                        if (schemaMatchesHeader) {
                            headerColumns.forEach((columnName) => {
                                const column = schema.find((entry) => entry.name === columnName);
                                const item = document.createElement('li');
                                item.className = 'space-y-1';

                                const header = document.createElement('div');
                                header.className = 'flex flex-wrap items-baseline gap-2';

                                const nameEl = document.createElement('span');
                                nameEl.className = 'font-semibold text-slate-200';
                                nameEl.textContent = columnName;
                                header.appendChild(nameEl);

                                if (column?.sqlType) {
                                    const badge = document.createElement('span');
                                    badge.className = 'text-[11px] uppercase tracking-wide text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full';
                                    badge.textContent = column.sqlType;
                                    header.appendChild(badge);
                                }

                                item.appendChild(header);

                                if (column?.description) {
                                    const description = document.createElement('p');
                                    description.className = 'text-xs text-slate-400';
                                    description.textContent = column.description;
                                    item.appendChild(description);
                                }

                                elements.columnsList.appendChild(item);
                            });
                        } else {
                            headerColumns.forEach((columnName) => {
                                const item = document.createElement('li');
                                item.textContent = columnName;
                                elements.columnsList.appendChild(item);
                            });
                        }
                    }

                    if (elements.size) {
                        const encoder = new TextEncoder();
                        const sizeInBytes = encoder.encode(text).length;
                        elements.size.textContent = formatByteSize(sizeInBytes);
                    }

                    renderDataPreview(elements, headerColumns, dataLines);
                })
                .catch(() => {
                    if (elements.recordCount) {
                        elements.recordCount.textContent = '—';
                    }

                    if (elements.columnsList) {
                        elements.columnsList.innerHTML = '';
                        const item = document.createElement('li');
                        item.textContent = 'Unable to load metadata';
                        elements.columnsList.appendChild(item);
                    }

                    if (elements.size) {
                        elements.size.textContent = '—';
                    }

                    renderDataPreviewError(elements, 'Preview unavailable. Download the CSV to explore the full dataset.');
                });
        });
    };

    if (engineerCountSlider || nptReductionSlider || timeSavingsSlider) {
        [engineerCountSlider, nptReductionSlider, timeSavingsSlider]
            .filter(Boolean)
            .forEach(slider => slider.addEventListener('input', calculateROI));
    }

    const loadReferenceData = async () => {
        try {
            const [equipmentRes, personnelRes, serviceRes, catalogRes] = await Promise.allSettled([
                fetch('data-equipment-tools.csv'),
                fetch('data-personnel-rates.csv'),
                fetch('service-line-templates.json'),
                fetch('equipment-catalog.json')
            ]);

            if (equipmentRes.status === 'fulfilled' && equipmentRes.value.ok) {
                const csv = await equipmentRes.value.text();
                mergeEquipmentCsvData(csv);
            }

            if (personnelRes.status === 'fulfilled' && personnelRes.value.ok) {
                const csv = await personnelRes.value.text();
                mergePersonnelCsvData(csv);
            }

            if (serviceRes.status === 'fulfilled' && serviceRes.value.ok) {
                const json = await serviceRes.value.json();
                serviceLineTemplatesIndex = buildServiceLineIndex(json);
            }

            if (catalogRes.status === 'fulfilled' && catalogRes.value.ok) {
                const json = await catalogRes.value.json();
                equipmentCatalogIndex = buildEquipmentCatalogIndex(json);
            }

            appState.referenceDataLoaded = true;

            if (appState.generatedPlan) {
                renderAssetManagementViews(equipmentSearch ? equipmentSearch.value : '', personnelSearch ? personnelSearch.value : '');
                initializeCommercial();
                initializeHSE();
                renderPOBView();
            } else {
                renderAssetManagementViews();
            }
        } catch (error) {
            console.error('Failed to load reference data:', error);
            appState.referenceDataLoaded = true;

            if (logisticsSubtitle) {
                logisticsSubtitle.textContent = 'Using offline reference datasets.';
            }

            if (logisticsReferenceCard) {
                logisticsReferenceCard.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">Service Line Reference</h3>
                    <p class="text-sm text-slate-400">Offline mode active. Using bundled tooling and crew data.</p>
                `;
            }

            renderAssetManagementViews(equipmentSearch ? equipmentSearch.value : '', personnelSearch ? personnelSearch.value : '');

            if (appState.generatedPlan) {
                initializeCommercial();
                initializeHSE();
                renderPOBView();
            }
        }
    };

    const initializeApp = () => {
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.classList.add('flex');
        }
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        switchView('home');
    };

    bindDataExportCopyHandlers();
    hydrateDataExportMetadata();
    loadReferenceData();
    initializeApp();

    // --- EVENT LISTENERS ---

    addListener(themeToggleBtn, 'click', () => {
        const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = e.currentTarget.id.replace('-nav-link', '');
            const linkLabel = (e.currentTarget.textContent || '').trim();
            if (enforcePlanAccess(targetView, linkLabel)) {
                return;
            }
            switchView(targetView);
        });
    });

    addListener(heroPlannerBtn, 'click', () => {
        if (!enforcePlanAccess('planner', 'Hero CTA')) {
            switchView('planner');
        }
    });

    const handleWellCardSelection = (card) => {
        if (!card) return;
        const wellId = card.dataset.wellId;
        if (!wellId) return;

        const selectedWell = wellData.find((w) => w.id === wellId);
        if (!selectedWell) return;

        appState.selectedWell = selectedWell;
        renderDataScrubbingPipeline(selectedWell.id);

        document.querySelectorAll('.planner-card').forEach((element) => {
            element.classList.remove('selected');
            element.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');

        renderProblems();
        if (step1ContinueBtn) step1ContinueBtn.disabled = false;
        if (step2ContinueBtn) step2ContinueBtn.disabled = true;
        if (generateProgramBtn) generateProgramBtn.disabled = true;
        const designBlueprintContainer = getDesignBlueprintContainer();
        if (designBlueprintContainer) {
            designBlueprintContainer.innerHTML = '<p class="text-sm text-slate-400 text-center">Select an objective or AI recommendation to load the engineering blueprint.</p>';
        }
        if (aiRecommendationsContainer) {
            aiRecommendationsContainer.classList.add('hidden');
        }

        appState.selectedObjective = null;
        appState.ai.selectedProblemId = null;
        appState.ai.selectedRecommendation = null;

        announcePlannerStatus(`${selectedWell.name} selected. Review the well dossier and continue to objectives when ready.`);
        updatePlannerStepUI(2);
        announcePlannerStatus(`${selectedWell.name} selected. Step two unlocked.`);
    };

    // Well selection event listener
    let touchSelectionGesture = null;
    let suppressClickFromTouch = false;
    let activeTouchGesture = null;

    const resolvePlannerCardFromEvent = (event) => {
        const targetCard = event.target ? event.target.closest('.planner-card') : null;
        if (targetCard) {
            return targetCard;
        }
        if (touchSelectionGesture && touchSelectionGesture.card) {
            return touchSelectionGesture.card;
        }
        if (activeTouchGesture && activeTouchGesture.card) {
            return activeTouchGesture.card;
        }
        return null;
    };

    addListener(wellSelectionGrid, 'click', (e) => {
        if (suppressClickFromTouch) {
            e.stopPropagation();
            e.preventDefault();
            suppressClickFromTouch = false;
            return;
        }

        if (activeTouchGesture && activeTouchGesture.preventClick) {
            e.stopPropagation();
            e.preventDefault();
            activeTouchGesture = null;
            return;
        }

        const detailsBtn = e.target.closest('.view-details-btn');
        if (detailsBtn) {
            e.stopPropagation();
            openModal(detailsBtn.dataset.wellId);
            return;
        }

        const card = resolvePlannerCardFromEvent(e);
        if (!card) return;
        handleWellCardSelection(card);
    });

    const gesturePointerTypes = new Set(['touch', 'pen']);

    const resetTouchGesture = () => {
        touchSelectionGesture = null;
    };

    const shouldHandlePointer = (event) => gesturePointerTypes.has(event.pointerType || '');

    if (window.PointerEvent) {
        addListener(wellSelectionGrid, 'pointerdown', (e) => {
            if (!shouldHandlePointer(e)) return;
            touchSelectionGesture = {
                id: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                moved: false,
                card: e.target.closest('.planner-card')
            };
        });

        addListener(wellSelectionGrid, 'pointermove', (e) => {
            if (!touchSelectionGesture || touchSelectionGesture.id !== e.pointerId) return;
            const deltaX = Math.abs(e.clientX - touchSelectionGesture.startX);
            const deltaY = Math.abs(e.clientY - touchSelectionGesture.startY);
            if (deltaX > 12 || deltaY > 12) {
                touchSelectionGesture.moved = true;
            }
        }, { passive: true });

        addListener(wellSelectionGrid, 'pointerup', (e) => {
            if (!touchSelectionGesture || touchSelectionGesture.id !== e.pointerId) return;

            const gesture = touchSelectionGesture;
            resetTouchGesture();

            if (gesture.moved) {
                return;
            }

            const detailsBtn = e.target.closest('.view-details-btn');
            if (detailsBtn) {
                e.preventDefault();
                openModal(detailsBtn.dataset.wellId);
                suppressClickFromTouch = true;
                return;
            }

            const card = resolvePlannerCardFromEvent(e);
            if (!card) {
                suppressClickFromTouch = true;
                e.preventDefault();
                return;
            }

            e.preventDefault();
            handleWellCardSelection(card);
            suppressClickFromTouch = true;
        }, { passive: false });

        addListener(wellSelectionGrid, 'pointercancel', (e) => {
            if (touchSelectionGesture && touchSelectionGesture.id === e.pointerId) {
                resetTouchGesture();
            }
        });
    } else {
        addListener(wellSelectionGrid, 'touchstart', (e) => {
            const touch = e.changedTouches && e.changedTouches[0];
            if (!touch) return;
            touchSelectionGesture = {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                moved: false,
                card: e.target.closest('.planner-card')
            };
        }, { passive: true });

        addListener(wellSelectionGrid, 'touchmove', (e) => {
            if (!touchSelectionGesture) return;
            const touch = Array.from(e.changedTouches || []).find((t) => t.identifier === touchSelectionGesture.id);
            if (!touch) return;
            const deltaX = Math.abs(touch.clientX - touchSelectionGesture.startX);
            const deltaY = Math.abs(touch.clientY - touchSelectionGesture.startY);
            if (deltaX > 12 || deltaY > 12) {
                touchSelectionGesture.moved = true;
            }
        }, { passive: true });

        addListener(wellSelectionGrid, 'touchend', (e) => {
            if (!touchSelectionGesture) return;
            const touch = Array.from(e.changedTouches || []).find((t) => t.identifier === touchSelectionGesture.id);
            if (!touch) {
                resetTouchGesture();
                return;
            }

            const gesture = touchSelectionGesture;
            resetTouchGesture();

            if (gesture.moved) {
                return;
            }

            const detailsBtn = e.target.closest('.view-details-btn');
            if (detailsBtn) {
                e.preventDefault();
                openModal(detailsBtn.dataset.wellId);
                suppressClickFromTouch = true;
                return;
            }

            const card = resolvePlannerCardFromEvent(e);
            if (!card) {
                suppressClickFromTouch = true;
                e.preventDefault();
                return;
            }

            e.preventDefault();
            handleWellCardSelection(card);
            suppressClickFromTouch = true;
        }, { passive: false });

        addListener(wellSelectionGrid, 'touchcancel', resetTouchGesture, { passive: true });
    }
    addListener(wellSelectionGrid, 'touchstart', (e) => {
        const touch = e.changedTouches && e.changedTouches[0];
        if (!touch) return;
        activeTouchGesture = {
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            moved: false,
            card: e.target.closest('.planner-card')
        };
    }, { passive: true });

    addListener(wellSelectionGrid, 'touchmove', (e) => {
        if (!activeTouchGesture) return;
        const touch = Array.from(e.changedTouches || []).find((t) => t.identifier === activeTouchGesture.id);
        if (!touch) return;
        const deltaX = Math.abs(touch.clientX - activeTouchGesture.startX);
        const deltaY = Math.abs(touch.clientY - activeTouchGesture.startY);
        if (deltaX > 10 || deltaY > 10) {
            activeTouchGesture.moved = true;
        }
    }, { passive: true });

    addListener(wellSelectionGrid, 'touchend', (e) => {
        if (!activeTouchGesture) return;
        const touch = Array.from(e.changedTouches || []).find((t) => t.identifier === activeTouchGesture.id);
        if (!touch) {
            activeTouchGesture = null;
            return;
        }

        if (activeTouchGesture.moved) {
            activeTouchGesture = null;
            return;
        }

        const detailsBtn = e.target.closest('.view-details-btn');
        if (detailsBtn) {
            e.preventDefault();
            openModal(detailsBtn.dataset.wellId);
            activeTouchGesture = { preventClick: true };
            return;
        }

        const card = resolvePlannerCardFromEvent(e);
        if (!card) {
            activeTouchGesture = { preventClick: true };
            return;
        }

        e.preventDefault();
        handleWellCardSelection(card);
        activeTouchGesture = { preventClick: true };
    }, { passive: false });

    addListener(wellSelectionGrid, 'touchcancel', () => {
        activeTouchGesture = null;
    }, { passive: true });

    addListener(wellSelectionGrid, 'keydown', (e) => {
        if (e.defaultPrevented) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.planner-card');
        if (!card) return;
        e.preventDefault();
        handleWellCardSelection(card);
    });

    // Objective selection event listener
    if (objectivesFieldset) {
        objectivesFieldset.addEventListener('change', () => {
            const selectedInput = objectivesFieldset.querySelector('input[name="objective"]:checked');

            objectivesFieldset.querySelectorAll('.objective-card').forEach(card => card.classList.remove('selected'));

            const selectedCard = selectedInput ? selectedInput.closest('.objective-card') : null;
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }

            const objectiveId = selectedInput ? selectedInput.value : null;
            appState.selectedObjective = objectiveId ? objectivesData.find(o => o.id === objectiveId) : null;
            appState.ai.selectedRecommendation = null;
            appState.ai.selectedProblemId = null;

            if (problemsFieldset) {
                problemsFieldset.querySelectorAll('input[name="problem"]').forEach(input => {
                    input.checked = false;
                });
                problemsFieldset.querySelectorAll('.objective-card').forEach(card => card.classList.remove('selected'));
            }

            if (aiRecommendationsContainer) {
                aiRecommendationsContainer.classList.add('hidden');
                aiRecommendationsContainer.querySelectorAll('.ai-recommendation-enhanced').forEach(card => card.classList.remove('selected'));
            }

            if (step2ContinueBtn) step2ContinueBtn.disabled = !appState.selectedObjective;
            if (generatePlanBtnManual) generatePlanBtnManual.disabled = !appState.selectedObjective;
            if (generatePlanBtnAi) generatePlanBtnAi.disabled = true;

            if (appState.selectedObjective) {
                renderDesignBlueprint();
                announcePlannerStatus(`${appState.selectedObjective.name} objective selected. Continue to the engineering blueprint.`);
            }
        });
    }

    // Problem selection event listener
    if (problemsFieldset) {
        problemsFieldset.addEventListener('change', () => {
            const selectedInput = problemsFieldset.querySelector('input[name="problem"]:checked');

            problemsFieldset.querySelectorAll('.objective-card').forEach(card => card.classList.remove('selected'));
            const selectedCard = selectedInput ? selectedInput.closest('.objective-card') : null;
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }

            if (objectivesFieldset) {
                objectivesFieldset.querySelectorAll('input[name="objective"]').forEach(input => {
                    input.checked = false;
                });
                objectivesFieldset.querySelectorAll('.objective-card').forEach(card => card.classList.remove('selected'));
            }

            const problemId = selectedInput ? selectedInput.value : null;
            appState.ai.selectedProblemId = problemId;
            appState.ai.selectedRecommendation = null;
            appState.selectedObjective = null;

            const problem = problemId ? problemsData.find(item => item.id === problemId) : null;
            if (problem) {
                announcePlannerStatus(`${problem.name} selected. Review AI recommendations below.`);
            }

            const recommendations = problemId ? (aiRecommendations[problemId] || []) : [];

            if (aiRecommendationsContainer) {
                if (recommendations.length) {
                    aiRecommendationsContainer.innerHTML = `
                        <h3 class="text-lg font-semibold text-center mb-4 mt-6">AI Recommendations</h3>
                        <div class="space-y-4">
                            ${recommendations.map((rec, index) => {
                                const objective = objectivesData.find(o => o.id === rec.objectiveId) || {};
                                const objectiveIcon = 'icon' in objective ? objective.icon : '';
                                const objectiveName = 'name' in objective ? objective.name : 'Objective';

                                // Confidence level determination
                                const confidence = rec.confidence || 0;
                                let confidenceColor, confidenceBg, confidenceLabel, confidenceIcon, uncertaintyLevel;
                                if (confidence >= 95) {
                                    confidenceColor = 'emerald';
                                    confidenceBg = 'bg-emerald-600';
                                    confidenceLabel = 'Very High Confidence';
                                    confidenceIcon = '✓';
                                    uncertaintyLevel = 'Minimal subsurface uncertainty';
                                } else if (confidence >= 90) {
                                    confidenceColor = 'green';
                                    confidenceBg = 'bg-green-600';
                                    confidenceLabel = 'High Confidence';
                                    confidenceIcon = '✓';
                                    uncertaintyLevel = 'Low subsurface uncertainty';
                                } else if (confidence >= 85) {
                                    confidenceColor = 'blue';
                                    confidenceBg = 'bg-blue-600';
                                    confidenceLabel = 'Good Confidence';
                                    confidenceIcon = '○';
                                    uncertaintyLevel = 'Moderate uncertainty - additional validation recommended';
                                } else if (confidence >= 80) {
                                    confidenceColor = 'yellow';
                                    confidenceBg = 'bg-yellow-600';
                                    confidenceLabel = 'Moderate Confidence';
                                    confidenceIcon = '△';
                                    uncertaintyLevel = 'Notable uncertainty - expert review advised';
                                } else {
                                    confidenceColor = 'orange';
                                    confidenceBg = 'bg-orange-600';
                                    confidenceLabel = 'Lower Confidence';
                                    confidenceIcon = '!';
                                    uncertaintyLevel = 'Significant uncertainty - thorough validation required';
                                }

                                return `
                                    <div class="ai-recommendation-enhanced relative" data-rec-index="${index}">
                                        <div class="flex items-start justify-between gap-3 mb-3">
                                            <div class="flex items-center gap-2">
                                                <span class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded ${confidenceBg}"
                                                      aria-label="Confidence: ${confidence}% - ${confidenceLabel}"
                                                      title="${confidenceLabel}: ${uncertaintyLevel}">
                                                    <span class="text-sm">${confidenceIcon}</span>
                                                    ${confidence}%
                                                </span>
                                                <span class="text-xs text-slate-400 italic">${confidenceLabel}</span>
                                            </div>
                                        </div>

                                        <div class="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                                            <div class="${confidenceBg} h-1.5 rounded-full confidence-bar" data-width="${confidence}"></div>
                                        </div>

                                        <div class="flex justify-between items-start mb-2">
                                            <h4 class="font-bold text-lg text-teal-700 dark:text-teal-400">${objectiveIcon} ${objectiveName}</h4>
                                        </div>

                                        <div class="mb-3 p-2 bg-slate-800/50 rounded border-l-2 border-${confidenceColor}-500">
                                            <p class="text-xs text-slate-300">
                                                <strong>Uncertainty Assessment:</strong> ${uncertaintyLevel}
                                            </p>
                                        </div>

                                        <p class="text-sm mb-1"><strong>Projected Outcome:</strong> ${rec.outcome}</p>
                                        <p class="text-xs"><strong>Reasoning:</strong> ${rec.reason}</p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                    aiRecommendationsContainer.classList.remove('hidden');

                    // Apply confidence bar widths (CSP compliant)
                    aiRecommendationsContainer.querySelectorAll('.confidence-bar').forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        if (width !== null) {
                            bar.style.setProperty('--bar-width', `${width}%`);
                        }
                    });
                } else {
                    aiRecommendationsContainer.innerHTML = '<p class="text-sm text-center text-slate-400">No AI recommendations available for this problem yet.</p>';
                    aiRecommendationsContainer.classList.remove('hidden');
                }
            }

            if (step2ContinueBtn) step2ContinueBtn.disabled = true;
            if (generatePlanBtnManual) generatePlanBtnManual.disabled = true;
            if (generatePlanBtnAi) generatePlanBtnAi.disabled = true;

            if (aiRecommendationsContainer) {
                aiRecommendationsContainer.querySelectorAll('.ai-recommendation-enhanced').forEach(card => {
                    card.addEventListener('click', (event) => {
                        const recommendationCard = event.currentTarget;
                        const recIndex = Number.parseInt(recommendationCard.dataset.recIndex, 10);
                        const selectedRecommendation = aiRecommendations[problemId]?.[recIndex];
                        if (!selectedRecommendation) {
                            announcePlannerStatus('Unable to load the selected AI recommendation. Please choose a different option.');
                            return;
                        }

                        appState.ai.selectedRecommendation = selectedRecommendation;
                        appState.selectedObjective = objectivesData.find(o => o.id === selectedRecommendation.objectiveId) || null;

                        aiRecommendationsContainer.querySelectorAll('.ai-recommendation-enhanced').forEach(element => element.classList.remove('selected'));
                        recommendationCard.classList.add('selected');

                        if (step2ContinueBtn) step2ContinueBtn.disabled = false;
                        if (generatePlanBtnAi) generatePlanBtnAi.disabled = false;
                        if (generatePlanBtnManual) generatePlanBtnManual.disabled = true;

                        renderDesignBlueprint();
                        announcePlannerStatus(`AI recommendation ${recIndex + 1} selected. Continue to the engineering blueprint.`);
                        announcePlannerStatus(`AI recommendation ${recIndex + 1} selected. Generate plan when ready.`);
                    });
                });
            }
        });
    }

    // AI toggle event listener
    if (aiToggle) {
        aiToggle.addEventListener('change', (event) => {
            const useAiAdvisor = event.target.checked;

            if (manualPlanningView) manualPlanningView.classList.toggle('hidden', useAiAdvisor);
            if (aiAdvisorView) aiAdvisorView.classList.toggle('hidden', !useAiAdvisor);

            announcePlannerStatus(useAiAdvisor ? 'AI Advisor enabled. Select a problem to view recommendations.' : 'Manual planning enabled. Select an objective to continue.');

            if (useAiAdvisor && appState.selectedWell && appState.selectedWell.id !== 'W666') {
                if (aiAdvisorView) {
                    aiAdvisorView.innerHTML = `
                        <div class="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg text-center">
                            <p class="text-yellow-800 dark:text-yellow-200">The AI Advisor is configured for the 'Well From Hell' (W666) scenario. Please select W666 to see AI recommendations.</p>
                        </div>
                    `;
                }
            } else {
                renderProblems();
                if (!useAiAdvisor && aiRecommendationsContainer) {
                    aiRecommendationsContainer.classList.add('hidden');
                }
            }

            if (step2ContinueBtn) {
                const hasSelection = useAiAdvisor ? !!appState.ai.selectedRecommendation : !!appState.selectedObjective;
                step2ContinueBtn.disabled = !hasSelection;
            }

            if (generatePlanBtnManual) {
                generatePlanBtnManual.disabled = useAiAdvisor ? true : !appState.selectedObjective;
            }

            if (generatePlanBtnAi) {
                generatePlanBtnAi.disabled = useAiAdvisor ? !appState.ai.selectedRecommendation : true;
            }

            renderDesignBlueprint();
        });
    }

    // Step progression controls
    if (step1ContinueBtn) {
        step1ContinueBtn.addEventListener('click', () => {
            if (!appState.selectedWell) return;
            updatePlannerStepUI(2);
            announcePlannerStatus('Objective selection unlocked. Choose a manual objective or enable the AI Advisor.');
        });
    }

    if (step2ContinueBtn) {
        step2ContinueBtn.addEventListener('click', () => {
            if (!appState.selectedObjective) return;
            updatePlannerStepUI(3);
            renderDesignBlueprint();
            if (generateProgramBtn) generateProgramBtn.disabled = !appState.selectedObjective;
            announcePlannerStatus('Blueprint loaded. Validate the engineering design, then generate the integrated program.');
        });
    }

    if (generateProgramBtn) {
        generateProgramBtn.addEventListener('click', () => {
            if (!appState.selectedWell) return;
            let objectiveId = appState.selectedObjective?.id;
            if (aiToggle && aiToggle.checked && appState.ai.selectedRecommendation) {
                objectiveId = appState.ai.selectedRecommendation.objectiveId;
            }
            if (!objectiveId) return;

            appState.selectedObjective = objectivesData.find(o => o.id === objectiveId);
            appState.generatedPlan = proceduresData[objectiveId];
            appState.planBroadcastKey = null;
            renderPlan();
            updatePlannerStepUI(4);
            announcePlannerStatus('Integrated program generated. Review procedure, risks, and cost in step four.');
        });
    }

    if (step4ContinueBtn) {
        step4ContinueBtn.addEventListener('click', () => {
            if (!appState.generatedPlan) return;
            renderReadinessSummary();
            updatePlannerStepUI(5);
            announcePlannerStatus('Readiness package compiled. Resolve outstanding logistics or jump to execution prep.');
        });
    }

    if (openLogisticsBtn) {
        openLogisticsBtn.addEventListener('click', () => {
            if (enforcePlanAccess('logistics', 'Logistics orchestration')) {
                return;
            }
            switchView('logistics');
        });
    }

    if (openCommercialBtn) {
        openCommercialBtn.addEventListener('click', () => {
            if (enforcePlanAccess('commercial', 'Commercial readiness')) {
                return;
            }
            switchView('commercial');
        });
    }

    if (openHseBtn) {
        openHseBtn.addEventListener('click', () => {
            if (enforcePlanAccess('hse', 'HSE & Risk readiness')) {
                return;
            }
            switchView('hse');
        });
    }

    if (step5ContinueBtn) {
        step5ContinueBtn.addEventListener('click', () => {
            if (!appState.generatedPlan) return;
            updatePlannerStepUI(6);
            appState.handoverReady = true;
            if (beginOpBtn) beginOpBtn.disabled = false;
            renderHandoverPackage();
            announcePlannerStatus('Execution stage ready. Launch Live Operations or open the analysis workspace.');
        });
    }

    if (reviewAnalysisBtnFinal) {
        reviewAnalysisBtnFinal.addEventListener('click', () => {
            if (enforcePlanAccess('analyzer', 'Analysis workspace')) {
                return;
            }
            switchView('analyzer');
            if (typeof window.initializeAnalyzer === 'function') {
                window.initializeAnalyzer();
            } else {
                initializeAnalyzer();
                initializeVendorScorecard();
            }
        });
    }

    // Generate plan buttons event listeners
    addListener(generatePlanBtnManual, 'click', () => {
        if (!appState.selectedWell || !appState.selectedObjective) return;
        appState.generatedPlan = proceduresData[appState.selectedObjective.id];
        appState.planBroadcastKey = null;
        renderPlan();
        updatePlannerStepUI(3);
        announcePlannerStatus('Manual plan generated. Review the plan in step three.');
    });

    addListener(generatePlanBtnAi, 'click', () => {
        if (!appState.selectedWell || !appState.ai.selectedRecommendation) return;
        appState.selectedObjective = objectivesData.find(o => o.id === appState.ai.selectedRecommendation.objectiveId);
        appState.generatedPlan = proceduresData[appState.selectedObjective.id];
        appState.planBroadcastKey = null;
        renderPlan();
        updatePlannerStepUI(3);
        announcePlannerStatus('AI-assisted plan generated. Review the plan in step three.');
    });

    // Control buttons event listeners
    addListener(startOverBtn, 'click', () => {
        resetApp(false);
        announcePlannerStatus('Planner reset. Start by selecting a well.');
    });
    addListener(beginOpBtn, 'click', () => {
        if (enforcePlanAccess('performer', 'Live Operations')) {
            return;
        }
        if (!appState.generatedPlan) return;
        switchView('performer');
    });

    addListener(addLogBtn, 'click', () => {
        addLogEntry('Operator', logInput.value);
        logInput.value = '';
    });

    addListener(procedureStepsContainer, 'click', (e) => {
        const stepDiv = e.target.closest('.procedure-step');
        if (!stepDiv || !appState.liveData.jobRunning) return;

        const targetStepId = parseInt(stepDiv.dataset.stepId);
        const currentStepId = appState.liveData.currentStep;

        if (targetStepId > currentStepId) {
            jumpToStep(targetStepId);
        }
    });

    addListener(viewAnalysisBtn, 'click', () => {
        if (enforcePlanAccess('analyzer', 'Analysis workspace')) {
            return;
        }
        switchView('analyzer');
        if (window.initializeAnalyzer) {
            window.initializeAnalyzer();
        } else {
            initializeAnalyzer();
            initializeVendorScorecard();
        }
    });

    addListener(addLessonBtn, 'click', () => {
        if(lessonInput.value.trim()){
            appState.lessonsLearned.push(lessonInput.value.trim());
            lessonInput.value = '';
            renderLessons();
        }
    });

    addListener(planNewJobBtn, 'click', () => resetApp(true));

    addListener(equipmentSearch, 'input', (e) =>
        renderAssetManagementViews(e.target.value, personnelSearch?.value || '')
    );

    addListener(personnelSearch, 'input', (e) =>
        renderAssetManagementViews(equipmentSearch?.value || '', e.target.value)
    );

    addListener(closeModalBtn, 'click', closeModal);
    addListener(modal, 'click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
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

    const initializeHeroVideoToggle = () => {
        const heroVideo = document.getElementById('hero-video');
        const toggleButton = document.getElementById('hero-video-toggle');

        if (!heroVideo || !toggleButton) return;

        const setPlayingState = (isPlaying) => {
            toggleButton.setAttribute('aria-pressed', String(isPlaying));
            toggleButton.textContent = isPlaying ? 'Pause hero video' : 'Play hero video';
        };

        toggleButton.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play().catch(() => {});
                setPlayingState(true);
            } else {
                heroVideo.pause();
                setPlayingState(false);
            }
        });

        setPlayingState(!heroVideo.paused);
    };

    const initializeWellFilters = () => {
        if (!wellSelectionGrid) return;

        if (!appState.wellFilters || !(appState.wellFilters.themes instanceof Set)) {
            appState.wellFilters = { query: '', focus: 'all', themes: new Set() };
        }

        if (wellSearchInput) {
            wellSearchInput.addEventListener('input', (event) => {
                appState.wellFilters.query = event.target.value;
                renderWellCards();
            });
        }

        if (wellFocusGroup) {
            wellFocusGroup.querySelectorAll('[data-focus-filter]').forEach((button) => {
                button.addEventListener('click', () => {
                    const focusId = button.dataset.focusFilter || 'all';
                    if (appState.wellFilters.focus === focusId) return;
                    appState.wellFilters.focus = focusId;
                    renderWellCards();
                });
            });
        }

        if (wellThemeGroup) {
            wellThemeGroup.querySelectorAll('[data-theme-filter]').forEach((button) => {
                button.addEventListener('click', () => {
                    const themeId = button.dataset.themeFilter;
                    if (!themeId) return;
                    const themes = appState.wellFilters.themes;
                    if (themes.has(themeId)) {
                        themes.delete(themeId);
                    } else {
                        themes.add(themeId);
                    }
                    renderWellCards();
                });
            });
        }
    };

    /**
     * Initialize Data Quality Dashboard
     * Applies width styles to progress bars (CSP compliant)
     */
    function initializeDataQuality() {
        // Apply widths to all data quality progress bars
        document.querySelectorAll('#data-quality-view .data-quality-bar').forEach(bar => {
            const width = bar.getAttribute('data-width');
            if (width !== null) {
                bar.style.setProperty('--bar-width', `${width}%`);
            }
        });

        // Apply portfolio health bar width
        const portfolioHealthBar = document.getElementById('portfolio-health-bar');
        if (portfolioHealthBar) {
            const width = portfolioHealthBar.getAttribute('data-width');
            if (width !== null) {
                portfolioHealthBar.style.setProperty('--bar-width', `${width}%`);
            }
        }
    }

    const init = () => {
        initializeHeroVideoToggle();
        initializeWellFilters();
        renderWellCards();
        renderObjectives();
        renderProblems();
        initSavingsChart();
        initializeDataQuality();
        updateNavLinks();
    };

    const pdfExportButton = document.getElementById('pdf-export-button');
    if (pdfExportButton) {
        pdfExportButton.addEventListener('click', generatePDFReport);
    }

    init();

    window.welltegraPlanner = {
        getState: () => ({
            selectedWell: appState.selectedWell,
            selectedObjective: appState.selectedObjective,
            generatedPlan: appState.generatedPlan,
            referenceDataLoaded: appState.referenceDataLoaded,
            handoverReady: appState.handoverReady
        })
    };
});

// --- PDF EXPORT SYSTEM ---

async function generatePDFReport(event) {
    const evt = event || window.event;
    const button = evt?.currentTarget || evt?.target || document.getElementById('pdf-export-button');
    const statusRegion = document.getElementById('pdf-export-status');
    if (!button) {
        console.warn('PDF export button reference not found.');
        return;
    }

    const originalText = button.innerHTML;

    // Show loading state
    button.innerHTML = '<span class="pdf-spinner"></span> Generating PDF...';
    button.classList.add('pdf-generating');
    button.setAttribute('aria-busy', 'true');
    if (statusRegion) {
        statusRegion.textContent = 'Generating PDF report. Please wait.';
    }

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
        if (statusRegion) {
            statusRegion.textContent = 'PDF generated successfully. Download should begin shortly.';
        }
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('pdf-generating');
            button.removeAttribute('aria-busy');
        }, 3000);

    } catch (error) {
        console.error('PDF generation error:', error);
        if (statusRegion) {
            statusRegion.textContent = 'Error generating PDF. Please try again.';
        }
        button.innerHTML = originalText;
        button.classList.remove('pdf-generating');
        button.removeAttribute('aria-busy');
    }
}

