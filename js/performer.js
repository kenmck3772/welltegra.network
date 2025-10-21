/**
 * Enhanced Performer Module with Schematic Integration
 * Provides live operations logging with visual well schematics
 */

import { wellData, assets } from './data.js';

class PerformerApp {
    constructor() {
        this.events = [];
        this.currentWell = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateWellSelector();
        this.setCurrentTimestamp();
        this.loadStoredEvents();
        this.startLiveFeed();
    }

    setupEventListeners() {
        // Well selector
        const wellSelector = document.getElementById('wellSelector');
        wellSelector?.addEventListener('change', (e) => this.selectWell(e.target.value));

        // Event logging
        const addEventBtn = document.getElementById('addEvent');
        addEventBtn?.addEventListener('click', () => this.addEvent());

        // Export buttons
        const exportCSVBtn = document.getElementById('exportCSV');
        const exportJSONBtn = document.getElementById('exportJSON');
        exportCSVBtn?.addEventListener('click', () => this.exportCSV());
        exportJSONBtn?.addEventListener('click', () => this.exportJSON());

        // Enter key in textarea
        const detailsTextarea = document.getElementById('details');
        detailsTextarea?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addEvent();
            }
        });
    }

    populateWellSelector() {
        const selector = document.getElementById('wellSelector');
        if (!selector) return;

        // Clear existing options except the first one
        selector.innerHTML = '<option value="">Choose a well...</option>';

        wellData.forEach(well => {
            const option = document.createElement('option');
            option.value = well.id;
            option.textContent = `${well.id} - ${well.name.replace('CASE STUDY: ', '')}`;
            selector.appendChild(option);
        });
    }

    selectWell(wellId) {
        if (!wellId) {
            this.currentWell = null;
            this.hideSchematic();
            return;
        }

        this.currentWell = wellData.find(well => well.id === wellId);
        if (this.currentWell) {
            this.showSchematic();
        }
    }

    showSchematic() {
        const container = document.getElementById('schematicContainer');
        const placeholder = document.getElementById('schematicPlaceholder');
        const image = document.getElementById('schematicImage');
        const controls = document.getElementById('schematicControls');

        if (!container || !image || !this.currentWell) return;

        // Get schematic path
        const schematicPath = assets.schematics[this.currentWell.id];
        
        if (schematicPath) {
            placeholder?.classList.add('hidden');
            image.src = schematicPath;
            image.alt = `${this.currentWell.name} Schematic`;
            image.classList.remove('hidden');
            controls?.classList.remove('hidden');

            // Add loading and error handling
            image.onload = () => {
                console.log(`Schematic loaded for ${this.currentWell.id}`);
            };
            
            image.onerror = () => {
                console.warn(`Schematic not found: ${schematicPath}`);
                this.showSchematicPlaceholder(`Schematic not available for ${this.currentWell.id}`);
            };
        } else {
            this.showSchematicPlaceholder(`No schematic defined for ${this.currentWell.id}`);
        }
    }

    showSchematicPlaceholder(message) {
        const placeholder = document.getElementById('schematicPlaceholder');
        const image = document.getElementById('schematicImage');
        const controls = document.getElementById('schematicControls');

        if (placeholder) {
            placeholder.innerHTML = `
                <div class="text-center text-slate-400">
                    <div class="text-6xl mb-4">📋</div>
                    <p class="text-lg">${message}</p>
                    <p class="text-sm mt-2">Visual context will be available when schematic is added</p>
                </div>
            `;
            placeholder.classList.remove('hidden');
        }
        
        image?.classList.add('hidden');
        controls?.classList.add('hidden');
    }

    hideSchematic() {
        const placeholder = document.getElementById('schematicPlaceholder');
        const image = document.getElementById('schematicImage');
        const controls = document.getElementById('schematicControls');

        if (placeholder) {
            placeholder.innerHTML = `
                <div class="text-center text-slate-400">
                    <div class="text-6xl mb-4">🔧</div>
                    <p class="text-lg">Select a well to view its schematic</p>
                    <p class="text-sm mt-2">Real-time operations monitoring with visual context</p>
                </div>
            `;
            placeholder.classList.remove('hidden');
        }
        
        image?.classList.add('hidden');
        controls?.classList.add('hidden');
    }

    setCurrentTimestamp() {
        const timestampInput = document.getElementById('timestamp');
        if (timestampInput) {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            const localTime = new Date(now.getTime() - offset);
            timestampInput.value = localTime.toISOString().slice(0, 16);
        }
    }

    addEvent() {
        const timestamp = document.getElementById('timestamp')?.value;
        const category = document.getElementById('category')?.value;
        const severity = document.getElementById('severity')?.value;
        const location = document.getElementById('location')?.value;
        const details = document.getElementById('details')?.value;

        if (!timestamp || !category || !details) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const event = {
            id: Date.now().toString(),
            timestamp: new Date(timestamp),
            category,
            severity,
            location,
            details,
            wellId: this.currentWell?.id || null,
            wellName: this.currentWell?.name || null,
            created: new Date()
        };

        this.events.unshift(event); // Add to beginning
        this.saveEvents();
        this.updateLiveFeed();
        this.clearForm();
        this.showNotification('Event logged successfully', 'success');
    }

    clearForm() {
        document.getElementById('category').value = '';
        document.getElementById('severity').value = 'info';
        document.getElementById('location').value = '';
        document.getElementById('details').value = '';
        this.setCurrentTimestamp();
    }

    updateLiveFeed() {
        const feedContainer = document.getElementById('recentEvents');
        if (!feedContainer) return;

        const recentEvents = this.events.slice(0, 10); // Show last 10 events
        
        feedContainer.innerHTML = recentEvents.map(event => {
            const timeAgo = this.getTimeAgo(event.timestamp);
            const severityColor = this.getSeverityColor(event.severity);
            const severityIcon = this.getSeverityIcon(event.severity);
            const categoryIcon = this.getCategoryIcon(event.category);

            return `
                <div class="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border-l-4 ${severityColor.border}">
                    <div class="${severityColor.text} text-lg">${severityIcon}</div>
                    <div class="flex-1 text-sm">
                        <div class="text-white font-medium">
                            ${event.timestamp.toLocaleTimeString()} - ${categoryIcon} ${this.formatCategory(event.category)}
                            ${event.wellId ? `(${event.wellId})` : ''}
                        </div>
                        <div class="text-slate-300">${event.details.substring(0, 80)}${event.details.length > 80 ? '...' : ''}</div>
                        ${event.location ? `<div class="text-slate-400 text-xs">📍 ${event.location}</div>` : ''}
                        <div class="text-slate-400 text-xs mt-1">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getSeverityColor(severity) {
        const colors = {
            info: { border: 'border-blue-500', text: 'text-blue-500' },
            warning: { border: 'border-amber-500', text: 'text-amber-500' },
            critical: { border: 'border-red-500', text: 'text-red-500' }
        };
        return colors[severity] || colors.info;
    }

    getSeverityIcon(severity) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            critical: '🚨'
        };
        return icons[severity] || 'ℹ️';
    }

    getCategoryIcon(category) {
        const icons = {
            pressure: '🔴',
            toolstring: '🔧',
            circulation: '💧',
            safety: '⚠️',
            equipment: '⚙️',
            personnel: '👥',
            environmental: '🌱',
            other: '📝'
        };
        return icons[category] || '📝';
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    exportCSV() {
        if (this.events.length === 0) {
            this.showNotification('No events to export', 'warning');
            return;
        }

        const headers = ['Timestamp', 'Category', 'Severity', 'Well ID', 'Well Name', 'Location', 'Details'];
        const csvContent = [
            headers.join(','),
            ...this.events.map(event => [
                event.timestamp.toISOString(),
                event.category,
                event.severity,
                event.wellId || '',
                event.wellName || '',
                event.location || '',
                `"${event.details.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'performer-events.csv', 'text/csv');
        this.showNotification('CSV exported successfully', 'success');
    }

    exportJSON() {
        if (this.events.length === 0) {
            this.showNotification('No events to export', 'warning');
            return;
        }

        const jsonContent = JSON.stringify(this.events, null, 2);
        this.downloadFile(jsonContent, 'performer-events.json', 'application/json');
        this.showNotification('JSON exported successfully', 'success');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveEvents() {
        try {
            localStorage.setItem('performer-events', JSON.stringify(this.events));
        } catch (error) {
            console.warn('Could not save events to localStorage:', error);
        }
    }

    loadStoredEvents() {
        try {
            const stored = localStorage.getItem('performer-events');
            if (stored) {
                const parsedEvents = JSON.parse(stored);
                this.events = parsedEvents.map(event => ({
                    ...event,
                    timestamp: new Date(event.timestamp),
                    created: new Date(event.created)
                }));
                this.updateLiveFeed();
            }
        } catch (error) {
            console.warn('Could not load events from localStorage:', error);
        }
    }

    startLiveFeed() {
        // Update live feed every 30 seconds
        setInterval(() => {
            this.updateLiveFeed();
        }, 30000);

        // Initial update
        this.updateLiveFeed();
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            type === 'warning' ? 'bg-amber-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the performer app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerformerApp();
});