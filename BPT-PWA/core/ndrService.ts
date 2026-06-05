
import { NDRProject } from '../types';
import { MOCK_NDR_PROJECTS } from '../constants';

/**
 * Simulates the dual-token NDR authentication process.
 */
export async function authenticateNDR() {
  await new Promise(r => setTimeout(r, 800));
  const metaToken = "ey_metadata_token_" + Math.random().toString(36).substring(7);
  const dataToken = "ey_data_token_" + Math.random().toString(36).substring(7);
  return { metaToken, dataToken };
}

/**
 * Searches the NDR Metadata API for projects.
 */
export async function searchNDRMetadata(query: string, status?: string, ghostOnly?: boolean): Promise<NDRProject[]> {
  await new Promise(r => setTimeout(r, 800));
  const normalizedQuery = query.toLowerCase();
  
  return MOCK_NDR_PROJECTS.filter(p => {
    const matchesQuery = !query || 
      p.projectId.toLowerCase().includes(normalizedQuery) || 
      p.name.toLowerCase().includes(normalizedQuery);
    
    const matchesStatus = !status || status === 'ALL' || p.status === status;
    const matchesGhost = !ghostOnly || p.hasDatumShiftIssues === true;
    
    return matchesQuery && matchesStatus && matchesGhost;
  });
}

/**
 * Simulates the Sovereign Batch Harvester.
 */
export async function harvestNDRProject(projectId: string, onProgress: (p: number) => void): Promise<boolean> {
  const project = MOCK_NDR_PROJECTS.find(p => p.projectId === projectId);
  if (!project) return false;

  let progress = 0;
  while (progress < 100) {
    await new Promise(r => setTimeout(r, 100));
    progress += 10;
    onProgress(Math.min(100, progress));
  }
  return true;
}
