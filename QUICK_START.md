# 🏛️ Brahan Terminal - Quick Start Guide

## 🚀 Fastest Way to Start (3 Steps)

### Step 1: Open Your Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter

**Mac/Linux:**
- Press `Cmd + Space` (Mac) or `Ctrl + Alt + T` (Linux)
- Type `terminal` and press Enter

---

### Step 2: Navigate to the Brahan Folder

```bash
cd path/to/welltegra.network
```

Example:
```bash
cd /home/user/welltegra.network        # Linux/Mac
cd C:\Users\YourName\welltegra.network # Windows
```

---

### Step 3: Run the Launcher

**Mac/Linux:**
```bash
./START_BRAHAN.sh
```

**Windows:**
```
START_BRAHAN.bat
```

**That's it!** Your browser will automatically open to `http://localhost:8501`

---

## 📊 Testing with Sample Data

Want to test the system before using your own data?

### Generate Sample Data

```bash
python generate_sample_data.py
```

This creates:
- `sample_base_1978.las` - Discovery GR log
- `sample_comp_1994.las` - Workover GR log with 2.1m offset
- `sample_caliper_data.csv` - Casing caliper with trauma zones
- `sample_pressure_data.csv` - B-annulus pressure with leak signature

### Use in Dashboard

1. Start the dashboard (see Step 3 above)
2. Go to each module tab
3. **Uncheck** "Use Demo Data" checkbox
4. **Upload** the sample files:
   - Module 1: Upload both LAS files
   - Module 2: Upload `sample_caliper_data.csv`
   - Module 3: Upload `sample_pressure_data.csv`

---

## 🎯 Module-Specific Quick Guides

### Module 1: Ghost Alignment 👻

**Goal:** Find the depth offset between two GR logs

1. Upload base log (older survey)
2. Upload comparison log (newer survey)
3. Move the slider left/right
4. Watch the correlation value - aim for >0.95
5. When peaks align, note the offset value
6. Click "Export Alignment Report"

**What you're looking for:**
- Matching peaks between the two logs
- Correlation >0.95 = good alignment
- The offset value is what you apply to future operations

---

### Module 2: Trauma Nodes 🔧

**Goal:** Find damaged sections of casing

1. Upload caliper CSV or LAS file
2. Enter nominal casing ID (e.g., 7.000 inches)
3. View 3D plot:
   - **Green** = good casing
   - **Orange/Red** = damaged zones (>2% deviation)
4. Check the trauma zone table below the plot
5. Add operational memories to specific depths

**What you're looking for:**
- Red zones on the 3D cylinder
- Max deviation >2% = potential problem
- Correlate depths with operational history

---

### Module 3: Sawtooth Analyzer 📈

**Goal:** Determine if B-annulus pressure is from thermal effects or a leak

1. Upload pressure CSV (must have DATETIME and PRESSURE columns)
2. View full pressure history
3. Select a time window that includes a recharge cycle
4. View the regression analysis:
   - **R² > 0.98** = Linear = **LEAK** ⚠️
   - **R² < 0.95** = Curved = Thermal (OK) ✓

**What you're looking for:**
- Straight line after a bleed = leak
- Curved line = thermal expansion
- R² value tells you which it is

---

## ❓ Common Issues

### "Command not found: streamlit"

**Solution:**
```bash
pip install streamlit
```

### "No module named pandas/plotly/lasio"

**Solution:**
```bash
pip install -r requirements_brahan.txt
```

### Dashboard won't open in browser

**Manual Solution:**
1. Look at the terminal - you'll see a URL like `http://localhost:8501`
2. Copy that URL
3. Paste it into your browser manually

### Port 8501 already in use

**Solution:**
```bash
streamlit run brahan_terminal.py --server.port 8502
```

---

## 💡 Tips for Real Data

### LAS Files (Module 1)
- Need LAS 2.0 format (most common)
- Must have a GR (Gamma Ray) curve
- Depth column required
- Works with: Schlumberger, Baker, Halliburton formats

### Caliper Data (Module 2)
Format 1 - Average ID:
```csv
DEPTH,ID_AVG
3140.0,7.002
3140.5,7.005
```

Format 2 - Multi-arm:
```csv
DEPTH,C1,C2,C3,C4
3140.0,7.002,7.001,7.003,7.002
```

### Pressure Data (Module 3)
```csv
DATETIME,PRESSURE
2024-01-01 00:00:00,523.4
2024-01-01 01:00:00,525.1
```

**Important:**
- Datetime must be in format: `YYYY-MM-DD HH:MM:SS`
- Pressure in PSI
- Hourly or daily data works best

---

## 🛡️ Privacy & Security

### Your data stays private:
- ✅ Runs on your computer (localhost)
- ✅ No internet connection needed after install
- ✅ No cloud uploads
- ✅ No data leaves your machine

### Safe to use with:
- Proprietary well data
- Corporate confidential files
- NDR/SDR data
- Sensitive operational data

---

## 🎓 Understanding the Results

### Module 1: Depth Offset
- **Offset = +2.1m** means the comparison log is 2.1m deeper than recorded
- **Apply this to:** Perforating depths, plug depths, fishing depths
- **Critical:** Always verify with correlation >0.95 before using

### Module 2: Casing Damage
- **Deviation <2%** = Normal wear, acceptable
- **Deviation 2-5%** = Moderate damage, monitor
- **Deviation >5%** = Severe damage, may restrict tools

### Module 3: Pressure Diagnosis
- **Linear (R²>0.98)** = Constant influx = Leak = Needs action
- **Curved (R²<0.95)** = Thermal = Normal = Monitor only
- **Leak rate (psi/hr)** = How fast pressure builds

---

## 📞 Need Help?

1. **Check BRAHAN_README.md** - Full documentation
2. **Check terminal output** - Error messages appear there
3. **Try sample data first** - Verifies system is working
4. **Python version** - Need 3.8 or higher: `python --version`

---

## ✅ System Check

Before starting, verify:
- [ ] Python 3.8+ installed (`python --version`)
- [ ] In correct directory (`pwd` or `cd`)
- [ ] Dependencies installed (run launcher script)
- [ ] Port 8501 available (or use different port)

---

🏛️ **Ready to expose the truth in your wellbore data.**

*"The rock doesn't lie. The depth is what it is."*
