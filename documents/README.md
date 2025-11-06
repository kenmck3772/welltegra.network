# WellTegra Documents Repository

This directory contains well-specific documentation, reports, programs, and data logs referenced by the comprehensive well data system.

## Directory Structure

```
documents/
├── W666/                    # Well W666 "The Perfect Storm" - Montrose Field
│   ├── Programs/            # Work programs and procedures
│   │   ├── TRSSV_Function_Test_Procedure.md
│   │   ├── W666_Completion_Program_2019.pdf (pending)
│   │   └── DHSV_Test_Procedure_Standard.pdf (pending)
│   ├── Reports/             # Operational reports and summaries
│   │   ├── W666_Completion_Report_2019.md ✅
│   │   ├── Fishing_Operation_Report_2023-08.md ✅
│   │   ├── First_Production_Test_2019.pdf (pending)
│   │   └── PLT_Analysis_Report_2022-11.pdf (pending)
│   ├── Logs/                # Well logs (LAS format)
│   │   ├── CCL_GR_2021-06-23.las (pending)
│   │   ├── PLT_2022-11-16.las (pending)
│   │   └── MFC_2024-03-18.las (pending)
│   └── Schematics/          # Well schematics and diagrams
│       ├── W666_As_Built_Schematic_Rev3.svg (pending)
│       └── W666_Completion_Diagram.png (pending)
│
├── W777/                    # Well W777 - (structure mirrors W666)
├── W888/                    # Well W888
├── W901/                    # Well W901
├── W902/                    # Well W902
├── W903/                    # Well W903
└── W904/                    # Well W904
```

## Document Types

### Programs (Planning Documents)
- Work programs submitted to regulatory authorities
- Standard operating procedures
- Risk assessments and HAZOP studies
- Intervention plans

**Format:** Primarily MD (Markdown) or PDF
**Access:** Company confidential, regulatory distribution

### Reports (Post-Operation Documentation)
- Completion reports
- Daily drilling reports (DDR)
- Incident investigation reports
- Test and inspection reports
- Lessons learned summaries

**Format:** MD (Markdown) for demo, PDF for production
**Access:** Company confidential, may include regulatory distribution

### Logs (Downhole Data)
- Wireline logs (CCL, GR, PLT, Temperature, etc.)
- LWD/MWD data
- Production logs
- Inspection logs (caliper, video, etc.)

**Format:** LAS (Log ASCII Standard) for wireline logs, CSV for time-series data
**Access:** Technical teams only

### Schematics (Visual Diagrams)
- As-built well schematics
- Completion diagrams
- Equipment layout drawings
- Tubular tallies

**Format:** SVG (vector) or PNG/JPEG (raster)
**Access:** Engineering and operations teams

## Integration with WellTegra Application

Documents are referenced in `comprehensive-well-data.json` via the following fields:

```json
{
  "operationalHistory": {
    "events": [
      {
        "eventId": "EVT-001",
        "linkedProgram": "/documents/W666/Programs/W666_Completion_Program_2019.pdf",
        "linkedReport": "/documents/W666/Reports/W666_Completion_Report_2019.md"
      }
    ],
    "dataLogRepository": [
      {
        "logId": "LOG-001",
        "linkedFile": "/documents/W666/Logs/CCL_GR_2021-06-23.las"
      }
    ]
  }
}
```

### Display in Application
- **Planner View:** Links to programs for reference during intervention planning
- **Well Details Modal:** Historical reports accessible via timeline
- **Lessons Learned:** Reports integrated into AI recommendations

## Document Status Legend

| Status | Description |
|--------|-------------|
| ✅ **Complete** | Document created and integrated |
| 📝 **Draft** | Document in progress |
| 🔜 **Pending** | Placeholder - awaiting creation |
| 🔒 **Confidential** | Restricted access |

## Creating New Documents

### Markdown Reports (Recommended for Demo)
Use the existing reports as templates:
- `W666_Completion_Report_2019.md` - Technical report template
- `Fishing_Operation_Report_2023-08.md` - Incident report template
- `TRSSV_Function_Test_Procedure.md` - SOP template

**Benefits:**
- Easy to create and edit
- Version control friendly (Git)
- Renders beautifully in web browsers
- Can be converted to PDF if needed

### Adding PDF Documents
For production use, place PDF files in appropriate directories:
```bash
cp MyReport.pdf /documents/W666/Reports/
```

Then update `comprehensive-well-data.json` to reference the file:
```json
"linkedReport": "/documents/W666/Reports/MyReport.pdf"
```

### Well Log Files (LAS Format)
LAS files should follow the industry-standard Log ASCII Standard v2.0 format:
- Header section with well information
- Curve section defining data channels
- Data section with depth-indexed measurements

**Tools to create/edit LAS files:**
- Petrel, Techlog (commercial)
- Python libraries: `lasio`
- Text editor for simple logs

## Security & Compliance

### Classification Levels
- **Public:** General well information (location, operator)
- **Company Confidential:** Most operational data and reports
- **Restricted:** Regulatory submissions, partner data

### Regulatory Distribution
Certain documents must be shared with:
- North Sea Transition Authority (NSTA)
- Health & Safety Executive (HSE)
- Marine Scotland
- Joint venture partners

**Note:** Ensure proper approvals before external distribution.

## Maintenance

- **Review Frequency:** Quarterly
- **Document Retention:** As per company policy (minimum 25 years for well data)
- **Version Control:** Use Git for markdown files
- **Backup:** Documents included in nightly backups

## Support

**Document Queries:**
- Technical: Dr. Isla Munro (Operations Manager)
- Regulatory: Compliance Team
- Data Management: IT Service Desk

**Reporting Errors:**
If you find broken links or missing documents, please report via:
- GitHub Issues (for development)
- IT Service Desk (for production)

---

**Last Updated:** 2025-11-06
**Maintained By:** WellTegra Development Team
**Document Reference:** DOCS-README-001
