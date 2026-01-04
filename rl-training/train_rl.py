"""
Train Reinforcement Learning Agent for Well Intervention Optimization
Uses Stable Baselines3 PPO algorithm

Run on your laptop (FREE - no cloud costs):
    python train_rl.py

Training time: ~10-30 minutes depending on your CPU
Model will be saved to: models/well_intervention_ppo.zip
"""

import os
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.callbacks import EvalCallback, CheckpointCallback
from well_env import WellInterventionEnv


def train_agent(
    total_timesteps=100000,
    n_envs=4,
    save_freq=10000,
    model_name="well_intervention_ppo"
):
    """
    Train PPO agent for well intervention

    Args:
        total_timesteps: Number of training steps (100K = ~30 min on laptop)
        n_envs: Number of parallel environments
        save_freq: Save checkpoint every N steps
        model_name: Name for saved model
    """

    # Create output directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    # Create vectorized environment (parallel training for speed)
    env = make_vec_env(WellInterventionEnv, n_envs=n_envs)

    # Create evaluation environment
    eval_env = WellInterventionEnv()

    # Create PPO agent with optimized hyperparameters
    print("Creating PPO agent...")
    model = PPO(
        "MlpPolicy",
        env,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        verbose=1,
        tensorboard_log="./logs/"
    )

    # Setup callbacks
    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path='./models/',
        log_path='./logs/',
        eval_freq=5000,
        deterministic=True,
        render=False
    )

    checkpoint_callback = CheckpointCallback(
        save_freq=save_freq,
        save_path='./models/',
        name_prefix='checkpoint'
    )

    # Train the agent
    print(f"\nTraining for {total_timesteps} timesteps...")
    print("This will take 10-30 minutes on a laptop CPU")
    print("You can monitor progress in TensorBoard: tensorboard --logdir ./logs/\n")

    model.learn(
        total_timesteps=total_timesteps,
        callback=[eval_callback, checkpoint_callback],
        progress_bar=True
    )

    # Save final model
    model_path = f"models/{model_name}"
    model.save(model_path)
    print(f"\n✅ Model saved to: {model_path}.zip")

    # Test the trained agent
    print("\n🧪 Testing trained agent on 5 episodes...")
    test_agent(model, n_episodes=5)

    return model


def test_agent(model, n_episodes=5):
    """Test trained agent performance"""

    env = WellInterventionEnv()

    episode_rewards = []
    episode_productions = []
    episode_interventions = []

    for episode in range(n_episodes):
        obs = env.reset()
        done = False
        episode_reward = 0

        while not done:
            action, _ = model.predict(obs, deterministic=True)
            obs, reward, done, info = env.step(action)
            episode_reward += reward

        episode_rewards.append(episode_reward)
        episode_productions.append(info['total_production'])
        episode_interventions.append(info['interventions'])

        print(f"Episode {episode + 1}: Reward={episode_reward:.1f}, "
              f"Production={info['total_production']:.0f} SM³, "
              f"Interventions={info['interventions']}")

    print(f"\n📊 Test Results (5 episodes):")
    print(f"Average Reward: {np.mean(episode_rewards):.1f} ± {np.std(episode_rewards):.1f}")
    print(f"Average Production: {np.mean(episode_productions):.0f} ± {np.std(episode_productions):.0f} SM³")
    print(f"Average Interventions: {np.mean(episode_interventions):.1f} ± {np.std(episode_interventions):.1f}")


def compare_with_baseline():
    """Compare RL agent against rule-based baseline"""

    print("\n🔬 Comparing RL agent vs. Rule-based baseline...")

    # Load trained model
    model = PPO.load("models/well_intervention_ppo")

    env = WellInterventionEnv()
    n_episodes = 10

    # Test RL agent
    rl_rewards = []
    for _ in range(n_episodes):
        obs = env.reset()
        done = False
        episode_reward = 0

        while not done:
            action, _ = model.predict(obs, deterministic=True)
            obs, reward, done, info = env.step(action)
            episode_reward += reward

        rl_rewards.append(episode_reward)

    # Test rule-based policy
    def rule_based_policy(obs):
        """Simple rule-based intervention strategy"""
        pressure, watercut, gor, days = obs

        if pressure < 180 or watercut > 80:
            return 2  # Heavy intervention
        elif pressure < 220 or watercut > 60:
            return 1  # Light intervention
        else:
            return 0  # Wait

    rule_rewards = []
    for _ in range(n_episodes):
        obs = env.reset()
        done = False
        episode_reward = 0

        while not done:
            action = rule_based_policy(obs)
            obs, reward, done, info = env.step(action)
            episode_reward += reward

        rule_rewards.append(episode_reward)

    print(f"\n📈 Comparison Results ({n_episodes} episodes):")
    print(f"RL Agent:        {np.mean(rl_rewards):.1f} ± {np.std(rl_rewards):.1f}")
    print(f"Rule-based:      {np.mean(rule_rewards):.1f} ± {np.std(rule_rewards):.1f}")
    print(f"Improvement:     {((np.mean(rl_rewards) - np.mean(rule_rewards)) / abs(np.mean(rule_rewards)) * 100):.1f}%")


if __name__ == "__main__":
    print("=" * 60)
    print("Well Intervention RL Training")
    print("=" * 60)
    print("\nThis will train an RL agent to optimize well interventions")
    print("Training on your laptop (no cloud costs)")
    print("\nRequirements:")
    print("  pip install stable-baselines3 gym numpy")
    print("\n" + "=" * 60 + "\n")

    # Train the agent
    model = train_agent(
        total_timesteps=100000,  # Increase for better performance
        n_envs=4,
        save_freq=10000
    )

    # Compare with baseline
    compare_with_baseline()

    print("\n✅ Training complete!")
    print("\nNext steps:")
    print("1. Run: python extract_policy.py")
    print("2. Copy learned rules to Cloud Run API")
    print("3. Deploy with: ./deploy.sh")
