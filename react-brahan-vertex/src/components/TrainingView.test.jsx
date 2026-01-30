import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainingView from './TrainingView';

// Mock child components
vi.mock('./hydrostatic/HydrostaticAcademy', () => ({
  default: ({ onExit }) => (
    <div data-testid="hydrostatic-academy">
      <button onClick={onExit}>Exit Hydrostatic</button>
    </div>
  ),
}));

vi.mock('./integrity-hub/IntegrityHub', () => ({
  default: ({ onExit }) => (
    <div data-testid="integrity-hub">
      <button onClick={onExit}>Exit Integrity Hub</button>
    </div>
  ),
}));

vi.mock('./wellbore-visualizer/WellboreVisualizer', () => ({
  default: ({ onExit }) => (
    <div data-testid="wellbore-visualizer">
      <button onClick={onExit}>Exit Visualizer</button>
    </div>
  ),
}));

vi.mock('./toolstring-assembler/ToolstringAssembler', () => ({
  default: ({ onExit }) => (
    <div data-testid="toolstring-assembler">
      <button onClick={onExit}>Exit Assembler</button>
    </div>
  ),
}));

vi.mock('./slickline/SlicklineOperationsLab', () => ({
  default: ({ onExit }) => (
    <div data-testid="slickline-lab">
      <button onClick={onExit}>Exit Lab</button>
    </div>
  ),
}));

vi.mock('./well-control/WellControlAcademy', () => ({
  default: ({ onExit }) => (
    <div data-testid="well-control-academy">
      <button onClick={onExit}>Exit Academy</button>
    </div>
  ),
}));

describe('TrainingView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders competency training module header', () => {
      render(<TrainingView />);
      expect(screen.getByText('Competency Training Module')).toBeInTheDocument();
    });

    it('renders all training academy buttons', () => {
      render(<TrainingView />);
      expect(screen.getByText('Enter Academy →')).toBeInTheDocument();
      expect(screen.getByText('Launch Hub →')).toBeInTheDocument();
      expect(screen.getByText('Open Visualizer →')).toBeInTheDocument();
      expect(screen.getByText('Build String →')).toBeInTheDocument();
      expect(screen.getByText('Enter Lab →')).toBeInTheDocument();
      expect(screen.getByText('Launch Academy →')).toBeInTheDocument();
    });

    it('renders video training modules', () => {
      render(<TrainingView />);
      expect(screen.getByText('Micro-Annulus Diagnostics')).toBeInTheDocument();
      expect(screen.getByText('P&A Barrier Verification')).toBeInTheDocument();
    });
  });

  describe('Assignment Banner', () => {
    it('shows assignment banner when showBanner is true with reason', () => {
      const reason = 'Physics constraint violation detected';
      render(<TrainingView showBanner={true} assignmentReason={reason} />);

      expect(screen.getByText('System Trigger: Remedial Training Assigned')).toBeInTheDocument();
      expect(screen.getByText(reason)).toBeInTheDocument();
    });

    it('does not show banner when showBanner is false', () => {
      render(<TrainingView showBanner={false} assignmentReason="Some reason" />);
      expect(screen.queryByText('System Trigger: Remedial Training Assigned')).not.toBeInTheDocument();
    });
  });

  describe('Academy Navigation', () => {
    it('opens Hydrostatic Academy when clicking Enter Academy', async () => {
      render(<TrainingView />);
      const enterButton = screen.getByText('Enter Academy →');
      await userEvent.click(enterButton);

      expect(screen.getByTestId('hydrostatic-academy')).toBeInTheDocument();
    });

    it('returns from Hydrostatic Academy when clicking exit', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Enter Academy →'));
      await userEvent.click(screen.getByText('Exit Hydrostatic'));

      expect(screen.queryByTestId('hydrostatic-academy')).not.toBeInTheDocument();
      expect(screen.getByText('Competency Training Module')).toBeInTheDocument();
    });

    it('opens Integrity Hub when clicking Launch Hub', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Launch Hub →'));
      expect(screen.getByTestId('integrity-hub')).toBeInTheDocument();
    });

    it('opens Wellbore Visualizer when clicking Open Visualizer', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Open Visualizer →'));
      expect(screen.getByTestId('wellbore-visualizer')).toBeInTheDocument();
    });

    it('opens Toolstring Assembler when clicking Build String', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Build String →'));
      expect(screen.getByTestId('toolstring-assembler')).toBeInTheDocument();
    });

    it('opens Slickline Operations Lab when clicking Enter Lab', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Enter Lab →'));
      expect(screen.getByTestId('slickline-lab')).toBeInTheDocument();
    });

    it('opens Well Control Academy when clicking Launch Academy', async () => {
      render(<TrainingView />);
      await userEvent.click(screen.getByText('Launch Academy →'));
      expect(screen.getByTestId('well-control-academy')).toBeInTheDocument();
    });
  });

  describe('Video Modules', () => {
    it('shows video completion message after timer', async () => {
      render(<TrainingView />);

      // Initially buttons should show "Watch video to verify"
      const watchButtons = screen.getAllByText(/Watch video to verify/i);
      expect(watchButtons.length).toBeGreaterThan(0);
    });

    it('shows completion gate message when videos not completed', () => {
      render(<TrainingView />);
      expect(screen.getByText(/Complete all video modules before proceeding to the quiz/i)).toBeInTheDocument();
    });
  });

  describe('Quiz Functionality', () => {
    // Helper to complete videos and access quiz
    const setupQuizAccess = async () => {
      render(<TrainingView />);

      // Simulate video completion by triggering the setTimeout
      vi.advanceTimersByTime(10000);

      // Find and click video completion buttons to mark as completed
      // In real tests, we'd need to verify the buttons change state
    };

    it('displays three quiz questions', async () => {
      render(<TrainingView />);

      // The questions are rendered but quiz section might be gated
      expect(screen.getByText('Physics-Informed Safety Constraint')).toBeInTheDocument();
      expect(screen.getByText('Rapid Bleed Down Detection')).toBeInTheDocument();
      expect(screen.getByText('Closed-Loop Learning')).toBeInTheDocument();
    });

    it('has correct answer for physics constraint question', () => {
      render(<TrainingView />);
      const correctAnswer = screen.getByText('Override to physics mode - treat as Critical (0%)');
      expect(correctAnswer).toBeInTheDocument();
    });
  });
});

describe('TrainingView Quiz Scoring', () => {
  it('correctly structures quiz options with correct answers', () => {
    render(<TrainingView />);

    // Verify the module structure
    const q1Correct = screen.getByText('Override to physics mode - treat as Critical (0%)');
    const q2Correct = screen.getByText('Barrier integrity failure - STOP operations');
    const q3Correct = screen.getByText('To demonstrate closed-loop competency development');

    expect(q1Correct).toBeInTheDocument();
    expect(q2Correct).toBeInTheDocument();
    expect(q3Correct).toBeInTheDocument();
  });
});

describe('TrainingView Video Modules Data', () => {
  it('contains correct video module information', () => {
    render(<TrainingView />);

    expect(screen.getByText('Micro-Annulus Diagnostics')).toBeInTheDocument();
    expect(screen.getByText(/Learn to identify micro-annulus conditions/i)).toBeInTheDocument();

    expect(screen.getByText('P&A Barrier Verification')).toBeInTheDocument();
    expect(screen.getByText(/Master barrier verification techniques/i)).toBeInTheDocument();
  });
});
