import {
  UserData,
  SettingsData,
  UserActivityLogItem,
  UserRole,
  UserSettings,
  EnrollementStatus,
} from "./types/user";
import { USER_ENDPOINT, LOG_ENDPOINT } from "./endpoints";
import { StudentStatus } from "../api/types/user";
import { UserClassInfo } from "../hooks/useUserClasses";

/**
 * Function to save user settings to the database.
 * TODO: add an error to the promise if the request fails
 * @param {SettingsData} payload - The payload containing user ID and settings to be saved
 * @returns {Promise<boolean>} - Returns true if the settings were saved successfully, false otherwise
 */
export async function saveUserSettings(
  payload: SettingsData
): Promise<boolean> {
  try {
    const response = await fetch(
      `${USER_ENDPOINT}/${payload.user_id}/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload.settings),
      }
    );

    if (!response.ok) {
      console.error("Failed to save settings:", await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error saving settings:", err);
    return false;
  }
}

/**
 * Function to get the user data from the database.
 * @param {string} userId - The ID of the user whose data is to be fetched
 * @returns {Promise<{ data?: UserData; error?: string }>} - The response from the server or an error message
 */
export async function getUserData(
  userId: string
): Promise<{ data?: UserData; error?: string }> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get user data: ${response.status} ${response.statusText}`,
      };
    }

    // console.log("Fetched user data:", data);

    if (!data.user) {
      return { error: "Invalid response: expected user data" };
    }

    return {
      data: {
        id: data.user.id,
        created_at: data.user.created_at,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        email: data.user.email,
        status: data.user.status,
        role: data.user.role,
        settings: data.user.settings as UserSettings,
        last_updated_at: data.user.last_updated_at,
        auth_created_at: data.user.auth_created_at,
        last_sign_in: data.user.last_sign_in,
        source: data.user.source,
        avatar_url: data.user.avatar_url,
      } as UserData,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to get the user activity logs from the database.
 * @param {string} userId - The ID of the user whose activity logs are to be fetched
 * @returns {Promise<{ data?: UserActivityLogItem[] | null; error?: string }>} - The response from the server or an error message
 */
export async function getUserActivity(
  userId: string
): Promise<{ data?: UserActivityLogItem[] | null; error?: string }> {
  try {
    const response = await fetch(`${LOG_ENDPOINT}/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    console.log("Fetched user activity:", data);

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get user activity: ${response.status} ${response.statusText}`,
      };
    }

    if (data == null) {
      return { data: [] };
    }

    if (data != null && !Array.isArray(data)) {
      return { error: "Invalid response: expected an array of activity logs" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activityLogs: UserActivityLogItem[] = data.map((item: any) => ({
      id: item.id,
      event: item.event,
      timestamp: item.timestamp,
      timeLapse: item.time_lapse,
      metadata: {
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
 * Function to get the classes of a user from the database.
 * @param {string} userId - The ID of the user whose classes are to be fetched
 * @returns {Promise<{ data?: UserClassInfo[]; error?: string }>} - The response from the server or an error message
 */
export async function getUserClasses(userId: string): Promise<{
  data?: UserClassInfo[];
  error?: string;
}> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${userId}/classes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    if (response.status === 404) {
      return { data: [] };
    }
    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get user classes: ${response.status} ${response.statusText}`,
      };
    }

    if (!Array.isArray(data)) {
      return { error: "Invalid response: expected an array of classes" };
    }
    console.log("Fetched user classes:", data);

    const classInfoList: UserClassInfo[] = data.map(
      (item: {
        class_data: {
          id: string;
          created_at: string;
          class_title: string;
          class_code: string;
          instructor_id: string;
          class_hex_color: string;
          class_image_cover: string;
          class_description: string;
        };
        joinedAt: string;
        studentStatus: StudentStatus;
        enrollmentStatus: EnrollementStatus;
      }) => ({
        userClass: {
          id: item.class_data.id,
          createdAt: item.class_data.created_at,
          classTitle: item.class_data.class_title,
          classCode: item.class_data.class_code,
          instructorId: item.class_data.instructor_id,
          classHexColor: item.class_data.class_hex_color,
          classImageCover: item.class_data.class_image_cover,
          classDescription: item.class_data.class_description,
        },
        joinedAt: item.joinedAt,
        enrollementStatus: item.enrollmentStatus,
        studentStatus: item.studentStatus,
      })
    );

    return { data: classInfoList };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to get all users from the database.
 * @returns {Promise<{ data?: UserData[]; error?: string } | null>} - The response from the server or an error message
 */
export async function getAllUsers(): Promise<{
  data?: UserData[];
  error?: string;
} | null> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get all users: ${response.status} ${response.statusText}`,
      };
    }
    console.log("Response data:", data);

    if (!Array.isArray(data)) {
      return { error: "Invalid response: expected an array of users" };
    }

    console.log("Fetched users:", data);

    const users = data.map(
      (userItem: {
        id: string;
        created_at: string;
        first_name: string;
        last_name: string;
        email: string;
        status: string;
        role: UserRole;
        settings: UserSettings;
        last_updated_at?: string;
        auth_created_at?: string;
        last_sign_in?: string;
        source?: string;
        avatar_url?: string;
      }): UserData => ({
        id: userItem.id,
        created_at: userItem.created_at,
        first_name: userItem.first_name,
        last_name: userItem.last_name,
        email: userItem.email,
        status: userItem.status,
        role: userItem.role,
        settings: userItem.settings,
        last_updated_at: userItem.last_updated_at,
        auth_created_at: userItem.auth_created_at,
        last_sign_in: userItem.last_sign_in,
        source: userItem.source,
        avatar_url: userItem.avatar_url,
      })
    );

    return { data: users };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to delete a user from the database.
 * @param {string} userID - The ID of the user to be deleted
 * @returns {Promise<{ success?: boolean; error?: string }>} - The response from the server or an error message
 */
export async function deleteUser(userID: string): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${userID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error:
          data.message ||
          `Failed to delete user: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to update a user's data in the database.
 * @param {string} userId - The ID of the user to be updated
 * @param {UserData} payload - The payload containing user data to be updated
 * @returns {Promise<{ success?: boolean; error?: string }>} - The response from the server or an error message
 */
export async function updateUser(
  userId: string,
  payload: UserData
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error:
          data.message ||
          `Failed to update user: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export async function updateUserPassword(
  userId: string,
  password: string
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(password),
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error:
          data.message ||
          `Failed to update user: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
