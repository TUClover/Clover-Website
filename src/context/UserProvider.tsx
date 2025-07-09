import { useEffect, useState } from "react";
import { User } from "../api/types/user";
import { useAuth } from "../hooks/useAuth";
import { getUserData } from "../api/user";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!isAuthenticated || !user) {
      setUserData(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getUserData(user.id);

      if (fetchError) {
        throw new Error(fetchError);
      }

      setUserData(data || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user data";
      setError(errorMessage);
      console.error("Failed to fetch user:", err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const refetchUser = () => {
    fetchUserData();
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        error,
        refetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
