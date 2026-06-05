import pandas as pd
import streamlit as st

def audit_tally(df):
    st.subheader("🕵️ Tally Sequence Forensic")
    
    # 1. Identify Sequence Breaks (The Scavenger's Mark)
    df['ID_Num'] = df['Joint_ID'].str.extract('(\d+)').astype(float)
    df['Gap'] = df['ID_Num'].diff()
    
    breaks = df[df['Gap'] > 1]
    
    if not breaks.empty:
        st.error(f"🚨 {len(breaks)} Sequence Breaks Detected!")
        st.warning("Non-sequential tubing indicates a mixed batch or scavenged joints.")
        st.dataframe(breaks[['Joint_ID', 'Gap']])
    else:
        st.success("✅ Sequence Integrity Verified.")

    # 2. Length Variance (The "Phantom Joint" Check)
    avg_len = df['Length'].mean()
    anomalies = df[(df['Length'] > avg_len + 2) | (df['Length'] < avg_len - 2)]
    
    if not anomalies.empty:
        st.error(f"🚨 {len(anomalies)} Length Anomalies Found.")
        st.info("Joints significantly shorter or longer than the average often hide 'Ghost Joints' used to pad the depth.")
        st.write(anomalies)

# Streamlit UI Bridge
st.title("🛡️ Brahan Tally Auditor")
uploaded_file = st.file_uploader("Upload Rig Tally (CSV/Excel)", type=["csv", "xlsx"])
if uploaded_file:
    data = pd.read_csv(uploaded_file)
    audit_tally(data)
