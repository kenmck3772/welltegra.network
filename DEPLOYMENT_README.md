# WellTegra Demo Deployment Package

## Files to Deploy

Upload these files to your GitHub repository (welltegra.network):

### Root Directory (HTML Pages)
| File | Description | Size |
|------|-------------|------|
| `demo.html` | Demo walkthrough - The Well_666 disaster story | 32KB |
| `case-studies.html` | All 7 Brahan Field wells overview | 14KB |
| `well-666.html` | Complete W-666 "The Perfect Storm" detail page | 54KB |
| `equipment.html` | Equipment catalog with clash detection | 37KB |
| `sop-library.html` | SOP Library with 7 procedures | 32KB |
| `planner.html` | **NEW** Well Operations Planner with Mobile Communicator | 42KB |

### Data Directory (`/data/`)
Create a `/data/` folder if it doesn't exist:

| File | Description | Size |
|------|-------------|------|
| `data/wells.json` | Complete data for all 7 wells | 1,385 lines |
| `data/well_666.json` | W-666 deep dive data | 850 lines |
| `data/equipment.json` | Equipment catalog (13 categories) | 17KB |
| `data/sops.json` | SOP Library (7 procedures) | 46KB |

### The 7 Wells in wells.json

| Well | Nickname | Status | Integrity | Key Issue |
|------|----------|--------|-----------|-----------|
| W-11 | "The Choker" | 🔒 Shut-in | 8% | Exotic scaling, sand screen flaw |
| W-22 | "The Ghost" | 🔒 Shut-in | 15% | 1987 legacy well, failing barriers |
| W-33 | "The Phantom" | ⚠️ Shut-in | 45% | TAPB misdiagnosis, LWIV solution |
| W-44 | "The Shifter" | 🔒 Total Loss | 0% | Geomechanical failure, casing sheared |
| W-55 | "The Sibling" | 🔒 Shut-in | 20% | Frac hit from W-56 |
| W-666 | "The Perfect Storm" | 🔒 Shut-in | 10% | Cascading human factors, FOD |
| W-77 | "The Politician" | 🔒 Shut-in | 5% | Active seabed leak, legacy liability |

---

## Navigation Update

Add this navigation to your existing `index.html` and `planner.html`:

```html
<nav class="nav">
    <a href="index.html">Home</a>
    <a href="demo.html">Demo</a>
    <a href="case-studies.html">Case Studies</a>
    <a href="equipment.html">Equipment</a>
    <a href="sop-library.html">SOPs</a>
    <a href="planner.html">Planner</a>
</nav>
```

The new pages already have this navigation built in.

---

## Demo Flow for Well Safe Solutions

Recommended walkthrough order:

1. **Start at `demo.html`**
   - Tell the Well_666 story
   - Show how $1.5M became $75M
   - Highlight the 5 intervention points Brahan Engine would have caught

2. **Click through to `well-666.html`**
   - Show the 10-pillar data model
   - Demonstrate the depth of information captured
   - Point out the Safety Gateway lock

3. **Show `sop-library.html`**
   - Open SOP_003 (Bridge Plug Retrieval)
   - Show the decision points with "LESSON FROM WELL_666" callouts
   - Demonstrate how procedures link to lessons learned

4. **Show `equipment.html`**
   - Demonstrate toolstring selection
   - Show the clash detection concept
   - Multi-select tools, see max OD calculated

5. **Show `case-studies.html`**
   - Show the other 6 wells (frameworks ready for data)
   - Demonstrate filtering by status
   - Point out Well_55 also has a Safety Lock

6. **Return to `index.html`**
   - Show the existing features (Survey tool, ROI calculator)
   - Close with pilot program CTA

---

## Key Talking Points

### The Story
"Well_666 is based on real operational patterns from 30+ years of North Sea experience. A $1.5M job became a $75M disaster because of a single tong die and a series of decisions that seemed reasonable at the time."

### The Prevention
"The Brahan Engine doesn't just store data — it enforces decision points. The crew on Well_666 was on their 14th consecutive night shift. The system would have flagged that. The LIB impression was dismissed — the system would have required expert review. The jarring exceeded safe limits — the system would have stopped the operation."

### The Value
"For every Well_666 you prevent, you're saving $50-100M. Even if you just catch the early warning signs and stop before the cascade, you're saving millions in NPT and equipment damage."

### The Data Model
"Each well has 10 pillars of information — from identity to economics. The system links everything: lessons learned surface automatically when you plan a similar operation. The crew sees what went wrong before, not after."

---

## What's Next (After Demo)

To complete the platform:

1. **Populate the other 6 wells** with real/representative data using Well_666 as template
2. **Populate equipment catalog** with actual OD/ID/length from your Tool_Eqp_drawings.xls
3. **Add more SOPs** for coiled tubing, wireline logging, well kill, etc.
4. **Connect planner.html** to draw from case studies and SOPs
5. **Toolstring Builder** - visual drag-and-drop that validates against well restrictions

---

## Technical Notes

- All pages use the same design system (CSS variables in :root)
- All data is loaded from JSON files in /data/ directory
- Pages degrade gracefully if JSON fails to load (embedded fallback)
- Navigation is consistent across all new pages
- Responsive design works on tablet/mobile

---

Generated: November 28, 2025
WellTegra · The Brahan Engine · See What Others Can't
