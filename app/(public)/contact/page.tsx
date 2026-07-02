import { MapPin, Phone, Mail, Clock } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";

const INFO_CARDS = [
  { icon: MapPin, title: "Address", text: "Bright Future Academy, Sri Vijaya Puram, Andaman & Nicobar Islands" },
  { icon: Phone, title: "Phone", text: "+91 98765 43210" },
  { icon: Mail, title: "Email", text: "info@brightfutureacademy.com" },
  { icon: Clock, title: "Office hours", text: "Mon – Sat: 9:00 AM – 6:00 PM" },
];

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2f7] to-[#f6f8fb] py-16">
        <div className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full bg-navy-200/40 blur-3xl" aria-hidden="true" />
        <div className="container-edge relative text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-700 sm:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Have questions about our courses or admissions? Send us a message or give us a call.
          </p>
        </div>
      </section>

      <section className="container-edge grid gap-10 py-16 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-bold text-navy-700">Send an enquiry</h2>
          <span className="heading-rule mt-2" />
          <div className="mt-5">
            <EnquiryForm />
          </div>
        </div>

        <div className="space-y-4">
          {INFO_CARDS.map((item) => (
            <div key={item.title} className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-soft hover:border-navy-100 hover:shadow-premium">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
