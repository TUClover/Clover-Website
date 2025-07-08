/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from "@testing-library/react";
import { useUserData } from "../../hooks/useUserData";
import { getUserData } from "../../api/user";
import { User, UserMode, UserRole } from "../../api/types/user";

// Mocks
jest.mock("../../api/user", () => ({
  getUserData: jest.fn(),
}));

jest.mock("../../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require("../../hooks/useAuth").useAuth as jest.Mock;
const mockGetUserData = getUserData as jest.MockedFunction<typeof getUserData>;

const mockUser: User = {
  id: "u1",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  created_at: "2024-01-01T00:00:00Z",
  role: UserRole.STUDENT,
  settings: {
    bug_percentage: 0,
    show_notifications: true,
    enable_quiz: true,
    mode: UserMode.BLOCK,
  },
};

describe("useUserData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches user data using authenticated user", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockGetUserData.mockResolvedValue({ data: mockUser, error: undefined });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.userData?.email).toBe("test@example.com");
    expect(result.current.error).toBeNull();
  });

  it("fetches user data using provided userId", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockGetUserData.mockResolvedValue({ data: mockUser, error: undefined });

    const { result } = renderHook(() => useUserData("u1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.userData?.id).toBe("u1");
    expect(result.current.error).toBeNull();
  });

  it("handles missing userId and no authenticated user", async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userData).toBeNull();
  });

  it("handles error from API", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockGetUserData.mockResolvedValue({
      data: undefined,
      error: "Failed to fetch",
    });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch");
    expect(result.current.userData).toBeNull();
  });

  it("handles thrown error", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockGetUserData.mockRejectedValue(new Error("Unexpected error"));

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Unexpected error");
  });
});
