# WellTegra Well History Data Template & Requirements

## Executive Summary

This document defines the comprehensive data structure required to unlock the full value of historical well data in WellTegra. Complete data enables:

- **AI-driven intervention planning** with 30%+ NPT reduction
- **Predictive maintenance** based on equipment failure patterns
- **Cost optimization** through historical benchmarking
- **Risk mitigation** via lessons learned analysis
- **Regulatory compliance** tracking
- **Asset portfolio optimization**

---

## Data Completeness Targets

| Category | Target Completeness | Current Industry Average | Value Unlock |
|----------|-------------------|------------------------|--------------|
| **Well Header** | 100% | 95% | Critical - enables well selection |
| **Drilling History** | 85%+ | 60% | High - informs risk assessment |
| **Completion Data** | 90%+ | 70% | Critical - required for intervention design |
| **Production History** | 95%+ | 80% | High - revenue impact analysis |
| **Intervention History** | 85%+ | 54% | **Critical** - AI model training |
| **Equipment History** | 85%+ | 54% | **Critical** - failure prediction |
| **Integrity Data** | 95%+ | 65% | Critical - safety gate blocking |
| **Cost Data** | 80%+ | 50% | High - ROI calculations |
| **Lessons Learned** | 75%+ | 30% | High - prevents repeat failures |

---

## SECTION 1: Well Header (MANDATORY - 100%)

### Basic Identification
```json
{
  "well_id": "REQUIRED - Unique well identifier (API, UWI, or company ID)",
  "well_name": "REQUIRED - Common well name",
  "alias_names": ["Alternative names, historical names"],
  "field": "REQUIRED - Field name",
  "block": "Block or lease designation",
  "platform": "Platform/facility name if applicable",
  "country": "REQUIRED - Country",
  "region": "State/province/region",
  "basin": "Geological basin",
  "operator": "REQUIRED - Current operator",
  "operator_history": [
    {
      "operator": "Historical operator name",
      "from_date": "2010-01-15",
      "to_date": "2018-06-30",
      "reason": "Asset sale / merger / acquisition"
    }
  ]
}
```

### Geographic Location
```json
{
  "surface_location": {
    "latitude": "REQUIRED - Decimal degrees",
    "longitude": "REQUIRED - Decimal degrees",
    "datum": "WGS84 / NAD83 / etc",
    "utm_zone": "Optional - UTM zone",
    "utm_northing": "Optional",
    "utm_easting": "Optional"
  },
  "bottom_hole_location": {
    "latitude": "For deviated wells",
    "longitude": "For deviated wells",
    "offset_from_surface": "Distance in meters/feet"
  },
  "water_depth": "For offshore wells - meters/feet",
  "elevation_kb": "Kelly Bushing elevation - meters/feet MSL"
}
```

### Well Classification
```json
{
  "well_type": "REQUIRED - Production / Injection / Exploration / Appraisal / Disposal",
  "well_profile": "REQUIRED - Vertical / Deviated / Horizontal / Multilateral",
  "well_status": "REQUIRED - Active / Shut-in / Abandoned / P&A / Suspended",
  "production_type": "Oil / Gas / Condensate / Water / CO2",
  "environment": "REQUIRED - Onshore / Offshore / Subsea",
  "jurisdiction": "Federal / State / Private land"
}
```

### Regulatory Information
```json
{
  "permit_number": "Drilling permit number",
  "api_number": "API number (US wells)",
  "uwi": "Unique Well Identifier (Canada)",
  "regulatory_authority": "Governing body",
  "license_expiry": "Production license expiry date",
  "spud_date": "REQUIRED - Well spud date",
  "completion_date": "Initial completion date",
  "first_production_date": "First oil/gas date",
  "abandonment_date": "If P&A'd"
}
```

---

## SECTION 2: Drilling History (Target: 85%)

### Wellbore Construction Timeline
```json
{
  "drilling_phases": [
    {
      "phase": "Surface hole",
      "start_date": "2018-03-15T08:00:00Z",
      "end_date": "2018-03-18T14:30:00Z",
      "depth_md": 500,
      "depth_tvd": 500,
      "hole_size": "26 inches",
      "mud_type": "WBM - Water-based",
      "mud_weight": "9.2 ppg",
      "rop_average": "45 ft/hr",
      "npt_hours": 0,
      "issues": "None"
    },
    {
      "phase": "Intermediate hole",
      "start_date": "2018-03-19T06:00:00Z",
      "end_date": "2018-04-02T18:00:00Z",
      "depth_md": 3500,
      "depth_tvd": 3450,
      "hole_size": "17.5 inches",
      "mud_type": "OBM - Oil-based",
      "mud_weight": "12.8 ppg",
      "rop_average": "28 ft/hr",
      "npt_hours": 36,
      "issues": "Lost circulation at 2,850 ft - LCM squeeze performed"
    }
  ],
  "total_drilling_days": 45,
  "total_npt_hours": 72,
  "total_measured_depth": 12850,
  "total_true_vertical_depth": 10250,
  "kickoff_point": 2500,
  "maximum_deviation": "65 degrees",
  "maximum_dogleg_severity": "4.5 deg/100ft"
}
```

### Casing Program
```json
{
  "casing_strings": [
    {
      "string_name": "Surface casing",
      "outer_diameter": "20 inches",
      "weight": "133 lb/ft",
      "grade": "K-55",
      "connection": "Buttress",
      "depth_md": 500,
      "depth_tvd": 500,
      "cement_top": 0,
      "cement_type": "Class G + 2% CaCl2",
      "cement_volume": "350 bbls",
      "set_date": "2018-03-18",
      "pressure_test": {
        "test_pressure": 1000,
        "test_duration_minutes": 30,
        "result": "PASS"
      }
    },
    {
      "string_name": "Production casing",
      "outer_diameter": "9 5/8 inches",
      "weight": "53.5 lb/ft",
      "grade": "L-80 13Cr",
      "connection": "Premium - VAM TOP",
      "depth_md": 12850,
      "depth_tvd": 10250,
      "cement_top": 8500,
      "cement_type": "Class G + silica flour",
      "cement_volume": "450 bbls",
      "set_date": "2018-04-15",
      "pressure_test": {
        "test_pressure": 5000,
        "test_duration_minutes": 30,
        "result": "PASS"
      }
    }
  ]
}
```

### Geological Data
```json
{
  "formations_encountered": [
    {
      "formation_name": "Brent Group",
      "top_depth_md": 8950,
      "top_depth_tvd": 8200,
      "bottom_depth_md": 9850,
      "bottom_depth_tvd": 8950,
      "lithology": "Sandstone - medium to coarse grained",
      "porosity_average": 0.22,
      "permeability_average": 450,
      "net_pay": 280,
      "oil_saturation": 0.68,
      "pressure_gradient": "0.465 psi/ft"
    }
  ],
  "reservoir_fluid": {
    "fluid_type": "Black oil",
    "api_gravity": 38.5,
    "gas_oil_ratio": 850,
    "formation_volume_factor": 1.35,
    "viscosity": "1.2 cp at reservoir conditions",
    "bubble_point": "3250 psi"
  }
}
```

### Drilling Challenges & NPT
```json
{
  "npt_events": [
    {
      "event_id": "NPT-001",
      "date": "2018-03-28",
      "type": "Lost circulation",
      "depth_md": 2850,
      "duration_hours": 24,
      "cost_usd": 180000,
      "description": "Total losses in fractured limestone - 450 bbls lost",
      "remediation": "LCM pill + cement squeeze - regained circulation",
      "lesson_learned": "Reduce ECD by 0.5 ppg when entering fractured zones"
    },
    {
      "event_id": "NPT-002",
      "date": "2018-04-05",
      "type": "Stuck pipe",
      "depth_md": 8200,
      "duration_hours": 18,
      "cost_usd": 135000,
      "description": "Differential sticking in depleted sand - 300,000 lbs overpull",
      "remediation": "Spotting fluid + jar + back-off - freed pipe",
      "lesson_learned": "Minimize static time in permeable zones - maintain rotation"
    }
  ]
}
```

---

## SECTION 3: Completion Data (Target: 90%)

### Completion Architecture
```json
{
  "completion_type": "REQUIRED - Openhole / Cased-hole / Liner / Gravel pack / Frac pack",
  "completion_date": "REQUIRED - 2018-05-12",
  "completion_fluid": "9.5 ppg CaCl2 brine",

  "tubing": {
    "tubing_size": "REQUIRED - 4.5 inches",
    "tubing_weight": "12.75 lb/ft",
    "tubing_grade": "L-80 13Cr",
    "tubing_connection": "Premium - VAM 21",
    "tubing_depth_md": 10200,
    "tubing_depth_tvd": 8150,
    "tubing_pressure_rating": 10000
  },

  "production_packer": {
    "packer_type": "REQUIRED - Retrievable / Permanent",
    "packer_manufacturer": "Baker Hughes",
    "packer_model": "ZXP-HP",
    "packer_depth_md": "CRITICAL - 10150",
    "packer_depth_tvd": 8100,
    "packer_set_date": "2018-05-10",
    "packer_setting_method": "Hydraulic",
    "packer_rating": "10,000 psi / 350°F"
  },

  "safety_systems": {
    "scssv": {
      "type": "CRITICAL - Wireline retrievable / Tubing retrievable",
      "manufacturer": "Halliburton",
      "model": "Camco SSD",
      "depth_md": "CRITICAL - 8500",
      "depth_tvd": "CRITICAL - 7200",
      "control_system": "Hydraulic surface controlled",
      "test_date": "CRITICAL - 2018-05-11",
      "test_pressure": 5000,
      "test_result": "PASS",
      "test_cycles": 200
    },
    "surface_safety_valve": {
      "type": "Pneumatic actuated",
      "size": "2 1/16 inches",
      "pressure_rating": 10000,
      "test_date": "2018-05-12"
    }
  },

  "perforations": [
    {
      "zone_name": "Upper Brent",
      "top_depth_md": 9100,
      "bottom_depth_md": 9280,
      "shot_density": "4 shots per foot",
      "phasing": "60 degree",
      "gun_type": "Tubing conveyed",
      "charge_type": "Deep penetrating - DP43",
      "date_perforated": "2018-05-08",
      "perforation_fluid": "9.5 ppg brine - underbalanced",
      "immediate_flow": "450 bopd + 20% water"
    }
  ],

  "sand_control": {
    "method": "Gravel pack / Frac pack / None / Screens",
    "screen_type": "Premium mesh 150 micron",
    "screen_manufacturer": "Weatherford",
    "gravel_size": "20/40 mesh",
    "gravel_volume": "45 sacks",
    "pack_quality": "Good - alpha wave confirmed"
  },

  "artificial_lift": {
    "system_type": "ESP / Gas lift / Beam pump / PCP / None",
    "installation_date": "2018-06-15",
    "equipment_details": {
      "esp_manufacturer": "Schlumberger",
      "esp_stages": 185,
      "esp_hp": 150,
      "esp_setting_depth": 7500,
      "esp_design_rate": 3500,
      "esp_design_head": 4200
    }
  }
}
```

### Christmas Tree Configuration
```json
{
  "christmas_tree": {
    "manufacturer": "REQUIRED - Cameron / FMC / Aker / Dril-Quip",
    "model": "FC Gate 10M",
    "pressure_rating": "REQUIRED - 10000 psi",
    "temperature_rating": "REQUIRED - 250°F",
    "material": "Duplex stainless steel",
    "installation_date": "REQUIRED - 2018-05-15",
    "last_pressure_test": "2024-01-15",

    "components": [
      {
        "component_id": "LMV-001",
        "component_type": "Lower Master Valve",
        "size": "2 1/16 inches",
        "serial_number": "LMV-2018-4521",
        "manufacturer": "Cameron",
        "install_date": "2018-05-15",
        "last_service": "2023-03-10",
        "status": "Good",
        "valve_type": "Gate valve - manual"
      },
      {
        "component_id": "UMV-001",
        "component_type": "Upper Master Valve (SSV)",
        "size": "2 1/16 inches",
        "serial_number": "UMV-2018-4522",
        "manufacturer": "Cameron",
        "install_date": "2018-05-15",
        "last_service": "2023-03-10",
        "status": "Good",
        "valve_type": "Gate valve - manual with actuator option"
      }
    ],

    "annulus_configuration": {
      "a_annulus_fluid": "Inhibited water - 9.5 ppg",
      "a_annulus_pressure": 450,
      "a_annulus_monitor": "Continuous gauge",
      "b_annulus_fluid": "Completion brine - 10.2 ppg",
      "b_annulus_pressure": 1200,
      "maasp": "CRITICAL - Maximum Allowable Annulus Surface Pressure",
      "maasp_value": 3250,
      "maasp_limiting_factor": "Casing burst - C1 annulus"
    }
  }
}
```

---

## SECTION 4: Production History (Target: 95%)

### Production Performance
```json
{
  "production_data": [
    {
      "date": "2024-01-01",
      "oil_rate_bopd": 1250,
      "gas_rate_mcfd": 1050,
      "water_rate_bwpd": 340,
      "water_cut_percent": 21.4,
      "gor": 840,
      "tubing_pressure": 2850,
      "casing_pressure": 3100,
      "choke_size": "32/64 inches",
      "runtime_hours": 24,
      "uptime_percent": 100
    }
  ],

  "production_milestones": [
    {
      "date": "2018-06-01",
      "event": "First production",
      "oil_rate": 3200,
      "gas_rate": 2720,
      "water_rate": 180,
      "notes": "Initial cleanup - high gas rate"
    },
    {
      "date": "2020-03-15",
      "event": "Peak production",
      "oil_rate": 4150,
      "gas_rate": 3525,
      "water_rate": 420,
      "notes": "Post acid stimulation"
    }
  ],

  "cumulative_production": {
    "oil_bbls": 2450000,
    "gas_mcf": 2082500,
    "water_bbls": 650000,
    "start_date": "2018-06-01",
    "end_date": "2024-12-31"
  },

  "decline_analysis": {
    "decline_type": "Exponential / Hyperbolic / Harmonic",
    "initial_rate": 3200,
    "decline_rate_annual": 0.25,
    "b_factor": 0.8,
    "economic_limit": 150,
    "estimated_eur": 3500000
  }
}
```

### Production Issues & Shutdowns
```json
{
  "production_issues": [
    {
      "issue_id": "PROD-2019-003",
      "start_date": "2019-08-15",
      "end_date": "2019-08-18",
      "duration_hours": 72,
      "issue_type": "Scale buildup",
      "description": "CaSO4 scale restricting flow - pressure buildup observed",
      "impact_oil_loss_bbls": 9000,
      "impact_revenue_loss_usd": 540000,
      "resolution": "Scale inhibitor squeeze - restored 85% productivity",
      "lesson_learned": "Increase scale inhibitor concentration - monthly monitoring"
    }
  ]
}
```

---

## SECTION 5: Intervention History (Target: 85% - CRITICAL)

**This is the MOST IMPORTANT section for AI training and NPT reduction**

### Intervention Records
```json
{
  "interventions": [
    {
      "report_id": "REQUIRED - INT-2023-045",
      "intervention_date": "REQUIRED - 2023-06-15",
      "intervention_type": "REQUIRED - Workover / Wireline / Coiled tubing / Stimulation / P&A",
      "primary_objective": "REQUIRED - Scale removal and SCSSV replacement",
      "secondary_objectives": ["Pressure survey", "Production logging"],

      "pre_intervention_status": {
        "oil_rate": 650,
        "water_rate": 890,
        "water_cut": 58,
        "tubing_pressure": 1850,
        "casing_pressure": 2100,
        "issue_description": "Declining production + SCSSV failed function test"
      },

      "execution_summary": {
        "start_date": "2023-06-15T06:00:00Z",
        "end_date": "2023-06-22T18:00:00Z",
        "total_duration_hours": 180,
        "npt_hours": "CRITICAL - 24",
        "productive_hours": 156,
        "rig_type": "Workover rig - 150T capacity",
        "contractor": "Superior Energy Services",
        "weather_delays_hours": 12
      },

      "activities_performed": [
        {
          "activity": "Pull tubing",
          "start_time": "2023-06-15T08:00:00Z",
          "end_time": "2023-06-16T14:00:00Z",
          "duration_hours": 30,
          "npt_hours": 0,
          "notes": "No issues"
        },
        {
          "activity": "Replace SCSSV",
          "start_time": "2023-06-17T06:00:00Z",
          "end_time": "2023-06-17T18:00:00Z",
          "duration_hours": 12,
          "npt_hours": 8,
          "notes": "Packer seal failed - replaced seals",
          "equipment_installed": {
            "type": "SCSSV",
            "manufacturer": "Halliburton",
            "model": "Camco SSD-HP",
            "serial_number": "SSD-2023-8821",
            "depth_md": 8500
          }
        },
        {
          "activity": "Scale removal - coiled tubing",
          "start_time": "2023-06-18T06:00:00Z",
          "end_time": "2023-06-19T22:00:00Z",
          "duration_hours": 40,
          "npt_hours": 16,
          "notes": "Coil parted at 7,200 ft - fishing operations required",
          "chemicals_used": [
            {
              "chemical": "EDTA - 15% solution",
              "volume_gallons": 850,
              "contact_time_hours": 4
            }
          ]
        }
      ],

      "costs": {
        "rig_cost_usd": "CRITICAL - 450000",
        "services_cost_usd": 185000,
        "materials_cost_usd": 95000,
        "total_cost_usd": "CRITICAL - 730000",
        "deferred_production_bbls": 1260,
        "deferred_production_value_usd": 75600,
        "total_intervention_cost_usd": 805600
      },

      "npt_breakdown": [
        {
          "npt_event": "Packer seal failure",
          "duration_hours": 8,
          "cost_impact_usd": 20000,
          "root_cause": "Seal age - 5 years old, recommended 3 year replacement",
          "preventable": true
        },
        {
          "npt_event": "Coiled tubing parted",
          "duration_hours": 16,
          "cost_impact_usd": 40000,
          "root_cause": "Fatigue failure - coil had 85 runs vs 60 run limit",
          "preventable": true
        }
      },

      "post_intervention_results": {
        "oil_rate": 1450,
        "water_rate": 680,
        "water_cut": 31.9,
        "tubing_pressure": 2650,
        "casing_pressure": 2900,
        "productivity_increase_percent": 123,
        "estimated_incremental_production_bbls": 95000,
        "roi_months": 10.2,
        "success_rating": "Successful - objectives met"
      },

      "lessons_learned": "CRITICAL - Free text field for AI learning",
      "lessons_learned_structured": [
        {
          "category": "Equipment selection",
          "lesson": "Replace packer seals every 3 years regardless of condition",
          "recommendation": "Add to preventive maintenance schedule",
          "applicable_to": "All wells with retrievable packers"
        },
        {
          "category": "Coiled tubing operations",
          "lesson": "Enforce 60-run limit on coiled tubing - no exceptions",
          "recommendation": "Implement run counter on all CT units",
          "applicable_to": "All CT operations"
        },
        {
          "category": "Scale management",
          "lesson": "EDTA effective for CaSO4 - 4 hr soak time optimal",
          "recommendation": "Use EDTA first before mechanical methods",
          "applicable_to": "All scale removal jobs"
        }
      ],

      "outcome": "REQUIRED - Success / Partial success / Failure",
      "would_recommend_approach": "REQUIRED - Yes / No / With modifications",
      "modifications_for_next_time": "Use higher grade coil, replace seals proactively"
    }
  ]
}
```

---

## SECTION 6: Equipment History (Target: 85% - CRITICAL)

### Equipment Tracking
```json
{
  "downhole_equipment": [
    {
      "equipment_id": "ESP-2023-001",
      "equipment_type": "Electric Submersible Pump",
      "manufacturer": "Schlumberger",
      "model": "REDA Maximus",
      "serial_number": "ESP-45821-2023",
      "install_date": "2023-09-15",
      "install_depth_md": 7500,
      "removal_date": null,
      "current_status": "In service",
      "design_life_years": 3,
      "actual_runtime_hours": 8760,
      "failure_date": null,
      "failure_mode": null,
      "maintenance_history": [
        {
          "date": "2024-03-15",
          "type": "Preventive maintenance",
          "description": "Variable speed drive calibration",
          "cost_usd": 5000
        }
      ],
      "performance_data": {
        "design_flow_rate": 3500,
        "actual_flow_rate": 3200,
        "design_head": 4200,
        "actual_head": 4050,
        "efficiency_percent": 68,
        "vibration_level": "Normal",
        "temperature": "185°F - normal"
      }
    },
    {
      "equipment_id": "SCSSV-2018-001",
      "equipment_type": "Surface Controlled Subsurface Safety Valve",
      "manufacturer": "Halliburton",
      "model": "Camco SSD",
      "serial_number": "SSD-2018-4455",
      "install_date": "2018-05-10",
      "install_depth_md": 8500,
      "removal_date": "2023-06-17",
      "removal_reason": "Failed function test",
      "current_status": "Removed",
      "design_life_years": 5,
      "actual_runtime_hours": 43800,
      "failure_date": "2023-05-20",
      "failure_mode": "Control line leak - valve would not close",
      "failure_investigation": {
        "root_cause": "Control line corrosion at 2,500 ft depth",
        "contributing_factors": ["CO2 content", "Control line material not corrosion resistant"],
        "recommendation": "Upgrade to Inconel control lines for all H2S/CO2 wells"
      },
      "function_tests": [
        {
          "test_date": "2023-01-15",
          "test_result": "PASS",
          "close_time_seconds": 8,
          "cycles": 10
        },
        {
          "test_date": "2023-05-20",
          "test_result": "FAIL",
          "close_time_seconds": null,
          "failure_notes": "Valve did not close - control line leak suspected"
        }
      ]
    }
  ]
}
```

---

## SECTION 7: Integrity Data (Target: 95%)

### Well Integrity Monitoring
```json
{
  "integrity_tests": [
    {
      "test_id": "AIT-2024-001",
      "test_date": "2024-01-15",
      "test_type": "Annulus Integrity Test",
      "annulus_tested": "A-annulus (tubing-casing)",
      "test_pressure": 1500,
      "stabilization_time_minutes": 30,
      "pressure_drop": 0,
      "result": "PASS - No leaks detected",
      "next_test_date": "2025-01-15"
    },
    {
      "test_id": "CBL-2018-001",
      "test_date": "2018-04-20",
      "test_type": "Cement Bond Log",
      "casing_string": "Production casing - 9 5/8 inch",
      "depth_interval_top": 0,
      "depth_interval_bottom": 12850,
      "bond_quality_average": 85,
      "poor_bond_intervals": [
        {
          "top_depth": 3200,
          "bottom_depth": 3350,
          "bond_quality": 45,
          "recommendation": "Monitor - not critical zone"
        }
      ]
    }
  ],

  "corrosion_monitoring": [
    {
      "inspection_date": "2024-06-15",
      "inspection_type": "Corrosion coupon retrieval",
      "location": "Tubing at 5,000 ft",
      "corrosion_rate": "0.8 mils/year",
      "remaining_life_years": 18,
      "corrosion_type": "Uniform / Pitting / Crevice / SCC",
      "mitigation": "Corrosion inhibitor effective - continue treatment"
    }
  ],

  "pressure_surveys": [
    {
      "survey_date": "2024-03-10",
      "survey_type": "Static bottom hole pressure",
      "gauge_type": "Memory gauge",
      "gauge_depth_md": 10200,
      "recorded_pressure": 4250,
      "recorded_temperature": 245,
      "reservoir_pressure_calculated": 4180,
      "depletion_from_initial": 920
    }
  ]
}
```

---

## SECTION 8: Cost & Economics (Target: 80%)

### Financial Data
```json
{
  "drilling_costs": {
    "afe_number": "AFE-2018-0045",
    "total_afe": 12500000,
    "actual_drilling_cost": 11850000,
    "variance_percent": -5.2,
    "cost_breakdown": {
      "rig_cost": 5200000,
      "drilling_services": 3100000,
      "casing_tubing": 2400000,
      "cement_services": 450000,
      "mud_fluids": 700000
    }
  },

  "intervention_costs": [
    {
      "year": 2023,
      "total_opex": 950000,
      "major_interventions": 730000,
      "routine_maintenance": 120000,
      "chemical_treatments": 100000
    }
  ],

  "operating_costs": {
    "daily_opex": 2500,
    "annual_opex": 912500,
    "cost_breakdown": {
      "personnel": 150000,
      "chemicals": 180000,
      "utilities_power": 85000,
      "artificial_lift": 250000,
      "integrity_monitoring": 75000,
      "regulatory_fees": 50000,
      "other": 122500
    }
  },

  "economic_metrics": {
    "oil_price_assumption": 75,
    "gas_price_assumption": 3.5,
    "operating_netback": 52,
    "cumulative_revenue": 183750000,
    "cumulative_opex": 6387500,
    "cumulative_capex": 13800000,
    "npv10": 45200000,
    "irr_percent": 28.5,
    "payout_months": 18
  }
}
```

---

## SECTION 9: HSE & Regulatory (Target: 90%)

### Health, Safety, Environment
```json
{
  "hse_incidents": [
    {
      "incident_id": "HSE-2022-008",
      "date": "2022-08-15",
      "severity": "Near miss / First aid / Lost time / Fatality",
      "category": "Dropped object",
      "description": "1/2 inch wrench dropped from 15 ft - no impact",
      "corrective_actions": "Toolbox talk on dropped objects - implement tool tethering",
      "regulatory_notification": false
    }
  ],

  "environmental_monitoring": {
    "emissions_tracking": {
      "methane_emissions_mcf_year": 450,
      "co2_emissions_tons_year": 850,
      "flaring_mcf_year": 120,
      "venting_mcf_year": 25
    },
    "spills": [],
    "environmental_compliance": "Full compliance - no violations"
  },

  "regulatory_inspections": [
    {
      "inspection_date": "2024-02-20",
      "inspector": "State Oil & Gas Commission",
      "inspection_type": "Routine annual inspection",
      "findings": "No deficiencies noted",
      "follow_up_required": false
    }
  ]
}
```

---

## Data Formats & Standards

### Required Data Formats

| Data Type | Format | Example |
|-----------|--------|---------|
| **Dates** | ISO 8601 | `2024-01-15T14:30:00Z` |
| **Depths** | Consistent units (ft or m) | `10250 ft MD` |
| **Pressures** | PSI or bar | `4250 psi` |
| **Temperatures** | °F or °C | `245°F` |
| **Rates** | bopd, mcfd, bwpd | `1250 bopd` |
| **Costs** | USD (specify currency) | `$730,000 USD` |
| **Coordinates** | Decimal degrees | `28.5234, -90.1234` |

### Depth Reference Standards
- **MD** (Measured Depth) - Always from **KB** (Kelly Bushing)
- **TVD** (True Vertical Depth) - From **KB** or **MSL** (specify)
- All depths must specify reference: `10,250 ft MD KB` or `8,150 ft TVD MSL`

### Quality Assurance Flags
```json
{
  "data_quality": {
    "source": "Original operator records / Estimated / Calculated / Third-party",
    "confidence": "High / Medium / Low",
    "verification_status": "Verified / Unverified / Needs review",
    "last_updated": "2024-01-15",
    "updated_by": "J. Smith - Data Manager"
  }
}
```

---

## Data Upload Checklist for Clients

### Tier 1: Critical - Must Have (Blocks AI Planning)
- [ ] Well header (ID, name, location, operator)
- [ ] Well status (active, shut-in, P&A)
- [ ] Completion architecture (tubing, packer depths)
- [ ] **SCSSV depth and last test date** ⚠️ SAFETY CRITICAL
- [ ] Christmas tree rating
- [ ] Current production rates (if producing)

### Tier 2: High Priority - AI Model Training
- [ ] Intervention history with NPT hours and costs
- [ ] Equipment failure history and root causes
- [ ] Lessons learned from past interventions
- [ ] Cost data (drilling, interventions, opex)
- [ ] Production history (rates, decline)

### Tier 3: Recommended - Enhanced Analytics
- [ ] Drilling history and NPT events
- [ ] Geological/reservoir data
- [ ] Integrity test results
- [ ] Pressure surveys
- [ ] Corrosion monitoring data

### Tier 4: Optional - Portfolio Optimization
- [ ] Economic data (NPV, IRR, netbacks)
- [ ] HSE incident history
- [ ] Regulatory compliance records
- [ ] Emissions tracking

---

## ROI by Data Completeness Level

| Completeness Level | Features Unlocked | Expected NPT Reduction | ROI Multiple |
|-------------------|-------------------|----------------------|--------------|
| **50%** | Basic planning | 5-10% | 1.5x |
| **70%** | Risk assessment | 15-20% | 3x |
| **85%** | AI predictions | 25-30% | 5-7x |
| **95%** | Full optimization | 30-35% | 8-10x |

---

## Data Privacy & Security

### Anonymization Options
Clients can anonymize:
- Well names → Generic IDs (Well-001, Well-002)
- Operator names → Generic operators (Operator-A, Operator-B)
- Personnel names → Roles only (Night Supervisor, HSSE Advisor)
- Exact locations → Approximate coordinates (±1 km)
- Financial data → Indexed values (actual costs not revealed)

### Data Retention
- **Source data**: Stored encrypted, access-controlled
- **AI training data**: Anonymized, aggregated across portfolio
- **Deletion policy**: Client can request full data deletion at any time

---

## Next Steps for Implementation

1. **Review this template** with your team
2. **Identify data sources** (EDM systems, databases, paper records)
3. **Assess current completeness** by category
4. **Prioritize gaps** using Tier 1-4 framework
5. **Start data remediation** targeting 85%+ in critical categories
6. **Validate with WellTegra** team for data quality
7. **Import & test** on pilot wells
8. **Measure results** - track NPT reduction and cost savings

---

## Contact & Support

For questions about data requirements or upload assistance:
- **Email**: data@welltegra.network
- **Documentation**: https://docs.welltegra.network/data-requirements
- **Template Downloads**: JSON, CSV, Excel formats available

---

**Document Version**: 1.0
**Last Updated**: 2025-01-15
**Next Review**: 2025-07-15
