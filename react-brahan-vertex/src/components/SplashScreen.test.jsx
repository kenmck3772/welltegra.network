import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SplashScreen from './SplashScreen';

describe('SplashScreen Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders the splash screen with branding', () => {
      render(<SplashScreen onComplete={() => {}} />);

      expect(screen.getByText('WELL-TEGRA')).toBeInTheDocument();
      expect(screen.getByText('The Brahan Vertex Engine')).toBeInTheDocument();
    });

    it('shows the initiate sequence button', () => {
      render(<SplashScreen onComplete={() => {}} />);
      expect(screen.getByText('Initiate Sequence')).toBeInTheDocument();
    });

    it('is fully visible initially (opacity-100)', () => {
      render(<SplashScreen onComplete={() => {}} />);
      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      expect(container).toHaveClass('opacity-100');
    });
  });

  describe('Click Interaction', () => {
    it('triggers fade animation on click', async () => {
      const onComplete = vi.fn();
      render(<SplashScreen onComplete={onComplete} />);

      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      fireEvent.click(container);

      // Should start fading
      expect(container).toHaveClass('opacity-0');
    });

    it('calls onComplete after fade animation', async () => {
      const onComplete = vi.fn();
      render(<SplashScreen onComplete={onComplete} />);

      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      fireEvent.click(container);

      // Fast-forward through the 1 second timeout
      vi.advanceTimersByTime(1000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('disables pointer events after click', () => {
      render(<SplashScreen onComplete={() => {}} />);

      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      fireEvent.click(container);

      expect(container).toHaveClass('pointer-events-none');
    });
  });

  describe('Visual Elements', () => {
    it('has cursor-pointer class for clickability indication', () => {
      render(<SplashScreen onComplete={() => {}} />);
      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      expect(container).toHaveClass('cursor-pointer');
    });

    it('has proper z-index for overlay', () => {
      render(<SplashScreen onComplete={() => {}} />);
      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      expect(container).toHaveClass('z-[999]');
    });

    it('covers full screen (fixed inset-0)', () => {
      render(<SplashScreen onComplete={() => {}} />);
      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      expect(container).toHaveClass('fixed');
      expect(container).toHaveClass('inset-0');
    });
  });

  describe('Accessibility', () => {
    it('splash screen element is clickable', async () => {
      const onComplete = vi.fn();
      render(<SplashScreen onComplete={onComplete} />);

      const container = screen.getByText('WELL-TEGRA').closest('div[class*="fixed"]');
      await userEvent.click(container);

      vi.advanceTimersByTime(1000);
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
