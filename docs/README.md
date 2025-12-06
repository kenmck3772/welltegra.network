# WellTegra Seed Pack — 7 Wells

Wells: w-11, w-22, w-33, w-44, w-55, w-666, w-77

This pack contains CSV and JSON templates aligned to the Well-Tegra blueprint:
- **wells_master**: definitive well identity + metadata (verification status & completeness notes)
- **well_events**: chronological, event-based history
- **casing/tubing/perforation/downhole_equipment**: components for dynamic schematics
- **anomalies**: lifecycle integrity ledger
- **sop + jsa**: Bridge Plug Retrieval example with linked hazards/controls
- **barrier_matrix_template**: declare and verify barriers per phase
- **equipment_register / chemical_register / mobilization_lift_plan**: operational planning
- **personnel_assessment_template**: competency and performance capture
- **toolstring_example**: OD/ID-sensitive components with lengths/weights

All timestamps: 2025-12-04T20:01:34Z (UTC).

## Notes
- Replace placeholder fields with values from handover packs, notifications, and historical summaries.
- Keep `Data_Verification_Status` updated: `Verified`, `Unverified`, or `Missing`.
- Use `Well_Unique_Identifier` as the join key across tables.
