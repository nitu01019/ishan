import dynamic from "next/dynamic";
import { getVideos, getTestimonials, getServices, getPricing, getFAQs, getSiteConfig } from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/sections/Hero";
import Footer from "@/components/public/Footer";
import {
  RecentEditsSkeleton,
  ShortVideosSkeleton,
  LongVideosSkeleton,
  ServicesSkeleton,
  TestimonialsSkeleton,
  WorkflowSkeleton,
  PricingSkeleton,
  FAQSkeleton,
  ContactSkeleton,
} from "@/components/ui/SectionSkeletons";

// ISR: revalidate every 60 seconds, on-demand revalidation triggers instantly from admin
export const revalidate = 60;

// Lazy load all content sections with skeleton fallbacks
const RecentEdits = dynamic(() => import("@/components/public/sections/RecentEdits"), {
  ssr: true,
  loading: () => <RecentEditsSkeleton />,
});
const ShortVideos = dynamic(() => import("@/components/public/sections/ShortVideos"), {
  ssr: true,
  loading: () => <ShortVideosSkeleton />,
});
const LongVideos = dynamic(() => import("@/components/public/sections/LongVideos"), {
  ssr: true,
  loading: () => <LongVideosSkeleton />,
});
const Services = dynamic(() => import("@/components/public/sections/Services"), {
  ssr: true,
  loading: () => <ServicesSkeleton />,
});
const Skills = dynamic(() => import("@/components/public/sections/Skills"), { ssr: true });
const Testimonials = dynamic(() => import("@/components/public/sections/Testimonials"), {
  ssr: true,
  loading: () => <TestimonialsSkeleton />,
});
const Workflow = dynamic(() => import("@/components/public/sections/Workflow"), {
  ssr: true,
  loading: () => <WorkflowSkeleton />,
});
const Pricing = dynamic(() => import("@/components/public/sections/Pricing"), {
  ssr: true,
  loading: () => <PricingSkeleton />,
});
const FAQSection = dynamic(() => import("@/components/public/sections/FAQ"), {
  ssr: true,
  loading: () => <FAQSkeleton />,
});
const Contact = dynamic(() => import("@/components/public/sections/Contact"), {
  ssr: true,
  loading: () => <ContactSkeleton />,
});
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedMeshBg } from "@/components/ui/animated-mesh-bg";

export default async function Home() {
  const [videos, testimonials, services, pricing, faqs, siteConfig] = await Promise.all([
    getVideos(),
    getTestimonials(),
    getServices(),
    getPricing(),
    getFAQs(),
    getSiteConfig(),
  ]);

  const recentVideos = videos.filter((v) => v.category === "recent");
  const shortVideos = videos.filter((v) => v.category === "short");
  const longVideos = videos.filter((v) => v.category === "long");
  const skills = [...siteConfig.skills];

  return (
    <ShineBorder
      borderRadius={0}
      borderWidth={2}
      duration={10}
      color={["#00E676", "#00BFA5", "#26C6DA"]}
      className="min-w-full !p-0"
    >
      <main id="main-content" className="w-full" role="main">
        <Navbar />
        <Hero
          headline={siteConfig.hero?.headline}
          subtitle={siteConfig.hero?.subtitle}
          ctaText={siteConfig.hero?.ctaText}
          socialProofText={siteConfig.hero?.socialProofText}
        />
        <AnimatedMeshBg>
          <RecentEdits videos={recentVideos} />
          <ShortVideos videos={shortVideos} />
          <LongVideos videos={longVideos} />
          <Services services={services} />
          <Skills skills={skills} />
          <Testimonials testimonials={testimonials} />
          <Workflow />
          <Pricing plans={pricing} />
          <FAQSection faqs={faqs} />
          <Contact />
        </AnimatedMeshBg>
        <Footer
          name={siteConfig.footer?.name}
          tagline={siteConfig.footer?.tagline}
          socials={siteConfig.footer?.socials}
        />
      </main>
    </ShineBorder>
  );
}
