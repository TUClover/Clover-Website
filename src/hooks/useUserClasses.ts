import { useCallback, useEffect, useState } from "react";
import {
  EnrollmentStatus,
  StudentStatus,
  UserClassInfo,
} from "../api/types/user";
import { useAuth } from "./useAuth";
import { getUserClasses } from "../api/user";
import { supabase } from "../supabaseClient";

/**
 * Custom hook to fetch user classes based on user ID or authenticated user.
 * @param {string} userID - Optional user ID to fetch specific user classes.
 * @returns {Object} - Contains classes, loading state, error message, and selected class information.
 */
export const useUserClasses = (userID?: string | null) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<UserClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassType, setSelectedClassType] = useState<
    "all" | "class" | "non-class"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetClasses = useCallback(async () => {
    const currentUserId = userID ?? user?.id;
    if (!currentUserId) {
      setLoading(false);
      setClasses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getUserClasses(currentUserId);
      if (error) {
        setError(error);
        setClasses([]);
      } else {
        setClasses(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [userID, user?.id]);

  useEffect(() => {
    fetchAndSetClasses();
  }, [fetchAndSetClasses]);

  const mutate = useCallback(() => {
    fetchAndSetClasses();
  }, [fetchAndSetClasses]);

  const specialClasses: UserClassInfo[] = [
    {
      user_class: {
        id: "all",
        created_at: "",
        class_title: "All",
        class_code: "",
        instructor_id: "",
        class_hex_color: "#e5e5e5",
        class_image_cover: "",
        class_description: "",
        students: [],
      },
      joined_at: "",
      enrollment_status: EnrollmentStatus.ENROLLED,
      student_status: StudentStatus.ACTIVE,
    },
    {
      user_class: {
        id: "non-class",
        created_at: "",
        class_title: "Non-class Activities",
        class_code: "",
        instructor_id: "",
        class_hex_color: "#404040",
        class_image_cover: "",
        class_description: "",
        students: [],
      },
      joined_at: "",
      enrollment_status: EnrollmentStatus.ENROLLED,
      student_status: StudentStatus.ACTIVE,
    },
  ];

  const modifiedClasses: UserClassInfo[] = [
    specialClasses[0],
    ...classes,
    specialClasses[1],
  ];

  const handleClassSelect = (selection: {
    id: string | null;
    type: "all" | "class" | "non-class";
  }) => {
    setSelectedClassId(
      selection.type === "class" ? selection.id : selection.type
    );
    setSelectedClassType(selection.type);
  };

  const selectedClass =
    selectedClassType === "class"
      ? classes.find((c) => c.user_class.id === selectedClassId) || null
      : specialClasses.find((c) => c.user_class.id === selectedClassType)!;

  return {
    classes: modifiedClasses,
    originalClasses: classes, // It's good you return the original list too!
    selectedClassId:
      selectedClassType === "class" ? selectedClassId : selectedClassType,
    selectedClassType,
    selectedClass,
    loading,
    error,
    mutate,
    handleClassSelect,
  };
};

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
