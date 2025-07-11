import { useCallback, useEffect, useMemo, useState } from "react";
import { ClassData, User } from "../api/types/user";
import { getClassesByInstructor } from "../api/classes";
import { supabase } from "../supabaseClient";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";

export const useInstructorClasses = (userId?: string | null) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>("all");

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

/**
 * Custom hook to fetch students enrolled and waitlisted in a class.
 * @param classId - The ID of the class to fetch students for.
 * @returns {Object} - Contains enrolled and waitlisted students, loading state, error message, and refetch function.
 */
export const useClassStudentsInfo = (classId: string | null) => {
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
  const [waitlistedStudents, setWaitlistedStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchClassStudentsInfo = useCallback(async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: enrolledData, error: enrolledError } = await supabase
        .from("user_class")
        .select("student_id")
        .eq("class_id", classId)
        .eq("enrollment_status", "ENROLLED");

      if (enrolledError) throw enrolledError;

      const enrolledUserIds =
        enrolledData?.map((item) => item.student_id) || [];

      const { data: enrolledUsers, error: enrolledUsersError } = await supabase
        .from("users")
        .select("*")
        .in("id", enrolledUserIds);

      if (enrolledUsersError) throw enrolledUsersError;

      const normalizedEnrolled = (enrolledUsers || []).map((user) => ({
        ...user,
        firstName: user.firstName,
        lastName: user.lastName,
      }));

      setEnrolledStudents(normalizedEnrolled);

      const { data: waitlistedData, error: waitlistedError } = await supabase
        .from("user_class")
        .select("student_id")
        .eq("class_id", classId)
        .eq("enrollment_status", "WAITLISTED");

      if (waitlistedError) throw waitlistedError;

      const waitlistedUserIds =
        waitlistedData?.map((item) => item.student_id) || [];

      const { data: waitlistedUsers, error: waitlistedUsersError } =
        await supabase.from("users").select("*").in("id", waitlistedUserIds);

      if (waitlistedUsersError) throw waitlistedUsersError;

      const normalizedWaitlisted = (waitlistedUsers || []).map((user) => ({
        ...user,
        firstName: user.firstName,
        lastName: user.lastName,
      }));

      setWaitlistedStudents(normalizedWaitlisted);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error(err.message);
      } else {
        setError("Unknown error occurred");
        console.error("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassStudentsInfo();
  }, [classId, fetchClassStudentsInfo, refreshFlag]);

  const refetch = useCallback(() => {
    setRefreshFlag((prev) => !prev);
  }, []);

  return {
    enrolledStudents,
    waitlistedStudents,
    totalStudents: enrolledStudents.length,
    loading,
    error,
    refetch,
  };
};
