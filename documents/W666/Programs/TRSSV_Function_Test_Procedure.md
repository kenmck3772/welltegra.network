# TRSSV Function Test Procedure
## Tubing Retrievable Subsurface Safety Valve Testing

**Well:** W666 - "The Perfect Storm" - Montrose Field
**Document Type:** Standard Operating Procedure
**Revision:** 3.1
**Effective Date:** January 2024
**Frequency:** Every 6 months (regulatory requirement)

---

## Purpose

To verify the operational integrity and fail-safe closure capability of the Tubing Retrievable Subsurface Safety Valve (TRSSV) installed at 1,800 ft MD in Well W666.

## Regulatory Requirements

- **North Sea Transition Authority (NSTA):** Mandates DHSV testing every 6 months
- **UK Offshore Safety Directive:** Requires documented evidence of safety barrier integrity
- **Company Policy:** Zero tolerance for failed safety systems

---

## Equipment Details

**TRSSV Specifications:**
- Manufacturer: Baker Hughes
- Model: Camco BPV-HS (High Pressure/High Temperature)
- Depth: 1,800 ft MD
- Control Line: 1/4" Duplex Stainless Steel
- Operating Pressure: 3,000 psi hydraulic
- Closure Time (Design): <10 seconds
- Last Test Date: See test records section

---

## Pre-Test Requirements

### 1. Personnel

| Role | Name | Certification Required |
|------|------|------------------------|
| Wellsite Engineer | TBD | IWCF Level 3, TRSSV Certified |
| Wireline Supervisor | TBD | Weatherford DHSV Training |
| Rig Supervisor | TBD | OIM Certificate |
| HSE Supervisor | TBD | NEBOSH Diploma |

**Minimum Crew:** 4 persons
**Toolbox Talk:** Mandatory before commencing operations

### 2. Equipment Checklist
- [ ] Hydraulic pump unit (test capability to 5,000 psi)
- [ ] Pressure gauges (0-10,000 psi, calibrated within 30 days)
- [ ] Control line isolation valves
- [ ] Stopwatch/timer (for closure time measurement)
- [ ] Bleed-off hoses and containment
- [ ] PPE (hard hat, safety glasses, gloves, coveralls, steel-toe boots)

### 3. Well Status Verification
- [ ] Well shut-in and stable for minimum 2 hours
- [ ] Wellhead pressure recorded
- [ ] No ongoing operations (no wireline, coiled tubing, etc.)
- [ ] Weather conditions acceptable (wind <35 knots, Hs <3.5m)
- [ ] TRSSV control line intact and pressure holding

### 4. Permit-to-Work
- [ ] Mechanical PTW issued and signed
- [ ] SIMOPS assessment complete
- [ ] Emergency response plan briefed
- [ ] Fire water system confirmed operational

---

## Test Procedure

### Phase 1: Pre-Test Inspection (Duration: 30 minutes)

1. **Visual Inspection**
   - Inspect wellhead and control line connections for leaks
   - Verify control line valve is accessible and operational
   - Check hydraulic pump fluid level and condition
   - Inspect pressure gauges (zero check, no damage)

2. **Baseline Readings**
   - Record wellhead pressure: __________ psi
   - Record annulus pressure: __________ psi
   - Record ambient temperature: __________ °C
   - Record control line pressure: __________ psi

3. **Communication Check**
   - Radio check with control room
   - Confirm emergency shutdown (ESD) system operational
   - Notify platform OIM testing is commencing

---

### Phase 2: TRSSV Open Test (Duration: 15 minutes)

**Objective:** Verify TRSSV can be fully opened on command

1. **Apply Hydraulic Pressure**
   - Slowly pressurize control line to 3,000 psi
   - Monitor pressure gauge for stability
   - **Expected Result:** Pressure holds steady (valve open)

2. **Confirm Valve Open Status**
   - Observe wellhead pressure (should remain stable or slightly increase)
   - **Hold Time:** 5 minutes
   - **Acceptance Criteria:** Wellhead pressure within ±50 psi of baseline

3. **Record Results**
   - Control line pressure applied: __________ psi
   - Wellhead pressure (valve open): __________ psi
   - Hold time: __________ minutes
   - Result: ☐ Pass ☐ Fail

---

### Phase 3: TRSSV Close Test (Duration: 30 minutes)

**Objective:** Verify TRSSV closes fully and rapidly on signal loss (fail-safe test)

1. **Rapid Pressure Release**
   - Open control line bleed valve **quickly**
   - Start stopwatch immediately
   - Monitor wellhead pressure

2. **Observe Closure**
   - **Expected Closure Time:** <10 seconds (per manufacturer spec)
   - **Indicator:** Wellhead pressure should drop to zero (or equalized with annulus)
   - Stop stopwatch when pressure stabilizes

3. **Record Results**
   - Measured closure time: __________ seconds
   - Wellhead pressure after closure: __________ psi
   - Annulus pressure after closure: __________ psi
   - Result: ☐ Pass ☐ Fail

4. **Leak Test**
   - With TRSSV closed, monitor for 10 minutes
   - **Acceptance Criteria:** No wellhead pressure buildup >50 psi
   - **Result:** ☐ Pass (no pressure buildup) ☐ Fail (pressure increasing)

---

### Phase 4: Re-Open Test (Duration: 15 minutes)

**Objective:** Confirm TRSSV can be cycled multiple times reliably

1. **Re-Apply Hydraulic Pressure**
   - Pressurize control line to 3,000 psi
   - Observe wellhead pressure increase (flow from reservoir resumes)

2. **Stabilization**
   - Allow wellhead pressure to stabilize
   - Compare to baseline readings from Phase 1

3. **Cycle Test (Optional but Recommended)**
   - Perform one additional close/open cycle
   - Verify consistent closure time
   - Ensure no degradation in performance

4. **Final Open Position**
   - Confirm TRSSV is left in **OPEN** position
   - Lock control line valve in pressurized position
   - Install tamper-proof tag

---

## Acceptance Criteria

| Parameter | Acceptance Range | Action if Failed |
|-----------|------------------|------------------|
| Closure Time | ≤10 seconds | Immediate investigation, consider TRSSV pull |
| Wellhead Pressure Drop (closed) | ≥95% of open pressure | Check for valve seat damage |
| Control Line Pressure Hold | 3,000 psi ±100 psi (10 min) | Inspect control line for leaks |
| Leak Rate (valve closed) | <50 psi buildup in 10 min | Run leak-off test, consider valve repair |

**Overall Test Result:**
- ✅ **PASS:** All criteria met - TRSSV serviceable for 6 months
- ❌ **FAIL:** Any criteria missed - Immediate escalation to Operations Manager

---

## Post-Test Actions

1. **Documentation**
   - Complete test data sheet (see Appendix A)
   - Sign off by Wellsite Engineer and Rig Supervisor
   - Upload to well file within 24 hours
   - Notify NSTA via regulatory portal within 7 days

2. **Well Handback**
   - Confirm TRSSV in OPEN position
   - Remove test equipment
   - Close and secure all PTWs
   - Hand well back to production

3. **Next Test Due**
   - Calculate next test date (+6 months from today)
   - Schedule in maintenance system
   - Add to operations calendar

---

## Emergency Response

### TRSSV Fails to Close
**Immediate Actions:**
1. Activate ESD (Emergency Shutdown)
2. Close wing valve at wellhead
3. Notify OIM and Operations Manager
4. Isolate well from production system
5. Convene emergency response team

**Follow-Up:**
- Well remains shut-in until TRSSV repaired or replaced
- Regulatory notification required within 24 hours
- Root cause investigation mandated

### TRSSV Fails to Re-Open
**Immediate Actions:**
1. Verify hydraulic pump and control line integrity
2. Attempt pressure cycling (3 attempts maximum)
3. If unsuccessful, plan wireline intervention

**Follow-Up:**
- Well remains offline (production loss)
- Schedule wireline unit to mechanically open TRSSV
- Consider pulling and replacing TRSSV if repeated failures

---

## Test History Log

| Test Date | Closure Time (sec) | Result | Tested By | Next Test Due |
|-----------|-------------------|--------|-----------|---------------|
| 2020-03-10 | 8.2 | ✅ Pass | F. MacLeod | 2020-09-10 |
| 2020-09-12 | 8.5 | ✅ Pass | F. MacLeod | 2021-03-12 |
| 2021-03-15 | 9.1 | ✅ Pass | F. MacLeod | 2021-09-15 |
| 2021-09-18 | 8.7 | ✅ Pass | R. McKenzie | 2022-03-18 |
| 2022-03-20 | 9.3 | ✅ Pass | F. MacLeod | 2022-09-20 |
| 2022-09-22 | 8.9 | ✅ Pass | F. MacLeod | 2023-03-22 |
| 2023-03-25 | 9.6 | ⚠️ Marginal | F. MacLeod | 2023-09-25 |
| 2023-09-27 | 9.8 | ⚠️ Marginal | F. MacLeod | 2024-03-27 |
| **NEXT TEST** | **2024-03-30** | **DUE** | **TBD** | **2024-09-30** |

**Trend Analysis:**
- Closure time increasing over time (8.2s → 9.8s)
- Still within spec (<10s) but approaching limit
- **Recommendation:** Monitor closely; consider TRSSV replacement in 2024

---

## Appendices

### Appendix A: Test Data Sheet
(To be completed during test - see separate form)

### Appendix B: Manufacturer Contact Info
- Baker Hughes Support: +44 (0) 1224 123 456
- 24/7 Emergency Hotline: +44 (0) 7890 654 321
- Technical Support Email: support.uk@bakerhughes.com

### Appendix C: Regulatory References
- NSTA Guidance Note on DHSV Testing
- ISO 10423:2009 (Wellhead and Christmas Tree Equipment)
- API 14A (Subsurface Safety Valve Equipment)

---

**Document Control:**
- **Prepared By:** Dr. Isla Munro, Operations Manager
- **Approved By:** Rowan Ross, Asset Integrity Lead
- **Next Review Date:** January 2025
- **Document Reference:** W666-PROC-TRSSV-001

**Distribution:** Wellsite Engineers, Rig Supervisors, NSTA (Regulatory), Company Well File
