import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Phone } from "lucide-react";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";
import ScrollReveal from "@/components/public/ScrollReveal";

async function getFaculty() {
  await dbConnect();
  const faculty = await Faculty.find({ isActive: true }).sort({ createdAt: 1 }).limit(4).lean();
  return faculty;
}

export default async function FacultySection() {
  const faculty = await getFaculty();

  return (
    <section className="section-padding bg-grid-fade">
      <div className="container-edge">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-navy-700 sm:text-3xl">Our Experienced Faculty</h2>
          <span className="heading-rule mx-auto mt-2" />
        </div>

        {/* Faculty grid */}
        {faculty.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Faculty profiles will appear here.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.map((f, i) => (
              <ScrollReveal key={f._id.toString()} delay={i * 100}>
              <div
                className="hover-lift group flex flex-col items-center rounded-2xl border border-transparent bg-white p-6 text-center shadow-soft hover:border-accent/30 hover:shadow-premium"
              >
                {/* Circular photo */}
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md ring-2 ring-transparent transition-all duration-300 group-hover:ring-accent/40">
                  {f.photo ? (
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy-100 text-navy-600">
                      <Users className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <p className="mt-4 font-display text-base font-bold text-navy-700">{f.name}</p>
                <p className="mt-0.5 text-sm text-gray-500">{f.qualification}</p>
                <p className="mt-1.5 text-sm font-semibold text-navy-500">
                  {f.experience}+ Years Experience
                </p>

                {/* Contact — quick action, reveals more clearly on hover */}
                <a
                  href="tel:+919876543210"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-3.5 py-1.5 text-xs font-semibold text-navy-700 opacity-90 transition-all duration-300 group-hover:border-navy-700 group-hover:bg-navy-700 group-hover:text-white group-hover:opacity-100"
                >
                  <Phone className="h-3.5 w-3.5" /> Contact
                </a>
              </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="mt-10 text-center">
          <Link
            href="/faculty"
            className="inline-flex items-center gap-2 rounded-full border-2 border-navy-700 px-7 py-2.5 text-sm font-semibold text-navy-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-700 hover:text-white hover:shadow-premium"
          >
            View All Faculty <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
