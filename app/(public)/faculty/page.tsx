import Image from "next/image";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";

async function getFaculty() {
  await dbConnect();
  const faculty = await Faculty.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return faculty;
}

export default async function FacultyPage() {
  const faculty = await getFaculty();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb] py-16">
        <div className="pointer-events-none absolute -left-14 -top-10 h-64 w-64 rounded-full bg-navy-200/40 blur-3xl" aria-hidden="true" />
        <div className="container-edge relative text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">Meet our faculty</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Experienced educators dedicated to helping every student reach their potential.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {faculty.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-secondary/20 py-14 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Faculty profiles will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f) => (
              <div key={f._id.toString()} className="hover-lift group rounded-2xl border border-border bg-card p-6 shadow-soft hover:border-accent/30 hover:shadow-premium">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary ring-2 ring-transparent transition-all duration-300 group-hover:ring-accent/40">
                    {f.photo ? (
                      <Image
                        src={f.photo}
                        alt={f.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-navy-600">
                        <Users className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-semibold">{f.name}</p>
                    <p className="text-sm text-muted-foreground">{f.qualification}</p>
                  </div>
                </div>
                <Badge variant="success" className="mt-3">
                  {f.experience}+ years experience
                </Badge>
                {f.bio && <p className="mt-3 text-sm text-muted-foreground">{f.bio}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.subjects.map((s: string) => (
                    <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
