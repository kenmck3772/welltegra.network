import streamlit as st
import pandas as pd
import numpy as np
import lasio
import pdfplumber
import dlisio
import segyio
import requests
import folium
from streamlit_folium import st_folium
from PIL import Image, ImageOps
import matplotlib.pyplot as plt
from io import StringIO
import tempfile
import os
import datetime

# --- PAGE CONFIGURATION ---
st.set_page_config(layout="wide", page_title="Brahan Scavenger Engine")

# --- CUSTOM CSS (FORENSIC DARK MODE) ---
st.markdown("""
    <style>
    .stApp { background-color: #0e1117; color: #ffffff; }
    .stTabs [data-baseweb="tab-list"] { gap: 10px; }
    .stTabs [data-baseweb="tab"] { height: 50px; white-space: pre-wrap; background-color: #1e2130; border-radius: 4px; color: white; border: 1px solid #30334e; }
    .stTabs [aria-selected="true"] { background-color: #ff4b4b; border-color: #ff4b4b; }
    div[data-testid="stMetricValue"] { font-size: 1.2rem; }
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR: CONTROLS & LOGIC ---
st.sidebar.title("🛡️ BRAHAN SYSTEM")
st.sidebar.success("STATUS: HUNTING INTEGRITY FRAUD")

# 1. Region Selector
region = st.sidebar.selectbox("Geographic Datum Shift", 
    ["North Sea (+15.7 ft)", "Australia (+12.2 ft)", "Malaysia (+8.5 ft)", "GOM (+28.2 ft)", "Custom"])
shifts = {"North Sea (+15.7 ft)": 15.7, "Australia (+12.2 ft)": 12.2, "Malaysia (+8.5 ft)": 8.5, "GOM (+28.2 ft)": 28.2, "Custom": 0.0}
shift_val = shifts[region] if region != "Custom" else st.sidebar.number_input("Custom Shift", value=0.0)
st.sidebar.markdown(f"**Active Shift:** +{shift_val} ft")

st.sidebar.markdown("---")

# 2. Scavenger Thresholds
with st.sidebar.expander("⚙️ Forensic Sensitivities", expanded=True):
    pef_threshold = st.slider("Chrome PeF Threshold", 2.0, 5.0, 3.0, help="Below 3.0 = Carbon Steel")
    weld_sensitivity = st.slider("Weld Spike Sensitivity", 0.05, 0.5, 0.15, help="Detects hand-welds in Caliper")

# 3. Audit Reference Guide
with st.sidebar.expander("📖 Scavenger Protocols"):
    st.markdown("""
    **1. LAS Logs:** Hunt PeF < 3.0 (Fake Chrome).
    **2. Tally:** Check for field welds/pup joints.
    **3. Reports:** Check Pressure drops (bad welds).
    **4. Logistics:** Did the boat arrive *after* the pipe was run?
    """)

# --- MAIN INTERFACE ---
st.title("🛡️ Brahan Scavenger Engine")

# --- SESSION STATE (Keeps files loaded) ---
if 'las_df' not in st.session_state: st.session_state.las_df = None

# --- TABS ---
tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
    "🧪 1. Material (PeF)", 
    "🔍 2. Weld Scout", 
    "📄 3. Reports", 
    "🚢 4. Logistics", 
    "💿 5. Integrity (DLIS)", 
    "🌍 6. Seismic/MetOcean",
    "⏳ 7. Life Cycle"
])

# ==========================================
# TERMINAL 1: MATERIAL AUDIT (LAS)
# ==========================================
with tab1:
    st.header("🧪 Material Signature Audit (PeF)")
    st.markdown("**Mission:** Verify if '13Cr' Tally matches Physics (PeF > 3.0).")
    
    f = st.file_uploader("Upload LAS File", type=["las"], key="las1")
    if f:
        try:
            bytes_data = f.read()
            try: s = bytes_data.decode("utf-8")
            except: s = bytes_data.decode("latin-1")
            l = lasio.read(StringIO(s))
            df = l.df().reset_index()
            df['CORRECTED'] = df[df.columns[0]] + shift_val
            st.session_state.las_df = df # Save to session
        except Exception as e: st.error(f"Error: {e}")

    if st.session_state.las_df is not None:
        df = st.session_state.las_df
        pef_col = next((c for c in df.columns if 'PE' in c or 'PEF' in c), None)
        
        if pef_col:
            # Smooth signal to remove 70s noise
            df['PEF_SMOOTH'] = df[pef_col].rolling(window=10, center=True).mean()
            
            fig, ax = plt.subplots(figsize=(12, 4))
            ax.plot(df['CORRECTED'], df[pef_col], color='gray', alpha=0.3, label='Raw Signal')
            ax.plot(df['CORRECTED'], df['PEF_SMOOTH'], color='#00ffd4', label='Filtered Baseline')
            ax.axhline(y=pef_threshold, color='red', linestyle='--', label=f'Chrome Threshold ({pef_threshold})')
            
            # The Red Zone (Fraud)
            fraud_mask = (df['PEF_SMOOTH'] < pef_threshold)
            ax.fill_between(df['CORRECTED'], 0, 10, where=fraud_mask, color='red', alpha=0.15, label='Suspected Carbon Steel')
            
            ax.set_ylim(0, 10)
            ax.set_ylabel("PeF")
            ax.legend(loc='upper right')
            st.pyplot(fig)
            
            fraud_pct = (fraud_mask.sum() / len(df)) * 100
            st.metric("Mismatch Probability", f"{fraud_pct:.1f}%", delta_color="inverse")
            if fraud_pct > 20: st.error("🚨 FRAUD DETECTED: Physics indicates Carbon Steel.")
        else:
            st.warning("No PeF Curve Found. Cannot verify material.")

# ==========================================
# TERMINAL 2: WELD SCOUT (CALIPER)
# ==========================================
with tab2:
    st.header("🔍 Weld Scar Scout")
    st.markdown("**Mission:** Find hand-welds (spikes) in the Caliper log.")
    
    if st.session_state.las_df is not None:
        df = st.session_state.las_df
        cal_col = next((c for c in df.columns if 'CAL' in c), None)
        
        if cal_col:
            # Calculate Gradient (Rate of Change)
            df['CAL_GRAD'] = df[cal_col].diff().abs()
            
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 6), sharex=True)
            ax1.plot(df['CORRECTED'], df[cal_col], color='white')
            ax1.set_ylabel("Caliper (in)")
            ax1.set_title("Raw Caliper")
            
            ax2.plot(df['CORRECTED'], df['CAL_GRAD'], color='orange')
            ax2.axhline(y=weld_sensitivity, color='red', linestyle=':')
            ax2.set_ylabel("Scar Gradient")
            ax2.set_title("Micro-Irregularities (Weld Scars)")
            
            st.pyplot(fig)
            
            spikes = df[df['CAL_GRAD'] > weld_sensitivity]
            if not spikes.empty:
                st.error(f"🚨 {len(spikes)} Anomalies Detected (Potential Hand-Welds).")
        else:
            st.warning("No Caliper Curve Found.")
    else:
        st.info("Upload LAS file in Tab 1 first.")

# ==========================================
# TERMINAL 3: REPORT SCANNER
# ==========================================
with tab3:
    st.header("📄 Report Scanner")
    f = st.file_uploader("Upload PDF Report", type=["pdf"])
    if f:
        with pdfplumber.open(f) as pdf:
            hits = []
            for i, p in enumerate(pdf.pages):
                txt = p.extract_text() or ""
                if "V-150" in txt: hits.append(f"Page {i+1}: 🔴 V-150 Detected")
                if "Stuck" in txt: hits.append(f"Page {i+1}: ⚠️ 'Stuck' Keyword")
                if "Pressure" in txt and "drop" in txt: hits.append(f"Page {i+1}: ⚠️ Pressure Drop (Weld Fail?)")
            
            if hits: 
                for h in hits: st.error(h)
            else: st.success("Clean Scan.")

# ==========================================
# TERMINAL 4: LOGISTICS / VESSEL SYNC
# ==========================================
with tab4:
    st.header("🚢 Logistics Sync")
    st.markdown("**Mission:** Did the pipe arrive *after* it was installed?")
    
    col1, col2 = st.columns(2)
    with col1:
        rih_date = st.date_input("Date Tubing RIH (Report)", datetime.date(1978, 5, 20))
    with col2:
        boat_date = st.date_input("Date Vessel Arrived (Manifest)", datetime.date(1978, 5, 22))
        
    if boat_date > rih_date:
        diff = (boat_date - rih_date).days
        st.error(f"🚨 LOGISTICS FRAUD: Boat arrived {diff} days LATE. They used scavenged pipe.")
    else:
        st.success("Timeline Valid.")

# ==========================================
# TERMINAL 5: INTEGRITY (DLIS)
# ==========================================
with tab5:
    st.header("💿 Binary Integrity (DLIS)")
    f = st.file_uploader("Upload DLIS", type=["dlis"])
    if f:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.dlis') as tmp:
            tmp.write(f.getvalue())
            path = tmp.name
        try:
            with dlisio.load(path) as file:
                st.success("DLIS Structure Cracked.")
                for lf in file:
                    st.info(f"Logical File: {lf.id}")
                    for frame in lf.frames:
                        chans = [c.name for c in frame.channels]
                        integrity = [c for c in chans if any(k in c for k in ["CBL", "USIT", "AMP"])]
                        if integrity: st.error(f"🚨 Integrity Curves Found: {integrity}")
        except Exception as e: st.error(f"Error: {e}")
        os.remove(path)

# ==========================================
# TERMINAL 6: SEISMIC & METOCEAN
# ==========================================
with tab6:
    st.header("🌍 Seismic & MetOcean")
    
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        st.subheader("Seismic Check (SEGY)")
        f = st.file_uploader("Upload SEGY", type=["sgy", "segy"])
        if f:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.sgy') as tmp:
                tmp.write(f.getvalue())
                path = tmp.name
            try:
                with segyio.open(path, ignore_geometry=True) as segy:
                    st.success(f"Traces: {segy.tracecount}")
                    plt.figure(figsize=(6,2))
                    plt.plot(segy.trace[0], 'k-', lw=0.5)
                    st.pyplot(plt)
            except: st.warning("Standard SEGY read failed. Header issues likely.")
            os.remove(path)
            
    with col_s2:
        st.subheader("Forensic Weather")
        lat = st.number_input("Lat", value=56.5)
        lon = st.number_input("Lon", value=2.5)
        d = st.date_input("Incident Date", datetime.date(1976, 12, 24))
        if st.button("Check Historic Weather"):
            url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={d}&end_date={d}&hourly=wave_height_max"
            try:
                r = requests.get(url).json()
                mw = max(r['hourly']['wave_height_max'])
                st.metric("Max Wave Height", f"{mw} m")
                if mw < 2.0: st.error("🚨 Suspiciously Calm.")
            except: st.error("API Error")

# ==========================================
# TERMINAL 7: LIFE CYCLE
# ==========================================
with tab7:
    st.header("⏳ Life Cycle Fatigue")
    c1, c2 = st.columns(2)
    with c1:
        years = st.slider("Years in Service", 0, 50, 45)
        welds = st.number_input("Hand-Welds Detected", 0, 20, 3)
    with c2:
        risk = (years * 1.5) + (welds * 10)
        st.metric("Failure Probability", f"{min(risk, 100):.0f}%")
        if risk > 80: st.error("CRITICAL FAILURE RISK")
