/**
 * WellTegra Wellbore Viewer Controller
 * Manages UI interactions, data loading, and visualization updates
 * @version 1.0.0
 */

(function() {
    'use strict';

    // State management
    let dataManager = null;
    let viewer = null;
    let currentWellId = null;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if we're on the wellbore view or it exists
        const wellboreView = document.getElementById('wellbore-view');
        if (!wellboreView) {
            console.log('Wellbore view not found, skipping initialization');
            return;
        }

        initializeWellboreViewer();
    });

    /**
     * Initialize the wellbore viewer system
     */
    function initializeWellboreViewer() {
        try {
            // Initialize data manager
            dataManager = new WellDataManager();

            // Set up event listeners
            setupEventListeners();

            // Update well list if there are already imported wells
            updateWellList();

            console.log('Wellbore viewer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize wellbore viewer:', error);
            showError('Failed to initialize wellbore viewer: ' + error.message);
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Well selection
        const wellSelect = document.getElementById('wellbore-well-select');
        if (wellSelect) {
            wellSelect.addEventListener('change', handleWellSelection);
        }

        // Load sample wells button
        const loadSampleBtn = document.getElementById('wellbore-load-sample-btn');
        if (loadSampleBtn) {
            loadSampleBtn.addEventListener('click', loadSampleWells);
        }

        // File import
        const fileInput = document.getElementById('wellbore-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileImport);
        }

        // Display options
        const showGridCheckbox = document.getElementById('wellbore-show-grid');
        if (showGridCheckbox) {
            showGridCheckbox.addEventListener('change', updateViewerOptions);
        }

        const showCasingCheckbox = document.getElementById('wellbore-show-casing');
        if (showCasingCheckbox) {
            showCasingCheckbox.addEventListener('change', updateViewerOptions);
        }

        const showMarkersCheckbox = document.getElementById('wellbore-show-markers');
        if (showMarkersCheckbox) {
            showMarkersCheckbox.addEventListener('change', updateViewerOptions);
        }

        // Export button
        const exportBtn = document.getElementById('wellbore-export-svg-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSVG);
        }
    }

    /**
     * Load sample wells from JSON file
     */
    async function loadSampleWells() {
        const statusDiv = document.getElementById('wellbore-import-status');
        const loadBtn = document.getElementById('wellbore-load-sample-btn');

        try {
            // Show loading state
            if (loadBtn) {
                loadBtn.disabled = true;
                loadBtn.textContent = 'Loading...';
            }

            showStatus('Loading sample wells...', 'info');

            // Fetch sample data
            const response = await fetch('data-well-samples.json');
            if (!response.ok) {
                throw new Error(`Failed to load sample data: ${response.statusText}`);
            }

            const data = await response.json();

            // Import each well
            let successCount = 0;
            let errorCount = 0;

            for (const well of data.wells) {
                const result = await dataManager.importWell(well, 'json');
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error(`Failed to import ${well.well_id}:`, result.error);
                }
            }

            // Update UI
            updateWellList();

            // Show success message
            showStatus(
                `Loaded ${successCount} sample well${successCount !== 1 ? 's' : ''}` +
                (errorCount > 0 ? ` (${errorCount} failed)` : ''),
                errorCount > 0 ? 'warning' : 'success'
            );

            // Auto-select first well
            const wellSelect = document.getElementById('wellbore-well-select');
            if (wellSelect && wellSelect.options.length > 1) {
                wellSelect.selectedIndex = 1; // Select first well (index 0 is placeholder)
                handleWellSelection();
            }

        } catch (error) {
            console.error('Error loading sample wells:', error);
            showStatus('Failed to load sample wells: ' + error.message, 'error');
        } finally {
            // Reset button
            if (loadBtn) {
                loadBtn.disabled = false;
                loadBtn.textContent = 'Load Sample Wells';
            }
        }
    }

    /**
     * Handle file import
     */
    async function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusDiv = document.getElementById('wellbore-import-status');

        try {
            showStatus('Importing file...', 'info');

            // Determine format from file extension
            const ext = file.name.split('.').pop().toLowerCase();
            let format = 'json';

            if (ext === 'csv') {
                format = 'csv';
            } else if (ext === 'las') {
                format = 'las';
            }

            // Import the file
            const result = await dataManager.importWell(file, format);

            if (result.success) {
                updateWellList();
                showStatus(`Successfully imported ${result.well_id}`, 'success');

                // Auto-select the imported well
                const wellSelect = document.getElementById('wellbore-well-select');
                if (wellSelect) {
                    wellSelect.value = result.well_id;
                    handleWellSelection();
                }
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error importing file:', error);
            showStatus('Import failed: ' + error.message, 'error');
        }

        // Clear file input
        event.target.value = '';
    }

    /**
     * Handle well selection change
     */
    function handleWellSelection() {
        const wellSelect = document.getElementById('wellbore-well-select');
        const wellId = wellSelect.value;

        if (!wellId) {
            clearVisualization();
            return;
        }

        const well = dataManager.getWell(wellId);
        if (!well) {
            showError('Well not found: ' + wellId);
            return;
        }

        currentWellId = wellId;

        // Update well info panel
        updateWellInfo(well);

        // Create or update visualization
        visualizeWell(well);

        // Update statistics
        updateStatistics(well);

        // Enable export button
        const exportBtn = document.getElementById('wellbore-export-svg-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
        }
    }

    /**
     * Update well information panel
     */
    function updateWellInfo(well) {
        const infoPanel = document.getElementById('wellbore-well-info');
        const fieldEl = document.getElementById('well-info-field');
        const operatorEl = document.getElementById('well-info-operator');
        const pointsEl = document.getElementById('well-info-points');

        if (fieldEl) fieldEl.textContent = well.field || '-';
        if (operatorEl) operatorEl.textContent = well.operator || '-';
        if (pointsEl) pointsEl.textContent = well.trajectory.survey_points.length.toLocaleString();

        if (infoPanel) {
            infoPanel.classList.remove('hidden');
        }
    }

    /**
     * Visualize the well
     */
    function visualizeWell(well) {
        try {
            // Get theme from body class
            const isDark = document.body.classList.contains('theme-dark');

            // Create or update viewer
            if (!viewer) {
                viewer = new WellboreViewer('wellbore-viewer-container', {
                    width: 1200,
                    height: 700,
                    theme: isDark ? 'dark' : 'light',
                    showGrid: document.getElementById('wellbore-show-grid')?.checked ?? true,
                    showCasing: document.getElementById('wellbore-show-casing')?.checked ?? true,
                    showDepthMarkers: document.getElementById('wellbore-show-markers')?.checked ?? true
                });
            }

            // Load well data
            viewer.loadData(well);

        } catch (error) {
            console.error('Error visualizing well:', error);
            showError('Visualization failed: ' + error.message);
        }
    }

    /**
     * Update statistics display
     */
    function updateStatistics(well) {
        const statsContainer = document.getElementById('wellbore-stats-container');
        if (!statsContainer) return;

        const stats = dataManager.getWellStats(well.well_id);
        if (!stats) return;

        // Update stat values
        document.getElementById('stat-max-md').textContent =
            stats.measured_depth.max.toFixed(0) + ' m';

        document.getElementById('stat-max-tvd').textContent =
            stats.tvd ? stats.tvd.max.toFixed(0) + ' m' : 'N/A';

        document.getElementById('stat-max-inc').textContent =
            stats.inclination.max.toFixed(1) + '°';

        // Calculate max lateral displacement from viewer if available
        if (viewer && viewer.trajectoryCoords) {
            const maxLateral = Math.max(...viewer.trajectoryCoords.map(p => p.lateral));
            document.getElementById('stat-max-lateral').textContent =
                maxLateral.toFixed(0) + ' m';
        } else {
            document.getElementById('stat-max-lateral').textContent = 'N/A';
        }

        // Show stats container
        statsContainer.classList.remove('hidden');
    }

    /**
     * Update well list dropdown
     */
    function updateWellList() {
        const wellSelect = document.getElementById('wellbore-well-select');
        if (!wellSelect) return;

        const wells = dataManager.getAllWells();

        // Save current selection
        const currentSelection = wellSelect.value;

        // Clear and rebuild options
        wellSelect.innerHTML = '<option value="">-- Select a well --</option>';

        wells.forEach(well => {
            const option = document.createElement('option');
            option.value = well.well_id;
            option.textContent = `${well.well_name} (${well.field})`;
            wellSelect.appendChild(option);
        });

        // Restore selection if still valid
        if (currentSelection && wells.find(w => w.well_id === currentSelection)) {
            wellSelect.value = currentSelection;
        }
    }

    /**
     * Update viewer display options
     */
    function updateViewerOptions() {
        if (!viewer) return;

        const showGrid = document.getElementById('wellbore-show-grid')?.checked ?? true;
        const showCasing = document.getElementById('wellbore-show-casing')?.checked ?? true;
        const showMarkers = document.getElementById('wellbore-show-markers')?.checked ?? true;

        viewer.updateOptions({
            showGrid: showGrid,
            showCasing: showCasing,
            showDepthMarkers: showMarkers
        });
    }

    /**
     * Export visualization as SVG
     */
    function exportSVG() {
        if (!viewer) {
            showError('No visualization to export');
            return;
        }

        try {
            const svgContent = viewer.exportSVG();

            // Create blob and download
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `wellbore_${currentWellId}_${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showStatus('SVG exported successfully', 'success');

        } catch (error) {
            console.error('Error exporting SVG:', error);
            showError('Export failed: ' + error.message);
        }
    }

    /**
     * Clear visualization
     */
    function clearVisualization() {
        if (viewer) {
            viewer.clear();
        }

        // Hide well info
        const infoPanel = document.getElementById('wellbore-well-info');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }

        // Hide stats
        const statsContainer = document.getElementById('wellbore-stats-container');
        if (statsContainer) {
            statsContainer.classList.add('hidden');
        }

        // Disable export button
        const exportBtn = document.getElementById('wellbore-export-svg-btn');
        if (exportBtn) {
            exportBtn.disabled = true;
        }

        currentWellId = null;
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('wellbore-import-status');
        if (!statusDiv) return;

        statusDiv.classList.remove('hidden');
        statusDiv.textContent = message;

        // Set color based on type
        statusDiv.classList.remove('text-green-400', 'text-red-400', 'text-yellow-400', 'text-cyan-400');

        switch (type) {
            case 'success':
                statusDiv.classList.add('text-green-400');
                break;
            case 'error':
                statusDiv.classList.add('text-red-400');
                break;
            case 'warning':
                statusDiv.classList.add('text-yellow-400');
                break;
            default:
                statusDiv.classList.add('text-cyan-400');
        }

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 5000);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        showStatus(message, 'error');
        console.error(message);
    }

    // Listen for theme changes to update viewer
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (viewer && currentWellId) {
                    const isDark = document.body.classList.contains('theme-dark');
                    viewer.updateOptions({ theme: isDark ? 'dark' : 'light' });
                }
            }
        });
    });

    // Observe theme changes on body
    if (document.body) {
        themeObserver.observe(document.body, { attributes: true });
    }

})();
