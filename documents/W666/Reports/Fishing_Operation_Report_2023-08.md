# Emergency Fishing Operation Report
## Well W666 - "The Perfect Storm" - Montrose Field

**Incident Date:** August 12, 2023
**Report Date:** August 31, 2023
**Contractor:** Archer Fishing Services
**Well ID:** W666-MONT-UKCS-2019-001

---

## Executive Summary

Emergency fishing operation successfully completed following catastrophic failure of electric submersible pump (ESP) at 8,650 ft MD. Entire ESP assembly (600+ feet) parted and stuck in tubing. 18-day operation required to retrieve fish using specialized Otis fishing tools. Well integrity maintained throughout operation. **Total cost: $4.2M** (including NPT).

### Critical Findings
- ⚠️ **Root Cause:** Motor shaft failure due to cyclic fatigue from frequent start/stop operations
- ⚠️ **Fish Retrieved:** 100% of ESP assembly successfully recovered
- ✅ **Well Status:** Restored to production-ready status
- ⚠️ **Lessons Learned:** Implement vibration monitoring on future ESP installations

---

## Incident Description

### Initial Failure Event
**Date/Time:** August 12, 2023 @ 14:35 UTC
**Well Status Prior:** Producing at 5,200 bopd via ESP
**Alarm Sequence:**
1. High motor temperature (195°C)
2. Motor current spike (320A → 480A)
3. Immediate trip on overload
4. Loss of ESP telemetry

**Well Response:**
- TRSSV closed automatically (safety system worked as designed)
- No surface pressure increase
- No fluid returns to surface
- Well secured within 8 minutes

### Fishing Assessment
**Depth to Fish Top:** 8,050 ft MD
**Estimated Fish Length:** 612 ft
**Obstruction:** Fish stuck in 7" tubing ID
**Clearance:** <0.25" radial (very tight fit)

---

## Equipment Retrieved (Fish Components)

| Component | Depth Range (ft MD) | Length (ft) | Condition | Serial Number |
|-----------|---------------------|-------------|-----------|---------------|
| Power Cable | 8,050-8,650 | 600 | Severed/damaged | ESP-PWR-662 |
| Motor | 8,650-8,682 | 32 | Seized/failed | SLB-MOT-8844 |
| Seal Section | 8,682-8,710 | 28 | Good | SLB-SEAL-2299 |
| Intake | 8,710-8,725 | 15 | Good | SLB-INT-1442 |
| Pump Stages (45) | 8,725-9,275 | 550 | Partially damaged | SLB-PMP-7712 |
| Y-Tool (top) | 9,275-9,287 | 12 | Recovered intact | Otis Y-1234 |

**Total Fish Length:** 612 feet
**Total Weight Retrieved:** 18,400 lbs

---

## Fishing Operations Timeline

### Phase 1: Assessment & Preparation (Days 1-3)
| Date | Activity | Tools Used | Result |
|------|----------|------------|--------|
| Aug 13 | Rig up wireline unit | SLB E-Line | ✅ Complete |
| Aug 13 | Run CCL/GR log to locate fish top | Archer logging tools | Fish top confirmed @ 8,050 ft |
| Aug 14 | Circulate well, condition fluid | Coiled tubing | ✅ Complete |
| Aug 15 | Engineering review, select fishing tools | Otis design team | Strategy approved |

### Phase 2: Initial Fishing Attempts (Days 4-10)
| Date | Activity | Tools Used | Result |
|------|----------|------------|--------|
| Aug 16-17 | Attempt #1: Overshot + jars | Otis 7" overshot + hydraulic jar | ❌ No engagement |
| Aug 18-19 | Attempt #2: Internal spear | Otis tapered spear | ❌ Spear sheared |
| Aug 20-21 | Attempt #3: Bowen retriever | Otis Bowen finder | ⚠️ Engaged but couldn't lift |
| Aug 22-24 | Attempt #4: Heavy-duty pulling tool | Otis HDPT + power jar | ⚠️ Jarring unsuccessful |
| Aug 25 | Re-assess strategy | Engineering team | New approach developed |

### Phase 3: Successful Recovery (Days 11-18)
| Date | Activity | Tools Used | Result |
|------|----------|------------|--------|
| Aug 26 | Chemical wash (free point) | 500 gal acid wash | ✅ Fish loosened |
| Aug 27 | Run Otis 3-prong grab | Heavy-duty grab + jars | ✅ Solid engagement |
| Aug 28 | Jarring operations | 250 jarring cycles | ⚠️ Partial movement |
| Aug 29 | Continued jarring + circulation | Power jar + circulation | ✅ Fish freed! |
| Aug 30 | Pull fish to surface | Otis overshot assembly | ✅ 100% recovery |
| Aug 31 | Inspect, clean well, rig down | Archer team | ✅ Complete |

**Total NPT:** 432 hours (18 days)

---

## Fishing Tools Deployed

### Primary Tools (Successful)
1. **Otis 3-Prong Heavy-Duty Grab**
   - Part Number: OTIS-3PG-7.0-HD
   - Grip Range: 6.5"-7.0" OD
   - Working Load: 250,000 lbs
   - **Result:** Solid engagement on fish

2. **Otis Hydraulic Power Jar**
   - Model: HPJ-7-250K
   - Jar Force: Up to 45,000 lbs impact
   - Stroke Length: 18 inches
   - **Cycles Performed:** 250
   - **Result:** Successfully freed fish after acid wash

3. **Chemical Wash Assembly**
   - 500 gallons 15% HCl acid
   - 24-hour soak time
   - **Result:** Dissolved scale/corrosion, freed fish

### Secondary Tools (Unsuccessful Attempts)
- Otis Releasable Overshot (7")
- Otis Internal Tapered Spear (6.5")
- Bowen Finder/Retriever
- Standard Hydraulic Jar (lighter duty)

### Support Equipment
- Archer E-Line Unit (35,000 lbs pull capacity)
- CCL/GR logging tools (fish depth confirmation)
- Coiled tubing unit (circulation and chemical wash)
- Pressure control equipment (lubricator, BOP)

---

## Root Cause Analysis

### Primary Cause: Motor Shaft Fatigue Failure
**Evidence:**
- Post-recovery inspection revealed circumferential crack at motor coupling
- Metallurgical analysis confirmed high-cycle fatigue (stress concentration)
- Motor operating hours: 8,240 hours (within design life)
- Start/stop cycles: 847 (excessive - design limit 500)

### Contributing Factors
1. **Operational:**
   - Frequent start/stop operations due to flowline back-pressure issues
   - Variable load conditions from reservoir pressure decline
   - Insufficient run-time between starts (thermal cycling)

2. **Design:**
   - Motor shaft coupling design marginal for cyclic loading
   - No vibration monitoring installed on this ESP
   - Power cable not redundant (single point of failure)

3. **Maintenance:**
   - ESP operated beyond recommended service interval (18 months vs 12 months)
   - No condition monitoring or predictive analytics in place

---

## Lessons Learned & Recommendations

### Immediate Actions (Implemented)
1. ✅ Install vibration sensors on all ESP installations
2. ✅ Implement ESP runtime monitoring with start/stop limits
3. ✅ Reduce ESP service interval from 18 to 12 months
4. ✅ Upgrade to dual-redundant motor design for critical wells

### Long-Term Improvements
1. **Predictive Maintenance Program**
   - Real-time motor temperature, vibration, current monitoring
   - Machine learning models to predict failure modes
   - Automatic shutdown on anomaly detection

2. **Design Changes**
   - Specify upgraded motor couplings (fatigue-resistant alloy)
   - Add backup power cable in parallel
   - Install downhole check valve to prevent fluid hammer

3. **Operational Changes**
   - Limit start/stop cycles to <200 per year
   - Implement soft-start VFD (Variable Frequency Drive)
   - Optimize surface flowline to reduce back-pressure variations

4. **Fishing Preparedness**
   - Pre-position Otis fishing tools onsite
   - Maintain chemical wash inventory
   - Train rig crew on fishing tool deployment

---

## Cost Summary

| Category | Cost (USD) | % of Total |
|----------|------------|------------|
| Rig NPT (18 days @ $200k/day) | $3,600,000 | 85.7% |
| Fishing Services (Archer) | $420,000 | 10.0% |
| Fishing Tools (Otis rental) | $125,000 | 3.0% |
| Chemicals & Consumables | $35,000 | 0.8% |
| Logistics & Mobilization | $20,000 | 0.5% |
| **TOTAL COST** | **$4,200,000** | **100%** |

**Production Loss:**
- Days offline: 18
- Lost production: 93,600 boe (barrels oil equivalent)
- Revenue loss @ $85/boe: $7,956,000
- **Total Economic Impact: $12.2M**

---

## Conclusions

Despite the significant cost and downtime, the fishing operation was ultimately successful due to:
1. Methodical approach and patient execution
2. Expert use of Otis fishing tools
3. Chemical intervention to free stuck fish
4. Strong coordination between operator and fishing contractor

The incident highlights the importance of:
- Proactive ESP monitoring and maintenance
- Having fishing expertise and equipment readily available
- Learning from failures to improve future operations

### Well Status
- ✅ Well cleaned and inspected
- ✅ Tubing integrity confirmed
- ✅ TRSSV function-tested
- ✅ Ready for new ESP installation (scheduled Q4 2023)

---

**Report Prepared By:**
Finlay MacLeod, Wellsite Operations Engineer
**Reviewed By:**
Dr. Isla Munro, Operations Manager
**Fishing Supervisor:**
Magnus Reid, Archer Fishing Services

**Document Reference:** W666-FISH-RPT-2023-001
**Classification:** Company Confidential
**Distribution:** Asset Team, Regulatory Authority (NSTA), Insurance Underwriter
