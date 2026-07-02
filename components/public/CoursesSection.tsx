import Link from "next/link";
import { ArrowRight, CheckCircle2, Atom, TrendingUp, Palette, BookOpen } from "lucide-react";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { formatCurrency } from "@/lib/utils";
import type { CourseDTO } from "@/types";
import ScrollReveal from "@/components/public/ScrollReveal";

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
const STREAM_STYLES: Record<string, { icon: typeof Atom; gradient: string }> = {
  Science: { icon: Atom, gradient: "from-navy-500 to-navy-700" },
  Commerce: { icon: TrendingUp, gradient: "from-emerald-500 to-emerald-700" },
  Arts: { icon: Palette, gradient: "from-purple-500 to-purple-700" },
};

function getStreamStyle(stream: string) {
  return STREAM_STYLES[stream] || { icon: BookOpen, gradient: "from-navy-600 to-navy-800" };
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
            <h2 className="font-display text-2xl font-bold text-navy-700">Courses We Offer</h2>
            <span className="heading-rule mt-2" />

            {courses.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-secondary/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Course details will appear here shortly.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {courses.map((course, i) => {
                  const { icon: Icon, gradient } = getStreamStyle(course.stream);
                  return (
                    <ScrollReveal key={course._id} delay={i * 120}>
                    <div
                      className="group hover-lift flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-soft hover:border-navy-100 hover:shadow-premium"
                    >
                      {/* Gradient header strip */}
                      <div className={`relative h-16 bg-gradient-to-br ${gradient} p-4`}>
                        <span className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-soft transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                          <Icon className="h-6 w-6 text-navy-700" />
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-4 pt-7">
                        <p className="text-sm font-bold leading-snug text-navy-700">
                          {course.name}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {course.stream !== "All" ? course.stream : "All Streams"}
                          {" \u00b7 Class "}
                          {course.class}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-saffron-600">
                          {formatCurrency(course.fee).replace("\u20b9", "Rs. ")}
                        </p>
                        <Link
                          href="/courses"
                          className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-navy-600 transition-colors group-hover:text-accent"
                        >
                          View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            <Link
              href="/courses"
              className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800"
            >
              View All Courses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right: Why Choose Us (occupies the remaining 1 of 3 columns) */}
          <ScrollReveal delay={150} className="flex flex-col rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-50/70 to-white p-6 lg:col-span-1">
            <h2 className="font-display text-2xl font-bold text-navy-700">Why Choose Us?</h2>
            <span className="heading-rule mt-2" />

            <ul className="mt-6 flex-1 space-y-4">
              {WHY_CHOOSE_US.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
