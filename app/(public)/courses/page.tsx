import { GraduationCap, Clock, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";

async function getCourses() {
  await dbConnect();
  const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return courses;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <section className="bg-secondary/40 py-14">
        <div className="container-edge text-center">
          <h1 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Our courses</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Structured programs for Class XI and XII across Science, Commerce, and Arts streams.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {courses.length === 0 ? (
          <p className="text-center text-muted-foreground">Course details will appear here shortly.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div key={c._id.toString()} className="rounded-lg border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy-700">{c.name}</h3>
                <p className="text-sm text-muted-foreground">Class {c.class} &middot; {c.stream}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.subjects.map((s: string) => (
                    <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>

                {c.description && <p className="mt-4 text-sm text-muted-foreground">{c.description}</p>}

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {c.duration}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-navy-700">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {formatCurrency(c.fee).replace("₹", "")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
