import clsx from "clsx";

type SectionWrapperProps = {
  id?: string;
  alt?: boolean;
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function SectionWrapper({
  id,
  alt,
  dark,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={clsx(
        "py-24 lg:py-32",
        dark && "bg-espresso text-cream",
        !dark && alt && "bg-cream-dark",
        !dark && !alt && "bg-cream",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">{children}</div>
    </section>
  );
}
