
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NotificationType, ToolComponent, WellData, WellboreData } from '../types';
import { componentDB } from './data/componentDB';

// Data from provided CSV files (kept as string constants)
const wellPortfolioCSV = `Well_ID,Well_Name,Field,Region,Type,Total_Depth_ft,Water_Depth_ft,Operator,Status,Last_Intervention_Date,Next_Scheduled,Production_Status,Daily_Oil_bopd,Daily_Gas_mcfd,Reservoir_Pressure_psi,Wellhead_Pressure_psi,Cumulative_NPT_hrs,Safety_Critical_Issues,Integrity_Rating,Last_Inspection_Date,Estimated_Remaining_Life_years,Well_Cost_MM_USD,Intervention_Count,Last_Intervention_Type,Risk_Level
666,The Perfect Storm,Brahan Field,SEER,HPHT Gas Condensate,18500,450,WellTegra Demo,Active,2024-10-15,2025-02-01,Producing,2400,8500,9200,3200,156,2,B+,2024-09-20,8.5,42.5,7,Multi-barrier Intervention,High
W101,North Star Alpha,Brent,SEER,Oil Producer,14200,380,Equinor,Active,2024-08-10,2025-01-15,Producing,1800,3200,7800,2850,42,0,A,2024-10-01,12.5,28.3,3,Scale Treatment,Medium
W102,Viking Thunder,Forties,SEER,Gas Condensate,16800,425,Shell,Active,2024-09-22,2025-03-10,Producing,950,12500,8900,3100,18,0,A+,2024-11-01,15.2,35.7,2,Safety Valve Replacement,Low
W103,Emerald Deep,Brahan Field,SEER,HPHT Oil,17500,460,BP,Suspended,2024-06-30,2024-12-15,Shut In,0,0,9500,4200,224,3,C,2024-06-15,6.2,48.2,9,Casing Repair,Critical
W201,Atlantic Dawn,Rosebank,UKCS West,Oil Producer,12500,1100,Equinor,Active,2024-07-18,2025-04-01,Producing,3200,2800,6500,2200,32,0,A,2024-09-15,18.5,52.8,2,Artificial Lift Install,Low
W202,Celtic Horizon,Clair,UKCS West,Heavy Oil,13800,1350,BP,Active,2024-10-05,2025-06-20,Producing,2800,1500,5800,1950,68,1,B,2024-10-05,14.8,64.5,4,Tubing Replacement,Medium
W203,Majestic Tide,Foinaven,UKCS West,Subsea Tieback,15200,1480,Shell,Active,2024-09-01,2025-05-15,Producing,1650,4200,7200,2650,52,1,B+,2024-09-01,11.3,78.9,3,Subsea Control System,Medium
W301,Desert Falcon,Ghawar,Middle East,Giant Oil Field,8500,0,Saudi Aramco,Active,2024-10-20,2025-12-01,Producing,8500,2200,4800,1800,8,0,A+,2024-10-20,25.5,18.5,1,Workover,Low
W302,Sand Dunes,Burgan,Middle East,Mature Oil,9200,0,Kuwait Oil Co,Active,2024-08-25,2025-09-10,Producing,5200,1800,4200,1650,45,0,A,2024-08-25,22.8,16.2,2,Sand Control,Low
W401,Lone Star,Permian Basin,USA,Unconventional,12800,0,ConocoPhillips,Active,2024-11-01,2026-01-05,Producing,850,6500,5200,2100,12,0,A,2024-11-01,8.5,12.8,1,Hydraulic Fracturing,Low
W402,Eagle Ford,Eagle Ford Shale,USA,Unconventional,13500,0,EOG Resources,Active,2024-09-15,2025-11-20,Producing,920,7200,5800,2350,22,0,A,2024-09-15,9.2,14.5,2,Re-fracturing,Low
W501,Maple Leaf,Hibernia,Canada Offshore,Cold Environment,16500,260,ExxonMobil,Active,2024-07-12,2025-08-01,Producing,2100,3800,7500,2750,88,1,B+,2024-07-12,16.5,45.2,3,Wellhead Maintenance,Medium
W502,Northern Light,Terra Nova,Canada Offshore,Harsh Environment,15800,315,Suncor,Active,2024-08-30,2025-07-15,Producing,1850,3200,7100,2600,102,2,B,2024-08-30,14.2,42.8,4,Subsea Equipment,Medium
W601,Southern Cross,Santos Basin,Brazil,Pre-Salt,18200,6800,Petrobras,Active,2024-06-15,2025-09-30,Producing,4200,5500,11200,4500,142,1,B,2024-06-15,12.8,125.5,5,Deepwater Intervention,High
W602,Tropical Storm,Campos Basin,Brazil,Deepwater,17500,5200,Shell,Active,2024-09-28,2025-10-25,Producing,3800,4800,10500,4200,78,0,A-,2024-09-28,13.5,98.7,3,Well Integrity Check,Medium
W701,Aurora Borealis,Snøhvit,Norway,Arctic Gas,14800,330,Equinor,Active,2024-10-10,2025-12-20,Producing,450,18500,8500,3400,38,0,A,2024-10-10,18.5,56.2,2,Gas Lift Optimization,Low
W702,Midnight Sun,Johan Sverdrup,Norway,Giant Oil Field,15500,110,Equinor,Active,2024-11-03,2026-03-15,Producing,12500,8200,6800,2200,14,0,A+,2024-11-03,28.5,38.5,1,Inspection,Low
W801,Wallaby,Gorgon,Australia,LNG Feed,16200,1350,Chevron,Active,2024-07-28,2025-11-10,Producing,680,22000,9800,3800,62,0,A,2024-07-28,16.8,88.5,2,Subsea Tie-in,Medium
W802,Kangaroo Jump,Browse Basin,Australia,Gas Condensate,17800,2450,Woodside,Active,2024-08-19,2025-08-30,Producing,1250,16500,10200,4100,95,1,B+,2024-08-19,15.2,112.3,4,Flowline Repair,Medium
W901,Dragon Fire,South China Sea,Asia Pacific,High Pressure,14500,380,CNOOC,Active,2024-09-10,2025-10-05,Producing,2200,6800,8200,3150,72,1,B,2024-09-10,11.5,42.8,3,High Pressure Workover,Medium`;

const liveInterventionCSV = `Timestamp,Time_Minutes,Depth_ft,WHP_psi,Hookload_kips,Flow_Rate_bpm,Temperature_F,RPM,Torque_ftlbs,Status,Alerts
2024-11-01 08:00:00,0,0,3200,125,0,72,0,0,Rigging Up,None
2024-11-01 08:15:00,15,2500,3450,215,12,78,65,2800,Running In,None
2024-11-01 08:30:00,30,5000,3680,245,15,82,70,3200,Circulating,None
2024-11-01 08:45:00,45,7500,4100,285,18,88,75,3600,Running In,None
2024-11-01 09:00:00,60,10000,4500,325,20,95,80,4200,Circulating,None
2024-11-01 09:15:00,75,12500,7800,395,22,102,85,4800,Running In,High WHP Warning
2024-11-01 09:30:00,90,14500,5200,365,20,108,78,4400,Circulating,Resolved
2024-11-01 09:45:00,105,16000,5600,385,25,115,82,4600,Running In,None
2024-11-01 10:00:00,120,17500,6100,425,28,122,88,5200,At Depth,None
2024-11-01 10:15:00,135,18000,6450,465,30,128,92,5800,Working Tools,High Hookload Warning
2024-11-01 10:30:00,150,18200,6800,445,32,132,95,6200,Setting Tools,None
2024-11-01 10:45:00,165,18500,7200,425,30,135,90,5800,Testing,None
2024-11-01 11:00:00,180,18500,7500,405,28,138,88,5400,Pulling Out,None
2024-11-01 11:15:00,195,16000,7100,385,25,132,85,5000,Pulling Out,None
2024-11-01 11:30:00,210,13500,6600,345,22,125,80,4600,Pulling Out,None
2024-11-01 11:45:00,225,11000,6100,305,20,118,75,4200,Pulling Out,None
2024-11-01 12:00:00,240,8500,5500,265,18,110,70,3800,Pulling Out,None
2024-11-01 12:15:00,255,6000,4900,225,15,102,65,3400,Pulling Out,None
2024-11-01 12:30:00,270,3500,4200,185,12,95,60,3000,Pulling Out,None
2024-11-01 12:45:00,285,1000,3600,145,10,88,55,2600,Laid Down Tools,None
2024-11-01 13:00:00,300,0,3200,95,0,82,0,0,Rigging Down,Complete`;

const equipmentAndToolsCSV = `Equipment_ID,Category,Item_Name,Vendor,Daily_Rate_USD,Mobilization_USD,Demobilization_USD,Standby_Rate_USD,Min_Rental_Days,Specifications,Typical_Use
EQ-001,Wireline Unit,Slickline Unit,Schlumberger,8500,25000,15000,4250,3,"Max depth 20000ft, 0.092in line",Gauge runs, plug setting, fishing
EQ-002,Wireline Unit,E-line Unit,Halliburton,12000,35000,20000,6000,3,"Max depth 25000ft, 7-conductor",Perforating, logging, setting tools
EQ-003,Coiled Tubing,CT Unit 1.5in,Baker Hughes,18000,45000,25000,9000,5,"1.5in OD, 15000ft capacity",Scale removal, chemical treatment
EQ-004,Coiled Tubing,CT Unit 2.0in,Archer,22000,50000,28000,11000,5,"2.0in OD, 18000ft capacity",Heavy duty cleanout, milling
EQ-005,Pumping,Cement Unit,Weatherford,15000,30000,18000,7500,2,"2x 2000hp pumps, mixing",Squeeze jobs, plug & abandon
EQ-006,Pumping,Frac Spread (Small),Liberty,25000,60000,35000,12500,7,"5x 2500hp, 50bpm total",Acid stimulation, small fracs
EQ-007,Well Control,Snubbing Unit,Cudd,20000,40000,22000,10000,3,"500k lbs capacity, HPHT rated",Live well interventions
EQ-008,Testing,Well Test Separator,Expro,8000,20000,12000,4000,3,"3-phase, 10000psi rating",Production testing, cleanup
EQ-009,Lifting,Hydraulic Workover Unit,Key Energy,16000,35000,20000,8000,5,"350k lbs, self-contained",Rigless interventions
EQ-010,Completion,Completion Riser,Subsea 7,12000,50000,30000,6000,7,"18000ft WD rated, XT",Subsea completions
EQ-011,Barriers,IWOCS System,Aker Solutions,10000,40000,25000,5000,5,"Dual barrier, remote operated",Through-tubing operations
EQ-012,Tools,BOP Stack (Surface),Cameron,5000,15000,10000,2500,3,"15000psi, 5-1/8 bore",Well control operations
TOOL-001,Mechanical,Expandable Patch 7in,Enventure,0,45000,0,0,0,"60ft length, 9-5/8 casing",Casing repair
TOOL-002,Mechanical,Expandable Patch 9in,Enventure,0,55000,0,0,0,"80ft length, 13-3/8 casing",Large bore casing repair
TOOL-003,Chemical,DTPA Scale Dissolver,Champion X,0,8500,0,0,0,"15% solution, 500gal batch",BaSO4 scale removal
TOOL-004,Chemical,HCl Acid 15%,Nalco,0,3200,0,0,0,"15% HCl, 1000gal batch",CaCO3 scale removal
TOOL-005,Chemical,Wax Solvent,Baker Hughes,0,6800,0,0,0,"Heated aromatic, 300gal",Paraffin removal
TOOL-006,Safety Valve,TRSSV Insert Valve,Halliburton,0,28000,0,0,0,"2-7/8 tubing, flapper type",Subsurface safety
TOOL-007,Safety Valve,SSSV Insert Valve,Baker Hughes,0,32000,0,0,0,"3-1/2 tubing, ball type",Surface controlled safety
TOOL-008,Fishing,Overshot & Jars,Schlumberger,1200,5000,2000,600,2,"6in OD, 150k lbs pull",Stuck pipe fishing
TOOL-009,Fishing,Spear & Intensifier,Halliburton,1500,6000,2500,750,2,"Internal catch, 200k lbs",Tubing fishing
TOOL-010,Milling,Junk Mill 6in,Baker Hughes,800,3500,1500,400,1,"6in OD, carbide inserts",Metal debris removal
TOOL-011,Milling,Section Mill 7in,Weatherford,1200,4500,2000,600,1,"7in OD, aggressive",Casing milling
TOOL-012,Cutting,Mechanical Cutter 4.5in,Archer,600,2500,1000,300,1,"4-1/2 tubing, hydraulic",Tubing cutting
TOOL-013,Sand Control,Expandable Screen 4in,Halliburton,0,38000,0,0,0,"4in base, 200 mesh",Through-tubing sand control
TOOL-014,Sand Control,Wire-Wrapped Screen 5.5in,Baker Hughes,0,42000,0,0,0,"5-1/2 OD, premium connection",Gravel pack screen
TOOL-015,Perforation,TCP Guns 3-3/8in,Schlumberger,0,15000,0,0,0,"60 SPF, 0° phasing, DP",Through-tubing perforating
TOOL-016,Perforation,Big Hole Guns 4.5in,Halliburton,0,22000,0,0,0,"20 SPF, 0° phasing, HC",Casing perforating
TOOL-017,Packer,Production Packer 7in,Baker Hughes,0,18000,0,0,0,"Permanent, 10k psi diff",Zonal isolation
TOOL-018,Packer,Retrievable Packer 5.5in,Weatherford,0,12000,0,0,0,"Mechanical set, retrievable",Temporary isolation
TOOL-019,Plugs,Bridge Plug 7in,Halliburton,0,8500,0,0,0,"Composite, drillable",Temporary barrier
TOOL-020,Plugs,Cement Retainer 4.5in,Baker Hughes,0,6500,0,0,0,"Mechanical, 5000psi",Squeeze operations
CONSUMABLE-001,Fluids,Completion Brine,Tetra,0,12000,0,0,0,"CaCl2, 11.6 ppg, 500bbl",Completion fluid
CONSUMABLE-002,Fluids,Kill Fluid,Baker Hughes,0,18000,0,0,0,"CaCl2/CaBr2, 14.2 ppg, 750bbl",Well control
CONSUMABLE-003,Fluids,Spacer Fluid,Halliburton,0,8500,0,0,0,"Surfactant, 9.5 ppg, 200bbl",Cement operations
CONSUMABLE-004,Cement,Class G Cement,Schlumberger,0,15000,0,0,0,"15.8 ppg, 200 sacks",Plugging, squeeze
CONSUMABLE-005,Cement,Lightweight Cement,Halliburton,0,18000,0,0,0,"12.5 ppg, microspheres, 150 sacks",Low pressure zones`;


interface AIAssistantTabProps {
    showNotification: (message: string, type: NotificationType) => void;
    toolString: ToolComponent[];
    wellData: WellData;
    setWellData: React.Dispatch<React.SetStateAction<WellData>>;
    wellboreData: WellboreData;
    setWellboreData: React.Dispatch<React.SetStateAction<WellboreData>>;
}

interface ChatMessage {
    author: 'user' | 'model';
    text: string;
    image?: string; // Add optional image field for history
    timestamp: Date;
}

const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ showNotification, toolString, wellData, setWellData, wellboreData, setWellboreData }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isPhysicsOpen, setIsPhysicsOpen] = useState(true);
    const [isLiveDataOpen, setIsLiveDataOpen] = useState(true);

    // Physics State
    const [wireOD, setWireOD] = useState(0.108); // inches
    const [targetDepth, setTargetDepth] = useState(wellboreData.tubingDepth);

    // Well Fetch State
    const [wellID, setWellID] = useState('W101');
    const [fetchedWellData, setFetchedWellData] = useState<any>(null);

    // Image Upload State
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Live Data State
    const [liveData, setLiveData] = useState<any[]>([]);
    const [liveDataHeaders, setLiveDataHeaders] = useState<string[]>([]);
    const [selectedMetric, setSelectedMetric] = useState('Depth_ft');
    const [hoveredData, setHoveredData] = useState<{ time: number, value: number, xPerc: number, yPerc: number } | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // Update target depth when wellbore data changes
    useEffect(() => {
        setTargetDepth(wellboreData.tubingDepth);
    }, [wellboreData.tubingDepth]);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [chatHistory]);

    // Parse Live CSV on mount
    useEffect(() => {
        const lines = liveInterventionCSV.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const parsedData = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry: any = {};
            headers.forEach((h, i) => {
                const val = values[i]?.trim();
                const num = parseFloat(val);
                entry[h] = isNaN(num) ? val : num;
            });
            return entry;
        });
        
        setLiveData(parsedData);
        // Filter headers to only show numeric fields suitable for graphing, excluding Time_Minutes itself and non-numeric
        const numericHeaders = headers.filter(h => 
            h !== 'Time_Minutes' && 
            h !== 'Timestamp' && 
            h !== 'Status' && 
            h !== 'Alerts'
        );
        setLiveDataHeaders(numericHeaders);
        if (numericHeaders.length > 0) setSelectedMetric(numericHeaders[0]);
    }, []);

    const physicsResults = useMemo(() => {
        const fluidDensity = wellboreData.fluidDensity;
        const steelDensityPPG = 65.5; // approx density of steel
        const bf = (steelDensityPPG - fluidDensity) / steelDensityPPG;
        
        let totalAirWeight = 0;
        let maxToolOD = 0;
        toolString.forEach(t => {
            totalAirWeight += t.weight;
            if (t.maxOD > maxToolOD) maxToolOD = t.maxOD;
        });

        const buoyedStringWeight = totalAirWeight * bf;

        // Wire weight calc: approx 2.67 * OD^2 lbs/ft for steel wire
        const wireWeightPerFt = 2.67 * Math.pow(wireOD, 2);
        const totalWireWeightAir = wireWeightPerFt * targetDepth;
        const totalWireWeightBuoyed = totalWireWeightAir * bf;
        
        // Calculate wire cross-sectional area for pressure calculations
        // Area = pi * r^2 = pi * (OD/2)^2
        const wireArea = Math.PI * Math.pow(wireOD / 2, 2);
        
        // Force due to WHP pushing wire out
        const pressureAreaForce = wellData.whp * wireArea;

        const surfaceTension = buoyedStringWeight + totalWireWeightBuoyed - pressureAreaForce;
        
        // Hydrostatic Pressure = 0.052 * Density * Depth
        const hydrostaticPressure = 0.052 * fluidDensity * targetDepth;

        // Temp estimate (linear gradient)
        // Gradient = (BHT - Surface) / TD
        const tempGradient = (wellboreData.bottomHoleTemp - wellboreData.surfaceTemp) / wellboreData.tubingDepth;
        const tempAtDepth = wellboreData.surfaceTemp + (tempGradient * targetDepth);

        // Clearance
        const restrictionID = Math.min(wellData.tubingID || 99, wellData.nippleID || 99);
        const minClearance = restrictionID - maxToolOD;

        return {
            bf,
            totalAirWeight,
            buoyedStringWeight,
            wireWeightPerFt,
            totalWireWeightAir,
            surfaceTension,
            hydrostaticPressure,
            maxToolOD,
            tempAtDepth,
            pressureAreaForce,
            minClearance
        };
    }, [toolString, wellboreData, wireOD, targetDepth, wellData]);

    const handleFetchWellData = () => {
        if (!wellID.trim()) return;
        
        const lines = wellPortfolioCSV.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const wellIdIndex = headers.indexOf('Well_ID');
        
        if (wellIdIndex === -1) return;

        // Simple parse assuming no commas in values for this specific dataset based on inspection
        const foundLine = lines.slice(1).find(line => {
            const cols = line.split(','); 
            return cols[wellIdIndex].trim() === wellID.trim();
        });

        if (foundLine) {
            const cols = foundLine.split(',').map(c => c.trim());
            const data: any = {};
            headers.forEach((h, i) => {
                data[h] = cols[i];
            });

            setFetchedWellData(data);
            showNotification(`Loaded data for ${data.Well_Name}`, 'success');

            // Optional: Update physics inputs
            if (data.Wellhead_Pressure_psi) {
                setWellData(prev => ({...prev, whp: parseFloat(data.Wellhead_Pressure_psi)}));
            }
            if (data.Total_Depth_ft) {
                const td = parseFloat(data.Total_Depth_ft);
                setWellboreData(prev => ({...prev, tubingDepth: td}));
                setTargetDepth(td);
            }

        } else {
            showNotification('Well ID not found in portfolio.', 'error');
            setFetchedWellData(null);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Extract pure base64 and mime
            const matches = base64String.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                setImageMimeType(matches[1]);
                setAttachedImage(matches[2]);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const callAI = async (prompt: string, displayMessage?: string) => {
        if (isLoading) return;
        const userMsgText = displayMessage || prompt || (attachedImage ? "Analyze attached image" : "");
        if (!userMsgText && !attachedImage) return;

        const newHistory: ChatMessage[] = [...chatHistory, { 
            author: 'user', 
            text: userMsgText,
            image: attachedImage ? `data:${imageMimeType};base64,${attachedImage}` : undefined,
            timestamp: new Date()
        }];
        
        setChatHistory(newHistory);
        if(!displayMessage) setUserInput('');
        setIsLoading(true);

        // Keep local ref to image to clear state immediately while request is processing if desired, 
        // but here we clear state after processing starts to prevent double send.
        const currentImage = attachedImage;
        const currentMime = imageMimeType;
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        try {
            const ai = new GoogleGenerativeAI(process.env.API_KEY as string);
            
            // Format component DB for the AI
            const componentList = Object.values(componentDB).map(c => 
                `- ID: ${c.id}, Name: ${c.name}, OD: ${c.maxOD}", Weight: ${c.weight}lbs, Top: ${c.topConnection}, Bot: ${c.bottomConnection}`
            ).join('\n');

            // Format current string
            const currentStringList = toolString.length > 0 
                ? toolString.map((c, i) => `${i+1}. ${c.name} (OD: ${c.maxOD}", Wt: ${c.weight}lbs)`).join('\n')
                : "Empty String";

            const contextPrompt = `You are an expert well intervention analyst. Your task is to answer questions based *only* on the data provided below. If the answer cannot be found in the data, state that clearly.

            **Available Component Database (Internal):**
            You may suggest replacing components using ONLY items from this list:
            ${componentList}

            **Current Tool String Assembly:**
            ${currentStringList}

            **Wellbore Constraints & Geometry:**
            - Tubing ID: ${wellData.tubingID}"
            - Min Nipple ID: ${wellData.nippleID}"
            - WHP: ${wellData.whp} psi
            - Casing: ${wellboreData.casingOD}" OD / ${wellboreData.casingID}" ID
            - Tubing Depth: ${wellboreData.tubingDepth} ft
            - Wire OD: ${wireOD}"
            - Calculation Target Depth: ${targetDepth} ft
            - Selected Well: ${wellID} ${fetchedWellData ? `(${fetchedWellData.Well_Name})` : ''}

            **Fluid & Environment Properties:**
            - Fluid Type: ${wellboreData.fluidType}
            - Fluid Density: ${wellboreData.fluidDensity} ppg
            - Viscosity: ${wellboreData.viscosity} cP
            - Surface Temp: ${wellboreData.surfaceTemp} F
            - Bottom Hole Temp: ${wellboreData.bottomHoleTemp} F

            **Dataset 1: Well Portfolio Data**
            \`\`\`csv
            ${wellPortfolioCSV}
            \`\`\`

            **Dataset 2: Live Intervention Data for a specific operation**
            \`\`\`csv
            ${liveInterventionCSV}
            \`\`\`

            **Dataset 3: Equipment & Tools Catalog (Rental/External)**
            \`\`\`csv
            ${equipmentAndToolsCSV}
            \`\`\`

            **Current Physics Context (Calculated at ${targetDepth} ft):**
            - Total String Weight (Air): ${physicsResults.totalAirWeight.toFixed(1)} lbs
            - Buoyancy Factor: ${physicsResults.bf.toFixed(3)}
            - Buoyed String Weight: ${physicsResults.buoyedStringWeight.toFixed(1)} lbs
            - Total Wire Weight (Air): ${physicsResults.totalWireWeightAir.toFixed(0)} lbs
            - Pressure Area Force (WHP): ${physicsResults.pressureAreaForce.toFixed(0)} lbs
            - Surface Tension (Net Hook Load): ${physicsResults.surfaceTension.toFixed(0)} lbs
            - Hydrostatic Pressure: ${physicsResults.hydrostaticPressure.toFixed(0)} psi
            - Est. Temp at Depth: ${physicsResults.tempAtDepth.toFixed(1)} F
            - Max Tool OD: ${physicsResults.maxToolOD} inches

            ---
            User Request: "${prompt}"
            ${currentImage ? "Note: An image has been provided. Please prioritize extracting component dimensions, connection types, and identifying any visible damage or wear from the image for detailed analysis." : ""}
            
            Please provide a concise and accurate answer based on the data.`;

            const modelName = currentImage ? 'gemini-1.5-pro' : 'gemini-pro';
            const model = ai.getGenerativeModel({ model: modelName });

            let contents;
            if (currentImage) {
                contents = [
                    contextPrompt,
                    {
                        inlineData: {
                            mimeType: currentMime,
                            data: currentImage
                        }
                    }
                ];
            } else {
                contents = contextPrompt;
            }

            const result = await model.generateContent(contents);
            const responseText = result.response.text();

            setChatHistory([...newHistory, { author: 'model', text: responseText, timestamp: new Date() }]);

        } catch (error) {
            console.error(error);
            showNotification('Failed to get response from AI assistant.', 'error');
            setChatHistory([...newHistory, { author: 'model', text: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!userInput.trim() && !attachedImage) return;
        callAI(userInput);
    };

    const handleOptimization = (goal: 'weight' | 'clearance' | 'safety') => {
        let prompt = "";
        let displayMsg = "";

        switch (goal) {
            case 'weight':
                displayMsg = "Optimize string for Weight";
                prompt = `Analyze the current tool string configuration for weight optimization.
Current Total Weight: ${physicsResults.totalAirWeight.toFixed(1)} lbs.
Required Weight for WHP (${wellData.whp} psi): ${physicsResults.pressureAreaForce.toFixed(0)} lbs.

1. Determine if the string is Overbalanced (Weight > Force) or Underbalanced.
2. If Overbalanced: Suggest lighter components from the 'Available Component Database' (e.g., Steel Stem vs Leaded, shorter lengths) to reduce weight while maintaining safety margin (>0).
3. If Underbalanced: Suggest heavier components (e.g., Leaded Stem, Tungsten if avail, or longer bars) to overcome WHP.
4. Calculate specific weight savings or additions.`;
                break;
            case 'clearance':
                displayMsg = "Optimize string for Clearance";
                prompt = `Analyze the current tool string for annular clearance.
Max Tool OD: ${physicsResults.maxToolOD}".
Min Nipple ID: ${wellData.nippleID}".
Tubing ID: ${wellData.tubingID}".

1. Calculate the minimum clearance (Restriction ID - Max Tool OD).
2. Identify the component(s) with the largest OD.
3. Suggest specific replacements from the 'Available Component Database' with smaller ODs to increase bypass area.
4. Verify that suggested replacements are compatible with adjacent connections.`;
                break;
            case 'safety':
                displayMsg = "Run Safety & Compatibility Check";
                prompt = `Perform a comprehensive safety and compatibility check on the 'Current Tool String Assembly'.
1. **Clearance Check**: Compare Max Tool OD (${physicsResults.maxToolOD}") against Min Nipple ID (${wellData.nippleID}") and Tubing ID (${wellData.tubingID}").
2. **Force Balance**: Check if Total String Weight (${physicsResults.totalAirWeight.toFixed(1)} lbs) > Pressure Area Force (${physicsResults.pressureAreaForce.toFixed(0)} lbs) at ${wellData.whp} psi.
3. **Connection Logic**: Verify the assembly sequence (Socket -> Stem -> Jar -> Tool) and check for obvious connection mismatches (e.g., Pin to Pin).
4. **Length**: Check if the total length (${toolString.reduce((a,c)=>a+c.length,0).toFixed(1)} ft) fits standard surface lubricator constraints (assume 20ft limit).
5. **Strength**: Identify if any 'weak points' (like shear pins) are positioned correctly.`;
                break;
        }

        callAI(prompt, displayMsg);
    };

    // Helper for SVG Chart
    const renderChart = () => {
        if (!liveData || liveData.length === 0) return (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                No data available
            </div>
        );

        const dataPoints = liveData.map(d => ({ x: d.Time_Minutes, y: d[selectedMetric] }));
        if (dataPoints.some(p => isNaN(p.x) || isNaN(p.y))) return <div className="text-gray-500 text-xs p-4">Invalid data for chart.</div>;

        const maxX = Math.max(...dataPoints.map(p => p.x));
        const minX = Math.min(...dataPoints.map(p => p.x));
        const maxY = Math.max(...dataPoints.map(p => p.y));
        const minY = Math.min(...dataPoints.map(p => p.y));

        // Use percentage based coordinates for the path to allow non-uniform scaling
        // This avoids "preserveAspectRatio=none" text distortion because we won't put text in the distorted SVG
        const getXPerc = (val: number) => ((val - minX) / (maxX - minX || 1)) * 100;
        const getYPerc = (val: number) => 100 - ((val - minY) / (maxY - minY || 1)) * 100;

        const pathD = dataPoints.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${getXPerc(p.x)} ${getYPerc(p.y)}`
        ).join(' ');

        const handleMouseMove = (e: React.MouseEvent) => {
            if (!chartContainerRef.current) return;
            const rect = chartContainerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            // Calculate percentage of width
            const percX = (mouseX / rect.width) * 100;
            
            // Map percentage back to time value
            const timeVal = (percX / 100) * (maxX - minX) + minX;

            // Find nearest data point
            const nearest = dataPoints.reduce((prev, curr) => 
                Math.abs(curr.x - timeVal) < Math.abs(prev.x - timeVal) ? curr : prev
            );

            setHoveredData({
                time: nearest.x,
                value: nearest.y,
                xPerc: getXPerc(nearest.x),
                yPerc: getYPerc(nearest.y)
            });
        };

        const handleMouseLeave = () => {
            setHoveredData(null);
        };

        return (
            <div 
                ref={chartContainerRef}
                className="w-full h-full relative group cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Main Chart SVG */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible absolute inset-0">
                    {/* Grid Lines (Vertical) - every 25% */}
                    <line x1="25" y1="0" x2="25" y2="100" stroke="#374151" strokeWidth="0.2" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#374151" strokeWidth="0.2" />
                    <line x1="75" y1="0" x2="75" y2="100" stroke="#374151" strokeWidth="0.2" />
                    
                    {/* Grid Lines (Horizontal) - every 25% */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#374151" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#374151" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />

                    {/* Data Line */}
                    <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>

                {/* Axes Labels - HTML to avoid distortion */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-500 pointer-events-none pr-1" style={{ transform: 'translateX(-100%)' }}>
                    <span>{maxY.toFixed(0)}</span>
                    <span>{((maxY + minY)/2).toFixed(0)}</span>
                    <span>{minY.toFixed(0)}</span>
                </div>
                
                {/* Interactive Elements Overlay */}
                {hoveredData && (
                    <>
                        {/* Crosshair Line */}
                        <div 
                            className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none border-r border-dashed border-white/30"
                            style={{ left: `${hoveredData.xPerc}%` }}
                        />
                        {/* Dot */}
                        <div 
                            className="absolute w-3 h-3 bg-cyan-500 rounded-full border-2 border-white pointer-events-none shadow-md"
                            style={{ 
                                left: `${hoveredData.xPerc}%`, 
                                top: `${hoveredData.yPerc}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                        {/* Tooltip */}
                        <div 
                            className="absolute z-20 bg-gray-900/90 backdrop-blur-md border border-gray-600 rounded p-2 text-xs text-white shadow-xl pointer-events-none min-w-[120px]"
                            style={{
                                left: hoveredData.xPerc > 50 ? `${hoveredData.xPerc}%` : `${hoveredData.xPerc}%`,
                                top: `${hoveredData.yPerc}%`,
                                transform: hoveredData.xPerc > 50 ? 'translate(-105%, -50%)' : 'translate(10px, -50%)'
                            }}
                        >
                            <div className="font-bold text-cyan-400 mb-1 border-b border-gray-700 pb-1">{selectedMetric.replace(/_/g, ' ')}</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                                <span className="text-gray-400">Time:</span>
                                <span className="font-mono text-right">{hoveredData.time} min</span>
                                <span className="text-gray-400">Value:</span>
                                <span className="font-mono text-right">{hoveredData.value.toFixed(1)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold text-white mb-2 border-b border-gray-600 pb-2">AI & Physics Assistant</h2>

            {/* Well Selector */}
            <div className="bg-gray-800 p-3 rounded-md mb-3 border border-gray-700 shadow-sm">
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={wellID}
                        onChange={(e) => setWellID(e.target.value)}
                        placeholder="Enter Well ID"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                    <button 
                        onClick={handleFetchWellData}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                    >
                        Fetch Well Data
                    </button>
                </div>
                {fetchedWellData && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 bg-gray-700/30 p-2 rounded border border-gray-600/50">
                        <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-white">{fetchedWellData.Well_Name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Field:</span> <span className="font-medium text-white">{fetchedWellData.Field}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Operator:</span> <span className="font-medium text-white">{fetchedWellData.Operator}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium text-white">{fetchedWellData.Type}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`font-medium ${fetchedWellData.Status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{fetchedWellData.Status}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Production:</span> <span className="font-medium text-white">{fetchedWellData.Production_Status}</span></div>
                        <div className="flex justify-between col-span-2 border-t border-gray-600/30 pt-1 mt-1"><span className="text-gray-500">Total Depth:</span> <span className="font-medium text-cyan-400">{fetchedWellData.Total_Depth_ft} ft</span></div>
                    </div>
                )}
            </div>
            
            {/* Optimization Tools */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <button 
                    onClick={() => handleOptimization('weight')}
                    disabled={isLoading || toolString.length === 0}
                    className="bg-gray-700 hover:bg-cyan-700 hover:text-white text-cyan-400 text-xs py-2 px-1 rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Optimize Weight
                </button>
                <button 
                    onClick={() => handleOptimization('clearance')}
                    disabled={isLoading || toolString.length === 0}
                    className="bg-gray-700 hover:bg-cyan-700 hover:text-white text-cyan-400 text-xs py-2 px-1 rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Max Clearance
                </button>
                <button 
                    onClick={() => handleOptimization('safety')}
                    disabled={isLoading || toolString.length === 0}
                    className="bg-gray-700 hover:bg-green-700 hover:text-white text-green-400 text-xs py-2 px-1 rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Safety Check
                </button>
            </div>

            {/* Physics Analysis Section */}
            <div className="bg-gray-700 rounded-md mb-3 overflow-hidden border border-gray-600">
                <button 
                    onClick={() => setIsPhysicsOpen(!isPhysicsOpen)}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-cyan-400 bg-gray-800 hover:bg-gray-750 flex justify-between items-center transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        Real-Time Physics Analysis
                    </span>
                    <span className="text-gray-500 text-xs">{isPhysicsOpen ? '▲' : '▼'}</span>
                </button>
                
                {isPhysicsOpen && (
                    <div className="p-4 bg-gray-800/50 backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tubing ID (in)</label>
                                <input 
                                    type="number" 
                                    value={wellData.tubingID} 
                                    onChange={(e) => setWellData(prev => ({...prev, tubingID: parseFloat(e.target.value) || 0}))}
                                    step="0.125"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">WHP (psi)</label>
                                <input 
                                    type="number" 
                                    value={wellData.whp} 
                                    onChange={(e) => setWellData(prev => ({...prev, whp: parseFloat(e.target.value) || 0}))}
                                    step="100"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Fluid Density (ppg)</label>
                                <input 
                                    type="number" 
                                    value={wellboreData.fluidDensity} 
                                    onChange={(e) => setWellboreData(prev => ({...prev, fluidDensity: parseFloat(e.target.value) || 0}))}
                                    step="0.1"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Wire OD (in)</label>
                                <input 
                                    type="number" 
                                    value={wireOD} 
                                    onChange={(e) => setWireOD(parseFloat(e.target.value) || 0)}
                                    step="0.001"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Target Depth (ft)</label>
                                <input 
                                    type="number" 
                                    value={targetDepth} 
                                    onChange={(e) => setTargetDepth(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-t border-gray-600 pt-3">
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Fluid Type:</span>
                                <span className="text-white font-mono">{wellboreData.fluidType}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Buoyancy Factor:</span>
                                <span className="text-cyan-400 font-mono">{physicsResults.bf.toFixed(3)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Buoyed String Wt:</span>
                                <span className="text-white font-mono">{physicsResults.buoyedStringWeight.toFixed(1)} lbs</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Hydrostatic Pres:</span>
                                <span className="text-white font-mono">{physicsResults.hydrostaticPressure.toFixed(0)} psi</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Temp @ Depth:</span>
                                <span className="text-white font-mono">{physicsResults.tempAtDepth.toFixed(1)} F</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Pressure Area Force:</span>
                                <span className="text-red-400 font-mono">{physicsResults.pressureAreaForce.toFixed(0)} lbs</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-400">Min Clearance:</span>
                                <span className={`font-mono ${physicsResults.minClearance < 0.05 ? 'text-red-400' : 'text-green-400'}`}>{physicsResults.minClearance.toFixed(3)}"</span>
                             </div>
                             <div className="col-span-2 mt-2 pt-2 border-t border-gray-700 flex justify-between items-center bg-gray-700/30 p-2 rounded">
                                <span className="text-gray-300 font-medium">Net Hook Load @ TD:</span>
                                <span className={`font-bold text-sm ${physicsResults.surfaceTension < 0 ? 'text-red-500' : 'text-green-400'}`}>{physicsResults.surfaceTension.toFixed(0)} lbs</span>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Intervention Data Section */}
            <div className="bg-gray-700 rounded-md mb-3 overflow-hidden border border-gray-600">
                <button 
                    onClick={() => setIsLiveDataOpen(!isLiveDataOpen)}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-cyan-400 bg-gray-800 hover:bg-gray-750 flex justify-between items-center transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Live Intervention Monitor
                    </span>
                    <span className="text-gray-500 text-xs">{isLiveDataOpen ? '▲' : '▼'}</span>
                </button>
                
                {isLiveDataOpen && (
                    <div className="p-4 bg-gray-800/50 backdrop-blur-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-400 mr-2">Metric:</label>
                            <select 
                                value={selectedMetric} 
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none flex-1 cursor-pointer hover:bg-gray-600 transition-colors"
                            >
                                {liveDataHeaders.map(h => (
                                    <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="h-40 w-full mt-2 bg-gray-900/50 rounded border border-gray-700 relative pl-6 pr-2 pt-2 pb-2">
                            {renderChart()}
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-500 pl-6">
                            <span>0 min</span>
                            <span>Time (Minutes)</span>
                            <span>{liveData.length > 0 ? liveData[liveData.length-1].Time_Minutes : 'End'} min</span>
                        </div>
                    </div>
                )}
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-2 pr-4 bg-gray-800 rounded-md">
                {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <p className="text-sm">Ask about well data, equipment, or physics analysis.</p>
                        <p className="text-xs text-gray-600">You can also upload schematic images.</p>
                    </div>
                )}
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'} mb-2 group`}>
                         <div className="relative max-w-[85%]">
                            {/* Tooltip */}
                            <div className={`absolute -top-6 ${msg.author === 'user' ? 'right-0' : 'left-0'} 
                                bg-gray-900 text-gray-300 text-[10px] py-1 px-2 rounded border border-gray-700 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg`}>
                                <span className="font-bold text-white">{msg.author === 'user' ? 'User' : 'AI Assistant'}</span> • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            <div className={`p-3 rounded-lg shadow-sm ${msg.author === 'user' ? 'bg-cyan-700 text-white rounded-br-none' : 'bg-gray-600 text-gray-100 rounded-bl-none'}`}>
                                {msg.image && (
                                    <img src={msg.image} alt="User uploaded" className="max-w-full h-auto rounded mb-2 border border-white/20" style={{maxHeight: '200px'}} />
                                )}
                               <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-600 p-3 rounded-lg rounded-bl-none shadow-sm">
                           <div className="flex items-center space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                           </div>
                        </div>
                    </div>
                 )}
            </div>

            {attachedImage && (
                <div className="px-2 pt-2 pb-1 flex items-center gap-2">
                    <div className="relative group">
                        <img src={`data:${imageMimeType};base64,${attachedImage}`} alt="Preview" className="h-16 w-16 object-cover rounded border border-gray-500" />
                        <button 
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            &times;
                        </button>
                    </div>
                    <span className="text-xs text-cyan-400">Image attached for analysis</span>
                </div>
            )}

            <div className="mt-2 flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 rounded-md border border-gray-600 transition-colors"
                    title="Upload Image"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={attachedImage ? "Ask about the image..." : "Type your question..."}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white resize-none text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-gray-500"
                    rows={1}
                    disabled={isLoading}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || (!userInput.trim() && !attachedImage)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 rounded-md font-medium transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm flex items-center justify-center shadow-md"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
        </div>
    );
};

export default AIAssistantTab;
