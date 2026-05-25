import { render, screen, userEvent } from '@/__tests__/test-utils';
import { ScoreButton, ScoreGroup } from '../score-button';

describe('ScoreButton Component', () => {
  const defaultProps = {
    score: 1 as const,
    selected: false,
    onClick: jest.fn(),
    criteria: 'Test criteria for this score',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with score value displayed', () => {
      render(<ScoreButton {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders score 1 with Non-Compliant label', () => {
      render(<ScoreButton {...defaultProps} score={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      // Label appears in both button and tooltip
      expect(screen.getAllByText('Non-Compliant').length).toBe(2);
    });

    it('renders score 2 with Partially Compliant label', () => {
      render(<ScoreButton {...defaultProps} score={2} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      // Label appears in both button and tooltip
      expect(screen.getAllByText('Partially Compliant').length).toBe(2);
    });

    it('renders score 3 with Fully Compliant label', () => {
      render(<ScoreButton {...defaultProps} score={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      // Label appears in both button and tooltip
      expect(screen.getAllByText('Fully Compliant').length).toBe(2);
    });
  });

  describe('color variants', () => {
    it('applies red styles for score 1 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={1} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-50');
      expect(button).toHaveClass('border-red-300');
    });

    it('applies red selected styles for score 1 when selected', () => {
      render(<ScoreButton {...defaultProps} score={1} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
      expect(button).toHaveClass('border-red-600');
      expect(button).toHaveClass('ring-2');
    });

    it('applies yellow styles for score 2 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={2} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-amber-50');
      expect(button).toHaveClass('border-amber-300');
    });

    it('applies yellow selected styles for score 2 when selected', () => {
      render(<ScoreButton {...defaultProps} score={2} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-amber-500');
      expect(button).toHaveClass('border-amber-600');
      expect(button).toHaveClass('ring-2');
    });

    it('applies green styles for score 3 when not selected', () => {
      render(<ScoreButton {...defaultProps} score={3} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-50');
      expect(button).toHaveClass('border-green-300');
    });

    it('applies green selected styles for score 3 when selected', () => {
      render(<ScoreButton {...defaultProps} score={3} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-500');
      expect(button).toHaveClass('border-green-600');
      expect(button).toHaveClass('ring-2');
    });
  });

  describe('click handling', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<ScoreButton {...defaultProps} onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<ScoreButton {...defaultProps} onClick={handleClick} disabled />);

      const button = screen.getByRole('button');
      await user.click(button).catch(() => {
        // userEvent may throw when clicking disabled buttons
      });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled styles when disabled', () => {
      render(<ScoreButton {...defaultProps} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('is not disabled by default', () => {
      render(<ScoreButton {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('criteria tooltip', () => {
    it('renders criteria text in tooltip', () => {
      const criteria = 'This is the specific criteria for scoring';
      render(<ScoreButton {...defaultProps} criteria={criteria} />);
      expect(screen.getByText(criteria)).toBeInTheDocument();
    });

    it('renders the score label in tooltip', () => {
      render(<ScoreButton {...defaultProps} score={1} />);
      // The label appears twice - once in the button and once in the tooltip
      const nonCompliantLabels = screen.getAllByText('Non-Compliant');
      expect(nonCompliantLabels.length).toBe(2);
    });
  });
});

describe('ScoreGroup Component', () => {
  const defaultCriteria = {
    score1: 'Criteria for non-compliant',
    score2: 'Criteria for partially compliant',
    score3: 'Criteria for fully compliant',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all three score buttons', () => {
      render(
        <ScoreGroup
          value={undefined}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders all score labels', () => {
      render(
        <ScoreGroup
          value={undefined}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      // Labels appear in both buttons and tooltips
      expect(screen.getAllByText('Non-Compliant').length).toBe(2);
      expect(screen.getAllByText('Partially Compliant').length).toBe(2);
      expect(screen.getAllByText('Fully Compliant').length).toBe(2);
    });
  });

  describe('selection state', () => {
    it('shows score 1 as selected when value is 1', () => {
      render(
        <ScoreGroup
          value={1}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First button (score 1) should have selected styles
      expect(buttons[0]).toHaveClass('bg-red-500');
      // Other buttons should not have selected styles
      expect(buttons[1]).toHaveClass('bg-amber-50');
      expect(buttons[2]).toHaveClass('bg-green-50');
    });

    it('shows score 2 as selected when value is 2', () => {
      render(
        <ScoreGroup
          value={2}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('bg-red-50');
      expect(buttons[1]).toHaveClass('bg-amber-500');
      expect(buttons[2]).toHaveClass('bg-green-50');
    });

    it('shows score 3 as selected when value is 3', () => {
      render(
        <ScoreGroup
          value={3}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('bg-red-50');
      expect(buttons[1]).toHaveClass('bg-amber-50');
      expect(buttons[2]).toHaveClass('bg-green-500');
    });

    it('shows no selection when value is undefined', () => {
      render(
        <ScoreGroup
          value={undefined}
          onChange={jest.fn()}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      // All buttons should have unselected styles
      expect(buttons[0]).toHaveClass('bg-red-50');
      expect(buttons[1]).toHaveClass('bg-amber-50');
      expect(buttons[2]).toHaveClass('bg-green-50');
    });
  });

  describe('onChange handling', () => {
    it('calls onChange with 1 when score 1 button is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <ScoreGroup
          value={undefined}
          onChange={handleChange}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(handleChange).toHaveBeenCalledWith(1);
    });

    it('calls onChange with 2 when score 2 button is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <ScoreGroup
          value={undefined}
          onChange={handleChange}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[1]);
      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('calls onChange with 3 when score 3 button is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <ScoreGroup
          value={undefined}
          onChange={handleChange}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]);
      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('allows changing selection', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <ScoreGroup
          value={1}
          onChange={handleChange}
          criteria={defaultCriteria}
        />
      );

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]); // Click score 3
      expect(handleChange).toHaveBeenCalledWith(3);
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled is true', () => {
      render(
        <ScoreGroup
          value={undefined}
          onChange={jest.fn()}
          criteria={defaultCriteria}
          disabled
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <ScoreGroup
          value={undefined}
          onChange={handleChange}
          criteria={defaultCriteria}
          disabled
        />
      );

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        await user.click(button).catch(() => {
          // userEvent may throw when clicking disabled buttons
        });
      }

      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
