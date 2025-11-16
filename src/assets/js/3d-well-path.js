/**
 * 3D Well Path Analyzer
 * Engineering Visualization for Deviation Surveys
 *
 * Design Principles (Sprint 5):
 * 1. Audience: Rowan Ross & Dr. Isla Munro (Engineers) - 3D spatial visualization
 * 2. Security-First: Role-based access control (Engineer, Risk-Analyst, Executive)
 * 3. New Technology: VTK.js for scientific 3D visualization
 * 4. REST API: Fetch survey data with JWT authentication
 *
 * @author Sprint 5 - 3D Visualization Team
 * @spec Rowan Ross - Deviation Survey Integration
 */

(function() {
    'use strict';

    // ========================================================================
    // PRINCIPLE #2: SECURITY-FIRST - ROLE-BASED ACCESS CONTROL
    // ========================================================================

    /**
     * Verify user authorization before allowing access to this view
     * Only Engineer, Risk-Analyst, and Executive roles can access
     */
    function verifyAuthorization() {
        console.log('[3DWellPath] Verifying user authorization...');

        // Get JWT token from localStorage (Catriona's auth framework)
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.error('[3DWellPath] No JWT token found. Redirecting to login.');
            redirectToLogin('Authentication required');
            return false;
        }

        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');

        if (!userDataString) {
            console.error('[3DWellPath] No user data found. Redirecting to login.');
            redirectToLogin('User data not found');
            return false;
        }

        try {
            const userData = JSON.parse(userDataString);
            const userRole = userData.role;

            console.log('[3DWellPath] User role:', userRole);

            // Check if user has authorized role
            const authorizedRoles = ['Engineer', 'Risk-Analyst', 'Executive'];

            if (!authorizedRoles.includes(userRole)) {
                console.error('[3DWellPath] Unauthorized role:', userRole);
                redirectToUnauthorized(`Access denied. This 3D visualization is restricted to Engineer, Risk-Analyst, and Executive roles only.`);
                return false;
            }

            console.log('[3DWellPath] Authorization successful. User role:', userRole);
            return true;

        } catch (error) {
            console.error('[3DWellPath] Failed to parse user data:', error);
            redirectToLogin('Invalid user data');
            return false;
        }
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin(reason) {
        showError(`⚠️ AUTHENTICATION REQUIRED: ${reason}`);
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }

    /**
     * Show unauthorized access message
     */
    function redirectToUnauthorized(message) {
        const vtkContainer = document.getElementById('vtk-container');
        if (vtkContainer) {
            vtkContainer.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center px-8">
                        <p class="text-red-400 text-4xl font-bold mb-6">🚫 UNAUTHORIZED ACCESS</p>
                        <p class="text-slate-200 text-xl mb-4">${message}</p>
                        <p class="text-slate-400 text-lg">Your role does not have permission to view 3D well data.</p>
                        <p class="text-slate-400 text-lg mt-2">Please contact your administrator if you believe this is an error.</p>
                        <button onclick="window.location.href='/index.html'" class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            Return to Home
                        </button>
                    </div>
                </div>
            `;
        }

        // Hide control panel
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) controlPanel.style.display = 'none';
    }

    // ========================================================================
    // MAIN APPLICATION
    // ========================================================================

    let vtkRenderer = null;
    let vtkRenderWindow = null;
    let vtkRenderWindowInteractor = null;
    let currentWellId = null;
    let surveyData = null;

    /**
     * Initialize 3D Well Path Analyzer application
     */
    function init3DWellPath() {
        console.log('[3DWellPath] Initializing 3D Well Path Analyzer...');

        // PRINCIPLE #2: Verify authorization FIRST
        if (!verifyAuthorization()) {
            console.error('[3DWellPath] Authorization failed. Stopping initialization.');
            return;
        }

        // Check if VTK.js is loaded
        if (typeof vtk === 'undefined') {
            console.error('[3DWellPath] VTK.js not loaded');
            showError('VTK.js library not loaded. Please refresh the page.');
            return;
        }

        // For development: Create mock credentials if none exist
        if (!localStorage.getItem('jwtToken')) {
            console.warn('[3DWellPath] No JWT token found. Using mock credentials for development.');
            localStorage.setItem('jwtToken', 'mock-jwt-token-engineer-dev');
            localStorage.setItem('userData', JSON.stringify({
                role: 'Engineer',
                username: 'rowan.ross',
                name: 'Rowan Ross'
            }));
        }

        // PRINCIPLE #3: Initialize VTK.js renderer
        initializeVTKRenderer();

        // Setup UI event handlers
        setupEventHandlers();

        console.log('[3DWellPath] Initialized successfully');
    }

    /**
     * Initialize VTK.js renderer
     * PRINCIPLE #3: Set up 3D scientific visualization
     */
    function initializeVTKRenderer() {
        const container = document.getElementById('vtk-container');
        if (!container) {
            console.error('[3DWellPath] VTK container not found');
            return;
        }

        // Create VTK.js full screen render window
        const fullScreenRenderWindow = vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
            container: container,
            background: [0.1, 0.1, 0.2] // Dark blue background
        });

        // Get renderer and render window
        vtkRenderer = fullScreenRenderWindow.getRenderer();
        vtkRenderWindow = fullScreenRenderWindow.getRenderWindow();

        // Get interactor for mouse controls
        vtkRenderWindowInteractor = fullScreenRenderWindow.getInteractor();
        vtkRenderWindowInteractor.setInteractorStyle(
            vtk.Interaction.Style.vtkInteractorStyleTrackballCamera.newInstance()
        );

        // Set up camera
        const camera = vtkRenderer.getActiveCamera();
        camera.setPosition(5000, 5000, 5000);
        camera.setFocalPoint(0, 0, -2500);
        vtkRenderer.resetCamera();

        // Add axis widget for reference
        addAxesWidget(fullScreenRenderWindow);

        console.log('[3DWellPath] VTK.js renderer initialized');
    }

    /**
     * Add coordinate axes widget for spatial reference
     */
    function addAxesWidget(fullScreenRenderWindow) {
        const axes = vtk.Rendering.Core.vtkAnnotatedCubeActor.newInstance();
        axes.setDefaultStyle({
            text: '+X (East)',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            fontColor: 'white',
            fontSizeScale: (res) => res / 2,
            faceColor: '#ff6b6b',
            edgeThickness: 0.1,
            edgeColor: 'white',
            resolution: 400
        });

        // Set face labels
        axes.setXPlusFaceProperty({ text: '+E' });
        axes.setXMinusFaceProperty({ text: '-E' });
        axes.setYPlusFaceProperty({ text: '+N' });
        axes.setYMinusFaceProperty({ text: '-N' });
        axes.setZPlusFaceProperty({ text: 'Up' });
        axes.setZMinusFaceProperty({ text: 'Down' });

        const orientationWidget = vtk.Interaction.Widgets.vtkOrientationMarkerWidget.newInstance({
            actor: axes,
            interactor: vtkRenderWindowInteractor
        });

        orientationWidget.setEnabled(true);
        orientationWidget.setViewportCorner(
            vtk.Interaction.Widgets.vtkOrientationMarkerWidget.Corners.BOTTOM_RIGHT
        );
        orientationWidget.setViewportSize(0.15);
        orientationWidget.setMinPixelSize(100);
        orientationWidget.setMaxPixelSize(300);
    }

    /**
     * Setup UI event handlers
     */
    function setupEventHandlers() {
        // Well selector
        const wellSelector = document.getElementById('well-selector');
        if (wellSelector) {
            wellSelector.addEventListener('change', function() {
                const selectedWellId = this.value;
                if (selectedWellId) {
                    loadWellSurvey(selectedWellId);
                }
            });
        }
    }

    /**
     * Load well survey data from REST API
     * PRINCIPLE #4: REST API with JWT authentication
     */
    async function loadWellSurvey(wellId) {
        console.log('[3DWellPath] Loading survey for well:', wellId);

        currentWellId = wellId;

        // Show loading overlay
        showLoading(true);

        try {
            // Get JWT token
            const jwtToken = localStorage.getItem('jwtToken');

            // Fetch survey data from API
            const response = await fetch(`https://api.welltegra.local/v1/wells/${wellId}/survey`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            surveyData = data;

            console.log('[3DWellPath] Survey data loaded:', data.deviationSurvey.length, 'points');

            // Update survey metrics
            updateSurveyMetrics(data);

            // Process and render 3D path
            renderWellPath(data);

        } catch (error) {
            console.error('[3DWellPath] Failed to load survey data:', error);
            showAlert(`Failed to load survey data: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }

    /**
     * Update survey metrics display
     */
    function updateSurveyMetrics(data) {
        // Survey points count
        document.getElementById('survey-points').textContent = data.deviationSurvey.length;

        // Max depth
        const maxMD = Math.max(...data.deviationSurvey.map(s => s.md));
        document.getElementById('max-depth').textContent = `${maxMD.toLocaleString()} ft`;

        // Max inclination
        const maxInc = Math.max(...data.deviationSurvey.map(s => s.inclination));
        document.getElementById('max-inclination').textContent = `${maxInc.toFixed(1)}°`;
    }

    /**
     * Process deviation survey and render 3D well path
     */
    function renderWellPath(data) {
        console.log('[3DWellPath] Processing deviation survey...');

        // Convert survey data (MD, Inc, Az) to XYZ coordinates
        const xyzPoints = convertSurveyToXYZ(data.deviationSurvey);

        console.log('[3DWellPath] Converted to', xyzPoints.length, 'XYZ points');

        // Clear existing actors
        vtkRenderer.removeAllActors();

        // Create polyline from points
        const polyline = createPolyline(xyzPoints);

        // Create tube filter for better visualization
        const tubeFilter = vtk.Filters.General.vtkTubeFilter.newInstance({
            radius: 50,  // 50 ft radius tube
            numberOfSides: 12,
            capping: true
        });
        tubeFilter.setInputData(polyline);

        // Create mapper
        const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        mapper.setInputConnection(tubeFilter.getOutputPort());

        // Create actor
        const actor = vtk.Rendering.Core.vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().setColor(0.2, 0.6, 1.0); // Light blue
        actor.getProperty().setSpecular(0.5);
        actor.getProperty().setSpecularPower(20);

        // Add to renderer
        vtkRenderer.addActor(actor);

        // Reset camera to fit well path
        vtkRenderer.resetCamera();
        vtkRenderWindow.render();

        console.log('[3DWellPath] Well path rendered successfully');
    }

    /**
     * Convert deviation survey data to XYZ coordinates
     * Uses tangential method for simplicity
     *
     * Input: Array of {md, inclination, azimuth}
     * Output: Array of [x, y, z] coordinates
     *
     * Coordinate system:
     * - X = East
     * - Y = North
     * - Z = Up (negative TVD)
     */
    function convertSurveyToXYZ(survey) {
        const xyzPoints = [];

        // Start at origin
        let x = 0;  // East
        let y = 0;  // North
        let z = 0;  // TVD (negative down)

        // First point at surface
        xyzPoints.push([x, y, z]);

        // Process each survey interval
        for (let i = 1; i < survey.length; i++) {
            const prevStation = survey[i - 1];
            const currStation = survey[i];

            // Calculate delta MD
            const deltaMD = currStation.md - prevStation.md;

            // Use current station values (tangential method)
            const inc = currStation.inclination * (Math.PI / 180);  // Convert to radians
            const az = currStation.azimuth * (Math.PI / 180);       // Convert to radians

            // Calculate coordinate changes
            const deltaEast = deltaMD * Math.sin(inc) * Math.sin(az);
            const deltaNorth = deltaMD * Math.sin(inc) * Math.cos(az);
            const deltaTVD = deltaMD * Math.cos(inc);

            // Update position
            x += deltaEast;
            y += deltaNorth;
            z -= deltaTVD;  // Negative because depth increases downward

            xyzPoints.push([x, y, z]);
        }

        return xyzPoints;
    }

    /**
     * Create VTK polyline from XYZ points
     */
    function createPolyline(xyzPoints) {
        const polyData = vtk.Common.DataModel.vtkPolyData.newInstance();

        // Create points array
        const points = vtk.Common.Core.vtkPoints.newInstance();
        points.setData(Float32Array.from(xyzPoints.flat()), 3);

        // Create lines array (connect consecutive points)
        const lines = new Uint32Array(xyzPoints.length * 2);
        for (let i = 0; i < xyzPoints.length - 1; i++) {
            lines[i * 2] = i;
            lines[i * 2 + 1] = i + 1;
        }

        const cellArray = vtk.Common.Core.vtkCellArray.newInstance({
            values: lines
        });

        // Set polydata
        polyData.setPoints(points);
        polyData.setLines(cellArray);

        return polyData;
    }

    /**
     * Show/hide loading overlay
     */
    function showLoading(visible) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (visible) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }

    /**
     * Show alert message
     */
    function showAlert(message) {
        const alertBanner = document.getElementById('alert-banner');
        const alertMessage = document.getElementById('alert-message');

        if (alertBanner && alertMessage) {
            alertMessage.textContent = message;
            alertBanner.classList.add('visible');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertBanner.classList.remove('visible');
            }, 5000);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const vtkContainer = document.getElementById('vtk-container');
        if (vtkContainer) {
            vtkContainer.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center px-8">
                        <p class="text-red-400 text-2xl font-bold mb-4">⚠️ ERROR</p>
                        <p class="text-slate-300 text-lg">${message}</p>
                    </div>
                </div>
            `;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DWellPath);
    } else {
        init3DWellPath();
    }

    // Expose for debugging and testing
    window.WellPath3D = {
        getRenderer: () => vtkRenderer,
        getRenderWindow: () => vtkRenderWindow,
        getCurrentWellId: () => currentWellId,
        getSurveyData: () => surveyData,
        loadWell: loadWellSurvey,
        // Test function with mock data
        testWithMockData: function() {
            const mockData = {
                wellId: "W666",
                wellName: "The Perfect Storm",
                deviationSurvey: [
                    { md: 0, inclination: 0, azimuth: 0 },
                    { md: 1000, inclination: 5.2, azimuth: 45.1 },
                    { md: 2000, inclination: 10.4, azimuth: 46.2 },
                    { md: 3000, inclination: 15.1, azimuth: 47.0 },
                    { md: 4000, inclination: 20.5, azimuth: 48.1 },
                    { md: 5000, inclination: 25.0, azimuth: 49.2 },
                    { md: 6000, inclination: 30.0, azimuth: 50.0 }
                ]
            };

            surveyData = mockData;
            updateSurveyMetrics(mockData);
            renderWellPath(mockData);
            console.log('[3DWellPath] Mock data rendered');
        }
    };

})();
