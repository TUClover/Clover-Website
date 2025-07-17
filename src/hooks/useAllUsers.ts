import { useCallback, useState } from "react";
import { getAllUsers } from "../api/user";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";
import { UseAllUsersOptions } from "@/types/data";

export const useAllUsers = (options?: UseAllUsersOptions) => {
  const { page = 1, limit = 50, search = "", enabled = true } = options || {};

  const { data, isLoading, error, refetch, isFetching, isRefetching } =
    useQuery({
      queryKey: ["allUsers", { page, limit, search }],
      queryFn: async () => {
        const { data, error } = await getAllUsers({
          page,
          limit,
          search,
        });
        if (error) {
          throw new Error(error);
        }
        return data!;
      },
      enabled,
      staleTime: QUERY_INTERVALS.staleTime,
      gcTime: QUERY_INTERVALS.gcTime,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      placeholderData: (previousData) => previousData,
    });

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    error: error?.message || null,
    refetch,
    isFetching,
    isRefetching,
    hasNextPage: data?.pagination
      ? data.pagination.page < data.pagination.totalPages
      : false,
    hasPreviousPage: data?.pagination ? data.pagination.page > 1 : false,
    totalUsers: data?.pagination?.total || 0,
  };
};

export const useAllUsersWithSearch = (initialSearch = "") => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [limit] = useState(50);

  const {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    isFetching,
    hasNextPage,
    hasPreviousPage,
    totalUsers,
  } = useAllUsers({
    page,
    limit,
    search,
  });

  // Reset page when search changes
  const handleSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    if (pagination) {
      setPage(pagination.totalPages);
    }
  }, [pagination]);

  return {
    // Data
    users,
    pagination,
    totalUsers,

    // Loading states
    isLoading,
    isFetching,
    error,

    // Search
    search,
    handleSearch,

    // Pagination
    page,
    hasNextPage,
    hasPreviousPage,
    handlePageChange,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Actions
    refetch,
  };
};
