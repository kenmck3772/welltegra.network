# Past Intervention Reports Archive

This archive consolidates the daily report excerpts that informed the Montrose recovery program and the surrounding analogue cases. Each entry has been normalized into the standard "Date / Summary / NPT / Toolstring Run" format used by the platform so the in-app modal and documentation registry both surface the same canonical data.

## W666 – “The Perfect Storm”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2024-04-18 | Diagnostic slickline run profiled the main restriction. Gauge ring hung at 8,480 ft confirming severe ovalization. | 6 | Gauge Ring 2.313" OD – tagged 8,480 ft; Memory CCL – attenuated signal across 8,450–8,520 ft |
| 2024-04-21 | Memory production log captured zero-flow interval below the restriction and elevated annulus pressure. | 4 | PLT Spinner – null response below 8,500 ft; Quartz PT Gauge – 150 psi differential between tubing and annulus |
| 2024-04-27 | Contingency milling trial aborted after detecting high torque at 8,520 ft. Decision taken to pivot to expandable patch strategy. | 2 | Heavy-Duty Mill Pilot – torque spike at 8,520 ft; Gyro – deviation stable at 28° |

## M-21 – “The Montrose Squeeze”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2023-11-12 | Caliper log confirmed maximum restriction of 2.05" ID over 40 ft. | 3 | Multi-Finger Caliper – 2.05" min ID at 8,470–8,510 ft; Gyro – deviation 32° |
| 2023-12-07 | Expandable patch expansion completed in a single run with zero tool anomalies. | 1 | Patch Expansion Tool – set at 8,480 ft; Drift Gauge 2.75" – verified post-expansion ID |
| 2024-01-15 | Post-job production test delivered 6.2 mmscf/d with stabilized pressures and no vibration alarms. | 0 | PLT Spinner – uniform profile; Memory PT Gauge – 1,850 psi tubing at perforations |

## S-15 – “The Scale Trap”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2024-01-08 | Gauge run confirmed solid obstruction at 9,210 ft with BaSO₄ signature from sample jar. | 5 | Gauge Ring 2.00" – tagged 9,210 ft; Sample Catcher – BaSO₄ crystals recovered |
| 2024-02-14 | DTPA chemical soak executed with temperature-controlled circulation, dissolving 80% of the blockage. | 4 | CT Bottomhole Assembly – dual injection nozzles; Thermal String – 180°F circulation profile |
| 2024-02-16 | High-pressure jetting pass cleared residual nodules and restored drift. | 2 | Rotating Jetting Head – 6,000 psi sweep; Drift Gauge 2.25" – full pass to 10,900 ft |

## F-11 – “The Broken Barrier”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2024-02-19 | Baseline slickline test verified TRSSV leak-off and captured hydraulic signature for planning. | 3 | SCSSV Test Tool – leak-off at 1,150 psi; Memory Pressure Gauge – rapid decay to 300 psi |
| 2024-03-21 | Mechanical lock-open tool set successfully; valve removed from service without incident. | 1 | Lock-Open Tool – set at 1,480 ft; Gauge Ring 2.25" – verified control line clearance |
| 2024-03-22 | Insert safety valve installed and cycled with positive surface response. | 1 | Wireline-Retrievable SSSV – landed at 1,500 ft; Communication Tool – pass/fail log recorded |

## C-08 – “The Sandstorm”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2023-08-18 | Surface samples quantified 1.8 lb/MMSCF sand production prompting downhole inspection. | 2 | Sand Probe – 1.8 lb/MMSCF; Acoustic Sand Monitor – high-frequency alarms |
| 2023-09-11 | Through-tubing patch deployment isolated the failed screen joint. | 3 | Expandable Patch Tool – set at 9,870 ft; Multifinger Caliper – confirmed restored ID |
| 2023-09-13 | Post-job surveillance confirmed sand-free flow with stabilized drawdown. | 1 | Fiber Optic DTS – uniform temperature; Downhole Sand Probe – zero counts |

## P-12 – “The Wax Plug”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2024-01-16 | Gauge run stalled at 6,040 ft; sample pot retrieved heavy paraffin. | 4 | Gauge Ring 2.0" – tagged 6,040 ft; Sample Pot – paraffin assay |
| 2024-02-02 | Heated solvent circulation dissolved bulk wax within 18 hours. | 5 | CT Heating String – 185°F at depth; Solvent Injection Mandrel – 20 bbl slug |
| 2024-02-03 | Mechanical scraper pass removed remaining deposits; well flowed clean on restart. | 2 | Wax Scraper – full pass to 7,300 ft; Memory PT Gauge – flowing tubing 1,250 psi |

## S-77 – “Field of Dreams”

| Date       | Summary | NPT (hrs) | Toolstring Run |
|------------|---------|-----------|----------------|
| 2023-08-22 | Baseline campaign kicked off with comprehensive production log and scale sampling. | 4 | PLT Spinner – stratified inflow identified; Scale Sampler – trace BaSO₄ detected |
| 2023-09-16 | Integrated remediation run executed sequential patch, chemical cleanout, and insert valve. | 8 | Expandable Patch – set at 9,200 ft; Jetting Tool – 5,800 psi; WR-SSSV – landed at 2,850 ft |
| 2023-10-02 | Verification pass confirmed restored production with zero barrier leaks. | 1 | Pressure Build-Up Tool – stabilized at 2,300 psi; Caliper – ID fully restored |

---

**Usage Notes**

* The archive is intentionally structured to mirror the `well.dailyReports` schema in `assets/js/app.js`. Updating one automatically keeps the other consistent.
* Toolstring runs use concise bullet descriptions so they render clearly both in Markdown and within the in-app modal list.
* All times are captured in hours of Non-Productive Time (NPT) rounded to the nearest hour for rapid reporting comparisons.
