import { Skeleton } from "@/components/ui/skeleton";

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 animate-in fade-in duration-500">
      {children}
    </section>
  );
}

function SectionHeading({ widthClass = "w-64" }: { widthClass?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <Skeleton className={`${widthClass} h-8`} />
      <Skeleton className="w-96 max-w-full h-4" />
    </div>
  );
}

export function RecentEditsSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ShortVideosSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="flex justify-center gap-4 flex-wrap max-w-5xl mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 max-w-[200px] w-full">
            <Skeleton className="aspect-[9/16] w-full rounded-2xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function LongVideosSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ServicesSkeleton() {
  return (
    <SectionWrapper>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
        <div className="space-y-6 lg:w-1/2">
          <Skeleton className="w-72 h-12" />
          <Skeleton className="w-64 h-20" />
          <Skeleton className="w-40 h-12 rounded-xl" />
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <Skeleton className="w-full max-w-[500px] h-[350px] rounded-2xl" />
        </div>
      </div>
    </SectionWrapper>
  );
}

export function TestimonialsSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="flex justify-center">
        <div className="w-full max-w-[350px] rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded-sm" />
            ))}
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-3 pt-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

export function PricingSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-full max-w-xs rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-4 h-[500px] mx-auto"
          >
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-24" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <div className="pt-6">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export function WorkflowSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="flex justify-center">
        <Skeleton className="w-full max-w-[500px] aspect-square rounded-full" />
      </div>
    </SectionWrapper>
  );
}

export function FAQSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="max-w-2xl mx-auto space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </SectionWrapper>
  );
}

export function ContactSkeleton() {
  return (
    <SectionWrapper>
      <SectionHeading />
      <div className="max-w-2xl mx-auto rounded-2xl bg-white/[0.02] border border-white/5 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
    </SectionWrapper>
  );
}
