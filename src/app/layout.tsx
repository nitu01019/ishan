import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Playfair_Display, Inter } from "next/font/google";
import ThemeProvider from "@/components/public/ThemeProvider";
import StuckDetector from "@/components/ui/StuckDetector";
import { getSiteConfig } from "@/lib/db";
import "./globals.css";

const Preloader = dynamic(() => import("@/components/public/Preloader"), {
  ssr: false,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim() || "https://ishan.video";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ishan | Pro Video Editing Portfolio",
  description:
    "Professional video editor specializing in YouTube content, short-form videos, thumbnails, and brand storytelling. Transform your raw footage into viral content with Ishan's expert editing.",
  keywords: [
    "video editor",
    "video editing portfolio",
    "YouTube editor",
    "short form video",
    "content creator",
    "video production",
    "Ishan",
    "professional video editor",
    "video editing services",
    "YouTube video editing",
    "TikTok video editor",
    "Instagram Reels editor",
    "motion graphics",
    "color grading",
    "brand video",
    "corporate video editing",
    "freelance video editor",
  ],
  authors: [{ name: "Ishan" }],
  openGraph: {
    title: "Ishan | Pro Video Editing Portfolio",
    description:
      "Transform your raw footage into captivating content that gets seen, shared, and loved.",
    type: "website",
    locale: "en_US",
    siteName: "Ishan - Video Editor",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishan | Pro Video Editing Portfolio",
    description:
      "Transform your raw footage into captivating content that gets seen, shared, and loved.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();
  const preloaderPortfolioName =
    siteConfig.preloader?.portfolioName ||
    siteConfig.navbar?.logoText ||
    "Neal's Portfolio";
  const preloaderLoadingMessage =
    siteConfig.preloader?.loadingMessage || "Loading...";

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
        <link
          rel="preconnect"
          href="https://kzvlzgbgmetulhrlsqoq.supabase.co"
        />
        <link
          rel="dns-prefetch"
          href="https://kzvlzgbgmetulhrlsqoq.supabase.co"
        />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <meta name="theme-color" content="#0B1120" />
        <meta name="color-scheme" content="dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-body antialiased">
        {/* Mobile desktop recommendation banner — auto-fades after ~8s, once per session */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes desktopBannerFade {
            0%, 80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(100%); pointer-events: none; }
          }
          #desktop-banner.dismissed { display: none; }
        `}} />
        <div
          className="lg:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none"
          id="desktop-banner"
          style={{ animation: 'desktopBannerFade 10s ease-in-out forwards' }}
        >
          <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between pointer-events-auto">
            <p className="text-white/70 text-xs">
              <span className="text-white font-medium">Best viewed on desktop</span>
              {" "}&middot; For the full experience, open on a PC
            </p>
            <button
              id="desktop-banner-dismiss"
              className="text-white/40 hover:text-white text-lg ml-3 leading-none flex-shrink-0"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var b=document.getElementById('desktop-banner');
            if(!b)return;
            try{if(sessionStorage.getItem('desktop-banner-dismissed')){b.classList.add('dismissed');return;}}catch(e){}
            var btn=document.getElementById('desktop-banner-dismiss');
            if(btn)btn.addEventListener('click',function(){
              b.classList.add('dismissed');
              try{sessionStorage.setItem('desktop-banner-dismissed','1');}catch(e){}
            });
            b.addEventListener('animationend',function(){
              b.classList.add('dismissed');
              try{sessionStorage.setItem('desktop-banner-dismissed','1');}catch(e){}
            });
          })();
        `}} />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-[#00E676] focus:text-black focus:rounded-lg focus:font-semibold focus:outline-none"
        >
          Skip to main content
        </a>
        {/* Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ishan",
              jobTitle: "Professional Video Editor",
              description:
                "Professional video editor specializing in YouTube content, short-form videos, thumbnails, and brand storytelling.",
              url:
                siteUrl,
              knowsAbout: [
                "Video Editing",
                "YouTube",
                "Content Creation",
                "Motion Graphics",
                "Color Grading",
                "Short Form Video",
                "Brand Storytelling",
                "Thumbnail Design",
                "SEO Optimization",
              ],
              makesOffer: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Short Form Video Editing",
                    description:
                      "High-impact edits for Instagram Reels, YouTube Shorts, and TikTok",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Thumbnail Design",
                    description:
                      "Eye-catching, platform-specific thumbnails that drive clicks",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "SEO Optimization",
                    description:
                      "Video titles, descriptions, and tags optimized for search",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Video Consulting",
                    description:
                      "Personalized consultations for content strategy and optimization",
                  },
                },
              ],
            }),
          }}
        />

        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ishan - Professional Video Editor",
              url:
                siteUrl,
              description:
                "Professional video editing portfolio showcasing YouTube content, short-form videos, and brand storytelling.",
            }),
          }}
        />

        {/* ProfessionalService Schema with AggregateRating */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Ishan Video Editing",
              description:
                "Professional video editing services for creators and brands",
              url:
                siteUrl,
              priceRange: "$999 - $2999",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                reviewCount: "4",
                bestRating: "5",
                worstRating: "1",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Video Editing Plans",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Personal Plan",
                    price: "999",
                    priceCurrency: "USD",
                    description:
                      "20 Short videos, personalized branding, unlimited revisions",
                  },
                  {
                    "@type": "Offer",
                    name: "Professional Plan",
                    price: "1999",
                    priceCurrency: "USD",
                    description:
                      "15 Short videos + 10 animation edits, unlimited revisions",
                  },
                  {
                    "@type": "Offer",
                    name: "Business Plan",
                    price: "2999",
                    priceCurrency: "USD",
                    description:
                      "Complete organic growth package, unlimited revisions",
                  },
                ],
              },
            }),
          }}
        />

        {/* FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "I have a great video idea, but I'm not sure how to get started. Can you help?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely! We offer consultations to help you refine your ideas and create a content plan that aligns with your goals.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How can editing make my video more engaging?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Professional editing enhances pacing, adds dynamic transitions, improves color grading, and creates a polished look that keeps viewers watching.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do you offer any special effects or motion graphics?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! We offer a range of motion graphics, visual effects, and animated elements to make your content stand out.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What if I need edits for different platforms?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We create platform-specific edits optimized for each platform's requirements including aspect ratio, pacing, and format-specific optimizations.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How can I make my video rank higher in search results?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We optimize your video titles, descriptions, tags, and thumbnails for SEO to improve visibility on YouTube and other platforms.",
                  },
                },
              ],
            }),
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Portfolio",
                  item: `${siteUrl}/#work`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Services",
                  item: `${siteUrl}/#services`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Pricing",
                  item: `${siteUrl}/#pricing`,
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Contact",
                  item: `${siteUrl}/#contact`,
                },
              ],
            }),
          }}
        />

        <ThemeProvider>
          {/* SSR preloader — stays fully opaque for 2s, then fades as CSS fallback if JS never loads.
               When JS hydrates, the client Preloader takes over and fades this out via transition. */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes ssrFadeOut { 0%,90% { opacity:1; } 100% { opacity:0; pointer-events:none; } }
            #ssr-preloader { animation: ssrFadeOut 6s ease-in 2s forwards; }
          `}} />
          <div
            id="ssr-preloader"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000000",
            }}
          >
            <p
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 700,
                color: "#ffffff",
                textAlign: "center",
                padding: "0 1rem",
                letterSpacing: "-0.025em",
              }}
            >
              {preloaderPortfolioName}
            </p>
            <div
              style={{
                marginTop: "1.5rem",
                width: "12rem",
                height: "2px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "9999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "30%",
                  backgroundColor: "#ffffff",
                  borderRadius: "9999px",
                }}
              />
            </div>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {preloaderLoadingMessage}
            </p>
          </div>
          <Preloader
            portfolioName={preloaderPortfolioName}
            loadingMessage={preloaderLoadingMessage}
          />
          {children}
          <StuckDetector />
        </ThemeProvider>
      </body>
    </html>
  );
}
