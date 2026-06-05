"""Main entry point for running the agent."""

from my_agent.agent import create_agent


def main():
    """Run the agent."""
    agent = create_agent()

    print(f"╔════════════════════════════════════════╗")
    print(f"║     {agent.name.upper()} v0.1.0                   ║")
    print(f"╚════════════════════════════════════════╝")
    print()
    print("Available tools:")
    print("  - get_status(): Get agent status")
    print("  - process_task(task, priority): Process a task")
    print("  - calculate(operation, a, b): Perform calculations")
    print()
    print("Agent is ready. Use the API to interact with tools.")
    print()


if __name__ == "__main__":
    main()
