interface SectionTitleProps {
  readonly text: string;
  readonly highlight: string;
  readonly className?: string;
}

export default function SectionTitle({ text, highlight, className = "" }: SectionTitleProps) {
  const parts = text.split(highlight);
  return (
    <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-center ${className}`}>
      {parts[0]}
      <span className="text-accent-green">{highlight}</span>
      {parts[1] || ""}
    </h2>
  );
}
