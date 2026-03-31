import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  it('tracks viewport changes and unregisters listener on unmount', async () => {
    const listeners = new Set<() => void>();
    const addEventListener = vi.fn((_event: string, cb: () => void) => {
      listeners.add(cb);
    });
    const removeEventListener = vi.fn((_event: string, cb: () => void) => {
      listeners.delete(cb);
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { result, unmount } = renderHook(() => useIsMobile());

    await waitFor(() => expect(result.current).toBe(false));
    expect(addEventListener).toHaveBeenCalledTimes(1);

    act(() => {
      window.innerWidth = 500;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 900;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(false);

    unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });
});
