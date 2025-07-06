import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { checkAndRegisterUser } from "../api/auth";

export default function VSCodeAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      console.error("Missing authentication tokens.");
      return;
    }
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(async () => {
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

        window.location.href = `vscode://capstone-team-2.temple-capstone-clover/auth-complete?id=${userId}`;
      });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <p>Logging you in...</p>
    </div>
  );
}
