import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import RootLayout, { viewport } from '@/app/layout';

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({ variable: '--geist-var' })),
  Outfit: vi.fn(() => ({ variable: '--outfit-var' })),
  Raleway: vi.fn(() => ({ variable: '--raleway-var' })),
  Space_Grotesk: vi.fn(() => ({ variable: '--space-var' })),
  Instrument_Sans: vi.fn(() => ({ variable: '--instrument-var' })),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...values: string[]) => values.join(' '),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster">toaster</div>,
}));

describe('root layout', () => {
  it('exports viewport theme config', () => {
    expect(viewport).toEqual({
      themeColor: [{ color: '#000000', media: '(prefers-color-scheme: dark)' }],
    });
  });

  it('renders layout shell and children', () => {
    const element = RootLayout({
      children: <div data-testid="child">page child</div>,
    }) as ReactElement;

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('en');
    expect(element.props.className).toContain('--outfit-var');
    expect(element.props.className).toContain('--geist-var');

    const body = element.props.children as ReactElement;
    expect(body.type).toBe('body');

    // Render only body content to assert provider/children/toaster.
    render(<>{body.props.children}</>);
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('page child');
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
