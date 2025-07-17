import NavBar from "@/components/NavBar";
import SignUpForm from "@/pages/auth/ui/components/SignUpForm";

/**
 * SignUp component that renders the sign-up form.
 * @returns SignUp component that displays the sign-up form.
 */
export const SignUpView = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full text-text h-[calc(100vh-12rem)]">
      <NavBar />
      <SignUpForm />
    </div>
  );
};
export default SignUpView;
