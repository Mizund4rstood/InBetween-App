import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

vi.mock("./useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user" },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("./haptics", () => ({
  haptics: {
    light: vi.fn(),
    medium: vi.fn(),
    celebration: vi.fn(),
  },
}));

import Onboarding from "./Onboarding";

describe("Onboarding – Neuroscience peak zone styling", () => {
  let nowMs = 0;
  let perfSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();

    nowMs = 0;
    perfSpy = vi.spyOn(performance, "now").mockImplementation(() => nowMs);

    // Drive the component's requestAnimationFrame loop deterministically via timers.
    vi.stubGlobal(
      "requestAnimationFrame",
      ((cb: FrameRequestCallback) => {
        return window.setTimeout(() => {
          nowMs += 16;
          cb(nowMs);
        }, 16) as unknown as number;
      }) as unknown as typeof requestAnimationFrame
    );

    vi.stubGlobal(
      "cancelAnimationFrame",
      ((id: number) => {
        clearTimeout(id);
      }) as unknown as typeof cancelAnimationFrame
    );
  });

  afterEach(() => {
    perfSpy?.mockRestore();
    vi.unstubAllGlobals();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("turns timer, progress, and percentage amber together during the peak zone", async () => {
    const { getByRole, getByText, queryByText, getByLabelText } = render(<Onboarding />);

    // Step 0 -> Step 2 (Neuroscience)
    (getByRole("button", { name: /next/i }) as HTMLButtonElement).click();
    (getByRole("button", { name: /next/i }) as HTMLButtonElement).click();

    // Ensure we are on the neuroscience card.
    expect(getByText("Why This Works")).toBeInTheDocument();
    expect(getByText("Urges peak and pass")).toBeInTheDocument();

    const progress = getByLabelText("Urge wave progress") as HTMLElement;
    const percent = progress.nextElementSibling as HTMLElement;
    const total = getByText("/ 5:00") as HTMLElement;
    const timer = total.previousElementSibling as HTMLElement;

    // Pre-peak state should not be amber.
    expect(timer.className).not.toContain("text-amber-400");
    expect(percent.className).not.toContain("text-amber-400");
    expect(progress.className).not.toContain("[&>div]:bg-amber-400");
    expect(queryByText(/peak zone/i)).not.toBeInTheDocument();

    // Enter peak zone: mapping is 0–300s over a 6s cycle.
    // Peak zone (60–90s) begins ~1.2s after the 0.8s start delay.
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(getByText(/peak zone/i)).toBeInTheDocument();

    // All three elements should be in the amber state at the same moment.
    expect(timer.className).toContain("text-amber-400");
    expect(percent.className).toContain("text-amber-400");
    expect(progress.className).toContain("[&>div]:bg-amber-400");
  });
});
