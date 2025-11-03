/**
 * WellTegra Wellbore Visualization Module
 * Provides SVG-based wellbore trajectory visualization with real-time data
 * @module wellbore-viewer
 * @version 1.0.0
 */

class WellboreViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with ID '${containerId}' not found`);
        }

        this.options = {
            width: options.width || 1200,
            height: options.height || 800,
            margin: options.margin || { top: 40, right: 100, bottom: 60, left: 100 },
            showGrid: options.showGrid !== false,
            showDepthMarkers: options.showDepthMarkers !== false,
            showCasing: options.showCasing !== false,
            animationDuration: options.animationDuration || 1000,
            theme: options.theme || 'dark',
            ...options
        };

        this.wellData = null;
        this.svg = null;
        this.scales = {};
        this.init();
    }

    /**
     * Initialize the SVG canvas and base structure
     */
    init() {
        this.container.innerHTML = '';

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'wellbore-viewer-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('class', 'wellbore-svg');

        // Apply theme
        svg.style.background = this.options.theme === 'dark' ? '#0f172a' : '#ffffff';

        // Create main group for transformations
        const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mainGroup.setAttribute('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);
        mainGroup.setAttribute('class', 'main-group');

        svg.appendChild(mainGroup);
        wrapper.appendChild(svg);
        this.container.appendChild(wrapper);

        this.svg = mainGroup;
        this.svgElement = svg;

        // Add title
        this.addTitle('Wellbore Trajectory Viewer');

        // Add legend
        this.addLegend();
    }

    /**
     * Add title to the visualization
     */
    addTitle(text) {
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', (this.options.width - this.options.margin.left - this.options.margin.right) / 2);
        title.setAttribute('y', -10);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('class', 'wellbore-title');
        title.style.fontSize = '20px';
        title.style.fontWeight = 'bold';
        title.style.fill = this.options.theme === 'dark' ? '#e2e8f0' : '#1e293b';
        title.textContent = text;
        this.svg.appendChild(title);
    }

    /**
     * Add legend to the visualization
     */
    addLegend() {
        const legendData = [
            { label: 'Wellbore Path', color: '#06b6d4', symbol: 'line' },
            { label: 'Survey Points', color: '#22d3ee', symbol: 'circle' },
            { label: 'Casing', color: '#64748b', symbol: 'rect' }
        ];

        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('class', 'legend-group');
        legendGroup.setAttribute('transform', `translate(${this.options.width - this.options.margin.right - this.options.margin.left + 20}, 0)`);

        legendData.forEach((item, i) => {
            const y = i * 30;

            // Legend symbol
            if (item.symbol === 'line') {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', y + 5);
                line.setAttribute('x2', 20);
                line.setAttribute('y2', y + 5);
                line.setAttribute('stroke', item.color);
                line.setAttribute('stroke-width', 2);
                legendGroup.appendChild(line);
            } else if (item.symbol === 'circle') {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', 10);
                circle.setAttribute('cy', y + 5);
                circle.setAttribute('r', 4);
                circle.setAttribute('fill', item.color);
                legendGroup.appendChild(circle);
            } else if (item.symbol === 'rect') {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', 0);
                rect.setAttribute('y', y);
                rect.setAttribute('width', 20);
                rect.setAttribute('height', 10);
                rect.setAttribute('fill', item.color);
                legendGroup.appendChild(rect);
            }

            // Legend text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 30);
            text.setAttribute('y', y + 10);
            text.style.fontSize = '12px';
            text.style.fill = this.options.theme === 'dark' ? '#cbd5e1' : '#475569';
            text.textContent = item.label;
            legendGroup.appendChild(text);
        });

        this.svg.appendChild(legendGroup);
    }

    /**
     * Load well trajectory data
     * @param {Object} data - Well data object with trajectory information
     */
    loadData(data) {
        this.wellData = this.validateData(data);
        this.calculateScales();
        this.render();
    }

    /**
     * Validate and normalize well data
     */
    validateData(data) {
        if (!data || !data.trajectory || !Array.isArray(data.trajectory.survey_points)) {
            throw new Error('Invalid well data: trajectory.survey_points array required');
        }

        const surveyPoints = data.trajectory.survey_points;

        if (surveyPoints.length === 0) {
            throw new Error('No survey points found in trajectory data');
        }

        // Ensure all points have required fields
        const normalized = surveyPoints.map((point, i) => ({
            measured_depth_m: point.measured_depth_m || point.md || point.depth || 0,
            inclination_deg: point.inclination_deg || point.inc || point.inclination || 0,
            azimuth_deg: point.azimuth_deg || point.azimuth || point.azi || 0,
            tvd_m: point.tvd_m || point.tvd || null,
            northing_m: point.northing_m || point.northing || point.north || null,
            easting_m: point.easting_m || point.easting || point.east || null
        }));

        return {
            well_id: data.well_id || data.wellId || 'Unknown',
            well_name: data.well_name || data.wellName || data.well_id || 'Unknown',
            field: data.field || 'Unknown Field',
            trajectory: {
                survey_points: normalized,
                total_points: normalized.length
            },
            tubular_design: data.tubular_design || null
        };
    }

    /**
     * Calculate scales for the visualization
     */
    calculateScales() {
        const points = this.wellData.trajectory.survey_points;

        // Calculate trajectory coordinates using minimum curvature method
        const coords = this.calculateTrajectoryCoordinates(points);

        // Find extents
        const depthExtent = [0, Math.max(...coords.map(p => p.tvd))];
        const lateralExtent = [
            Math.min(...coords.map(p => p.lateral)),
            Math.max(...coords.map(p => p.lateral))
        ];

        // Calculate plot dimensions
        const plotWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const plotHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

        // Create scales
        this.scales = {
            depth: {
                domain: depthExtent,
                range: [0, plotHeight],
                scale: (value) => (value - depthExtent[0]) / (depthExtent[1] - depthExtent[0]) * plotHeight
            },
            lateral: {
                domain: lateralExtent,
                range: [0, plotWidth],
                scale: (value) => (value - lateralExtent[0]) / (lateralExtent[1] - lateralExtent[0]) * plotWidth
            }
        };

        this.trajectoryCoords = coords;
    }

    /**
     * Calculate 2D trajectory coordinates from survey data
     * Uses simplified minimum curvature method
     */
    calculateTrajectoryCoordinates(surveyPoints) {
        const coords = [];
        let northing = 0;
        let easting = 0;
        let tvd = 0;

        for (let i = 0; i < surveyPoints.length; i++) {
            const point = surveyPoints[i];

            // Use provided coordinates if available
            if (point.tvd_m !== null && point.northing_m !== null && point.easting_m !== null) {
                tvd = point.tvd_m;
                northing = point.northing_m;
                easting = point.easting_m;
            } else if (i > 0) {
                // Simple calculation using inclination and azimuth
                const prevPoint = surveyPoints[i - 1];
                const md_delta = point.measured_depth_m - prevPoint.measured_depth_m;
                const avg_inc = (point.inclination_deg + prevPoint.inclination_deg) / 2 * Math.PI / 180;
                const avg_azi = (point.azimuth_deg + prevPoint.azimuth_deg) / 2 * Math.PI / 180;

                tvd += md_delta * Math.cos(avg_inc);
                northing += md_delta * Math.sin(avg_inc) * Math.cos(avg_azi);
                easting += md_delta * Math.sin(avg_inc) * Math.sin(avg_azi);
            }

            // Calculate lateral displacement (horizontal distance from wellhead)
            const lateral = Math.sqrt(northing * northing + easting * easting);

            coords.push({
                md: point.measured_depth_m,
                tvd: tvd,
                northing: northing,
                easting: easting,
                lateral: lateral,
                inclination: point.inclination_deg,
                azimuth: point.azimuth_deg
            });
        }

        return coords;
    }

    /**
     * Render the complete wellbore visualization
     */
    render() {
        if (!this.wellData || !this.trajectoryCoords) {
            console.error('No data to render');
            return;
        }

        // Clear previous render (except title and legend)
        const existingGroups = this.svg.querySelectorAll('.grid-group, .axis-group, .casing-group, .trajectory-group, .points-group, .info-group');
        existingGroups.forEach(g => g.remove());

        // Render layers in order
        if (this.options.showGrid) this.renderGrid();
        this.renderAxes();
        if (this.options.showCasing) this.renderCasing();
        this.renderTrajectory();
        this.renderSurveyPoints();
        this.renderWellInfo();
    }

    /**
     * Render grid lines
     */
    renderGrid() {
        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gridGroup.setAttribute('class', 'grid-group');

        const plotWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const plotHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

        const gridColor = this.options.theme === 'dark' ? '#1e293b' : '#e2e8f0';

        // Horizontal grid lines (depth)
        const depthTicks = 10;
        for (let i = 0; i <= depthTicks; i++) {
            const y = (i / depthTicks) * plotHeight;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', plotWidth);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', gridColor);
            line.setAttribute('stroke-width', 1);
            line.setAttribute('stroke-dasharray', '2,2');
            gridGroup.appendChild(line);
        }

        // Vertical grid lines (lateral)
        const lateralTicks = 10;
        for (let i = 0; i <= lateralTicks; i++) {
            const x = (i / lateralTicks) * plotWidth;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', plotHeight);
            line.setAttribute('stroke', gridColor);
            line.setAttribute('stroke-width', 1);
            line.setAttribute('stroke-dasharray', '2,2');
            gridGroup.appendChild(line);
        }

        this.svg.appendChild(gridGroup);
    }

    /**
     * Render axes with labels
     */
    renderAxes() {
        const axisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        axisGroup.setAttribute('class', 'axis-group');

        const plotWidth = this.options.width - this.options.margin.left - this.options.margin.right;
        const plotHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

        const axisColor = this.options.theme === 'dark' ? '#64748b' : '#475569';
        const textColor = this.options.theme === 'dark' ? '#cbd5e1' : '#475569';

        // Y-axis (Depth - TVD)
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', plotHeight);
        yAxis.setAttribute('stroke', axisColor);
        yAxis.setAttribute('stroke-width', 2);
        axisGroup.appendChild(yAxis);

        // X-axis (Lateral displacement)
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', plotHeight);
        xAxis.setAttribute('x2', plotWidth);
        xAxis.setAttribute('y2', plotHeight);
        xAxis.setAttribute('stroke', axisColor);
        xAxis.setAttribute('stroke-width', 2);
        axisGroup.appendChild(xAxis);

        // Y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -plotHeight / 2);
        yLabel.setAttribute('y', -60);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('transform', 'rotate(-90)');
        yLabel.style.fontSize = '14px';
        yLabel.style.fontWeight = '600';
        yLabel.style.fill = textColor;
        yLabel.textContent = 'True Vertical Depth (m)';
        axisGroup.appendChild(yLabel);

        // X-axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', plotWidth / 2);
        xLabel.setAttribute('y', plotHeight + 40);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.style.fontSize = '14px';
        xLabel.style.fontWeight = '600';
        xLabel.style.fill = textColor;
        xLabel.textContent = 'Lateral Displacement (m)';
        axisGroup.appendChild(xLabel);

        // Y-axis ticks and labels
        const depthTicks = 10;
        const [minDepth, maxDepth] = this.scales.depth.domain;
        for (let i = 0; i <= depthTicks; i++) {
            const depth = minDepth + (i / depthTicks) * (maxDepth - minDepth);
            const y = this.scales.depth.scale(depth);

            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', -5);
            tick.setAttribute('y1', y);
            tick.setAttribute('x2', 0);
            tick.setAttribute('y2', y);
            tick.setAttribute('stroke', axisColor);
            tick.setAttribute('stroke-width', 2);
            axisGroup.appendChild(tick);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', -10);
            label.setAttribute('y', y + 4);
            label.setAttribute('text-anchor', 'end');
            label.style.fontSize = '11px';
            label.style.fill = textColor;
            label.textContent = Math.round(depth);
            axisGroup.appendChild(label);
        }

        // X-axis ticks and labels
        const lateralTicks = 10;
        const [minLateral, maxLateral] = this.scales.lateral.domain;
        for (let i = 0; i <= lateralTicks; i++) {
            const lateral = minLateral + (i / lateralTicks) * (maxLateral - minLateral);
            const x = this.scales.lateral.scale(lateral);

            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x);
            tick.setAttribute('y1', plotHeight);
            tick.setAttribute('x2', x);
            tick.setAttribute('y2', plotHeight + 5);
            tick.setAttribute('stroke', axisColor);
            tick.setAttribute('stroke-width', 2);
            axisGroup.appendChild(tick);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', plotHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.style.fontSize = '11px';
            label.style.fill = textColor;
            label.textContent = Math.round(lateral);
            axisGroup.appendChild(label);
        }

        this.svg.appendChild(axisGroup);
    }

    /**
     * Render casing/tubulars if available
     */
    renderCasing() {
        if (!this.wellData.tubular_design || !this.wellData.tubular_design.components) {
            return;
        }

        const casingGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        casingGroup.setAttribute('class', 'casing-group');

        // Render simplified casing representation
        const components = this.wellData.tubular_design.components;

        components.forEach(component => {
            if (component.top_depth_m !== undefined && component.bottom_depth_m !== undefined) {
                const topY = this.scales.depth.scale(component.top_depth_m);
                const bottomY = this.scales.depth.scale(component.bottom_depth_m);
                const x = 10; // Fixed lateral position for casing

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x - 5);
                rect.setAttribute('y', topY);
                rect.setAttribute('width', 10);
                rect.setAttribute('height', bottomY - topY);
                rect.setAttribute('fill', '#64748b');
                rect.setAttribute('opacity', '0.5');
                rect.setAttribute('stroke', '#475569');
                rect.setAttribute('stroke-width', 1);

                // Add tooltip
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = `${component.component_type || 'Casing'}: ${component.top_depth_m}m - ${component.bottom_depth_m}m`;
                rect.appendChild(title);

                casingGroup.appendChild(rect);
            }
        });

        this.svg.appendChild(casingGroup);
    }

    /**
     * Render wellbore trajectory path
     */
    renderTrajectory() {
        const trajectoryGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        trajectoryGroup.setAttribute('class', 'trajectory-group');

        // Build path data
        let pathData = '';
        this.trajectoryCoords.forEach((point, i) => {
            const x = this.scales.lateral.scale(point.lateral);
            const y = this.scales.depth.scale(point.tvd);

            if (i === 0) {
                pathData += `M ${x} ${y} `;
            } else {
                pathData += `L ${x} ${y} `;
            }
        });

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#06b6d4');
        path.setAttribute('stroke-width', 3);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('class', 'wellbore-path');

        trajectoryGroup.appendChild(path);
        this.svg.appendChild(trajectoryGroup);
    }

    /**
     * Render survey points
     */
    renderSurveyPoints() {
        const pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pointsGroup.setAttribute('class', 'points-group');

        // Sample points for visibility (show every Nth point based on total count)
        const totalPoints = this.trajectoryCoords.length;
        const sampleRate = Math.max(1, Math.floor(totalPoints / 50)); // Show max 50 points

        this.trajectoryCoords.forEach((point, i) => {
            if (i % sampleRate !== 0 && i !== 0 && i !== totalPoints - 1) return; // Always show first and last

            const x = this.scales.lateral.scale(point.lateral);
            const y = this.scales.depth.scale(point.tvd);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', '#22d3ee');
            circle.setAttribute('stroke', '#0891b2');
            circle.setAttribute('stroke-width', 1);
            circle.setAttribute('class', 'survey-point');
            circle.style.cursor = 'pointer';

            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `MD: ${point.md.toFixed(1)}m | TVD: ${point.tvd.toFixed(1)}m | Inc: ${point.inclination.toFixed(1)}° | Lateral: ${point.lateral.toFixed(1)}m`;
            circle.appendChild(title);

            // Add hover effect
            circle.addEventListener('mouseenter', function() {
                this.setAttribute('r', 6);
                this.setAttribute('fill', '#67e8f9');
            });
            circle.addEventListener('mouseleave', function() {
                this.setAttribute('r', 4);
                this.setAttribute('fill', '#22d3ee');
            });

            pointsGroup.appendChild(circle);
        });

        this.svg.appendChild(pointsGroup);
    }

    /**
     * Render well information panel
     */
    renderWellInfo() {
        const infoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        infoGroup.setAttribute('class', 'info-group');
        infoGroup.setAttribute('transform', 'translate(20, 20)');

        const infoBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        infoBg.setAttribute('x', 0);
        infoBg.setAttribute('y', 0);
        infoBg.setAttribute('width', 250);
        infoBg.setAttribute('height', 120);
        infoBg.setAttribute('fill', this.options.theme === 'dark' ? '#1e293b' : '#f8fafc');
        infoBg.setAttribute('stroke', this.options.theme === 'dark' ? '#334155' : '#cbd5e1');
        infoBg.setAttribute('stroke-width', 1);
        infoBg.setAttribute('rx', 8);
        infoBg.setAttribute('opacity', '0.95');
        infoGroup.appendChild(infoBg);

        const textColor = this.options.theme === 'dark' ? '#e2e8f0' : '#1e293b';
        const labelColor = this.options.theme === 'dark' ? '#94a3b8' : '#64748b';

        const infoLines = [
            { label: 'Well:', value: this.wellData.well_name, y: 20 },
            { label: 'Field:', value: this.wellData.field, y: 40 },
            { label: 'Total MD:', value: `${Math.max(...this.trajectoryCoords.map(p => p.md)).toFixed(0)} m`, y: 60 },
            { label: 'Max TVD:', value: `${Math.max(...this.trajectoryCoords.map(p => p.tvd)).toFixed(0)} m`, y: 80 },
            { label: 'Max Inc:', value: `${Math.max(...this.trajectoryCoords.map(p => p.inclination)).toFixed(1)}°`, y: 100 }
        ];

        infoLines.forEach(line => {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', 10);
            label.setAttribute('y', line.y);
            label.style.fontSize = '12px';
            label.style.fontWeight = '600';
            label.style.fill = labelColor;
            label.textContent = line.label;
            infoGroup.appendChild(label);

            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', 80);
            value.setAttribute('y', line.y);
            value.style.fontSize = '12px';
            value.style.fill = textColor;
            value.textContent = line.value;
            infoGroup.appendChild(value);
        });

        this.svg.appendChild(infoGroup);
    }

    /**
     * Export visualization as SVG string
     */
    exportSVG() {
        return this.svgElement.outerHTML;
    }

    /**
     * Export visualization as PNG (requires html2canvas)
     */
    async exportPNG() {
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library required for PNG export');
        }

        const canvas = await html2canvas(this.svgElement);
        return canvas.toDataURL('image/png');
    }

    /**
     * Clear the visualization
     */
    clear() {
        this.init();
        this.wellData = null;
        this.trajectoryCoords = null;
    }

    /**
     * Update viewer options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        if (this.wellData) {
            this.render();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WellboreViewer;
}
