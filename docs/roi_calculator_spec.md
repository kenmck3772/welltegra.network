# ROI Calculator Spec (WellTegra)

## Inputs
- engineers (int)
- day_rate (currency/day)
- hours_admin_per_day (hours)
- wells_per_year (int)
- baseline_npt_days_per_well (days)
- npt_cost_per_day (currency/day)
- planning_hours_per_well (hours)

## Assumptions (editable)
- time reclaimed: 30–60% of hours_admin_per_day
- NPT reduction: 15–30% of baseline_npt_days_per_well
- planning compression: 30–50% of planning_hours_per_well

## Calculations
time_saved_hours = engineers * 220_workdays * hours_admin_per_day * reclaim_pct
time_saved_value = (time_saved_hours / 8) * day_rate

npt_days_saved = wells_per_year * baseline_npt_days_per_well * npt_reduction_pct
npt_value_saved = npt_days_saved * npt_cost_per_day

planning_hours_saved = wells_per_year * planning_hours_per_well * planning_reduction_pct

annual_value_low/high = time_saved_value + npt_value_saved
payback_months = implementation_cost / (annual_value / 12)

## Outputs
- savings (low / likely / high)
- time reclaimed (hours)
- NPT days avoided
- payback (months)
