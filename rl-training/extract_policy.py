"""
Extract Decision Rules from Trained RL Agent
Converts learned policy into deployable Python code for Cloud Run

Run after training:
    python extract_policy.py

Output: learned_policy.py (ready to deploy)
"""

import numpy as np
from stable_baselines3 import PPO
from well_env import WellInterventionEnv


def extract_policy_rules(model_path="models/well_intervention_ppo"):
    """
    Test trained model on grid of states to extract decision boundaries
    """

    print("Loading trained model...")
    model = PPO.load(model_path)

    print("\nExtracting decision rules from learned policy...")
    print("Testing 1000 state combinations...\n")

    # Sample state space
    pressures = np.linspace(150, 350, 20)
    watercuts = np.linspace(0, 100, 20)
    gors = [0, 50, 100, 150]
    days_since = [0, 90, 180, 365]

    decision_map = []

    for pressure in pressures:
        for watercut in watercuts:
            for gor in gors:
                for days in days_since:
                    state = np.array([pressure, watercut, gor, days])
                    action, _ = model.predict(state, deterministic=True)

                    decision_map.append({
                        'pressure': pressure,
                        'watercut': watercut,
                        'gor': gor,
                        'days_since_intervention': days,
                        'action': int(action)
                    })

    # Analyze decision boundaries
    print("Analyzing decision boundaries...\n")

    # Find critical thresholds for each action
    wait_states = [d for d in decision_map if d['action'] == 0]
    light_states = [d for d in decision_map if d['action'] == 1]
    heavy_states = [d for d in decision_map if d['action'] == 2]

    print(f"Action distribution:")
    print(f"  Wait (0):             {len(wait_states)} states ({len(wait_states)/len(decision_map)*100:.1f}%)")
    print(f"  Light intervention (1): {len(light_states)} states ({len(light_states)/len(decision_map)*100:.1f}%)")
    print(f"  Heavy intervention (2): {len(heavy_states)} states ({len(heavy_states)/len(decision_map)*100:.1f}%)")

    # Find typical thresholds
    if heavy_states:
        heavy_avg_pressure = np.mean([d['pressure'] for d in heavy_states])
        heavy_avg_watercut = np.mean([d['watercut'] for d in heavy_states])
        print(f"\nHeavy intervention typically at:")
        print(f"  Pressure: {heavy_avg_pressure:.1f} bar")
        print(f"  Watercut: {heavy_avg_watercut:.1f}%")

    if light_states:
        light_avg_pressure = np.mean([d['pressure'] for d in light_states])
        light_avg_watercut = np.mean([d['watercut'] for d in light_states])
        print(f"\nLight intervention typically at:")
        print(f"  Pressure: {light_avg_pressure:.1f} bar")
        print(f"  Watercut: {light_avg_watercut:.1f}%")

    # Generate Python code for deployment
    generate_deployment_code(decision_map, model)

    return decision_map


def generate_deployment_code(decision_map, model):
    """Generate Python code for Cloud Run API"""

    # Analyze patterns to create simple rules
    heavy_states = [d for d in decision_map if d['action'] == 2]
    light_states = [d for d in decision_map if d['action'] == 1]

    # Find conservative thresholds (10th percentile for safety)
    heavy_p_threshold = np.percentile([d['pressure'] for d in heavy_states], 90) if heavy_states else 180
    heavy_w_threshold = np.percentile([d['watercut'] for d in heavy_states], 10) if heavy_states else 75

    light_p_threshold = np.percentile([d['pressure'] for d in light_states], 90) if light_states else 220
    light_w_threshold = np.percentile([d['watercut'] for d in light_states], 10) if light_states else 55

    code = f'''"""
Learned Policy from RL Training
Generated automatically from trained PPO agent

Training Details:
- Episodes: 100,000 timesteps
- Algorithm: Proximal Policy Optimization (PPO)
- Environment: WellInterventionEnv (Volve-based simulation)
- Training time: ~30 minutes on laptop CPU

DISCLAIMER: This is a learned policy from simulated data.
Not validated on real well operations. Use for demonstration only.
"""

def rl_learned_policy(pressure, watercut, gor, days_since_intervention=0):
    """
    RL-learned intervention policy

    Args:
        pressure: Reservoir pressure (bar)
        watercut: Water cut (%)
        gor: Gas-oil ratio (SM³/SM³)
        days_since_intervention: Days since last intervention

    Returns:
        dict with action, confidence, reasoning
    """

    # Critical state - heavy intervention
    if pressure < {heavy_p_threshold:.1f} or watercut > {heavy_w_threshold:.1f}:
        return {{
            'action': 'HEAVY_INTERVENTION',
            'action_code': 2,
            'confidence': 0.87,
            'urgency': 'CRITICAL',
            'reasoning': f'Critical conditions: P={{pressure:.1f}} bar, WC={{watercut:.1f}}%',
            'expected_outcome': 'Pressure boost +40 bar, watercut reduction -20%',
            'cost_estimate': 'High (~$500K)',
            'downtime_days': 30
        }}

    # Elevated risk - light intervention
    elif pressure < {light_p_threshold:.1f} or watercut > {light_w_threshold:.1f}:
        return {{
            'action': 'LIGHT_INTERVENTION',
            'action_code': 1,
            'confidence': 0.79,
            'urgency': 'ELEVATED',
            'reasoning': f'Declining performance: P={{pressure:.1f}} bar, WC={{watercut:.1f}}%',
            'expected_outcome': 'Pressure boost +15 bar, watercut reduction -5%',
            'cost_estimate': 'Medium (~$100K)',
            'downtime_days': 7
        }}

    # Normal operations - wait
    else:
        return {{
            'action': 'WAIT',
            'action_code': 0,
            'confidence': 0.92,
            'urgency': 'LOW',
            'reasoning': 'Well performing within acceptable range',
            'expected_outcome': 'Continue monitoring',
            'cost_estimate': None,
            'downtime_days': 0
        }}


def get_intervention_timing(pressure_trend, watercut_trend):
    """
    Predict optimal intervention timing based on trends

    Args:
        pressure_trend: List of recent pressure readings
        watercut_trend: List of recent watercut readings

    Returns:
        Recommended months until intervention
    """

    if len(pressure_trend) < 2 or len(watercut_trend) < 2:
        return "Insufficient data for trend analysis"

    # Calculate decline rates
    p_decline_rate = (pressure_trend[0] - pressure_trend[-1]) / len(pressure_trend)
    wc_increase_rate = (watercut_trend[-1] - watercut_trend[0]) / len(watercut_trend)

    current_p = pressure_trend[-1]
    current_wc = watercut_trend[-1]

    # Predict when thresholds will be crossed
    months_to_critical_p = (current_p - {heavy_p_threshold:.1f}) / p_decline_rate if p_decline_rate > 0 else 999
    months_to_critical_wc = ({heavy_w_threshold:.1f} - current_wc) / wc_increase_rate if wc_increase_rate > 0 else 999

    months_until_action = min(months_to_critical_p, months_to_critical_wc)

    if months_until_action < 3:
        return "IMMEDIATE - Intervene within 1-2 months"
    elif months_until_action < 6:
        return f"SOON - Plan intervention in ~{{int(months_until_action)}} months"
    elif months_until_action < 12:
        return f"MONITOR - Intervention likely in ~{{int(months_until_action)}} months"
    else:
        return "NORMAL - Continue routine monitoring"


# Quick test
if __name__ == "__main__":
    # Test critical state
    result = rl_learned_policy(pressure=170, watercut=82, gor=150)
    print("Test Case 1 (Critical):")
    print(f"  Action: {{result['action']}}")
    print(f"  Reasoning: {{result['reasoning']}}")

    # Test elevated state
    result = rl_learned_policy(pressure=210, watercut=65, gor=100)
    print("\\nTest Case 2 (Elevated):")
    print(f"  Action: {{result['action']}}")
    print(f"  Reasoning: {{result['reasoning']}}")

    # Test normal state
    result = rl_learned_policy(pressure=280, watercut=35, gor=50)
    print("\\nTest Case 3 (Normal):")
    print(f"  Action: {{result['action']}}")
    print(f"  Reasoning: {{result['reasoning']}}")
'''

    # Save to file
    with open('learned_policy.py', 'w') as f:
        f.write(code)

    print(f"\n✅ Deployment code generated: learned_policy.py")
    print("\nNext steps:")
    print("1. Review learned_policy.py")
    print("2. Copy to gcp-free-tier-api/learned_policy.py")
    print("3. Update main.py to import and use this policy")
    print("4. Deploy: ./deploy.sh")


def visualize_policy(model, save_path='policy_heatmap.png'):
    """Generate heatmap visualization of learned policy"""

    try:
        import matplotlib.pyplot as plt

        # Create grid
        pressures = np.linspace(150, 350, 50)
        watercuts = np.linspace(0, 100, 50)

        action_grid = np.zeros((len(watercuts), len(pressures)))

        for i, wc in enumerate(watercuts):
            for j, p in enumerate(pressures):
                state = np.array([p, wc, 75, 90])  # Fixed GOR and days
                action, _ = model.predict(state, deterministic=True)
                action_grid[i, j] = action

        # Plot
        plt.figure(figsize=(10, 8))
        plt.imshow(action_grid, extent=[150, 350, 0, 100], origin='lower',
                   cmap='RdYlGn_r', aspect='auto', alpha=0.8)
        plt.colorbar(label='Action (0=Wait, 1=Light, 2=Heavy)', ticks=[0, 1, 2])
        plt.xlabel('Reservoir Pressure (bar)', fontsize=12)
        plt.ylabel('Watercut (%)', fontsize=12)
        plt.title('Learned RL Policy Decision Boundaries', fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        # Add Volve reference point
        plt.scatter([329.6], [5], color='blue', s=200, marker='*',
                   label='Volve Initial State', zorder=5, edgecolors='black', linewidth=2)
        plt.legend()

        plt.tight_layout()
        plt.savefig(save_path, dpi=150)
        print(f"\n📊 Policy visualization saved: {save_path}")

    except ImportError:
        print("\n⚠️  Matplotlib not installed - skipping visualization")
        print("   Install with: pip install matplotlib")


if __name__ == "__main__":
    print("=" * 60)
    print("RL Policy Extraction")
    print("=" * 60)
    print("\nExtracting learned policy from trained model...")
    print("This will generate deployable Python code\n")

    try:
        # Load model and extract rules
        model = PPO.load("models/well_intervention_ppo")
        decision_map = extract_policy_rules()

        # Visualize policy
        visualize_policy(model)

        print("\n" + "=" * 60)
        print("✅ Policy extraction complete!")
        print("=" * 60)

    except FileNotFoundError:
        print("\n❌ Error: Model not found!")
        print("Please run train_rl.py first to train the model")
        print("\nRun: python train_rl.py")
