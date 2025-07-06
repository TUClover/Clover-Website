import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { checkAndRegisterUser } from "../api/auth";

/**
 * AuthCallback component handles the authentication callback from Supabase.
 * @returns {JSX.Element} - A React component that handles the authentication callback from Supabase.
 */
export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(hash.substring(1));
      const access_token = urlParams.get("access_token");
      const refresh_token = urlParams.get("refresh_token");

      if (!access_token || !refresh_token) {
        console.error("Missing authentication tokens.");
        navigate("/login");
        return;
      }

      try {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          console.error("Error fetching user:", userError?.message);
          return;
        }

        const userId = userData.user.id;
        const email = userData.user.email;
        const fullName = userData.user.user_metadata?.full_name || "";
        const [firstName, ...rest] = fullName.trim().split(" ");
        const lastName = rest.join(" ");

        if (!firstName || !lastName || !email) {
          console.error("User metadata does not contain full name.");
          return;
        }

        const { error } = await checkAndRegisterUser(
          firstName,
          lastName,
          email,
          userId
        );

        if (error) {
          console.error("Error checking and registering user:", error);
          return;
        }

        navigate("/dashboard"); // Redirect after login
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/login"); // Redirect to login on failure
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <p>Logging you in...</p>
    </div>
  );
};

export default AuthCallback;
