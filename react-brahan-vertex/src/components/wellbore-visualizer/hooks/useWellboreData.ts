
import { useState, useMemo } from 'react';
import type { WellComponent, SurveyPoint, Point3D, Well, PlatformWell, SubseaWell, Casing } from '../types';
import { ComponentType, WellType } from '../types';

const createCasing = (top: number, bot: number, size: number, notes: string): Casing => ({
    id: `casing-${Math.random().toString(36).substr(2, 9)}`,
    type: ComponentType.CASING,
    topDepth: top,
    bottomDepth: bot,
    size: size,
    weight: 0, 
    notes: notes
});

const initialWells: Well[] = [
    {
        id: '11',
        name: 'Well_11',
        type: WellType.PLATFORM,
        surfaceX: 0,
        surfaceY: 0,
        datumElevation: 25,
        deviationSurvey: [
            { md: 0, inc: 0.00, azm: 0.0, tvd: 0 },
            { md: 500, inc: 1.50, azm: 45.0, tvd: 500 },
            { md: 1000, inc: 3.50, azm: 45.0, tvd: 998 },
            { md: 2000, inc: 15.00, azm: 45.0, tvd: 1931 },
            { md: 3500, inc: 45.00, azm: 45.0, tvd: 2475 },
        ],
        components: [
            createCasing(0, 500, 20, "Surface Casing"),
            createCasing(0, 2500, 13.375, "Intermediate"),
            createCasing(0, 3500, 9.625, "Production"),
        ]
    },
    {
        id: '55',
        name: 'Satellite_55',
        type: WellType.SUBSEA,
        waterDepth: 450,
        surfaceX: 600,
        surfaceY: -600,
        datumElevation: 25,
        subseaStructure: 'Template',
        deviationSurvey: [
            { md: 0, inc: 0.00, azm: 180.0, tvd: 0 },
            { md: 1000, inc: 20.00, azm: 180.0, tvd: 940 },
            { md: 2500, inc: 60.00, azm: 180.0, tvd: 1250 },
            { md: 4000, inc: 90.00, azm: 180.0, tvd: 1250 },
        ],
        components: [
            createCasing(475, 1200, 20, "Surface"),
            createCasing(475, 4000, 13.375, "Intermediate"),
        ]
    }
];

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('wellboreConfig');
    if (saved) {
      const config = JSON.parse(saved);
      if (config && Array.isArray(config.wells)) return { wells: config.wells as Well[] };
    }
  } catch (e) {}
  return { wells: initialWells };
};

const calculatePath = (survey: SurveyPoint[]): Point3D[] => {
  if (survey.length === 0) return [];
  const path: Point3D[] = [{ x: 0, y: 0, z: 0, md: 0 }];
  for (let i = 1; i < survey.length; i++) {
    const prev = survey[i - 1];
    const curr = survey[i];
    const prevPath = path[i - 1];
    const md_diff = curr.md - prev.md;
    if (md_diff <= 0) { path.push({ ...prevPath, md: curr.md }); continue; }
    const i1_rad = prev.inc * (Math.PI / 180), i2_rad = curr.inc * (Math.PI / 180);
    const a1_rad = prev.azm * (Math.PI / 180), a2_rad = curr.azm * (Math.PI / 180);
    const beta = Math.acos(Math.cos(i2_rad - i1_rad) - (Math.sin(i1_rad) * Math.sin(i2_rad) * (1 - Math.cos(a2_rad - a1_rad))));
    const rf = beta !== 0 ? (2 / beta) * Math.tan(beta / 2) : 1;
    const dN = (md_diff / 2) * (Math.sin(i1_rad) * Math.cos(a1_rad) + Math.sin(i2_rad) * Math.cos(a2_rad)) * rf;
    const dE = (md_diff / 2) * (Math.sin(i1_rad) * Math.sin(a1_rad) + Math.sin(i2_rad) * Math.sin(a2_rad)) * rf;
    const dTVD = (md_diff / 2) * (Math.cos(i1_rad) + Math.cos(i2_rad)) * rf;
    path.push({ x: prevPath.x + dE, y: prevPath.y + dN, z: prevPath.z + dTVD, md: curr.md });
  }
  return path;
};


export const useWellboreData = () => {
  const [wells, setWells] = useState<Well[]>(getInitialState().wells);

  const wellPaths = useMemo(() => {
    const paths = new Map<string, Point3D[]>();
    wells.forEach(well => paths.set(well.id, calculatePath(well.deviationSurvey)));
    return paths;
  }, [wells]);

  const addWell = (well: Well) => setWells(prev => [...prev, well]);

  const updateWell = (wellId: string, updates: Partial<Well>) => {
      setWells(prev => prev.map(w => w.id === wellId ? { ...w, ...updates } as Well : w));
  };

  const addComponent = (wellId: string, type: string): string | null => {
    let newId: string | null = null;
    setWells(prev => prev.map(w => {
        if (w.id === wellId) {
            newId = `${type.toLowerCase()}-${Date.now()}`;
            let newComponent: WellComponent;
            const path = wellPaths.get(wellId);
            const maxDepth = path && path.length > 0 ? path[path.length - 1].md : 2000;
            const midDepth = Math.floor(maxDepth / 2);
            switch (type) {
              case 'Casing': newComponent = { id: newId, type: ComponentType.CASING, topDepth: 0, bottomDepth: midDepth, size: 7, weight: 26 }; break;
              case 'Tubing': newComponent = { id: newId, type: ComponentType.TUBING, topDepth: 0, bottomDepth: midDepth - 100, size: 2.875, weight: 6.5 }; break;
              case 'Packer': newComponent = { id: newId, type: ComponentType.PACKER, topDepth: midDepth - 200, packerType: 'Permanent' }; break;
              default: newComponent = { id: newId, type: ComponentType.PERFORATION, topDepth: midDepth + 100, bottomDepth: midDepth + 200, shotsPerFoot: 4 };
            }
            return { ...w, components: [...w.components, newComponent] };
        }
        return w;
    }));
    return newId;
  };

  const updateComponent = (wellId: string, componentId: string, updates: Partial<WellComponent>) => {
    setWells(prev => prev.map(w => w.id === wellId ? { ...w, components: w.components.map(c => c.id === componentId ? { ...c, ...updates } as WellComponent : c) } : w));
  };
  
  const removeComponent = (wellId: string, componentId: string) => {
    setWells(prev => prev.map(w => w.id === wellId ? { ...w, components: w.components.filter(c => c.id !== componentId) } : w));
  };

  const setDeviationSurvey = (wellId: string, survey: SurveyPoint[]) => {
    setWells(prev => prev.map(w => w.id === wellId ? { ...w, deviationSurvey: survey } : w));
  }

  const saveConfiguration = () => {
    localStorage.setItem('wellboreConfig', JSON.stringify({ wells }));
    alert('Field configuration saved.');
  };

  const loadConfiguration = () => {
    const saved = localStorage.getItem('wellboreConfig');
    if (saved) {
        const config = JSON.parse(saved);
        setWells(config.wells);
        return config.wells[0]?.id;
    }
    return null;
  };

  return { wells, wellPaths, addWell, updateWell, addComponent, updateComponent, removeComponent, setDeviationSurvey, saveConfiguration, loadConfiguration };
};
