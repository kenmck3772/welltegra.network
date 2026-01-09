
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { Point3D, WellComponent, Casing, Tubing, Packer, Perforation, Well, SubseaWell, SubseaStructureType } from '../types';
import { ComponentType, WellType } from '../types';
import { IconResetView, IconStructure } from './IconComponents';

interface Wellbore3DProps {
  wells: Well[];
  wellPaths: Map<string, Point3D[]>;
  selectedWellId: string | null;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
}

const componentConfig = {
    [ComponentType.CASING]: { color: '#94a3b8', highlight: '#cbd5e1', shadow: '#475569', width: 24 },
    [ComponentType.TUBING]: { color: '#10b981', highlight: '#6ee7b7', shadow: '#047857', width: 10 },
    [ComponentType.PACKER]: { color: '#f59e0b', highlight: '#fcd34d', shadow: '#b45309', width: 22 },
    [ComponentType.PERFORATION]: { color: '#ef4444', highlight: '#fca5a5', shadow: '#7f1d1d', width: 14 },
}

export const Wellbore3D: React.FC<Wellbore3DProps> = ({ wells, wellPaths, selectedWellId, selectedComponentId, onSelectComponent }) => {
  const d3Container = useRef<SVGSVGElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const hasInitialized = useRef(false);
  
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showStructures, setShowStructures] = useState(true);
  
  const rotation = useRef({ x: -Math.PI / 4, y: Math.PI / 4 });
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const selectedWell = wells.find(w => w.id === selectedWellId);

  useEffect(() => {
    if (wells && wells.length > 0 && d3Container.current) {
      const svg3D = d3.select(d3Container.current);
      const { width, height } = d3Container.current.getBoundingClientRect();

      const allTransformedCoords: Point3D[] = [];
      wells.forEach(well => {
        const path = wellPaths.get(well.id) || [];
        path.forEach(p => {
            allTransformedCoords.push({ ...p, x: p.x + (well.surfaceX || 0), y: p.y + (well.surfaceY || 0) });
        });
        allTransformedCoords.push({ x: well.surfaceX || 0, y: well.surfaceY || 0, z: 0, md: 0 });
      });
      
      const maxTVD = d3.max(allTransformedCoords, d => d.z) || 2000;
      const extentX = d3.extent(allTransformedCoords, d => d.x) as [number, number];
      const extentY = d3.extent(allTransformedCoords, d => d.y) as [number, number];
      
      const safeExtentX = [extentX[0] ?? 0, extentX[1] ?? 0];
      const safeExtentY = [extentY[0] ?? 0, extentY[1] ?? 0];
      const rangeX = (safeExtentX[1] - safeExtentX[0]) || 1;
      const rangeY = (safeExtentY[1] - safeExtentY[0]) || 1;
      const rangeZ = maxTVD;
      const maxDim = Math.max(rangeX, rangeY, rangeZ, 2000); 
      const scale = Math.min(width, height) / maxDim * 0.8;
      
      const project = (d: Point3D) => {
          let { x, y, z } = d;
          x -= (safeExtentX[0] + rangeX/2);
          y -= (safeExtentY[0] + rangeY/2);
          z -= rangeZ/2;
          const sinX = Math.sin(rotation.current.x);
          const cosX = Math.cos(rotation.current.x);
          const sinY = Math.sin(rotation.current.y);
          const cosY = Math.cos(rotation.current.y);
          let tempY = y * cosX - z * sinX;
          let tempZ = y * sinX + z * cosX;
          let tempX = x * cosY + tempZ * sinY;
          return [tempX * scale, tempY * scale];
      };
      
      const getPointAtMd = (md: number, path: Point3D[]): Point3D | null => {
        if (!path || path.length < 1) return null;
        if (md <= path[0].md) return path[0];
        if (md >= path[path.length - 1].md) return path[path.length - 1];
        for (let i = 1; i < path.length; i++) {
            const p1 = path[i - 1];
            const p2 = path[i];
            if (md >= p1.md && md <= p2.md) {
                const fraction = (p2.md - p1.md) === 0 ? 0 : (md - p1.md) / (p2.md - p1.md);
                return { x: p1.x + (p2.x - p1.x) * fraction, y: p1.y + (p2.y - p1.y) * fraction, z: p1.z + (p2.z - p1.z) * fraction, md: md };
            }
        }
        return null; 
      };

      const getPathSegment = (startMd: number, endMd: number, fullPath: Point3D[]): Point3D[] => {
          const segment: Point3D[] = [];
          const startPt = getPointAtMd(startMd, fullPath);
          if(startPt) segment.push(startPt);
          for(const pt of fullPath) if(pt.md > startMd && pt.md < endMd) segment.push(pt);
          const endPt = getPointAtMd(endMd, fullPath);
          if(endPt) segment.push(endPt);
          return segment;
      };

      const line3D = d3.line<Point3D>().x(d => project(d)[0]).y(d => project(d)[1]);
      svg3D.selectAll("*").remove();
      
      const defs = svg3D.append('defs');
      const gradient = defs.append('linearGradient').attr('id', 'pathGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb');
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#4ade80');

      const glow = defs.append('filter').attr('id', 'glow');
      glow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
      glow.append('feMerge').selectAll('feMergeNode').data(['coloredBlur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', d => d);
      
      const g = svg3D.append('g');
      const seabedGroup = g.append('g').attr('class', 'seabed-group');
      const rulerBgGroup = g.append('g').attr('class', 'ruler-bg-group');
      const rulerGroup = g.append('g').attr('class', 'ruler-group');
      const surfaceLayer = g.append('g').attr('class', 'surface-layer');
      const wellsLayer = g.append('g').attr('class', 'wells-layer');
      const structuresLayer = g.append('g').attr('class', 'structures-layer');
      const markersLayer = g.append('g').attr('class', 'markers-layer');

      const renderVolumetricCylinder = (container: any, pathData: Point3D[], width: number, colors: any, addCaps: boolean = false, fullWellPath?: Point3D[]) => {
           if (pathData.length < 2) return;
           container.append('path').datum(pathData).attr('d', line3D).attr('fill', 'none').attr('stroke', colors.shadow).attr('stroke-width', width).attr('stroke-linejoin', 'round');
           container.append('path').datum(pathData).attr('d', line3D).attr('fill', 'none').attr('stroke', colors.main).attr('stroke-width', width * 0.85).attr('stroke-linejoin', 'round');
           container.append('path').datum(pathData).attr('d', line3D).attr('fill', 'none').attr('stroke', colors.highlight).attr('stroke-width', width * 0.2).attr('stroke-opacity', 0.5).attr('stroke-linecap', 'butt').attr('transform', 'translate(-0.5, -0.5)');
      };

      const renderChristmasTree = (parentG: any, well: Well, rootZ: number) => {
          const isSubsea = well.type === WellType.SUBSEA;
          const treeHeight = 25, width = 12;
          const color = isSubsea ? '#facc15' : '#ef4444';
          const shadow = isSubsea ? '#ca8a04' : '#991b1b';
          const transform = (p: Point3D) => ({ ...p, x: p.x + (well.surfaceX || 0), y: p.y + (well.surfaceY || 0), z: p.z });
          const stackPoints = [{ x: 0, y: 0, z: rootZ, md: 0 }, { x: 0, y: 0, z: rootZ - treeHeight, md: 0 }].map(transform);
          renderVolumetricCylinder(parentG, stackPoints, width, { main: color, shadow: shadow, highlight: '#fff' });
          const wingZ = rootZ - (treeHeight * 0.6);
          const wingPoints = [{ x: 0, y: 0, z: wingZ, md: 0 }, { x: 12, y: 0, z: wingZ, md: 0 }].map(transform);
          renderVolumetricCylinder(parentG, wingPoints, width * 0.6, { main: color, shadow: shadow, highlight: '#fff' });
      };

      function render() {
          // --- RULER ENHANCEMENT ---
          rulerBgGroup.selectAll('*').remove();
          rulerGroup.selectAll('*').remove();
          const rulerMargin = Math.max(rangeX, rangeY) * 0.12; 
          const rulerX = safeExtentX[0] - rulerMargin;
          const rulerY = safeExtentY[0] - rulerMargin;

          // Background Interval Highlight
          if (selectedWell) {
              const wellPath = wellPaths.get(selectedWell.id);
              if (wellPath) {
                  const casings = selectedWell.components.filter(c => c.type === ComponentType.CASING) as Casing[];
                  casings.forEach((casing, i) => {
                      const topPt = getPointAtMd(casing.topDepth, wellPath);
                      const botPt = getPointAtMd(casing.bottomDepth, wellPath);
                      if (topPt && botPt) {
                          const points = [{ x: rulerX + 5, y: rulerY, z: topPt.z, md: 0 }, { x: rulerX + 5, y: rulerY, z: botPt.z, md: 0 }];
                          const gradId = `grad-ruler-${casing.id}`;
                          const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
                          grad.append('stop').attr('offset', '0%').attr('stop-color', 'transparent');
                          grad.append('stop').attr('offset', '100%').attr('stop-color', componentConfig[ComponentType.CASING].color).attr('stop-opacity', 0.1 + (i * 0.05));
                          rulerBgGroup.append('path').datum(points).attr('d', line3D).attr('stroke', `url(#${gradId})`).attr('stroke-width', 40).attr('fill', 'none');
                      }
                  });
              }
          }

          // Ruler Ticks
          for (let z = 0; z <= maxTVD; z += 500) {
              const p = { x: rulerX, y: rulerY, z, md: 0 };
              const proj = project(p);
              rulerGroup.append('line').attr('x1', proj[0] - 6).attr('y1', proj[1]).attr('x2', proj[0]).attr('y2', proj[1]).attr('stroke', '#9ca3af').attr('stroke-width', 1);
              rulerGroup.append('text').attr('x', proj[0] - 10).attr('y', proj[1]).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('fill', '#6b7280').attr('font-size', '9px').text(z);
          }

          // --- WELLS & STRUCTURES ---
          wellsLayer.selectAll('*').remove();
          wells.forEach(well => {
              const group = wellsLayer.append('g').attr('opacity', well.id === selectedWellId ? 1 : 0.4);
              const path = wellPaths.get(well.id) || [];
              const transform = (p: Point3D) => ({ ...p, x: p.x + (well.surfaceX || 0), y: p.y + (well.surfaceY || 0), z: p.z });
              const transformedPath = path.map(transform);

              group.append('path').datum(transformedPath).attr('d', line3D).attr('fill', 'none').attr('stroke', well.id === selectedWellId ? 'url(#pathGradient)' : '#475569').attr('stroke-width', well.id === selectedWellId ? 2.5 : 1).style('filter', well.id === selectedWellId ? 'url(#glow)' : null);
              
              const treeZ = well.type === WellType.SUBSEA ? ((well as SubseaWell).datumElevation || 25) + (well as SubseaWell).waterDepth : 0;
              renderChristmasTree(group.append('g'), well, treeZ);

              well.components.forEach(d => {
                  const compG = group.append('g').style('cursor', 'pointer').on('click', () => onSelectComponent(d.id));
                  const config = componentConfig[d.type];
                  const isSelected = d.id === selectedComponentId && well.id === selectedWellId;
                  const baseWidth = isSelected ? config.width * 1.3 : config.width;

                  if ('bottomDepth' in d) {
                      const segment = getPathSegment(d.topDepth, (d as any).bottomDepth, path).map(transform);
                      if (segment.length > 1) renderVolumetricCylinder(compG, segment, baseWidth, { main: config.color, shadow: config.shadow, highlight: config.highlight });
                  } else if (d.type === ComponentType.PACKER) {
                      const packerCenter = d.topDepth;
                      const segment = getPathSegment(packerCenter - 8, packerCenter + 8, path).map(transform);
                      if (segment.length > 1) renderVolumetricCylinder(compG, segment, baseWidth * 1.1, { main: config.color, shadow: config.shadow, highlight: config.highlight });
                  }
              });

              // Subsea Structures
              if (showStructures && well.type === WellType.SUBSEA) {
                  const sw = well as SubseaWell;
                  if (sw.subseaStructure && sw.subseaStructure !== 'None') {
                      const structZ = (sw.datumElevation || 0) + sw.waterDepth;
                      const cx = sw.surfaceX, cy = sw.surfaceY;
                      const sG = structuresLayer.append('g').attr('class', 'struct');
                      
                      if (sw.subseaStructure === 'Template') {
                          const size = 18;
                          const boxPoints = [
                              [{x:cx-size,y:cy-size,z:structZ,md:0},{x:cx+size,y:cy-size,z:structZ,md:0},{x:cx+size,y:cy+size,z:structZ,md:0},{x:cx-size,y:cy+size,z:structZ,md:0},{x:cx-size,y:cy-size,z:structZ,md:0}],
                              [{x:cx-size,y:cy-size,z:structZ-8,md:0},{x:cx+size,y:cy-size,z:structZ-8,md:0},{x:cx+size,y:cy+size,z:structZ-8,md:0},{x:cx-size,y:cy+size,z:structZ-8,md:0},{x:cx-size,y:cy-size,z:structZ-8,md:0}]
                          ];
                          boxPoints.forEach(bp => sG.append('path').datum(bp).attr('d', line3D).attr('fill', 'none').attr('stroke', '#fbbf24').attr('stroke-width', 2));
                          [[0,0],[0,1],[1,1],[1,0]].forEach(c => {
                               const vEdge = [{x:cx+(c[0]?size:-size),y:cy+(c[1]?size:-size),z:structZ,md:0}, {x:cx+(c[0]?size:-size),y:cy+(c[1]?size:-size),z:structZ-8,md:0}];
                               sG.append('path').datum(vEdge).attr('d', line3D).attr('stroke', '#fbbf24').attr('stroke-width', 2);
                          });
                      } else if (sw.subseaStructure === 'Manifold') {
                          for(let k=0; k<4; k++) {
                               const mPt = [{x:cx-12+k*8,y:cy-10,z:structZ-4,md:0},{x:cx-12+k*8,y:cy+10,z:structZ-4,md:0}];
                               renderVolumetricCylinder(sG, mPt, 6, {main:'#475569', shadow:'#0f172a', highlight:'#94a3b8'});
                          }
                      }
                      
                      sG.style('cursor', 'help').on('mousemove', (e) => {
                          const [x, y] = d3.pointer(e, d3Container.current?.parentElement);
                          setTooltip({ visible: true, content: `<div class="font-bold text-yellow-500">${sw.subseaStructure}</div><div class="text-[10px] text-gray-400">Assoc. with ${sw.name}</div>`, x, y });
                      }).on('mouseout', () => setTooltip({visible: false, content:'', x:0, y:0}));
                  }
              }
          });
      }
      
      const updateMomentum = () => {
          const friction = 0.95;
          if (Math.abs(velocity.current.x) < 0.0001 && Math.abs(velocity.current.y) < 0.0001) return;
          velocity.current.x *= friction; velocity.current.y *= friction;
          rotation.current.x += velocity.current.x; rotation.current.y += velocity.current.y;
          rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
          render();
          rafId.current = requestAnimationFrame(updateMomentum);
      };

      const drag = d3.drag<SVGSVGElement, unknown>().on('drag', (e) => {
          rotation.current.y += e.dx * 0.01; rotation.current.x -= e.dy * 0.01;
          rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
          velocity.current = { x: -e.dy * 0.01, y: e.dx * 0.01 };
          render();
      }).on('end', () => updateMomentum());
      
      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 5]).on('zoom', (e) => {
          g.attr('transform', e.transform);
          setCurrentZoom(e.transform.k);
      });
      
      zoomBehavior.current = zoom;
      svg3D.call(drag as any).call(zoom as any);

      if (!hasInitialized.current) {
          svg3D.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
          hasInitialized.current = true;
      }
      
      d3.select(resetButton.current).on('click', () => {
        svg3D.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
        rotation.current = { x: -Math.PI/4, y: Math.PI/4 };
        render();
      });

      render();
      return () => { if (rafId.current) cancelAnimationFrame(rafId.current); }
    }
  }, [wells, wellPaths, selectedWellId, selectedComponentId, onSelectComponent, showStructures]);

  return (
    <div className="w-full h-full flex relative bg-gray-950">
      <svg ref={d3Container} className="w-full h-full outline-none block cursor-move" style={{ touchAction: 'none' }} />
      
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button ref={resetButton} className="p-2.5 bg-gray-900/80 hover:bg-cyan-500/20 rounded-xl transition-all text-gray-300 hover:text-cyan-300 border border-white/5 shadow-2xl backdrop-blur-md" title="Reset View">
              <IconResetView className="w-5 h-5" />
          </button>
          <button onClick={() => setShowStructures(p => !p)} className={`p-2.5 rounded-xl transition-all border shadow-2xl backdrop-blur-md ${showStructures ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/30' : 'bg-gray-900/80 text-gray-400 border-white/5 hover:text-cyan-300'}`} title="Subsea Structures">
              <IconStructure className="w-5 h-5" />
          </button>
      </div>

      <div className="absolute bottom-6 right-6 bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-xs space-y-4 pointer-events-none ring-1 ring-white/10">
           <div>
               <h4 className="text-gray-500 font-bold uppercase tracking-widest mb-3 text-[10px]">Visual Reference</h4>
               <div className="grid grid-cols-2 gap-3">
                   <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span><span className="text-gray-400">Target Well</span></div>
                   <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-slate-400 rounded-sm"></span><span className="text-gray-400">Casing</span></div>
                   <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span><span className="text-gray-400">Tubing</span></div>
                   <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span><span className="text-gray-400">Packer</span></div>
               </div>
           </div>
           <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-bold uppercase tracking-widest">Viewport Scale</span>
              <span className="font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">{(currentZoom * 100).toFixed(0)}%</span>
           </div>
      </div>

      {tooltip.visible && (
        <div className="absolute p-3 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl pointer-events-none z-50 text-white transform -translate-x-1/2 -translate-y-full mt-[-15px] animate-in fade-in zoom-in duration-200"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }} dangerouslySetInnerHTML={{ __html: tooltip.content }}></div>
      )}
    </div>
  );
};
