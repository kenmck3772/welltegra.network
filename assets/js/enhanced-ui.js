/**
 * Enhanced UI Components for Well-Tegra Live Display
 *
 * Provides additional visual components for displaying enhanced simulation data
 */

class EnhancedUI {
    constructor() {
        this.anomalyContainer = null;
        this.weatherCard = null;
        this.equipmentHealthCard = null;
        this.additionalSensorsCard = null;
        this.dataQualityIndicator = null;
    }

    /**
     * Initialize all enhanced UI components
     */
    initialize() {
        this.createWeatherCard();
        this.createEquipmentHealthCard();
        this.createAdditionalSensorsCard();
        this.createDataQualityIndicator();
        this.enhanceAnomalyDetection();
    }

    /**
     * Create weather conditions card
     */
    createWeatherCard() {
        // Find a good place to insert the weather card
        const kpiGrid = document.getElementById('kpi-grid');
        if (!kpiGrid) return;

        // Create weather card element
        const weatherCard = document.createElement('div');
        weatherCard.id = 'weather-card';
        weatherCard.className = 'bg-slate-800/50 rounded-lg p-4 col-span-2 md:col-span-1';
        weatherCard.innerHTML = `
            <h3 class="text-sm font-semibold mb-3 text-slate-300 flex items-center">
                <span class="text-xl mr-2">🌊</span>
                Weather Conditions
            </h3>
            <div class="space-y-2">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Wave Height:</span>
                    <span id="weather-waves" class="font-semibold text-slate-200">--</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Wind Speed:</span>
                    <span id="weather-wind" class="font-semibold text-slate-200">--</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-slate-400">Status:</span>
                    <span id="weather-status" class="font-semibold">--</span>
                </div>
                <div class="mt-2">
                    <div class="text-xs text-slate-400 mb-1">Impact</div>
                    <div class="w-full bg-slate-700 rounded-full h-2">
                        <div id="weather-impact-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" data-width="0"></div>
                    </div>
                </div>
            </div>
        `;

        // Insert after KPI grid
        kpiGrid.parentNode.insertBefore(weatherCard, kpiGrid.nextSibling);
        this.weatherCard = weatherCard;
    }

    /**
     * Create equipment health monitoring card
     */
    createEquipmentHealthCard() {
        const performerView = document.getElementById('performer-view');
        if (!performerView) return;

        const container = performerView.querySelector('.dashboard-grid > .flex.flex-col');
        if (!container) return;

        const healthCard = document.createElement('div');
        healthCard.id = 'equipment-health-card';
        healthCard.className = 'bg-slate-800/50 rounded-lg p-4';
        healthCard.innerHTML = `
            <h3 class="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">
                🔧 Equipment Health
            </h3>
            <div class="grid grid-cols-2 gap-3" id="equipment-health-items"></div>
        `;

        container.appendChild(healthCard);
        this.equipmentHealthCard = healthCard;
    }

    /**
     * Create additional sensors display
     */
    createAdditionalSensorsCard() {
        const chartCard = document.getElementById('chart-card');
        if (!chartCard) return;

        const sensorsCard = document.createElement('div');
        sensorsCard.id = 'additional-sensors-card';
        sensorsCard.className = 'bg-slate-800/50 rounded-lg p-4';
        sensorsCard.innerHTML = `
            <h3 class="text-lg font-semibold mb-3 border-b border-slate-700 pb-2">
                📊 Additional Sensors
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">Torque</div>
                    <div class="text-lg font-bold" id="sensor-torque">-- <span class="text-xs text-slate-400">ft-lbs</span></div>
                </div>
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">RPM</div>
                    <div class="text-lg font-bold" id="sensor-rpm">-- <span class="text-xs text-slate-400">rpm</span></div>
                </div>
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">Flow Rate</div>
                    <div class="text-lg font-bold" id="sensor-flow">-- <span class="text-xs text-slate-400">bpm</span></div>
                </div>
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">Temp</div>
                    <div class="text-lg font-bold" id="sensor-temp">-- <span class="text-xs text-slate-400">°F</span></div>
                </div>
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">Mud Weight</div>
                    <div class="text-lg font-bold" id="sensor-mudweight">-- <span class="text-xs text-slate-400">ppg</span></div>
                </div>
                <div class="sensor-item">
                    <div class="text-xs text-slate-400">Pump SPM</div>
                    <div class="text-lg font-bold" id="sensor-pumpspm">-- <span class="text-xs text-slate-400">spm</span></div>
                </div>
            </div>
        `;

        chartCard.parentNode.insertBefore(sensorsCard, chartCard.nextSibling);
        this.additionalSensorsCard = sensorsCard;
    }

    /**
     * Create data quality indicator
     */
    createDataQualityIndicator() {
        const performerView = document.getElementById('performer-view');
        if (!performerView) return;

        const header = performerView.querySelector('#procedure-panel h2');
        if (!header) return;

        const indicator = document.createElement('div');
        indicator.id = 'data-quality-indicator';
        indicator.className = 'text-xs mt-2 flex items-center gap-2';
        indicator.innerHTML = `
            <span class="text-slate-400">Data Quality:</span>
            <div class="flex items-center gap-1">
                <div id="quality-dot" class="w-2 h-2 rounded-full bg-green-500"></div>
                <span id="quality-text" class="font-semibold text-green-400">Excellent</span>
                <span id="quality-score" class="text-slate-500">(--)</span>
            </div>
        `;

        header.parentNode.insertBefore(indicator, header.nextSibling);
        this.dataQualityIndicator = indicator;
    }

    /**
     * Enhance anomaly detection display
     */
    enhanceAnomalyDetection() {
        const anomalyContainer = document.getElementById('anomaly-alerts');
        if (!anomalyContainer) return;

        this.anomalyContainer = anomalyContainer;
        // Clear placeholder
        anomalyContainer.innerHTML = '';
    }

    /**
     * Update weather display
     */
    updateWeather(weatherData) {
        if (!this.weatherCard) return;

        document.getElementById('weather-waves').textContent = `${weatherData.waveHeight.toFixed(1)} m`;
        document.getElementById('weather-wind').textContent = `${weatherData.windSpeed.toFixed(0)} mph`;

        const statusEl = document.getElementById('weather-status');
        statusEl.textContent = weatherData.trending;
        statusEl.className = 'font-semibold ' +
            (weatherData.trending === 'deteriorating' ? 'text-red-400' :
             weatherData.trending === 'improving' ? 'text-green-400' :
             'text-yellow-400');

        const impactBar = document.getElementById('weather-impact-bar');
        const impactPercent = weatherData.impact * 100;
        impactBar.style.setProperty('--bar-width', `${impactPercent}%`);
        impactBar.className = `h-2 rounded-full transition-all duration-300 ${
            impactPercent > 70 ? 'bg-red-500' :
            impactPercent > 40 ? 'bg-yellow-500' :
            'bg-green-500'
        }`;
    }

    /**
     * Update equipment health display
     */
    updateEquipmentHealth(equipmentData) {
        if (!this.equipmentHealthCard) return;

        const container = document.getElementById('equipment-health-items');
        if (!container) return;

        container.innerHTML = Object.entries(equipmentData).map(([name, health]) => `
            <div class="equipment-health-item">
                <div class="text-xs text-slate-400 capitalize">${name}</div>
                <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 bg-slate-700 rounded-full h-2">
                        <div class="equipment-health-bar h-2 rounded-full transition-all duration-300 ${
                            health > 90 ? 'bg-green-500' :
                            health > 75 ? 'bg-yellow-500' :
                            health > 60 ? 'bg-orange-500' :
                            'bg-red-500'
                        }" data-width="${health}"></div>
                    </div>
                    <span class="text-xs font-semibold ${
                        health > 90 ? 'text-green-400' :
                        health > 75 ? 'text-yellow-400' :
                        health > 60 ? 'text-orange-400' :
                        'text-red-400'
                    }">${health.toFixed(0)}%</span>
                </div>
            </div>
        `).join('');

        // Apply widths using CSS custom properties (CSP compliant)
        container.querySelectorAll('.equipment-health-bar').forEach(bar => {
            const width = bar.getAttribute('data-width');
            if (width !== null) {
                bar.style.setProperty('--bar-width', `${width}%`);
            }
        });
    }

    /**
     * Update additional sensors display
     */
    updateAdditionalSensors(sensorsData) {
        if (!this.additionalSensorsCard) return;

        const updates = {
            'sensor-torque': sensorsData.torque.toFixed(0),
            'sensor-rpm': sensorsData.rotaryRPM.toFixed(0),
            'sensor-flow': sensorsData.flowRate.toFixed(1),
            'sensor-temp': sensorsData.temperature.toFixed(0),
            'sensor-mudweight': sensorsData.mudWeight.toFixed(1),
            'sensor-pumpspm': sensorsData.pumpStrokes
        };

        for (const [id, value] of Object.entries(updates)) {
            const el = document.getElementById(id);
            if (el) {
                // Update only the text content, preserving the units span
                el.childNodes[0].textContent = value + ' ';
            }
        }
    }

    /**
     * Update data quality indicator
     */
    updateDataQuality(qualityData) {
        if (!this.dataQualityIndicator) return;

        const dot = document.getElementById('quality-dot');
        const text = document.getElementById('quality-text');
        const score = document.getElementById('quality-score');

        const colorMap = {
            excellent: { dot: 'bg-green-500', text: 'text-green-400' },
            good: { dot: 'bg-blue-500', text: 'text-blue-400' },
            fair: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
            poor: { dot: 'bg-red-500', text: 'text-red-400' }
        };

        const colors = colorMap[qualityData.status] || colorMap.good;

        dot.className = `w-2 h-2 rounded-full ${colors.dot}`;
        text.className = `font-semibold ${colors.text}`;
        text.textContent = qualityData.status.charAt(0).toUpperCase() + qualityData.status.slice(1);
        score.textContent = `(${qualityData.score.toFixed(0)}%)`;
    }

    /**
     * Display anomaly alerts
     */
    displayAnomalies(anomalies) {
        if (!this.anomalyContainer || anomalies.length === 0) return;

        anomalies.forEach(anomaly => {
            // Check if this anomaly is already displayed
            if (document.getElementById(anomaly.id)) return;

            const severityConfig = {
                critical: { icon: '🚨', color: 'red', border: 'border-red-500' },
                warning: { icon: '⚠️', color: 'yellow', border: 'border-yellow-500' },
                info: { icon: 'ℹ️', color: 'blue', border: 'border-blue-500' }
            };

            const config = severityConfig[anomaly.severity] || severityConfig.info;

            const alertDiv = document.createElement('div');
            alertDiv.id = anomaly.id;
            alertDiv.className = `anomaly-alert bg-slate-900/80 border-l-4 ${config.border} rounded-lg p-3 mb-3 animate-fade-in`;
            alertDiv.innerHTML = `
                <div class="flex items-start gap-3">
                    <span class="text-2xl">${config.icon}</span>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-semibold text-${config.color}-400 text-sm uppercase">${anomaly.severity}</span>
                            <span class="text-xs text-slate-500">${anomaly.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p class="text-sm text-slate-200 mb-2">${anomaly.message}</p>
                        <p class="text-xs text-slate-400 italic">💡 ${anomaly.recommendation}</p>
                    </div>
                    <button class="text-slate-500 hover:text-slate-300 transition" onclick="this.parentElement.parentElement.remove()">
                        ✕
                    </button>
                </div>
            `;

            this.anomalyContainer.prepend(alertDiv);

            // Auto-remove info alerts after 30 seconds
            if (anomaly.severity === 'info') {
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 30000);
            }
        });

        // Limit to max 10 alerts
        const alerts = this.anomalyContainer.querySelectorAll('.anomaly-alert');
        if (alerts.length > 10) {
            alerts[alerts.length - 1].remove();
        }
    }

    /**
     * Update all enhanced UI components
     */
    updateAll(enhancedData) {
        if (enhancedData.weather) {
            this.updateWeather(enhancedData.weather);
        }

        if (enhancedData.equipment) {
            this.updateEquipmentHealth(enhancedData.equipment);
        }

        if (enhancedData.additionalSensors) {
            this.updateAdditionalSensors(enhancedData.additionalSensors);
        }

        if (enhancedData.dataQuality) {
            this.updateDataQuality(enhancedData.dataQuality);
        }

        if (enhancedData.anomalies && enhancedData.anomalies.length > 0) {
            this.displayAnomalies(enhancedData.anomalies);
        }
    }
}

// Export for use in main application
window.EnhancedUI = EnhancedUI;
