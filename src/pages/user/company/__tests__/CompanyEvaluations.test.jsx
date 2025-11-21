import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CompanyEvaluations from '../CompanyEvaluations';
import { companiesAPI } from '../../../../lib/api';

// Mock dependencies
vi.mock('../../../../lib/api', () => ({
  companiesAPI: {
    getEvaluations: vi.fn(),
    getEvaluation: vi.fn(),
    updateEvaluation: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'company', id: 'company123' },
  }),
}));

vi.mock('../../../../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: null,
    connected: false,
  }),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockEvaluation = {
  _id: 'eval123',
  templateSnapshot: {
    name: 'Test Evaluation',
    ratingScale: {
      min: 1,
      max: 5,
      labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    },
  },
  studentInfo: {
    fullName: 'John Doe',
    program: 'BSIS',
    studentNumber: 'STU001',
    email: 'john@test.com',
  },
  companyInfo: {
    name: 'Test Company',
    representative: 'Company Rep',
    email: 'company@test.com',
  },
  trainingPeriod: {
    from: '2024-01-01',
    to: '2024-03-31',
  },
  status: 'pending',
  sections: [
    {
      label: 'A',
      title: 'Knowledge',
      description: 'Knowledge section',
      questions: [
        {
          prompt: 'Test question 1',
          description: 'Question description',
          rating: null,
          comments: '',
        },
      ],
    },
  ],
};

describe('CompanyEvaluations Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    companiesAPI.getEvaluations.mockResolvedValue({
      data: { data: [mockEvaluation] },
    });
    companiesAPI.getEvaluation.mockResolvedValue({
      data: { data: mockEvaluation },
    });
  });

  it('should render the component', async () => {
    renderWithRouter(<CompanyEvaluations />);
    await waitFor(() => {
      expect(screen.getByText(/Student Evaluations/i)).toBeInTheDocument();
    });
  });

  it('should maintain input focus when typing in comment fields', async () => {
    const user = userEvent.setup();
    companiesAPI.getEvaluation.mockResolvedValue({
      data: { data: mockEvaluation },
    });

    renderWithRouter(<CompanyEvaluations />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    // Click on evaluation to load details - use getAllByText and click the first one (in the list)
    const evaluationItems = screen.getAllByText(/John Doe/i);
    await user.click(evaluationItems[0]); // First one is in the list

    await waitFor(() => {
      expect(screen.getByText(/Test question 1/i)).toBeInTheDocument();
    });

    // Find comment input
    const commentInputs = screen.getAllByPlaceholderText(/Comments \(optional\)/i);
    if (commentInputs.length > 0) {
      const commentInput = commentInputs[0];
      
      await user.click(commentInput);
      expect(commentInput).toHaveFocus();

      // Type multiple characters
      await user.type(commentInput, 'This is a test comment');
      
      // Verify focus is maintained
      expect(commentInput).toHaveFocus();
      expect(commentInput).toHaveValue('This is a test comment');
    }
  });

  it('should save evaluation progress', async () => {
    const user = userEvent.setup();
    companiesAPI.updateEvaluation.mockResolvedValue({
      data: { success: true },
    });

    renderWithRouter(<CompanyEvaluations />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const evaluationItems = screen.getAllByText(/John Doe/i);
    await user.click(evaluationItems[0]); // First one is in the list

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Progress/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Save Progress/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(companiesAPI.updateEvaluation).toHaveBeenCalled();
    });
  });

  it('should submit evaluation', async () => {
    const user = userEvent.setup();
    companiesAPI.updateEvaluation.mockResolvedValue({
      data: { success: true, data: { ...mockEvaluation, status: 'submitted' } },
    });

    renderWithRouter(<CompanyEvaluations />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const evaluationItems = screen.getAllByText(/John Doe/i);
    await user.click(evaluationItems[0]); // First one is in the list

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Evaluation/i })).toBeInTheDocument();
    });

    // First, provide a rating (required before submission)
    const ratingButtons = screen.getAllByRole('button', { name: /5|Excellent/i });
    if (ratingButtons.length > 0) {
      await user.click(ratingButtons[0]);
    }

    // Wait a bit for state to update
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Evaluation/i })).not.toBeDisabled();
    }, { timeout: 2000 });

    const submitButton = screen.getByRole('button', { name: /Submit Evaluation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(companiesAPI.updateEvaluation).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});

