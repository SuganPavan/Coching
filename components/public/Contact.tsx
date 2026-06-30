import { MapPin, Phone, Mail, Clock } from "lucide-react";

const CONTACT_ITEMS = [
  { icon: MapPin, title: "Address", lines: ["Bright Future Academy", "Sri Vijaya Puram, Andaman & Nicobar Islands"] },
  { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "Mon - Sat: 9:00 AM - 6:00 PM"] },
  { icon: Mail, title: "Email", lines: ["info@brightfutureacademy.com", "We reply within 24 hours"] },
];

export default function Contact() {
  return (
    <section className="section-padding-sm border-t border-border bg-navy-700 text-white">
      <div className="container-edge grid gap-8 sm:grid-cols-3">
        {CONTACT_ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.lines.map((line) => (
                <p key={line} className="mt-1 text-sm text-white/65">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
