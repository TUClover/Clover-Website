import { User, ActiveUserMode, UserSettings } from "./types/user";
import { USER_ENDPOINT, LOG_ENDPOINT } from "./endpoints";
import { LogResponse } from "./types/suggestion";

/**
 * Function to save user settings to the database.
 * TODO: add an error to the promise if the request fails
 * @param {SettingsData} payload - The payload containing user ID and settings to be saved
 * @returns {Promise<boolean>} - Returns true if the settings were saved successfully, false otherwise
 */
export async function saveUserSettings(
  user_id: string,
  settings: UserSettings
): Promise<{ data?: boolean; error?: string }> {
  try {
    const response = await fetch(`${USER_ENDPOINT}/${user_id}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          `Failed to get user data: ${response.status} ${response.statusText}`,
      };
    }

    return { data: true };
  } catch (err) {
    // console.error("Error saving settings:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Function to get the user data from the database.
 * @param {string} userId - The ID of the user whose data is to be fetched
 * @returns {Promise<{ data?: User; error?: string }>} - The response from the server or an error message
 */
export async function getUserData(
  userId: string
): Promise<{ data?: User; error?: string }> {
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

    if (!data) {
      return { error: "Invalid response: expected user data" };
    }

    return {
      data: data.user,
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
  userId: string,
  mode: ActiveUserMode
): Promise<{ logs?: LogResponse<typeof mode>; error?: string }> {
  let routeMode: string;
  switch (mode) {
    case "CODE_BLOCK":
      routeMode = "code-block";
      break;
    case "LINE_BY_LINE":
      routeMode = "line-by-line";
      break;
    case "CODE_SELECTION":
      routeMode = "code-selection";
      break;
    default:
      console.error("Invalid mode provided:", mode);
      return { error: "Invalid mode provided" };
  }

  try {
    const url = `${LOG_ENDPOINT}/suggestion/${userId}/${routeMode}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        error:
          data.message ||
          `Failed to get user activity: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    return { logs: data.logs as LogResponse<typeof mode> };
  } catch (err) {
    console.error("Error fetching user activity:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
// export async function getUserActivity(
//   userId: string
// ): Promise<{ data?: UserActivityLogItem[] | null; error?: string }> {
//   try {
//     const response = await fetch(`${LOG_ENDPOINT}/${userId}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return {
//         error:
//           data.message ||
//           `Failed to get user activity: ${response.status} ${response.statusText}`,
//       };
//     }

//     if (data == null) {
//       return { data: [] };
//     }

//     if (!Array.isArray(data)) {
//       return { error: "Invalid response: expected an array of activity logs" };
//     }

//     return { data: data as UserActivityLogItem[] };
//   } catch (err) {
//     return {
//       error: err instanceof Error ? err.message : "Unknown error occurred",
//     };
//   }
// }

/**
 * Function to get all users from the database.
 * @returns {Promise<{ data?: User[]; error?: string } | null>} - The response from the server or an error message
 */
export async function getAllUsers(): Promise<{
  data?: User[];
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

    if (!Array.isArray(data)) {
      return { error: "Invalid response: expected an array of users" };
    }

    return { data: data };
  } catch (err) {
    console.error(err);
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
 * @param {User} payload - The payload containing user data to be updated
 * @returns {Promise<{ success?: boolean; error?: string }>} - The response from the server or an error message
 */
export async function updateUser(
  userId: string,
  payload: User
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
