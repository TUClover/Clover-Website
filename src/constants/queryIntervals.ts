const QUERY_INTERVALS = {
  staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  retry: 2, // Retry failed requests 2 times
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
};

export default QUERY_INTERVALS;
