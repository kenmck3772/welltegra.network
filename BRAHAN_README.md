# 🏛️ The Brahan Personal Terminal

**Wellbore Forensic Analysis Dashboard for North Sea Legacy Assets**

## 🎯 Purpose

A private, high-fidelity visual dashboard for veteran slickline operators to analyze:
- **Depth Ghosts**: Datum shifts between 1970s "True" depths and 1990s "Tally" depths
- **Mechanical Trauma**: Casing damage from jarring operations
- **Pressure Anomalies**: Distinguish thermal expansion from micro-annulus leaks

**This tool bypasses corporate filtered data and exposes the ground truth.**

---

## 🚀 Quick Start (3 Methods)

### Method 1: Run Locally (Recommended for Privacy)

#### Prerequisites
- Python 3.8 or higher
- Basic command line knowledge

#### Installation Steps

1. **Install Python** (if not already installed)
   - Windows: Download from [python.org](https://www.python.org/downloads/)
   - Mac: `brew install python3`
   - Linux: `sudo apt-get install python3 python3-pip`

2. **Create a project folder**
   ```bash
   mkdir brahan_terminal
   cd brahan_terminal
   ```

3. **Copy the files**
   - Place `brahan_terminal.py` in this folder
   - Place `requirements_brahan.txt` in this folder

4. **Install dependencies**
   ```bash
   pip install -r requirements_brahan.txt
   ```

5. **Run the dashboard**
   ```bash
   streamlit run brahan_terminal.py
   ```

6. **Access the dashboard**
   - Your browser will automatically open to `http://localhost:8501`
   - If not, manually navigate to that address

---

### Method 2: Run on Replit (No Installation Required)

1. Go to [replit.com](https://replit.com)
2. Create a free account
3. Click "Create Repl"
4. Select "Python" template
5. Upload `brahan_terminal.py`
6. Create a file named `requirements.txt` and paste the contents from `requirements_brahan.txt`
7. Click "Run"
8. Access your dashboard via the webview panel

**Privacy Note:** Replit is cloud-based. For sensitive proprietary data, use Method 1 (local).

---

### Method 3: Run on Google Colab (For Testing)

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Create a new notebook
3. Install dependencies:
   ```python
   !pip install streamlit pandas numpy plotly lasio scipy
   ```
4. Upload `brahan_terminal.py` to Colab
5. Run:
   ```python
   !streamlit run brahan_terminal.py & npx localtunnel --port 8501
   ```
6. Access via the generated public URL

---

## 📊 Module Descriptions

### Module 1: Ghost-Alignment Slider 👻

**Purpose:** Identify depth datum shifts between historical surveys

**Use Case:**
- You have a 1978 discovery GR log
- You have a 1994 workover GR log
- The peaks don't align - there's a systematic offset

**How to Use:**
1. Upload both LAS files (or use Thistle A7 demo)
2. Use the slider to shift the comparison log vertically
3. Watch the correlation metric - aim for >0.95
4. When peaks align, note the offset value
5. Export the alignment report

**Real-World Example:**
- **Thistle Alpha Slot 7**: 2.1m offset discovered
- **Critical for:** Perforating, plug setting, fishing operations
- **Consequence of error:** Perforating wrong zone = $5M+ loss

---

### Module 2: Trauma Node 3D Renderer 🔧

**Purpose:** Visualize mechanical damage in production casing

**Use Case:**
- You spent 3 months jarring on a stuck tool
- You suspect casing damage at the jarring point
- You have multi-finger caliper (MFC) or USIT data

**How to Use:**
1. Upload caliper data (CSV or LAS format)
2. Enter nominal casing ID (e.g., 7.000")
3. View 3D cylindrical plot - red zones indicate >2% deviation
4. Pin operational memories to trauma zones
5. Generate integrity report

**Real-World Example:**
- **Thistle A7, Depth 3147.3m**: Camco C-Lock tong die
- **Result**: 4.7% ovalization + work hardening
- **Impact**: Permanent restriction, affects future interventions

---

### Module 3: Sawtooth Pulse Analyzer 📈

**Purpose:** Diagnose B-annulus pressure anomalies

**Use Case:**
- Your B-annulus pressure is building
- After bleeding, it recharges
- You need to know: Is this thermal? Or a leak?

**How to Use:**
1. Upload time-series pressure data (CSV)
2. Select a recharge cycle after a bleed event
3. View linear regression analysis
4. Interpret R² value:
   - **R² > 0.98**: Linear recharge = **LEAK** (requires action)
   - **R² < 0.95**: Curved recharge = Thermal (benign)

**Physical Basis:**
- **Leak**: Constant pressure gradient → linear influx → straight line
- **Thermal**: Temperature cycling → curved expansion/contraction

**Regulatory Importance:**
- Linear sawtooth = compromised zonal isolation
- May trigger mandatory reporting (NSTA/DEA requirements)
- Informs cement squeeze planning

---

## 📁 Data Format Requirements

### LAS Files (Module 1)
Standard LAS 2.0 format:
- Required curve: GR (Gamma Ray)
- Depth column required
- Example tools: Schlumberger GR, Baker Atlas HGNS

### Caliper Data (Module 2)
CSV or LAS format:
```csv
DEPTH,ID_AVG
3140.0,7.002
3140.5,7.005
3141.0,7.023
```

Or multi-arm calipers:
```csv
DEPTH,C1,C2,C3,C4
3140.0,7.002,7.001,7.003,7.002
```

### Pressure Data (Module 3)
CSV with datetime and pressure:
```csv
DATETIME,PRESSURE
2025-01-01 00:00:00,523.4
2025-01-01 01:00:00,525.1
2025-01-01 02:00:00,526.8
```

---

## 🛡️ Data Security & Privacy

### Local Operation (Method 1)
- **All data stays on your machine**
- No cloud upload
- No internet required after installation
- Dashboard runs on `localhost` only

### Export Controls
- All exports are local file downloads
- No automatic cloud sync
- You control where reports are saved

### Corporate Data Policy
**Important:** This tool is designed for **operator-owned proprietary data**.
- Ensure you have rights to analyze the data
- Do not upload to public cloud services without authorization
- For ultra-sensitive data: Use Method 1 (local only)

---

## 🔧 Troubleshooting

### "Module not found" error
```bash
# Ensure you're in the correct directory
cd path/to/brahan_terminal

# Reinstall dependencies
pip install -r requirements_brahan.txt --upgrade
```

### Port already in use
```bash
# Use a different port
streamlit run brahan_terminal.py --server.port 8502
```

### LAS file won't load
- Ensure LAS 2.0 format (not LAS 3.0)
- Check that GR curve exists
- Try opening in a text editor - should see ASCII headers

### Slow 3D rendering
- Reduce data point count (resample to 1m intervals)
- Close other browser tabs
- Use Chrome or Firefox (not Safari)

---

## 📖 Technical Background

### The Depth Ghost Problem

**Historical Context:**
- **1970s**: Discovery wells used driller's depth (pipe tally + kelly bushing)
- **1990s+**: Workovers often re-zeroed to wireline depth
- **Result**: Systematic offsets of 1-3m common

**Why It Matters:**
- Perforating the wrong zone can cost $5-20M
- Legal liability if producing from wrong reservoir
- Safety risk if perforating into unexpected pressure

**Solution:**
- Cross-correlate GR fingerprints between surveys
- Establish offset before depth-critical operations
- Document in well file for future reference

---

### The Mechanical Trauma Problem

**Physical Mechanism:**
1. High-energy jarring (40,000+ lbs impact force)
2. Tool shoulder impacts casing ID
3. Repeated impacts cause:
   - Ovalization (elastic → plastic deformation)
   - Work hardening (metallurgical change)
   - Permanent restriction

**Detection:**
- Multi-finger calipers measure ID at multiple radial positions
- USIT (ultrasonic) can detect wall thickness changes
- Deviations >2% indicate structural compromise

**Consequences:**
- Future wireline tools may stick at trauma zones
- ESP/tubing may not run
- Limits well intervention options

---

### The Sawtooth Leak Problem

**Diagnostic Logic:**

| Pattern | R² Value | Physical Cause | Action Required |
|---------|----------|----------------|-----------------|
| Linear | >0.98 | Constant influx through micro-annulus | Remedial cement |
| Curved | <0.95 | Thermal expansion from production | Monitor only |
| Mixed | 0.95-0.98 | Ambiguous - extend monitoring | Investigate |

**Leak Mechanism:**
- Micro-annulus = cement debonding at casing/formation interface
- Pressure gradient drives constant flow
- Linear pressure increase over time

**Thermal Mechanism:**
- Production heats wellbore
- Annulus fluid expands
- Cooling causes contraction
- Non-linear curve follows temperature

---

## 🎓 Learning Resources

### Oil & Gas Fundamentals
- [Petrowiki - Well Integrity](https://petrowiki.spe.org/Well_integrity)
- [Schlumberger Oilfield Glossary](https://glossary.oilfield.slb.com/)

### Log Interpretation
- "Log Interpretation Principles" by Schlumberger
- "Petrophysics" by Djebbar & Donaldson

### Python for Engineers
- [Python Data Science Handbook](https://jakevdp.github.io/PythonDataScienceHandbook/)
- [Plotly Documentation](https://plotly.com/python/)

---

## 🤝 Contributing & Customization

### Want to modify the dashboard?

**Easy Customizations:**
1. **Colors**: Edit the hex codes in `apply_brahan_styling()`
2. **Thresholds**: Change the 2% trauma threshold in `trauma_node_module()`
3. **Demo Data**: Modify `generate_thistle_demo_data()` for your asset

**Advanced Customizations:**
1. **Add Module 4**: Follow the pattern in existing modules
2. **Export Formats**: Modify export buttons to output JSON, Excel, etc.
3. **Database Integration**: Add SQLite backend for historical analysis

### Code Structure
```
brahan_terminal.py
├── Styling functions (line 22-58)
├── Module 1: Ghost Alignment (line 60-280)
├── Module 2: Trauma Node (line 282-520)
├── Module 3: Sawtooth Analyzer (line 522-750)
├── Main application (line 752-850)
```

---

## 📞 Support

### For Technical Issues
- Check the Troubleshooting section above
- Verify Python version: `python --version` (need 3.8+)
- Check logs in terminal where Streamlit is running

### For Domain Questions
This tool was built by an operator for operators. The domain knowledge embedded here
represents decades of North Sea experience. Use it wisely.

---

## ⚖️ Legal & Disclaimer

**Data Ownership:**
- You are responsible for ensuring you have rights to analyze the data
- This tool does not grant access to data - you must provide your own
- Respect NDAs and proprietary data agreements

**Engineering Judgement:**
- This tool aids analysis but does not replace engineering judgment
- Always verify critical findings with independent methods
- Consult with well integrity specialists before major decisions

**No Warranty:**
- Provided "as-is" for educational and analytical purposes
- Author assumes no liability for operational decisions based on this tool
- Verify all results independently before field operations

---

## 🏆 Acknowledgments

Built for the veterans of the North Sea who know that:
- **The rock doesn't lie**
- **The depth is what it is, not what the database says**
- **A tong mark at 3147.3m will still be there 30 years later**

This terminal is dedicated to the slickline operators who spent months in the North Atlantic winter,
jarring on stuck tools, and who carry the ground truth in their memories.

**"The Abyss does not filter data. Neither should we."**

---

🏛️ **Brahan Systems** | Forensic Wellbore Analysis | Version 1.0
