import { useCallback, useEffect, useMemo, useState } from "react";
import { ClassData, EnrollmentStatus, StudentStatus } from "../api/types/user";
import { supabase } from "../supabaseClient";
import { getClassesbyStudent } from "@/api/classes";
import { useQuery } from "@tanstack/react-query";
import QUERY_INTERVALS from "@/constants/queryIntervals";

export const useUserClasses = (userId?: string | null) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>("all");

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
  });

  const allClassOptions = useMemo(() => {
    const options: ClassData[] = [
      {
        id: "all",
        classTitle: "All Classes",
        classCode: "",
        classHexColor: "#e5e5e5",
        students: [],
      },
      ...allClasses
        .filter(
          (classInfo) =>
            classInfo.enrollmentStatus === EnrollmentStatus.ENROLLED &&
            classInfo.userClass?.id &&
            classInfo.userClass?.classTitle
        )
        .map((classInfo) => classInfo.userClass),
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
      return allClasses.find((c) => c.userClass.id === selectedClassId) || null;
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
 * Custom hook to fetch user classes based on user ID or authenticated user.
 * @param {string} userID - Optional user ID to fetch specific user classes.
 * @returns {Object} - Contains classes, loading state, error message, and selected class information.
 */
// export const useUserClasses = (userId: string) => {
//   const [classes, setClasses] = useState<UserClassInfo[]>([]);
//   const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
//   const [selectedClassType, setSelectedClassType] = useState<
//     "all" | "class" | "non-class"
//   >("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchAndSetClasses = useCallback(async () => {
//     const currentUserId = userID ?? user?.id;
//     if (!currentUserId) {
//       setLoading(false);
//       setClasses([]);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const { data, error } = await getClassesbyStudent(currentUserId);
//       if (error) {
//         setError(error);
//         setClasses([]);
//       } else {
//         setClasses(data || []);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Unknown error occurred");
//       setClasses([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchAndSetClasses();
//   }, [fetchAndSetClasses]);

//   const mutate = useCallback(() => {
//     fetchAndSetClasses();
//   }, [fetchAndSetClasses]);

//   const specialClasses: UserClassInfo[] = [
//     {
//       userClass: {
//         id: "all",
//         createdAt: "",
//         classTitle: "All",
//         classCode: "",
//         instructorId: "",
//         classHexColor: "#e5e5e5",
//         classImageCover: "",
//         classDescription: "",
//         students: [],
//       },
//       joinedAt: "",
//       enrollmentStatus: EnrollmentStatus.ENROLLED,
//       studentStatus: StudentStatus.ACTIVE,
//     },
//     {
//       userClass: {
//         id: "non-class",
//         createdAt: "",
//         classTitle: "Non-class Activities",
//         classCode: "",
//         instructorId: "",
//         classHexColor: "#404040",
//         classImageCover: "",
//         classDescription: "",
//         students: [],
//       },
//       joinedAt: "",
//       enrollmentStatus: EnrollmentStatus.ENROLLED,
//       studentStatus: StudentStatus.ACTIVE,
//     },
//   ];

//   const modifiedClasses: UserClassInfo[] = [
//     specialClasses[0],
//     ...classes,
//     specialClasses[1],
//   ];

//   const handleClassSelect = (selection: {
//     id: string | null;
//     type: "all" | "class" | "non-class";
//   }) => {
//     setSelectedClassId(
//       selection.type === "class" ? selection.id : selection.type
//     );
//     setSelectedClassType(selection.type);
//   };

//   const selectedClass =
//     selectedClassType === "class"
//       ? classes.find((c) => c.userClass.id === selectedClassId) || null
//       : specialClasses.find((c) => c.userClass.id === selectedClassType)!;

//   return {
//     classes: modifiedClasses,
//     originalClasses: classes, // It's good you return the original list too!
//     selectedClassId:
//       selectedClassType === "class" ? selectedClassId : selectedClassType,
//     selectedClassType,
//     selectedClass,
//     loading,
//     error,
//     mutate,
//     handleClassSelect,
//   };
// };

export const useUserClassStatus = (
  studentId: string | null,
  classId: string | null
) => {
  const [studentStatus, setStudentStatus] = useState<StudentStatus | null>(
    null
  );
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
