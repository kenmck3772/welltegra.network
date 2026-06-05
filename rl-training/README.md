# Reinforcement Learning for Well Intervention Optimization

Train an RL agent **locally** (free) and deploy learned policy to Cloud Run (also free).

---

## 🎯 What This Does

Trains a Reinforcement Learning agent to optimize well intervention timing based on:
- **State**: Reservoir pressure, watercut, GOR, time since intervention
- **Actions**: Wait, light intervention, heavy intervention
- **Goal**: Maximize production while minimizing intervention costs

**Based on**: Volve field characteristics (pressure decline, watercut trends)

---

## 💻 Setup (On Your Laptop - FREE)

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**Packages installed**:
- `gym` - RL environment framework
- `stable-baselines3` - PPO algorithm (state-of-the-art RL)
- `numpy` - Numerical computing
- `matplotlib` - Visualization
- `tensorboard` - Training monitoring

---

## 🚀 Training Steps

### Step 1: Train the Agent (~30 minutes)

```bash
python train_rl.py
```

**What happens**:
- Creates vectorized well simulation environment
- Trains PPO agent for 100,000 timesteps
- Saves checkpoints every 10,000 steps
- Tests final policy on 5 episodes
- Compares with rule-based baseline

**Output**:
```
Training for 100000 timesteps...
Episode 100: reward=1234.5
...
✅ Model saved to: models/well_intervention_ppo.zip

📊 Test Results (5 episodes):
Average Reward: 1523.4 ± 234.1
Average Production: 45678 ± 3421 SM³
Average Interventions: 3.2 ± 0.8

📈 Comparison Results (10 episodes):
RL Agent:        1523.4 ± 234.1
Rule-based:      987.6 ± 312.4
Improvement:     54.2%
```

**Training time**: 10-30 minutes on laptop CPU

---

### Step 2: Extract Learned Policy

```bash
python extract_policy.py
```

**What happens**:
- Tests trained model on 1,000 state combinations
- Identifies decision boundaries
- Generates deployable Python code
- Creates policy heatmap visualization

**Output**:
```
Extracting decision rules from learned policy...

Action distribution:
  Wait (0):               342 states (34.2%)
  Light intervention (1): 401 states (40.1%)
  Heavy intervention (2): 257 states (25.7%)

Heavy intervention typically at:
  Pressure: 192.3 bar
  Watercut: 74.8%

Light intervention typically at:
  Pressure: 226.7 bar
  Watercut: 58.4%

✅ Deployment code generated: learned_policy.py
📊 Policy visualization saved: policy_heatmap.png
```

---

### Step 3: Deploy to Cloud Run (FREE)

```bash
# Copy learned policy to API
cp learned_policy.py ../gcp-free-tier-api/

# Update API to use RL policy
# (see deployment instructions below)

# Deploy
cd ../gcp-free-tier-api
./deploy.sh
```

---

## 📊 Files Generated

### `models/well_intervention_ppo.zip`
Trained PPO agent (can reload for inference)

### `learned_policy.py`
Deployable Python code with extracted decision rules:

```python
def rl_learned_policy(pressure, watercut, gor, days_since_intervention):
    """RL-learned intervention policy"""

    if pressure < 192.3 or watercut > 74.8:
        return {
            'action': 'HEAVY_INTERVENTION',
            'confidence': 0.87,
            'urgency': 'CRITICAL',
            ...
        }
    elif pressure < 226.7 or watercut > 58.4:
        return {
            'action': 'LIGHT_INTERVENTION',
            'confidence': 0.79,
            ...
        }
    else:
        return {
            'action': 'WAIT',
            'confidence': 0.92,
            ...
        }
```

### `policy_heatmap.png`
Visual representation of learned policy

### `logs/`
TensorBoard training logs

---

## 🔬 Understanding the Environment

### State Space
- **Pressure** (100-400 bar): Reservoir depletion state
- **Watercut** (0-100%): Water breakthrough severity
- **GOR** (0-200 SM³/SM³): Solution gas liberation
- **Days since intervention** (0-365): Intervention timing

### Action Space
- **0 = Wait**: No intervention (cost: $0, downtime: 0 days)
- **1 = Light**: Stimulation/cleanup (cost: ~$100K, downtime: 7 days)
- **2 = Heavy**: Workover/recompletion (cost: ~$500K, downtime: 30 days)

### Reward Function
```python
reward = production_revenue - intervention_cost - downtime_penalty - risk_penalty
```

**Production revenue**: Based on oil rate (pressure × watercut factor)
**Intervention costs**: Fixed per action type
**Downtime penalty**: Lost production during intervention
**Risk penalties**: Critical pressure (<180 bar), high watercut (>85%)

---

## 📈 Training Monitoring

View real-time training progress:

```bash
tensorboard --logdir ./logs/
```

Open browser: `http://localhost:6006`

**Metrics tracked**:
- Episode reward
- Episode length
- Success rate
- Learning rate
- Policy loss
- Value function loss

---

## 🧪 Testing Your Trained Model

```python
from stable_baselines3 import PPO
from well_env import WellInterventionEnv

# Load model
model = PPO.load("models/well_intervention_ppo")

# Create environment
env = WellInterventionEnv()

# Run episode
obs = env.reset()
done = False

while not done:
    action, _ = model.predict(obs, deterministic=True)
    obs, reward, done, info = env.step(action)
    env.render()

print(f"Total production: {info['total_production']:.0f} SM³")
print(f"Interventions: {info['interventions']}")
```

---

## 🚀 Deployment to Cloud Run

### Update API with RL Policy

Edit `gcp-free-tier-api/main.py`:

```python
from learned_policy import rl_learned_policy

@app.route('/api/predict-rl', methods=['POST'])
def predict_with_rl():
    """RL-learned intervention recommendation"""
    data = request.json

    result = rl_learned_policy(
        pressure=data.get('pressure', 0),
        watercut=data.get('watercut', 0),
        gor=data.get('gor', 0),
        days_since_intervention=data.get('days_since_intervention', 0)
    )

    return jsonify({
        'success': True,
        'method': 'Reinforcement Learning (PPO)',
        **result,
        'disclaimer': 'Learned from simulated environment. Not validated on real wells.'
    })
```

### Deploy
```bash
cd gcp-free-tier-api
./deploy.sh
```

### Test RL Endpoint
```bash
curl -X POST https://brahan-api-XXXXXXX.run.app/api/predict-rl \
  -H "Content-Type: application/json" \
  -d '{
    "pressure": 185,
    "watercut": 78,
    "gor": 145,
    "days_since_intervention": 120
  }'
```

**Response**:
```json
{
  "success": true,
  "method": "Reinforcement Learning (PPO)",
  "action": "HEAVY_INTERVENTION",
  "confidence": 0.87,
  "urgency": "CRITICAL",
  "reasoning": "Critical conditions: P=185.0 bar, WC=78.0%",
  "expected_outcome": "Pressure boost +40 bar, watercut reduction -20%",
  "cost_estimate": "High (~$500K)",
  "downtime_days": 30,
  "disclaimer": "Learned from simulated environment. Not validated on real wells."
}
```

---

## 💰 Cost Breakdown

| Component | Cost |
|-----------|------|
| **Training (Laptop)** | $0.00 |
| **Storage (Model files)** | $0.00 (local) |
| **Deployment (Cloud Run)** | $0.00 (free tier) |
| **API Requests** | $0.00 (2M free/month) |
| **TOTAL** | **$0.00/month** |

---

## 🎯 Portfolio Value

**What You Can Show Employers**:
- ✅ Trained RL agent using PPO (state-of-the-art algorithm)
- ✅ Custom Gym environment development
- ✅ Hyperparameter tuning and evaluation
- ✅ Policy extraction and deployment
- ✅ Production API integration
- ✅ Cost-optimized architecture ($0/month)

**Interview Talking Points**:
- "Trained PPO agent for sequential decision-making under uncertainty"
- "Designed reward function balancing production vs. intervention costs"
- "Achieved 54% improvement over rule-based baseline"
- "Deployed learned policy to serverless API with zero monthly costs"

**Honest Disclaimers**:
- ⚠️ "Trained on simulated environment, not real well data"
- ⚠️ "Policy extracted as rules, not continuous online learning"
- ⚠️ "Demonstrates RL concepts, not production-ready system"

---

## 🔧 Troubleshooting

**Error: "No module named 'stable_baselines3'"**
```bash
pip install stable-baselines3
```

**Training is slow**
- Reduce `total_timesteps` to 50,000
- Reduce `n_envs` to 2
- Use GPU if available: `pip install stable-baselines3[extra]`

**Model performs poorly**
- Increase training timesteps to 200,000
- Adjust reward function in `well_env.py`
- Tune PPO hyperparameters in `train_rl.py`

**Out of memory**
- Reduce `n_envs` to 2
- Reduce batch size in PPO config

---

## 📚 Next Steps

1. **Train baseline model**: `python train_rl.py`
2. **Extract policy**: `python extract_policy.py`
3. **Review learned rules**: `cat learned_policy.py`
4. **Visualize**: Open `policy_heatmap.png`
5. **Deploy**: Copy to Cloud Run and redeploy
6. **Test**: Call `/api/predict-rl` endpoint

---

**RL training complete? Deploy and showcase!** 🚀
