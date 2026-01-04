"""
Well Intervention Environment for Reinforcement Learning
Simulates well behavior for training intervention timing policies

Based on Volve field characteristics:
- Initial pressure: ~330 bar
- Pressure decline: ~2 bar/month
- Watercut increase: ~1.5%/month
- Economic limit: ~85% watercut or <180 bar pressure
"""

import gym
import numpy as np
from gym import spaces


class WellInterventionEnv(gym.Env):
    """
    Custom Gym environment for well intervention optimization

    State Space:
        - Reservoir pressure (bar): 100-400
        - Watercut (%): 0-100
        - Gas-oil ratio (SM³/SM³): 0-200
        - Days since last intervention: 0-365

    Action Space:
        0 = Wait (no intervention)
        1 = Light intervention (stimulation, cleanup)
        2 = Heavy intervention (workover, recompletion)

    Reward Function:
        + Production revenue (based on oil rate)
        - Intervention costs
        - Downtime penalties
        - Risk penalties for critical states
    """

    metadata = {'render.modes': ['human']}

    def __init__(self, initial_pressure=329.6, initial_watercut=5.0):
        super(WellInterventionEnv, self).__init__()

        # Action space: 0=wait, 1=light intervention, 2=heavy intervention
        self.action_space = spaces.Discrete(3)

        # Observation space: [pressure, watercut, gor, days_since_intervention]
        self.observation_space = spaces.Box(
            low=np.array([100.0, 0.0, 0.0, 0.0]),
            high=np.array([400.0, 100.0, 200.0, 365.0]),
            dtype=np.float32
        )

        # Initial conditions (based on Volve field)
        self.initial_pressure = initial_pressure
        self.initial_watercut = initial_watercut

        # Intervention costs (normalized units)
        self.cost_wait = 0
        self.cost_light = 10
        self.cost_heavy = 50

        # Production parameters
        self.oil_price = 1.0  # normalized
        self.downtime_light = 7  # days
        self.downtime_heavy = 30  # days

        # Initialize state
        self.state = None
        self.days = 0
        self.total_production = 0
        self.interventions = []

    def reset(self):
        """Reset environment to initial state"""
        self.pressure = self.initial_pressure + np.random.normal(0, 10)
        self.watercut = self.initial_watercut + np.random.normal(0, 2)
        self.gor = 0.0 + np.random.normal(0, 5)
        self.days_since_intervention = 0
        self.days = 0
        self.total_production = 0
        self.interventions = []

        self.state = self._get_state()
        return self.state

    def step(self, action):
        """Execute one timestep (30 days)"""

        # Apply natural well decline (based on Volve data trends)
        self._apply_natural_decline()

        # Apply intervention effects
        reward = self._apply_intervention(action)

        # Calculate production reward
        reward += self._calculate_production_reward()

        # Penalize critical states
        reward += self._calculate_risk_penalty()

        # Update time
        self.days += 30
        self.days_since_intervention += 30

        # Check if episode is done
        done = self._is_terminal()

        # Update state
        self.state = self._get_state()

        info = {
            'pressure': self.pressure,
            'watercut': self.watercut,
            'gor': self.gor,
            'total_production': self.total_production,
            'interventions': len(self.interventions)
        }

        return self.state, reward, done, info

    def _apply_natural_decline(self):
        """Simulate natural well behavior"""
        # Pressure depletion (Volve: ~47 bar over 8 years = ~0.5 bar/month)
        self.pressure -= 1.5 + np.random.normal(0, 0.3)

        # Watercut increase (Volve: 0% to 89% over 8 years)
        if self.watercut < 20:
            self.watercut += 0.5 + np.random.normal(0, 0.2)
        elif self.watercut < 60:
            self.watercut += 1.5 + np.random.normal(0, 0.4)
        else:
            self.watercut += 2.5 + np.random.normal(0, 0.6)

        # GOR increase (solution gas liberation as pressure drops)
        if self.pressure < 250:
            self.gor += (250 - self.pressure) * 0.05

    def _apply_intervention(self, action):
        """Apply intervention effects and return cost"""

        if action == 0:  # Wait
            return -self.cost_wait

        elif action == 1:  # Light intervention
            self.pressure += 15 + np.random.normal(0, 5)
            self.watercut = max(0, self.watercut - 5)
            self.days_since_intervention = 0
            self.interventions.append({'type': 'light', 'day': self.days})

            # Downtime cost
            downtime_cost = self.downtime_light * 0.5

            return -(self.cost_light + downtime_cost)

        elif action == 2:  # Heavy intervention
            self.pressure += 40 + np.random.normal(0, 10)
            self.watercut = max(0, self.watercut - 20)
            self.gor = max(0, self.gor - 30)
            self.days_since_intervention = 0
            self.interventions.append({'type': 'heavy', 'day': self.days})

            # Downtime cost
            downtime_cost = self.downtime_heavy * 0.5

            return -(self.cost_heavy + downtime_cost)

        return 0

    def _calculate_production_reward(self):
        """Calculate production-based reward"""

        # Production declines with pressure and watercut
        if self.pressure < 150:
            oil_rate = 0  # Well shut in
        else:
            # Simplified production model
            pressure_factor = (self.pressure - 150) / 200
            watercut_factor = (100 - self.watercut) / 100
            oil_rate = pressure_factor * watercut_factor * 100

        # Revenue (30 days of production)
        revenue = oil_rate * 30 * self.oil_price

        self.total_production += oil_rate * 30

        return revenue

    def _calculate_risk_penalty(self):
        """Penalize risky operating conditions"""
        penalty = 0

        # Critical pressure penalty
        if self.pressure < 180:
            penalty -= 50
        elif self.pressure < 200:
            penalty -= 20

        # High watercut penalty
        if self.watercut > 85:
            penalty -= 30
        elif self.watercut > 70:
            penalty -= 10

        # High GOR penalty (gas breakthrough)
        if self.gor > 150:
            penalty -= 15

        return penalty

    def _is_terminal(self):
        """Check if episode should end"""

        # Terminal conditions
        if self.days >= 365 * 3:  # 3 years max
            return True

        if self.pressure < 150:  # Below economic limit
            return True

        if self.watercut > 90:  # Excessive water production
            return True

        return False

    def _get_state(self):
        """Return current state as numpy array"""
        return np.array([
            self.pressure,
            self.watercut,
            self.gor,
            self.days_since_intervention
        ], dtype=np.float32)

    def render(self, mode='human'):
        """Render environment state"""
        print(f"\n=== Day {self.days} ===")
        print(f"Pressure: {self.pressure:.1f} bar")
        print(f"Watercut: {self.watercut:.1f}%")
        print(f"GOR: {self.gor:.1f} SM³/SM³")
        print(f"Days since intervention: {self.days_since_intervention}")
        print(f"Total production: {self.total_production:.0f} SM³")
        print(f"Interventions: {len(self.interventions)}")


# Test environment
if __name__ == "__main__":
    env = WellInterventionEnv()
    obs = env.reset()

    print("Testing Well Intervention Environment...")
    print(f"Initial state: {obs}")

    # Run random episode
    done = False
    total_reward = 0

    while not done:
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)
        total_reward += reward

        if env.days % 180 == 0:  # Render every 6 months
            env.render()

    print(f"\nEpisode finished!")
    print(f"Total reward: {total_reward:.1f}")
    print(f"Total production: {info['total_production']:.0f} SM³")
    print(f"Interventions: {info['interventions']}")
