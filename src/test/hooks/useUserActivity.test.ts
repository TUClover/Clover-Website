/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from "@testing-library/react";
import { useUserActivity } from "../../hooks/useUserActivity";
import { getUserActivity } from "../../api/user";
import { calculateProgress } from "../../utils/calculateProgress";
import { LogEvent } from "../../api/types/event";
import { UserActivityLogItem } from "../../api/types/user";

// Mocks
jest.mock("../../api/user", () => ({
  getUserActivity: jest.fn(),
}));

jest.mock("../../utils/calculateProgress", () => ({
  calculateProgress: jest.fn(),
}));

const mockGetUserActivity = getUserActivity as jest.MockedFunction<
  typeof getUserActivity
>;
const mockCalculateProgress = calculateProgress as jest.MockedFunction<
  typeof calculateProgress
>;

export const mockActivities: UserActivityLogItem[] = [
  {
    log_id: 1,
    log_created_at: "2024-01-01T00:00:00Z",
    event: "USER_ACCEPT",
    duration: 1000,
    user_id: "user-123",
    class_id: "class-1",
    suggestion_id: 101,
    suggestion_created_at: "2023-12-31T23:59:00Z",
    prompt: "How do I write a for loop in Python?",
    suggestion_array: ["for i in range(10):", "    print(i)"],
    has_bug: false,
    model: "gpt-4",
    explanation: "This prints numbers 0-9 using a Python for-loop.",
    vendor: "openai",
    language: "python",
  },
  {
    log_id: 2,
    log_created_at: "2024-01-02T00:00:00Z",
    event: "USER_REJECT",
    duration: 1200,
    user_id: "user-123",
    class_id: "class-2",
    suggestion_id: 102,
    suggestion_created_at: "2024-01-01T23:58:00Z",
    prompt: "What's the syntax for a function in JavaScript?",
    suggestion_array: ["function greet() {", "  console.log('Hi');", "}"],
    has_bug: true,
    model: "gemini-pro",
    explanation: null,
    vendor: "google",
    language: "javascript",
  },
  {
    log_id: 3,
    log_created_at: "2024-01-03T00:00:00Z",
    event: "SYSTEM_EVENT",
    duration: 900,
    user_id: "user-456",
    class_id: "class-3",
    suggestion_id: 103,
    suggestion_created_at: "2024-01-03T00:10:00Z",
    prompt: "Explain list comprehensions in Python.",
    suggestion_array: ["[x for x in range(5)]"],
    has_bug: false,
    model: "claude-3",
    explanation: "Generates a list with numbers 0-4 using list comprehension.",
    vendor: "anthropic",
    language: "python",
  },
];

describe("useUserActivity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateProgress.mockReturnValue({
      totalAccepted: 1,
      correctSuggestions: 1,
      percentageCorrect: 100,
    });
  });

  it("fetches and filters USER_ACCEPT / USER_REJECT events", async () => {
    mockGetUserActivity.mockResolvedValue({
      data: mockActivities,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useUserActivity("user-123", null, "all")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.userActivity).toHaveLength(2);
    expect(
      result.current.userActivity.every((a) =>
        [LogEvent.USER_ACCEPT, LogEvent.USER_REJECT].includes(
          a.event as LogEvent
        )
      )
    ).toBe(true);
    expect(result.current.isEmpty).toBe(false);
    expect(mockCalculateProgress).toHaveBeenCalledWith(
      result.current.userActivity
    );
  });

  it("filters by selectedClassType = 'non-class'", async () => {
    mockGetUserActivity.mockResolvedValue({
      data: [
        {
          ...mockActivities[0],
        },
      ],
      error: undefined,
    });

    const { result } = renderHook(() =>
      useUserActivity("user-123", null, "non-class")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userActivity).toHaveLength(1);
    expect(result.current.userActivity[0].class_id).toBeUndefined();
  });

  it("filters by selectedClassType = 'class' and selectedClassId", async () => {
    mockGetUserActivity.mockResolvedValue({
      data: mockActivities,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useUserActivity("user-123", "class-1", "class")
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userActivity).toHaveLength(1);
    expect(result.current.userActivity[0].class_id).toBe("class-1");
  });

  it("handles error from API", async () => {
    mockGetUserActivity.mockResolvedValue({ data: null, error: "API Error" });

    const { result } = renderHook(() => useUserActivity("user-123"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("API Error");
    expect(result.current.userActivity).toEqual([]);
  });

  it("does not fetch if userId is null", async () => {
    const { result } = renderHook(() => useUserActivity(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetUserActivity).not.toHaveBeenCalled();
    expect(result.current.userActivity).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });
});
