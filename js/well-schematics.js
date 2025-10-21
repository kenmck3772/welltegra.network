/**
 * @file Interactive SVG Well Schematics Generator
 * Creates detailed, clickable well diagrams with equipment details and depth markers
 */

import { wellData } from './data.js';

// SVG schematic generator
export class WellSchematic {
    constructor(container, wellId) {
        this.container = container;
        this.well = wellData.find(w => w.id === wellId);
        this.svgWidth = 800;
        this.svgHeight = 600;
        this.scale = 1;
        this.selectedElement = null;
        
        if (!this.well) {
            throw new Error(`Well ${wellId} not found`);
        }
        
        this.render();
    }
    
    render() {
        const svg = this.createSVG();
        this.container.innerHTML = '';
        this.container.appendChild(svg);
        
        // Add interactive features
        this.addInteractivity(svg);
    }
    
    createSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `0 0 ${this.svgWidth} ${this.svgHeight}`);
        svg.setAttribute('class', 'well-schematic');
        
        // Add background
        this.addBackground(svg);
        
        // Add surface elements
        this.addSurface(svg);
        
        // Add wellbore
        this.addWellbore(svg);
        
        // Add casing program
        this.addCasingProgram(svg);
        
        // Add equipment
        this.addEquipment(svg);
        
        // Add depth markers
        this.addDepthMarkers(svg);
        
        // Add legend
        this.addLegend(svg);
        
        return svg;
    }
    
    addBackground(svg) {
        // Gradient background representing formations
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Formation gradient
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'formation-gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stops = [
            { offset: '0%', color: '#8B7355', opacity: '0.3' }, // Surface soil
            { offset: '20%', color: '#A0522D', opacity: '0.4' }, // Sedimentary
            { offset: '60%', color: '#654321', opacity: '0.5' }, // Shale
            { offset: '80%', color: '#2F4F4F', opacity: '0.6' }, // Limestone
            { offset: '100%', color: '#1C1C1C', opacity: '0.7' } // Deep formations
        ];
        
        stops.forEach(stop => {
            const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stopElement.setAttribute('offset', stop.offset);
            stopElement.setAttribute('stop-color', stop.color);
            stopElement.setAttribute('stop-opacity', stop.opacity);
            gradient.appendChild(stopElement);
        });
        
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        // Background rectangle
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', 'url(#formation-gradient)');
        svg.appendChild(bg);
    }
    
    addSurface(svg) {
        // Surface line
        const surface = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        surface.setAttribute('x1', '0');
        surface.setAttribute('y1', '80');
        surface.setAttribute('x2', this.svgWidth);
        surface.setAttribute('y2', '80');
        surface.setAttribute('stroke', '#4A5568');
        surface.setAttribute('stroke-width', '3');
        svg.appendChild(surface);
        
        // Wellhead
        const wellhead = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wellhead.setAttribute('class', 'clickable-element');
        wellhead.setAttribute('data-equipment', 'wellhead');
        wellhead.setAttribute('data-info', `Wellhead Assembly\nOperator: ${this.well.operator}\nType: ${this.well.type}`);
        
        // Wellhead base
        const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        base.setAttribute('x', '380');
        base.setAttribute('y', '60');
        base.setAttribute('width', '40');
        base.setAttribute('height', '40');
        base.setAttribute('fill', '#718096');
        base.setAttribute('stroke', '#2D3748');
        base.setAttribute('stroke-width', '2');
        wellhead.appendChild(base);
        
        // Christmas tree
        const tree = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tree.setAttribute('x', '385');
        tree.setAttribute('y', '40');
        tree.setAttribute('width', '30');
        tree.setAttribute('height', '30');
        tree.setAttribute('fill', '#38A169');
        tree.setAttribute('stroke', '#2D3748');
        tree.setAttribute('stroke-width', '2');
        wellhead.appendChild(tree);
        
        svg.appendChild(wellhead);
    }
    
    addWellbore(svg) {
        const totalDepth = parseInt(this.well.depth.replace(/[^\d]/g, ''));
        const wellboreHeight = 450; // Available height for wellbore
        const startY = 100;
        
        // Main wellbore
        const wellbore = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wellbore.setAttribute('x1', '400');
        wellbore.setAttribute('y1', startY);
        wellbore.setAttribute('x2', '400');
        wellbore.setAttribute('y2', startY + wellboreHeight);
        wellbore.setAttribute('stroke', '#2D3748');
        wellbore.setAttribute('stroke-width', '2');
        wellbore.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(wellbore);
    }
    
    addCasingProgram(svg) {
        if (!this.well.equipment || !this.well.equipment.casing) return;
        
        const startY = 100;
        const wellboreHeight = 450;
        const totalDepth = parseInt(this.well.depth.replace(/[^\d]/g, ''));
        
        this.well.equipment.casing.forEach((casing, index) => {
            const depth = parseInt(casing.depth.replace(/[^\d]/g, ''));
            const casingHeight = (depth / totalDepth) * wellboreHeight;
            
            // Casing string
            const casingElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            casingElement.setAttribute('class', 'clickable-element casing-string');
            casingElement.setAttribute('data-equipment', 'casing');
            casingElement.setAttribute('data-info', `${casing.size} Casing\nDepth: ${casing.depth}\nWeight: ${casing.weight}\nGrade: ${casing.grade}`);
            
            // Calculate casing width based on size
            const casingSize = parseFloat(casing.size);
            const casingWidth = Math.max(8, Math.min(20, casingSize * 0.7));
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', 400 - casingWidth/2);
            rect.setAttribute('y', startY);
            rect.setAttribute('width', casingWidth);
            rect.setAttribute('height', casingHeight);
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', this.getCasingColor(index));
            rect.setAttribute('stroke-width', '3');
            rect.setAttribute('opacity', '0.8');
            casingElement.appendChild(rect);
            
            // Casing label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', 400 + casingWidth/2 + 10);
            label.setAttribute('y', startY + 20);
            label.setAttribute('fill', '#E2E8F0');
            label.setAttribute('font-size', '12');
            label.setAttribute('font-family', 'monospace');
            label.textContent = casing.size;
            casingElement.appendChild(label);
            
            svg.appendChild(casingElement);
        });
    }
    
    addEquipment(svg) {
        if (!this.well.completion || !this.well.completion.equipment) return;
        
        const startY = 100;
        const wellboreHeight = 450;
        const totalDepth = parseInt(this.well.depth.replace(/[^\d]/g, ''));
        
        this.well.completion.equipment.forEach(equipment => {
            const depth = equipment.top;
            const equipmentY = startY + (depth / totalDepth) * wellboreHeight;
            
            const equipmentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            equipmentGroup.setAttribute('class', 'clickable-element equipment');
            equipmentGroup.setAttribute('data-equipment', 'downhole');
            equipmentGroup.setAttribute('data-info', `${equipment.item}\nDepth: ${depth}ft\n${equipment.comments || ''}`);
            
            // Equipment symbol
            const symbol = this.createEquipmentSymbol(equipment.item, 400, equipmentY);
            equipmentGroup.appendChild(symbol);
            
            // Equipment label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', '420');
            label.setAttribute('y', equipmentY + 5);
            label.setAttribute('fill', equipment.isProblem ? '#F56565' : '#68D391');
            label.setAttribute('font-size', '11');
            label.setAttribute('font-family', 'Arial, sans-serif');
            label.textContent = equipment.item;
            equipmentGroup.appendChild(label);
            
            svg.appendChild(equipmentGroup);
        });
    }
    
    createEquipmentSymbol(equipmentType, x, y) {
        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        if (equipmentType.includes('TRSSV') || equipmentType.includes('DHSV') || equipmentType.includes('Insert')) {
            // Safety valve symbol
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - 8);
            rect.setAttribute('y', y - 4);
            rect.setAttribute('width', '16');
            rect.setAttribute('height', '8');
            rect.setAttribute('fill', equipmentType.includes('Failed') ? '#F56565' : '#68D391');
            rect.setAttribute('stroke', '#2D3748');
            rect.setAttribute('stroke-width', '1');
            symbol.appendChild(rect);
        } else if (equipmentType.includes('Packer')) {
            // Packer symbol
            const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            diamond.setAttribute('points', `${x},${y-6} ${x+6},${y} ${x},${y+6} ${x-6},${y}`);
            diamond.setAttribute('fill', '#4299E1');
            diamond.setAttribute('stroke', '#2D3748');
            diamond.setAttribute('stroke-width', '1');
            symbol.appendChild(diamond);
        } else if (equipmentType.includes('Scale') || equipmentType.includes('Deformation')) {
            // Problem symbol
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', '#F56565');
            circle.setAttribute('stroke', '#2D3748');
            circle.setAttribute('stroke-width', '1');
            symbol.appendChild(circle);
            
            // X mark
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', x - 3);
            line1.setAttribute('y1', y - 3);
            line1.setAttribute('x2', x + 3);
            line1.setAttribute('y2', y + 3);
            line1.setAttribute('stroke', 'white');
            line1.setAttribute('stroke-width', '2');
            symbol.appendChild(line1);
            
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', x - 3);
            line2.setAttribute('y1', y + 3);
            line2.setAttribute('x2', x + 3);
            line2.setAttribute('y2', y - 3);
            line2.setAttribute('stroke', 'white');
            line2.setAttribute('stroke-width', '2');
            symbol.appendChild(line2);
        } else {
            // Generic equipment symbol
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', '#9F7AEA');
            circle.setAttribute('stroke', '#2D3748');
            circle.setAttribute('stroke-width', '1');
            symbol.appendChild(circle);
        }
        
        return symbol;
    }
    
    addDepthMarkers(svg) {
        const startY = 100;
        const wellboreHeight = 450;
        const totalDepth = parseInt(this.well.depth.replace(/[^\d]/g, ''));
        
        // Add depth markers every 2000 feet
        for (let depth = 0; depth <= totalDepth; depth += 2000) {
            const markerY = startY + (depth / totalDepth) * wellboreHeight;
            
            // Depth tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', '370');
            tick.setAttribute('y1', markerY);
            tick.setAttribute('x2', '390');
            tick.setAttribute('y2', markerY);
            tick.setAttribute('stroke', '#A0AEC0');
            tick.setAttribute('stroke-width', '2');
            svg.appendChild(tick);
            
            // Depth label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', '360');
            label.setAttribute('y', markerY + 4);
            label.setAttribute('fill', '#A0AEC0');
            label.setAttribute('font-size', '12');
            label.setAttribute('font-family', 'monospace');
            label.setAttribute('text-anchor', 'end');
            label.textContent = `${depth}'`;
            svg.appendChild(label);
        }
    }
    
    addLegend(svg) {
        const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legend.setAttribute('class', 'legend');
        
        // Legend background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '20');
        bg.setAttribute('y', '20');
        bg.setAttribute('width', '200');
        bg.setAttribute('height', '120');
        bg.setAttribute('fill', 'rgba(26, 32, 44, 0.9)');
        bg.setAttribute('stroke', '#4A5568');
        bg.setAttribute('stroke-width', '1');
        bg.setAttribute('rx', '8');
        legend.appendChild(bg);
        
        // Legend title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '30');
        title.setAttribute('y', '40');
        title.setAttribute('fill', '#E2E8F0');
        title.setAttribute('font-size', '14');
        title.setAttribute('font-weight', 'bold');
        title.textContent = `${this.well.name}`;
        legend.appendChild(title);
        
        // Legend items
        const legendItems = [
            { color: '#68D391', text: 'Equipment' },
            { color: '#F56565', text: 'Problems' },
            { color: '#4299E1', text: 'Packers' },
            { color: '#9F7AEA', text: 'Other' }
        ];
        
        legendItems.forEach((item, index) => {
            const y = 60 + index * 15;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '35');
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', item.color);
            legend.appendChild(circle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '45');
            text.setAttribute('y', y + 4);
            text.setAttribute('fill', '#CBD5E0');
            text.setAttribute('font-size', '12');
            text.textContent = item.text;
            legend.appendChild(text);
        });
        
        svg.appendChild(legend);
    }
    
    addInteractivity(svg) {
        // Add click handlers for equipment
        const clickableElements = svg.querySelectorAll('.clickable-element');
        clickableElements.forEach(element => {
            element.style.cursor = 'pointer';
            
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, element.dataset.info);
                element.style.opacity = '0.8';
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
                element.style.opacity = '1';
            });
            
            element.addEventListener('click', (e) => {
                this.selectElement(element);
            });
        });
        
        // Add zoom controls
        this.addZoomControls();
    }
    
    showTooltip(event, info) {
        let tooltip = document.getElementById('schematic-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'schematic-tooltip';
            tooltip.className = 'absolute bg-slate-800 text-white p-2 rounded shadow-lg text-sm z-50 pointer-events-none';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = info.replace(/\n/g, '<br>');
        tooltip.style.display = 'block';
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 10 + 'px';
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('schematic-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    selectElement(element) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.style.filter = '';
        }
        
        // Highlight selected element
        this.selectedElement = element;
        element.style.filter = 'drop-shadow(0 0 10px #63B3ED)';
        
        // Show details panel
        this.showElementDetails(element);
    }
    
    showElementDetails(element) {
        const detailsPanel = document.getElementById('schematic-details');
        if (detailsPanel) {
            detailsPanel.innerHTML = `
                <div class="p-4 bg-slate-700 rounded-lg">
                    <h4 class="text-lg font-semibold text-white mb-2">Equipment Details</h4>
                    <div class="text-slate-300">${element.dataset.info.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        }
    }
    
    addZoomControls() {
        const controls = document.createElement('div');
        controls.className = 'absolute top-4 right-4 flex flex-col space-y-2';
        controls.innerHTML = `
            <button id="zoom-in" class="bg-slate-700 text-white p-2 rounded hover:bg-slate-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
            </button>
            <button id="zoom-out" class="bg-slate-700 text-white p-2 rounded hover:bg-slate-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
                </svg>
            </button>
            <button id="zoom-reset" class="bg-slate-700 text-white p-2 rounded hover:bg-slate-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>
        `;
        
        this.container.style.position = 'relative';
        this.container.appendChild(controls);
        
        // Add zoom functionality
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoom-reset').addEventListener('click', () => this.resetZoom());
    }
    
    zoom(factor) {
        this.scale *= factor;
        const svg = this.container.querySelector('svg');
        svg.style.transform = `scale(${this.scale})`;
    }
    
    resetZoom() {
        this.scale = 1;
        const svg = this.container.querySelector('svg');
        svg.style.transform = 'scale(1)';
    }
    
    getCasingColor(index) {
        const colors = ['#68D391', '#4299E1', '#9F7AEA', '#F6AD55', '#FC8181'];
        return colors[index % colors.length];
    }
}

// Export function to create schematic
export function createWellSchematic(container, wellId) {
    return new WellSchematic(container, wellId);
}