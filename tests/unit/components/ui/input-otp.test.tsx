import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("input-otp", () => {
  const OTPInputContext = React.createContext({
    slots: [] as Array<{ char?: string; hasFakeCaret?: boolean; isActive?: boolean }>,
  });

  const OTPInput = React.forwardRef<HTMLInputElement, Record<string, unknown>>(
    ({ children, containerClassName, ...props }, ref) => (
      <div data-testid="otp-root">
        <input ref={ref} {...props} />
        {children}
      </div>
    ),
  );

  return { OTPInput, OTPInputContext };
});

import { OTPInputContext } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

describe("InputOTP", () => {
  it("renders otp input root", () => {
    render(<InputOTP maxLength={6} value="" onChange={vi.fn()} aria-label="OTP" />);

    expect(screen.getByLabelText("OTP")).toBeInTheDocument();
  });

  it("renders separator", () => {
    render(<InputOTPSeparator />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders group and active slot with fake caret", () => {
    const { container } = render(
      <OTPInputContext.Provider
        value={{
          slots: [
            { char: "1", hasFakeCaret: true, isActive: true },
            { char: "2", hasFakeCaret: false, isActive: false },
          ],
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </OTPInputContext.Provider>,
    );

    expect(container.querySelector('[data-slot="input-otp-group"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="input-otp-slot"][data-active="true"]')).toBeInTheDocument();
  });

  it("handles missing slot index safely", () => {
    const { container } = render(
      <OTPInputContext.Provider value={{ slots: [] }}>
        <InputOTPSlot index={3} />
      </OTPInputContext.Provider>,
    );

    expect(container.querySelector('[data-slot="input-otp-slot"]')).toBeInTheDocument();
  });
});