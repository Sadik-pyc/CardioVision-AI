import * as THREE from 'three';
import { VesselId } from '../../types/prediction';
import { getVesselColor } from './riskUtils';

export interface CreatedVesselLayer {
  vesselGroup: THREE.Group;
  vessels: Record<VesselId, THREE.Group>;
  interactiveMeshes: THREE.Mesh[];
  meshToVesselMap: Map<THREE.Mesh, VesselId>;
  updateColors: (
    vesselProbs: Record<VesselId, number>,
    selectedVessel: VesselId | null,
    hoveredVessel: VesselId | null
  ) => void;
  updatePulsing: (time: number, selectedVessel: VesselId | null) => void;
  dispose: () => void;
}

/**
 * Procedurally constructs anatomical coronary arterial branches:
 * - LAD (Left Anterior Descending): Anterior interventricular sulcus straight to the cardiac apex
 * - LCX (Left Circumflex): Left atrioventricular groove curving posteriorly to obtuse margin
 * - RCA (Right Coronary Artery): Right atrioventricular groove to posterior crux cordis and PDA
 *
 * Coordinates are mapped to fit either the realistic 3D anatomical GLB model (target height ~8.5)
 * or the anatomical procedural cardiac assembly.
 */
export function createVesselLayer(): CreatedVesselLayer {
  const vesselGroup = new THREE.Group();
  vesselGroup.name = 'CoronaryVesselsLayer';

  const vessels: Record<VesselId, THREE.Group> = {
    LAD: new THREE.Group(),
    LCX: new THREE.Group(),
    RCA: new THREE.Group(),
  };

  vessels.LAD.name = 'Coronary_LAD_Group';
  vessels.LCX.name = 'Coronary_LCX_Group';
  vessels.RCA.name = 'Coronary_RCA_Group';

  vesselGroup.add(vessels.LAD);
  vesselGroup.add(vessels.LCX);
  vesselGroup.add(vessels.RCA);

  const interactiveMeshes: THREE.Mesh[] = [];
  const meshToVesselMap = new Map<THREE.Mesh, VesselId>();
  const vesselMaterials: Record<VesselId, THREE.MeshStandardMaterial[]> = {
    LAD: [],
    LCX: [],
    RCA: [],
  };

  const registeredGeometries: THREE.BufferGeometry[] = [];
  const registeredMaterials: THREE.Material[] = [];

  // Helper to build smooth 3D tube with high lumen visibility and depth bias
  const buildArteryBranch = (
    vesselId: VesselId,
    points: THREE.Vector3[],
    radius: number,
    isMainTrunk: boolean
  ) => {
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.25);
    const geometry = new THREE.TubeGeometry(curve, 44, radius, 14, false);
    registeredGeometries.push(geometry);

    const material = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Initialized to vivid vascular red
      roughness: 0.18,
      metalness: 0.18,
      emissive: 0xef4444,
      emissiveIntensity: 0.35,
    });
    registeredMaterials.push(material);
    vesselMaterials[vesselId].push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Render slightly over cardiac epicardium to prevent any Z-fighting artifacts
    mesh.renderOrder = 1;
    vessels[vesselId].add(mesh);

    // If main trunk, add transparent expanded raycast hitbox for effortless touch/click selection
    if (isMainTrunk) {
      const hitGeometry = new THREE.TubeGeometry(curve, 24, radius * 4.2, 8, false);
      registeredGeometries.push(hitGeometry);
      const hitMaterial = new THREE.MeshBasicMaterial({
        visible: false,
        wireframe: true,
      });
      registeredMaterials.push(hitMaterial);
      const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
      vessels[vesselId].add(hitMesh);

      interactiveMeshes.push(hitMesh);
      interactiveMeshes.push(mesh);
      meshToVesselMap.set(hitMesh, vesselId);
      meshToVesselMap.set(mesh, vesselId);
    } else {
      interactiveMeshes.push(mesh);
      meshToVesselMap.set(mesh, vesselId);
    }

    return mesh;
  };

  // =========================================================================
  // 1. LAD (Left Anterior Descending Artery) - Arborization
  // Emerges beneath pulmonary trunk, traverses anterior IV sulcus to cardiac apex
  // =========================================================================
  const ladMainPoints = [
    new THREE.Vector3(-0.35, 1.25, 1.55),
    new THREE.Vector3(-0.48, 0.65, 2.25),
    new THREE.Vector3(-0.65, -0.25, 2.45),
    new THREE.Vector3(-0.85, -1.25, 2.25),
    new THREE.Vector3(-1.05, -2.25, 1.85),
    new THREE.Vector3(-1.25, -3.25, 1.35),
    new THREE.Vector3(-1.42, -4.15, 0.75),
    new THREE.Vector3(-1.52, -4.55, 0.35), // Apex termination
  ];
  buildArteryBranch('LAD', ladMainPoints, 0.155, true);

  // Diagonal Branch 1 (D1) - Branches laterally over left ventricular free wall
  const d1Points = [
    new THREE.Vector3(-0.65, -0.25, 2.45),
    new THREE.Vector3(-1.55, -0.75, 2.15),
    new THREE.Vector3(-2.35, -1.55, 1.55),
    new THREE.Vector3(-2.75, -2.45, 0.95),
  ];
  buildArteryBranch('LAD', d1Points, 0.095, false);

  // Diagonal Branch 2 (D2)
  const d2Points = [
    new THREE.Vector3(-1.05, -2.25, 1.85),
    new THREE.Vector3(-1.75, -2.75, 1.45),
    new THREE.Vector3(-2.25, -3.35, 0.85),
  ];
  buildArteryBranch('LAD', d2Points, 0.085, false);

  // Septal Perforator (S1) - Anteroseptal branches
  const s1Points = [
    new THREE.Vector3(-0.55, 0.25, 2.35),
    new THREE.Vector3(-0.15, 0.05, 2.05),
    new THREE.Vector3(0.15, -0.35, 1.75),
  ];
  buildArteryBranch('LAD', s1Points, 0.075, false);

  // =========================================================================
  // 2. LCX (Left Circumflex Artery) - Curves along left AV groove to lateral wall
  // =========================================================================
  const lcxMainPoints = [
    new THREE.Vector3(-0.45, 1.25, 1.45),
    new THREE.Vector3(-1.35, 1.05, 1.15),
    new THREE.Vector3(-2.25, 0.65, 0.55),
    new THREE.Vector3(-2.85, 0.15, -0.35),
    new THREE.Vector3(-2.95, -0.65, -1.25),
    new THREE.Vector3(-2.45, -1.55, -1.95),
    new THREE.Vector3(-1.65, -2.35, -2.25),
  ];
  buildArteryBranch('LCX', lcxMainPoints, 0.145, true);

  // Obtuse Marginal 1 (OM1) - Prominent artery over posterolateral LV wall
  const om1Points = [
    new THREE.Vector3(-2.25, 0.65, 0.55),
    new THREE.Vector3(-2.75, -0.35, 0.75),
    new THREE.Vector3(-2.95, -1.45, 0.55),
    new THREE.Vector3(-2.85, -2.45, 0.15),
  ];
  buildArteryBranch('LCX', om1Points, 0.09, false);

  // Obtuse Marginal 2 (OM2)
  const om2Points = [
    new THREE.Vector3(-2.85, 0.15, -0.35),
    new THREE.Vector3(-3.05, -0.95, -0.45),
    new THREE.Vector3(-2.85, -1.95, -0.75),
  ];
  buildArteryBranch('LCX', om2Points, 0.08, false);

  // =========================================================================
  // 3. RCA (Right Coronary Artery) - Runs along right atrioventricular sulcus
  // to posterior crux cordis, giving off marginal branches and PDA
  // =========================================================================
  const rcaMainPoints = [
    new THREE.Vector3(0.55, 1.35, 1.45),
    new THREE.Vector3(1.55, 1.05, 1.25),
    new THREE.Vector3(2.35, 0.45, 0.85),
    new THREE.Vector3(2.75, -0.45, 0.35),
    new THREE.Vector3(2.65, -1.45, -0.35),
    new THREE.Vector3(2.15, -2.35, -0.95),
    new THREE.Vector3(1.15, -2.95, -1.45),
    new THREE.Vector3(0.15, -3.35, -1.65), // Posterior crux cordis
  ];
  buildArteryBranch('RCA', rcaMainPoints, 0.15, true);

  // Conus Branch - Over anterior right ventricular outflow
  const conusPoints = [
    new THREE.Vector3(0.95, 1.25, 1.35),
    new THREE.Vector3(0.85, 0.95, 1.95),
    new THREE.Vector3(0.35, 0.65, 2.25),
  ];
  buildArteryBranch('RCA', conusPoints, 0.075, false);

  // Acute Marginal (AM) Branch - Runs towards anterior/inferior margin of RV
  const amPoints = [
    new THREE.Vector3(2.75, -0.45, 0.35),
    new THREE.Vector3(2.65, -1.25, 0.95),
    new THREE.Vector3(2.15, -1.95, 1.25),
    new THREE.Vector3(1.35, -2.55, 1.15),
  ];
  buildArteryBranch('RCA', amPoints, 0.085, false);

  // Posterior Descending Artery (PDA) - Runs along posterior interventricular sulcus towards apex
  const pdaPoints = [
    new THREE.Vector3(0.15, -3.35, -1.65),
    new THREE.Vector3(-0.35, -3.65, -1.15),
    new THREE.Vector3(-0.85, -3.95, -0.45),
    new THREE.Vector3(-1.35, -4.35, 0.15),
  ];
  buildArteryBranch('RCA', pdaPoints, 0.095, false);

  // Reactive visual color update function
  const updateColors = (
    vesselProbs: Record<VesselId, number>,
    selectedVessel: VesselId | null,
    hoveredVessel: VesselId | null
  ) => {
    (['LAD', 'LCX', 'RCA'] as const).forEach((vId) => {
      const prob = vesselProbs[vId] ?? 0.2;
      const isSelected = selectedVessel === vId;
      const isHovered = hoveredVessel === vId;
      const targetColor = getVesselColor(prob, isSelected, isHovered);

      vesselMaterials[vId].forEach((mat) => {
        mat.color.setHex(targetColor);
        if (isSelected) {
          mat.emissive.setHex(0x38bdf8); // Sky blue luminous focus
          mat.emissiveIntensity = 0.75;
        } else if (isHovered) {
          mat.emissive.setHex(0xfacc15); // Canary yellow hover glow
          mat.emissiveIntensity = 0.65;
        } else {
          // Self-illuminated risk color so arteries remain vividly legible
          mat.emissive.setHex(targetColor);
          mat.emissiveIntensity = 0.35;
        }
      });
    });
  };

  // Systolic cardiac pulse animation
  const updatePulsing = (time: number, selectedVessel: VesselId | null) => {
    const pulsePhase = (time * 1.8) % (Math.PI * 2);
    const pulseAmp = Math.pow(Math.sin(pulsePhase), 8) * 0.035;

    (['LAD', 'LCX', 'RCA'] as const).forEach((vId) => {
      const grp = vessels[vId];
      const isSelected = selectedVessel === vId;
      const scale = 1 + pulseAmp + (isSelected ? 0.025 : 0);
      grp.scale.set(scale, scale, scale);
    });
  };

  // Clean disposal
  const dispose = () => {
    registeredGeometries.forEach((g) => g.dispose());
    registeredMaterials.forEach((m) => m.dispose());
  };

  return {
    vesselGroup,
    vessels,
    interactiveMeshes,
    meshToVesselMap,
    updateColors,
    updatePulsing,
    dispose,
  };
}
