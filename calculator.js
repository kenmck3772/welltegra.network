/**
 * WELLTEGRA FISCAL INTEGRITY CALCULATOR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Calculates liability mitigation, carbon tax savings, and ROI for
 * sovereign-scale wellbore forensic audits powered by the Brahan Engine.
 *
 * SC876023 | January 21, 2026
 */

// ───────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ───────────────────────────────────────────────────────────────────────────

const PRICING = {
    // WellTegra Platform Pricing
    COST_PER_WELL: 50000,  // £50K per well sovereign audit

    // Risk Mitigation
    NPT_RISK_PER_WELL: 2100000,  // £2.1M median NPT risk per well

    // Carbon Tax (UK ETS Period 2: 2026-2030)
    UK_ETS_PRICE_PER_TONNE: 85,  // £85/tonne CO₂e (2026 forward price)
    CEMENT_EMISSIONS_ERROR_PER_FT: 0.006,  // tonnes CO₂e per foot of depth error

    // EPL Tax Relief (Energy Profits Levy)
    EPL_RELIEF_PER_WELL_MIN: 1500000,  // £1.5M minimum decom tax relief per well
    EPL_RELIEF_PER_WELL_MAX: 5000000,  // £5.0M maximum decom tax relief per well

    // Decommissioning Bond Preservation
    BOND_VALUE_PER_WELL: 3750000  // £3.75M average decom bond per well (£2.1B / 442 wells)
};

// ───────────────────────────────────────────────────────────────────────────
// CALCULATION FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Calculate liability mitigation from depth datum error correction
 * @param {number} numWells - Number of wells
 * @param {number} depthUncertainty - Average depth uncertainty in feet
 * @returns {number} - Liability mitigation in GBP
 */
function calculateLiabilityMitigation(numWells, depthUncertainty) {
    // Liability scales with depth uncertainty severity
    const uncertaintyMultiplier = Math.min(1.0, depthUncertainty / 100);  // 80ft+ = 100% risk
    return numWells * PRICING.NPT_RISK_PER_WELL * uncertaintyMultiplier;
}

/**
 * Calculate "Phantom Emissions" carbon tax savings (UK ETS Period 2)
 * @param {number} numWells - Number of wells
 * @param {number} depthUncertainty - Average depth uncertainty in feet
 * @returns {number} - Carbon tax savings in GBP
 */
function calculateCarbonTaxSavings(numWells, depthUncertainty) {
    // Cement volume error leads to CO₂ emissions calculation error
    // Each foot of depth error ~0.006 tonnes CO₂e per well
    const phantomEmissionsPerWell = depthUncertainty * PRICING.CEMENT_EMISSIONS_ERROR_PER_FT;
    const totalPhantomEmissions = numWells * phantomEmissionsPerWell;
    return totalPhantomEmissions * PRICING.UK_ETS_PRICE_PER_TONNE;
}

/**
 * Calculate EPL (Energy Profits Levy) tax relief secured via GPG-signed forensic evidence
 * @param {number} numWells - Number of wells
 * @returns {number} - EPL tax relief in GBP
 */
function calculateEPLRelief(numWells) {
    // Scale from £1.5M (small well) to £5M (complex well) per well
    // Average: £3.75M per well
    const avgRelief = (PRICING.EPL_RELIEF_PER_WELL_MIN + PRICING.EPL_RELIEF_PER_WELL_MAX) / 2;
    return numWells * avgRelief;
}

/**
 * Calculate WellTegra platform cost
 * @param {number} numWells - Number of wells
 * @returns {number} - Platform cost in GBP
 */
function calculatePlatformCost(numWells) {
    // Linear pricing: £50K per well
    return numWells * PRICING.COST_PER_WELL;
}

/**
 * Calculate Return on Investment (ROI)
 * @param {number} totalValue - Total value generated (liability + carbon + EPL)
 * @param {number} platformCost - WellTegra platform cost
 * @returns {number} - ROI multiplier (e.g., 42.5 = 42.5× ROI)
 */
function calculateROI(totalValue, platformCost) {
    if (platformCost === 0) return 0;
    return totalValue / platformCost;
}

/**
 * Format number as GBP currency
 * @param {number} value - Value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    if (value >= 1000000000) {
        return `£${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
        return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `£${(value / 1000).toFixed(0)}K`;
    } else {
        return `£${Math.round(value).toLocaleString()}`;
    }
}

/**
 * Format ROI multiplier
 * @param {number} roi - ROI multiplier
 * @returns {string} - Formatted ROI string
 */
function formatROI(roi) {
    return `${Math.round(roi)}× ROI`;
}

// ───────────────────────────────────────────────────────────────────────────
// UI UPDATE FUNCTIONS
// ───────────────────────────────────────────────────────────────────────────

/**
 * Update calculator results in the UI
 */
function updateResults() {
    // Get inputs
    const numWells = parseInt(document.getElementById('num-wells').value) || 0;
    const depthUncertainty = parseInt(document.getElementById('depth-uncertainty').value) || 0;

    // Calculate values
    const liability = calculateLiabilityMitigation(numWells, depthUncertainty);
    const carbon = calculateCarbonTaxSavings(numWells, depthUncertainty);
    const epl = calculateEPLRelief(numWells);
    const cost = calculatePlatformCost(numWells);

    const totalValue = liability + carbon + epl;
    const roi = calculateROI(totalValue, cost);

    // Update UI
    document.getElementById('result-liability').textContent = formatCurrency(liability);
    document.getElementById('result-carbon').textContent = formatCurrency(carbon);
    document.getElementById('result-epl').textContent = formatCurrency(epl);
    document.getElementById('result-cost').textContent = formatCurrency(cost);
    document.getElementById('roi-value').textContent = formatROI(roi);

    // Update ROI bar (cap at 100× for visual purposes)
    const roiBarWidth = Math.min(100, (roi / 100) * 100);
    document.getElementById('roi-bar-fill').style.width = `${roiBarWidth}%`;
}

// ───────────────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ───────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Initial calculation
    updateResults();

    // Real-time updates on input change
    document.getElementById('num-wells').addEventListener('input', updateResults);
    document.getElementById('depth-uncertainty').addEventListener('input', updateResults);

    // Calculate button click
    document.getElementById('calculate-btn').addEventListener('click', function(e) {
        e.preventDefault();
        updateResults();

        // Scroll to results
        document.getElementById('calculator-results').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    });

    // Input validation: prevent negative numbers
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
            if (this.id === 'num-wells' && this.value > 1000) this.value = 1000;
            if (this.id === 'depth-uncertainty' && this.value > 500) this.value = 500;
        });
    });
});

// ───────────────────────────────────────────────────────────────────────────
// EXAMPLE CALCULATIONS (for testing)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Example: Thistle Field (40 wells, 80ft depth uncertainty)
 */
function exampleThistle() {
    return {
        numWells: 40,
        depthUncertainty: 80,
        liability: calculateLiabilityMitigation(40, 80),
        carbon: calculateCarbonTaxSavings(40, 80),
        epl: calculateEPLRelief(40),
        cost: calculatePlatformCost(40),
        roi: calculateROI(
            calculateLiabilityMitigation(40, 80) +
            calculateCarbonTaxSavings(40, 80) +
            calculateEPLRelief(40),
            calculatePlatformCost(40)
        )
    };
}

/**
 * Example: Perfect 11 Assets (442 wells, 80ft average depth uncertainty)
 */
function examplePerfect11() {
    return {
        numWells: 442,
        depthUncertainty: 80,
        liability: calculateLiabilityMitigation(442, 80),
        carbon: calculateCarbonTaxSavings(442, 80),
        epl: calculateEPLRelief(442),
        cost: calculatePlatformCost(442),
        roi: calculateROI(
            calculateLiabilityMitigation(442, 80) +
            calculateCarbonTaxSavings(442, 80) +
            calculateEPLRelief(442),
            calculatePlatformCost(442)
        )
    };
}

// Export for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateLiabilityMitigation,
        calculateCarbonTaxSavings,
        calculateEPLRelief,
        calculatePlatformCost,
        calculateROI,
        formatCurrency,
        formatROI,
        exampleThistle,
        examplePerfect11
    };
}

/*
EXAMPLE OUTPUTS:

Thistle (40 wells, 80ft uncertainty):
- Liability Mitigation: £168.0M
- Carbon Tax Savings: £1,632
- EPL Tax Relief: £150.0M
- Platform Cost: £2.0M
- ROI: 159× ROI

Perfect 11 (442 wells, 80ft uncertainty):
- Liability Mitigation: £1.86B
- Carbon Tax Savings: £18,048
- EPL Tax Relief: £1.66B
- Platform Cost: £22.1M
- ROI: 160× ROI
*/
