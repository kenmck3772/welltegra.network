/**
 * Welltegra 3D Wellbore Visualization
 * Renders survey data in 3D perspective with rotation and live updates
 */

class Wellbore3D {
    constructor(svgId, prefix) {
        this.svg = document.getElementById(svgId);
        this.prefix = prefix; // 'planner' or 'performer'
        this.rotationAngle = 45; // degrees
        this.isRotating = false;
        this.rotationInterval = null;
        this.surveyData = [];

        // SVG dimensions
        this.width = 800;
        this.height = 400;
        this.centerX = 400;
        this.centerY = 200;

        this.init();
    }

    init() {
        this.drawGrid();
        this.loadSampleData();
        this.setupControls();
        this.render();
    }

    /**
     * Load sample survey data (Build & Hold trajectory)
     */
    loadSampleData() {
        this.surveyData = [
            { md: 0, inc: 0, azi: 0 },
            { md: 1000, inc: 2.3, azi: 45.2 },
            { md: 2000, inc: 5.8, azi: 48.7 },
            { md: 3000, inc: 12.4, azi: 52.1 },
            { md: 4000, inc: 18.9, azi: 55.8 },
            { md: 5000, inc: 25.2, azi: 58.4 },
            { md: 6000, inc: 31.8, azi: 61.2 },
            { md: 7000, inc: 38.5, azi: 63.9 },
            { md: 8000, inc: 45.3, azi: 66.5 },
            { md: 8536, inc: 48.2, azi: 67.8 }
        ];

        // Calculate 3D coordinates
        this.calculate3DCoordinates();
    }

    /**
     * Calculate TVD, N, E coordinates using minimum curvature
     */
    calculate3DCoordinates() {
        for (let i = 0; i < this.surveyData.length; i++) {
            const point = this.surveyData[i];

            if (i === 0) {
                point.tvd = 0;
                point.north = 0;
                point.east = 0;
            } else {
                const prev = this.surveyData[i - 1];
                const dMD = point.md - prev.md;

                // Convert to radians
                const inc1 = prev.inc * Math.PI / 180;
                const inc2 = point.inc * Math.PI / 180;
                const azi1 = prev.azi * Math.PI / 180;
                const azi2 = point.azi * Math.PI / 180;

                // Minimum curvature method
                const cosDL = Math.sin(inc1) * Math.sin(inc2) * Math.cos(azi2 - azi1) +
                             Math.cos(inc1) * Math.cos(inc2);
                const DL = Math.acos(Math.min(1, Math.max(-1, cosDL)));
                const RF = (DL > 1e-6) ? (2 / DL) * Math.tan(DL / 2) : 1;

                const dNorth = 0.5 * dMD * RF * (Math.sin(inc1) * Math.cos(azi1) + Math.sin(inc2) * Math.cos(azi2));
                const dEast = 0.5 * dMD * RF * (Math.sin(inc1) * Math.sin(azi1) + Math.sin(inc2) * Math.sin(azi2));
                const dTVD = 0.5 * dMD * RF * (Math.cos(inc1) + Math.cos(inc2));

                point.tvd = prev.tvd + dTVD;
                point.north = prev.north + dNorth;
                point.east = prev.east + dEast;
            }
        }
    }

    /**
     * Project 3D coordinates to 2D with rotation
     */
    project3D(tvd, north, east) {
        // Find bounds for scaling
        const maxTVD = Math.max(...this.surveyData.map(p => p.tvd));
        const maxNorth = Math.max(...this.surveyData.map(p => Math.abs(p.north)));
        const maxEast = Math.max(...this.surveyData.map(p => Math.abs(p.east)));
        const maxHorizontal = Math.max(maxNorth, maxEast);

        // Scale factors
        const scaleH = 250 / Math.max(maxHorizontal, 1000); // Horizontal scale
        const scaleV = 300 / Math.max(maxTVD, 8000); // Vertical scale

        // Apply rotation around vertical axis
        const angleRad = this.rotationAngle * Math.PI / 180;
        const rotatedNorth = north * Math.cos(angleRad) - east * Math.sin(angleRad);
        const rotatedEast = north * Math.sin(angleRad) + east * Math.cos(angleRad);

        // 3D to 2D isometric projection
        const x = this.centerX + (rotatedEast * scaleH) + (rotatedNorth * scaleH * 0.5);
        const y = this.centerY + (tvd * scaleV) - (rotatedNorth * scaleH * 0.3);

        return { x, y };
    }

    /**
     * Draw 3D grid
     */
    drawGrid() {
        const gridGroup = document.getElementById(`${this.prefix}-3d-grid`);
        if (!gridGroup) return;

        gridGroup.innerHTML = ''; // Clear existing grid

        // Vertical grid lines (depth)
        for (let d = 0; d <= 8000; d += 2000) {
            const top = this.project3D(d, -1000, -1000);
            const bottom = this.project3D(d, 1000, 1000);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', top.x);
            line.setAttribute('y1', top.y);
            line.setAttribute('x2', bottom.x);
            line.setAttribute('y2', bottom.y);
            line.setAttribute('stroke', '#475569');
            line.setAttribute('stroke-width', '1');
            gridGroup.appendChild(line);
        }

        // Horizontal grid lines
        for (let i = -1000; i <= 1000; i += 500) {
            const start = this.project3D(0, i, -1000);
            const end = this.project3D(8000, i, 1000);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', start.x);
            line.setAttribute('y1', start.y);
            line.setAttribute('x2', end.x);
            line.setAttribute('y2', end.y);
            line.setAttribute('stroke', '#334155');
            line.setAttribute('stroke-width', '0.5');
            gridGroup.appendChild(line);
        }
    }

    /**
     * Render the wellbore path
     */
    render() {
        const pathElement = document.getElementById(`${this.prefix}-wellbore-path`);
        const markersGroup = document.getElementById(`${this.prefix}-depth-markers`);

        if (!pathElement) return;

        // Build SVG path
        let pathData = '';
        this.surveyData.forEach((point, index) => {
            const projected = this.project3D(point.tvd, point.north, point.east);

            if (index === 0) {
                pathData += `M ${projected.x} ${projected.y} `;
            } else {
                pathData += `L ${projected.x} ${projected.y} `;
            }
        });

        pathElement.setAttribute('d', pathData);

        // Add depth markers
        if (markersGroup) {
            markersGroup.innerHTML = '';

            this.surveyData.forEach((point, index) => {
                if (point.md % 2000 === 0 || index === this.surveyData.length - 1) {
                    const projected = this.project3D(point.tvd, point.north, point.east);

                    // Marker circle
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', projected.x);
                    circle.setAttribute('cy', projected.y);
                    circle.setAttribute('r', '4');
                    circle.setAttribute('fill', '#06b6d4');
                    circle.setAttribute('stroke', '#fff');
                    circle.setAttribute('stroke-width', '1');
                    markersGroup.appendChild(circle);

                    // Depth label
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', projected.x + 10);
                    text.setAttribute('y', projected.y + 4);
                    text.setAttribute('fill', '#94a3b8');
                    text.setAttribute('font-size', '10');
                    text.textContent = `${point.md.toLocaleString()} ft`;
                    markersGroup.appendChild(text);
                }
            });
        }

        this.drawGrid();
    }

    /**
     * Update live position (for performer view)
     */
    updateLivePosition(currentDepth, inclination) {
        const posGroup = document.getElementById(`${this.prefix}-current-position-group`);
        if (!posGroup) return;

        // Find interpolated position
        let position = null;
        for (let i = 0; i < this.surveyData.length - 1; i++) {
            if (currentDepth >= this.surveyData[i].md && currentDepth <= this.surveyData[i + 1].md) {
                const ratio = (currentDepth - this.surveyData[i].md) / (this.surveyData[i + 1].md - this.surveyData[i].md);
                const tvd = this.surveyData[i].tvd + ratio * (this.surveyData[i + 1].tvd - this.surveyData[i].tvd);
                const north = this.surveyData[i].north + ratio * (this.surveyData[i + 1].north - this.surveyData[i].north);
                const east = this.surveyData[i].east + ratio * (this.surveyData[i + 1].east - this.surveyData[i].east);
                position = { tvd, north, east };
                break;
            }
        }

        if (position) {
            const projected = this.project3D(position.tvd, position.north, position.east);
            posGroup.setAttribute('transform', `translate(${projected.x}, ${projected.y})`);
            posGroup.setAttribute('opacity', '1');

            // Update live info
            const depthEl = document.getElementById(`${this.prefix}-live-depth`);
            const incEl = document.getElementById(`${this.prefix}-live-inc`);
            if (depthEl) depthEl.textContent = `${currentDepth.toLocaleString()} ft MD`;
            if (incEl) incEl.textContent = `${inclination.toFixed(1)}°`;
        }
    }

    /**
     * Setup rotation and reset controls
     */
    setupControls() {
        const rotateBtn = document.getElementById(`${this.prefix}-3d-rotate-btn`);
        const resetBtn = document.getElementById(`${this.prefix}-3d-reset-btn`);
        const angleDisplay = document.getElementById(`${this.prefix}-view-angle`);

        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                this.isRotating = !this.isRotating;

                if (this.isRotating) {
                    rotateBtn.classList.add('bg-purple-600', 'animate-spin');
                    rotateBtn.classList.remove('bg-purple-600/50');
                    this.startRotation();
                } else {
                    rotateBtn.classList.remove('bg-purple-600', 'animate-spin');
                    rotateBtn.classList.add('bg-purple-600/50');
                    this.stopRotation();
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.rotationAngle = 45;
                this.isRotating = false;
                if (rotateBtn) {
                    rotateBtn.classList.remove('bg-purple-600', 'animate-spin');
                    rotateBtn.classList.add('bg-purple-600/50');
                }
                this.stopRotation();
                this.render();
                if (angleDisplay) angleDisplay.textContent = '45°';
            });
        }
    }

    /**
     * Start automatic rotation animation
     */
    startRotation() {
        const angleDisplay = document.getElementById(`${this.prefix}-view-angle`);

        this.rotationInterval = setInterval(() => {
            this.rotationAngle = (this.rotationAngle + 1) % 360;
            this.render();
            if (angleDisplay) {
                angleDisplay.textContent = `${Math.round(this.rotationAngle)}°`;
            }
        }, 50); // 20 FPS
    }

    /**
     * Stop automatic rotation
     */
    stopRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }
}

// Initialize 3D visualizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize planner 3D view
    const plannerSvg = document.getElementById('planner-wellbore-3d-svg');
    if (plannerSvg) {
        window.planner3D = new Wellbore3D('planner-wellbore-3d-svg', 'planner');
    }

    // Initialize performer 3D view
    const performerSvg = document.getElementById('performer-wellbore-3d-svg');
    if (performerSvg) {
        window.performer3D = new Wellbore3D('performer-wellbore-3d-svg', 'performer');
    }

    // Hook into simulation updates for live display
    setupSimulationIntegration();
});

/**
 * Integrate with simulation system for live updates
 */
function setupSimulationIntegration() {
    // Poll for depth updates from the simulation
    setInterval(() => {
        // Try to get current depth from survey depth display element
        const depthElement = document.getElementById('current-survey-depth');
        if (depthElement && window.performer3D) {
            const depthText = depthElement.textContent || '';
            const depthMatch = depthText.match(/[\d,]+/);
            if (depthMatch) {
                const currentDepth = parseInt(depthMatch[0].replace(/,/g, ''));

                // Find corresponding inclination
                let inclination = 0;
                const surveyData = window.performer3D.surveyData;
                for (let i = 0; i < surveyData.length - 1; i++) {
                    if (currentDepth >= surveyData[i].md && currentDepth <= surveyData[i + 1].md) {
                        const ratio = (currentDepth - surveyData[i].md) / (surveyData[i + 1].md - surveyData[i].md);
                        inclination = surveyData[i].inc + ratio * (surveyData[i + 1].inc - surveyData[i].inc);
                        break;
                    }
                }

                window.performer3D.updateLivePosition(currentDepth, inclination);
            }
        }
    }, 500); // Update every 500ms for smooth animation
}

// Global function to update performer 3D view from anywhere
window.update3DPerformerDepth = function(depth, inclination) {
    if (window.performer3D) {
        window.performer3D.updateLivePosition(depth, inclination);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wellbore3D;
}
