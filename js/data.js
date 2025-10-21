/**
 * @file This file acts as a mock database for the entire application.
 * (Corrected Golden Master Version: Contains all 7 wells and final audited data)
 */

// =================================================================================
// MEDIA ASSETS
// =================================================================================
export const assets = {
    logoRevealVideo: 'assets/media/icon.mp4',
    heroBackgroundVideo: 'assets/media/heromain.mp4',
    logoPath: 'assets/favicon-96x96.png',
    schematics: {
        'WT-666': 'assets/media/schematic_w666.png',
        'WT-77': 'assets/media/schematic_ks77.png',
        'WT-21': 'assets/media/schematic_m21.png',
        'WT-15': 'assets/media/schematic_s15.png',
        'WT-11': 'assets/media/schematic_f11.png',
        'WT-12': 'assets/media/schematic_bp12.png',
        'WT-04': 'assets/media/schematic_sh04.png',
    },
    logs: {
        'casing_deformation': 'assets/media/log_casing_deformation.png',
        'stuck_fish': 'assets/media/log_stuck_fish.png',
        'pressure_blockage': 'assets/media/log_pressure_blockage.png',
        'rig_up_issue': 'assets/media/log_rig_up_issue.png',
        'slickline_drift': 'assets/media/log_slickline_drift.png',
        'lead_impression': 'assets/media/log_lead_impression.png',
    }
};

// =================================================================================
// HOME PAGE CONTENT
// Content for the main landing page, structured for clarity and impact.
// =================================================================================
export const homeData = {
    hero: {
        title: "Engineering Insight, Amplified by Data.",
        subtitle: "Reduce NPT, reclaim engineering time, and align partners with a single source of truth that connects your entire well operation."
    },
    taxes: {
        title: "Are You Paying the Hidden Taxes of Inefficiency?",
        subtitle: "Your operations are being taxed by disconnected workflows you can't see on a balance sheet. These inefficiencies cost the average asset over $38 million a year.",
        items: [
            {
                title: "The Data Wrangling Tax",
                content: "Your most valuable assets—your engineers—are forced to act as data clerks, wasting over 50% of their time hunting for information in emails, correcting spreadsheet errors, and re-entering data from PDFs."
            },
            {
                title: "The NPT Tax",
                content: "Every moment of Non-Productive Time is a direct hit to your bottom line. Plans based on poor, fragmented data lead to equipment failures, procedural errors, and costly, preventable downtime."
            },
            {
                title: "The Collaboration Tax", 
                content: "The critical gap between your team and service partners is where value is lost. Static PDF handoffs and siloed communication create slow, error-prone workflows that prevent real-time, effective collaboration."
            },
            {
                title: "The Energy & Emissions Tax",
                content: "Inefficient operations don't just waste money—they waste energy. Extended run times, unnecessary flaring, and suboptimal logistics contribute to higher operational costs and a larger carbon footprint."
            }
        ]
    },
    roi: {
        title: "The Platform That Pays for Itself",
        subtitle: "Unlock Your Reservoir's True Potential. Use our interactive calculator to estimate the potential annual value Well-Tegra can unlock for your asset."
    }
};

// =================================================================================
// CASE STUDY & WELL DATA
// Data refined for increased realism and narrative strength.
// =================================================================================
export const wellData = [
    {
        id: 'WT-666',
        name: 'Coinneach Odha',
        field: 'Coinneach Odha Field, North Sea',
        type: 'HPHT Gas Condensate',
        depth: '18,500ft',
        status: 'Shut-in - Well Integrity Issues',
        operator: 'WellTegra Energy',
        issue: 'A high-value asset, shut-in due to multiple, compounding failures: severe casing deformation, a hard scale blockage, and a failed primary safety valve. Requires a complex, multi-stage intervention plan.',
        history: [
            { date: '2025-03-05', operation: 'Initial Investigation (Slickline Drift Run)', problem: 'Following a gradual production decline, a standard slickline drift run was performed to check for tubing restrictions. The toolstring was unable to pass 8,500ft.', lesson: 'Initial assumption was a simple wax or scale blockage. The team decided to escalate to a more robust coiled tubing cleanout.', imageUrl: assets.logs.slickline_drift },
            { date: '2025-03-15', operation: 'Escalation (Coiled Tubing & Lead Impression Block)', problem: 'A coiled tubing cleanout attempt also failed to pass 8,500ft. A lead impression block was run, which provided definitive proof of severe casing deformation.', lesson: 'This confirmed the issue was not a simple blockage but a critical well integrity failure. The source of the original production decline remained unknown.', imageUrl: assets.logs.lead_impression },
            { date: '2025-04-01', operation: 'Further Diagnostics (Production Test)', problem: 'With the well shut-in due to the integrity issue, a brief production test was conducted to analyze performance. The well died quickly, and pressure analysis indicated a second, deeper blockage.', lesson: 'The data confirmed a solid blockage at ~14,200ft. Water chemistry analysis pointed to BaSO4 scale as the likely culprit.' },
            { date: '2025-04-10', operation: 'Final Failure (DHSV Test)', problem: 'During the shutdown, a mandatory 6-month safety valve test was performed. The TRSSV failed to close on command.', lesson: 'The accumulation of a casing failure, a deep scale blockage, and now a primary safety barrier failure has rendered the well completely inoperable. This is now a complex, multi-stage recovery project.' }
        ],
        dailyReports: [
            { date: '2025-03-05', summary: 'Rigged up slickline unit. Performed drift run to investigate production decline. Tagged hard stop at 8,495ft. Unable to pass. Jarred for 2 hours with no progress. POOH. Decision made to escalate to Coiled Tubing.', npt: '2 hours (Stuck Tool)', toolstringRun: ['Rope Socket', 'Hydraulic Jars', 'Stem (80ft)', '2.313" OD Drift'] },
            { date: '2025-03-15', summary: 'Rigged up Coiled Tubing unit. RIH with cleanout BHA. Tagged hard stop at 8,495ft. No progress with jetting. POOH. RIH with Lead Impression Block. Confirmed severe casing ovalization. POOH and rigged down.', npt: '4 hours (Ineffective Operation)', toolstringRun: ['CT Connector', 'Dual Check Valves', 'Motorhead', 'Lead Impression Block'] },
            { date: '2025-04-10', summary: 'Well shut-in. Performed mandatory 6-month TRSSV function test. Applied control line pressure to close valve. Valve failed to close. Bled pressure and repeated test 3 times with same result. TRSSV declared inoperable.', npt: '0 hours', toolstringRun: ['N/A (Surface Test)'] }
        ],
        completion: {
            casing: [{type: 'Production', size: '9 5/8"', top: 0, bottom: 18500, isProblem: true}],
            tubing: [{type: 'Production', size: '4 1/2"', top: 0, bottom: 18300}],
            equipment: [
                {item: 'TRSSV (Failed)', top: 2500, comments: 'Failed to close on test', isProblem: true},
                {item: 'Casing Deformation', top: 8500, comments: 'Severe Ovalization', isProblem: true},
                {item: 'BaSO4 Scale Bridge', top: 14200, comments: 'Solid blockage confirmed by pressure data', isProblem: true},
                {item: 'Packer', top: 18250}
            ],
            perforations: [{top: 18350, bottom: 18450}]
        }
    },
    {
        id: 'WT-77',
        name: 'CASE STUDY: Tigh Solais',
        field: 'Coinneach Odha Field, North Sea', type: 'HPHT Gas Condensate', depth: '15,000ft', status: 'Active - Restored Production',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Successfully recovered a stuck milling BHA and cleared a hard scale blockage using a multi-stage chemical, fishing, and jetting operation.',
        cost: 2100000, duration: 11,
        history: [
            { date: '2024-09-20', operation: 'Milling Attempt', problem: 'Attempted to mill a hard BaSO4 scale bridge at 14,500ft. Milling assembly became stuck after minimal progress.', lesson: 'Aggressive milling of this type of hard, insoluble scale carries a very high risk of getting stuck. A chemical approach should have been the primary strategy.', imageUrl: assets.logs.stuck_fish },
            { date: '2024-10-15', operation: 'Fishing & Cleanout', problem: 'Successfully freed and retrieved the stuck milling BHA after a 72hr chemical soak. Subsequently removed the remaining scale using a rotating jetting tool.', lesson: 'This complex recovery operation proves two things: 1) Fishing is possible but costly and time-consuming. 2) The chemical/jetting approach is the correct, low-risk method for the primary intervention.' }
        ],
        completion: { equipment: [] }
    },
    {
        id: 'WT-12',
        name: 'CASE STUDY: An Dubh-loch',
        field: 'Coinneach Odha Field, North Sea', type: 'Oil Producer', depth: '12,000ft', status: 'Active - Restored Production',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Utilized AI-powered seismic reprocessing and geological data analysis to identify a bypassed reservoir pocket, successfully targeted with a sidetrack.',
        cost: 3500000, duration: 25,
        history: [
            { date: '2024-05-10', operation: 'Initial Production Review', problem: 'Well production declined much faster than reservoir models predicted. Existing seismic data was ambiguous.', lesson: 'Standard interpretation of the 3D seismic data failed to identify the complex faulting that was isolating a significant part of the reservoir.' },
            { date: '2024-06-20', operation: 'AI-Enhanced Sidetrack', problem: 'An AI model reprocessed the raw seismic data, identifying a high-probability bypassed oil pocket. A sidetrack was drilled based on this new target.', lesson: 'AI-driven subsurface analysis can de-risk drilling decisions and unlock value that is invisible to traditional interpretation methods, boosting recovery factors.' }
        ],
        completion: { equipment: [{ item: 'New Sidetrack @ 11,500ft' }] }
    },
    {
        id: 'WT-04',
        name: 'CASE STUDY: Coire Ghlas',
        field: 'Coinneach Odha Field, North Sea', type: 'Gas Producer', depth: '9,500ft', status: 'Active - Low Emissions',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Implemented an AI-predicted corrosion inhibitor squeeze job, drastically reducing intervention frequency and the well\'s operational carbon footprint.',
        cost: 750000, duration: 5,
        history: [
            { date: '2024-07-01', operation: 'Corrosion Review', problem: 'High H2S content was causing tubing corrosion rates of >5mm/year, requiring costly Coiled Tubing inhibitor treatments every quarter.', lesson: 'Reactive, calendar-based interventions are inefficient, costly, and carry a significant carbon footprint from vessel and pumping operations. A predictive strategy is needed.' },
            { date: '2024-07-25', operation: 'AI-Optimized Squeeze Job', problem: 'An AI model analyzed production data to determine the optimal time and volume of inhibitor to squeeze into the formation for maximum longevity.', lesson: 'The AI-planned squeeze job successfully protected the wellbore for over 12 months, reducing intervention frequency by 75% and cutting the well\'s associated operational CO2 emissions by an estimated 60%.' }
        ],
        completion: { equipment: [{ item: 'Downhole Chemical Injection Valve' }] }
    },
    {
        id: 'WT-21',
        name: 'CASE STUDY: Beinn Dearg',
        field: 'Coinneach Odha Field, North Sea', type: 'HPHT Gas Condensate', depth: '9,000ft', status: 'Active - Restored Production',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Successfully remediated casing deformation with an expandable patch, restoring full-bore access.',
        cost: 1300000, duration: 8,
        history: [
            { date: '2024-11-10', operation: 'Slickline Surveillance', problem: 'Standard 2.313" OD toolstring encountered a hard stop at 8,500ft.', lesson: 'Significant reservoir depletion is causing casing deformation... MFC log confirms this.', imageUrl: assets.logs.casing_deformation },
            { date: '2024-12-05', operation: 'Expandable Casing Patch', problem: 'Successfully installed a 60ft expandable steel patch...', lesson: 'This operation proves that an expandable patch is a viable solution...' }
        ],
        completion: { equipment: [{item: 'Tubing Patch', top: 8500, comments: 'Restored ID'}] }
    },
    {
        id: 'WT-15',
        name: 'CASE STUDY: Sgurr Ban',
        field: 'Coinneach Odha Field, North Sea', type: 'HPHT Gas Condensate', depth: '11,000ft', status: 'Active - Restored Production',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Successfully removed severe BaSO4 scale with a chemical/jetting treatment, restoring production.',
        field: 'Field of Dreams, UKCS', type: 'HPHT Gas Condensate', depth: '11,000ft', status: 'Active - Restored Production',
        issue: 'SOLUTION: Successfully removed severe BaSO4 scale with a chemical/jetting treatment, restoring production.',
        cost: 1050000, duration: 7,
        history: [
            { date: '2025-01-05', operation: 'Production Logging', problem: 'PLT toolstring was unable to pass 9,200ft due to a hard obstruction. Pressure plot confirmed a solid blockage.', lesson: 'Commingling of injected seawater and formation water is causing severe, insoluble scale deposition...', imageUrl: assets.logs.pressure_blockage},
            { date: '2025-02-12', operation: 'CT Chemical/Jetting', problem: 'A 48hr soak with a DTPA dissolver followed by a high-pressure rotating jetting tool successfully cleared the blockage.', lesson: 'This two-stage approach is a proven, lower-risk method...' }
        ],
        completion: { equipment: [] }
    },
    {
        id: 'WT-11',
        name: 'CASE STUDY: Meall Mor',
        field: 'Coinneach Odha Field, North Sea', type: 'HPHT Gas Condensate', depth: '9,800ft', status: 'Active - Restored Production',
        operator: 'WellTegra Energy',
        issue: 'SOLUTION: Successfully locked open the failed TRSSV and replaced it with a slickline-retrievable insert valve.',
        cost: 410000, duration: 4,
        history: [
            { date: '2025-03-19', operation: 'Initial Rig-Up', problem: 'Encountered obstruction during rig-up. The flange of a service valve on the Xmas Tree fouled the PCE stack, preventing a direct connection.', lesson: 'A non-standard, modified offset adaptor spool was required to proceed. This highlights the need for accurate wellhead drawings and pre-job checks.', imageUrl: assets.logs.rig_up_issue },
            { date: '2025-02-18', operation: 'Routine DHSV Test', problem: 'Valve failed to close reliably during the routine 6-month test. Well was mandatorily shut-in by regulatory authority.', lesson: 'An attempted hydraulic repair on a similar well failed; a mechanical lock-open tool is a more reliable method for these valve types.' },
            { date: '2025-03-20', operation: 'Slickline Insert Valve Job', problem: 'Successfully locked open the failed valve with a mechanical tool and installed a new wireline-retrievable insert valve.', lesson: 'This standard slickline operation is a proven, cost-effective method for restoring the primary safety barrier without a rig.' }
        ],
        completion: { equipment: [{item: 'SSSV', top: 1500, comments: 'New Insert Valve'}] }
    },
];

// =================================================================================
// OBJECTIVES & PROBLEMS DATA
// =================================================================================
export const objectivesData = [
    { id: 'obj1', name: 'Remediate Casing Deformation', description: 'Install an expandable steel patch to restore wellbore access.', icon: '🔧' },
    { id: 'obj2', name: 'Remove BaSO4 Scale', description: 'Use a chemical and mechanical method to clear tubing blockage.', icon: '🧪' },
    { id: 'obj3', name: 'Restore Downhole Safety Valve', description: 'Lock open the failed TRSSV and install a new insert valve.', icon: '🔒' },
];

export const problemsData = [
    { id: 'prob1', name: 'Loss of Well Access (Casing Deformation)', description: 'Wellbore is restricted at ~8,500ft due to geomechanical forces.', icon: '🚫' },
    { id: 'prob2', name: 'Severe Scale Blockage', description: 'Production is blocked by hard, insoluble scale at ~14,200ft.', icon: '🚰' },
    { id: 'prob3', name: 'Failed Primary Safety Barrier (TRSSV)', description: 'Well is shut-in due to a failed safety valve at ~2,500ft.', icon: '⚠️' },
];

// =================================================================================
// AI RECOMMENDATIONS
// =================================================================================
export const aiRecommendations = {
    prob1: [
        { objectiveId: 'obj1', confidence: 95, outcome: 'Full-bore access restored', reason: 'High confidence based on direct operational precedent. **Case Study WT-21 (Beinn Dearg)** in this same field successfully used this exact method to remediate an identical issue, proving the technique and equipment are field-appropriate.' }
    ],
    prob2: [
        { objectiveId: 'obj2', confidence: 98, outcome: 'Blockage cleared, production restored', reason: 'Very high confidence based on multiple data points. **Case Study WT-15 (Sgurr Ban)** confirms chemical/jetting is the optimal low-risk strategy. Crucially, **Case Study WT-77 (Tigh Solais)** provides a critical warning: a previous attempt to aggressively mill this exact type of scale in this field resulted in a stuck BHA, requiring a complex and costly fishing operation. The AI strongly advises against milling.' }
    ],
    prob3: [
        { objectiveId: 'obj3', confidence: 99, outcome: 'Well returned to safe, compliant production', reason: 'Very high confidence. This is a standard, low-risk slickline operation. **Case Study WT-11 (Meall Mor)** provides a critical lesson: use a mechanical lock-open tool, as hydraulic options have a known 30% failure rate in this valve type.' }
    ]
};

// =================================================================================
// PROCEDURAL & OPERATIONAL DATA
// =================================================================================
export const proceduresData = {
    obj1: {
        name: "Expandable Casing Patch Installation",
        personnel: ["Wellsite Engineer", "HWU Supervisor", "Patch Specialist"],
        steps: [
            "Perform wellbore cleanout trip with scraper and gauge ring.", "RIH with expandable patch on jointed pipe.", "Position patch across deformed interval using GR/CCL correlation.", "Set patch using hydraulic setting tool.", "Pressure test patch to verify seal.", "POOH and return well to service."
        ],
        risks: { operational: 4, geological: 2, equipment: 4, hse: 3, financial: 3 },
        cost: 1250000, duration: 8,
        tfaModel: { pickUp: [[0,0], [9000, 60]], slackOff: [[0,0], [9000, -60]], alarmUpper: [[0,10], [9000, 70]], alarmLower: [[0,-10], [9000, -70]] }
    },
    obj2: {
        name: "CT Chemical & Mechanical Scale Removal",
        personnel: ["Coiled Tubing Supervisor", "Pump Operator", "Fluid Specialist"],
        steps: [
            "RIH with CT and spot DTPA chemical dissolver across scale.", "POOH with CT and let chemical soak for 36 hours.", "RIH with CT and rotating jetting BHA.", "Mechanically break up and circulate out softened scale.", "Circulate well clean and POOH.", "Return well to production."
        ],
        risks: { operational: 5, geological: 2, equipment: 4, hse: 4, financial: 3 },
        cost: 980000, duration: 6,
        tfaModel: { pickUp: [[0,0], [14500, 35]], slackOff: [[0,0], [14500, -35]], alarmUpper: [[0,2], [14500, 37]], alarmLower: [[0,-2], [14500, -37]] }
    },
    obj3: {
        name: "Slickline Insert Safety Valve Installation",
        personnel: ["Slickline Supervisor", "Valve Technician"],
        steps: [
            "RIH with heavy-duty toolstring and mechanically lock open the failed TRSSV.", "POOH and confirm lock-open.", "RIH with new Wireline-Retrievable Safety Valve (WRSV) on a running tool.", "Set and lock the new WRSV in the old valve's nipple profile.", "Pressure up control line to hold new valve open, then retrieve running tool.", "Perform full inflow and function test of new valve to certify.", "Return well to production."
        ],
        risks: { operational: 3, geological: 1, equipment: 4, hse: 3, financial: 2 },
        cost: 375000, duration: 3,
        tfaModel: { pickUp: [[0, 100], [9800, 160]], slackOff: [[0, 100], [9800, 40]], alarmUpper: [[0, 110], [9800, 170]], alarmLower: [[0, 90], [9800, 30]] }
    }
};

export const equipmentRequirements = {
    obj1: [ { name: "Hydraulic Workover Unit (HWU)", source: "Vendor", rate: 85000 }, { name: "Expandable Steel Patch & Setting Tool", source: "Vendor", rate: 50000 } ],
    obj2: [ { name: "Coiled Tubing Unit", source: "Vendor", rate: 75000 }, { name: "Rotating Jetting Nozzle", source: "Vendor", rate: 5000 }, { name: "DTPA Chemical (lump sum)", source: "Vendor", rate: 80000 } ],
    obj3: [ { name: "Slickline Unit", source: "Vendor", rate: 35000 }, { name: "Insert Safety Valve (WRSV)", source: "Vendor", rate: 15000 }, { name: "Lock-Open Tool", source: "Vendor", rate: 2000 } ],
};

export const equipmentData = [
    { id: 'CTU-01', type: 'Coiled Tubing Unit', location: 'Onboard - Deck A', status: 'On Job', rate: 75000 },
    { id: 'CTU-02', type: 'Coiled Tubing Unit', location: 'Onshore Base', status: 'Maintenance', rate: 75000 },
    { id: 'SLU-01', type: 'Slickline Unit', location: 'In Transit', status: 'In Transit', rate: 35000 },
    { id: 'SLU-02', type: 'Slickline Unit', location: 'Onshore Base', status: 'Available', rate: 35000 },
    { id: 'HWU-01', type: 'Hydraulic Workover Unit', location: 'Onshore Base', status: 'Available', rate: 85000 },
];

export const personnelData = [
    { id: 'P001', name: 'Bob Raker', role: 'Wellsite Engineer', company: 'Operator', status: 'Onboard', certsValid: true, muster: 'A', rate: 2200 },
    { id: 'P002', name: 'Jane Smith', role: 'Coiled Tubing Supervisor', company: 'Service Co.', status: 'Onboard', certsValid: true, muster: 'A', rate: 2500 },
    { id: 'P003', name: 'Mike Johnson', role: 'HWU Supervisor', company: 'Service Co.', status: 'Available', certsValid: true, muster: 'B', rate: 2600 },
    { id: 'P004', name: 'Emily White', role: 'Slickline Supervisor', company: 'Service Co.', status: 'Available', certsValid: false, muster: 'B', rate: 2300 },
    { id: 'P005', name: 'Chris Green', role: 'Pump Operator', company: 'Service Co.', status: 'In Transit', certsValid: true, muster: 'A', rate: 1800 },
    { id: 'P006', name: 'Alex Brown', role: 'Patch Specialist', company: 'Vendor', status: 'Available', certsValid: true, muster: 'B', rate: 3500 },
    { id: 'P007', name: 'David Chen', role: 'Fluid Specialist', company: 'Vendor', status: 'Available', certsValid: true, muster: 'A', rate: 3200 },
    { id: 'P008', name: 'Sara Khan', role: 'Valve Technician', company: 'Vendor', status: 'Available', certsValid: true, muster: 'B', rate: 2800 }
];

export const hseData = {
    permits: [
        { id: 'PTW001', name: 'General Permit to Work', status: 'Approved' },
        { id: 'PTW002', name: 'Hot Work Permit', status: 'Not Required' },
        { id: 'PTW003', name: 'Confined Space Entry', status: 'Not Required' },
        { id: 'PTW004', name: 'Work Over Water Permit', status: 'Approved' },
    ],
    riskRegister: [
        { hazard: 'Dropped Objects during Rig Up', consequence: 'Personnel Injury', mitigation: 'Establish exclusion zones; secure all items aloft.', risk: 'Medium' },
        { hazard: 'Loss of Containment', consequence: 'Environmental Spill', mitigation: 'Verify PCE integrity; function test all valves.', risk: 'High' },
        { hazard: 'Stuck Pipe/Tool', consequence: 'Significant NPT, potential for well control incident.', mitigation: 'Follow TFA model; do not exceed string limits.', risk: 'High' }
    ]
};

export const pobData = {
    musterStations: [
        { id: 'A', name: 'Muster Station A', capacity: 50, current: 0 },
        { id: 'B', name: 'Muster Station B', capacity: 50, current: 0 }
    ]
};

export const environmentalData = {
    windSpeed: 15, // knots
    waveHeight: 2.5, // meters
    status: 'Normal Operations',
};

// =================================================================================
// TOOLBOX TALK GENERATOR CONTENT
// =================================================================================
export const toolboxTalkData = {
    header: "This document is a computer-generated summary for pre-job safety discussions. All personnel must review the official procedure, risk assessments, and confirm understanding with the Person In Charge (PIC) before work commences.",
    commonHazards: [
        "Slips, Trips, and Falls: Maintain good housekeeping.",
        "Pinch Points: Keep hands clear of moving equipment.",
        "Dropped Objects: Secure all tools when working at height.",
        "Pressure Hazards: Verify all pressure is bled off before breaking containment.",
        "Hazardous Chemicals: Wear appropriate PPE as per the COSHH assessment.",
    ],
    getTalkForObjective: (objectiveId) => {
        const specificContent = {
            obj1: {
                title: "Toolbox Talk: Expandable Casing Patch",
                specificHazards: [
                    "Hydraulic Pressure: High pressure used for patch expansion. Maintain exclusion zones.",
                    "Heavy Lifts: Patch assembly is heavy. Use correct lifting procedures.",
                    "Stuck Pipe: Risk of patch assembly getting stuck. Follow TFA model closely."
                ]
            },
            obj2: {
                title: "Toolbox Talk: CT Scale Removal",
                specificHazards: [
                    "Chemical Handling: DTPA is a hazardous chemical. Full PPE is required.",
                    "High Pressure Jetting: Risk of hose or connection failure. Inspect all equipment before use.",
                    "Well Control: Potential for gas influx when circulating. Monitor returns at all times."
                ]
            },
            obj3: {
                title: "Toolbox Talk: Slickline Insert Valve",
                specificHazards: [
                    "Well Pressure: This is a live well intervention. Constant monitoring of PCE is critical.",
                    "Wire Breakage: Risk of slickline breaking under tension. Never stand in the line of fire.",
                    "Tool Misruns: Ensure correct toolstring components are used to avoid getting stuck."
                ]
            }
        };
        return specificContent[objectiveId] || { title: "Generic Toolbox Talk", specificHazards: ["No specific hazards identified."] };
    }
};

// =================================================================================
// STATIC CONTENT DATA
// =================================================================================
export const faqData = [
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

// =================================================================================
// NEW: MANAGEMENT OF CHANGE (MOC) DATA
// =================================================================================
export const mocData = {
    // Events the user can inject into the simulation
    events: [
        { id: 'weather', name: 'Extreme Weather', description: 'Environmental conditions have exceeded operational limits. All over-side work must be suspended.' },
        { id: 'tool_failure', name: 'Critical Tool Failure', description: 'The primary downhole tool has failed and is no longer functioning. It must be retrieved.' },
        { id: 'well_control', name: 'Well Condition Change', description: 'Unexpected pressure increase detected in the annulus, suggesting a potential well control situation.' }
    ],
    // AI's suggested changes for each event
    getAISuggestion: (eventId) => {
        const suggestions = {
            weather: { change: 'Suspend operations and wait on weather.', contingency: 'weatherStandby' },
            tool_failure: { change: 'Immediately cease operation, and POOH (Pull Out Of Hole) to retrieve the failed toolstring.', contingency: 'toolFailurePOOH' },
            well_control: { change: 'Cease all operations, shut-in the well, and monitor pressures to verify well integrity.', contingency: 'wellControlMonitor' }
        };
        return suggestions[eventId];
    },
    // The new procedure steps that will be inserted into the plan
    contingencyProcedures: {
        weatherStandby: [
            { id: 'C1', text: 'Suspend all over-side operations.' },
            { id: 'C2', text: 'Secure toolstring at a safe depth.' },
            { id: 'C3', text: 'Wait on Weather (W.O.W) until conditions are within safe limits.' },
            { id: 'C4', text: 'Resume operations.' }
        ],
        toolFailurePOOH: [
            { id: 'C1', text: 'Stop all pumping and secure well.' },
            { id: 'C2', text: 'Begin to Pull Out Of Hole (POOH) with failed toolstring.' },
            { id: 'C3', text: 'Monitor weights and pressures closely for any anomalies.' },
            { id: 'C4', text: 'Once at surface, lay down failed tool.' }
        ],
        wellControlMonitor: [
            { id: 'C1', text: 'Immediately close the master valve to shut-in the well.' },
            { id: 'C2', text: 'Bleed off trapped pressure in PCE.' },
            { id: 'C3', text: 'Establish continuous monitoring of Tubing and Annulus pressures.' },
            { id: 'C4', text: 'Diagnose source of pressure anomaly before proceeding.' }
        ]
    },
    // The personnel required to digitally sign the MOC
    approvers: ["Wellsite Engineer", "Onshore Operations Manager"]
};

// =================================================================================
// NEW: PRE-JOB SAFETY & BRIEFING PACK DATA
// =================================================================================
export const safetyPackData = {
    getPackForObjective: (objectiveId) => {
        const packContent = {
            obj1: {
                requiredPermits: ["General Permit to Work", "Work Over Water Permit", "Heavy Lift Permit"],
                roleSpecificBriefings: {
                    "Wellsite Engineer": "You are the Person In Charge (PIC). Your primary responsibility is to ensure all steps are followed, the TFA model is not exceeded, and all permits are valid. You have final say on stopping the job if conditions change.",
                    "HWU Supervisor": "Your focus is the safe operation of the Hydraulic Workover Unit. Ensure all pre-use checks are complete and that all lifts are supervised. You are responsible for the crew operating the unit.",
                    "Patch Specialist": "You are the subject matter expert for the expandable patch. You will advise on the final positioning based on GR/CCL data and supervise the hydraulic setting process. Confirm all pressure tests meet criteria."
                }
            },
            obj2: {
                requiredPermits: ["General Permit to Work", "Work Over Water Permit", "COSHH Permit (DTPA Chemical)"],
                roleSpecificBriefings: {
                    "Coiled Tubing Supervisor": "You are the PIC for all CT operations. Your focus is on managing coil fatigue, monitoring weights, and ensuring the jetting parameters are correct. You will directly supervise the pump operator.",
                    "Pump Operator": "You are responsible for the safe operation of the pumping equipment and handling of all chemicals. You must wear full PPE during mixing and pumping of DTPA. Confirm all line pressures before starting.",
                    "Fluid Specialist": "You are the expert for the chemical soak. You will confirm all fluid recipes and pump schedules. You are responsible for monitoring fluid returns and advising on the effectiveness of the soak."
                }
            },
            obj3: {
                requiredPermits: ["General Permit to Work", "Work Over Water Permit", "Pressure Testing Permit"],
                roleSpecificBriefings: {
                    "Slickline Supervisor": "You are the PIC. Your primary responsibility is the integrity of the Pressure Control Equipment (PCE). Perform a thorough function test and leak test before RIH. You will supervise the Valve Technician.",
                    "Valve Technician": "You are the subject matter expert for the insert valve. You will confirm the correct toolstring configuration for both the lock-open run and the setting run. You will advise on the final setting and testing criteria for the new valve."
                }
            }
        };
        return packContent[objectiveId] || { requiredPermits: ["General Permit to Work"], roleSpecificBriefings: {} };
    }
};

export const aboutData = {
    title: "From the Wellsite to the Web",
    quote: "I built Well-Tegra because I've lived the problems it's designed to solve.",
    author: "Kenneth McKenzie",
    sections: [
        {
            title: "My Perspective",
            content: "I'm not a software developer who decided to get into oil and gas. I'm a well services guy who learned to code. My career started at the sharp end with leading service companies and took me around the world, working with major service leaders and operators throughout the North Sea, Gulf of Mexico, and Asia-Pacific regions. I've been on both sides of the fence—I know the service company's challenges and the operator's objectives. That's the insight WellTegra is built on."
        },
        {
            title: "Why I Built This",
            content: "I've seen first-hand how much time, money, and energy we waste because our data is a mess. It's locked in different systems, buried in old reports, and stuck in spreadsheets. We repeat the same mistakes because the lessons learned from one job are never available for the next. The \"Well From Hell\" in this demo isn't an exaggeration; it's a sanitized version of the real-world train wrecks I've witnessed—and helped clean up.\n\nWell-Tegra is my answer to that chaos. It's a platform designed from an operator's perspective, focused on a single source of truth that connects planning, execution, and analysis."
        },
        {
            title: "The Path Forward",
            content: "This demo is the blueprint. It was built with a lot of determination, but to bring it to life, it needs the power of real, collective data. The next step is to partner with operators and service companies to build out the anonymized data pool that will drive the predictive AI. The platform is ready to scale, and I'm actively seeking the right partners to help build the future of well operations."
        }
    ]
};
