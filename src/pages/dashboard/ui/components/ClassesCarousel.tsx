import {
  ClassData,
  StudentStatus,
  User,
  UserClassInfo,
} from "@/api/types/user";
import ClassInfoCard from "@/components/ClassInfoCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ClassesCarouselProps {
  classes: UserClassInfo[];
  onClassSelect: (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User,
    studentCount?: number
  ) => void;
  title: string;
}

const ClassesCarousel = ({
  classes,
  onClassSelect,
  title,
}: ClassesCarouselProps) => {
  return (
    <div className="width-container grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6 mb-6">
      <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {classes.map((userClassInfo, index) => (
              <CarouselItem key={index} className="lg:basis-1/2">
                <div className="p-1">
                  <ClassInfoCard
                    classInfo={userClassInfo}
                    onSelect={onClassSelect}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {classes.length > 1 && (
            <div
              className={`flex justify-between w-full ${classes.length <= 2 && "lg:hidden"}`}
            >
              <CarouselPrevious className="ml-4" />
              <CarouselNext className="mr-4" />
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default ClassesCarousel;
