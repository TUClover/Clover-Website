import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");
//     if (userId) {
//       setUser({ id: userId } as User);
//     }

//     setInitialLoading(false);
//   }, []);

//   const setAuthUser = (userId: string) => {
//     localStorage.setItem("userId", userId);
//     setUser({ id: userId } as User);
//   };

//   const signup = async (
//     firstName: string,
//     lastName: string,
//     email: string,
//     password: string
//   ) => {
//     setLoading(true);

//     try {
//       // Register
//       const registerResult = await registerUser(
//         firstName,
//         lastName,
//         email,
//         password
//       );
//       if (registerResult.error) {
//         return registerResult;
//       }

//       // Login
//       const loginResult = await loginUser(email, password);
//       if (loginResult.error) {
//         return { error: "Account created. Please sign in manually." };
//       }

//       // Set auth if successful
//       if (loginResult.userId) {
//         setAuthUser(loginResult.userId);
//         return { success: true };
//       }

//       return { error: "No user ID received" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     setLoading(true);

//     try {
//       const result = await loginUser(email, password);

//       if (result.userId) {
//         setAuthUser(result.userId);
//         return { success: true };
//       }

//       return { error: result.error || "Login failed" };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("userId");
//     setUser(null);
//   };

//   return {
//     user,
//     isAuthenticated: !!user,
//     loading: loading || initialLoading,
//     signup,
//     login,
//     logout,
//   };
// };

/**
 * Custom hook to manage authentication state using Supabase.
 * @returns { user: User | null, isAuthenticated: boolean, loading: boolean }
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (err) {
        console.error("Failed to get session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return { user, isAuthenticated: !!user, loading };
};
