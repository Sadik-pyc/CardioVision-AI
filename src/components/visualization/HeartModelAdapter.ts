import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VesselId } from '../../types/prediction';

/**
 * Interface defining the contract for any 3D cardiac model source
 * (whether procedural scaffold, custom user GLB, or prospective open-access asset).
 */
export interface IHeartModelAdapter {
  id: string;
  name: string;
  isProceduralScaffold: boolean;
  medicalAccuracyNotice: string;
  
  /**
   * Root 3D Object3D representing the cardiac model
   */
  rootGroup: THREE.Group;
  
  /**
   * Direct references to the coronary vessel groups/meshes
   */
  vessels: Record<VesselId, THREE.Group | THREE.Mesh | null>;
  
  /**
   * Myocardial body group for opacity/isolation control
   */
  myocardiumGroup: THREE.Group | null;
  
  /**
   * Update vessel colors based on predicted probabilities and selection states
   */
  updateVesselVisuals(
    vesselProbs: Record<VesselId, number>,
    selectedVessel: VesselId | null,
    hoveredVessel: VesselId | null
  ): void;

  /**
   * Dispose all geometries, materials, and textures cleanly
   */
  dispose(): void;
}

/**
 * Inspection utility to analyze any loaded GLTF scene hierarchy
 * and detect vessel nodes matching coronary nomenclature.
 */
export interface ModelMeshMappingReport {
  totalNodes: number;
  nodeNames: string[];
  matchedVessels: Partial<Record<VesselId, string>>;
  unmappedNodes: string[];
}

export function inspectGLTFScene(scene: THREE.Group): ModelMeshMappingReport {
  const nodeNames: string[] = [];
  const matchedVessels: Partial<Record<VesselId, string>> = {};

  scene.traverse((child) => {
    if (child.name) {
      nodeNames.push(child.name);
      const lower = child.name.toLowerCase();

      // Check for LAD patterns
      if (lower.includes('lad') || lower.includes('anterior_descending') || lower.includes('left_anterior')) {
        matchedVessels.LAD = child.name;
      }
      // Check for LCX patterns
      if (lower.includes('lcx') || lower.includes('circumflex') || lower.includes('left_circumflex')) {
        matchedVessels.LCX = child.name;
      }
      // Check for RCA patterns
      if (lower.includes('rca') || lower.includes('right_coronary')) {
        matchedVessels.RCA = child.name;
      }
    }
  });

  return {
    totalNodes: nodeNames.length,
    nodeNames,
    matchedVessels,
    unmappedNodes: nodeNames.filter(n => !Object.values(matchedVessels).includes(n)),
  };
}

/**
 * Asynchronously load an external GLB/GLTF file with automatic vessel node mapping.
 */
export async function loadExternalHeartModel(
  urlOrFile: string | File
): Promise<{ scene: THREE.Group; report: ModelMeshMappingReport }> {
  const loader = new GLTFLoader();

  let url: string;
  let shouldRevoke = false;

  if (typeof urlOrFile === 'string') {
    url = urlOrFile;
  } else {
    url = URL.createObjectURL(urlOrFile);
    shouldRevoke = true;
  }

  try {
    const gltf = await loader.loadAsync(url);
    const report = inspectGLTFScene(gltf.scene);
    return { scene: gltf.scene, report };
  } finally {
    if (shouldRevoke) {
      URL.revokeObjectURL(url);
    }
  }
}
