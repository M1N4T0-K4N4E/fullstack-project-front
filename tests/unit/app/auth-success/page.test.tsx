import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthSuccessPage from '@/app/auth-success/page';

const pushMock = vi.fn();
const getSearchParamMock = vi.fn();
const setAuthFromTokensMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: getSearchParamMock }),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({
    setAuthFromTokens: setAuthFromTokensMock,
  }),
}));

describe('auth success page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getSearchParamMock.mockReset();
    setAuthFromTokensMock.mockReset();
  });

  it('redirects to login when token params are missing', async () => {
    getSearchParamMock.mockReturnValue(null);

    render(<AuthSuccessPage />);

    expect(screen.getByText('Signing you in...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we complete your authentication.')).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
    expect(setAuthFromTokensMock).not.toHaveBeenCalled();
  });

  it('redirects home when token exchange succeeds', async () => {
    getSearchParamMock.mockImplementation((key: string) => (key === 'token' ? 't-1' : 'r-1'));
    setAuthFromTokensMock.mockResolvedValue(true);

    render(<AuthSuccessPage />);

    await waitFor(() => {
      expect(setAuthFromTokensMock).toHaveBeenCalledWith('t-1', 'r-1');
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to login when token exchange fails', async () => {
    getSearchParamMock.mockImplementation((key: string) => (key === 'token' ? 't-1' : 'r-1'));
    setAuthFromTokensMock.mockResolvedValue(false);

    render(<AuthSuccessPage />);

    await waitFor(() => {
      expect(setAuthFromTokensMock).toHaveBeenCalledWith('t-1', 'r-1');
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });
});
