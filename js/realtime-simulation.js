/**
 * @file Real-time data simulation for WellTegra platform
 * Provides realistic drilling and intervention parameter simulation
 */

// Real-time data simulation configuration
const SIMULATION_CONFIG = {
    updateInterval: 2000, // 2 seconds
    chartUpdateInterval: 1000, // 1 second for chart updates
    maxDataPoints: 50, // Keep last 50 data points for charts
    volatility: {
        pressure: 0.15,
        temperature: 0.08,
        flow: 0.25,
        tension: 0.12,
        torque: 0.18
    }
};

// Base operating parameters for different well types
const BASE_PARAMETERS = {
    'WT-666': {
        tubingPressure: 2450, // psi
        casingPressure: 1850, // psi
        temperature: 185, // °F
        flowRate: 0, // bbl/min (shut in)
        tubingTension: 15000, // lbs
        rotaryTorque: 0, // ft-lbs
        hookLoad: 45000, // lbs
        depth: 8500, // ft (current tool position)
        rpm: 0,
        weightOnBit: 0
    },
    'KS-77': {
        tubingPressure: 2200,
        casingPressure: 1650,
        temperature: 175,
        flowRate: 850,
        tubingTension: 18000,
        rotaryTorque: 1200,
        hookLoad: 52000,
        depth: 14500,
        rpm: 45,
        weightOnBit: 8000
    }
};

// Alert thresholds for different parameters
const ALERT_THRESHOLDS = {
    pressure: { warning: 2800, critical: 3200 },
    temperature: { warning: 200, critical: 225 },
    tension: { warning: 22000, critical: 25000 },
    torque: { warning: 1800, critical: 2200 }
};

class RealTimeSimulation {
    constructor() {
        this.isRunning = false;
        this.currentWell = 'WT-666';
        this.data = {
            timestamp: [],
            tubingPressure: [],
            casingPressure: [],
            temperature: [],
            flowRate: [],
            tubingTension: [],
            rotaryTorque: [],
            hookLoad: [],
            depth: [],
            rpm: [],
            weightOnBit: []
        };
        this.alerts = [];
        this.listeners = new Map();
    }

    start(wellId = 'WT-666') {
        this.currentWell = wellId;
        this.isRunning = true;
        console.log('Starting real-time simulation for well:', wellId);
        
        // Initialize with base parameters
        this.initializeData();
        
        // Start simulation loops
        this.dataInterval = setInterval(() => this.updateData(), SIMULATION_CONFIG.updateInterval);
        this.chartInterval = setInterval(() => this.updateCharts(), SIMULATION_CONFIG.chartUpdateInterval);
        
        // Emit start event
        this.emit('simulationStarted', { wellId, timestamp: new Date() });
    }

    stop() {
        this.isRunning = false;
        if (this.dataInterval) clearInterval(this.dataInterval);
        if (this.chartInterval) clearInterval(this.chartInterval);
        console.log('Real-time simulation stopped');
        
        this.emit('simulationStopped', { timestamp: new Date() });
    }

    initializeData() {
        const baseParams = BASE_PARAMETERS[this.currentWell];
        const now = new Date();
        
        // Initialize with 10 data points
        for (let i = 9; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * SIMULATION_CONFIG.updateInterval));
            this.data.timestamp.push(timestamp);
            
            Object.keys(baseParams).forEach(param => {
                if (!this.data[param]) this.data[param] = [];
                this.data[param].push(baseParams[param]);
            });
        }
    }

    updateData() {
        if (!this.isRunning) return;

        const baseParams = BASE_PARAMETERS[this.currentWell];
        const now = new Date();
        
        // Add new timestamp
        this.data.timestamp.push(now);
        
        // Simulate realistic parameter changes
        Object.keys(baseParams).forEach(param => {
            const currentValue = this.data[param][this.data[param].length - 1];
            const volatility = SIMULATION_CONFIG.volatility[param] || 0.1;
            const baseValue = baseParams[param];
            
            // Add realistic noise and trends
            let newValue = this.simulateParameter(currentValue, baseValue, volatility, param);
            
            // Apply constraints
            newValue = this.applyConstraints(newValue, param);
            
            this.data[param].push(newValue);
            
            // Check for alerts
            this.checkAlerts(param, newValue);
        });
        
        // Maintain data point limit
        this.trimData();
        
        // Emit data update
        this.emit('dataUpdated', {
            timestamp: now,
            data: this.getCurrentData(),
            alerts: this.alerts
        });
    }

    simulateParameter(current, base, volatility, param) {
        // Different simulation patterns for different parameters
        switch (param) {
            case 'tubingPressure':
            case 'casingPressure':
                // Pressure tends to oscillate around base with occasional spikes
                const pressureNoise = (Math.random() - 0.5) * base * volatility;
                const pressureTrend = Math.sin(Date.now() / 30000) * base * 0.05;
                return current + pressureNoise + pressureTrend * 0.1;
                
            case 'temperature':
                // Temperature changes slowly with small fluctuations
                const tempNoise = (Math.random() - 0.5) * base * volatility;
                return current + tempNoise * 0.3;
                
            case 'flowRate':
                // Flow rate for WT-666 should be 0 (shut in), others vary
                if (this.currentWell === 'WT-666') return 0;
                const flowNoise = (Math.random() - 0.5) * base * volatility;
                return Math.max(0, current + flowNoise);
                
            case 'tubingTension':
                // Tension varies with operations
                const tensionNoise = (Math.random() - 0.5) * base * volatility;
                return current + tensionNoise;
                
            case 'rotaryTorque':
                // Torque spikes during operations
                if (this.currentWell === 'WT-666') return Math.random() * 200; // Occasional movement
                const torqueNoise = (Math.random() - 0.5) * base * volatility;
                return Math.max(0, current + torqueNoise);
                
            default:
                // Default random walk
                const noise = (Math.random() - 0.5) * base * volatility;
                return current + noise;
        }
    }

    applyConstraints(value, param) {
        // Apply realistic physical constraints
        switch (param) {
            case 'tubingPressure':
            case 'casingPressure':
                return Math.max(0, Math.min(value, 4000)); // Max 4000 psi
            case 'temperature':
                return Math.max(60, Math.min(value, 300)); // 60-300°F range
            case 'flowRate':
                return Math.max(0, Math.min(value, 2000)); // Max 2000 bbl/min
            case 'tubingTension':
                return Math.max(0, Math.min(value, 30000)); // Max 30k lbs
            case 'rotaryTorque':
                return Math.max(0, Math.min(value, 3000)); // Max 3000 ft-lbs
            case 'hookLoad':
                return Math.max(10000, Math.min(value, 80000)); // 10k-80k lbs
            case 'depth':
                return Math.max(0, Math.min(value, 20000)); // Max depth 20k ft
            case 'rpm':
                return Math.max(0, Math.min(value, 200)); // Max 200 RPM
            case 'weightOnBit':
                return Math.max(0, Math.min(value, 15000)); // Max 15k lbs
            default:
                return value;
        }
    }

    checkAlerts(param, value) {
        const thresholds = ALERT_THRESHOLDS[param];
        if (!thresholds) return;

        const timestamp = new Date();
        let alertLevel = null;

        if (value >= thresholds.critical) {
            alertLevel = 'critical';
        } else if (value >= thresholds.warning) {
            alertLevel = 'warning';
        }

        if (alertLevel) {
            const alert = {
                id: `${param}_${timestamp.getTime()}`,
                timestamp,
                parameter: param,
                value,
                level: alertLevel,
                threshold: thresholds[alertLevel],
                message: `${param.toUpperCase()} ${alertLevel}: ${value.toFixed(1)} (threshold: ${thresholds[alertLevel]})`
            };

            this.alerts.unshift(alert);
            
            // Keep only last 10 alerts
            if (this.alerts.length > 10) {
                this.alerts = this.alerts.slice(0, 10);
            }

            this.emit('alertGenerated', alert);
        }
    }

    trimData() {
        const maxPoints = SIMULATION_CONFIG.maxDataPoints;
        Object.keys(this.data).forEach(key => {
            if (this.data[key].length > maxPoints) {
                this.data[key] = this.data[key].slice(-maxPoints);
            }
        });
    }

    getCurrentData() {
        const latest = {};
        Object.keys(this.data).forEach(key => {
            if (this.data[key].length > 0) {
                latest[key] = this.data[key][this.data[key].length - 1];
            }
        });
        return latest;
    }

    getChartData(parameter, points = 20) {
        const data = this.data[parameter] || [];
        const timestamps = this.data.timestamp || [];
        
        const sliceStart = Math.max(0, data.length - points);
        
        return {
            labels: timestamps.slice(sliceStart).map(t => t.toLocaleTimeString()),
            data: data.slice(sliceStart),
            parameter
        };
    }

    updateCharts() {
        if (!this.isRunning) return;
        
        this.emit('chartUpdate', {
            timestamp: new Date(),
            charts: {
                tubingPressure: this.getChartData('tubingPressure'),
                temperature: this.getChartData('temperature'),
                tension: this.getChartData('tubingTension'),
                torque: this.getChartData('rotaryTorque')
            }
        });
    }

    // Event system for real-time updates
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    // Inject custom events for demonstration
    injectEvent(eventType, data = {}) {
        const timestamp = new Date();
        const events = {
            'pressure_spike': () => {
                const current = this.getCurrentData();
                this.data.tubingPressure[this.data.tubingPressure.length - 1] = current.tubingPressure + 300;
                this.checkAlerts('tubingPressure', current.tubingPressure + 300);
            },
            'equipment_alarm': () => {
                this.alerts.unshift({
                    id: `alarm_${timestamp.getTime()}`,
                    timestamp,
                    parameter: 'system',
                    level: 'warning',
                    message: 'Equipment alarm: Check hydraulic system pressure'
                });
            },
            'depth_change': () => {
                const current = this.getCurrentData();
                this.data.depth[this.data.depth.length - 1] = current.depth + 50;
            }
        };

        if (events[eventType]) {
            events[eventType]();
            this.emit('eventInjected', { eventType, timestamp, data });
            console.log(`Event injected: ${eventType}`, data);
        }
    }
}

// Export singleton instance
export const realtimeSimulation = new RealTimeSimulation();

// Export utilities for chart integration
export const createRealtimeChart = (canvasId, parameter, color = '#3b82f6') => {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: parameter,
                data: [],
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#cbd5e1', maxTicksLimit: 8 }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#cbd5e1' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#f1f5f9',
                    borderColor: '#475569',
                    borderWidth: 1
                }
            },
            animation: {
                duration: 0 // Disable animation for real-time updates
            }
        }
    });
};

export default realtimeSimulation;