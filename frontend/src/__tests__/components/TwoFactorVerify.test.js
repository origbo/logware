import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TwoFactorVerify from '../../components/TwoFactorVerify';

// Mock axios and AuthContext
jest.mock('axios');
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ success: true })
  })
}));

describe('TwoFactorVerify Component', () => {
  const mockProps = {
    email: 'test@example.com',
    password: 'password123',
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the two-factor verification form', () => {
    render(<TwoFactorVerify {...mockProps} />);
    
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the 6-digit verification code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter verification code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('updates verification code input when user types', () => {
    render(<TwoFactorVerify {...mockProps} />);
    
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123456' } });
    
    expect(input.value).toBe('123456');
  });

  it('disables the verify button when code is not 6 digits', () => {
    render(<TwoFactorVerify {...mockProps} />);
    
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    expect(verifyButton).toBeDisabled();
    
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    
    // Less than 6 digits
    fireEvent.change(input, { target: { value: '12345' } });
    expect(verifyButton).toBeDisabled();
    
    // 6 digits - should enable
    fireEvent.change(input, { target: { value: '123456' } });
    expect(verifyButton).not.toBeDisabled();
    
    // More than 6 digits
    fireEvent.change(input, { target: { value: '1234567' } });
    expect(verifyButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TwoFactorVerify {...mockProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('verifies code and calls onSuccess when successful', async () => {
    axios.post.mockResolvedValueOnce({ data: { verified: true } });
    
    render(<TwoFactorVerify {...mockProps} />);
    
    // Enter a valid code
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123456' } });
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should call API with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/verify-2fa'),
      {
        email: mockProps.email,
        token: '123456'
      }
    );
    
    // Should call onSuccess after successful verification
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message when verification fails', async () => {
    axios.post.mockResolvedValueOnce({ data: { verified: false } });
    
    render(<TwoFactorVerify {...mockProps} />);
    
    // Enter a code
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123456' } });
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
    });
    
    // Should not call onSuccess
    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });

  it('shows error message when API call fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
    render(<TwoFactorVerify {...mockProps} />);
    
    // Enter a code
    const input = screen.getByPlaceholderText(/Enter verification code/i);
    fireEvent.change(input, { target: { value: '123456' } });
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Error verifying code/i)).toBeInTheDocument();
    });
    
    // Should not call onSuccess
    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });
});
