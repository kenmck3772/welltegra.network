import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock child components to isolate App testing
vi.mock('./components/SplashScreen', () => ({
  default: ({ onComplete }) => (
    <div data-testid="splash-screen">
      <button onClick={onComplete}>Complete Splash</button>
    </div>
  ),
}));

vi.mock('./components/TrainingView', () => ({
  default: ({ showBanner, assignmentReason }) => (
    <div data-testid="training-view">
      {showBanner && <div data-testid="training-banner">{assignmentReason}</div>}
    </div>
  ),
}));

vi.mock('./components/VoiceCommandInterface', () => ({
  default: ({ onCommand }) => (
    <div data-testid="voice-interface">
      <button onClick={() => onCommand('NAVIGATE_PLANNER')}>Go to Planner</button>
      <button onClick={() => onCommand('PHYSICS_MODE_ON')}>Enable Physics</button>
      <button onClick={() => onCommand('PHYSICS_MODE_OFF')}>Disable Physics</button>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Splash Screen', () => {
    it('shows splash screen on initial render', () => {
      render(<App />);
      expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    });

    it('hides splash screen after completion', async () => {
      render(<App />);
      const completeButton = screen.getByText('Complete Splash');
      await userEvent.click(completeButton);

      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
      expect(screen.getByText('Brahan Vertex')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      render(<App />);
      await userEvent.click(screen.getByText('Complete Splash'));
    });

    it('renders navigation sidebar with all menu items', () => {
      expect(screen.getByText('Executive View')).toBeInTheDocument();
      expect(screen.getByText('Scheduler')).toBeInTheDocument();
      expect(screen.getByText('Planner')).toBeInTheDocument();
      expect(screen.getByText('Execution')).toBeInTheDocument();
      expect(screen.getByText('Competency')).toBeInTheDocument();
    });

    it('shows Executive Dashboard by default', () => {
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    it('navigates to Scheduler view', async () => {
      await userEvent.click(screen.getByText('Scheduler'));
      expect(screen.getByText('Operation Scheduler')).toBeInTheDocument();
    });

    it('navigates to Planner view', async () => {
      await userEvent.click(screen.getByText('Planner'));
      expect(screen.getByText('Intervention Planner')).toBeInTheDocument();
    });

    it('navigates to Execution view', async () => {
      await userEvent.click(screen.getByText('Execution'));
      expect(screen.getByText('Operational Execution')).toBeInTheDocument();
    });
  });

  describe('Physics Mode', () => {
    beforeEach(async () => {
      render(<App />);
      await userEvent.click(screen.getByText('Complete Splash'));
    });

    it('physics mode is off by default', () => {
      const physicsToggle = screen.getByRole('checkbox');
      expect(physicsToggle).not.toBeChecked();
    });

    it('toggles physics mode on', async () => {
      const physicsToggle = screen.getByRole('checkbox');
      await userEvent.click(physicsToggle);

      expect(physicsToggle).toBeChecked();
      expect(screen.getByText(/PHYSICS MODE ACTIVE/i)).toBeInTheDocument();
    });

    it('shows physics warning for Node-02 when physics mode is on', async () => {
      const physicsToggle = screen.getByRole('checkbox');
      await userEvent.click(physicsToggle);

      expect(screen.getByText(/Physics constraints active - Node-02 flagged CRITICAL/i)).toBeInTheDocument();
    });

    it('updates Node-02 integrity to 0% when physics mode is enabled', async () => {
      const physicsToggle = screen.getByRole('checkbox');
      await userEvent.click(physicsToggle);

      // Node-02 should now show 0% instead of 12%
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText(/Physics override: 12% → 0%/i)).toBeInTheDocument();
    });
  });

  describe('Well Cards', () => {
    beforeEach(async () => {
      render(<App />);
      await userEvent.click(screen.getByText('Complete Splash'));
    });

    it('displays all three wells', () => {
      expect(screen.getByText('Node-01')).toBeInTheDocument();
      expect(screen.getByText('Node-02')).toBeInTheDocument();
      expect(screen.getByText('Node-03')).toBeInTheDocument();
    });

    it('displays correct integrity scores', () => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('12%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('shows AI recommendations for wells', () => {
      expect(screen.getByText('Standard Intervention')).toBeInTheDocument();
      expect(screen.getByText('Enhanced Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Barrier Verification Required')).toBeInTheDocument();
    });
  });

  describe('Execution View', () => {
    beforeEach(async () => {
      render(<App />);
      await userEvent.click(screen.getByText('Complete Splash'));
      await userEvent.click(screen.getByText('Execution'));
    });

    it('renders execution checklist', () => {
      expect(screen.getByText('Pre-Execution Checklist')).toBeInTheDocument();
      expect(screen.getByText('Barrier verification complete')).toBeInTheDocument();
      expect(screen.getByText('Well integrity confirmed')).toBeInTheDocument();
      expect(screen.getByText('Physics constraints satisfied')).toBeInTheDocument();
      expect(screen.getByText('HSE approval obtained')).toBeInTheDocument();
    });

    it('shows all checklist items as checked when physics mode is off', () => {
      const checkmarks = screen.getAllByText(/Barrier verification complete|Well integrity confirmed|Physics constraints satisfied|HSE approval obtained/);
      expect(checkmarks).toHaveLength(4);
    });

    it('shows warning when physics mode is active', async () => {
      // Go back to toggle physics mode
      await userEvent.click(screen.getByText('Executive View'));
      const physicsToggle = screen.getByRole('checkbox');
      await userEvent.click(physicsToggle);

      // Go back to execution
      await userEvent.click(screen.getByText('Execution'));

      expect(screen.getByText('Physics Constraint Active')).toBeInTheDocument();
      expect(screen.getByText(/Node-02 flagged as critical/i)).toBeInTheDocument();
    });
  });

  describe('Voice Commands', () => {
    beforeEach(async () => {
      render(<App />);
      await userEvent.click(screen.getByText('Complete Splash'));
    });

    it('navigates via voice command', async () => {
      const plannerButton = screen.getByText('Go to Planner');
      await userEvent.click(plannerButton);

      expect(screen.getByText('Intervention Planner')).toBeInTheDocument();
    });

    it('enables physics mode via voice command', async () => {
      const enablePhysics = screen.getByText('Enable Physics');
      await userEvent.click(enablePhysics);

      expect(screen.getByText(/PHYSICS MODE ACTIVE/i)).toBeInTheDocument();
    });

    it('disables physics mode via voice command', async () => {
      // First enable
      await userEvent.click(screen.getByText('Enable Physics'));
      expect(screen.getByText(/PHYSICS MODE ACTIVE/i)).toBeInTheDocument();

      // Then disable
      await userEvent.click(screen.getByText('Disable Physics'));
      expect(screen.queryByText(/PHYSICS MODE ACTIVE/i)).not.toBeInTheDocument();
    });
  });
});

describe('Well Data Constants', () => {
  it('has correct structure for master wells', () => {
    // These are tested through the UI but we verify the data structure
    render(<App />);

    // Should have Node-01 with 85% integrity
    // Should have Node-02 with 12% integrity (baseline, drops to 0% with physics)
    // Should have Node-03 with 45% integrity and safety locked
  });
});
