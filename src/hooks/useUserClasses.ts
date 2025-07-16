import { useCallback, useEffect, useMemo, useState } from "react";
import { EnrollmentStatus, UserStatus } from "../types/user";
import { supabase } from "../supabaseClient";
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
    retry: QUERY_INTERVALS.retry,
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

export const useUserClassStatus = (
  studentId: string | null,
  classId: string | null
) => {
  const [studentStatus, setStudentStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!studentId || !classId) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("class_users")
        .select("user_class_status")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .single();

      if (error && error.code !== "PGRST116") {
        setError(error.message);
      }

      setStudentStatus(data?.user_class_status || null);
      setLoading(false);
    };

    fetchStatus();
  }, [studentId, classId]);

  return { studentStatus, loading, error };
};
