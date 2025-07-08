import { useEffect, useRef } from "react";
import { handleAuthRedirect } from "../utils/handleAuth";

export default function VSCodeAuthCallback() {
  let called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;

    handleAuthRedirect({
      onComplete: (userId) => {
        window.location.href = `vscode://capstone-team-2.tu-clover/auth-complete?id=${userId}`;
      },
      onError: (message) => {
        console.error("VSCode Auth Failed:", message);
      },
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <p>Logging you in...</p>
    </div>
  );
}
