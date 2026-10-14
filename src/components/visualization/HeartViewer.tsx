import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VesselId, PredictionResult } from '../../types/prediction';
import { createVesselLayer, CreatedVesselLayer } from './VesselLayer';
import { CameraControls, AnatomicalView } from './CameraControls';
import { 
  Heart, 
  RefreshCw, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface HeartViewerProps {
  prediction: PredictionResult;
  selectedVessel: VesselId | null;
  onSelectVessel: (vesselId: VesselId | null) => void;
  className?: string;
}

export const HeartViewer: React.FC<HeartViewerProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // States
  const [hoveredVessel, setHoveredVessel] = useState<VesselId | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activeView, setActiveView] = useState<AnatomicalView>('anterior');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'glb' | 'procedural'>('glb');

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const vesselLayerRef = useRef<CreatedVesselLayer | null>(null);
  const heartBodyGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Mouse Raycasting references
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Real vessel probability dictionary
  const vesselProbabilities: Record<VesselId, number> = {
    LAD: prediction.vessels.LAD.stenosisProbability,
    LCX: prediction.vessels.LCX.stenosisProbability,
    RCA: prediction.vessels.RCA.stenosisProbability,
  };

  // Synchronize vessel color updates reactively whenever prediction or selection changes
  useEffect(() => {
    if (vesselLayerRef.current) {
      vesselLayerRef.current.updateColors(
        vesselProbabilities,
        selectedVessel,
        hoveredVessel
      );
    }
  }, [
    prediction.vessels.LAD.stenosisProbability,
    prediction.vessels.LCX.stenosisProbability,
    prediction.vessels.RCA.stenosisProbability,
    selectedVessel,
    hoveredVessel,
  ]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    try {
      setIsLoading(true);
      setHasError(null);

      const width = wrapper.clientWidth || 500;
      const height = wrapper.clientHeight || 420;

      // 1. Scene with pleasant dark clinical background
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x0a101d);

      // 2. Camera: Standard anatomical perspective
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
      camera.position.set(0, 0.5, 17.5);
      cameraRef.current = camera;

      // 3. Renderer with high visual fidelity, anti-aliasing, and tone mapping
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Empty previous children and append new canvas
      wrapper.innerHTML = '';
      wrapper.appendChild(renderer.domElement);

      // 4. OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = true;
      controls.panSpeed = 0.8;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.0;
      controls.minDistance = 6;
      controls.maxDistance = 35;
      controls.target.set(-0.2, -0.6, 0);
      controlsRef.current = controls;

      // 5. Multi-Point Studio Illumination
      const ambientLight = new THREE.AmbientLight(0xffe8e8, 1.15);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(12, 16, 14);
      scene.add(keyLight);

      const frontFill = new THREE.DirectionalLight(0xfff1e6, 1.4);
      frontFill.position.set(-6, 4, 15);
      scene.add(frontFill);

      const leftLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
      leftLight.position.set(-16, 2, 6);
      scene.add(leftLight);

      const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.0);
      rimLight.position.set(14, -4, -12);
      scene.add(rimLight);

      const bottomBounce = new THREE.DirectionalLight(0x93c5fd, 0.6);
      bottomBounce.position.set(0, -12, 6);
      scene.add(bottomBounce);

      // Heart Body Group
      const heartGroup = new THREE.Group();
      heartBodyGroupRef.current = heartGroup;
      scene.add(heartGroup);

      // 6. Coronary Artery Layer (LAD, LCX, RCA)
      const vesselLayer = createVesselLayer();
      vesselLayerRef.current = vesselLayer;
      scene.add(vesselLayer.vesselGroup);

      // Apply predicted probabilities to vessel materials
      vesselLayer.updateColors(vesselProbabilities, selectedVessel, hoveredVessel);

      // Helper function to build fallback procedural anatomical assembly
      const buildProceduralAnatomy = () => {
        const muscleMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x94262c),
          roughness: 0.42,
          metalness: 0.08,
          clearcoat: 0.38,
          clearcoatRoughness: 0.32,
          transmission: 0.02,
          sheen: 0.45,
          sheenColor: new THREE.Color(0xd9534f),
        });

        const atrialMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x7a1d24),
          roughness: 0.5,
          metalness: 0.05,
          clearcoat: 0.25,
        });

        const aortaMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xb54c49),
          roughness: 0.38,
          metalness: 0.1,
          clearcoat: 0.3,
        });

        const pulmonaryMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x524b6b),
          roughness: 0.45,
          metalness: 0.1,
          clearcoat: 0.25,
        });

        const venousMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x354f6b),
          roughness: 0.48,
          metalness: 0.08,
          clearcoat: 0.2,
        });

        const adiposeMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xd4a373),
          roughness: 0.75,
          metalness: 0.02,
        });

        // LV
        const lvGeo = new THREE.ConeGeometry(2.8, 5.8, 40);
        lvGeo.rotateX(Math.PI);
        lvGeo.rotateZ(0.22);
        const lvMesh = new THREE.Mesh(lvGeo, muscleMaterial);
        lvMesh.position.set(-0.85, -1.8, 0.2);
        lvMesh.scale.set(1.05, 1.0, 0.95);
        heartGroup.add(lvMesh);

        // RV
        const rvGeo = new THREE.SphereGeometry(2.6, 36, 36);
        rvGeo.scale(1.0, 1.45, 0.85);
        const rvMesh = new THREE.Mesh(rvGeo, muscleMaterial);
        rvMesh.position.set(0.95, -1.2, 0.7);
        rvMesh.rotation.z = -0.15;
        heartGroup.add(rvMesh);

        // Apex
        const apexGeo = new THREE.SphereGeometry(1.2, 28, 28);
        apexGeo.scale(0.9, 1.3, 0.8);
        const apexMesh = new THREE.Mesh(apexGeo, muscleMaterial);
        apexMesh.position.set(-1.45, -4.0, 0.35);
        heartGroup.add(apexMesh);

        // Atria
        const raGeo = new THREE.SphereGeometry(2.1, 32, 32);
        raGeo.scale(1.15, 1.1, 0.95);
        const raMesh = new THREE.Mesh(raGeo, atrialMaterial);
        raMesh.position.set(1.75, 1.1, -0.2);
        heartGroup.add(raMesh);

        const laGeo = new THREE.SphereGeometry(2.0, 32, 32);
        laGeo.scale(1.0, 1.0, 1.15);
        const laMesh = new THREE.Mesh(laGeo, atrialMaterial);
        laMesh.position.set(-1.5, 1.2, -0.85);
        heartGroup.add(laMesh);

        // Aorta Arch
        const aortaCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.0, 1.2, 0.4),
          new THREE.Vector3(0.35, 2.5, 0.2),
          new THREE.Vector3(0.2, 3.8, -0.4),
          new THREE.Vector3(-0.85, 3.5, -1.1),
          new THREE.Vector3(-1.25, 2.0, -1.4),
        ]);
        const aortaArchGeo = new THREE.TubeGeometry(aortaCurve, 32, 1.05, 24, false);
        const aortaArchMesh = new THREE.Mesh(aortaArchGeo, aortaMaterial);
        heartGroup.add(aortaArchMesh);

        // Pulmonary Trunk
        const pulmonaryCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.45, 0.6, 1.2),
          new THREE.Vector3(-0.35, 1.9, 0.95),
          new THREE.Vector3(-0.75, 2.7, 0.35),
        ]);
        const pulmonaryGeo = new THREE.TubeGeometry(pulmonaryCurve, 24, 0.95, 20, false);
        const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, pulmonaryMaterial);
        heartGroup.add(pulmonaryMesh);

        // SVC
        const svcGeo = new THREE.CylinderGeometry(0.75, 0.82, 3.2, 18);
        const svcMesh = new THREE.Mesh(svcGeo, venousMaterial);
        svcMesh.position.set(1.95, 2.9, -0.45);
        heartGroup.add(svcMesh);
      };

      // 7. Load Premium Anatomical GLB 3D Heart Model
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        '/models/heart.glb',
        (gltf) => {
          try {
            const model = gltf.scene;
            model.name = 'PremiumAnatomicalHeartGLB';

            // Center and scale to match coronary artery layout coordinates (target height ~8.8)
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Re-center model at origin
            model.position.x -= center.x;
            model.position.y -= center.y;
            model.position.z -= center.z;

            // Scale factor to calibrate size to coronary tree bounds
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 8.5 / (maxDim || 1.6);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Offset slightly to align anatomical apex with LAD catheter trajectory
            model.position.set(-0.35, -0.65, 0.15);

            // Traverse and enhance PBR myocardial materials
            model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                if (mesh.material) {
                  const mat = mesh.material as THREE.MeshStandardMaterial;
                  mat.roughness = 0.42;
                  mat.metalness = 0.08;
                  if ('clearcoat' in mat) {
                    (mat as any).clearcoat = 0.35;
                  }
                  mat.needsUpdate = true;
                }
              }
            });

            heartGroup.add(model);
            setModelType('glb');
            setIsLoading(false);
          } catch (e) {
            console.warn('Error configuring GLB model, using procedural assembly fallback:', e);
            buildProceduralAnatomy();
            setModelType('procedural');
            setIsLoading(false);
          }
        },
        undefined,
        (err) => {
          console.warn('GLB asset loading encountered an issue, initializing procedural anatomy fallback:', err);
          buildProceduralAnatomy();
          setModelType('procedural');
          setIsLoading(false);
        }
      );

      // 8. Animation & Render Loop
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);

        const elapsedTime = clockRef.current.getElapsedTime();

        // Physiological cardiac pulse (~72 bpm)
        const pulse = Math.sin(elapsedTime * 2.4) * 0.012;
        heartGroup.scale.set(1 + pulse * 0.8, 1 + pulse * 1.1, 1 + pulse * 0.8);

        // Vessel layer pulsation
        vesselLayer.updatePulsing(elapsedTime, selectedVessel);

        if (controlsRef.current) {
          controlsRef.current.update();
        }

        renderer.render(scene, camera);
      };

      animate();

      // 9. Resize Observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: newWidth, height: newHeight } = entry.contentRect;
          if (newWidth > 0 && newHeight > 0) {
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
          }
        }
      });

      resizeObserver.observe(wrapper);

      return () => {
        resizeObserver.disconnect();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        controls.dispose();
        renderer.dispose();
        vesselLayer.dispose();
        if (wrapper && renderer.domElement && wrapper.contains(renderer.domElement)) {
          wrapper.removeChild(renderer.domElement);
        }
      };
    } catch (err: any) {
      console.error('Three.js initialization failure:', err);
      setHasError(err?.message || 'Failed to initialize WebGL 3D context');
      setIsLoading(false);
    }
  }, []);

  // Raycasting helper
  const getIntersectedVessel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): VesselId | null => {
      const wrapper = canvasWrapperRef.current;
      const camera = cameraRef.current;
      const vesselLayer = vesselLayerRef.current;
      if (!wrapper || !camera || !vesselLayer) return null;

      const rect = wrapper.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        vesselLayer.interactiveMeshes,
        true
      );

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== vesselLayer.vesselGroup) {
          if (obj.userData?.vesselId) {
            return obj.userData.vesselId as VesselId;
          }
          if (vesselLayer.meshToVesselMap.has(obj as THREE.Mesh)) {
            return vesselLayer.meshToVesselMap.get(obj as THREE.Mesh) || null;
          }
          obj = obj.parent;
        }
      }

      return null;
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const vessel = getIntersectedVessel(event);
      if (vessel !== hoveredVessel) {
        setHoveredVessel(vessel);
      }
    },
    [getIntersectedVessel, hoveredVessel]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        const vessel = getIntersectedVessel(event);
        if (vessel) {
          onSelectVessel(vessel);
        }
      }
    },
    [getIntersectedVessel, onSelectVessel]
  );

  // Anatomical camera angle presets
  const handleSetView = useCallback((view: AnatomicalView) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveView(view);

    switch (view) {
      case 'anterior':
        // AP View: Directly highlights LAD traversing anterior interventricular sulcus to apex
        camera.position.set(-0.5, -0.2, 17.5);
        controls.target.set(-0.2, -0.6, 0);
        break;
      case 'lateral_left':
        // LAO View: Focuses on Left Circumflex (LCX) and Obtuse Marginal branches
        camera.position.set(-16.0, 0.5, 7.5);
        controls.target.set(-1.2, -0.8, -0.2);
        break;
      case 'posterior':
        // RAO / Posterior View: Shows RCA traversing crux cordis and PDA
        camera.position.set(13.5, -1.0, -11.5);
        controls.target.set(0.4, -0.8, -0.4);
        break;
      case 'superior':
        // Base View: Aorta, Pulmonary trunk, and Base of Heart
        camera.position.set(0, 18.5, 4.0);
        controls.target.set(0, 1.0, 0);
        break;
    }

    controls.update();
  }, []);

  const handleResetCamera = useCallback(() => {
    handleSetView('anterior');
  }, [handleSetView]);

  const handleZoomIn = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.multiplyScalar(0.85);
    controls.update();
  }, []);

  const handleZoomOut = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.multiplyScalar(1.15);
    controls.update();
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[440px] w-full'
      } ${className}`}
    >
      {/* Top Header Toolbar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title Badge */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs flex items-center gap-2 shadow-lg">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="font-bold text-slate-100 text-[11px] tracking-tight">3D Cardiovascular Anatomy</span>
            {modelType === 'glb' ? (
              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>PBR GLB Model</span>
              </span>
            ) : (
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-1 py-0.2 rounded font-semibold">
                Anatomical Assembly
              </span>
            )}
          </div>
        </div>

        {/* Camera Preset Toolbar */}
        <div className="pointer-events-auto">
          <CameraControls
            onResetCamera={handleResetCamera}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onSetView={handleSetView}
            activeView={activeView}
            isAutoRotating={isAutoRotating}
            onToggleAutoRotate={handleToggleAutoRotate}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      </div>

      {/* Main 3D Canvas Area: Full Unobstructed View */}
      <div
        ref={canvasWrapperRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing focus:outline-none"
        tabIndex={0}
        role="application"
        aria-label="3D Interactive Anatomical Coronary Heart Model. Click and drag to rotate, scroll to zoom, right-click to pan."
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
            <span>Loading High-Resolution 3D Heart Anatomy...</span>
          </div>
        </div>
      )}

      {/* Error Fallback Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertTriangle className="w-7 h-7 text-rose-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-200">3D WebGL Context Initialization Error</h4>
          <p className="text-[11px] text-slate-400 max-w-md mt-1">{hasError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
          >
            Retry Renderer
          </button>
        </div>
      )}

      {/* Bottom Interaction Guide */}
      <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none text-[9px] text-slate-400 font-mono hidden md:block bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800">
        Left-Click: Rotate · Right-Click: Pan · Scroll: Zoom · Click Artery: Inspect
      </div>
    </div>
  );
};
