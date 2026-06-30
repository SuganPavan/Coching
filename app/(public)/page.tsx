import Hero from "@/components/public/Hero";
import StatsBar from "@/components/public/StatsBar";
import CoursesSection from "@/components/public/CoursesSection";
import FacultySection from "@/components/public/FacultySection";
import FeeEnquirySection from "@/components/public/FeeEnquirySection";
import GallerySection from "@/components/public/GallerySection";
import ScrollReveal from "@/components/public/ScrollReveal";

// Cache the homepage for 5 minutes — the three DB-backed sections
// (courses, faculty, gallery) are served from cache instead of
// hitting Mongo on every request.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ScrollReveal>
        <CoursesSection />
      </ScrollReveal>
      <ScrollReveal>
        <FacultySection />
      </ScrollReveal>
      <ScrollReveal>
        <FeeEnquirySection />
      </ScrollReveal>
      <ScrollReveal>
        <GallerySection />
      </ScrollReveal>
    </>
  );
}
