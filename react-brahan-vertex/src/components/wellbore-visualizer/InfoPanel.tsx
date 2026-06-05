
import React from 'react';
import type { Point3D } from '../types';

interface InfoPanelProps {
  pathCoords: Point3D[];
}

const InfoCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-black/40 backdrop-blur-sm border border-gray-700/50 p-3 rounded-lg text-center min-w-[100px]">
    <div className="text-[10px] text-cyan-200/70 uppercase tracking-wider font-semibold">{label}</div>
    <div className="text-xl font-bold text-white shadow-black drop-shadow-md">{value}</div>
    <div className="text-xs text-gray-400">{unit}</div>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ pathCoords }) => {
  if (pathCoords.length === 0) return null;

  const lastPoint = pathCoords[pathCoords.length - 1];
  const totalMD = lastPoint.md;
  const finalTVD = lastPoint.z;
  const horizontalDisplacement = Math.sqrt(lastPoint.x ** 2 + lastPoint.y ** 2);

  return (
    <div className="flex space-x-2 p-2 bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl">
        <InfoCard label="Total MD" value={totalMD.toFixed(0)} unit="ft" />
        <InfoCard label="Final TVD" value={finalTVD.toFixed(0)} unit="ft" />
        <InfoCard label="Displacement" value={horizontalDisplacement.toFixed(0)} unit="ft" />
    </div>
  );
};
