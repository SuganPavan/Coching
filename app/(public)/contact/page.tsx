import { MapPin, Phone, Mail, Clock } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";

export default function ContactPage() {
  return (
    <div>
      <section className="bg-secondary/40 py-14">
        <div className="container-edge text-center">
          <h1 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Have questions about our courses or admissions? Send us a message or give us a call.
          </p>
        </div>
      </section>

      <section className="container-edge grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-navy-700">Send an enquiry</h2>
          <EnquiryForm />
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-sm text-muted-foreground">Bright Future Academy, Sri Vijaya Puram, Andaman &amp; Nicobar Islands</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">info@brightfutureacademy.com</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-600">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Office hours</p>
                <p className="text-sm text-muted-foreground">Mon – Sat: 9:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
