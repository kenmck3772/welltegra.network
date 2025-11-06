/**
 * PCE Rig-up Simulator - Sprint 6 Phase 1
 *
 * Interactive 3D assembly tool for Pressure Control Equipment
 * using Babylon.js for drag-and-drop component assembly with snap-to-connect logic.
 *
 * Target Users: Rowan Ross (Engineer), Finlay MacLeod (Field-Operator)
 * Security: Engineer and Field-Operator roles only
 * Technology: Babylon.js 3D engine with GLB model loading
 */

(function() {
    'use strict';

    // ==================== MODULE STATE ====================
    let babylonEngine = null;
    let babylonScene = null;
    let camera = null;
    let componentLibrary = [];
    let placedComponents = [];
    let connections = [];
    let isDragging = false;
    let draggedComponent = null;
    let ghostMesh = null;
    let snapIndicators = [];

    // Configuration
    const CONFIG = {
        API_BASE: 'https://api.welltegra.local',
        SNAP_DISTANCE: 2.0,  // Distance threshold for snapping (in scene units)
        HIGHLIGHT_COLOR: new BABYLON.Color3(0.13, 0.77, 0.37),  // Green for snap points
        COMPONENT_SCALE: 1.0
    };

    // Mock credentials for development
    const MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
    const MOCK_USER = {
        name: 'Rowan Ross',
        role: 'Engineer'
    };

    // ==================== SECURITY ====================

    /**
     * Security-first: Verify user authorization before initialization
     */
    function verifyAuthorization() {
        console.log('[PCESimulator] Verifying authorization...');

        // In production: Get actual user from localStorage/session
        const userRole = localStorage.getItem('userRole') || MOCK_USER.role;
        const userName = localStorage.getItem('userName') || MOCK_USER.name;

        // Update UI
        const userDisplay = document.getElementById('current-user');
        if (userDisplay) {
            userDisplay.textContent = userName;
        }

        // Check authorization
        const authorizedRoles = ['Engineer', 'Field-Operator'];
        if (!authorizedRoles.includes(userRole)) {
            console.error('[PCESimulator] Unauthorized role:', userRole);
            redirectToUnauthorized();
            return false;
        }

        console.log('[PCESimulator] Authorization verified:', { userName, userRole });
        return true;
    }

    function redirectToUnauthorized() {
        window.location.href = 'unauthorized.html';
    }

    // ==================== BABYLON.JS INITIALIZATION ====================

    /**
     * Initialize Babylon.js engine, scene, camera, and lighting
     */
    function initializeBabylonEngine() {
        console.log('[PCESimulator] Initializing Babylon.js engine...');

        const canvas = document.getElementById('babylon-canvas');
        if (!canvas) {
            console.error('[PCESimulator] Canvas element not found');
            return false;
        }

        try {
            // Create Babylon.js engine
            babylonEngine = new BABYLON.Engine(canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true
            });

            // Create scene
            babylonScene = new BABYLON.Scene(babylonEngine);
            babylonScene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1.0);

            // Create camera (ArcRotateCamera for orbital controls)
            camera = new BABYLON.ArcRotateCamera(
                'camera',
                Math.PI / 2,      // Alpha (horizontal rotation)
                Math.PI / 3,      // Beta (vertical rotation)
                20,               // Radius (distance from target)
                new BABYLON.Vector3(0, 5, 0),  // Target position
                babylonScene
            );

            // Attach camera controls to canvas
            camera.attachControl(canvas, true);
            camera.lowerRadiusLimit = 5;
            camera.upperRadiusLimit = 50;
            camera.wheelPrecision = 20;

            // Add lighting
            createSceneLighting();

            // Add ground plane for reference
            createGroundPlane();

            // Start render loop
            babylonEngine.runRenderLoop(() => {
                babylonScene.render();
                updateSceneStats();
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                babylonEngine.resize();
            });

            console.log('[PCESimulator] Babylon.js initialized successfully');
            return true;

        } catch (error) {
            console.error('[PCESimulator] Failed to initialize Babylon.js:', error);
            return false;
        }
    }

    /**
     * Create scene lighting (ambient + directional)
     */
    function createSceneLighting() {
        // Ambient light (soft overall illumination)
        const ambientLight = new BABYLON.HemisphericLight(
            'ambientLight',
            new BABYLON.Vector3(0, 1, 0),
            babylonScene
        );
        ambientLight.intensity = 0.6;
        ambientLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1.0);

        // Directional light (main light source)
        const directionalLight = new BABYLON.DirectionalLight(
            'directionalLight',
            new BABYLON.Vector3(-1, -2, -1),
            babylonScene
        );
        directionalLight.intensity = 0.8;
        directionalLight.position = new BABYLON.Vector3(10, 15, 10);

        // Add shadows (optional, for better depth perception)
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        console.log('[PCESimulator] Scene lighting created');
    }

    /**
     * Create ground plane for spatial reference
     */
    function createGroundPlane() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            'ground',
            { width: 50, height: 50 },
            babylonScene
        );

        // Grid material
        const groundMaterial = new BABYLON.StandardMaterial('groundMat', babylonScene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;

        ground.receiveShadows = true;
        ground.position.y = 0;

        console.log('[PCESimulator] Ground plane created');
    }

    // ==================== COMPONENT LIBRARY ====================

    /**
     * Fetch component library from REST API
     */
    async function fetchComponentLibrary() {
        console.log('[PCESimulator] Fetching component library...');

        const trayLoading = document.getElementById('tray-loading');
        const trayEmpty = document.getElementById('tray-empty');

        try {
            // Get JWT token
            const jwtToken = localStorage.getItem('jwtToken') || MOCK_JWT;

            // Fetch from API
            const response = await fetch(`${CONFIG.API_BASE}/v1/equipment/pce-components`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            componentLibrary = data.components || [];

            console.log('[PCESimulator] Loaded components:', componentLibrary.length);

            // Hide loading, render components
            if (trayLoading) trayLoading.classList.add('hidden');

            if (componentLibrary.length === 0) {
                if (trayEmpty) trayEmpty.classList.remove('hidden');
            } else {
                renderComponentTray();
            }

        } catch (error) {
            console.error('[PCESimulator] Failed to fetch components:', error);

            // Hide loading, show empty state
            if (trayLoading) trayLoading.classList.add('hidden');
            if (trayEmpty) {
                trayEmpty.classList.remove('hidden');
                trayEmpty.innerHTML = `
                    <p class="text-sm text-red-400 mb-2">Failed to load components</p>
                    <button onclick="window.PCESimulator.testWithMockData()"
                            class="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded">
                        Load Mock Data
                    </button>
                `;
            }
        }
    }

    /**
     * Render component tray UI
     */
    function renderComponentTray() {
        const componentList = document.getElementById('component-list');
        if (!componentList) return;

        componentList.innerHTML = '';

        componentLibrary.forEach(component => {
            const item = document.createElement('div');
            item.className = 'component-item';
            item.draggable = true;
            item.dataset.componentId = component.id;

            item.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-2xl flex-shrink-0">
                        🔧
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-white text-sm mb-1">${component.name}</h3>
                        <p class="text-xs text-gray-400 mb-2">ID: ${component.id}</p>
                        <div class="flex flex-wrap gap-1">
                            ${component.connectionPoints.map(cp =>
                                `<span class="text-xs px-2 py-0.5 bg-gray-700 rounded">${cp}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Attach drag event handlers
            attachDragHandlers(item, component);

            componentList.appendChild(item);
        });

        console.log('[PCESimulator] Component tray rendered');
    }

    // ==================== DRAG-AND-DROP ====================

    /**
     * Attach drag event handlers to component item
     */
    function attachDragHandlers(element, component) {
        element.addEventListener('dragstart', (e) => {
            console.log('[PCESimulator] Drag started:', component.id);
            isDragging = true;
            draggedComponent = component;
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', component.id);
        });

        element.addEventListener('dragend', (e) => {
            console.log('[PCESimulator] Drag ended');
            element.classList.remove('dragging');
            isDragging = false;
            draggedComponent = null;

            // Clean up ghost mesh if it exists
            if (ghostMesh) {
                ghostMesh.dispose();
                ghostMesh = null;
            }
        });
    }

    /**
     * Set up canvas drop zone
     */
    function setupCanvasDropZone() {
        const canvas = document.getElementById('babylon-canvas');
        if (!canvas) return;

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            // Update ghost mesh position if dragging
            if (isDragging && draggedComponent) {
                updateGhostMesh(e);
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('[PCESimulator] Drop on canvas');

            if (draggedComponent) {
                const pickResult = babylonScene.pick(e.offsetX, e.offsetY);
                if (pickResult.hit) {
                    placeComponentInScene(draggedComponent, pickResult.pickedPoint);
                }
            }
        });

        console.log('[PCESimulator] Canvas drop zone configured');
    }

    /**
     * Update ghost mesh position during drag (visual preview)
     */
    function updateGhostMesh(dragEvent) {
        const pickResult = babylonScene.pick(dragEvent.offsetX, dragEvent.offsetY);

        if (pickResult.hit) {
            if (!ghostMesh) {
                // Create ghost mesh on first drag-over
                createGhostMesh(draggedComponent);
            }

            if (ghostMesh) {
                ghostMesh.position = pickResult.pickedPoint.clone();
                ghostMesh.position.y += 2;  // Lift above ground

                // Check for snap points
                const snapTarget = findNearbySnapPoint(ghostMesh.position);
                if (snapTarget) {
                    // Snap ghost to target
                    ghostMesh.position = snapTarget.position.clone();
                    highlightSnapPoint(snapTarget);
                } else {
                    clearSnapHighlights();
                }
            }
        }
    }

    /**
     * Create ghost mesh for drag preview
     */
    function createGhostMesh(component) {
        // Create simple box as placeholder (real model loads after drop)
        ghostMesh = BABYLON.MeshBuilder.CreateBox(
            'ghost',
            { width: 1.5, height: 3, depth: 1.5 },
            babylonScene
        );

        // Semi-transparent material
        const ghostMaterial = new BABYLON.StandardMaterial('ghostMat', babylonScene);
        ghostMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1.0);
        ghostMaterial.alpha = 0.5;
        ghostMaterial.wireframe = true;
        ghostMesh.material = ghostMaterial;

        console.log('[PCESimulator] Ghost mesh created');
    }

    // ==================== COMPONENT PLACEMENT ====================

    /**
     * Place component in scene and load GLB model
     */
    async function placeComponentInScene(component, position) {
        console.log('[PCESimulator] Placing component:', component.id, 'at', position);

        try {
            // Check for snap target
            const snapTarget = findNearbySnapPoint(position);
            let finalPosition = position.clone();
            let snapConnection = null;

            if (snapTarget) {
                console.log('[PCESimulator] Snapping to:', snapTarget.component.id);
                finalPosition = snapTarget.position.clone();
                snapConnection = {
                    from: snapTarget.component,
                    to: component,
                    point: snapTarget.connectionPoint
                };
            }

            // Load GLB model
            const loadedMesh = await loadGLBModel(component, finalPosition);

            if (loadedMesh) {
                // Add to placed components
                placedComponents.push({
                    id: component.id,
                    name: component.name,
                    mesh: loadedMesh,
                    position: finalPosition,
                    connectionPoints: component.connectionPoints,
                    component: component
                });

                // Register connection if snapped
                if (snapConnection) {
                    connections.push(snapConnection);
                    console.log('[PCESimulator] Connection established');
                }

                updateSceneStats();
                console.log('[PCESimulator] Component placed successfully');
            }

        } catch (error) {
            console.error('[PCESimulator] Failed to place component:', error);
        }
    }

    /**
     * Load GLB model using Babylon.js SceneLoader
     */
    async function loadGLBModel(component, position) {
        console.log('[PCESimulator] Loading GLB model:', component.modelPath);

        return new Promise((resolve, reject) => {
            // In production, modelPath would be full URL to GLB file
            // For now, create placeholder geometry
            const modelUrl = component.modelPath;

            // Check if model URL is accessible
            if (modelUrl && modelUrl.startsWith('/models/')) {
                // Attempt to load real GLB
                BABYLON.SceneLoader.ImportMesh(
                    '',
                    CONFIG.API_BASE,
                    modelUrl,
                    babylonScene,
                    (meshes) => {
                        if (meshes.length > 0) {
                            const rootMesh = meshes[0];
                            rootMesh.position = position;
                            rootMesh.scaling = new BABYLON.Vector3(
                                CONFIG.COMPONENT_SCALE,
                                CONFIG.COMPONENT_SCALE,
                                CONFIG.COMPONENT_SCALE
                            );

                            // Store component data on mesh
                            rootMesh.metadata = {
                                componentId: component.id,
                                componentData: component
                            };

                            console.log('[PCESimulator] GLB model loaded');
                            resolve(rootMesh);
                        } else {
                            // Fallback to placeholder
                            resolve(createPlaceholderMesh(component, position));
                        }
                    },
                    null,
                    (scene, message, exception) => {
                        console.warn('[PCESimulator] GLB load failed, using placeholder:', message);
                        resolve(createPlaceholderMesh(component, position));
                    }
                );
            } else {
                // No model URL or local path, create placeholder
                resolve(createPlaceholderMesh(component, position));
            }
        });
    }

    /**
     * Create placeholder mesh when GLB is unavailable
     */
    function createPlaceholderMesh(component, position) {
        console.log('[PCESimulator] Creating placeholder mesh for:', component.id);

        // Different shapes for different component types
        let mesh;
        if (component.id.includes('BOP')) {
            // BOP: Cylinder
            mesh = BABYLON.MeshBuilder.CreateCylinder(
                component.id,
                { height: 4, diameter: 2 },
                babylonScene
            );
        } else if (component.id.includes('SPOOL')) {
            // Spool: Short cylinder
            mesh = BABYLON.MeshBuilder.CreateCylinder(
                component.id,
                { height: 1.5, diameter: 1.8 },
                babylonScene
            );
        } else if (component.id.includes('FLANGE')) {
            // Flange: Torus
            mesh = BABYLON.MeshBuilder.CreateTorus(
                component.id,
                { diameter: 1.8, thickness: 0.3 },
                babylonScene
            );
        } else {
            // Default: Box
            mesh = BABYLON.MeshBuilder.CreateBox(
                component.id,
                { width: 1.5, height: 3, depth: 1.5 },
                babylonScene
            );
        }

        mesh.position = position;

        // Material
        const material = new BABYLON.StandardMaterial(component.id + '_mat', babylonScene);
        material.diffuseColor = new BABYLON.Color3(0.4, 0.5, 0.6);
        material.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mesh.material = material;

        // Store component data
        mesh.metadata = {
            componentId: component.id,
            componentData: component
        };

        return mesh;
    }

    // ==================== SNAP LOGIC ====================

    /**
     * Find nearby snap point for position
     */
    function findNearbySnapPoint(position) {
        if (placedComponents.length === 0) return null;

        let closestSnap = null;
        let closestDistance = CONFIG.SNAP_DISTANCE;

        placedComponents.forEach(placed => {
            // Calculate snap positions for this component
            placed.connectionPoints.forEach(connectionPoint => {
                const snapPosition = calculateSnapPosition(placed, connectionPoint);
                const distance = BABYLON.Vector3.Distance(position, snapPosition);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSnap = {
                        component: placed,
                        connectionPoint: connectionPoint,
                        position: snapPosition
                    };
                }
            });
        });

        return closestSnap;
    }

    /**
     * Calculate snap position for connection point
     */
    function calculateSnapPosition(placedComponent, connectionPoint) {
        // Base position from component
        const basePos = placedComponent.position.clone();

        // Offset based on connection point type
        if (connectionPoint.includes('top')) {
            // Get mesh height
            const meshHeight = placedComponent.mesh.getBoundingInfo().boundingBox.extendSize.y;
            basePos.y += meshHeight * 2;
        } else if (connectionPoint.includes('bottom')) {
            const meshHeight = placedComponent.mesh.getBoundingInfo().boundingBox.extendSize.y;
            basePos.y -= meshHeight * 2;
        }
        // Add more offset logic for other connection types (side, etc.)

        return basePos;
    }

    /**
     * Highlight snap point with visual indicator
     */
    function highlightSnapPoint(snapTarget) {
        clearSnapHighlights();

        // Create highlight sphere at snap point
        const highlight = BABYLON.MeshBuilder.CreateSphere(
            'snapHighlight',
            { diameter: 0.5 },
            babylonScene
        );
        highlight.position = snapTarget.position;

        const highlightMat = new BABYLON.StandardMaterial('snapMat', babylonScene);
        highlightMat.emissiveColor = CONFIG.HIGHLIGHT_COLOR;
        highlightMat.alpha = 0.7;
        highlight.material = highlightMat;

        snapIndicators.push(highlight);
    }

    /**
     * Clear all snap point highlights
     */
    function clearSnapHighlights() {
        snapIndicators.forEach(indicator => indicator.dispose());
        snapIndicators = [];
    }

    // ==================== UI UPDATES ====================

    /**
     * Update scene statistics display
     */
    function updateSceneStats() {
        const statsComponents = document.getElementById('stat-components');
        const statsConnections = document.getElementById('stat-connections');
        const statsFPS = document.getElementById('stat-fps');

        if (statsComponents) {
            statsComponents.textContent = placedComponents.length;
        }

        if (statsConnections) {
            statsConnections.textContent = connections.length;
        }

        if (statsFPS && babylonEngine) {
            statsFPS.textContent = Math.round(babylonEngine.getFps());
        }
    }

    // ==================== MOCK DATA ====================

    /**
     * Test with mock component data (for development)
     */
    function testWithMockData() {
        console.log('[PCESimulator] Loading mock component data...');

        componentLibrary = [
            {
                id: 'BOP-5K',
                name: '5-Ram BOP',
                modelPath: '/models/pce/bop_5ram.glb',
                connectionPoints: ['flange-top', 'flange-bottom']
            },
            {
                id: 'SPOOL-10K',
                name: '10K Spacer Spool',
                modelPath: '/models/pce/spool_10k.glb',
                connectionPoints: ['flange-top', 'flange-bottom']
            },
            {
                id: 'FLANGE-ADAPT',
                name: 'Adapter Flange 5K-10K',
                modelPath: '/models/pce/flange_adapt.glb',
                connectionPoints: ['flange-5k', 'flange-10k']
            },
            {
                id: 'BOP-VALVE-HCR',
                name: 'HCR Valve Assembly',
                modelPath: '/models/pce/hcr_valve.glb',
                connectionPoints: ['flange-top', 'outlet-side']
            }
        ];

        const trayLoading = document.getElementById('tray-loading');
        const trayEmpty = document.getElementById('tray-empty');

        if (trayLoading) trayLoading.classList.add('hidden');
        if (trayEmpty) trayEmpty.classList.add('hidden');

        renderComponentTray();

        console.log('[PCESimulator] Mock data loaded successfully');
    }

    // ==================== INITIALIZATION ====================

    /**
     * Main initialization function
     */
    async function initialize() {
        console.log('[PCESimulator] Starting initialization...');

        // Step 1: Security check
        if (!verifyAuthorization()) {
            return;
        }

        // Step 2: Initialize Babylon.js
        if (!initializeBabylonEngine()) {
            console.error('[PCESimulator] Failed to initialize engine');
            return;
        }

        // Step 3: Set up canvas drop zone
        setupCanvasDropZone();

        // Step 4: Fetch component library
        await fetchComponentLibrary();

        // Step 5: Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }

        console.log('[PCESimulator] Initialization complete');
    }

    // ==================== PUBLIC API ====================

    window.PCESimulator = {
        initialize,
        testWithMockData,
        // Expose for debugging
        getScene: () => babylonScene,
        getEngine: () => babylonEngine,
        getPlacedComponents: () => placedComponents,
        getConnections: () => connections
    };

    console.log('[PCESimulator] Module loaded');

})();
