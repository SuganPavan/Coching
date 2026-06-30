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
      <section className="bg-secondary/40 py-14">
        <div className="container-edge text-center">
          <h1 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Meet our faculty</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Experienced educators dedicated to helping every student reach their potential.
          </p>
        </div>
      </section>

      <section className="container-edge py-16">
        {faculty.length === 0 ? (
          <p className="text-center text-muted-foreground">Faculty profiles will appear here shortly.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f) => (
              <div key={f._id.toString()} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary">
                    {f.photo ? (
                      <Image src={f.photo} alt={f.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-navy-600">
                        <Users className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{f.name}</p>
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
