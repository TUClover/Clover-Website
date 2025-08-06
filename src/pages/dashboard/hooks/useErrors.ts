import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ErrorLog,
  ErrorsResponse,
  getAllErrors,
  GetErrorsParams,
  resolveError,
} from "@/api/stats";

interface UseErrorsOptions {
  page?: number;
  limit?: number;
  level?: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "all";
  category?: string | "all";
  userId?: string | "all";
  resolved?: boolean | "all";
  errorCode?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "level" | "category" | "errorCode" | "resolved";
  sortOrder?: "ASC" | "DESC";
  enabled?: boolean;
}

interface UseErrorsReturn {
  errors: ErrorLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: {
    level?: string;
    category?: string;
    userId?: string;
    resolved?: string;
    errorCode?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  // Filter and sort controls
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setLevel: (level: UseErrorsOptions["level"]) => void;
  setCategory: (category: string) => void;
  setUserId: (userId: string) => void;
  setResolved: (resolved: UseErrorsOptions["resolved"]) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: UseErrorsOptions["sortBy"]) => void;
  setSortOrder: (sortOrder: UseErrorsOptions["sortOrder"]) => void;
  setDateRange: (startDate?: string, endDate?: string) => void;
  resetFilters: () => void;
}

export const useErrors = (
  initialOptions: UseErrorsOptions = {}
): UseErrorsReturn => {
  // State for filters and pagination
  const [page, setPage] = useState(initialOptions.page || 1);
  const [limit, setLimit] = useState(initialOptions.limit || 10);
  const [level, setLevel] = useState<UseErrorsOptions["level"]>(
    initialOptions.level || "all"
  );
  const [category, setCategory] = useState(initialOptions.category || "all");
  const [userId, setUserId] = useState(initialOptions.userId || "all");
  const [resolved, setResolved] = useState<UseErrorsOptions["resolved"]>(
    initialOptions.resolved || "all"
  );
  const [errorCode, setErrorCode] = useState(initialOptions.errorCode || "");
  const [action, setAction] = useState(initialOptions.action || "");
  const [startDate, setStartDate] = useState(initialOptions.startDate || "");
  const [endDate, setEndDate] = useState(initialOptions.endDate || "");
  const [search, setSearch] = useState(initialOptions.search || "");
  const [sortBy, setSortBy] = useState<UseErrorsOptions["sortBy"]>(
    initialOptions.sortBy || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<UseErrorsOptions["sortOrder"]>(
    initialOptions.sortOrder || "DESC"
  );

  // Build query parameters
  const queryParams = useMemo((): GetErrorsParams => {
    const params: GetErrorsParams = {
      page,
      limit,
      sortOrder,
    };

    // Map sortBy to the correct snake_case field names
    if (sortBy === "createdAt") params.sortBy = "created_at";
    else if (sortBy === "errorCode") params.sortBy = "error_code";
    else params.sortBy = sortBy;

    // Only include filters that aren't 'all' or empty
    if (level !== "all") params.level = level;
    if (category !== "all") params.category = category;
    if (userId !== "all") params.userId = userId;
    if (resolved !== "all") params.resolved = resolved;
    if (errorCode) params.errorCode = errorCode;
    if (action) params.action = action;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;

    return params;
  }, [
    page,
    limit,
    level,
    category,
    userId,
    resolved,
    errorCode,
    action,
    startDate,
    endDate,
    search,
    sortBy,
    sortOrder,
  ]);

  // TanStack Query
  const {
    data: errorsResponse,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["errors", queryParams],
    queryFn: async () => {
      try {
        const { data, error } = await getAllErrors(queryParams);

        // If there's an API error, return empty data instead of throwing
        if (error) {
          console.warn("API Error:", error);
          return {
            errors: [],
            pagination: {
              page: 1,
              limit: limit,
              totalCount: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
            filters: {
              sortBy: sortBy || "createdAt",
              sortOrder: sortOrder || "DESC",
            },
          } as ErrorsResponse;
        }

        // Handle cases where API returns null/undefined or malformed data
        if (!data) {
          return {
            errors: [],
            pagination: {
              page: 1,
              limit: limit,
              totalCount: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
            filters: {
              sortBy: sortBy || "createdAt",
              sortOrder: sortOrder || "DESC",
            },
          } as ErrorsResponse;
        }

        // Ensure errors array exists and normalize data
        const normalizedData = {
          ...data,
          errors: Array.isArray(data.errors) ? data.errors : [],
          pagination: data.pagination || {
            page: 1,
            limit: limit,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          filters: data.filters || {
            sortBy: sortBy || "createdAt",
            sortOrder: sortOrder || "DESC",
          },
        } as ErrorsResponse;

        return normalizedData;
      } catch (err) {
        // Log the error for debugging but return empty data
        console.error("Error fetching data:", err);
        return {
          errors: [],
          pagination: {
            page: 1,
            limit: limit,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          filters: {
            sortBy: sortBy || "createdAt",
            sortOrder: sortOrder || "DESC",
          },
        } as ErrorsResponse;
      }
    },
    enabled: initialOptions.enabled !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    // Remove retry logic that was causing issues
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Utility functions for date range
  const setDateRange = (newStartDate?: string, newEndDate?: string) => {
    setStartDate(newStartDate || "");
    setEndDate(newEndDate || "");
    setPage(1); // Reset to first page when changing filters
  };

  // Reset all filters
  const resetFilters = () => {
    setPage(1);
    setLevel("all");
    setCategory("all");
    setUserId("all");
    setResolved("all");
    setErrorCode("");
    setAction("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("DESC");
  };

  // Override setters to reset page when filters change
  const setLevelWithReset = (newLevel: UseErrorsOptions["level"]) => {
    setLevel(newLevel);
    setPage(1);
  };

  const setCategoryWithReset = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const setUserIdWithReset = (newUserId: string) => {
    setUserId(newUserId);
    setPage(1);
  };

  const setResolvedWithReset = (newResolved: UseErrorsOptions["resolved"]) => {
    setResolved(newResolved);
    setPage(1);
  };

  const setSearchWithReset = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  return {
    errors: errorsResponse?.errors || [],
    pagination: errorsResponse?.pagination || {
      page: 1,
      limit: limit,
      totalCount: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    filters: errorsResponse?.filters || {
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "DESC",
    },
    isLoading,
    error: null, // Always return null for error to avoid showing error messages
    refetch,
    // Pagination controls
    setPage,
    setLimit: (newLimit: number) => {
      setLimit(newLimit);
      setPage(1); // Reset to first page when changing limit
    },
    // Filter controls (with page reset)
    setLevel: setLevelWithReset,
    setCategory: setCategoryWithReset,
    setUserId: setUserIdWithReset,
    setResolved: setResolvedWithReset,
    setSearch: setSearchWithReset,
    // Sort controls
    setSortBy,
    setSortOrder,
    // Utility functions
    setDateRange,
    resetFilters,
  };
};

// Hook for fetching a single error by ID
interface UseErrorByIdOptions {
  errorId: string | null;
  enabled?: boolean;
}

// Hook for resolving errors with optimistic updates
export const useResolveError = () => {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveErrorMutation = async (
    errorId: string,
    updateData: {
      resolved?: boolean;
      resolutionNotes?: string;
      resolvedBy?: string;
    } = { resolved: true }
  ) => {
    setIsResolving(true);
    setError(null);

    try {
      const { data, error: resolve } = await resolveError(errorId, updateData);
      if (resolve) {
        setError(resolve);
        return null;
      }
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsResolving(false);
    }
  };

  return {
    resolveError: resolveErrorMutation,
    isResolving,
    error,
  };
};
