import { useCallback, useMemo, useState } from "react";
import { EnrollmentStatus } from "../types/user";
import { getClassesbyStudent } from "@/api/classes";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";

export const useUserClasses = (
  userId?: string | null,
  preselectedClassId?: string
) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() => {
    return preselectedClassId || "all";
  });

  const {
    data: allClasses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userClasses", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await getClassesbyStudent(userId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId,
    staleTime: QUERY_INTERVALS.staleTime,
    gcTime: QUERY_INTERVALS.gcTime,
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
  });

  const allClassOptions = useMemo(() => {
    if (!allClasses.length) {
      return [
        {
          id: "all",
          classTitle: "All Classes",
          classCode: "",
          classHexColor: "#e5e5e5",
          students: [],
        },
        {
          id: "non-class",
          classTitle: "Non-class Activities",
          classCode: "",
          classHexColor: "#404040",
          students: [],
        },
      ];
    }

    const options = [
      {
        id: "all",
        classTitle: "All Classes",
        classCode: "",
        classHexColor: "#e5e5e5",
        students: [],
      },
      ...allClasses.filter(
        (classInfo) =>
          classInfo.enrollmentStatus === EnrollmentStatus.ENROLLED &&
          classInfo.id // Now using classId instead of userClass.id
      ),
      {
        id: "non-class",
        classTitle: "Non-class Activities",
        classCode: "",
        classHexColor: "#404040",
        students: [],
      },
    ];
    return options;
  }, [allClasses]);

  const handleClassSelect = useCallback((classId: string | null) => {
    setSelectedClassId(classId);
  }, []);

  const selectedClass = useMemo(() => {
    if (
      selectedClassId &&
      selectedClassId !== "all" &&
      selectedClassId !== "non-class"
    ) {
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
