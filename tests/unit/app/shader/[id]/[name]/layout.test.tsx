import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShaderDetailLayout from '@/app/shader/[id]/[name]/layout';

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header">header</div>,
}));

describe('shader detail layout', () => {
  it('renders header and wrapped children content', () => {
    render(
      <ShaderDetailLayout>
        <div data-testid="layout-child">child content</div>
      </ShaderDetailLayout>,
    );

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('layout-child')).toHaveTextContent('child content');
  });
});
