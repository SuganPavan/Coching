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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb] py-16">
        <div className="pointer-events-none absolute -right-10 -top-14 h-64 w-64 rounded-full bg-saffron-200/40 blur-3xl" aria-hidden="true" />
        <div className="container-edge relative text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">Our courses</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Structured programs for Class XI and XII across Science, Commerce, and Arts streams.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {courses.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-secondary/20 py-14 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Course details will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div key={c._id.toString()} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft hover:border-navy-100 hover:shadow-premium">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-700">{c.name}</h3>
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
