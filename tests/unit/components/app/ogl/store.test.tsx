import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OGLProvider, useOGLContext } from '@/components/app/ogl/store';

function OutsideReader() {
  useOGLContext((state) => state.time);
  return null;
}

const fakeProgram = { id: 'program-1' } as any;

function StoreReader() {
  const time = useOGLContext((state) => state.time);
  const update = useOGLContext((state) => state.update);
  const program = useOGLContext((state) => state.program);
  const setProgram = useOGLContext((state) => state.setProgram);

  return (
    <div>
      <div data-testid="time">{time}</div>
      <div data-testid="program-match">{program === fakeProgram ? 'yes' : 'no'}</div>
      <button onClick={() => update(42)}>update-time</button>
      <button onClick={() => setProgram(fakeProgram)}>set-program</button>
    </div>
  );
}

describe('ogl store context', () => {
  it('throws when useOGLContext is used outside provider', () => {
    expect(() => render(<OutsideReader />)).toThrow('useBearContext must be used within BearProvider');
  });

  it('provides default state and updates time/program', () => {
    render(
      <OGLProvider>
        <StoreReader />
      </OGLProvider>,
    );

    expect(screen.getByTestId('time')).toHaveTextContent('0');
    expect(screen.getByTestId('program-match')).toHaveTextContent('no');

    fireEvent.click(screen.getByRole('button', { name: 'update-time' }));
    expect(screen.getByTestId('time')).toHaveTextContent('42');

    fireEvent.click(screen.getByRole('button', { name: 'set-program' }));
    expect(screen.getByTestId('program-match')).toHaveTextContent('yes');
  });
});
