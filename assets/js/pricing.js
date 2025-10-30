// Toggle FAQ
function toggleFAQ(element) {
    element.classList.toggle('active');
}

// Toggle PAYG vs Subscription pricing model
function togglePricingModel(model) {
    const paygBtn = document.getElementById('payg-toggle');
    const subscriptionBtn = document.getElementById('subscription-toggle');
    const paygSection = document.getElementById('payg-pricing');
    const subscriptionSection = document.getElementById('subscription-pricing');
    const billingToggleContainer = document.getElementById('billing-toggle-container');

    if (model === 'payg') {
        // Show PAYG, hide subscription
        paygBtn.classList.add('bg-cyan-600', 'text-white');
        paygBtn.classList.remove('bg-gray-700', 'text-gray-300');
        subscriptionBtn.classList.remove('bg-cyan-600', 'text-white');
        subscriptionBtn.classList.add('bg-gray-700', 'text-gray-300');

        if (paygSection) paygSection.style.display = 'block';
        if (subscriptionSection) subscriptionSection.style.display = 'none';
        if (billingToggleContainer) billingToggleContainer.style.display = 'none';
    } else {
        // Show subscription, hide PAYG
        subscriptionBtn.classList.add('bg-cyan-600', 'text-white');
        subscriptionBtn.classList.remove('bg-gray-700', 'text-gray-300');
        paygBtn.classList.remove('bg-cyan-600', 'text-white');
        paygBtn.classList.add('bg-gray-700', 'text-gray-300');

        if (paygSection) paygSection.style.display = 'none';
        if (subscriptionSection) subscriptionSection.style.display = 'block';
        if (billingToggleContainer) billingToggleContainer.style.display = 'flex';
    }
}

// Toggle monthly/annual billing
function toggleBilling(period) {
    const monthlyBtn = document.getElementById('monthly-toggle');
    const annualBtn = document.getElementById('annual-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');
    const savingsBadges = document.querySelectorAll('.annual-savings');

    if (period === 'monthly') {
        monthlyBtn.classList.add('bg-cyan-600', 'text-white');
        monthlyBtn.classList.remove('bg-gray-700', 'text-gray-300');
        annualBtn.classList.remove('bg-cyan-600', 'text-white');
        annualBtn.classList.add('bg-gray-700', 'text-gray-300');

        monthlyPrices.forEach(el => el.style.display = 'block');
        annualPrices.forEach(el => el.style.display = 'none');
        savingsBadges.forEach(el => el.style.display = 'none');
    } else {
        annualBtn.classList.add('bg-cyan-600', 'text-white');
        annualBtn.classList.remove('bg-gray-700', 'text-gray-300');
        monthlyBtn.classList.remove('bg-cyan-600', 'text-white');
        monthlyBtn.classList.add('bg-gray-700', 'text-gray-300');

        monthlyPrices.forEach(el => el.style.display = 'none');
        annualPrices.forEach(el => el.style.display = 'block');
        savingsBadges.forEach(el => el.style.display = 'block');
    }
}

// Track pricing interactions
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const plan = this.closest('.pricing-card')?.querySelector('h3')?.textContent || 'Unknown';
            console.log('Pricing CTA clicked:', plan);
            // Add your analytics tracking here (Google Analytics, Mixpanel, etc.)
            // ga('send', 'event', 'Pricing', 'CTA Click', plan);
        });
    });
});
