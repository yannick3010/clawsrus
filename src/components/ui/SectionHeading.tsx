import clsx from "clsx";

type SectionHeadingProps = {
  children: React.ReactNode;
  sub?: string;
  centered?: boolean;
  className?: string;
};

export default function SectionHeading({
  children,
  sub,
  centered = true,
  className,
}: SectionHeadingProps) {
  return (
    <div className={clsx(centered && "text-center", "mb-16", className)}>
      <h2 className="font-serif text-4xl font-semibold text-espresso md:text-5xl">
        {children}
      </h2>
      {sub && (
        <p className="mt-4 text-lg text-earth">{sub}</p>
      )}
    </div>
  );
}
