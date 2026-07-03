import Link from "next/link";
import { CreditCard, Star } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";
import ScrollReveal from "@/components/public/ScrollReveal";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";

interface FeeRow {
  label: string;
  fee: number;
}

async function getCourses(): Promise<{ class: string; stream: string; fee: number }[]> {
  await dbConnect();
  const courses = await Course.find({ isActive: true }).sort({ class: 1, stream: 1 }).lean();
  return JSON.parse(JSON.stringify(courses));
}

const FALLBACK_FEES: FeeRow[] = [
  { label: "Class XI Science (PCM, PCB)", fee: 60000 },
  { label: "Class XI Commerce", fee: 45000 },
  { label: "Class XI Arts", fee: 38000 },
  { label: "Class XII Science (PCM, PCB)", fee: 62000 },
  { label: "Class XII Commerce", fee: 47000 },
  { label: "Class XII Arts", fee: 40000 },
];

export default async function FeeEnquirySection() {
  const courses = await getCourses();
  const feeRows: FeeRow[] = courses.length > 0
    ? courses.map((c) => ({
        label: `Class ${c.class} ${c.stream}`.replace("XI & XII", "XI/XII"),
        fee: c.fee,
      }))
    : FALLBACK_FEES;

  return (
    <section className="section-padding bg-[#f8fafc]">
      <div className="container-edge">
        {/*
          Three equal columns — all use flex-col and h-full so inner cards
          always stretch to match the tallest column regardless of content.
        */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">

          {/* ── Col 1: Fee Structure ── */}
          <ScrollReveal delay={0} className="h-full">
          <div className="hover-lift flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-soft hover:shadow-premium">
            {/* Fixed header — same padding/height as other cards */}
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-navy-700">Fee Structure</h3>
              <span className="heading-rule mt-1 !w-8" />
            </div>

            {/* Scrollable fee table fills remaining space */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left text-xs font-semibold text-gray-500">Course</th>
                    <th className="pb-2 text-right text-xs font-semibold text-gray-500">Monthly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {feeRows.map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-navy-50/60">
                      <td className="py-2.5 text-xs text-gray-700">{row.label}</td>
                      <td className="py-2.5 text-right text-xs font-bold text-navy-700">
                        ₹{Math.round(row.fee / 12).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pinned footer button */}
            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                href="/pay-fees"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-premium"
              >
                <CreditCard className="h-4 w-4" />
                Pay Fees Online
              </Link>
              <p className="mt-2 text-center text-xs text-gray-400">
                Already enrolled? Pay your fees online securely.
              </p>
            </div>
          </div>
          </ScrollReveal>

          {/* ── Col 2: Enquire Now ── */}
          <ScrollReveal delay={150} className="h-full">
          <div className="hover-lift flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-soft hover:shadow-premium">
            {/* Fixed header — same padding/height as col 1 */}
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="font-display text-lg font-bold text-navy-700">Enquire Now</h3>
              <span className="heading-rule mt-1 !w-8" />
            </div>

            {/* Form content */}
            <div className="flex-1 px-6 py-4">
              <EnquiryForm compact />
            </div>
          </div>
          </ScrollReveal>

          {/* ── Col 3: Testimonial ── */}
          <ScrollReveal delay={300} className="h-full">
          <div className="hover-lift relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 text-white shadow-soft hover:shadow-premium">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-saffron-400/10 blur-2xl" aria-hidden="true" />
            {/* Fixed header — matching padding but on dark background */}
            <div className="relative border-b border-white/10 px-6 py-5">
              <h3 className="font-display text-lg font-bold leading-snug text-white">
                Proven Results.<br />Trusted by Parents.
              </h3>
            </div>

            {/* Testimonial content */}
            <div className="flex flex-1 flex-col px-6 py-5">
              {/* Large opening quote */}
              <span className="text-5xl font-serif leading-none text-saffron-400">&ldquo;</span>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">
                Bright Future Academy has been instrumental in my child&apos;s academic
                success. The faculty is excellent and the individual attention makes
                a big difference.
              </p>

              {/* Attribution + stars pinned to bottom */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-white">— Parent of Ananya Sharma</p>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-saffron-400 text-saffron-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
