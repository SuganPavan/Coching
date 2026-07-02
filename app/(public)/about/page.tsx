import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

const VALUES = [
  "Concept-first teaching, not rote memorisation",
  "Small batches so every student gets noticed",
  "Weekly tests to track real progress",
  "Open communication with parents",
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb] py-16">
        <div className="pointer-events-none absolute -right-16 -top-10 h-64 w-64 rounded-full bg-saffron-200/40 blur-3xl" aria-hidden="true" />
        <div className="container-edge relative text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">About Bright Future Academy</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            For over a decade, we&apos;ve helped Class XI and XII students build the academic foundation
            they need to excel in board exams and beyond.
          </p>
        </div>
      </section>

      <section className="container-edge grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-premium">
          <Image
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80"
            alt="Classroom at Bright Future Academy"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">Our mission</h2>
          <span className="heading-rule mt-2" />
          <p className="mt-4 text-muted-foreground">
            We believe every student deserves focused, individual attention. Our small-batch approach
            means teachers know each student by name, track their progress closely, and adapt teaching
            to where each one needs the most support — whether that&apos;s Science, Commerce, or Arts.
          </p>
          <ul className="mt-6 space-y-3">
            {VALUES.map((v) => (
              <li key={v} className="hover-lift flex items-start gap-2.5 rounded-xl border border-transparent px-2 py-1.5 text-sm hover:border-border hover:bg-secondary/40">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
