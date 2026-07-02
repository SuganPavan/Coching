import Link from "next/link";
import { ArrowRight, Users, UsersRound, ClipboardCheck, UserCheck } from "lucide-react";

const FEATURE_PILLS = [
  { icon: Users, label: "Experienced Faculty" },
  { icon: UsersRound, label: "Small Batch Size" },
  { icon: ClipboardCheck, label: "Regular Tests" },
  { icon: UserCheck, label: "Individual Attention" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb]">
      {/* Decorative floating shapes — purely ambient, ignored by assistive tech */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-16 top-10 h-56 w-56 animate-float-slow rounded-full bg-navy-200/40 blur-3xl" />
        <div className="absolute -right-10 top-24 h-72 w-72 animate-float-slower rounded-full bg-saffron-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 animate-float-slow rounded-full bg-navy-100/60 blur-2xl" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container-edge relative grid min-h-[560px] items-center gap-8 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
        {/* Left — text */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-navy-700 shadow-soft backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-glow-pulse" />
            Admissions open for Class XI &amp; XII
          </span>

          <h1 className="text-balance mt-5 font-display text-4xl font-extrabold leading-[1.12] text-navy-700 sm:text-5xl lg:text-[3rem]">
            Building Strong<br />
            Foundations for<br />
            <span className="bg-gradient-to-r from-navy-700 via-navy-600 to-saffron-500 bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600">
            Expert faculty, personalized attention and proven results – shaping the leaders of tomorrow.
          </p>

          {/* Feature pills */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:max-w-sm">
            {FEATURE_PILLS.map((f) => (
              <div
                key={f.label}
                className="hover-lift flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-soft hover:border-navy-200 hover:shadow-premium"
              >
                <f.icon className="h-4 w-4 shrink-0 text-navy-600" />
                <span className="text-xs font-medium text-gray-700">{f.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-premium"
            >
              Enquire Now <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50"
            >
              {/* WhatsApp SVG icon */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Right — hero image */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-premium ring-1 ring-white/60">
            <video
              src="/videos/hero-students.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Students at Bright Future Academy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/25 via-transparent to-transparent" />
          </div>

          {/* Floating stat chip */}
          <div className="glass-panel absolute -left-4 top-6 hidden rounded-2xl px-4 py-3 shadow-premium sm:flex sm:flex-col animate-float-slower">
            <span className="font-display text-xl font-bold text-navy-700">95%+</span>
            <span className="text-[11px] text-navy-700/70">Success rate</span>
          </div>

          {/* Book stack decoration — matches design */}
          <div className="absolute -bottom-3 right-4 hidden flex-col gap-0.5 lg:flex">
            {["#1e3a8a","#2563eb","#f97316"].map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color }}
                className="h-5 w-28 rounded-sm shadow-soft"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
