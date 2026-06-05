
import { Module } from './types';

export const COURSE_MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Certification Architecture',
    objective: 'Navigating the IADC/IWCF Regulatory Landscape.',
    lessons: [
      { id: 'm1l1', title: 'The Global Duopoly', duration: '15 min', content: 'Comparative analysis of IADC (North American task-based) vs. IWCF (International engineering-based) accreditation paths. Understanding why the industry relies on these two pillars for competency assurance.' },
      { id: 'm1l2', title: 'IOGP Report 476 Standards', duration: '20 min', content: 'Deep dive into the five levels of competency: from Level 1 (Awareness) to Level 5 (Engineering & Well Design). Identifying your role and the specific legal liabilities associated with each tier.' },
      { id: 'm1l3', title: 'The CR Number Ecosystem', duration: '10 min', content: 'Your Candidate Registration (CR) number is a lifelong identifier. Learn how it tracks your assessment history, simulator scores, and recertification cycles across global drilling contractors.' }
    ]
  },
  {
    id: 'm2',
    title: 'Advanced Well Control Physics',
    objective: 'Mastering transient wellbore phenomena and pressure regimes.',
    lessons: [
      { id: 'm2l1', title: 'Gas Solubility in OBM', duration: '30 min', content: 'The physics of "Hidden Kicks". Understanding how gas dissolves into Oil-Based Mud at high pressure and remains undetectable by standard pit-level sensors until it reaches the bubble point near the surface.' },
      { id: 'm2l2', title: 'Transient Surge & Swab', duration: '25 min', content: 'Managing piston effects during pipe movement. Calculating the impact of pipe velocity on bottom-hole pressure and the risk of induced formation fracture or influx.' },
      { id: 'm2l3', title: 'Dynamic Kill Modeling', duration: '35 min', content: 'Using OLGA and Drillbench logic to model non-steady state fluid dynamics. How to calculate pump rates required to "top-kill" a blowing well using friction as a pressure component.' }
    ]
  },
  {
    id: 'm3',
    title: 'Digital Rig Operations',
    objective: 'Interface mastery for modern offshore control rooms.',
    lessons: [
      { id: 'm3l1', title: 'Automated Kick Detection', duration: '20 min', content: 'Exploring the SafeKick and Drillbench SafeInTime interfaces. Moving from manual "Flow Checks" to machine-learning assisted anomaly detection in return flow rates.' },
      { id: 'm3l2', title: 'Simulators & Human Factors', duration: '25 min', content: 'Understanding IWCF "Role Reversal" in simulator testing. How modern assessments evaluate communication protocols (CRM) as strictly as they evaluate mechanical shut-in speed.' }
    ]
  },
  {
    id: 'm4',
    title: 'Wellbore Integrity & Casing',
    objective: 'Structural design of the wellbore conduit.',
    lessons: [
      { id: 'm4l1', title: 'The Hoop Stress Principle', duration: '25 min', content: 'Understanding how internal and external pressures interact with steel casing. Calculating Burst, Collapse, and Tension safety factors for deepwater environments.' },
      { id: 'm4l2', title: 'Casing Seat Selection', duration: '30 min', content: 'Using the Pore Pressure / Fracture Gradient (PPFG) window to determine exactly where to set casing to prevent formation breakdown during drilling.' }
    ]
  },
  {
    id: 'm5',
    title: 'Zonal Isolation (Cementing)',
    objective: 'Creating the permanent barrier behind the pipe.',
    lessons: [
      { id: 'm5l1', title: 'Primary Cementing Fluid Mechanics', duration: '20 min', content: 'The science of mud displacement. How to ensure a 360-degree cement sheath to prevent annular gas migration after the well is completed.' },
      { id: 'm5l2', title: 'BHP during Cementing', duration: '25 min', content: 'Monitoring the hydrostatic transitions as slurry sets. Managing the risk of "loss of head" as the cement changes from liquid to solid state.' }
    ]
  },
  {
    id: 'm6',
    title: 'Managed Pressure Drilling (MPD)',
    objective: 'The closed-loop alternative to conventional drilling.',
    lessons: [
      { id: 'm6l1', title: 'The Micro-Flux Concept', duration: '30 min', content: 'Detecting influxes measured in liters rather than barrels. How Coriolis flow meters and Automated Choke Manifolds maintain constant bottom-hole pressure within a narrow drilling window.' },
      { id: 'm6l2', title: 'Back-pressure Hydraulics', duration: '25 min', content: 'Using a Rotating Control Device (RCD) to apply surface back-pressure. Calculating the Equivalent Circulating Density (ECD) when the pumps are off.' }
    ]
  },
  {
    id: 'm7',
    title: 'Well Intervention & Workover',
    objective: 'Managing the well lifecycle post-completion.',
    lessons: [
      { id: 'm7l1', title: 'Conveyance Methods', duration: '20 min', content: 'A comparison of Slickline (mechanical), E-Line (data-driven), and Coiled Tubing (hydraulic circulation). Understanding when to use each for remedial well maintenance.' },
      { id: 'm7l2', title: 'Live-Well Operations (Snubbing)', duration: '30 min', content: 'The mechanics of Hydraulic Workover Units. Running pipe into a pressurized wellbore using heavy-duty slip systems and specialized BOP configurations.' }
    ]
  },
  {
    id: 'm8',
    title: 'Decommissioning & P&A',
    objective: 'Ensuring permanent environmental integrity.',
    lessons: [
      { id: 'm8l1', title: 'Barrier Verification', duration: '20 min', content: 'The requirements for a "Permanent Barrier". Technical standards for rock-to-rock cement plugs, tag testing (mechanical integrity), and pressure testing (leak-off verification).' },
      { id: 'm8l2', title: 'Environmental Stewardship', duration: '15 min', content: 'Managing wellhead removal and seabed restoration. Understanding the legal lifecycle of an asset from spudding to final decommissioning.' }
    ]
  },
  {
    id: 'm9',
    title: 'Deepwater Engineering',
    objective: 'Managing complexity in subsea environments.',
    lessons: [
      { id: 'm9l1', title: 'Subsea BOP Systems', duration: '35 min', content: 'The mechanics of multiplex (MUX) control systems and subsea accumulators. Understanding the delay in signal transmission and the critical importance of the Deadman/Autoshear (AMF) system.' },
      { id: 'm9l2', title: 'Riser Mechanics & Kick Tolerance', duration: '30 min', content: 'Calculating the reduced kick tolerance when a large volume of gas enters the marine riser. Managing the "Riser Gas" scenario where expansion occurs rapidly below the rotary table.' }
    ]
  },
  {
    id: 'm10',
    title: 'HPHT Operations',
    objective: 'Drilling in Extreme Pressure and Temperature regimes.',
    lessons: [
      { id: 'm10l1', title: 'Thermal Expansion Effects', duration: '25 min', content: 'Calculating the impact of extreme bottom-hole temperatures on mud density and trapped annular pressure (APB). Understanding how steel yields under high-temperature stress.' },
      { id: 'm10l2', title: 'Narrow Window Drilling', duration: '30 min', content: 'Engineering solutions for reservoirs where the margin between pore pressure and fracture gradient is less than 0.5 ppg. The necessity of MPD and precise hydraulics.' }
    ]
  }
];
