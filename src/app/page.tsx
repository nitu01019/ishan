import nextDynamic from "next/dynamic";
import { getVideos, getTestimonials, getServices, getPricing, getFAQs, getSiteConfig } from "@/lib/db";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/sections/Hero";
import Footer from "@/components/public/Footer";
import ThemeProvider from "@/components/public/ThemeProvider";
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

// Force dynamic rendering so the public page always shows the latest data.
// Portfolio sites have low traffic, so the cost of skipping the cache is negligible.
export const dynamic = "force-dynamic";

// Lazy load all content sections with skeleton fallbacks
const RecentEdits = nextDynamic(() => import("@/components/public/sections/RecentEdits"), {
  ssr: false,
  loading: () => <RecentEditsSkeleton />,
});
const ShortVideos = nextDynamic(() => import("@/components/public/sections/ShortVideos"), {
  ssr: false,
  loading: () => <ShortVideosSkeleton />,
});
const LongVideos = nextDynamic(() => import("@/components/public/sections/LongVideos"), {
  ssr: false,
  loading: () => <LongVideosSkeleton />,
});
const Services = nextDynamic(() => import("@/components/public/sections/Services"), {
  ssr: true,
  loading: () => <ServicesSkeleton />,
});
const Skills = nextDynamic(() => import("@/components/public/sections/Skills"), { ssr: true });
const Testimonials = nextDynamic(() => import("@/components/public/sections/Testimonials"), {
  ssr: true,
  loading: () => <TestimonialsSkeleton />,
});
const Workflow = nextDynamic(() => import("@/components/public/sections/Workflow"), {
  ssr: true,
  loading: () => <WorkflowSkeleton />,
});
const Pricing = nextDynamic(() => import("@/components/public/sections/Pricing"), {
  ssr: true,
  loading: () => <PricingSkeleton />,
});
const FAQSection = nextDynamic(() => import("@/components/public/sections/FAQ"), {
  ssr: true,
  loading: () => <FAQSkeleton />,
});
const Contact = nextDynamic(() => import("@/components/public/sections/Contact"), {
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
  const skills = [...(siteConfig.skills ?? [])];

  const sectionBgs = siteConfig.sectionBackgrounds;
  const sectionLayouts = siteConfig.layouts;
  const sectionAnimations = siteConfig.animations;

  return (
    <ThemeProvider
      initialTheme={siteConfig.theme}
      typography={siteConfig.typography}
      navConfig={siteConfig.navbar}
    >
      <ShineBorder
        borderRadius={0}
        borderWidth={2}
        duration={10}
        color={["#00E676", "#00BFA5", "#26C6DA"]}
        className="min-w-full !p-0"
      >
        <main id="main-content" className="w-full" role="main">
          <Navbar
            logoText={siteConfig.navbar?.logoText}
            ctaText={siteConfig.navbar?.ctaText}
            style={siteConfig.navbar?.style}
            sticky={siteConfig.navbar?.sticky}
            opacity={siteConfig.navbar?.opacity}
            bgColor={siteConfig.navbar?.bgColor}
          />
          <Hero
            headline={siteConfig.hero?.headline}
            subtitle={siteConfig.hero?.subtitle}
            ctaText={siteConfig.hero?.ctaText}
            socialProofText={siteConfig.hero?.socialProofText}
            robotPosition={siteConfig.hero?.robotPosition}
            rotatingWords={siteConfig.hero?.rotatingWords}
            secondaryCtaText={siteConfig.hero?.secondaryCtaText}
            showSpline={siteConfig.hero?.showSpline}
            background={sectionBgs?.hero}
          />
          <AnimatedMeshBg>
            <RecentEdits videos={recentVideos} background={sectionBgs?.videos} layout={sectionLayouts?.videos} animations={sectionAnimations} />
            <ShortVideos videos={shortVideos} background={sectionBgs?.videos} layout={sectionLayouts?.videos} animations={sectionAnimations} />
            <LongVideos videos={longVideos} background={sectionBgs?.videos} layout={sectionLayouts?.videos} animations={sectionAnimations} />
            <Services services={services} background={sectionBgs?.services} layout={sectionLayouts?.services} animations={sectionAnimations} />
            <Skills skills={skills} background={sectionBgs?.skills} animations={sectionAnimations} />
            <Testimonials testimonials={testimonials} background={sectionBgs?.testimonials} layout={sectionLayouts?.testimonials} animations={sectionAnimations} />
            <Workflow background={sectionBgs?.workflow} animations={sectionAnimations} />
            <Pricing plans={pricing} background={sectionBgs?.pricing} layout={sectionLayouts?.pricing} animations={sectionAnimations} />
            <FAQSection faqs={faqs} background={sectionBgs?.faq} animations={sectionAnimations} />
            <Contact background={sectionBgs?.contact} animations={sectionAnimations} />
          </AnimatedMeshBg>
          <Footer
            name={siteConfig.footer?.name}
            tagline={siteConfig.footer?.tagline}
            socials={siteConfig.footer?.socials}
          />
        </main>
      </ShineBorder>
    </ThemeProvider>
  );
}
