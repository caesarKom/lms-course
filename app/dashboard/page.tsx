import { EmptyState } from "@/components/empty-state";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/users/get-enrolled-courses";
import { CourseCard } from "../(public-route)/_components/course-card";
import Link from "next/link";

export default async function DashboardPage() {
  const [courses, enrolledCourses] = await Promise.all([
    getAllCourses(),
    getEnrolledCourses(),
  ]);
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">
          Here you can see the courses you have access to
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <EmptyState
          title="No courses purchased"
          description="You have not purchased any courses yet"
          buttonText="Browse Courses"
          href="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => (
            <Link
              key={course.Course.id}
              href={`/dashboard/${course.Course.slug}`}
            >
              {course.Course.title}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-muted-foreground">
            Here You can see all the courses you can purchase
          </p>
        </div>

        {courses.filter(
          (course) =>
            !enrolledCourses.some(
              ({ Course: enrolled }) => enrolled.id === course.id
            )
        ).length === 0 ? (
          <EmptyState
            title="No courses available"
            description="You have alredy purchase all available courses"
            buttonText="Browse Courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses
              .filter(
                (course) =>
                  !enrolledCourses.some(
                    ({ Course: enrolled }) => enrolled.id === course.id
                  )
              )
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        )}
      </section>
    </>
  );
}
