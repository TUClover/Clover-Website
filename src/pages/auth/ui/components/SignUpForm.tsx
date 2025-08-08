import React, { useState } from "react";
import { Eye, EyeOff, Glasses, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { registerUser } from "@/api/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ConsentForm from "./ConsentForm";

/**
 * SignUpForm component for user registration.
 * It allows users to create an account using email and password.
 * TODO: Add GitHub OAuth signup option.
 * @returns SignUpForm component for user registration.
 */
const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isConsent, setIsConsent] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [hasViewedConsent, setHasViewedConsent] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await registerUser(
        firstName,
        lastName,
        email,
        password,
        isConsent
      );

      if (error) {
        setError(error);
        return;
      }

      const data = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (data.error) {
        setError(data.error.message);
        return;
      }

      if (data) {
        toast.success("Account created successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      setError("Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = (consented: boolean) => {
    setIsConsent(consented);
  };

  const handleOpenConsentModal = () => {
    setIsConsentModalOpen(true);
  };

  const handleCloseConsentModal = () => {
    setIsConsentModalOpen(false);
  };

  const handleConsentViewed = () => {
    setHasViewedConsent(true);
  };

  return (
    <>
      <Card className="p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Clover Account
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border py-6 border-gray-400 dark:border-gray-600 rounded dark:bg-gray-700 text-black dark:text-white bg-gray-100 pr-12"
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border py-6 border-gray-400 dark:border-gray-600 rounded dark:bg-gray-700 text-black dark:text-white bg-gray-100 pr-12"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border py-6 border-gray-400 dark:border-gray-600 rounded dark:bg-gray-700 text-black dark:text-white bg-gray-100 pr-12"
            required
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border py-6 border-gray-400 dark:border-gray-600 rounded dark:bg-gray-700 text-black dark:text-white bg-gray-100 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-6 transform -translate-y-1/2 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-3">
            <div className="space-y-2 w-full justify-center items-center flex flex-col">
              <button
                type="button"
                onClick={handleOpenConsentModal}
                className="text-sm text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
              >
                <Glasses className="h-4 w-4" /> View consent form
                {hasViewedConsent && <span className="text-green-600">✓</span>}
              </button>
              {!hasViewedConsent && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Please review the consent form to continue
                </p>
              )}
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={isConsent}
                onCheckedChange={(checked) => setIsConsent(!!checked)}
                disabled={!hasViewedConsent}
                className="mt-1"
              />
              <Label
                htmlFor="consent"
                className={`text-sm cursor-pointer leading-relaxed ${
                  hasViewedConsent
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                I consent to Clover using the data collected from my usage for
                research purposes only.
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!hasViewedConsent || loading}
            className="w-full text-md py-5 mt-3"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <p className="text-center text-text">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Log In
            </button>
          </p>
        </form>
      </Card>

      {/* Consent Modal */}
      <ConsentForm
        isOpen={isConsentModalOpen}
        onClose={handleCloseConsentModal}
        onConsentChange={handleConsentChange}
        onConsentViewed={handleConsentViewed}
        initialConsent={isConsent}
      />
    </>
  );
};

export default SignUpForm;
