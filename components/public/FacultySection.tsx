import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";

async function getFaculty() {
  await dbConnect();
  const faculty = await Faculty.find({ isActive: true }).sort({ createdAt: 1 }).limit(4).lean();
  return faculty;
}

export default async function FacultySection() {
  const faculty = await getFaculty();

  return (
    <section className="section-padding bg-[#eef2f7]">
      <div className="container-edge">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-700 sm:text-3xl">Our Experienced Faculty</h2>
          <div className="mx-auto mt-2 h-0.5 w-12 rounded bg-navy-700" />
        </div>

        {/* Faculty grid */}
        {faculty.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Faculty profiles will appear here.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.map((f) => (
              <div key={f._id.toString()} className="flex flex-col items-center text-center">
                {/* Circular photo */}
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md">
                  {f.photo ? (
                    <Image src={f.photo} alt={f.name} fill sizes="112px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy-100 text-navy-600">
                      <Users className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <p className="mt-4 text-base font-bold text-navy-700">{f.name}</p>
                <p className="mt-0.5 text-sm text-gray-500">{f.qualification}</p>
                <p className="mt-1.5 text-sm font-semibold text-navy-500">
                  {f.experience}+ Years Experience
                </p>
              </div>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="mt-10 text-center">
          <Link
            href="/faculty"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy-700 px-7 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-700 hover:text-white"
          >
            View All Faculty <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
