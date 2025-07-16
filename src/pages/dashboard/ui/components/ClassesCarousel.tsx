import { ClassData } from "@/api/types/user";
import ClassInfoCard from "@/components/ClassInfoCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ClassesCarouselProps {
  classes: ClassData[];
}

const ClassesCarousel = ({ classes }: ClassesCarouselProps) => {
  return (
    <div className="width-container mb-6">
      <div className="space-y-4">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: false,
            skipSnaps: true,
            dragFree: false,
          }}
        >
          <CarouselContent className="-ml-3">
            {classes.map((userClassInfo, index) => (
              <CarouselItem
                key={index}
                className="space-x-6 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <ClassInfoCard classInfo={userClassInfo} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {classes.length > 1 && (
            <div
              className={`flex justify-between w-full mt-4 ${
                classes.length <= 1
                  ? "hidden"
                  : classes.length <= 2
                    ? "sm:hidden"
                    : classes.length <= 3
                      ? "lg:hidden"
                      : ""
              }`}
            >
              <CarouselPrevious className="ml-6" />
              <CarouselNext className="mr-6" />
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default ClassesCarousel;
