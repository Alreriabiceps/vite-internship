import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminEvaluations from '../AdminEvaluations';
import { adminAPI } from '../../../../lib/api';

// Mock dependencies
vi.mock('../../../../lib/api', () => ({
  adminAPI: {
    getEvaluationTemplates: vi.fn(),
    createEvaluationTemplate: vi.fn(),
    updateEvaluationTemplate: vi.fn(),
    deleteEvaluationTemplate: vi.fn(),
    getPreferredApplicants: vi.fn(),
    getStudentEvaluations: vi.fn(),
    assignStudentEvaluations: vi.fn(),
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
    user: { role: 'admin', id: 'admin123' },
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

describe('AdminEvaluations Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminAPI.getEvaluationTemplates.mockResolvedValue({
      data: { data: [] },
    });
    adminAPI.getPreferredApplicants.mockResolvedValue({
      data: { data: { companies: [] } },
    });
    adminAPI.getStudentEvaluations.mockResolvedValue({
      data: { data: [] },
    });
  });

  it('should render the component', async () => {
    renderWithRouter(<AdminEvaluations />);
    await waitFor(() => {
      expect(screen.getByText(/Student Evaluations/i)).toBeInTheDocument();
    });
  });

  it('should maintain input focus when typing in template name field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminEvaluations />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/BSIS Practicum Evaluation/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/BSIS Practicum Evaluation/i);
    
    // Focus the input
    await user.click(nameInput);
    expect(nameInput).toHaveFocus();

    // Type multiple characters
    await user.type(nameInput, 'Test Template');
    
    // Verify focus is maintained
    expect(nameInput).toHaveFocus();
    expect(nameInput).toHaveValue('Test Template');
  });

  it('should maintain input focus when typing in section fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminEvaluations />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/BSIS Practicum Evaluation/i)).toBeInTheDocument();
    });

    // Find section title input
    const sectionTitleInput = screen.getByPlaceholderText(/Knowledge \/ Abilities/i);
    
    await user.click(sectionTitleInput);
    expect(sectionTitleInput).toHaveFocus();

    // Type multiple characters
    await user.type(sectionTitleInput, 'Knowledge and Skills');
    
    // Verify focus is maintained
    expect(sectionTitleInput).toHaveFocus();
    expect(sectionTitleInput).toHaveValue('Knowledge and Skills');
  });

  it('should maintain input focus when typing in question fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminEvaluations />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/BSIS Practicum Evaluation/i)).toBeInTheDocument();
    });

    // Find question prompt input
    const questionInput = screen.getByPlaceholderText(/Demonstrates mastery/i);
    
    await user.click(questionInput);
    expect(questionInput).toHaveFocus();

    // Type multiple characters
    await user.type(questionInput, 'Shows excellent problem-solving skills');
    
    // Verify focus is maintained
    expect(questionInput).toHaveFocus();
    expect(questionInput).toHaveValue('Shows excellent problem-solving skills');
  });

  it('should create a new template', async () => {
    const user = userEvent.setup();
    adminAPI.createEvaluationTemplate.mockResolvedValue({
      data: { success: true, data: { _id: 'template123' } },
    });

    renderWithRouter(<AdminEvaluations />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/BSIS Practicum Evaluation/i)).toBeInTheDocument();
    });

    // Fill in template form
    await user.type(screen.getByPlaceholderText(/BSIS Practicum Evaluation/i), 'Test Template');
    await user.type(screen.getByPlaceholderText(/BSIS, BSBA/i), 'BSIS');
    
    // Fill section title
    await user.type(screen.getByPlaceholderText(/Knowledge \/ Abilities/i), 'Knowledge');
    
    // Fill question prompt
    await user.type(screen.getByPlaceholderText(/Demonstrates mastery/i), 'Test question');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Template/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(adminAPI.createEvaluationTemplate).toHaveBeenCalled();
    });
  });

  it('should add a new section', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminEvaluations />);

    await waitFor(() => {
      expect(screen.getByText(/Add Section/i)).toBeInTheDocument();
    });

    const addSectionButton = screen.getByText(/Add Section/i);
    await user.click(addSectionButton);

    // Should have two section labels now
    const sectionLabels = screen.getAllByPlaceholderText(/A/i);
    expect(sectionLabels.length).toBeGreaterThan(1);
  });

  it('should add a new question to a section', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminEvaluations />);

    await waitFor(() => {
      expect(screen.getByText(/Add Question/i)).toBeInTheDocument();
    });

    const addQuestionButtons = screen.getAllByText(/Add Question/i);
    await user.click(addQuestionButtons[0]);

    // Should have multiple question inputs now
    const questionInputs = screen.getAllByPlaceholderText(/Demonstrates mastery/i);
    expect(questionInputs.length).toBeGreaterThan(1);
  });
});

