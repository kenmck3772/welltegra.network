"""
🏛️ THE BRAHAN PERSONAL TERMINAL
Wellbore Forensic Analysis Dashboard
Version: 1.0 - Thistle/Tyra Integrity Analysis

Purpose: Expose depth ghosts, mechanical trauma, and pressure anomalies
         in legacy North Sea assets using unfiltered data.

Author: Brahan Interface Architect
Target: Veteran Slickline Operators with Truth-Rights to legacy data
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import lasio
from io import StringIO
from scipy import stats
from scipy.interpolate import interp1d

# ============================================================================
# BRAHAN DARK MODE STYLING
# ============================================================================

def apply_brahan_styling():
    """Executive/Forensic Dark Mode"""
    st.markdown("""
    <style>
        .stApp {
            background-color: #0a0e1a;
            color: #e0e0e0;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 24px;
            background-color: #141824;
        }
        .stTabs [data-baseweb="tab"] {
            background-color: #1a1f2e;
            color: #e0e0e0;
            border-radius: 4px;
            padding: 10px 20px;
        }
        .stTabs [aria-selected="true"] {
            background-color: #2a3f5f;
            color: #00d4ff;
        }
        h1, h2, h3 {
            color: #00d4ff;
            font-family: 'Courier New', monospace;
        }
        .trauma-zone {
            color: #ff4444;
            font-weight: bold;
        }
        .ghost-offset {
            color: #ffaa00;
            font-weight: bold;
            font-size: 1.2em;
        }
        .integrity-flag {
            color: #44ff44;
            font-family: 'Courier New', monospace;
        }
    </style>
    """, unsafe_allow_html=True)

# ============================================================================
# MODULE 1: GHOST-ALIGNMENT SLIDER
# ============================================================================

def ghost_alignment_module():
    """
    Depth Ghost Detection: Align 1970s Discovery GR with 1990s/2000s Workover GR
    to identify datum shifts caused by tally errors or re-spudding.
    """
    st.header("👻 MODULE 1: GHOST-ALIGNMENT SLIDER")
    st.markdown("""
    **Purpose:** Identify depth datum shifts between historical surveys.

    **The Pathology:** 1970s logs used "True" driller depths. 1990s workovers
    often used "Tally" depths from wireline runs, creating systematic offsets.

    **Known Cases:**
    - Thistle A7: **+2.1m offset** (1978 → 1994)
    - Tyra SE: **+2.2m offset** (1979 → 2001)
    """)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📊 Base Log (1970s Discovery)")
        base_file = st.file_uploader("Upload Base LAS File", type=['las', 'LAS'], key='base_las')

    with col2:
        st.subheader("📊 Comparison Log (1990s+ Workover)")
        comp_file = st.file_uploader("Upload Comparison LAS File", type=['las', 'LAS'], key='comp_las')

    # Demo Mode Toggle
    use_demo = st.checkbox("🎯 Use Thistle A7 Demo Data (2.1m Ghost)", value=True)

    if use_demo or (base_file and comp_file):
        if use_demo:
            # Generate synthetic Thistle A7 data with known 2.1m offset
            base_df, comp_df = generate_thistle_demo_data()
            st.info("📍 **Demo Mode:** Thistle Alpha Slot 7 - DevonianClastic Formation")
        else:
            # Load real LAS files
            base_las = lasio.read(base_file)
            comp_las = lasio.read(comp_file)

            base_df = base_las.df().reset_index()
            comp_df = comp_las.df().reset_index()

            # Assume first column is depth, second is GR
            base_df.columns = ['DEPTH', 'GR']
            comp_df.columns = ['DEPTH', 'GR']

        # Offset Slider
        st.markdown("---")
        offset = st.slider(
            "🎚️ Vertical Offset (meters) - Slide to align GR peaks",
            min_value=-5.0,
            max_value=5.0,
            value=0.0,
            step=0.1,
            key='offset_slider'
        )

        # Apply offset to comparison log
        comp_df_shifted = comp_df.copy()
        comp_df_shifted['DEPTH'] = comp_df_shifted['DEPTH'] + offset

        # Create synchronized plot
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=("Base Log (1978 Discovery)", "Comparison Log (Shifted)"),
            shared_yaxes=True,
            horizontal_spacing=0.05
        )

        # Base log (inverted y-axis, depth increases downward)
        fig.add_trace(
            go.Scatter(
                x=base_df['GR'],
                y=base_df['DEPTH'],
                mode='lines',
                name='Base GR (1978)',
                line=dict(color='#00ff88', width=2)
            ),
            row=1, col=1
        )

        # Comparison log (shifted)
        fig.add_trace(
            go.Scatter(
                x=comp_df_shifted['GR'],
                y=comp_df_shifted['DEPTH'],
                mode='lines',
                name=f'Comp GR (Offset: {offset:+.1f}m)',
                line=dict(color='#ff8800', width=2)
            ),
            row=1, col=2
        )

        # Styling
        fig.update_xaxes(title_text="Gamma Ray (API)", row=1, col=1, gridcolor='#2a2a2a')
        fig.update_xaxes(title_text="Gamma Ray (API)", row=1, col=2, gridcolor='#2a2a2a')
        fig.update_yaxes(title_text="Depth (m)", autorange='reversed', gridcolor='#2a2a2a')

        fig.update_layout(
            height=700,
            plot_bgcolor='#0a0e1a',
            paper_bgcolor='#0a0e1a',
            font=dict(color='#e0e0e0', family='Courier New'),
            showlegend=True,
            legend=dict(bgcolor='#1a1f2e', bordercolor='#00d4ff', borderwidth=1)
        )

        st.plotly_chart(fig, use_container_width=True)

        # Cross-correlation analysis
        st.markdown("---")
        st.subheader("🔬 ALIGNMENT QUALITY METRICS")

        # Interpolate to common depth grid
        common_depths = np.linspace(
            max(base_df['DEPTH'].min(), comp_df_shifted['DEPTH'].min()),
            min(base_df['DEPTH'].max(), comp_df_shifted['DEPTH'].max()),
            500
        )

        base_interp = interp1d(base_df['DEPTH'], base_df['GR'], kind='linear', fill_value='extrapolate')
        comp_interp = interp1d(comp_df_shifted['DEPTH'], comp_df_shifted['GR'], kind='linear', fill_value='extrapolate')

        base_common = base_interp(common_depths)
        comp_common = comp_interp(common_depths)

        # Calculate correlation
        correlation = np.corrcoef(base_common, comp_common)[0, 1]

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("📍 Current Offset", f"{offset:+.2f} m")

        with col2:
            st.metric("🎯 Correlation", f"{correlation:.4f}")
            if correlation > 0.95:
                st.success("✓ Excellent alignment")
            elif correlation > 0.85:
                st.warning("~ Good alignment")
            else:
                st.error("✗ Poor alignment - adjust offset")

        with col3:
            if use_demo:
                actual_offset = 2.1
                error = abs(offset - actual_offset)
                st.metric("🎯 Error from Truth", f"{error:.2f} m")
                if error < 0.2:
                    st.success("✓ Ghost identified!")

        # Export alignment
        if st.button("💾 Export Alignment Report"):
            report = f"""
BRAHAN GHOST-ALIGNMENT REPORT
═══════════════════════════════════════
Well: {'Thistle Alpha Slot 7' if use_demo else 'User Data'}
Analysis Date: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}

DATUM SHIFT ANALYSIS
───────────────────────────────────────
Identified Offset: {offset:+.2f} meters
Correlation: {correlation:.4f}
Depth Range: {common_depths.min():.1f} - {common_depths.max():.1f} m

INTERPRETATION
───────────────────────────────────────
{'The 2.1m offset matches the known Thistle A7 depth ghost.' if use_demo and abs(offset - 2.1) < 0.2 else 'Offset identified. Verify against drilling records.'}

OPERATOR NOTES
───────────────────────────────────────
This offset should be applied to all depth-critical operations:
- Perforating (life-critical)
- Plug setting (integrity-critical)
- Fishing operations (cost-critical)

═══════════════════════════════════════
            """
            st.download_button(
                label="📥 Download Report",
                data=report,
                file_name=f"ghost_alignment_{pd.Timestamp.now().strftime('%Y%m%d')}.txt",
                mime="text/plain"
            )

def generate_thistle_demo_data():
    """Generate synthetic Thistle A7 GR logs with known 2.1m offset"""
    # Depth range: Devonian Clastic at ~3100-3200m MD
    depths_base = np.linspace(3100, 3200, 500)

    # Synthetic GR with characteristic peaks (sandstone/shale cycles)
    gr_base = 60 + 40 * np.sin(depths_base / 10) + \
              20 * np.sin(depths_base / 3) + \
              np.random.normal(0, 3, len(depths_base))

    # Add characteristic "thumbprint" peaks at specific depths
    thumbprint_depths = [3125, 3145, 3168, 3189]
    for td in thumbprint_depths:
        mask = np.abs(depths_base - td) < 2
        gr_base[mask] += 30 * np.exp(-((depths_base[mask] - td) ** 2) / 0.5)

    # Create comparison log with 2.1m offset and slight variation
    depths_comp = depths_base.copy()
    gr_comp = 60 + 40 * np.sin((depths_base - 2.1) / 10) + \
              20 * np.sin((depths_base - 2.1) / 3) + \
              np.random.normal(0, 3, len(depths_base))

    for td in thumbprint_depths:
        mask = np.abs(depths_base - (td + 2.1)) < 2
        gr_comp[mask] += 30 * np.exp(-((depths_base[mask] - (td + 2.1)) ** 2) / 0.5)

    base_df = pd.DataFrame({'DEPTH': depths_base, 'GR': gr_base})
    comp_df = pd.DataFrame({'DEPTH': depths_comp, 'GR': gr_comp})

    return base_df, comp_df

# ============================================================================
# MODULE 2: TRAUMA NODE 3D RENDERER
# ============================================================================

def trauma_node_module():
    """
    Mechanical Trauma Detection: Visualize casing deformation from jarring operations,
    tong marks, and mechanical wear.
    """
    st.header("🔧 MODULE 2: TRAUMA NODE 3D RENDERER")
    st.markdown("""
    **Purpose:** Identify mechanical damage zones in production casing.

    **The Pathology:** High-energy jarring operations (e.g., fishing stuck tools)
    can cause:
    - Casing ovalization (>2% ID change)
    - Work hardening at contact points
    - Permanent deformation at tool shoulders

    **Known Case: Thistle A7, Slot 7**
    - Depth: 3,147.3m MD
    - Cause: Camco C-Lock protruding tong die (3 months jarring)
    - Result: 4.7% ovalization + hardened zone
    """)

    caliper_file = st.file_uploader("Upload Multi-Finger Caliper (MFC) or USIT Data", type=['csv', 'las'], key='caliper')

    use_demo = st.checkbox("🎯 Use Thistle A7 Trauma Demo Data", value=True, key='trauma_demo')

    if use_demo or caliper_file:
        if use_demo:
            caliper_df = generate_trauma_demo_data()
            st.info("📍 **Demo Mode:** Thistle A7 Slot 7 - Camco C-Lock Tong Die Incident")
        else:
            # Load real caliper data
            if caliper_file.name.endswith('.las'):
                las = lasio.read(caliper_file)
                caliper_df = las.df().reset_index()
            else:
                caliper_df = pd.read_csv(caliper_file)

        # Ensure required columns
        if 'DEPTH' not in caliper_df.columns:
            caliper_df.columns = ['DEPTH'] + list(caliper_df.columns[1:])

        # Calculate ID statistics
        nominal_id = st.number_input("Nominal Casing ID (inches)", value=7.0, step=0.125)

        # Assume we have either direct ID measurements or caliper arms
        if 'ID_AVG' in caliper_df.columns:
            caliper_df['ID'] = caliper_df['ID_AVG']
        else:
            # If we have multiple caliper arms (C1, C2, C3, etc.), average them
            caliper_cols = [col for col in caliper_df.columns if col.startswith('C')]
            if caliper_cols:
                caliper_df['ID'] = caliper_df[caliper_cols].mean(axis=1)
            else:
                caliper_df['ID'] = nominal_id  # Fallback

        # Calculate deviation
        caliper_df['DEVIATION_%'] = ((caliper_df['ID'] - nominal_id) / nominal_id) * 100
        caliper_df['TRAUMA_FLAG'] = caliper_df['DEVIATION_%'].abs() > 2.0

        # 3D Casing Visualization
        st.markdown("---")
        st.subheader("🛢️ 3D CASING INTEGRITY MAP")

        fig = create_3d_casing_plot(caliper_df, nominal_id)
        st.plotly_chart(fig, use_container_width=True)

        # Trauma Zone Table
        st.markdown("---")
        st.subheader("⚠️ IDENTIFIED TRAUMA ZONES")

        trauma_zones = caliper_df[caliper_df['TRAUMA_FLAG']].copy()

        if len(trauma_zones) > 0:
            # Group consecutive trauma depths
            trauma_zones['DEPTH_DIFF'] = trauma_zones['DEPTH'].diff()
            trauma_zones['ZONE_ID'] = (trauma_zones['DEPTH_DIFF'] > 1.0).cumsum()

            zone_summary = trauma_zones.groupby('ZONE_ID').agg({
                'DEPTH': ['min', 'max', 'count'],
                'DEVIATION_%': ['min', 'max', 'mean']
            }).round(2)

            zone_summary.columns = ['Depth Start (m)', 'Depth End (m)', 'Point Count',
                                    'Min Dev (%)', 'Max Dev (%)', 'Avg Dev (%)']

            st.dataframe(
                zone_summary.style.background_gradient(subset=['Max Dev (%)'], cmap='Reds'),
                use_container_width=True
            )

            # Memory Pinning Interface
            st.markdown("---")
            st.subheader("📌 OPERATOR MEMORY PINS")
            st.markdown("*Associate operational history with trauma zones*")

            selected_zone = st.selectbox(
                "Select Trauma Zone",
                options=range(len(zone_summary)),
                format_func=lambda x: f"Zone {x+1}: {zone_summary.iloc[x]['Depth Start (m)']:.1f} - {zone_summary.iloc[x]['Depth End (m)']:.1f}m"
            )

            col1, col2 = st.columns([2, 1])

            with col1:
                memory_note = st.text_area(
                    "Operational Memory",
                    value="Slot 7: Protruding Tong Die - Shear Point. 3 months jarring with 40K lbs overpull. Tool eventually backed off at this depth.",
                    height=100,
                    key='memory_pin'
                )

            with col2:
                severity = st.select_slider(
                    "Severity",
                    options=['Minor', 'Moderate', 'Severe', 'Critical'],
                    value='Severe'
                )

                if st.button("💾 Save Memory Pin"):
                    st.success(f"✓ Memory pinned to Zone {selected_zone + 1}")

        else:
            st.success("✓ No trauma zones detected (all deviations < 2%)")

        # Statistics
        st.markdown("---")
        st.subheader("📊 CASING INTEGRITY STATISTICS")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Nominal ID", f"{nominal_id:.3f}\"")

        with col2:
            st.metric("Mean ID", f"{caliper_df['ID'].mean():.3f}\"")

        with col3:
            max_dev = caliper_df['DEVIATION_%'].abs().max()
            st.metric("Max Deviation", f"{max_dev:.2f}%")
            if max_dev > 5:
                st.error("⚠️ Critical")
            elif max_dev > 2:
                st.warning("⚠️ Caution")

        with col4:
            trauma_pct = (caliper_df['TRAUMA_FLAG'].sum() / len(caliper_df)) * 100
            st.metric("Trauma Coverage", f"{trauma_pct:.1f}%")

def create_3d_casing_plot(caliper_df, nominal_id):
    """Create 3D cylindrical plot of casing with trauma zones highlighted"""

    # Create cylindrical mesh
    theta = np.linspace(0, 2 * np.pi, 50)
    depths = caliper_df['DEPTH'].values

    # Create color map based on deviation
    colors = caliper_df['DEVIATION_%'].abs().values

    # Create mesh grid
    theta_grid, depth_grid = np.meshgrid(theta, depths)

    # Radius varies with ID measurement
    radius_grid = np.tile(caliper_df['ID'].values[:, np.newaxis], (1, len(theta)))

    # Convert to Cartesian coordinates
    x = radius_grid * np.cos(theta_grid)
    y = radius_grid * np.sin(theta_grid)
    z = depth_grid

    # Color based on deviation
    color_grid = np.tile(colors[:, np.newaxis], (1, len(theta)))

    fig = go.Figure(data=[go.Surface(
        x=x,
        y=y,
        z=z,
        surfacecolor=color_grid,
        colorscale=[
            [0, '#00ff88'],      # No deviation
            [0.5, '#ffaa00'],    # Moderate
            [1, '#ff4444']       # Severe
        ],
        cmin=0,
        cmax=5,
        colorbar=dict(
            title="Deviation (%)",
            titleside="right",
            tickmode="linear",
            tick0=0,
            dtick=1,
            bgcolor='#1a1f2e',
            bordercolor='#00d4ff',
            borderwidth=2
        ),
        hovertemplate='Depth: %{z:.1f}m<br>Deviation: %{surfacecolor:.2f}%<extra></extra>'
    )])

    # Add reference cylinder for nominal ID
    nominal_radius = np.full_like(radius_grid, nominal_id)
    x_nom = nominal_radius * np.cos(theta_grid)
    y_nom = nominal_radius * np.sin(theta_grid)

    fig.add_trace(go.Surface(
        x=x_nom,
        y=y_nom,
        z=z,
        opacity=0.1,
        showscale=False,
        colorscale=[[0, '#ffffff'], [1, '#ffffff']],
        hoverinfo='skip',
        name='Nominal ID'
    ))

    fig.update_layout(
        scene=dict(
            xaxis=dict(title='X (inches)', backgroundcolor='#0a0e1a', gridcolor='#2a2a2a'),
            yaxis=dict(title='Y (inches)', backgroundcolor='#0a0e1a', gridcolor='#2a2a2a'),
            zaxis=dict(title='Depth (m)', autorange='reversed', backgroundcolor='#0a0e1a', gridcolor='#2a2a2a'),
            bgcolor='#0a0e1a',
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=0.5)
            )
        ),
        height=700,
        paper_bgcolor='#0a0e1a',
        font=dict(color='#e0e0e0', family='Courier New'),
        title="Casing Integrity - 3D Reconstruction"
    )

    return fig

def generate_trauma_demo_data():
    """Generate synthetic caliper data with Thistle A7 trauma signature"""
    depths = np.linspace(3140, 3155, 300)

    # Nominal 7" casing with slight wear
    base_id = 7.0 + np.random.normal(0, 0.01, len(depths))

    # Add trauma zone at 3147.3m (Camco C-Lock incident)
    trauma_depth = 3147.3
    trauma_mask = np.abs(depths - trauma_depth) < 1.5

    # Severe ovalization at trauma point
    trauma_magnitude = 4.7 * np.exp(-((depths[trauma_mask] - trauma_depth) ** 2) / 0.5)
    base_id[trauma_mask] += trauma_magnitude * 0.01 * base_id[trauma_mask]

    # Add secondary wear zone at 3151m
    secondary_mask = np.abs(depths - 3151.0) < 0.8
    secondary_magnitude = 2.3 * np.exp(-((depths[secondary_mask] - 3151.0) ** 2) / 0.2)
    base_id[secondary_mask] += secondary_magnitude * 0.01 * base_id[secondary_mask]

    df = pd.DataFrame({
        'DEPTH': depths,
        'ID_AVG': base_id
    })

    return df

# ============================================================================
# MODULE 3: SAWTOOTH PULSE ANALYZER
# ============================================================================

def sawtooth_analyzer_module():
    """
    Annulus Pressure Analysis: Distinguish between thermal expansion
    and micro-annulus leaks using recharge pattern analysis.
    """
    st.header("📈 MODULE 3: SAWTOOTH PULSE ANALYZER")
    st.markdown("""
    **Purpose:** Diagnose B-annulus pressure anomalies.

    **The Pathology:** Sustained casing pressure (SCP) can originate from:
    1. **Thermal Expansion** (benign): Curved recharge, follows temperature cycles
    2. **Micro-Annulus Leak** (critical): Linear sawtooth recharge, constant influx

    **Diagnostic Criterion:**
    - Linear recharge (R² > 0.98) → **LEAK CONFIRMED**
    - Curved recharge (R² < 0.95) → Thermal effect

    **Known Case: Thistle Platform**
    - Multiple B-annulus sawtooth patterns identified (2015-2018)
    - Required remedial cement squeeze operations
    """)

    pressure_file = st.file_uploader("Upload B-Annulus Pressure Time Series (CSV)", type=['csv'], key='pressure')

    use_demo = st.checkbox("🎯 Use Demo Pressure Data (Mixed Scenarios)", value=True, key='pressure_demo')

    if use_demo or pressure_file:
        if use_demo:
            pressure_df = generate_pressure_demo_data()
            st.info("📍 **Demo Mode:** Synthetic B-Annulus Data with Leak Event at Day 40")
        else:
            pressure_df = pd.read_csv(pressure_file)
            # Ensure datetime format
            if 'DATETIME' in pressure_df.columns:
                pressure_df['DATETIME'] = pd.to_datetime(pressure_df['DATETIME'])
            else:
                pressure_df['DATETIME'] = pd.to_datetime(pressure_df.iloc[:, 0])
                pressure_df.columns = ['DATETIME', 'PRESSURE']

        # Plot full time series
        st.markdown("---")
        st.subheader("📊 B-ANNULUS PRESSURE HISTORY")

        fig_ts = go.Figure()

        fig_ts.add_trace(go.Scatter(
            x=pressure_df['DATETIME'],
            y=pressure_df['PRESSURE'],
            mode='lines',
            name='B-Annulus Pressure',
            line=dict(color='#00d4ff', width=2)
        ))

        fig_ts.update_layout(
            xaxis_title="Date",
            yaxis_title="Pressure (psi)",
            height=400,
            plot_bgcolor='#0a0e1a',
            paper_bgcolor='#0a0e1a',
            font=dict(color='#e0e0e0', family='Courier New'),
            xaxis=dict(gridcolor='#2a2a2a'),
            yaxis=dict(gridcolor='#2a2a2a')
        )

        st.plotly_chart(fig_ts, use_container_width=True)

        # Recharge Cycle Detection
        st.markdown("---")
        st.subheader("🔍 RECHARGE CYCLE ANALYSIS")

        st.markdown("**Identify bleed-down/recharge cycles for analysis**")

        col1, col2 = st.columns(2)

        with col1:
            # Let user select time window for analysis
            date_range = st.date_input(
                "Select Analysis Window",
                value=(pressure_df['DATETIME'].min(), pressure_df['DATETIME'].max()),
                key='date_range'
            )

        with col2:
            pressure_threshold = st.number_input(
                "Pressure Drop Threshold (psi)",
                value=50.0,
                help="Minimum pressure drop to identify a bleed-down event"
            )

        # Filter to selected window
        if len(date_range) == 2:
            mask = (pressure_df['DATETIME'] >= pd.Timestamp(date_range[0])) & \
                   (pressure_df['DATETIME'] <= pd.Timestamp(date_range[1]))
            analysis_df = pressure_df[mask].copy()
        else:
            analysis_df = pressure_df.copy()

        # Detect recharge cycles (simple approach: find local minima followed by recovery)
        analysis_df['PRESSURE_DIFF'] = analysis_df['PRESSURE'].diff()

        # Find bleed-down events (sharp pressure drops)
        bleed_events = analysis_df[analysis_df['PRESSURE_DIFF'] < -pressure_threshold]

        if len(bleed_events) > 0:
            st.success(f"✓ Detected {len(bleed_events)} bleed-down events")

            # Analyze first recharge cycle
            first_bleed_idx = bleed_events.index[0]

            # Find recharge period (next 30 data points or until next bleed)
            recharge_end_idx = min(first_bleed_idx + 30, len(analysis_df) - 1)
            recharge_df = analysis_df.loc[first_bleed_idx:recharge_end_idx].copy()

            # Normalize time for regression (hours since bleed)
            recharge_df['HOURS'] = (recharge_df['DATETIME'] - recharge_df['DATETIME'].iloc[0]).dt.total_seconds() / 3600

            # Linear regression on recharge
            X = recharge_df['HOURS'].values
            y = recharge_df['PRESSURE'].values

            slope, intercept, r_value, p_value, std_err = stats.linregress(X, y)
            r_squared = r_value ** 2

            # Plot recharge analysis
            fig_recharge = make_subplots(
                rows=1, cols=2,
                subplot_titles=("Recharge Curve", "Residual Analysis")
            )

            # Actual data
            fig_recharge.add_trace(
                go.Scatter(
                    x=recharge_df['HOURS'],
                    y=recharge_df['PRESSURE'],
                    mode='markers',
                    name='Measured',
                    marker=dict(color='#00d4ff', size=8)
                ),
                row=1, col=1
            )

            # Linear fit
            y_pred = slope * X + intercept
            fig_recharge.add_trace(
                go.Scatter(
                    x=recharge_df['HOURS'],
                    y=y_pred,
                    mode='lines',
                    name='Linear Fit',
                    line=dict(color='#ff4444', width=3, dash='dash')
                ),
                row=1, col=1
            )

            # Residuals
            residuals = y - y_pred
            fig_recharge.add_trace(
                go.Scatter(
                    x=recharge_df['HOURS'],
                    y=residuals,
                    mode='markers',
                    name='Residuals',
                    marker=dict(color='#ffaa00', size=6)
                ),
                row=1, col=2
            )

            # Zero line for residuals
            fig_recharge.add_hline(y=0, line_dash="solid", line_color="#44ff44", row=1, col=2)

            fig_recharge.update_xaxes(title_text="Hours Since Bleed", row=1, col=1, gridcolor='#2a2a2a')
            fig_recharge.update_xaxes(title_text="Hours Since Bleed", row=1, col=2, gridcolor='#2a2a2a')
            fig_recharge.update_yaxes(title_text="Pressure (psi)", row=1, col=1, gridcolor='#2a2a2a')
            fig_recharge.update_yaxes(title_text="Residual (psi)", row=1, col=2, gridcolor='#2a2a2a')

            fig_recharge.update_layout(
                height=400,
                plot_bgcolor='#0a0e1a',
                paper_bgcolor='#0a0e1a',
                font=dict(color='#e0e0e0', family='Courier New'),
                showlegend=True
            )

            st.plotly_chart(fig_recharge, use_container_width=True)

            # Diagnostic Output
            st.markdown("---")
            st.subheader("🩺 DIAGNOSTIC RESULT")

            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric("R² Value", f"{r_squared:.4f}")

            with col2:
                st.metric("Recharge Rate", f"{slope:.2f} psi/hr")

            with col3:
                st.metric("Std Error", f"{std_err:.3f}")

            with col4:
                st.metric("P-Value", f"{p_value:.2e}")

            # Interpretation
            st.markdown("---")

            if r_squared > 0.98:
                st.error("""
                ### ⚠️ **SAWTOOTH PATTERN DETECTED: MICRO-ANNULUS LEAK**

                **Diagnosis:** Linear recharge pattern (R² > 0.98) indicates **sustained influx**.

                **Physical Interpretation:**
                - Constant pressure gradient driving flow through micro-annulus
                - NOT thermal expansion (would show curved recovery)
                - Leak rate: {:.2f} psi/hr

                **Recommended Actions:**
                1. **Immediate:** Increase monitoring frequency
                2. **Short-term:** Quantify leak rate and assess integrity risk
                3. **Long-term:** Plan remedial cement squeeze
                4. **Regulatory:** Notify authorities per local requirements

                **Engineering Note:** This is NOT a well control issue (pressure contained in annulus),
                but indicates compromised zonal isolation.
                """.format(slope))

            elif r_squared < 0.95:
                st.success("""
                ### ✓ **THERMAL EXPANSION PATTERN**

                **Diagnosis:** Non-linear recharge (R² < 0.95) consistent with **thermal effects**.

                **Physical Interpretation:**
                - Curved recovery follows temperature cycling
                - No evidence of sustained influx
                - Typical of thermally-induced annulus pressure

                **Recommended Actions:**
                1. Continue routine monitoring
                2. Correlate with production temperature changes
                3. Document baseline behavior for future comparison

                **Status:** Normal operational behavior - no integrity concerns.
                """)
            else:
                st.warning("""
                ### ⚠️ **INTERMEDIATE PATTERN - MONITOR CLOSELY**

                **Diagnosis:** R² between 0.95-0.98 - requires further analysis.

                **Possible Causes:**
                - Early-stage leak development
                - Mixed thermal + leak contribution
                - Data quality issues

                **Recommended Actions:**
                1. Extend monitoring period (analyze multiple cycles)
                2. Check for correlations with operational changes
                3. Consider additional diagnostics (e.g., temperature logging)
                """)

        else:
            st.warning("⚠️ No significant bleed-down events detected in selected window.")
            st.info("Adjust the pressure threshold or select a different time window.")

def generate_pressure_demo_data():
    """Generate synthetic B-annulus pressure data with mixed scenarios"""
    # 60 days of hourly data
    hours = np.arange(0, 60 * 24, 1)
    dates = pd.date_range(start='2025-01-01', periods=len(hours), freq='h')

    # Baseline pressure with thermal cycling (daily)
    thermal_component = 50 * np.sin(2 * np.pi * hours / 24)

    # Initial thermal-only behavior (first 40 days)
    pressure = 500 + thermal_component + np.random.normal(0, 5, len(hours))

    # Add leak event starting at day 40
    leak_start = 40 * 24  # Hour index
    for i in range(leak_start, len(hours)):
        # Linear recharge at 2 psi/hr
        time_since_leak = (i - leak_start)
        pressure[i] += 2 * time_since_leak

    # Simulate periodic bleeds to prevent overpressure
    for day in [10, 20, 30, 45, 55]:
        bleed_hour = day * 24
        if bleed_hour < len(pressure):
            # Sudden pressure drop
            pressure[bleed_hour:] -= 100

    df = pd.DataFrame({
        'DATETIME': dates,
        'PRESSURE': pressure
    })

    # Ensure no negative pressures
    df['PRESSURE'] = df['PRESSURE'].clip(lower=0)

    return df

# ============================================================================
# MAIN APPLICATION
# ============================================================================

def main():
    st.set_page_config(
        page_title="Brahan Personal Terminal",
        page_icon="🏛️",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    apply_brahan_styling()

    # Header
    st.markdown("""
    # 🏛️ THE BRAHAN PERSONAL TERMINAL
    ### Wellbore Forensic Analysis Dashboard
    **Version 1.0** | *North Sea Legacy Asset Integrity*

    ---
    """)

    # Sidebar
    with st.sidebar:
        st.image("https://via.placeholder.com/300x100/0a0e1a/00d4ff?text=BRAHAN+SYSTEMS", use_container_width=True)
        st.markdown("""
        ### 🎯 Mission
        Expose **Truth Science** in legacy wellbore data:
        - Depth ghosts (datum shifts)
        - Mechanical trauma (casing damage)
        - Pressure anomalies (integrity failures)

        ### 📊 Target Assets
        - **Thistle Alpha** (UK North Sea)
        - **Tyra SE** (Danish North Sea)
        - Custom analysis for operator-provided data

        ### 🛡️ Data Rights
        This terminal processes **operator-owned data only**.
        No corporate filtering. No sanitized reports.
        Direct access to ground truth.

        ---

        ### 📚 Quick Start
        1. Select a module tab
        2. Upload data OR use demo mode
        3. Analyze and export results

        ### ⚙️ System Info
        - Python 3.8+
        - Streamlit Framework
        - Offline-capable
        """)

        st.markdown("---")
        st.markdown("*Built for Slickline Operators*  \n*By the Brahan Architect*")

    # Main tabs
    tab1, tab2, tab3 = st.tabs([
        "👻 Ghost Alignment",
        "🔧 Trauma Nodes",
        "📈 Sawtooth Analyzer"
    ])

    with tab1:
        ghost_alignment_module()

    with tab2:
        trauma_node_module()

    with tab3:
        sawtooth_analyzer_module()

    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; font-size: 0.8em; font-family: Courier New;'>
    🏛️ Brahan Personal Terminal v1.0 | Forensic Wellbore Analysis<br>
    "The Abyss does not filter data. Neither should we."
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
