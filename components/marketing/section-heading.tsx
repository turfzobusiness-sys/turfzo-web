interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, lede, align = "left" }: SectionHeadingProps) {
  const alignCls = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col max-w-2xl mb-10 sm:mb-12 ${alignCls}`}>
      <span className="text-xs font-semibold tracking-wider uppercase text-brand-lime">{eyebrow}</span>
      <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-text-main mt-2">{title}</h2>
      {lede && <p className="mt-3 text-sm sm:text-base text-text-muted font-sans leading-relaxed">{lede}</p>}
    </div>
  );
}
