# A Comprehensive Guide to Well Intervention Program Planning: From Scoping to Continuous Improvement

## Executive Summary: The Intervention Planning Philosophy

Well intervention planning is a systematic, risk-based process that transforms a defined objective into a safe, efficient, and executable field procedure. It is not merely a checklist but a cycle of data acquisition, engineering analysis, and iterative refinement. The primary goal is to develop a robust program that safely and efficiently achieves the intervention objective while minimizing risk to personnel, the environment, and the asset.

The ultimate goal is to create a "digital twin" of the intervention operation through modeling, allowing the team to predict outcomes, identify failure modes, and prepare contingencies *before* committing costly equipment and personnel to the wellsite. The choice of conveyance—Slickline, Coiled Tubing (CT), or Electric Line (E-line)—is a pivotal decision that dictates the entire engineering scope, risk profile, and potential success of the operation.

---

## Phase 1: Intervention Scoping, Justification & Concept Selection

This initial phase defines the "why" and establishes the high-level feasibility and business case for the operation.

### Flow of Steps:

#### 1. Problem Identification & Opportunity Analysis
- **Trigger:** Production decline, well integrity issue (e.g., SCSSV failure), reservoir management requirement (e.g., PLT), or new technology trial.
- **Action:** Quantify the problem. Instead of "production dropped," use "Oil production has declined from 1,500 bopd to 800 bopd over 60 days, with a corresponding increase in water cut from 10% to 40%."

#### 2. Define Clear, Measurable Objectives
- **Action:** Use the SMART (Specific, Measurable, Achievable, Relevant, Time-bound) framework.
- **Example (Poor):** "Find out why the well is watering out."
- **Example (SMART):** "Acquire a production log (PLT) across zones X, Y, and Z (4,500-5,200 ft MD) to identify water entry points with a flow rate accuracy of +/- 10%, enabling a targeted water shut-off within the next quarter."

#### 3. Conceptual Method Screening & High-Level Feasibility
- **Action:** A multi-disciplinary team (Production Engineer, Intervention Engineer, Reservoir Engineer) performs a high-level screening.
- **Key Considerations:**
  - **Well Geometry:** Is the well highly deviated or horizontal? (Favors CT/E-line).
  - **Pressure Control:** What are the expected surface pressures? (High pressure may favor slickline or require more robust CT/E-line pressure control equipment).
  - **Objective Complexity:** Is it a simple mechanical set (Slickline) or does it require real-time data or pumping (CT/E-line)?
  - **Logistics & Cost:** What is the available budget and platform/rig space?

### Data Required to be Added/Inputted for the Program:

- **Intervention Justification Document (IJD):** A formal document containing the problem statement, SMART objectives, and preliminary cost-benefit analysis.
- **Conceptual Feasibility Memo:** A brief technical report outlining the pros and cons of Slickline, CT, and E-line against the specific objective, recommending one or two methods for detailed engineering. This memo forms the basis for the detailed program.

---

## Phase 2: Comprehensive Data Gathering & Well History Analysis

This is the foundational data acquisition phase. The quality of the entire intervention program is entirely dependent on the quality of the data gathered here.

### Flow of Steps:

1. **Establish a "Master Data File":** Create a single, controlled repository for all well-related information.
2. **Collect Static Well Data:** The unchanging physical characteristics of the well.
3. **Collect Dynamic Well Data:** The current state and historical performance of the well.
4. **Perform a "Digital Wellbore Review":** Virtually run the planned tools through the wellbore schematic to identify potential restrictions or interference points.

### Data Required to be Added/Inputted for the Program (The Master Data File):

#### 1. Well Trajectory & Geometry
- **Data:** Directional survey data (MD, TVD, Inclination, Azimuth) for the open hole, cased hole, and tubing.
- **Usage:** Critical for **CT Force/Torque Modeling** to predict reach, calculate lock-up depth, and simulate buckling. Essential for E-line/Slickline to predict tool drag and ensure tools can reach TD.

#### 2. Completion Hardware & Strings
- **Data:**
  - **Tubing String:** Make-up, size, weight, grade, thread type, ID, drift ID, special connections, upset lengths. A detailed tally of all joints.
  - **Casing/Liner String:** Same as tubing data.
  - **Completion Schematic:** The official, as-built drawing. Must be verified against the final well report.
  - **Profile Nipples:** Type (e.g., Select-F, F, R), size, top depth, and bottom depth for all profiles (X, Y, Z, etc.).
  - **Packers:** Type, setting depth, setting mechanism (wireline-set, hydraulically-set), bore ID.
  - **Subsurface Safety Valves (SCSSV):** Type (flapper vs. sleeve), setting depth, control line pressure (operating and test), fail-safe position (open/close).
  - **Gas Lift Equipment:** Mandrel types (concentric vs. side-pocket), valve depths and ratings.
- **Usage:** Determines toolstring compatibility (clearance), depth correlation points (CCL on collars, profiles), and potential obstruction locations.

#### 3. Reservoir & Fluid Properties
- **Data:**
  - **Pressures:** Current reservoir pressure, static bottomhole pressure (SBHP), flowing bottomhole pressure (FBHP).
  - **Temperatures:** Static bottomhole temperature (SBHT) and expected flowing temperature (FBHT).
  - **Fluid Properties:** PVT analysis – oil, water, gas densities (SG), viscosities, GOR (Gas-Oil Ratio). Water chemistry (chlorides, scaling potential). H₂S and CO₂ concentrations (mol%).
- **Usage:**
  - **P/T:** Essential for selecting tool and equipment ratings (O-rings, electronics). Affects fluid viscosity for hydraulic modeling.
  - **Fluid Densities:** Used for hydrostatic pressure calculations, well control scenarios, and buoyancy calculations in CT modeling.
  - **H₂S/CO₂:** Drives material selection (requiring sour service equipment like 75K/SSSS or Duplex steels) and dictates H₂S safety levels (requires personal H₂S monitors, breathing apparatus).

#### 4. Well History & Performance
- **Data:**
  - **Production/Injection History:** Plots of rates (oil, gas, water), pressures (tubing head, casing head), and choke settings.
  - **Previous Intervention Reports:** Detailed reports for *all* past interventions. Pay close attention to tools run, successes/failures, "stuck pipe" or "lost in hole" incidents, and deviations from the original program.
- **Usage:** Provides empirical evidence of what has worked or failed in this specific wellbore. Helps identify recurring problems (e.g., a known tight spot at 8,500 ft) that must be planned for.

---

## Phase 3: Detailed Engineering, Program Development & Risk Mitigation

This is where the data is transformed into a predictive model and a robust, step-by-step operational procedure.

### Flow of Steps:

1. **Finalize Conveyance Method & BHA Design**
2. **Perform Predictive Simulations & Modeling**
3. **Draft the Detailed Intervention Program**
4. **Conduct a Formal Risk Assessment (HAZOP/HAZID)**
5. **Develop Detailed Contingency & "Get-Out-of-Jail" Plans**

### Data Required to be Added/Inputted for the Program:

#### 1. Conveyance & BHA Engineering

**Input:** Objective, Master Data File (Phase 2).

**Output:**
- **Method Justification Report:** A formal document with a decision matrix comparing the methods.
- **BHA Schematic:** A detailed drawing of the Bottom Hole Assembly with part numbers, dimensions (OD, ID), and functional ratings.

**Quick Comparison Guide:**

| Feature | Slickline | Coiled Tubing (CT) | Electric Line (E-line) |
|:--------|:----------|:-------------------|:-----------------------|
| **Primary Function** | Simple mechanical manipulation (setting/retrieving plugs, valves, gauges). | Mechanical manipulation, pumping/circulation, logging, milling, cleanouts. | High-resolution data acquisition, selective perforation, mechanical manipulation. |
| **Conveyance** | Simple solid wire. No real-time surface readout. | Continuous steel pipe. Can pump fluids. Can have real-time data (with e-coil). | Armored cable with electrical conductors. Provides real-time data. |
| **Force** | Low axial force. | High axial force. Can push through high doglegs and debris. | Low axial force (similar to slickline). |
| **Data** | None (unless memory tools are used). | Can have real-time data (CT-Head T/P, CCL) and downhole memory tools. | Real-time, high-bandwidth data (CCL, GR, CBL, PLT, etc.). |

#### 2. Predictive Simulations (The "Digital Twin")

**Input:** Well trajectory, string geometry, BHA details, fluid properties, proposed operating parameters.

**Output:**
- **CT Force & Torque Analysis:** A simulation that models the mechanical forces on the CT string. It predicts the **lock-up depth** (where the CT can no longer be pushed), **helical buckling**, and the **maximum pull force** required to retrieve the string. In lateral wells, torque modeling is critical for operations involving motors.
- **CT Hydraulics Simulation:** Models fluid flow to predict **surface pump pressure**, **annular velocity** (for effective cleanouts), and **ECD (Equivalent Circulating Density)** to avoid fracturing the formation.
- **Perforating Ballistics & Shock Modeling:** For perforating operations, this predicts the pressure wave, dynamic shock loads, and wellbore temperature changes from the detonation, ensuring downhole equipment can withstand the event.
- **Transient Multiphase Flow Simulation:** For complex cleanouts in live wells, this simulates gas, oil, water, and solids interactions to predict slugging and pressure fluctuations, ensuring surface equipment can handle the flow.
- **Wireline Stretch & Fatigue Modeling:** Calculates wire elongation for accurate depth correction and tracks cumulative damage to determine when the wire should be retired.

#### 3. The Intervention Program Document

**Input:** All data from previous phases, simulation results.

**Output:** The master procedural document. It must include:
- Administrative details, objectives, and a well data summary.
- A complete equipment list with serial numbers and certification dates.
- A detailed rig-up diagram showing the pressure control equipment configuration.
- A step-by-step procedure for the entire operation.
- A summary of key simulation outputs.
- The Risk Assessment and Contingency plans.

#### 4. Risk Assessment (HAZOP - Hazard and Operability Study)

**Input:** The draft intervention program.

**Process:** A structured, brainstorming session where the team uses guidewords (e.g., No, More, Less, Reverse) to identify potential deviations from the design intent.

**Output:**
- **Risk Register:** A table detailing each hazard, its cause, consequences, likelihood, and severity.
- **Mitigation Measures:** Specific actions to reduce the risk to an As Low As Reasonably Practicable (ALARP) level.

#### 5. Contingency Planning

**Input:** The high-risk scenarios from the HAZOP.

**Output:** Detailed, standalone plans for worst-case scenarios.
- **Stuck Pipe/CT Plan:** What steps will be taken? What fishing tools are required?
- **Well Control Plan:** What are the kill fluid densities and volumes? What is the kill method (circulation vs. bullheading)? This is often supported by a **Dynamic Well Control Model** that simulates a kick and predicts pressure behavior.
- **Equipment Failure Plan:** What is the backup if a primary tool fails on location?

---

## Phase 4: Human Factors, Decision-Making & Crew Resource Management (CRM)

A technically perfect program is useless if it's not executed correctly by a competent, cohesive team. This phase focuses on the human element.

### Flow of Steps:

1. **Establish a "One-Team" Culture:** Break down silos between the operator company and the service company.
2. **Implement Crew Resource Management (CRM):** Adopt principles from aviation to improve communication and decision-making.
3. **Define a Clear Decision-Making & Authority Matrix:** Empower the team to stop the job if necessary.

### Data Required to be Added/Inputted for the Program:

#### 1. Organizational Chart & Roles & Responsibilities (R&R) Matrix
A formal document that clearly defines who is responsible for what, preventing confusion and ensuring accountability.

#### 2. CRM Principles & Communication Protocols
- **Pre-Job CRM Briefing:** A structured briefing where every person is encouraged to speak up about concerns.
- **"Time-Out for Safety" Authority:** A formal policy that gives *any* crew member the authority and obligation to call a "stop work" if they feel something is unsafe.
- **Closed-Loop Communication:** A protocol for confirming critical instructions by repeating them back.

#### 3. Decision Gates & Go/No-Go Criteria
A set of predefined criteria that must be met before proceeding to the next major phase of the operation. This structured approach prevents "press-on-itis" and ensures operations only proceed when all conditions are safe.

---

## Phase 5: Pre-Execution, Logistics & Field Execution

This phase is about mobilizing the right people and equipment to the location and executing the plan safely.

### Flow of Steps:

1. **Final Equipment Check & Certification:** Verify all equipment matches the program list and has valid test certificates.
2. **Personnel Verification:** Confirm all crew members have valid, role-specific certifications (e.g., IWCF Well Control).
3. **Pre-Job Safety & Planning Meeting (Toolbox Talk):** The entire crew on location walks through the program, the HAZOP findings, and their individual roles.
4. **Execution & Real-Time Monitoring:** The supervisor executes the program while continuously comparing actual vs. predicted parameters (e.g., surface weight vs. CT model, pump pressure vs. hydraulic model).
5. **Documentation:** The Supervisor accurately logs all times, depths, weights, pressures, and any deviations from the plan.

### Data Required to be Added/Inputted for the Program:

- **Equipment Certification Dossiers:** Copies of all pressure test certificates, calibration certs, and inspection reports.
- **Crew Competency Matrix:** A signed-off document verifying personnel qualifications.
- **Signed-Off JSA/TBM Records:** Proof that the pre-job safety meeting was held and attended.
- **Daily Morning Reports:** These documents contain the *actual* data from the job (weights, depths, pressures, times, issues encountered).

---

## Phase 6: Post-Job Analysis, Knowledge Management & Continuous Improvement

This is the most important phase for long-term asset management. The goal is to ensure that lessons learned are captured, analyzed, and disseminated to prevent future failures and repeat successes.

### Flow of Steps:

1. **Conduct a Formal Post-Job Review (PJR)**
2. **Perform a "Root Cause Analysis" (RCA) for any Deviations**
3. **Update the "Living" Well File and Knowledge Base**

### Data Required to be Added/Inputted for the Program:

#### 1. Post-Job Review (PJR) Report
A structured report that answers: What went well? What did not go according to plan? What can we do differently next time?

#### 2. Root Cause Analysis (RCA) for Incidents/Near-Misses
An investigation that goes beyond the immediate cause to find the systemic failures that led to the event.

#### 3. The Updated "Digital Twin" and Knowledge Base
This is the crucial final step where data is fed back into the system.
- **Well File Update:** The Final Job Report, PJR, and RCA are permanently attached to the well's digital file. This report becomes a crucial piece of data for the *next* intervention.
- **Calibration of Simulators:** The actual job data is used to "calibrate" the engineering models, making the next simulation for this well (or a similar one) more accurate.
- **Lessons Learned Database:** The actionable items from the PJR are entered into a searchable, company-wide database. This transforms individual experiences into institutional knowledge, driving continuous improvement across the organization.

---

## Conclusion

By integrating these phases, the well intervention planning process evolves from a simple procedural task into a sophisticated, closed-loop system of continuous learning and improvement, ultimately leading to safer, more efficient, and more successful outcomes.

---

## Document Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-20 | Initial | First comprehensive version |

---

*This document is a living guide and should be updated regularly based on field experience, technological advances, and lessons learned from intervention operations.*
