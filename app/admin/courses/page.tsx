import AdminHeader from "@/components/admin/Header";
import CourseManager from "@/components/admin/courses/CourseManager";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import type { CourseDTO } from "@/types";

async function getCourses(): Promise<CourseDTO[]> {
  await dbConnect();
  const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(courses));
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <AdminHeader title="Courses" subtitle="Manage course offerings" />
      <div className="p-4 sm:p-6">
        <CourseManager courses={courses} />
      </div>
    </div>
  );
}
