type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-stone-400">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl text-stone-900 md:text-5xl">{title}</h2>
      {description ? <p className="mt-3 text-stone-600">{description}</p> : null}
    </div>
  );
}
