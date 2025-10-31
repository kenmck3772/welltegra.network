/**
 * Enhanced Synthetic Data Generation for Well-Tegra Live Display
 *
 * Provides more realistic simulation data including:
 * - Realistic noise and variability
 * - Equipment-specific behaviors
 * - Weather/environmental effects
 * - Anomaly injection
 * - Enhanced sensor data
 */

class EnhancedSimulation {
    constructor() {
        this.noiseGenerators = {
            perlin: this.createPerlinNoise(),
            random: () => (Math.random() - 0.5) * 2
        };

        this.weatherState = {
            waveHeight: 2.0,
            windSpeed: 15,
            temperature: 68,
            visibility: 10,
            trending: 'stable'
        };

        this.equipmentHealth = {
            pump: 100,
            injector: 100,
            winch: 100,
            powerPack: 100
        };

        this.anomalyQueue = [];
        this.lastAnomalyTime = Date.now();
    }

    /**
     * Creates a simple Perlin-like noise generator for smoother variations
     */
    createPerlinNoise() {
        let seed = Math.random() * 100;
        return () => {
            seed += 0.1;
            return Math.sin(seed) * 0.5 + Math.cos(seed * 0.7) * 0.3;
        };
    }

    /**
     * Generates realistic sensor noise based on sensor type
     */
    addSensorNoise(value, sensorType) {
        const noiseProfiles = {
            pressure: { amplitude: 5, frequency: 0.8 },
            hookload: { amplitude: 0.5, frequency: 1.0 },
            depth: { amplitude: 2, frequency: 0.3 },
            speed: { amplitude: 3, frequency: 1.2 },
            temperature: { amplitude: 0.2, frequency: 0.1 }
        };

        const profile = noiseProfiles[sensorType] || { amplitude: 1, frequency: 1 };
        const noise = this.noiseGenerators.perlin() * profile.amplitude * profile.frequency;
        const randomNoise = this.noiseGenerators.random() * profile.amplitude * 0.3;

        return value + noise + randomNoise;
    }

    /**
     * Simulates weather effects on operations
     */
    updateWeather() {
        // Gradual weather changes
        this.weatherState.waveHeight += (Math.random() - 0.5) * 0.2;
        this.weatherState.waveHeight = Math.max(0.5, Math.min(6.0, this.weatherState.waveHeight));

        this.weatherState.windSpeed += (Math.random() - 0.5) * 2;
        this.weatherState.windSpeed = Math.max(0, Math.min(40, this.weatherState.windSpeed));

        // Determine trending
        if (this.weatherState.waveHeight > 4.5) this.weatherState.trending = 'deteriorating';
        else if (this.weatherState.waveHeight < 2.0) this.weatherState.trending = 'improving';
        else this.weatherState.trending = 'stable';

        return {
            ...this.weatherState,
            impact: this.calculateWeatherImpact()
        };
    }

    /**
     * Calculates weather impact on operations (0-1 scale)
     */
    calculateWeatherImpact() {
        const waveImpact = Math.min(1, this.weatherState.waveHeight / 5.0);
        const windImpact = Math.min(1, this.weatherState.windSpeed / 30.0);
        return (waveImpact * 0.6 + windImpact * 0.4);
    }

    /**
     * Simulates equipment degradation and recovery
     */
    updateEquipmentHealth(activeEquipment = ['pump', 'injector']) {
        for (const [equipment, health] of Object.entries(this.equipmentHealth)) {
            if (activeEquipment.includes(equipment)) {
                // Equipment degrades slowly during use
                this.equipmentHealth[equipment] = Math.max(60, health - Math.random() * 0.05);
            } else {
                // Equipment recovers when not in use
                this.equipmentHealth[equipment] = Math.min(100, health + 0.1);
            }
        }

        return { ...this.equipmentHealth };
    }

    /**
     * Injects planned anomalies for testing/demonstration
     */
    scheduleAnomaly(type, timeOffset = 0) {
        this.anomalyQueue.push({
            type,
            triggerTime: Date.now() + timeOffset,
            triggered: false
        });
    }

    /**
     * Checks and triggers anomalies
     */
    checkAnomalies(currentData) {
        const now = Date.now();
        const anomalies = [];

        // Check scheduled anomalies
        for (const anomaly of this.anomalyQueue) {
            if (!anomaly.triggered && now >= anomaly.triggerTime) {
                anomalies.push(this.generateAnomaly(anomaly.type, currentData));
                anomaly.triggered = true;
            }
        }

        // Random anomalies (low probability)
        if (now - this.lastAnomalyTime > 30000 && Math.random() < 0.02) {
            const types = ['pressure_spike', 'hookload_deviation', 'speed_variation'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            anomalies.push(this.generateAnomaly(randomType, currentData));
            this.lastAnomalyTime = now;
        }

        // Clean up triggered anomalies
        this.anomalyQueue = this.anomalyQueue.filter(a => !a.triggered);

        return anomalies;
    }

    /**
     * Generates anomaly data
     */
    generateAnomaly(type, currentData) {
        const anomalyTemplates = {
            pressure_spike: {
                severity: 'warning',
                message: `Pressure spike detected: ${(currentData.pressure + 500).toFixed(0)} psi (above normal)`,
                recommendation: 'Monitor tubing integrity. Consider reducing pump rate.',
                dataImpact: { pressure: 500 }
            },
            hookload_deviation: {
                severity: 'critical',
                message: `Hookload deviation: ${(currentData.hookload + 5).toFixed(1)} klbf (outside envelope)`,
                recommendation: 'Stop operations. Check for stuck pipe or formation issues.',
                dataImpact: { hookload: 5 }
            },
            speed_variation: {
                severity: 'info',
                message: `Line speed variation detected: ±${(Math.random() * 20).toFixed(0)} ft/min`,
                recommendation: 'Check injector/winch system. Verify power supply stability.',
                dataImpact: { speed: Math.random() * 20 - 10 }
            },
            equipment_degradation: {
                severity: 'warning',
                message: `Equipment health declining: Pump at ${this.equipmentHealth.pump.toFixed(0)}%`,
                recommendation: 'Schedule maintenance check. Monitor performance closely.',
                dataImpact: {}
            }
        };

        return {
            timestamp: new Date(),
            ...anomalyTemplates[type],
            id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Generates additional sensor data
     */
    generateAdditionalSensors(currentData) {
        return {
            torque: this.addSensorNoise(
                currentData.depth > 0 ? 5000 + currentData.depth * 0.3 : 0,
                'pressure'
            ),
            rotaryRPM: this.addSensorNoise(
                currentData.speed !== 0 ? 60 : 0,
                'speed'
            ),
            flowRate: this.addSensorNoise(
                currentData.pressure > 1000 ? 4.5 : 0,
                'speed'
            ),
            temperature: this.addSensorNoise(
                68 + (currentData.depth / 1000) * 1.5,
                'temperature'
            ),
            mudWeight: this.addSensorNoise(9.2, 'pressure'),
            pumpStrokes: currentData.pressure > 1000 ?
                Math.floor(60 + Math.random() * 10) : 0
        };
    }

    /**
     * Main update function - enhances existing simulation data
     */
    enhanceSimulationData(currentData, stepInfo) {
        // Add sensor noise to existing values
        const enhanced = {
            depth: this.addSensorNoise(currentData.depth, 'depth'),
            hookload: this.addSensorNoise(currentData.hookload, 'hookload'),
            pressure: this.addSensorNoise(currentData.pressure, 'pressure'),
            annulusPressure: this.addSensorNoise(currentData.annulusPressure, 'pressure'),
            speed: this.addSensorNoise(currentData.speed, 'speed')
        };

        // Add weather effects
        const weather = this.updateWeather();
        const weatherImpact = weather.impact;

        // Apply weather impact to operations
        if (weatherImpact > 0.7) {
            enhanced.speed *= (1 - (weatherImpact - 0.7) * 0.5);
            enhanced.nptWeather = (currentData.npt?.weather || 0) + 0.001;
        }

        // Update equipment health
        const activeEquipment = [];
        if (stepInfo?.includes('pump')) activeEquipment.push('pump');
        if (stepInfo?.includes('rih') || stepInfo?.includes('pooh')) {
            activeEquipment.push('injector', 'winch');
        }
        const equipment = this.updateEquipmentHealth(activeEquipment);

        // Apply equipment health impact
        const avgHealth = Object.values(equipment).reduce((a, b) => a + b, 0) / Object.keys(equipment).length;
        if (avgHealth < 80) {
            enhanced.speed *= (avgHealth / 100);
        }

        // Generate additional sensors
        const additionalSensors = this.generateAdditionalSensors(currentData);

        // Check for anomalies
        const anomalies = this.checkAnomalies(currentData);

        return {
            ...enhanced,
            weather,
            equipment,
            additionalSensors,
            anomalies,
            dataQuality: this.calculateDataQuality(equipment, weather)
        };
    }

    /**
     * Calculates overall data quality indicator
     */
    calculateDataQuality(equipment, weather) {
        const avgEquipmentHealth = Object.values(equipment).reduce((a, b) => a + b, 0) /
                                   Object.keys(equipment).length;
        const weatherFactor = 1 - (weather.impact * 0.3);
        const quality = (avgEquipmentHealth / 100) * weatherFactor;

        let status = 'excellent';
        if (quality < 0.95) status = 'good';
        if (quality < 0.85) status = 'fair';
        if (quality < 0.75) status = 'poor';

        return {
            score: quality * 100,
            status,
            factors: {
                equipmentHealth: avgEquipmentHealth,
                weatherConditions: weatherFactor * 100
            }
        };
    }

    /**
     * Pre-schedule a realistic set of anomalies for demonstration
     */
    scheduleRealisticAnomalies() {
        this.scheduleAnomaly('speed_variation', 15000);  // 15 seconds
        this.scheduleAnomaly('pressure_spike', 45000);   // 45 seconds
        this.scheduleAnomaly('equipment_degradation', 90000);  // 90 seconds
        this.scheduleAnomaly('hookload_deviation', 120000);  // 120 seconds
    }
}

// Export for use in main application
window.EnhancedSimulation = EnhancedSimulation;
