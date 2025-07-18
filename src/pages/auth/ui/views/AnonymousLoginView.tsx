import { registerUser } from "@/api/auth";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabaseClient";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ANONYMOUS_PASSWORD = import.meta.env.VITE_ANONYMOUS_SHARED_PASSWORD;

const AnonymousLoginView = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const generateRandomCode = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSignIn = async () => {
    if (code.length !== 4) return;

    setError("");
    setLoading(true);

    try {
      const email = `${code.toLowerCase()}@anonymous.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: ANONYMOUS_PASSWORD,
      });

      if (error) {
        setError("No account found with this code. Try creating a new one.");
        return;
      }

      if (data) {
        toast.success("Sign in anonymous successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Anonymous sign in error:", err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle creating new anonymous account
  const handleCreateNew = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const newCode = generateRandomCode();
      const email = `${newCode}@anonymous.com`;
      const firstName = `user_${newCode}`;

      // Register through your existing API function
      const registerResult = await registerUser(
        firstName,
        "",
        email,
        ANONYMOUS_PASSWORD
      );

      if (registerResult.error) {
        setError(registerResult.error);
        return;
      }

      const data = await supabase.auth.signInWithPassword({
        email: email,
        password: ANONYMOUS_PASSWORD,
      });

      if (data.error) {
        setError(data.error.message);
        return;
      }

      if (data) {
        toast.success("Sign in anonymous successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Create anonymous account error:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().slice(0, 4);
    setCode(value);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <NavBar />
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Enter Your 4-Character Code
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded text-green-400 text-sm text-center">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="e.g. abcd"
            value={code}
            onChange={handleCodeChange}
            maxLength={4}
            className="w-full text-center text-xl font-mono tracking-widest bg-gray-900 border-gray-600 text-white placeholder-gray-400 py-6"
            disabled={loading}
          />

          <Button
            onClick={handleSignIn}
            disabled={code.length !== 4 || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-6 text-md"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Button
            onClick={handleCreateNew}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-6 text-md"
          >
            {loading ? "Creating..." : "Create New Anonymous Account"}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:text-primary/80 hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AnonymousLoginView;
