import { useQuery } from "@tanstack/react-query";
import { getAllClasses } from "../api/classes";
import QUERY_INTERVALS from "@/constants/queryIntervals";

export const useAllClasses = () => {
  const {
    data: classes = [],
    isLoading,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { classes, error } = await getAllClasses();
      if (error) {
        throw new Error(error);
      }
      return classes || [];
    },
    staleTime: QUERY_INTERVALS.staleTime,
    gcTime: QUERY_INTERVALS.gcTime,
    retry: QUERY_INTERVALS.retry,
    retryDelay: QUERY_INTERVALS.retryDelay,
  });

  return {
    classes,
    isLoading,
    error: error?.message || null,
    refetch,
    isFetching,
    isRefetching,
  };
};
