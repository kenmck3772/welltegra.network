#!/usr/bin/env python3
"""
Synthetic Toolstring Data Generator for ML Training

Generates realistic toolstring configurations with operational outcomes
for training predictive ML models on stuck-in-hole probability.

Features:
- Realistic tool combinations based on operation type
- Physics-based failure probability calculations
- Well condition variations (depth, deviation, casing)
- Historical pattern simulation
- ML-ready feature engineering

Author: Ken McKenzie
"""

import json
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os
import argparse


class ToolstringGenerator:
    """Generates synthetic toolstring data for ML training"""

    # Tool library by category
    TOOL_LIBRARY = {
        'fishing': [
            {'name': 'Hydraulic Jar', 'od_range': (3.0, 5.0), 'length_range': (6.0, 10.0)},
            {'name': 'Mechanical Jar', 'od_range': (3.0, 4.5), 'length_range': (5.0, 9.0)},
            {'name': 'Fishing Accelerator', 'od_range': (2.5, 4.0), 'length_range': (3.0, 5.0)},
            {'name': 'Overshot', 'od_range': (4.0, 6.0), 'length_range': (2.5, 4.5)},
            {'name': 'Spear', 'od_range': (2.5, 4.5), 'length_range': (2.0, 3.5)},
            {'name': 'Fishing Magnet', 'od_range': (3.0, 5.0), 'length_range': (1.5, 3.0)},
            {'name': 'Junk Basket', 'od_range': (3.5, 5.5), 'length_range': (2.0, 4.0)},
        ],
        'completion': [
            {'name': 'Production Packer', 'od_range': (5.0, 7.5), 'length_range': (3.0, 5.0)},
            {'name': 'Tubing Hanger', 'od_range': (5.5, 8.0), 'length_range': (1.5, 2.5)},
            {'name': 'Seal Assembly', 'od_range': (4.5, 6.5), 'length_range': (1.5, 3.0)},
            {'name': 'Landing Nipple', 'od_range': (4.0, 6.0), 'length_range': (1.0, 2.0)},
            {'name': 'SCSSV', 'od_range': (4.5, 6.5), 'length_range': (2.5, 4.0)},
            {'name': 'Flow Coupling', 'od_range': (4.0, 5.5), 'length_range': (0.8, 1.5)},
        ],
        'drillstring': [
            {'name': 'Drill Collar', 'od_range': (3.5, 6.0), 'length_range': (9.0, 30.0)},
            {'name': 'Heavy Weight Drill Pipe', 'od_range': (3.5, 5.5), 'length_range': (9.0, 30.0)},
            {'name': 'Landing Sub', 'od_range': (3.0, 5.0), 'length_range': (1.0, 2.0)},
            {'name': 'Safety Joint', 'od_range': (3.0, 4.5), 'length_range': (1.5, 3.0)},
            {'name': 'Bumper Sub', 'od_range': (3.0, 5.0), 'length_range': (2.5, 4.5)},
            {'name': 'Swivel', 'od_range': (4.0, 6.0), 'length_range': (2.0, 3.5)},
            {'name': 'Crossover', 'od_range': (3.0, 5.0), 'length_range': (0.5, 1.5)},
        ],
        'pa': [
            {'name': 'Cement Retainer', 'od_range': (4.5, 7.0), 'length_range': (2.0, 4.0)},
            {'name': 'Bridge Plug', 'od_range': (4.0, 7.5), 'length_range': (1.5, 3.5)},
            {'name': 'Mechanical Plug', 'od_range': (4.0, 7.0), 'length_range': (1.0, 2.5)},
            {'name': 'Straddle Packer', 'od_range': (5.0, 7.5), 'length_range': (4.0, 8.0)},
        ],
        'wireline': [
            {'name': 'CCL (Casing Collar Locator)', 'od_range': (1.5, 3.0), 'length_range': (0.5, 1.5)},
            {'name': 'Gamma Ray Tool', 'od_range': (1.5, 3.5), 'length_range': (1.0, 2.5)},
            {'name': 'Perforating Gun', 'od_range': (2.0, 4.0), 'length_range': (3.0, 15.0)},
            {'name': 'Setting Tool', 'od_range': (2.5, 4.5), 'length_range': (2.0, 4.0)},
        ]
    }

    # Operation types and their typical tool combinations
    OPERATION_TYPES = {
        'fishing': {
            'base_tools': ['fishing', 'drillstring'],
            'tool_count_range': (5, 12),
            'base_risk': 0.35,
            'description': 'Fishing operation to recover stuck tools'
        },
        'completion': {
            'base_tools': ['completion', 'drillstring'],
            'tool_count_range': (4, 10),
            'base_risk': 0.15,
            'description': 'Well completion installation'
        },
        'pa_operation': {
            'base_tools': ['pa', 'drillstring'],
            'tool_count_range': (3, 8),
            'base_risk': 0.20,
            'description': 'Plug and abandonment operation'
        },
        'wireline': {
            'base_tools': ['wireline', 'drillstring'],
            'tool_count_range': (3, 7),
            'base_risk': 0.10,
            'description': 'Wireline intervention'
        }
    }

    def __init__(self, seed: int = 42):
        """Initialize generator with random seed for reproducibility"""
        random.seed(seed)
        self.run_counter = 0

    def generate_tool(self, category: str) -> Dict[str, Any]:
        """Generate a single tool with realistic dimensions"""
        tool_template = random.choice(self.TOOL_LIBRARY[category])

        # Add realistic variation
        od = round(random.uniform(*tool_template['od_range']), 2)
        length = round(random.uniform(*tool_template['length_range']), 1)

        # Calculate fishing neck (if applicable)
        neck = None
        if category == 'fishing' or 'jar' in tool_template['name'].lower():
            neck = round(od - random.uniform(0.5, 1.0), 2)

        return {
            'name': tool_template['name'],
            'od': od,
            'neck': neck,
            'length': length,
            'category': category
        }

    def calculate_failure_probability(self,
                                     toolstring: List[Dict],
                                     well_conditions: Dict) -> float:
        """
        Physics-informed failure probability calculation

        Factors:
        - Toolstring length (longer = higher risk)
        - Maximum OD vs casing clearance
        - Well deviation (higher deviation = higher risk)
        - Tool count (complexity)
        - Jarring capability (mitigation)
        """
        # Base risk from operation type
        base_risk = well_conditions['base_risk']

        # Calculate toolstring metrics
        total_length = sum(t['length'] for t in toolstring)
        max_od = max(t['od'] for t in toolstring)
        tool_count = len(toolstring)

        # Risk factors
        length_factor = min(total_length / 100.0, 0.3)  # Max +30% for length

        clearance = well_conditions['casing_id'] - max_od
        clearance_factor = max(0, (2.0 - clearance) / 10.0)  # Tight clearance increases risk

        deviation_factor = (well_conditions['deviation'] / 90.0) * 0.25  # Max +25% for 90° deviation

        complexity_factor = min(tool_count / 20.0, 0.15)  # Max +15% for complexity

        # Mitigating factors
        has_jar = any('jar' in t['name'].lower() for t in toolstring)
        jar_mitigation = -0.10 if has_jar else 0

        # Calculate final probability
        probability = base_risk + length_factor + clearance_factor + deviation_factor + complexity_factor + jar_mitigation

        # Clamp between 0.05 and 0.95
        return max(0.05, min(0.95, probability))

    def generate_well_conditions(self) -> Dict[str, Any]:
        """Generate realistic well conditions"""
        depth = random.randint(1000, 5000)
        deviation = round(random.uniform(0, 60), 1)

        # Casing size correlates with depth
        casing_sizes = [
            (7.0, 6.094),   # 7" casing
            (9.625, 8.535), # 9-5/8" casing
            (13.375, 12.415) # 13-3/8" casing
        ]
        casing_od, casing_id = random.choice(casing_sizes)

        return {
            'depth': depth,
            'deviation': deviation,
            'casing_od': casing_od,
            'casing_id': casing_id,
            'formation': random.choice(['Sandstone', 'Shale', 'Limestone', 'Mixed'])
        }

    def generate_run(self, operation_type: str = None) -> Dict[str, Any]:
        """Generate a complete toolstring run with outcome"""
        self.run_counter += 1

        # Select operation type
        if operation_type is None:
            operation_type = random.choice(list(self.OPERATION_TYPES.keys()))

        op_config = self.OPERATION_TYPES[operation_type]

        # Generate well conditions
        well_conditions = self.generate_well_conditions()
        well_conditions['base_risk'] = op_config['base_risk']

        # Generate toolstring
        tool_count = random.randint(*op_config['tool_count_range'])
        toolstring = []

        for i in range(tool_count):
            category = random.choice(op_config['base_tools'])
            tool = self.generate_tool(category)
            tool['position'] = i + 1
            toolstring.append(tool)

        # Calculate statistics
        total_length = sum(t['length'] for t in toolstring)
        max_od = max(t['od'] for t in toolstring)

        # Calculate failure probability
        failure_prob = self.calculate_failure_probability(toolstring, well_conditions)

        # Determine outcome based on probability
        failed = random.random() < failure_prob

        # Generate realistic timestamp (last 2 years)
        days_ago = random.randint(0, 730)
        run_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')

        # Generate run ID
        run_id = f"run-{self.run_counter:03d}-{operation_type}"

        return {
            'run_id': run_id,
            'run_name': f"Run {self.run_counter:03d} - {op_config['description']}",
            'well_name': f"Well-{random.randint(100, 999)}",
            'run_date': run_date,
            'operation_type': operation_type,
            'toolstring': toolstring,
            'well_conditions': well_conditions,
            'stats': {
                'tool_count': tool_count,
                'total_length': round(total_length, 1),
                'max_od': max_od
            },
            'outcome': {
                'stuck_in_hole': failed,
                'failure_probability': round(failure_prob, 3),
                'success': not failed,
                'npt_hours': round(random.uniform(24, 120), 1) if failed else 0
            },
            'lessons': self._generate_lessons(failed, failure_prob, toolstring, well_conditions)
        }

    def _generate_lessons(self, failed: bool, prob: float, toolstring: List, conditions: Dict) -> str:
        """Generate realistic lessons learned based on outcome"""
        if failed:
            reasons = []
            if conditions['deviation'] > 45:
                reasons.append("high wellbore deviation")
            if max(t['od'] for t in toolstring) > conditions['casing_id'] - 1.0:
                reasons.append("tight clearance")
            if not any('jar' in t['name'].lower() for t in toolstring):
                reasons.append("no jarring capability")

            return f"Stuck in hole due to {', '.join(reasons) if reasons else 'operational challenges'}. NPT incurred."
        else:
            return "Operation completed successfully within planned time."

    def generate_dataset(self, num_runs: int = 60) -> Dict[str, List]:
        """Generate complete dataset with multiple runs"""
        runs = []

        # Distribution of operation types
        op_distribution = {
            'fishing': 0.25,
            'completion': 0.35,
            'pa_operation': 0.20,
            'wireline': 0.20
        }

        for _ in range(num_runs):
            # Select operation type based on distribution
            rand = random.random()
            cumulative = 0
            selected_op = None

            for op_type, prob in op_distribution.items():
                cumulative += prob
                if rand <= cumulative:
                    selected_op = op_type
                    break

            run = self.generate_run(selected_op)
            runs.append(run)

        return {'runs': runs}

    def save_to_file(self, data: Dict, filename: str):
        """Save generated data to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Saved {len(data['runs'])} runs to {filename}")


def main():
    """Generate synthetic toolstring data"""
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Generate synthetic toolstring data for ML training')
    parser.add_argument('--num-runs', type=int, default=60,
                       help='Number of runs to generate (default: 60, Vertex AI needs 1000+)')
    parser.add_argument('--seed', type=int, default=42,
                       help='Random seed for reproducibility (default: 42)')
    args = parser.parse_args()

    print("🔧 Synthetic Toolstring Data Generator")
    print("=" * 50)

    # Create generator
    generator = ToolstringGenerator(seed=args.seed)

    # Generate dataset
    num_runs = args.num_runs
    print(f"\n📊 Generating {num_runs} synthetic runs...")
    dataset = generator.generate_dataset(num_runs)

    # Calculate statistics
    total_tools = sum(len(run['toolstring']) for run in dataset['runs'])
    failures = sum(1 for run in dataset['runs'] if run['outcome']['stuck_in_hole'])
    failure_rate = (failures / num_runs) * 100

    print(f"\n✅ Generated dataset:")
    print(f"   - Total runs: {num_runs}")
    print(f"   - Total tools: {total_tools}")
    print(f"   - Failures: {failures} ({failure_rate:.1f}%)")
    print(f"   - Successes: {num_runs - failures}")

    # Save to file
    output_file = 'data/synthetic-toolstring-runs.json'
    os.makedirs('data', exist_ok=True)
    generator.save_to_file(dataset, output_file)

    # Also create BigQuery-ready format
    print("\n🔄 Creating BigQuery-ready format...")

    # This will be used by the upload script
    print(f"\n💡 Next step: Run the BigQuery upload script to add this data:")
    print(f"   python3 scripts/upload-synthetic-to-bigquery.py")


if __name__ == '__main__':
    main()

