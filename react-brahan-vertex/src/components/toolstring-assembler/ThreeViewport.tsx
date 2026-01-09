
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ToolComponent, WellData, WellboreData, SurveyPoint } from '../types';

interface ThreeViewportProps {
    toolString: ToolComponent[];
    wellData: WellData;
    wellboreData: WellboreData;
    surveyData: SurveyPoint[];
    showWellbore: boolean;
    showSchematic: boolean;
    showSurveyPath: boolean;
    onShowWellboreChange: (checked: boolean) => void;
    onShowSchematicChange: (checked: boolean) => void;
    onShowSurveyPathChange: (checked: boolean) => void;
    selectedComponent: ToolComponent | null;
    onSelectComponent: (component: ToolComponent | null) => void;
}

// Logic duplicated from BOM for consistency in 3D view
const checkConnection = (upper: ToolComponent, lower: ToolComponent): boolean => {
    // Thread check
    if (upper.bottomConnection && lower.topConnection) {
        const upperThread = upper.bottomConnection.replace('-Pin', '');
        const lowerThread = lower.topConnection.replace('-Box', '');
        
        if (upperThread === lowerThread && 
            upper.bottomConnection.endsWith('-Pin') && 
            lower.topConnection.endsWith('-Box')) {
            return true;
        }
    }
    // Latch check
    if (lower.latchMechanism && upper.latchProfile) {
        if (lower.latchMechanism === upper.latchProfile) {
            return true;
        }
    }
    return false;
};

const useThreeScene = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const threeRef = useRef<{
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer,
        controls: OrbitControls,
        toolGroup: THREE.Group,
        wellboreGroup: THREE.Group,
    } | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // --- Initialization ---
        const canvas = canvasRef.current;
        // Ensure dimensions are valid
        const width = canvas.clientWidth || 300;
        const height = canvas.clientHeight || 300;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        // Default View: Slightly elevated, looking at origin
        camera.position.set(8, 5, 8);

        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true, 
            alpha: true, // Important for transparency
            preserveDrawingBuffer: true 
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, -1, 0); 
        controls.update();

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(15, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);
        
        const backLight = new THREE.DirectionalLight(0x445566, 0.8);
        backLight.position.set(-10, 5, -10);
        scene.add(backLight);

        // --- Helpers ---
        const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
        gridHelper.position.y = -0.01; 
        scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(2);
        scene.add(axesHelper);

        const toolGroup = new THREE.Group();
        scene.add(toolGroup);
        const wellboreGroup = new THREE.Group();
        scene.add(wellboreGroup);

        threeRef.current = { scene, camera, renderer, controls, toolGroup, wellboreGroup };

        // --- Resize Observer ---
        const resizeObserver = new ResizeObserver(() => {
            if (!canvas.parentElement) return;
            const newWidth = canvas.parentElement.clientWidth;
            const newHeight = canvas.parentElement.clientHeight;
            
            if (newWidth > 0 && newHeight > 0) {
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            }
        });
        
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        // --- Animation Loop ---
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            renderer.dispose();
        };
    }, [canvasRef]);

    return threeRef;
};

const ThreeViewport: React.FC<ThreeViewportProps> = (props) => {
    const { toolString, wellData, wellboreData, showWellbore, selectedComponent, onSelectComponent } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threeRef = useThreeScene(canvasRef);
    
     useEffect(() => {
        if (!canvasRef.current || !threeRef.current) return;
        const canvas = canvasRef.current;
        const { camera, toolGroup } = threeRef.current;

        const handleClick = (event: MouseEvent) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(toolGroup.children, true);

            const toolIntersection = intersects.find(intersect => intersect.object.userData.component);

            if (toolIntersection) {
                const component = toolIntersection.object.userData.component as ToolComponent;
                onSelectComponent(component.id === selectedComponent?.id ? null : component);
            } else {
                onSelectComponent(null);
            }
        };

        canvas.addEventListener('click', handleClick);
        return () => canvas.removeEventListener('click', handleClick);
    }, [threeRef, onSelectComponent, selectedComponent]);

    useEffect(() => {
        if (!threeRef.current) return;
        const { toolGroup, controls, camera } = threeRef.current;
        
        // Clear previous meshes
        while (toolGroup.children.length) {
            const child = toolGroup.children[0] as THREE.Mesh;
            toolGroup.remove(child);
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material?.dispose();
            }
        }
        
        let currentY = 0;
        const DIAMETER_SCALE = 4; // Consistent scale factor for visibility

        // Wireline Visualization
        if (toolString.length > 0) {
            // Using a Cylinder instead of Line for better visibility and rendering stability
            const wireLength = 20; // Represents arbitrary length going up
            const wireRadius = (0.108 / 2 / 12) * DIAMETER_SCALE; // Scaled wire OD
            const wireGeo = new THREE.CylinderGeometry(wireRadius, wireRadius, wireLength, 8);
            const wireMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.5 });
            const wireMesh = new THREE.Mesh(wireGeo, wireMat);
            wireMesh.position.y = 10; // Center of the 20ft wire is at +10y
            toolGroup.add(wireMesh);
        }

        // Build Tool String
        toolString.forEach((component, index) => {
            try {
                // Connection Indicator (except for top item)
                if (index > 0) {
                    const prev = toolString[index - 1];
                    const isValid = checkConnection(prev, component);
                    const ringColor = isValid ? 0x00ff00 : 0xff0000;
                    
                    const ringRadius = Math.max((component.maxOD/2/12) * DIAMETER_SCALE, 0.08); 
                    const ringTube = 0.015;
                    const ringGeo = new THREE.TorusGeometry(ringRadius + 0.02, ringTube, 8, 32);
                    const ringMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.8 });
                    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                    
                    // Rotate flat
                    ringMesh.rotation.x = Math.PI / 2;
                    ringMesh.position.y = currentY;
                    toolGroup.add(ringMesh);
                }

                const height = component.length;
                const toolMesh = createToolMesh(component, wellData, selectedComponent);
                toolMesh.position.y = currentY;
                currentY -= height;
                toolGroup.add(toolMesh);
            } catch (e) {
                console.error("Error creating tool mesh:", e);
            }
        });

        // Update Camera Target to center the string
        if (toolString.length > 0) {
            // String extends from 0 down to currentY (which is negative total length)
            const midPoint = currentY / 2;
            controls.target.set(0, midPoint, 0);
        } else {
            // Reset to neutral position if empty
            controls.target.set(0, -1, 0);
            camera.position.set(8, 5, 8);
        }
        controls.update();

    }, [toolString, wellData, threeRef, selectedComponent]);

    useEffect(() => {
        if (!threeRef.current) return;
        const { wellboreGroup } = threeRef.current;

        // Clear wellbore group
        while (wellboreGroup.children.length) {
             const child = wellboreGroup.children[0] as THREE.Mesh;
             wellboreGroup.remove(child);
             child.geometry?.dispose();
             if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
             else child.material?.dispose();
        }

        if (showWellbore) {
             const viewHeight = 200; // Arbitrary visualization height 
             const DIAMETER_SCALE = 4; // Must match tool scale
             const tubingRadius = Math.max((wellboreData.tubingID / 2) / 12 * DIAMETER_SCALE, 0.05);
             
             // Tubing Ghost
             const tubingGeo = new THREE.CylinderGeometry(tubingRadius, tubingRadius, viewHeight, 32, 1, true);
             const tubingMat = new THREE.MeshPhongMaterial({ 
                 color: 0x00aaff, 
                 transparent: true, 
                 opacity: 0.15, 
                 side: THREE.DoubleSide, 
                 depthWrite: false,
                 blending: THREE.AdditiveBlending
             });
             const tubingMesh = new THREE.Mesh(tubingGeo, tubingMat);
             // Position tubing so it covers the string. String starts at 0 and goes down.
             // Center tubing at say -50 to cover 100ft of string easily
             tubingMesh.position.y = -50; 
             wellboreGroup.add(tubingMesh);
        }

    }, [wellboreData, showWellbore, threeRef]);

    return (
        <div className="md:col-span-2 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden relative border border-gray-700 shadow-inner h-full min-h-[500px] flex flex-col">
            <div className="flex-1 w-full h-full relative">
                 <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />
            </div>
            
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-gray-700 text-xs text-gray-300 shadow-lg">
                    <p className="font-bold text-white mb-1">3D View Controls</p>
                    <ul className="space-y-1">
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Left Click + Drag to Orbit</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Right Click + Drag to Pan</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Scroll to Zoom</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Click Component for Details</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-green-500"></span> Green Ring: Valid Connection</li>
                        <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-red-500"></span> Red Ring: Invalid Connection</li>
                    </ul>
                </div>
            </div>
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-gray-700 text-xs shadow-lg">
                <div className="flex items-center mb-2">
                    <input type="checkbox" id="show-wellbore" checked={props.showWellbore} onChange={e => props.onShowWellboreChange(e.target.checked)} className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="show-wellbore" className="text-gray-200 font-medium">Show Tubing Context</label>
                </div>
            </div>
        </div>
    );
};


const createToolMesh = (component: ToolComponent, wellData: WellData, selectedComponent: ToolComponent | null) => {
    const group = new THREE.Group();
    const DIAMETER_SCALE = 4; // Exaggerate width for visibility
    
    const isSelected = selectedComponent?.id === component.id && selectedComponent.name === component.name;

    const color = new THREE.Color(component.color || 0xcccccc);
    if (component.maxOD > wellData.nippleID || component.maxOD > wellData.tubingID) {
        color.setHex(0xff0000); // Alert red if tool is too big
    }

    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: isSelected ? 0x00ffff : 0x000000,
        emissiveIntensity: isSelected ? 0.4 : 0,
    });

    const getRadius = (inches: number) => Math.max((inches || 1) / 2 / 12 * DIAMETER_SCALE, 0.01); 

    const length = Math.max(component.length || 0.1, 0.1);
    const mainRadius = getRadius(component.maxOD);
    
    // --- Detailed Geometry Generation ---

    let neckLength = 0;
    let neckRadius = 0;
    
    // Safe parse function
    const parseDim = (str: string | undefined) => {
        if (!str) return null;
        const match = str.match(/([\d\.]+)/);
        return match ? parseFloat(match[1]) : null;
    }

    if (component.latchProfile && (component.latchProfile.includes('neck') || component.latchProfile.includes('internal'))) {
         neckLength = 0.25; 
         const r = parseDim(component.latchProfile);
         neckRadius = r ? getRadius(r) : mainRadius * 0.75;
         
         if (neckRadius >= mainRadius) neckRadius = mainRadius * 0.9;
         if (neckLength > length * 0.4) neckLength = length * 0.2;
    }

    let pinLength = 0;
    let pinRadius = 0;
    if (component.bottomConnection && component.bottomConnection.toLowerCase().includes('pin')) {
        pinLength = 0.12; 
        pinRadius = mainRadius * 0.65;
        if (pinLength > length * 0.2) pinLength = length * 0.1;
    }

    const bodyLength = Math.max(length - neckLength - pinLength, 0.01);
    
    let currentLocalY = 0;

    // A. Neck (Top)
    if (neckLength > 0) {
        const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckLength, 32);
        const neckMesh = new THREE.Mesh(neckGeo, material);
        neckMesh.position.y = currentLocalY - (neckLength / 2);
        neckMesh.castShadow = true;
        neckMesh.receiveShadow = true;
        group.add(neckMesh);
        currentLocalY -= neckLength;
        
        // Chamfer
        const chamferHeight = 0.02;
        const chamferGeo = new THREE.CylinderGeometry(neckRadius, mainRadius, chamferHeight, 32);
        const chamferMesh = new THREE.Mesh(chamferGeo, material);
        chamferMesh.position.y = currentLocalY - (chamferHeight/2);
        group.add(chamferMesh);
    }

    // B. Main Body
    const bodyGeo = new THREE.CylinderGeometry(mainRadius, mainRadius, bodyLength, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, material);
    bodyMesh.position.y = currentLocalY - (bodyLength / 2);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);
    currentLocalY -= bodyLength;

    // C. Pin (Bottom)
    if (pinLength > 0) {
        const pinGeo = new THREE.CylinderGeometry(pinRadius, pinRadius * 0.95, pinLength, 16);
        const pinMesh = new THREE.Mesh(pinGeo, material);
        pinMesh.position.y = currentLocalY - (pinLength / 2);
        pinMesh.castShadow = true;
        pinMesh.receiveShadow = true;
        group.add(pinMesh);
        currentLocalY -= pinLength;
    }
    
    // Attach data to all children so raycaster can find it easily
    group.children.forEach(child => {
        child.userData = { component };
    });
    group.userData = { component };
    
    return group;
};

export default ThreeViewport;
