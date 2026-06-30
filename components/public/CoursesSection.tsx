import Link from "next/link";
import { ArrowRight, CheckCircle2, Atom, TrendingUp, Palette, BookOpen } from "lucide-react";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { formatCurrency } from "@/lib/utils";
import type { CourseDTO } from "@/types";

async function getCourses(): Promise<CourseDTO[]> {
  await dbConnect();
  const courses = await Course.find({ isActive: true }).sort({ createdAt: 1 }).limit(3).lean();
  return JSON.parse(JSON.stringify(courses));
}

const WHY_CHOOSE_US = [
  "Concept-based learning",
  "Weekly tests and assessments",
  "Personal attention to every student",
  "Regular parent-teacher interaction",
  "Exam-oriented preparation",
];

// Maps a course's `stream` value (from the database) to an icon + color.
// Falls back to a generic icon for any stream not explicitly listed below,
// so newly added streams in Admin never break the homepage.
const STREAM_STYLES: Record<string, { icon: typeof Atom; bg: string; iconColor: string }> = {
  Science: { icon: Atom, bg: "bg-blue-50", iconColor: "text-blue-600" },
  Commerce: { icon: TrendingUp, bg: "bg-green-50", iconColor: "text-green-600" },
  Arts: { icon: Palette, bg: "bg-purple-50", iconColor: "text-purple-600" },
};

function getStreamStyle(stream: string) {
  return STREAM_STYLES[stream] || { icon: BookOpen, bg: "bg-navy-50", iconColor: "text-navy-600" };
}

export default async function CoursesSection() {
  const courses = await getCourses();

  return (
    <section className="section-padding bg-white">
      <div className="container-edge">
        {/* Courses span 2 columns, Why Choose Us takes the remaining 1 column */}
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">

          {/* Left: Courses We Offer (spans 2 of 3 columns) - pulled from the database */}
          <div className="flex flex-col lg:col-span-2">
            <h2 className="text-2xl font-bold text-navy-700">Courses We Offer</h2>
            <div className="mt-1.5 h-0.5 w-10 rounded bg-navy-700" />

            {courses.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-secondary/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Course details will appear here shortly.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {courses.map((course) => {
                  const { icon: Icon, bg, iconColor } = getStreamStyle(course.stream);
                  return (
                    <div
                      key={course._id}
                      className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                      </span>
                      <p className="mt-3 text-sm font-bold leading-snug text-navy-700">
                        {course.name}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {course.stream !== "All" ? course.stream : "All Streams"}
                        {" \u00b7 Class "}
                        {course.class}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-orange-500">
                        {formatCurrency(course.fee).replace("\u20b9", "Rs. ")}
                      </p>
                      <Link
                        href="/courses"
                        className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-navy-600 hover:underline"
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
            >
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: Why Choose Us (occupies the remaining 1 of 3 columns) */}
          <div className="flex flex-col lg:col-span-1">
            <h2 className="text-2xl font-bold text-navy-700">Why Choose Us?</h2>
            <div className="mt-1.5 h-0.5 w-10 rounded bg-navy-700" />

            <ul className="mt-6 flex-1 space-y-4">
              {WHY_CHOOSE_US.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
