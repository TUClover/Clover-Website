import { supabase } from "../supabaseClient";
import { CLASS_ENDPOINT, LOG_ENDPOINT } from "./endpoints";
import { ClassData, EnrollmentStatus, UserActivityLogItem } from "./types/user";

/**
 * * Creates a new class in the database.
 * @param {UserClass} newClass - The class object to be created
 * @returns {Promise<{ data?: { id: string }; error?: string }>} - The response from the server
 */
export const createClass = async (
  newClass: ClassData
): Promise<{ data?: { id: string }; error?: string }> => {
  console.log("Creating class with data:", JSON.stringify(newClass));

  try {
    const response = await fetch(`${CLASS_ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClass),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to create class: ${response.status} ${response.statusText}`,
      };
    }

    if (!data.data || !data.data.id) {
      return { error: "Invalid response: expected class ID" };
    }

    return { data: { id: data.data.id } };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
};

/**
 * Fetches all classes from the database for an instructor.
 * @param {string} instructorId - The ID of the instructor
 * @returns {Promise<{ data?: UserClass[]; error?: string }>} - The response from the server
 */
export const getClassesByInstructor = async (
  instructorId: string
): Promise<{ data?: ClassData[]; error?: string }> => {
  try {
    const response = await fetch(
      `${CLASS_ENDPOINT}/instructor/${instructorId}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to fetch classes: ${response.status} ${response.statusText}`,
      };
    }

    if (!data) {
      return { error: "Invalid response: expected list of classes" };
    }

    return { data: data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
};

/**
 * Registers a user to a class in the database.
 * @param {string} classId - The ID of the class
 * @param {string} studentId - The ID of the student
 * @returns {Promise<{ data?: UserClass[]; error?: string }>} - The response from the server or an error message.
 */
export const registerUserToClass = async (
  studentId: string,
  classId: string
): Promise<{ data?: { id: string }; error?: string }> => {
  try {
    const response = await fetch(`${CLASS_ENDPOINT}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, classId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to register: ${response.status} ${response.statusText}`,
      };
    }

    return { data: data.data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
};

/**
 * Fetches all activity logs for a specific class from the database.
 * @param {string} classId - The ID of the class
 * @returns {Promise<{ data?: UserActivityLogItem[]; error?: string }>} - The response from the server or an error message.
 */
export async function getClassActivityByClassId(
  classId: string
): Promise<{ data?: UserActivityLogItem[] | null; error?: string }> {
  try {
    const response = await fetch(`${LOG_ENDPOINT}/class/${classId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get logs by class: ${response.status} ${response.statusText}`,
      };
    }

    if (!Array.isArray(data.data)) {
      return { error: "Invalid response: expected an array of activity logs" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activityLogs: UserActivityLogItem[] = data.data.map((item: any) => ({
      id: item.id,
      event: item.event,
      timestamp: item.timestamp,
      timeLapse: item.time_lapse,
      metadata: {
        userId: item.metadata.user_id,
        hasBug: item.metadata.has_bug,
        suggestionId: item.metadata.suggestion_id,
        userSectionId: item.metadata.user_section_id,
        userClassId: item.metadata.user_class_id,
      },
    }));

    return { data: activityLogs };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates the enrollment status of a student in a class.
 * @param {string} classId - The ID of the class
 * @param {string} studentId - The ID of the student
 * @param {EnrollmentStatus} newStatus - The new enrollment status
 * @returns {Promise<{ success: boolean; error?: string }>} - The response from the server or an error message.
 **/
export const updateStudentEnrollmentStatus = async (
  classId: string,
  studentId: string,
  newStatus: EnrollmentStatus
): Promise<{ success: boolean; error?: string }> => {
  const updateFields = {
    enrollment_status: newStatus,
    user_class_status: newStatus === "ENROLLED" ? "ACTIVE" : null,
  };

  const { error } = await supabase
    .from("class_users")
    .update(updateFields)
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    console.error(`Failed to update enrollment status:`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export async function getAllClasses(): Promise<{
  classes?: ClassData[];
  error?: string;
}> {
  try {
    const response = await fetch(`${CLASS_ENDPOINT}/`, {
      method: "GET",
    });

    const data = await response.json();

    console.log("Classes :" + JSON.stringify(data));

    if (!response.ok) {
      return {
        error:
          data.error ||
          `Failed to get all users: ${response.status} ${response.statusText}`,
      };
    }

    return { classes: data };
  } catch (err) {
    console.error(`Failed to get all classes:`, err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
