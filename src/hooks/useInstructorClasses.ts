import { useCallback, useMemo, useState } from "react";
import { ClassData } from "../types/user";
import { getClassesByInstructor } from "../api/classes";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";

export const useInstructorClasses = (
  userId?: string | null,
  initialClassId?: string | null
) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() => {
    return initialClassId || "all";
  });

  const {
    data: allClasses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["instructorClasses", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await getClassesByInstructor(userId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId,
    staleTime: QUERY_INTERVALS.staleTime,
    gcTime: QUERY_INTERVALS.gcTime,
    retry: QUERY_INTERVALS.retry,
  });

  const allClassOptions = useMemo(() => {
    const options: ClassData[] = [
      {
        id: "all",
        classTitle: "All Classes",
        classHexColor: "#e5e5e5",
      },
      ...allClasses.filter(
        (classItem) => classItem?.id && classItem?.classTitle
      ),
    ];
    return options;
  }, [allClasses]);

  const handleClassSelect = useCallback((classId: string | null) => {
    setSelectedClassId(classId);
  }, []);

  const selectedClass = useMemo(() => {
    if (selectedClassId && selectedClassId !== "all") {
      return allClasses.find((c) => c.id === selectedClassId) || null;
    }
    return null;
  }, [selectedClassId, allClasses]);

  return {
    allClasses,
    selectedClassId,
    selectedClass,
    allClassOptions,
    handleClassSelect,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
