# Equipment Specifications Directory

This directory contains equipment specification PDFs and documentation for the WellTegra equipment catalog.

## Structure

```
equipment-specs/
├── BHA/              # Bottom Hole Assembly specifications
├── fishing/          # Fishing tools specifications
├── completion/       # Completion equipment specifications
├── wireline/         # Wireline tools specifications
└── coiled-tubing/    # Coiled tubing equipment specifications
```

## File Naming Convention

Files should follow this naming pattern:
- `{Category}_{ToolName}_Spec_v{Version}.pdf`
- Example: `BHA_Spec_v12.pdf`, `Fishing_Spear_Internal_Spec_v03.pdf`

## Status

⚠️ **Awaiting Demo Pack Data**: Specification PDFs will be populated from the client demo data pack.

## Integration

Equipment specs are linked from:
- Equipment Catalog (`equipment-catalog-integration.html`)
- Equipment Hub in Logistics view (`index-v23-fresh.html`)
- Tool String Builder

When adding new specs:
1. Place PDF in the appropriate subdirectory
2. Update the equipment catalog JSON with the spec file path
3. Ensure the file path matches the pattern: `/equipment-specs/{category}/{filename}.pdf`
