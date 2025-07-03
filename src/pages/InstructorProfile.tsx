import { Loader2, Star } from "lucide-react";
import { User } from "../api/types/user";
import { useInstructorClasses } from "../hooks/useInstructorClasses";
import ProfileCard from "../components/ProfileCard";

/**
 * InstructorProfile component displays the profile of an instructor.
 * It shows the instructor's avatar, name, email, ratings, and courses.
 * @param { userData } - The user data of the instructor.
 * @returns {JSX.Element} - The rendered component.
 */
export const InstructorProfile = ({ userData }: { userData: User }) => {
  const { originalClasses, loading: userClassLoading } = useInstructorClasses();

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="width-container grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1 space-y-4">
          <ProfileCard
            userData={userData}
            detailsContent={[
              {
                label: "Ratings",
                value: (
                  <>
                    5.0{" "}
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  </>
                ),
              },
              {
                label: "Courses",
                value: originalClasses?.length ?? 0,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default InstructorProfile;
