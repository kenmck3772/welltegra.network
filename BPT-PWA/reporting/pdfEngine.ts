import { jsPDF } from 'jspdf';

export interface AuditData {
  uwi: string;
  projectName: string;
  sha512: string;
  offset: number;
  pulseDiagnosis: string;
  traumaLog: any[];
  timestamp: string;
}

export async function generateSovereignAudit(data: AuditData) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  
  // Background Watermark: BRAHAN SEER
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(60);
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({opacity: 0.1}));
  doc.text("BRAHAN SEER FORENSICS", 105, 150, { angle: 45, align: 'center' });
  doc.restoreGraphicsState();

  // Header Box
  doc.setFillColor(2, 6, 23); // bg-slate-950
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SOVEREIGN FORENSIC AUDIT", 105, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.text(`VERIFIED TERMINAL v2.5.0 | ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 105, 28, { align: 'center' });

  // Metadata Section
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("WELL METADATA & INTEGRITY", 20, 55);
  doc.line(20, 58, 190, 58);

  doc.setFontSize(10);
  doc.setFont("courier", "bold");
  doc.text(`WELL UWI:      ${data.uwi}`, 20, 68);
  doc.text(`PROJECT:       ${data.projectName}`, 20, 75);
  doc.text(`SHA512 HASH:   ${data.sha512.substring(0, 32)}...`, 20, 82);
  doc.text(`SYNC TIMESTAMP: ${data.timestamp}`, 20, 89);

  // Findings Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FORENSIC FINDINGS", 20, 110);
  doc.line(20, 113, 190, 113);

  // Ghost-Sync Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. GHOST-SYNC (DATUM ANALYSIS)", 25, 125);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Analyzed vertical datum shift: ${data.offset.toFixed(2)} meters.`, 30, 132);
  doc.text(data.offset !== 0 ? "DISCORDANCE IDENTIFIED: Requires correction in historical petrophysical models." : "NO DISCORDANCE DETECTED.", 30, 139);

  // Pulse Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. SAWTOOTH PULSE (ANNULUS LEAK)", 25, 155);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Status: ${data.pulseDiagnosis}`, 30, 162);

  // Trauma Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. CASING TRAUMA (ID DEVIATION)", 25, 180);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const traumaCount = data.traumaLog.length;
  doc.text(`Structural Anomaly Count: ${traumaCount} discrete events recorded in autopsy log.`, 30, 187);
  if (traumaCount > 0) {
    doc.text(`Critical Severity Point: ${data.traumaLog[0].depth.toFixed(1)}m`, 30, 194);
  }

  // Footer / Sovereign Veto
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 277, 210, 20, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(8);
  doc.text("THIS DOCUMENT CONSTITUTES A SOVEREIGN VETO OF LEGACY DATUM ASSUMPTIONS.", 105, 285, { align: 'center' });
  doc.text("CONFIDENTIAL | BRAHAN PERSONAL TERMINAL | PROPERTY OF AUTHORIZED FORENSIC ARCHITECT", 105, 290, { align: 'center' });

  doc.save(`BRAHAN_AUDIT_${data.uwi}_${Date.now()}.pdf`);
}