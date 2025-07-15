import ClassInfoCard from "@/components/ClassInfoCard";
import CreateNewClassDialog from "@/components/CreateNewClassDialog";
import Loading from "@/components/Loading";
import NoClasses from "@/components/NoClasses";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useUser } from "@/context/UserContext";
import { useInstructorClasses } from "@/hooks/useInstructorClasses";

export const InstructorClassesView = () => {
  const { userData } = useUser();
  const { allClasses, loading: userClassLoading } = useInstructorClasses(
    userData?.id
  );

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loading size="lg" showText={false} />
      </div>
    );
  }

  if (allClasses.length === 0) {
    return <NoClasses role="instructor" />;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
      <div className="col-span-11 space-y-4">
        <div className="flex justify-start items-center py-6">
          <CreateNewClassDialog />
        </div>

        <div className="w-full">
          <Carousel
            opts={{
              align: "center",
            }}
            className="w-full"
          >
            <CarouselContent>
              {allClasses.map((userClass, index) => (
                <CarouselItem key={index} className="lg:basis-1/3">
                  <div className="p-1">
                    <ClassInfoCard classInfo={userClass} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {allClasses.length > 1 && (
              <div
                className={`flex justify-between w-full pt-4 ${
                  allClasses.length <= 2 && "lg:hidden"
                }`}
              >
                <CarouselPrevious className="static translate-x-0 translate-y-0 ml-4" />
                <CarouselNext className="static translate-x-0 translate-y-0 mr-4" />
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default InstructorClassesView;
