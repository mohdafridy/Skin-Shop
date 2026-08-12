export default function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:px-8">
      <h1 className="text-balance font-display text-4xl leading-tight text-ink">{title}</h1>
      <p className="mt-5 text-balance leading-relaxed text-walnut/80">{intro}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-display text-xl text-ink">{section.heading}</h2>
            <p className="mt-2 text-balance leading-relaxed text-walnut/75">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
